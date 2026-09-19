const express = require('express');
const router = express.Router();
const { getAllSellers, getSellerById, updateSeller } = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllSellers);
router.get('/:id', getSellerById);
router.put('/:id', protect, authorize('SELLER', 'ADMIN'), updateSeller);

module.exports = router;