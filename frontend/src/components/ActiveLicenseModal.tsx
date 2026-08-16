import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Sparkles, X, Award, CheckCircle2, Zap, Coins } from 'lucide-react';

interface ActiveLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  licenseKey?: string;
  onUpgrade?: () => void;
  quotaTokens?: number;
  userRole?: string;
}

export const ActiveLicenseModal: React.FC<ActiveLicenseModalProps> = ({
  isOpen,
  onClose,
  planName = 'Paket Wedding Gold (All Features)',
  licenseKey = 'UND-L9QL-XT1Q-1G12',
  onUpgrade,
  quotaTokens,
  userRole
}) => {
  const isReseller = userRole === 'RESELLER' || userRole === 'PERCETAKAN' || userRole === 'ADMIN';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-[#111115] text-[#e2e2e7] shadow-2xl flex flex-col my-auto max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-800/80 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Award className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            TERVERIFIKASI SERVER LISENSI RESMI
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Lisensi Paket Aktif</h2>
          <p className="text-xs text-neutral-400 mt-1">Undangan Anda telah memiliki lisensi resmi penuh.</p>
        </div>

        {/* Card License Details */}
        <div className="space-y-3 bg-neutral-900/70 p-4 rounded-xl border border-neutral-800 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
            <span className="text-neutral-400">Paket Langganan:</span>
            <span className="font-bold text-[#c4a661] text-sm">{planName}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
            <span className="text-neutral-400">Status Lisensi:</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aktif Permanen
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
            <span className="text-neutral-400">Watermark:</span>
            <span className="text-white font-medium">Nonaktif (Clean Luxury View)</span>
          </div>

          {/* Token Balance — hanya tampil untuk Reseller/Percetakan/Admin */}
          {isReseller && (
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#c4a661]" />
                Saldo Token Aktivasi:
              </span>
              <span className={`font-bold text-sm flex items-center gap-1.5 ${
                (quotaTokens ?? 0) === 0
                  ? 'text-red-400'
                  : (quotaTokens ?? 0) <= 3
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {quotaTokens ?? 0} Token
                {(quotaTokens ?? 0) === 0 && (
                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">
                    HABIS
                  </span>
                )}
                {(quotaTokens ?? 0) > 0 && (quotaTokens ?? 0) <= 3 && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
                    MENIPIS
                  </span>
                )}
              </span>
            </div>
          )}

          {/* License Key Box */}
          <div className="pt-2">
            <label className="block text-[11px] text-neutral-400 mb-1">License Key Resmi:</label>
            <div className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800">
              <span className="font-mono text-sm font-bold text-emerald-300 select-all tracking-wider">
                {licenseKey}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[#c4a661] hover:text-white bg-[#c4a661]/10 px-2.5 py-1 rounded border border-[#c4a661]/30 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Key'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-4 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/80 text-xs">
          <div className="font-semibold text-white mb-2 flex items-center gap-1.5 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-[#c4a661]" />
            <span>Fitur Unggulan yang Terbuka:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Semua Tema Luxury</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Amplop Bank & QRIS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Piringan Musik Melayang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Buku Tamu & Scanner QR</span>
            </div>
          </div>
        </div>
        </div>{/* end scrollable content area */}

        {/* Sticky Footer — selalu terlihat di bawah, tidak ikut scroll */}
        <div className="shrink-0 px-5 py-4 border-t border-neutral-800 bg-[#111115] rounded-b-2xl flex flex-col gap-2.5">
          {/* Top-Up Token CTA — hanya tampil untuk reseller dengan token menipis/habis */}
          {isReseller && (quotaTokens ?? 0) <= 5 && onUpgrade && (
            <button
              onClick={() => { onClose(); onUpgrade(); }}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-90 shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{(quotaTokens ?? 0) === 0 ? '⚠️ Token Habis — Top-Up Sekarang' : '⚡ Top-Up Token Aktivasi'}</span>
            </button>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>

            {onUpgrade && (!isReseller || (quotaTokens ?? 0) > 5) && (
              <button
                onClick={() => { onClose(); onUpgrade(); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-90 shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade / Ganti Paket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
