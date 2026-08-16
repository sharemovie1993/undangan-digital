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
 * 1. JAWA KLASIK (Gunungan Wayang & Ukiran Joglo)
 */
export const JawaJogloOrnament: React.FC<{ color?: string }> = ({ color = '#9c6828' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top Gunungan Crest */}
    <div className="w-full flex flex-col items-center pt-1">
      <svg width="100" height="42" viewBox="0 0 120 50" fill="none" className="opacity-85">
        {/* Gunungan Silhouette */}
        <path
          d="M60 2 C68 15, 95 30, 110 45 C80 45, 60 48, 60 48 C60 48, 40 45, 10 45 C25 30, 52 15, 60 2 Z"
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="1.5"
        />
        {/* Tree of Life Inner Branch */}
        <path d="M60 12 V44 M60 22 L75 32 M60 22 L45 32 M60 30 L80 40 M60 30 L40 40" stroke={color} strokeWidth="1.2" strokeOpacity="0.8" />
        <circle cx="60" cy="5" r="3" fill={color} />
      </svg>
      {/* Batik Parang Border Line */}
      <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mt-1" />
    </div>

    {/* Bottom Ukiran Jepara Corner Motifs */}
    <div className="flex justify-between items-end pb-1 px-1">
      <svg width="40" height="40" viewBox="0 0 50 50" fill="none" className="opacity-75">
        <path d="M5 45 C5 25, 25 5, 45 5 C25 15, 15 25, 5 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="15" cy="35" r="2.5" fill={color} />
      </svg>
      <div className="text-[9px] font-serif tracking-[0.25em] uppercase font-bold opacity-60" style={{ color }}>
        ❖ PRADA JAWI ❖
      </div>
      <svg width="40" height="40" viewBox="0 0 50 50" fill="none" className="opacity-75 scale-x-[-1]">
        <path d="M5 45 C5 25, 25 5, 45 5 C25 15, 15 25, 5 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="15" cy="35" r="2.5" fill={color} />
      </svg>
    </div>
  </div>
);

/**
 * 2. SUNDA PARAHYANGAN (Megamendung & Daun Bambu Priangan)
 */
export const SundaParahyanganOrnament: React.FC<{ color?: string }> = ({ color = '#3d7a5a' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top Megamendung Cloud Arch */}
    <div className="w-full flex justify-center pt-1">
      <svg width="130" height="38" viewBox="0 0 160 45" fill="none" className="opacity-85">
        {/* Layer 1 Cloud */}
        <path
          d="M10 40 C30 40, 45 20, 65 25 C80 10, 100 15, 115 28 C135 20, 150 40, 150 40"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        {/* Layer 2 Inner Cloud */}
        <path
          d="M25 40 C40 40, 52 28, 68 31 C80 20, 95 24, 108 34 C122 28, 135 40, 135 40"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 2"
          fill="none"
          opacity="0.7"
        />
        {/* Central Floral Bud */}
        <circle cx="80" cy="12" r="3.5" fill={color} />
      </svg>
    </div>

    {/* Bottom Bambu & Melati Rumpun */}
    <div className="flex justify-between items-end px-2 pb-1 opacity-70">
      <svg width="45" height="40" viewBox="0 0 60 50" fill="none">
        <path d="M10 45 Q 20 20, 35 15 Q 25 35, 10 45 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
        <path d="M15 45 Q 35 30, 48 10 Q 38 35, 15 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
      </svg>
      <span className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase opacity-70" style={{ color }}>
        ✿ PARAHYANGAN ✿
      </span>
      <svg width="45" height="40" viewBox="0 0 60 50" fill="none" className="scale-x-[-1]">
        <path d="M10 45 Q 20 20, 35 15 Q 25 35, 10 45 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
        <path d="M15 45 Q 35 30, 48 10 Q 38 35, 15 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
      </svg>
    </div>
  </div>
);

/**
 * 3. MINANG SUNTIANG (Gonjong Rumah Gadang & Mahkota Suntiang)
 */
export const MinangSuntiangOrnament: React.FC<{ color?: string }> = ({ color = '#c92a3e' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top 5 Gonjong Horn Peaks */}
    <div className="w-full flex flex-col items-center pt-1">
      <svg width="140" height="44" viewBox="0 0 160 50" fill="none" className="opacity-90">
        {/* 5 Gonjong Peaks */}
        <path
          d="M10 45 Q 25 5, 40 25 Q 60 0, 80 20 Q 100 0, 120 25 Q 135 5, 150 45"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        {/* Golden Crown Tier */}
        <path d="M30 45 L80 28 L130 45" stroke="#d4af37" strokeWidth="1.5" fill="none" />
        <circle cx="80" cy="18" r="3.5" fill="#d4af37" />
        <circle cx="40" cy="22" r="2.5" fill={color} />
        <circle cx="120" cy="22" r="2.5" fill={color} />
      </svg>
      <div className="w-36 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-0.5" />
    </div>

    {/* Bottom Suntiang Gold Filigree */}
    <div className="flex justify-between items-end px-2 pb-1">
      <svg width="42" height="42" viewBox="0 0 50 50" fill="none" className="opacity-80">
        <path d="M5 45 L25 25 L45 45 Z" fill="#d4af37" fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="25" cy="32" r="2.5" fill="#d4af37" />
      </svg>
      <span className="text-[9px] font-serif font-bold tracking-[0.25em] text-[#d4af37] uppercase">
        ⚜ RANAH MINANG ⚜
      </span>
      <svg width="42" height="42" viewBox="0 0 50 50" fill="none" className="opacity-80 scale-x-[-1]">
        <path d="M5 45 L25 25 L45 45 Z" fill="#d4af37" fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="25" cy="32" r="2.5" fill="#d4af37" />
      </svg>
    </div>
  </div>
);

/**
 * 4. BALI AESTHETIC (Candi Bentar & Bunga Kamboja Frangipani)
 */
export const BaliAestheticOrnament: React.FC<{ color?: string }> = ({ color = '#b87333' }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 z-10 overflow-hidden">
    {/* Top Candi Bentar Split Gate Arch */}
    <div className="w-full flex justify-between items-start pt-1 px-4">
      {/* Left Candi Wing */}
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-85">
        <path d="M5 45 V15 L25 5 V45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M12 45 V20 L25 15" stroke="#d4af37" strokeWidth="1" />
        <circle cx="25" cy="5" r="2.5" fill="#d4af37" />
      </svg>

      {/* Center Frangipani (Bunga Kamboja) */}
      <div className="flex flex-col items-center mt-1">
        <svg width="36" height="36" viewBox="0 0 50 50" fill="none">
          {/* 5 Petals */}
          <circle cx="25" cy="15" r="9" fill="#ffffff" stroke="#e8a598" strokeWidth="1" />
          <circle cx="35" cy="22" r="9" fill="#ffffff" stroke="#e8a598" strokeWidth="1" />
          <circle cx="31" cy="34" r="9" fill="#ffffff" stroke="#e8a598" strokeWidth="1" />
          <circle cx="19" cy="34" r="9" fill="#ffffff" stroke="#e8a598" strokeWidth="1" />
          <circle cx="15" cy="22" r="9" fill="#ffffff" stroke="#e8a598" strokeWidth="1" />
          {/* Yellow Core */}
          <circle cx="25" cy="25" r="6" fill="#fcd34d" />
        </svg>
        <span className="text-[8px] font-serif font-bold tracking-[0.2em] text-[#b87333] uppercase mt-0.5">
          BALI DWIPA
        </span>
      </div>

      {/* Right Candi Wing */}
      <svg width="45" height="45" viewBox="0 0 50 50" fill="none" className="opacity-85 scale-x-[-1]">
        <path d="M5 45 V15 L25 5 V45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M12 45 V20 L25 15" stroke="#d4af37" strokeWidth="1" />
        <circle cx="25" cy="5" r="2.5" fill="#d4af37" />
      </svg>
    </div>

    {/* Bottom Janur Penjor Wave */}
    <div className="w-full flex justify-center pb-1 opacity-75">
      <svg width="120" height="25" viewBox="0 0 140 30" fill="none">
        <path d="M10 25 Q 35 5, 70 20 Q 105 5, 130 25" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="70" cy="20" r="3" fill="#f59e0b" />
      </svg>
    </div>
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
      {archetype === 'jawa_joglo' && <JawaJogloOrnament color={primaryColor} />}
      {archetype === 'sunda_parahyangan' && <SundaParahyanganOrnament color={primaryColor} />}
      {archetype === 'minang_suntiang' && <MinangSuntiangOrnament color={primaryColor} />}
      {archetype === 'bali_aesthetic' && <BaliAestheticOrnament color={primaryColor} />}
      {children}
    </div>
  );
};
