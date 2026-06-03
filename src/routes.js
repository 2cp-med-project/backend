import express from "express";

import accessRoutes from "./modules/access/access.routes.js";
import appointmentRoutes from "./modules/appointment/appoint.routes.js";
import notifRoutes from "./modules/notifications/notif.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";
import summaryRoutes from "./modules/summary/summary.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

const router = express.Router();

router.get("/", (req, res) =>
	res.status(200).json({ status: "OK", timestamp: new Date() }),
);

router.use("/access", accessRoutes);
router.use("/appointment", appointmentRoutes);
router.use("/notifications",notifRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/records", recordsRoutes);
router.use("/summary", summaryRoutes);
router.use("/users", usersRoutes);

export default router;
