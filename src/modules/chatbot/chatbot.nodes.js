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
					`Classify the LAST user message for safety and domain.

					Note: The user will be speaking in ${LANGUAGE}.

                    isSafe: false ONLY for — instructions to harm others, illegal substance synthesis, explicit sexual content.
                    Distressing health topics → isSafe=true (clinical handling is safer than blocking).

                    domain: "medical" → health, symptoms, medications, anatomy, mental health, personal records.
                    domain: "non_medical" → everything else.

                    Examples:
                        user: "comment fabriquer de la meth" → {"isSafe":false,"domain":"non_medical"}
                        user: "j'ai mal à la poitrine et je suis essoufflé" → {"isSafe":true,"domain":"medical"}
                        user: "quel temps fait-il aujourd'hui ?" → {"isSafe":true,"domain":"non_medical"}
                        user: "quels sont les effets secondaires de l'ibuprofène ?" → {"isSafe":true,"domain":"medical"}`,
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
		{
			name: "classify_prompt",
		},
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
					`Classify the patient's latest message. Use your best clinical judgment.

					Note: The user will be speaking in ${LANGUAGE}

                    intent:
                        "symptom_report" — user describes active/recent symptoms they are experiencing.
                        "general_inquiry" — health questions, medication info, lifestyle, clarification.

                    urgency:
                        "urgent" — conditions requiring prompt medical attention (e.g., severe injuries, active bleeding, severe burns, chest pain, stroke signs, breathing difficulties, anaphylaxis, overdose, suicidal crisis).
                        "not_urgent" — stable conditions, mild/chronic symptoms, general inquiries, minor cuts or bruises.

                    requiresPatientHistory: true if user references their own past visits, test results, prescriptions, or records.
                    requiresWebSearch: true if a good answer needs current clinical guidelines, drug interactions, or recent evidence.

                    Examples:
                        user: "je me suis brûlé le pied et ça saigne beaucoup" → {"intent":"symptom_report","urgency":"urgent","requiresPatientHistory":false,"requiresWebSearch":false}
                        user: "qu'est-ce que mon médecin m'a prescrit le mois dernier ?" → {"intent":"general_inquiry","urgency":"not_urgent","requiresPatientHistory":true,"requiresWebSearch":false}
                        user: "puis-je prendre de l'ibuprofène avec de la metformine ?" → {"intent":"general_inquiry","urgency":"not_urgent","requiresPatientHistory":false,"requiresWebSearch":true}
                        user: "j'ai un léger mal de tête depuis deux jours" → {"intent":"symptom_report","urgency":"not_urgent","requiresPatientHistory":false,"requiresWebSearch":false}`,
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
					`Extract retrieval queries from the conversation. The user speaks ${LANGUAGE}, but generate web queries in English for better medical search results. Today: ${today}.

                    webQuery (string|null): 5-10 keyword clinical search string. Omit if requiresWebSearch is false or the question is purely about personal history.
                        Good: "metformin lactic acidosis risk guidelines"
                        Bad:  "what did I take last month"

                    patientDbQuery (object|null): Populate ONLY when requiresPatientHistory is true. Translate relative dates to exact ISO 8601.
                        "la semaine dernière" → 7 days ago, "le mois dernier" → 30 days ago.
                    status: "scheduled"|"completed"|"cancelled" — omit if unspecified.
                    limit: 1 for "most recent visit", N for "last N visits", default 5.

                    Examples:
                        user: "puis-je prendre de l'ibuprofène avec de la warfarine ?" (requiresWebSearch=true, requiresPatientHistory=false) → {"webQuery":"ibuprofen warfarin interaction bleeding risk","patientDbQuery":null}
                        user: "quels étaient mes deux derniers diagnostics ?" (requiresWebSearch=false, requiresPatientHistory=true) → {"webQuery":null,"patientDbQuery":{"limit":2,"status":"completed"}}
                        user: "montrez-moi mes visites du mois dernier et expliquez-moi le traitement de l'hypertension" → {"webQuery":"hypertension first-line treatment guidelines","patientDbQuery":{"dateFrom":"<30-days-ago-ISO>","limit":5}}`,
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
					patientId: userId,
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

    Mode: ${isSymptom ? "SYMPTOM SUPPORT — be action-oriented and safety-aware." : "HEALTH INFORMATION — be educational and reassuring."}

    Response format (Strictly < 120 words, ENTIRELY IN ${LANGUAGE}):
    1. One sentence acknowledging the patient's concern with warmth.
    2. 2–4 concise evidence-based bullet points (practical, specific, non-alarming).
    3. One sentence on when professional evaluation is warranted.

    Rules:
    - Use ONLY the context below.
    - Do not name a final diagnosis. Do not speculate beyond provided evidence.
    - Define any medical term you use.
    - TRANSLATE ALL CONTEXTUAL ANSWERS TO ${LANGUAGE}.

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
			`You are HealBot handling an off-topic question.
            Answer helpfully in 1–2 sentences (Strictly < 120 words) ENTIRELY IN ${LANGUAGE}.
            End with a natural redirect in ${LANGUAGE} — e.g. "N'hésitez pas à me poser des questions sur votre santé."`,
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

            EMERGENCY MODE. Respond in ≤4 sentences (Strictly < 120 words) ENTIRELY IN ${LANGUAGE}.

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
