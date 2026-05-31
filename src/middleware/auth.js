import jwt from "jsonwebtoken";
// import { redisClient } from "../config/redis.js";

async function verifyUserToken(token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	if (!decoded.id || !["doctor", "patient"].includes(decoded.role)) {
		throw new Error("Invalid payload claims");
	}

	if (!decoded.jti) {
		throw new Error("Token missing JTI claim");
	}

	// const isRevoked = await redisClient.get(`blacklist:jti:${decoded.jti}`);
	// if (isRevoked) {
	// 	throw new Error("Token is revoked");
	// }

	return decoded;
}

async function authenticate(req, res, next) {
	const authHeader = req.headers["authorization"] || "";
	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({
			message: "Authentication Error: Access token missing or malformed",
		});
	}

	try {
		req.user = await verifyUserToken(token);
		next();
	} catch (error) {
		console.error("❌ [Auth] verifyUserToken error:", error.message);
		return res
			.status(403)
			.json({ message: "Authentication Error: Invalid access token" });
	}
}

async function socketAuthenticate(socket, next) {
	const token = socket.handshake.auth?.token;

	if (!token) {
		return next(new Error("Authentication Error: No token provided"));
	}

	try {
		socket.user = await verifyUserToken(token);
		next();
	} catch (error) {
		return next(
			new Error("Authentication Error: Invalid access token", {
				cause: error,
			}),
		);
	}
}

export default { authenticate, socketAuthenticate };
