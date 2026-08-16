import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import { isPrintKitAllowed } from '../constants/plans';

export class InvitationController {
  /**
   * Mengambil data publik undangan berdasarkan slug (untuk halaman tamu)
   */
  static async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    try {
      let invitation = await prisma.invitation.findFirst({
        where: {
          OR: [
            { slug: slug.toLowerCase().trim() },
            { id: slug }
          ]
        },
        include: {
          rsvps: { orderBy: { createdAt: 'desc' }, take: 50 }
        }
      });

      // Auto-seed default invitation if not yet created in SQLite
      if (!invitation) {
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: { email: 'owner@absenta.id', name: 'Vendor Absenta', password: 'hash' }
          });
        }

        const isKhitan = slug.includes('khitan');
        const defaultTitle = isKhitan ? 'Walimatul Khitan M. Rayyan' : 'The Wedding of Romeo & Juliet';
        const defaultEventData = isKhitan
          ? {
              eventTitle: 'Walimatul Khitan M. Rayyan',
              eventType: 'khitanan',
              theme: 'emerald_sage',
              profiles: [
                {
                  name: 'Muhammad Rayyan Al-Ghifari',
                  role: 'Putra Tercinta',
                  bio: 'Putra dari Bpk. Ir. Hendra & Ibu Nurlela',
                  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80'
                }
              ],
              events: [
                {
                  title: 'Syukuran & Resepsi',
                  date: 'Sabtu, 24 Oktober 2026',
                  time: '09:00 - 13:00 WIB',
                  venueName: 'Grand Ballroom Graha Kencana Bandung',
                  address: 'Jl. Gatot Subroto No. 45, Bandung'
                }
              ]
            }
          : {
              eventTitle: 'The Wedding of Romeo & Juliet',
              eventType: 'wedding',
              theme: 'champagne_gold',
              profiles: [
                {
                  name: 'Romeo Aris Pratama, S.Kom',
                  role: 'Mempelai Pria',
                  bio: 'Putra dari Bpk. Handoko & Ibu Ratna',
                  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
                },
                {
                  name: 'Juliet Sarah Aulia, S.Ked',
                  role: 'Mempelai Wanita',
                  bio: 'Putri dari Bpk. Suryadi & Ibu Dewi',
                  photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80'
                }
              ],
              events: [
                {
                  title: 'Akad Nikah & Resepsi',
                  date: 'Sabtu, 24 Oktober 2026',
                  time: '09:00 - 13:00 WIB',
                  venueName: 'Grand Ballroom Hotel Horison Bandung',
                  address: 'Jl. Pelajar Pejuang 45 No. 121, Bandung'
                }
              ]
            };

        invitation = await prisma.invitation.create({
          data: {
            userId: user.id,
            title: defaultTitle,
            slug: slug.toLowerCase().trim(),
            eventType: isKhitan ? 'KHITANAN' : 'WEDDING',
            themeId: isKhitan ? 'emerald_sage' : 'champagne_gold',
            eventDataJson: JSON.stringify(defaultEventData),
            status: 'DRAFT',
            isWatermark: true,
            allowPrintKit: false
          },
          include: {
            rsvps: true
          }
        });
      }

      const eventData = JSON.parse(invitation.eventDataJson || '{}');

      return reply.send({
        success: true,
        data: {
          id: invitation.id,
          title: invitation.title,
          slug: invitation.slug,
          eventType: invitation.eventType,
          themeId: invitation.themeId,
          themeConfig: invitation.themeConfig ? JSON.parse(invitation.themeConfig) : null,
          stitchBlocks: invitation.stitchBlocks ? JSON.parse(invitation.stitchBlocks) : null,
          eventData,
          isWatermark: invitation.isWatermark,
          status: invitation.status,
          allowPrintKit: invitation.allowPrintKit,
          licenseKey: invitation.licenseKey,
          planId: invitation.planId,
          rsvps: invitation.rsvps
        }
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal mengambil data undangan.' });
    }
  }

  /**
   * Mengambil detail undangan untuk builder
   */
  static async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id },
        include: { guests: true, rsvps: true }
      });

      if (!invitation) {
        return reply.status(404).send({ success: false, message: 'Undangan tidak ditemukan.' });
      }

      return reply.send({
        success: true,
        data: {
          ...invitation,
          eventData: JSON.parse(invitation.eventDataJson || '{}'),
          themeConfig: invitation.themeConfig ? JSON.parse(invitation.themeConfig) : null,
          stitchBlocks: invitation.stitchBlocks ? JSON.parse(invitation.stitchBlocks) : null
        }
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal memuat undangan.' });
    }
  }

  /**
   * Menyimpan / memperbarui undangan dari Studio Builder
   */
  static async save(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any || {};

    const title = body.title || body.eventTitle || 'The Wedding Invitation';
    const slug = body.slug || body.id || 'wedding-romeo-juliet';
    const eventType = (body.eventType || 'WEDDING').toUpperCase();
    const themeId = body.themeId || body.theme || 'champagne_gold';
    const themeConfig = body.themeConfig || null;
    const stitchBlocks = body.stitchBlocks || body.enabledBlocks || null;
    const printConfig = body.printConfig || null;
    const eventData = body.eventData || body;
    const id = body.id || undefined;

    try {
      let activeUserId = request.user?.userId;
      if (!activeUserId) {
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: { email: 'owner@absenta.id', name: 'Vendor Absenta', password: 'hash' }
          });
        }
        activeUserId = user.id;
      }

      let cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'undangan-digital';

      // Pastikan slug unik jika membuat baru dan menghindari collision
      const slugExists = await prisma.invitation.findFirst({
        where: { slug: cleanSlug }
      });
      if (slugExists && (!id || slugExists.id !== id)) {
        if (slugExists.userId !== activeUserId) {
          cleanSlug = `${cleanSlug}-${Date.now().toString(36).slice(-4)}`;
        }
      }

      // Cek apakah user memiliki lisensi berbayar yang standby / belum terpasang (misal baru checkout dari dashboard)
      const unassignedOrder = await prisma.order.findFirst({
        where: {
          userId: activeUserId,
          status: 'PAID',
          licenseKey: { not: null },
          OR: [
            { invitationId: 'inv-preview-123' },
            { invitationId: '' },
            { invitationId: null }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      let initialIsWatermark = true;
      let initialAllowPrintKit = false;
      let initialLicenseKey: string | null = null;
      let initialPlanId: string | null = null;
      let initialStatus = 'DRAFT';

      if (unassignedOrder && unassignedOrder.licenseKey) {
        // Pastikan licenseKey belum pernah dipakai di tabel invitation
        const licenseAlreadyInUse = await prisma.invitation.findFirst({
          where: { licenseKey: unassignedOrder.licenseKey }
        });
        if (!licenseAlreadyInUse) {
          initialLicenseKey = unassignedOrder.licenseKey;
          initialPlanId = unassignedOrder.planId;
          initialIsWatermark = false;
          initialAllowPrintKit = isPrintKitAllowed(unassignedOrder.planId);
          initialStatus = 'ACTIVE';
        }
      }

      let invitation;

      // 1. If an ID is provided, update or upsert by that exact ID
      if (id) {
        invitation = await prisma.invitation.upsert({
          where: { id },
          update: {
            title,
            slug: cleanSlug,
            eventType: eventType || 'WEDDING',
            themeId: themeId || 'champagne_gold',
            themeConfig: themeConfig ? JSON.stringify(themeConfig) : null,
            stitchBlocks: stitchBlocks ? JSON.stringify(stitchBlocks) : null,
            printConfig: printConfig ? JSON.stringify(printConfig) : null,
            eventDataJson: JSON.stringify(eventData || {})
          },
          create: {
            id,
            userId: activeUserId,
            title,
            slug: cleanSlug,
            eventType: eventType || 'WEDDING',
            themeId: themeId || 'champagne_gold',
            themeConfig: themeConfig ? JSON.stringify(themeConfig) : null,
            stitchBlocks: stitchBlocks ? JSON.stringify(stitchBlocks) : null,
            printConfig: printConfig ? JSON.stringify(printConfig) : null,
            eventDataJson: JSON.stringify(eventData || {}),
            isWatermark: initialIsWatermark,
            allowPrintKit: initialAllowPrintKit,
            licenseKey: initialLicenseKey,
            planId: initialPlanId,
            status: initialStatus
          }
        });
      } else {
        // 2. If no ID is provided, check if existing by user & slug/title
        const existing = await prisma.invitation.findFirst({
          where: {
            userId: activeUserId,
            OR: [
              { slug: cleanSlug },
              { title: title.trim() }
            ]
          }
        });

        if (existing) {
          invitation = await prisma.invitation.update({
            where: { id: existing.id },
            data: {
              title,
              slug: cleanSlug,
              eventType: eventType || 'WEDDING',
              themeId: themeId || 'champagne_gold',
              themeConfig: themeConfig ? JSON.stringify(themeConfig) : null,
              stitchBlocks: stitchBlocks ? JSON.stringify(stitchBlocks) : null,
              printConfig: printConfig ? JSON.stringify(printConfig) : null,
              eventDataJson: JSON.stringify(eventData || {})
            }
          });
        } else {
          // 3. Truly new invitation
          invitation = await prisma.invitation.create({
            data: {
              userId: activeUserId,
              title,
              slug: cleanSlug,
              eventType: eventType || 'WEDDING',
              themeId: themeId || 'champagne_gold',
              themeConfig: themeConfig ? JSON.stringify(themeConfig) : null,
              stitchBlocks: stitchBlocks ? JSON.stringify(stitchBlocks) : null,
              printConfig: printConfig ? JSON.stringify(printConfig) : null,
              eventDataJson: JSON.stringify(eventData || {}),
              isWatermark: initialIsWatermark,
              allowPrintKit: initialAllowPrintKit,
              licenseKey: initialLicenseKey,
              planId: initialPlanId,
              status: initialStatus
            }
          });
        }
      }

      // Jika ada order standby yang baru saja dikaitkan, update invitationId-nya
      if (unassignedOrder && initialLicenseKey && invitation) {
        await prisma.order.update({
          where: { id: unassignedOrder.id },
          data: { invitationId: invitation.id }
        });
        console.log(`[Auto-Attach License] Lisensi ${unassignedOrder.licenseKey} otomatis dipasangkan ke undangan baru ${invitation.id}`);
      }

      // 4. Sync Guest List into SQLite Guest Table
      const guestList = (body as any).guestList || (eventData && (eventData as any).guestList);
      if (Array.isArray(guestList)) {
        await prisma.guest.deleteMany({
          where: { invitationId: invitation.id }
        });

        if (guestList.length > 0) {
          for (const g of guestList) {
            await prisma.guest.create({
              data: {
                invitationId: invitation.id,
                name: g.name || 'Tamu Undangan',
                address: g.city || g.addressOrCity || g.address || '',
                category: g.group || g.category || 'Umum',
                pax: Number(g.paxQuota || g.paxCount || g.pax || 1),
                qrCode: g.qrCode || `QR-${invitation.id.substring(0, 6)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                isCheckedIn: Boolean(g.isCheckedIn || g.isAttending)
              }
            });
          }
        }
      }

      let parsedEventData = {};
      try {
        parsedEventData = JSON.parse(invitation.eventDataJson || '{}');
      } catch {
        parsedEventData = {};
      }

      return reply.send({
        success: true,
        message: 'Undangan dan data tamu berhasil disimpan!',
        data: {
          ...invitation,
          eventData: parsedEventData
        }
      });
    } catch (err: any) {
      console.error('[Save Invitation Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal menyimpan undangan: ' + err.message });
    }
  }

  /**
   * Mengambil semua daftar undangan milik user untuk Multi-Project Dashboard
   */
  static async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loggedUser = request.user;
      if (!loggedUser) {
        return reply.send({
          success: true,
          data: []
        });
      }

      const filterWhere = (loggedUser.role === 'ADMIN')
        ? {}
        : { userId: loggedUser.userId };

      const invitations = await prisma.invitation.findMany({
        where: filterWhere,
        include: {
          _count: {
            select: { guests: true, rsvps: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: invitations.map(inv => {
          const eventData = JSON.parse(inv.eventDataJson || '{}');
          const guestCount = inv._count.guests > 0 ? inv._count.guests : (eventData.guestList?.length || 0);
          const rsvpCount = inv._count.rsvps > 0 ? inv._count.rsvps : (eventData.wishes?.length || 0);

          return {
            id: inv.id,
            title: inv.title,
            slug: inv.slug,
            eventType: inv.eventType,
            themeId: inv.themeId,
            isWatermark: inv.isWatermark,
            allowPrintKit: inv.allowPrintKit,
            status: inv.status,
            planId: inv.planId,
            licenseKey: inv.licenseKey,
            guestCount,
            rsvpCount,
            updatedAt: inv.updatedAt,
            eventData
          };
        })
      });
    } catch (err: any) {
      console.error('[List Invitations Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal memuat daftar undangan.' });
    }
  }

  /**
   * Duplikasi Proyek Undangan 1-Klik
   */
  static async duplicate(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const source = await prisma.invitation.findUnique({ where: { id } });
      if (!source) {
        return reply.status(404).send({ success: false, message: 'Undangan sumber tidak ditemukan.' });
      }

      const cleanSlugBase = (source.slug || 'undangan').replace(/-copy-\d+$/g, '');
      const newSlug = `${cleanSlugBase}-copy-${Math.floor(100 + Math.random() * 900)}`;
      const newTitle = `${source.title} (Salinan)`;

      let eventData = {};
      try {
        eventData = JSON.parse(source.eventDataJson || '{}');
      } catch {}

      const updatedEventData = {
        ...eventData,
        eventTitle: newTitle,
        title: newTitle,
        slug: newSlug,
      };

      const duplicated = await prisma.invitation.create({
        data: {
          userId: source.userId,
          title: newTitle,
          slug: newSlug,
          eventType: source.eventType,
          themeId: source.themeId,
          themeConfig: source.themeConfig,
          stitchBlocks: source.stitchBlocks,
          printConfig: source.printConfig,
          eventDataJson: JSON.stringify(updatedEventData),
          status: 'DRAFT',
          isWatermark: true,
          allowPrintKit: false
        }
      });

      return reply.send({
        success: true,
        message: 'Undangan berhasil diduplikasi!',
        data: duplicated
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal menduplikasi undangan.' });
    }
  }

  /**
   * Menghapus undangan
   * Smart behavior:
   * - Jika token reseller → refund 1 token
   * - Jika berbayar Tripay → lepas lisensi dari undangan (Order tetap ada, key bisa dipakai ulang)
   * - Jika trial/draft → hapus langsung
   */
  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      // Ambil data undangan sebelum dihapus
      const invitation = await prisma.invitation.findUnique({
        where: { id },
        select: { id: true, planId: true, licenseKey: true, userId: true, isWatermark: true }
      });

      if (!invitation) {
        return reply.status(404).send({ success: false, message: 'Undangan tidak ditemukan.' });
      }

      const isTokenActivated = invitation.planId === 'UND-RESELLER-TOKEN';
      const isPaidLicensed = !invitation.isWatermark && invitation.licenseKey && !isTokenActivated;

      // KASUS 1: Token reseller → kembalikan 1 token
      if (isTokenActivated && invitation.userId) {
        await prisma.user.update({
          where: { id: invitation.userId },
          data: { quotaTokens: { increment: 1 } }
        });
        console.log(`[Token Refund] 1 token dikembalikan ke user ${invitation.userId} karena undangan ${id} dihapus.`);
      }

      // KASUS 2: Berbayar Tripay → lepas lisensi dari undangan saja, jangan hapus Order
      // License key tetap tersimpan di tabel Order, user bisa apply ke undangan baru
      if (isPaidLicensed) {
        await prisma.invitation.update({
          where: { id },
          data: {
            isWatermark: true,
            allowPrintKit: false,
            licenseKey: null,
            planId: null,
            status: 'DRAFT'
          }
        });
        // Tandai order terkait agar diketahui license-nya dilepas
        await prisma.order.updateMany({
          where: { licenseKey: invitation.licenseKey },
          data: { invitationId: null }
        });
        // Hapus undangan setelah license dilepas
        await prisma.invitation.delete({ where: { id } });
        return reply.send({
          success: true,
          message: 'Undangan berhasil dihapus. License key Anda masih tersimpan di riwayat pesanan dan dapat diterapkan ke undangan baru melalui menu Pesanan Saya.',
          licenseDetached: true,
          licenseKey: invitation.licenseKey
        });
      }

      // KASUS 3: Trial / draft biasa → hapus langsung
      await prisma.invitation.delete({ where: { id } });
      return reply.send({
        success: true,
        message: isTokenActivated
          ? 'Undangan berhasil dihapus. 1 token aktivasi telah dikembalikan ke akun Anda.'
          : 'Undangan berhasil dihapus.'
      });
    } catch (err: any) {
      console.error('[Delete Invitation Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal menghapus undangan.' });
    }
  }
}
