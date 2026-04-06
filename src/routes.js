import express from "express";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";

const router = express.Router();

router.use("/chatbot", chatbotRoutes);
router.use("/chat", chatRoutes);
router.use("/users", usersRoutes);
router.use("/records", recordsRoutes);

export default router;
