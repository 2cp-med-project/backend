import { Schema, model } from "mongoose";

const consultationSchema = new Schema(
	{
		doctorId: {
			type: Schema.Types.ObjectId,
			ref: "Doctor",
			required: true,
		},

		date: { type: Date, default: Date.now },
		status: {
			type: String,
			enum: ["scheduled", "completed", "cancelled"],
			default: "scheduled",
			required: true,
		},
		reportId: {
			type: Schema.Types.ObjectId,
			ref: "Report",
			required: true,
		},
		followUpDate: { type: Date },
	},
	{
		timestamp: true,
		minimize: true,
	},
);

export const Consultation = model("Consultation", consultationSchema);
