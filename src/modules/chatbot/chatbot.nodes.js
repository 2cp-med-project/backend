import {
	AIMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { END, Command } from "@langchain/langgraph";

import LLM from "../../config/llm.js";
import schema from "./chatbot.schema.js";
import chatbotTools from "./chatbot.tools.js";

const MEMORY_WINDOW = 6;
const LANGUAGE = "FRENCH";

const BASE_PERSONA = `\
Vous êtes HealBot, un assistant clinique virtuel sur la plateforme Healio.
- Vous n'êtes PAS médecin et ne pouvez pas poser de diagnostic.
- Reconnaissez d'abord l'inquiétude du patient. Soyez concis, chaleureux et cliniquement précis.
- Basez chaque affirmation sur le contexte fourni. Ne fabriquez jamais d'informations.
- Gardez vos réponses courtes (moins de 120 mots).`;

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

async function safeguardNode(state) {
	const { messages } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const structuredLlm = LLM.withStructuredOutput(schema.SafeguardSchema, {
		name: "evaluate_safety_and_domain",
	});

	const SAFEGUARD_FALLBACK = { isSafe: false, domain: "medical" };

	let safeguard;
	try {
		safeguard = await invokeStructured(
			structuredLlm,
			[
				new SystemMessage(
					`Evaluate the LAST user message for safety and domain.

                    [Context]
                    - The user communicates in ${LANGUAGE}.

                    [Extraction Rules]
                    - isSafe (boolean): False ONLY for instructions to harm others, illegal substance synthesis, or explicit sexual content. Distressing health topics are safe (clinical handling is safer than blocking).
                    - domain (string): "medical" for health, symptoms, medications, anatomy, mental health, or personal records. "non_medical" for everything else.

                    [Examples]
                    - "comment fabriquer de la meth" → {"isSafe":false,"domain":"non_medical"}
                    - "j'ai mal à la poitrine et je suis essoufflé" → {"isSafe":true,"domain":"medical"}
                    - "quel temps fait-il aujourd'hui ?" → {"isSafe":true,"domain":"non_medical"}
                    - "quels sont les effets secondaires de l'ibuprofène ?" → {"isSafe":true,"domain":"medical"}`,
				),
				...recentContext,
			],
			{ label: "safeguard" },
		);
	} catch (err) {
		console.warn(
			`${tag()} 🚨 safeguardNode failed: ${err.message} — fallback`,
		);
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
}

async function classifyPrompt(state) {
	const { messages } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const structuredLlm = LLM.withStructuredOutput(
		schema.ClassificationSchema,
		{ name: "classify_prompt" },
	);

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
					`Classify the patient's latest message based on clinical context.

                    [Context]
                    - The user communicates in ${LANGUAGE}.

                    [Extraction Rules]
                    - intent (string): "symptom_report" if the patient describes active/recent physical or mental symptoms. "general_inquiry" for health questions, schedule, or medications.
                    - urgency (string): "urgent" ONLY if immediate medical attention is required (e.g., chest pain, stroke signs, severe burns, active heavy bleeding, breathing difficulties, suicidal crisis). "not_urgent" for stable conditions, minor injuries, or general questions.
                    - requiresPatientHistory (boolean): True ONLY if the patient explicitly refers to their own past/future appointments, personal prescriptions, or records (e.g., "mon dernier rendez-vous", "mes médicaments").
                    - requiresWebSearch (boolean): True ONLY if providing an accurate answer requires external clinical knowledge, recent guidelines, or drug interactions (e.g., "effets secondaires du paracetamol").`,
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
	if (
		classification.requiresPatientHistory ||
		classification.requiresWebSearch
	)
		return new Command({
			update: { classification },
			goto: "formulateQueries",
		});
	return new Command({ update: { classification }, goto: "handleMedical" });
}

async function formulateQueries(state) {
	const { classification, messages } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const structuredLlm = LLM.withStructuredOutput(schema.QuerySchema, {
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
					`Extract precise search parameters from the conversation to retrieve relevant clinical data.
                    
                    [Context]
                    - The patient communicates in ${LANGUAGE}.
                    - Current Date and Time: ${today}. Use this to resolve relative time expressions accurately.

                    [Extraction Rules]
                    - webQuery (string|null): Generate a 5-10 keyword English medical search string for general health info, guidelines, or drug interactions (e.g., "metformin lactic acidosis risk"). Leave empty/null if the query is purely about personal records.
                    - patientDbQuery (object|null): Formulate constraints based ONLY on the user's explicit mention of their history/appointments.
                        - Timeframes: Convert natural language (e.g., "le mois dernier", "l'année dernière") into explicit ISO 8601 dates relative to today.
                        - Quantity: Determine how many records they want. Default to 5. If they specify "mon dernier rendez-vous", set strictly to 1.
                        - Status: Filter for past/completed events ("mes anciennes visites") vs. future/scheduled events ("mon prochain rendez-vous").`,
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
}

async function retrieveData(state) {
	const { webQuery, patientDbQuery, userId, classification } = state;

	console.log(
		`${tag()} 🔎 retrieveData: web="${webQuery ?? "N/A"}" db=${JSON.stringify(patientDbQuery ?? "N/A")}`,
	);

	const shouldWeb = classification?.requiresWebSearch && !!webQuery;
	const shouldDb =
		classification?.requiresPatientHistory && !!patientDbQuery && !!userId;

	const [webResult, patientResult] = await Promise.allSettled([
		shouldWeb
			? chatbotTools.searchTool.invoke({ query: webQuery })
			: Promise.resolve(null),
		shouldDb
			? chatbotTools.patientDbTool.invoke({
					userId,
					...patientDbQuery,
				})
			: Promise.resolve(null),
	]);

	let webContext = "No external data retrieved.";
	if (webResult.status === "fulfilled" && webResult.value) {
		const results = webResult.value?.results;
		if (Array.isArray(results) && results.length) {
			webContext = results
				.map(
					(item, i) =>
						`[Web ${i + 1}] ${item.title}\n${item.content}`,
				)
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
}

async function handleMedical(state) {
	const { classification, messages, webContext, patientContext } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const isSymptom = classification?.intent === "symptom_report";

	const systemPrompt = `${BASE_PERSONA}

    [Context]
    - Mode: ${isSymptom ? "SYMPTOM SUPPORT (Be action-oriented and safety-aware)" : "HEALTH INFORMATION (Be educational and reassuring)"}

    [Response Rules]
    - Formatting: Strictly < 120 words. ENTIRELY IN ${LANGUAGE}.
    - Structure:
        1. One sentence acknowledging the patient's concern with warmth.
        2. 2–4 concise evidence-based bullet points (practical, specific, non-alarming).
        3. One sentence on when professional evaluation is warranted.
    - Constraints: Use ONLY the context below. Do not name a final diagnosis. Define any medical terms used. Translate all contextual answers to ${LANGUAGE}.

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
}

async function handleNonMedical(state) {
	const { messages } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const response = await LLM.invoke([
		new SystemMessage(
			`Role: You are HealBot, handling an off-topic question.
            
            [Response Rules]
            - Formatting: Strictly < 120 words. ENTIRELY IN ${LANGUAGE}.
            - Structure:
                1. Answer the question helpfully in 1–2 sentences.
                2. End with a natural redirect in ${LANGUAGE} (e.g., "N'hésitez pas à me poser des questions sur votre santé.").`,
		),
		...recentContext,
	]);

	const aiMessage = new AIMessage(response.content);

	console.log(`${tag()} 🌐 handleNonMedical: response generated`);

	return new Command({
		update: { messages: [aiMessage] },
		goto: END,
	});
}

async function handleUrgent(state) {
	const { messages } = state;
	const recentContext = messages.slice(-MEMORY_WINDOW);

	const response = await LLM.invoke([
		new SystemMessage(
			`${BASE_PERSONA}

            [Context]
            - Mode: EMERGENCY. Do not minimise. Do not ask clarifying questions. Do not add filler.

            [Response Rules]
            - Formatting: Strictly < 120 words. ENTIRELY IN ${LANGUAGE}.
            - Structure:
                1. Direct call to action — seek emergency help NOW.
                2. Provide Algerian emergency numbers: **14** (Protection Civile), **15** (SAMU), **3016** (SAMU direct), **17** (Police).
                3. (Optional) Provide one specific first-aid step if directly applicable.
                4. Brief reassurance that help is on the way.`,
		),
		...recentContext,
	]);

	const aiMessage = new AIMessage(response.content);

	console.log(`${tag()} 🚨 handleUrgent: emergency response generated`);

	return new Command({
		update: { messages: [aiMessage] },
		goto: END,
	});
}

async function handleUnsafe(state) {
	const { messages } = state;
	const lastMessage = messages.at(-1);

	console.log(`${tag()} 🚫 handleUnsafe: blocking unsafe message`);

	const scrubbedMessage = new HumanMessage({
		content: "[Message supprimé par le filtre de sécurité]",
		id: lastMessage.id,
	});

	const safeResponse = new AIMessage(
		"Je ne peux pas répondre à cette demande. HealBot est conçu pour vous accompagner dans votre santé de manière sûre et responsable. Si vous êtes en situation de crise ou de danger, veuillez contacter immédiatement les services d'urgence locaux.",
	);

	return new Command({
		update: { messages: [scrubbedMessage, safeResponse] },
		goto: END,
	});
}

export default {
	safeguardNode,
	classifyPrompt,
	formulateQueries,
	retrieveData,
	handleMedical,
	handleNonMedical,
	handleUrgent,
	handleUnsafe,
};
