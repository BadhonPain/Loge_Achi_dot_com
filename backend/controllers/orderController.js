const db = require('../config/db');

// Place Order — CUSTOMER only, uses their JWT id
exports.placeOrder = async (req, res) => {
  const customerId = req.user.id;
  const { address_id, payment_method } = req.body;

  if (!address_id || !payment_method) return res.status(400).json({ success: false, message: 'address_id and payment_method are required' });

  const validMethods = ['CARD', 'MOBILE_BANKING', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];
  if (!validMethods.includes(payment_method)) return res.status(400).json({ success: false, message: 'Invalid payment method' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get customer cart
    const [carts] = await connection.execute('SELECT cart_id FROM carts WHERE customer_id = ?', [customerId]);
    if (carts.length === 0) { await connection.rollback(); return res.status(404).json({ success: false, message: 'Cart not found' }); }

    // Get cart items with product info
    const [items] = await connection.execute(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.product_name, p.sku, p.seller_id
       FROM cart_items ci JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ? AND p.status = 'ACTIVE'`,
      [carts[0].cart_id]
    );
    if (items.length === 0) { await connection.rollback(); return res.status(400).json({ success: false, message: 'Cart is empty' }); }

    // Stock validation
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product_name}` });
      }
    }

    const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_id, shipping_address_id, total_amount, order_status) VALUES (?, ?, ?, ?)',
      [customerId, address_id, totalAmount, 'CONFIRMED']
    );
    const orderId = orderResult.insertId;

    // Group items by seller for seller_orders
    const sellerGroups = {};
    items.forEach(item => {
      if (!sellerGroups[item.seller_id]) sellerGroups[item.seller_id] = [];
      sellerGroups[item.seller_id].push(item);
    });

    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      const subtotal = sellerItems.reduce((s, i) => s + (i.price * i.quantity), 0);
      const [soResult] = await connection.execute(
        'INSERT INTO seller_orders (order_id, seller_id, items_subtotal, seller_total) VALUES (?, ?, ?, ?)',
        [orderId, sellerId, subtotal, subtotal]
      );
      for (const item of sellerItems) {
        await connection.execute(
          `INSERT INTO order_items (seller_order_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [soResult.insertId, item.product_id, item.product_name, item.sku, item.quantity, item.price, item.price * item.quantity]
        );
        // Deduct stock
        await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [item.quantity, item.product_id]);
      }
    }

    // Create payment record
    await connection.execute(
      'INSERT INTO payments (order_id, payment_method, amount, payment_status) VALUES (?, ?, ?, ?)',
      [orderId, payment_method, totalAmount, payment_method === 'CASH_ON_DELIVERY' ? 'PENDING' : 'SUCCESS']
    );

    // Clear cart
    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].cart_id]);

    await connection.commit();
    res.status(201).json({ success: true, message: 'Order placed', order_id: orderId, total: totalAmount });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Get my orders — CUSTOMER only, object-level ownership via JWT
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      'SELECT order_id, total_amount, order_status, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single order — ownership enforced per role
exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    // Object-level ownership check
    if (req.user.role === 'CUSTOMER' && orders[0].customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not your order' });
    }
    if (req.user.role === 'SELLER') {
      const [so] = await db.execute('SELECT seller_order_id FROM seller_orders WHERE order_id = ? AND seller_id = ?', [req.params.id, req.user.id]);
      if (so.length === 0) return res.status(403).json({ success: false, message: 'Forbidden: Not your order' });
    }

    const [orderItems] = await db.execute(
      `SELECT oi.*, so.seller_id FROM order_items oi
       JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
       WHERE so.order_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...orders[0], items: orderItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get seller's orders — SELLER only, shows only their portion
exports.getSellerOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT so.seller_order_id, so.order_id, so.items_subtotal, so.seller_total, so.preparation_status, so.created_at, o.order_status
       FROM seller_orders so JOIN orders o ON so.order_id = o.order_id
       WHERE so.seller_id = ? ORDER BY so.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update seller order preparation status — ownership enforced
exports.updateSellerOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'];
  if (!status || !valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  try {
    const [result] = await db.execute(
      'UPDATE seller_orders SET preparation_status = ? WHERE seller_order_id = ? AND seller_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Order not found or not yours' });
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
