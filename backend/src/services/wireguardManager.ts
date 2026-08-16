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
    if (/AllowedIPs\s*=\s*10\.0\.0\.1\/32/i.test(hardenedConfig) && !/10\.0\.2\.1/i.test(hardenedConfig)) {
      hardenedConfig = hardenedConfig.replace(/AllowedIPs\s*=\s*10\.0\.0\.1\/32/gi, 'AllowedIPs = 10.0.0.1/32, 10.0.2.1/32');
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

  /** Diagnosa Koneksi Tunnel Terperinci dengan Penentuan Lokasi Masalah */
  static async diagnoseTunnel(slug: string): Promise<{ success: boolean; message: string; details: string[]; data: any }> {
    const details: string[] = [];
    const status = this.getStatus(slug);
    const confPath = this.confPath(slug);
    const ifName = `et-${slug}`;

    details.push(`1️⃣ STATUS TINGKAT KERNEL: ${status.status.toUpperCase()}`);
    if (status.wg_ip) {
      details.push(`   └─ IP Interface VPN Lokal: ${status.wg_ip}`);
    }

    if (!fs.existsSync(confPath)) {
      details.push('❌ [LOKASI MASALAH: LOKAL] Berkas konfigurasi WireGuard (.conf) tidak ditemukan!');
      return { 
        success: false, 
        message: 'File konfigurasi tunnel tidak ada di disk.',
        details,
        data: { status: 'not_configured', details }
      };
    }

    if (status.status !== 'connected') {
      details.push('⚠️ [LOKASI MASALAH: LOKAL] Interface WireGuard belum aktif di OS.');
      details.push('   └─ Solusi: Klik "Aktifkan Tunnel" di menu daftar terowongan.');
      return { 
        success: false, 
        message: 'Tunnel sedang tidak terhubung. Silakan aktifkan tunnel terlebih dahulu.',
        details,
        data: { status: 'disconnected', details }
      };
    }

    // 2. Handshake WireGuard dengan Server Lisensi (10.0.0.1)
    let latestHandshake = '';
    let transferStats = '';
    try {
      details.push('2️⃣ PEMERIKSAAN HANDSHAKE WIREGUARD (Koneksi ke Gateway Cloud):');
      const wgExe = this.isWindows() ? 'C:\\Program Files\\WireGuard\\wg.exe' : 'sudo wg';
      const wgCmd = this.isWindows() ? `"${wgExe}" show` : `${wgExe} show ${ifName}`;
      const wgOut = execSync(wgCmd, { stdio: 'pipe', windowsHide: true }).toString();
      
      const hsMatch = wgOut.match(/latest handshake:\s*(.+)/i);
      const txMatch = wgOut.match(/transfer:\s*(.+)/i);

      if (hsMatch) {
        latestHandshake = hsMatch[1].trim();
        details.push(`   ├─ Handshake Terakhir: ${latestHandshake}`);
      }
      if (txMatch) {
        transferStats = txMatch[1].trim();
        details.push(`   └─ Data Terkirim/Diterima: ${transferStats}`);
      }

      if (!hsMatch) {
        details.push('❌ [LOKASI MASALAH: KONEKSI/FIREWALL] Belum ada handshake sama sekali.');
        details.push('   └─ Penyebab: Port UDP 51820 terblokir oleh ISP/Firewall, atau IP Server Lisensi tidak dapat dijangkau.');
      } else {
        details.push('✅ Handshake WireGuard aktif & berhasil terverifikasi.');
      }
    } catch (e: any) {
      details.push(`⚠️ Gagal membaca status handshake WireGuard: ${e.message}`);
    }

    // 3. Ping Test ke Internet Publik & Gateway VPN
    try {
      details.push('3️⃣ PEMERIKSAAN KONEKTIVITAS JARINGAN:');
      
      const pingNetCmd = this.isWindows() ? 'ping -n 2 -w 2000 8.8.8.8' : 'ping -c 2 -W 2 8.8.8.8';
      let internetOk = false;
      try {
        const outNet = execSync(pingNetCmd, { stdio: 'pipe', windowsHide: true }).toString();
        if (outNet.includes('TTL=') || outNet.includes('ttl=')) internetOk = true;
      } catch {}

      if (internetOk) {
        details.push('   ├─ Internet Server Lokal: ✅ KONEK (Ping 8.8.8.8 OK)');
      } else {
        details.push('   ├─ Internet Server Lokal: ❌ TERPUTUS (Ping 8.8.8.8 RTO)');
        details.push('   │  └─ [LOKASI MASALAH: JARINGAN] Server lokal tidak memiliki akses internet!');
      }

      const pingVpnCmd = this.isWindows() ? 'ping -n 2 -w 2000 10.0.0.1' : 'ping -c 2 -W 2 10.0.0.1';
      let vpnGatewayOk = false;
      try {
        const outVpn = execSync(pingVpnCmd, { stdio: 'pipe', windowsHide: true }).toString();
        if (outVpn.includes('TTL=') || outVpn.includes('ttl=')) vpnGatewayOk = true;
      } catch {}

      if (vpnGatewayOk) {
        details.push('   └─ Tunnel VPN Gateway (10.0.0.1): ✅ KONEK (Ping 10.0.0.1 OK)');
      } else {
        details.push('   └─ Tunnel VPN Gateway (10.0.0.1): ❌ RTO (Tidak ada balasan dari 10.0.0.1)');
        details.push('      └─ [LOKASI MASALAH: VPS LISENSI / ROUTING] WireGuard up tetapi paket VPN tidak sampai ke 10.0.0.1.');
      }
    } catch (err: any) {
      details.push('❌ Error saat pengujian ping: ' + err.message);
    }

    // 4. Pemeriksaan Layanan Web Server Lokal (Caddy Port 443 / Backend 4001)
    try {
      details.push('4️⃣ PEMERIKSAAN LAYANAN APLIKASI LOKAL:');
      const portToCheck = '443';

      let portOpen = false;
      if (this.isWindows()) {
        try {
          const testCmd = `powershell -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port ${portToCheck}).TcpTestSucceeded"`;
          const testOut = execSync(testCmd, { stdio: 'pipe', windowsHide: true }).toString().trim();
          if (testOut === 'True') portOpen = true;
        } catch {}
      } else {
        try {
          const testCmd = `ss -tulpn | grep -E ":${portToCheck}\\b" || curl -sk -o /dev/null -w "%{http_code}" https://127.0.0.1:${portToCheck}`;
          const testOut = execSync(testCmd, { stdio: 'pipe', windowsHide: true }).toString().trim();
          if (testOut.length > 0) portOpen = true;
        } catch {}
      }

      if (portOpen) {
        details.push(`   └─ Port Web Server ${portToCheck}: ✅ MENDENGARKAN (Caddy / Web Server aktif)`);
      } else {
        details.push(`   └─ Port Web Server ${portToCheck}: ⚠️ TIDAK MENDENGARKAN`);
        details.push(`      └─ [LOKASI MASALAH: LOKAL PORT] Web Server Caddy tidak berjalan di port ${portToCheck}.`);
      }
    } catch {}

    details.push('--------------------------------------------------');
    details.push('💡 RINGKASAN: Jika semua langkah bernilai ✅, terowongan siap dan online sempurna.');

    return {
      success: true,
      message: 'Diagnosa terperinci selesai.',
      details,
      data: {
        slug,
        interface: ifName,
        status: status.status,
        wg_ip: status.wg_ip,
        latest_handshake: latestHandshake,
        transfer: transferStats,
        is_windows: this.isWindows(),
        wireguard_installed: this.isWireGuardInstalled(),
        details,
        timestamp: new Date().toISOString()
      }
    };
  }
}
