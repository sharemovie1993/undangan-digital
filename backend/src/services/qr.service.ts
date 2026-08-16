import QRCode from 'qrcode';

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
   */
  static async generateBuffer(text: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(text, {
        type: 'png',
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 400
      });
    } catch (err: any) {
      console.error('[QrService] Failed to generate buffer:', err.message);
      return Buffer.from('');
    }
  }
}
