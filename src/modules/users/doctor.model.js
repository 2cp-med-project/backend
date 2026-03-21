import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
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
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		phoneNumber: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["Male", "Female"], required: true },

		specialty: { type: String, required: true, trim: true },
		degreeId: { type: String, required: true, unique: true, trim: true },
		socketId: { type: String, default: null },

		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export const Doctor = model("Doctor", doctorSchema);
