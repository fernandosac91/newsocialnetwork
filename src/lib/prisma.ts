import { PrismaClient } from '@prisma/client';

// Add prisma to the global TypeScript namespace
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Use existing client if it exists in global space (development)
// otherwise create a new client (production)
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 