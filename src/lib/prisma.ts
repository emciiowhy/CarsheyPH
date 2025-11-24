// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

// Prevent multiple instances in dev (hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Get connection string
const connectionString = process.env.DATABASE_URL;

// ⭐ ADD THIS: Debug logging
console.log('🔍 DATABASE_URL exists:', !!connectionString);
console.log('🔍 DATABASE_URL length:', connectionString?.length || 0);
console.log('🔍 DATABASE_URL starts with:', connectionString?.substring(0, 15));

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

// Create Pool instance
const pool = new Pool({ connectionString });

// Create Prisma adapter - suppress type error
// @ts-ignore
const adapter = new PrismaNeon(pool);

// Create Prisma client
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;