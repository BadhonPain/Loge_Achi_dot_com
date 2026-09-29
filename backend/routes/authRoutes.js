const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const uploadProfileImage = require('../middleware/profileUpload');

// returns response : res.json()
router.post('/register', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.updatePassword);
router.post('/profile-image', protect, uploadProfileImage, authController.updateProfileImage);

module.exports = router;
