import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Crown, CreditCard, Save, Eye, ArrowLeft, LayoutDashboard, Printer, LogOut, User, ChevronDown } from 'lucide-react';
import { InvitationData } from '../../types';

interface StudioHeaderProps {
  data: InvitationData;
  activeTab: 'dashboard' | 'blocks' | 'guests' | 'rsvp' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'blocks' | 'guests' | 'rsvp' | 'settings') => void;
  deviceFrame: 'mobile' | 'tablet' | 'desktop';
  setDeviceFrame: (frame: 'mobile' | 'tablet' | 'desktop') => void;
  guestCount: number;
  wishCount: number;
  isSaving: boolean;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  onViewGuestMode: (name: string) => void;
  onOpenPricing: () => void;
  onOpenLicenseModal: () => void;
  onOpenDashboard?: () => void;
  onOpenPrintStudio?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  data,
  activeTab,
  setActiveTab,
  deviceFrame,
  setDeviceFrame,
  guestCount,
  wishCount,
  isSaving,
  autoSaveStatus = 'idle',
  onSave,
  onViewGuestMode,
  onOpenPricing,
  onOpenLicenseModal,
  onOpenDashboard,
  onOpenPrintStudio,
}) => {
  const isLicensed = !data.isWatermarked || Boolean(data.licenseKey);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('absenta_auth_token');
    localStorage.removeItem('absenta_auth_user');
    window.location.href = '/?mode=dashboard';
  };

  return (
    <header className="h-14 shrink-0 border-b border-[#1f1f27] flex items-center justify-between px-3 md:px-5 bg-[#0e0e12] z-20 gap-2 relative">
      {/* 1. Left: Back to Dashboard & Mobile Brand */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenDashboard && (
          <button
            type="button"
            onClick={onOpenDashboard}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Kembali ke Dashboard Semua Undangan"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[#c4a661] font-bold text-xs uppercase tracking-wider font-serif">
            ✨ LuxeInvite
          </span>
        </div>
      </div>

      {/* Desktop Tabs Navigation */}
      <div className="hidden md:flex h-full items-center space-x-2 sm:space-x-4 shrink-0">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`h-full text-xs font-semibold px-1.5 border-b-2 flex items-center transition cursor-pointer whitespace-nowrap ${
            activeTab === 'blocks'
              ? 'border-[#c4a661] text-[#c4a661]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Design Preview
        </button>
        <button
          onClick={() => setActiveTab('guests')}
          className={`h-full text-xs font-semibold px-1.5 border-b-2 flex items-center transition cursor-pointer whitespace-nowrap ${
            activeTab === 'guests'
              ? 'border-[#c4a661] text-[#c4a661]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Tamu ({guestCount})
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`h-full text-xs font-semibold px-1.5 border-b-2 flex items-center transition cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-[#c4a661] text-[#c4a661]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          RSVP ({wishCount})
        </button>
      </div>

      {/* 2. Center: Viewport Switcher */}
      {activeTab === 'blocks' && (
        <div className="hidden lg:flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800 shrink-0 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setDeviceFrame('mobile')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
              deviceFrame === 'mobile'
                ? 'bg-[#c4a661] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="Smartphone Mode (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrame('tablet')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
              deviceFrame === 'tablet'
                ? 'bg-[#c4a661] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="Tablet / iPad Mode (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrame('desktop')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
              deviceFrame === 'desktop'
                ? 'bg-[#c4a661] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="Desktop / PC Mode (1024px)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Right: Action Buttons + User Profile Menu */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {isLicensed ? (
          <button
            onClick={onOpenLicenseModal}
            className="px-2.5 py-1.5 text-[10px] sm:text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-semibold rounded-full flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
          >
            <Crown className="w-3 h-3 text-[#c4a661] shrink-0" />
            <span className="hidden sm:inline">{data.planName || 'Gold'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenPricing}
            className="px-2.5 py-1.5 text-[10px] sm:text-[11px] bg-[#c4a661]/20 hover:bg-[#c4a661]/30 border border-[#c4a661]/50 text-[#c4a661] font-semibold rounded-full flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
          >
            <CreditCard className="w-3 h-3 shrink-0" />
            <span>Beli Paket</span>
          </button>
        )}

        {/* ☁️ Auto-Save Status Indicator */}
        {autoSaveStatus !== 'idle' && (
          <span className="hidden sm:flex items-center gap-1 text-[9px] text-neutral-500 whitespace-nowrap">
            {autoSaveStatus === 'saving' ? (
              <><span className="animate-spin inline-block">⟳</span> Menyimpan...</>
            ) : (
              <><span className="text-emerald-500">✓</span> Tersimpan</>
            )}
          </span>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] bg-[#1f1f27] hover:bg-[#2a2a35] border border-[#2a2a35] text-gray-300 font-semibold rounded-full flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
        >
          <Save className="w-3 h-3 text-[#c4a661] shrink-0" />
          <span className="hidden xs:inline">{isSaving ? '...' : 'Save'}</span>
        </button>

        <button
          onClick={() => onViewGuestMode('Bpk. Ahmad Suherman & Kel')}
          className="px-3 py-1.5 text-[10px] sm:text-[11px] bg-white text-black font-bold rounded-full hover:bg-amber-100 transition shadow-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <Eye className="w-3 h-3 shrink-0" />
          <span>Publish</span>
        </button>

        {/* User Account / Navigation Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition cursor-pointer flex items-center justify-center"
            title="Menu Akun & Navigasi"
          >
            <User className="w-3.5 h-3.5 text-[#c4a661]" />
          </button>

          {/* Floating Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#111115] border border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                <p className="text-[10px] text-neutral-400">Sedang Mengedit:</p>
                <p className="font-bold text-white truncate">{data.eventTitle || 'Undangan Digital'}</p>
              </div>

              {onOpenDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#c4a661]" />
                  <span>Dashboard Proyek</span>
                </button>
              )}

              {onOpenPrintStudio && (
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenPrintStudio();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Studio (PDF)</span>
                </button>
              )}

              <div className="h-px bg-neutral-800/80 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-400 flex items-center gap-2 transition cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
