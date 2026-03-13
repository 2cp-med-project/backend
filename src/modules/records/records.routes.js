import express from "express";
const router = express.Router();
import controller from "./records.controller.js";

router.post("/consultation", controller.createConsultation);
router.patch("/consultation/:id", controller.updateConsultation);
router.delete("/consultation/:id", controller.deleteConsultation);
router.get("/consultation/:id", controller.getConsultationById);
router.get("/record/:patientId", controller.getConsultations);

export default router;
