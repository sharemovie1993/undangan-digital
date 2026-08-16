import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  SlidersHorizontal,
  Printer,
  Share2,
  Heart,
  Calendar,
  Volume2,
  VolumeX,
  Eye,
  Check,
  Music,
} from 'lucide-react';
import {
  InvitationData,
  EventType,
  ThemeToken,
  GuestRecipient,
  WishMessage,
} from './types';
import {
  DEFAULT_WEDDING_DATA,
  DEFAULT_KHITANAN_DATA,
  DEFAULT_AQIQAH_DATA,
  DEFAULT_BIRTHDAY_DATA,
  DEFAULT_GUESTS,
  DEFAULT_WISHES,
  THEMES,
} from './data/presets';
import { HeroEnvelope } from './components/HeroEnvelope';
import { ProfileSection } from './components/ProfileSection';
import { CountdownSchedule } from './components/CountdownSchedule';
import { GallerySection } from './components/GallerySection';
import { DigitalGiftSection } from './components/DigitalGiftSection';
import { RsvpWishesSection } from './components/RsvpWishesSection';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { BottomNavigation } from './components/BottomNavigation';
import { PrintStudio } from './components/PrintStudio';
import { StudioEditor } from './components/StudioEditor';

export default function App() {
  // Application View Mode: 'invitation' (Guest Mobile View), 'studio' (Management Studio), 'print' (Print Studio)
  const [viewMode, setViewMode] = useState<'invitation' | 'studio' | 'print'>('invitation');

  // Main Invitation State
  const [invitationData, setInvitationData] = useState<InvitationData>(DEFAULT_WEDDING_DATA);
  const [guests, setGuests] = useState<GuestRecipient[]>(DEFAULT_GUESTS);
  const [wishes, setWishes] = useState<WishMessage[]>(DEFAULT_WISHES);

  // Guest envelope opening state
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [guestName, setGuestName] = useState('Bapak Joko & Istri');

  // Initialize from URL parameters if provided (e.g. ?to=Nama+Tamu&mode=studio&theme=emerald_sage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    const modeParam = params.get('mode');
    const eventParam = params.get('event');
    const themeParam = params.get('theme');

    if (toParam) {
      setGuestName(toParam);
    }
    if (modeParam === 'studio') {
      setViewMode('studio');
    } else if (modeParam === 'print') {
      setViewMode('print');
    }

    if (eventParam) {
      if (eventParam === 'khitanan') setInvitationData(DEFAULT_KHITANAN_DATA);
      else if (eventParam === 'aqiqah') setInvitationData(DEFAULT_AQIQAH_DATA);
      else if (eventParam === 'birthday') setInvitationData(DEFAULT_BIRTHDAY_DATA);
      else setInvitationData(DEFAULT_WEDDING_DATA);
    }

    if (themeParam && THEMES[themeParam as ThemeToken]) {
      setInvitationData((prev) => ({ ...prev, theme: themeParam as ThemeToken }));
    }
  }, []);

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
  };

  const handleAddWish = (newWish: Omit<WishMessage, 'id' | 'createdAt' | 'likes'>) => {
    const created: WishMessage = {
      ...newWish,
      id: `w-${Date.now()}`,
      createdAt: 'Baru saja',
      likes: 0,
    };
    setWishes([created, ...wishes]);
  };

  const currentTheme = THEMES[invitationData.theme] || THEMES.champagne_gold;

  // Render Print Studio
  if (viewMode === 'print') {
    return (
      <PrintStudio
        data={invitationData}
        guests={guests}
        onBack={() => setViewMode('studio')}
      />
    );
  }

  // Render Studio Editor
  if (viewMode === 'studio') {
    return (
      <StudioEditor
        data={invitationData}
        onUpdateData={setInvitationData}
        guests={guests}
        onUpdateGuests={setGuests}
        wishes={wishes}
        onOpenPrintStudio={() => setViewMode('print')}
        onViewGuestMode={(customName) => {
          if (customName) setGuestName(customName);
          setViewMode('invitation');
          setIsEnvelopeOpen(false);
        }}
      />
    );
  }

  // GUEST INVITATION VIEW (Mobile-First 430px Centered Layout)
  return (
    <div
      id="invitation-app-root"
      className="min-h-screen w-full bg-[#0a0a0b] flex flex-col items-center justify-start overflow-x-hidden font-sans text-[#e2e2e7] selection:bg-[#c4a661] selection:text-neutral-950"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(196, 166, 97, 0.12) 0%, transparent 65%), radial-gradient(circle at center, #1a1a24 0%, #0a0a0b 100%)`,
      }}
    >
      {/* Top Floating Control Bar for easy demo switching */}
      <div className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-[#1f1f27] bg-[#111115]/90 px-4 py-1.5 shadow-2xl backdrop-blur-md text-xs text-[#e2e2e7]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c4a661] animate-pulse" />
          <span className="font-serif font-bold tracking-wide text-[#c4a661]">
            {invitationData.eventTitle}
          </span>
        </div>
        <div className="h-3 w-px bg-[#1f1f27]" />
        <button
          onClick={() => setViewMode('studio')}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 hover:text-[#c4a661] transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Editor Studio</span>
        </button>
        <div className="h-3 w-px bg-[#1f1f27]" />
        <button
          onClick={() => setViewMode('print')}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 hover:text-[#c4a661] transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Studio</span>
        </button>
      </div>

      {/* 430px Centered Mobile Canvas Frame (Images 1, 2, 3) */}
      <div
        className="relative w-full max-w-[430px] min-h-screen bg-[#0a0a0b] border-x border-[#1f1f27] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden text-[#e2e2e7] transition-colors duration-500 pb-28"
        style={{
          backgroundColor: currentTheme.bg,
        }}
      >
        {/* Envelope Opening Screen Overlay */}
        <HeroEnvelope
          data={invitationData}
          guestName={guestName}
          isOpen={isEnvelopeOpen}
          onOpen={handleOpenEnvelope}
        />

        {/* Top Cover Hero Banner */}
        <section className="relative px-6 pt-16 pb-8 text-center overflow-hidden">
          {/* Subtle floral/golden ornament background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%23d4af37' fill-opacity='0.2'/%3E%3C/svg%3E")`,
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-[10px] tracking-[0.3em] uppercase text-[#c4a661] font-semibold"
          >
            {invitationData.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-3xl md:text-4xl font-normal text-[#d4af37] mt-2 mb-2 tracking-wide"
          >
            {invitationData.eventTitle}
          </motion.h1>

          <div className="flex items-center justify-center gap-3 my-3">
            <div className="h-px w-10 bg-[#c4a661]/40" />
            <Heart className="w-3.5 h-3.5 text-[#c4a661] fill-[#c4a661]" />
            <div className="h-px w-10 bg-[#c4a661]/40" />
          </div>

          <p className="font-display text-xs tracking-widest text-gray-400 font-medium uppercase">
            SABTU, 24 OKTOBER 2026
          </p>
        </section>

        {/* Profile Section (Arched photos & couples) */}
        {invitationData.enabledBlocks.profile && (
          <ProfileSection data={invitationData} />
        )}

        {/* Live Countdown & Event Sessions (Akad & Resepsi) */}
        {(invitationData.enabledBlocks.countdown || invitationData.enabledBlocks.schedule) && (
          <CountdownSchedule data={invitationData} />
        )}

        {/* Photo Gallery & Lightbox */}
        {invitationData.enabledBlocks.gallery && (
          <GallerySection data={invitationData} />
        )}

        {/* Digital Gift Bank & QRIS with 1-click Salin No. Rekening */}
        {invitationData.enabledBlocks.gift && (
          <DigitalGiftSection data={invitationData} />
        )}

        {/* Live RSVP Form & Guestbook Feed */}
        {invitationData.enabledBlocks.rsvp && (
          <RsvpWishesSection
            data={invitationData}
            wishes={wishes}
            onAddWish={handleAddWish}
            defaultGuestName={guestName}
          />
        )}

        {/* Footer with Blessing */}
        <footer className="px-6 py-10 text-center border-t border-[#1f1f27] mt-8 bg-[#111115]">
          <p className="font-serif text-lg font-bold text-[#c4a661] mb-1">
            {invitationData.eventTitle}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian.
          </p>
          <div className="mt-4 font-display text-[9px] tracking-[0.25em] text-[#c4a661]/80 uppercase font-semibold">
            LUXURY DIGITAL INVITATION
          </div>
        </footer>

        {/* Floating Spinning Vinyl Disc Music Player */}
        <FloatingMusicPlayer data={invitationData} />

        {/* Floating Bottom Glass Navigation Pill */}
        <BottomNavigation data={invitationData} />
      </div>
    </div>
  );
}
