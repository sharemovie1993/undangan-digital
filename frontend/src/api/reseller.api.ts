import { apiClient } from './client';

export interface ResellerBranding {
  studioName: string;
  studioPhone?: string;
  studioWebsite?: string;
  customDomain?: string;
  defaultSellingPrice: number;
  estimatedTokenCost: number;
  enableWhiteLabel: boolean;
}

export interface ResellerAnalytics {
  role: string;
  remainingTokens: number;
  tokensUsed: number;
  totalInvitations: number;
  activeInvitationsCount: number;
  tokenLedger: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    licenseKey: string;
    activatedAt: string;
    guestCount: number;
    rsvpCount: number;
  }>;
}

export const resellerApi = {
  /**
   * Mengambil profil branding reseller & konfigurasi harga
   */
  async getProfile(): Promise<{
    user: any;
    branding: ResellerBranding;
  }> {
    const res = await apiClient.get('/api/reseller/profile');
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memuat profil reseller.');
    }
    return res.data.data;
  },

  /**
   * Menyimpan profil branding studio & custom domain reseller
   */
  async saveProfile(payload: {
    studioName?: string;
    studioPhone?: string;
    studioWebsite?: string;
    customDomain?: string;
  }): Promise<any> {
    const res = await apiClient.post('/api/reseller/profile', payload);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal menyimpan profil reseller.');
    }
    return res.data;
  },

  /**
   * Mengambil analitik keuntungan, omzet, dan buku kas token
   */
  async getAnalytics(): Promise<ResellerAnalytics> {
    const res = await apiClient.get('/api/reseller/analytics');
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Gagal memuat analitik reseller.');
    }
    return res.data.data;
  }
};
