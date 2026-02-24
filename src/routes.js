import express from "express";
import usersRoutes from "./modules/users/users.routes.js";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/auth", authRoutes);

export default router;
