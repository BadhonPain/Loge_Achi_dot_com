const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const vendorApplicationController = require('../controllers/vendorApplicationController');

// Every route here requires ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/customers', adminController.getAllCustomers);
router.get('/sellers', adminController.getAllSellers);
router.get('/vendor-applications', vendorApplicationController.listApplications);
router.put('/vendor-applications/:id/review', vendorApplicationController.reviewApplication);
router.get('/orders', adminController.getAllOrders);
router.put('/sellers/:id/status', adminController.updateSellerStatus);
router.put('/customers/:id/status', adminController.updateCustomerStatus);
router.delete('/products/:id', adminController.archiveProduct);

module.exports = router;
