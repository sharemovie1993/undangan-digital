import React from 'react';
import { ArchetypeStyle } from '../../types';

interface OrnamentProps {
  archetype?: ArchetypeStyle;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Royal Arch Frame: Lengkungan emas megah & sudut ukiran bunga klasik
 */
export const RoyalArchOrnament: React.FC<{ color?: string }> = ({ color = '#c4a661' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top Arch SVG */}
    <div className="flex justify-between items-start">
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-80">
        <path d="M0 0 H50 C25 0 0 25 0 50 V0Z" fill={color} fillOpacity="0.15" />
        <path d="M5 5 H45 C25 5 5 25 5 45 V5Z" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
      <div className="flex-1 flex justify-center -mt-1">
        <svg width="60" height="20" viewBox="0 0 100 30" fill="none">
          <path d="M10 15 C30 0, 70 0, 90 15 C70 30, 30 30, 10 15 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
          <circle cx="50" cy="15" r="4" fill={color} />
        </svg>
      </div>
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-80 scale-x-[-1]">
        <path d="M0 0 H50 C25 0 0 25 0 50 V0Z" fill={color} fillOpacity="0.15" />
        <path d="M5 5 H45 C25 5 5 25 5 45 V5Z" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    </div>

    {/* Bottom Arch SVG */}
    <div className="flex justify-between items-end">
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-80 scale-y-[-1]">
        <path d="M0 0 H50 C25 0 0 25 0 50 V0Z" fill={color} fillOpacity="0.15" />
        <path d="M5 5 H45 C25 5 5 25 5 45 V5Z" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
      <div className="flex-1 flex justify-center -mb-1">
        <svg width="60" height="20" viewBox="0 0 100 30" fill="none">
          <path d="M10 15 C30 0, 70 0, 90 15 C70 30, 30 30, 10 15 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
          <circle cx="50" cy="15" r="4" fill={color} />
        </svg>
      </div>
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-80 scale-[-1]">
        <path d="M0 0 H50 C25 0 0 25 0 50 V0Z" fill={color} fillOpacity="0.15" />
        <path d="M5 5 H45 C25 5 5 25 5 45 V5Z" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    </div>
  </div>
);

/**
 * Islamic Dome & Arabesque Ornament: Kubah geometris Islami
 */
export const IslamicDomeOrnament: React.FC<{ color?: string }> = ({ color = '#629e7c' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top Islamic Dome Crest */}
    <div className="w-full flex justify-center pt-1">
      <svg width="120" height="35" viewBox="0 0 140 40" fill="none" className="opacity-80">
        <path
          d="M10 35 C40 35, 55 5, 70 0 C85 5, 100 35, 130 35"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M25 35 C45 35, 58 12, 70 8 C82 12, 95 35, 115 35"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
        />
        <circle cx="70" cy="0" r="3.5" fill={color} />
        <path d="M68 -6 L72 -6 L70 -10 Z" fill={color} />
      </svg>
    </div>

    {/* Bottom Islamic Star Motif */}
    <div className="w-full flex justify-center pb-2 opacity-70">
      <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
        <rect x="15" y="15" width="20" height="20" stroke={color} strokeWidth="1.5" transform="rotate(45 25 25)" />
        <rect x="15" y="15" width="20" height="20" stroke={color} strokeWidth="1.5" />
        <circle cx="25" cy="25" r="3" fill={color} />
      </svg>
    </div>
  </div>
);

/**
 * Modern Botanical Glass: Border frosted minimalis
 */
export const ModernGlassFrame: React.FC<{ color?: string }> = ({ color = '#b76e79' }) => (
  <div className="pointer-events-none absolute inset-0 p-2.5 z-10">
    <div
      className="w-full h-full rounded-2xl border transition-all duration-300"
      style={{
        borderColor: `${color}40`,
        boxShadow: `inset 0 0 20px ${color}10`
      }}
    />
  </div>
);

/**
 * Party Confetti Accent: Partikel ceria pesta
 */
export const PartyConfettiOrnament: React.FC<{ color?: string }> = ({ color = '#e8a598' }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden z-10 opacity-70">
    <div className="absolute top-4 left-6 w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color }} />
    <div className="absolute top-12 right-8 w-3 h-1.5 rounded rotate-45" style={{ backgroundColor: '#d4af37' }} />
    <div className="absolute bottom-16 left-8 w-2 h-2 rotate-12" style={{ backgroundColor: color }} />
    <div className="absolute bottom-6 right-10 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#629e7c' }} />
  </div>
);

/**
 * Main Archetype Container Dispatcher
 */
export const OrnamentEngine: React.FC<OrnamentProps> = ({
  archetype = 'royal_arch',
  primaryColor = '#c4a661',
  className = '',
  children
}) => {
  return (
    <div className={`relative ${className}`}>
      {archetype === 'royal_arch' && <RoyalArchOrnament color={primaryColor} />}
      {archetype === 'islamic_dome' && <IslamicDomeOrnament color={primaryColor} />}
      {archetype === 'modern_glass' && <ModernGlassFrame color={primaryColor} />}
      {archetype === 'party_confetti' && <PartyConfettiOrnament color={primaryColor} />}
      {children}
    </div>
  );
};
