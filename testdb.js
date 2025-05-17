// Test database connectivity
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful:', result);
    
    // Get list of tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table'
    `;
    console.log('Tables in database:', tables);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 