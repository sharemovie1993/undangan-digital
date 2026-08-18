import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { InvitationController } from '../controllers/invitation.controller';
import { GuestController } from '../controllers/guest.controller';
import { RsvpController } from '../controllers/rsvp.controller';
import { OrderController } from '../controllers/order.controller';
import { PrintController } from '../controllers/print.controller';
import { UploadController } from '../controllers/upload.controller';
import { StitchController } from '../controllers/stitch.controller';
import { ThemeController } from '../controllers/theme.controller';
import { registerEasyTunnelRoutes } from '../modules/easy-tunnel/routes/easy-tunnel.routes';
import { registerBackupRoutes } from '../modules/backup/routes/backup.routes';
import { registerAdminRoutes } from './admin.routes';
import { registerResellerRoutes } from './reseller.routes';
import { verifyAuth, optionalAuth } from '../middlewares/auth.middleware';

export const registerApiRoutes = (fastify: FastifyInstance) => {
  // 1. Auth & Profile
  fastify.post('/api/auth/register', AuthController.register);
  fastify.post('/api/auth/login', AuthController.login);
  fastify.post('/api/auth/whatsapp-login', AuthController.loginWithWhatsApp);
  fastify.post('/api/auth/send-otp', AuthController.sendOtp);
  fastify.post('/api/auth/verify-otp', AuthController.verifyOtp);
  fastify.get('/api/auth/me', { preHandler: [verifyAuth] }, AuthController.me);

  // 2. Multipart Storage Uploads
  fastify.post('/api/upload/image', UploadController.uploadImage);
  fastify.post('/api/upload/multiple-images', UploadController.uploadMultipleImages);
  fastify.post('/api/upload/audio', UploadController.uploadAudio);

  // 3. Invitations CRUD & Duplicate (Multi-Tenant Isolated)
  fastify.get('/api/public/verify-custom-domain', InvitationController.verifyCustomDomain);
  fastify.get('/api/invitations/list', { preHandler: [optionalAuth] }, InvitationController.list);
  fastify.get('/api/invitations/slug/:slug', InvitationController.getBySlug);
  fastify.get('/api/invitations/:id', InvitationController.getById);
  fastify.post('/api/invitations/save', { preHandler: [optionalAuth] }, InvitationController.save);
  fastify.post('/api/invitations/:id/duplicate', { preHandler: [optionalAuth] }, InvitationController.duplicate);
  fastify.delete('/api/invitations/:id', { preHandler: [optionalAuth] }, InvitationController.delete);

  // 4. Guests, QR, CSV Export & Bulk Import
  fastify.get('/api/guests/:invitationId', GuestController.list);
  fastify.post('/api/guests/add', GuestController.add);
  fastify.post('/api/guests/bulk', GuestController.bulkImport);
  fastify.post('/api/guests/checkin', GuestController.checkIn);
  fastify.post('/api/guests/track-open', GuestController.trackOpen);
  fastify.get('/api/guests/:invitationId/export-csv', GuestController.exportCsv);
  fastify.delete('/api/guests/:id', GuestController.delete);

  // 5. RSVP & Guestbook
  fastify.get('/api/rsvps/:invitationId', RsvpController.list);
  fastify.post('/api/rsvps/submit', RsvpController.submit);
  fastify.post('/api/rsvps/:id/like', RsvpController.like);
  fastify.delete('/api/rsvps/:id', RsvpController.delete);

  // 6. License Server & Automated Webhook
  fastify.get('/api/license/packages', OrderController.getPackages);
  fastify.get('/api/license/payment-channels', OrderController.getPaymentChannels);
  fastify.post('/api/license/create-order', { preHandler: [optionalAuth] }, OrderController.createOrder);
  fastify.post('/api/license/activate-with-token', { preHandler: [optionalAuth] }, OrderController.activateWithToken);
  fastify.post('/api/license/transfer', { preHandler: [optionalAuth] }, OrderController.transferLicense);
  fastify.get('/api/license/my-orders', { preHandler: [optionalAuth] }, OrderController.getMyOrders);
  fastify.get('/api/license/check-status/:invoiceNumber', OrderController.checkStatus);
  fastify.post('/api/license/webhook', OrderController.handleWebhook);
  fastify.post('/api/license/simulate-paid/:invoiceNumber', OrderController.simulatePaid);

  // 7. Print 300 DPI Vector PDF Suite
  fastify.get('/api/print/card/:invitationId', PrintController.downloadCard);
  fastify.get('/api/print/stickers/:invitationId', PrintController.downloadStickers);
  fastify.get('/api/print/souvenir-tags/:invitationId', PrintController.downloadSouvenirTags);
  fastify.get('/api/print/table-standee/:invitationId', PrintController.downloadTableStandee);

  // 8. Google Stitch Engine Catalog & Validator
  fastify.get('/api/stitch/manifests', StitchController.getManifests);
  fastify.post('/api/stitch/validate', StitchController.validateComposition);

  // 9. Realtime Themes & Master Style Kits Catalog (Database-Driven)
  fastify.get('/api/themes', ThemeController.getAllThemes);
  fastify.get('/api/themes/style-kits', ThemeController.getAllStyleKits);
  fastify.get('/api/style-kits', ThemeController.getAllStyleKits);
  fastify.post('/api/themes', { preHandler: [verifyAuth] }, ThemeController.createTheme);

  // 10. Easy-Tunnel WireGuard Engine
  registerEasyTunnelRoutes(fastify);

  // 11. Full UI Backup & Disaster Recovery System
  registerBackupRoutes(fastify);

  // 12. Super Admin Suite & User Management (Zero-Leak RBAC)
  registerAdminRoutes(fastify);

  // 13. Reseller Partner Hub & Profit Analytics Suite
  registerResellerRoutes(fastify);
};
