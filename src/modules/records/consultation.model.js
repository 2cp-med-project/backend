const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
	{
		doctor: {
			type: mongoose.Schema.Types.ObjectId,
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
		report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
		followUpDate: Date,
	},
	{
		timestamp: true,
		minimize: true,
	},
);

export const Consultation = mongoose.model("Consultation", consultationSchema);
