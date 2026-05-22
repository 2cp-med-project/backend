import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["male", "female"] },
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

		specialization: { type: String, trim: true },
		licenseNumber: {
			type: String,
			trim: true,
			default: undefined,
			index: {
				unique: true,
				sparse: true,
			},
		},

		patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],

		otpVerified: { type: Boolean, default: false },

		isActive: { type: Boolean, default: true },
		socketId: { type: String, default: null },
	},
	{ timestamps: true },
);

export default mongoose.model("Doctor", doctorSchema);
