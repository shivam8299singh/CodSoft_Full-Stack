import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully via Prisma.');

    app.listen(PORT, () => {
      console.log(`🚀 MarketHub Backend Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database or start server:', error);
    process.exit(1);
  }
}

startServer();
