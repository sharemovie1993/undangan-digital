import { FastifyInstance } from 'fastify';
import { EasyTunnelController } from '../controllers/easy-tunnel.controller';
import { verifyAdmin } from '../../../middlewares/auth.middleware';

export const registerEasyTunnelRoutes = (fastify: FastifyInstance) => {
  // WireGuard & Status (Admin Only)
  fastify.get('/api/easy-tunnel/wg-check', { preHandler: [verifyAdmin] }, EasyTunnelController.checkWgInstalled);
  fastify.post('/api/easy-tunnel/wg-install', { preHandler: [verifyAdmin] }, EasyTunnelController.installWg);
  
  // Package & Payment Channels (Admin Only)
  fastify.get('/api/easy-tunnel/packages', { preHandler: [verifyAdmin] }, EasyTunnelController.getPackages);
  fastify.get('/api/easy-tunnel/payment-channels', { preHandler: [verifyAdmin] }, EasyTunnelController.getPaymentChannels);
  fastify.get('/api/easy-tunnel/check-slug/:slug', { preHandler: [verifyAdmin] }, EasyTunnelController.checkSlug);
  fastify.get('/api/easy-tunnel/validate/:key', { preHandler: [verifyAdmin] }, EasyTunnelController.validateKey);
  fastify.get('/api/easy-tunnel/invoice-status/:invoice', { preHandler: [verifyAdmin] }, EasyTunnelController.checkInvoice);
  fastify.get('/api/easy-tunnel/license-status/:key', { preHandler: [verifyAdmin] }, EasyTunnelController.checkLicense);
  fastify.post('/api/easy-tunnel/buy-license', { preHandler: [verifyAdmin] }, EasyTunnelController.buyLicense);
  fastify.post('/api/easy-tunnel/release-license', { preHandler: [verifyAdmin] }, EasyTunnelController.releaseLicenseKey);

  // Tunnel Management CRUD & Control (Admin Only)
  fastify.get('/api/easy-tunnel', { preHandler: [verifyAdmin] }, EasyTunnelController.getTunnels);
  fastify.get('/api/easy-tunnel/:id', { preHandler: [verifyAdmin] }, EasyTunnelController.getTunnelById);
  fastify.post('/api/easy-tunnel/setup', { preHandler: [verifyAdmin] }, EasyTunnelController.setupTunnel);
  fastify.post('/api/easy-tunnel/:id/start', { preHandler: [verifyAdmin] }, EasyTunnelController.startTunnel);
  fastify.post('/api/easy-tunnel/:id/stop', { preHandler: [verifyAdmin] }, EasyTunnelController.stopTunnel);
  fastify.get('/api/easy-tunnel/:id/diagnose', { preHandler: [verifyAdmin] }, EasyTunnelController.diagnoseTunnel);
  fastify.put('/api/easy-tunnel/:id', { preHandler: [verifyAdmin] }, EasyTunnelController.editTunnel);
  fastify.delete('/api/easy-tunnel/:id', { preHandler: [verifyAdmin] }, EasyTunnelController.deleteTunnel);

  // Custom Domain (Admin Only)
  fastify.post('/api/easy-tunnel/:id/custom-domain', { preHandler: [verifyAdmin] }, EasyTunnelController.setCustomDomain);
  fastify.delete('/api/easy-tunnel/:id/custom-domain', { preHandler: [verifyAdmin] }, EasyTunnelController.removeCustomDomain);
};
