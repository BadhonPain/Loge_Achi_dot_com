const express = require("express");

const router = express.Router();

const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer
} = require("../controllers/customerController");


router.get("/", getAllCustomers);

router.get("/:id", getCustomerById);

router.post("/", createCustomer);

router.put("/:id", updateCustomer);


module.exports = router;