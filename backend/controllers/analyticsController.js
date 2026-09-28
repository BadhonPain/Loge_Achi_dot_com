const db = require('../config/db');

// =============================================
// COMPLEX QUERY 1: Top Selling Products
// Multi-table JOIN with aggregation
// =============================================
exports.getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [products] = await db.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.price,
        s.shop_name,
        c.category_name,
        COALESCE(SUM(oi.quantity), 0) AS total_sold,
        COALESCE(SUM(oi.line_total), 0) AS total_revenue,
        COALESCE(fn_product_avg_rating(p.product_id), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count,
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS primary_image
      FROM products p
      JOIN sellers s ON p.seller_id = s.seller_id
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      LEFT JOIN orders o ON so.order_id = o.order_id AND o.order_status != 'CANCELLED'
      LEFT JOIN reviews r ON oi.order_item_id = r.order_item_id AND r.review_status = 'PUBLISHED'
      WHERE p.status != 'ARCHIVED'
      GROUP BY p.product_id, p.product_name, p.price, s.shop_name, c.category_name
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT ?
    `, [limit]);

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Top Selling Products Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// COMPLEX QUERY 2: Top Sellers by Revenue
// Multi-table JOIN with aggregation using DB function
// =============================================
exports.getTopSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [sellers] = await db.query(`
      SELECT 
        s.seller_id,
        s.seller_name,
        s.shop_name,
        s.status,
        COUNT(DISTINCT p.product_id) AS product_count,
        COUNT(DISTINCT so.seller_order_id) AS order_count,
        fn_seller_revenue(s.seller_id) AS total_revenue,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count
      FROM sellers s
      LEFT JOIN products p ON s.seller_id = p.seller_id AND p.status != 'ARCHIVED'
      LEFT JOIN seller_orders so ON s.seller_id = so.seller_id
      LEFT JOIN order_items oi ON so.seller_order_id = oi.seller_order_id
      LEFT JOIN reviews r ON oi.order_item_id = r.order_item_id AND r.review_status = 'PUBLISHED'
      WHERE s.status = 'ACTIVE'
      GROUP BY s.seller_id, s.seller_name, s.shop_name, s.status
      ORDER BY total_revenue DESC
      LIMIT ?
    `, [limit]);

    res.json({ success: true, data: sellers });
  } catch (error) {
    console.error('Top Sellers Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// COMPLEX QUERY 3: Category-wise Sales Analytics
// Multi-table JOIN with aggregation and subquery
// =============================================
exports.getCategorySalesAnalytics = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT 
        c.category_id,
        c.category_name,
        COUNT(DISTINCT p.product_id) AS product_count,
        COUNT(DISTINCT so.seller_order_id) AS order_count,
        COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
        COALESCE(SUM(oi.line_total), 0) AS total_revenue,
        COALESCE(AVG(r.rating), 0) AS avg_category_rating,
        (SELECT p2.product_name 
         FROM products p2 
         LEFT JOIN order_items oi2 ON p2.product_id = oi2.product_id
         WHERE p2.category_id = c.category_id AND p2.status != 'ARCHIVED'
         GROUP BY p2.product_id, p2.product_name
         ORDER BY COALESCE(SUM(oi2.quantity), 0) DESC 
         LIMIT 1) AS best_selling_product
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id AND p.status != 'ARCHIVED'
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      LEFT JOIN orders o ON so.order_id = o.order_id AND o.order_status != 'CANCELLED'
      LEFT JOIN reviews r ON oi.order_item_id = r.order_item_id AND r.review_status = 'PUBLISHED'
      WHERE c.status = 'ACTIVE'
      GROUP BY c.category_id, c.category_name
      ORDER BY total_revenue DESC
    `);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Category Sales Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// COMPLEX QUERY 4: Monthly Revenue Trend
// Aggregation with date functions
// =============================================
exports.getMonthlyRevenueTrend = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const [trends] = await db.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') AS month,
        COUNT(DISTINCT o.order_id) AS order_count,
        COALESCE(SUM(o.grand_total), 0) AS revenue,
        COUNT(DISTINCT o.customer_id) AS unique_customers,
        COALESCE(AVG(o.grand_total), 0) AS avg_order_value
      FROM orders o
      WHERE o.order_status != 'CANCELLED'
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [months]);

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Monthly Revenue Trend Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// COMPLEX QUERY 5: Customer Order Summary
// Multi-table with aggregation — customer analytics
// =============================================
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [customers] = await db.query(`
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        c.account_status,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COALESCE(SUM(o.grand_total), 0) AS total_spent,
        COALESCE(AVG(o.grand_total), 0) AS avg_order_value,
        MAX(o.created_at) AS last_order_date,
        COUNT(DISTINCT wi.product_id) AS wishlist_count
      FROM customers c
      LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status != 'CANCELLED'
      LEFT JOIN wishlist_items wi ON c.customer_id = wi.customer_id
      GROUP BY c.customer_id, c.name, c.email, c.account_status
      ORDER BY total_spent DESC
      LIMIT ?
    `, [limit]);

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Customer Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// Seller Dashboard using Stored Procedure
// =============================================
exports.getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [rows] = await db.query('CALL sp_seller_dashboard(?)', [sellerId]);
    // Stored procedure returns result sets as nested arrays
    res.json({ success: true, data: rows[0][0] || {} });
  } catch (error) {
    console.error('Seller Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// Order Status Log (audit trail)
// =============================================
exports.getOrderStatusLog = async (req, res) => {
  try {
    const orderId = req.params.id;
    const [logs] = await db.query(`
      SELECT log_id, order_id, old_status, new_status, changed_at
      FROM order_status_log
      WHERE order_id = ?
      ORDER BY changed_at DESC
    `, [orderId]);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Order Status Log Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
