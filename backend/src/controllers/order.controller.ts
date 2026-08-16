import { FastifyReply, FastifyRequest } from 'fastify';
import { LicenseService } from '../services/license.service';
import { prisma } from '../db';
import { isPrintKitAllowed, isResellerPlan, calculateResellerTokens } from '../constants/plans';

const grantResellerTokensIfApplicable = async (order: any) => {
  if (!order || !order.userId) return;
  const isReseller = isResellerPlan(order.planId, order.amount);

  if (isReseller) {
    const tokensToAdd = calculateResellerTokens(order.amount);
    try {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          quotaTokens: { increment: tokensToAdd },
          role: 'RESELLER'
        }
      });
      console.log(`[Reseller Grant] ${tokensToAdd} token berhasil ditambahkan ke user ${order.userId} dan role diubah menjadi RESELLER.`);
    } catch (err: any) {
      console.error('[Reseller Grant Error]', err.message);
    }
  }
};

export class OrderController {
  /**
   * Mengambil daftar paket lisensi secara realtime dari Server Lisensi
   */
  static async getPackages(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await LicenseService.getPackages();
      return reply.send({ success: true, data });
    } catch (err: any) {
      console.error('[Get Packages Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal memuat daftar paket dari server lisensi.' });
    }
  }

  /**
   * Mengambil daftar channel pembayaran (QRIS, VA Bank, Retail)
   */
  static async getPaymentChannels(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await LicenseService.getPaymentChannels();
      return reply.send({ success: true, data });
    } catch (err: any) {
      console.error('[Get Payment Channels Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal memuat channel pembayaran.' });
    }
  }

  /**
   * Membuat transaksi / pesanan lisensi baru
   */
  static async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      invitationId?: string;
      planId: string;
      customerName: string;
      customerPhone: string;
      paymentMethod?: string;
    };

    const { invitationId, planId, customerName, customerPhone, paymentMethod } = body;
    if (!planId || !customerName || !customerPhone) {
      return reply.status(400).send({ success: false, message: 'Plan ID, nama, dan no HP wajib diisi.' });
    }

    try {
      let activeUserId = (request.user as any)?.userId;
      if (!activeUserId) {
        const foundUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: customerPhone },
              { phone: '+62' + customerPhone.replace(/^0/, '') }
            ]
          }
        });
        activeUserId = foundUser?.id;
      }

      if (!activeUserId) {
        const firstUser = await prisma.user.findFirst();
        activeUserId = firstUser?.id;
      }

      let inv = null;
      if (invitationId) {
        inv = await prisma.invitation.findFirst({
          where: {
            OR: [{ id: invitationId }, { slug: invitationId }]
          }
        });
      }

      const orderResult = await LicenseService.createOrder({
        plan_id: planId,
        customer_name: customerName,
        customer_phone: customerPhone,
        invitation_title: inv?.title || 'Undangan Digital',
        slug: inv?.slug || invitationId || 'undangan-digital',
        payment_method: paymentMethod || 'QRIS2'
      });

      if (orderResult.success && orderResult.data) {
        const invData = orderResult.data;
        await prisma.order.create({
          data: {
            userId: activeUserId || inv?.userId,
            invitationId: inv?.id || invitationId || null,
            invoiceNumber: invData.invoice_number,
            planId,
            planName: invData.plan_name || 'Paket Undangan Digital',
            amount: invData.amount || 0,
            status: invData.status || 'UNPAID',
            paymentMethod: paymentMethod || 'QRIS2',
            paymentDataJson: JSON.stringify(invData)
          }
        });
      }

      return reply.send(orderResult);
    } catch (err: any) {
      console.error('[Create Order Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal membuat transaksi ke server lisensi.' });
    }
  }

  /**
   * Cek status pembayaran ke Server Lisensi & update database lokal
   */
  static async checkStatus(request: FastifyRequest, reply: FastifyReply) {
    const { invoiceNumber } = request.params as { invoiceNumber: string };
    try {
      const statusResult = await LicenseService.checkStatus(invoiceNumber);
      if (statusResult.success && statusResult.data) {
        const st = statusResult.data.status?.toUpperCase();
        const isPaid = st === 'PAID' || st === 'SUCCESS' || st === 'SETTLED';

        if (isPaid) {
          const localOrder = await prisma.order.findUnique({ where: { invoiceNumber } });
          if (localOrder && localOrder.status !== 'PAID') {
            await prisma.order.update({
              where: { id: localOrder.id },
              data: {
                status: 'PAID',
                licenseKey: statusResult.data.license_key || 'UND-PAID-ACTIVE',
                paidAt: new Date()
              }
            });

            // Berikan token jika paket reseller
            await grantResellerTokensIfApplicable(localOrder);

            if (localOrder.invitationId) {
              await prisma.invitation.updateMany({
                where: {
                  OR: [
                    { id: localOrder.invitationId },
                    { slug: localOrder.invitationId }
                  ]
                },
                data: {
                  isWatermark: false,
                  allowPrintKit: isPrintKitAllowed(localOrder.planId),
                  status: 'ACTIVE',
                  licenseKey: statusResult.data.license_key || 'UND-PAID-ACTIVE'
                }
              });
            }
          }
        }
      }

      return reply.send(statusResult);
    } catch (err: any) {
      console.error('[Check Status Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengecek status pembayaran.' });
    }
  }

  /**
   * Automated Webhook Callback dari Server Lisensi
   */
  static async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const { invoice_number, status, license_key } = body || {};

    if (!invoice_number) {
      return reply.status(400).send({ success: false, message: 'Missing invoice_number.' });
    }

    try {
      const st = (status || '').toUpperCase();
      if (st === 'PAID' || st === 'SUCCESS' || st === 'SETTLED') {
        const order = await prisma.order.findUnique({ where: { invoiceNumber: invoice_number } });
        if (order) {
          const finalKey = license_key || order.licenseKey || `UND-LIC-${Date.now().toString(36).toUpperCase()}`;
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID', licenseKey: finalKey, paidAt: new Date() }
          });

          await grantResellerTokensIfApplicable(order);

          if (order.invitationId) {
            await prisma.invitation.updateMany({
              where: { OR: [{ id: order.invitationId }, { slug: order.invitationId }] },
              data: { isWatermark: false, allowPrintKit: isPrintKitAllowed(order.planId), status: 'ACTIVE', licenseKey: finalKey }
            });
          }
        }
      }

      return reply.send({ success: true, message: 'Webhook processed.' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Webhook processing error.' });
    }
  }

  /**
   * Simulasi Pembayaran Lunas Instan
   */
  static async simulatePaid(request: FastifyRequest, reply: FastifyReply) {
    const { invoiceNumber } = request.params as { invoiceNumber: string };
    try {
      const fakeKey = `UND-DEV-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      await prisma.order.updateMany({
        where: { invoiceNumber },
        data: { status: 'PAID', licenseKey: fakeKey, paidAt: new Date() }
      });

      const order = await prisma.order.findUnique({ where: { invoiceNumber } });
      if (order) {
        await grantResellerTokensIfApplicable(order);

        if (order.invitationId) {
          await prisma.invitation.updateMany({
            where: { OR: [{ id: order.invitationId }, { slug: order.invitationId }] },
            data: { isWatermark: false, allowPrintKit: isPrintKitAllowed(order.planId), status: 'ACTIVE', licenseKey: fakeKey }
          });
        }
      }

      return reply.send({ success: true, message: 'Simulasi bayar lunas berhasil!', license_key: fakeKey });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: 'Gagal simulasi bayar.' });
    }
  }

  /**
   * Mengambil riwayat order / lisensi milik user
   */
  static async getMyOrders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loggedUser = (request.user as any);
      let userId = loggedUser?.userId;

      if (!userId) {
        const u = await prisma.user.findFirst();
        userId = u?.id;
      }

      if (!userId) {
        return reply.send({ success: true, data: [] });
      }

      const orders = await prisma.order.findMany({
        where: { userId, status: 'PAID' },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({ success: true, data: orders });
    } catch (err: any) {
      console.error('[Get My Orders Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengambil daftar order.' });
    }
  }

  /**
   * Transfer / Pasang Lisensi Resmi ke Undangan Lain
   */
  static async transferLicense(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      targetInvitationId: string;
      sourceInvitationId?: string;
      licenseKey?: string;
    };
    const { targetInvitationId, sourceInvitationId, licenseKey } = body;

    if (!targetInvitationId) {
      return reply.status(400).send({ success: false, message: 'ID Undangan tujuan wajib diisi.' });
    }

    try {
      const targetInv = await prisma.invitation.findFirst({
        where: { OR: [{ id: targetInvitationId }, { slug: targetInvitationId }] }
      });

      if (!targetInv) {
        return reply.status(404).send({ success: false, message: 'Undangan tujuan tidak ditemukan.' });
      }

      let keyToTransfer = licenseKey;
      let planIdToTransfer = targetInv.planId || 'UND-BASIC';

      // Skenario 1: Transfer langsung dari undangan asal yang aktif
      if (sourceInvitationId) {
        const sourceInv = await prisma.invitation.findFirst({
          where: { OR: [{ id: sourceInvitationId }, { slug: sourceInvitationId }] }
        });

        if (!sourceInv || !sourceInv.licenseKey || sourceInv.isWatermark) {
          return reply.status(400).send({ success: false, message: 'Undangan asal tidak memiliki lisensi aktif untuk dipindahkan.' });
        }

        keyToTransfer = sourceInv.licenseKey;
        planIdToTransfer = sourceInv.planId || 'UND-BASIC';

        // Deaktivasi undangan asal (kembali ke watermark/trial)
        await prisma.invitation.update({
          where: { id: sourceInv.id },
          data: {
            isWatermark: true,
            allowPrintKit: false,
            licenseKey: null,
            planId: null,
            status: 'DRAFT'
          }
        });
      } else if (licenseKey) {
        // Skenario 2: Pasang lisensi dari riwayat pesanan (licenseKey spesifik)
        const order = await prisma.order.findFirst({
          where: { licenseKey, status: 'PAID' }
        });

        if (!order) {
          return reply.status(404).send({ success: false, message: 'License key tidak valid atau belum berstatus lunas.' });
        }

        planIdToTransfer = order.planId;

        // Jika lisensi ini saat ini menempel di undangan lain, lepaskan dulu
        await prisma.invitation.updateMany({
          where: { licenseKey, id: { not: targetInv.id } },
          data: {
            isWatermark: true,
            allowPrintKit: false,
            licenseKey: null,
            planId: null,
            status: 'DRAFT'
          }
        });
      }

      if (!keyToTransfer) {
        return reply.status(400).send({ success: false, message: 'License key atau Undangan asal wajib ditentukan.' });
      }

      // Terapkan lisensi ke undangan tujuan
      const updatedTarget = await prisma.invitation.update({
        where: { id: targetInv.id },
        data: {
          isWatermark: false,
          allowPrintKit: isPrintKitAllowed(planIdToTransfer),
          status: 'ACTIVE',
          licenseKey: keyToTransfer,
          planId: planIdToTransfer
        }
      });

      // Update tautan order
      await prisma.order.updateMany({
        where: { licenseKey: keyToTransfer },
        data: { invitationId: updatedTarget.id }
      });

      return reply.send({
        success: true,
        message: `Lisensi resmi (${keyToTransfer}) berhasil dipindahkan ke undangan "${updatedTarget.title}"!`,
        data: {
          invitation: updatedTarget,
          licenseKey: keyToTransfer
        }
      });
    } catch (err: any) {
      console.error('[Transfer License Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal memindahkan lisensi: ' + err.message });
    }
  }

  /**
   * Aktivasi Lisensi Instan Menggunakan Saldo Token Akun Vendor (1-Klik)
   */
  static async activateWithToken(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { invitationId: string };
    const { invitationId } = body;

    if (!invitationId) {
      return reply.status(400).send({ success: false, message: 'ID Undangan wajib disertakan.' });
    }

    try {
      const loggedUser = request.user;
      let user = loggedUser ? await prisma.user.findUnique({ where: { id: loggedUser.userId } }) : null;

      if (!user) {
        user = await prisma.user.findFirst({ where: { quotaTokens: { gt: 0 } } });
      }

      if (!user || user.quotaTokens < 1) {
        return reply.status(400).send({
          success: false,
          message: 'Saldo Token Akun Anda tidak mencukupi. Silakan top up token lisensi vendor.'
        });
      }

      const generatedKey = `LIC-RES-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Kurangi 1 Token Akun
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { quotaTokens: { decrement: 1 } }
      });

      // 2. Aktifkan lisensi pada undangan
      const updatedInv = await prisma.invitation.updateMany({
        where: {
          OR: [
            { id: invitationId },
            { slug: invitationId }
          ]
        },
        data: {
          isWatermark: false,
          allowPrintKit: true,
          status: 'ACTIVE',
          licenseKey: generatedKey,
          planId: 'UND-RESELLER-TOKEN'
        }
      });

      // 3. Catat order riwayat transaksi token
      await prisma.order.create({
        data: {
          userId: user.id,
          invitationId,
          invoiceNumber: `INV-TOKEN-${Date.now()}`,
          planId: 'UND-RESELLER-TOKEN',
          planName: 'Aktivasi Saldo Token Reseller',
          amount: 0,
          status: 'PAID',
          paymentMethod: 'ACCOUNT_TOKEN',
          licenseKey: generatedKey,
          paidAt: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Undangan berhasil diaktifkan menggunakan 1 Token Akun Vendor!',
        data: {
          licenseKey: generatedKey,
          remainingTokens: updatedUser.quotaTokens,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            quotaTokens: updatedUser.quotaTokens
          }
        }
      });
    } catch (err: any) {
      console.error('[Activate With Token Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengaktifkan lisensi dengan token akun.' });
    }
  }
}
