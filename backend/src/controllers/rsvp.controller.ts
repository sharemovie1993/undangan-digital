import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import { invalidateInvitationCache } from './invitation.controller';

/**
 * 🧹 Sanitizer Input Buku Tamu: Mencegah serangan XSS dan HTML Injection
 */
function sanitizeTextInput(str: string, maxLength: number = 500): string {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

export class RsvpController {
  /**
   * Mengirim konfirmasi kehadiran (RSVP) dan ucapan selamat
   * 🚀 Dioptimasi dengan Sanitasi XSS & Validasi Attendance Ketat
   */
  static async submit(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      invitationId: string;
      name: string;
      attendance: string;
      pax?: number;
      message?: string;
    };

    const { invitationId, name, attendance, pax, message } = body;
    if (!invitationId || !name || !attendance) {
      return reply.status(400).send({ success: false, message: 'Data RSVP tidak lengkap.' });
    }

    try {
      const inv = await prisma.invitation.findFirst({
        where: {
          OR: [{ id: invitationId }, { slug: invitationId }]
        },
        select: { id: true, slug: true }
      });

      if (!inv) {
        return reply.status(404).send({ success: false, message: 'Undangan tidak ditemukan.' });
      }

      // Validasi Status Kehadiran
      const cleanAttendance = attendance.toUpperCase().trim();
      const validStatuses = ['HADIR', 'TIDAK_HADIR', 'RAGU'];
      const effectiveAttendance = validStatuses.includes(cleanAttendance) ? cleanAttendance : 'HADIR';

      // Sanitasi input nama dan ucapan
      const cleanName = sanitizeTextInput(name, 100);
      const cleanMessage = sanitizeTextInput(message || '', 500);
      const cleanPax = Math.min(Math.max(Number(pax) || 1, 1), 10);

      const rsvp = await prisma.rsvp.create({
        data: {
          invitationId: inv.id,
          name: cleanName,
          attendance: effectiveAttendance,
          pax: cleanPax,
          message: cleanMessage || null
        }
      });

      // 🧹 Invalidate Cache Undangan agar ucapan baru langsung muncul
      invalidateInvitationCache(inv.slug);
      invalidateInvitationCache(inv.id);

      return reply.send({
        success: true,
        message: 'Konfirmasi kehadiran dan ucapan berhasil dikirim!',
        data: rsvp
      });
    } catch (err: any) {
      console.error('[RSVP Submit Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengirim RSVP.' });
    }
  }

  /**
   * Mengambil daftar RSVP untuk sebuah undangan
   * 🚀 Dioptimasi dengan Pagination / Infinite Scroll & Database Aggregation
   */
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    const query = (request.query as any) || {};

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 30, 1), 100);
    const skip = (page - 1) * limit;

    try {
      const inv = await prisma.invitation.findFirst({
        where: {
          OR: [{ id: invitationId }, { slug: invitationId }]
        },
        select: { id: true }
      });

      const targetId = inv ? inv.id : invitationId;

      // ⚡ Eksekusi Paralel: Data Pagination + Statistik SQL GroupBy
      const [rsvps, totalCount, statsGroup] = await Promise.all([
        prisma.rsvp.findMany({
          where: { invitationId: targetId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.rsvp.count({
          where: { invitationId: targetId }
        }),
        prisma.rsvp.groupBy({
          by: ['attendance'],
          where: { invitationId: targetId },
          _sum: { pax: true },
          _count: { id: true }
        })
      ]);

      let hadirPax = 0;
      let tidakHadirCount = 0;
      let raguCount = 0;

      for (const stat of statsGroup) {
        if (stat.attendance === 'HADIR') {
          hadirPax = stat._sum.pax || 0;
        } else if (stat.attendance === 'TIDAK_HADIR') {
          tidakHadirCount = stat._count.id || 0;
        } else if (stat.attendance === 'RAGU') {
          raguCount = stat._count.id || 0;
        }
      }

      return reply.send({
        success: true,
        data: {
          rsvps,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: skip + rsvps.length < totalCount
          },
          stats: {
            totalMessages: totalCount,
            hadirPax,
            tidakHadirCount,
            raguCount
          }
        }
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal mengambil data RSVP.' });
    }
  }

  /**
   * Like Ucapan Tamu (Atomic Increment)
   */
  static async like(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const updated = await prisma.rsvp.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      return reply.send({ success: true, data: updated });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal like ucapan.' });
    }
  }

  /**
   * Hapus / Moderasi Ucapan Spam
   */
  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await prisma.rsvp.delete({ where: { id } });
      return reply.send({ success: true, message: 'Ucapan berhasil dihapus.' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal menghapus ucapan.' });
    }
  }
}
