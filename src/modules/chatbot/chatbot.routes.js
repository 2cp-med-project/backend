import express from "express";
import chatbotController from "./chatbot.controller.js";
import { authorize } from "../../middleware/role.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("patient"));

router.get("/:thread_id", chatbotController.retrieveChat);
router.post("/", chatbotController.startChat);
router.post("/:thread_id", chatbotController.handleChat);
router.delete("/:thread_id", chatbotController.deleteChat);

export default router;
