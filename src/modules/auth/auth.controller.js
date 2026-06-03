import authService from "./auth.service.js";
import OTPService from "./otp.service.js";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

async function signUp(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.summary = 'Register a new user (doctor or patient)'
	// #swagger.description = 'Roles: doctor, patient'

	// TODO: Check for otpVerified before allowing sign in

	const { firstName, lastName, email, phone, password, role } = req.body;

	try {
		const existingUser =
			(await Doctor.findOne(
				{ $or: [{ email }, { phone }] },
				{ _id: 1 },
			)) ||
			(await Patient.findOne(
				{ $or: [{ email }, { phone }] },
				{ _id: 1 },
			));
		if (existingUser) {
			res.status(400).json({
				message: "The email or phone number are already used",
			});
			return;
		}

		const hashedpassword = await authService.generatehash(password);

		const userData = {
			firstName,
			lastName,
			email,
			phone,
			password: hashedpassword,
		};

		const newUser =
			role === "doctor" ? new Doctor(userData) : new Patient(userData);

		const refreshToken = authService.generateToken(newUser.id, role, "7d");
		newUser.refreshToken = refreshToken;

		await newUser.save();
		res.status(201).json({
			message: "User registered successfully",
			userId: newUser.id,
			refreshToken,
		});
	} catch (error) {
		if (error.message === "Invalid credentials") {
			res.status(401).json({ message: error.message });
		} else {
			res.status(500).json({ message: error.message });
		}
	}
}

async function logIn(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.summary = 'Login a user (doctor or patient) and return a refresh token'
	// #swagger.description = 'Roles: doctor, patient'

	// TODO: Check for otpVerified before allowing login

	const { phone, password, role } = req.body || {};
	try {
		const user = await authService.checkPassword(password, phone, role);

		const refreshToken = authService.generateToken(user.id, role, "30d");
		user.refreshToken = refreshToken;

		await user.save();
		res.status(200).json({ userId: user.id, refreshToken });
	} catch (error) {
		if (error.message === "Invalid credentials") {
			res.status(401).json({ message: error.message });
		} else {
			res.status(500).json({ message: error.message });
		}
	}
}

async function logOut(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.summary = 'Logout the current user by invalidating their refresh token'
	// #swagger.description = 'Roles: doctor, patient'

	const { id, role } = req.user;
	try {
		const user =
			role === "doctor"
				? await Doctor.findById(id)
				: await Patient.findById(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.refreshToken = null;
		user.otpVerified = false; // require OTP verification on next login

		// await Promise.all([user.save(), authService.blacklistToken(req.user)]);
		await user.save();
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function refreshToken(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.summary = 'Refresh access token using a valid refresh token'
	// #swagger.description = 'Roles: doctor, patient'

	const { refreshToken } = req.body || {};
	try {
		const payload = authService.verifyToken(refreshToken);
		const user =
			payload.role === "doctor"
				? await Doctor.findById(payload.id)
				: await Patient.findById(payload.id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		if (!user.refreshToken) {
			res.status(400).json({
				message: "No active session, please log in again",
			});
			return;
		}

		if (user.refreshToken !== refreshToken) {
			res.status(400).json({ message: "Invalid refresh token" });
			return;
		}

		const newRefreshToken = authService.generateToken(
			user.id,
			payload.role,
			"30d",
		);

		user.refreshToken = newRefreshToken;
		await user.save();

		const accessToken = authService.generateToken(user.id, payload.role);
		res.status(200).json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		if (error.message === "Invalid token") {
			res.status(401).json({ message: error.message });
		} else {
			res.status(500).json({ message: error.message });
		}
	}
}

async function requestOTP(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.summary = 'Request a One-Time Password (OTP) for phone verification'
	// #swagger.description = 'Roles: doctor, patient'

	const { phone, role } = req.body || {};
	try {
		await OTPService.generate(phone, role);
		res.status(200).json({ message: "OTP sent" });
	} catch (e) {
		if (e.message === "User not found") {
			res.status(404).json({ message: e.message });
		} else {
			res.status(500).json({ message: e.message });
		}
	}
}

async function verifyOTP(req, res) {
	// #swagger.tags = ['Auth']
	// #swagger.summary = 'Verify a One-Time Password (OTP) for phone verification'
	// #swagger.description = 'Roles: doctor, patient'

	const { phone, code, role } = req.body || {};
	try {
		await OTPService.verify(phone, code, role);
		res.status(200).json({ verified: true });
	} catch (e) {
		if (e.message === "User not found") {
			res.status(404).json({ message: e.message });
		} else if (e.message === "Invalid OTP") {
			res.status(400).json({ message: e.message });
		} else {
			res.status(500).json({ message: e.message });
		}
	}
}

export default {
	signUp,
	logIn,
	logOut,
	refreshToken,
	requestOTP,
	verifyOTP,
};
