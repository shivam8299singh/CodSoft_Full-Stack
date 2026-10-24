import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

export const prisma = new PrismaClient();
export let isDatabaseConnected = false;

export async function connectDB() {
  try {
    // Try to connect to PostgreSQL
    await prisma.$connect();
    isDatabaseConnected = true;
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
  } catch (error) {
    isDatabaseConnected = false;
    console.warn('⚠️  PostgreSQL connection unavailable:');
    console.warn(`   ${error.message}`);
    console.log('💡 Activated EduManage In-Memory Data Store (Pre-seeded with Admin, 5 Teachers, 30 Students, Attendance, Exams, Fees).');
    console.log('💡 To persist to PostgreSQL, ensure PostgreSQL is running and execute: npm run db:setup');
  }
}
