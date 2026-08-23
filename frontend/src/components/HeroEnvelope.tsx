import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, ChevronDown, Calendar, MapPin, Heart, Moon, Star } from 'lucide-react';
import { InvitationData, ThemeToken } from '../types';
import { themeRegistry } from '../themes/registry';
import { WaxSealStamp } from './effects/WaxSealStamp';
import { AmbientParticleCanvas } from './effects/AmbientParticleCanvas';
import { CornerOrnaments } from './effects/CornerOrnaments';
import { FONT_PRESETS } from '../data/presets';

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

  // Typography Font Preset
  const fontPreset = data.themeConfig?.fontPairingId ? FONT_PRESETS[data.themeConfig.fontPairingId] : null;
  const headingFontFamily = fontPreset?.headingFamily || "'Cinzel', 'Playfair Display', serif";

  // 1. Deteksi Jenis Acara Cerdas (dari eventType atau analisis kata kunci di Judul)
  const rawTitle = data.eventTitle || (data as any).title || '';
  const isKhitanDetected =
    data.eventType === 'khitanan' ||
    /khitan/i.test(rawTitle) ||
    /khitan/i.test(data.tagline || '');

  const isAqiqahDetected =
    data.eventType === 'aqiqah' ||
    /aqiqah/i.test(rawTitle) ||
    /aqiqah/i.test(data.tagline || '');

  const isBirthdayDetected =
    data.eventType === 'birthday' ||
    /birthday|ulang tahun/i.test(rawTitle) ||
    /birthday|ulang tahun/i.test(data.tagline || '');

  const isWedding = !isKhitanDetected && !isAqiqahDetected && !isBirthdayDetected;

  // 2. Tagline Cerdas (Cegah muncul 'THE WEDDING OF' pada acara Khitanan / Aqiqah / Ultah)
  const effectiveTagline = (() => {
    if (isKhitanDetected) {
      if (!data.tagline || data.tagline.trim().toUpperCase() === 'THE WEDDING OF') {
        return 'WALIMATUL KHITAN';
      }
      return data.tagline;
    }
    if (isAqiqahDetected) {
      if (!data.tagline || data.tagline.trim().toUpperCase() === 'THE WEDDING OF') {
        return 'TASYAKURAN AQIQAH';
      }
      return data.tagline;
    }
    if (isBirthdayDetected) {
      if (!data.tagline || data.tagline.trim().toUpperCase() === 'THE WEDDING OF') {
        return 'HAPPY BIRTHDAY';
      }
      return data.tagline;
    }
    return data.tagline || 'THE WEDDING OF';
  })();

  // 3. Rekonstruksi Judul Undangan Lengkap (Cegah nama terpotong "M.")
  const effectiveTitle = (() => {
    if (isKhitanDetected) {
      const childName = data.profiles?.[0]?.fullName?.trim() || data.profiles?.[0]?.name?.trim();
      if (childName && (!rawTitle || /walimatul khitan\s+[a-z]\.?$/i.test(rawTitle.trim()) || rawTitle.trim().toLowerCase() === 'walimatul khitan')) {
        return `Walimatul Khitan ${childName}`;
      }
      return rawTitle || (childName ? `Walimatul Khitan ${childName}` : 'Walimatul Khitan');
    }
    if (isAqiqahDetected) {
      const childName = data.profiles?.[0]?.fullName?.trim() || data.profiles?.[0]?.name?.trim();
      if (childName && (!rawTitle || /tasyakuran aqiqah\s+[a-z]\.?$/i.test(rawTitle.trim()) || rawTitle.trim().toLowerCase() === 'tasyakuran aqiqah')) {
        return `Tasyakuran Aqiqah ${childName}`;
      }
      return rawTitle || (childName ? `Tasyakuran Aqiqah ${childName}` : 'Tasyakuran Aqiqah');
    }
    if (isBirthdayDetected) {
      const name = data.profiles?.[0]?.fullName?.trim() || data.profiles?.[0]?.name?.trim();
      if (name && (!rawTitle || rawTitle.trim().toLowerCase() === 'birthday')) {
        return `Ulang Tahun ${name}`;
      }
      return rawTitle || (name ? `Ulang Tahun ${name}` : 'Birthday Celebration');
    }
    // Wedding
    const p1 = data.profiles?.[0]?.fullName?.trim() || data.profiles?.[0]?.name?.trim();
    const p2 = data.profiles?.[1]?.fullName?.trim() || data.profiles?.[1]?.name?.trim();
    if (p1 && p2 && (!rawTitle || !rawTitle.includes('&'))) {
      return `${p1} & ${p2}`;
    }
    return rawTitle || 'Romeo & Juliet';
  })();

  // 4. Monogram Segel Lilin Cerdas
  const monogram = (() => {
    if (isWedding) {
      const p1 = data.profiles?.[0]?.name?.trim()?.[0] || effectiveTitle?.split('&')[0]?.trim()?.[0] || 'R';
      const p2 = data.profiles?.[1]?.name?.trim()?.[0] || effectiveTitle?.split('&')[1]?.trim()?.[0] || 'J';
      return `${p1.toUpperCase()} & ${p2.toUpperCase()}`;
    }
    // Anak / Yang berulang tahun
    const rawName = data.profiles?.[0]?.fullName?.trim() || data.profiles?.[0]?.name?.trim() || effectiveTitle?.replace(/^(Walimatul Khitan|Tasyakuran Aqiqah|Syukuran|Ulang Tahun)\s*/i, '').trim() || '';
    if (rawName) {
      const words = rawName.split(/\s+/).filter(Boolean);
      if (words.length > 1 && (words[0].length <= 2 || words[0].endsWith('.'))) {
        return words[1][0].toUpperCase();
      }
      return words[0][0].toUpperCase();
    }
    return isKhitanDetected ? 'K' : isAqiqahDetected ? 'A' : 'B';
  })();

  // 5. Corner Ornament Type Aware
  const cornerOrnamentType =
    data.themeConfig?.cornerOrnament ||
    (theme.category === 'traditional'
      ? 'batik_prada'
      : theme.category === 'royal'
      ? 'royal_crown'
      : theme.category === 'islamic'
      ? 'javanese_flourish'
      : theme.category === 'modern'
      ? 'art_deco'
      : 'royal_crown');

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

          {/* Luxury Card Frame (100% Theme & Corner Ornament Aware) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm rounded-3xl border p-7 sm:p-8 shadow-2xl backdrop-blur-md text-[#e2e2e7] overflow-hidden"
            style={{
              backgroundColor: `${theme.cardBg}F5`,
              borderColor: `${activePrimary}50`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${activePrimary}20`
            }}
          >
            {/* 4 Luxury Corner Ornaments on Envelope Card */}
            <CornerOrnaments type={cornerOrnamentType} primaryColor={activePrimary} />

            {/* Top 3D Monogram Wax Seal */}
            <div className="mx-auto -mt-15 mb-4 flex items-center justify-center relative z-20">
              <WaxSealStamp monogram={monogram} colorId={waxColor} onClick={onOpen} />
            </div>

            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
              {isKhitanDetected || isAqiqahDetected ? (
                <Moon className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              ) : isBirthdayDetected ? (
                <Star className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              ) : (
                <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              )}
              <span className="font-display text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: activePrimary }}>
                {effectiveTagline}
              </span>
              {isKhitanDetected || isAqiqahDetected ? (
                <Moon className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              ) : isBirthdayDetected ? (
                <Star className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              ) : (
                <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              )}
            </div>

            {/* Event Title */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight relative z-10"
              style={{ fontFamily: headingFontFamily, color: theme.textMain }}
            >
              {effectiveTitle}
            </h1>

            {/* Guest Envelope Recipient Card (with inner corner filigree & theme border) */}
            <div
              className="rounded-2xl p-4 mb-6 border relative overflow-hidden z-10 shadow-md"
              style={{
                backgroundColor: theme.accentBg,
                borderColor: `${activePrimary}35`,
              }}
            >
              <CornerOrnaments type={cornerOrnamentType} primaryColor={activePrimary} />

              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ color: theme.textMuted }}>
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </p>
              <h2 className="text-lg font-bold tracking-wide" style={{ fontFamily: headingFontFamily, color: theme.textMain }}>
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
              className={`w-full py-3.5 px-6 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg relative z-10 ${theme.button}`}
              style={{
                backgroundColor: activePrimary,
                color: theme.mode === 'light' ? '#ffffff' : '#0a0a0b',
                boxShadow: `0 8px 25px ${activePrimary}40`,
              }}
            >
              <Mail className="w-4 h-4" />
              <span>Buka Undangan</span>
            </motion.button>

            {/* Trial Watermark Badge */}
            {data.isWatermarked !== false && !data.licenseKey && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-neutral-400 relative z-10">
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
