export type PlanTier = 'BASIC' | 'GOLD' | 'PLATINUM' | 'RESELLER';

export interface PlanConfig {
  id: string;
  name: string;
  badge: string;
  price: number;
  durationLabel: string;
  isWatermark: boolean;
  allowPrintKit: boolean;
  isResellerToken: boolean;
  tokensCount?: number;
  features: string[];
}

export const PLANS_CONFIG: Record<string, PlanConfig> = {
  'UND-BASIC': {
    id: 'UND-BASIC',
    name: 'Paket Hemat (Khitan & Ultah)',
    badge: 'Hemat 🔥',
    price: 49000,
    durationLabel: 'Aktif 3 Bulan',
    isWatermark: false,
    allowPrintKit: false,
    isResellerToken: false,
    features: [
      'Bebas Watermark Resmi',
      'Tema Khitanan / Ulang Tahun / Acara',
      'RSVP & Buku Tamu Interaktif',
      'Navigasi Lokasi Google Maps Presisi',
      'Masa Aktif 3 Bulan'
    ]
  },
  'UND-GOLD': {
    id: 'UND-GOLD',
    name: 'Paket Wedding Gold (All Features)',
    badge: 'Paling Populer 💍',
    price: 89000,
    durationLabel: 'Aktif 1 Tahun',
    isWatermark: false,
    allowPrintKit: false,
    isResellerToken: false,
    features: [
      'Bebas Watermark & Semua Tema Mewah',
      'Galeri Foto Unlimited & Kisah Cinta',
      'Musik Latar Eksklusif (Player Melayang)',
      'Buku Tamu & RSVP Realtime',
      'Amplop Digital + QRIS Donasi',
      'Peta Lokasi Google Maps Presisi',
      'Masa Aktif 1 Tahun Penuh'
    ]
  },
  'UND-PLATINUM': {
    id: 'UND-PLATINUM',
    name: 'Paket Platinum + Print-Ready Kit',
    badge: 'Lengkap + Cetak 🖨️',
    price: 149000,
    durationLabel: 'Aktif Selamanya',
    isWatermark: false,
    allowPrintKit: true,
    isResellerToken: false,
    features: [
      'Semua Fitur Paket Gold Termasuk',
      'Masa Aktif Selamanya (Tanpa Batas)',
      'File Undangan Siap Cetak HD (A5 & 4R)',
      'Cetak Label Nama Tamu (Tom & Jerry 103)',
      'Kartu Souvenir & Voucher Siap Print',
      'QR Scanner Check-in Tamu Resepsi',
      'WhatsApp Broadcast Generator'
    ]
  },
  'UND-RESELLER-5': {
    id: 'UND-RESELLER-5',
    name: 'Paket Reseller Starter (5 Slot)',
    badge: 'Starter 🥉',
    price: 225000,
    durationLabel: 'Saldo Token Permanen',
    isWatermark: false,
    allowPrintKit: true,
    isResellerToken: true,
    tokensCount: 5,
    features: [
      '5 Token Aktivasi (Pakai Kapan Saja)',
      'Modal Rp 45.000 / Acara',
      'Fitur Platinum Lengkap di Semua Proyek',
      'Unduh Print Kit HD 300 DPI Sepuasnya',
      'Bebas Watermark di Semua Undangan'
    ]
  },
  'UND-RESELLER': {
    id: 'UND-RESELLER',
    name: 'Paket Reseller Business (10 Slot)',
    badge: 'Paling Populer 🥈',
    price: 450000,
    durationLabel: 'Saldo Token Permanen',
    isWatermark: false,
    allowPrintKit: true,
    isResellerToken: true,
    tokensCount: 10,
    features: [
      '10 Token Aktivasi (Pakai Kapan Saja)',
      'Modal Rp 45.000 / Acara',
      'Fitur Platinum Lengkap di Semua Proyek',
      'Unduh Print Kit HD Sepuasnya',
      'Bebas Watermark di Semua Undangan'
    ]
  },
  'UND-RESELLER-25': {
    id: 'UND-RESELLER-25',
    name: 'Paket Reseller Pro (25 Slot)',
    badge: 'Hemat 22% 🥇',
    price: 875000,
    durationLabel: 'Saldo Token Permanen',
    isWatermark: false,
    allowPrintKit: true,
    isResellerToken: true,
    tokensCount: 25,
    features: [
      '25 Token Aktivasi (Pakai Kapan Saja)',
      'Modal Super Hemat: Rp 35.000 / Acara',
      'Fitur Platinum Lengkap di Semua Proyek',
      'Unduh Print Kit HD 300 DPI Sepuasnya',
      'Bebas Watermark di Semua Undangan'
    ]
  },
  'UND-RESELLER-50': {
    id: 'UND-RESELLER-50',
    name: 'Paket Vendor & Percetakan (50 Slot)',
    badge: 'Super Hemat 44% 👑',
    price: 1250000,
    durationLabel: 'Saldo Token Permanen',
    isWatermark: false,
    allowPrintKit: true,
    isResellerToken: true,
    tokensCount: 50,
    features: [
      '50 Token Aktivasi (Pakai Kapan Saja)',
      'Modal Grosir: Rp 25.000 / Acara',
      'Fitur Platinum Lengkap di Semua Proyek',
      'Unduh Print Kit HD Sepuasnya',
      'Bebas Watermark & Akses Vendor Prioritas'
    ]
  }
};

/**
 * Cek apakah paket atau ID lisensi memiliki hak akses Print Studio (PDF 300 DPI, Label 103)
 */
export const isPrintKitAllowed = (planId?: string | null, allowPrintKitFlag?: boolean, userRole?: string): boolean => {
  if (userRole && ['ADMIN', 'RESELLER', 'PERCETAKAN'].includes(userRole.toUpperCase())) {
    return true;
  }
  if (allowPrintKitFlag === true) return true;
  if (!planId) return false;
  const p = planId.toUpperCase();
  return (
    p.includes('PLATINUM') ||
    p.includes('RESELLER') ||
    p.includes('VENDOR') ||
    p.includes('PERCETAKAN')
  );
};

/**
 * Mengambil detail nama paket yang ramah pengguna
 */
export const getPlanDetails = (planId?: string | null): PlanConfig => {
  if (!planId) {
    return {
      id: 'TRIAL',
      name: 'Mode Percobaan (Watermark)',
      badge: 'Trial',
      price: 0,
      durationLabel: 'Trial',
      isWatermark: true,
      allowPrintKit: false,
      isResellerToken: false,
      features: ['Fitur Preview Standar']
    };
  }

  const upper = planId.toUpperCase();
  if (upper.includes('RESELLER-TOKEN') || upper.includes('TOKEN')) {
    return {
      id: 'UND-RESELLER-TOKEN',
      name: 'Aktivasi Token Reseller',
      badge: '👑 PRO RESELLER',
      price: 45000,
      durationLabel: 'Aktif Selamanya',
      isWatermark: false,
      allowPrintKit: true,
      isResellerToken: true,
      features: ['Fitur Platinum Lengkap', 'Print Kit HD', 'Masa Aktif Selamanya']
    };
  }

  if (PLANS_CONFIG[upper]) {
    return PLANS_CONFIG[upper];
  }

  if (upper.includes('PLATINUM')) return PLANS_CONFIG['UND-PLATINUM'];
  if (upper.includes('GOLD')) return PLANS_CONFIG['UND-GOLD'];
  if (upper.includes('BASIC') || upper.includes('HEMAT')) return PLANS_CONFIG['UND-BASIC'];
  if (upper.includes('RESELLER') || upper.includes('VENDOR')) return PLANS_CONFIG['UND-RESELLER'];

  return {
    id: planId,
    name: planId,
    badge: 'Lisensi Resmi',
    price: 0,
    durationLabel: 'Aktif',
    isWatermark: false,
    allowPrintKit: false,
    isResellerToken: false,
    features: ['Fitur Lengkap']
  };
};
