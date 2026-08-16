import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';

export class RsvpController {
  /**
   * Mengirim konfirmasi kehadiran (RSVP) dan ucapan selamat
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
      let inv = await prisma.invitation.findFirst({
        where: {
          OR: [{ id: invitationId }, { slug: invitationId }]
        }
      });

      if (!inv) {
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: { email: 'owner@absenta.id', name: 'Vendor Absenta', password: 'hash' }
          });
        }
        inv = await prisma.invitation.create({
          data: {
            userId: user.id,
            title: 'The Wedding of Romeo & Juliet',
            slug: invitationId || 'wedding-romeo-juliet',
            eventType: 'WEDDING',
            themeId: 'champagne_gold',
            eventDataJson: '{}'
          }
        });
      }

      const rsvp = await prisma.rsvp.create({
        data: {
          invitationId: inv.id,
          name: name.trim(),
          attendance: attendance.toUpperCase(),
          pax: pax || 1,
          message: message?.trim() || null
        }
      });

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
   */
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    try {
      let inv = await prisma.invitation.findFirst({
        where: {
          OR: [{ id: invitationId }, { slug: invitationId }]
        }
      });

      const targetId = inv ? inv.id : invitationId;

      const rsvps = await prisma.rsvp.findMany({
        where: { invitationId: targetId },
        orderBy: { createdAt: 'desc' }
      });

      const hadirCount = rsvps.filter(r => r.attendance === 'HADIR').reduce((sum, r) => sum + r.pax, 0);
      const tidakHadirCount = rsvps.filter(r => r.attendance === 'TIDAK_HADIR').length;
      const raguCount = rsvps.filter(r => r.attendance === 'RAGU').length;

      return reply.send({
        success: true,
        data: {
          rsvps,
          stats: {
            totalMessages: rsvps.length,
            hadirPax: hadirCount,
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
   * Like Ucapan Tamu
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
