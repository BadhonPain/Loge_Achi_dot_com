const db = require("../config/db");


// =============================================
// GET ALL OFFERS
// =============================================
const getAllOffers = async (req, res) => {
    try {
        const [offers] = await db.query(`
            SELECT
                o.offer_id,
                o.seller_id,
                o.offer_name,
                o.discount_type,
                o.discount_value,
                o.start_at,
                o.end_at,
                o.status,
                o.created_at,

                s.shop_name

            FROM offers o

            JOIN sellers s
                ON o.seller_id = s.seller_id

            ORDER BY o.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch offers"
        });
    }
};


// =============================================
// GET ONE OFFER
// =============================================
const getOfferById = async (req, res) => {
    try {
        const offerId = req.params.id;

        const [offers] = await db.query(`
            SELECT
                o.*,
                s.shop_name

            FROM offers o

            JOIN sellers s
                ON o.seller_id = s.seller_id

            WHERE o.offer_id = ?
        `, [offerId]);

        if (offers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Offer not found"
            });
        }

        const [products] = await db.query(`
            SELECT
                p.product_id,
                p.product_name,
                p.price,
                p.stock_quantity

            FROM offer_products op

            JOIN products p
                ON op.product_id = p.product_id

            WHERE op.offer_id = ?
        `, [offerId]);

        const offer = offers[0];

        offer.products = products;

        res.status(200).json({
            success: true,
            data: offer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch offer"
        });
    }
};


// =============================================
// CREATE OFFER
// =============================================
const createOffer = async (req, res) => {
    try {
        const {
            seller_id,
            offer_name,
            discount_type,
            discount_value,
            start_at,
            end_at
        } = req.body;

        if (
            !seller_id ||
            !offer_name ||
            !discount_type ||
            discount_value === undefined ||
            !start_at ||
            !end_at
        ) {
            return res.status(400).json({
                success: false,
                message: "Required offer information is missing"
            });
        }

        const [result] = await db.query(`
            INSERT INTO offers
            (
                seller_id,
                offer_name,
                discount_type,
                discount_value,
                start_at,
                end_at,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            seller_id,
            offer_name,
            discount_type,
            discount_value,
            start_at,
            end_at
        ]);

        res.status(201).json({
            success: true,
            message: "Offer created successfully",
            offer_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create offer"
        });
    }
};


// =============================================
// ADD PRODUCT TO OFFER
// =============================================
const addProductToOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;

        const {
            product_id
        } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: "product_id is required"
            });
        }

        // Get offer seller
        const [offers] = await db.query(`
            SELECT seller_id
            FROM offers
            WHERE offer_id = ?
        `, [offerId]);

        if (offers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Offer not found"
            });
        }

        // Get product seller
        const [products] = await db.query(`
            SELECT seller_id
            FROM products
            WHERE product_id = ?
        `, [product_id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Important marketplace rule
        if (
            offers[0].seller_id !==
            products[0].seller_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Offer can only be applied to products owned by the same seller"
            });
        }

        await db.query(`
            INSERT INTO offer_products
            (
                offer_id,
                product_id
            )
            VALUES (?, ?)
        `, [
            offerId,
            product_id
        ]);

        res.status(201).json({
            success: true,
            message: "Product added to offer successfully"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Product already belongs to this offer"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to add product to offer"
        });
    }
};


// =============================================
// REMOVE PRODUCT FROM OFFER
// =============================================
const removeProductFromOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const productId = req.params.productId;

        const [result] = await db.query(`
            DELETE FROM offer_products
            WHERE offer_id = ?
              AND product_id = ?
        `, [
            offerId,
            productId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Offer-product relationship not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product removed from offer successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove product from offer"
        });
    }
};


module.exports = {
    getAllOffers,
    getOfferById,
    createOffer,
    addProductToOffer,
    removeProductFromOffer
};