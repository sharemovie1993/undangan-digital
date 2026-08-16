import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { registerApiRoutes } from './routes/api.routes';
import { config } from './config/app.config';
import { WireguardManager } from './services/wireguardManager';
import { EasyTunnelService } from './modules/easy-tunnel/services/easy-tunnel.service';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const fastify = Fastify({
  logger: {
    level: 'info'
  },
  bodyLimit: 30 * 1024 * 1024 // 30 MB body limit
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

    // Auto-seed admin user
    await seedAdminUser();

    // CORS configuration
    await fastify.register(cors, {
      origin: true,
      credentials: true
    });

    // Form body parser
    await fastify.register(formbody);

    // Multipart file upload parser (up to 15MB)
    await fastify.register(multipart, {
      limits: {
        fileSize: 15 * 1024 * 1024,
        files: 10
      }
    });

    // Serve static files from /uploads
    await fastify.register(fastifyStatic, {
      root: config.uploadDir,
      prefix: '/uploads/'
    });

    // Health check endpoint
    fastify.get('/health', async () => ({
      status: 'ok',
      service: 'LuxeInvite Backend 360',
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
