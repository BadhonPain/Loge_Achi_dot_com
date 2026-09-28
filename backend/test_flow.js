const axios = require('../frontend/node_modules/axios');

async function testFullFlow() {
  console.log('--- 1. Testing Customer Login ---');
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'customer@loge.com',
    password: 'customer123'
  });
  const token = loginRes.data.token;
  const customerId = loginRes.data.user.id;
  console.log('Logged in customer ID:', customerId);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  console.log('--- 2. Adding Products 1, 2, 5 to Cart ---');
  await axios.post(`http://localhost:5000/api/cart/${customerId}/items`, { product_id: 1, quantity: 1 }, authHeaders);
  await axios.post(`http://localhost:5000/api/cart/${customerId}/items`, { product_id: 2, quantity: 1 }, authHeaders);
  console.log('✔ Added 2 distinct products to cart');

  console.log('--- 3. Fetching Cart ---');
  const cartRes = await axios.get(`http://localhost:5000/api/cart/${customerId}`, authHeaders);
  console.log('Cart Items Count:', cartRes.data.count, '| Total Price: ৳' + cartRes.data.cart_total);

  console.log('--- 4. Ensuring Delivery Address ---');
  let addrRes = await axios.get(`http://localhost:5000/api/addresses/${customerId}/addresses`);
  let addressId = addrRes.data.data[0].address_id;
  console.log('Delivery Address ID:', addressId);

  console.log('--- 5. Placing Order ---');
  const orderRes = await axios.post('http://localhost:5000/api/orders', {
    address_id: addressId,
    payment_method: 'CASH_ON_DELIVERY'
  }, authHeaders);
  console.log('✔ ORDER PLACED SUCCESSFULLY. Order ID:', orderRes.data.order_id);

  console.log('--- 6. Verifying Admin Dashboard & Orders ---');
  const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@loge.com',
    password: 'admin123'
  });
  const adminHeaders = { headers: { Authorization: `Bearer ${adminLogin.data.token}` } };
  const adminStats = await axios.get('http://localhost:5000/api/admin/dashboard', adminHeaders);
  console.log('✔ Admin Platform Metrics:', adminStats.data.data);

  const adminOrders = await axios.get('http://localhost:5000/api/admin/orders', adminHeaders);
  console.log('✔ Admin Orders Count:', adminOrders.data.count);

  console.log('--- 7. Verifying Seller Dashboard & Orders ---');
  const sellerLogin = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'vendor.1@loge.com',
    password: 'seller123'
  });
  const sellerHeaders = { headers: { Authorization: `Bearer ${sellerLogin.data.token}` } };
  const sellerOrders = await axios.get('http://localhost:5000/api/orders/seller/me', sellerHeaders);
  console.log('✔ Seller Received Orders Count:', sellerOrders.data.data.length);
  console.log('✔ Seller Order Detail:', sellerOrders.data.data[0]);

  console.log('\n======================================================');
  console.log('✔ ALL THREE ROLES (CUSTOMER, SELLER, ADMIN) VERIFIED!');
  console.log('======================================================');
  process.exit(0);
}

testFullFlow().catch(err => {
  console.error('TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
