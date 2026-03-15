const express = require("express");
const controller = require("./users.controller");

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

module.exports = router;
