import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: Date,
  placeOfBirth: String,
  gender: { type: String, enum: ["male", "female"] },
  phone: String,
  address: String,
  role: {
    type: String,
    default: "patient",
    enum: ["patient"],
    immutable: true,
  },
  emergencyContact: {
    name: String,
    phone: String,
  },
  medicalResume: String, // summary of health history

  otpVerified: { type: Boolean, default: false }, // for OTP verification
  refreshToken: String, // for token refresh
  fcmToken: String,
});

export default mongoose.model("Patient", patientSchema);
