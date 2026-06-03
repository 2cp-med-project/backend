import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["male", "female"] },
		dateOfBirth: { type: Date },
		placeOfBirth: { type: String, trim: true },
		address: { type: String, trim: true },
		CIN: { type: String, trim: true },
		bloodtype: {
			type: String,
			enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
		},
		allergies: [{ type: String, trim: true }],
		chronicDiseases: [{ type: String, trim: true }],

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
		// apppointment field
		appointments: [
			{
				type: {
					type: String,
					enum: ["IRM-RADIO-SCANNER", "ANALYSE", "CONSULTATION"],
					required: true,
				},

				date: { type: Date, required: true },
				status: {
					type: String,
					enum: ["scheduled", "done"],
					default: "scheduled",
				},
				doctername: String,
				time: { type: String, required: true },
				appointmentnotes: String,
				reminders: [
					{
						date: { type: Date, required: true }, // when to send the reminder
						sent: { type: Boolean, default: false }, // to track if reminder was sent
					},
				],
			},
		],
		otpVerified: { type: Boolean, default: false },
		fcmToken: { type: String, default: null },

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
