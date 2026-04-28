import express from "express";
import controller from "./appoint.controller.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();

router.use(authenticate); 
// Patient creates appointment
router.post("/add", authenticate, controller.addAppointment);
// Doctor views appointments
router.get("/my",authenticate,controller.getMyAppointments);
export default router;