import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import crypto from 'crypto';

export class GuestController {
  /**
   * Mengambil daftar tamu untuk undangan tertentu
   */
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
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

      const guests = await prisma.guest.findMany({
        where: { invitationId: inv.id },
        orderBy: { createdAt: 'asc' }
      });

      const total = guests.length;
      const checkedInCount = guests.filter(g => g.isCheckedIn).length;

      return reply.send({
        success: true,
        data: {
          guests,
          stats: {
            total,
            checkedIn: checkedInCount,
            remaining: total - checkedInCount
          }
        }
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal mengambil data tamu.' });
    }
  }

  /**
   * Menambahkan tamu baru
   */
  static async add(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      invitationId: string;
      name: string;
      phone?: string;
      address?: string;
      category?: string;
      pax?: number;
    };

    const { invitationId, name, phone, address, category, pax } = body;
    if (!invitationId || !name) {
      return reply.status(400).send({ success: false, message: 'ID Undangan dan nama tamu wajib diisi.' });
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
            title: 'Undangan Digital',
            slug: invitationId,
            eventType: 'WEDDING',
            themeId: 'champagne_gold',
            eventDataJson: '{}'
          }
        });
      }

      const qrCode = `GST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const guest = await prisma.guest.create({
        data: {
          invitationId: inv.id,
          name: name.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          category: category?.trim() || 'Tamu Undangan',
          pax: pax || 1,
          qrCode
        }
      });

      return reply.send({ success: true, data: guest });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal menambahkan tamu.' });
    }
  }

  /**
   * Import massal daftar tamu (dari CSV/array)
   */
  static async bulkImport(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      invitationId: string;
      guests: Array<{ name: string; phone?: string; address?: string; category?: string; pax?: number }>;
    };

    const { invitationId, guests } = body;
    if (!invitationId || !Array.isArray(guests) || guests.length === 0) {
      return reply.status(400).send({ success: false, message: 'Daftar tamu tidak boleh kosong.' });
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
            title: 'Undangan Digital',
            slug: invitationId,
            eventType: 'WEDDING',
            themeId: 'champagne_gold',
            eventDataJson: '{}'
          }
        });
      }

      const createdGuests = [];
      for (const g of guests) {
        if (!g.name || g.name.trim() === '') continue;
        const qrCode = `GST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const created = await prisma.guest.create({
          data: {
            invitationId: inv.id,
            name: g.name.trim(),
            phone: g.phone?.trim() || null,
            address: g.address?.trim() || null,
            category: g.category?.trim() || 'Tamu Undangan',
            pax: g.pax || 1,
            qrCode
          }
        });
        createdGuests.push(created);
      }

      return reply.send({
        success: true,
        message: `Berhasil mengimpor ${createdGuests.length} tamu.`,
        data: createdGuests
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal impor tamu.' });
    }
  }

  /**
   * Check-in tamu di resepsi via scan QR Code
   */
  static async checkIn(request: FastifyRequest, reply: FastifyReply) {
    const { qrCode } = request.body as { qrCode: string };
    if (!qrCode) {
      return reply.status(400).send({ success: false, message: 'QR Code wajib diisi.' });
    }

    try {
      const guest = await prisma.guest.findFirst({
        where: {
          OR: [
            { qrCode: qrCode.trim() },
            { id: qrCode.trim() }
          ]
        }
      });

      if (!guest) {
        return reply.status(404).send({ success: false, message: 'QR Code tamu tidak valid / tidak ditemukan.' });
      }

      if (guest.isCheckedIn) {
        return reply.send({
          success: true,
          alreadyCheckedIn: true,
          message: `Tamu '${guest.name}' sudah check-in sebelumnya pada ${guest.checkedInAt?.toLocaleTimeString('id-ID')}.`,
          data: guest
        });
      }

      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          isCheckedIn: true,
          checkedInAt: new Date()
        }
      });

      return reply.send({
        success: true,
        alreadyCheckedIn: false,
        message: `Check-in berhasil! Selamat datang, ${guest.name} (${guest.pax} Pax).`,
        data: updated
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal memproses check-in.' });
    }
  }

  /**
   * Export Daftar Tamu & Kehadiran ke CSV
   */
  static async exportCsv(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    try {
      const guests = await prisma.guest.findMany({
        where: {
          OR: [
            { invitationId },
            { invitation: { slug: invitationId } }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });

      let csv = 'Nama Tamu,Kategori,Alamat/Kota,Kuota Pax,Status Kehadiran,Waktu Check-In,Kode QR\n';
      for (const g of guests) {
        const status = g.isCheckedIn ? 'HADIR' : 'BELUM HADIR';
        const time = g.checkedInAt ? g.checkedInAt.toISOString() : '-';
        csv += `"${g.name}","${g.category || '-'}","${g.address || '-'}","${g.pax}","${status}","${time}","${g.qrCode}"\n`;
      }

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="daftar-tamu-${invitationId}.csv"`);
      return reply.send(csv);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal mengekspor CSV tamu.' });
    }
  }

  /**
   * Menghapus tamu
   */
  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await prisma.guest.delete({ where: { id } });
      return reply.send({ success: true, message: 'Tamu berhasil dihapus.' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal menghapus data tamu.' });
    }
  }
}
