import React from 'react';
import { motion } from 'motion/react';
import { WaxSealColorId } from '../../types';

interface WaxSealStampProps {
  monogram?: string;
  colorId?: WaxSealColorId;
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

const WAX_COLORS: Record<WaxSealColorId, { base: string; light: string; dark: string; shadow: string }> = {
  maroon: {
    base: '#7f1d1d',
    light: '#b91c1c',
    dark: '#450a0a',
    shadow: 'rgba(127, 29, 29, 0.6)',
  },
  gold: {
    base: '#b45309',
    light: '#f59e0b',
    dark: '#78350f',
    shadow: 'rgba(217, 119, 6, 0.6)',
  },
  sage: {
    base: '#1e3a2f',
    light: '#366050',
    dark: '#0f2019',
    shadow: 'rgba(30, 58, 47, 0.6)',
  },
  navy: {
    base: '#1e293b',
    light: '#334155',
    dark: '#0f172a',
    shadow: 'rgba(30, 41, 59, 0.6)',
  },
  rose: {
    base: '#831843',
    light: '#be185d',
    dark: '#500724',
    shadow: 'rgba(131, 24, 67, 0.6)',
  },
};

export const WaxSealStamp: React.FC<WaxSealStampProps> = ({
  monogram = 'V & A',
  colorId = 'gold',
  isOpen = false,
  onClick,
  className = '',
}) => {
  const palette = WAX_COLORS[colorId] || WAX_COLORS.gold;

  // Extract initials (e.g. "V & A" -> "V&A")
  const initials = monogram.length > 5 ? monogram.split('&').map(s => s.trim()[0]).filter(Boolean).join('&') : monogram;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center cursor-pointer select-none group ${className}`} onClick={onClick}>
      {/* Silk Ribbon Tails Behind Seal */}
      <div className="absolute -bottom-6 flex items-center gap-2 pointer-events-none transition-transform duration-500 group-hover:translate-y-0.5">
        <div
          className="w-4 h-8 rotate-12 origin-top shadow-md"
          style={{
            background: `linear-gradient(to bottom, ${palette.dark}, ${palette.base})`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
          }}
        />
        <div
          className="w-4 h-8 -rotate-12 origin-top shadow-md"
          style={{
            background: `linear-gradient(to bottom, ${palette.dark}, ${palette.base})`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
          }}
        />
      </div>

      {/* 3D Realistic Wax Seal Ring */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center z-10"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${palette.light} 0%, ${palette.base} 65%, ${palette.dark} 100%)`,
          boxShadow: `0 8px 20px ${palette.shadow}, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Outer Irregular Wax Drip Rim */}
        <div
          className="absolute inset-0.5 rounded-full border border-black/25 opacity-80 pointer-events-none"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
          }}
        />

        {/* Inner Stamp Recessed Well */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center border border-black/30 text-amber-100 font-serif font-bold text-[11px] tracking-tighter"
          style={{
            background: `radial-gradient(circle at 60% 60%, ${palette.light} 0%, ${palette.base} 70%, ${palette.dark} 100%)`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.2)',
            textShadow: '0 -1px 1px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4)',
          }}
        >
          {initials}
        </div>
      </motion.div>
    </div>
  );
};
