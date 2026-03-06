//CHECK that the user has a valid token
//User must be logged in to access this route

<<<<<<< HEAD
const jwt = require("jsonwebtoken");
=======
import jwt from 'jsonwebtoken';
import Doctor from '../users/doctor.model.js';
import Patient from '../users/patient.model.js';

>>>>>>> 1960560 (change to es-modules)

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid access token" });
  }
}

export default authMiddleware;
