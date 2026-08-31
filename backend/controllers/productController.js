const db = require("../config/db");


// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.product_id,
                p.seller_id,
                p.category_id,
                p.sku,
                p.product_name,
                p.description,
                p.price,
                p.stock_quantity,
                p.status,
                p.created_at,

                s.shop_name,
                c.category_name,

                pi.image_url AS primary_image

            FROM products p

            JOIN sellers s
                ON p.seller_id = s.seller_id

            JOIN categories c
                ON p.category_id = c.category_id

            LEFT JOIN product_images pi
                ON p.product_id = pi.product_id
                AND pi.is_primary = TRUE

            WHERE p.status != 'ARCHIVED'

            ORDER BY p.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


// GET ONE PRODUCT
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

        const [products] = await db.query(`
            SELECT 
                p.*,
                s.shop_name,
                c.category_name
            FROM products p

            JOIN sellers s
                ON p.seller_id = s.seller_id

            JOIN categories c
                ON p.category_id = c.category_id

            WHERE p.product_id = ?
        `, [productId]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const [images] = await db.query(`
            SELECT
                image_id,
                image_url,
                is_primary,
                display_order,
                alt_text
            FROM product_images
            WHERE product_id = ?
            ORDER BY display_order ASC
        `, [productId]);

        const product = products[0];

        product.images = images;

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};


// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const {
            seller_id,
            category_id,
            sku,
            product_name,
            description,
            price,
            stock_quantity
        } = req.body;

        if (
            !seller_id ||
            !category_id ||
            !sku ||
            !product_name ||
            price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Required product information is missing"
            });
        }

        const [result] = await db.query(`
            INSERT INTO products
            (
                seller_id,
                category_id,
                sku,
                product_name,
                description,
                price,
                stock_quantity,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            seller_id,
            category_id,
            sku,
            product_name,
            description || null,
            price,
            stock_quantity || 0
        ]);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const {
            category_id,
            product_name,
            description,
            price,
            stock_quantity,
            status
        } = req.body;

        const [result] = await db.query(`
            UPDATE products
            SET
                category_id = ?,
                product_name = ?,
                description = ?,
                price = ?,
                stock_quantity = ?,
                status = ?
            WHERE product_id = ?
        `, [
            category_id,
            product_name,
            description,
            price,
            stock_quantity,
            status,
            productId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


// ARCHIVE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const [result] = await db.query(`
            UPDATE products
            SET status = 'ARCHIVED'
            WHERE product_id = ?
        `, [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product archived successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to archive product"
        });
    }
};


module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};