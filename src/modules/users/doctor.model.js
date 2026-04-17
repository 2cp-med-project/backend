import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: "doctor", enum: ["doctor"], immutable: true },
  gender: { type: String, enum: ["male", "female"] },
  licenseNumber: { type: String, required: true, unique: true }, //scanning diplomat
  specialization: String,
  address: String, // optional or could be hospital location

  refreshToken: String, // for token refresh
  otpVerified: { type: Boolean, default: false }, // for OTP verification
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Doctor", doctorSchema);
