const db = require("../config/db");


// GET CUSTOMER ADDRESSES
const getCustomerAddresses = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        const [addresses] = await db.query(`
            SELECT *
            FROM customer_addresses
            WHERE customer_id = ?
            ORDER BY is_default DESC, created_at DESC
        `, [customerId]);

        res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
};


// CREATE ADDRESS
const createAddress = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const customerId = req.params.customerId;

        const {
            label,
            recipient_name,
            phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            country,
            is_default
        } = req.body;

        if (!recipient_name || !phone || !address_line1 || !city) {
            connection.release();

            return res.status(400).json({
                success: false,
                message:
                    "recipient_name, phone, address_line1 and city are required"
            });
        }

        await connection.beginTransaction();

        if (is_default === true) {
            await connection.query(`
                UPDATE customer_addresses
                SET is_default = FALSE
                WHERE customer_id = ?
            `, [customerId]);
        }

        const [result] = await connection.query(`
            INSERT INTO customer_addresses
            (
                customer_id,
                label,
                recipient_name,
                phone,
                address_line1,
                address_line2,
                city,
                postal_code,
                country,
                is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customerId,
            label || null,
            recipient_name,
            phone,
            address_line1,
            address_line2 || null,
            city,
            postal_code || null,
            country || "Bangladesh",
            is_default === true
        ]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Address created successfully",
            address_id: result.insertId
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create address"
        });

    } finally {
        connection.release();
    }
};


// UPDATE ADDRESS
const updateAddress = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const customerId = req.params.customerId;
        const addressId = req.params.addressId;

        const {
            label,
            recipient_name,
            phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            country,
            is_default
        } = req.body;

        await connection.beginTransaction();

        if (is_default === true) {
            await connection.query(`
                UPDATE customer_addresses
                SET is_default = FALSE
                WHERE customer_id = ?
            `, [customerId]);
        }

        const [result] = await connection.query(`
            UPDATE customer_addresses
            SET
                label = ?,
                recipient_name = ?,
                phone = ?,
                address_line1 = ?,
                address_line2 = ?,
                city = ?,
                postal_code = ?,
                country = ?,
                is_default = ?
            WHERE address_id = ?
              AND customer_id = ?
        `, [
            label || null,
            recipient_name,
            phone,
            address_line1,
            address_line2 || null,
            city,
            postal_code || null,
            country || "Bangladesh",
            is_default === true,
            addressId,
            customerId
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Address updated successfully"
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update address"
        });

    } finally {
        connection.release();
    }
};


// DELETE ADDRESS
// Uses explicit transaction control
const deleteAddress = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const customerId = req.params.customerId;
        const addressId = req.params.addressId;

        await connection.beginTransaction();

        const [result] = await connection.query(`
            DELETE FROM customer_addresses
            WHERE address_id = ?
              AND customer_id = ?
        `, [addressId, customerId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    getCustomerAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};