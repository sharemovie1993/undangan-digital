import { FastifyInstance } from 'fastify';
import { EasyTunnelController } from '../controllers/easy-tunnel.controller';
import { verifyAuth, optionalAuth } from '../../../middlewares/auth.middleware';

export const registerEasyTunnelRoutes = (fastify: FastifyInstance) => {
  // WireGuard & Status
  fastify.get('/api/easy-tunnel/wg-check', EasyTunnelController.checkWgInstalled);
  fastify.post('/api/easy-tunnel/wg-install', EasyTunnelController.installWg);
  
  // Package & Payment Channels
  fastify.get('/api/easy-tunnel/packages', EasyTunnelController.getPackages);
  fastify.get('/api/easy-tunnel/payment-channels', EasyTunnelController.getPaymentChannels);
  fastify.get('/api/easy-tunnel/check-slug/:slug', EasyTunnelController.checkSlug);
  fastify.get('/api/easy-tunnel/validate/:key', EasyTunnelController.validateKey);
  fastify.get('/api/easy-tunnel/invoice-status/:invoice', EasyTunnelController.checkInvoice);
  fastify.get('/api/easy-tunnel/license-status/:key', EasyTunnelController.checkLicense);
  fastify.post('/api/easy-tunnel/buy-license', { preHandler: [optionalAuth] }, EasyTunnelController.buyLicense);
  fastify.post('/api/easy-tunnel/release-license', { preHandler: [optionalAuth] }, EasyTunnelController.releaseLicenseKey);

  // Tunnel Management (CRUD & Control)
  fastify.get('/api/easy-tunnel', { preHandler: [optionalAuth] }, EasyTunnelController.getTunnels);
  fastify.get('/api/easy-tunnel/:id', { preHandler: [optionalAuth] }, EasyTunnelController.getTunnelById);
  fastify.post('/api/easy-tunnel/setup', { preHandler: [optionalAuth] }, EasyTunnelController.setupTunnel);
  fastify.post('/api/easy-tunnel/:id/start', { preHandler: [optionalAuth] }, EasyTunnelController.startTunnel);
  fastify.post('/api/easy-tunnel/:id/stop', { preHandler: [optionalAuth] }, EasyTunnelController.stopTunnel);
  fastify.get('/api/easy-tunnel/:id/diagnose', { preHandler: [optionalAuth] }, EasyTunnelController.diagnoseTunnel);
  fastify.put('/api/easy-tunnel/:id', { preHandler: [optionalAuth] }, EasyTunnelController.editTunnel);
  fastify.delete('/api/easy-tunnel/:id', { preHandler: [optionalAuth] }, EasyTunnelController.deleteTunnel);

  // Custom Domain
  fastify.post('/api/easy-tunnel/:id/custom-domain', { preHandler: [optionalAuth] }, EasyTunnelController.setCustomDomain);
  fastify.delete('/api/easy-tunnel/:id/custom-domain', { preHandler: [optionalAuth] }, EasyTunnelController.removeCustomDomain);
};
