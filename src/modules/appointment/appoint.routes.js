import express from "express";
import controller from "./appoint.controller.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();

router.use(authenticate); 

router.post("/add", authenticate, controller.addAppointment);

router.get("/my",authenticate,controller.getMyAppointments);
export default router;