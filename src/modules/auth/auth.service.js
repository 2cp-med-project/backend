//Contains logic: generate token, check password
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

async function checkPassword(plainPassword, email, role) {
  let user;
  if (role === "doctor") {
    user = await Doctor.findOne({ email: email }, { password: 1 });
  } else if (role === "patient") {
    user = await Patient.findOne({ email: email }, { password: 1 });
  }
  else {
    throw new Error("Invalid role");
  }
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
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
  catch (error) {
    throw new Error("Invalid token");
  }
}

function generateToken(user, role, time = '10m') {
  const payload = {
    id: user.id,
    role: role
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
}

async function generatehash(password) {
  return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
}

export default {
  checkPassword,
  generateToken,
  generatehash,
  verifyToken
};
