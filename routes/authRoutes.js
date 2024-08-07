const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.route('/login')
    .post(authController.login)

router.route('/register')
    .post(authController.register)

router.route('/verify')
    .post(authController.verifyCode)

router.route('/forgot-password')
    .post(authController.forgotPassword)

router.route('/reset-password')
    .post(authController.resetPassword)

router.route('/refresh')
    .get(authController.refreshToken)

router.route('/logout')
    .post(authController.logout)

module.exports = router;