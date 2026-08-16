import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface LuxuryToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const LuxuryToastContainer: React.FC<LuxuryToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:translate-y-0 z-[10000] flex flex-col gap-2.5 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl flex items-start gap-3.5 transition-all transform animate-in zoom-in-95 duration-200 ${
            t.type === 'success'
              ? 'bg-[#111115]/98 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
              : t.type === 'error'
              ? 'bg-[#111115]/98 border-rose-500/50 text-rose-400 shadow-rose-500/10'
              : t.type === 'warning'
              ? 'bg-[#111115]/98 border-amber-500/50 text-amber-400 shadow-amber-500/10'
              : 'bg-[#111115]/98 border-[#c4a661]/50 text-[#c4a661] shadow-[#c4a661]/10'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#c4a661]" />}
          </div>

          <div className="flex-1 min-w-0">
            {t.title && <div className="text-sm font-bold text-white mb-0.5">{t.title}</div>}
            <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">{t.message}</div>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-neutral-500 hover:text-white p-1 rounded-lg transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
