const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Male", "Female"] },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: String,

    password: { type: String, required: true },

    specialty: { type: String, required: true },
    degreeId: { type: String, required: true, unique: true },
    workAddress: String,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
