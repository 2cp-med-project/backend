import express from "express";

import authorize from "../../middleware/role.js";
import authMiddleware from "../../middleware/auth.js";
import chatbotController from "./chatbot.controller.js";

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authorize("patient"));

router.get("/", chatbotController.retrieveAllChats);
router.get("/:threadId", chatbotController.retrieveChat);
router.post("/", chatbotController.startChat);
router.post("/:threadId", chatbotController.handleChat);
router.delete("/:threadId", chatbotController.deleteChat);

export default router;
