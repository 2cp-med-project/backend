 const express = require("express");
const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");

const router = express.Router();

console.log(typeof usersRoutes);

router.use("/users", usersRoutes);

module.exports = router; 
