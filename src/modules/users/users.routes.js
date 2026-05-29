import express from "express";

import { authorize } from "../../middleware/role.js";
import { doctorAccess } from "../../middleware/doctorAccess.js";
import { validate } from "../../middleware/validation.js";
import authMiddleware from "../../middleware/auth.js";
import controller from "./users.controller.js";
import validationSchema from "./users.validation.js";

const router = express.Router();

router.use(authMiddleware.authenticate);

router.get("/me", controller.getProfile);
router.patch(
	"/me",
	validate(validationSchema.updateProfileSchema),
	controller.updateProfile,
);

router.get(
	"/patient/:id",
	authorize("doctor"),
	doctorAccess,
	validate(validationSchema.getUserByIdSchema),
	controller.getPatientById,
);

router.get(
	"/patients",
	authorize("admin"),
	validate(validationSchema.getPatientsSchema),
	controller.getPatients,
);
// WARN: This endpoint is not protected by doctorAccess middleware, so it will return all patients in the system. Use with caution.

router.get(
	"/doctor/:id",
	validate(validationSchema.getUserByIdSchema),
	controller.getDoctorById,
);

router.get(
	"/doctors",
	validate(validationSchema.getDoctorsSchema),
	controller.getDoctors,
);

export default router;
