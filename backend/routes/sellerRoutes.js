const express = require('express');
const router = express.Router();
const { getAllSellers, getSellerById, updateSeller } = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const enforceSellerOwnership = (req, res, next) => {
    if (req.user.role === 'SELLER' && String(req.params.id) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not your seller profile' });
    }
    next();
};

router.get('/', getAllSellers);
router.get('/:id', getSellerById);
router.put('/:id', protect, authorize('SELLER', 'ADMIN'), enforceSellerOwnership, updateSeller);

module.exports = router;