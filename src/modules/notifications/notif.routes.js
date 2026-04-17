import express from "express";
import validationSchema from "./notif.validation.js";

import authenticate from "../../middleware/auth.js";
import authorize from "../../middleware/role.js";
import controller from "./notif.controller.js";
import validate from "../../middleware/validation.js";

const router = express.Router();

router.post(
  "/register-token",
  authenticate,
  authorize("patient"),
  validate(validationSchema.registerFcmTokenValidation),
  controller.registerFcmToken,
);

export default router;
