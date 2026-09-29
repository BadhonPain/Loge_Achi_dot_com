const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// returns response : res.json()
router.post('/register', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);

module.exports = router;
