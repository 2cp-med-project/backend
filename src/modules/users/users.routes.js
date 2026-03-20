import express from "express";
import controller from "./users.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";

const router = express.Router();

router.use("/me", authenticate);
router.get("/me", controller.getProfile);
router.patch("/me", controller.updateProfile);

router.use("/patient/:id", authenticate);
router.use("/patient/:id", authorize("doctor"));
router.get("/patient/:id", controller.getPatientById);

router.use("/patients", authenticate);
router.use("/patients", authorize("doctor"));
router.get("/patients", controller.getPatients);

router.use("/doctor/:id", authenticate);
router.get("/doctor/:id", controller.getDoctorById);

router.use("/doctors", authenticate);
router.get("/doctors", controller.getDoctors);

export default router;
