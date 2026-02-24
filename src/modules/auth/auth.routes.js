// /login, /register, /verify-otp

const express = require('express');
const controller = require('./auth.controller');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post("/refresh-token", controller.refreshToken)
router.post('/verify-otp', controller.verifyOTP);

module.exports = router;
