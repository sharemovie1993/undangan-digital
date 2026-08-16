import { execSync, exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Letakkan folder tunnels di root backend
const TUNNELS_DIR = path.resolve(process.cwd(), 'tunnels');

const WINDOWS_WG_PATH = 'C:\\Program Files\\WireGuard\\wireguard.exe';
const WIREGUARD_INSTALLER_URL = 'https://download.wireguard.com/windows-client/wireguard-installer.exe';

export interface TunnelStatus {
  status: 'connected' | 'disconnected' | 'not_configured' | 'error';
  wg_ip?: string;
  message?: string;
}

export class WireguardManager {
  static getTunnelsDir(): string {
    const candidates = [
      process.env.TUNNELS_DIR,
      path.resolve(process.cwd(), 'tunnels'),
      path.resolve(process.cwd(), 'backend/tunnels'),
      path.resolve(__dirname, '../../tunnels'),
      path.resolve(__dirname, '../tunnels'),
      '/var/www/undangan-digital/backend/tunnels'
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    const defaultDir = path.resolve(process.cwd(), 'tunnels');
    if (!fs.existsSync(defaultDir)) {
      try { fs.mkdirSync(defaultDir, { recursive: true }); } catch {}
    }
    return defaultDir;
  }

  static isWindows(): boolean {
    return os.platform() === 'win32';
  }

  static isAdmin(): boolean {
    try {
      execSync('net session', { stdio: 'pipe', windowsHide: true });
      return true;
    } catch {
      return false;
    }
  }

  static ensureTunnelsDir(): void {
    const dir = this.getTunnelsDir();
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    }
  }

  static isWireGuardInstalled(): boolean {
    if (this.isWindows()) {
      return fs.existsSync(WINDOWS_WG_PATH);
    } else {
      if (fs.existsSync('/usr/bin/wg-quick') || fs.existsSync('/usr/sbin/wg-quick') || fs.existsSync('/usr/local/bin/wg-quick')) {
        return true;
      }
      try {
        execSync('command -v wg-quick || which wg-quick', { stdio: 'pipe', windowsHide: true });
        return true;
      } catch {
        return false;
      }
    }
  }

  /** Auto-install WireGuard jika belum ada (Windows & Linux) */
  static async installWireGuard(): Promise<{ success: boolean; message: string }> {
    if (this.isWireGuardInstalled()) {
      return { success: true, message: 'WireGuard sudah terinstall.' };
    }

    if (!this.isWindows()) {
      return new Promise((resolve) => {
        console.log('[WG] Installing WireGuard on Linux (apt-get)...');
        exec(
          'export DEBIAN_FRONTEND=noninteractive && sudo -n apt-get update -y && sudo -n apt-get install -y wireguard openresolv',
          { timeout: 180000 },
          (err) => {
            if (err) {
              console.error('[WG] Linux auto-install error:', err);
              resolve({
                success: false,
                message: 'Gagal menginstal WireGuard secara otomatis. Jalankan perintah manual: sudo apt-get update && sudo apt-get install -y wireguard. Error: ' + err.message
              });
              return;
            }
            resolve({ success: true, message: 'WireGuard (wg-quick) berhasil diinstal di Linux secara otomatis!' });
          }
        );
      });
    }

    const tmpInstaller = path.join(os.tmpdir(), 'wireguard-installer.exe');
    return new Promise((resolve) => {
      console.log('[WG] Downloading WireGuard installer...');
      exec(
        `powershell -Command "Invoke-WebRequest -Uri '${WIREGUARD_INSTALLER_URL}' -OutFile '${tmpInstaller}'"`,
        { timeout: 120000, windowsHide: true },
        (downloadErr) => {
          if (downloadErr) {
            resolve({ success: false, message: 'Gagal download installer WireGuard: ' + downloadErr.message });
            return;
          }

          console.log('[WG] Running WireGuard installer (silent)...');
          exec(`"${tmpInstaller}" /S`, { timeout: 120000, windowsHide: true }, (installErr) => {
            if (installErr) {
              resolve({ success: false, message: 'Gagal install WireGuard: ' + installErr.message });
              return;
            }
            resolve({ success: true, message: 'WireGuard berhasil diinstall!' });
          });
        }
      );
    });
  }

  /** Dapatkan nama service dari slug */
  static serviceName(slug: string): string {
    return `WireGuardTunnel$et-${slug}`;
  }

  /** Dapatkan path .conf dari slug */
  static confPath(slug: string): string {
    const filename = `et-${slug}.conf`;
    const candidates = [
      process.env.TUNNELS_DIR ? path.join(process.env.TUNNELS_DIR, filename) : null,
      path.join('/var/www/undangan-digital/backend/tunnels', filename),
      path.resolve(__dirname, '../../tunnels', filename),
      path.resolve(__dirname, '../tunnels', filename),
      path.resolve(process.cwd(), 'tunnels', filename),
      path.resolve(process.cwd(), 'backend/tunnels', filename),
      `/etc/wireguard/${filename}`
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }

    this.ensureTunnelsDir();
    return path.join(this.getTunnelsDir(), filename);
  }

  /** Path symlink di /etc/wireguard/ (Linux) */
  static etcConfPath(slug: string): string {
    return `/etc/wireguard/et-${slug}.conf`;
  }

  /** Tulis file konfigurasi WireGuard ke disk dengan PersistentKeepalive = 25 */
  static writeConfig(slug: string, configContent: string): string {
    this.ensureTunnelsDir();
    const confPath = this.confPath(slug);

    let hardenedConfig = configContent;
    if (/\[Peer\]/i.test(hardenedConfig) && !/PersistentKeepalive/i.test(hardenedConfig)) {
      hardenedConfig = hardenedConfig.replace(/(\[Peer\][\s\S]*?)(?=\n\[|\s*$)/gi, '$1\nPersistentKeepalive = 25\n');
    }

    fs.writeFileSync(confPath, hardenedConfig, { encoding: 'utf8', mode: 0o600 });
    if (!this.isWindows()) {
      try {
        fs.chmodSync(confPath, 0o600);
        execSync(`sudo chmod 600 "${confPath}"`, { stdio: 'pipe' });
      } catch {}

      try {
        const etcPath = this.etcConfPath(slug);
        execSync(`sudo ln -sf "${confPath}" "${etcPath}"`, { stdio: 'pipe' });
        console.log(`[WG] Symlink created: ${etcPath} -> ${confPath}`);
      } catch (e: any) {
        console.warn(`[WG] Gagal membuat symlink /etc/wireguard/: ${e.message}`);
      }
    }
    console.log(`[WG] Config written: ${confPath}`);
    return confPath;
  }

  /** Hapus file konfigurasi */
  static deleteConfig(slug: string): void {
    const confPath = this.confPath(slug);
    if (fs.existsSync(confPath)) {
      fs.unlinkSync(confPath);
      console.log(`[WG] Config deleted: ${confPath}`);
    }
    if (!this.isWindows()) {
      try {
        const etcPath = this.etcConfPath(slug);
        execSync(`sudo rm -f "${etcPath}"`, { stdio: 'pipe' });
      } catch {}
    }
  }

  /** Cek status tunnel spesifik */
  static getStatus(slug: string): TunnelStatus {
    const confPath = this.confPath(slug);

    if (!fs.existsSync(confPath)) {
      return { status: 'not_configured', message: 'File konfigurasi belum ada.' };
    }

    try {
      if (this.isWindows()) {
        const svcName = this.serviceName(slug);
        try {
          const out = execSync(`sc query "${svcName}"`, { stdio: 'pipe', windowsHide: true }).toString();
          const wgIp = this.readIpFromConf(confPath);
          if (out.includes('RUNNING')) return { status: 'connected', wg_ip: wgIp };
          return { status: 'disconnected', wg_ip: wgIp };
        } catch {
          return { status: 'disconnected', wg_ip: this.readIpFromConf(confPath) };
        }
      } else {
        const ifName = `et-${slug}`;
        try {
          execSync(`ip link show ${ifName}`, { stdio: 'pipe', windowsHide: true });

          try {
            const wgOut = execSync(`sudo wg show ${ifName} latest-handshakes`, { stdio: 'pipe' }).toString();
            const match = wgOut.match(/\s+(\d+)\s*$/);
            if (match) {
              const lastHandshakeSec = parseInt(match[1], 10);
              const nowSec = Math.floor(Date.now() / 1000);
              if (lastHandshakeSec > 0 && (nowSec - lastHandshakeSec) > 180) {
                return { status: 'disconnected', wg_ip: this.readIpFromConf(confPath), message: 'Koneksi terputus (Handshake Stale)' };
              }
            }
          } catch {}

          return { status: 'connected', wg_ip: this.readIpFromConf(confPath) };
        } catch {
          return { status: 'disconnected', wg_ip: this.readIpFromConf(confPath) };
        }
      }
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }

  /** Baca IP client dari file .conf */
  static readIpFromConf(confPath: string): string {
    try {
      const content = fs.readFileSync(confPath, 'utf8');
      const match = content.match(/Address\s*=\s*([0-9.]+)/i);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  }

  /** Aktifkan tunnel */
  static async startTunnel(slug: string): Promise<{ success: boolean; message: string }> {
    const confPath = this.confPath(slug);

    if (!fs.existsSync(confPath)) {
      throw new Error('File konfigurasi VPN tidak ditemukan. Silakan setup tunnel terlebih dahulu.');
    }

    if (!this.isWireGuardInstalled()) {
      throw new Error('WireGuard belum terinstall. Gunakan tombol "Install WireGuard" terlebih dahulu.');
    }

    if (this.isWindows()) {
      const svcName = this.serviceName(slug);

      if (!this.isAdmin()) {
        const psCode = `
          Start-Process "${WINDOWS_WG_PATH}" -ArgumentList '/uninstalltunnelservice','et-${slug}' -Wait
          Start-Sleep -Seconds 1
          Start-Process "${WINDOWS_WG_PATH}" -ArgumentList '/installtunnelservice','${confPath}' -Wait
          $svc = Get-Service -Name '${svcName}' -ErrorAction SilentlyContinue
          if ($svc -and $svc.Status -ne 'Running') {
              Start-Service -Name '${svcName}'
          }
        `.trim();
        const codeBuffer = Buffer.from(psCode, 'utf16le');
        const codeBase64 = codeBuffer.toString('base64');
        const outerCode = `Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -EncodedCommand ${codeBase64}" -Verb RunAs -Wait`;
        const outerBuffer = Buffer.from(outerCode, 'utf16le');
        const outerBase64 = outerBuffer.toString('base64');
        return new Promise((resolve, reject) => {
          exec(`powershell -NoProfile -EncodedCommand ${outerBase64}`, { windowsHide: true }, (err) => {
            if (err) {
              reject(new Error('Gagal mengaktifkan Tunnel VPN: UAC ditolak atau dibatalkan.'));
            } else {
              resolve({ success: true, message: 'Tunnel VPN berhasil diaktifkan.' });
            }
          });
        });
      }

      try { execSync(`"${WINDOWS_WG_PATH}" /uninstalltunnelservice "et-${slug}"`, { stdio: 'pipe', windowsHide: true }); } catch {}
      execSync(`"${WINDOWS_WG_PATH}" /installtunnelservice "${confPath}"`, { stdio: 'pipe', windowsHide: true });
      
      let started = false;
      let lastErr: any = null;
      for (let i = 0; i < 5; i++) {
        try {
          try {
            const queryOut = execSync(`sc query "${svcName}"`, { stdio: 'pipe', windowsHide: true }).toString();
            if (queryOut.includes('RUNNING')) {
              started = true;
              break;
            }
          } catch {}

          execSync('powershell -Command "Start-Sleep -Milliseconds 500"', { stdio: 'pipe', windowsHide: true });
          execSync(`net start "${svcName}"`, { stdio: 'pipe', windowsHide: true });
          started = true;
          break;
        } catch (err: any) {
          const errMsg = err.message || '';
          const errStderr = err.stderr ? err.stderr.toString() : '';
          if (
            errMsg.includes('2182') || 
            errStderr.includes('2182') || 
            errMsg.includes('already been started') || 
            errStderr.includes('already been started')
          ) {
            started = true;
            break;
          }
          lastErr = err;
        }
      }
      if (!started) {
        const errMsg = lastErr && lastErr.stderr ? lastErr.stderr.toString().trim() : (lastErr ? lastErr.message : 'Unknown error');
        throw new Error('Gagal menjalankan layanan WireGuard: ' + errMsg);
      }

      return { success: true, message: 'Tunnel VPN berhasil diaktifkan.' };
    } else {
      const ifName = `et-${slug}`;

      try {
        execSync(`sudo ln -sf "${confPath}" "${this.etcConfPath(slug)}"`, { stdio: 'pipe' });
      } catch {}

      try {
        fs.chmodSync(confPath, 0o600);
        execSync(`sudo chmod 600 "${confPath}"`, { stdio: 'pipe' });
      } catch {}

      try { execSync(`sudo wg-quick down ${ifName}`, { stdio: 'pipe' }); } catch {}
      try { execSync(`sudo ip link delete ${ifName}`, { stdio: 'pipe' }); } catch {}

      try {
        execSync(`sudo wg-quick up ${ifName}`, { stdio: 'pipe' });
      } catch (err: any) {
        const errMsg = err.stderr ? err.stderr.toString() : err.message;
        if (errMsg.includes('already exists')) {
          try { execSync(`sudo ip link delete ${ifName}`, { stdio: 'pipe' }); } catch {}
          execSync(`sudo wg-quick up ${ifName}`, { stdio: 'pipe' });
        } else {
          throw new Error(`Gagal mengaktifkan WireGuard: ${errMsg}`);
        }
      }

      try {
        execSync(`sudo systemctl enable wg-quick@${ifName}`, { stdio: 'pipe' });
      } catch {}

      return { success: true, message: 'Tunnel VPN berhasil diaktifkan.' };
    }
  }

  /** Nonaktifkan tunnel */
  static async stopTunnel(slug: string): Promise<{ success: boolean; message: string }> {
    const ifName = `et-${slug}`;
    if (this.isWindows()) {
      const tunnelName = ifName;

      if (!this.isAdmin()) {
        const psCode = `Start-Process "${WINDOWS_WG_PATH}" -ArgumentList '/uninstalltunnelservice','${tunnelName}' -Wait`;
        const codeBuffer = Buffer.from(psCode, 'utf16le');
        const codeBase64 = codeBuffer.toString('base64');
        const outerCode = `Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -EncodedCommand ${codeBase64}" -Verb RunAs -Wait`;
        const outerBuffer = Buffer.from(outerCode, 'utf16le');
        const outerBase64 = outerBuffer.toString('base64');
        return new Promise((resolve) => {
          exec(`powershell -NoProfile -EncodedCommand ${outerBase64}`, { windowsHide: true }, () => {
            resolve({ success: true, message: 'Tunnel VPN berhasil dinonaktifkan.' });
          });
        });
      }

      try { execSync(`"${WINDOWS_WG_PATH}" /uninstalltunnelservice "${tunnelName}"`, { stdio: 'pipe', windowsHide: true }); } catch {}
      return { success: true, message: 'Tunnel VPN berhasil dinonaktifkan.' };
    } else {
      try { execSync(`sudo wg-quick down ${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      try { execSync(`sudo ip link delete ${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      try { execSync(`sudo systemctl disable wg-quick@${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      return { success: true, message: 'Tunnel VPN berhasil dinonaktifkan.' };
    }
  }

  /** Hapus tunnel secara permanen */
  static async removeTunnel(slug: string): Promise<{ success: boolean; message: string }> {
    const ifName = `et-${slug}`;
    if (this.isWindows()) {
      const tunnelName = ifName;

      if (!this.isAdmin()) {
        const psCode = `
          Start-Process "${WINDOWS_WG_PATH}" -ArgumentList '/uninstalltunnelservice','${tunnelName}' -Wait
        `.trim();
        const codeBuffer = Buffer.from(psCode, 'utf16le');
        const codeBase64 = codeBuffer.toString('base64');
        const outerCode = `Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -EncodedCommand ${codeBase64}" -Verb RunAs -Wait`;
        const outerBuffer = Buffer.from(outerCode, 'utf16le');
        const outerBase64 = outerBuffer.toString('base64');
        return new Promise((resolve) => {
          exec(`powershell -NoProfile -EncodedCommand ${outerBase64}`, { windowsHide: true }, () => {
            this.deleteConfig(slug);
            resolve({ success: true, message: 'Tunnel berhasil dihapus.' });
          });
        });
      }

      try { execSync(`"${WINDOWS_WG_PATH}" /uninstalltunnelservice "${tunnelName}"`, { stdio: 'pipe', windowsHide: true }); } catch {}
      this.deleteConfig(slug);
      return { success: true, message: 'Tunnel berhasil dihapus.' };
    } else {
      try { execSync(`sudo wg-quick down ${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      try { execSync(`sudo ip link delete ${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      try { execSync(`sudo systemctl disable wg-quick@${ifName}`, { stdio: 'pipe', windowsHide: true }); } catch {}
      this.deleteConfig(slug);
      return { success: true, message: 'Tunnel berhasil dihapus.' };
    }
  }

  /** Diagnosa tunnel WireGuard */
  static async diagnoseTunnel(slug: string): Promise<any> {
    const ifName = `et-${slug}`;
    const status = this.getStatus(slug);
    const result: any = {
      slug,
      interface: ifName,
      status: status.status,
      wg_ip: status.wg_ip,
      is_windows: this.isWindows(),
      wireguard_installed: this.isWireGuardInstalled(),
      timestamp: new Date().toISOString()
    };

    if (this.isWindows()) {
      try {
        const out = execSync(`sc query "${this.serviceName(slug)}"`, { stdio: 'pipe', windowsHide: true }).toString();
        result.service_status = out.includes('RUNNING') ? 'RUNNING' : 'STOPPED';
      } catch (e: any) {
        result.service_status = 'NOT_FOUND';
      }
    } else {
      try {
        const wgShow = execSync(`sudo wg show ${ifName}`, { stdio: 'pipe' }).toString();
        result.wg_show = wgShow;
      } catch (e: any) {
        result.wg_show = 'INTERFACE_DOWN';
      }
    }

    return result;
  }
}
