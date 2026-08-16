import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Palette,
  Type,
  Image as ImageIcon,
  Printer,
  Sparkles,
  Check,
  QrCode,
  Search,
  RotateCw,
  Layers,
  Sparkle,
  Stamp,
} from 'lucide-react';
import { InvitationData, EventType, ThemeToken, TexturePatternId, ParticleEffectId, WaxSealColorId, CornerOrnamentId } from '../../types';
import { THEMES, FONT_PRESETS, FRAME_SHAPES } from '../../data/presets';
import { themeRegistry } from '../../themes/registry';
import { TEXTURE_PRESETS } from '../../themes/textures';
import { useRealtimeThemes } from '../../hooks/useRealtimeThemes';

interface ThemingSidebarProps {
  data: InvitationData;
  onUpdateData: (newData: InvitationData) => void;
  onThemeChange: (themeId: ThemeToken) => void;
  onEventTypeChange: (eventType: EventType) => void;
  onOpenPrintStudio: () => void;
  onOpenStyleGallery: () => void;
  onPrevStyleKit?: () => void;
  onNextStyleKit?: () => void;
  onOpenDashboard?: () => void;
  mobileNavView?: string;
  onCloseMobileView?: () => void;
}

export const ThemingSidebar: React.FC<ThemingSidebarProps> = ({
  data,
  onUpdateData,
  onThemeChange,
  onEventTypeChange,
  onOpenPrintStudio,
  onOpenStyleGallery,
  onPrevStyleKit,
  onNextStyleKit,
  onOpenDashboard,
  mobileNavView,
  onCloseMobileView,
}) => {
  const { themes, isRefetching, refetchThemes } = useRealtimeThemes();
  const [activeInspectorTab, setActiveInspectorTab] = useState<'event' | 'theme' | 'font' | 'frame' | 'print'>('theme');
  const [themeToneFilter, setThemeToneFilter] = useState<'all' | 'light' | 'dark' | 'traditional'>('all');
  const [themeSearchQuery, setThemeSearchQuery] = useState('');
  const [isAdvancedModeMobile, setIsAdvancedModeMobile] = useState(false);
  const [sheetHeight, setSheetHeight] = useState<'peek' | 'half' | 'full'>('half');

  // Always reset to Quick Switcher by default whenever Tema tab is clicked on mobile
  useEffect(() => {
    if (mobileNavView === 'theme') {
      setIsAdvancedModeMobile(false);
    }
  }, [mobileNavView]);

  const activeFontId = data.themeConfig?.fontPairingId || 'royal_serif';
  const activeFrameId = data.themeConfig?.frameShape || 'royal_arch';
  const activeFont = FONT_PRESETS[activeFontId];
  const activeFrame = FRAME_SHAPES[activeFrameId];
  const activeTheme = THEMES[data.theme] || THEMES.champagne_gold;
  const activePrimary = data.themeConfig?.primaryColor || activeTheme.primary;

  const mobileHeightClass =
    sheetHeight === 'peek'
      ? 'h-[25vh] max-h-[25vh]'
      : sheetHeight === 'full'
      ? 'h-[85vh] max-h-[85vh]'
      : 'h-[52vh] max-h-[52vh]';

  // Inner Inspector Content Component (Shared by Desktop & Mobile Sheet)
  const renderInspectorContent = () => (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
      {/* 1. MASTER STYLE KIT BANNER */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#c4a661]/20 via-[#17171d] to-neutral-950 border border-[#c4a661]/40 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-bold text-[#c4a661] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Master Style Kit</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#c4a661]/20 text-[#c4a661] font-semibold border border-[#c4a661]/30">
            1-Click Preset
          </span>
        </div>

        <div className="text-sm font-bold text-white mb-0.5">{activeTheme.name}</div>
        <div className="text-[10px] text-neutral-400 mb-3 flex items-center gap-1.5">
          <span>{activeFont?.name?.split(' ')[0]}</span>
          <span>•</span>
          <span>{activeFrame?.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onPrevStyleKit && (
            <button
              type="button"
              onClick={onPrevStyleKit}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#c4a661]/40 text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
              title="Preset Sebelumnya (Mundur)"
            >
              ◀
            </button>
          )}

          <button
            type="button"
            onClick={onOpenStyleGallery}
            className="flex-1 py-2 px-3 rounded-xl bg-[#c4a661] text-neutral-950 text-xs font-bold hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer truncate"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Galeri Style Kit</span>
          </button>

          {onNextStyleKit && (
            <button
              type="button"
              onClick={onNextStyleKit}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#c4a661]/40 text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
              title="Preset Selanjutnya (Maju)"
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {/* 2. TABBED SEGMENTED CONTROLLER FOR FINE-TUNING */}
      <div>
        <div className="text-[10px] text-neutral-400 mb-1.5 font-semibold uppercase tracking-wider px-1">
          Kustomisasi Rinci:
        </div>

        <div className="grid grid-cols-5 gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
          {[
            { id: 'event' as const, label: 'Acara', icon: Calendar },
            { id: 'theme' as const, label: 'Warna', icon: Palette },
            { id: 'font' as const, label: 'Font', icon: Type },
            { id: 'frame' as const, label: 'Frame', icon: ImageIcon },
            { id: 'print' as const, label: 'Cetak', icon: Printer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeInspectorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE TAB CONTENT PANEL */}
      <div className="space-y-2.5">
        {/* TAB: EVENT TYPE */}
        {activeInspectorTab === 'event' && (
          <div className="space-y-1.5">
            {[
              { type: 'wedding' as const, label: 'Wedding Ceremony', desc: 'Pernikahan mempelai pria & wanita' },
              { type: 'khitanan' as const, label: 'Walimatul Khitan', desc: 'Tasyakuran khitan putra' },
              { type: 'aqiqah' as const, label: 'Aqiqah & Tasyakuran', desc: 'Kelahiran & syukuran bayi' },
              { type: 'birthday' as const, label: 'Birthday Celebration', desc: 'Pesta ulang tahun spesial' },
            ].map((item) => {
              const isActive = data.eventType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => onEventTypeChange(item.type)}
                  className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'border-[#c4a661] bg-[#c4a661]/15 text-white'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#c4a661] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB: THEME & COLOR */}
        {activeInspectorTab === 'theme' && (
          <div className="space-y-2.5">
            {/* Search Input & Database Sync for Themes */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={themeSearchQuery}
                  onChange={(e) => setThemeSearchQuery(e.target.value)}
                  placeholder="Cari tema / adat..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-7 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] transition"
                />
                {themeSearchQuery && (
                  <button
                    onClick={() => setThemeSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Database Sync Button */}
              <button
                type="button"
                onClick={() => refetchThemes()}
                title="Sinkronkan Tema Terbaru dari Database"
                className={`p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-[#c4a661]/40 text-neutral-400 hover:text-[#c4a661] transition cursor-pointer shrink-0 ${
                  isRefetching ? 'animate-spin text-[#c4a661]' : ''
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tone Filter Buttons */}
            <div className="grid grid-cols-4 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px] font-semibold gap-0.5">
              <button
                type="button"
                onClick={() => setThemeToneFilter('all')}
                className={`py-1 rounded-lg transition cursor-pointer text-center ${
                  themeToneFilter === 'all'
                    ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setThemeToneFilter('light')}
                className={`py-1 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                  themeToneFilter === 'light'
                    ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                <span>☀️ Cerah</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeToneFilter('dark')}
                className={`py-1 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                  themeToneFilter === 'dark'
                    ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🌙 Gelap</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeToneFilter('traditional')}
                className={`py-1 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                  themeToneFilter === 'traditional'
                    ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-xs'
                    : 'text-amber-400/90 hover:text-white'
                }`}
              >
                <span>🏛️ Adat</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[350px] overflow-y-auto pr-0.5 scrollbar-thin">
              {themeRegistry.searchThemes(themeSearchQuery, {
                category: themeToneFilter === 'traditional' ? 'traditional' : undefined,
                tone: themeToneFilter === 'light' || themeToneFilter === 'dark' ? themeToneFilter : undefined,
              }).map((th) => {
                const isSelected = data.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onThemeChange(th.id as ThemeToken)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition cursor-pointer relative ${
                      isSelected
                        ? 'border-[#c4a661] bg-[#c4a661]/20 text-[#c4a661] ring-1 ring-[#c4a661]'
                        : 'border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {(th as any).mode === 'light' && (
                      <span className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                        Cerah
                      </span>
                    )}
                    <span
                      className={`w-5 h-5 rounded-full bg-gradient-to-br ${th.previewGradient} mb-1 border border-white/20 shadow-xs`}
                    />
                    <span className="text-[11px] font-bold truncate max-w-full">{th.name}</span>
                    <span className="text-[9px] text-neutral-500 truncate max-w-full">{th.subtitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Background Texture Engine */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#c4a661]" />
                  <span>Tekstur Kertas Fisik</span>
                </span>
                <span className="text-[9px] text-[#c4a661]">Ultra-light SVG</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {Object.values(TEXTURE_PRESETS).map((tex) => {
                  const isSelected = (data.themeConfig?.textureId || 'none') === tex.id;
                  return (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          themeConfig: { ...data.themeConfig, textureId: tex.id },
                        })
                      }
                      className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="font-medium truncate max-w-full">{tex.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Particle System */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Sparkle className="w-3 h-3 text-[#c4a661]" />
                  <span>Efek Partikel Hidup</span>
                </span>
                <span className="text-[9px] text-emerald-400">60 FPS Canvas</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {[
                  { id: 'none', label: 'Mati' },
                  { id: 'gold_dust', label: '✨ Debu Emas' },
                  { id: 'jasmine_petals', label: '🌸 Melati' },
                  { id: 'rose_petals', label: '🌹 Mawar' },
                  { id: 'bokeh_glow', label: '💡 Bokeh' },
                ].map((p) => {
                  const isSelected = (data.themeConfig?.particleEffect || (activeTheme.mode === 'dark' ? 'gold_dust' : 'none')) === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          themeConfig: { ...data.themeConfig, particleEffect: p.id as ParticleEffectId },
                        })
                      }
                      className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                        isSelected
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661] font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="truncate max-w-full">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wax Seal Stamp Colors */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Stamp className="w-3 h-3 text-[#c4a661]" />
                  <span>Segel Lilin (Wax Seal)</span>
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'gold', color: '#b45309', label: 'Gold' },
                  { id: 'maroon', color: '#7f1d1d', label: 'Maroon' },
                  { id: 'sage', color: '#1e3a2f', label: 'Sage' },
                  { id: 'navy', color: '#1e293b', label: 'Navy' },
                  { id: 'rose', color: '#831843', label: 'Rose' },
                ].map((w) => {
                  const isSelected = (data.themeConfig?.waxSealColor || 'gold') === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          themeConfig: { ...data.themeConfig, waxSealColor: w.id as WaxSealColorId },
                        })
                      }
                      title={`Segel Lilin ${w.label}`}
                      className={`p-1 rounded-lg border flex flex-col items-center gap-1 transition cursor-pointer ${
                        isSelected ? 'border-[#c4a661] bg-[#c4a661]/20' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: w.color }} />
                      <span className="text-[8px] text-neutral-400">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-neutral-300">Custom Hex Color</span>
                {data.themeConfig?.primaryColor && (
                  <button
                    onClick={() =>
                      onUpdateData({
                        ...data,
                        themeConfig: { ...data.themeConfig, primaryColor: undefined },
                      })
                    }
                    className="text-[9px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Reset Default
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activePrimary}
                  onChange={(e) =>
                    onUpdateData({
                      ...data,
                      themeConfig: {
                        ...data.themeConfig,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                />
                <div className="flex-1 text-[10px] text-neutral-400">
                  <div className="text-neutral-200 font-mono font-bold">{activePrimary}</div>
                  <div className="text-[9px] text-neutral-500">Aksen Utama Seluruh Elemen</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TYPOGRAPHY FONTS */}
        {activeInspectorTab === 'font' && (
          <div className="space-y-2">
            {Object.values(FONT_PRESETS).map((font) => {
              const isSelected = activeFontId === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() =>
                    onUpdateData({
                      ...data,
                      themeConfig: {
                        ...data.themeConfig,
                        fontPairingId: font.id,
                      },
                    })
                  }
                  className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#c4a661] bg-[#c4a661]/15 text-white'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className="text-sm font-bold text-white truncate"
                      style={{ fontFamily: font.headingFamily }}
                    >
                      {font.previewText}
                    </div>
                    <div className="text-[10px] text-[#c4a661] font-medium mt-0.5 truncate">
                      {font.name}
                    </div>
                    <div className="text-[9px] text-neutral-500 truncate">{font.description}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#c4a661] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB: FRAME SHAPES */}
        {activeInspectorTab === 'frame' && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-neutral-300 mb-2">Bentuk Bingkai Foto & Motif Batik</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(FRAME_SHAPES).map((frame) => {
                  const isSelected = activeFrameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          themeConfig: {
                            ...data.themeConfig,
                            frameShape: frame.id,
                          },
                        })
                      }
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661] ring-1 ring-[#c4a661]'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-11 border-2 mb-1.5 bg-neutral-800/80 ${
                          isSelected ? 'border-[#c4a661]' : 'border-neutral-600'
                        } ${
                          frame.id === 'royal_arch' || frame.id === 'batik_parang_arch' || frame.id === 'batik_megamendung'
                            ? 'rounded-t-full rounded-b-md'
                            : frame.id === 'islamic_dome'
                            ? 'rounded-t-[30px] rounded-b-md'
                            : frame.id === 'soft_oval'
                            ? 'rounded-full'
                            : 'rounded-lg border-double border-4'
                        }`}
                      />
                      <div className="text-[11px] font-bold text-white truncate max-w-full">{frame.name}</div>
                      <div className="text-[9px] text-neutral-500 truncate max-w-full mt-0.5">
                        {frame.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corner Filigree Ornaments */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-neutral-300">Ornamen 4 Sudut Kartu (Filigree)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  { id: 'none', label: 'Polos (Tanpa Sudut)' },
                  { id: 'batik_prada', label: '🏛️ Sudut Batik Prada' },
                  { id: 'royal_crown', label: '👑 Sudut Mahkota Royal' },
                  { id: 'art_deco', label: '📐 Sudut Art Deco' },
                ].map((c) => {
                  const isSelected = (data.themeConfig?.cornerOrnament || 'none') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          themeConfig: { ...data.themeConfig, cornerOrnament: c.id as CornerOrnamentId },
                        })
                      }
                      className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                        isSelected
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661] font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="truncate max-w-full">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRINT STUDIO */}
        {activeInspectorTab === 'print' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onOpenPrintStudio}
              className="w-full p-3 bg-neutral-900/90 border border-neutral-800 hover:border-[#c4a661]/50 rounded-xl transition flex items-center gap-2.5 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Printer className="w-4 h-4 text-[#c4a661]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Generate Kartu A5</div>
                <div className="text-[9px] text-neutral-400">Siap Cetak 300 DPI High-Res</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenPrintStudio}
              className="w-full p-3 bg-neutral-900/90 border border-neutral-800 hover:border-[#c4a661]/50 rounded-xl transition flex items-center gap-2.5 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <QrCode className="w-4 h-4 text-[#c4a661]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Stiker Label 103</div>
                <div className="text-[9px] text-neutral-400">Tom & Jerry 103 Auto-Grid</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. PERMANENT DESKTOP LEFT SIDEBAR (Always Docked, Full Height) */}
      <aside className="hidden lg:flex w-72 h-full shrink-0 bg-[#111115] border-r border-[#1f1f27] flex-col select-none overflow-y-auto">
        {/* Desktop Brand & Dashboard Link */}
        <div className="p-4 md:p-5 border-b border-[#1f1f27] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#c4a661] text-xs uppercase tracking-widest font-bold">
              LuxeInvite
            </div>
            <span className="text-[9px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded border border-white/10">
              v2.4 Pro
            </span>
          </div>

          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-[#c4a661]/15 border border-neutral-800 hover:border-[#c4a661]/40 text-neutral-300 hover:text-[#c4a661] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>📂 Undangan Saya (Dashboard)</span>
            </button>
          )}
        </div>

        {/* Desktop Inspector Content */}
        {renderInspectorContent()}

        {/* Auto-Save Status Footer */}
        <div className="p-3.5 border-t border-[#1f1f27] bg-[#111115] shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Auto-save: Enabled</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 2. MOBILE FLOATING THEME BAR / BOTTOM SHEET (ONLY ON MOBILE lg:hidden) */}
      {mobileNavView === 'theme' && (
        <div className="lg:hidden">
          {/* Backdrop Click to Close — Tanpa Blur agar Live Preview 100% Jernih */}
          {isAdvancedModeMobile && (
            <div
              className="fixed inset-0 z-30 bg-black/30 animate-in fade-in duration-200"
              onClick={onCloseMobileView}
            />
          )}

          {!isAdvancedModeMobile ? (
            /* ULTRA COMPACT THEME SWITCHER BAR WITH SLIDE-UP PILL (0 Blur pada Canvas Live Preview) */
            <aside className="fixed bottom-14 left-0 right-0 z-40 px-3 pt-2 pb-3 bg-[#111115]/98 border-t-2 border-[#c4a661]/40 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom duration-300">
              {/* Slide-Up Expand Pill */}
              <div
                onClick={() => setIsAdvancedModeMobile(true)}
                className="w-full flex flex-col items-center pb-1.5 cursor-pointer group"
              >
                <div className="w-12 h-1.5 rounded-full bg-neutral-600 group-hover:bg-[#c4a661] transition mb-1" />
                <span className="text-[9px] text-neutral-400 font-medium group-hover:text-[#c4a661] transition">
                  ▲ Geser / Tap untuk Pengaturan Rinci
                </span>
              </div>

              <div className="flex items-center justify-between gap-1.5 max-w-md mx-auto w-full">
                {/* 1. Tombol Prev (Lebar Tetap - Diam) */}
                <button
                  type="button"
                  onClick={onPrevStyleKit}
                  className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer shrink-0 border border-neutral-800 active:scale-95 transition"
                  title="Preset Sebelumnya"
                >
                  ◀
                </button>

                {/* 2. Kotak Info Tema Tengah (Fleksibel & Terpotong Rapi - Tanpa Menggeser Tombol) */}
                <div
                  onClick={onOpenStyleGallery}
                  className="flex-1 min-w-0 h-9 bg-black/70 border border-neutral-800 rounded-xl px-2 flex flex-col justify-center items-center cursor-pointer hover:border-[#c4a661]/60 transition overflow-hidden"
                  title="Buka Galeri Master Style Kit"
                >
                  <div className="w-full text-xs font-bold text-white truncate text-center flex items-center justify-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs"
                      style={{ backgroundColor: activePrimary }}
                    />
                    <span className="truncate">{activeTheme.name}</span>
                  </div>
                  <div className="w-full text-[9px] text-neutral-400 truncate text-center">
                    {activeFont?.name?.split(' ')[0]} • {activeFrame?.name}
                  </div>
                </div>

                {/* 3. Tombol Next (Lebar Tetap - Diam) */}
                <button
                  type="button"
                  onClick={onNextStyleKit}
                  className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer shrink-0 border border-neutral-800 active:scale-95 transition"
                  title="Preset Selanjutnya"
                >
                  ▶
                </button>

                {/* 4. Tombol Rinci (Lebar Tetap - Diam) */}
                <button
                  type="button"
                  onClick={() => setIsAdvancedModeMobile(true)}
                  className="px-2.5 h-9 rounded-xl bg-neutral-900 border border-neutral-800 text-[#c4a661] text-[11px] font-bold hover:bg-neutral-800 flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95 transition"
                  title="Buka Pengaturan Rinci"
                >
                  <span>⚙️ Rinci</span>
                </button>

                {/* 5. Tombol Tutup (Lebar Tetap - Diam) */}
                <button
                  type="button"
                  onClick={onCloseMobileView}
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs shrink-0 cursor-pointer active:scale-95 transition"
                  title="Tutup Panel"
                >
                  ✕
                </button>
              </div>
            </aside>
          ) : (
            /* MOBILE ADVANCED THEME SHEET (0 Blur agar Live Preview Terlihat Jelas) */
            <aside
              className={`flex fixed bottom-14 left-0 right-0 ${mobileHeightClass} z-40 w-full rounded-t-3xl border-t-2 border-[#c4a661]/40 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] bg-[#111115]/98 pb-2 shrink-0 flex-col select-none transition-all duration-300 animate-in slide-in-from-bottom duration-300`}
            >
              <div className="flex flex-col items-center pt-2 pb-1.5 px-4 border-b border-neutral-800 shrink-0">
                <div
                  onClick={() => setSheetHeight(sheetHeight === 'half' ? 'peek' : sheetHeight === 'peek' ? 'full' : 'half')}
                  className="w-12 h-1.5 rounded-full bg-neutral-500 mb-1.5 cursor-pointer hover:bg-[#c4a661] transition"
                />
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedModeMobile(false)}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[#c4a661] hover:text-white cursor-pointer"
                  >
                    ← Switcher Cepat
                  </button>

                  <div className="flex items-center gap-1.5">
                    {sheetHeight !== 'peek' && (
                      <button
                        type="button"
                        onClick={() => setSheetHeight('peek')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        🔽 25%
                      </button>
                    )}

                    {sheetHeight !== 'full' ? (
                      <button
                        type="button"
                        onClick={() => setSheetHeight('full')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        🔼 85%
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSheetHeight('half')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        🔽 50%
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onCloseMobileView}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              {renderInspectorContent()}
            </aside>
          )}
        </div>
      )}
    </>
  );
};
