import express from "express";
import controller from "./access.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";

const router = express.Router();

// Doctor sends request
router.use(authenticate);

router.use("/request", authorize("doctor"));
router.post("/request", controller.requestAccess);

// Patient sees pending requests
router.use("/patient/requests", authorize("patient"));
router.get("/patient/requests", controller.getPatientRequests);

// Patient approves/rejects
router.use("/:id/respond", authorize("patient"));
router.put("/:id/respond", controller.respondAccess);

// Doctor sees approved patients
router.use("/doctor/patients", authorize("doctor"));
router.get("/doctor/patients", controller.getDoctorPatients);

// Patient sees approved doctors
router.use("/patient/doctors", authorize("patient"));
router.get("/patient/doctors", controller.getPatientDoctors);

// Patient removes doctor
router.use("/:id", authorize("patient"));
router.delete("/:id", controller.removeDoctor);

export default router;
