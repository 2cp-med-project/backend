import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accessRoutes from "./modules/access/access.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
const router = express.Router();

console.log(typeof usersRoutes);
router.use("/auth", authRoutes);

router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/access", accessRoutes);
router.use("/reviews", reviewRoutes);

export default router;
