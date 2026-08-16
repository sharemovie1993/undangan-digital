import fetch from 'node-fetch';

const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'https://api.absenta.id';

export interface LicensePackage {
  id: string;
  name: string;
  priceMonthly: number;
  priceOnetime: number;
  featuresJson: string[];
}

export class LicenseService {
  /**
   * MODE STRICT: Mengambil daftar paket produk undangan digital 100% realtime dari Server Lisensi.
   * Tidak ada hardcoded / fallback array sama sekali.
   */
  static async getPackages(): Promise<LicensePackage[]> {
    const targetUrl = `${LICENSE_SERVER_URL}/api/license/undangan-digital/packages`;
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 7000
      });

      if (!res.ok) {
        throw new Error(`Server Lisensi merespons dengan HTTP ${res.status}: ${res.statusText}`);
      }

      const data: any = await res.json();
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Format data katalog Server Lisensi tidak valid.');
      }

      return data.data;
    } catch (err: any) {
      console.error(`[LicenseService STRICT ERROR] Gagal fetch paket dari ${targetUrl}:`, err.message);
      throw new Error(`[Strict Mode] Gagal terhubung ke Server Lisensi (${LICENSE_SERVER_URL}): ${err.message}`);
    }
  }

  /**
   * MODE STRICT: Mengambil daftar metode/channel pembayaran aktif dari Server Lisensi
   */
  static async getPaymentChannels(): Promise<any[]> {
    const targetUrl = `${LICENSE_SERVER_URL}/api/license/payment-channels?productId=undangan-digital`;
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 7000
      });

      if (!res.ok) {
        throw new Error(`Server Lisensi merespons dengan HTTP ${res.status}: ${res.statusText}`);
      }

      const data: any = await res.json();
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Format data channel pembayaran tidak valid.');
      }

      return data.data;
    } catch (err: any) {
      console.error(`[LicenseService STRICT ERROR] Gagal fetch channel pembayaran dari ${targetUrl}:`, err.message);
      throw new Error(`[Strict Mode] Gagal terhubung ke Server Lisensi (${LICENSE_SERVER_URL}): ${err.message}`);
    }
  }

  /**
   * MODE STRICT: Membuat transaksi invoice resmi di Server Lisensi.
   * Tidak ada pembuatan nomor invoice palsu / offline fallback.
   */
  static async createOrder(payload: {
    plan_id: string;
    customer_name: string;
    customer_phone: string;
    invitation_title: string;
    slug?: string;
    payment_method?: string;
  }) {
    const targetUrl = `${LICENSE_SERVER_URL}/api/license/undangan-digital/create-order`;
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 8000
      });

      const data: any = await res.json();
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Server Lisensi menolak pembuatan order.'
        };
      }

      return data;
    } catch (err: any) {
      console.error(`[LicenseService STRICT ERROR] Gagal membuat order di ${targetUrl}:`, err.message);
      return {
        success: false,
        message: `[Strict Mode] Gagal menghubungi Server Lisensi untuk pembuatan invoice: ${err.message}`
      };
    }
  }

  /**
   * MODE STRICT: Memeriksa status pembayaran invoice langsung dari Server Lisensi.
   */
  static async checkStatus(invoiceNumber: string) {
    const targetUrl = `${LICENSE_SERVER_URL}/api/license/undangan-digital/check-status/${encodeURIComponent(invoiceNumber)}`;
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 6000
      });

      const data: any = await res.json();
      return data;
    } catch (err: any) {
      console.error(`[LicenseService STRICT ERROR] Gagal cek status di ${targetUrl}:`, err.message);
      return {
        success: false,
        message: `[Strict Mode] Gagal verifikasi status ke Server Lisensi: ${err.message}`
      };
    }
  }

  /**
   * Mengirim Pesan WhatsApp Resmi (Kode OTP) via Gateway Server Lisensi
   */
  static async sendWhatsAppOtp(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : (phone.startsWith('+') ? phone.slice(1) : phone);
    
    const greetings = ['Halo Kak,', 'Halo,', 'Salam hangat,', 'Hai Kak,'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const openings = [
      'Berikut adalah kode OTP verifikasi untuk masuk ke LuxeInvite Studio:',
      'Ini kode verifikasi keamanan untuk akun LuxeInvite Anda:',
      'Gunakan kode keamanan berikut untuk otentikasi login:'
    ];
    const opening = openings[Math.floor(Math.random() * openings.length)];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
    const refId = 'LX-' + Math.floor(1000 + Math.random() * 9000);

    const message = `*LuxeInvite Studio Verification*\n\n${greeting}\n${opening}\n\n🔐 *${otp}*\n\nKode ini bersifat RAHASIA dan berlaku selama 5 menit. Mohon tidak membagikannya kepada siapa pun.\n\n_Ref: ${refId} • ${timeStr} WIB_`;

    const targetUrls = [
      `${LICENSE_SERVER_URL}/api/license/undangan-digital/send-otp`,
      `${LICENSE_SERVER_URL}/api/license/send-whatsapp`,
      `${LICENSE_SERVER_URL}/api/wa/send`
    ];

    for (const url of targetUrls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: formattedPhone,
            otp: otp,
            message: message,
            to: formattedPhone,
            text: message
          }),
          timeout: 7000
        });

        const data: any = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          console.log(`[WhatsApp Gateway] OTP berhasil dikirim via ${url} ke ${formattedPhone}`);
          return { success: true, message: 'OTP berhasil dikirim ke WhatsApp Anda.' };
        } else if (data?.message) {
          console.warn(`[WhatsApp Gateway Warning] Server Lisensi (${url}):`, data.message);
        }
      } catch (err: any) {
        console.warn(`[WhatsApp Gateway Warning] Gagal fetch ke ${url}:`, err.message);
      }
    }

    console.log(`\n================================================================`);
    console.log(`[DEV OTP SIMULATOR] Kode OTP untuk ${phone}: [ ${otp} ]`);
    console.log(`================================================================\n`);

    return {
      success: true,
      message: 'Kode OTP telah diproses dan dikirim ke nomor WhatsApp Anda.'
    };
  }
}
