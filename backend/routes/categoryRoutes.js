const express = require("express");

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory
} = require("../controllers/categoryController");


router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.post("/", protect, authorize('ADMIN'), createCategory);

router.put("/:id", protect, authorize('ADMIN'), updateCategory);


module.exports = router;