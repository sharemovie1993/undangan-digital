import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * 🚀 High-Performance Database Engine Optimizer
 * Sets WAL mode, 64MB Cache, and In-Memory Temp storage for extreme read/write speeds
 */
export async function optimizeDatabase() {
  try {
    // 1. WAL mode: enables concurrent multi-threaded reads while writing
    await prisma.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`);
    // 2. Synchronous NORMAL: optimal balance of durability and 10x faster write throughput
    await prisma.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
    // 3. 64MB Cache: keep hot index & data pages in RAM
    await prisma.$executeRawUnsafe(`PRAGMA cache_size = -64000;`);
    // 4. In-Memory Temp Tables: prevents slow disk I/O on temporary queries
    await prisma.$executeRawUnsafe(`PRAGMA temp_store = MEMORY;`);
    // 5. Memory-mapped I/O (up to 256MB)
    await prisma.$executeRawUnsafe(`PRAGMA mmap_size = 268435456;`);
    // 6. Optimize query planner
    await prisma.$executeRawUnsafe(`PRAGMA optimize;`);
    console.log('[Database Engine] 🚀 SQLite WAL + 64MB Cache + MMAP Optimizations applied successfully!');
  } catch (err: any) {
    console.warn('[Database Engine] PRAGMA Notice:', err.message);
  }
}
