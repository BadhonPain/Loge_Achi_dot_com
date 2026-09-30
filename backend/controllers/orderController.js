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
    // Call MySQL Stored Procedure sp_place_order
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
    const [rows] = await db.execute(
      `SELECT o.order_id, o.grand_total, o.grand_total AS total_amount, o.order_status, o.created_at,
              o.shipping_name, o.shipping_city, o.shipping_address_line1,
              so.seller_order_id, so.preparation_status, s.shop_name AS seller_name
       FROM orders o
       LEFT JOIN seller_orders so ON so.order_id = o.order_id
       LEFT JOIN sellers s ON s.seller_id = so.seller_id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC, so.seller_order_id`,
      [req.user.id]
    );
    const ordersById = new Map();
    for (const row of rows) {
      let order = ordersById.get(row.order_id);
      if (!order) {
        order = {
          order_id: row.order_id,
          grand_total: row.grand_total,
          total_amount: row.total_amount,
          order_status: row.order_status,
          created_at: row.created_at,
          shipping_name: row.shipping_name,
          shipping_city: row.shipping_city,
          shipping_address_line1: row.shipping_address_line1,
          seller_statuses: []
        };
        ordersById.set(row.order_id, order);
      }
      if (row.seller_order_id !== null) {
        order.seller_statuses.push({
          seller_order_id: row.seller_order_id,
          seller_name: row.seller_name,
          status: row.preparation_status
        });
      }
    }
    res.json({ success: true, data: Array.from(ordersById.values()) });
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
  const valid = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid preparation status' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [sellerOrders] = await connection.execute(
      `SELECT so.order_id, so.preparation_status, o.customer_id, s.shop_name
       FROM seller_orders so
       JOIN orders o ON o.order_id = so.order_id
       JOIN sellers s ON s.seller_id = so.seller_id
       WHERE so.seller_order_id = ? AND so.seller_id = ?
       FOR UPDATE`,
      [req.params.id, req.user.id]
    );
    if (sellerOrders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found or not owned by you' });
    }
    const sellerOrder = sellerOrders[0];

    await connection.execute(
      'UPDATE seller_orders SET preparation_status = ? WHERE seller_order_id = ? AND seller_id = ?',
      [status, req.params.id, req.user.id]
    );

    if (sellerOrder.preparation_status !== status) {
      await connection.execute(
        `INSERT INTO customer_notifications
          (customer_id, notification_type, title, body, order_id, seller_order_id, seller_id)
         VALUES (?, 'ORDER_STATUS', ?, ?, ?, ?, ?)`,
        [
          sellerOrder.customer_id,
          `${sellerOrder.shop_name} updated an order`,
          `Order #${sellerOrder.order_id} is now ${status.replaceAll('_', ' ').toLowerCase()}.`,
          sellerOrder.order_id,
          req.params.id,
          req.user.id,
        ]
      );
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

