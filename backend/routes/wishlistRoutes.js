const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All wishlist routes require CUSTOMER role
router.get('/', protect, authorize('CUSTOMER'), wishlistController.getWishlist);
router.post('/', protect, authorize('CUSTOMER'), wishlistController.addToWishlist);
router.delete('/:productId', protect, authorize('CUSTOMER'), wishlistController.removeFromWishlist);

module.exports = router;
