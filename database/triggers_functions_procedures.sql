

USE loge_achi_db;

-- =============================================
-- TRIGGER 1: Auto-update product status to OUT_OF_STOCK
-- when stock reaches 0 after an order deducts inventory.
-- Auto-restores to ACTIVE when stock is replenished.
-- =============================================

DROP TRIGGER IF EXISTS trg_product_auto_out_of_stock;

DELIMITER //
CREATE TRIGGER trg_product_auto_out_of_stock
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    -- Auto-set status to OUT_OF_STOCK when stock reaches 0
    IF NEW.stock_quantity = 0 AND NEW.status = 'ACTIVE' THEN
        SET NEW.status = 'OUT_OF_STOCK';
    END IF;
    
    -- Auto-restore to ACTIVE when stock is replenished from OUT_OF_STOCK
    IF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 AND OLD.status = 'OUT_OF_STOCK' THEN
        SET NEW.status = 'ACTIVE';
    END IF;
END //
DELIMITER ;


-- =============================================
-- TRIGGER 2: Log seller-managed order preparation status changes
-- to an audit/shadow table for accountability.
-- =============================================

-- Shadow/Audit table for order status changes
CREATE TABLE IF NOT EXISTS order_status_log (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_order_status_audit;

DELIMITER //
CREATE TRIGGER trg_order_status_audit
AFTER UPDATE ON seller_orders
FOR EACH ROW
BEGIN
    IF NOT (OLD.preparation_status <=> NEW.preparation_status) THEN
        INSERT INTO order_status_log (order_id, old_status, new_status)
        VALUES (NEW.order_id, OLD.preparation_status, NEW.preparation_status);
    END IF;
END //
DELIMITER ;


-- =============================================
-- FUNCTION 1: Calculate seller total revenue
-- Returns the total revenue for a given seller
-- from all non-cancelled orders.
-- =============================================

DROP FUNCTION IF EXISTS fn_seller_revenue;

DELIMITER //
CREATE FUNCTION fn_seller_revenue(p_seller_id BIGINT UNSIGNED)
RETURNS DECIMAL(14,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_revenue DECIMAL(14,2);
    
    SELECT COALESCE(SUM(so.seller_total), 0)
    INTO v_revenue
    FROM seller_orders so
    JOIN orders o ON so.order_id = o.order_id
    WHERE so.seller_id = p_seller_id
      AND o.order_status != 'CANCELLED'
      AND so.preparation_status != 'CANCELLED';
    
    RETURN v_revenue;
END //
DELIMITER ;


-- =============================================
-- FUNCTION 2: Get average product rating
-- Returns the average rating for a given product.
-- =============================================

DROP FUNCTION IF EXISTS fn_product_avg_rating;

DELIMITER //
CREATE FUNCTION fn_product_avg_rating(p_product_id BIGINT UNSIGNED)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_avg DECIMAL(3,2);
    
    SELECT COALESCE(AVG(r.rating), 0)
    INTO v_avg
    FROM reviews r
    JOIN order_items oi ON r.order_item_id = oi.order_item_id
    WHERE oi.product_id = p_product_id
      AND r.review_status = 'PUBLISHED';
    
    RETURN v_avg;
END //
DELIMITER ;


-- =============================================
-- PROCEDURE 1: Place Order (multi-step workflow)
-- Validates cart, creates order, seller_orders,
-- order_items, payment, deducts stock, clears cart
-- all in one atomic transaction.
-- =============================================

DROP PROCEDURE IF EXISTS sp_place_order;

DELIMITER //
CREATE PROCEDURE sp_place_order(
    IN p_customer_id BIGINT UNSIGNED,
    IN p_address_id BIGINT UNSIGNED,
    IN p_payment_method VARCHAR(30),
    OUT p_order_id BIGINT UNSIGNED,
    OUT p_grand_total DECIMAL(12,2),
    OUT p_result_message VARCHAR(255)
)
proc: BEGIN
    DECLARE v_cart_id BIGINT UNSIGNED;
    DECLARE v_item_count INT DEFAULT 0;
    DECLARE v_items_subtotal DECIMAL(12,2) DEFAULT 0;
    DECLARE v_shipping_fee DECIMAL(12,2) DEFAULT 0;
    DECLARE v_grand_total DECIMAL(12,2) DEFAULT 0;
    DECLARE v_txn_id VARCHAR(150);
    DECLARE v_payment_status VARCHAR(30);
    
    -- Address fields
    DECLARE v_recipient_name VARCHAR(100);
    DECLARE v_phone VARCHAR(20);
    DECLARE v_addr1 VARCHAR(255);
    DECLARE v_addr2 VARCHAR(255);
    DECLARE v_city VARCHAR(100);
    DECLARE v_postal VARCHAR(20);
    DECLARE v_country VARCHAR(100);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_order_id = 0;
        SET p_grand_total = 0;
        SET p_result_message = 'Transaction failed - rolled back';
    END;
    
    START TRANSACTION;
    
    -- 1. Validate address belongs to customer
    SELECT recipient_name, phone, address_line1, address_line2, city, postal_code, country
    INTO v_recipient_name, v_phone, v_addr1, v_addr2, v_city, v_postal, v_country
    FROM customer_addresses
    WHERE address_id = p_address_id AND customer_id = p_customer_id;
    
    IF v_recipient_name IS NULL THEN
        ROLLBACK;
        SET p_order_id = 0;
        SET p_grand_total = 0;
        SET p_result_message = 'Address not found';
        LEAVE proc;
    END IF;
    
    -- 2. Get cart
    SELECT cart_id INTO v_cart_id
    FROM carts WHERE customer_id = p_customer_id;
    
    -- 3. Count items
    SELECT COUNT(*) INTO v_item_count
    FROM cart_items WHERE cart_id = v_cart_id;
    
    IF v_item_count = 0 THEN
        ROLLBACK;
        SET p_order_id = 0;
        SET p_grand_total = 0;
        SET p_result_message = 'Cart is empty';
        LEAVE proc;
    END IF;

    -- CONCURRENCY FIX: Acquire exclusive row-level locks on ALL product rows
    -- in this cart BEFORE checking stock. This prevents two concurrent sessions
    -- from both reading the same stock_quantity, both passing the check, and
    -- both decrementing stock (which would allow overselling).
    -- Any other transaction trying to UPDATE these products will WAIT until
    -- this transaction COMMITs or ROLLBACKs.
    SELECT p.product_id, p.stock_quantity, p.status
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = v_cart_id
    FOR UPDATE;

    -- Stock check AFTER acquiring locks (now safe from race conditions)
    IF EXISTS (
        SELECT 1 FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = v_cart_id
          AND (ci.quantity > p.stock_quantity OR p.status != 'ACTIVE')
    ) THEN
        ROLLBACK;
        SET p_order_id = 0;
        SET p_grand_total = 0;
        SET p_result_message = 'Insufficient stock for one or more items in cart';
        LEAVE proc;
    END IF;

    -- 4. Calculate subtotal
    SELECT SUM(p.price * ci.quantity) INTO v_items_subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE';
    
    SET v_grand_total = v_items_subtotal - 0 + v_shipping_fee;
    
    -- 5. Insert order
    INSERT INTO orders (
        customer_id, items_subtotal, discount_total, shipping_fee, grand_total,
        order_status, shipping_name, shipping_phone, shipping_address_line1,
        shipping_address_line2, shipping_city, shipping_postal_code, shipping_country
    ) VALUES (
        p_customer_id, v_items_subtotal, 0, v_shipping_fee, v_grand_total,
        'PENDING_PAYMENT', v_recipient_name, v_phone, v_addr1,
        v_addr2, v_city, v_postal, COALESCE(v_country, 'Bangladesh')
    );
    
    SET p_order_id = LAST_INSERT_ID();
    SET p_grand_total = v_grand_total;
    
    -- 6. Create seller_orders and order_items for each seller
    -- Insert seller_orders for each distinct seller in cart
    INSERT INTO seller_orders (order_id, seller_id, items_subtotal, discount_total, seller_total, preparation_status)
    SELECT p_order_id, p.seller_id,
           SUM(p.price * ci.quantity),
           0,
           SUM(p.price * ci.quantity),
           'PENDING'
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE'
    GROUP BY p.seller_id;
    
    -- Insert order_items
    INSERT INTO order_items (
        seller_order_id, product_id, product_name_snapshot, sku_snapshot,
        quantity, unit_price, discount_amount, line_total
    )
    SELECT so.seller_order_id, ci.product_id, p.product_name, p.sku,
           ci.quantity, p.price, 0, (p.price * ci.quantity)
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    JOIN seller_orders so ON so.order_id = p_order_id AND so.seller_id = p.seller_id
    WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE';
    
    -- 7. Deduct stock
    UPDATE products p
    JOIN cart_items ci ON p.product_id = ci.product_id
    SET p.stock_quantity = p.stock_quantity - ci.quantity
    WHERE ci.cart_id = v_cart_id;
    
    -- 8. Insert payment
    SET v_txn_id = CONCAT('TXN-', UNIX_TIMESTAMP(), '-', FLOOR(1000 + RAND() * 9000));
    SET v_payment_status = IF(p_payment_method = 'CASH_ON_DELIVERY', 'PENDING', 'SUCCESS');
    
    INSERT INTO payments (
        order_id, transaction_id, payment_method, payment_provider, amount, payment_status, paid_at
    ) VALUES (
        p_order_id, v_txn_id, p_payment_method,
        IF(p_payment_method = 'CASH_ON_DELIVERY', 'COD', 'SSLCOMMERZ'),
        v_grand_total, v_payment_status,
        IF(p_payment_method = 'CASH_ON_DELIVERY', NULL, NOW())
    );
    
    -- 9. Clear cart
    DELETE FROM cart_items WHERE cart_id = v_cart_id;
    
    COMMIT;
    SET p_result_message = 'Order placed successfully';
END //
DELIMITER ;


-- =============================================
-- PROCEDURE 2: Get Seller Dashboard Statistics
-- Returns comprehensive stats for a seller.
-- =============================================

DROP PROCEDURE IF EXISTS sp_seller_dashboard;

DELIMITER //
CREATE PROCEDURE sp_seller_dashboard(
    IN p_seller_id BIGINT UNSIGNED
)
BEGIN
    -- Return comprehensive seller stats in a single call
    SELECT 
        COUNT(DISTINCT p.product_id) AS total_products,
        COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' THEN p.product_id END) AS active_products,
        COUNT(DISTINCT so.seller_order_id) AS total_orders,
        COUNT(DISTINCT CASE WHEN so.preparation_status = 'PENDING' THEN so.seller_order_id END) AS pending_orders,
        COALESCE(fn_seller_revenue(p_seller_id), 0) AS total_revenue,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS total_reviews
    FROM sellers s
    LEFT JOIN products p ON s.seller_id = p.seller_id
    LEFT JOIN seller_orders so ON s.seller_id = so.seller_id
    LEFT JOIN order_items oi ON so.seller_order_id = oi.seller_order_id
    LEFT JOIN reviews r ON oi.order_item_id = r.order_item_id AND r.review_status = 'PUBLISHED'
    WHERE s.seller_id = p_seller_id;
END //
DELIMITER ;
