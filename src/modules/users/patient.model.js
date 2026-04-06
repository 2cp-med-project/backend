import { Schema, model } from "mongoose";

const patientSchema = new Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		userName: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		gender: { type: String, enum: ["Male", "Female"] },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		phoneNumber: { type: String, trim: true },

		dateOfBirth: { type: Date },
		placeOfBirth: { type: String, trim: true },
		address: { type: String, trim: true },

		emergencyContacts: [
			{
				name: { type: String, trim: true },
				phoneNumber: { type: String, trim: true },
				relation: { type: String, trim: true },
			},
		],

		medicalConsultations: [
			{ type: Schema.Types.ObjectId, ref: "Consultation" },
		],

		doctorsAccess: [
			{
				doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
				accepted: { type: Boolean, default: false },
				requestedAt: { type: Date, default: Date.now },
			},
		],

		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export const Patient = model("Patient", patientSchema);
