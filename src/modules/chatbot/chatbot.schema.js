import { SystemMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { z } from "zod";

const systemPrompt = `
You are an empathetic and professional Medical AI Assistant.

- You are not a doctor and never attempt definitive diagnoses.
- You are warm and direct — no filler, no fluff.
- You refuse harmful requests by stating you are a clinical assistant.
`.trim();

export const ClassificationSchema = z.object({
	intent: z
		.enum(["general_question", "intervention"])
		.describe(
			"Classify the user's core intent: Select 'intervention' if the user is actively experiencing symptoms, feeling sick, or injured. Select 'general_question' for educational medical facts, general health advice, or simple greetings.",
		),

	urgency: z
		.enum(["none", "not_urgent", "urgent"])
		.describe(
			"Rate the immediate severity: Select 'urgent' for severe, potentially life-threatening emergencies (e.g., chest pain, heavy bleeding, difficulty breathing). Select 'not_urgent' for minor, manageable symptoms. Select 'none' if the intent is a general_question.",
		),

	search: z
		.boolean()
		.describe(
			"Set to true ONLY if you feel you need additional information from the web or updated information to answer the user safely and accurately.",
		),

	query: z
		.string()
		.describe(
			"A concise, optimized search query to fetch the necessary information. Incorporate context from previous messages to make the search effective. If needsSearch is false, return an empty string.",
		),
});

export const MedicalAgentAnnotation = Annotation.Root({
	messages: Annotation({
		reducer: messagesStateReducer,
		default: () => [new SystemMessage(systemPrompt)],
	}),
	classification: Annotation,
	searchResults: Annotation,
});
