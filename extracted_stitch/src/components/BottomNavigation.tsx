import React from 'react';
import { Home, Calendar, Image as ImageIcon, Gift, MessageSquare, Sparkles } from 'lucide-react';
import { InvitationData } from '../types';
import { THEMES } from '../data/presets';

interface BottomNavigationProps {
  data: InvitationData;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[360px]">
      <div className="flex items-center justify-around rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-md">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isPrimary = idx === 0;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              title={item.label}
              className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                isPrimary
                  ? 'bg-[#C5A059] text-white shadow-md shadow-amber-900/20 hover:scale-105'
                  : 'text-neutral-600 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
