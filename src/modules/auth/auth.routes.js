// /login, /register, /verify-otp

import express from 'express';
import controller from './auth.controller.js';
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post("/refresh-token", controller.refreshToken)
router.post('/verify-otp', controller.verifyOTP);

export default router;
