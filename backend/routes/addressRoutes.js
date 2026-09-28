const express = require("express");

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    getCustomerAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");

const enforceAddressOwnership = (req, res, next) => {
    if (req.user.role === 'CUSTOMER' && String(req.params.customerId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Not your addresses' });
    }
    next();
};

router.get("/:customerId/addresses", protect, authorize('CUSTOMER', 'ADMIN'), enforceAddressOwnership, getCustomerAddresses);

router.post("/:customerId/addresses", protect, authorize('CUSTOMER', 'ADMIN'), enforceAddressOwnership, createAddress);

router.put(
    "/:customerId/addresses/:addressId",
    protect,
    authorize('CUSTOMER', 'ADMIN'),
    enforceAddressOwnership,
    updateAddress
);

router.delete(
    "/:customerId/addresses/:addressId",
    protect,
    authorize('CUSTOMER', 'ADMIN'),
    enforceAddressOwnership,
    deleteAddress
);


module.exports = router;