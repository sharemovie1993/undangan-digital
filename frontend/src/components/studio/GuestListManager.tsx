import React, { useState } from 'react';
import { Plus, Upload, QrCode, Copy, Eye, Trash2, AlertTriangle, FileSpreadsheet, Search, MessageSquare, MapPin, Users, Check, Mail, MailOpen, UserCheck, UserX, X, ChevronDown, ChevronUp } from 'lucide-react';
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
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'unopened' | 'opened' | 'attending' | 'not_attending'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  const isTrial = data.isWatermarked;
  const isLimitReached = isTrial && guests.length >= 5;

  // Helper checking for guest open and attendance status
  const isGuestAttending = (g: GuestRecipient) =>
    g.isAttending === true || (g as any).attendance === 'HADIR' || (g as any).status === 'hadir';

  const isGuestNotAttending = (g: GuestRecipient) =>
    g.isAttending === false || (g as any).attendance === 'TIDAK_HADIR' || (g as any).status === 'tidak_hadir';

  const isGuestOpened = (g: GuestRecipient) =>
    Boolean(g.hasOpened || g.isCheckedIn || isGuestAttending(g) || isGuestNotAttending(g));

  // Realtime Live Analytics Calculations
  const totalCount = guests.length;
  const openedCount = guests.filter((g) => isGuestOpened(g)).length;
  const unopenedCount = totalCount - openedCount;
  const attendingCount = guests.filter((g) => isGuestAttending(g)).length;
  const notAttendingCount = guests.filter((g) => isGuestNotAttending(g)).length;

  // Filter guests by search query and open/attendance status
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.addressOrCity && guest.addressOrCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.city && guest.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.group && guest.group.toLowerCase().includes(searchQuery.toLowerCase()));

    const isOpened = isGuestOpened(guest);
    const matchesStatus =
      selectedStatusFilter === 'all'
        ? true
        : selectedStatusFilter === 'unopened'
        ? !isOpened
        : selectedStatusFilter === 'opened'
        ? isOpened
        : selectedStatusFilter === 'attending'
        ? isGuestAttending(guest)
        : selectedStatusFilter === 'not_attending'
        ? isGuestNotAttending(guest)
        : true;

    return matchesSearch && matchesStatus;
  });

  const handleSendWhatsApp = (guest: GuestRecipient) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const text = generateWhatsAppMessage(guest, data, baseUrl);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const handleCopyLinkOnly = (guest: GuestRecipient) => {
    const activeSlug = data.slug || data.id || 'undangan';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedGuestId(guest.id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

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

      {/* 3. SEARCH & MINI STATUS PILL FILTERS (1 CLEAN ROW) */}
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

        {/* Mini Status Filter Chips (Single Scrolling Row) */}
        {guests.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1 rounded-xl shrink-0 font-semibold transition cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                  : 'bg-[#111115] border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({totalCount})
            </button>

            <button
              onClick={() => setSelectedStatusFilter('unopened')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-semibold transition cursor-pointer flex items-center gap-1 border ${
                selectedStatusFilter === 'unopened'
                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-500 shadow-xs'
                  : 'bg-[#111115] border-neutral-800 text-amber-400 hover:border-amber-500/50'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Belum Buka ({unopenedCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('opened')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-semibold transition cursor-pointer flex items-center gap-1 border ${
                selectedStatusFilter === 'opened'
                  ? 'bg-blue-500 text-white font-bold border-blue-500 shadow-xs'
                  : 'bg-[#111115] border-neutral-800 text-blue-400 hover:border-blue-500/50'
              }`}
            >
              <MailOpen className="w-3 h-3" />
              <span>Sudah Buka ({openedCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('attending')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-semibold transition cursor-pointer flex items-center gap-1 border ${
                selectedStatusFilter === 'attending'
                  ? 'bg-emerald-500 text-neutral-950 font-bold border-emerald-500 shadow-xs'
                  : 'bg-[#111115] border-neutral-800 text-emerald-400 hover:border-emerald-500/50'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Hadir ({attendingCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('not_attending')}
              className={`px-2.5 py-1 rounded-xl shrink-0 font-semibold transition cursor-pointer flex items-center gap-1 border ${
                selectedStatusFilter === 'not_attending'
                  ? 'bg-rose-500 text-white font-bold border-rose-500 shadow-xs'
                  : 'bg-[#111115] border-neutral-800 text-rose-400 hover:border-rose-500/50'
              }`}
            >
              <UserX className="w-3 h-3" />
              <span>Tidak Hadir ({notAttendingCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. GUEST LIST CARDS (PROMINENT & DIRECTLY VISIBLE) */}
      {filteredGuests.length === 0 ? (
        <div className="p-8 text-center bg-[#111115] border border-white/5 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-500">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">
            {searchQuery
              ? `Tidak ada tamu yang cocok dengan "${searchQuery}"`
              : selectedStatusFilter !== 'all'
              ? `Tidak ada tamu dengan status filter ini`
              : 'Belum Ada Tamu Terdaftar'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddFormOpen(true)}
            className="text-xs text-[#c4a661] font-bold hover:underline"
          >
            + Tambah Tamu Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGuests.map((guest) => {
            const cityText = guest.addressOrCity || guest.city;
            const isCopied = copiedLink === guest.name;
            const isOpened = isGuestOpened(guest);

            return (
              <div
                key={guest.id}
                className="bg-[#111115] hover:bg-[#16161c] border border-white/5 rounded-2xl p-3 space-y-2 transition shadow-xs"
              >
                {/* Top Row: Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                      {guest.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-400 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
                        {guest.group || 'Tamu Undangan'}
                      </span>
                      {cityText && (
                        <span className="flex items-center gap-0.5 text-neutral-400">
                          <MapPin className="w-2.5 h-2.5 text-[#c4a661]" />
                          <span>{cityText}</span>
                        </span>
                      )}
                      {guest.paxQuota && (
                        <span className="text-neutral-500">
                          • {guest.paxQuota} Pax
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance & Open Status Badge */}
                  <div>
                    {isGuestAttending(guest) ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                        ✓ Hadir
                      </span>
                    ) : isGuestNotAttending(guest) ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 flex items-center gap-1">
                        ✕ Tidak Hadir
                      </span>
                    ) : isOpened ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium shrink-0 flex items-center gap-1">
                        <MailOpen className="w-2.5 h-2.5" />
                        <span>Sudah Dibuka</span>
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium shrink-0 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" />
                        <span>Belum Dibuka</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800/60 gap-1.5">
                  {/* WhatsApp Direct Share Button */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(guest)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Kirim Undangan Langsung ke WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Kirim WA</span>
                  </button>

                  {/* Copy Link Button (Only Copies URL without opening WhatsApp) */}
                  <button
                    type="button"
                    onClick={() => handleCopyLinkOnly(guest)}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Salin Link Undangan Khusus"
                  >
                    {copiedGuestId === guest.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => onViewGuestMode(guest.name)}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                    title="Lihat Pratinjau Undangan Tamu Ini"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                    title="Hapus Tamu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
