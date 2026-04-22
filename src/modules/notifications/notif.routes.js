import express from "express";
import controller from "./notif.controller.js";
import service from "./notif.service.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();

router.post("/register-fcmtoken",authenticate, controller.registerFcmToken);

router.post("/patient-response",authenticate ,controller.patientResponse);

export default router;