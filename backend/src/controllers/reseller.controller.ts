import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';

export class ResellerController {
  /**
   * Helper: Validasi role Reseller / Percetakan / Admin
   */
  private static verifyResellerAccess(request: FastifyRequest, reply: FastifyReply): boolean {
    const user = (request as any).user;
    if (!user) {
      reply.status(401).send({ success: false, message: 'Autentikasi diperlukan.' });
      return false;
    }
    const role = (user.role || '').toUpperCase();
    if (!['RESELLER', 'PERCETAKAN', 'ADMIN', 'OWNER'].includes(role)) {
      reply.status(403).send({
        success: false,
        message: 'Akses khusus untuk Mitra Reseller, Percetakan, dan Administrator.'
      });
      return false;
    }
    return true;
  }

  /**
   * GET /api/reseller/profile
   * Mengambil profil branding dan konfigurasi harga jual reseller
   */
  public static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!ResellerController.verifyResellerAccess(request, reply)) return;

    try {
      const userId = (request as any).user.userId || (request as any).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          quotaTokens: true
        }
      });

      if (!user) {
        return reply.status(404).send({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      // Default branding profile jika belum ada kustomisasi
      const defaultBranding = {
        studioName: user.name || 'Studio Undangan Digital',
        studioPhone: user.phone || '',
        studioWebsite: '',
        defaultSellingPrice: 100000,
        estimatedTokenCost: 45000,
        enableWhiteLabel: true
      };

      return reply.send({
        success: true,
        data: {
          user,
          branding: defaultBranding
        }
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal memuat profil reseller: ' + err.message
      });
    }
  }

  /**
   * GET /api/reseller/analytics
   * Mengambil analitik finansial, omzet, laba bersih, dan buku kas token
   */
  public static async getAnalytics(request: FastifyRequest, reply: FastifyReply) {
    if (!ResellerController.verifyResellerAccess(request, reply)) return;

    try {
      const userId = (request as any).user.userId || (request as any).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          quotaTokens: true,
          role: true,
          invitations: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              isWatermark: true,
              planId: true,
              licenseKey: true,
              updatedAt: true,
              createdAt: true,
              _count: {
                select: { guests: true, rsvps: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      // Hitung metrik
      const totalInvitations = user.invitations.length;
      const activeInvitations = user.invitations.filter((i) => !i.isWatermark || i.licenseKey);
      const activeCount = activeInvitations.length;
      const remainingTokens = user.quotaTokens || 0;

      // Token terpakai (diasumsikan tiap undangan aktif memakai 1 token)
      const tokensUsed = activeCount;

      // Token Ledger: Daftar riwayat penggunaan token
      const tokenLedger = activeInvitations.map((inv) => ({
        id: inv.id,
        title: inv.title,
        slug: inv.slug,
        status: inv.status,
        licenseKey: inv.licenseKey || 'TOKEN-ACTIVATED',
        activatedAt: inv.updatedAt || inv.createdAt,
        guestCount: inv._count.guests,
        rsvpCount: inv._count.rsvps
      }));

      return reply.send({
        success: true,
        data: {
          role: user.role,
          remainingTokens,
          tokensUsed,
          totalInvitations,
          activeInvitationsCount: activeCount,
          tokenLedger
        }
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal mengambil data analitik reseller: ' + err.message
      });
    }
  }
}
