<<<<<<< HEAD
 const express = require("express");
const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");
/* const accessRoutes = require("./modules/access/access.routes"); 
 */
=======
import express from "express";
import usersRoutes from "./modules/users/users.routes.js";
>>>>>>> bc411fc (refactor: convert project to ES modules)

const router = express.Router();

console.log(typeof usersRoutes);

router.use("/users", usersRoutes);

<<<<<<< HEAD

/* router.use("/access", accessRoutes); 
 */
module.exports = router; 
=======
export default router;
>>>>>>> bc411fc (refactor: convert project to ES modules)
