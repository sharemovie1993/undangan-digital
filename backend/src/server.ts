import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import etag from '@fastify/etag';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { registerApiRoutes } from './routes/api.routes';
import { config } from './config/app.config';
import { WireguardManager } from './services/wireguardManager';
import { EasyTunnelService } from './modules/easy-tunnel/services/easy-tunnel.service';
import { prisma, optimizeDatabase } from './db';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const fastify = Fastify({
  logger: {
    level: 'info'
  },
  bodyLimit: 1024 * 1024 * 1024 // 1 GB body limit for Large Full Media Backups
});

async function seedAdminUser() {
  try {
    const adminEmail = 'admin@absenta.id';
    const ownerPhone = '+6281912526367';
    
    // Cari user admin / owner
    let admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { phone: ownerPhone },
          { phone: '081912526367' },
          { phone: '6281912526367' }
        ]
      }
    });

    const passwordHash = await bcrypt.hash('admin123', 10);

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          name: 'Master Administrator (Owner)',
          email: adminEmail,
          phone: ownerPhone,
          password: passwordHash,
          role: 'ADMIN',
          quotaTokens: 999
        }
      });
      console.log('[Auth] Akun Admin default dibuat: admin@absenta.id / 081912526367 (Password: admin123)');
    } else if (admin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'ADMIN', quotaTokens: 999 }
      });
      console.log(`[Auth] User ${admin.name} (${admin.email || admin.phone}) di-upgrade ke role ADMIN.`);
    }
  } catch (err: any) {
    console.warn('[Auth] Gagal sinkronisasi akun admin:', err.message);
  }
}

const start = async () => {
  try {
    // Ensure upload directory and tunnels directory exist
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
    WireguardManager.ensureTunnelsDir();

    // 🚀 Performance Optimization: SQLite WAL Mode + In-Memory PRAGMA Cache
    await optimizeDatabase();

    // Auto-seed admin user
    await seedAdminUser();

    // 1. PERFORMANCE: Dynamic Gzip & Deflate Response Compression (Reduces payload size by up to 75%)
    await fastify.register(compress, {
      global: true,
      encodings: ['gzip', 'deflate'],
      threshold: 1024 // Only compress responses > 1KB
    });

    // 2. PERFORMANCE: HTTP ETag & 304 Caching for fast revalidation
    await fastify.register(etag);

    // 3. SECURITY HARDENING: Helmet HTTP Security Headers
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Disables strict CSP to allow rich audio/image CDNs
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    });

    // 4. SECURITY HARDENING: Rate Limiting & DDoS Prevention (300 req/min per IP)
    await fastify.register(rateLimit, {
      max: 300,
      timeWindow: '1 minute',
      allowList: ['127.0.0.1', 'localhost'],
      errorResponseBuilder: (_req, context) => ({
        success: false,
        message: `Terlalu banyak permintaan (Rate limit exceeded). Coba lagi dalam ${context.after}.`
      })
    });

    // 5. CORS configuration
    await fastify.register(cors, {
      origin: true,
      credentials: true
    });

    // 6. Form body parser
    await fastify.register(formbody);

    // 7. Multipart file upload parser (up to 1GB for Full Disaster Recovery Backups)
    await fastify.register(multipart, {
      limits: {
        fileSize: 1024 * 1024 * 1024,
        files: 10
      }
    });

    // 8. Serve static files from /uploads with HTTP Range & Cache-Control for ultra-smooth audio streaming
    await fastify.register(fastifyStatic, {
      root: config.uploadDir,
      prefix: '/uploads/',
      maxAge: '30d',
      immutable: true,
      acceptRanges: true,
      cacheControl: true
    });

    // 9. Global Error Sanitization (Prevent stack trace leak to public)
    fastify.setErrorHandler((error: any, _request, reply) => {
      fastify.log.error(error);
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({
        success: false,
        message: statusCode === 500 ? 'Terjadi kendala pada server internal.' : error.message
      });
    });

    // Health check endpoint
    fastify.get('/health', async () => ({
      status: 'ok',
      service: 'LuxeInvite Backend 360 (Hardened & Optimized)',
      timestamp: new Date().toISOString()
    }));

    // Register all API routes
    registerApiRoutes(fastify);

    await fastify.listen({ port: config.port, host: config.host });
    console.log(`[LuxeInvite Backend 360] Server running on http://localhost:${config.port}`);

    // Auto-start active Easy-Tunnel tunnels in background
    EasyTunnelService.autoStartActiveTunnels().catch(err => {
      console.warn('[EasyTunnel] Auto-start error on boot:', err.message);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
