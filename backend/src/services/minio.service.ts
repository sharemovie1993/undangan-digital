import * as Minio from 'minio';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { config } from '../config/app.config';

export class MinioService {
  private static client: Minio.Client | null = null;
  private static isInitialized = false;
  private static isMinioHealthy = false;

  /**
   * Inisialisasi MinIO Client
   */
  public static async init(): Promise<boolean> {
    if (MinioService.isInitialized) return MinioService.isMinioHealthy;

    try {
      MinioService.client = new Minio.Client({
        endPoint: config.minio.endPoint,
        port: config.minio.port,
        useSSL: config.minio.useSSL,
        accessKey: config.minio.accessKey,
        secretKey: config.minio.secretKey,
      });

      // Cek apakah MinIO server merespons
      const bucketExists = await MinioService.client.bucketExists(config.minio.bucketName);
      if (!bucketExists) {
        await MinioService.client.makeBucket(config.minio.bucketName, 'us-east-1');
        console.log(`[MinIO] Bucket '${config.minio.bucketName}' berhasil dibuat.`);

        // Set Public Read Policy agar gambar dan audio bisa diakses via browser/HP
        const publicReadPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetBucketLocation', 's3:ListBucket'],
              Resource: [`arn:aws:s3:::${config.minio.bucketName}`],
            },
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${config.minio.bucketName}/*`],
            },
          ],
        };

        await MinioService.client.setBucketPolicy(
          config.minio.bucketName,
          JSON.stringify(publicReadPolicy)
        );
        console.log(`[MinIO] Public Read Policy diterapkan pada bucket '${config.minio.bucketName}'.`);
      }

      MinioService.isMinioHealthy = true;
      console.log(`[MinIO] Terhubung ke MinIO S3 Storage di ${config.minio.endPoint}:${config.minio.port}`);
    } catch (err: any) {
      MinioService.isMinioHealthy = false;
      console.warn(`[MinIO] Tidak dapat terhubung ke MinIO (${err.message}). Menggunakan Local Disk Storage Fallback.`);
    }

    MinioService.isInitialized = true;
    return MinioService.isMinioHealthy;
  }

  /**
   * Upload Buffer ke MinIO (atau fallback ke Local Disk jika MinIO offline)
   */
  public static async uploadBuffer(
    buffer: Buffer,
    objectName: string,
    mimeType: string,
    folder: 'images' | 'audio' = 'images'
  ): Promise<{ fileUrl: string; fileName: string; storageType: 'minio' | 'local' }> {
    await MinioService.init();

    const fullObjectName = `${folder}/${objectName}`;

    if (MinioService.isMinioHealthy && MinioService.client) {
      try {
        await MinioService.client.putObject(
          config.minio.bucketName,
          fullObjectName,
          buffer,
          buffer.length,
          {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          }
        );

        // Buat Public File URL
        let fileUrl = '';
        if (config.minio.publicUrl) {
          fileUrl = `${config.minio.publicUrl.replace(/\/$/, '')}/${fullObjectName}`;
        } else {
          const protocol = config.minio.useSSL ? 'https' : 'http';
          fileUrl = `${protocol}://${config.minio.endPoint}:${config.minio.port}/${config.minio.bucketName}/${fullObjectName}`;
        }

        return {
          fileUrl,
          fileName: objectName,
          storageType: 'minio',
        };
      } catch (err: any) {
        console.warn(`[MinIO Upload Error] Gagal upload ke MinIO: ${err.message}. Fallback ke disk.`);
      }
    }

    // LOCAL DISK FALLBACK
    const targetDir = folder === 'images' ? config.uploadImagesDir : config.uploadAudioDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const localSavePath = path.join(targetDir, objectName);
    fs.writeFileSync(localSavePath, buffer);

    const fileUrl = `/uploads/${folder}/${objectName}`;
    return {
      fileUrl,
      fileName: objectName,
      storageType: 'local',
    };
  }

  /**
   * Upload Stream ke MinIO
   */
  public static async uploadStream(
    stream: Readable,
    objectName: string,
    mimeType: string,
    folder: 'images' | 'audio' = 'images'
  ): Promise<{ fileUrl: string; fileName: string; storageType: 'minio' | 'local' }> {
    // Kumpulkan stream menjadi buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    return MinioService.uploadBuffer(buffer, objectName, mimeType, folder);
  }
}
