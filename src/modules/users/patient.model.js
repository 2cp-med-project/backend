const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Male", "Female"] },
    dateOfBirth: Date,
    placeOfBirth: String,

    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    address: String,

    password: { type: String, required: true },

    emergencyContacts: [
      {
        name: { type: String, trim: true },
        phone: String,
        relation: String,
      },
    ],

    medicalConsultations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],

    doctorsAccess: [
      {
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        accepted: { type: Boolean, default: false },
        requestedAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
