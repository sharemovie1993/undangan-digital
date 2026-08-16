import { FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';
import crypto from 'crypto';
import { MinioService } from '../services/minio.service';
import { prisma } from '../db';

export class UploadController {
  /**
   * Upload Single Gambar (Foto Pasangan / Avatar / Cover)
   */
  static async uploadImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ success: false, message: 'Tidak ada berkas gambar yang diunggah.' });
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimes.includes(data.mimetype)) {
        return reply.status(400).send({ success: false, message: 'Format gambar harus JPG, PNG, atau WEBP.' });
      }

      const ext = path.extname(data.filename) || '.jpg';
      const uniqueName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

      const buffer = await data.toBuffer();
      const uploadResult = await MinioService.uploadBuffer(buffer, uniqueName, data.mimetype, 'images');

      return reply.send({
        success: true,
        message: 'Gambar berhasil diunggah ke Storage!',
        data: {
          originalName: data.filename,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          mimeType: data.mimetype,
          storageType: uploadResult.storageType,
        },
      });
    } catch (err: any) {
      console.error('[Upload Image Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengunggah berkas gambar.' });
    }
  }

  /**
   * Upload Massal Gambar Galeri (Multiple Images Upload)
   */
  static async uploadMultipleImages(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parts = request.files();
      const uploadedResults = [];

      for await (const part of parts) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(part.mimetype)) continue;

        const ext = path.extname(part.filename) || '.jpg';
        const uniqueName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

        const buffer = await part.toBuffer();
        const uploadResult = await MinioService.uploadBuffer(buffer, uniqueName, part.mimetype, 'images');

        uploadedResults.push({
          originalName: part.filename,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          mimeType: part.mimetype,
          storageType: uploadResult.storageType,
        });
      }

      if (uploadedResults.length === 0) {
        return reply.status(400).send({ success: false, message: 'Tidak ada berkas gambar valid yang berhasil diunggah.' });
      }

      return reply.send({
        success: true,
        message: `Berhasil mengunggah ${uploadedResults.length} foto ke Storage!`,
        data: uploadedResults,
      });
    } catch (err: any) {
      console.error('[Upload Multiple Images Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengunggah beberapa berkas gambar.' });
    }
  }

  /**
   * Upload File Audio Musik Kustom
   */
  static async uploadAudio(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ success: false, message: 'Tidak ada berkas audio yang diunggah.' });
      }

      const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      if (!allowedMimes.includes(data.mimetype) && !data.filename.endsWith('.mp3')) {
        return reply.status(400).send({ success: false, message: 'Format audio harus MP3 atau WAV.' });
      }

      const uniqueName = `audio_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.mp3`;

      const buffer = await data.toBuffer();
      const uploadResult = await MinioService.uploadBuffer(buffer, uniqueName, data.mimetype || 'audio/mpeg', 'audio');

      return reply.send({
        success: true,
        message: 'Berkas audio musik berhasil diunggah ke Storage!',
        data: {
          originalName: data.filename,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          mimeType: data.mimetype,
          storageType: uploadResult.storageType,
        },
      });
    } catch (err: any) {
      console.error('[Upload Audio Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengunggah berkas audio.' });
    }
  }
}
