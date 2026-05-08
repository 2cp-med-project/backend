import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// -------- REQUEST OTP --------
async function generate(phone, role) {
  // check user exists
  const user =
    role === "doctor"
      ? await Doctor.findOne({ phone })
      : await Patient.findOne({ phone });
  if (!user) throw new Error("User not found");

  try {
    // request OTP via Twilio Verify
    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    console.log(`OTP sent to ${phone}, status: ${verification.status}`);
    return verification.status; // e.g., "pending"
  } catch (err) {
    console.error("Twilio OTP error:", err.message);
    throw new Error("Failed to send OTP");
  }
}

// -------- VERIFY OTP --------
async function verify(phone, code, role) {
  // check user exists
  const user =
    role === "doctor"
      ? await Doctor.findOne({ phone })
      : await Patient.findOne({ phone });
  if (!user) throw new Error("User not found");

  try {
    const verificationCheck = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code,
      });

    if (verificationCheck.status === "approved") {
      // mark user as verified in DB
      user.otpVerified = true;
      await user.save();
      return true;
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (err) {
    console.error("Twilio verify error:", err.message);
    throw new Error("OTP verification failed");
  }
}

export default {
  generate,
  verify,
};
