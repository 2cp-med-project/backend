import express from "express";
import controller from "./users.controller.js";

const router = express.Router();

router.get("/patients", controller.getPatients);

router.get("/patient/:id", controller.getPatientById);

router.get("/doctors", controller.getDoctors);

router.get("/doctor/:id", controller.getDoctorById);

export default router;
