const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer order routes
router.post('/', protect, authorize('CUSTOMER'), orderController.placeOrder);
router.get('/my', protect, authorize('CUSTOMER'), orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

// Seller order routes
router.get('/seller/me', protect, authorize('SELLER'), orderController.getSellerOrders);
router.put('/seller/:id/status', protect, authorize('SELLER'), orderController.updateSellerOrderStatus);

// Admin order routes
router.put('/:id/status', protect, authorize('ADMIN'), orderController.updateOrderStatus);

module.exports = router;
