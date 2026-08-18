import { API_BASE_URL } from './client';

const API_BASE = API_BASE_URL || 'http://localhost:4000';

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

export interface BackupItem {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  manifest?: BackupManifest | null;
}

export const backupApi = {
  /**
   * Mengambil daftar file backup di server
   */
  async list(): Promise<BackupItem[]> {
    const token = localStorage.getItem('absenta_auth_token');
    const res = await fetch(`${API_BASE}/api/backup/list`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal mengambil riwayat backup.');
    }
    return json.data || [];
  },

  /**
   * Memicu pembuatan backup baru di server
   */
  async create(includeMedia: boolean = true): Promise<BackupItem> {
    const token = localStorage.getItem('absenta_auth_token');
    const res = await fetch(`${API_BASE}/api/backup/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ includeMedia })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal membuat file backup.');
    }
    return json.data;
  },

  /**
   * Mengunduh file backup ZIP
   */
  async download(filename: string): Promise<void> {
    const token = localStorage.getItem('absenta_auth_token');
    const res = await fetch(`${API_BASE}/api/backup/download/${encodeURIComponent(filename)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = 'Gagal mengunduh berkas backup.';
      try {
        const json = JSON.parse(errorText);
        errorMsg = json.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Menghapus file backup dari server
   */
  async delete(filename: string): Promise<void> {
    const token = localStorage.getItem('absenta_auth_token');
    const res = await fetch(`${API_BASE}/api/backup/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal menghapus file backup.');
    }
  },

  /**
   * Mengunggah berkas zip dan melakukan restore database + media
   */
  async restore(file: File): Promise<{
    success: boolean;
    manifest: BackupManifest;
    restoredCounts: Record<string, number>;
    message: string;
  }> {
    const token = localStorage.getItem('absenta_auth_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/backup/restore`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal memulihkan data dari berkas backup.');
    }
    return json.data;
  }
};
