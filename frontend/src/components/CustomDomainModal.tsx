import React, { useState } from 'react';
import { Globe, X, Check, Copy, ExternalLink, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: {
    id: string;
    title: string;
    slug: string;
    customDomain?: string | null;
    licenseKey?: string | null;
  };
  onSuccess: (updatedDomain: string | null) => void;
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  isOpen,
  onClose,
  invitation,
  onSuccess
}) => {
  const [domainInput, setDomainInput] = useState<string>(invitation.customDomain || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDomain = invitation.customDomain;

  const handleCopyTarget = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDomain = async () => {
    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || null;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await api.saveInvitation({
        id: invitation.id,
        customDomain: clean
      });

      if (res.success) {
        onSuccess(clean);
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan domain.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan domain.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDomain = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await api.saveInvitation({
        id: invitation.id,
        customDomain: null
      });
      if (res.success) {
        setDomainInput('');
        onSuccess(null);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melepas domain.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full bg-neutral-800/80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-[#c4a661]/30 flex items-center justify-center text-[#c4a661] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">
              Pengaturan Custom Domain
            </h3>
            <p className="text-[11px] text-neutral-400">
              Proyek: <strong className="text-white">{invitation.title}</strong>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active Domain Info if configured */}
        {currentDomain && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Domain Terhubung & SSL Aktif</span>
              </div>
              <a
                href={`https://${currentDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-white hover:underline flex items-center gap-1 mt-0.5 truncate"
              >
                <span>https://{currentDomain}</span>
                <ExternalLink className="w-3 h-3 text-[#c4a661] shrink-0" />
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemoveDomain}
              disabled={isSaving}
              className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
            >
              Lepas Domain
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Nama Domain / Subdomain Klien
          </label>
          <div className="relative">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="misal: wedding.klienku.com atau undangan.namastudio.id"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
            />
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            Masukkan subdomain (misal: <code className="text-[#c4a661]">wedding.klienanda.com</code>) atau root domain.
          </span>
        </div>

        {/* DNS Configuration Instructions Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 mb-4 text-xs space-y-2.5">
          <div className="font-bold text-white flex items-center gap-1.5 text-xs">
            <span>📋 Petunjuk Pengaturan DNS di Registrar / Cloudflare:</span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 text-[11px]">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase font-bold">Type</span>
              <span className="font-mono font-bold text-amber-400">CNAME</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase font-bold">Name / Host</span>
              <span className="font-mono font-bold text-white">wedding</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase font-bold">Target / Value</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-[#c4a661] truncate">luxury.absenta.id</span>
                <button
                  type="button"
                  onClick={() => handleCopyTarget('luxury.absenta.id')}
                  className="p-1 text-neutral-400 hover:text-white"
                  title="Salin Target"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 leading-relaxed">
            💡 <em>Catatan:</em> Setelah DNS CNAME diarahkan, server Caddy akan otomatis menerbitkan sertifikat SSL HTTPS (Let's Encrypt) saat domain pertama kali dibuka.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveDomain}
            disabled={isSaving || !domainInput.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 shadow-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span>Simpan Domain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
