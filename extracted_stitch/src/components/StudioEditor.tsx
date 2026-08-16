import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Blocks,
  Users,
  CalendarCheck,
  Printer,
  Settings,
  Eye,
  Share2,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  GripVertical,
  Palette,
  Music,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Heart,
  Calendar,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { InvitationData, EventType, ThemeToken, GuestRecipient, WishMessage } from '../types';
import { THEMES } from '../data/presets';
import { QRCodeSVG } from 'qrcode.react';

interface StudioEditorProps {
  data: InvitationData;
  onUpdateData: (newData: InvitationData) => void;
  guests: GuestRecipient[];
  onUpdateGuests: (newGuests: GuestRecipient[]) => void;
  wishes: WishMessage[];
  onOpenPrintStudio: () => void;
  onViewGuestMode: (guestName?: string) => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  data,
  onUpdateData,
  guests,
  onUpdateGuests,
  wishes,
  onOpenPrintStudio,
  onViewGuestMode,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blocks' | 'guests' | 'rsvp' | 'settings'>('blocks');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [saveToast, setSaveToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCity, setNewGuestCity] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState('Sahabat');

  // Stats calculation
  const totalAttending = wishes.filter((w) => w.status === 'hadir').length;
  const totalPax = wishes.filter((w) => w.status === 'hadir').reduce((acc, curr) => acc + (curr.pax || 1), 0);
  const totalNotAttending = wishes.filter((w) => w.status === 'tidak_hadir').length;

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    const newGuest: GuestRecipient = {
      id: `g-${Date.now()}`,
      name: newGuestName.trim(),
      addressOrCity: newGuestCity.trim() || 'Jakarta',
      group: newGuestGroup,
      paxQuota: 2,
      hasOpened: false,
    };
    onUpdateGuests([newGuest, ...guests]);
    setNewGuestName('');
    setNewGuestCity('');
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateGuests(guests.filter((g) => g.id !== id));
  };

  const copyGuestLink = (guest: GuestRecipient) => {
    const origin = window.location.origin + window.location.pathname;
    const url = `${origin}?to=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(guest.id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const copyWhatsAppShare = (guest: GuestRecipient) => {
    const origin = window.location.origin + window.location.pathname;
    const url = `${origin}?to=${encodeURIComponent(guest.name)}`;
    const text = `Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name},\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara kami:\n\n*${data.eventTitle}*\n\nBuka undangan digital melalui tautan berikut:\n${url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih.`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const toggleBlock = (blockKey: keyof typeof data.enabledBlocks) => {
    onUpdateData({
      ...data,
      enabledBlocks: {
        ...data.enabledBlocks,
        [blockKey]: !data.enabledBlocks[blockKey],
      },
    });
  };

  const handleThemeChange = (themeKey: ThemeToken) => {
    onUpdateData({
      ...data,
      theme: themeKey,
    });
  };

  const handleEventTypeChange = (type: EventType) => {
    onUpdateData({
      ...data,
      eventType: type,
      eventTitle:
        type === 'wedding'
          ? 'Romeo & Juliet'
          : type === 'khitanan'
          ? 'Walimatul Khitan Rayyan'
          : type === 'aqiqah'
          ? 'Tasyakuran Aqiqah Aisyah'
          : "Valerie's Sweet 17th",
      tagline:
        type === 'wedding'
          ? 'THE WEDDING OF'
          : type === 'khitanan'
          ? 'TASYAKURAN WALIMATUL KHITAN'
          : type === 'aqiqah'
          ? 'TASYAKURAN AQIQAH & GUNTING RAMBUT'
          : 'SWEET SEVENTEEN CELEBRATION',
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-[#e2e2e7] font-sans overflow-hidden">
      {/* LEFT ASIDE (LuxeInvite Studio Sidebar) */}
      <aside className="w-64 shrink-0 bg-[#111115] border-r border-[#1f1f27] flex flex-col justify-between select-none">
        <div>
          <div className="p-6 border-b border-[#1f1f27]">
            <div className="text-[#c4a661] text-xs uppercase tracking-widest font-bold mb-1">
              LuxeInvite
            </div>
            <div className="text-sm text-gray-400 font-serif">Invitation Studio v2.4</div>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Event Type selector */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3 block">
                Event Type
              </label>
              <div className="space-y-1.5">
                {[
                  { type: 'wedding' as const, label: 'Wedding Ceremony' },
                  { type: 'khitanan' as const, label: 'Walimatul Khitan' },
                  { type: 'aqiqah' as const, label: 'Aqiqah & Tasyakuran' },
                  { type: 'birthday' as const, label: 'Birthday Celebration' },
                ].map((item) => {
                  const isActive = data.eventType === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleEventTypeChange(item.type)}
                      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#1f1f27] border border-[#c4a661]/30 text-white font-medium shadow-xs'
                          : 'hover:bg-[#1f1f27]/60 text-gray-400 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${
                          isActive ? 'bg-[#c4a661]' : 'bg-gray-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Tokens selector */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3 block">
                Theme Tokens
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleThemeChange('velvet_navy')}
                  className={`h-8 rounded bg-[#131c31] border flex items-center justify-center text-[10px] text-slate-200 transition ${
                    data.theme === 'velvet_navy'
                      ? 'border-[#c4a661] ring-1 ring-[#c4a661]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  Navy
                </button>
                <button
                  onClick={() => handleThemeChange('champagne_gold')}
                  className={`h-8 rounded bg-[#d4af37] border flex items-center justify-center text-[10px] text-black font-bold transition ${
                    data.theme === 'champagne_gold'
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/10 hover:opacity-90'
                  }`}
                >
                  Gold
                </button>
                <button
                  onClick={() => handleThemeChange('emerald_sage')}
                  className={`h-8 rounded bg-[#3a4d3a] border flex items-center justify-center text-[10px] text-emerald-100 transition ${
                    data.theme === 'emerald_sage'
                      ? 'border-[#c4a661] ring-1 ring-[#c4a661]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  Sage
                </button>
              </div>
            </div>

            {/* Print Studio Quick Action */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3 block">
                Print Studio
              </label>
              <button
                onClick={onOpenPrintStudio}
                className="w-full py-2 bg-[#1f1f27] border border-[#1f1f27] hover:border-[#c4a661]/50 text-xs text-white rounded transition-all mb-2 flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-[#c4a661]" />
                <span>Generate A5 Card (300 DPI)</span>
              </button>
              <button
                onClick={onOpenPrintStudio}
                className="w-full py-2 bg-[#1f1f27] border border-[#1f1f27] hover:border-[#c4a661]/50 text-xs text-white rounded transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-3.5 h-3.5 text-[#c4a661]" />
                <span>Tom & Jerry 103 Sticker</span>
              </button>
            </div>
          </div>
        </div>

        {/* Auto Save Footer */}
        <div className="p-4 border-t border-[#1f1f27] bg-[#111115]">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Auto-save: Enabled</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col bg-[#0a0a0b] relative overflow-hidden">
        {/* Header Navigation */}
        <header className="h-16 border-b border-[#1f1f27] flex items-center justify-between px-8 bg-[#0a0a0b]/80 backdrop-blur-md z-10">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`text-sm font-medium pb-5 translate-y-[21px] transition cursor-pointer ${
                activeTab === 'blocks'
                  ? 'border-b-2 border-[#c4a661] text-[#e2e2e7]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Design Preview
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`text-sm font-medium pb-5 translate-y-[21px] transition cursor-pointer ${
                activeTab === 'guests'
                  ? 'border-b-2 border-[#c4a661] text-[#e2e2e7]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Guest List ({guests.length})
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium pb-5 translate-y-[21px] transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-[#c4a661] text-[#e2e2e7]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Analytics & RSVP ({wishes.length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 text-xs bg-[#1f1f27] hover:bg-[#2a2a35] border border-[#1f1f27] text-gray-300 font-semibold rounded-full flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5 text-[#c4a661]" />
              <span>Save</span>
            </button>
            <button
              onClick={() => onViewGuestMode('Bpk. Ahmad Suherman & Kel')}
              className="px-4 py-2 text-xs bg-white text-black font-bold rounded-full hover:bg-amber-100 transition shadow-lg flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          </div>
        </header>

        {/* Dynamic Center Canvas View */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-[radial-gradient(circle_at_center,_#1a1a24_0%,_#0a0a0b_100%)] overflow-y-auto">
          {activeTab === 'blocks' ? (
            /* PHONE FRAME PREVIEW (Matching Design HTML Phone Frame) */
            <div className="w-[360px] h-[660px] bg-[#0f172a] rounded-[48px] border-[8px] border-[#22222b] shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
              {/* Speaker Notch */}
              <div className="w-32 h-6 bg-[#22222b] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-neutral-900 mr-2" />
                <div className="w-2 h-2 rounded-full bg-[#c4a661]/40" />
              </div>

              {/* Inner Phone Screen */}
              <div className="flex-1 overflow-y-auto relative text-[#e2e2e7]">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%23d4af37' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                  }}
                />

                <div className="p-6 pt-12 flex flex-col items-center min-h-full">
                  {/* Arched Profile Image */}
                  <div className="w-48 h-64 border-2 border-[#d4af37] rounded-t-full relative mb-6 overflow-hidden bg-[#1e293b] shadow-xl">
                    <img
                      src={data.gallery[0]?.url || data.profiles[0]?.photoUrl}
                      alt="Honoree"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Tagline */}
                  <div className="text-center space-y-1.5 mb-6">
                    <div className="text-[#d4af37] font-serif text-3xl">
                      {data.eventTitle}
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-semibold">
                      {data.tagline} • SATURDAY, OCT 24, 2026
                    </div>
                  </div>

                  {/* Guest Badge Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full text-center backdrop-blur-xs mb-6">
                    <div className="text-[10px] text-[#d4af37] uppercase tracking-widest mb-1.5 font-semibold">
                      Kepada Yth.
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Bpk. Ahmad Suherman & Kel
                    </div>
                    <div className="text-[9px] text-white/40 mt-1 uppercase italic">
                      Guest Badge #W-042
                    </div>
                  </div>

                  {/* Countdown Ticker Box */}
                  <div className="mt-auto w-full grid grid-cols-4 gap-2 pb-4">
                    <div className="text-center bg-black/40 py-2 rounded-lg border border-white/5">
                      <div className="text-base font-bold text-[#d4af37]">12</div>
                      <div className="text-[8px] uppercase opacity-60">Days</div>
                    </div>
                    <div className="text-center bg-black/40 py-2 rounded-lg border border-white/5">
                      <div className="text-base font-bold text-[#d4af37]">04</div>
                      <div className="text-[8px] uppercase opacity-60">Hrs</div>
                    </div>
                    <div className="text-center bg-black/40 py-2 rounded-lg border border-white/5">
                      <div className="text-base font-bold text-[#d4af37]">22</div>
                      <div className="text-[8px] uppercase opacity-60">Min</div>
                    </div>
                    <div className="text-center bg-black/40 py-2 rounded-lg border border-white/5">
                      <div className="text-base font-bold text-[#d4af37]">10</div>
                      <div className="text-[8px] uppercase opacity-60">Sec</div>
                    </div>
                  </div>

                  {/* Floating Vinyl Player Disc Button in Mockup */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg border-4 border-[#0f172a]">
                    <div className="w-5 h-5 border-2 border-black/30 rounded-full flex items-center justify-center bg-black animate-spin">
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'guests' ? (
            /* GUEST LIST MANAGEMENT VIEW */
            <div className="w-full max-w-2xl bg-[#111115] border border-[#1f1f27] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#1f1f27] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#c4a661]">
                    Guest List & WhatsApp Dispatch
                  </h3>
                  <p className="text-xs text-gray-400">
                    Personalized links with automatic guest badge and RSVP tracking.
                  </p>
                </div>
                <span className="text-xs bg-[#1f1f27] text-white px-3 py-1 rounded-full border border-white/10">
                  {guests.length} Tamu
                </span>
              </div>

              {/* Add Form */}
              <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-[#1f1f27] p-3 rounded-xl border border-white/5">
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Nama Tamu"
                  className="sm:col-span-2 rounded-lg bg-[#111115] border border-gray-700 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={newGuestCity}
                  onChange={(e) => setNewGuestCity(e.target.value)}
                  placeholder="Kota (Bandung)"
                  className="rounded-lg bg-[#111115] border border-gray-700 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="bg-[#c4a661] text-black font-bold py-2 rounded-lg text-xs hover:bg-[#d4af37] transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* Guest list items */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 bg-[#1f1f27] rounded-xl border border-white/5"
                  >
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {guest.name}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {guest.addressOrCity || 'di Tempat'} • {guest.group}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyGuestLink(guest)}
                        className="px-2.5 py-1.5 text-xs bg-[#111115] hover:bg-[#252530] border border-white/10 text-gray-300 rounded-lg flex items-center gap-1"
                      >
                        {copiedLink === guest.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Link</span>
                      </button>
                      <button
                        onClick={() => copyWhatsAppShare(guest)}
                        className="px-2.5 py-1.5 text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>WA</span>
                      </button>
                      <button
                        onClick={() => onViewGuestMode(guest.name)}
                        className="px-2.5 py-1.5 text-xs bg-[#c4a661]/20 border border-[#c4a661]/40 text-[#d4af37] rounded-lg flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ANALYTICS / RSVP STATS VIEW */
            <div className="w-full max-w-2xl bg-[#111115] border border-[#1f1f27] rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#c4a661]">
                  Live Attendance Analytics
                </h3>
                <p className="text-xs text-gray-400">
                  Real-time RSVP confirmation and guestbook sentiment.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Pax Hadir</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{totalPax} Pax</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{totalAttending} Konfirmasi</div>
                </div>
                <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Tidak Hadir</div>
                  <div className="text-2xl font-bold text-rose-400 mt-1">{totalNotAttending}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Berhalangan</div>
                </div>
                <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Doa & Ucapan</div>
                  <div className="text-2xl font-bold text-[#d4af37] mt-1">{wishes.length}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Di Buku Tamu</div>
                </div>
              </div>

              {/* Recent RSVP Stream */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {wishes.map((w) => (
                  <div key={w.id} className="p-3 bg-[#1f1f27] rounded-xl border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{w.senderName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        w.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {w.status === 'hadir' ? `Hadir (${w.pax} Pax)` : 'Tidak Hadir'}
                      </span>
                    </div>
                    <p className="text-gray-300 italic">"{w.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT ASIDE (Blocks & Architecture Matching Design HTML) */}
      <aside className="w-80 shrink-0 bg-[#111115] border-l border-[#1f1f27] p-6 flex flex-col justify-between overflow-y-auto select-none">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#c4a661] mb-6">
            Blocks & Architecture
          </h3>

          <div className="space-y-3.5">
            {[
              {
                key: 'hero' as const,
                title: 'Hero Section',
                badgeLetter: 'H',
                badgeClass: 'bg-blue-500/20 text-blue-400',
              },
              {
                key: 'gallery' as const,
                title: 'Gallery Wall',
                badgeLetter: 'G',
                badgeClass: 'bg-emerald-500/20 text-emerald-400',
              },
              {
                key: 'gift' as const,
                title: 'Gift Bank',
                badgeLetter: '$',
                badgeClass: 'bg-amber-500/20 text-amber-400',
                extra: (
                  <div className="pl-11 text-[10px] text-gray-500 space-y-0.5">
                    <div>• BCA: 123-456-7890</div>
                    <div>• Copy-to-Clipboard enabled</div>
                  </div>
                ),
              },
              {
                key: 'rsvp' as const,
                title: 'Live RSVP Form',
                badgeLetter: 'R',
                badgeClass: 'bg-purple-500/20 text-purple-400',
                tag: `${wishes.length} Active`,
              },
              {
                key: 'countdown' as const,
                title: 'Countdown Timer',
                badgeLetter: 'C',
                badgeClass: 'bg-teal-500/20 text-teal-400',
              },
              {
                key: 'schedule' as const,
                title: 'Event Schedule',
                badgeLetter: 'S',
                badgeClass: 'bg-indigo-500/20 text-indigo-400',
              },
            ].map((item) => {
              const isEnabled = data.enabledBlocks[item.key];

              return (
                <div
                  key={item.key}
                  className={`p-3 bg-[#1f1f27] rounded-xl border border-white/5 transition ${
                    !isEnabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mr-3 ${item.badgeClass}`}
                      >
                        {item.badgeLetter}
                      </div>
                      <span className="text-sm text-white font-medium">{item.title}</span>
                    </div>

                    {item.tag ? (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-medium">
                        {item.tag}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleBlock(item.key)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition cursor-pointer ${
                          isEnabled
                            ? 'border-2 border-[#c4a661]'
                            : 'border border-gray-600'
                        }`}
                      >
                        {isEnabled && (
                          <div className="w-2 h-2 rounded-full bg-[#c4a661]" />
                        )}
                      </button>
                    )}
                  </div>
                  {item.extra}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Preview Mode Card */}
        <div className="mt-8">
          <div className="p-4 bg-gradient-to-br from-[#c4a661]/10 to-[#1f1f27] rounded-2xl border border-[#c4a661]/20">
            <div className="text-xs font-bold text-[#c4a661] mb-2">
              Preview Mode: Standard Mobile
            </div>
            <div className="text-[11px] text-gray-400 leading-relaxed mb-4">
              Adaptive layout is scaling to pixel-perfect mobile (430px) frame for high-density validation.
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-1 bg-[#c4a661] rounded-full" />
              <div className="flex-1 h-1 bg-white/10 rounded-full" />
              <div className="flex-1 h-1 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Save Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl"
          >
            <Check className="w-4 h-4" />
            <span>Perubahan berhasil disimpan!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
