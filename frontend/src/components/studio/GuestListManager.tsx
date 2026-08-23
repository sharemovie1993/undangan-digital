import React, { useState, memo, useMemo, useCallback } from 'react';
import { Plus, Upload, QrCode, Copy, Eye, Trash2, AlertTriangle, FileSpreadsheet, Search, MessageSquare, MapPin, Users, Check, CheckCheck, Mail, MailOpen, UserCheck, UserX, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { GuestRecipient, InvitationData } from '../../types';
import { exportGuestsToExcel } from '../../utils/excelGuests';
import { generateWhatsAppMessage } from '../../utils/whatsappTemplate';

interface GuestListManagerProps {
  data: InvitationData;
  guests: GuestRecipient[];
  newGuestName: string;
  setNewGuestName: (val: string) => void;
  newGuestCity: string;
  setNewGuestCity: (val: string) => void;
  newGuestGroup: string;
  setNewGuestGroup: (val: string) => void;
  onAddGuest: (e: React.FormEvent) => void;
  onDeleteGuest: (id: string) => void;
  onCopyWhatsAppShare: (guest: GuestRecipient) => void;
  onViewGuestMode: (name: string) => void;
  onOpenBulkModal: () => void;
  onOpenScanner: () => void;
  copiedLink: string | null;
  onToggleGuestSentStatus?: (id: string, isSent?: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📱 GuestCardItem — 1-Row Ultra-Compact Layout (Nama | Keluarga | Aksi)
// ─────────────────────────────────────────────────────────────────────────────
interface GuestCardItemProps {
  guest: GuestRecipient;
  isCopiedOnly: boolean;
  onSendWhatsApp: (guest: GuestRecipient) => void;
  onCopyLinkOnly: (guest: GuestRecipient) => void;
  onViewGuestMode: (name: string) => void;
  onDeleteGuest: (id: string) => void;
  onToggleSent?: (id: string, isSent?: boolean) => void;
}

const GuestCardItem = memo(function GuestCardItem({
  guest,
  isCopiedOnly,
  onSendWhatsApp,
  onCopyLinkOnly,
  onViewGuestMode,
  onDeleteGuest,
  onToggleSent,
}: GuestCardItemProps) {
  const cityText = guest.addressOrCity || guest.city;
  const isAttending = guest.isAttending === true || (guest as any).attendance === 'HADIR' || (guest as any).status === 'hadir';
  const isNotAttending = guest.isAttending === false || (guest as any).attendance === 'TIDAK_HADIR' || (guest as any).status === 'tidak_hadir';
  const isOpened = Boolean(guest.hasOpened || guest.isCheckedIn || isAttending || isNotAttending);
  const isSent = Boolean(guest.isSent);

  return (
    <div className="bg-[#111115] hover:bg-[#16161c] border border-white/5 hover:border-white/10 rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 transition shadow-xs">
      {/* 1. NAMA & STATUS (KIRI) */}
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {/* Status Pengiriman Interaktif (Klik untuk Toggle Sent/Unsent) */}
        <button
          type="button"
          onClick={() => onToggleSent?.(guest.id, !isSent)}
          className="shrink-0 cursor-pointer group"
          title={isSent ? 'Terkirim (Klik untuk ubah ke Belum Kirim)' : 'Belum Kirim (Klik untuk tandai Terkirim)'}
        >
          {isSent ? (
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] group-hover:scale-110 transition">
              <CheckCheck className="w-3 h-3" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-neutral-500 border border-neutral-800 flex items-center justify-center text-[10px] group-hover:text-amber-300 group-hover:border-amber-500/50 transition">
              <Send className="w-2.5 h-2.5" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className={`font-bold text-xs sm:text-sm truncate ${isSent ? 'text-white' : 'text-neutral-200'}`}>
              {guest.name}
            </h4>
            {guest.paxQuota && guest.paxQuota > 1 && (
              <span className="text-[9px] px-1 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0 font-medium">
                {guest.paxQuota}p
              </span>
            )}
            {/* Status Buka / Hadir Badge Mini */}
            {isAttending ? (
              <span className="text-[8.5px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                Hadir
              </span>
            ) : isOpened ? (
              <span className="text-[8.5px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-400 shrink-0">
                Dibuka
              </span>
            ) : null}
          </div>
          {cityText && (
            <p className="text-[9.5px] text-neutral-500 truncate flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#c4a661] shrink-0" />
              <span className="truncate">{cityText}</span>
            </p>
          )}
        </div>
      </div>

      {/* 2. KELUARGA / KATEGORI (TENGAH) */}
      <div className="shrink-0 max-w-[90px] sm:max-w-[120px] text-center">
        <span
          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold truncate block ${
            (guest.group || '').toLowerCase() === 'keluarga'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
          }`}
          title={guest.group || 'Umum'}
        >
          {guest.group || 'Umum'}
        </span>
      </div>

      {/* 3. AKSI (KANAN - 1 BARIS COMPACT) */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Tombol Kirim WA (Otomatis Menandai Terkirim) */}
        <button
          type="button"
          onClick={() => onSendWhatsApp(guest)}
          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
            isSent
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-400 border border-emerald-500/30'
          }`}
          title="Kirim Undangan ke WhatsApp (Otomatis Tandai Terkirim)"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Salin Link (Otomatis Menandai Terkirim) */}
        <button
          type="button"
          onClick={() => onCopyLinkOnly(guest)}
          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
            isCopiedOnly
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
          }`}
          title="Salin Link Undangan Khusus"
        >
          {isCopiedOnly ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Tombol Preview Mode Tamu */}
        <button
          type="button"
          onClick={() => onViewGuestMode(guest.name)}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer flex items-center justify-center"
          title="Lihat Pratinjau Undangan"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Hapus */}
        <button
          type="button"
          onClick={() => onDeleteGuest(guest.id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition cursor-pointer flex items-center justify-center"
          title="Hapus Tamu"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});
GuestCardItem.displayName = 'GuestCardItem';

export const GuestListManager = memo(function GuestListManager({
  data,
  guests,
  newGuestName,
  setNewGuestName,
  newGuestCity,
  setNewGuestCity,
  newGuestGroup,
  setNewGuestGroup,
  onAddGuest,
  onDeleteGuest,
  onCopyWhatsAppShare,
  onViewGuestMode,
  onOpenBulkModal,
  onOpenScanner,
  copiedLink,
  onToggleGuestSentStatus,
}: GuestListManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'unsent' | 'sent' | 'unopened' | 'opened' | 'attending' | 'not_attending'>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [visibleGuestLimit, setVisibleGuestLimit] = useState(25);

  const isTrial = data.isWatermarked;
  const isLimitReached = isTrial && guests.length >= 5;

  // Helper checking for guest open and attendance status
  const isGuestAttending = useCallback((g: GuestRecipient) =>
    g.isAttending === true || (g as any).attendance === 'HADIR' || (g as any).status === 'hadir', []);

  const isGuestNotAttending = useCallback((g: GuestRecipient) =>
    g.isAttending === false || (g as any).attendance === 'TIDAK_HADIR' || (g as any).status === 'tidak_hadir', []);

  const isGuestOpened = useCallback((g: GuestRecipient) =>
    Boolean(g.hasOpened || g.isCheckedIn || isGuestAttending(g) || isGuestNotAttending(g)), [isGuestAttending, isGuestNotAttending]);

  // Dynamic Unique Groups List (Termasuk Keluarga)
  const availableGroups = useMemo(() => {
    const groupSet = new Set<string>();
    guests.forEach((g) => {
      if (g.group && g.group.trim()) {
        groupSet.add(g.group.trim());
      }
    });
    // Pastikan 'Keluarga' selalu ada di pilihan jika diinginkan
    groupSet.add('Keluarga');
    return Array.from(groupSet);
  }, [guests]);

  // Realtime Live Analytics Calculations (Memoized O(N) only on guests changes)
  const { totalCount, openedCount, unopenedCount, attendingCount, notAttendingCount, familyCount, sentCount, unsentCount } = useMemo(() => {
    const total = guests.length;
    let opened = 0;
    let attending = 0;
    let notAttending = 0;
    let family = 0;
    let sent = 0;

    guests.forEach((g) => {
      if (isGuestAttending(g)) attending++;
      if (isGuestNotAttending(g)) notAttending++;
      if (isGuestOpened(g)) opened++;
      if ((g.group || '').toLowerCase() === 'keluarga') family++;
      if (g.isSent) sent++;
    });

    return {
      totalCount: total,
      openedCount: opened,
      unopenedCount: total - opened,
      attendingCount: attending,
      notAttendingCount: notAttending,
      familyCount: family,
      sentCount: sent,
      unsentCount: total - sent,
    };
  }, [guests, isGuestAttending, isGuestNotAttending, isGuestOpened]);

  // Filter guests by search query, open/attendance/sent status, and group/keluarga filter (Memoized)
  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesSearch = !q ||
        guest.name.toLowerCase().includes(q) ||
        (guest.addressOrCity && guest.addressOrCity.toLowerCase().includes(q)) ||
        (guest.city && guest.city.toLowerCase().includes(q)) ||
        (guest.group && guest.group.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Group/Keluarga Filter
      if (selectedGroupFilter !== 'all') {
        const guestGrp = (guest.group || 'Umum').toLowerCase();
        if (guestGrp !== selectedGroupFilter.toLowerCase()) {
          return false;
        }
      }

      // Status Filter
      const isOpened = isGuestOpened(guest);
      const isSent = Boolean(guest.isSent);

      return selectedStatusFilter === 'all'
        ? true
        : selectedStatusFilter === 'unsent'
        ? !isSent
        : selectedStatusFilter === 'sent'
        ? isSent
        : selectedStatusFilter === 'unopened'
        ? !isOpened
        : selectedStatusFilter === 'opened'
        ? isOpened
        : selectedStatusFilter === 'attending'
        ? isGuestAttending(guest)
        : selectedStatusFilter === 'not_attending'
        ? isGuestNotAttending(guest)
        : true;
    });
  }, [guests, searchQuery, selectedStatusFilter, selectedGroupFilter, isGuestOpened, isGuestAttending, isGuestNotAttending]);

  const paginatedGuests = useMemo(() => {
    return filteredGuests.slice(0, visibleGuestLimit);
  }, [filteredGuests, visibleGuestLimit]);

  const remainingGuestsCount = filteredGuests.length - visibleGuestLimit;

  const handleSendWhatsApp = useCallback((guest: GuestRecipient) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const text = generateWhatsAppMessage(guest, data, baseUrl);

    // Otomatis tandai sebagai Terkirim
    onToggleGuestSentStatus?.(guest.id, true);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }, [data, onToggleGuestSentStatus]);

  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const handleCopyLinkOnly = useCallback((guest: GuestRecipient) => {
    const activeSlug = data.slug || data.id || 'undangan';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedGuestId(guest.id);

    // Otomatis tandai sebagai Terkirim
    onToggleGuestSentStatus?.(guest.id, true);

    setTimeout(() => setCopiedGuestId(null), 2000);
  }, [data.slug, data.id, onToggleGuestSentStatus]);

  return (
    <div className="w-full space-y-3 max-w-full overflow-x-hidden pb-12">
      {/* 1. ULTRA COMPACT TOP BAR */}
      <div className="bg-[#111115] p-3 sm:p-4 rounded-2xl border border-white/5 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white font-serif">Daftar Tamu</h2>
          <span className="text-[10px] bg-[#c4a661]/15 text-[#c4a661] px-2 py-0.5 rounded-full font-bold border border-[#c4a661]/30">
            {totalCount}
          </span>
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenBulkModal}
            disabled={isLimitReached}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#c4a661] border border-neutral-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            title="Import Excel"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            type="button"
            onClick={() => exportGuestsToExcel(guests, data.eventTitle || data.title || 'Undangan')}
            disabled={guests.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={onOpenScanner}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#c4a661] text-neutral-950 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs hover:brightness-105"
            title="Scan QR Resepsi"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center transition cursor-pointer ${
              isAddFormOpen
                ? 'bg-neutral-800 text-white border-neutral-700'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
            title={isAddFormOpen ? 'Tutup Formulir' : 'Tambah Tamu'}
          >
            {isAddFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. COLLAPSIBLE TAMBAH TAMU FORM */}
      {isAddFormOpen && (
        <form
          onSubmit={(e) => {
            if (isLimitReached) {
              e.preventDefault();
              setShowLimitBanner(true);
              return;
            }
            onAddGuest(e);
            setIsAddFormOpen(false);
          }}
          className="bg-[#111115] p-3.5 rounded-2xl border border-[#c4a661]/40 shadow-lg space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#c4a661]">
            <span>➕ Tambah Tamu Baru</span>
            <button type="button" onClick={() => setIsAddFormOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
          </div>

          <input
            type="text"
            required
            disabled={isLimitReached}
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            placeholder={isLimitReached ? "Batas 5 tamu tercapai" : "Nama Lengkap Tamu..."}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              disabled={isLimitReached}
              value={newGuestCity}
              onChange={(e) => setNewGuestCity(e.target.value)}
              placeholder="Kota (Opsional)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
            />

            <select
              disabled={isLimitReached}
              value={newGuestGroup}
              onChange={(e) => setNewGuestGroup(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#c4a661] cursor-pointer"
            >
              <option value="Sahabat">Sahabat</option>
              <option value="Keluarga">Keluarga</option>
              <option value="VVIP">VVIP</option>
              <option value="VIP">VIP</option>
              <option value="Kolega">Kolega</option>
              <option value="Teman Kerja">Teman Kerja</option>
              <option value="Umum">Umum</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLimitReached || !newGuestName.trim()}
            className="w-full py-2 rounded-xl bg-[#c4a661] text-neutral-950 text-xs font-bold hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Tamu</span>
          </button>
        </form>
      )}

      {/* Trial Limit Warning Banner */}
      {showLimitBanner && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Batas Tamu Percobaan tercapai (Maks 5). Aktifkan lisensi untuk unlimited.</span>
          </div>
          <button type="button" onClick={() => setShowLimitBanner(false)} className="text-amber-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* 3. SEARCH & DUAL FILTER (STATUS & KELUARGA / KATEGORI) */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tamu, kota, kategori..."
            className="w-full bg-[#111115] border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* 🏷️ Group / Kategori Filter Chips (Termasuk Filter Keluarga Cepat) */}
        {guests.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 shrink-0 mr-0.5">
              Grup:
            </span>

            <button
              type="button"
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-medium transition cursor-pointer ${
                selectedGroupFilter === 'all'
                  ? 'bg-neutral-200 text-neutral-950 font-bold shadow-xs'
                  : 'bg-[#111115] border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'Keluarga' ? 'all' : 'Keluarga')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-bold transition cursor-pointer flex items-center gap-1 border ${
                selectedGroupFilter.toLowerCase() === 'keluarga'
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                  : 'bg-[#111115] border-amber-500/30 text-amber-300 hover:border-amber-500/60'
              }`}
            >
              <span>👨‍👩‍👧 Keluarga ({familyCount})</span>
            </button>

            {availableGroups
              .filter((grp) => grp.toLowerCase() !== 'keluarga')
              .map((grp) => {
                const count = guests.filter((g) => (g.group || '').toLowerCase() === grp.toLowerCase()).length;
                const isActive = selectedGroupFilter.toLowerCase() === grp.toLowerCase();
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroupFilter(isActive ? 'all' : grp)}
                    className={`px-2.5 py-1 rounded-xl shrink-0 font-medium transition cursor-pointer border ${
                      isActive
                        ? 'bg-[#c4a661] text-neutral-950 font-bold border-[#c4a661] shadow-xs'
                        : 'bg-[#111115] border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{grp} ({count})</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* 📊 Status Kehadiran / Pengiriman / Buka Filter Chips */}
        {guests.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 shrink-0 mr-0.5">
              Status:
            </span>

            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Semua
            </button>

            {/* 📤 Filter Belum Kirim */}
            <button
              onClick={() => setSelectedStatusFilter('unsent')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'unsent'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              <Send className="w-2.5 h-2.5" />
              <span>Belum Kirim ({unsentCount})</span>
            </button>

            {/* ✓ Filter Terkirim */}
            <button
              onClick={() => setSelectedStatusFilter('sent')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'sent'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-emerald-300'
              }`}
            >
              <CheckCheck className="w-2.5 h-2.5" />
              <span>Terkirim ({sentCount})</span>
            </button>

            {/* Filter Belum Buka */}
            <button
              onClick={() => setSelectedStatusFilter('unopened')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'unopened'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-neutral-500 hover:text-amber-400'
              }`}
            >
              <Mail className="w-2.5 h-2.5" />
              <span>Belum Buka ({unopenedCount})</span>
            </button>

            {/* Filter Sudah Buka */}
            <button
              onClick={() => setSelectedStatusFilter('opened')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'opened'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-neutral-500 hover:text-blue-400'
              }`}
            >
              <MailOpen className="w-2.5 h-2.5" />
              <span>Sudah Buka ({openedCount})</span>
            </button>

            {/* Filter Hadir */}
            <button
              onClick={() => setSelectedStatusFilter('attending')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'attending'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-neutral-500 hover:text-emerald-400'
              }`}
            >
              <UserCheck className="w-2.5 h-2.5" />
              <span>Hadir ({attendingCount})</span>
            </button>

            {/* Filter Tidak Hadir */}
            <button
              onClick={() => setSelectedStatusFilter('not_attending')}
              className={`px-2 py-0.5 rounded-lg shrink-0 font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'not_attending'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                  : 'text-neutral-500 hover:text-rose-400'
              }`}
            >
              <UserX className="w-2.5 h-2.5" />
              <span>Tidak Hadir ({notAttendingCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. COMPACT TABLE HEADER (NAMA | KELUARGA | AKSI) */}
      {guests.length > 0 && filteredGuests.length > 0 && (
        <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/60">
          <div className="flex-1">Nama Tamu</div>
          <div className="shrink-0 max-w-[90px] sm:max-w-[120px] text-center pr-3">Kategori</div>
          <div className="shrink-0 w-[115px] text-right">Aksi</div>
        </div>
      )}

      {/* 5. GUEST LIST CARDS (PROMINENT & DIRECTLY VISIBLE - 1 ROW COMPACT) */}
      {filteredGuests.length === 0 ? (
        <div className="p-8 text-center bg-[#111115] border border-white/5 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-500">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">
            {searchQuery
              ? `Tidak ada tamu yang cocok dengan "${searchQuery}"`
              : selectedGroupFilter !== 'all'
              ? `Tidak ada tamu di kategori "${selectedGroupFilter}"`
              : selectedStatusFilter !== 'all'
              ? `Tidak ada tamu dengan status filter ini`
              : 'Belum Ada Tamu Terdaftar'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGroupFilter('all');
              setSelectedStatusFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#c4a661] font-bold hover:underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedGuests.map((guest) => (
            <GuestCardItem
              key={guest.id}
              guest={guest}
              isCopiedOnly={copiedGuestId === guest.id}
              onSendWhatsApp={handleSendWhatsApp}
              onCopyLinkOnly={handleCopyLinkOnly}
              onViewGuestMode={onViewGuestMode}
              onDeleteGuest={onDeleteGuest}
              onToggleSent={onToggleGuestSentStatus}
            />
          ))}

          {/* 📱 Load More Button for Mobile Guest Pagination */}
          {remainingGuestsCount > 0 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleGuestLimit((prev) => prev + 20)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-md cursor-pointer border bg-[#111115] hover:bg-[#181820] text-[#c4a661] border-[#c4a661]/40"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Muat {Math.min(remainingGuestsCount, 20)} Tamu Lainnya ({remainingGuestsCount} tersisa)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

GuestListManager.displayName = 'GuestListManager';

