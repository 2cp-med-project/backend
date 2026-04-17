//CHECK that the user has a valid token
//User must be logged in to access this route

import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, token] = authHeader.split(" "); // Bearer TOKEN
  try {
    if (scheme !== "Bearer" || !token) {
      res.status(401).json({ message: "Access token missing or malformed" });
      return;
    }
    const user = jwt.verify(token, process.env.JWT_SECRET); // the jwt have these fields : id, role

    if (
      !user ||
      !user.id ||
      !user.role ||
      !["doctor", "patient"].includes(user.role)
    ) {
      res.status(403).json({ message: "Invalid access token" });
      return;
    }

    req.user = user;
    next();
    return;
  } catch {
    res.status(403).json({ message: "Invalid access token" });
  }
}

export default authenticate;
