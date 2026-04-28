import express from "express";
import controller from "./notif.controller.js";
import service from "./notif.service.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();
router.use(authenticate); 
// FCM token registration
router.post("/register-fcmtoken",authenticate, controller.registerFcmToken);
// Patient response to doctor access request
router.post("/patient-response",authenticate ,controller.patientResponse);

export default router;