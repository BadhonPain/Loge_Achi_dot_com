const express = require("express");

const router = express.Router();

const {
    getProductImages,
    addProductImage,
    setPrimaryImage,
    deleteProductImage
} = require("../controllers/imageController");


router.get("/:productId/images", getProductImages);

router.post("/:productId/images", addProductImage);

router.put(
    "/:productId/images/:imageId/primary",
    setPrimaryImage
);

router.delete(
    "/:productId/images/:imageId",
    deleteProductImage
);


module.exports = router;