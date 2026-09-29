require('dotenv').config();
const db = require('./config/db');

async function testStockZero() {
  const [custs] = await db.query('SELECT customer_id FROM customers LIMIT 1');
  const custId = custs[0].customer_id;

  const [addrs] = await db.query('SELECT address_id FROM customer_addresses WHERE customer_id = ? LIMIT 1', [custId]);
  if (!addrs.length) {
    console.log('No address for customer', custId);
    return;
  }
  const addrId = addrs[0].address_id;

  const [carts] = await db.query('SELECT cart_id FROM carts WHERE customer_id = ?', [custId]);
  const cartId = carts[0].cart_id;

  const [prods] = await db.query('SELECT product_id, stock_quantity, status FROM products LIMIT 1');
  const prodId = prods[0].product_id;
  console.log('Original Product:', prods[0]);

  // Set stock to 0
  await db.query('UPDATE products SET stock_quantity = 0 WHERE product_id = ?', [prodId]);
  const [pUpdated] = await db.query('SELECT product_id, stock_quantity, status FROM products WHERE product_id = ?', [prodId]);
  console.log('Updated Product with stock 0:', pUpdated[0]);

  // Put into cart_items with quantity 1
  await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)', [cartId, prodId]);

  // Call sp_place_order
  const conn = await db.getConnection();
  try {
    await conn.query('CALL sp_place_order(?, ?, ?, @order_id, @grand_total, @result_msg)', [custId, addrId, 'CASH_ON_DELIVERY']);
    const [[res]] = await conn.query('SELECT @order_id AS order_id, @grand_total AS total, @result_msg AS message');
    console.log('Procedure result when stock is 0:', res);
  } finally {
    conn.release();
  }

  // Restore product
  await db.query("UPDATE products SET stock_quantity = 50, status = 'ACTIVE' WHERE product_id = ?", [prodId]);
  await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  process.exit(0);
}

testStockZero().catch(e => { console.error(e); process.exit(1); });
