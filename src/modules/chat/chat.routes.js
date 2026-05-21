import { Router } from "express";

import roomController from "./room.controller.js";

const router = Router();

router.post("/initiate", roomController.initiateChat);

router.post("/join", roomController.joinRoom);
router.post("/message", roomController.sendMessage);
router.get("/messages/:roomId", roomController.getRoomMessages);

export default router;
