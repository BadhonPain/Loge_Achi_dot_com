const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login customer & get token
// @access  Public
router.post('/login', authController.login);

module.exports = router;
