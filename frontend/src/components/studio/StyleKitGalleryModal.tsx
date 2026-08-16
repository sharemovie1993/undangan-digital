import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Check, ArrowRight, Palette, Type, Image as ImageIcon, Search } from 'lucide-react';
import { MasterStyleKit } from '../../types';
import { FONT_PRESETS, FRAME_SHAPES, THEMES } from '../../data/presets';
import { themeRegistry } from '../../themes/registry';

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredKits = themeRegistry.searchStyleKits(searchQuery, selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111115] border border-[#c4a661]/40 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl my-auto">
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

        {/* Search Bar & Category Filters */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema, motif adat, warna (e.g. Jawa, Sunda, Sage, Gold, Pink)..."
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs with Dynamic Item Count */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: '✨ Semua Koleksi' },
              { id: 'traditional', label: '🏛️ Adat Nusantara' },
              { id: 'royal', label: '👑 Royal Palace' },
              { id: 'islamic', label: '🌿 Nuansa Islami' },
              { id: 'romantic', label: '🌸 Romantis' },
              { id: 'modern', label: '🌑 Modern Clean' },
              { id: 'festive', label: '🎉 Ceria / Party' },
            ].map((cat) => {
              const count = cat.id === 'all'
                ? themeRegistry.getAllStyleKits().length
                : themeRegistry.getStyleKitsByCategory(cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#c4a661] text-neutral-950 shadow-md font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id
                        ? 'bg-neutral-950/30 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Master Style Kits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredKits.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-400 text-xs">
              Tidak ada tema yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredKits.map((kit) => {
              const fontInfo = FONT_PRESETS[kit.fontPairingId as keyof typeof FONT_PRESETS];
              const frameInfo = FRAME_SHAPES[kit.frameShape as keyof typeof FRAME_SHAPES];
              const themeInfo = themeRegistry.getTheme(kit.themeId);

              const isCurrentlyActive =
                currentThemeId === kit.themeId &&
                (currentFontId === kit.fontPairingId || (!currentFontId && kit.fontPairingId === 'royal_serif')) &&
                (currentFrameId === kit.frameShape || (!currentFrameId && kit.frameShape === 'royal_arch'));

              // Smart visual tags
              const textureLabel = kit.category === 'traditional' ? '📜 Linen' : kit.category === 'romantic' ? '📜 Katun' : kit.category === 'royal' ? '📜 Linen' : '📜 Grain';
              const particleLabel = kit.category === 'traditional' ? '🌸 Melati' : kit.category === 'royal' ? '✨ Emas' : kit.category === 'romantic' ? '🌹 Mawar' : '💡 Bokeh';

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
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${kit.previewGradient} border border-white/30 shadow-xs`}
                        />
                        <span className="text-[10px] font-medium text-neutral-400">
                          {themeInfo?.name?.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Font Rendering Preview Box */}
                    <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60 mb-3 text-center">
                      <div
                        className="text-base font-bold truncate"
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
                    <div className="space-y-1.5 mb-3 text-[11px]">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Type className="w-3 h-3 text-[#c4a661]" />
                          <span>Tipografi</span>
                        </span>
                        <span className="text-white font-medium truncate max-w-[120px]">
                          {fontInfo?.name?.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3 text-[#c4a661]" />
                          <span>Bentuk Bingkai</span>
                        </span>
                        <span className="text-white font-medium truncate max-w-[120px]">
                          {frameInfo?.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Palette className="w-3 h-3 text-[#c4a661]" />
                          <span>Efek & Tekstur</span>
                        </span>
                        <span className="text-amber-300/90 font-medium truncate max-w-[120px] text-[10px]">
                          {textureLabel} • {particleLabel}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                      {kit.description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => {
                      onApplyKit(kit as any);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isCurrentlyActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-[#c4a661] text-neutral-950 hover:bg-[#d5b874]'
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Sedang Aktif</span>
                      </>
                    ) : (
                      <>
                        <span>Terapkan Preset Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
