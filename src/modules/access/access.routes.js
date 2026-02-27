import express from "express";
import {
  requestAccess,
  getPatientRequests,
  respondAccess,
  getDoctorPatients,
  getPatientDoctors,
  removeDoctor,
} from "./access.controller.js";

/* import { protect } from "../../middleware/auth.js";                 //authorization middleware
 */import { authorize } from "../../middleware/role.js";

const router = express.Router();

// Doctor sends request
router.post(
  "/request",
  protect,
  authorize("doctor"),
  requestAccess
);

// Patient sees pending requests
router.get(
  "/patient/requests",
  protect,
  authorize("patient"),
  getPatientRequests
);

// Patient approves/rejects
router.put(
  "/:id/respond",
  protect,
  authorize("patient"),
  respondAccess
);

// Doctor sees approved patients
router.get(
  "/doctor/patients",
  protect,
  authorize("doctor"),
  getDoctorPatients
);

// Patient sees approved doctors
router.get(
  "/patient/doctors",
  protect,
  authorize("patient"),
  getPatientDoctors
);

// Patient removes doctor
router.delete(
  "/:id",
  protect,
  authorize("patient"),
  removeDoctor
);

export default router;