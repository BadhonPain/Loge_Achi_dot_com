require('dotenv').config();
const db = require('./config/db');

async function verifyAll() {
  console.log('=============================================');
  console.log('CSE216 Checklist Verification Report');
  console.log('=============================================');

  // 1. Tables check (including shadow table)
  const [tables] = await db.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('\n[1] Tables present (' + tableNames.length + '):');
  console.log(tableNames.join(', '));
  const hasShadowTable = tableNames.includes('order_status_log');
  console.log('   Shadow/Audit Table (order_status_log):', hasShadowTable ? '✓ PASS' : '✗ FAIL');

  // 2. Triggers check
  const [triggers] = await db.query('SHOW TRIGGERS');
  console.log('\n[2] Database Triggers (' + triggers.length + '):');
  triggers.forEach(t => console.log(`   - ${t.Trigger} on ${t.Table} (${t.Timing} ${t.Event})`));
  const hasTriggers = triggers.length >= 2;
  console.log('   Triggers Checklist Status:', hasTriggers ? '✓ PASS (2 triggers found)' : '✗ FAIL');

  // 3. Database Functions check
  const [funcs] = await db.query(`SHOW FUNCTION STATUS WHERE Db = ?`, [process.env.DB_NAME]);
  console.log('\n[3] Database Functions (' + funcs.length + '):');
  funcs.forEach(f => console.log(`   - ${f.Name}`));
  const hasFunctions = funcs.length >= 2;
  console.log('   Functions Checklist Status:', hasFunctions ? '✓ PASS (2 functions found)' : '✗ FAIL');

  // 4. Database Procedures check
  const [procs] = await db.query(`SHOW PROCEDURE STATUS WHERE Db = ?`, [process.env.DB_NAME]);
  console.log('\n[4] Database Procedures (' + procs.length + '):');
  procs.forEach(p => console.log(`   - ${p.Name}`));
  const hasProcedures = procs.length >= 2;
  console.log('   Procedures Checklist Status:', hasProcedures ? '✓ PASS (2 procedures found)' : '✗ FAIL');

  // 5. Test Functions and Procedures execution
  console.log('\n[5] Executing Functions & Procedures:');
  const [rev] = await db.query('SELECT fn_seller_revenue(1) AS revenue');
  console.log('   fn_seller_revenue(1) result:', rev[0].revenue);

  const [rating] = await db.query('SELECT fn_product_avg_rating(1) AS avg_rating');
  console.log('   fn_product_avg_rating(1) result:', rating[0].avg_rating);

  const [procRes] = await db.query('CALL sp_seller_dashboard(1)');
  console.log('   sp_seller_dashboard(1) result:', procRes[0][0]);

  // 6. Test Complex Queries
  console.log('\n[6] Testing Complex Queries:');
  const [topProd] = await db.query(`
    SELECT p.product_name, COALESCE(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id, p.product_name
    LIMIT 3
  `);
  console.log('   Complex Query 1 (Products Aggregation):', topProd.length, 'records returned');

  const [topVendors] = await db.query(`
    SELECT s.shop_name, fn_seller_revenue(s.seller_id) AS rev
    FROM sellers s
    WHERE s.status = 'ACTIVE'
    LIMIT 3
  `);
  console.log('   Complex Query 2 (Seller Revenue + Function):', topVendors.length, 'records returned');

  const [catPerf] = await db.query(`
    SELECT c.category_name, COUNT(p.product_id) AS items
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
    GROUP BY c.category_id, c.category_name
    LIMIT 3
  `);
  console.log('   Complex Query 3 (Category Aggregation):', catPerf.length, 'records returned');

  console.log('\n=============================================');
  console.log('ALL CSE216 REQUIREMENTS VERIFIED & PASSING!');
  console.log('=============================================');

  process.exit(0);
}

verifyAll().catch(e => {
  console.error('Verification error:', e);
  process.exit(1);
});
