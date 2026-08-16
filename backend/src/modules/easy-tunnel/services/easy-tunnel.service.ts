import { prisma } from '../../../db';
import { WireguardManager } from '../../../services/wireguardManager';
import {
  validateLicenseKey,
  requestTunnelConfig,
  releaseLicense,
  updateLicensePort,
  setLicenseCustomDomain,
  removeLicenseCustomDomain
} from '../../../services/licenseClient';
import os from 'os';
import fs from 'fs';
import dns from 'dns/promises';

const PLATFORM_DOMAIN = process.env.EASY_TUNNEL_BASE_DOMAIN || 'absenta.id';
const VALID_CNAME_TARGETS = [
  `app.${PLATFORM_DOMAIN}`,
  PLATFORM_DOMAIN,
  `www.${PLATFORM_DOMAIN}`
];

async function verifyCname(customDomain: string): Promise<boolean> {
  try {
    const addresses = await dns.resolveCname(customDomain);
    const resolved = addresses.map((a: string) => a.toLowerCase().replace(/\.$/, ''));
    return resolved.some((addr: string) =>
      VALID_CNAME_TARGETS.some(target => addr === target || addr.endsWith(`.${PLATFORM_DOMAIN}`))
    );
  } catch {
    try {
      const aRecords = await dns.resolve4(customDomain);
      const platformIps = await dns.resolve4(`app.${PLATFORM_DOMAIN}`).catch(() => [] as string[]);
      return aRecords.some((ip: string) => platformIps.includes(ip));
    } catch {
      return false;
    }
  }
}

export class EasyTunnelService {
  /**
   * Sinkronisasi status/port terowongan dari server lisensi secara berkala
   */
  static async syncTunnelPort(tunnel: any): Promise<any> {
    if (!tunnel.licenseKey || tunnel.status !== 'active') return tunnel;

    try {
      const remoteInfo = await validateLicenseKey(tunnel.licenseKey);

      if (remoteInfo.expires_at && remoteInfo.expires_at !== tunnel.expiresAt?.toISOString()) {
        await prisma.easyTunnel.update({
          where: { id: tunnel.id },
          data: { expiresAt: new Date(remoteInfo.expires_at) }
        });
      }

      if (remoteInfo.expired) {
        console.warn(`[EasyTunnel-Sync] Tunnel "${tunnel.appName}" (${tunnel.slug}) terdeteksi kedaluwarsa.`);
        try { await WireguardManager.stopTunnel(tunnel.slug); } catch {}
        return await prisma.easyTunnel.update({
          where: { id: tunnel.id },
          data: { status: 'expired' }
        });
      }

      const remotePort = remoteInfo.local_port;
      if (remotePort && remotePort !== tunnel.localPort) {
        return await prisma.easyTunnel.update({
          where: { id: tunnel.id },
          data: { localPort: remotePort }
        });
      }
    } catch (e: any) {
      const msg = (e.message || '').toLowerCase();
      const isExpired =
        msg.includes('kedaluwarsa') || msg.includes('expired') ||
        msg.includes('tidak ditemukan') || msg.includes('not found') ||
        msg.includes('tidak valid') || msg.includes('invalid');

      if (isExpired) {
        try { await WireguardManager.stopTunnel(tunnel.slug); } catch {}
        return await prisma.easyTunnel.update({
          where: { id: tunnel.id },
          data: { status: 'expired' }
        });
      }
    }

    return tunnel;
  }

  static async getAllTunnels(): Promise<any[]> {
    const tunnels = await prisma.easyTunnel.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const enriched = [];
    for (const t of tunnels) {
      const synced = await this.syncTunnelPort(t);
      const wgStatus = synced.slug
        ? WireguardManager.getStatus(synced.slug)
        : { status: 'not_configured' as const };
      enriched.push({
        ...synced,
        wg_status: wgStatus,
        public_url: `https://${synced.slug}.${PLATFORM_DOMAIN}`
      });
    }

    return enriched;
  }

  static async getTunnelById(id: string): Promise<any> {
    const t = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!t) throw new Error('Tunnel tidak ditemukan.');

    const synced = await this.syncTunnelPort(t);
    const wgStatus = synced.slug
      ? WireguardManager.getStatus(synced.slug)
      : { status: 'not_configured' as const };

    return {
      ...synced,
      wg_status: wgStatus,
      public_url: `https://${synced.slug}.${PLATFORM_DOMAIN}`
    };
  }

  static async setupTunnel(params: {
    license_key: string;
    subdomain_slug: string;
    local_port: number;
    app_name: string;
  }): Promise<any> {
    const { license_key, subdomain_slug, local_port, app_name } = params;

    const existing = await prisma.easyTunnel.findFirst({
      where: { licenseKey: license_key.trim() }
    });

    try {
      await releaseLicense(license_key.trim());
    } catch {}

    const tunnelData = await requestTunnelConfig({
      license_key: license_key.trim(),
      subdomain_slug: subdomain_slug.trim().toLowerCase(),
      local_port,
      app_name: app_name.trim(),
      hostname: os.hostname()
    });

    const slug = tunnelData.subdomain.split('.')[0];
    WireguardManager.writeConfig(slug, tunnelData.config);

    let expiresAt: Date | null = null;
    try {
      const licInfo = await validateLicenseKey(license_key.trim());
      if (licInfo.expires_at) expiresAt = new Date(licInfo.expires_at);
    } catch {}

    if (existing) {
      return await prisma.easyTunnel.update({
        where: { id: existing.id },
        data: {
          appName: app_name.trim(),
          slug,
          localPort: local_port,
          status: 'inactive',
          expiresAt: expiresAt
        }
      });
    }

    return await prisma.easyTunnel.create({
      data: {
        appName: app_name.trim(),
        licenseKey: license_key.trim(),
        slug,
        localPort: local_port,
        status: 'inactive',
        expiresAt: expiresAt
      }
    });
  }

  static async startTunnel(id: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    // Auto-heal missing config file
    if (!fs.existsSync(WireguardManager.confPath(tunnel.slug))) {
      console.log(`[EasyTunnel] File konfigurasi hilang untuk ${tunnel.slug}, mengunduh ulang dari server lisensi...`);
      try {
        const tunnelData = await requestTunnelConfig({
          license_key: tunnel.licenseKey,
          subdomain_slug: tunnel.slug,
          local_port: tunnel.localPort,
          app_name: tunnel.appName,
          hostname: os.hostname()
        });
        WireguardManager.writeConfig(tunnel.slug, tunnelData.config);
      } catch (err: any) {
        console.warn(`[EasyTunnel] Auto-fetch config gagal: ${err.message}`);
      }
    }

    let remoteInfo: any;
    try {
      remoteInfo = await validateLicenseKey(tunnel.licenseKey);
    } catch (e: any) {
      const msg = (e.message || '').toLowerCase();
      const isExpired =
        msg.includes('kedaluwarsa') || msg.includes('expired') ||
        msg.includes('tidak ditemukan') || msg.includes('not found') ||
        msg.includes('tidak valid') || msg.includes('invalid');

      if (isExpired) {
        await prisma.easyTunnel.update({
          where: { id },
          data: { status: 'expired' }
        });
        throw new Error('Lisensi terowongan ini telah kedaluwarsa. Silakan perpanjang lisensi Anda.');
      }

      throw new Error(
        `Tidak dapat memverifikasi lisensi: server lisensi tidak dapat dijangkau (${e.message})`
      );
    }

    if (remoteInfo.expired) {
      await prisma.easyTunnel.update({
        where: { id },
        data: { status: 'expired' }
      });
      throw new Error('Lisensi terowongan ini telah kedaluwarsa. Silakan perpanjang lisensi Anda.');
    }

    if (!WireguardManager.isWireGuardInstalled()) {
      throw new Error('WireGuard belum terpasang di sistem ini.');
    }

    const res = await WireguardManager.startTunnel(tunnel.slug);
    await prisma.easyTunnel.update({
      where: { id },
      data: { status: 'active' }
    });

    return res;
  }

  static async stopTunnel(id: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    const res = await WireguardManager.stopTunnel(tunnel.slug);
    await prisma.easyTunnel.update({
      where: { id },
      data: { status: 'inactive' }
    });

    return res;
  }

  static async removeTunnel(id: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    try {
      await releaseLicense(tunnel.licenseKey);
    } catch (releaseErr: any) {
      const msg = (releaseErr.message || '').toLowerCase();
      if (!msg.includes('tidak ditemukan') && !msg.includes('sudah dilepas')) {
        throw new Error(`Koneksi ke server pusat gagal (${releaseErr.message}).`);
      }
    }

    await WireguardManager.removeTunnel(tunnel.slug);
    return await prisma.easyTunnel.delete({ where: { id } });
  }

  static async editTunnel(id: string, localPort: number, appName: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    await updateLicensePort(tunnel.licenseKey, localPort, appName);

    return await prisma.easyTunnel.update({
      where: { id },
      data: {
        localPort: localPort,
        appName: appName.trim()
      }
    });
  }

  static async setCustomDomain(id: string, customDomain: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain || !cleanDomain.includes('.')) {
      throw new Error('Format domain tidak valid (contoh: undangan.domainanda.com).');
    }

    const cnameOk = await verifyCname(cleanDomain);
    if (!cnameOk) {
      console.warn(`[CustomDomain] CNAME check belum mengarah untuk ${cleanDomain}.`);
    }

    await setLicenseCustomDomain(tunnel.licenseKey, cleanDomain);

    return await prisma.easyTunnel.update({
      where: { id },
      data: { customDomain: cleanDomain }
    });
  }

  static async removeCustomDomain(id: string): Promise<any> {
    const tunnel = await prisma.easyTunnel.findUnique({ where: { id } });
    if (!tunnel) throw new Error('Tunnel tidak ditemukan.');

    await removeLicenseCustomDomain(tunnel.licenseKey);

    return await prisma.easyTunnel.update({
      where: { id },
      data: { customDomain: null }
    });
  }

  static async autoStartActiveTunnels(): Promise<void> {
    try {
      const activeTunnels = await prisma.easyTunnel.findMany({
        where: { status: 'active' }
      });

      for (const t of activeTunnels) {
        const wgStatus = WireguardManager.getStatus(t.slug);
        if (wgStatus.status !== 'connected') {
          console.log(`[EasyTunnel-AutoStart] Mengaktifkan kembali tunnel "${t.appName}" (${t.slug})...`);
          try {
            await WireguardManager.startTunnel(t.slug);
          } catch (e: any) {
            console.warn(`[EasyTunnel-AutoStart] Gagal mengaktifkan ${t.slug}:`, e.message);
          }
        }
      }
    } catch (e: any) {
      console.warn('[EasyTunnel-AutoStart] Error:', e.message);
    }
  }
}
