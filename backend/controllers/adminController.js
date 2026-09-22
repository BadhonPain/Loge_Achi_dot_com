const db = require('../config/db');

// Dashboard stats — ADMIN only
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalCustomers }]] = await db.execute('SELECT COUNT(*) AS totalCustomers FROM customers');
    const [[{ totalSellers }]] = await db.execute('SELECT COUNT(*) AS totalSellers FROM sellers');
    const [[{ totalProducts }]] = await db.execute('SELECT COUNT(*) AS totalProducts FROM products WHERE status != ?', ['ARCHIVED']);
    const [[{ totalOrders }]] = await db.execute('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await db.execute('SELECT COALESCE(SUM(grand_total), 0) AS totalRevenue FROM orders WHERE order_status != ?', ['CANCELLED']);

    res.json({ success: true, data: { totalCustomers, totalSellers, totalProducts, totalOrders, totalRevenue } });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// All customers — ADMIN only
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT customer_id, name, email, phone, account_status, created_at FROM customers ORDER BY created_at DESC');
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// All sellers — ADMIN only
exports.getAllSellers = async (req, res) => {
  try {
    const [sellers] = await db.query('SELECT seller_id, seller_name, shop_name, email, phone, status, created_at FROM sellers ORDER BY created_at DESC');
    res.json({ success: true, count: sellers.length, data: sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update seller status (approve/suspend) — ADMIN only
exports.updateSellerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
  if (!status || !valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status. Must be: ' + valid.join(', ') });

  try {
    const [result] = await db.execute('UPDATE sellers SET status = ? WHERE seller_id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update customer status — ADMIN only
exports.updateCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { account_status } = req.body;
  const valid = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  if (!account_status || !valid.includes(account_status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  try {
    const [result] = await db.execute('UPDATE customers SET account_status = ? WHERE customer_id = ?', [account_status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// All orders — ADMIN only
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.order_id, o.customer_id, c.name AS customer_name, o.grand_total AS total_amount, o.grand_total, o.order_status, o.created_at
      FROM orders o JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Archive any product — ADMIN only
exports.archiveProduct = async (req, res) => {
  try {
    const [result] = await db.execute("UPDATE products SET status = 'ARCHIVED' WHERE product_id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product archived by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
