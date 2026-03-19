const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true,
		},
		password: { type: String, required: true },
		role: {
			type: String,
			default: "superadmin",
			enum: ["admin", "superadmin"],
		},

		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		gender: { type: String, enum: ["Male", "Female"] },

		phoneNumber: { type: String },

		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

export const Admin = mongoose.model("Admin", adminSchema);
