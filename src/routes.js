import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accessRoutes from "./modules/access/access.routes.js";

const router = express.Router();

console.log(typeof usersRoutes);

router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/access", accessRoutes);

export default router;
