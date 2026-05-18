import { Patient } from "../users/patient.model.js";
import { Consultation } from "../records/consultation.model.js";
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const formatMessages = (messages) => {
	if (!Array.isArray(messages)) return [];
	return messages
		.filter((m) => m._getType() !== "system")
		.map((m) => ({
			role: m._getType() === "human" ? "user" : "assistant",
			content: m.content,
		}));
};

export const searchTool = new TavilySearch({
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

function formatConsultation(c) {
	const lines = [
		`Date: ${new Date(c.date).toLocaleDateString("en-GB", { dateStyle: "long" })}`,
		`Status: ${c.status}`,
	];

	if (c.followUpDate) {
		lines.push(
			`Follow-up: ${new Date(c.followUpDate).toLocaleDateString("en-GB", { dateStyle: "long" })}`,
		);
	}

	const r = c.report;
	if (!r) {
		lines.push("(No report attached)");
		return lines.join("\n");
	}

	if (r.typeOfVisit) lines.push(`Visit type: ${r.typeOfVisit}`);
	if (r.motive) lines.push(`Reason: ${r.motive}`);
	if (r.symptoms)
		lines.push(
			`Symptoms: ${r.symptoms}${r.severity ? ` (${r.severity})` : ""}`,
		);
	if (r.systemReview) lines.push(`System review: ${r.systemReview}`);

	if (r.vitals) {
		const v = r.vitals;
		const parts = [
			v.bloodPressure && `BP: ${v.bloodPressure}`,
			v.heartRate && `HR: ${v.heartRate}`,
			v.respiratoryRate && `RR: ${v.respiratoryRate}`,
			v.temperature && `Temp: ${v.temperature}`,
			v.weight && `Weight: ${v.weight}`,
		].filter(Boolean);
		if (parts.length) lines.push(`Vitals: ${parts.join(" | ")}`);
	}

	if (r.diagnosis) lines.push(`Diagnosis: ${r.diagnosis}`);
	if (r.notes) lines.push(`Notes: ${r.notes}`);
	if (r.treatmentPlan) lines.push(`Treatment: ${r.treatmentPlan}`);
	if (r.additionalTests) lines.push(`Tests: ${r.additionalTests}`);
	if (r.followUp) lines.push("Follow-up required: Yes");

	return lines.join("\n");
}

async function runStructuredQuery({
	patient,
	dateFrom,
	dateTo,
	status,
	limit,
}) {
	const matchStage = { _id: { $in: patient.medicalConsultations } };

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
			$lookup: {
				from: "reports",
				localField: "reportId",
				foreignField: "_id",
				as: "report",
			},
		},
		{
			$unwind: {
				path: "$report",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$project: {
				_id: 0,
				date: 1,
				status: 1,
				followUpDate: 1,
				"report.typeOfVisit": 1,
				"report.motive": 1,
				"report.symptoms": 1,
				"report.severity": 1,
				"report.diagnosis": 1,
				"report.notes": 1,
				"report.treatmentPlan": 1,
				"report.additionalTests": 1,
				"report.systemReview": 1,
				"report.vitals": 1,
				"report.followUp": 1,
			},
		},
	]);

	return results.map(formatConsultation);
}

export const patientDbTool = tool(
	async ({ patientId, dateFrom, dateTo, status, limit = 5 }) => {
		try {
			const patient = await Patient.findById(patientId).lean();
			if (!patient) return "Patient record not found.";
			if (!patient.medicalConsultations?.length)
				return "No consultations on record.";

			const results = await runStructuredQuery({
				patient,
				dateFrom,
				dateTo,
				status,
				limit,
			});

			if (!results.length)
				return "No consultations found for the given filters.";

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
			patientId: z
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
				.enum(["scheduled", "completed", "cancelled"])
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
