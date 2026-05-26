import express from "express";
import controller from "./access.controller.js";
import validationSchema from "./access.validation.js";

import { authenticate } from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import { validate } from "../../middleware/validation.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post(
	"/request",
	authorize("doctor"),
	validate(validationSchema.requestAccessValidation),
	controller.requestAccess,
);

// Patient sees pending and active requests
router.get(
	"/patient/requests",
	authorize("patient"),
	controller.getPatientRequests,
);

// Patient approves/rejects
router.put(
	"/:id/respond",
	authorize("patient"),
	validate(validationSchema.respondAccessValidation),
	controller.respondAccess,
);

// Doctor sees approved patients
router.get(
	"/doctor/patients",
	authorize("doctor"),
	controller.getDoctorPatients,
);

// Patient sees approved doctors
router.get(
	"/patient/doctors",
	authorize("patient"),
	controller.getPatientDoctors,
);

// Patient removes doctor
router.delete(
	"/:id",
	authorize("patient"),
	validate(validationSchema.removeAccessValidation),
	controller.removeAccess,
);

export default router;
