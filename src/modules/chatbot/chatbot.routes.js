import express from "express";
import authorize from "../../middleware/role.js";
import authMiddleware from "../../middleware/auth.js";
import chatbotController from "./chatbot.controller.js";

const router = express.Router();

router.use(authMiddleware.authenticate);

router.get("/:thread_id", authorize("patient"), chatbotController.retrieveChat);
router.post("/", authorize("patient"), chatbotController.startChat);
router.post("/:thread_id", authorize("patient"), chatbotController.handleChat);
router.delete(
	"/:thread_id",
	authorize("patient"),
	chatbotController.deleteChat,
);

export default router;
