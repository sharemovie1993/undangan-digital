import React from 'react';
import { Plus, Upload, Download, QrCode, Copy, Send, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { GuestRecipient, InvitationData } from '../../types';
import { api } from '../../api/client';

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
  const [showLimitBanner, setShowLimitBanner] = React.useState(false);
  const isTrial = data.isWatermark;
  const isLimitReached = isTrial && guests.length >= 5;

  return (
    <div className="space-y-4">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111115] p-4 rounded-2xl border border-white/5 shadow-md">
        <div>
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <span>Daftar Tamu Undangan & Presensi</span>
            <span className="text-xs bg-[#c4a661]/15 text-[#c4a661] px-2.5 py-0.5 rounded-full font-sans font-semibold border border-[#c4a661]/30">
              {guests.length} Tamu
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Kelola nama tamu khusus, kategori VIP, tautan WhatsApp, dan check-in QR Code.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenBulkModal}
            disabled={isLimitReached}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10 disabled:opacity-50"
            title="Import Banyak Tamu dari Excel / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#c4a661]" />
            <span>Import Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!data.id) return;
              window.open(api.getGuestExportCsvUrl(data.id), '_blank');
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10"
            title="Download Format Excel / CSV Tamu"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition cursor-pointer"
            title="Buka QR Scanner Penerima Tamu di Lokasi Resepsi"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Buku Tamu</span>
          </button>
        </div>
      </div>

      {showLimitBanner && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Batas Tamu Percobaan tercapai (Maksimal 5 Tamu). Silakan aktifkan lisensi resmi untuk menambah tamu tanpa batas.</span>
          </div>
          <button type="button" onClick={() => setShowLimitBanner(false)} className="text-amber-400 hover:text-white font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Guest Limit Status for Trial Mode */}
      {isTrial && (
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Mode Percobaan: Maksimal <strong>5 Tamu</strong> ({guests.length}/5 Tamu Terdaftar)
            </span>
          </div>
          {isLimitReached && (
            <span className="text-[10px] font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full">
              Batas Maksimal
            </span>
          )}
        </div>
      )}

      {/* Add New Guest Form */}
      <form
        onSubmit={(e) => {
          if (isLimitReached) {
            e.preventDefault();
            setShowLimitBanner(true);
            return;
          }
          onAddGuest(e);
        }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-[#17171d] p-3 rounded-xl border border-white/5"
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            required
            disabled={isLimitReached}
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            placeholder={isLimitReached ? "Batas 5 tamu tercapai (Aktifkan lisensi)" : "Nama Lengkap / Gelar Tamu..."}
            className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c4a661] disabled:opacity-50"
          />
        </div>
        <div>
          <input
            type="text"
            disabled={isLimitReached}
            value={newGuestCity}
            onChange={(e) => setNewGuestCity(e.target.value)}
            placeholder="Kota Asal (Contoh: Bandung)"
            className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c4a661] disabled:opacity-50"
          />
        </div>
        <div className="flex gap-2">
          <select
            disabled={isLimitReached}
            value={newGuestGroup}
            onChange={(e) => setNewGuestGroup(e.target.value)}
            className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#c4a661] disabled:opacity-50"
          >
            <option value="Keluarga">Keluarga</option>
            <option value="Sahabat">Sahabat</option>
            <option value="VIP">VIP</option>
            <option value="Rekan Kerja">Rekan Kerja</option>
          </select>
          <button
            type="submit"
            disabled={isLimitReached}
            className="px-3.5 py-2 bg-[#c4a661] text-neutral-950 rounded-lg text-xs font-bold hover:bg-[#d5b874] transition flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Guest Recipients Table */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-3 bg-[#17171d] hover:bg-[#1f1f27] border border-white/5 rounded-xl transition"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs truncate">{guest.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                  {guest.group || 'Umum'}
                </span>
                {guest.city && (
                  <span className="text-[9px] text-gray-500 truncate hidden sm:inline">
                    • {guest.city}
                  </span>
                )}
                {guest.isAttending !== null && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    guest.isAttending
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {guest.isAttending ? 'Hadir' : 'Tidak Hadir'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onViewGuestMode(guest.name)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition"
                title="Buka Preview Tamu Ini"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onCopyWhatsAppShare(guest)}
                className="px-2.5 py-1.5 bg-[#c4a661]/15 hover:bg-[#c4a661]/25 text-[#c4a661] border border-[#c4a661]/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Salin Teks WhatsApp Khusus Tamu Ini"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {copiedLink === guest.name ? 'Tersalin' : 'Salin Teks'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteGuest(guest.id)}
                className="p-1.5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 rounded-lg transition"
                title="Hapus Tamu"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
