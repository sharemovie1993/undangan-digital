import React, { memo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { InvitationData, WishMessage } from '../../types';
import { themeRegistry } from '../../themes/registry';
import { PageStitcher } from '../../stitch/PageStitcher';
import { FloatingMusicPlayer } from '../FloatingMusicPlayer';

interface CanvasViewportProps {
  data: InvitationData;
  deviceFrame: 'mobile' | 'tablet' | 'desktop';
  isPhoneEnvelopeOpen: boolean;
  setIsPhoneEnvelopeOpen: (open: boolean) => void;
  wishes: WishMessage[];
  onAddWish: (wish: any) => void;
  currentStyleKitName?: string;
  onPrevStyleKit?: () => void;
  onNextStyleKit?: () => void;
  onOpenStyleGallery?: () => void;
}

export const CanvasViewport = memo(function CanvasViewport({
  data,
  deviceFrame,
  isPhoneEnvelopeOpen,
  setIsPhoneEnvelopeOpen,
  wishes,
  onAddWish,
  currentStyleKitName,
  onPrevStyleKit,
  onNextStyleKit,
  onOpenStyleGallery,
}: CanvasViewportProps) {
  const activeTheme = themeRegistry.getTheme(data.theme);
  const activePrimary = data.themeConfig?.primaryColor || activeTheme?.primary || '#c4a661';
  const activeBg = data.themeConfig?.bgColor || activeTheme?.bg || '#0a0a0b';

  return (
    <div className="flex-1 flex justify-center p-0 sm:p-4 md:p-8 bg-[radial-gradient(circle_at_center,_#1a1a24_0%,_#0a0a0b_100%)] overflow-y-auto touch-scroll">
      {/* DYNAMIC RESPONSIVE DEVICE FRAME CANVAS */}
      <div
        className={`transition-all duration-300 relative overflow-hidden flex flex-col w-full h-full contain-layout ${
          deviceFrame === 'mobile'
            ? 'sm:w-[375px] sm:h-[720px] sm:rounded-[48px] sm:border-[8px] sm:border-[#22222b] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]'
            : deviceFrame === 'tablet'
            ? 'sm:w-[680px] sm:h-[760px] sm:rounded-[32px] sm:border-[8px] sm:border-[#22222b] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]'
            : 'sm:w-full sm:max-w-4xl sm:h-[780px] sm:rounded-2xl sm:border-[6px] sm:border-[#22222b] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]'
        }`}
        style={{
          backgroundColor: activeBg,
        }}
      >
        {/* Speaker Notch (Only shown on Desktop/Tablet container mockups) */}
        <div className="hidden sm:flex w-32 h-6 bg-[#22222b] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50 items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-neutral-900 mr-2" />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activePrimary }} />
        </div>

        {/* Top Control Bar: Envelope Toggle (Clean & Raised Position) */}
        <div className="absolute top-2.5 sm:top-4 left-0 right-0 z-40 px-3 sm:px-4 flex items-center justify-start pointer-events-auto">
          {/* Toggle Envelope */}
          <button
            type="button"
            onClick={() => setIsPhoneEnvelopeOpen(!isPhoneEnvelopeOpen)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md hover:scale-105"
            title={isPhoneEnvelopeOpen ? 'Tutup Amplop (Kembali ke Cover Depan)' : 'Buka Amplop'}
          >
            <span>{isPhoneEnvelopeOpen ? '✉️ Tutup Amplop' : '📬 Buka Amplop'}</span>
          </button>
        </div>

        {/* Live Inner Interactive Screen */}
        <div className="flex-1 overflow-y-auto relative scrollbar-none pt-12 sm:pt-0 touch-scroll">
          <PageStitcher
            data={data}
            theme={data.theme}
            recipientName="Bpk. Ahmad Suherman & Kel"
            isEnvelopeOpen={isPhoneEnvelopeOpen}
            onOpenEnvelope={() => setIsPhoneEnvelopeOpen(true)}
            wishes={wishes}
            onAddWish={onAddWish}
            stitchBlocks={data.stitchBlocks}
          />
        </div>

        {/* Pinned Static Floating Music Player (Does not move on scroll) */}
        {data.enabledBlocks?.music !== false && (
          <FloatingMusicPlayer data={data} position="absolute" />
        )}
      </div>
    </div>
  );
});

CanvasViewport.displayName = 'CanvasViewport';

