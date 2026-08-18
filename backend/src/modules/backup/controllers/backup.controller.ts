import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import { BackupService } from '../services/backup.service';

export class BackupController {
  /**
   * POST /api/backup/create
   * Memicu pembuatan file zip backup di server
   */
  public static async createBackup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN' || (user?.role || '').toUpperCase() === 'OWNER';
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          message: 'Akses ditolak. Fitur backup hanya dapat dijalankan oleh Administrator / Owner.'
        });
      }

      const body = (request.body as any) || {};
      const includeMedia = body.includeMedia !== false;

      const result = await BackupService.createBackup({ includeMedia });

      return reply.send({
        success: true,
        message: 'Berkas backup berhasil dibuat.',
        data: result
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal membuat berkas backup.'
      });
    }
  }

  /**
   * GET /api/backup/list
   * Mengambil daftar riwayat file backup di server
   */
  public static async listBackups(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN' || (user?.role || '').toUpperCase() === 'OWNER';
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          message: 'Akses ditolak. Fitur backup hanya dapat diakses oleh Administrator / Owner.'
        });
      }

      const list = await BackupService.listBackups();
      return reply.send({
        success: true,
        data: list
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal mengambil riwayat backup.'
      });
    }
  }

  /**
   * GET /api/backup/download/:filename
   * Mengunduh berkas ZIP backup ke komputer klien
   */
  public static async downloadBackup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { filename } = request.params as { filename: string };
      const filePath = BackupService.getBackupFilePath(filename);

      const stream = fs.createReadStream(filePath);
      return reply
        .header('Content-Type', 'application/zip')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(stream);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(404).send({
        success: false,
        message: err.message || 'Berkas backup tidak ditemukan.'
      });
    }
  }

  /**
   * DELETE /api/backup/:filename
   * Menghapus berkas ZIP backup di server
   */
  public static async deleteBackup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN' || (user?.role || '').toUpperCase() === 'OWNER';
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          message: 'Akses ditolak.'
        });
      }

      const { filename } = request.params as { filename: string };
      const deleted = BackupService.deleteBackup(filename);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: `Berkas "${filename}" tidak ditemukan.`
        });
      }

      return reply.send({
        success: true,
        message: `Berkas backup "${filename}" berhasil dihapus.`
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal menghapus berkas backup.'
      });
    }
  }

  /**
   * POST /api/backup/restore
   * Menerima upload file zip dan melakukan restore database + uploads
   */
  public static async restoreBackup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN' || (user?.role || '').toUpperCase() === 'OWNER';
      if (!isAdmin) {
        return reply.status(403).send({
          success: false,
          message: 'Akses ditolak. Pemulihan sistem hanya dapat dijalankan oleh Administrator / Owner.'
        });
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          success: false,
          message: 'Tidak ada berkas ZIP yang diunggah. Silakan pilih berkas backup Anda.'
        });
      }

      const buffer = await data.toBuffer();
      if (!buffer || buffer.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Berkas yang diunggah kosong atau rusak.'
        });
      }

      const result = await BackupService.restoreBackup(buffer);

      return reply.send({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal melakukan pemulihan data dari berkas backup.'
      });
    }
  }
}
