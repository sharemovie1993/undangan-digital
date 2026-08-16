import React from 'react';
import { Smartphone, Tablet, Monitor, Crown, CreditCard, Save, Eye } from 'lucide-react';
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
  onSave: () => void;
  onViewGuestMode: (name: string) => void;
  onOpenPricing: () => void;
  onOpenLicenseModal: () => void;
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
  onSave,
  onViewGuestMode,
  onOpenPricing,
  onOpenLicenseModal,
}) => {
  const isLicensed = !data.isWatermarked || Boolean(data.licenseKey);

  return (
    <header className="h-14 shrink-0 border-b border-[#1f1f27] flex items-center justify-between px-3 md:px-5 bg-[#0e0e12] z-20 gap-2">
      {/* 1. Left: Mobile Brand vs Desktop Tab Navigation */}
      <div className="sm:hidden flex items-center gap-1.5 shrink-0">
        <span className="text-[#c4a661] font-bold text-xs uppercase tracking-wider">
          ✨ LuxeInvite
        </span>
      </div>

      <div className="hidden sm:flex h-full items-center space-x-2 sm:space-x-4 shrink-0">
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

      {/* 2. Center: Pure Icon-Only Viewport Switcher (Ultra Compact) */}
      {activeTab === 'blocks' && (
        <div className="hidden sm:flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800 shrink-0 gap-1 shadow-inner">
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

      {/* 3. Right: Action Buttons */}
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
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] bg-[#1f1f27] hover:bg-[#2a2a35] border border-[#2a2a35] text-gray-300 font-semibold rounded-full flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
        >
          <Save className="w-3 h-3 text-[#c4a661] shrink-0" />
          <span className="hidden xs:inline">{isSaving ? '...' : 'Save'}</span>
        </button>
        <button
          onClick={() => onViewGuestMode('Bpk. Ahmad Suherman & Kel', data.slug)}
          className="px-3 py-1.5 text-[10px] sm:text-[11px] bg-white text-black font-bold rounded-full hover:bg-amber-100 transition shadow-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <Eye className="w-3 h-3 shrink-0" />
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
};
