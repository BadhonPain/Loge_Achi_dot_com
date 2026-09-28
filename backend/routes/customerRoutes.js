const express = require('express');
const router = express.Router();
const { getCustomerById, updateCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const enforceCustomerOwnership = (req, res, next) => {
    if (req.user.role === 'CUSTOMER' && String(req.params.id) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not your account' });
    }
    next();
};

router.get('/:id', protect, authorize('CUSTOMER', 'ADMIN'), enforceCustomerOwnership, getCustomerById);
router.put('/:id', protect, authorize('CUSTOMER', 'ADMIN'), enforceCustomerOwnership, updateCustomer);

module.exports = router;