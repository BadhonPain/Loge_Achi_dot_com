const db = require("../config/db");

// GET ALL PRODUCTS (Public, supports optional ?seller_id= and ?category_id= filters)
const getAllProducts = async (req, res) => {
    try {
        const { seller_id, category_id } = req.query;
        let query = `
            SELECT 
                p.product_id, p.product_id AS id, p.seller_id, p.category_id, p.sku, 
                p.product_name, p.product_name AS title,
                p.description, p.price, p.stock_quantity, p.stock_quantity AS stock, 
                p.status, p.created_at,
                s.shop_name, s.seller_name, c.category_name, c.category_name AS category,
                COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop') AS image,
                COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop') AS primary_image,
                COALESCE(fn_product_avg_rating(p.product_id), 5.0) AS rating,
                (
                    SELECT COUNT(*) 
                    FROM reviews r 
                    JOIN order_items oi ON r.order_item_id = oi.order_item_id 
                    WHERE oi.product_id = p.product_id AND r.review_status = 'PUBLISHED'
                ) AS reviews
            FROM products p
            JOIN sellers s ON p.seller_id = s.seller_id
            JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
            WHERE p.status != 'ARCHIVED'
        `;
        const params = [];

        if (seller_id) {
            query += ' AND p.seller_id = ?';
            params.push(seller_id);
        }
        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await db.query(query, params);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Get All Products Error:', error);
        res.status(500).json({ success: false, message: "Failed to fetch products: " + error.message });
    }
};

// GET PRODUCTS BY VENDOR (Role: SELLER)
const getVendorProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; // Enforced by authMiddleware
        const [products] = await db.query(`
            SELECT 
                p.product_id, p.product_id AS id, p.seller_id, p.category_id, p.sku, 
                p.product_name, p.product_name AS title,
                p.description, p.price, p.stock_quantity, p.stock_quantity AS stock, 
                p.status, p.created_at,
                c.category_name,
                COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop') AS image,
                COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop') AS primary_image
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
            WHERE p.seller_id = ? AND p.status != 'ARCHIVED'
            ORDER BY p.created_at DESC
        `, [sellerId]);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Get Vendor Products Error:', error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

// GET ONE PRODUCT (Public)
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const [products] = await db.query(`
            SELECT 
                p.*, p.product_id AS id, p.product_name AS title, p.stock_quantity AS stock,
                s.shop_name, s.seller_name, s.email AS seller_email, s.phone AS seller_phone,
                c.category_name, c.category_name AS category,
                COALESCE(fn_product_avg_rating(p.product_id), 5.0) AS rating,
                (
                    SELECT COUNT(*) 
                    FROM reviews r 
                    JOIN order_items oi ON r.order_item_id = oi.order_item_id 
                    WHERE oi.product_id = p.product_id AND r.review_status = 'PUBLISHED'
                ) AS reviews
            FROM products p
            JOIN sellers s ON p.seller_id = s.seller_id
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `, [productId]);

        if (products.length === 0) return res.status(404).json({ success: false, message: "Product not found" });

        const product = products[0];

        // Fetch all product images
        const [images] = await db.query(`
            SELECT image_url, is_primary, display_order, alt_text
            FROM product_images
            WHERE product_id = ?
            ORDER BY is_primary DESC, display_order ASC
        `, [productId]);

        const imageUrls = images.length > 0 
            ? images.map(img => img.image_url) 
            : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'];

        // Build composite response compatible with frontend
        const fullProduct = {
            ...product,
            images: imageUrls,
            image: imageUrls[0],
            primary_image: imageUrls[0],
            seller: {
                id: product.seller_id,
                name: product.shop_name || product.seller_name,
                rating: '4.9',
                products: 24,
                joined: '2024',
            },
            features: [
                '100% Genuine and authentic from official vendor',
                'Comprehensive manufacturer warranty included',
                'Fast doorstep delivery across Bangladesh',
                '7-day hassle-free replacement guarantee'
            ],
            colors: ['Default', 'Space Gray', 'Classic Black'],
            sold: 45
        };

        res.status(200).json({ success: true, data: fullProduct });
    } catch (error) {
        console.error('Get Product By ID Error:', error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

// CREATE PRODUCT (Role: SELLER)
// Uses explicit transaction control
const createProduct = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const seller_id = req.user.id; // Enforced Server-Side
        let { category_id, sku, product_name, description, price, stock_quantity, image_url } = req.body;

        // Auto-generate SKU if omitted
        if (!sku || sku.trim() === '') {
            sku = `SKU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        }

        if (!category_id || !product_name || price === undefined || price === null || price === '') {
            connection.release();
            return res.status(400).json({ success: false, message: "Category, Product Name, and Price are required" });
        }

        const numericCategoryId = parseInt(category_id, 10);
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stock_quantity, 10) || 0;

        if (isNaN(numericCategoryId) || numericCategoryId <= 0) {
            connection.release();
            return res.status(400).json({ success: false, message: "Please select a valid Category" });
        }

        if (isNaN(numericPrice) || numericPrice < 0) {
            connection.release();
            return res.status(400).json({ success: false, message: "Price must be a valid positive number" });
        }

        await connection.beginTransaction();

        // 1. Insert product
        const [result] = await connection.query(`
            INSERT INTO products (seller_id, category_id, sku, product_name, description, price, stock_quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [seller_id, numericCategoryId, sku.trim(), product_name.trim(), description ? description.trim() : null, numericPrice, numericStock]);

        const newProductId = result.insertId;

        // 2. Insert primary image into product_images
        const finalImageUrl = (image_url && image_url.trim()) 
            ? image_url.trim() 
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';

        await connection.query(`
            INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
            VALUES (?, ?, 1, 1, ?)
        `, [newProductId, finalImageUrl, product_name.trim()]);

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            message: "Product created successfully and published to store!", 
            product_id: newProductId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create Product Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "A product with this SKU already exists in your inventory. Please use a unique SKU." });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ success: false, message: "Selected category or seller was not found in the database." });
        }
        res.status(500).json({ success: false, message: "Error creating product: " + (error.sqlMessage || error.message) });
    } finally {
        connection.release();
    }
};

// UPDATE PRODUCT (Role: SELLER, Object-Level Ownership)
// Uses explicit transaction control
const updateProduct = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const productId = req.params.id;
        const sellerId = req.user.id;
        const { category_id, product_name, description, price, stock_quantity, status, image_url } = req.body;

        await connection.beginTransaction();

        // Object-Level Ownership Check!
        const [existing] = await connection.query('SELECT seller_id FROM products WHERE product_id = ?', [productId]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (existing[0].seller_id !== sellerId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: "Forbidden: You do not own this product" });
        }

        const numericCategoryId = parseInt(category_id, 10);
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stock_quantity, 10) || 0;

        await connection.query(`
            UPDATE products 
            SET category_id = ?, product_name = ?, description = ?, price = ?, stock_quantity = ?, status = ?
            WHERE product_id = ? AND seller_id = ?
        `, [numericCategoryId, product_name, description, numericPrice, numericStock, status || 'ACTIVE', productId, sellerId]);

        // If image_url provided, update or insert primary image
        if (image_url && image_url.trim()) {
            const [imgExisting] = await connection.query(
                'SELECT image_id FROM product_images WHERE product_id = ? AND is_primary = 1',
                [productId]
            );
            if (imgExisting.length > 0) {
                await connection.query(
                    'UPDATE product_images SET image_url = ?, alt_text = ? WHERE image_id = ?',
                    [image_url.trim(), product_name, imgExisting[0].image_id]
                );
            } else {
                await connection.query(
                    'INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text) VALUES (?, ?, 1, 1, ?)',
                    [productId, image_url.trim(), product_name]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        await connection.rollback();
        console.error('Update Product Error:', error);
        res.status(500).json({ success: false, message: "Error updating product: " + (error.sqlMessage || error.message) });
    } finally {
        connection.release();
    }
};

// DELETE/ARCHIVE PRODUCT (Role: SELLER, Object-Level Ownership)
// Uses explicit transaction control
const deleteProduct = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const productId = req.params.id;
        const sellerId = req.user.id;

        await connection.beginTransaction();

        // Object-Level Ownership Check!
        const [existing] = await connection.query('SELECT seller_id FROM products WHERE product_id = ?', [productId]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (existing[0].seller_id !== sellerId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: "Forbidden: You do not own this product" });
        }

        await connection.query(`UPDATE products SET status = 'ARCHIVED' WHERE product_id = ? AND seller_id = ?`, [productId, sellerId]);
        await connection.commit();
        res.status(200).json({ success: true, message: "Product archived" });
    } catch (error) {
        await connection.rollback();
        console.error('Delete Product Error:', error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    } finally {
        connection.release();
    }
};

module.exports = { getAllProducts, getVendorProducts, getProductById, createProduct, updateProduct, deleteProduct };