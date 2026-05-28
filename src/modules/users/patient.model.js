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

		cardQRCode: { type: String, default: null },

		refreshToken: { type: String, unique: true, sparse: true },
		otpVerified: { type: Boolean, default: false },
		fcmtoken: { type: String, default: null },

		emergencyContact: {
			name: { type: String, trim: true },
			phone: { type: String, trim: true },
			relation: { type: String, trim: true },
		},

		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
