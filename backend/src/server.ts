import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { registerApiRoutes } from './routes/api.routes';
import { config } from './config/app.config';
import fs from 'fs';

const fastify = Fastify({
  logger: {
    level: 'info'
  },
  bodyLimit: 30 * 1024 * 1024 // 30 MB body limit
});

const start = async () => {
  try {
    // Ensure upload directory exists
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }

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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
