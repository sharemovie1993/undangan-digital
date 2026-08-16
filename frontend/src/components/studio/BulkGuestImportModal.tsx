import React from 'react';
import { Upload, X } from 'lucide-react';

interface BulkGuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkText: string;
  setBulkText: (text: string) => void;
  onProcessImport: (e: React.FormEvent) => void;
}

export const BulkGuestImportModal: React.FC<BulkGuestImportModalProps> = ({
  isOpen,
  onClose,
  bulkText,
  setBulkText,
  onProcessImport,
}) => {
  if (!isOpen) return null;

  const detectedLineCount = bulkText.split('\n').filter((l) => l.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111115] border border-[#1f1f27] rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f1f27] pb-3">
          <div className="flex items-center gap-2 text-[#c4a661] font-bold text-sm">
            <Upload className="w-4 h-4" />
            <span>Impor Tamu Massal (Multi-Line)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Tempel daftar tamu (1 nama per baris). Anda juga dapat menambahkan kota setelah tanda
          koma.
        </p>

        <form onSubmit={onProcessImport} className="space-y-4 text-xs">
          <textarea
            required
            rows={6}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              'Contoh:\nBpk. Dr. Hendra Suprayogi, Jakarta\nIbu Hj. Aminah & Keluarga, Bandung\nSahabat Kuliah Angkatan 2019, Surabaya\ndr. Farhan Maulana, Jakarta'
            }
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#c4a661] font-mono text-[11px]"
          />

          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Format otomatis: Nama, Kota</span>
            <span>{detectedLineCount} Baris terdeteksi</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!bulkText.trim()}
              className="px-5 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold hover:bg-[#d5b874] transition cursor-pointer disabled:opacity-50"
            >
              Impor Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
