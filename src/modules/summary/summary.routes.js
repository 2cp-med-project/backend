import express from "express";

import authMiddleware from "../../middleware/auth.js";
import summaryController from "./summary.controller.js";

const router = express.Router();

router.post(
	"/:consultationId",
	authMiddleware.authenticate,
	summaryController.summarize,
);

export default router;
