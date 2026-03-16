import express from "express";
import controller from "./users.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";

const router = express.Router();

router.use("/patients", authenticate);
router.use("/patients", authorize("admin", "doctor"));
router.get("/patients", controller.getPatients);

router.use("/patient/:id", authenticate);
router.use("/patient/:id", authorize("admin", "doctor", "patient"));
router.get("/patient/:id", controller.getPatientById);

router.use("/doctors", authenticate);
router.use("/doctors", authorize("admin", "doctor"));
router.get("/doctors", controller.getDoctors);

router.use("/doctor/:id", authenticate);
router.use("/doctor/:id", authorize("admin", "doctor", "patient"));
router.get("/doctor/:id", controller.getDoctorById);

export default router;
