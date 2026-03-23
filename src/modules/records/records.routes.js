import express from "express";
import controller from "./records.controller.js";
import athenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import doctorAccess from "../../middleware/doctorAccess.js";

const router = express.Router();

router.use(":patientId/consultation", athenticate);
router.use(":patientId/consultation", authorize("doctor"));
router.use(":patientId/consultation", doctorAccess);
router.post(":patientId/consultation", controller.createConsultation);

router.use("/:patientId/consultation/:id", athenticate);
router.use("/:patientId/consultation/:id", authorize("doctor"));
router.use("/:patientId/consultation/:id", doctorAccess);
router.patch("/:patientId/consultation/:id", controller.updateConsultation);
router.get("/:patientId/consultation/:id", controller.getConsultationById);
// router.delete("/:patientId/consultation/:id", controller.deleteConsultation);

router.use("/:patientId", athenticate);
router.use("/:patientId", authorize("doctor"));
router.use("/:patientId", doctorAccess);
router.get("/:patientId", controller.getConsultations);

export default router;
