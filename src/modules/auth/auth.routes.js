// /login, /register, /verify-otp

import express from "express";
import controller from "./auth.controller.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();

//router.use("/me", authenticate);
//router.get("/me", controller.getCurrentUser);

router.post("/signin", controller.signin);

router.post("/login", controller.login);

router.use("/logout", authenticate);
router.post("/logout", controller.logout);

router.post("/refresh-token", controller.refreshToken);

router.post("/request-otp", controller.requestOTP);

router.post("/verify-otp", controller.verifyOTP);

export default router;
