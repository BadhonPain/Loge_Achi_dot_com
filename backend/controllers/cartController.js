const db = require("../config/db");


// =============================================
// GET CUSTOMER CART
// =============================================
const getCart = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        const [carts] = await db.query(`
            SELECT cart_id
            FROM carts
            WHERE customer_id = ?
        `, [customerId]);

        let cartId;
        if (carts.length === 0) {
            const [newCart] = await db.query('INSERT INTO carts (customer_id) VALUES (?)', [customerId]);
            cartId = newCart.insertId;
        } else {
            cartId = carts[0].cart_id;
        }

        const [items] = await db.query(`
            SELECT
                ci.cart_item_id,
                ci.product_id,
                ci.quantity,

                p.product_name,
                p.price,
                p.stock_quantity,
                p.status,

                s.shop_name,

                pi.image_url AS primary_image,

                (p.price * ci.quantity) AS line_total

            FROM cart_items ci

            JOIN products p
                ON ci.product_id = p.product_id

            JOIN sellers s
                ON p.seller_id = s.seller_id

            LEFT JOIN product_images pi
                ON p.product_id = pi.product_id
                AND pi.is_primary = TRUE

            WHERE ci.cart_id = ?

            ORDER BY ci.added_at DESC
        `, [cartId]);

        const cartTotal = items.reduce(
            (sum, item) => sum + Number(item.line_total),
            0
        );

        res.status(200).json({
            success: true,
            cart_id: cartId,
            count: items.length,
            cart_total: cartTotal,
            data: items
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
};


// =============================================
// ADD PRODUCT TO CART
// Uses explicit transaction control
// =============================================
const addToCart = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const customerId = req.params.customerId;

        const {
            product_id,
            quantity
        } = req.body;

        if (
            !product_id ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Valid product_id and quantity are required"
            });
        }

        await connection.beginTransaction();

        // Find customer cart
        const [carts] = await connection.query(`
            SELECT cart_id
            FROM carts
            WHERE customer_id = ?
        `, [customerId]);

        let cartId;
        if (carts.length === 0) {
            const [newCart] = await connection.query('INSERT INTO carts (customer_id) VALUES (?)', [customerId]);
            cartId = newCart.insertId;
        } else {
            cartId = carts[0].cart_id;
        }

        // Check product
        const [products] = await connection.query(`
            SELECT
                product_id,
                stock_quantity,
                status
            FROM products
            WHERE product_id = ?
        `, [product_id]);

        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        if (product.status !== "ACTIVE") {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        // Check if product already exists in cart
        const [existingItems] = await connection.query(`
            SELECT
                cart_item_id,
                quantity
            FROM cart_items
            WHERE cart_id = ?
              AND product_id = ?
        `, [cartId, product_id]);

        let newQuantity = quantity;

        if (existingItems.length > 0) {
            newQuantity =
                existingItems[0].quantity + quantity;
        }

        if (newQuantity > product.stock_quantity) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        if (existingItems.length > 0) {

            await connection.query(`
                UPDATE cart_items
                SET quantity = ?
                WHERE cart_item_id = ?
            `, [
                newQuantity,
                existingItems[0].cart_item_id
            ]);

        } else {

            await connection.query(`
                INSERT INTO cart_items
                (
                    cart_id,
                    product_id,
                    quantity
                )
                VALUES (?, ?, ?)
            `, [
                cartId,
                product_id,
                quantity
            ]);
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    } finally {
        connection.release();
    }
};


// =============================================
// UPDATE CART ITEM QUANTITY
// Uses explicit transaction control
// =============================================
const updateCartItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const customerId = req.params.customerId;
        const cartItemId = req.params.cartItemId;

        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        await connection.beginTransaction();

        const [items] = await connection.query(`
            SELECT
                ci.cart_item_id,
                p.stock_quantity

            FROM cart_items ci

            JOIN carts c
                ON ci.cart_id = c.cart_id

            JOIN products p
                ON ci.product_id = p.product_id

            WHERE ci.cart_item_id = ?
              AND c.customer_id = ?
        `, [
            cartItemId,
            customerId
        ]);

        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        if (quantity > items[0].stock_quantity) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        await connection.query(`
            UPDATE cart_items
            SET quantity = ?
            WHERE cart_item_id = ?
        `, [
            quantity,
            cartItemId
        ]);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update cart item"
        });
    } finally {
        connection.release();
    }
};


// =============================================
// DELETE CART ITEM
// Uses explicit transaction control
// =============================================
const deleteCartItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const customerId = req.params.customerId;
        const cartItemId = req.params.cartItemId;

        await connection.beginTransaction();

        const [result] = await connection.query(`
            DELETE ci
            FROM cart_items ci

            JOIN carts c
                ON ci.cart_id = c.cart_id

            WHERE ci.cart_item_id = ?
              AND c.customer_id = ?
        `, [
            cartItemId,
            customerId
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove cart item"
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem
};