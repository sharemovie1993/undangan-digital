import axios from 'axios';

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalDev ? 'http://localhost:4001' : '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Auto-attach JWT token if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('absenta_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  loginWithWhatsApp: async (data: { phone: string; name?: string; role?: string; email?: string; mode?: 'login' | 'register' }) => {
    const res = await apiClient.post('/api/auth/whatsapp-login', data);
    return res.data;
  },
  sendOtp: async (data: { phone: string; name?: string; role?: string; email?: string; mode?: 'login' | 'register' }) => {
    const res = await apiClient.post('/api/auth/send-otp', data);
    return res.data;
  },
  verifyOtp: async (data: { phone: string; otp: string; name?: string; role?: string; email?: string; mode?: 'login' | 'register' }) => {
    const res = await apiClient.post('/api/auth/verify-otp', data);
    return res.data;
  },
  register: async (data: { name: string; email: string; phone?: string; password: string; role?: string }) => {
    const res = await apiClient.post('/api/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/api/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  // Multipart File Uploads
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  uploadMultipleImages: async (files: FileList | File[]) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    const res = await axios.post(`${API_BASE_URL}/api/upload/multiple-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/api/upload/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Invitations
  listInvitations: async () => {
    const res = await apiClient.get('/api/invitations/list');
    return res.data;
  },
  getInvitationBySlug: async (slug: string) => {
    const res = await apiClient.get(`/api/invitations/slug/${slug}`);
    return res.data;
  },
  getInvitationById: async (id: string) => {
    const res = await apiClient.get(`/api/invitations/${id}`);
    return res.data;
  },
  saveInvitation: async (data: any) => {
    const res = await apiClient.post('/api/invitations/save', data);
    return res.data;
  },
  duplicateInvitation: async (id: string) => {
    const res = await apiClient.post(`/api/invitations/${id}/duplicate`);
    return res.data;
  },
  deleteInvitation: async (id: string) => {
    const res = await apiClient.delete(`/api/invitations/${id}`);
    return res.data;
  },

  // Guests
  getGuests: async (invitationId: string) => {
    const res = await apiClient.get(`/api/guests/${invitationId}`);
    return res.data;
  },
  addGuest: async (data: { invitationId: string; name: string; phone?: string; address?: string; category?: string; pax?: number }) => {
    const res = await apiClient.post('/api/guests/add', data);
    return res.data;
  },
  bulkImportGuests: async (data: { invitationId: string; guests: any[] }) => {
    const res = await apiClient.post('/api/guests/bulk', data);
    return res.data;
  },
  checkInGuest: async (qrCode: string) => {
    const res = await apiClient.post('/api/guests/checkin', { qrCode });
    return res.data;
  },
  deleteGuest: async (id: string) => {
    const res = await apiClient.delete(`/api/guests/${id}`);
    return res.data;
  },
  getExportGuestsCsvUrl: (invitationId: string) =>
    `${API_BASE_URL}/api/guests/${invitationId}/export-csv`,

  // RSVP
  getRsvps: async (invitationId: string) => {
    const res = await apiClient.get(`/api/rsvps/${invitationId}`);
    return res.data;
  },
  submitRsvp: async (data: { invitationId: string; name: string; attendance: string; pax?: number; message?: string }) => {
    const res = await apiClient.post('/api/rsvps/submit', data);
    return res.data;
  },
  likeRsvp: async (id: string) => {
    const res = await apiClient.post(`/api/rsvps/${id}/like`);
    return res.data;
  },
  deleteRsvp: async (id: string) => {
    const res = await apiClient.delete(`/api/rsvps/${id}`);
    return res.data;
  },

  // Packages & License Server
  getPackages: async () => {
    const res = await apiClient.get('/api/license/packages');
    return res.data;
  },
  getPaymentChannels: async () => {
    const res = await apiClient.get('/api/license/payment-channels');
    return res.data;
  },
  createOrder: async (data: { invitationId?: string; planId: string; customerName: string; customerPhone: string; paymentMethod?: string }) => {
    const res = await apiClient.post('/api/license/create-order', data);
    return res.data;
  },
  checkOrderStatus: async (invoiceNumber: string) => {
    const res = await apiClient.get(`/api/license/check-status/${invoiceNumber}`);
    return res.data;
  },
  simulatePaid: async (invoiceNumber: string) => {
    const res = await apiClient.post(`/api/license/simulate-paid/${invoiceNumber}`);
    return res.data;
  },
  activateWithToken: async (invitationId: string) => {
    const res = await apiClient.post('/api/license/activate-with-token', { invitationId });
    return res.data;
  },
  transferLicense: async (data: { targetInvitationId: string; sourceInvitationId?: string; licenseKey?: string }) => {
    const res = await apiClient.post('/api/license/transfer', data);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await apiClient.get('/api/license/my-orders');
    return res.data;
  },

  // Print 300 DPI PDF URLs
  getCardPdfUrl: (invitationId: string, format: 'A5' | '4R' = 'A5') =>
    `${API_BASE_URL}/api/print/card/${invitationId}?format=${format}`,
  getStickersPdfUrl: (invitationId: string) =>
    `${API_BASE_URL}/api/print/stickers/${invitationId}`,
  getSouvenirTagsPdfUrl: (invitationId: string) =>
    `${API_BASE_URL}/api/print/souvenir-tags/${invitationId}`,
  getTableStandeePdfUrl: (invitationId: string) =>
    `${API_BASE_URL}/api/print/table-standee/${invitationId}`,

  // Stitch Manifests
  getStitchManifests: async () => {
    const res = await apiClient.get('/api/stitch/manifests');
    return res.data;
  },

  // Dynamic Themes & Master Style Kits
  getThemes: async () => {
    const res = await apiClient.get('/api/themes');
    return res.data;
  },
  getStyleKits: async () => {
    const res = await apiClient.get('/api/style-kits');
    return res.data;
  },

  // Easy-Tunnel WireGuard
  getEasyTunnels: async () => {
    const res = await apiClient.get('/api/easy-tunnel');
    return res.data;
  },
  getEasyTunnelById: async (id: string) => {
    const res = await apiClient.get(`/api/easy-tunnel/${id}`);
    return res.data;
  },
  setupEasyTunnel: async (data: { license_key: string; subdomain_slug: string; local_port: number; app_name: string }) => {
    const res = await apiClient.post('/api/easy-tunnel/setup', data);
    return res.data;
  },
  startEasyTunnel: async (id: string) => {
    const res = await apiClient.post(`/api/easy-tunnel/${id}/start`);
    return res.data;
  },
  stopEasyTunnel: async (id: string) => {
    const res = await apiClient.post(`/api/easy-tunnel/${id}/stop`);
    return res.data;
  },
  deleteEasyTunnel: async (id: string) => {
    const res = await apiClient.delete(`/api/easy-tunnel/${id}`);
    return res.data;
  },
  diagnoseEasyTunnel: async (id: string) => {
    const res = await apiClient.get(`/api/easy-tunnel/${id}/diagnose`);
    return res.data;
  },
  setEasyTunnelCustomDomain: async (id: string, custom_domain: string) => {
    const res = await apiClient.post(`/api/easy-tunnel/${id}/custom-domain`, { custom_domain });
    return res.data;
  },
  removeEasyTunnelCustomDomain: async (id: string) => {
    const res = await apiClient.delete(`/api/easy-tunnel/${id}/custom-domain`);
    return res.data;
  },
  checkWgInstalled: async () => {
    const res = await apiClient.get('/api/easy-tunnel/wg-check');
    return res.data;
  },
  installWg: async () => {
    const res = await apiClient.post('/api/easy-tunnel/wg-install');
    return res.data;
  },
  getEasyTunnelPackages: async () => {
    const res = await apiClient.get('/api/easy-tunnel/packages');
    return res.data;
  },
  getEasyTunnelPaymentChannels: async () => {
    const res = await apiClient.get('/api/easy-tunnel/payment-channels');
    return res.data;
  },
  buyEasyTunnelLicense: async (data: { school_name: string; plan_id: string; payment_method: string; subdomain_slug?: string; app_name?: string; local_port?: number }) => {
    const res = await apiClient.post('/api/easy-tunnel/buy-license', data);
    return res.data;
  },
  checkEasyTunnelInvoice: async (invoice: string) => {
    const res = await apiClient.get(`/api/easy-tunnel/invoice-status/${invoice}`);
    return res.data;
  },
  validateEasyTunnelKey: async (key: string) => {
    const res = await apiClient.get(`/api/easy-tunnel/validate/${key}`);
    return res.data;
  }
};
