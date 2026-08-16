import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Heart, Sparkles } from 'lucide-react';
import { InvitationData, ProfilePerson } from '../types';
import { THEMES } from '../data/presets';

interface ProfileSectionProps {
  data: InvitationData;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const isWedding = data.eventType === 'wedding';

  return (
    <section id="profile-section" className="relative px-6 py-12 text-center overflow-hidden">
      {/* Decorative Islamic Calligraphy or Header */}
      {data.openingQuoteArabic && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <p className="font-arabic text-2xl md:text-3xl text-amber-700/90 font-medium tracking-wide">
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
        <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-light">
          {data.openingQuoteText}
        </p>
        {data.openingQuoteSource && (
          <p className="text-[11px] font-display uppercase tracking-widest text-amber-800 font-semibold mt-2">
            — {data.openingQuoteSource}
          </p>
        )}
      </motion.div>

      {/* Profile Cards */}
      <div className="flex flex-col items-center gap-10">
        {data.profiles.map((person: ProfilePerson, index: number) => (
          <React.Fragment key={person.name + index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="flex flex-col items-center max-w-xs"
            >
              {/* Arch Frame Photo */}
              <div className="relative group">
                {/* Gold Glow & Border Rim */}
                <div className="absolute -inset-1.5 arch-frame bg-gradient-to-b from-amber-400 via-amber-200 to-amber-600 opacity-60 blur-xs group-hover:opacity-90 transition-opacity" />
                <div className="relative w-52 h-72 arch-frame border-2 border-amber-300/80 bg-neutral-100 shadow-xl overflow-hidden">
                  <img
                    src={person.photoUrl}
                    alt={person.fullName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Names and Details */}
              <div className="mt-5 space-y-1.5">
                <span className="font-display text-[10px] tracking-[0.25em] text-amber-800 font-semibold uppercase bg-amber-100/70 px-3 py-0.5 rounded-full border border-amber-200">
                  {person.role}
                </span>

                <h3 className="font-serif text-2xl font-bold text-neutral-900 mt-1">
                  {person.fullName}
                </h3>

                <p className="text-xs text-neutral-600 font-light leading-relaxed max-w-[260px] mx-auto">
                  {person.fatherName && person.motherName ? (
                    <>
                      Putra/Putri dari <br />
                      <strong className="text-neutral-800 font-medium">{person.fatherName}</strong> &{' '}
                      <strong className="text-neutral-800 font-medium">{person.motherName}</strong>
                    </>
                  ) : (
                    person.bio
                  )}
                </p>

                {person.instagram && (
                  <a
                    href={`https://instagram.com/${person.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 transition-colors mt-2"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{person.instagram}</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Connecting Ampersand for Wedding */}
            {isWedding && index === 0 && data.profiles.length > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="my-1 flex items-center justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-700 font-serif text-2xl italic shadow-md">
                  &
                </div>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
