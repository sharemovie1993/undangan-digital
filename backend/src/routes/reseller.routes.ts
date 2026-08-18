import { FastifyInstance } from 'fastify';
import { ResellerController } from '../controllers/reseller.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export async function registerResellerRoutes(fastify: FastifyInstance) {
  fastify.register(async function (resellerApp) {
    resellerApp.addHook('preHandler', verifyAuth);

    resellerApp.get('/api/reseller/profile', ResellerController.getProfile);
    resellerApp.get('/api/reseller/analytics', ResellerController.getAnalytics);
  });
}
