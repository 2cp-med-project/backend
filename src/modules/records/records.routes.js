import express from "express";
import controller from "./records.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import doctorAccess from "../../middleware/doctorAccess.js";

const router = express.Router();

router.use(authenticate);

router.post(
	"/consultation",
	authorize("doctor"),
	doctorAccess,
	controller.createConsultation,
);

router.patch(
	"/consultation/:consultationId",
	authorize("doctor"),
	doctorAccess,
	controller.updateConsultation,
);
router.get(
	"/consultation/:consultationId",
	doctorAccess,
	controller.getConsultationById,
);
router.get("/:patientId", doctorAccess, controller.getConsultations);

export default router;
