import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RefreshCw,
  X,
  ShieldCheck,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Key,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { queryClient } from '../query/queryClient';
import { LuxuryConfirmModal } from './ui/LuxuryConfirmModal';

interface TransferLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvitation: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  allInvitations: any[];
  onSuccess?: () => void;
}

export const TransferLicenseModal: React.FC<TransferLicenseModalProps> = ({
  isOpen,
  onClose,
  targetInvitation,
  allInvitations,
  onSuccess
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [manualKey, setManualKey] = useState<string>('');
  const [useManualKey, setUseManualKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Ambil riwayat order resmi milik akun
  const { data: ordersData } = useQuery({
    queryKey: ['my-orders-license'],
    queryFn: async () => {
      try {
        const res = await api.getMyOrders();
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: isOpen
  });

  if (!isOpen || !targetInvitation) return null;

  // Filter undangan lain yang sudah memiliki lisensi aktif (selain target undangan saat ini)
  const otherLicensedInvitations = (allInvitations || []).filter(
    (inv) => inv.id !== targetInvitation.id && (!inv.isWatermark || inv.licenseKey)
  );

  const activeKeysSet = new Set(
    (allInvitations || []).filter((i) => i.licenseKey).map((i) => i.licenseKey)
  );

  // Ambil order berbayar yang licenseKey-nya BELUM terpasang di undangan manapun (Lisensi Standby / Menganggur)
  const unassignedPaidOrders = (ordersData || []).filter(
    (o: any) => o.licenseKey && !activeKeysSet.has(o.licenseKey)
  );

  const getSourceDisplayName = () => {
    if (useManualKey) {
      return `Manual Key: ${manualKey.trim()}`;
    }
    if (selectedSourceId?.startsWith('order:')) {
      const key = selectedSourceId.replace('order:', '');
      const ord = unassignedPaidOrders.find((o: any) => o.licenseKey === key);
      return ord ? `Riwayat Pesanan (${ord.invoiceNumber || ord.planName || key})` : `Order: ${key}`;
    }
    const srcInv = otherLicensedInvitations.find((i: any) => i.id === selectedSourceId);
    return srcInv ? `Undangan "${srcInv.title}"` : 'Sumber Terpilih';
  };

  const handlePromptConfirm = () => {
    setErrorMsg(null);
    if (useManualKey) {
      if (!manualKey.trim()) {
        setErrorMsg('Silakan masukkan License Key terlebih dahulu.');
        return;
      }
    } else if (!selectedSourceId) {
      setErrorMsg('Silakan pilih salah satu sumber lisensi atau masukkan License Key.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeTransfer = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let payload: { targetInvitationId: string; sourceInvitationId?: string; licenseKey?: string } = {
        targetInvitationId: targetInvitation.id
      };

      if (useManualKey) {
        payload.licenseKey = manualKey.trim();
      } else if (selectedSourceId) {
        if (selectedSourceId.startsWith('order:')) {
          payload.licenseKey = selectedSourceId.replace('order:', '');
        } else {
          payload.sourceInvitationId = selectedSourceId;
        }
      }

      const res = await api.transferLicense(payload);

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders-license'] });
        setIsConfirmOpen(false);
        onSuccess?.();
        onClose();
      } else {
        setIsConfirmOpen(false);
        setErrorMsg(res.message || 'Gagal memindahkan lisensi.');
      }
    } catch (err: any) {
      setIsConfirmOpen(false);
      setErrorMsg(err.message || 'Terjadi kesalahan saat transfer lisensi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#111115] text-[#e2e2e7] shadow-2xl flex flex-col my-auto max-h-[calc(100dvh-3rem)] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-800/60 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 pb-8">
          {/* Header Badge */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              TRANSFER & PASANG LISENSI
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Pindahkan Lisensi Resmi</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Gunakan lisensi resmi yang sudah Anda miliki untuk mengaktifkan{' '}
              <span className="text-[#c4a661] font-bold">"{targetInvitation.title}"</span>.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Box */}
          <div className="mb-5 p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-[11px] text-neutral-400">Undangan Penerima (Target):</div>
              <div className="text-sm font-bold text-white mt-0.5">{targetInvitation.title}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 text-[10px]">
              Akan Diaktifkan
            </span>
          </div>

          {/* Option Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setUseManualKey(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                !useManualKey
                  ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Pilih Dari Akun Saya</span>
            </button>
            <button
              type="button"
              onClick={() => setUseManualKey(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                useManualKey
                  ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Input License Key</span>
            </button>
          </div>

          {/* Mode 1: Pilih dari Akun */}
          {!useManualKey ? (
            <div className="space-y-3">
              {/* Opsi dari Undangan Aktif Lain */}
              {otherLicensedInvitations.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Lisensi dari Undangan Lain:
                  </div>
                  <div className="space-y-2">
                    {otherLicensedInvitations.map((inv) => (
                      <label
                        key={inv.id}
                        onClick={() => setSelectedSourceId(inv.id)}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                          selectedSourceId === inv.id
                            ? 'bg-[#c4a661]/10 border-[#c4a661] text-white shadow'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="sourceLicense"
                            checked={selectedSourceId === inv.id}
                            onChange={() => setSelectedSourceId(inv.id)}
                            className="mt-1 accent-[#c4a661]"
                          />
                          <div>
                            <div className="font-bold text-sm text-white">{inv.title}</div>
                            <div className="text-[11px] text-[#c4a661] font-mono mt-0.5">
                              Key: {inv.licenseKey || 'UND-ACTIVE'}
                            </div>
                            <div className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Undangan ini akan dinonaktifkan (kembali trial).</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                          Aktif
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Opsi dari Riwayat Order / Unassigned Licenses (Hanya yang belum menempel di undangan manapun) */}
              {unassignedPaidOrders.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 mt-4">
                    Lisensi Standby / Belum Terpasang (dari Riwayat Pesanan):
                  </div>
                  <div className="space-y-2">
                    {unassignedPaidOrders.map((ord: any) => (
                      <label
                        key={ord.id}
                        onClick={() => setSelectedSourceId(`order:${ord.licenseKey}`)}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                          selectedSourceId === `order:${ord.licenseKey}`
                            ? 'bg-[#c4a661]/10 border-[#c4a661] text-white shadow'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="sourceLicense"
                            checked={selectedSourceId === `order:${ord.licenseKey}`}
                            onChange={() => setSelectedSourceId(`order:${ord.licenseKey}`)}
                            className="mt-1 accent-[#c4a661]"
                          />
                          <div>
                            <div className="font-bold text-sm text-white">{ord.planName || 'Paket Lisensi'}</div>
                            <div className="text-[11px] text-[#c4a661] font-mono mt-0.5">
                              {ord.licenseKey}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              Invoice: {ord.invoiceNumber}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold shrink-0">
                          Standby
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {otherLicensedInvitations.length === 0 && unassignedPaidOrders.length === 0 && (
                <div className="p-6 text-center bg-neutral-900/40 rounded-xl border border-neutral-800">
                  <Key className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">Tidak ada lisensi lain yang tersedia</div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Semua lisensi Anda telah terpasang atau Anda belum memiliki riwayat pembelian.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Input Manual Key */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Masukkan License Key Resmi:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#c4a661] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value.toUpperCase())}
                    placeholder="UND-XXXX-XXXX-XXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#c4a661] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono uppercase tracking-wider outline-none placeholder:text-neutral-600"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  License key resmi didapat dari bukti pembayaran invoice di email/WhatsApp atau riwayat order.
                </p>
              </div>
            </div>
          )}

          {/* Notice Box */}
          <div className="mt-5 p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ketentuan Transfer Lisensi:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>1 Lisensi resmi hanya dapat aktif pada 1 proyek undangan di waktu yang sama.</li>
              <li>Jika lisensi dipindahkan, undangan asal akan otomatis kembali ke mode trial watermark.</li>
              <li>Tidak ada batas pemindahan lisensi antar proyek undangan milik Anda.</li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-neutral-800 bg-[#111115] rounded-b-2xl flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isLoading || (!useManualKey && !selectedSourceId) || (useManualKey && !manualKey.trim())}
            onClick={handlePromptConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-90 shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Lanjutkan Pindah Lisensi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Luxury Confirmation Modal */}
      <LuxuryConfirmModal
        isOpen={isConfirmOpen}
        type="general"
        title="Konfirmasi Pindah Lisensi"
        description={
          selectedSourceId && !selectedSourceId.startsWith('order:') && !useManualKey
            ? `Lisensi resmi dari ${getSourceDisplayName()} akan dipindahkan ke "${targetInvitation.title}". Undangan asal akan otomatis kembali ke mode trial watermark.`
            : `Lisensi resmi akan dipasangkan ke proyek undangan "${targetInvitation.title}".`
        }
        details={{
          invitationTitle: targetInvitation.title,
          planName: getSourceDisplayName()
        }}
        confirmLabel="⚡ Ya, Pindahkan Sekarang"
        cancelLabel="Batal"
        isLoading={isLoading}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeTransfer}
      />
    </div>
  );
};
