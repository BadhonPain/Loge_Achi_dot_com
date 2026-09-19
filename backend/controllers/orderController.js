const db = require('../config/db');

// Place Order — CUSTOMER only, uses authenticated customer ID
exports.placeOrder = async (req, res) => {
  const customerId = req.user.id;
  const { address_id, payment_method } = req.body;

  if (!address_id || !payment_method) {
    return res.status(400).json({ success: false, message: 'address_id and payment_method are required' });
  }

  const validMethods = ['CARD', 'MOBILE_BANKING', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch delivery address snapshot
    const [addresses] = await connection.execute(
      'SELECT * FROM customer_addresses WHERE address_id = ? AND customer_id = ?',
      [address_id, customerId]
    );

    if (addresses.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Delivery address not found' });
    }
    const addr = addresses[0];

    // 2. Fetch customer cart
    const [carts] = await connection.execute('SELECT cart_id FROM carts WHERE customer_id = ?', [customerId]);
    if (carts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const cartId = carts[0].cart_id;

    // 3. Fetch cart items with product details
    const [items] = await connection.execute(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.price, p.stock_quantity, p.product_name, p.sku, p.seller_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ? AND p.status = 'ACTIVE'`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 4. Validate stock for each item
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product_name}". Available: ${item.stock_quantity}`
        });
      }
    }

    // 5. Calculate totals according to DB check constraints:
    // chk_orders_grand_total: grand_total = (items_subtotal - discount_total) + shipping_fee
    const itemsSubtotal = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);
    const discountTotal = 0.00;
    const shippingFee = 0.00;
    const grandTotal = itemsSubtotal - discountTotal + shippingFee;

    // 6. Insert Order into orders table (exact schema columns)
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        customer_id, items_subtotal, discount_total, shipping_fee, grand_total,
        order_status, shipping_name, shipping_phone, shipping_address_line1,
        shipping_address_line2, shipping_city, shipping_postal_code, shipping_country
      ) VALUES (?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        itemsSubtotal,
        discountTotal,
        shippingFee,
        grandTotal,
        addr.recipient_name,
        addr.phone,
        addr.address_line1,
        addr.address_line2 || null,
        addr.city,
        addr.postal_code || null,
        addr.country || 'Bangladesh'
      ]
    );
    const orderId = orderResult.insertId;

    // 7. Group items by seller for seller_orders table
    const sellerGroups = {};
    items.forEach(item => {
      if (!sellerGroups[item.seller_id]) sellerGroups[item.seller_id] = [];
      sellerGroups[item.seller_id].push(item);
    });

    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      const sellerSubtotal = sellerItems.reduce((s, i) => s + (Number(i.price) * Number(i.quantity)), 0);
      const sellerDiscount = 0.00;
      const sellerTotal = sellerSubtotal - sellerDiscount;

      const [soResult] = await connection.execute(
        `INSERT INTO seller_orders (
          order_id, seller_id, items_subtotal, discount_total, seller_total, preparation_status
        ) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [orderId, sellerId, sellerSubtotal, sellerDiscount, sellerTotal]
      );
      const sellerOrderId = soResult.insertId;

      for (const item of sellerItems) {
        const lineTotal = Number(item.price) * Number(item.quantity);
        await connection.execute(
          `INSERT INTO order_items (
            seller_order_id, product_id, product_name_snapshot, sku_snapshot,
            quantity, unit_price, discount_amount, line_total
          ) VALUES (?, ?, ?, ?, ?, ?, 0.00, ?)`,
          [sellerOrderId, item.product_id, item.product_name, item.sku, item.quantity, item.price, lineTotal]
        );

        // Deduct inventory stock
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // 8. Insert Payment record
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus = payment_method === 'CASH_ON_DELIVERY' ? 'PENDING' : 'SUCCESS';
    const paidAt = payment_method === 'CASH_ON_DELIVERY' ? null : new Date();

    await connection.execute(
      `INSERT INTO payments (
        order_id, transaction_id, payment_method, payment_provider, amount, payment_status, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        txnId,
        payment_method,
        payment_method === 'CASH_ON_DELIVERY' ? 'COD' : 'SSLCOMMERZ',
        grandTotal,
        paymentStatus,
        paidAt
      ]
    );

    // 9. Clear customer's cart
    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order_id: orderId,
      total: grandTotal
    });
  } catch (error) {
    await connection.rollback();
    console.error('Order Placement Error:', error);
    res.status(500).json({ success: false, message: 'Server error during order placement: ' + error.message });
  } finally {
    connection.release();
  }
};

// Get my orders — CUSTOMER only, object-level ownership enforced
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT order_id, grand_total, grand_total AS total_amount, order_status, created_at,
              shipping_name, shipping_city, shipping_address_line1
       FROM orders
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single order detail — ownership checked
exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orders[0];

    // Object-level ownership check
    if (req.user.role === 'CUSTOMER' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this order' });
    }

    if (req.user.role === 'SELLER') {
      const [so] = await db.execute(
        'SELECT seller_order_id FROM seller_orders WHERE order_id = ? AND seller_id = ?',
        [req.params.id, req.user.id]
      );
      if (so.length === 0) return res.status(403).json({ success: false, message: 'Forbidden: Not your order' });
    }

    const [orderItems] = await db.execute(
      `SELECT oi.*, so.seller_id
       FROM order_items oi
       JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
       WHERE so.order_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        total_amount: order.grand_total,
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Get Order Detail Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get seller's orders — SELLER only, shows only their store's orders
exports.getSellerOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT so.seller_order_id, so.order_id, so.items_subtotal, so.seller_total,
              so.preparation_status, so.created_at, o.order_status, o.shipping_name, o.shipping_city
       FROM seller_orders so
       JOIN orders o ON so.order_id = o.order_id
       WHERE so.seller_id = ?
       ORDER BY so.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get Seller Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update seller order preparation status — ownership enforced
exports.updateSellerOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid preparation status' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE seller_orders SET preparation_status = ? WHERE seller_order_id = ? AND seller_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or not owned by you' });
    }
    res.json({ success: true, message: 'Preparation status updated successfully' });
  } catch (error) {
    console.error('Update Seller Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
