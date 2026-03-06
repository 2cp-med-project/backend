//Contains logic: generate token, check password
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

const secretKey = process.env.JWT_SECRET
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

async function checkPassword(plainPassword, email, userType) {

  let user;
  if (userType === "doctor") {
    user = await Doctor.findOne({ email: email }, { passwordhash: 1 });
  } else if (userType === "patient") {
    user = await Patient.findOne({ email: email }, { passwordhash: 1 });
  }
  else {
    throw new Error("Invalid user type");
  }
  if (!user) {
    throw new Error("User not found");
  }
  return await bcrypt.compare(plainPassword, user.passwordhash);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  }
  catch (error) {
    throw new Error("Invalid token");
  }
}

function generateToken(user, userType, time = '30m') {
  const payload = {
    id: user.id,
    email: user.email,
    type: userType
  };
  return jwt.sign(payload, secretKey, { expiresIn: time });
}

async function generatehash(password) {
  return await bcrypt.hash(password, saltRounds);
}

export default {
  checkPassword,
  generateToken,
  generatehash,
  verifyToken
};
