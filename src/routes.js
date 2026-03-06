import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";



const router = express.Router();

router.use("/users", usersRoutes);
router.use("/records", recordsRoutes);

export default router;
