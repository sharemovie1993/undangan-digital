import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import { PdfPrintService, CardPrintData } from '../services/pdf.service';
import { isPrintKitAllowed } from '../constants/plans';

export class PrintController {
  /**
   * Helper untuk validasi izin akses Print-Ready Kit (Platinum / Reseller only)
   */
  private static async checkPermission(invitationId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: { OR: [{ id: invitationId }, { slug: invitationId }] }
    });
    if (invitation && !invitation.allowPrintKit && !isPrintKitAllowed(invitation.planId)) {
      return {
        allowed: false,
        message: 'Fitur Print-Ready Kit (PDF 300 DPI) tersedia eksklusif pada Paket Platinum & Reseller. Silakan upgrade lisensi undangan Anda.'
      };
    }
    return { allowed: true, invitation };
  }

  /**
   * Download Kartu Undangan Fisik Siap Cetak (300 DPI PDF)
   */
  static async downloadCard(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    const query = request.query as { format?: 'A5' | '4R' };
    const format = query.format || 'A5';

    try {
      const perm = await PrintController.checkPermission(invitationId);
      if (!perm.allowed) {
        return reply.status(403).send({ success: false, message: perm.message });
      }

      const invitation = perm.invitation;
      let cardData: any;
      if (invitation) {
        const eventData = JSON.parse(invitation.eventDataJson || '{}');
        const profiles = eventData.profiles || [];
        const p1 = profiles[0] || {};
        const p2 = profiles[1] || {};
        const isKhitan = invitation.eventType?.toLowerCase() === 'khitanan' || /khitan/i.test(invitation.title);
        const isAqiqah = invitation.eventType?.toLowerCase() === 'aqiqah' || /aqiqah/i.test(invitation.title);
        const isBirthday = invitation.eventType?.toLowerCase() === 'birthday';

        let names = '';
        if (isKhitan || isAqiqah || isBirthday) {
          names = p1.fullName?.trim() || p1.name?.trim() || invitation.title;
        } else if (p1.name && p2.name) {
          names = `${p1.name} & ${p2.name}`;
        } else {
          names = eventData.eventTitle || invitation.title;
        }

        const parents = (isKhitan || isAqiqah || isBirthday) && p1.fatherName && p1.motherName
          ? `Putra dari Bpk. ${p1.fatherName} & Ibu ${p1.motherName}`
          : (p1.fatherName ? `Putra dari Bpk. ${p1.fatherName}` : '');

        const sessions = eventData.sessions || eventData.events || [];
        const s1 = sessions[0] || {};

        cardData = {
          title: invitation.title,
          eventType: invitation.eventType,
          taglineText: isKhitan ? 'WALIMATUL KHITAN' : isAqiqah ? 'TASYAKURAN AQIQAH' : isBirthday ? 'HAPPY BIRTHDAY' : 'THE WEDDING OF',
          names,
          parents,
          quoteText: isKhitan
            ? 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Walimatul Khitan putra kami:'
            : isAqiqah
            ? 'Puji syukur kami panjatkan atas kelahiran buah hati tercinta. Kami mengundang kehadiran Anda dalam acara Tasyakuran Aqiqah:'
            : 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara:',
          dateText: s1.date ? `Sabtu, ${s1.date}` : 'Sabtu, 24 Oktober 2026',
          timeText: s1.time || s1.startTime ? `${s1.startTime || s1.time} WIB s/d Selesai` : '08:00 WIB s/d Selesai',
          locationName: s1.venueName || 'Kediaman Mempelai / Tuan Rumah',
          address: s1.address || s1.venueAddress || '',
          qrUrl: `https://luxury.absenta.id/?slug=${invitation.slug}`
        };
      } else {
        cardData = {
          title: 'The Wedding of Romeo & Juliet',
          eventType: 'WEDDING',
          taglineText: 'THE WEDDING OF',
          names: 'Romeo Aris & Juliet Sarah',
          parents: '',
          quoteText: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara:',
          dateText: 'Sabtu, 24 Oktober 2026',
          timeText: '09:00 - 13:00 WIB',
          locationName: 'Grand Ballroom Hotel Horison',
          address: 'Jl. Pelajar Pejuang 45 No. 121, Bandung',
          qrUrl: 'https://luxury.absenta.id'
        };
      }

      const pdfBuffer = await PdfPrintService.generateCardPdf(cardData, format);
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="undangan-cetak-${format}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal men-generate PDF kartu.' });
    }
  }

  /**
   * Download PDF Kertas Stiker Label Tamu Tom & Jerry (103: 12 label & 108: 18 label)
   */
  static async downloadStickers(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    const query = (request.query as any) || {};
    const templateType: '103' | '108' = query.template === '108' ? '108' : '103';

    try {
      const perm = await PrintController.checkPermission(invitationId);
      if (!perm.allowed) {
        return reply.status(403).send({ success: false, message: perm.message });
      }

      const guests = await prisma.guest.findMany({
        where: { OR: [{ invitationId }, { invitation: { slug: invitationId } }] },
        orderBy: { createdAt: 'asc' }
      });

      let labelData: Array<{ name: string; address?: string; category?: string }> = guests.map(g => ({ name: g.name, address: g.address || 'Tempat', category: g.category || undefined }));
      if (labelData.length === 0) {
        labelData = [
          { name: 'Bpk. Ahmad Suherman & Kel', address: 'Jakarta Selatan' },
          { name: 'Ibu Ratna Dewi & Partner', address: 'Bandung' },
          { name: 'dr. Farhan Maulana, Sp.A', address: 'Surabaya' },
          { name: 'Keluarga Besar Bpk. Handoko', address: 'Yogyakarta' },
          { name: 'Sahabat Alumni Teknik 2018', address: 'Bandung' },
          { name: 'Bpk. Hendra Gunawan, M.M', address: 'Jakarta' },
          { name: 'Ibu Hj. Siti Aminah', address: 'Cimahi' },
          { name: 'dr. Sarah Nabila & Suami', address: 'Bekasi' },
          { name: 'Bpk. Ir. Bambang Soeprapto', address: 'Semarang' },
          { name: 'Keluarga Besar Bani Hasan', address: 'Tasikmalaya' },
          { name: 'Rekan Kantor Divisi Digital', address: 'Jakarta' },
          { name: 'Bpk. Prof. Dr. Suryadi, M.Sc', address: 'Depok' }
        ];
      }

      const pdfBuffer = await PdfPrintService.generateStickerLabelsPdf(labelData, templateType);
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="stiker-label-tom-jerry-${templateType}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal men-generate PDF stiker label.' });
    }
  }

  /**
   * Download Kupon Souvenir & Makanan (8 tag per lembar A4)
   */
  static async downloadSouvenirTags(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    try {
      const perm = await PrintController.checkPermission(invitationId);
      if (!perm.allowed) {
        return reply.status(403).send({ success: false, message: perm.message });
      }

      const inv = perm.invitation;
      const names = inv ? inv.title : 'Romeo & Juliet';
      const pdfBuffer = await PdfPrintService.generateSouvenirTagsPdf('Souvenir Tag', names, 24);

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="kupon-souvenir-${invitationId}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal generate souvenir tags.' });
    }
  }

  /**
   * Download Standee QR Meja Resepsi (Format A6)
   */
  static async downloadTableStandee(request: FastifyRequest, reply: FastifyReply) {
    const { invitationId } = request.params as { invitationId: string };
    try {
      const perm = await PrintController.checkPermission(invitationId);
      if (!perm.allowed) {
        return reply.status(403).send({ success: false, message: perm.message });
      }

      const inv = perm.invitation;
      const names = inv ? inv.title : 'Romeo & Juliet';
      const qrUrl = inv ? `http://localhost:3000/invitation/${inv.slug}` : 'http://localhost:3000';
      const pdfBuffer = await PdfPrintService.generateTableStandeePdf(names, qrUrl);

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="table-standee-A6.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal generate table standee.' });
    }
  }
}

