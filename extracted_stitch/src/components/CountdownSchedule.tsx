import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink, Download, Sparkles } from 'lucide-react';
import { InvitationData, EventSession } from '../types';
import { THEMES } from '../data/presets';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface CountdownScheduleProps {
  data: InvitationData;
}

export const CountdownSchedule: React.FC<CountdownScheduleProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(data.eventDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

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
  }, [data.eventDate]);

  return (
    <section id="schedule-section" className="relative px-6 py-12 bg-gradient-to-b from-transparent via-amber-50/50 to-transparent">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-amber-800 font-semibold">
          EVENT SCHEDULE
        </span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          Join Our Celebration
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-16 bg-amber-400/80 rounded-full" />
      </div>

      {/* Countdown Grid (matching Image 3) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto mb-10"
      >
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-white/90 p-3 shadow-md backdrop-blur-xs"
          >
            <span className="font-serif text-2xl md:text-3xl font-bold text-amber-900">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="font-display text-[9px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Session Cards */}
      <div className="space-y-6 max-w-md mx-auto">
        {data.sessions.map((session: EventSession, index: number) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-white p-6 shadow-lg"
          >
            {/* Top decorative subtle curve */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-amber-100/60 blur-xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <span className="font-display text-[10px] tracking-widest text-amber-800 uppercase font-semibold">
                  Session 0{index + 1}
                </span>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 mt-0.5">
                  {session.title}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2.5 text-xs text-neutral-700">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-medium text-neutral-900">{session.date}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {session.startTime} - {session.endTime} {session.timeZone}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">{session.venueName}</p>
                  <p className="text-neutral-500 text-[11px] leading-relaxed mt-0.5">
                    {session.venueAddress}
                  </p>
                </div>
              </div>
            </div>

            {session.notes && (
              <div className="mt-3 rounded-xl bg-amber-50/60 p-2.5 text-[11px] text-amber-900 border border-amber-200/60 leading-relaxed italic">
                {session.notes}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <a
                href={createGoogleCalendarUrl(session, data.eventTitle)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-2 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
              </a>

              <a
                href={session.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-white shadow-xs transition hover:bg-neutral-800"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Peta</span>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
