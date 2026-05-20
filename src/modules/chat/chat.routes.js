import { Router } from "express";
import {
  getRoomMessages,
  joinRoom,
  sendMessage,
  initiateChat,
} from "./room.controller.js";

const router = Router();

router.post("/initiate", initiateChat);

router.post("/join", joinRoom);
router.post("/message", sendMessage);
router.get("/messages/:roomId", getRoomMessages);

export default router;
