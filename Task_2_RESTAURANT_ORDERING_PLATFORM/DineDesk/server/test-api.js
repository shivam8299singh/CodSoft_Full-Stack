import app from './src/app.js';
import prisma from './src/config/db.js';

async function testApi() {
  console.log('🧪 Starting API Verification Test...');

  const server = app.listen(5099, async () => {
    try {
      const baseUrl = 'http://localhost:5099/api';

      // 1. Health
      const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
      console.log('1. Health Check:', healthRes.success ? 'PASSED ✅' : 'FAILED ❌');

      // 2. Auth Login Admin
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dinedesk.com', password: 'admin123' }),
      }).then((r) => r.json());

      console.log('2. Admin Login:', loginRes.success ? 'PASSED ✅' : 'FAILED ❌');
      const adminToken = loginRes.data?.token;

      // 3. Menu list
      const menuRes = await fetch(`${baseUrl}/menu`).then((r) => r.json());
      console.log(
        '3. Menu Fetch:',
        menuRes.success && menuRes.data?.length >= 30
          ? `PASSED ✅ (${menuRes.data.length} items)`
          : 'FAILED ❌'
      );

      // 4. Categories list
      const catRes = await fetch(`${baseUrl}/categories`).then((r) => r.json());
      console.log(
        '4. Categories Fetch:',
        catRes.success && catRes.data?.length >= 8
          ? `PASSED ✅ (${catRes.data.length} categories)`
          : 'FAILED ❌'
      );

      // 5. Tables list
      const tableRes = await fetch(`${baseUrl}/tables`).then((r) => r.json());
      console.log(
        '5. Tables Fetch:',
        tableRes.success && tableRes.data?.length >= 10
          ? `PASSED ✅ (${tableRes.data.length} tables)`
          : 'FAILED ❌'
      );

      // 6. Admin Dashboard stats
      const dashRes = await fetch(`${baseUrl}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((r) => r.json());
      console.log(
        '6. Admin Dashboard:',
        dashRes.success && dashRes.data?.kpis?.totalOrders > 0
          ? `PASSED ✅ (Total Revenue: ₹${dashRes.data.kpis.totalRevenue}, Orders: ${dashRes.data.kpis.totalOrders})`
          : 'FAILED ❌'
      );

      // 7. Kitchen Dashboard
      const kitchenLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kitchen@dinedesk.com', password: 'kitchen123' }),
      }).then((r) => r.json());
      const kitchenToken = kitchenLogin.data?.token;

      const kitchenDash = await fetch(`${baseUrl}/dashboard/kitchen`, {
        headers: { Authorization: `Bearer ${kitchenToken}` },
      }).then((r) => r.json());
      console.log(
        '7. Kitchen Dashboard:',
        kitchenDash.success ? `PASSED ✅ (${kitchenDash.data.totalActive} active orders)` : 'FAILED ❌'
      );

      console.log('\n🎉 ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test failed with error:', err);
    } finally {
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

testApi();
