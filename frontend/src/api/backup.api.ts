import { apiClient, API_BASE_URL } from './client';

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
    const res = await apiClient.get('/api/backup/list');
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal mengambil riwayat backup.');
    }
    return res.data.data || [];
  },

  /**
   * Memicu pembuatan backup baru di server
   */
  async create(includeMedia: boolean = true): Promise<BackupItem> {
    const res = await apiClient.post('/api/backup/create', { includeMedia });
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal membuat file backup.');
    }
    return res.data.data;
  },

  /**
   * Mengunduh file backup ZIP
   */
  async download(filename: string): Promise<void> {
    const token = localStorage.getItem('absenta_auth_token');
    const downloadUrl = `${API_BASE_URL}/api/backup/download/${encodeURIComponent(filename)}`;
    
    const res = await fetch(downloadUrl, {
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
    const res = await apiClient.delete(`/api/backup/${encodeURIComponent(filename)}`);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal menghapus file backup.');
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
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/api/backup/restore', formData, {
      headers: {
        'Content-Type': undefined
      }
    });

    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memulihkan data dari berkas backup.');
    }
    return res.data.data;
  }
};
