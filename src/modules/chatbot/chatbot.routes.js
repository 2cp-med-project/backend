import express from "express";
import chatbotController from "./chatbot.controller.js";
import { authorize } from "../../middleware/role.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("patient"));

router.get("/", chatbotController.retrieveAllChats);
router.get("/:threadId", chatbotController.retrieveChat);
router.post("/", chatbotController.startChat);
router.post("/:threadId", chatbotController.handleChat);
router.delete("/:threadId", chatbotController.deleteChat);

export default router;
