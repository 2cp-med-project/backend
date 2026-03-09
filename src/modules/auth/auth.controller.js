//Handles login/signup HTTP requests
import service from "./auth.service.js";
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
    const hashedpassword = await service.generatehash(password);
    let newUser;
    if (role === "doctor") {
      newUser = new Doctor({
        firstName,
        lastName,
        email,
        password: hashedpassword,
        licenseNumber,
      });
    } else if (role === "patient") {
      newUser = new Patient({
        firstName,
        lastName,
        email,
        password: hashedpassword,
      });
    } else {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const refreshToken = service.generateToken(newUser, role, "7d");
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
    const user = await service.checkPassword(password, email, role);
    const refreshToken =
      user.refreshToken || service.generateToken(user, role, "30d");
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
  const { oldRefreshToken } = req.body || {};
  try {
    if (!oldRefreshToken) {
      res.status(400).json({ message: "Missing refresh token" });
      return;
    }
    const payload = service.verifyToken(oldRefreshToken);
    const user =
      payload.role === "doctor"
        ? await Doctor.findById(payload.id)
        : await Patient.findById(payload.id);
    if (!user || user.refreshToken !== oldRefreshToken) {
      res.status(400).json({ message: "Invalid refresh token" });
      return;
    }
    const refreshToken = service.generateToken(user, payload.role, "30d");
    user.refreshToken = refreshToken;
    await user.save();

    const accessToken = service.generateToken(user, payload.role);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getCurrentUser(req, res) {
  const { id, role } = req.user || {};
  try {
    if (!id || !role || !["doctor", "patient"].includes(role)) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const user =
      role === "doctor"
        ? await Doctor.findById(id, { password: 0, refreshToken: 0 })
        : await Patient.findById(id, { password: 0, refreshToken: 0 });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function verifyOTP(req, res) {
  res.status(501).json({ message: "OTP verification not implemented yet" });
}

export default { signin, login, logout, refreshToken, verifyOTP };
