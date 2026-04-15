import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accessRoutes from "./modules/access/access.routes.js";

const router = express.Router();

router.use("/users/", usersRoutes);
router.use("/record/", recordsRoutes);
router.use("/auth/", authRoutes);
router.use("/access/", accessRoutes);

module.exports = router; 
