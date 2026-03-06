import express from "express";
import * as controller from "./users.controller.js";

const router = express.Router();

// Patients
// router.post("/patients", controller.createPatient);
router.get("/patients", controller.getPatients);

// // Doctors
// router.post("/doctors", controller.createDoctor);
// router.get("/doctors", controller.getDoctors);

// // Admins
// router.post("/admins", controller.createAdmin);
// router.get("/admins", controller.getAdmins);

export default router;
