import express from "express";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";

const router = express.Router();

router.use("/chat", chatbotRoutes);

export default router;
