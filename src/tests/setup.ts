import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// For Jest
import { beforeAll, afterAll } from '@jest/globals';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test')
});

// Set up global test configuration
beforeAll(() => {
  // Set mock Stripe keys for testing
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
  process.env.STRIPE_PRICE_ID = 'price_mock_id';
  
  // Use test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'sqlite:./prisma/test.db';
});

// Create a singleton Prisma client for tests
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'sqlite:./prisma/test.db',
    },
  },
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Helper function to clear test database between tests
export async function clearDatabase() {
  const tablesToTruncate = [
    'AdminLog',
    'Notification',
    'Friend',
    'ChatMessage',
    'CircleMember', 
    'Circle',
    'EventAttendee',
    'Event',
    'UserProfile',
    'Subscription',
    'File',
    'Session',
    'Account',
    'User',
    'Community'
  ];
  
  // Disable foreign key checks
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  
  // Truncate tables
  for (const table of tablesToTruncate) {
    await prisma.$executeRaw`DELETE FROM "${table}";`;
  }
  
  // Enable foreign key checks
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
} 