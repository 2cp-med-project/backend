import { Schema, model } from "mongoose";

const reportSchema = new Schema(
	{
		typeOfVisit: { type: String, required: true },
		motive: { type: String, required: true },

		vitals: {
			bloodPressure: String,
			heartRate: String,
			respiratoryRate: String,
			temperature: String,
			weight: String,
		},

		symptoms: { type: String, required: true },
		severity: {
			type: String,
			enum: ["Mild", "Moderate", "Severe"],
			required: true,
		},
		systemReview: String,

		diagnosis: String,
		notes: String,

		treatmentPlan: String,
		additionalTests: String,
		attachments: [{ type: String }],
		followUp: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export const Report = model("Report", reportSchema);
