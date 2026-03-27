import express from "express";
import controller from "./users.controller.js";
import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import doctorAccess from "../../middleware/doctorAccess.js";

const router = express.Router();

router.use("/me", authenticate);
router.get("/me", controller.getProfile);
router.patch("/me", controller.updateProfile);

router.get(
  "/patient/:id",
  authenticate,
  authorize("doctor"),
  doctorAccess,
  controller.getPatientById,
);

// router.get(
//   "/patients",
//   authenticate,
//   authorize("doctor"),
//   controller.getPatients,
// );
// WARN: This endpoint is not protected by doctorAccess middleware, so it will return all patients in the system. Use with caution.

router.get("/doctor/:id", authenticate, controller.getDoctorById);

router.get("/doctors", authenticate, controller.getDoctors);

export default router;
