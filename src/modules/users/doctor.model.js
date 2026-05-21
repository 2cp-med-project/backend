import { Schema, model, mongoose } from "mongoose";

const doctorSchema = new Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["male", "female"], required: true },
		phone: { type: String, required: true, trim: true },

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		role: {
			type: String,
			default: "doctor",
			enum: ["doctor"],
			immutable: true,
		},
		refreshToken: { type: String, unique: true, sparse: true },

		specialization: { type: String, required: true, trim: true },
		licenseNumber: {
			type: String,
			unique: true,
			trim: true,
		},

		patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],

		otpVerified: { type: Boolean, default: false },
		otpCode: { type: String, default: null },
		otpExpiresAt: { type: Date, default: null },

		isActive: { type: Boolean, default: true },
		socketId: { type: String, default: null },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export default mongoose.model("Doctor", doctorSchema);
