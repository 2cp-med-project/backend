import express from "express";
import controller from "./notif.controller.js";
import { authenticate } from "../../middleware/auth.js";
const router = express.Router();

router.post("/register-token", authenticate, controller.registerFcmToken);
router.post("/request-access", authenticate ,controller.requestAccess);
router.post("/patient-response", authenticate, controller.patientResponse);

export default router;