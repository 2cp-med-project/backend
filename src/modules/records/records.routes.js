import express from "express";
import controller from "./records.controller.js";
import validationschema from "./records.validation.js";

import authorize from "../../middleware/role.js";
import { authenticate } from "../../middleware/auth.js";
import doctorAccess from "../../middleware/doctorAccess.js";
import { validate } from "../../middleware/validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
	"/consultation",
	authorize("doctor"),
	doctorAccess,
	validate(validationschema.createConsultationValidation),
	controller.createConsultation,
);

router.patch(
	"/consultation/:consultationId",
	authorize("doctor"),
	doctorAccess,
	validate(validationschema.updateConsultationValidation),
	controller.updateConsultation,
);

router.get(
	"/consultation/:consultationId",
	doctorAccess,
	validate(validationschema.getConsultationByIdValidation),
	controller.getConsultationById,
);

// router.delete(
//   "/consultation/:consultationId",
//   authorize("doctor"),
//   validate(validationschema.deleteConsultationValidation),
//   doctorAccess,
//   controller.deleteConsultation,
// );

router.get(
	"/:patientId",
	doctorAccess,
	validate(validationschema.getConsultationsValidation),
	controller.getConsultations,
);

export default router;
