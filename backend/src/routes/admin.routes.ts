import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export async function registerAdminRoutes(fastify: FastifyInstance) {
  // Seluruh endpoint admin dilindungi oleh verifyAuth
  fastify.register(async function (adminApp) {
    adminApp.addHook('preHandler', verifyAuth);

    // Manajemen Pengguna
    adminApp.get('/api/admin/users', AdminController.listUsers);
    adminApp.patch('/api/admin/users/:id/tokens', AdminController.updateUserToken);
    adminApp.patch('/api/admin/users/:id/role', AdminController.updateUserRole);

    // Kontrol Undangan Super Admin
    adminApp.post('/api/admin/invitations/:id/transfer', AdminController.transferInvitationOwnership);
    adminApp.patch('/api/admin/invitations/:id/override', AdminController.overrideInvitationStatus);
  });
}
