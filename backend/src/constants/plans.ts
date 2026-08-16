export interface BackendPlanConfig {
  id: string;
  name: string;
  price: number;
  durationDays: number | null; // null = lifetime
  isWatermark: boolean;
  allowPrintKit: boolean;
  isResellerBundle: boolean;
  tokensGranted: number;
}

export const BACKEND_PLANS: Record<string, BackendPlanConfig> = {
  'UND-BASIC': {
    id: 'UND-BASIC',
    name: 'Paket Hemat (Khitan & Ultah)',
    price: 49000,
    durationDays: 90,
    isWatermark: false,
    allowPrintKit: false,
    isResellerBundle: false,
    tokensGranted: 0
  },
  'UND-GOLD': {
    id: 'UND-GOLD',
    name: 'Paket Wedding Gold (All Features)',
    price: 89000,
    durationDays: 365,
    isWatermark: false,
    allowPrintKit: false,
    isResellerBundle: false,
    tokensGranted: 0
  },
  'UND-PLATINUM': {
    id: 'UND-PLATINUM',
    name: 'Paket Platinum + Print-Ready Kit',
    price: 149000,
    durationDays: null,
    isWatermark: false,
    allowPrintKit: true,
    isResellerBundle: false,
    tokensGranted: 0
  },
  'UND-RESELLER': {
    id: 'UND-RESELLER',
    name: 'Paket Reseller / Percetakan (10 Slot)',
    price: 450000,
    durationDays: null,
    isWatermark: false,
    allowPrintKit: true,
    isResellerBundle: true,
    tokensGranted: 10
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
 * Cek apakah order ini merupakan paket bundle token reseller
 */
export const isResellerPlan = (planId?: string | null, amount?: number | null): boolean => {
  if (planId) {
    const p = planId.toUpperCase();
    if (p.includes('RESELLER') || p.includes('VENDOR') || p.includes('PERCETAKAN')) {
      return true;
    }
  }
  if (amount && amount >= 450000) {
    return true;
  }
  return false;
};

/**
 * Menghitung jumlah token yang didapat dari order
 */
export const calculateResellerTokens = (amount?: number | null): number => {
  if (!amount || amount < 45000) return 10;
  return Math.max(10, Math.floor(amount / 45000));
};
