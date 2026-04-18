import express from "express";
import controller from "./records.controller.js";
import validationschema from "./records.validation.js";

import authorize from "../../middleware/role.js";
import doctorAccess from "../../middleware/doctorAccess.js";
import authenticate from "../../middleware/auth.js";
import validate from "../../middleware/validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/consultation",
  authorize("doctor"),
  validate(validationschema.createConsultationValidation),
  doctorAccess,
  controller.createConsultation,
);

router.patch(
  "/consultation/:consultationId",
  authorize("doctor"),
  validate(validationschema.updateConsultationValidation),
  doctorAccess,
  controller.updateConsultation,
);
router.get(
  "/consultation/:consultationId",
  doctorAccess,
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
  validate(validationschema.getConsultationsValidation),
  doctorAccess,
  controller.getConsultations,
);

export default router;
