import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["male", "female"] },
		dateOfBirth: { type: Date },
		placeOfBirth: { type: String, trim: true },
		address: { type: String, trim: true },

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		phone: { type: String, trim: true },
		role: {
			type: String,
			default: "patient",
			enum: ["patient"],
			immutable: true,
		},
		refreshToken: { type: String, unique: true, sparse: true },

		cardQRCode: { type: String, default: null },
		medicalResume: { type: String, trim: true },

		emergencyContacts: [
			{
				name: { type: String, trim: true },
				phone: { type: String, trim: true },
				relation: { type: String, trim: true },
			},
		],

		doctorsAccess: [
			{
				doctorId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Doctor",
				},
				accepted: { type: Boolean, default: false },
				requestedAt: { type: Date, default: Date.now },
			},
		],
		medicalConsultations: [
			{ type: Schema.Types.ObjectId, ref: "Consultation" },
		],

		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export default mongoose.model("Patient", patientSchema);
