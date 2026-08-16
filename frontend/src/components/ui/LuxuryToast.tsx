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
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 duration-300 ${
            t.type === 'success'
              ? 'bg-[#111115]/95 border-emerald-500/40 text-emerald-400'
              : t.type === 'error'
              ? 'bg-[#111115]/95 border-rose-500/40 text-rose-400'
              : t.type === 'warning'
              ? 'bg-[#111115]/95 border-amber-500/40 text-amber-400'
              : 'bg-[#111115]/95 border-[#c4a661]/40 text-[#c4a661]'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#c4a661]" />}
          </div>

          <div className="flex-1 min-w-0">
            {t.title && <div className="text-xs font-bold text-white mb-0.5">{t.title}</div>}
            <div className="text-xs text-neutral-300 leading-snug whitespace-pre-line">{t.message}</div>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-neutral-500 hover:text-white p-1 rounded-lg transition shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
