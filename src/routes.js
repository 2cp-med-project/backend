import express from "express";
import usersRoutes from "./modules/users/users.routes.js";

const router = express.Router();

console.log(typeof usersRoutes);

router.use("/users", usersRoutes);

export default router;
