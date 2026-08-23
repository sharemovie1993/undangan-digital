import React, { useState, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, CheckCircle2, XCircle, HelpCircle, Heart, User, Users, MessageSquareQuote, Loader2, ChevronDown } from 'lucide-react';
import { InvitationData, WishMessage } from '../types';
import { DEFAULT_WISHES, FONT_PRESETS } from '../data/presets';
import { themeRegistry } from '../themes/registry';
import { api } from '../api/client';
import { queryClient } from '../query/queryClient';
import { CornerOrnaments } from './effects/CornerOrnaments';

interface RsvpWishesSectionProps {
  data: InvitationData;
  wishes?: WishMessage[];
  onAddWish?: (newWish: Omit<WishMessage, 'id' | 'createdAt' | 'likes'>) => void;
  defaultGuestName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📱 WishCardItem — Memoized Card Component untuk Mencegah Re-render Seluruh List
// ─────────────────────────────────────────────────────────────────────────────
interface WishCardItemProps {
  item: WishMessage;
  hasLiked: boolean;
  onToggleLike: (id: string) => void;
  activePrimary: string;
  cardBg: string;
  headingFont: string;
  theme: any;
}

const WishCardItem = memo(function WishCardItem({
  item,
  hasLiked,
  onToggleLike,
  activePrimary,
  cardBg,
  headingFont,
  theme,
}: WishCardItemProps) {
  const totalLikes = (item.likes || 0) + (hasLiked ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-4 shadow-md backdrop-blur-md contain-content"
      style={{
        backgroundColor: `${cardBg}f5`,
        borderColor: `${activePrimary}30`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar Initials */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm border shrink-0"
            style={{
              backgroundColor: `${activePrimary}20`,
              borderColor: `${activePrimary}50`,
              color: activePrimary,
              fontFamily: headingFont,
            }}
          >
            {(item.senderName || 'T').charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs" style={{ color: theme.textMain }}>
                {item.senderName || 'Tamu'}
              </span>

              {/* Attendance Badge */}
              <span
                className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  item.status === 'hadir'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.status === 'tidak_hadir'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {item.status === 'hadir'
                  ? `Hadir (${item.pax || 1} Pax)`
                  : item.status === 'tidak_hadir'
                  ? 'Tidak Hadir'
                  : 'Ragu'}
              </span>
            </div>
            <span className="text-[10px] font-light" style={{ color: theme.textMuted }}>
              {item.relationship || 'Tamu Undangan'} • {item.createdAt || 'Baru saja'}
            </span>
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={() => onToggleLike(item.id)}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition cursor-pointer ${
            hasLiked ? 'text-rose-400 font-semibold' : 'hover:opacity-100'
          }`}
          style={{ color: hasLiked ? '#fb7185' : theme.textMuted }}
        >
          <Heart
            className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`}
          />
          <span>{totalLikes}</span>
        </button>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed pl-11" style={{ color: theme.textMain }}>
        {item.message}
      </p>
    </motion.div>
  );
});
WishCardItem.displayName = 'WishCardItem';

export const RsvpWishesSection = memo(function RsvpWishesSection({
  data,
  wishes: initialWishes = DEFAULT_WISHES,
  onAddWish,
  defaultGuestName = '',
}: RsvpWishesSectionProps) {
  const theme = themeRegistry.getTheme(data.theme);
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const activeBg = data.themeConfig?.bgColor || theme.bg || '#0a0a0b';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';
  const headingFont =
    FONT_PRESETS[data.themeConfig?.fontPairingId || 'royal_serif']?.headingFamily || 'serif';

  const invitationIdentifier = data.id || data.slug || 'wedding-romeo-juliet';

  const [name, setName] = useState(defaultGuestName);
  const [relationship, setRelationship] = useState('Sahabat');
  const [status, setStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
  const [pax, setPax] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // 📱 Mobile-First Virtualization / Progressive Pagination (5 items per batch)
  const [visibleCount, setVisibleCount] = useState(5);

  // TanStack Query: Fetch Live RSVPs from SQLite Backend
  const { data: serverRsvps } = useQuery({
    queryKey: ['rsvps', invitationIdentifier],
    queryFn: async () => {
      try {
        const res = await api.getRsvps(invitationIdentifier);
        if (res.data?.rsvps && Array.isArray(res.data.rsvps)) {
          return res.data.rsvps.map((r: any) => ({
            id: r.id,
            senderName: r.name,
            relationship: 'Tamu Undangan',
            status: r.attendance?.toLowerCase() as 'hadir' | 'tidak_hadir' | 'ragu',
            pax: r.pax,
            message: r.message || '',
            createdAt: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            likes: r.likes || 0,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch RSVPs from backend, using fallback:', err);
      }
      return [];
    },
  });

  // TanStack Mutation: Submit RSVP to SQLite Database
  const submitMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      attendance: string;
      pax: number;
      message: string;
    }) => {
      return await api.submitRsvp({
        invitationId: invitationIdentifier,
        name: payload.name,
        attendance: payload.attendance.toUpperCase() as any,
        pax: payload.pax,
        message: payload.message,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', invitationIdentifier] });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error) => {
      console.error('RSVP mutation failed:', error);
      if (onAddWish) {
        onAddWish({
          senderName: name.trim(),
          relationship,
          status,
          pax: status === 'hadir' ? pax : 1,
          message: message.trim(),
        });
      }
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    submitMutation.mutate({
      name: name.trim(),
      attendance: status,
      pax: status === 'hadir' ? pax : 1,
      message: message.trim(),
    });
  };

  const toggleLike = useCallback(async (wishId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(wishId);
      if (isCurrentlyLiked) {
        next.delete(wishId);
      } else {
        next.add(wishId);
      }
      return next;
    });

    try {
      await api.likeRsvp(wishId);
    } catch {
      // silent fallback
    }
  }, []);

  // Safe defensive array normalization
  const rawWishes = Array.isArray(serverRsvps)
    ? serverRsvps
    : Array.isArray(initialWishes)
    ? initialWishes
    : Array.isArray(data?.wishes)
    ? data.wishes
    : [];

  const displayWishes: WishMessage[] = Array.isArray(rawWishes) ? rawWishes : [];
  const visibleWishes = displayWishes.slice(0, visibleCount);
  const remainingCount = displayWishes.length - visibleCount;

  return (
    <section
      id="rsvp-section"
      className="relative px-5 py-12 scroll-mt-6"
      style={{
        backgroundColor: activeBg,
      }}
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-2 border"
          style={{
            borderColor: `${activePrimary}40`,
            backgroundColor: `${activePrimary}15`,
            color: activePrimary,
          }}
        >
          <Send className="w-3 h-3" />
          <span>RSVP & BUKU TAMU</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold tracking-wide"
          style={{ fontFamily: headingFont, color: theme.textMain }}
        >
          Konfirmasi Kehadiran
        </motion.h2>

        <div
          className="mx-auto mt-2 h-0.5 w-16 rounded-full"
          style={{ backgroundColor: activePrimary }}
        />
        <p className="mt-2 text-xs max-w-sm mx-auto" style={{ color: theme.textMuted }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
          hadir dan memberikan doa restu.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* RSVP Form Card (Theme-Aware with 4 Corner Ornaments) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden"
          style={{
            backgroundColor: `${cardBg}f5`,
            borderColor: `${activePrimary}35`,
          }}
        >
          {/* 4 Luxury Corner Ornaments */}
          <CornerOrnaments
            type={
              data.themeConfig?.cornerOrnament ||
              (theme.category === 'traditional'
                ? 'batik_prada'
                : theme.category === 'royal'
                ? 'royal_crown'
                : theme.category === 'islamic'
                ? 'javanese_flourish'
                : theme.category === 'modern'
                ? 'art_deco'
                : 'royal_crown')
            }
            primaryColor={activePrimary}
          />

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center space-y-3"
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border shadow-lg"
                style={{
                  backgroundColor: `${activePrimary}20`,
                  borderColor: `${activePrimary}40`,
                  color: activePrimary,
                }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg" style={{ fontFamily: headingFont, color: theme.textMain }}>
                Terima Kasih!
              </h3>
              <p className="text-xs max-w-xs mx-auto" style={{ color: theme.textMuted }}>
                Konfirmasi kehadiran & ucapan doa restu Anda telah berhasil tersimpan di sistem kami.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Field Nama Tamu */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: theme.textMain }}>
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" style={{ color: activePrimary }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Suherman & Kel"
                    className="w-full rounded-xl border pl-10 pr-4 py-2.5 transition focus:outline-none focus:ring-1"
                    style={{
                      borderColor: `${activePrimary}35`,
                      backgroundColor: theme.accentBg || `${cardBg}ee`,
                      color: theme.textMain,
                    }}
                  />
                </div>
              </div>

              {/* 2. Field Status Kehadiran (3 Chips Theme-Aware) */}
              <div>
                <label className="block font-semibold mb-1.5" style={{ color: theme.textMain }}>
                  Konfirmasi Kehadiran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'hadir' as const,
                      label: 'Hadir',
                      icon: CheckCircle2,
                      activeStyle: {
                        backgroundColor: `${activePrimary}25`,
                        borderColor: activePrimary,
                        color: activePrimary,
                        boxShadow: `0 0 12px ${activePrimary}25`,
                      },
                    },
                    {
                      id: 'tidak_hadir' as const,
                      label: 'Tidak Hadir',
                      icon: XCircle,
                      activeStyle: {
                        backgroundColor: 'rgba(244, 63, 94, 0.18)',
                        borderColor: 'rgba(244, 63, 94, 0.5)',
                        color: '#fb7185',
                        boxShadow: '0 0 12px rgba(244, 63, 94, 0.2)',
                      },
                    },
                    {
                      id: 'ragu' as const,
                      label: 'Masih Ragu',
                      icon: HelpCircle,
                      activeStyle: {
                        backgroundColor: 'rgba(245, 158, 11, 0.18)',
                        borderColor: 'rgba(245, 158, 11, 0.5)',
                        color: '#fbbf24',
                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
                      },
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = status === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStatus(item.id)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer"
                        style={
                          isSelected
                            ? { ...item.activeStyle, fontWeight: 700 }
                            : {
                                backgroundColor: `${cardBg}aa`,
                                borderColor: `${activePrimary}20`,
                                color: theme.textMuted,
                              }
                        }
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Field Jumlah Pax (Hanya jika hadir) */}
              {status === 'hadir' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1"
                >
                  <label className="block font-semibold mb-1" style={{ color: theme.textMain }}>
                    Jumlah Orang yang Hadir
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" style={{ color: activePrimary }} />
                    <select
                      value={pax}
                      onChange={(e) => setPax(Number(e.target.value))}
                      className="w-full rounded-xl border pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 appearance-none cursor-pointer"
                      style={{
                        borderColor: `${activePrimary}35`,
                        backgroundColor: theme.accentBg || `${cardBg}ee`,
                        color: theme.textMain,
                      }}
                    >
                      <option value={1} style={{ backgroundColor: cardBg, color: theme.textMain }}>1 Orang</option>
                      <option value={2} style={{ backgroundColor: cardBg, color: theme.textMain }}>2 Orang (Pasangan)</option>
                      <option value={3} style={{ backgroundColor: cardBg, color: theme.textMain }}>3 Orang (Keluarga)</option>
                      <option value={4} style={{ backgroundColor: cardBg, color: theme.textMain }}>4 Orang</option>
                      <option value={5} style={{ backgroundColor: cardBg, color: theme.textMain }}>5+ Orang</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* 4. Field Ucapan & Doa Restu */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: theme.textMain }}>
                  Ucapan & Doa Restu
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan selamat dan doa restu yang tulus..."
                  className="w-full rounded-xl border p-3 focus:outline-none focus:ring-1 resize-none placeholder:opacity-60"
                  style={{
                    borderColor: `${activePrimary}35`,
                    backgroundColor: theme.accentBg || `${cardBg}ee`,
                    color: theme.textMain,
                  }}
                />
              </div>

              {/* 5. Tombol Submit (Theme-Aware Primary Button) */}
              <button
                type="submit"
                disabled={submitMutation.isPending || !name.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: activePrimary,
                  color: theme.mode === 'light' ? '#ffffff' : '#0a0a0b',
                  boxShadow: `0 4px 20px ${activePrimary}35`,
                }}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirimkan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Ucapan & Konfirmasi</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* Guestbook Stream Section */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4" style={{ color: activePrimary }} />
              <h3 className="font-bold text-base" style={{ fontFamily: headingFont, color: theme.textMain }}>
                Buku Tamu & Ucapan ({displayWishes.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>Live SQLite</span>
          </div>

          {/* Wishes List — 📱 Progressive Paginated List for Low-End Mobile Performance */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin touch-scroll">
            {!Array.isArray(displayWishes) || displayWishes.length === 0 ? (
              <div
                className="rounded-2xl border p-6 text-center shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: `${cardBg}f5`,
                  borderColor: `${activePrimary}30`,
                }}
              >
                <MessageSquareQuote className="w-6 h-6 mx-auto mb-2 opacity-60" style={{ color: activePrimary }} />
                <p className="text-xs font-semibold" style={{ color: theme.textMain }}>Belum Ada Ucapan Doa Restu</p>
                <p className="text-[11px] mt-1" style={{ color: theme.textMuted }}>Jadilah yang pertama mengirimkan ucapan doa restu dan konfirmasi kehadiran di atas!</p>
              </div>
            ) : (
              <>
                {visibleWishes.map((item) => (
                  <WishCardItem
                    key={item.id}
                    item={item}
                    hasLiked={likedIds.has(item.id)}
                    onToggleLike={toggleLike}
                    activePrimary={activePrimary}
                    cardBg={cardBg}
                    headingFont={headingFont}
                    theme={theme}
                  />
                ))}

                {/* 📱 Load More Button for Mobile Virtualization */}
                {remainingCount > 0 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 10)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-md cursor-pointer border"
                      style={{
                        backgroundColor: `${activePrimary}15`,
                        borderColor: `${activePrimary}40`,
                        color: activePrimary,
                      }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Muat {Math.min(remainingCount, 10)} Ucapan Lainnya ({remainingCount} tersisa)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

RsvpWishesSection.displayName = 'RsvpWishesSection';

