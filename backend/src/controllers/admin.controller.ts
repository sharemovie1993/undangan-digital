import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import { invalidateInvitationCache } from './invitation.controller';

export class AdminController {
  /**
   * Helper: Validasi ketat hak akses SUPER ADMIN
   */
  private static verifyAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
    const user = (request as any).user;
    const role = (user?.role || '').toUpperCase();
    if (!user || role !== 'ADMIN') {
      reply.status(403).send({
        success: false,
        message: 'Akses ditolak: Operasi ini hanya diizinkan untuk Administrator.'
      });
      return false;
    }
    return true;
  }

  /**
   * GET /api/admin/users
   * Mengambil seluruh daftar pengguna terdaftar beserta metrik saldo token & jumlah undangan
   */
  public static async listUsers(request: FastifyRequest, reply: FastifyReply) {
    if (!AdminController.verifyAdmin(request, reply)) return;

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          quotaTokens: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              invitations: true,
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          quotaTokens: u.quotaTokens,
          invitationsCount: u._count.invitations,
          ordersCount: u._count.orders,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }))
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal mengambil data pengguna: ' + err.message
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id/tokens
   * Menambah atau menyesuaikan kuota token pengguna
   * Body: { amount: number, mode?: 'add' | 'set' }
   */
  public static async updateUserToken(request: FastifyRequest, reply: FastifyReply) {
    if (!AdminController.verifyAdmin(request, reply)) return;

    const { id } = request.params as { id: string };
    const { amount, mode = 'add' } = request.body as { amount: number; mode?: 'add' | 'set' };

    if (typeof amount !== 'number') {
      return reply.status(400).send({
        success: false,
        message: 'Parameter amount (jumlah token) harus berupa angka.'
      });
    }

    try {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return reply.status(404).send({
          success: false,
          message: 'Pengguna tidak ditemukan.'
        });
      }

      let newQuota = mode === 'set' ? Math.max(0, amount) : Math.max(0, targetUser.quotaTokens + amount);

      const updated = await prisma.user.update({
        where: { id },
        data: { quotaTokens: newQuota },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          quotaTokens: true
        }
      });

      return reply.send({
        success: true,
        message: `Saldo token untuk ${updated.name} berhasil diperbarui menjadi ${updated.quotaTokens} Token.`,
        data: updated
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal memperbarui saldo token pengguna: ' + err.message
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id/role
   * Mengubah hak akses role pengguna (USER, RESELLER, PERCETAKAN, ADMIN)
   * Body: { role: string }
   */
  public static async updateUserRole(request: FastifyRequest, reply: FastifyReply) {
    if (!AdminController.verifyAdmin(request, reply)) return;

    const { id } = request.params as { id: string };
    const { role } = request.body as { role: string };

    const validRoles = ['USER', 'RESELLER', 'PERCETAKAN', 'ADMIN'];
    const cleanRole = (role || '').toUpperCase();

    if (!validRoles.includes(cleanRole)) {
      return reply.status(400).send({
        success: false,
        message: `Role tidak valid. Pilihan role: ${validRoles.join(', ')}`
      });
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { role: cleanRole },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          quotaTokens: true
        }
      });

      return reply.send({
        success: true,
        message: `Role pengguna ${updated.name} berhasil diubah menjadi ${updated.role}.`,
        data: updated
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal memperbarui role pengguna: ' + err.message
      });
    }
  }

  /**
   * POST /api/admin/invitations/:id/transfer
   * Memindahkan kepemilikan undangan ke pengguna lain (Transfer Ownership)
   * Body: { targetUserId: string }
   */
  public static async transferInvitationOwnership(request: FastifyRequest, reply: FastifyReply) {
    if (!AdminController.verifyAdmin(request, reply)) return;

    const { id } = request.params as { id: string };
    const { targetUserId } = request.body as { targetUserId: string };

    if (!targetUserId) {
      return reply.status(400).send({
        success: false,
        message: 'targetUserId pengguna baru harus disertakan.'
      });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const inv = await tx.invitation.findUnique({
          where: { id },
          include: { user: true }
        });
        if (!inv) throw new Error('Undangan tidak ditemukan.');

        const targetUser = await tx.user.findUnique({
          where: { id: targetUserId }
        });
        if (!targetUser) throw new Error('Pengguna tujuan transfer tidak ditemukan.');

        const updatedInv = await tx.invitation.update({
          where: { id },
          data: { userId: targetUserId },
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true, role: true }
            }
          }
        });

        return {
          invitation: updatedInv,
          prevOwner: inv.user?.name || 'User Lain',
          newOwner: targetUser.name
        };
      });

      invalidateInvitationCache(result.invitation.slug);
      invalidateInvitationCache(id);

      return reply.send({
        success: true,
        message: `Kepemilikan undangan "${result.invitation.title}" berhasil dipindahkan dari ${result.prevOwner} ke ${result.newOwner}.`,
        data: result.invitation
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(400).send({
        success: false,
        message: err.message || 'Gagal memindahkan kepemilikan undangan.'
      });
    }
  }

  /**
   * PATCH /api/admin/invitations/:id/override
   * Mengubah status lisensi & fitur undangan secara langsung oleh Admin
   * Body: { status?: string, isWatermark?: boolean, allowPrintKit?: boolean, planId?: string }
   */
  public static async overrideInvitationStatus(request: FastifyRequest, reply: FastifyReply) {
    if (!AdminController.verifyAdmin(request, reply)) return;

    const { id } = request.params as { id: string };
    const { status, isWatermark, allowPrintKit, planId, licenseKey } = request.body as {
      status?: string;
      isWatermark?: boolean;
      allowPrintKit?: boolean;
      planId?: string;
      licenseKey?: string;
    };

    try {
      const updateData: any = {};
      if (typeof status === 'string') updateData.status = status;
      if (typeof isWatermark === 'boolean') updateData.isWatermark = isWatermark;
      if (typeof allowPrintKit === 'boolean') updateData.allowPrintKit = allowPrintKit;
      if (typeof planId === 'string') updateData.planId = planId;
      if (typeof licenseKey === 'string') updateData.licenseKey = licenseKey;

      const updated = await prisma.invitation.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, role: true }
          }
        }
      });

      invalidateInvitationCache(updated.slug);
      invalidateInvitationCache(id);

      return reply.send({
        success: true,
        message: `Status & Lisensi undangan "${updated.title}" berhasil diperbarui oleh Super Admin.`,
        data: updated
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal memperbarui status lisensi: ' + err.message
      });
    }
  }
}
