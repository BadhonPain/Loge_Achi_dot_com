const express = require("express");

const router = express.Router();

const {
    getAllOffers,
    getOfferById,
    createOffer,
    addProductToOffer,
    removeProductFromOffer
} = require("../controllers/offerController");


router.get("/", getAllOffers);

router.get("/:id", getOfferById);

router.post("/", createOffer);

router.post(
    "/:offerId/products",
    addProductToOffer
);

router.delete(
    "/:offerId/products/:productId",
    removeProductFromOffer
);


module.exports = router;