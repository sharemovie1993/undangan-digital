import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Heart, Sparkles, Moon, Cake, Star } from 'lucide-react';
import { InvitationData, ProfilePerson } from '../types';
import { THEMES, FONT_PRESETS, FRAME_SHAPES } from '../data/presets';

interface ProfileSectionProps {
  data: InvitationData;
  theme?: any;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ data }) => {
  const isWedding = data.eventType === 'wedding';
  const isKhitan = data.eventType === 'khitanan' || data.eventType === 'aqiqah';
  const isBirthday = data.eventType === 'birthday';
  const activePrimary = data.themeConfig?.primaryColor || THEMES[data.theme]?.primary || '#c4a661';

  // Typography & Frame Shape from themeConfig
  const fontPreset = data.themeConfig?.fontPairingId ? FONT_PRESETS[data.themeConfig.fontPairingId] : null;
  const headingFontFamily = fontPreset?.headingFamily || (isWedding ? "'Cinzel', serif" : isKhitan ? "'Amiri', serif" : isBirthday ? "'Poppins', sans-serif" : "'Playfair Display', serif");

  const frameShapeKey = data.themeConfig?.frameShape;
  const frameClass = frameShapeKey
    ? FRAME_SHAPES[frameShapeKey]?.className || 'arch-frame'
    : (isBirthday ? 'rounded-full' : isKhitan ? 'rounded-t-[100px] rounded-b-2xl' : 'arch-frame');

  return (
    <section id="profile-section" className="relative px-6 py-12 text-center overflow-hidden">
      {/* Decorative Islamic Calligraphy or Event Header */}
      {isKhitan && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <div
            className="inline-flex items-center justify-center p-2 rounded-full mb-2"
            style={{ backgroundColor: `${activePrimary}15`, color: activePrimary }}
          >
            <Moon className="w-5 h-5" />
          </div>
          <p className="font-arabic text-2xl md:text-3xl font-medium tracking-wide" style={{ color: activePrimary }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </motion.div>
      )}

      {isBirthday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border"
            style={{ backgroundColor: `${activePrimary}15`, color: activePrimary, borderColor: `${activePrimary}40` }}
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Special Birthday Celebration</span>
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        </motion.div>
      )}

      {isWedding && data.openingQuoteArabic && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <p className="font-arabic text-2xl md:text-3xl font-medium tracking-wide" style={{ color: activePrimary }}>
            {data.openingQuoteArabic}
          </p>
        </motion.div>
      )}

      {/* Quote / Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-md mx-auto mb-10 px-4"
      >
        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
          {data.openingQuoteText || 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.'}
        </p>
        {data.openingQuoteSource && (
          <p className="text-[11px] uppercase tracking-widest font-semibold mt-2" style={{ color: activePrimary }}>
            — {data.openingQuoteSource}
          </p>
        )}
      </motion.div>

      {/* Profile Cards */}
      <div className="flex flex-col items-center justify-center gap-10 max-w-md mx-auto">
        {data.profiles?.map((person: ProfilePerson, index: number) => (
          <React.Fragment key={person.name + index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="flex flex-col items-center max-w-xs"
            >
              {/* Dynamic Frame Shape */}
              <div className="relative group">
                <div
                  className={`absolute -inset-1.5 ${frameClass} opacity-60 blur-xs group-hover:opacity-90 transition-opacity`}
                  style={{
                    background: `linear-gradient(135deg, ${activePrimary}, #ffffff 50%, ${activePrimary})`
                  }}
                />

                <div
                  className={`relative ${
                    frameClass.includes('rounded-full') ? 'w-48 h-48' : 'w-52 h-72'
                  } ${frameClass} border-2 shadow-xl overflow-hidden bg-neutral-900`}
                  style={{ borderColor: `${activePrimary}90` }}
                >
                  <img
                    src={person.photoUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80'}
                    alt={person.fullName || person.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </div>

              {/* Names and Details with Custom Typography */}
              <div className="mt-5 space-y-1.5">
                <span
                  className="text-[10px] tracking-[0.25em] font-semibold uppercase px-3 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${activePrimary}15`,
                    borderColor: `${activePrimary}40`,
                    color: activePrimary
                  }}
                >
                  {person.role || (isWedding ? (index === 0 ? 'Mempelai Pria' : 'Mempelai Wanita') : 'Profil Yang Berhajat')}
                </span>

                <h3
                  className="text-2xl font-bold text-white mt-1 transition-all"
                  style={{ fontFamily: headingFontFamily }}
                >
                  {person.name || person.fullName}
                </h3>

                <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-[260px] mx-auto">
                  {person.bio ? (
                    person.bio
                  ) : person.fatherName && person.motherName ? (
                    <>
                      Putra/Putri dari <br />
                      <strong className="text-neutral-200 font-medium">{person.fatherName}</strong> &{' '}
                      <strong className="text-neutral-200 font-medium">{person.motherName}</strong>
                    </>
                  ) : (
                    'Putra/Putri tercinta'
                  )}
                </p>

                {person.instagram && (
                  <a
                    href={`https://instagram.com/${person.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] hover:underline mt-2 transition"
                    style={{ color: activePrimary }}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{person.instagram.replace('@', '')}</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Wedding Ampersand Divider */}
            {isWedding && index === 0 && data.profiles.length > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="my-2 flex items-center justify-center w-11 h-11 rounded-full border shadow-md"
                style={{
                  backgroundColor: `${activePrimary}20`,
                  borderColor: `${activePrimary}50`,
                  color: activePrimary,
                  fontFamily: headingFontFamily
                }}
              >
                <span className="text-xl font-bold italic">&</span>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
