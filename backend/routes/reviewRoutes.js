const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public: Get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Customer: Create review & get my reviews
router.post('/', protect, authorize('CUSTOMER'), reviewController.createReview);
router.get('/my', protect, authorize('CUSTOMER'), reviewController.getMyReviews);

// Admin: Hide/moderate review
router.put('/:id/hide', protect, authorize('ADMIN'), reviewController.hideReview);

module.exports = router;
