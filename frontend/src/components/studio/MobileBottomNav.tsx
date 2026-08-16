import React from 'react';
import { Eye, Edit3, Palette, Blocks, Users } from 'lucide-react';

interface MobileBottomNavProps {
  mobileNavView: 'preview' | 'content' | 'theme' | 'blocks' | 'guests';
  onSelectView: (view: 'preview' | 'content' | 'theme' | 'blocks' | 'guests') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  mobileNavView,
  onSelectView,
}) => {
  return (
    <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111115]/95 backdrop-blur-lg border-t border-[#1f1f27] px-2 py-1.5 items-center justify-around shadow-2xl">
      <button
        type="button"
        onClick={() => onSelectView('preview')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
          mobileNavView === 'preview'
            ? 'text-[#c4a661] bg-[#c4a661]/15 font-bold'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Eye className="w-4 h-4 mb-0.5" />
        <span>Preview</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectView('content')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
          mobileNavView === 'content'
            ? 'text-[#c4a661] bg-[#c4a661]/15 font-bold'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Edit3 className="w-4 h-4 mb-0.5" />
        <span>Konten</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectView('theme')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
          mobileNavView === 'theme'
            ? 'text-[#c4a661] bg-[#c4a661]/15 font-bold'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Palette className="w-4 h-4 mb-0.5" />
        <span>Tema</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectView('blocks')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
          mobileNavView === 'blocks'
            ? 'text-[#c4a661] bg-[#c4a661]/15 font-bold'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Blocks className="w-4 h-4 mb-0.5" />
        <span>Blok</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectView('guests')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
          mobileNavView === 'guests'
            ? 'text-[#c4a661] bg-[#c4a661]/15 font-bold'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Users className="w-4 h-4 mb-0.5" />
        <span>Tamu</span>
      </button>
    </nav>
  );
};
