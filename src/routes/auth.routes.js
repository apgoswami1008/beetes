const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Customer Routes
router.post('/register/customer', authController.registerCustomer);
router.post('/login/customer/send-otp', authController.sendOTP);
router.post('/login/customer/verify-otp', authController.verifyOTP);

// Admin Routes
router.post('/login/admin', authController.loginAdmin);

module.exports = router;