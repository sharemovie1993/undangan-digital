import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, Download, Check, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { downloadGuestTemplateExcel, parseExcelOrCsvFile, ParsedGuestRow } from '../../utils/excelGuests';
import { GuestRecipient } from '../../types';

interface BulkGuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGuests: (guests: GuestRecipient[]) => void;
}

export const BulkGuestImportModal: React.FC<BulkGuestImportModalProps> = ({
  isOpen,
  onClose,
  onImportGuests,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'text'>('excel');
  const [bulkText, setBulkText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedGuestRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMsg(null);
    setUploadedFileName(file.name);

    try {
      const rows = await parseExcelOrCsvFile(file);
      if (rows.length === 0) {
        setErrorMsg('Tidak ditemukan data tamu yang valid di dalam file ini.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal membaca file Excel/CSV. Pastikan format file tidak rusak.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleProcessTextImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim());
    const generated: GuestRecipient[] = lines.map((line, idx) => {
      const parts = line.split(',');
      const name = parts[0]?.trim() || `Tamu ${idx + 1}`;
      const addressOrCity = parts[1]?.trim() || '';
      const group = parts[2]?.trim() || 'Tamu Undangan';

      return {
        id: `g-import-${Date.now()}-${idx}`,
        name,
        addressOrCity,
        group,
        paxQuota: 2,
        hasOpened: false,
      };
    });

    onImportGuests(generated);
    onClose();
  };

  const handleConfirmExcelImport = () => {
    if (parsedRows.length === 0) return;

    const generated: GuestRecipient[] = parsedRows.map((r, idx) => ({
      id: `g-excel-${Date.now()}-${idx}`,
      name: r.name,
      addressOrCity: r.addressOrCity || '',
      group: r.group || 'Tamu Undangan',
      paxQuota: r.paxQuota || 2,
      hasOpened: false,
    }));

    onImportGuests(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#111115] border border-[#c4a661]/40 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white leading-tight">
                Impor Tamu Massal
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9.5px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Excel & CSV
                </span>
                <span className="text-[10.5px] text-neutral-400">Multi-baris instan</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Upload Excel vs Paste Text */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer truncate ${
              activeTab === 'excel'
                ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Upload File Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer truncate ${
              activeTab === 'text'
                ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tempel Teks Massal</span>
          </button>
        </div>

        {/* TAB 1: EXCEL UPLOAD */}
        {activeTab === 'excel' && (
          <div className="space-y-3.5 text-xs">
            {/* Download Template Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 gap-2.5">
              <div className="text-[11px] text-neutral-300 leading-relaxed">
                <span className="font-semibold text-[#c4a661]">Belum punya file Excel?</span> Unduh template siap pakai dengan kolom standar.
              </div>
              <button
                type="button"
                onClick={downloadGuestTemplateExcel}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Unduh Template .xlsx</span>
              </button>
            </div>

            {/* Dropzone File Picker */}
            <div className="relative border-2 border-dashed border-neutral-700 hover:border-[#c4a661] rounded-2xl p-5 text-center transition bg-neutral-950/60 group cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none px-2">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c4a661] group-hover:scale-110 transition shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="max-w-full">
                  {uploadedFileName ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold max-w-full">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span className="truncate max-w-[240px] sm:max-w-[340px]">{uploadedFileName}</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-white">
                        Klik atau Tarik File Excel / CSV ke Sini
                      </p>
                      <p className="text-[10.5px] text-neutral-500 mt-0.5">
                        Mendukung file Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Parsing Spinner */}
            {isParsing && (
              <div className="p-3 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#c4a661] border-t-transparent rounded-full animate-spin" />
                <span>Sedang membaca & menganalisis file Excel...</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Terdeteksi {parsedRows.length} Tamu Siap Diimpor:</span>
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 divide-y divide-neutral-900 text-[11px] scrollbar-thin">
                  {parsedRows.slice(0, 50).map((r, i) => (
                    <div key={i} className="p-2 px-3 flex items-center justify-between">
                      <div className="font-medium text-white truncate max-w-[200px]">{r.name}</div>
                      <div className="text-neutral-500 text-[10px] flex items-center gap-2">
                        <span>{r.addressOrCity || '-'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">{r.group}</span>
                      </div>
                    </div>
                  ))}
                  {parsedRows.length > 50 && (
                    <div className="p-2 text-center text-[10px] text-neutral-500 italic">
                      + {parsedRows.length - 50} tamu lainnya...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelImport}
                disabled={parsedRows.length === 0}
                className="px-5 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold hover:bg-[#d5b874] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Impor {parsedRows.length} Tamu Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TEXT PASTE */}
        {activeTab === 'text' && (
          <form onSubmit={handleProcessTextImport} className="space-y-3.5 text-xs">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Tempel daftar nama tamu (1 nama per baris). Format: <code className="text-[#c4a661]">Nama, Kota, Kategori</code>
            </p>

            <textarea
              required
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                'Contoh:\nBpk. Dr. Hendra Suprayogi, Jakarta, VVIP\nIbu Hj. Aminah & Keluarga, Bandung, Keluarga\nSahabat Kuliah Angkatan 2019, Surabaya, Sahabat\ndr. Farhan Maulana, Jakarta, Kolega'
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#c4a661] font-mono text-[11px] leading-relaxed"
            />

            <div className="flex items-center justify-between text-neutral-500 text-[11px]">
              <span>Format: Nama, Kota, Kategori</span>
              <span>{bulkText.split('\n').filter((l) => l.trim()).length} Baris terdeteksi</span>
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
                className="px-5 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold hover:bg-[#d5b874] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Impor Tamu Teks</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
