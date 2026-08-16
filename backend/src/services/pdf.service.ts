import PDFDocument from 'pdfkit';
import { QrService } from './qr.service';

export interface CardPrintData {
  title: string;
  eventType: string;
  names: string;
  dateText: string;
  timeText: string;
  locationName: string;
  address: string;
  qrUrl: string;
}

export interface GuestLabel {
  name: string;
  address?: string;
  category?: string;
}

export class PdfPrintService {
  /**
   * Helper: Menggambar Crop Marks & Bleed Guide untuk mesin potong percetakan offset
   */
  private static drawCropMarks(doc: typeof PDFDocument, width: number, height: number, margin: number = 20) {
    const markLength = 10;
    doc.lineWidth(0.4).strokeColor('#888888');

    // Top-Left
    doc.moveTo(margin, margin - markLength).lineTo(margin, margin).stroke();
    doc.moveTo(margin - markLength, margin).lineTo(margin, margin).stroke();

    // Top-Right
    doc.moveTo(width - margin, margin - markLength).lineTo(width - margin, margin).stroke();
    doc.moveTo(width - margin + markLength, margin).lineTo(width - margin, margin).stroke();

    // Bottom-Left
    doc.moveTo(margin, height - margin + markLength).lineTo(margin, height - margin).stroke();
    doc.moveTo(margin - markLength, height - margin).lineTo(margin, height - margin).stroke();

    // Bottom-Right
    doc.moveTo(width - margin, height - margin + markLength).lineTo(width - margin, height - margin).stroke();
    doc.moveTo(width - margin + markLength, height - margin).lineTo(width - margin, height - margin).stroke();
  }

  /**
   * 1. Generate Physical Invitation Card PDF (A5 & 4R)
   * 🚀 Dilengkapi dengan Bleed Line 3mm & Corner Crop Marks
   */
  static async generateCardPdf(data: CardPrintData, format: 'A5' | '4R' = 'A5'): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const width = format === 'A5' ? 420 : 290;
        const height = format === 'A5' ? 595 : 430;

        const doc = new PDFDocument({
          size: [width, height],
          margins: { top: 30, bottom: 30, left: 30, right: 30 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Crop Marks untuk Percetakan Offset
        PdfPrintService.drawCropMarks(doc, width, height, 15);

        // Background Luxury Box
        doc.rect(18, 18, width - 36, height - 36)
          .lineWidth(1.2)
          .strokeColor('#D4AF37')
          .stroke();

        doc.rect(22, 22, width - 44, height - 44)
          .lineWidth(0.6)
          .strokeColor('#D4AF37')
          .stroke();

        // Header Title
        doc.moveDown(1.5);
        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#706E6B')
          .text(data.eventType === 'WEDDING' ? 'THE WEDDING OF' : 'UNDANGAN SYUKURAN', {
            align: 'center',
            characterSpacing: 2
          });

        doc.moveDown(0.8);
        doc.font('Helvetica-Bold')
          .fontSize(format === 'A5' ? 24 : 18)
          .fillColor('#1A1A1A')
          .text(data.names, { align: 'center' });

        doc.moveDown(1);
        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#555555')
          .text('Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara:', {
            align: 'center',
            width: width - 80
          });

        doc.moveDown(1.2);
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('#D4AF37')
          .text(data.dateText, { align: 'center' });

        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#333333')
          .text(data.timeText, { align: 'center' });

        doc.moveDown(0.8);
        doc.font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#1A1A1A')
          .text(data.locationName, { align: 'center' });

        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#666666')
          .text(data.address, { align: 'center', width: width - 80 });

        // Embed QR Code for Digital Invitation & Location (Parallel Cache Buffer)
        if (data.qrUrl) {
          const qrBuffer = await QrService.generateBuffer(data.qrUrl);
          const qrSize = format === 'A5' ? 80 : 65;
          const qrX = (width - qrSize) / 2;
          const qrY = height - qrSize - 55;
          doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

          doc.fontSize(8)
            .fillColor('#888888')
            .text('Scan QR untuk Buka Undangan Digital & Peta Lokasi', 20, qrY + qrSize + 6, {
              align: 'center',
              width: width - 40
            });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 2. Generate Sticker Label Sheet PDF (Dukungan Tom & Jerry 103: 12/A4 & Tom & Jerry 108: 18/A4)
   * 🚀 Dioptimasi dengan layout grid presisi tinggi
   */
  static async generateStickerLabelsPdf(guests: GuestLabel[], templateType: '103' | '108' = '103'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const is108 = templateType === '108';
        // Parameter Tom & Jerry 103 (2 kolom x 6 baris = 12 label) vs 108 (3 kolom x 6 baris = 18 label)
        const colWidth = is108 ? 175 : 260;
        const rowHeight = is108 ? 115 : 120;
        const leftMargin = is108 ? 25 : 35;
        const topMargin = is108 ? 30 : 40;
        const colGap = is108 ? 10 : 15;
        const rowGap = is108 ? 6 : 8;
        const labelsPerPage = is108 ? 18 : 12;
        const numCols = is108 ? 3 : 2;

        for (let i = 0; i < guests.length; i++) {
          const slotIndex = i % labelsPerPage;

          if (i > 0 && slotIndex === 0) {
            doc.addPage();
          }

          const col = slotIndex % numCols;
          const row = Math.floor(slotIndex / numCols);

          const x = leftMargin + col * (colWidth + colGap);
          const y = topMargin + row * (rowHeight + rowGap);

          // Sticker border guideline (light dotted)
          doc.rect(x, y, colWidth, rowHeight)
            .lineWidth(0.5)
            .dash(3, { space: 3 })
            .strokeColor('#D0D0D0')
            .stroke();
          doc.undash();

          const guest = guests[i];
          const textY = y + (is108 ? 20 : 25);

          doc.font('Helvetica')
            .fontSize(is108 ? 7.5 : 8)
            .fillColor('#777777')
            .text('Kepada Yth. Bapak/Ibu/Saudara/i:', x + 8, textY, {
              align: 'center',
              width: colWidth - 16
            });

          doc.font('Helvetica-Bold')
            .fontSize(is108 ? 9.5 : 11)
            .fillColor('#1A1A1A')
            .text(guest.name, x + 8, textY + (is108 ? 14 : 16), {
              align: 'center',
              width: colWidth - 16
            });

          if (guest.address) {
            doc.font('Helvetica')
              .fontSize(is108 ? 8 : 9)
              .fillColor('#555555')
              .text(`di ${guest.address}`, x + 8, textY + (is108 ? 30 : 36), {
                align: 'center',
                width: colWidth - 16
              });
          }
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 3. Generate Souvenir Tags & Food Coupons PDF (8 tags per A4 sheet)
   */
  static async generateSouvenirTagsPdf(title: string, names: string, count: number = 24): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 30, left: 30, right: 30 } });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const tagWidth = 240;
        const tagHeight = 160;
        const leftMargin = 40;
        const topMargin = 40;
        const tagsPerPage = 8;

        for (let i = 0; i < count; i++) {
          const slot = i % tagsPerPage;
          if (i > 0 && slot === 0) doc.addPage();

          const col = slot % 2;
          const row = Math.floor(slot / 2);
          const x = leftMargin + col * (tagWidth + 25);
          const y = topMargin + row * (tagHeight + 20);

          doc.rect(x, y, tagWidth, tagHeight).lineWidth(0.8).strokeColor('#D4AF37').stroke();
          doc.rect(x + 3, y + 3, tagWidth - 6, tagHeight - 6).lineWidth(0.4).strokeColor('#D4AF37').stroke();

          doc.font('Helvetica').fontSize(9).fillColor('#888888').text('THANK YOU FOR CELEBRATING WITH US', x, y + 25, { align: 'center', width: tagWidth });
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#1A1A1A').text(names, x, y + 45, { align: 'center', width: tagWidth });
          doc.font('Helvetica').fontSize(8).fillColor('#555555').text('Kupon Penukaran Souvenir & Makanan', x, y + 75, { align: 'center', width: tagWidth });
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#D4AF37').text(`NO. ${String(i + 1).padStart(3, '0')}`, x, y + 105, { align: 'center', width: tagWidth });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 4. Generate Table Standee QR Reception PDF (A6 size)
   */
  static async generateTableStandeePdf(names: string, qrUrl: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const width = 297;
        const height = 420;
        const doc = new PDFDocument({ size: [width, height], margins: { top: 20, bottom: 20, left: 20, right: 20 } });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        PdfPrintService.drawCropMarks(doc, width, height, 10);

        doc.rect(12, 12, width - 24, height - 24).lineWidth(1).strokeColor('#D4AF37').stroke();
        doc.font('Helvetica').fontSize(10).fillColor('#888888').text('WELCOME TO THE RECEPTION OF', 0, 45, { align: 'center', width });
        doc.font('Helvetica-Bold').fontSize(18).fillColor('#1A1A1A').text(names, 0, 65, { align: 'center', width });

        const qrBuffer = await QrService.generateBuffer(qrUrl);
        const qrSize = 140;
        const qrX = (width - qrSize) / 2;
        const qrY = 110;
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#D4AF37').text('SCAN UNTUK BUKU TAMU & RSVP DIGITAL', 0, 270, { align: 'center', width });
        doc.font('Helvetica').fontSize(9).fillColor('#666666').text('Silakan pindai untuk mengisi ucapan dan galeri foto', 0, 290, { align: 'center', width });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
