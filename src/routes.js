import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/records", recordsRoutes);
router.use("/auth", authRoutes);

export default router;
