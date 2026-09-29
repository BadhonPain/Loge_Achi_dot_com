const db = require('../config/db');

// =============================================
// GET WISHLIST — Customer only
// =============================================
exports.getWishlist = async (req, res) => {
  try {
    const customerId = req.user.id;
    const [items] = await db.query(`
      SELECT 
        wi.product_id,
        wi.created_at AS added_at,
        p.product_name,
        p.price,
        p.stock_quantity,
        p.status,
        s.shop_name,
        c.category_name,
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS primary_image
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.product_id
      JOIN sellers s ON p.seller_id = s.seller_id
      JOIN categories c ON p.category_id = c.category_id
      WHERE wi.customer_id = ?
      ORDER BY wi.created_at DESC
    `, [customerId]);

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =============================================
// ADD TO WISHLIST — Customer only
// Uses explicit transaction control
// =============================================
exports.addToWishlist = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const customerId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    // Verify product exists
    const [products] = await connection.execute(
      'SELECT product_id FROM products WHERE product_id = ? AND status != ?',
      [product_id, 'ARCHIVED']
    );
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await connection.execute(
      'INSERT INTO wishlist_items (customer_id, product_id) VALUES (?, ?)',
      [customerId, product_id]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }
    console.error('Add to Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};

// =============================================
// REMOVE FROM WISHLIST — Customer only
// Uses explicit transaction control
// =============================================
exports.removeFromWishlist = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const customerId = req.user.id;
    const productId = req.params.productId;

    const [result] = await connection.execute(
      'DELETE FROM wishlist_items WHERE customer_id = ? AND product_id = ?',
      [customerId, productId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Item not in wishlist' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    await connection.rollback();
    console.error('Remove from Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};
