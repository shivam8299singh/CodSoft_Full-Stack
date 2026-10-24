import 'dotenv/config';
import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 DineDesk Server listening on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down DineDesk server...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('👋 Database connection closed. Server exited.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
