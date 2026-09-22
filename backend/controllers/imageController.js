const db = require("../config/db");


// =============================================
// GET PRODUCT IMAGES
// =============================================
const getProductImages = async (req, res) => {
    try {
        const productId = req.params.productId;

        const [images] = await db.query(`
            SELECT
                image_id,
                product_id,
                image_url,
                is_primary,
                display_order,
                alt_text,
                created_at
            FROM product_images
            WHERE product_id = ?
            ORDER BY display_order ASC
        `, [productId]);

        res.status(200).json({
            success: true,
            count: images.length,
            data: images
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product images"
        });
    }
};


// =============================================
// ADD PRODUCT IMAGE
// =============================================
const addProductImage = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const productId = req.params.productId;

        const {
            image_url,
            is_primary,
            display_order,
            alt_text
        } = req.body;

        if (!image_url) {
            return res.status(400).json({
                success: false,
                message: "image_url is required"
            });
        }

        await connection.beginTransaction();

        // Check product
        const [products] = await connection.query(`
            SELECT product_id
            FROM products
            WHERE product_id = ?
        `, [productId]);

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // If this new image is primary,
        // remove primary status from old images
        if (is_primary === true) {
            await connection.query(`
                UPDATE product_images
                SET is_primary = FALSE
                WHERE product_id = ?
            `, [productId]);
        }

        const [result] = await connection.query(`
            INSERT INTO product_images
            (
                product_id,
                image_url,
                is_primary,
                display_order,
                alt_text
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            productId,
            image_url,
            is_primary === true,
            display_order || 1,
            alt_text || null
        ]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Product image added successfully",
            image_id: result.insertId
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add product image"
        });

    } finally {
        connection.release();
    }
};


// =============================================
// SET PRIMARY IMAGE
// =============================================
const setPrimaryImage = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const productId = req.params.productId;
        const imageId = req.params.imageId;

        await connection.beginTransaction();

        const [images] = await connection.query(`
            SELECT image_id
            FROM product_images
            WHERE image_id = ?
              AND product_id = ?
        `, [imageId, productId]);

        if (images.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        await connection.query(`
            UPDATE product_images
            SET is_primary = FALSE
            WHERE product_id = ?
        `, [productId]);

        await connection.query(`
            UPDATE product_images
            SET is_primary = TRUE
            WHERE image_id = ?
        `, [imageId]);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Primary image updated successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update primary image"
        });

    } finally {
        connection.release();
    }
};


// =============================================
// DELETE PRODUCT IMAGE
// =============================================
const deleteProductImage = async (req, res) => {
    try {
        const productId = req.params.productId;
        const imageId = req.params.imageId;

        const [result] = await db.query(`
            DELETE FROM product_images
            WHERE image_id = ?
              AND product_id = ?
        `, [imageId, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product image deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product image"
        });
    }
};


module.exports = {
    getProductImages,
    addProductImage,
    setPrimaryImage,
    deleteProductImage
};