import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accessRoutes from "./modules/access/access.routes.js";
import appointmentRoutes from "./modules/appointment/appoint.routes.js";
import notifRoutes from "./modules/notifications/notif.routes.js";
const router = express.Router();

console.log(typeof usersRoutes);
router.use("/auth", authRoutes);

router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/access", accessRoutes);
router.use("/appointment", appointmentRoutes);
router.use("/notifications",notifRoutes);
export default router;

