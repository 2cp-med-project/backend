import express from "express";
import {
	retrieveChat,
	startChat,
	handleChat,
	deleteChat,
} from "./chatbot.controller.js";

const router = express.Router();

router.get("/:thread_id", retrieveChat);
router.post("/", startChat);
router.post("/:thread_id", handleChat);
router.delete("/:thread_id", deleteChat);

export default router;
