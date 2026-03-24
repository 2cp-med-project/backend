import express from "express";
import controller from "./appoint.controller.js";
import authenticate from "../../middleware/auth.js";
const router = express.Router();

router.use(authenticate); 

router.post("/add", controller.addAppointment);
router.put("/update/:id", controller.updateAppointment);
router.delete("/delete/:id",controller.deleteAppointment);
router.get("/my",controller.getMyAppointments);
export default router;