import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';
import { InvitationData } from '../types';
import { THEMES, FONT_PRESETS } from '../data/presets';

interface CountdownScheduleProps {
  data: InvitationData;
}

// Helper to format ISO date (2026-09-02) to standard Indonesian invitation format (e.g. "Rabu, 2 September 2026")
const formatIndonesianDate = (dateString?: string) => {
  if (!dateString) return 'Tanggal Acara';
  if (
    dateString.includes('Minggu') ||
    dateString.includes('Senin') ||
    dateString.includes('Selasa') ||
    dateString.includes('Rabu') ||
    dateString.includes('Kamis') ||
    dateString.includes('Jumat') ||
    dateString.includes('Sabtu')
  ) {
    return dateString;
  }
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
  } catch {}
  return dateString;
};

// Helper to ensure standard Indonesian Timezone suffix
const formatStandardTime = (timeStr?: string) => {
  if (!timeStr) return '08:00 - Selesai WIB';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('WIB') || trimmed.toUpperCase().includes('WITA') || trimmed.toUpperCase().includes('WIT')) {
    return trimmed;
  }
  return `${trimmed} WIB`;
};

export const CountdownSchedule: React.FC<CountdownScheduleProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const activeBg = data.themeConfig?.bgColor || theme.bg || '#0a0a0b';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';
  const headingFont =
    FONT_PRESETS[data.themeConfig?.fontPairingId || 'royal_serif']?.headingFamily || 'serif';

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 1. Extract target date and start time dynamically from data.events[0] or fallback
    const primaryEvent = data.events?.[0];
    const rawDate = primaryEvent?.date || data.sessions?.[0]?.date || data.eventDate || '2026-10-24';
    const rawTime = primaryEvent?.time || (data.sessions?.[0]?.startTime ? `${data.sessions[0].startTime}` : '08:00');

    // Extract start time HH:mm
    const timeMatch = rawTime.match(/(\d{1,2})[:.](\d{2})/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 8;
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    let targetTime = 0;
    if (typeof rawDate === 'string' && rawDate.includes('-')) {
      const [year, month, day] = rawDate.split('-').map(Number);
      targetTime = new Date(year, month - 1, day, hours, minutes, 0).getTime();
    } else {
      const parsed = new Date(rawDate).getTime();
      if (!isNaN(parsed)) {
        targetTime = parsed;
      } else {
        targetTime = new Date().getTime() + 86400000 * 30;
      }
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.events, data.sessions, data.eventDate]);

  const activeSessions = data.events && data.events.length > 0 ? data.events : data.sessions || [];

  return (
    <section
      id="schedule-section"
      className="relative px-5 py-12"
      style={{
        backgroundColor: activeBg,
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ color: activePrimary }}
        >
          EVENT SCHEDULE
        </span>
        <h2
          className="text-2xl sm:text-3xl font-bold mt-1 text-white"
          style={{ fontFamily: headingFont }}
        >
          {data.eventType === 'wedding'
            ? 'Waktu & Tempat Acara'
            : data.eventType === 'khitanan'
            ? 'Jadwal Walimatul Khitan'
            : data.eventType === 'aqiqah'
            ? 'Jadwal Tasyakuran Aqiqah'
            : 'Jadwal Perayaan Ulang Tahun'}
        </h2>
        <div
          className="mx-auto mt-2 h-0.5 w-16 rounded-full"
          style={{ backgroundColor: activePrimary }}
        />
      </div>

      {/* Dynamic Live Countdown Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-4 gap-2 max-w-xs sm:max-w-sm mx-auto mb-10"
      >
        {[
          { label: 'Hari', value: timeLeft.days },
          { label: 'Jam', value: timeLeft.hours },
          { label: 'Menit', value: timeLeft.minutes },
          { label: 'Detik', value: timeLeft.seconds },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: `${cardBg}e6`,
              borderColor: `${activePrimary}40`,
            }}
          >
            <span
              className="text-2xl sm:text-3xl font-bold text-white font-mono"
              style={{ color: activePrimary }}
            >
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Session Cards (Fluid 100% width on phone frames) */}
      <div className="space-y-4 max-w-md mx-auto">
        {activeSessions.map((item: any, index: number) => {
          // Smart default title if item.title is empty or redundant "Sesi 1"
          const isGenericTitle = !item.title || /^sesi\s*\d+$/i.test(item.title.trim());
          let resolvedTitle = item.title;
          if (isGenericTitle) {
            if (data.eventType === 'wedding') {
              resolvedTitle = index === 0 ? 'Akad Nikah' : index === 1 ? 'Resepsi Pernikahan' : `Sesi ${index + 1}: Ramah Tamah`;
            } else if (data.eventType === 'khitanan') {
              resolvedTitle = index === 0 ? 'Tasyakuran & Walimah Khitan' : `Sesi ${index + 1}: Ramah Tamah`;
            } else if (data.eventType === 'aqiqah') {
              resolvedTitle = index === 0 ? 'Tasyakuran & Aqiqah' : `Sesi ${index + 1}: Ramah Tamah`;
            } else if (data.eventType === 'birthday') {
              resolvedTitle = index === 0 ? 'Pesta Perayaan Ulang Tahun' : `Sesi ${index + 1}: After Party`;
            } else {
              resolvedTitle = index === 0 ? 'Acara Utama' : `Sesi ${index + 1}`;
            }
          }

          const badgeText = activeSessions.length === 1 ? 'ACARA UTAMA' : `SESI 0${index + 1}`;
          const formattedDate = formatIndonesianDate(item.date || item.dateStr);
          const formattedTime = formatStandardTime(
            item.time || (item.startTime ? `${item.startTime} - ${item.endTime || 'Selesai'} ${item.timeZone || ''}` : undefined)
          );
          const venue = item.venueName || item.venue || 'Lokasi Acara';
          const address = item.address || item.venueAddress || '';
          const mapsLink = item.googleMapsUrl || item.mapsUrl || item.mapUrl;
          const notes = item.notes;

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: `${cardBg}f5`,
                borderColor: `${activePrimary}35`,
              }}
            >
              {/* Top decorative ambient glow */}
              <div
                className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: activePrimary }}
              />

              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-[10px] tracking-widest uppercase font-bold"
                    style={{ color: activePrimary }}
                  >
                    {badgeText}
                  </span>
                  <h3
                    className="text-xl font-bold text-white mt-0.5"
                    style={{ fontFamily: headingFont }}
                  >
                    {resolvedTitle}
                  </h3>
                </div>
                <div
                  className="p-2.5 rounded-2xl border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${activePrimary}15`,
                    borderColor: `${activePrimary}30`,
                    color: activePrimary,
                  }}
                >
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Event Details */}
              <div className="mt-4 space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon
                    className="w-4 h-4 shrink-0"
                    style={{ color: activePrimary }}
                  />
                  <span className="font-semibold text-white">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock
                    className="w-4 h-4 shrink-0"
                    style={{ color: activePrimary }}
                  />
                  <span className="font-mono">{formattedTime}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: activePrimary }}
                  />
                  <div>
                    <p className="font-semibold text-white">{venue}</p>
                    {address && (
                      <p className="text-neutral-400 text-[11px] leading-relaxed mt-0.5">
                        {address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {notes && (
                <div
                  className="mt-3.5 rounded-xl p-2.5 text-[11px] leading-relaxed italic border"
                  style={{
                    backgroundColor: `${activePrimary}10`,
                    borderColor: `${activePrimary}25`,
                    color: '#e2e2e7',
                  }}
                >
                  {notes}
                </div>
              )}

              {/* Google Maps Button */}
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                  style={{
                    backgroundColor: activePrimary,
                    color: '#0a0a0b',
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Petunjuk Arah Google Maps</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
