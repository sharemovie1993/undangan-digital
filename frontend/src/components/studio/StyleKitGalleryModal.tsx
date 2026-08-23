import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Check, ArrowRight, Palette, Type, Image as ImageIcon, Search, Smartphone, Eye } from 'lucide-react';
import { MasterStyleKit, InvitationData } from '../../types';
import { MasterStyleKitDefinition } from '../../themes/types';
import { FONT_PRESETS, FRAME_SHAPES } from '../../data/presets';
import { themeRegistry } from '../../themes/registry';
import { TEXTURE_PRESETS } from '../../themes/textures';
import { AmbientParticleCanvas } from '../effects/AmbientParticleCanvas';
import { WaxSealStamp } from '../effects/WaxSealStamp';
import { BatikFrameWrapper } from '../effects/BatikFrames';
import { CornerOrnaments } from '../effects/CornerOrnaments';

interface StyleKitGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  currentFontId?: string;
  currentFrameId?: string;
  data?: InvitationData;
  onApplyKit: (kit: MasterStyleKit) => void;
}

export const StyleKitGalleryModal: React.FC<StyleKitGalleryModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  currentFontId,
  currentFrameId,
  data,
  onApplyKit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allKits = themeRegistry.getAllStyleKits() || [];
  const filteredKits = themeRegistry.searchStyleKits(searchQuery, selectedCategory);

  // Active or hovered kit for Live Smartphone Preview
  const activeKit = allKits.find((k) => k.themeId === currentThemeId) || allKits[0];
  const [previewKit, setPreviewKit] = useState<MasterStyleKitDefinition>(activeKit || allKits[0]);

  useEffect(() => {
    if (isOpen && activeKit) {
      setPreviewKit(activeKit);
    }
  }, [isOpen, activeKit?.id]);

  if (!isOpen) return null;

  // Resolve preview kit properties
  const previewTheme = themeRegistry.getTheme(previewKit.themeId);
  const previewFont = FONT_PRESETS[previewKit.fontPairingId as keyof typeof FONT_PRESETS];
  const previewFrame = FRAME_SHAPES[previewKit.frameShape as keyof typeof FRAME_SHAPES];

  // Resolve textures & particles for preview kit
  const previewTextureId = previewKit.textureId || (
    previewKit.category === 'traditional' ? 'linen' :
    previewKit.category === 'royal' ? 'linen' :
    previewKit.category === 'romantic' ? 'cotton' :
    previewKit.category === 'islamic' ? 'linen' : 'grain'
  );

  const previewParticle = previewKit.particleEffect || (
    previewKit.category === 'traditional' ? 'jasmine_petals' :
    previewKit.category === 'royal' ? 'gold_dust' :
    previewKit.category === 'romantic' ? 'rose_petals' :
    previewKit.category === 'islamic' ? 'gold_dust' : 'bokeh_glow'
  );

  const previewWaxColor = previewKit.waxSealColor || (
    previewKit.category === 'royal' ? 'gold' :
    previewKit.category === 'traditional' ? 'maroon' :
    previewKit.category === 'islamic' ? 'sage' :
    previewKit.category === 'romantic' ? 'rose' : 'navy'
  );

  const previewCorner = previewKit.cornerOrnament || (
    previewKit.category === 'traditional' ? 'batik_prada' :
    previewKit.category === 'royal' ? 'royal_crown' :
    previewKit.category === 'modern' ? 'art_deco' : 'none'
  );

  const textureStyle = TEXTURE_PRESETS[previewTextureId]?.getStyle(previewTheme.mode === 'dark') || {};
  const isBatikFrame = previewKit.frameShape && previewKit.frameShape.startsWith('batik_');
  const frameClass = previewFrame?.className || 'arch-frame';

  const coupleNames = data?.eventTitle || 'Romeo & Juliet';
  const samplePhoto = data?.profiles?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80';

  const isCurrentActiveSelected =
    currentThemeId === previewKit.themeId &&
    (currentFontId === previewKit.fontPairingId || (!currentFontId && previewKit.fontPairingId === 'royal_serif')) &&
    (currentFrameId === previewKit.frameShape || (!currentFrameId && previewKit.frameShape === 'royal_arch'));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl bg-[#0f0f13] border border-[#c4a661]/40 rounded-3xl p-4 sm:p-6 md:p-7 shadow-[0_0_80px_rgba(0,0,0,0.9)] my-auto flex flex-col max-h-[94vh]"
      >
        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c4a661] to-amber-700 flex items-center justify-center text-neutral-950 shadow-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Visual Master Style Kits
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/40 font-semibold hidden sm:inline-flex">
                  1-Click Magic Transform
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Koleksi terpadu karya desainer: Warna, Tipografi, Bingkai Batik, Tekstur Kertas, dan Efek Hidup.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition cursor-pointer"
            title="Tutup Galeri"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MAIN BODY: SPLIT-SCREEN ON DESKTOP, STACKED ON MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 overflow-hidden flex-1">
          {/* LEFT COLUMN: SEARCH, CATEGORIES & PRESET CARDS (7 Cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden space-y-3">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tema, motif batik, warna (e.g. Jawa, Sunda, Sage, Gold, Pink)..."
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

            {/* Category Tabs with Dynamic Item Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {[
                { id: 'all', label: '✨ Semua' },
                { id: 'traditional', label: '🏛️ Adat Nusantara' },
                { id: 'royal', label: '👑 Royal Palace' },
                { id: 'islamic', label: '🌿 Islami' },
                { id: 'romantic', label: '🌸 Romantis' },
                { id: 'modern', label: '🌑 Modern' },
                { id: 'festive', label: '🎉 Pesta' },
              ].map((cat) => {
                const count = cat.id === 'all'
                  ? allKits.length
                  : allKits.filter((k) => k.category === cat.id).length;

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

            {/* Scrolling Grid of Style Kits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 max-h-[56vh] scrollbar-thin">
              {filteredKits.length === 0 ? (
                <div className="col-span-full py-12 text-center text-neutral-400 text-xs">
                  Tidak ada tema yang cocok dengan pencarian "{searchQuery}".
                </div>
              ) : (
                filteredKits.map((kit) => {
                  const fontInfo = FONT_PRESETS[kit.fontPairingId as keyof typeof FONT_PRESETS];
                  const frameInfo = FRAME_SHAPES[kit.frameShape as keyof typeof FRAME_SHAPES];
                  const themeInfo = themeRegistry.getTheme(kit.themeId);
                  const isPreviewing = previewKit.id === kit.id;
                  const isSelected = currentThemeId === kit.themeId;

                  const textureTag = kit.category === 'traditional' ? '📜 Linen' : kit.category === 'romantic' ? '📜 Katun' : kit.category === 'royal' ? '📜 Linen' : '📜 Grain';
                  const particleTag = kit.category === 'traditional' ? '🌸 Melati' : kit.category === 'royal' ? '✨ Emas' : kit.category === 'romantic' ? '🌹 Mawar' : '💡 Bokeh';

                  return (
                    <motion.div
                      key={kit.id}
                      onClick={() => setPreviewKit(kit)}
                      whileHover={{ scale: 1.01 }}
                      className={`relative rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isPreviewing
                          ? 'bg-[#18181f] border-[#c4a661] ring-2 ring-[#c4a661]/50 shadow-[0_0_20px_rgba(196,166,97,0.25)]'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-200 border border-white/5 truncate max-w-[120px]">
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

                        {/* Title & Tagline */}
                        <div className="mb-2">
                          <h4
                            className="text-sm font-bold text-white truncate"
                            style={{ fontFamily: fontInfo?.headingFamily }}
                          >
                            {kit.name}
                          </h4>
                          <p className="text-[10px] text-[#c4a661] font-medium truncate mt-0.5">
                            {kit.tagline}
                          </p>
                        </div>

                        {/* Composition Badges */}
                        <div className="flex items-center gap-1.5 text-[9.5px] text-neutral-400 mb-2 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                            {fontInfo?.name?.split(' ')[0]}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                            {frameInfo?.badge?.split(' ')[0] || frameInfo?.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-300/80">
                            {textureTag} • {particleTag}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar on Card */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 mt-1">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#c4a661]" />
                          <span>{isPreviewing ? 'Sedang Dipratinjau' : 'Klik Pratinjau'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyKit(kit as any);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-[#c4a661] text-neutral-950 hover:bg-[#d5b874]'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <span>Terapkan</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE INTERACTIVE PHONE MOCKUP (5 Cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden">
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#c4a661]" />
                <span className="text-xs font-bold text-neutral-200">Live Phone Simulation</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>60 FPS Live</span>
              </span>
            </div>

            {/* SMARTPHONE FRAME CONTAINER */}
            <div
              className="relative w-full max-w-[270px] h-[370px] sm:h-[400px] rounded-[36px] border-[6px] border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(196,166,97,0.15)] overflow-hidden flex flex-col text-center transition-colors duration-500"
              style={{
                backgroundColor: previewTheme.bg,
                color: previewTheme.textMain,
                ...textureStyle,
              }}
            >
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/90 rounded-full z-30 shadow-xs pointer-events-none" />

              {/* Ambient Particle Canvas Engine */}
              <AmbientParticleCanvas
                effect={previewParticle}
                primaryColor={previewKit.primaryColor || previewTheme.primary}
                isDark={previewTheme.mode === 'dark'}
              />

              {/* Corner Ornaments */}
              <CornerOrnaments type={previewCorner} primaryColor={previewKit.primaryColor || previewTheme.primary} />

              {/* Invitation Content Inside Phone */}
              <div className="relative z-10 flex-1 p-4 pt-7 flex flex-col items-center justify-between overflow-y-auto scrollbar-none">
                {/* 3D Monogram Wax Seal */}
                <div className="mt-1">
                  <WaxSealStamp
                    monogram={
                      data?.eventType === 'wedding'
                        ? coupleNames.split('&').map(s => s.trim()[0]).filter(Boolean).join(' & ') || 'R & J'
                        : coupleNames.replace(/^(Walimatul Khitan|Tasyakuran Aqiqah|Syukuran|Ulang Tahun)\s*/i, '').trim()[0]?.toUpperCase() || 'K'
                    }
                    colorId={previewWaxColor}
                    className="scale-90"
                  />
                </div>

                {/* Tagline */}
                <div className="mt-2 text-[8.5px] font-semibold tracking-[0.25em] uppercase" style={{ color: previewKit.primaryColor || previewTheme.primary }}>
                  {previewKit.tagline || (data?.eventType === 'khitanan' ? 'WALIMATUL KHITAN' : data?.eventType === 'aqiqah' ? 'TASYAKURAN AQIQAH' : data?.eventType === 'birthday' ? 'HAPPY BIRTHDAY' : 'THE WEDDING OF')}
                </div>

                {/* Couple Names */}
                <h3
                  className="text-lg font-bold tracking-tight my-1 transition-all"
                  style={{
                    fontFamily: previewFont?.headingFamily,
                    color: previewTheme.textMain,
                  }}
                >
                  {coupleNames}
                </h3>

                {/* Framed Couple Photo */}
                <div className="my-1.5 flex items-center justify-center">
                  {isBatikFrame ? (
                    <BatikFrameWrapper shapeId={previewKit.frameShape} primaryColor={previewKit.primaryColor || previewTheme.primary} className="w-28 h-36">
                      <img
                        src={samplePhoto}
                        alt={coupleNames}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </BatikFrameWrapper>
                  ) : (
                    <div
                      className={`relative w-28 h-36 ${frameClass} border-2 overflow-hidden shadow-lg`}
                      style={{
                        backgroundColor: previewTheme.cardBg,
                        borderColor: `${previewKit.primaryColor || previewTheme.primary}90`,
                      }}
                    >
                      <img
                        src={samplePhoto}
                        alt={coupleNames}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Composition Specs Pills */}
                <div className="text-[8.5px] text-neutral-400 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 mt-1">
                  {previewTheme.name} • {previewFrame?.name}
                </div>
              </div>
            </div>

            {/* BOTTOM APPLY BUTTON FOR LIVE PREVIEW */}
            <div className="w-full max-w-[270px] mt-3">
              <button
                type="button"
                onClick={() => {
                  onApplyKit(previewKit as any);
                  onClose();
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isCurrentActiveSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-[#c4a661] text-neutral-950 hover:bg-[#d5b874]'
                }`}
              >
                {isCurrentActiveSelected ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Preset Ini Sedang Digunakan</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Terapkan Preset Ini (1-Klik)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
