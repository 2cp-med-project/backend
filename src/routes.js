 const express = require("express");
const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");
/* const accessRoutes = require("./modules/access/access.routes"); 
 */

const router = express.Router();

console.log(typeof usersRoutes);

router.use("/users", usersRoutes);


/* router.use("/access", accessRoutes); 
 */
module.exports = router; 
