import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "doctor", enum: ["doctor"], immutable: true },
  specialization: String,
  address: String, // optional or could be hospital location
  phone: String,
  licenseNumber: { type: String, required: true, unique: true }, //scanning diplomat
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],

  refreshToken: String, // for token refresh

  // ----------------- OTP Fields -----------------
  otpVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpiresAt: Date,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Doctor", doctorSchema);
