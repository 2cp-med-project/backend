// /login, /register, /verify-otp

import express from "express";
import controller from "./auth.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize("patient", "doctor"),
  controller.getCurrentUser,
);

router.post("/signin", controller.signin);

router.post("/login", controller.login);

router.post(
  "/logout",
  authenticate,
  authorize("patient", "doctor"),
  controller.logout,
);

router.post("/refresh-token", controller.refreshToken);

router.post("/request-otp", controller.requestOTP);

router.post("/verify-otp", controller.verifyOTP);

export default router;
