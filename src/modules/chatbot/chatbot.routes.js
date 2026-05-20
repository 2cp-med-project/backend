import express from "express";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import chatbotController from "./chatbot.controller.js";

const router = express.Router();

router.get("/:thread_id", chatbotController.retrieveChat);
router.post(
	"/",
	authenticate,
	authorize("patient"),
	chatbotController.startChat,
);
router.post(
	"/:thread_id",
	authenticate,
	authorize("patient"),
	chatbotController.handleChat,
);
router.delete("/:thread_id", chatbotController.deleteChat);

export default router;
