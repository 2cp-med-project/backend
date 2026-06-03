import express from "express";
import controller from "./appoint.controller.js";
import authMiddleware from "../../middleware/auth.js";
const router = express.Router();

router.use(authMiddleware.authenticate);
// Patient creates appointment
router.post("/add", controller.addAppointment);
// Doctor views appointments
router.get("/my", controller.getMyAppointments);
export default router;
