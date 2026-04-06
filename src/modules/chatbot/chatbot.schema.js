import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { z } from "zod";

export const SafeguardSchema = z.object({
	isSafe: z
		.boolean()
		.describe(
			"False only if the message requests instructions to harm others or synthesize illegal substances.",
		),
	domain: z
		.enum(["medical", "non_medical"])
		.describe(
			"'medical' if related to health, body, medicine, or personal records. 'non_medical' otherwise.",
		),
});

export const ClassificationSchema = z.object({
	intent: z
		.enum(["general_inquiry", "symptom_report"])
		.describe(
			"'symptom_report' if user describes active symptoms. 'general_inquiry' for everything else.",
		),
	urgency: z
		.enum(["not_urgent", "urgent"])
		.describe(
			"'urgent' only for immediate life threats: chest pain, can't breathe, overdose, stroke.",
		),
	requiresPatientHistory: z
		.boolean()
		.describe(
			"True if user references their own past visits, records, diagnoses, or results.",
		),
	requiresWebSearch: z
		.boolean()
		.describe(
			"True if answering requires clinical guidelines, drug info, or condition facts.",
		),
});

export const QuerySchema = z.object({
	webQuery: z
		.string()
		.optional()
		.describe(
			"5-10 keyword clinical search string. Omit if no external facts needed.",
		),
	patientDbQuery: z
		.object({
			dateFrom: z
				.string()
				.optional()
				.describe(
					"ISO 8601 start date. Translate relative dates like 'last week' to exact ISO dates.",
				),
			dateTo: z
				.string()
				.optional()
				.describe("ISO 8601 end date. Omit to default to now."),
			status: z
				.enum(["scheduled", "completed", "cancelled"])
				.optional()
				.describe("Filter by consultation status."),
			limit: z
				.number()
				.int()
				.min(1)
				.max(20)
				.optional()
				.describe(
					"Max records to return. 1 for 'last visit', N for 'last N visits', default 5.",
				),
		})
		.optional()
		.describe(
			"DB query for patient records. Omit entirely if user is not referencing personal history.",
		),
});

export const MedicalAgentAnnotation = Annotation.Root({
	patientId: Annotation,
	activeMessages: Annotation({
		reducer: messagesStateReducer,
		default: () => [],
	}),
	summaryBlocks: Annotation({
		reducer: (existing, update) => {
			if (!update || update.length === 0) return existing ?? [];
			return [...(existing ?? []), ...update];
		},
		default: () => [],
	}),
	safeguard: Annotation,
	classification: Annotation,
	webQuery: Annotation,
	patientDbQuery: Annotation,
	webContext: Annotation,
	patientContext: Annotation,
});
