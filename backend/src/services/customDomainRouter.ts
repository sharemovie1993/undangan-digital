/**
 * 🌐 Custom Domain & Deployment Router Service - Undangan Digital
 * Mengadopsi Arsitektur Standar Multi-Scenario Project Absenta
 *
 * Mendukung 3 Skenario Deployment:
 *
 * 1. SKENARIO HYBRID / CGNAT TUNNEL (e.g., DEPLOY_SCENARIO="hybrid" atau DEPLOYMENT_MODE="tunnel")
 *    - Server aplikasi berada di lokal (sekolah/studio/home server) di balik CGNAT.
 *    - Terkoneksi ke Public Gateway (api.absenta.id) via WireGuard Tunnel.
 *    - Caddy di Public Gateway mengurus SSL resmi publik & meneruskan request ke WireGuard IP.
 *    - Caddy lokal menyajikan port :80 (tanpa HTTPS redirect loop).
 *    - Custom domain otomatis disinkronkan ke Central License Server Gateway.
 *
 * 2. SKENARIO SAAS / DIRECT VPS (e.g., DEPLOY_SCENARIO="saas" atau DEPLOYMENT_MODE="direct")
 *    - Server aplikasi dideploy langsung di Cloud VPS dengan IP Publik Statis.
 *    - Caddy lokal mengurus SSL publik resmi (Let's Encrypt / Cloudflare DNS Challenge).
 *    - Custom domain langsung di-inject ke Caddyfile lokal dan memicu `caddy reload`.
 *
 * 3. SKENARIO ON-PREMISE LOCAL ONLY (e.g., DEPLOY_SCENARIO="local")
 *    - Berjalan murni di jaringan LAN lokal / offline intranet.
 */

import { prisma } from '../db';
import { setLicenseCustomDomain } from './licenseClient';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

const isLinux = process.platform === 'linux';
const DEFAULT_CADDYFILE = isLinux ? '/etc/caddy/Caddyfile' : path.join(process.cwd(), 'Caddyfile');

// Ambil konfigurasi skenario dari Environment Variables (kompatibel penuh dengan Absenta)
const DEPLOY_SCENARIO = (process.env.DEPLOY_SCENARIO || '').toLowerCase(); // 'saas' | 'hybrid' | 'local'
const DEPLOYMENT_MODE = (process.env.DEPLOYMENT_MODE || '').toLowerCase(); // 'auto' | 'tunnel' | 'direct'
const LOCAL_CADDYFILE = process.env.LOCAL_CADDYFILE || DEFAULT_CADDYFILE;
const LOCAL_APP_PORT = parseInt(process.env.PORT || '4001');
const FRONTEND_DIST_PATH = process.env.FRONTEND_DIST_PATH || (isLinux ? '/var/www/undangan-digital/frontend/dist' : path.join(process.cwd(), '../frontend/dist'));

export type DeploymentType = 'hybrid' | 'saas' | 'local';

/**
 * Deteksi skenario deployment secara cerdas dan adaptif
 */
export async function detectDeploymentScenario(): Promise<DeploymentType> {
  // 1. Explicit variable override
  if (DEPLOY_SCENARIO === 'saas' || DEPLOYMENT_MODE === 'direct') return 'saas';
  if (DEPLOY_SCENARIO === 'hybrid' || DEPLOYMENT_MODE === 'tunnel') return 'hybrid';
  if (DEPLOY_SCENARIO === 'local') return 'local';

  // 2. Auto-detection berbasis status WireGuard Easy Tunnel
  try {
    const tunnel = await prisma.easyTunnel.findFirst({ where: { status: 'active' } });
    if (tunnel && tunnel.licenseKey) {
      console.log('[DeploymentRouter] Auto-detected HYBRID mode (Active WireGuard Easy Tunnel detected)');
      return 'hybrid';
    }
  } catch (err: any) {
    console.warn('[DeploymentRouter] DB check for tunnel failed, fallback to saas/direct:', err.message);
  }

  // 3. Default fallback: jika tidak ada tunnel aktif, anggap Direct SaaS VPS
  console.log('[DeploymentRouter] Auto-detected SAAS / DIRECT VPS mode (No active tunnel)');
  return 'saas';
}

/**
 * Mengambil ringkasan informasi deployment untuk konsumsi Frontend UI
 */
export async function getDeploymentInfo() {
  const scenario = await detectDeploymentScenario();
  const activeTunnel = await prisma.easyTunnel.findFirst({ where: { status: 'active' } })
    || await prisma.easyTunnel.findFirst();

  const baseDomain = process.env.EASY_TUNNEL_BASE_DOMAIN || 'absenta.id';
  const serverDomain = activeTunnel
    ? `${activeTunnel.slug}.${baseDomain}`
    : (process.env.PUBLIC_DOMAIN_BASE || 'luxury.absenta.id');

  return {
    scenario,
    isTunnelSupported: scenario === 'hybrid',
    isDirectVps: scenario === 'saas',
    isLocalOnly: scenario === 'local',
    tunnelSlug: activeTunnel?.slug || null,
    gatewayDomain: baseDomain,
    serverDomain,
    targetCname: activeTunnel ? `${activeTunnel.slug}.${baseDomain}` : serverDomain,
    caddyStatus: 'active'
  };
}

/**
 * SKENARIO HYBRID: Sinkronisasi custom domain ke Public Cloud Gateway (api.absenta.id)
 */
async function syncToCloudGateway(licenseKey: string, customDomain: string | null): Promise<void> {
  await setLicenseCustomDomain(licenseKey, customDomain || '');
  console.log(`[DeploymentRouter - Hybrid] Synced custom domain "${customDomain}" to Central Gateway with license ${licenseKey}`);
}

/**
 * SKENARIO SAAS (Direct VPS): Modifikasi Caddyfile lokal & reload service Caddy
 */
async function updateLocalCaddyVhost(customDomain: string | null, previousDomain: string | null): Promise<void> {
  if (!fs.existsSync(LOCAL_CADDYFILE)) {
    console.warn(`[DeploymentRouter - SaaS] Caddyfile not found at ${LOCAL_CADDYFILE}. Skipping local vhost update.`);
    return;
  }

  let content = fs.readFileSync(LOCAL_CADDYFILE, 'utf8');

  // Hapus vhost domain lama jika ada
  if (previousDomain) {
    const escapedOld = previousDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const oldBlockRegex = new RegExp(
      `\\n?# === CUSTOM DOMAIN: ${escapedOld} ===[\\s\\S]*?# === END CUSTOM DOMAIN: ${escapedOld} ===\\n?`,
      'g'
    );
    content = content.replace(oldBlockRegex, '');
  }

  // Tambahkan vhost baru jika domain valid
  if (customDomain) {
    const cleanDom = customDomain.trim().toLowerCase();
    
    // Pastikan tidak menduplikasi jika vhost sudah tercantum
    if (!content.includes(`# === CUSTOM DOMAIN: ${cleanDom} ===`)) {
      const vhostBlock = `
# === CUSTOM DOMAIN: ${cleanDom} ===
http://${cleanDom}, https://${cleanDom} {
    # Backend API endpoints proxy
    handle /api/* {
        reverse_proxy localhost:${LOCAL_APP_PORT}
    }
    handle /uploads/* {
        reverse_proxy localhost:${LOCAL_APP_PORT}
    }
    handle /undangan-storage/* {
        reverse_proxy localhost:9000
    }
    handle /absenta-storage/* {
        reverse_proxy localhost:9000
    }
    handle /health* {
        reverse_proxy localhost:${LOCAL_APP_PORT}
    }

    # SPA frontend static files and fallback
    handle {
        root * ${FRONTEND_DIST_PATH}
        try_files {path} /index.html
        file_server
    }

    encode gzip zstd
}
# === END CUSTOM DOMAIN: ${cleanDom} ===
`;
      content += vhostBlock;
    }
  }

  fs.writeFileSync(LOCAL_CADDYFILE, content, 'utf8');
  console.log(`[DeploymentRouter - SaaS] Local Caddyfile updated for domain "${customDomain}"`);

  // Reload Caddy service (Windows vs Linux)
  const reloadCmd = isLinux ? 'caddy reload --config /etc/caddy/Caddyfile' : 'caddy reload';
  exec(reloadCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('[DeploymentRouter - SaaS] Caddy reload warning/error:', stderr || err.message);
    } else {
      console.log('[DeploymentRouter - SaaS] Caddy reloaded successfully.');
    }
  });
}

/**
 * Entry point utama: Dipanggil oleh controller ketika domain kustom dibuat, diperbarui, atau dihapus.
 *
 * @param customDomain - Domain kustom baru (string) atau null jika dihapus
 * @param previousDomain - Domain kustom sebelumnya (untuk keperluan pembersihan di Caddyfile)
 */
export async function syncCustomDomain(
  customDomain: string | null,
  previousDomain?: string | null
): Promise<void> {
  const scenario = await detectDeploymentScenario();

  if (scenario === 'hybrid') {
    // Mode Hybrid / CGNAT: Daftarkan ke Gateway License Server
    const tunnel = await prisma.easyTunnel.findFirst({ where: { status: 'active' } })
      || await prisma.easyTunnel.findFirst();

    if (!tunnel || !tunnel.licenseKey) {
      console.warn('[DeploymentRouter] Hybrid mode active, but no license key found in easy_tunnels table.');
      return;
    }

    await syncToCloudGateway(tunnel.licenseKey, customDomain);
  } else if (scenario === 'saas') {
    // Mode SaaS Direct VPS: Modifikasi Caddyfile lokal langsung
    await updateLocalCaddyVhost(customDomain, previousDomain || null);
  } else {
    // Mode Local On-Premises: Tidak perlu modifikasi gateway publik
    console.log(`[DeploymentRouter - Local] Custom domain "${customDomain}" registered in database (LAN/Local mode).`);
  }
}
