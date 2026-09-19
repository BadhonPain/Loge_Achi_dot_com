const express = require('express');
const router = express.Router();
const { getCustomerById, updateCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:id', protect, getCustomerById);
router.put('/:id', protect, authorize('CUSTOMER', 'ADMIN'), updateCustomer);

module.exports = router;