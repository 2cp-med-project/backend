// services/OTPService.js

import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";

const OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -------- GENERATE OTP --------
async function generate(phone, role) {
  if (!phone || !role || !["doctor", "patient"].includes(role)) {
    throw new Error("Missing required fields");
  }

  const code = generateCode();
  const user =
    role === "doctor"
      ? await Doctor.findOne({ phone })
      : await Patient.findOne({ phone });
  if (!user) throw new Error("User not found");

  // store OTP in DB
  user.otpCode = code;
  user.otpExpiresAt = Date.now() + OTP_EXPIRATION;

  await user.save();

  // show OTP in console (for development)
  console.log(`OTP for ${phone}: ${code}`);

  // optional: return OTP so you can see it in Postman
  return code;
}

// -------- VERIFY OTP --------
async function verify(phone, code, role) {
  if (!phone || !code || !role || !["doctor", "patient"].includes(role)) {
    throw new Error("Missing required fields");
  }

  const user =
    role === "doctor"
      ? await Doctor.findOne({ phone })
      : await Patient.findOne({ phone });
  if (!user) throw new Error("User not found");

  // check expiration
  if (
    !user.otpCode ||
    user.otpExpiresAt < Date.now() ||
    user.otpCode !== code
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // mark verified
  // remove OTP after verification
  user.otpVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;

  await user.save();

  return true;
}

export default {
  generate,
  verify,
};
