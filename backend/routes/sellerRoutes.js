const express = require("express");

const router = express.Router();

const {
    getAllSellers,
    getSellerById,
    createSeller,
    updateSeller
} = require("../controllers/sellerController");


router.get("/", getAllSellers);

router.get("/:id", getSellerById);

router.post("/", createSeller);

router.put("/:id", updateSeller);


module.exports = router;