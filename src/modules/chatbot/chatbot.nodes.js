import { fastLLM, powerLLM } from "../../config/llm.js";
import { ClassificationSchema } from "./chatbot.schema.js";
import { searchTool } from "./chatbot.tools.js";
import {
	HumanMessage,
	AIMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { END, Command } from "@langchain/langgraph";

export const classifyQuery = async (state) => {
	const [globalSystem, ...history] = state.messages;

	const structuredLlm = fastLLM.withStructuredOutput(ClassificationSchema);

	const systemPrompt = `
	You are a medical triage classifier. Analyze the conversation and classify the user's latest message.

	Guidelines:
	- intent: 'intervention' if the user is actively sick, injured, or reporting symptoms. 'general_question' for advice, facts, or greetings.
	- urgency: 'urgent' for life-threatening emergencies (chest pain, heavy bleeding, difficulty breathing). 'not_urgent' for minor symptoms. 'none' for general questions.
	- search: true ONLY when you need current medical info or the topic is specific enough that accuracy requires verification.
	- query: a concise 5–10 word search query incorporating prior context. Empty string if search is false.
	`.trim();

	const classification = await structuredLlm.invoke([
		new SystemMessage(systemPrompt),
		...history.slice(-3),
	]);

	let nextNode;
	if (classification.intent === "intervention") {
		nextNode =
			classification.urgency === "urgent"
				? "handleUrgent"
				: classification.search
					? "webSearch"
					: "handleNonUrgent";
	} else {
		nextNode = classification.search
			? "webSearch"
			: "handleGeneralQuestion";
	}

	console.log(
		`[${new Date().toLocaleTimeString()}] 🧠 Intent: ${classification.intent} | Urgency: ${classification.urgency} | Search: ${classification.search} | Query: "${classification.query}" → ${nextNode}`,
	);

	return new Command({ update: { classification }, goto: nextNode });
};

export const webSearch = async (state) => {
	const { classification } = state;

	const rawResults = await searchTool.invoke({
		query: classification.query,
	});

	const searchResults = rawResults.results
		.map(
			(item, i) =>
				`[Source ${i + 1}] ${item.url ?? "Web"}\nTitle: ${item.title}\n${item.content}`,
		)
		.join("\n\n---\n\n");

	const nextNode =
		classification.intent === "general_question"
			? "handleGeneralQuestion"
			: "handleNonUrgent";

	console.log(
		`[${new Date().toLocaleTimeString()}] 🔍 Search done → ${nextNode}`,
	);

	return new Command({ update: { searchResults }, goto: nextNode });
};

export const handleUrgent = async (state) => {
	const [globalSystem, ...history] = state.messages;

	const nodePrompt = `
	You are an emergency medical assistant. The user is in an urgent situation.

	Rules:
	1. First line MUST be: "Please seek immediate medical attention."
	2. List the Algerian emergency numbers in bold: **14** (Protection Civile), **3016** (SAMU), **17** / **1548** (Police).
	3. One sentence of actionable first-aid if clearly applicable. Nothing else.
	4. Maximum 4 sentences total, excluding the number list. No filler, no empathy preambles.
	`.trim();

	console.log(
		`[${new Date().toLocaleTimeString()}] 🆘 Emergency protocol triggered.`,
	);

	const response = await powerLLM.invoke([
		globalSystem,
		new SystemMessage(nodePrompt),
		...history,
	]);

	return new Command({
		update: { messages: [new AIMessage(response.content)] },
		goto: END,
	});
};

export const handleNonUrgent = async (state) => {
	const [globalSystem, ...history] = state.messages;

	const searchContext =
		state.searchResults ?? "No additional search context.";

	const nodePrompt = `
	You are an empathetic medical assistant giving self-care advice for a non-emergency situation.

	Rules:
	1. Under 100 words total.
	2. One short sentence acknowledging their discomfort.
	3. Maximum 3 bullet points of practical relief steps, drawn from the search context below.
	4. End with 1–2 sentences on when to see a doctor and warning signs.
	5. No fluff, no source citations, no introductory filler.

	Search context:
	${searchContext}
	`.trim();

	const response = await powerLLM.invoke([
		globalSystem,
		new SystemMessage(nodePrompt),
		...history,
	]);

	return new Command({
		update: { messages: [new AIMessage(response.content)] },
		goto: END,
	});
};

export const handleGeneralQuestion = async (state) => {
	const [globalSystem, ...history] = state.messages;

	const searchContext =
		state.searchResults ?? "No additional search context.";

	const nodePrompt = `
	You are a concise medical information assistant.

	Rules:
	1. Under 120 words total.
	2. Answer the specific question in the first sentence.
	3. Maximum 3 bullet points when listing facts, causes, or symptoms.
	4. Skip unnecessary background unless explicitly asked.
	5. Conversational but direct. No raw source links.

	Search context:
	${searchContext}
	`.trim();

	const response = await powerLLM.invoke([
		globalSystem,
		new SystemMessage(nodePrompt),
		...history,
	]);

	return new Command({
		update: { messages: [new AIMessage(response.content)] },
		goto: END,
	});
};
