import { Router } from "express";

import authorize from "../../middleware/role.js";
import { authenticate } from "../../middleware/auth.js";
import chatController from "./chat.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("doctor"));

router.post("/initiate", chatController.initiateChat);
router.get("/messages/:roomId", chatController.getRoomMessages);
router.delete("/:roomId", chatController.deleteChat);

export default router;
