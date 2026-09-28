const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public analytics (can be used on homepage)
router.get('/top-products', analyticsController.getTopSellingProducts);
router.get('/top-sellers', analyticsController.getTopSellers);

// Admin-only analytics
router.get('/categories', protect, authorize('ADMIN'), analyticsController.getCategorySalesAnalytics);
router.get('/revenue-trend', protect, authorize('ADMIN'), analyticsController.getMonthlyRevenueTrend);
router.get('/customers', protect, authorize('ADMIN'), analyticsController.getCustomerAnalytics);
router.get('/orders/:id/log', protect, authorize('ADMIN'), analyticsController.getOrderStatusLog);

// Seller dashboard stats (uses stored procedure)
router.get('/seller/dashboard', protect, authorize('SELLER'), analyticsController.getSellerDashboardStats);

module.exports = router;
