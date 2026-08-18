import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4001', 10),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'absenta_luxeinvite_secret_key_2026_super_secure',
  jwtExpiresIn: '7d',
  licenseServerUrl: process.env.LICENSE_SERVER_URL || 'https://api.absenta.id',
  uploadDir: path.join(__dirname, '../../uploads'),
  uploadImagesDir: path.join(__dirname, '../../uploads/images'),
  uploadAudioDir: path.join(__dirname, '../../uploads/audio'),

  // MinIO S3 Storage Engine Config
  minio: {
    enabled: process.env.MINIO_ENABLED !== 'false',
    endPoint: (process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT || '127.0.0.1').replace(/^https?:\/\//, '').split(':')[0],
    port: parseInt(
      process.env.MINIO_PORT ||
      process.env.S3_PORT ||
      (process.env.S3_ENDPOINT || '').replace(/^https?:\/\//, '').split(':')[1] ||
      '9000',
      10
    ),
    useSSL: process.env.MINIO_USE_SSL === 'true' || (process.env.S3_ENDPOINT || '').startsWith('https://'),
    accessKey: process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY || process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY || process.env.S3_SECRET_KEY || 'minioadmin',
    bucketName: process.env.MINIO_BUCKET || process.env.S3_BUCKET || 'undangan-storage',
    publicUrl: process.env.MINIO_PUBLIC_URL || process.env.S3_PUBLIC_URL || '', // Jika kosong, gunakan format default endpoint/bucketName
  }
};
