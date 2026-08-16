import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, XCircle, HelpCircle, Heart, User, Users, MessageSquareQuote } from 'lucide-react';
import { InvitationData, WishMessage } from '../types';
import { THEMES } from '../data/presets';

interface RsvpWishesSectionProps {
  data: InvitationData;
  wishes: WishMessage[];
  onAddWish: (newWish: Omit<WishMessage, 'id' | 'createdAt' | 'likes'>) => void;
  defaultGuestName?: string;
}

export const RsvpWishesSection: React.FC<RsvpWishesSectionProps> = ({
  data,
  wishes,
  onAddWish,
  defaultGuestName = '',
}) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

  const [name, setName] = useState(defaultGuestName);
  const [relationship, setRelationship] = useState('Sahabat');
  const [status, setStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
  const [pax, setPax] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    onAddWish({
      senderName: name.trim(),
      relationship,
      status,
      pax: status === 'hadir' ? pax : 0,
      message: message.trim(),
    });

    setSubmitted(true);

    // Confetti celebration if attending
    if (status === 'hadir') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#FCF6BA', '#AA771C', '#2C5E43'],
      });
    }

    // Reset message
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section id="rsvp-section" className="relative px-6 py-12">
      {/* Section Title */}
      <div className="text-center mb-8">
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-amber-800 font-semibold">
          RSVP & GUESTBOOK
        </span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          Will You Attend?
        </h2>
        <p className="mt-1.5 text-xs text-neutral-600">
          Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan acara.
        </p>
        <div className="mx-auto mt-3 h-0.5 w-16 bg-amber-400/80 rounded-full" />
      </div>

      {/* RSVP Form (Image 3 style: clean minimalist border-bottom inputs and high-contrast submit button) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto rounded-3xl border border-amber-200/90 bg-white p-6 shadow-lg mb-10"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* Relationship Tag */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Hubungan / Kategori
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-hidden"
            >
              <option value="Keluarga">Keluarga</option>
              <option value="Sahabat">Sahabat</option>
              <option value="Teman Sekolah / Kuliah">Teman Sekolah / Kuliah</option>
              <option value="Rekan Kerja / Kolega">Rekan Kerja / Kolega</option>
              <option value="Tamu Undangan">Tamu Undangan</option>
            </select>
          </div>

          {/* Attendance Radio Options */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Konfirmasi Kehadiran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-2.5 text-center text-xs transition ${
                  status === 'hadir'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                    : 'border-neutral-200 bg-neutral-50/40 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value="hadir"
                  checked={status === 'hadir'}
                  onChange={() => setStatus('hadir')}
                  className="sr-only"
                />
                <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-[11px]">Ya, Hadir</span>
              </label>

              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-2.5 text-center text-xs transition ${
                  status === 'tidak_hadir'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-400'
                    : 'border-neutral-200 bg-neutral-50/40 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value="tidak_hadir"
                  checked={status === 'tidak_hadir'}
                  onChange={() => setStatus('tidak_hadir')}
                  className="sr-only"
                />
                <XCircle className="w-4 h-4 mb-1 text-rose-500" />
                <span className="text-[11px]">Maaf, Tidak</span>
              </label>

              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-2.5 text-center text-xs transition ${
                  status === 'ragu'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-400'
                    : 'border-neutral-200 bg-neutral-50/40 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value="ragu"
                  checked={status === 'ragu'}
                  onChange={() => setStatus('ragu')}
                  className="sr-only"
                />
                <HelpCircle className="w-4 h-4 mb-1 text-amber-600" />
                <span className="text-[11px]">Masih Ragu</span>
              </label>
            </div>
          </div>

          {/* Number of Pax (if attending) */}
          {status === 'hadir' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-1"
            >
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Jumlah Tamu (Pax)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPax(num)}
                    className={`flex-1 py-2 text-xs rounded-xl border font-semibold transition ${
                      pax === num
                        ? 'border-amber-600 bg-amber-500 text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {num} Orang
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Wishes and Prayers Message */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Ucapan & Doa Restu
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan ucapan dan doa terbaik Anda di sini..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-hidden resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-rsvp-btn"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8C6D37] via-[#C5A059] to-[#8C6D37] py-3 text-xs font-bold text-white shadow-md shadow-amber-900/15 hover:opacity-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim RSVP & Ucapan</span>
          </button>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-medium text-emerald-800 border border-emerald-200"
            >
              Terima kasih! Ucapan dan konfirmasi kehadiran Anda telah terkirim.
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Guestbook Stream Header */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-neutral-900">
              Guestbook & Wishes ({wishes.length})
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500">Live Updated</span>
        </div>

        {/* Wishes List (Matching Image 3: Avatar circle with initials, Name + Attending badge, message text, like button) */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((item) => {
            const hasLiked = likedIds.has(item.id);
            const totalLikes = item.likes + (hasLiked ? 1 : 0);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-200/70 bg-white/95 p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Initials */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-serif font-bold text-sm border border-amber-300 shrink-0">
                      {item.senderName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-sm text-neutral-900">
                          {item.senderName}
                        </span>

                        {/* Attendance Badge */}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            item.status === 'hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'tidak_hadir'
                              ? 'bg-neutral-100 text-neutral-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status === 'hadir'
                            ? `Hadir (${item.pax || 1} Pax)`
                            : item.status === 'tidak_hadir'
                            ? 'Tidak Hadir'
                            : 'Ragu'}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-600 font-light">
                        {item.relationship} • {item.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(item.id)}
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition ${
                      hasLiked ? 'text-rose-600 font-semibold' : 'text-neutral-600 hover:text-neutral-700'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span>{totalLikes}</span>
                  </button>
                </div>

                <p className="mt-2.5 text-xs text-neutral-700 leading-relaxed pl-11">
                  {item.message}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
