import express from "express";
import summaryController from "./summary.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

router.post("/:consultationId", authenticate, summaryController.summarize);

export default router;
