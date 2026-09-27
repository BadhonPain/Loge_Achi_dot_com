const db = require("../config/db");


// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT
                category_id,
                parent_category_id,
                category_name,
                description,
                status,
                created_at
            FROM categories
            ORDER BY category_name ASC
        `);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};


// GET ONE CATEGORY
const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [categories] = await db.query(`
            SELECT *
            FROM categories
            WHERE category_id = ?
        `, [categoryId]);

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            data: categories[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch category"
        });
    }
};


// CREATE CATEGORY
// Uses explicit transaction control
const createCategory = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const {
            parent_category_id,
            category_name,
            description
        } = req.body;

        if (!category_name) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "category_name is required"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(`
            INSERT INTO categories
            (
                parent_category_id,
                category_name,
                description,
                status
            )
            VALUES (?, ?, ?, 'ACTIVE')
        `, [
            parent_category_id || null,
            category_name,
            description || null
        ]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category_id: result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    } finally {
        connection.release();
    }
};


// UPDATE CATEGORY
// Uses explicit transaction control
const updateCategory = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const categoryId = req.params.id;

        const {
            parent_category_id,
            category_name,
            description,
            status
        } = req.body;

        await connection.beginTransaction();

        const [result] = await connection.query(`
            UPDATE categories
            SET
                parent_category_id = ?,
                category_name = ?,
                description = ?,
                status = ?
            WHERE category_id = ?
        `, [
            parent_category_id || null,
            category_name,
            description || null,
            status,
            categoryId
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Category updated successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory
};