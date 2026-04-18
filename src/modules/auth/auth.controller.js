//Handles login/signup HTTP requests
import authService from "./auth.service.js";
import OTPService from "./otp.service.js";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

async function signin(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register a new user (doctor or patient)'
  // #swagger.description = 'Roles: doctor, patient'

  const { firstName, lastName, email, phone, password, licenseNumber, role } =
    req.body || {};
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
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
      (await Doctor.findOne({ $or: [{ email }, { phone }] }, { _id: 1 })) ||
      (await Patient.findOne({ $or: [{ email }, { phone }] }, { _id: 1 }));
    if (existingUser) {
      res
        .status(400)
        .json({ message: "The email or phone number are already used" });
      return;
    }

    const hashedpassword = await authService.generatehash(password);
    const newUser =
      role === "doctor"
        ? new Doctor({
            firstName,
            lastName,
            email,
            phone,
            password: hashedpassword,
            licenseNumber,
          })
        : new Patient({
            firstName,
            lastName,
            phone,
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
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login a user (doctor or patient) and return a refresh token'
  // #swagger.description = 'Roles: doctor, patient'

  const { phone, password, role } = req.body || {};
  try {
    if (!phone || !password || !role) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const user = await authService.checkPassword(password, phone, role);
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
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Logout the current user by invalidating their refresh token'
  // #swagger.security = [{ BearerAuth: [] }]
  // #swagger.description = 'Roles: doctor, patient'

  const { id, role } = req.user;
  try {
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
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Refresh access token using a valid refresh token'
  // #swagger.description = 'Roles: doctor, patient'

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

async function getCurrentUser(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Get the current logged-in user details'
  // #swagger.security = [{ BearerAuth: [] }]
  // #swagger.description = 'Roles: doctor, patient'

  const { id, role } = req.user;

  try {
    const returnedFields =
      role === "doctor"
        ? {
            firstName: 1,
            lastName: 1,
            licenseNumber: 1,
            specialization: 1,
            email: 1,
            phone: 1,
            address: 1,
            patients: 1,
            createdAt: 1,
          }
        : {
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            dateOfBirth: 1,
            placeOfBirth: 1,
            gender: 1,
            address: 1,
            emergencyContacts: 1,
            medicalResume: 1,
            doctorsAccess: 1,
            createdAt: 1,
          };

    const user =
      role === "doctor"
        ? await Doctor.findById(id, returnedFields)
        : await Patient.findById(id, returnedFields);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function requestOTP(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Request a One-Time Password (OTP) for phone verification'
  // #swagger.description = 'Roles: doctor, patient'

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
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Verify a One-Time Password (OTP) for phone verification'
  // #swagger.description = 'Roles: doctor, patient'

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
