import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { config } from '../config/app.config';
import { prisma } from '../db';

export class UploadController {
  /**
   * Pastikan folder upload tersedia
   */
  private static ensureDirs() {
    if (!fs.existsSync(config.uploadDir)) fs.mkdirSync(config.uploadDir, { recursive: true });
    if (!fs.existsSync(config.uploadImagesDir)) fs.mkdirSync(config.uploadImagesDir, { recursive: true });
    if (!fs.existsSync(config.uploadAudioDir)) fs.mkdirSync(config.uploadAudioDir, { recursive: true });
  }

  /**
   * Upload Single Gambar (Profil)
   */
  static async uploadImage(request: FastifyRequest, reply: FastifyReply) {
    UploadController.ensureDirs();

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
      const savePath = path.join(config.uploadImagesDir, uniqueName);

      await pipeline(data.file, fs.createWriteStream(savePath));

      const fileUrl = `http://localhost:${config.port}/uploads/images/${uniqueName}`;

      return reply.send({
        success: true,
        message: 'Gambar berhasil diunggah!',
        data: {
          originalName: data.filename,
          fileName: uniqueName,
          fileUrl,
          mimeType: data.mimetype
        }
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
    UploadController.ensureDirs();

    try {
      const parts = request.files();
      const uploadedResults = [];

      for await (const part of parts) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(part.mimetype)) continue;

        const ext = path.extname(part.filename) || '.jpg';
        const uniqueName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        const savePath = path.join(config.uploadImagesDir, uniqueName);

        await pipeline(part.file, fs.createWriteStream(savePath));
        const fileUrl = `http://localhost:${config.port}/uploads/images/${uniqueName}`;

        uploadedResults.push({
          originalName: part.filename,
          fileName: uniqueName,
          fileUrl,
          mimeType: part.mimetype
        });
      }

      if (uploadedResults.length === 0) {
        return reply.status(400).send({ success: false, message: 'Tidak ada berkas gambar valid yang berhasil diunggah.' });
      }

      return reply.send({
        success: true,
        message: `Berhasil mengunggah ${uploadedResults.length} foto!`,
        data: uploadedResults
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
    UploadController.ensureDirs();

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
      const savePath = path.join(config.uploadAudioDir, uniqueName);

      await pipeline(data.file, fs.createWriteStream(savePath));

      const fileUrl = `http://localhost:${config.port}/uploads/audio/${uniqueName}`;

      return reply.send({
        success: true,
        message: 'Berkas audio musik berhasil diunggah!',
        data: {
          originalName: data.filename,
          fileName: uniqueName,
          fileUrl,
          mimeType: data.mimetype
        }
      });
    } catch (err: any) {
      console.error('[Upload Audio Error]', err.message);
      return reply.status(500).send({ success: false, message: 'Gagal mengunggah berkas audio.' });
    }
  }
}
