require('dotenv').config({ path: './.env' });
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function seedProducts() {
  try {
    console.log('--- Seeding All 15 Products into MySQL Database ---');

    // 1. Read allProducts from frontend/src/data/products.js
    let code = fs.readFileSync('../frontend/src/data/products.js', 'utf8');
    code = code.replace(/export const/g, 'const');
    code = code.replace(/export default.*/g, '');
    code += '\nmodule.exports = { allProducts };';
    fs.writeFileSync('./temp_products.js', code);
    const { allProducts } = require('./temp_products');
    fs.unlinkSync('./temp_products.js');

    const defaultPassword = await bcrypt.hash('seller123', 10);

    // 2. Ensure categories and sellers
    for (const p of allProducts) {
      // Category
      const catName = p.category || 'General';
      const [catRows] = await db.execute('SELECT category_id FROM categories WHERE category_name = ?', [catName]);
      let categoryId;
      if (catRows.length === 0) {
        const [cRes] = await db.execute('INSERT INTO categories (category_name, description, status) VALUES (?, ?, "ACTIVE")', [catName, `${catName} category`]);
        categoryId = cRes.insertId;
      } else {
        categoryId = catRows[0].category_id;
      }

      // Seller
      const shopName = p.seller?.name || 'LogeAchi Official Store';
      const sellerEmail = `vendor.${p.id}@loge.com`;
      const [sellerRows] = await db.execute('SELECT seller_id FROM sellers WHERE shop_name = ?', [shopName]);
      let sellerId;
      if (sellerRows.length === 0) {
        const [sRes] = await db.execute(
          'INSERT INTO sellers (seller_name, shop_name, email, password_hash, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE")',
          [shopName, shopName, sellerEmail, defaultPassword, `+88017000000${p.id}`, 'Dhaka, Bangladesh']
        );
        sellerId = sRes.insertId;
      } else {
        sellerId = sellerRows[0].seller_id;
      }

      // 3. Upsert Product with exact product_id = p.id
      const sku = p.sku || `SKU-PROD-${p.id}`;
      const price = Number(p.price) || 1000;
      const stock = Number(p.stock) || 50;

      await db.execute(
        `INSERT INTO products (product_id, seller_id, category_id, sku, product_name, description, price, stock_quantity, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
         ON DUPLICATE KEY UPDATE
           category_id = VALUES(category_id),
           product_name = VALUES(product_name),
           description = VALUES(description),
           price = VALUES(price),
           stock_quantity = VALUES(stock_quantity),
           status = 'ACTIVE'`,
        [p.id, sellerId, categoryId, sku, p.title, p.description || p.title, price, stock]
      );

      // 4. Primary product image
      const primaryImg = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [p.id]);
      await db.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text) VALUES (?, ?, 1, 1, ?)',
        [p.id, primaryImg, p.title]
      );

      // Secondary images if available
      if (p.images && p.images.length > 1) {
        for (let idx = 1; idx < Math.min(p.images.length, 5); idx++) {
          await db.execute(
            'INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text) VALUES (?, ?, 0, ?, ?)',
            [p.id, p.images[idx], idx + 1, p.title]
          );
        }
      }

      console.log(`✔ Seeded Product ID ${p.id}: ${p.title.substring(0, 45)}... (৳${price})`);
    }

    console.log('\n✔ All 15 products, categories, sellers, and images are live in MySQL database!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seedProducts();
