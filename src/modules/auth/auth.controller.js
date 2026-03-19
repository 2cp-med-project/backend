//Handles login/signup HTTP requests
import authService from "./auth.service.js";
import OTPService from "./otp.service.js";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

async function signin(req, res) {
  const { firstName, lastName, email, password, licenseNumber, role } =
    req.body || {};
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !role ||
    !["doctor", "patient"].includes(role) ||
    (role === "doctor" && !licenseNumber)
  ) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
    const existingUser =
      (await Doctor.findOne({ email }, { _id: 1 })) ||
      (await Patient.findOne({ email }, { _id: 1 }));
    if (existingUser) {
      res.status(400).json({ message: "This email is already registered" });
      return;
    }

    const hashedpassword = await authService.generatehash(password);
    const newUser =
      role === "doctor"
        ? new Doctor({
            firstName,
            lastName,
            email,
            password: hashedpassword,
            licenseNumber,
          })
        : new Patient({
            firstName,
            lastName,
            email,
            password: hashedpassword,
          });

    const refreshToken = authService.generateToken(newUser.id, role, "7d");
    newUser.refreshToken = refreshToken;

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  const { email, password, role } = req.body || {};
  try {
    if (!email || !password || !role) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const user = await authService.checkPassword(password, email, role);
    const refreshToken =
      user.refreshToken || authService.generateToken(user.id, role, "30d");
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ userId: user.id, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function logout(req, res) {
  const { id, role } = req.user || {};
  try {
    if (!id || !role || !["doctor", "patient"].includes(role)) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const user =
      role === "doctor"
        ? await Doctor.findById(id)
        : await Patient.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.refreshToken = null;
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body || {};
  try {
    if (!refreshToken) {
      res.status(400).json({ message: "Missing refresh token" });
      return;
    }
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
      res
        .status(400)
        .json({ message: "No active session, please log in again" });
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
    res.status(500).json({ message: error.message });
  }
}

async function requestOTP(req, res) {
  const { phone, role } = req.body || {};
  try {
    if (!phone || !role || !["doctor", "patient"].includes(role)) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    await OTPService.generate(phone, role);
    res.status(200).json({ message: "OTP sent" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function verifyOTP(req, res) {
  const { phone, code, role } = req.body || {};
  try {
    if (!phone || !code || !role || !["doctor", "patient"].includes(role)) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const result = await OTPService.verify(phone, code, role);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export default {
  signin,
  login,
  logout,
  refreshToken,
  requestOTP,
  verifyOTP,
};
