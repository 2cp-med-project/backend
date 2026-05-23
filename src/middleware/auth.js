import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
	const authHeader = req.headers["authorization"] || "";
	const [scheme, token] = authHeader.split(" ");

	try {
		if (scheme !== "Bearer" || !token) {
			return res
				.status(401)
				.json({ message: "Access token missing or malformed" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (
			!decoded ||
			!decoded.id ||
			!decoded.role ||
			!["doctor", "patient"].includes(decoded.role)
		) {
			return res.status(403).json({
				message: "Authentication error: Invalid access token",
			});
		}

		req.user = decoded;
		next();
	} catch {
		return res
			.status(403)
			.json({ message: "Authentication error: Invalid access token" });
	}
}

function socketAuthenticate(socket, next) {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error("Authentication error: No token provided"));
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (
			!decoded ||
			!decoded.id ||
			!decoded.role ||
			!["patient", "doctor"].includes(decoded.role)
		) {
			return next(
				new Error("Authentication error: Invalid access token"),
			);
		}

		socket.user = decoded;
		next();
	} catch (error) {
		return next(
			new Error("Authentication error: Invalid access token", {
				cause: error,
			}),
		);
	}
}

export default { authenticate, socketAuthenticate };
