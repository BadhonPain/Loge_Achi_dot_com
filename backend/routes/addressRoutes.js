const express = require("express");

const router = express.Router();

const {
    getCustomerAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");


router.get("/:customerId/addresses", getCustomerAddresses);

router.post("/:customerId/addresses", createAddress);

router.put(
    "/:customerId/addresses/:addressId",
    updateAddress
);

router.delete(
    "/:customerId/addresses/:addressId",
    deleteAddress
);


module.exports = router;