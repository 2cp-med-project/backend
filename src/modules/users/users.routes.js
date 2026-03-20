import express from "express";
import { identifyDoctor, getAllDoctors } from "./users.controller.js";

const router = express.Router();

// Patients
// router.post("/patients", controller.createPatient);
// router.get("/patients", controller.getPatients);

// // Doctors
// router.post("/doctors", controller.createDoctor);
// router.get("/doctors", controller.getDoctors);

// // Admins
// router.post("/admins", controller.createAdmin);
// router.get("/admins", controller.getAdmins);

router.post("/doctors/identify", identifyDoctor);
router.get("/doctors", getAllDoctors);

export default router;
