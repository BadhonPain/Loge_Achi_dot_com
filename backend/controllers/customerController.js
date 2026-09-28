const db = require("../config/db");


// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(`
            SELECT
                customer_id,
                name,
                email,
                phone,
                date_of_birth,
                account_status,
                created_at
            FROM customers
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};


// GET ONE CUSTOMER
const getCustomerById = async (req, res) => {
    try {
        const customerId = req.params.id;

        const [customers] = await db.query(`
            SELECT
                customer_id,
                name,
                email,
                phone,
                date_of_birth,
                account_status,
                created_at,
                updated_at
            FROM customers
            WHERE customer_id = ?
        `, [customerId]);

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.status(200).json({
            success: true,
            data: customers[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};


// CREATE CUSTOMER
const createCustomer = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            name,
            email,
            phone,
            password_hash,
            date_of_birth
        } = req.body;

        if (!name || !email || !password_hash) {
            connection.release();

            return res.status(400).json({
                success: false,
                message: "name, email and password_hash are required"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(`
            INSERT INTO customers
            (
                name,
                email,
                phone,
                password_hash,
                date_of_birth,
                account_status
            )
            VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            name,
            email,
            phone || null,
            password_hash,
            date_of_birth || null
        ]);

        const customerId = result.insertId;

        await connection.query(`
            INSERT INTO carts (customer_id)
            VALUES (?)
        `, [customerId]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer_id: customerId
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Customer email or phone already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create customer"
        });

    } finally {
        connection.release();
    }
};


// UPDATE CUSTOMER
// Uses explicit transaction control
const updateCustomer = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const customerId = req.params.id;

        const {
            name,
            phone,
            date_of_birth,
            account_status
        } = req.body;

        await connection.beginTransaction();

        const [result] = await connection.query(`
            UPDATE customers
            SET
                name = ?,
                phone = ?,
                date_of_birth = ?,
                account_status = ?
            WHERE customer_id = ?
        `, [
            name,
            phone || null,
            date_of_birth || null,
            account_status,
            customerId
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Customer updated successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update customer"
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer
};