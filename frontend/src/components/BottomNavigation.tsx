import React from 'react';
import { Home, Calendar, Image as ImageIcon, Gift, MessageSquare } from 'lucide-react';
import { InvitationData } from '../types';
import { THEMES } from '../data/presets';

interface BottomNavigationProps {
  data: InvitationData;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'profile-section', label: 'Cover', icon: Home },
    { id: 'schedule-section', label: 'Event', icon: Calendar },
    { id: 'gallery-section', label: 'Gallery', icon: ImageIcon },
    { id: 'gift-section', label: 'Gift', icon: Gift },
    { id: 'rsvp-section', label: 'RSVP', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[340px]">
      <div
        className="flex items-center justify-around rounded-full border px-3 py-1.5 shadow-2xl backdrop-blur-lg"
        style={{
          backgroundColor: `${cardBg}ea`,
          borderColor: `${activePrimary}40`,
        }}
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isPrimary = idx === 0;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              title={item.label}
              className="group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: isPrimary ? activePrimary : 'transparent',
                color: isPrimary ? '#0a0a0b' : '#a1a1aa',
              }}
            >
              <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
