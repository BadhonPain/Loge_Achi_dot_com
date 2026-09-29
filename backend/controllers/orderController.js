const db = require('../config/db');

// Place Order — CUSTOMER only, uses stored procedure sp_place_order for atomic multi-step workflow
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
    // Call MySQL Stored Procedure sp_place_order (CSE216 Requirement: Multi-step transaction workflow in procedure)
    await connection.query(
      'CALL sp_place_order(?, ?, ?, @order_id, @grand_total, @result_msg)',
      [customerId, address_id, payment_method]
    );

    const [[result]] = await connection.query(
      'SELECT @order_id AS order_id, @grand_total AS total, @result_msg AS message'
    );

    if (!result || !result.order_id || Number(result.order_id) === 0) {
      return res.status(400).json({
        success: false,
        message: result ? result.message : 'Order placement failed'
      });
    }

    res.status(201).json({
      success: true,
      message: result.message || 'Order placed successfully',
      order_id: Number(result.order_id),
      total: Number(result.total)
    });
  } catch (error) {
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
// Uses explicit transaction control
exports.updateSellerOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid preparation status' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'UPDATE seller_orders SET preparation_status = ? WHERE seller_order_id = ? AND seller_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found or not owned by you' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Preparation status updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update Seller Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Update overall order status — ADMIN only
// Fires trg_order_status_audit trigger in database!
// Uses explicit transaction control
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status: ' + valid.join(', ') });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await connection.commit();
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    await connection.rollback();
    console.error('Update Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};
