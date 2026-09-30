const db = require('../config/db');
const { reviewSubmissionSchema } = require('../schemas/reviewSchemas');

exports.getEligibleReviewItems = async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT oi.order_item_id, oi.product_name_snapshot, o.created_at AS delivered_order_date
      FROM order_items oi
      JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      JOIN orders o ON so.order_id = o.order_id
      LEFT JOIN reviews r ON r.order_item_id = oi.order_item_id
      WHERE oi.product_id = ? AND o.customer_id = ?
        AND so.preparation_status = 'DELIVERED' AND r.review_id IS NULL
      ORDER BY o.created_at DESC
    `, [req.params.productId, req.user.id]);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get Eligible Review Items Error:', error);
    res.status(500).json({ success: false, message: 'Could not load eligible purchases' });
  }
};

// =============================================
// CREATE REVIEW — Customer only, must own the order item
// Uses explicit transaction control
// =============================================
exports.createReview = async (req, res) => {
  const customerId = req.user.id;
  const validation = reviewSubmissionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0].message,
      errors: validation.error.issues,
    });
  }
  const { order_item_id, rating, comment } = validation.data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify customer owns this order item (object-level ownership)
    const [ownership] = await connection.execute(`
      SELECT oi.order_item_id, so.preparation_status
      FROM order_items oi
      JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      JOIN orders o ON so.order_id = o.order_id
      WHERE oi.order_item_id = ? AND o.customer_id = ?
    `, [order_item_id, customerId]);

    if (ownership.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this order item' });
    }

    if (ownership[0].preparation_status !== 'DELIVERED') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'You can only review delivered orders' });
    }

    // Check if already reviewed
    const [existing] = await connection.execute(
      'SELECT review_id FROM reviews WHERE order_item_id = ?', [order_item_id]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'You have already reviewed this item' });
    }

    const [result] = await connection.execute(
      'INSERT INTO reviews (order_item_id, rating, comment, review_status) VALUES (?, ?, ?, ?)',
      [order_item_id, rating, comment || null, 'PUBLISHED']
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Review submitted', review_id: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Create Review Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You have already reviewed this item' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};

// =============================================
// GET PRODUCT REVIEWS — Public
// Uses DB function for avg rating
// =============================================
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;

    const [reviews] = await db.query(`
      SELECT 
        r.review_id, r.rating, r.comment, r.reviewed_at, r.review_status,
        c.name AS customer_name,
        oi.product_name_snapshot
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      JOIN orders o ON so.order_id = o.order_id
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE oi.product_id = ? AND r.review_status = 'PUBLISHED'
      ORDER BY r.reviewed_at DESC
    `, [productId]);

    // Use the DB function for average rating
    const [[avgRow]] = await db.query('SELECT fn_product_avg_rating(?) AS avg_rating', [productId]);

    res.json({
      success: true,
      avg_rating: avgRow.avg_rating,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get Product Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// GET MY REVIEWS — Customer only
// =============================================
exports.getMyReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT 
        r.review_id, r.rating, r.comment, r.reviewed_at,
        oi.product_name_snapshot, oi.product_id
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      JOIN seller_orders so ON oi.seller_order_id = so.seller_order_id
      JOIN orders o ON so.order_id = o.order_id
      WHERE o.customer_id = ? AND r.review_status = 'PUBLISHED'
      ORDER BY r.reviewed_at DESC
    `, [req.user.id]);

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get My Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// DELETE/HIDE REVIEW — Admin only
// Uses explicit transaction
// =============================================
exports.hideReview = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "UPDATE reviews SET review_status = 'HIDDEN' WHERE review_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Review hidden' });
  } catch (error) {
    await connection.rollback();
    console.error('Hide Review Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};
