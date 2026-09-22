const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Routes (SELLER Only)
router.get('/vendor/me', protect, authorize('SELLER'), productController.getVendorProducts);
router.post('/', protect, authorize('SELLER'), productController.createProduct);
router.put('/:id', protect, authorize('SELLER'), productController.updateProduct);
router.delete('/:id', protect, authorize('SELLER'), productController.deleteProduct);

module.exports = router;