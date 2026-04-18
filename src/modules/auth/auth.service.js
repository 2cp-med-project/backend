//Contains logic: generate token, check password
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";

async function checkPassword(plainPassword, email, role) {
  if (
    !plainPassword ||
    !email ||
    !role ||
    !["doctor", "patient"].includes(role)
  ) {
    throw new Error("Missing required fields");
  }

  /*const user =
    role === "doctor"
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });
console.log("DB user:", user);
  if (!user) {
    throw new Error("Invalid credentials ");
  }*/
 let user;

if (role === "doctor") {
  user = await Doctor.findOne({ email });
} else if (role === "patient") {
  user = await Patient.findOne({ email });
  console.log("DB user:", user);
} else {
  throw new Error("Invalid role");
}
console.log("DB user:", user);
  const valid = await bcrypt.compare(plainPassword, user.password);
onsole.log("DB password:", user.password);
console.log("input password:", plainPassword);
  if (!valid) {
    throw new Error("Invalid credentials ");
  }
  
c
  return user;
}

function verifyToken(token) {
  if (!token) {
    throw new Error("Token is required");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.id || !payload.role) {
      throw new Error("Invalid token payload");
    }

    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function generateToken(id, role, time = "10m") {
  if (!id || !role || !["doctor", "patient"].includes(role)) {
    throw new Error("Invalid user or role");
  }
  const payload = { id, role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
}

async function generatehash(password) {
  if (!password) {
    throw new Error("Password is required");
  }
  return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS) || 10);
}

export default {
  checkPassword,
  generateToken,
  generatehash,
  verifyToken,
};
