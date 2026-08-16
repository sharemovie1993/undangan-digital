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
  uploadAudioDir: path.join(__dirname, '../../uploads/audio')
};
