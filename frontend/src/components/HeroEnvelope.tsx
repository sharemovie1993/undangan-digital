import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, ChevronDown, Calendar, MapPin, Heart } from 'lucide-react';
import { InvitationData, ThemeToken } from '../types';
import { themeRegistry } from '../themes/registry';
import { WaxSealStamp } from './effects/WaxSealStamp';
import { AmbientParticleCanvas } from './effects/AmbientParticleCanvas';

interface HeroEnvelopeProps {
  data: InvitationData;
  guestName?: string;
  recipientName?: string;
  theme?: ThemeToken | any;
  isOpen: boolean;
  onOpen: () => void;
}

export const HeroEnvelope: React.FC<HeroEnvelopeProps> = ({
  data,
  guestName,
  recipientName,
  isOpen,
  onOpen,
}) => {
  const theme = themeRegistry.getTheme(data.theme);
  const activePrimary = data.themeConfig?.primaryColor || theme.primary;
  const effectiveGuest = guestName || recipientName || 'Tamu Undangan';
  const particleEffect = data.themeConfig?.particleEffect || (theme.mode === 'dark' ? 'gold_dust' : 'none');
  const waxColor = data.themeConfig?.waxSealColor || (theme.category === 'royal' ? 'gold' : theme.category === 'traditional' ? 'maroon' : 'sage');

  const defaultTagline =
    data.eventType === 'khitanan'
      ? 'WALIMATUL KHITAN'
      : data.eventType === 'aqiqah'
      ? 'TASYAKURAN AQIQAH'
      : data.eventType === 'birthday'
      ? 'HAPPY BIRTHDAY'
      : 'THE WEDDING OF';

  const effectiveTagline = data.tagline || defaultTagline;

  const monogram = (() => {
    if (data.eventType === 'wedding') {
      const p1 = data.profiles?.[0]?.name?.trim()?.[0] || data.eventTitle?.split('&')[0]?.trim()?.[0] || 'R';
      const p2 = data.profiles?.[1]?.name?.trim()?.[0] || data.eventTitle?.split('&')[1]?.trim()?.[0] || 'J';
      return `${p1.toUpperCase()} & ${p2.toUpperCase()}`;
    }
    // Anak / Yang berulang tahun
    const rawName = data.profiles?.[0]?.name?.trim() || data.eventTitle?.replace(/^(Walimatul Khitan|Tasyakuran Aqiqah|Syukuran|Ulang Tahun)\s*/i, '').trim() || '';
    if (rawName) {
      const words = rawName.split(/\s+/).filter(Boolean);
      // Jika kata pertama adalah singkatan "M." atau "M", ambil kata kedua
      if (words.length > 1 && (words[0].length <= 2 || words[0].endsWith('.'))) {
        return words[1][0].toUpperCase();
      }
      return words[0][0].toUpperCase();
    }
    return 'L';
  })();

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.div
          id="hero-envelope-screen"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 text-center overflow-hidden"
          style={{
            backgroundColor: theme.bg,
            backgroundImage: `radial-gradient(circle at 50% 30%, ${activePrimary}25 0%, ${theme.bg} 100%), url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Ambient Particle System */}
          <AmbientParticleCanvas effect={particleEffect} primaryColor={activePrimary} isDark={theme.mode !== 'light'} />

          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px]" />

          {/* Luxury Card Frame */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm rounded-3xl border p-8 shadow-2xl backdrop-blur-md text-[#e2e2e7]"
            style={{
              backgroundColor: `${theme.cardBg}F5`,
              borderColor: `${activePrimary}50`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${activePrimary}20`
            }}
          >
            {/* Top 3D Monogram Wax Seal */}
            <div className="mx-auto -mt-16 mb-4 flex items-center justify-center">
              <WaxSealStamp monogram={monogram} colorId={waxColor} onClick={onOpen} />
            </div>

            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              <span className="font-display text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: activePrimary }}>
                {effectiveTagline}
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
            </div>

            {/* Event Title */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" style={{ color: theme.textMain }}>
              {data.eventTitle}
            </h1>

            {/* Guest Envelope Recipient Card */}
            <div
              className="rounded-2xl p-4 mb-8 border"
              style={{ backgroundColor: theme.accentBg, borderColor: `${activePrimary}30` }}
            >
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: theme.textMuted }}>
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </p>
              <h2 className="font-serif text-lg font-bold tracking-wide" style={{ color: theme.textMain }}>
                {effectiveGuest}
              </h2>
              <p className="text-[9px] mt-1 italic opacity-70" style={{ color: theme.textMuted }}>
                *Mohon maaf apabila ada kesalahan penulisan nama/gelar
              </p>
            </div>

            {/* Open Invitation Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpen}
              className={`w-full py-3.5 px-6 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${theme.button}`}
            >
              <Mail className="w-4 h-4" />
              <span>Buka Undangan</span>
            </motion.button>

            {/* Trial Watermark Badge */}
            {data.isWatermarked !== false && !data.licenseKey && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <span className="text-[#c4a661] font-semibold">✨ Versi Percobaan (Free Trial)</span>
                <span>•</span>
                <span className="text-neutral-300">LuxeInvite Studio</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
