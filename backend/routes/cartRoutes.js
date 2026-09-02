const express = require("express");

const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem
} = require("../controllers/cartController");


router.get("/:customerId", getCart);

router.post("/:customerId/items", addToCart);

router.put(
    "/:customerId/items/:cartItemId",
    updateCartItem
);

router.delete(
    "/:customerId/items/:cartItemId",
    deleteCartItem
);


module.exports = router;