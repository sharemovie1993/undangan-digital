import React from 'react';
import { Sparkles, Zap, Trash2, Printer, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ConfirmType = 'token_activate' | 'delete' | 'upgrade_print' | 'general';

interface LuxuryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: ConfirmType;
  title: string;
  description: string;
  details?: {
    invitationTitle?: string;
    tokenCost?: number;
    remainingTokens?: number;
    planName?: string;
  };
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const LuxuryConfirmModal: React.FC<LuxuryConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'general',
  title,
  description,
  details,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  isDestructive = false,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-5 sm:p-6 flex flex-col space-y-4 my-auto overflow-hidden">
        {/* Ambient Top Glow */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl pointer-events-none ${
          isDestructive ? 'bg-rose-500/20' : 'bg-[#c4a661]/20'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white p-1.5 rounded-full bg-neutral-800/80 cursor-pointer transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center pt-2">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg ${
            type === 'token_activate'
              ? 'bg-[#c4a661]/20 border border-[#c4a661]/50 text-[#c4a661]'
              : type === 'delete' || isDestructive
              ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400'
              : type === 'upgrade_print'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
              : 'bg-neutral-800 border border-neutral-700 text-[#c4a661]'
          }`}>
            {type === 'token_activate' && <Zap className="w-7 h-7 sm:w-8 sm:h-8" />}
            {type === 'delete' && <Trash2 className="w-7 h-7 sm:w-8 sm:h-8" />}
            {type === 'upgrade_print' && <Printer className="w-7 h-7 sm:w-8 sm:h-8" />}
            {type === 'general' && <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">
            {title}
          </h3>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Details Card (For Token Activation / Delete Specifics) */}
        {details && (
          <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-2">
            {details.invitationTitle && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500">Judul Undangan:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{details.invitationTitle}</span>
              </div>
            )}
            {typeof details.tokenCost !== 'undefined' && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500">Biaya Aktivasi:</span>
                <span className="font-bold font-mono text-[#c4a661]">💎 {details.tokenCost} Token</span>
              </div>
            )}
            {typeof details.remainingTokens !== 'undefined' && (
              <div className="flex justify-between items-center text-neutral-300 pt-1.5 border-t border-neutral-800/80">
                <span className="text-neutral-500">Sisa Saldo Setelah Aktivasi:</span>
                <span className="font-bold font-mono text-emerald-400">{details.remainingTokens} Token</span>
              </div>
            )}
            {details.planName && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500">Paket Terpasang:</span>
                <span className="font-bold text-amber-400">{details.planName}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              isDestructive
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-neutral-950'
            }`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
