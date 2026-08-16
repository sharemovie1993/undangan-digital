import React, { useState } from 'react';
import { Plus, Upload, QrCode, Copy, Send, Eye, Trash2, AlertTriangle, FileSpreadsheet, Search, MessageSquare, MapPin, Users, Check } from 'lucide-react';
import { GuestRecipient, InvitationData } from '../../types';
import { exportGuestsToExcel } from '../../utils/excelGuests';

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
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  const isTrial = data.isWatermarked;
  const isLimitReached = isTrial && guests.length >= 5;

  // Filter guests by search query and category
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.addressOrCity && guest.addressOrCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.city && guest.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGroup =
      selectedGroupFilter === 'all' || (guest.group && guest.group.toLowerCase() === selectedGroupFilter.toLowerCase());

    return matchesSearch && matchesGroup;
  });

  // Extract unique groups for filter chips
  const allGroups = Array.from(new Set(guests.map((g) => g.group || 'Umum')));

  const handleSendWhatsApp = (guest: GuestRecipient) => {
    const activeSlug = data.slug || data.id || 'undangan';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;
    const eventName = data.eventTitle || data.title || 'Momen Bahagia Kami';

    const text = `Kepada Yth. *${guest.name}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara *${eventName}*.\n\nBuka tautan undangan digital Anda di sini:\n👉 ${shareUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLinkOnly = (guest: GuestRecipient) => {
    const activeSlug = data.slug || data.id || 'undangan';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';
    const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;

    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="w-full space-y-4 max-w-full overflow-x-hidden">
      {/* 1. HEADER CARD WITH ACTION BUTTONS */}
      <div className="bg-[#111115] p-3.5 sm:p-5 rounded-2xl border border-white/5 shadow-md space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-serif font-bold text-white">
                Daftar Tamu Undangan
              </h2>
              <span className="text-[10px] sm:text-xs bg-[#c4a661]/15 text-[#c4a661] px-2.5 py-0.5 rounded-full font-sans font-semibold border border-[#c4a661]/30 shrink-0">
                {guests.length} Tamu
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Kelola nama tamu khusus, kirim WhatsApp, & scan QR resepsi.
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenBulkModal}
              disabled={isLimitReached}
              className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-neutral-800 disabled:opacity-50"
              title="Import Banyak Tamu dari Excel / CSV"
            >
              <Upload className="w-3.5 h-3.5 text-[#c4a661] shrink-0" />
              <span className="truncate">Import Excel/CSV</span>
            </button>

            <button
              type="button"
              onClick={() => exportGuestsToExcel(guests, data.eventTitle || data.title || 'Undangan')}
              disabled={guests.length === 0}
              className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-neutral-800 disabled:opacity-50"
              title="Download Format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Export Excel (.xlsx)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#c4a661] via-amber-400 to-[#c4a661] text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition cursor-pointer"
            title="Buka QR Scanner Penerima Tamu di Lokasi Resepsi"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Buka Scan QR Buku Tamu Resepsi</span>
          </button>
        </div>
      </div>

      {/* Trial Limit Warning Banner */}
      {showLimitBanner && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Batas Tamu Percobaan tercapai (Maksimal 5 Tamu). Silakan aktifkan lisensi resmi untuk menambah tamu tanpa batas.</span>
          </div>
          <button type="button" onClick={() => setShowLimitBanner(false)} className="text-amber-400 hover:text-white font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* 2. FORM TAMBAH TAMU MANUAL (RESPONSIVE) */}
      <form
        onSubmit={(e) => {
          if (isLimitReached) {
            e.preventDefault();
            setShowLimitBanner(true);
            return;
          }
          onAddGuest(e);
        }}
        className="bg-[#111115] p-3.5 sm:p-4 rounded-2xl border border-white/5 shadow-sm space-y-2.5"
      >
        <div className="text-[11px] font-bold text-[#c4a661] flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tamu Satu per Satu</span>
        </div>

        <div>
          <input
            type="text"
            required
            disabled={isLimitReached}
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            placeholder={isLimitReached ? "Batas 5 tamu tercapai (Aktifkan lisensi)" : "Nama Lengkap / Gelar Tamu..."}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            disabled={isLimitReached}
            value={newGuestCity}
            onChange={(e) => setNewGuestCity(e.target.value)}
            placeholder="Kota (Opsional)"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] disabled:opacity-50"
          />

          <select
            disabled={isLimitReached}
            value={newGuestGroup}
            onChange={(e) => setNewGuestGroup(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#c4a661] disabled:opacity-50 cursor-pointer"
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
          <span>Tambahkan ke Daftar Tamu</span>
        </button>
      </form>

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      {guests.length > 0 && (
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tamu / kota..."
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

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1 rounded-lg shrink-0 font-semibold transition cursor-pointer ${
                selectedGroupFilter === 'all'
                  ? 'bg-[#c4a661] text-neutral-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({guests.length})
            </button>
            {allGroups.map((grp) => {
              const count = guests.filter((g) => (g.group || 'Umum') === grp).length;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroupFilter(grp)}
                  className={`px-3 py-1 rounded-lg shrink-0 font-semibold transition cursor-pointer ${
                    selectedGroupFilter.toLowerCase() === grp.toLowerCase()
                      ? 'bg-[#c4a661] text-neutral-950'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {grp} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. GUEST LIST CARDS (RESPONSIVE FOR MOBILE) */}
      {filteredGuests.length === 0 ? (
        <div className="p-8 text-center bg-[#111115] border border-white/5 rounded-2xl space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-500">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-white">
            {searchQuery ? `Tidak ada tamu yang cocok dengan "${searchQuery}"` : 'Belum Ada Tamu Terdaftar'}
          </p>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
            Gunakan formulir di atas untuk menambah tamu atau impor langsung file Excel/CSV.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredGuests.map((guest) => {
            const cityText = guest.addressOrCity || guest.city;
            const isCopied = copiedLink === guest.name;

            return (
              <div
                key={guest.id}
                className="bg-[#111115] hover:bg-[#16161c] border border-white/5 rounded-2xl p-3 sm:p-3.5 space-y-2.5 transition shadow-xs"
              >
                {/* Top Row: Name & Group Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                      {guest.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400 flex-wrap">
                      <span className="px-2 py-0.2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
                        {guest.group || 'Tamu Undangan'}
                      </span>
                      {cityText && (
                        <span className="flex items-center gap-0.5 text-neutral-400">
                          <MapPin className="w-3 h-3 text-[#c4a661]" />
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

                  {/* Attendance Badge */}
                  <div>
                    {guest.isAttending !== null && guest.isAttending !== undefined ? (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          guest.isAttending
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {guest.isAttending ? '✓ Hadir' : '✕ Tidak Hadir'}
                      </span>
                    ) : guest.hasOpened ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium shrink-0">
                        Sudah Dibuka
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-medium shrink-0">
                        Belum Dibuka
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Row (Thumb-Friendly Buttons) */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/70 gap-1.5 flex-wrap">
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

                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyLinkOnly(guest);
                      onCopyWhatsAppShare(guest);
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Salin Link Undangan Khusus"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => onViewGuestMode(guest.name)}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                    title="Lihat Pratinjau Undangan Tamu Ini"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
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
