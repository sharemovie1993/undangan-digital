import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { prisma } from '../../../db';
import { config } from '../../../config/app.config';
import { MinioService } from '../../../services/minio.service';

export interface BackupManifest {
  app: string;
  version: string;
  backupType: 'FULL' | 'DATABASE_ONLY';
  createdAt: string;
  counts: {
    users: number;
    invitations: number;
    guests: number;
    rsvps: number;
    orders: number;
    mediaUploads: number;
    themePresets: number;
    styleKitPresets: number;
    easyTunnels: number;
  };
  includesMedia: boolean;
  checksumSha256?: string;
}

export interface BackupListItem {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  manifest?: BackupManifest | null;
}

export class BackupService {
  private static backupsDir = path.resolve(process.cwd(), 'data', 'backups');

  public static ensureBackupsDir() {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 📦 Buat arsip backup lengkap (.zip) berisi database JSON dump + seluruh file uploads
   */
  public static async createBackup(options: { includeMedia?: boolean } = {}): Promise<{
    filename: string;
    filePath: string;
    sizeBytes: number;
    sizeFormatted: string;
    manifest: BackupManifest;
  }> {
    this.ensureBackupsDir();
    const includeMedia = options.includeMedia !== false;

    // 1. Ekstrak seluruh tabel database Prisma
    const [
      users,
      invitations,
      guests,
      rsvps,
      orders,
      mediaUploads,
      themePresets,
      styleKitPresets,
      easyTunnels
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.invitation.findMany(),
      prisma.guest.findMany(),
      prisma.rsvp.findMany(),
      prisma.order.findMany(),
      prisma.mediaUpload.findMany(),
      prisma.themePreset.findMany(),
      prisma.styleKitPreset.findMany(),
      prisma.easyTunnel.findMany()
    ]);

    const counts = {
      users: users.length,
      invitations: invitations.length,
      guests: guests.length,
      rsvps: rsvps.length,
      orders: orders.length,
      mediaUploads: mediaUploads.length,
      themePresets: themePresets.length,
      styleKitPresets: styleKitPresets.length,
      easyTunnels: easyTunnels.length
    };

    const databaseDump = {
      users,
      invitations,
      guests,
      rsvps,
      orders,
      mediaUploads,
      themePresets,
      styleKitPresets,
      easyTunnels
    };

    const dumpJsonStr = JSON.stringify(databaseDump, null, 2);
    const dumpSha256 = crypto.createHash('sha256').update(dumpJsonStr).digest('hex');

    const manifest: BackupManifest = {
      app: 'undangan-digital',
      version: '1.0.0',
      backupType: includeMedia ? 'FULL' : 'DATABASE_ONLY',
      createdAt: new Date().toISOString(),
      counts,
      includesMedia: includeMedia,
      checksumSha256: dumpSha256
    };

    // 2. Buat berkas ZIP menggunakan AdmZip
    const zip = new AdmZip();

    // Tambahkan manifest & dump database
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));
    zip.addFile('database_dump.json', Buffer.from(dumpJsonStr, 'utf-8'));

    // 3. Masukkan seluruh file media dari MinIO S3 dan folder uploads/ jika includeMedia = true
    if (includeMedia) {
      const addedPaths = new Set<string>();

      // A. Jika MinIO aktif, kemas seluruh berkas media (images/ dan audio/) dari MinIO S3 bucket
      try {
        const isMinioOk = await MinioService.isAvailable();
        if (isMinioOk) {
          const imageObjects = await MinioService.listAllObjects('images/');
          const audioObjects = await MinioService.listAllObjects('audio/');
          const allMediaObjects = [...imageObjects, ...audioObjects];

          for (const objName of allMediaObjects) {
            const buf = await MinioService.getObjectBuffer(objName);
            if (buf) {
              zip.addFile(`uploads/${objName}`, buf);
              addedPaths.add(objName);
            }
          }
          if (addedPaths.size > 0) {
            console.log(`[BackupService] Berhasil mengemas ${addedPaths.size} berkas media dari MinIO S3.`);
          }
        }
      } catch (err: any) {
        console.warn('[BackupService] MinIO packaging error:', err.message);
      }

      // B. Scan folder disk lokal uploads/ (termasuk subfolder images & audio)
      const scanAndAddLocal = (dir: string, baseDir: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanAndAddLocal(fullPath, baseDir);
          } else if (entry.isFile()) {
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            if (!addedPaths.has(relPath)) {
              const fileData = fs.readFileSync(fullPath);
              zip.addFile(`uploads/${relPath}`, fileData);
              addedPaths.add(relPath);
            }
          }
        }
      };

      if (fs.existsSync(config.uploadDir)) {
        scanAndAddLocal(config.uploadDir, config.uploadDir);
      }
    }

    // 4. Tulis file ZIP ke folder data/backups
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const filename = `undangan_backup_${dateStr}_${manifest.backupType.toLowerCase()}.zip`;
    const targetFilePath = path.join(this.backupsDir, filename);

    zip.writeZip(targetFilePath);

    const stats = fs.statSync(targetFilePath);

    return {
      filename,
      filePath: targetFilePath,
      sizeBytes: stats.size,
      sizeFormatted: this.formatBytes(stats.size),
      manifest
    };
  }

  /**
   * 📋 Ambil daftar file backup lokal yang tersimpan
   */
  public static async listBackups(): Promise<BackupListItem[]> {
    this.ensureBackupsDir();
    const files = fs.readdirSync(this.backupsDir).filter(f => f.endsWith('.zip'));
    const list: BackupListItem[] = [];

    for (const filename of files) {
      const fullPath = path.join(this.backupsDir, filename);
      try {
        const stats = fs.statSync(fullPath);
        let manifest: BackupManifest | null = null;

        try {
          const zip = new AdmZip(fullPath);
          const manifestEntry = zip.getEntry('manifest.json');
          if (manifestEntry) {
            const manifestContent = zip.readAsText(manifestEntry);
            manifest = JSON.parse(manifestContent);
          }
        } catch {
          // File zip tidak valid atau sedang ditulis
        }

        list.push({
          filename,
          filePath: fullPath,
          sizeBytes: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          createdAt: manifest?.createdAt || stats.birthtime.toISOString(),
          manifest
        });
      } catch (err) {
        console.warn(`[BackupService] Gagal membaca metadata file ${filename}:`, err);
      }
    }

    // Urutkan dari yang paling baru
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 📥 Dapatkan path file backup untuk download
   */
  public static getBackupFilePath(filename: string): string {
    this.ensureBackupsDir();
    // Sanitasi filename untuk mencegah path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.backupsDir, safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Berkas backup "${safeFilename}" tidak ditemukan di server.`);
    }
    return filePath;
  }

  /**
   * 🗑️ Hapus file backup dari server
   */
  public static deleteBackup(filename: string): boolean {
    this.ensureBackupsDir();
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.backupsDir, safeFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * 🔄 Restore database & media uploads dari file ZIP backup
   */
  public static async restoreBackup(zipSource: string | Buffer): Promise<{
    success: boolean;
    manifest: BackupManifest;
    restoredCounts: Record<string, number>;
    message: string;
  }> {
    const zip = typeof zipSource === 'string' ? new AdmZip(zipSource) : new AdmZip(zipSource);

    // 1. Validasi manifest.json
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      throw new Error('Format berkas backup tidak valid: berkas "manifest.json" tidak ditemukan di dalam ZIP.');
    }

    const manifestText = zip.readAsText(manifestEntry);
    const manifest: BackupManifest = JSON.parse(manifestText);

    if (manifest.app !== 'undangan-digital') {
      throw new Error(`Arsip ini bukan backup untuk aplikasi Undangan Digital (Ditemukan: ${manifest.app || 'unknown'}).`);
    }

    // 2. Validasi database_dump.json
    const dumpEntry = zip.getEntry('database_dump.json');
    if (!dumpEntry) {
      throw new Error('Format berkas backup tidak valid: berkas "database_dump.json" tidak ditemukan di dalam ZIP.');
    }

    const dumpText = zip.readAsText(dumpEntry);
    const dumpData = JSON.parse(dumpText);

    // 3. Ekstrak seluruh file media ke direktori uploads/ dan sync ke MinIO jika aktif
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    const zipEntries = zip.getEntries();
    let mediaExtractedCount = 0;
    const isMinioOk = await MinioService.isAvailable();

    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('uploads/') && !entry.isDirectory) {
        const relativeFileName = entry.entryName.replace(/^uploads\//, '');
        if (relativeFileName) {
          const entryData = entry.getData();

          // Simpan ke disk lokal
          const destinationPath = path.join(config.uploadDir, relativeFileName);
          const destDir = path.dirname(destinationPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.writeFileSync(destinationPath, entryData);
          mediaExtractedCount++;

          // Jika MinIO aktif di server baru, upload langsung ke MinIO bucket
          if (isMinioOk) {
            try {
              const mimeType = relativeFileName.endsWith('.mp3')
                ? 'audio/mpeg'
                : relativeFileName.endsWith('.png')
                ? 'image/png'
                : relativeFileName.endsWith('.webp')
                ? 'image/webp'
                : 'image/jpeg';
              await MinioService.putDirectObject(relativeFileName, entryData, mimeType);
            } catch (err: any) {
              console.warn(`[BackupService] Gagal sync ${relativeFileName} ke MinIO:`, err.message);
            }
          }
        }
      }
    }

    // 4. ATOMIC CLEAN WIPE: Kosongkan tabel data aplikasi terlebih dahulu agar bersih 1:1 tanpa konflik relasi
    await prisma.$transaction([
      prisma.rsvp.deleteMany(),
      prisma.guest.deleteMany(),
      prisma.mediaUpload.deleteMany(),
      prisma.order.deleteMany(),
      prisma.invitation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.easyTunnel.deleteMany()
    ]);

    const restoredCounts: Record<string, number> = {
      users: 0,
      invitations: 0,
      guests: 0,
      rsvps: 0,
      orders: 0,
      mediaUploads: 0,
      themePresets: 0,
      styleKitPresets: 0,
      easyTunnels: 0,
      mediaFiles: mediaExtractedCount
    };

    // A. Users (Clean Pure Insert)
    if (Array.isArray(dumpData.users)) {
      for (const u of dumpData.users) {
        const { id, email, phone, name, password, role, quotaTokens, avatarUrl, createdAt, updatedAt } = u;
        await prisma.user.create({
          data: {
            id,
            email,
            phone: phone || null,
            name,
            password,
            role: role || 'USER',
            quotaTokens: quotaTokens ?? 0,
            avatarUrl: avatarUrl || null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
        restoredCounts.users++;
      }
    }

    // B. Invitations (Clean Pure Insert)
    if (Array.isArray(dumpData.invitations)) {
      for (const inv of dumpData.invitations) {
        const {
          id,
          userId,
          eventType,
          title,
          slug,
          customDomain,
          themeId,
          themeConfig,
          stitchBlocks,
          printConfig,
          eventDataJson,
          status,
          isWatermark,
          allowPrintKit,
          licenseKey,
          planId,
          expiresAt,
          createdAt,
          updatedAt
        } = inv;

        await prisma.invitation.create({
          data: {
            id,
            userId,
            eventType: eventType || 'WEDDING',
            title,
            slug,
            customDomain: customDomain || null,
            themeId: themeId || 'champagne_gold',
            themeConfig: themeConfig || null,
            stitchBlocks: stitchBlocks || null,
            printConfig: printConfig || null,
            eventDataJson,
            status: status || 'DRAFT',
            isWatermark: isWatermark ?? true,
            allowPrintKit: allowPrintKit ?? false,
            licenseKey: licenseKey || null,
            planId: planId || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
        restoredCounts.invitations++;
      }
    }

    // C. Guests (Clean Pure Insert)
    if (Array.isArray(dumpData.guests)) {
      for (const g of dumpData.guests) {
        const {
          id,
          invitationId,
          name,
          phone,
          address,
          category,
          qrCode,
          hasOpened,
          openedAt,
          isCheckedIn,
          checkedInAt,
          pax,
          createdAt
        } = g;

        await prisma.guest.create({
          data: {
            id,
            invitationId,
            name,
            phone: phone || null,
            address: address || null,
            category: category || 'Tamu Undangan',
            qrCode,
            hasOpened: hasOpened ?? false,
            openedAt: openedAt ? new Date(openedAt) : null,
            isCheckedIn: isCheckedIn ?? false,
            checkedInAt: checkedInAt ? new Date(checkedInAt) : null,
            pax: pax ?? 1,
            createdAt: createdAt ? new Date(createdAt) : new Date()
          }
        });
        restoredCounts.guests++;
      }
    }

    // D. Rsvps (Clean Pure Insert)
    if (Array.isArray(dumpData.rsvps)) {
      for (const r of dumpData.rsvps) {
        const { id, invitationId, name, attendance, pax, message, likes, createdAt } = r;
        await prisma.rsvp.create({
          data: {
            id,
            invitationId,
            name,
            attendance: attendance || 'HADIR',
            pax: pax ?? 1,
            message: message || null,
            likes: likes ?? 0,
            createdAt: createdAt ? new Date(createdAt) : new Date()
          }
        });
        restoredCounts.rsvps++;
      }
    }

    // E. Orders (Clean Pure Insert)
    if (Array.isArray(dumpData.orders)) {
      for (const o of dumpData.orders) {
        const {
          id,
          userId,
          invitationId,
          invoiceNumber,
          planId,
          planName,
          amount,
          status,
          paymentMethod,
          paymentDataJson,
          licenseKey,
          paidAt,
          createdAt
        } = o;

        await prisma.order.create({
          data: {
            id,
            userId,
            invitationId: invitationId || null,
            invoiceNumber,
            planId,
            planName: planName || null,
            amount: Number(amount) || 0,
            status: status || 'unpaid',
            paymentMethod: paymentMethod || 'QRIS2',
            paymentDataJson: paymentDataJson || null,
            licenseKey: licenseKey || null,
            paidAt: paidAt ? new Date(paidAt) : null,
            createdAt: createdAt ? new Date(createdAt) : new Date()
          }
        });
        restoredCounts.orders++;
      }
    }

    // F. MediaUploads (Clean Pure Insert)
    if (Array.isArray(dumpData.mediaUploads)) {
      for (const m of dumpData.mediaUploads) {
        const { id, userId, invitationId, originalName, fileName, fileUrl, mimeType, sizeBytes, createdAt } = m;
        await prisma.mediaUpload.create({
          data: {
            id,
            userId,
            invitationId: invitationId || null,
            originalName,
            fileName,
            fileUrl,
            mimeType,
            sizeBytes: Number(sizeBytes) || 0,
            createdAt: createdAt ? new Date(createdAt) : new Date()
          }
        });
        restoredCounts.mediaUploads++;
      }
    }

    // G. ThemePresets (Master Catalog Upsert)
    if (Array.isArray(dumpData.themePresets)) {
      for (const t of dumpData.themePresets) {
        const {
          id,
          name,
          subtitle,
          category,
          mode,
          archetype,
          paletteJson,
          typographyJson,
          ornamentsJson,
          tags,
          isPremium,
          isActive,
          sortOrder,
          createdAt,
          updatedAt
        } = t;

        await prisma.themePreset.upsert({
          where: { id },
          update: {
            name,
            subtitle: subtitle || null,
            category,
            mode: mode || 'dark',
            archetype: archetype || 'royal_arch',
            paletteJson,
            typographyJson: typographyJson || null,
            ornamentsJson: ornamentsJson || null,
            tags: tags || null,
            isPremium: isPremium ?? false,
            isActive: isActive ?? true,
            sortOrder: sortOrder ?? 0,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          },
          create: {
            id,
            name,
            subtitle: subtitle || null,
            category,
            mode: mode || 'dark',
            archetype: archetype || 'royal_arch',
            paletteJson,
            typographyJson: typographyJson || null,
            ornamentsJson: ornamentsJson || null,
            tags: tags || null,
            isPremium: isPremium ?? false,
            isActive: isActive ?? true,
            sortOrder: sortOrder ?? 0,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
        restoredCounts.themePresets++;
      }
    }

    // H. StyleKitPresets (Master Catalog Upsert)
    if (Array.isArray(dumpData.styleKitPresets)) {
      for (const s of dumpData.styleKitPresets) {
        const {
          id,
          name,
          category,
          tagline,
          themeId,
          fontPairingId,
          frameShape,
          previewGradient,
          primaryColor,
          description,
          badge,
          tags,
          isActive,
          sortOrder,
          createdAt,
          updatedAt
        } = s;

        await prisma.styleKitPreset.upsert({
          where: { id },
          update: {
            name,
            category,
            tagline,
            themeId,
            fontPairingId,
            frameShape,
            previewGradient,
            primaryColor,
            description,
            badge,
            tags: tags || null,
            isActive: isActive ?? true,
            sortOrder: sortOrder ?? 0,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          },
          create: {
            id,
            name,
            category,
            tagline,
            themeId,
            fontPairingId,
            frameShape,
            previewGradient,
            primaryColor,
            description,
            badge,
            tags: tags || null,
            isActive: isActive ?? true,
            sortOrder: sortOrder ?? 0,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
        restoredCounts.styleKitPresets++;
      }
    }

    // I. EasyTunnels (Clean Pure Insert)
    if (Array.isArray(dumpData.easyTunnels)) {
      for (const et of dumpData.easyTunnels) {
        const { id, appName, licenseKey, slug, localPort, status, customDomain, expiresAt, createdAt, updatedAt } = et;
        await prisma.easyTunnel.create({
          data: {
            id,
            appName,
            licenseKey,
            slug,
            localPort,
            status: status || 'inactive',
            customDomain: customDomain || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
        restoredCounts.easyTunnels++;
      }
    }

    return {
      success: true,
      manifest,
      restoredCounts,
      message: `Pemulihan data berhasil! ${restoredCounts.invitations} undangan, ${restoredCounts.guests} tamu, ${restoredCounts.rsvps} doa/ucapan, dan ${restoredCounts.mediaFiles} berkas media berhasil disinkronkan.`
    };
  }
}
