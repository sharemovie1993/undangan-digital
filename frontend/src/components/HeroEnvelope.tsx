import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, ChevronDown, Calendar, MapPin, Heart } from 'lucide-react';
import { InvitationData, ThemeToken } from '../types';
import { themeRegistry } from '../themes/registry';

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
            {/* Top Monogram Seal */}
            <div
              className="mx-auto -mt-14 mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-xl"
              style={{
                borderColor: activePrimary,
                background: `linear-gradient(135deg, ${activePrimary}, #fff2c6 50%, ${activePrimary})`
              }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-inner"
                style={{ backgroundColor: theme.cardBg, color: activePrimary }}
              >
                <span className="font-serif text-xl font-bold tracking-widest">
                  {data.eventType === 'wedding'
                    ? (data.eventTitle?.split('&')[0]?.trim()?.[0] || 'R') + '&' + (data.eventTitle?.split('&')[1]?.trim()?.[0] || 'J')
                    : 'L'}
                </span>
              </div>
            </div>

            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
              <span className="font-display text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: activePrimary }}>
                {data.tagline || 'THE WEDDING OF'}
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: activePrimary }} />
            </div>

            {/* Event Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: theme.textMain }}>
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
