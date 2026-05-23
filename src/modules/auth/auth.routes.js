import express from "express";
import controller from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.js";
import validate from "../../middleware/validation.js";

import validationschema from "./auth.validation.js";

const router = express.Router();

router.post(
	"/signup",
	validate(validationschema.signUpValidation),
	controller.signUp,
);

router.post(
	"/login",
	validate(validationschema.logInValidation),
	controller.logIn,
);

router.post("/logout", authMiddleware.authenticate, controller.logOut);

router.post(
	"/refresh-token",
	validate(validationschema.tokenValidation),
	controller.refreshToken,
);

router.post(
	"/request-otp",
	validate(validationschema.requestOTPValidation),
	controller.requestOTP,
);

router.post(
	"/verify-otp",
	validate(validationschema.verifyOTPValidation),
	controller.verifyOTP,
);

export default router;
