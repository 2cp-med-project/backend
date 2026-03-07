// /login, /register, /verify-otp

import express from 'express';
import controller from './auth.controller.js';
import authMiddleware from '../../middleware/auth.js';
const router = express.Router();

router.post('/signin', controller.signin);

router.post('/login', controller.login);

router.use('/logout', authMiddleware);
router.post('/logout', controller.logout);

router.post("/refresh-token", controller.refreshToken)

router.post('/verify-otp', controller.verifyOTP);

export default router;
