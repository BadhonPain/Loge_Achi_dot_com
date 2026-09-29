const db = require("../config/db");


// GET ALL SELLERS
const getAllSellers = async (req, res) => {
    try {
        const [sellers] = await db.query(`
            SELECT
                seller_id,
                seller_name,
                shop_name,
                email,
                phone,
                address,
                status,
                created_at
            FROM sellers
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: sellers.length,
            data: sellers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch sellers"
        });
    }
};


// GET ONE SELLER
const getSellerById = async (req, res) => {
    try {
        const sellerId = req.params.id;

        const [sellers] = await db.query(`
            SELECT
                seller_id,
                seller_name,
                shop_name,
                email,
                phone,
                address,
                status,
                created_at,
                updated_at
            FROM sellers
            WHERE seller_id = ?
        `, [sellerId]);

        if (sellers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        res.status(200).json({
            success: true,
            data: sellers[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch seller"
        });
    }
};


// CREATE SELLER
// Uses explicit transaction control
const createSeller = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const {
            seller_name,
            shop_name,
            email,
            phone,
            password_hash,
            address
        } = req.body;

        if (!seller_name || !shop_name || !email || !password_hash) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "seller_name, shop_name, email and password_hash are required"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(`
            INSERT INTO sellers
            (
                seller_name,
                shop_name,
                email,
                phone,
                password_hash,
                address,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            seller_name,
            shop_name,
            email,
            phone || null,
            password_hash,
            address || null
        ]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Seller created successfully",
            seller_id: result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Seller email, phone or shop name already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create seller"
        });
    } finally {
        connection.release();
    }
};


// UPDATE SELLER
// Uses explicit transaction control
const updateSeller = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const sellerId = req.params.id;

        const {
            seller_name,
            shop_name,
            phone,
            address,
            status
        } = req.body;

        await connection.beginTransaction();

        const [result] = await connection.query(`
            UPDATE sellers
            SET
                seller_name = ?,
                shop_name = ?,
                phone = ?,
                address = ?,
                status = ?
            WHERE seller_id = ?
        `, [
            seller_name,
            shop_name,
            phone || null,
            address || null,
            status,
            sellerId
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Seller updated successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update seller"
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    getAllSellers,
    getSellerById,
    createSeller,
    updateSeller
};