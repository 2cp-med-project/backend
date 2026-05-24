import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
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
	} catch (error) {
		console.error("Twilio OTP error:", error.message);

		throw new Error("Failed to send OTP", { cause: error });
	}
}

// -------- VERIFY OTP --------
async function verify(phone, code, role) {
	
	let verificationCheck;
	try {
		verificationCheck = await client.verify.v2
			.services(VERIFY_SERVICE_SID)
			.verificationChecks.create({ to: phone, code });
	} catch (error) {
		console.error("Twilio verify error:", error.message);

		if (error.status === 404) {
			throw new Error("OTP expired or not requested", { cause: error });
		} else if (error.status === 429) {
			throw new Error("Too many attempts, please try again later", {
				cause: error,
			});
		}

		throw new Error("OTP verification service failed", { cause: error });
	}

	if (verificationCheck.status === "approved") {
		user.otpVerified = true;
		await user.save();
	}

	throw new Error("Invalid OTP");
}

export default { generate, verify };

