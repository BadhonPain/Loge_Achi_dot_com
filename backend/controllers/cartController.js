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

        if (carts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cartId = carts[0].cart_id;

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
// =============================================
const addToCart = async (req, res) => {
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
            return res.status(400).json({
                success: false,
                message: "Valid product_id and quantity are required"
            });
        }

        // Find customer cart
        const [carts] = await db.query(`
            SELECT cart_id
            FROM carts
            WHERE customer_id = ?
        `, [customerId]);

        if (carts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cartId = carts[0].cart_id;

        // Check product
        const [products] = await db.query(`
            SELECT
                product_id,
                stock_quantity,
                status
            FROM products
            WHERE product_id = ?
        `, [product_id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        if (product.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        // Check if product already exists in cart
        const [existingItems] = await db.query(`
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
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        if (existingItems.length > 0) {

            await db.query(`
                UPDATE cart_items
                SET quantity = ?
                WHERE cart_item_id = ?
            `, [
                newQuantity,
                existingItems[0].cart_item_id
            ]);

        } else {

            await db.query(`
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

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }
};


// =============================================
// UPDATE CART ITEM QUANTITY
// =============================================
const updateCartItem = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const cartItemId = req.params.cartItemId;

        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const [items] = await db.query(`
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
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        if (quantity > items[0].stock_quantity) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        await db.query(`
            UPDATE cart_items
            SET quantity = ?
            WHERE cart_item_id = ?
        `, [
            quantity,
            cartItemId
        ]);

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update cart item"
        });
    }
};


// =============================================
// DELETE CART ITEM
// =============================================
const deleteCartItem = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const cartItemId = req.params.cartItemId;

        const [result] = await db.query(`
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
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove cart item"
        });
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem
};