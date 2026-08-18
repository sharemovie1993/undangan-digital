import { apiClient } from './client';

export interface AdminUserItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'RESELLER' | 'PERCETAKAN' | 'ADMIN';
  quotaTokens: number;
  invitationsCount: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  /**
   * Mengambil daftar seluruh pengguna terdaftar
   */
  async getUsers(): Promise<AdminUserItem[]> {
    const res = await apiClient.get('/api/admin/users');
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal mengambil data pengguna.');
    }
    return res.data.data || [];
  },

  /**
   * Mengubah saldo token pengguna (+ / - atau set)
   */
  async updateTokens(userId: string, amount: number, mode: 'add' | 'set' = 'add'): Promise<{
    id: string;
    name: string;
    quotaTokens: number;
  }> {
    const res = await apiClient.patch(`/api/admin/users/${userId}/tokens`, { amount, mode });
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memperbarui saldo token pengguna.');
    }
    return res.data.data;
  },

  /**
   * Mengubah role pengguna
   */
  async updateRole(userId: string, role: string): Promise<{
    id: string;
    name: string;
    role: string;
  }> {
    const res = await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memperbarui role pengguna.');
    }
    return res.data.data;
  },

  /**
   * Memindahkan kepemilikan proyek undangan ke user lain
   */
  async transferInvitation(invitationId: string, targetUserId: string): Promise<any> {
    const res = await apiClient.post(`/api/admin/invitations/${invitationId}/transfer`, { targetUserId });
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memindahkan kepemilikan undangan.');
    }
    return res.data.data;
  },

  /**
   * Mengubah status lisensi & watermark secara langsung oleh Admin
   */
  async overrideInvitation(
    invitationId: string,
    data: {
      status?: string;
      isWatermark?: boolean;
      allowPrintKit?: boolean;
      planId?: string;
      licenseKey?: string;
    }
  ): Promise<any> {
    const res = await apiClient.patch(`/api/admin/invitations/${invitationId}/override`, data);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memperbarui status lisensi undangan.');
    }
    return res.data.data;
  }
};
