import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { InvitationData, EventType, ThemeToken, GuestRecipient, WishMessage } from '../types';
import {
  DEFAULT_WEDDING_DATA,
  DEFAULT_KHITANAN_DATA,
  DEFAULT_AQIQAH_DATA,
  DEFAULT_BIRTHDAY_DATA,
} from '../data/presets';
import { PricingModal } from './PricingModal';
import { ActiveLicenseModal } from './ActiveLicenseModal';
import { ReceptionScannerModal } from './ReceptionScannerModal';
import { api } from '../api/client';
import { CoupleProfileForm } from './forms/CoupleProfileForm';
import { EventScheduleForm } from './forms/EventScheduleForm';
import { BankGiftForm } from './forms/BankGiftForm';
import { GalleryMediaForm } from './forms/GalleryMediaForm';
import { MusicSelectorForm } from './forms/MusicSelectorForm';

// Modular Studio Subcomponents
import { StudioHeader } from './studio/StudioHeader';
import { ThemingSidebar } from './studio/ThemingSidebar';
import { CanvasViewport } from './studio/CanvasViewport';
import { BlockManagerPanel } from './studio/BlockManagerPanel';
import { GuestListManager } from './studio/GuestListManager';
import { AnalyticsPanel } from './studio/AnalyticsPanel';
import { BulkGuestImportModal } from './studio/BulkGuestImportModal';
import { MobileBottomNav } from './studio/MobileBottomNav';
import { StyleKitGalleryModal } from './studio/StyleKitGalleryModal';
import { MasterStyleKit, THEMES } from '../data/presets';
import { themeRegistry } from '../themes/registry';
import { generateSlug } from '../utils/slug';
import { useRealtimeThemes } from '../hooks/useRealtimeThemes';

interface StudioEditorProps {
  data: InvitationData;
  guests: GuestRecipient[];
  wishes: WishMessage[];
  onUpdateData: (newData: InvitationData) => void;
  onUpdateGuests: (newGuests: GuestRecipient[]) => void;
  onOpenPrintStudio: () => void;
  onOpenDashboard?: () => void;
  onViewGuestMode: (recipientName: string) => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  data,
  guests,
  wishes: initialWishes,
  onUpdateData,
  onUpdateGuests,
  onOpenPrintStudio,
  onOpenDashboard,
  onViewGuestMode,
}) => {
  // Navigation & Viewport States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blocks' | 'guests' | 'rsvp' | 'settings'>('blocks');
  const [rightTab, setRightTab] = useState<'content' | 'blocks'>('content');
  const [contentSection, setContentSection] = useState<'profile' | 'schedule' | 'gift' | 'gallery' | 'music'>('profile');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [mobileNavView, setMobileNavView] = useState<'preview' | 'content' | 'theme' | 'blocks' | 'guests'>('preview');
  const [contentSheetHeight, setContentSheetHeight] = useState<'peek' | 'half' | 'full'>('half');
  const [isPhoneEnvelopeOpen, setIsPhoneEnvelopeOpen] = useState(true);
  const [openSidebarSection, setOpenSidebarSection] = useState<'event' | 'theme' | 'font' | 'frame' | 'print' | null>(null);

  // Modals & Feedback States
  const [isStyleGalleryOpen, setIsStyleGalleryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActiveLicenseOpen, setIsActiveLicenseOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Logged-in user state (baca dari localStorage — sama dengan Dashboard)
  const [currentUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('absenta_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [bulkText, setBulkText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New Guest Input State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCity, setNewGuestCity] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState('Sahabat');

  // Live RSVPs Query from SQLite
  const { data: serverRsvpsData } = useQuery({
    queryKey: ['rsvps', data.id || data.slug || 'wedding-romeo-juliet'],
    queryFn: async () => {
      try {
        const res = await api.getRsvps(data.id || data.slug || 'wedding-romeo-juliet');
        return res?.data ?? { rsvps: [] };
      } catch (e) {
        return { rsvps: [] };
      }
    },
    refetchInterval: 10000,
  });

  const safeWishes: WishMessage[] =
    serverRsvpsData?.rsvps && Array.isArray(serverRsvpsData.rsvps)
      ? serverRsvpsData.rsvps.map((r: any) => ({
          id: r.id,
          senderName: r.name,
          relationship: 'Tamu Undangan',
          status: (r.attendance || 'hadir').toLowerCase() as 'hadir' | 'tidak_hadir' | 'ragu',
          pax: r.pax || 1,
          message: r.message || '',
          createdAt: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          likes: r.likes || 0,
        }))
      : Array.isArray(initialWishes)
      ? initialWishes
      : [];

  const displayWishes: WishMessage[] = Array.isArray(safeWishes) ? safeWishes : [];
  const totalPax = displayWishes.filter((w) => w.status === 'hadir').reduce((acc, w) => acc + (w.pax || 1), 0);
  const totalAttending = displayWishes.filter((w) => w.status === 'hadir').length;
  const totalNotAttending = displayWishes.filter((w) => w.status === 'tidak_hadir').length;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.eventTitle || data.title);

      const payload = {
        ...data,
        title: data.eventTitle || data.title || 'Undangan Digital',
        slug: cleanSlug,
        id: data.id || cleanSlug,
        guestList: guests,
      };

      const res = await api.saveInvitation(payload);
      if (res.data?.invitation) {
        const updated = res.data.invitation;
        localStorage.setItem('absenta_active_invitation_id', updated.id);
        onUpdateData({
          ...data,
          id: updated.id,
          slug: updated.slug,
          isWatermarked: updated.isWatermarked,
          planId: updated.planId,
          planName: updated.planName,
        });
      }

      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2200);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: GuestRecipient = {
      id: 'g-' + Date.now(),
      name: newGuestName.trim(),
      city: newGuestCity.trim() || undefined,
      group: newGuestGroup,
      slug: generateSlug(newGuestName.trim()),
      isAttending: null,
      paxCount: 1,
    };

    const nextGuests = [newGuest, ...guests];
    onUpdateGuests(nextGuests);
    setNewGuestName('');
    setNewGuestCity('');

    // Auto-sync with SQLite backend
    try {
      const cleanSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.eventTitle || data.title);
      await api.saveInvitation({
        ...data,
        title: data.eventTitle || data.title || 'Undangan Digital',
        slug: cleanSlug,
        id: data.id || cleanSlug,
        guestList: nextGuests,
      });
    } catch (err) {
      console.warn('Auto sync guest failed:', err);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    const nextGuests = guests.filter((g) => g.id !== id);
    onUpdateGuests(nextGuests);

    // Auto-sync with SQLite backend
    try {
      const cleanSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.eventTitle || data.title);
      await api.saveInvitation({
        ...data,
        title: data.eventTitle || data.title || 'Undangan Digital',
        slug: cleanSlug,
        id: data.id || cleanSlug,
        guestList: nextGuests,
      });
    } catch (err) {
      console.warn('Auto sync guest delete failed:', err);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsedGuests: GuestRecipient[] = lines.map((line, idx) => {
      const parts = line.split(',');
      const name = parts[0].trim();
      const city = parts[1]?.trim() || undefined;
      return {
        id: `g-${Date.now()}-${idx}`,
        name,
        city,
        group: 'Umum',
        slug: generateSlug(name),
        isAttending: null,
        paxCount: 1,
      };
    });

    const nextGuests = [...parsedGuests, ...guests];
    onUpdateGuests(nextGuests);
    setBulkText('');
    setIsBulkModalOpen(false);

    // Auto-sync with SQLite backend
    try {
      const cleanSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.eventTitle || data.title);
      await api.saveInvitation({
        ...data,
        title: data.eventTitle || data.title || 'Undangan Digital',
        slug: cleanSlug,
        id: data.id || cleanSlug,
        guestList: nextGuests,
      });
    } catch (err) {
      console.warn('Auto sync bulk import failed:', err);
    }
  };

  const handleCopyWhatsAppShare = (guest: GuestRecipient) => {
    const activeSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.eventTitle || data.title);
    const shareUrl = `${window.location.origin}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;
    const text = `Halo ${guest.name},\n\nKami mengundang Anda untuk hadir di momen bahagia kami.\nBuka tautan undangan digital Anda di sini:\n${shareUrl}\n\nTerima kasih!`;

    navigator.clipboard.writeText(text);
    setCopiedLink(guest.slug);
    setTimeout(() => setCopiedLink(null), 2500);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const { styleKits } = useRealtimeThemes();

  // Active Kit Matcher
  const currentKit =
    styleKits.find(
      (k) =>
        k.themeId === data.theme &&
        (k.fontPairingId === data.themeConfig?.fontPairingId ||
          (!data.themeConfig?.fontPairingId && k.fontPairingId === 'royal_serif')) &&
        (k.frameShape === data.themeConfig?.frameShape ||
          (!data.themeConfig?.frameShape && k.frameShape === 'royal_arch'))
    ) || styleKits[0];

  const currentKitIndex = styleKits.findIndex((k) => k.id === currentKit?.id);

  const handleApplyMasterStyleKit = (kit: MasterStyleKit) => {
    const selectedTheme = themeRegistry.getTheme(kit.themeId);
    onUpdateData({
      ...data,
      theme: kit.themeId,
      themeConfig: {
        ...data.themeConfig,
        primaryColor: kit.primaryColor || selectedTheme?.primary,
        secondaryColor: selectedTheme?.secondary,
        bgColor: selectedTheme?.bg,
        cardBgColor: selectedTheme?.cardBg,
        fontPairingId: kit.fontPairingId,
        frameShape: kit.frameShape,
        archetypeStyle: selectedTheme?.archetype as any,
      },
    });
  };

  // Instant Maju / Mundur Preset Switchers (0ms Realtime Reactivity)
  const handlePrevStyleKit = () => {
    if (styleKits.length === 0) return;
    const prevIdx = (currentKitIndex - 1 + styleKits.length) % styleKits.length;
    handleApplyMasterStyleKit(styleKits[prevIdx]);
  };

  const handleNextStyleKit = () => {
    if (styleKits.length === 0) return;
    const nextIdx = (currentKitIndex + 1) % styleKits.length;
    handleApplyMasterStyleKit(styleKits[nextIdx]);
  };

  const handleThemeChange = (themeId: ThemeToken) => {
    const selectedTheme = themeRegistry.getTheme(themeId);
    onUpdateData({
      ...data,
      theme: themeId,
      themeConfig: {
        ...data.themeConfig,
        primaryColor: selectedTheme?.primary,
        secondaryColor: selectedTheme?.secondary,
        bgColor: selectedTheme?.bg,
        cardBgColor: selectedTheme?.cardBg,
        archetypeStyle: selectedTheme?.archetype as any,
        frameShape: (selectedTheme?.archetype as any) || 'royal_arch',
      },
    });
  };

  const handleEventTypeChange = (eventType: EventType) => {
    let preset = DEFAULT_WEDDING_DATA;
    if (eventType === 'khitanan') preset = DEFAULT_KHITANAN_DATA;
    else if (eventType === 'aqiqah') preset = DEFAULT_AQIQAH_DATA;
    else if (eventType === 'birthday') preset = DEFAULT_BIRTHDAY_DATA;

    const dynamicSlug = data.slug ? generateSlug(data.slug) : generateSlug(preset.eventTitle);

    onUpdateData({
      ...preset,
      id: data.id,
      slug: dynamicSlug,
      isWatermarked: data.isWatermarked,
      licenseKey: data.licenseKey,
      planId: data.planId,
      gallery: data.gallery && data.gallery.length > 0 ? data.gallery : preset.gallery,
    });
  };

  const toggleBlock = (blockKey: string) => {
    onUpdateData({
      ...data,
      enabledBlocks: {
        ...data.enabledBlocks,
        [blockKey]: !data.enabledBlocks[blockKey],
      },
    });
  };

  const handleFocusSection = (sectionKey: string) => {
    setActiveTab('blocks');
    if (sectionKey !== 'hero') {
      setIsPhoneEnvelopeOpen(true);
    } else {
      setIsPhoneEnvelopeOpen(false);
    }

    setTimeout(() => {
      const el = document.getElementById('section-' + sectionKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-2', 'ring-[#c4a661]', 'ring-offset-4', 'ring-offset-black', 'rounded-3xl', 'transition-all');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#c4a661]', 'ring-offset-4', 'ring-offset-black');
        }, 1800);
      }
    }, 150);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-[#e2e2e7] font-sans overflow-hidden">
      {/* 1. LEFT THEME & PRESETS SIDEBAR */}
      <ThemingSidebar
        data={data}
        onUpdateData={onUpdateData}
        onThemeChange={handleThemeChange}
        onEventTypeChange={handleEventTypeChange}
        onOpenPrintStudio={onOpenPrintStudio}
        onOpenStyleGallery={() => setIsStyleGalleryOpen(true)}
        onPrevStyleKit={handlePrevStyleKit}
        onNextStyleKit={handleNextStyleKit}
        onOpenDashboard={onOpenDashboard}
        mobileNavView={mobileNavView}
        onCloseMobileView={() => setMobileNavView('preview')}
      />

      {/* 2. CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col bg-[#0a0a0b] relative overflow-hidden pb-16 lg:pb-0">
        <StudioHeader
          data={data}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          deviceFrame={deviceFrame}
          setDeviceFrame={setDeviceFrame}
          guestCount={guests.length}
          wishCount={displayWishes.length}
          isSaving={isSaving}
          onSave={handleSave}
          onViewGuestMode={onViewGuestMode}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenLicenseModal={() => setIsActiveLicenseOpen(true)}
        />

        {/* Dynamic Center Canvas View */}
        <div className="flex-1 flex justify-center bg-[radial-gradient(circle_at_center,_#1a1a24_0%,_#0a0a0b_100%)] overflow-y-auto">
          {activeTab === 'blocks' ? (
            <CanvasViewport
              data={data}
              deviceFrame={deviceFrame}
              isPhoneEnvelopeOpen={isPhoneEnvelopeOpen}
              setIsPhoneEnvelopeOpen={setIsPhoneEnvelopeOpen}
              wishes={displayWishes}
              onAddWish={() => {}}
              currentStyleKitName={currentKit?.name}
              onPrevStyleKit={handlePrevStyleKit}
              onNextStyleKit={handleNextStyleKit}
              onOpenStyleGallery={() => setIsStyleGalleryOpen(true)}
            />
          ) : activeTab === 'guests' ? (
            <div className="p-4 md:p-8 flex justify-center w-full">
              <GuestListManager
                data={data}
                guests={guests}
                newGuestName={newGuestName}
                setNewGuestName={setNewGuestName}
                newGuestCity={newGuestCity}
                setNewGuestCity={setNewGuestCity}
                newGuestGroup={newGuestGroup}
                setNewGuestGroup={setNewGuestGroup}
                onAddGuest={handleAddGuest}
                onDeleteGuest={handleDeleteGuest}
                onCopyWhatsAppShare={handleCopyWhatsAppShare}
                onViewGuestMode={onViewGuestMode}
                onOpenBulkModal={() => setIsBulkModalOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
                copiedLink={copiedLink}
              />
            </div>
          ) : (
            <div className="p-4 md:p-8 flex justify-center w-full">
              <AnalyticsPanel
                wishes={displayWishes}
                totalPax={totalPax}
                totalAttending={totalAttending}
                totalNotAttending={totalNotAttending}
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. RIGHT CONTENT FORM & BLOCK ARCHITECTURE SIDEBAR */}
      {/* 3a. PERMANENT DESKTOP RIGHT SIDEBAR (Always Docked, Full Height) */}
      <aside className="hidden lg:flex w-88 h-full bg-[#111115] border-l border-[#1f1f27] p-4 flex-col overflow-y-auto scrollbar-thin shrink-0 space-y-3">
        {/* Header Switcher */}
        <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 shrink-0">
          <button
            onClick={() => setRightTab('content')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              rightTab === 'content'
                ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Edit Konten
          </button>
          <button
            onClick={() => setRightTab('blocks')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              rightTab === 'blocks'
                ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Kelola Blok
          </button>
        </div>

        {rightTab === 'content' ? (
          /* CONTENT FORM EDITOR */
          <div className="space-y-3 flex-1 overflow-y-auto">
            {/* Sub-tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                onClick={() => setContentSection('profile')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  contentSection === 'profile'
                    ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setContentSection('schedule')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  contentSection === 'schedule'
                    ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                Acara
              </button>
              <button
                onClick={() => setContentSection('gift')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  contentSection === 'gift'
                    ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                Rekening
              </button>
              <button
                onClick={() => setContentSection('gallery')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  contentSection === 'gallery'
                    ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                Galeri
              </button>
              <button
                onClick={() => setContentSection('music')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                  contentSection === 'music'
                    ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                    : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                Musik
              </button>
            </div>

            {/* Active Sub-Form */}
            <div className="pt-2">
              {contentSection === 'profile' && <CoupleProfileForm data={data} onChange={onUpdateData} />}
              {contentSection === 'schedule' && <EventScheduleForm data={data} onChange={onUpdateData} />}
              {contentSection === 'gift' && <BankGiftForm data={data} onChange={onUpdateData} />}
              {contentSection === 'gallery' && <GalleryMediaForm data={data} onChange={onUpdateData} />}
              {contentSection === 'music' && <MusicSelectorForm data={data} onChange={onUpdateData} />}
            </div>
          </div>
        ) : (
          <BlockManagerPanel
            data={data}
            wishes={displayWishes}
            onToggleBlock={toggleBlock}
            onEditSectionJump={(sec) => {
              setRightTab('content');
              setContentSection(sec);
            }}
            onFocusSection={handleFocusSection}
          />
        )}
      </aside>

      {/* 3b. MOBILE CONTENT & BLOCKS BOTTOM SHEET (ONLY ON MOBILE lg:hidden) */}
      {(mobileNavView === 'content' || mobileNavView === 'blocks') && (
        <aside
          className={`lg:hidden flex fixed bottom-14 left-0 right-0 ${
            contentSheetHeight === 'peek'
              ? 'h-[25vh] max-h-[25vh]'
              : contentSheetHeight === 'full'
              ? 'h-[85vh] max-h-[85vh]'
              : 'h-[52vh] max-h-[52vh]'
          } z-40 w-full rounded-t-3xl border-t-2 border-[#c4a661]/40 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] bg-[#111115]/95 backdrop-blur-2xl p-4 pb-2 flex-col overflow-y-auto scrollbar-thin space-y-3 transition-all duration-300`}
        >
          {/* Mobile Drag Handle & Header Controls */}
          <div className="flex flex-col items-center pt-0 pb-1.5 border-b border-neutral-800 shrink-0">
            <div
              onClick={() =>
                setContentSheetHeight(
                  contentSheetHeight === 'half' ? 'peek' : contentSheetHeight === 'peek' ? 'full' : 'half'
                )
              }
              className="w-10 h-1 rounded-full bg-neutral-500 mb-1.5 cursor-pointer hover:bg-[#c4a661] transition"
            />
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#c4a661]">
                {mobileNavView === 'content' ? '✏️ Formulir Konten' : '🎛️ Kelola Blok'}
              </span>

              <div className="flex items-center gap-1.5">
                {contentSheetHeight !== 'peek' && (
                  <button
                    type="button"
                    onClick={() => setContentSheetHeight('peek')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    🔽 25%
                  </button>
                )}

                {contentSheetHeight !== 'full' ? (
                  <button
                    type="button"
                    onClick={() => setContentSheetHeight('full')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    🔼 85%
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setContentSheetHeight('half')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    🔽 50%
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMobileNavView('preview')}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Sub-tabs for content on mobile */}
          {mobileNavView === 'content' ? (
            <div className="space-y-3">
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  onClick={() => setContentSection('profile')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                    contentSection === 'profile'
                      ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Profil
                </button>
                <button
                  onClick={() => setContentSection('schedule')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                    contentSection === 'schedule'
                      ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Acara
                </button>
                <button
                  onClick={() => setContentSection('gift')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                    contentSection === 'gift'
                      ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Rekening
                </button>
                <button
                  onClick={() => setContentSection('gallery')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                    contentSection === 'gallery'
                      ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Galeri
                </button>
                <button
                  onClick={() => setContentSection('music')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                    contentSection === 'music'
                      ? 'bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Musik
                </button>
              </div>

              {contentSection === 'profile' && <CoupleProfileForm data={data} onChange={onUpdateData} />}
              {contentSection === 'schedule' && <EventScheduleForm data={data} onChange={onUpdateData} />}
              {contentSection === 'gift' && <BankGiftForm data={data} onChange={onUpdateData} />}
              {contentSection === 'gallery' && <GalleryMediaForm data={data} onChange={onUpdateData} />}
              {contentSection === 'music' && <MusicSelectorForm data={data} onChange={onUpdateData} />}
            </div>
          ) : (
            <BlockManagerPanel
              data={data}
              wishes={displayWishes}
              onToggleBlock={toggleBlock}
              onEditSectionJump={(sec) => {
                setMobileNavView('content');
                setContentSection(sec);
              }}
              onFocusSection={handleFocusSection}
            />
          )}
        </aside>
      )}

      {/* 4. MODALS & OVERLAYS */}
      <StyleKitGalleryModal
        isOpen={isStyleGalleryOpen}
        onClose={() => setIsStyleGalleryOpen(false)}
        currentThemeId={data.theme}
        currentFontId={data.themeConfig?.fontPairingId}
        currentFrameId={data.themeConfig?.frameShape}
        onApplyKit={handleApplyMasterStyleKit}
      />

      <BulkGuestImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        bulkText={bulkText}
        setBulkText={setBulkText}
        onProcessImport={handleBulkImport}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        invitationTitle={data.eventTitle || data.title || 'Undangan Digital'}
        invitationId={data.id || data.slug}
        onSuccess={(licenseKey) => {
          onUpdateData({
            ...data,
            isWatermarked: false,
            licenseKey: licenseKey,
            planId: 'UND-GOLD',
            planName: 'Gold / Reseller Pro',
          });
          setIsPricingOpen(false);
        }}
      />

      <ActiveLicenseModal
        isOpen={isActiveLicenseOpen}
        onClose={() => setIsActiveLicenseOpen(false)}
        data={data}
        quotaTokens={currentUser?.quotaTokens ?? currentUser?.quota_tokens}
        userRole={currentUser?.role}
        onUpgrade={() => setIsPricingOpen(true)}
      />

      <ReceptionScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        invitationTitle={data.eventTitle}
        guests={guests}
        onGuestCheckedIn={(guestId) => {
          onUpdateGuests(
            guests.map((g) => (g.id === guestId ? { ...g, isAttending: true } : g))
          );
        }}
      />

      {/* Save Notification Toast (Center Face Animated Fade Out) */}
      <AnimatePresence>
        {saveToast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)', transition: { duration: 0.45 } }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex items-center gap-3.5 rounded-3xl bg-[#111115]/95 border-2 border-[#c4a661] px-6 py-4 shadow-[0_0_60px_rgba(196,166,97,0.4)] backdrop-blur-2xl text-white"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="text-[#c4a661]">✨</span>
                  <span>Tersimpan dengan Sukses!</span>
                </div>
                <div className="text-[11px] text-neutral-300">
                  Data undangan live tersimpan ke database SQLite
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MOBILE & TABLET BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        mobileNavView={mobileNavView}
        onSelectView={(view) => {
          setMobileNavView(view);
          // Always close any open fullscreen modals so user is returned to the workspace
          setIsPricingOpen(false);
          setIsActiveLicenseOpen(false);
          setIsScannerOpen(false);
          setIsBulkModalOpen(false);
          setIsStyleGalleryOpen(false);

          if (view === 'preview') {
            setActiveTab('blocks');
          } else if (view === 'content') {
            setActiveTab('blocks');
            setRightTab('content');
          } else if (view === 'theme') {
            setActiveTab('blocks');
          } else if (view === 'blocks') {
            setActiveTab('blocks');
            setRightTab('blocks');
          } else if (view === 'guests') {
            setActiveTab('guests');
          }
        }}
      />
    </div>
  );
};
