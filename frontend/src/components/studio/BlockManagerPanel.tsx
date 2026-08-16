import React from 'react';
import { Edit3, Sparkles, User, Calendar, Image as ImageIcon, CreditCard, MessageSquare, ExternalLink } from 'lucide-react';
import { InvitationData, WishMessage } from '../../types';

interface BlockManagerPanelProps {
  data: InvitationData;
  wishes: WishMessage[];
  onToggleBlock: (key: string) => void;
  onEditSectionJump: (section: 'profile' | 'schedule' | 'gift' | 'gallery' | 'music') => void;
  onFocusSection?: (sectionKey: string) => void;
}

export const BlockManagerPanel: React.FC<BlockManagerPanelProps> = ({
  data,
  wishes,
  onToggleBlock,
  onEditSectionJump,
  onFocusSection,
}) => {
  const blockItems = [
    {
      key: 'hero',
      targetSection: 'profile' as const,
      title: 'Hero & Amplop 3D',
      icon: Sparkles,
      iconColor: 'text-amber-400 bg-amber-500/15',
      stat: 'Sampul Depan',
    },
    {
      key: 'profile',
      targetSection: 'profile' as const,
      title: 'Profil Mempelai / Tokoh',
      icon: User,
      iconColor: 'text-blue-400 bg-blue-500/15',
      stat: `${data.profiles?.length || 1} Profil`,
    },
    {
      key: 'schedule',
      targetSection: 'schedule' as const,
      title: 'Jadwal & Lokasi Acara',
      icon: Calendar,
      iconColor: 'text-indigo-400 bg-indigo-500/15',
      stat: `${data.events?.length || 1} Sesi`,
    },
    {
      key: 'gallery',
      targetSection: 'gallery' as const,
      title: 'Galeri Foto & Video',
      icon: ImageIcon,
      iconColor: 'text-emerald-400 bg-emerald-500/15',
      stat: `${data.gallery?.length || 0} Foto`,
    },
    {
      key: 'gift',
      targetSection: 'gift' as const,
      title: 'Amplop Digital & Rekening',
      icon: CreditCard,
      iconColor: 'text-yellow-400 bg-yellow-500/15',
      stat: `${data.bankAccounts?.length || 0} Bank`,
    },
    {
      key: 'rsvp',
      targetSection: 'profile' as const,
      title: 'RSVP & Doa Restu Tamu',
      icon: MessageSquare,
      iconColor: 'text-purple-400 bg-purple-500/15',
      stat: `${wishes?.length || 0} Pesan`,
    },
  ];

  const handleItemClick = (key: string) => {
    if (onFocusSection) {
      onFocusSection(key);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-neutral-400 mb-1.5 flex items-center justify-between px-0.5">
        <span className="font-semibold">Kelola & Fokuskan Seksi</span>
        <span className="text-[10px] text-[#c4a661]">Klik untuk Fokus Preview</span>
      </div>

      <div className="space-y-1.5">
        {blockItems.map((item) => {
          const isEnabled = data.enabledBlocks[item.key] ?? true;
          const IconComponent = item.icon;

          return (
            <div
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                isEnabled
                  ? 'border-[#c4a661]/30 bg-[#16161c] hover:border-[#c4a661] hover:bg-[#1f1f27] shadow-xs'
                  : 'border-neutral-800/80 bg-neutral-900/40 opacity-50 hover:opacity-80'
              }`}
              title="Klik untuk langsung memfokuskan live preview kanvas ke seksi ini"
            >
              {/* Left: Icon & Simple Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition group-hover:scale-105 ${item.iconColor}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-[#c4a661] transition truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500">{item.stat}</div>
                </div>
              </div>

              {/* Right: Quick Jump Edit & iOS Toggle */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEditSectionJump(item.targetSection)}
                  className="p-1 rounded-lg bg-neutral-800 hover:bg-[#c4a661]/20 hover:text-[#c4a661] text-neutral-400 transition cursor-pointer"
                  title="Buka form input data seksi ini"
                >
                  <Edit3 className="w-3 h-3 text-[#c4a661]" />
                </button>

                {/* Sleek Mini Switch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBlock(item.key);
                  }}
                  className={`w-8 h-4.5 rounded-full transition-colors duration-200 relative p-0.5 cursor-pointer flex items-center ${
                    isEnabled ? 'bg-[#c4a661]' : 'bg-neutral-800'
                  }`}
                  title={isEnabled ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-neutral-950 shadow-md transition-transform duration-200 ${
                      isEnabled ? 'translate-x-3.5 bg-neutral-950' : 'translate-x-0 bg-neutral-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
