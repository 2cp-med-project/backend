//CHECK that the user has a valid token
//User must be logged in to access this route

import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  try {
    if (!token || authHeader.split(" ")[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Access token missing or malformed" });
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid access token" });
  }
}

export default authMiddleware;
