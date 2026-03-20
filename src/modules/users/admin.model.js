import { Schema, model } from "mongoose";

const adminSchema = new Schema(
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
		email: { type: String, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, trim: true },
		phoneNumber: { type: String, trim: true },
		gender: { type: String, enum: ["Male", "Female"] },

		role: {
			type: String,
			default: "superadmin",
			enum: ["admin", "superadmin"],
		},
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export const Admin = model("Admin", adminSchema);
