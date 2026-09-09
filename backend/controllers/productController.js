const db = require("../config/db");

// GET ALL PRODUCTS (Public)
const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.product_id, p.seller_id, p.category_id, p.sku, p.product_name,
                p.description, p.price, p.stock_quantity, p.status, p.created_at,
                s.shop_name, c.category_name
            FROM products p
            JOIN sellers s ON p.seller_id = s.seller_id
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.status != 'ARCHIVED'
            ORDER BY p.created_at DESC
        `);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// GET PRODUCTS BY VENDOR (Role: SELLER)
const getVendorProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; // Enforced by authMiddleware
        const [products] = await db.query(`
            SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC
        `, [sellerId]);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET ONE PRODUCT (Public)
const getProductById = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, s.shop_name, c.category_name
            FROM products p
            JOIN sellers s ON p.seller_id = s.seller_id
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `, [req.params.id]);

        if (products.length === 0) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: products[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CREATE PRODUCT (Role: SELLER)
const createProduct = async (req, res) => {
    try {
        const seller_id = req.user.id; // Enforced Server-Side (Cannot spoof)
        const { category_id, sku, product_name, description, price, stock_quantity } = req.body;

        if (!category_id || !sku || !product_name || price === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const [result] = await db.query(`
            INSERT INTO products (seller_id, category_id, sku, product_name, description, price, stock_quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [seller_id, category_id, sku, product_name, description || null, price, stock_quantity || 0]);

        res.status(201).json({ success: true, message: "Product created", product_id: result.insertId });
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: "SKU already exists" });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE PRODUCT (Role: SELLER, Object-Level Ownership)
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const sellerId = req.user.id;
        const { category_id, product_name, description, price, stock_quantity, status } = req.body;

        // Object-Level Ownership Check!
        const [existing] = await db.query('SELECT seller_id FROM products WHERE product_id = ?', [productId]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
        if (existing[0].seller_id !== sellerId) return res.status(403).json({ success: false, message: "Forbidden: You do not own this product" });

        await db.query(`
            UPDATE products SET category_id = ?, product_name = ?, description = ?, price = ?, stock_quantity = ?, status = ?
            WHERE product_id = ? AND seller_id = ?
        `, [category_id, product_name, description, price, stock_quantity, status, productId, sellerId]);

        res.status(200).json({ success: true, message: "Product updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE/ARCHIVE PRODUCT (Role: SELLER, Object-Level Ownership)
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const sellerId = req.user.id;

        // Object-Level Ownership Check!
        const [existing] = await db.query('SELECT seller_id FROM products WHERE product_id = ?', [productId]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
        if (existing[0].seller_id !== sellerId) return res.status(403).json({ success: false, message: "Forbidden: You do not own this product" });

        await db.query(`UPDATE products SET status = 'ARCHIVED' WHERE product_id = ? AND seller_id = ?`, [productId, sellerId]);
        res.status(200).json({ success: true, message: "Product archived" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getAllProducts, getVendorProducts, getProductById, createProduct, updateProduct, deleteProduct };