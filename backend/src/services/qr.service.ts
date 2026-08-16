import QRCode from 'qrcode';

const qrBufferCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 1000;

export class QrService {
  /**
   * Menghasilkan QR Code dalam format Data URL (PNG Base64)
   */
  static async generateDataUrl(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#1A1A1A',
          light: '#FFFFFF'
        }
      });
    } catch (err: any) {
      console.error('[QrService] Failed to generate QR:', err.message);
      return '';
    }
  }

  /**
   * Menghasilkan QR Code Buffer untuk disematkan ke PDFKit
   * 🚀 Dioptimasi dengan In-Memory RAM Buffer Cache (Menghemat CPU saat cetak massal)
   */
  static async generateBuffer(text: string): Promise<Buffer> {
    if (qrBufferCache.has(text)) {
      return qrBufferCache.get(text)!;
    }

    try {
      const buffer = await QRCode.toBuffer(text, {
        type: 'png',
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 400
      });

      if (qrBufferCache.size >= MAX_CACHE_SIZE) {
        const firstKey = qrBufferCache.keys().next().value;
        if (firstKey) qrBufferCache.delete(firstKey);
      }
      qrBufferCache.set(text, buffer);

      return buffer;
    } catch (err: any) {
      console.error('[QrService] Failed to generate buffer:', err.message);
      return Buffer.from('');
    }
  }
}
