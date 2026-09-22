require('dotenv').config({ path: './.env' });
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Seeding demo accounts...');

    // 1. Admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await db.execute(
      'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
      ['System Administrator', 'admin@loge.com', adminHash]
    );
    console.log('✔ Admin: admin@loge.com / admin123');

    // 2. Seller
    const sellerHash = await bcrypt.hash('seller123', 10);
    await db.execute(
      'INSERT INTO sellers (seller_name, shop_name, email, password_hash, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE") ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = "ACTIVE"',
      ['Apex Footwear Ltd', 'Apex Official Store', 'seller@apex.com', sellerHash, '+8801711223344', 'Gulshan-2, Dhaka']
    );
    console.log('✔ Seller: seller@apex.com / seller123');

    // 3. Customer
    const custHash = await bcrypt.hash('customer123', 10);
    const [existingCust] = await db.execute('SELECT customer_id FROM customers WHERE email = ?', ['customer@loge.com']);
    if (existingCust.length === 0) {
      const [cRes] = await db.execute(
        'INSERT INTO customers (name, email, password_hash, phone, account_status) VALUES (?, ?, ?, ?, "ACTIVE")',
        ['Demo Customer', 'customer@loge.com', custHash, '+8801811223344']
      );
      await db.execute('INSERT INTO carts (customer_id) VALUES (?)', [cRes.insertId]);
      console.log('✔ Customer: customer@loge.com / customer123');
    } else {
      await db.execute('UPDATE customers SET password_hash = ? WHERE email = ?', [custHash, 'customer@loge.com']);
      console.log('✔ Customer updated: customer@loge.com / customer123');
    }

    // 4. Also seed a demo product for the seller if none exist
    const [sellerRow] = await db.execute('SELECT seller_id FROM sellers WHERE email = ?', ['seller@apex.com']);
    const sellerId = sellerRow[0]?.seller_id;

    // Check categories
    const [cats] = await db.execute('SELECT category_id FROM categories LIMIT 1');
    let catId = cats[0]?.category_id;
    if (!catId) {
      const [catRes] = await db.execute('INSERT INTO categories (category_name, description, status) VALUES (?, ?, "ACTIVE")', ['Fashion', 'Footwear and apparel']);
      catId = catRes.insertId;
    }

    if (sellerId && catId) {
      await db.execute(
        'INSERT INTO products (seller_id, category_id, sku, product_name, description, price, stock_quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?, "ACTIVE") ON DUPLICATE KEY UPDATE price = VALUES(price)',
        [sellerId, catId, 'APEX-M-001', 'Apex Men Formal Leather Shoes', 'Premium full-grain genuine leather formal shoes for men.', 3490.00, 25]
      );
      console.log('✔ Demo Product created for Apex Official Store');
    }

    console.log('\nAll demo accounts and seed data successfully ready!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
