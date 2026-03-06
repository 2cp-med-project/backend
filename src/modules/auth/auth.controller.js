//Handles login/signup HTTP requests
import service from "./auth.service.js";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

<<<<<<< HEAD
async function register(res, req) {
  const { firstName, lastName, email, password, licenseNumber, userType } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !userType ||
    (userType === "doctor" && !licenseNumber)
  ) {
=======
async function register(req, res) {
  const { firstName, lastName, email, password, licenseNumber, userType } = req.body;
  if (!firstName || !lastName || !email || !password || !userType || (userType === "doctor" && !licenseNumber)) {
>>>>>>> 4f794f6 (Bug fixes)
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
<<<<<<< HEAD
    existingUser =
      userType === "doctor"
        ? await Doctor.findOne({ email })
        : await Patient.findOne({ email });
=======
    const existingUser = userType === "doctor" ? await Doctor.findOne({ email }) : await Patient.findOne({ email });
>>>>>>> 4f794f6 (Bug fixes)
    if (existingUser) {
      res.status(400).json({ message: "This email is already registered" });
      return;
    }
    const passwordhash = await service.generatehash(password);
    let newUser;
    if (userType === "doctor") {
      newUser = new Doctor({
        firstName,
        lastName,
        email,
        passwordhash,
        licenseNumber,
      });
    } else if (userType === "patient") {
      newUser = new Patient({ firstName, lastName, email, passwordhash });
    } else {
      res.status(400).json({ message: "Invalid user type" });
      return;
    }

    const refreshToken = service.generateToken(newUser, userType, "7d");
    newUser.refreshToken = refreshToken;
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  const { email, password, userType } = req.body;
  try {
    if (!email || !password || !userType) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const isValid = await service.checkPassword(password, email, userType);
    if (!isValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const user =
      userType === "doctor"
        ? await Doctor.findOne({ email })
        : await Patient.findOne({ email });
    const refreshToken = service.generateToken(user, userType, "30d");
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ refreshToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function logout(req, res) {
  const { email, userType } = req.body;
  try {
    if (!email || !userType) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const user =
      userType === "doctor"
        ? await Doctor.findOne({ email })
        : await Patient.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "email not found" });
      return;
    }
    user.refreshToken = null;
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      res.status(400).json({ message: "Missing refresh token" });
      return;
    }
    const payload = service.verifyToken(refreshToken);
    const user =
      payload.type === "doctor"
        ? await Doctor.findById(payload.id)
        : await Patient.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(400).json({ message: "Invalid refresh token" });
      return;
    }
    const newAccessToken = service.generateToken(user, payload.type, "30m");
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function verifyOTP(req, res) {
  console.log("Verify OTP endpoint working...");
}

export default { register, login, logout, refreshToken, verifyOTP };
