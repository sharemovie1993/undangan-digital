import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Check, ArrowRight, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { MasterStyleKit } from '../../types';
import { MASTER_STYLE_KITS, FONT_PRESETS, FRAME_SHAPES, THEMES } from '../../data/presets';

interface StyleKitGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  currentFontId?: string;
  currentFrameId?: string;
  onApplyKit: (kit: MasterStyleKit) => void;
}

export const StyleKitGalleryModal: React.FC<StyleKitGalleryModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  currentFontId,
  currentFrameId,
  onApplyKit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const kits = Object.values(MASTER_STYLE_KITS);
  const filteredKits =
    selectedCategory === 'all'
      ? kits
      : kits.filter((k) => k.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111115] border border-[#c4a661]/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c4a661] to-amber-700 flex items-center justify-center text-neutral-950 shadow-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  Visual Master Style Kits
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40 font-semibold">
                  1-Click Magic Transform
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pilih kombinasi terpadu (Warna + Font Google + Bentuk Frame) karya desainer profesional dalam 1 sentuhan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Koleksi' },
            { id: 'royal', label: '👑 Royal Palace' },
            { id: 'islamic', label: '🌿 Nuansa Islami' },
            { id: 'romantic', label: '🌸 Romantis' },
            { id: 'modern', label: '🌑 Modern Clean' },
            { id: 'festive', label: '🎉 Ceria / Party' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Master Style Kits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredKits.map((kit) => {
            const fontInfo = FONT_PRESETS[kit.fontPairingId];
            const frameInfo = FRAME_SHAPES[kit.frameShape];
            const themeInfo = THEMES[kit.themeId];

            const isCurrentlyActive =
              currentThemeId === kit.themeId &&
              (currentFontId === kit.fontPairingId || (!currentFontId && kit.fontPairingId === 'royal_serif')) &&
              (currentFrameId === kit.frameShape || (!currentFrameId && kit.frameShape === 'royal_arch'));

            return (
              <motion.div
                key={kit.id}
                whileHover={{ y: -3 }}
                className={`relative rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between bg-gradient-to-b from-neutral-900/90 to-neutral-950 ${
                  isCurrentlyActive
                    ? 'border-[#c4a661] ring-2 ring-[#c4a661]/40 shadow-[0_0_25px_rgba(196,166,97,0.2)]'
                    : 'border-neutral-800/80 hover:border-neutral-700 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Top Bar with Badge & Color Swatch */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/5">
                      {kit.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${kit.previewGradient} border border-white/30 shadow-xs`}
                      />
                      <span className="text-[10px] font-mono text-neutral-400">
                        {themeInfo?.name?.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Font Rendering Preview Box */}
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60 mb-3 text-center">
                    <div
                      className="text-base font-bold text-white truncate"
                      style={{
                        fontFamily: fontInfo?.headingFamily,
                        color: kit.primaryColor,
                      }}
                    >
                      {fontInfo?.previewText || kit.name}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                      {kit.tagline}
                    </div>
                  </div>

                  {/* Composition Specs */}
                  <div className="space-y-1.5 mb-4 text-[11px]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Type className="w-3 h-3 text-[#c4a661]" />
                        <span>Tipografi</span>
                      </span>
                      <span className="text-neutral-200 font-medium truncate max-w-[120px]">
                        {fontInfo?.name?.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-[#c4a661]" />
                        <span>Frame Foto</span>
                      </span>
                      <span className="text-neutral-200 font-medium truncate max-w-[120px]">
                        {frameInfo?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={() => {
                    onApplyKit(kit);
                    onClose();
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrentlyActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#c4a661] text-neutral-950 hover:bg-[#d5b874] shadow-md'
                  }`}
                >
                  {isCurrentlyActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Sedang Digunakan</span>
                    </>
                  ) : (
                    <>
                      <span>Terapkan Gaya Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
