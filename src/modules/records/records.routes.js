import { Router } from "express";
import { createConsultation } from "./records.controller.js";

const router = Router();

router.post("/consultation/new", createConsultation);

export default router;
