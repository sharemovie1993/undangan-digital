import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Download,
  UploadCloud,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  Layers,
  ShieldCheck,
  HardDrive,
  Sparkles,
  Clock,
  X,
  FileText,
  Check,
  Server,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import { backupApi, BackupItem, BackupManifest } from '../api/backup.api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useQueryClient } from '@tanstack/react-query';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingType, setCreatingType] = useState<'full' | 'db' | null>(null);

  // Restore State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgressStep, setRestoreProgressStep] = useState<number>(0);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load backups list when modal opens
  const loadBackups = async () => {
    try {
      setIsLoadingList(true);
      const data = await backupApi.list();
      setBackups(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat riwayat backup.', 'Kesalahan');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBackups();
      setSelectedFile(null);
      setRestoreResult(null);
      setRestoreProgressStep(0);
    }
  }, [isOpen]);

  const handleCreateBackup = async (includeMedia: boolean) => {
    try {
      setIsCreating(true);
      setCreatingType(includeMedia ? 'full' : 'db');
      const result = await backupApi.create(includeMedia);
      showToast(
        'success',
        `Arsip ${result.filename} (${result.sizeFormatted}) berhasil dibuat di server. Memulai unduhan otomatis...`,
        'Backup Selesai'
      );
      await loadBackups();

      // 📥 Otomatis download file ZIP langsung ke komputer user
      try {
        await backupApi.download(result.filename);
      } catch (dlErr: any) {
        console.warn('Auto-download warning:', dlErr.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal membuat backup data.', 'Gagal');
    } finally {
      setIsCreating(false);
      setCreatingType(null);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      showToast('info', `Menyiapkan berkas ${filename}...`, 'Mengunduh');
      await backupApi.download(filename);
      showToast('success', `Berkas ${filename} berhasil diunduh.`, 'Download Selesai');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengunduh berkas backup.', 'Download Gagal');
    }
  };

  const handleDelete = async (filename: string) => {
    const confirmed = await confirm({
      type: 'delete',
      title: 'Hapus Berkas Backup?',
      description: `Berkas arsip "${filename}" akan dihapus permanen dari penyimpanan server.`,
      confirmLabel: 'Ya, Hapus Berkas',
      cancelLabel: 'Batal',
      isDestructive: true
    });

    if (confirmed) {
      try {
        await backupApi.delete(filename);
        showToast('success', `Berkas ${filename} telah dihapus.`, 'Terhapus');
        await loadBackups();
      } catch (err: any) {
        showToast('error', err.message || 'Gagal menghapus file backup.', 'Gagal');
      }
    }
  };

  // Restore Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setRestoreResult(null);
      } else {
        showToast('warning', 'Harap pilih berkas arsip dengan ekstensi .zip', 'Format Tidak Didukung');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setRestoreResult(null);
      } else {
        showToast('warning', 'Harap pilih berkas arsip dengan ekstensi .zip', 'Format Tidak Didukung');
      }
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) return;

    const confirmed = await confirm({
      type: 'token_activate',
      title: 'Konfirmasi Pemulihan Sistem (Restore)',
      description: `Apakah Anda yakin ingin memulihkan data dari berkas "${selectedFile.name}" (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)? Seluruh data undangan, tamu, ucapan, dan foto media akan disinkronkan ke server ini.`,
      confirmLabel: '🚀 Ya, Mulai Restore Sekarang',
      cancelLabel: 'Batal'
    });

    if (!confirmed) return;

    try {
      setIsRestoring(true);
      setRestoreProgressStep(1); // Verifikasi ZIP & Manifest

      // Simulasi smooth visual stepping
      setTimeout(() => setRestoreProgressStep(2), 600); // Ekstraksi Media
      setTimeout(() => setRestoreProgressStep(3), 1200); // Sinkronisasi Database Prisma

      const result = await backupApi.restore(selectedFile);

      setRestoreProgressStep(4); // Selesai
      setRestoreResult(result);
      showToast('success', result.message || 'Pemulihan data berhasil diselesaikan!', 'Restore Selesai');

      // Refresh seluruh data query aplikasi
      queryClient.invalidateQueries();
      loadBackups();
    } catch (err: any) {
      setRestoreProgressStep(0);
      showToast('error', err.message || 'Terjadi kesalahan saat memulihkan berkas backup.', 'Restore Gagal');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#111116] border border-[#262633] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        >
          {/* Header (Mobile, Tablet, Desktop Optimized) */}
          <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 border-b border-[#20202b] bg-[#14141c]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-bold shadow-md sm:shadow-lg shadow-[#c4a661]/20 shrink-0">
                <Database className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white tracking-wide truncate">
                    Backup & Disaster Recovery Studio
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-[#c4a661]/15 text-[#c4a661] border border-[#c4a661]/30 shrink-0">
                    FULL UI
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate sm:whitespace-normal">
                  Cadangkan seluruh database & berkas media (foto/audio) untuk migrasi server instan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer shrink-0 ml-2"
              aria-label="Tutup Modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Scrollable on Mobile, Fluid on Tablet & Desktop) */}
          <div className="flex items-center gap-1 sm:gap-2 px-3.5 sm:px-5 md:px-6 pt-2 sm:pt-3 border-b border-[#20202b] bg-[#111116] shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'backup'
                  ? 'border-[#c4a661] text-[#c4a661] bg-[#c4a661]/10'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">1. Cadangkan & Unduh</span>
              <span className="hidden sm:inline">1. Cadangkan & Unduh Backup (Server)</span>
            </button>
            <button
              onClick={() => setActiveTab('restore')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'restore'
                  ? 'border-[#c4a661] text-[#c4a661] bg-[#c4a661]/10'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">2. Pulihkan (Restore)</span>
              <span className="hidden sm:inline">2. Pulihkan Data / Migrasi Server Baru (Restore)</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
            {/* TAB 1: BACKUP */}
            {activeTab === 'backup' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Backup Actions Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Full Backup Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a1712] to-[#121217] border border-[#c4a661]/40 flex flex-col justify-between relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4a661]/5 rounded-full blur-2xl group-hover:bg-[#c4a661]/10 transition pointer-events-none" />
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#c4a661]/20 text-[#c4a661] flex items-center justify-center font-bold">
                          <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          RECOMMENDED MIGRASI
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                        Full Backup (Database + Seluruh Media)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-400 mb-3 sm:mb-4 leading-relaxed">
                        Mengemas seluruh tabel database Prisma + seluruh foto galeri mempelai, lagu MP3 vinyl, dan avatar ke dalam berkas ZIP terkompresi.
                      </p>
                    </div>

                    <button
                      disabled={isCreating}
                      onClick={() => handleCreateBackup(true)}
                      className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#c4a661] to-[#a38540] hover:brightness-110 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {isCreating && creatingType === 'full' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          <span>Mengemas Database & Media ZIP...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Buat Full Backup (.zip)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Database Only Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#14141a] border border-[#262633] flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold mb-2">
                        <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                        Database Only (JSON Dump Ringkas)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-400 mb-3 sm:mb-4 leading-relaxed">
                        Cadangan ringan berukuran beberapa kilobyte khusus data relasional (Akun, Tamu, RSVP, Tema, Pesanan) tanpa file fisik media.
                      </p>
                    </div>

                    <button
                      disabled={isCreating}
                      onClick={() => handleCreateBackup(false)}
                      className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isCreating && creatingType === 'db' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          <span>Membuat Dump Database...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                          <span>Buat Backup Database Saja</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Backups List Table / Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c4a661]" />
                      <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                        Riwayat Arsip Backup Tersimpan ({backups.length})
                      </h3>
                    </div>
                    <button
                      onClick={loadBackups}
                      disabled={isLoadingList}
                      className="text-[11px] sm:text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {backups.length === 0 ? (
                    <div className="p-6 sm:p-8 rounded-2xl bg-[#14141a] border border-[#20202a] text-center space-y-1.5 sm:space-y-2">
                      <FileArchive className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400">Belum ada berkas backup yang dibuat di server.</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500">
                        Klik tombol di atas untuk membuat backup pertama Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-2.5">
                      {backups.map((item) => (
                        <div
                          key={item.filename}
                          className="p-3 sm:p-4 rounded-2xl bg-[#14141c] border border-[#22222e] hover:border-[#38384d] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 shadow-sm"
                        >
                          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                              <FileArchive className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-mono text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] xs:max-w-[260px] sm:max-w-[340px] md:max-w-[420px]">
                                  {item.filename}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                                  {item.sizeFormatted}
                                </span>
                                {item.manifest?.backupType === 'FULL' ? (
                                  <span className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    FULL ZIP
                                  </span>
                                ) : (
                                  <span className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                    DB ONLY
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] text-neutral-400 mt-1 flex-wrap">
                                <span>
                                  {new Date(item.createdAt).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {item.manifest && (
                                  <>
                                    <span className="hidden xs:inline">•</span>
                                    <span className="text-neutral-300">
                                      📊 {item.manifest.counts.invitations} Undangan, {item.manifest.counts.guests} Tamu, {item.manifest.counts.rsvps} Doa
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t border-neutral-800/40 sm:border-t-0">
                            <button
                              onClick={() => handleDownload(item.filename)}
                              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#c4a661]/15 hover:bg-[#c4a661]/25 border border-[#c4a661]/35 text-[#c4a661] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              title="Unduh Berkas ZIP"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh ZIP</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.filename)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs transition cursor-pointer"
                              title="Hapus Berkas dari Server"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: RESTORE */}
            {activeTab === 'restore' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Info Note */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Skenario Migrasi Server Baru:</span>
                    <p className="mt-0.5">
                      Unggah berkas arsip <code className="bg-black/40 px-1.5 py-0.5 rounded text-white">.zip</code> yang sebelumnya telah Anda unduh dari server lama. Sistem akan mengekstrak seluruh file foto, musik vinyl, dan menyinkronkan seluruh database menggunakan transaksi aman Prisma tanpa memutus relasi yang ada.
                    </p>
                  </div>
                </div>

                {/* Dropzone (Responsive Padding & Typography) */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => !isRestoring && fileInputRef.current?.click()}
                  className={`p-5 sm:p-8 border-2 border-dashed rounded-2xl sm:rounded-3xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 sm:gap-3 ${
                    isDragging
                      ? 'border-[#c4a661] bg-[#c4a661]/10'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-[#2c2c3d] hover:border-[#c4a661]/50 bg-[#14141c]'
                  } ${isRestoring ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {selectedFile ? (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="px-2">
                        <div className="text-xs sm:text-sm font-bold text-white break-all">{selectedFile.name}</div>
                        <div className="text-[11px] sm:text-xs text-emerald-400 font-mono mt-0.5">
                          Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap Dipulihkan
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-xs text-neutral-400 hover:text-rose-400 underline mt-1"
                      >
                        Ganti Berkas Lain
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#c4a661]/15 text-[#c4a661] border border-[#c4a661]/30 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          Drag & Drop Berkas Backup (.zip) ke sini
                        </div>
                        <div className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">
                          atau klik untuk memilih file dari komputer / ponsel Anda
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress / Step Feedback during Restore */}
                {isRestoring && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-[#2a2a3a] space-y-2.5 sm:space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Proses Pemulihan Berjalan...</span>
                      <span className="text-[#c4a661] font-mono">{restoreProgressStep * 25}%</span>
                    </div>

                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#c4a661] to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${restoreProgressStep * 25}%` }}
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-neutral-300 pt-1">
                      <div className={`flex items-center gap-2 ${restoreProgressStep >= 1 ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                        {restoreProgressStep >= 1 ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                        <span>1. Validasi Integritas Arsip & Metadata Manifest</span>
                      </div>
                      <div className={`flex items-center gap-2 ${restoreProgressStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                        {restoreProgressStep >= 2 ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                        <span>2. Ekstraksi File Foto, Galeri, & Musik Vinyl ke Storage</span>
                      </div>
                      <div className={`flex items-center gap-2 ${restoreProgressStep >= 3 ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                        {restoreProgressStep >= 3 ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                        <span>3. Sinkronisasi Database Prisma (Users, Undangan, Tamu, Doa, Pesanan)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${restoreProgressStep >= 4 ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                        {restoreProgressStep >= 4 ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
                        <span>4. Penyelesaian & Sinkronisasi Cache</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Restore Result Card */}
                {restoreResult && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span>{restoreResult.message}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                        <div className="text-neutral-400 text-[9px] sm:text-[10px]">Undangan</div>
                        <div className="text-white font-bold text-xs sm:text-sm">{restoreResult.data?.restoredCounts?.invitations ?? 0}</div>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                        <div className="text-neutral-400 text-[9px] sm:text-[10px]">Tamu & QR</div>
                        <div className="text-white font-bold text-xs sm:text-sm">{restoreResult.data?.restoredCounts?.guests ?? 0}</div>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                        <div className="text-neutral-400 text-[9px] sm:text-[10px]">RSVP / Ucapan</div>
                        <div className="text-white font-bold text-xs sm:text-sm">{restoreResult.data?.restoredCounts?.rsvps ?? 0}</div>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                        <div className="text-neutral-400 text-[9px] sm:text-[10px]">Berkas Media</div>
                        <div className="text-white font-bold text-xs sm:text-sm">{restoreResult.data?.restoredCounts?.mediaFiles ?? 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={!selectedFile || isRestoring}
                  onClick={handleExecuteRestore}
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition disabled:opacity-40 cursor-pointer"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span>Sedang Memulihkan Database & Media...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>🚀 Jalankan Pemulihan Database & Media</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 border-t border-[#20202b] bg-[#14141c] flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 shrink-0">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c4a661] shrink-0" />
              <span className="truncate">Proteksi Transaksional Relasional Prisma</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition cursor-pointer shrink-0"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
