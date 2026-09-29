require('dotenv').config();
const mysql = require('mysql2/promise');

async function applyDatabaseFeatures() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'loge_achi_db',
    multipleStatements: true
  });

  console.log('Connected to MySQL successfully.');

  try {
    for (const tableName of ['customers', 'sellers', 'admins']) {
      const [[table]] = await connection.query(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [tableName]
      );
      if (!table) continue;

      const [[column]] = await connection.query(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [tableName, 'profile_image']
      );
      if (!column) {
        await connection.query(`ALTER TABLE ${tableName} ADD COLUMN profile_image VARCHAR(500) NULL`);
      }
    }

    console.log('Updating seller order status constraint...');
    const [statusConstraints] = await connection.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'seller_orders'
        AND CONSTRAINT_NAME = 'chk_seller_orders_status'
        AND CONSTRAINT_TYPE = 'CHECK'
    `);
    if (statusConstraints.length > 0) {
      await connection.query('ALTER TABLE seller_orders DROP CHECK chk_seller_orders_status');
    }
    await connection.query(`
      ALTER TABLE seller_orders
      ADD CONSTRAINT chk_seller_orders_status
      CHECK (preparation_status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
    `);

    // 1. Audit / Shadow Table for Order Status Changes
    console.log('1. Creating order_status_log table (Shadow table)...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_status_log (
        log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        old_status VARCHAR(30) NULL,
        new_status VARCHAR(30) NOT NULL,
        changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ order_status_log table ready.');

    // 2. Trigger 1: Auto Out-of-Stock when quantity drops to 0, auto-restore when replenished
    console.log('2. Creating Trigger: trg_product_auto_out_of_stock...');
    await connection.query('DROP TRIGGER IF EXISTS trg_product_auto_out_of_stock');
    await connection.query(`
      CREATE TRIGGER trg_product_auto_out_of_stock
      BEFORE UPDATE ON products
      FOR EACH ROW
      BEGIN
        IF NEW.stock_quantity = 0 AND NEW.status = 'ACTIVE' THEN
          SET NEW.status = 'OUT_OF_STOCK';
        END IF;

        IF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 AND OLD.status = 'OUT_OF_STOCK' THEN
          SET NEW.status = 'ACTIVE';
        END IF;
      END
    `);
    console.log('   ✓ Trigger trg_product_auto_out_of_stock created.');

    // 3. Trigger 2: Audit seller-managed order preparation status changes
    console.log('3. Creating Trigger: trg_order_status_audit...');
    await connection.query('DROP TRIGGER IF EXISTS trg_order_status_audit');
    await connection.query(`
      CREATE TRIGGER trg_order_status_audit
      AFTER UPDATE ON seller_orders
      FOR EACH ROW
      BEGIN
        IF NOT (OLD.preparation_status <=> NEW.preparation_status) THEN
          INSERT INTO order_status_log (order_id, old_status, new_status)
          VALUES (NEW.order_id, OLD.preparation_status, NEW.preparation_status);
        END IF;
      END
    `);
    console.log('   ✓ Trigger trg_order_status_audit created.');

    // 4. Function 1: fn_seller_revenue
    console.log('4. Creating Function: fn_seller_revenue...');
    await connection.query('DROP FUNCTION IF EXISTS fn_seller_revenue');
    await connection.query(`
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
      END
    `);
    console.log('   ✓ Function fn_seller_revenue created.');

    // 5. Function 2: fn_product_avg_rating
    console.log('5. Creating Function: fn_product_avg_rating...');
    await connection.query('DROP FUNCTION IF EXISTS fn_product_avg_rating');
    await connection.query(`
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
      END
    `);
    console.log('   ✓ Function fn_product_avg_rating created.');

    // 6. Procedure 1: sp_seller_dashboard
    console.log('6. Creating Procedure: sp_seller_dashboard...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_seller_dashboard');
    await connection.query(`
      CREATE PROCEDURE sp_seller_dashboard(
        IN p_seller_id BIGINT UNSIGNED
      )
      BEGIN
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
      END
    `);
    console.log('   ✓ Procedure sp_seller_dashboard created.');

    // 7. Procedure 2: sp_place_order
    console.log('7. Creating Procedure: sp_place_order...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_place_order');
    await connection.query(`
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
        
        SELECT cart_id INTO v_cart_id
        FROM carts WHERE customer_id = p_customer_id;
        
        SELECT COUNT(*) INTO v_item_count
        FROM cart_items WHERE cart_id = v_cart_id;
        
        IF v_item_count = 0 THEN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Cart is empty';
          LEAVE proc;
        END IF;

        IF EXISTS (
          SELECT 1 FROM cart_items ci
          JOIN products p ON ci.product_id = p.product_id
          WHERE ci.cart_id = v_cart_id AND ci.quantity > p.stock_quantity
        ) THEN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Insufficient stock for one or more items in cart';
          LEAVE proc;
        END IF;

        SELECT SUM(p.price * ci.quantity) INTO v_items_subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE';
        
        SET v_grand_total = v_items_subtotal + v_shipping_fee;
        
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
        
        UPDATE products p
        JOIN cart_items ci ON p.product_id = ci.product_id
        SET p.stock_quantity = p.stock_quantity - ci.quantity
        WHERE ci.cart_id = v_cart_id;
        
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
        
        DELETE FROM cart_items WHERE cart_id = v_cart_id;
        
        COMMIT;
        SET p_result_message = 'Order placed successfully';
      END
    `);
    console.log('   ✓ Procedure sp_place_order created.');

    console.log('\nAll Database Features Applied Successfully!');
  } catch (error) {
    console.error('Error applying database features:', error);
  } finally {
    await connection.end();
  }
}

applyDatabaseFeatures();
