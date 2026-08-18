import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, X, Loader2, KeyRound, Printer, EyeOff } from 'lucide-react';
import { adminApi } from '../api/admin.api';
import { useToast } from '../context/ToastContext';

interface AdminOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: {
    id: string;
    title: string;
    slug: string;
    status: string;
    isWatermark: boolean;
    allowPrintKit: boolean;
    planId?: string | null;
  } | null;
  onUpdated: () => void;
}

export const AdminOverrideModal: React.FC<AdminOverrideModalProps> = ({
  isOpen,
  onClose,
  invitation,
  onUpdated
}) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<string>('ACTIVE');
  const [isWatermark, setIsWatermark] = useState<boolean>(false);
  const [allowPrintKit, setAllowPrintKit] = useState<boolean>(true);
  const [planId, setPlanId] = useState<string>('PLATINUM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (invitation) {
      setStatus(invitation.status || 'ACTIVE');
      setIsWatermark(Boolean(invitation.isWatermark));
      setAllowPrintKit(Boolean(invitation.allowPrintKit));
      setPlanId(invitation.planId || 'PLATINUM');
    }
  }, [invitation, isOpen]);

  const handleSave = async () => {
    if (!invitation) return;

    try {
      setIsSubmitting(true);
      await adminApi.overrideInvitation(invitation.id, {
        status,
        isWatermark,
        allowPrintKit,
        planId
      });
      showToast(
        'success',
        `Status & Fitur lisensi undangan "${invitation.title}" berhasil di-override!`,
        'Override Berhasil'
      );
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengubah status lisensi.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !invitation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#14141d] border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222233] bg-[#161622] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Override Lisensi & Fitur</h3>
                <p className="text-xs text-neutral-400">Atur status paket tanpa memotong token user</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Invitation Info */}
          <div className="p-4 bg-[#111118] border-b border-[#20202b] space-y-1">
            <div className="text-xs text-neutral-400">Proyek Target:</div>
            <div className="text-sm font-bold text-white">{invitation.title}</div>
            <div className="text-xs text-neutral-500 font-mono">/{invitation.slug}</div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Status Undangan:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatus('ACTIVE')}
                  className={`py-2.5 rounded-xl border transition cursor-pointer ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  🟢 ACTIVE (Aktif)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`py-2.5 rounded-xl border transition cursor-pointer ${
                    status === 'DRAFT'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  🟡 DRAFT (Uji Coba)
                </button>
              </div>
            </div>

            {/* Watermark Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Watermark Logo</div>
                  <div className="text-[10px] text-neutral-400">Nonaktifkan untuk menghilangkan badge draft</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWatermark(!isWatermark)}
                className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                  !isWatermark ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition ${
                    !isWatermark ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Print Kit Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Akses Print Studio 300 DPI</div>
                  <div className="text-[10px] text-neutral-400">Izinkan unduh kartu & stiker cetak fisik</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowPrintKit(!allowPrintKit)}
                className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                  allowPrintKit ? 'bg-purple-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition ${
                    allowPrintKit ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Plan Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Tingkat Paket (Plan):</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="SILVER">SILVER (Digital Basic)</option>
                <option value="GOLD">GOLD (Digital Pro)</option>
                <option value="PLATINUM">PLATINUM (Full Features + Print Kit)</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#222233] bg-[#161622] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Simpan Override</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
