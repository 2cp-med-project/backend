import express from "express";
import * as controller from "./users.controller.js";

const router = express.Router();

// Patients
router.get("/patients", controller.getPatients);
router.get("/doctors", controller.getDoctors);

export default router;
