import express from "express";
import controller from "./notif.controller.js";
import service from "./notif.service.js";
const router = express.Router();

router.post("/register-token", controller.registerFcmToken);
router.post("/request-access", controller.requestAccess);
router.post("/patient-response", controller.patientResponse);

export default router;