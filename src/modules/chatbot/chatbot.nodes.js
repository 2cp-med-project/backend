import { LLM, tinyLLM } from "../../config/llm.js";
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
	RemoveMessage,
} from "@langchain/core/messages";
import { END, Command } from "@langchain/langgraph";

const MEMORY_WINDOW = 6;

const BASE_PERSONA = `\
You are HealBot, a clinical AI assistant.
Rules: Never diagnose. Be concise, empathetic, professional.
Base all responses strictly on provided context — no fabrication.`.trim();

function getRecentContext(state) {
	const { summaryBlocks = [], activeMessages = [] } = state;
	const recentMessages = activeMessages.slice(-3);
	if (recentMessages.length === 3) return recentMessages;
	const lastSummary = summaryBlocks.at(-1);
	return lastSummary ? [lastSummary, ...recentMessages] : recentMessages;
}

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
				`[${new Date().toLocaleTimeString()}] ⚠️  ${label} attempt ${attempt}/${maxAttempts} failed: ${err.message}`,
			);
			if (attempt < maxAttempts)
				await new Promise((r) => setTimeout(r, 150 * attempt));
		}
	}
	throw lastError;
}

const tag = () => `[${new Date().toLocaleTimeString()}]`;

export const manageMemory = async (state) => {
	const { summaryBlocks, activeMessages } = state;

	if (activeMessages.length < MEMORY_WINDOW) {
		return new Command({ goto: "safeguardNode" });
	}

	const chunkToSummarize = activeMessages.slice(0, MEMORY_WINDOW);
	const blockNumber = (summaryBlocks?.length ?? 0) + 1;

	const summaryResponse = await tinyLLM.invoke([
		new SystemMessage(
			`Summarize this medical conversation chunk into a tight bullet list (max 40 words).
			Include ONLY: symptoms mentioned, diagnoses, medications, and key AI advice given.
			Omit greetings, pleasantries, and filler. Output bullets only.`,
		),
		...chunkToSummarize,
	]);

	const newSummaryBlock = new SystemMessage(
		`[Memory Block ${blockNumber}]\n${summaryResponse.content}`,
	);

	const deleteMessages = chunkToSummarize.map(
		(msg) => new RemoveMessage({ id: msg.id }),
	);

	console.log(
		`${tag()} 🧹 manageMemory: compacted ${MEMORY_WINDOW} messages → block ${blockNumber}`,
	);

	return new Command({
		update: {
			summaryBlocks: [newSummaryBlock],
			activeMessages: deleteMessages,
		},
		goto: "safeguardNode",
	});
};

export const safeguardNode = async (state) => {
	const recentContext = getRecentContext(state);
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
					`You are a routing classifier. Output JSON: { "isSafe": boolean, "domain": "medical" | "non_medical" }

					isSafe=false ONLY IF the message explicitly requests instructions to harm a person or synthesize illegal substances.
					domain="medical" if the message touches health, symptoms, medications, body, or personal medical records.
					domain="non_medical" ONLY if it has zero relation to health or medicine.`,
				),
				...recentContext,
			],
			{ label: "safeguard" },
		);
	} catch (err) {
		console.warn(
			`${tag()} 🚨 safeguardNode failed: ${err.message} — using fallback`,
		);
		safeguard = SAFEGUARD_FALLBACK;
	}

	console.log(
		`${tag()} 🛡️  safeguard: safe=${safeguard.isSafe} domain=${safeguard.domain}`,
	);

	if (!safeguard.isSafe) {
		return new Command({ update: { safeguard }, goto: "handleUnsafe" });
	}
	if (safeguard.domain === "non_medical") {
		return new Command({ update: { safeguard }, goto: "handleNonMedical" });
	}
	return new Command({ update: { safeguard }, goto: "classifyPrompt" });
};

export const classifyPrompt = async (state) => {
	const recentContext = getRecentContext(state);
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
					`Classify the user message. Output JSON only.
					- intent: "symptom_report" if user describes active symptoms, "general_inquiry" otherwise
					- urgency: "urgent" only for immediate threats (chest pain, can't breathe, overdose, stroke, severe bleeding)
					- requiresPatientHistory: true if user asks about their own past visits/records/results
					- requiresWebSearch: true if clinical guidelines, drug info, or condition facts are needed`,
				),
				...recentContext,
			],
			{ label: "classifyPrompt" },
		);
	} catch (err) {
		console.warn(
			`${tag()} 🚨 classifyPrompt failed: ${err.message} — using fallback`,
		);
		classification = CLASSIFICATION_FALLBACK;
	}

	console.log(
		`${tag()} 🧠 classify: intent=${classification.intent} urgency=${classification.urgency} ` +
			`history=${classification.requiresPatientHistory} web=${classification.requiresWebSearch}`,
	);

	if (classification.urgency === "urgent") {
		return new Command({
			update: { classification },
			goto: "handleUrgent",
		});
	}
	if (
		classification.requiresPatientHistory ||
		classification.requiresWebSearch
	) {
		return new Command({
			update: { classification },
			goto: "formulateQueries",
		});
	}
	return new Command({ update: { classification }, goto: "handleMedical" });
};

export const formulateQueries = async (state) => {
	const recentContext = getRecentContext(state);
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
					`Extract search parameters from the user message. Output JSON only. Today: ${today}.

					- webQuery: 5-10 keyword clinical search string. Omit for personal history questions.
					- patientDbQuery: set whenever user references their own records, visits, or results.
						- dateFrom / dateTo: ISO 8601. Translate relative dates ("last week" → 7 days ago, "last month" → 30 days ago).
						- status: "scheduled" | "completed" | "cancelled" — only if specified.
						- limit: "last/most recent visit" → 1. "last N visits" → N. Unspecified → 5.`,
				),
				...recentContext,
			],
			{ label: "formulateQueries" },
		);
		queries = {
			webQuery: raw.webQuery ?? undefined,
			patientDbQuery: raw.patientDbQuery ?? undefined,
		};
	} catch (err) {
		console.warn(
			`${tag()} 🚨 formulateQueries failed: ${err.message} — using fallback`,
		);
		queries = QUERIES_FALLBACK;
	}

	console.log(
		`${tag()} 🔬 queries: web="${queries.webQuery ?? "none"}" db=${JSON.stringify(queries.patientDbQuery ?? "none")}`,
	);

	return new Command({ update: queries, goto: "retrieveData" });
};

export const retrieveData = async (state) => {
	const { webQuery, patientDbQuery, patientId } = state;

	console.log(
		`${tag()} 🔎 retrieveData: web="${webQuery ?? "N/A"}" db=${JSON.stringify(patientDbQuery ?? "N/A")}`,
	);

	const [webResult, patientResult] = await Promise.allSettled([
		webQuery
			? searchTool.invoke({ query: webQuery })
			: Promise.resolve(null),
		patientDbQuery && patientId
			? patientDbTool.invoke({ patientId, ...patientDbQuery })
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
			`${tag()} ⚠️  Patient DB query failed: ${patientResult.reason?.message}`,
		);
	}

	return new Command({
		update: { webContext, patientContext },
		goto: "handleMedical",
	});
};

export const handleMedical = async (state) => {
	const {
		summaryBlocks,
		activeMessages,
		webContext,
		patientContext,
		classification,
	} = state;

	const systemPrompt = `\
	${BASE_PERSONA}
	Intent: ${classification?.intent ?? "general_inquiry"}

	Respond in max 120 words. Format:
	1. One empathetic opening sentence.
	2. 2-4 bullet points of practical, evidence-based advice.
	3. One sentence on when to see a doctor.

	Use ONLY the context below. If context is missing, say so honestly.

	[Patient Records]:
	${patientContext ?? "None."}

	[Clinical References]:
	${webContext ?? "None."}`.trim();

	const response = await LLM.invoke([
		new SystemMessage(systemPrompt),
		...(summaryBlocks ?? []),
		...activeMessages,
	]);

	console.log(`${tag()} 💬 handleMedical: response generated`);

	return new Command({
		update: {
			activeMessages: [new AIMessage(response.content)],
			webContext: undefined,
			patientContext: undefined,
		},
		goto: END,
	});
};

export const handleNonMedical = async (state) => {
	const { activeMessages } = state;
	const lastMsg = activeMessages.at(-1);

	const response = await LLM.invoke([
		new SystemMessage(
			`You are HealBot answering a non-medical question.
			Answer in 1-2 sentences (max 60 words). Always end with: "My primary expertise is medical — feel free to ask about your health."`,
		),
		lastMsg,
	]);

	console.log(`${tag()} 🌐 handleNonMedical: response generated`);

	return new Command({
		update: { activeMessages: [new AIMessage(response.content)] },
		goto: END,
	});
};

export const handleUrgent = async (state) => {
	const { activeMessages } = state;
	const recentMessages = activeMessages.slice(-2);

	const response = await LLM.invoke([
		new SystemMessage(
			`${BASE_PERSONA}
			EMERGENCY MODE. Respond in max 4 sentences.
			Sentence 1 MUST be: "Please seek immediate medical attention."
			MUST include in bold: **14** (Protection Civile), **3016** (SAMU), **15** (SAMU direct), **17** (Police).
			Add 1 brief first-aid tip only if directly applicable. No filler.`,
		),
		...recentMessages,
	]);

	console.log(`${tag()} 🚨 handleUrgent: emergency response generated`);

	return new Command({
		update: { activeMessages: [new AIMessage(response.content)] },
		goto: END,
	});
};

export const handleUnsafe = async (state) => {
	const { activeMessages } = state;
	const lastMsg = activeMessages.at(-1);

	console.log(`${tag()} 🚫 handleUnsafe: blocking unsafe message`);

	const scrubbedMessage = new HumanMessage({
		content: "[Message removed by safety filters]",
		id: lastMsg.id,
	});

	const safeResponse = new AIMessage(
		"I'm unable to fulfill this request. I operate as a safe, clinical assistant. " +
			"If you are in crisis, please contact local emergency services immediately.",
	);

	return new Command({
		update: { activeMessages: [scrubbedMessage, safeResponse] },
		goto: END,
	});
};
