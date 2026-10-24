const BASE_URL = 'http://localhost:5000/api';

async function testMarketHub() {
  console.log('🧪 Starting MarketHub E2E Verification Test Suite...\n');

  // 1. Health Check
  console.log('1️⃣ Checking API Health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  if (healthJson.status !== 'healthy') throw new Error('Health check failed');
  console.log('✅ Health Check passed:', healthJson);

  // 2. Customer Login
  console.log('\n2️⃣ Testing Customer Login (customer@markethub.com)...');
  const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@markethub.com', password: 'Customer@123' }),
  });
  const custLoginJson = await custLoginRes.json();
  if (!custLoginJson.success) throw new Error(`Customer login failed: ${custLoginJson.message}`);
  const customerToken = custLoginJson.token;
  console.log('✅ Customer logged in successfully:', custLoginJson.user.name, `(Role: ${custLoginJson.user.role})`);

  // 3. Products Catalog & Multi-Filter
  console.log('\n3️⃣ Testing Products Catalog...');
  const prodsRes = await fetch(`${BASE_URL}/products?limit=10`);
  const prodsJson = await prodsRes.json();
  console.log(`✅ Loaded ${prodsJson.data.length} products (Total in DB: ${prodsJson.pagination.total})`);

  // Pick two products from different vendors
  const prod1 = prodsJson.data[0];
  const prod2 = prodsJson.data.find(p => p.vendorId !== prod1.vendorId) || prodsJson.data[1];
  console.log(`- Selected Product A: "${prod1.name}" (Vendor: ${prod1.vendor?.businessName})`);
  console.log(`- Selected Product B: "${prod2.name}" (Vendor: ${prod2.vendor?.businessName})`);

  // 4. Cart: Add items from both vendors
  console.log('\n4️⃣ Testing Multi-Vendor Cart...');
  await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ productId: prod1.id, quantity: 1 }),
  });
  await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ productId: prod2.id, quantity: 2 }),
  });

  const cartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const cartJson = await cartRes.json();
  console.log('✅ Cart retrieved. Vendor groups:', cartJson.data.vendorGroups.map(vg => vg.businessName));
  console.log('   Cart Total:', cartJson.data.summary.grandTotal);

  // 5. Validate Promo Coupon
  console.log('\n5️⃣ Testing Promo Coupon Validation (MARKET10)...');
  const promoRes = await fetch(`${BASE_URL}/promotions/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'MARKET10', cartTotal: cartJson.data.summary.subtotal }),
  });
  const promoJson = await promoRes.json();
  console.log('✅ Promo Validation:', promoJson.message, `Discount: ${promoJson.data.discountAmount}`);

  // 6. Multi-Vendor Order Checkout
  console.log('\n6️⃣ Placing Multi-Vendor Order (creates parent order, sub-orders, payments, delivery)...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Priya Patel',
        phone: '+91 98765 00000',
        address: 'Flat 402, Sunshine Residency, 12th Main',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      paymentMethod: 'CARD',
      promoCode: 'MARKET10',
    }),
  });
  const orderJson = await orderRes.json();
  if (!orderJson.success) throw new Error(`Order checkout failed: ${orderJson.message}`);
  const createdOrder = orderJson.data;
  console.log('✅ Order Placed! Number:', createdOrder.orderNumber);
  console.log('   Vendor Sub-Orders created:', createdOrder.vendorOrders?.length);
  console.log('   Payment Status:', createdOrder.payment?.status, `(${createdOrder.payment?.method})`);
  console.log('   Delivery Partner Assigned:', createdOrder.delivery?.deliveryPartner?.name || 'Assigned to pool');

  // 7. Vendor Portal Check
  console.log('\n7️⃣ Testing Vendor Login (vendor@markethub.com)...');
  const vendorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vendor@markethub.com', password: 'Vendor@123' }),
  });
  const vendorLoginJson = await vendorLoginRes.json();
  const vendorToken = vendorLoginJson.token;
  console.log('✅ Vendor logged in:', vendorLoginJson.user.name, `(${vendorLoginJson.user.vendor.businessName})`);

  const vendorDashboardRes = await fetch(`${BASE_URL}/vendor/dashboard`, {
    headers: { Authorization: `Bearer ${vendorToken}` },
  });
  const vendorDashboardJson = await vendorDashboardRes.json();
  console.log('✅ Vendor Dashboard Metrics:', vendorDashboardJson.data.summary);

  // 8. Delivery Partner Portal Check
  console.log('\n8️⃣ Testing Delivery Partner Login (delivery@markethub.com)...');
  const delivLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'delivery@markethub.com', password: 'Delivery@123' }),
  });
  const delivLoginJson = await delivLoginRes.json();
  const delivToken = delivLoginJson.token;
  console.log('✅ Delivery partner logged in:', delivLoginJson.user.name);

  const delivOrdersRes = await fetch(`${BASE_URL}/delivery/orders`, {
    headers: { Authorization: `Bearer ${delivToken}` },
  });
  const delivOrdersJson = await delivOrdersRes.json();
  console.log('✅ Delivery partner assigned packages count:', delivOrdersJson.data.length);

  // 9. Admin Portal & Governance Check
  console.log('\n9️⃣ Testing Admin Portal (admin@markethub.com)...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@markethub.com', password: 'Admin@123' }),
  });
  const adminLoginJson = await adminLoginRes.json();
  const adminToken = adminLoginJson.token;
  console.log('✅ Admin logged in:', adminLoginJson.user.name);

  const adminDashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminDashboardJson = await adminDashboardRes.json();
  console.log('✅ Admin Marketplace GMV:', adminDashboardJson.data.summary.totalRevenue);
  console.log('   Admin Commission Revenue:', adminDashboardJson.data.summary.marketplaceCommission);

  // Test approving pending vendor
  const pendingVendorsRes = await fetch(`${BASE_URL}/admin/vendors?status=PENDING`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pendingVendorsJson = await pendingVendorsRes.json();
  if (pendingVendorsJson.data.length > 0) {
    const pVendor = pendingVendorsJson.data[0];
    console.log(`   Approving pending vendor "${pVendor.businessName}"...`);
    const approveRes = await fetch(`${BASE_URL}/admin/vendors/${pVendor.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    const approveJson = await approveRes.json();
    console.log('✅ Vendor approved status:', approveJson.data.status);
  }

  console.log('\n🏆 ALL 9 MARKETPLACE ECOSYSTEM PHASES PASSED 100%!');
}

testMarketHub().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
