import React, { memo } from 'react';
import { CornerOrnamentId, SectionDividerId } from '../../types';

interface CornerOrnamentsProps {
  type?: CornerOrnamentId;
  primaryColor?: string;
  className?: string;
}

export const CornerOrnaments = memo(function CornerOrnaments({
  type = 'royal_crown',
  primaryColor = '#c4a661',
  className = '',
}: CornerOrnamentsProps) {
  if (!type || type === 'none') return null;

  // 1. Batik Prada (Batik Ukir Emas Keraton)
  if (type === 'batik_prada') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-6 h-6 -scale-x-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-6 h-6 -scale-y-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-6 h-6 -scale-x-100 -scale-y-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 2. Javanese Flourish (Sulur Kayu Joglo Klasik)
  if (type === 'javanese_flourish') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q14 2 14 14 Q2 14 2 26" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M2 2 Q2 14 14 14 Q14 2 26 2" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} opacity="0.9" />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q14 2 14 14 Q2 14 2 26" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M2 2 Q2 14 14 14 Q14 2 26 2" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} opacity="0.9" />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q14 2 14 14 Q2 14 2 26" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M2 2 Q2 14 14 14 Q14 2 26 2" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} opacity="0.9" />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q14 2 14 14 Q2 14 2 26" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M2 2 Q2 14 14 14 Q14 2 26 2" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} opacity="0.9" />
        </svg>
      </div>
    );
  }

  // 3. Islamic Arabesque (Bintang Geometris & Kubah Islami)
  if (type === 'islamic_arabesque') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 L14 2 C14 8, 8 14, 2 14 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L8 8 M2 8 L8 2" stroke={primaryColor} strokeWidth="0.8" opacity="0.6" />
          <circle cx="10" cy="10" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 L14 2 C14 8, 8 14, 2 14 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L8 8 M2 8 L8 2" stroke={primaryColor} strokeWidth="0.8" opacity="0.6" />
          <circle cx="10" cy="10" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 L14 2 C14 8, 8 14, 2 14 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L8 8 M2 8 L8 2" stroke={primaryColor} strokeWidth="0.8" opacity="0.6" />
          <circle cx="10" cy="10" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 L14 2 C14 8, 8 14, 2 14 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L8 8 M2 8 L8 2" stroke={primaryColor} strokeWidth="0.8" opacity="0.6" />
          <circle cx="10" cy="10" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 4. Botanical Leaves (Ranting Daun Zaitun & Bunga Romantis)
  if (type === 'botanical_leaves') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q16 4 18 18" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="6" cy="12" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(-40 6 12)" opacity="0.85" />
          <ellipse cx="12" cy="6" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(40 12 6)" opacity="0.85" />
          <circle cx="17" cy="17" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q16 4 18 18" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="6" cy="12" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(-40 6 12)" opacity="0.85" />
          <ellipse cx="12" cy="6" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(40 12 6)" opacity="0.85" />
          <circle cx="17" cy="17" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q16 4 18 18" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="6" cy="12" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(-40 6 12)" opacity="0.85" />
          <ellipse cx="12" cy="6" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(40 12 6)" opacity="0.85" />
          <circle cx="17" cy="17" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q16 4 18 18" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="6" cy="12" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(-40 6 12)" opacity="0.85" />
          <ellipse cx="12" cy="6" rx="3.5" ry="1.5" fill={primaryColor} transform="rotate(40 12 6)" opacity="0.85" />
          <circle cx="17" cy="17" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 5. Vintage Scroll (Pilinan Filigri Renda Victorian)
  if (type === 'vintage_scroll') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 16 C2 6, 8 2, 18 2 M2 10 C6 10, 10 6, 10 2 M4 4 L14 14" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          <circle cx="12" cy="12" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 16 C2 6, 8 2, 18 2 M2 10 C6 10, 10 6, 10 2 M4 4 L14 14" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          <circle cx="12" cy="12" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 16 C2 6, 8 2, 18 2 M2 10 C6 10, 10 6, 10 2 M4 4 L14 14" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          <circle cx="12" cy="12" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 16 C2 6, 8 2, 18 2 M2 10 C6 10, 10 6, 10 2 M4 4 L14 14" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          <circle cx="12" cy="12" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 6. Minang Gonjong (Tanduk Runcing Rumah Gadang & Suntiang)
  if (type === 'minang_gonjong') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 20 Q4 6 18 2 Q6 4 2 18" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}20`} strokeLinecap="round" opacity="0.9" />
          <path d="M2 2 L12 12" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="14" cy="14" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 20 Q4 6 18 2 Q6 4 2 18" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}20`} strokeLinecap="round" opacity="0.9" />
          <path d="M2 2 L12 12" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="14" cy="14" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 20 Q4 6 18 2 Q6 4 2 18" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}20`} strokeLinecap="round" opacity="0.9" />
          <path d="M2 2 L12 12" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="14" cy="14" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 20 Q4 6 18 2 Q6 4 2 18" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}20`} strokeLinecap="round" opacity="0.9" />
          <path d="M2 2 L12 12" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="14" cy="14" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 7. Sunda Parahyangan (Awan Lengkung Megamendung Parahyangan)
  if (type === 'sunda_parahyangan') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 C8 2, 14 6, 16 12 C12 14, 6 14, 2 8 Z" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L10 10" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 C8 2, 14 6, 16 12 C12 14, 6 14, 2 8 Z" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L10 10" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 C8 2, 14 6, 16 12 C12 14, 6 14, 2 8 Z" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L10 10" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 C8 2, 14 6, 16 12 C12 14, 6 14, 2 8 Z" stroke={primaryColor} strokeWidth="1.2" fill={`${primaryColor}15`} opacity="0.85" />
          <path d="M2 2 L10 10" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 8. Bali Patra (Ukiran Patra Punggel Tradisional Bali)
  if (type === 'bali_patra') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q10 2 12 8 Q14 2 20 4 Q14 10 12 16 Q8 10 2 12 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}20`} opacity="0.85" />
          <circle cx="7" cy="7" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q10 2 12 8 Q14 2 20 4 Q14 10 12 16 Q8 10 2 12 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}20`} opacity="0.85" />
          <circle cx="7" cy="7" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q10 2 12 8 Q14 2 20 4 Q14 10 12 16 Q8 10 2 12 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}20`} opacity="0.85" />
          <circle cx="7" cy="7" r="1.5" fill={primaryColor} />
        </svg>
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 2 Q10 2 12 8 Q14 2 20 4 Q14 10 12 16 Q8 10 2 12 Z" stroke={primaryColor} strokeWidth="1" fill={`${primaryColor}20`} opacity="0.85" />
          <circle cx="7" cy="7" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  // 9. Art Deco (Modern Luxury Geometric Lines)
  if (type === 'art_deco') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        <svg className="absolute top-2 left-2 w-5 h-5" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <rect x="5" y="5" width="10" height="10" stroke={primaryColor} strokeWidth="0.8" opacity="0.4" />
        </svg>
        <svg className="absolute top-2 right-2 w-5 h-5 -scale-x-100" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <rect x="5" y="5" width="10" height="10" stroke={primaryColor} strokeWidth="0.8" opacity="0.4" />
        </svg>
        <svg className="absolute bottom-2 left-2 w-5 h-5 -scale-y-100" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <rect x="5" y="5" width="10" height="10" stroke={primaryColor} strokeWidth="0.8" opacity="0.4" />
        </svg>
        <svg className="absolute bottom-2 right-2 w-5 h-5 -scale-x-100 -scale-y-100" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
          <rect x="5" y="5" width="10" height="10" stroke={primaryColor} strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>
    );
  }

  // 10. Royal Crown (Default: Mahkota Klasik Eropa)
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
      <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
        <circle cx="4" cy="4" r="1" fill={primaryColor} />
      </svg>
      <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
        <circle cx="4" cy="4" r="1" fill={primaryColor} />
      </svg>
      <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
        <circle cx="4" cy="4" r="1" fill={primaryColor} />
      </svg>
      <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
        <circle cx="4" cy="4" r="1" fill={primaryColor} />
      </svg>
    </div>
  );
});

CornerOrnaments.displayName = 'CornerOrnaments';

interface SectionDividerProps {
  type?: SectionDividerId;
  primaryColor?: string;
  className?: string;
}

export const SectionDivider = memo(function SectionDivider({
  type = 'gold_line',
  primaryColor = '#c4a661',
  className = '',
}: SectionDividerProps) {
  if (!type || type === 'none') return null;

  if (type === 'batik_parang') {
    return (
      <div className={`flex items-center justify-center my-6 gap-3 ${className}`}>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-current opacity-30" style={{ color: primaryColor }} />
        <svg className="w-12 h-4 text-current opacity-80" viewBox="0 0 48 16" fill="none" style={{ color: primaryColor }}>
          <path d="M4 12 L12 4 M10 12 L18 4 M16 12 L24 4 M22 12 L30 4 M28 12 L36 4 M34 12 L42 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-current opacity-30" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (type === 'olive_branch') {
    return (
      <div className={`flex items-center justify-center my-6 gap-3 ${className}`}>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-current opacity-30" style={{ color: primaryColor }} />
        <svg className="w-16 h-5 text-current opacity-80" viewBox="0 0 64 20" fill="none" style={{ color: primaryColor }}>
          <path d="M4 10 Q32 2 60 10 M32 2 L32 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="32" cy="10" r="3" fill="currentColor" />
          <ellipse cx="20" cy="8" rx="3" ry="2" fill="currentColor" transform="rotate(-20 20 8)" />
          <ellipse cx="44" cy="8" rx="3" ry="2" fill="currentColor" transform="rotate(20 44 8)" />
        </svg>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-current opacity-30" style={{ color: primaryColor }} />
      </div>
    );
  }

  // Default gold line with diamond center
  return (
    <div className={`flex items-center justify-center my-6 gap-3 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-current opacity-40" style={{ color: primaryColor }} />
      <div className="w-2 h-2 rotate-45 border border-current shadow-xs" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }} />
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-current opacity-40" style={{ color: primaryColor }} />
    </div>
  );
});

SectionDivider.displayName = 'SectionDivider';

