import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";
import { redisClient } from "../../config/redis.js";

async function checkPassword(plainPassword, phone, role) {
	const user =
		role === "doctor"
			? await Doctor.findOne({ phone })
			: await Patient.findOne({ phone });

	if (!user) {
		throw new Error("Invalid credentials");
	}
	const valid = await bcrypt.compare(plainPassword, user.password);

	if (!valid) {
		throw new Error("Invalid credentials");
	}
	return user;
}

function verifyToken(token) {
	let payload;

	try {
		payload = jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		throw new Error("Invalid token", { cause: error });
	}

	if (
		!payload ||
		!payload.id ||
		!payload.role ||
		!["doctor", "patient"].includes(payload.role)
	) {
		throw new Error("Invalid token");
	}

	return payload;
}

function generateToken(id, role, time = "30m") {
	const payload = { id, role };
	const uniqueTokenId = crypto.randomUUID();

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: time,
		jwtid: uniqueTokenId,
	});
}

async function blacklistToken(token) {
	const { jti, exp } = token;

	const now = Math.floor(Date.now() / 1000);
	const remainingTime = exp - now;

	if (remainingTime > 0) {
		await redisClient.set(`blacklist:jti:${jti}`, "true", {
			EX: remainingTime,
		});
	}
}

async function generatehash(password) {
	return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS) || 10);
}

export default {
	checkPassword,
	generateToken,
	generatehash,
	verifyToken,
	blacklistToken,
};
