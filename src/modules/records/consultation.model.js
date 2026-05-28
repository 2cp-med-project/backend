import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
	{
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: true,
			index: true,
		},
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Patient",
			required: true,
			index: true,
		},

		date: { type: Date, required: true },
		status: {
			type: String,
			enum: ["scheduled", "in-progress", "completed", "cancelled"],
			default: "scheduled",
			required: true,
		},
		typeofvisit: { type: String, trim: true },

		bloodPressure: { type: String, trim: true },
		heartRate: { type: String, trim: true },
		respiratoryRate: { type: String, trim: true },
		temperature: { type: String, trim: true },
		weight: { type: String, trim: true },

		motive: { type: String, trim: true },
		symptoms: { type: String, trim: true },
		severity: {
			type: String,
			enum: ["light", "mild", "moderate", "severe"],
		},
		systemReview: { type: String, trim: true },

		diagnosis: { type: String, trim: true },
		treatmentPlan: { type: String, trim: true },
		additionalTests: { type: String, trim: true },
		notes: { type: String, trim: true },
		attachments: [{ type: String }],

		resume: { type: String, trim: true, default: null },

		followUpDate: { type: Date, default: null },
	},
	{ timestamps: true },
);

export default mongoose.model("Consultation", consultationSchema);
