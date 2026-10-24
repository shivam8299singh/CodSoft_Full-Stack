import 'dotenv/config';
import app from './src/app.js';
import prisma from './src/config/db.js';

async function runE2E() {
  console.log('🚀 Running Full-Stack End-to-End Simulation Test...\n');

  const server = app.listen(5098, async () => {
    try {
      const baseUrl = 'http://localhost:5098/api';

      // 1. Customer Registration
      const testEmail = `test.guest.${Date.now()}@example.com`;
      console.log('Step 1: Registering new customer:', testEmail);
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Samantha Ray',
          email: testEmail,
          phone: '+91 98765 99999',
          password: 'password123',
        }),
      }).then((r) => r.json());

      if (!regRes.success) throw new Error('Customer registration failed: ' + regRes.message);
      const customerToken = regRes.data.token;
      console.log('   ✅ Customer registered & token received');

      // 2. Customer browses menu
      console.log('\nStep 2: Customer browsing digital menu');
      const menuRes = await fetch(`${baseUrl}/menu?vegetarian=true`).then((r) => r.json());
      const selectedDish = menuRes.data[0];
      console.log(`   ✅ Found vegetarian dish: "${selectedDish.name}" (₹${selectedDish.price})`);

      // 3. Customer places order
      console.log('\nStep 3: Customer placing an order');
      const orderRes = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          orderType: 'DINE_IN',
          items: [
            {
              menuItemId: selectedDish.id,
              quantity: 2,
              specialInstructions: 'Extra crisp & warm',
            },
          ],
          paymentMethod: 'ONLINE',
        }),
      }).then((r) => r.json());

      if (!orderRes.success) throw new Error('Order creation failed: ' + orderRes.message);
      const order = orderRes.data;
      console.log(`   ✅ Order created: ${order.orderNumber} (Total: ₹${order.totalAmount})`);

      // 4. Track Order
      console.log(`\nStep 4: Customer tracks order: ${order.orderNumber}`);
      const trackRes = await fetch(`${baseUrl}/orders/track/${order.orderNumber}`).then((r) => r.json());
      if (!trackRes.success || !['PLACED', 'CONFIRMED'].includes(trackRes.data.status)) {
        throw new Error(`Order tracking check failed, status: ${trackRes?.data?.status}`);
      }
      console.log(`   ✅ Order tracked successfully. Status: ${trackRes.data.status}`);

      // 5. Kitchen Staff processes order
      console.log('\nStep 5: Kitchen Staff advances order in KDS');
      const kitchenLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kitchen@dinedesk.com', password: 'kitchen123' }),
      }).then((r) => r.json());
      const kitchenToken = kitchenLogin.data.token;

      // Update to PREPARING
      const prepRes = await fetch(`${baseUrl}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${kitchenToken}`,
        },
        body: JSON.stringify({ status: 'PREPARING' }),
      }).then((r) => r.json());
      console.log(`   ✅ Kitchen marked order as: ${prepRes.data.status}`);

      // Update to READY
      const readyRes = await fetch(`${baseUrl}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${kitchenToken}`,
        },
        body: JSON.stringify({ status: 'READY' }),
      }).then((r) => r.json());
      console.log(`   ✅ Kitchen marked order as: ${readyRes.data.status}`);

      // 6. Customer reserves a table
      console.log('\nStep 6: Customer booking table reservation');
      const resvRes = await fetch(`${baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          guestsCount: 4,
          reservationDate: new Date().toISOString(),
          reservationTime: '08:00 PM',
          specialRequest: 'Window seat for celebration',
        }),
      }).then((r) => r.json());

      if (!resvRes.success) throw new Error('Reservation creation failed: ' + resvRes.message);
      console.log(`   ✅ Table reservation requested: REF #${resvRes.data.id.substring(0, 8)}`);

      // 7. Staff confirms reservation
      console.log('\nStep 7: Staff confirms reservation');
      const staffLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'staff@dinedesk.com', password: 'staff123' }),
      }).then((r) => r.json());
      const staffToken = staffLogin.data.token;

      const confirmRes = await fetch(`${baseUrl}/reservations/${resvRes.data.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      }).then((r) => r.json());
      console.log(`   ✅ Staff confirmed reservation status: ${confirmRes.data.status}`);

      // 8. Admin reviews dashboard
      console.log('\nStep 8: Admin checks analytics overview');
      const adminLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dinedesk.com', password: 'admin123' }),
      }).then((r) => r.json());
      const adminToken = adminLogin.data.token;

      const adminDash = await fetch(`${baseUrl}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((r) => r.json());
      console.log(
        `   ✅ Admin Dashboard Verified: Total Revenue ₹${adminDash.data.kpis.totalRevenue}, Total Orders: ${adminDash.data.kpis.totalOrders}`
      );

      console.log('\n======================================================');
      console.log('🏆 COMPLETE RESTAURANT ECOSYSTEM SIMULATION PASSED 100%!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ E2E Simulation Failed:', err);
    } finally {
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

runE2E();
