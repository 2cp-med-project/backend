import express from "express";
import chatbotController from "./chatbot.controller.js";

const router = express.Router();

router.get("/:thread_id", chatbotController.retrieveChat);
router.post("/", chatbotController.startChat);
router.post("/:thread_id", chatbotController.handleChat);
router.delete("/:thread_id", chatbotController.deleteChat);

export default router;
