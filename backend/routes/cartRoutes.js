const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ownership middleware: customer can only access their own cart
const enforceCartOwnership = (req, res, next) => {
  if (req.user.role === 'CUSTOMER' && String(req.params.customerId) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Not your cart' });
  }
  next();
};

router.get('/:customerId', protect, authorize('CUSTOMER', 'ADMIN'), enforceCartOwnership, getCart);
router.post('/:customerId/items', protect, authorize('CUSTOMER'), enforceCartOwnership, addToCart);
router.put('/:customerId/items/:cartItemId', protect, authorize('CUSTOMER'), enforceCartOwnership, updateCartItem);
router.delete('/:customerId/items/:cartItemId', protect, authorize('CUSTOMER'), enforceCartOwnership, deleteCartItem);

module.exports = router;