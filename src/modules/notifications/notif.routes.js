import express from "express";
import controller from "./notif.controller.js";
import service from "./notif.service.js";
import authMiddleware from "../../middleware/auth.js";
const router = express.Router();
router.use(authMiddleware.authenticate);
// FCM token registration
router.post("/register-fcmtoken", controller.registerFcmToken);
export default router;
