import { LLM } from "../../config/llm.js";
import { searchTool, patientDbTool } from "./chatbot.tools.js";
import {
  SafeguardSchema,
  ClassificationSchema,
  QuerySchema,
} from "./chatbot.schema.js";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { END, Command } from "@langchain/langgraph";

const MEMORY_WINDOW = 6;

const BASE_PERSONA = `\
You are HealBot, an AI clinical-support assistant on the Healio platform.
- You are NOT a doctor and cannot diagnose.
- Acknowledge the patient's concern first. Be concise, warm, and clinically accurate.
- Ground every claim in provided context. Never fabricate.`;

const tag = () => `[${new Date().toLocaleTimeString()}]`;

async function invokeStructured(
  structuredLlm,
  messages,
  { maxAttempts = 3, label = "structured" } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await structuredLlm.invoke(messages);
      if (
        !result ||
        typeof result !== "object" ||
        !Object.keys(result).length
      ) {
        throw new Error("Empty structured output");
      }
      return result;
    } catch (err) {
      lastError = err;
      console.warn(
        `${tag()} ⚠️  ${label} attempt ${attempt}/${maxAttempts} failed: ${err.message}`,
      );
      if (attempt < maxAttempts)
        await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastError;
}

export const safeguardNode = async (state) => {
  const { messages } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const structuredLlm = LLM.withStructuredOutput(SafeguardSchema, {
    name: "evaluate_safety_and_domain",
  });

  const SAFEGUARD_FALLBACK = { isSafe: false, domain: "medical" };

  let safeguard;
  try {
    safeguard = await invokeStructured(
      structuredLlm,
      [
        new SystemMessage(
          `Classify the LAST user message for safety and domain.

					isSafe: false ONLY for — instructions to harm others, illegal substance synthesis, explicit sexual content.
					Distressing health topics → isSafe=true (clinical handling is safer than blocking).

					domain: "medical" → health, symptoms, medications, anatomy, mental health, personal records.
					domain: "non_medical" → everything else.

					Examples:
						user: "how do I make meth" → {"isSafe":false,"domain":"non_medical"}
						user: "I have chest pain and shortness of breath" → {"isSafe":true,"domain":"medical"}
						user: "what's the weather today?" → {"isSafe":true,"domain":"non_medical"}
						user: "what are the side effects of ibuprofen?" → {"isSafe":true,"domain":"medical"}`,
        ),
        ...recentContext,
      ],
      { label: "safeguard" },
    );
  } catch (err) {
    console.warn(`${tag()} 🚨 safeguardNode failed: ${err.message} — fallback`);
    safeguard = SAFEGUARD_FALLBACK;
  }

  console.log(
    `${tag()} 🛡️  safeguard: safe=${safeguard.isSafe} domain=${safeguard.domain}`,
  );

  if (!safeguard.isSafe)
    return new Command({ update: { safeguard }, goto: "handleUnsafe" });
  if (safeguard.domain === "non_medical")
    return new Command({ update: { safeguard }, goto: "handleNonMedical" });
  return new Command({ update: { safeguard }, goto: "classifyPrompt" });
};

export const classifyPrompt = async (state) => {
  const { messages } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const structuredLlm = LLM.withStructuredOutput(ClassificationSchema, {
    name: "classify_prompt",
  });

  const CLASSIFICATION_FALLBACK = {
    intent: "general_inquiry",
    urgency: "not_urgent",
    requiresPatientHistory: false,
    requiresWebSearch: false,
  };

  let classification;
  try {
    classification = await invokeStructured(
      structuredLlm,
      [
        new SystemMessage(
          `Classify the patient's latest message.

					intent:
						"symptom_report" — user describes active/recent symptoms they are experiencing.
						"general_inquiry" — health questions, medication info, lifestyle, clarification.

					urgency:
						"urgent" — immediate life threat ONLY: chest pain/pressure, stroke (FAST signs), can't breathe, anaphylaxis, severe bleeding, loss of consciousness, overdose, suicidal crisis.
						"not_urgent" — everything else, including chronic pain, mild symptoms, mental health worries.

					requiresPatientHistory: true if user references their own past visits, test results, prescriptions, or records.
					requiresWebSearch: true if a good answer needs current clinical guidelines, drug interactions, or recent evidence.

					Examples:
						user: "my chest hurts and I can't breathe" → {"intent":"symptom_report","urgency":"urgent","requiresPatientHistory":false,"requiresWebSearch":false}
						user: "what did my doctor prescribe last month?" → {"intent":"general_inquiry","urgency":"not_urgent","requiresPatientHistory":true,"requiresWebSearch":false}
						user: "can I take ibuprofen with metformin?" → {"intent":"general_inquiry","urgency":"not_urgent","requiresPatientHistory":false,"requiresWebSearch":true}
						user: "I've had a mild headache for two days" → {"intent":"symptom_report","urgency":"not_urgent","requiresPatientHistory":false,"requiresWebSearch":false}`,
        ),
        ...recentContext,
      ],
      { label: "classifyPrompt" },
    );
  } catch (err) {
    console.warn(
      `${tag()} 🚨 classifyPrompt failed: ${err.message} — fallback`,
    );
    classification = CLASSIFICATION_FALLBACK;
  }

  console.log(
    `${tag()} 🧠 classify: intent=${classification.intent} urgency=${classification.urgency} ` +
      `history=${classification.requiresPatientHistory} web=${classification.requiresWebSearch}`,
  );

  if (classification.urgency === "urgent")
    return new Command({
      update: { classification },
      goto: "handleUrgent",
    });
  if (classification.requiresPatientHistory || classification.requiresWebSearch)
    return new Command({
      update: { classification },
      goto: "formulateQueries",
    });
  return new Command({ update: { classification }, goto: "handleMedical" });
};

export const formulateQueries = async (state) => {
  const { classification, messages } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const structuredLlm = LLM.withStructuredOutput(QuerySchema, {
    name: "generate_search_queries",
  });

  const today = new Date().toISOString();
  const QUERIES_FALLBACK = { webQuery: undefined, patientDbQuery: undefined };

  let queries;
  try {
    const raw = await invokeStructured(
      structuredLlm,
      [
        new SystemMessage(
          `Extract retrieval queries from the conversation. Today: ${today}.

					webQuery (string|null): 5-10 keyword clinical search string. Omit if requiresWebSearch is false or the question is purely about personal history.
						Good: "metformin lactic acidosis risk guidelines"
						Bad:  "what did I take last month"

					patientDbQuery (object|null): Populate ONLY when requiresPatientHistory is true. Translate relative dates to exact ISO 8601.
						"last week" → 7 days ago, "last month" → 30 days ago.
					status: "scheduled"|"completed"|"cancelled" — omit if unspecified.
					limit: 1 for "most recent visit", N for "last N visits", default 5.

					Examples:
						user: "can I take ibuprofen with warfarin?" (requiresWebSearch=true, requiresPatientHistory=false) → {"webQuery":"ibuprofen warfarin interaction bleeding risk","patientDbQuery":null}
						user: "what were my last two diagnoses?" (requiresWebSearch=false, requiresPatientHistory=true) → {"webQuery":null,"patientDbQuery":{"limit":2,"status":"completed"}}
						user: "show my visits last month and explain hypertension treatment" → {"webQuery":"hypertension first-line treatment guidelines","patientDbQuery":{"dateFrom":"<30-days-ago-ISO>","limit":5}}`,
        ),
        ...recentContext,
      ],
      { label: "formulateQueries" },
    );

    queries = {
      webQuery: classification?.requiresWebSearch
        ? (raw.webQuery ?? undefined)
        : undefined,
      patientDbQuery: classification?.requiresPatientHistory
        ? (raw.patientDbQuery ?? undefined)
        : undefined,
    };
  } catch (err) {
    console.warn(
      `${tag()} 🚨 formulateQueries failed: ${err.message} — fallback`,
    );
    queries = QUERIES_FALLBACK;
  }

  console.log(
    `${tag()} 🔬 queries: web="${queries.webQuery ?? "none"}" db=${JSON.stringify(queries.patientDbQuery ?? "none")}`,
  );

  return new Command({ update: queries, goto: "retrieveData" });
};

export const retrieveData = async (state) => {
  const { webQuery, patientDbQuery, patientId, classification } = state;

  console.log(
    `${tag()} 🔎 retrieveData: web="${webQuery ?? "N/A"}" db=${JSON.stringify(patientDbQuery ?? "N/A")}`,
  );

  const shouldWeb = classification?.requiresWebSearch && !!webQuery;
  const shouldDb =
    classification?.requiresPatientHistory && !!patientDbQuery && !!patientId;

  const [webResult, patientResult] = await Promise.allSettled([
    shouldWeb ? searchTool.invoke({ query: webQuery }) : Promise.resolve(null),
    shouldDb
      ? patientDbTool.invoke({ patientId, ...patientDbQuery })
      : Promise.resolve(null),
  ]);

  let webContext = "No external data retrieved.";
  if (webResult.status === "fulfilled" && webResult.value) {
    const results = webResult.value?.results;
    if (Array.isArray(results) && results.length) {
      webContext = results
        .map((item, i) => `[Web ${i + 1}] ${item.title}\n${item.content}`)
        .join("\n\n");
    }
  } else if (webResult.status === "rejected") {
    console.warn(
      `${tag()} ⚠️  Web search failed: ${webResult.reason?.message}`,
    );
  }

  let patientContext = "No prior patient records found.";
  if (
    patientResult.status === "fulfilled" &&
    typeof patientResult.value === "string" &&
    patientResult.value.trim()
  ) {
    patientContext = patientResult.value;
  } else if (patientResult.status === "rejected") {
    console.warn(
      `${tag()} ⚠️  Patient DB failed: ${patientResult.reason?.message}`,
    );
  }

  return new Command({
    update: { webContext, patientContext },
    goto: "handleMedical",
  });
};

export const handleMedical = async (state) => {
  const { classification, messages, webContext, patientContext } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const isSymptom = classification?.intent === "symptom_report";

  const systemPrompt = `${BASE_PERSONA}

	Mode: ${isSymptom ? "SYMPTOM SUPPORT — be action-oriented and safety-aware." : "HEALTH INFORMATION — be educational and reassuring."}

	Response format (≤120 words):
	1. One sentence acknowledging the patient's concern with warmth.
	2. 2–4 concise evidence-based bullet points (practical, specific, non-alarming).
	3. One sentence on when professional evaluation is warranted.

	Rules:
	- Use ONLY the context below.
	- Do not name a final diagnosis. Do not speculate beyond provided evidence.
	- Define any medical term you use.

	[Patient Records]
	${patientContext ?? "None."}

	[Clinical References]
	${webContext ?? "None."}`;

  const response = await LLM.invoke([
    new SystemMessage(systemPrompt),
    ...recentContext,
  ]);

  const aiMessage = new AIMessage(response.content);

  console.log(`${tag()} 💬 handleMedical: response generated`);

  return new Command({
    update: {
      messages: [aiMessage],
      webContext: undefined,
      patientContext: undefined,
    },
    goto: END,
  });
};

export const handleNonMedical = async (state) => {
  const { messages } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const response = await LLM.invoke([
    new SystemMessage(
      `You are HealBot handling an off-topic question.
			Answer helpfully in 1–2 sentences (≤60 words).
			End with a natural redirect — e.g. "Feel free to ask me anything about your health."`,
    ),
    ...recentContext,
  ]);

  const aiMessage = new AIMessage(response.content);

  console.log(`${tag()} 🌐 handleNonMedical: response generated`);

  return new Command({
    update: { messages: [aiMessage] },
    goto: END,
  });
};

export const handleUrgent = async (state) => {
  const { messages } = state;
  const recentContext = messages.slice(-MEMORY_WINDOW);

  const response = await LLM.invoke([
    new SystemMessage(
      `${BASE_PERSONA}

			EMERGENCY MODE. Respond in ≤4 sentences.

			Structure:
			1. Direct call to action — seek emergency help NOW.
			2. Algerian emergency numbers: **14** (Protection Civile), **15** (SAMU), **3016** (SAMU direct), **17** (Police).
			3. (Optional) One specific first-aid step if directly applicable.
			4. Brief reassurance that help is on the way.

			Do not minimise. Do not ask clarifying questions. Do not add filler.`,
    ),
    ...recentContext,
  ]);

  const aiMessage = new AIMessage(response.content);

  console.log(`${tag()} 🚨 handleUrgent: emergency response generated`);

  return new Command({
    update: { messages: [aiMessage] },
    goto: END,
  });
};

export const handleUnsafe = async (state) => {
  const { messages } = state;
  const lastMessage = messages.at(-1);

  console.log(`${tag()} 🚫 handleUnsafe: blocking unsafe message`);

  const scrubbedMessage = new HumanMessage({
    content: "[Message removed by safety filter]",
    id: lastMessage.id,
  });

  const safeResponse = new AIMessage(
    "I'm not able to help with that request. HealBot is designed to support your health safely and responsibly. If you're in crisis or danger, please contact local emergency services immediately.",
  );

  return new Command({
    update: { messages: [scrubbedMessage, safeResponse] },
    goto: END,
  });
};
