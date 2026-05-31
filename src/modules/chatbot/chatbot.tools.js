import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import Patient from "../users/patient.model.js";
import Consultation from "../records/consultation.model.js";

import formatConsultation from "../records/consultation.service.js";

const searchTool = new TavilySearch({
	maxResults: 3,
	topic: "general",
	searchDepth: "advanced",
	includeAnswer: true,
	includeRawContent: false,
	includeDomains: [
		"nih.gov",
		"cdc.gov",
		"who.int",
		"mayoclinic.org",
		"clevelandclinic.org",
		"hopkinsmedicine.org",
		"medlineplus.gov",
		"jamanetwork.com",
		"thelancet.com",
		"nejm.org",
		"bmj.com",
	],
});

async function runStructuredQuery({
	patient,
	dateFrom,
	dateTo,
	status,
	limit,
}) {
	const matchStage = { patientId: { $eq: patient._id } };

	if (dateFrom || dateTo) {
		matchStage.date = {};
		if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
		if (dateTo) matchStage.date.$lte = new Date(dateTo);
	}
	if (status) matchStage.status = status;

	const results = await Consultation.aggregate([
		{ $match: matchStage },
		{ $sort: { date: -1 } },
		{ $limit: limit },
		{
			$project: {
				_id: 0,
				date: 1,
				status: 1,
				followUpDate: 1,
				typeofvisit: 1,
				motive: 1,
				symptoms: 1,
				severity: 1,
				systemReview: 1,
				bloodPressure: 1,
				heartRate: 1,
				respiratoryRate: 1,
				temperature: 1,
				weight: 1,
				diagnosis: 1,
				treatmentPlan: 1,
				additionalTests: 1,
				notes: 1,
			},
		},
	]);

	return results.map(formatConsultation);
}

const patientDbTool = tool(
	async ({ userId, dateFrom, dateTo, status, limit = 5 }) => {
		try {
			const patient = await Patient.findById(userId).lean();
			if (!patient) return "Patient record not found.";

			const results = await runStructuredQuery({
				patient,
				dateFrom,
				dateTo,
				status,
				limit,
			});

			if (!results.length) return "No consultations found.";

			return results.join("\n\n---\n\n");
		} catch (err) {
			console.error("[patientDbTool] error:", err.message);
			return `Failed to retrieve patient records: ${err.message}`;
		}
	},
	{
		name: "query_patient_records",
		description:
			"Query the patient's consultation history. Use for any question about past visits, diagnoses, symptoms, treatment plans, vitals, prescriptions, follow-ups, or test results.",
		schema: z.object({
			userId: z
				.string()
				.describe("The patient's MongoDB ObjectId as a string."),
			dateFrom: z
				.string()
				.optional()
				.describe("ISO 8601 start date e.g. '2025-03-01T00:00:00Z'."),
			dateTo: z
				.string()
				.optional()
				.describe("ISO 8601 end date. Omit to default to now."),
			status: z
				.enum(["scheduled", "in-progress", "completed", "cancelled"]) // Updated to match your schema exactly
				.optional()
				.describe("Filter by consultation status."),
			limit: z
				.number()
				.int()
				.min(1)
				.max(20)
				.optional()
				.describe("Max records to return. Default 5."),
		}),
	},
);

export default { searchTool, patientDbTool };
