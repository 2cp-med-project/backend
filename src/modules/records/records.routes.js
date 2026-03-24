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
  authorize("doctor", "patient"),
  doctorAccess,
  controller.getConsultationById,
);
// router.delete("/consultation/:consultationId", controller.deleteConsultation);

router.get(
  "/:patientId",
  authorize("doctor", "patient"),
  doctorAccess,
  controller.getConsultations,
);

export default router;
