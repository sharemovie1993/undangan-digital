import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, ChevronDown, Calendar, MapPin, Heart } from 'lucide-react';
import { InvitationData, ThemeToken } from '../types';
import { THEMES } from '../data/presets';

interface HeroEnvelopeProps {
  data: InvitationData;
  guestName: string;
  isOpen: boolean;
  onOpen: () => void;
}

export const HeroEnvelope: React.FC<HeroEnvelopeProps> = ({
  data,
  guestName,
  isOpen,
  onOpen,
}) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.div
          id="hero-envelope-screen"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#15120E] p-4 text-center overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 30%, rgba(197, 160, 89, 0.15) 0%, rgba(15, 12, 9, 0.95) 100%), url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[6px]" />

          {/* Luxury Card Frame */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm rounded-3xl border border-[#c4a661]/30 bg-[#111115]/95 p-8 shadow-2xl backdrop-blur-md text-[#e2e2e7]"
          >
            {/* Top Monogram Seal */}
            <div className="mx-auto -mt-14 mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#c4a661] bg-gradient-to-tr from-amber-700 via-[#c4a661] to-amber-200 shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-900/30 bg-[#111115] text-[#c4a661] shadow-inner">
                <span className="font-serif text-xl font-bold tracking-widest">
                  {data.eventType === 'wedding'
                    ? `${data.profiles[0]?.name.charAt(0)}&${data.profiles[1]?.name.charAt(0) || 'J'}`
                    : data.profiles[0]?.name.charAt(0) || '★'}
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-[10px] tracking-[0.25em] text-[#c4a661] uppercase font-semibold">
              {data.tagline}
            </p>

            {/* Event Main Title */}
            <h1 className="font-serif text-3xl md:text-4xl text-[#d4af37] mt-2 mb-4 font-normal tracking-wide">
              {data.eventTitle}
            </h1>

            {/* Delicate Divider */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-px w-12 bg-[#c4a661]/40" />
              <Heart className="w-3.5 h-3.5 text-[#c4a661] fill-[#c4a661]" />
              <div className="h-px w-12 bg-[#c4a661]/40" />
            </div>

            {/* Personalized Guest Badge */}
            <div className="my-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xs">
              <p className="text-[10px] tracking-wider text-gray-400 uppercase font-medium">
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </p>
              <h2 className="font-serif text-lg font-bold text-white mt-1 mb-1 capitalize">
                {guestName || 'Tamu Undangan'}
              </h2>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                Tanpa Mengurangi Rasa Hormat, Kami Mengundang Anda Untuk Hadir Di Acara Kami.
              </p>
            </div>

            {/* Open Invitation Button */}
            <motion.button
              id="open-invitation-btn"
              onClick={onOpen}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#B38728] via-[#C5A059] to-[#8C6D37] px-6 py-3.5 font-medium text-black font-bold shadow-lg shadow-amber-900/25 transition-all cursor-pointer"
            >
              <Mail className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 text-black" />
              <span className="font-sans text-xs tracking-wider uppercase font-bold text-black">
                Buka Undangan
              </span>
              <Sparkles className="h-3.5 h-3.5 text-black animate-pulse" />
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
