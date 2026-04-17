//Contains logic: generate token, check password
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

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
    throw new Error("Invalid token");
  }

  if (
    !payload ||
    !payload.id ||
    !payload.role ||
    !["doctor", "patient"].includes(payload.role)
  ) {
    throw new Error("Invalid token payload");
  }

  return payload;
}

function generateToken(id, role, time = "30m") {
  const payload = { id, role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
}

async function generatehash(password) {
  return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS) || 10);
}

export default {
  checkPassword,
  generateToken,
  generatehash,
  verifyToken,
};
