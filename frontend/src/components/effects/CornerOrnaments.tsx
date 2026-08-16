import React from 'react';
import { CornerOrnamentId, SectionDividerId } from '../../types';

interface CornerOrnamentsProps {
  type?: CornerOrnamentId;
  primaryColor?: string;
  className?: string;
}

export const CornerOrnaments: React.FC<CornerOrnamentsProps> = ({
  type = 'none',
  primaryColor = '#c4a661',
  className = '',
}) => {
  if (!type || type === 'none') return null;

  if (type === 'batik_prada') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        {/* Top-Left */}
        <svg className="absolute top-2 left-2 w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        {/* Top-Right */}
        <svg className="absolute top-2 right-2 w-6 h-6 -scale-x-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        {/* Bottom-Left */}
        <svg className="absolute bottom-2 left-2 w-6 h-6 -scale-y-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
        {/* Bottom-Right */}
        <svg className="absolute bottom-2 right-2 w-6 h-6 -scale-x-100 -scale-y-100" viewBox="0 0 24 24" fill="none">
          <path d="M2 2 L14 2 M2 2 L2 14 M2 2 L10 10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="6" cy="6" r="1.5" fill={primaryColor} />
        </svg>
      </div>
    );
  }

  if (type === 'royal_crown') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
        {/* Top-Left */}
        <svg className="absolute top-2 left-2 w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
          <circle cx="4" cy="4" r="1" fill={primaryColor} />
        </svg>
        {/* Top-Right */}
        <svg className="absolute top-2 right-2 w-7 h-7 -scale-x-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
          <circle cx="4" cy="4" r="1" fill={primaryColor} />
        </svg>
        {/* Bottom-Left */}
        <svg className="absolute bottom-2 left-2 w-7 h-7 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
          <circle cx="4" cy="4" r="1" fill={primaryColor} />
        </svg>
        {/* Bottom-Right */}
        <svg className="absolute bottom-2 right-2 w-7 h-7 -scale-x-100 -scale-y-100" viewBox="0 0 28 28" fill="none">
          <path d="M2 14 C2 6, 6 2, 14 2 M2 2 L8 8" stroke={primaryColor} strokeWidth="1.2" opacity="0.8" />
          <circle cx="4" cy="4" r="1" fill={primaryColor} />
        </svg>
      </div>
    );
  }

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

  return null;
};

interface SectionDividerProps {
  type?: SectionDividerId;
  primaryColor?: string;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  type = 'gold_line',
  primaryColor = '#c4a661',
  className = '',
}) => {
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
};
