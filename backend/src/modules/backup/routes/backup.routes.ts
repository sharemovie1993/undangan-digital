import { FastifyInstance } from 'fastify';
import { BackupController } from '../controllers/backup.controller';
import { verifyAuth } from '../../../middlewares/auth.middleware';

export const registerBackupRoutes = (fastify: FastifyInstance) => {
  // 1. Buat backup baru (Full / DB only)
  fastify.post('/api/backup/create', { preHandler: [verifyAuth] }, BackupController.createBackup);

  // 2. Daftar riwayat backup di server
  fastify.get('/api/backup/list', { preHandler: [verifyAuth] }, BackupController.listBackups);

  // 3. Unduh berkas backup ZIP (bisa via link browser / token query jika perlu, atau preHandler auth)
  fastify.get('/api/backup/download/:filename', { preHandler: [verifyAuth] }, BackupController.downloadBackup);

  // 4. Hapus berkas backup
  fastify.delete('/api/backup/:filename', { preHandler: [verifyAuth] }, BackupController.deleteBackup);

  // 5. Unggah & Restore berkas backup ZIP
  fastify.post('/api/backup/restore', { preHandler: [verifyAuth] }, BackupController.restoreBackup);
};
