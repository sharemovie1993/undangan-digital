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
import { api } from './api/client';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Code-Splitting / Lazy Loading for Heavy Studio & Dashboard Engines
const PrintStudio = React.lazy(() =>
  import('./components/PrintStudio').then((m) => ({ default: m.PrintStudio }))
);
const StudioEditor = React.lazy(() =>
  import('./components/StudioEditor').then((m) => ({ default: m.StudioEditor }))
);
const MyInvitationsDashboard = React.lazy(() =>
  import('./components/MyInvitationsDashboard').then((m) => ({ default: m.MyInvitationsDashboard }))
);

const StudioFallback = () => (
  <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-[#e2e2e7] gap-3">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-serif font-bold text-lg animate-pulse shadow-xl">
      L
    </div>
    <div className="text-xs text-neutral-400 font-medium flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#c4a661] animate-ping" />
      <span>Memuat LuxeInvite Studio...</span>
    </div>
  </div>
);

export default function App() {
  // Application View Mode: 'dashboard' (Multi-Invitation Dashboard), 'studio' (Studio Editor), 'print' (Print Studio), 'invitation' (Guest View)
  const [viewMode, setViewMode] = useState<'dashboard' | 'studio' | 'print' | 'invitation'>('studio');

  // Auth Guard: cek apakah user sudah login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('absenta_auth_token');
  });

  // Listen perubahan localStorage (cross-tab logout, dll)
  useEffect(() => {
    const handleStorageChange = () => {
      const hasToken = !!localStorage.getItem('absenta_auth_token');
      setIsAuthenticated(hasToken);
      // Jika logout terjadi saat di studio/print, redirect ke dashboard
      if (!hasToken && (viewMode === 'studio' || viewMode === 'print')) {
        setViewMode('dashboard');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [viewMode]);

  // Guard: jika tidak terautentikasi dan mencoba akses studio/print → ke dashboard
  useEffect(() => {
    if (!isAuthenticated && (viewMode === 'studio' || viewMode === 'print')) {
      setViewMode('dashboard');
    }
  }, [isAuthenticated, viewMode]);

  // Main Invitation State
  const [invitationData, setInvitationData] = useState<InvitationData>(DEFAULT_WEDDING_DATA);
  const [guests, setGuests] = useState<GuestRecipient[]>([]);
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
    } else if (modeParam === 'dashboard') {
      setViewMode('dashboard');
    } else if (modeParam === 'invitation' || toParam) {
      setViewMode('invitation');
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

    // Sync Initial Invitation & Guest List from SQLite Backend
    const syncFromBackend = async () => {
      try {
        const querySlugOrId = params.get('slug') || params.get('id');
        const targetIdentifier = querySlugOrId || localStorage.getItem('absenta_active_invitation_id');
        let res: any;

        if (targetIdentifier) {
          try {
            res = await api.getInvitationBySlug(targetIdentifier);
          } catch {
            res = await api.getInvitationById(targetIdentifier);
          }
        } else {
          // Dynamic fetch of first available project from database
          const listRes = await api.listInvitations();
          if (listRes.data && listRes.data.length > 0) {
            const firstInv = listRes.data[0];
            res = await api.getInvitationById(firstInv.id);
          } else {
            res = await api.getInvitationBySlug('undangan-utama');
          }
        }

        if (res?.data) {
          const inv = res.data;
          const evData = inv.eventData || {};
          let parsedThemeConfig = inv.themeConfig;
          if (typeof parsedThemeConfig === 'string') {
            try { parsedThemeConfig = JSON.parse(parsedThemeConfig); } catch {}
          }
          let parsedStitchBlocks = inv.stitchBlocks;
          if (typeof parsedStitchBlocks === 'string') {
            try { parsedStitchBlocks = JSON.parse(parsedStitchBlocks); } catch {}
          }

          setInvitationData((prev) => ({
            ...prev,
            ...evData,
            id: inv.id,
            slug: inv.slug,
            eventTitle: inv.title,
            eventType: inv.eventType?.toLowerCase() || prev.eventType,
            theme: inv.themeId || prev.theme,
            themeConfig: parsedThemeConfig || evData.themeConfig || prev.themeConfig,
            enabledBlocks: evData.enabledBlocks || prev.enabledBlocks,
            stitchBlocks: Array.isArray(parsedStitchBlocks) ? parsedStitchBlocks : (evData.stitchBlocks || prev.stitchBlocks),
            isWatermarked: inv.isWatermark,
            licenseKey: inv.licenseKey,
            planId: inv.planId
          }));

          localStorage.setItem('absenta_active_invitation_id', inv.id);

          // Fetch Live Guests from SQLite
          const guestRes = await api.getGuests(inv.id);
          if (Array.isArray(guestRes.data?.guests)) {
            setGuests(
              guestRes.data.guests.map((g: any) => ({
                id: g.id,
                name: g.name,
                addressOrCity: g.address || '',
                group: g.category || 'Sahabat',
                paxQuota: g.pax || 2,
                hasOpened: false,
                isCheckedIn: g.isCheckedIn,
                qrCode: g.qrCode
              }))
            );
          } else if (Array.isArray(evData.guestList)) {
            setGuests(evData.guestList);
          } else {
            setGuests([]);
          }
        }
      } catch (err) {
        console.warn('[Initial API Sync Notice] Using fallback defaults:', err);
      }
    };

    syncFromBackend();
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

  const renderContent = () => {
    // MULTI-INVITATION DASHBOARD VIEW
    if (viewMode === 'dashboard') {
      return (
        <React.Suspense fallback={<StudioFallback />}>
          <MyInvitationsDashboard
            onSelectInvitation={async (inv) => {
            if (inv.eventData) {
              localStorage.setItem('absenta_active_invitation_id', inv.id);
              setInvitationData({
                ...DEFAULT_WEDDING_DATA,
                ...inv.eventData,
                id: inv.id,
                slug: inv.slug,
                eventTitle: inv.title,
                eventType: inv.eventType?.toLowerCase() || 'wedding',
                theme: inv.themeId || inv.eventData?.theme || 'champagne_gold',
                themeConfig: inv.themeConfig || inv.eventData?.themeConfig,
                enabledBlocks: inv.eventData?.enabledBlocks || DEFAULT_WEDDING_DATA.enabledBlocks,
                stitchBlocks: inv.stitchBlocks || inv.eventData?.stitchBlocks,
                isWatermarked: inv.isWatermark,
                licenseKey: inv.licenseKey,
                planId: inv.planId
              });

              // Fetch tamu langsung dari tabel Guest (ter-isolasi per invitationId)
              try {
                const guestRes = await api.getGuests(inv.id);
                if (Array.isArray(guestRes.data?.guests) && guestRes.data.guests.length > 0) {
                  setGuests(guestRes.data.guests.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    addressOrCity: g.address || '',
                    group: g.category || 'Umum',
                    paxCount: g.pax || 1,
                    hasOpened: false,
                    isCheckedIn: g.isCheckedIn,
                    qrCode: g.qrCode
                  })));
                } else if (inv.eventData.guestList && Array.isArray(inv.eventData.guestList)) {
                  // Fallback: pakai eventData.guestList jika Guest table kosong
                  setGuests(inv.eventData.guestList);
                } else {
                  setGuests([]);
                }
              } catch {
                // Fallback jika API gagal
                if (inv.eventData.guestList && Array.isArray(inv.eventData.guestList)) {
                  setGuests(inv.eventData.guestList);
                } else {
                  setGuests([]);
                }
              }
            }
            setViewMode('studio');
          }}
          onOpenPrintStudio={(inv) => {
            if (inv.eventData) {
              setInvitationData({
                ...DEFAULT_WEDDING_DATA,
                ...inv.eventData,
                id: inv.id,
                slug: inv.slug,
                eventTitle: inv.title,
                eventType: inv.eventType?.toLowerCase() || 'wedding',
                theme: inv.themeId || 'champagne_gold'
              });
            }
            setViewMode('print');
          }}
          onViewGuestMode={(gName, slug) => {
            if (gName) setGuestName(gName);
            if (slug) {
              window.history.replaceState(null, '', `?slug=${slug}&mode=invitation`);
            }
            setViewMode('invitation');
            setIsEnvelopeOpen(false);
          }}
          onLogout={() => {
            setIsAuthenticated(false);
            // Auth guard useEffect akan otomatis redirect ke 'dashboard'
          }}
        />
      </React.Suspense>
    );
  }

  // PRINT STUDIO VIEW
  if (viewMode === 'print') {
    return (
      <React.Suspense fallback={<StudioFallback />}>
        <PrintStudio
          data={invitationData}
          guests={guests}
          onBackToStudio={() => setViewMode('studio')}
        />
      </React.Suspense>
    );
  }

  // STUDIO MANAGEMENT EDITOR VIEW
  if (viewMode === 'studio') {
    return (
      <React.Suspense fallback={<StudioFallback />}>
        <StudioEditor
          data={invitationData}
          onUpdateData={setInvitationData}
          guests={guests}
          onUpdateGuests={setGuests}
          wishes={wishes}
          onOpenPrintStudio={() => setViewMode('print')}
          onOpenDashboard={() => setViewMode('dashboard')}
          onViewGuestMode={(gName) => {
            if (gName) setGuestName(gName);
            setViewMode('invitation');
            setIsEnvelopeOpen(false);
          }}
        />
      </React.Suspense>
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

        {/* Top Watermark Floating Badge for Trial Mode */}
        {invitationData.isWatermarked !== false && !invitationData.licenseKey && (
          <div className="bg-[#111115]/95 border-b border-[#c4a661]/35 py-2 px-4 text-center flex items-center justify-between text-[11px] text-neutral-200 sticky top-0 z-40 backdrop-blur-md shadow-lg">
            <span className="font-semibold flex items-center gap-1.5 text-[#c4a661]">
              <span>✨</span>
              <span>Versi Percobaan (Watermark Aktif)</span>
            </span>
            <a
              href={`/?slug=${encodeURIComponent(invitationData.slug || '')}&mode=studio`}
              className="text-[10px] font-bold bg-[#c4a661] text-neutral-950 px-3 py-1 rounded-full hover:bg-[#d5b874] transition shadow"
            >
              Hapus Watermark
            </a>
          </div>
        )}

        {/* Top Cover Hero Banner */}
        <section className="relative px-6 pt-12 pb-8 text-center overflow-hidden">
          {/* Subtle floral/golden ornament background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%23d4af37' fill-opacity='0.2'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Trial Watermark Badge Pill */}
          {invitationData.isWatermarked !== false && !invitationData.licenseKey && (
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#c4a661]/15 border border-[#c4a661]/30 text-[#c4a661] text-[9px] font-bold uppercase tracking-widest mb-3">
              <span>✨ LUXEINVITE FREE TRIAL PREVIEW</span>
            </div>
          )}

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
        {invitationData.enabledBlocks?.profile && (
          <ProfileSection data={invitationData} />
        )}

        {/* Live Countdown & Event Sessions (Akad & Resepsi) */}
        {(invitationData.enabledBlocks?.countdown || invitationData.enabledBlocks?.schedule) && (
          <CountdownSchedule data={invitationData} />
        )}

        {/* Photo Gallery & Lightbox */}
        {invitationData.enabledBlocks?.gallery && (
          <GallerySection data={invitationData} />
        )}

        {/* Digital Gift Bank & QRIS with 1-click Salin No. Rekening */}
        {invitationData.enabledBlocks?.gift && (
          <DigitalGiftSection data={invitationData} />
        )}

        {/* Live RSVP Form & Guestbook Feed */}
        {invitationData.enabledBlocks?.rsvp && (
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

        {/* Watermark Banner for Trial / Draft Invitations */}
        {invitationData.isWatermarked !== false && !invitationData.licenseKey && (
          <div className="sticky bottom-0 z-30 bg-[#111115]/95 backdrop-blur-md border-t border-[#c4a661]/30 py-2.5 px-4 text-center text-xs text-neutral-300 flex flex-col sm:flex-row items-center justify-center gap-2 shadow-2xl">
            <span className="font-serif text-[#c4a661] font-bold">✨ Versi Percobaan</span>
            <span className="text-[11px] text-neutral-400">• Dibuat dengan LuxeInvite Studio</span>
            <a
              href={`/?slug=${encodeURIComponent(invitationData.slug || '')}&mode=studio`}
              className="text-[10px] font-bold text-neutral-950 bg-[#c4a661] hover:bg-[#d5b874] px-3 py-1 rounded-full transition shadow"
            >
              Hapus Watermark
            </a>
          </div>
        )}

        {/* Floating Spinning Vinyl Disc Music Player */}
        <FloatingMusicPlayer data={invitationData} position="fixed" />

        {/* Floating Bottom Glass Navigation Pill */}
        <BottomNavigation data={invitationData} />
      </div>
    </div>
    );
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        {renderContent()}
      </ConfirmProvider>
    </ToastProvider>
  );
}
