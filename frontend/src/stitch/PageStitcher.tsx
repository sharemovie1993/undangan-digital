import React from 'react';
import { InvitationData, ThemeToken, WishMessage } from '../types';
import { themeRegistry } from '../themes/registry';
import { StitchBlockInstance } from '../contracts/stitch.contract';
import { DEFAULT_STITCH_INSTANCES } from './BlockRegistry';
import { HeroEnvelope } from '../components/HeroEnvelope';
import { ProfileSection } from '../components/ProfileSection';
import { CountdownSchedule } from '../components/CountdownSchedule';
import { GallerySection } from '../components/GallerySection';
import { DigitalGiftSection } from '../components/DigitalGiftSection';
import { RsvpWishesSection } from '../components/RsvpWishesSection';

interface PageStitcherProps {
  data: InvitationData;
  theme: ThemeToken;
  recipientName: string;
  isEnvelopeOpen: boolean;
  onOpenEnvelope: () => void;
  wishes: WishMessage[];
  onAddWish: (wish: any) => void;
  stitchBlocks?: StitchBlockInstance[];
}

export const PageStitcher: React.FC<PageStitcherProps> = ({
  data,
  theme,
  recipientName,
  isEnvelopeOpen,
  onOpenEnvelope,
  wishes,
  onAddWish,
  stitchBlocks = DEFAULT_STITCH_INSTANCES
}) => {
  const currentTheme = themeRegistry.getTheme(theme);
  const activeBg = data.themeConfig?.bgColor || currentTheme.bg;
  const activeTextMain = currentTheme.textMain;

  // Safely normalize stitchBlocks into a valid array
  let safeBlocks: StitchBlockInstance[] = DEFAULT_STITCH_INSTANCES;
  if (Array.isArray(stitchBlocks) && stitchBlocks.length > 0) {
    safeBlocks = stitchBlocks;
  } else if (typeof stitchBlocks === 'string') {
    try {
      const parsed = JSON.parse(stitchBlocks);
      if (Array.isArray(parsed) && parsed.length > 0) {
        safeBlocks = parsed;
      }
    } catch {
      safeBlocks = DEFAULT_STITCH_INSTANCES;
    }
  } else if (Array.isArray(data?.stitchBlocks) && data.stitchBlocks.length > 0) {
    safeBlocks = data.stitchBlocks;
  } else if (typeof data?.stitchBlocks === 'string') {
    try {
      const parsed = JSON.parse(data.stitchBlocks);
      if (Array.isArray(parsed) && parsed.length > 0) {
        safeBlocks = parsed;
      }
    } catch {
      safeBlocks = DEFAULT_STITCH_INSTANCES;
    }
  }

  // Sort blocks by order and filter only enabled ones
  const sortedBlocks = [...safeBlocks]
    .filter(b => b && b.isEnabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderBlock = (block: StitchBlockInstance) => {
    switch (block.blockId) {
      case 'hero-envelope':
        if (!data.enabledBlocks?.hero) return null;
        return (
          <div key={block.id} id="section-hero" className="scroll-mt-4">
            <HeroEnvelope
              data={data}
              theme={theme}
              recipientName={recipientName}
              isOpen={isEnvelopeOpen}
              onOpen={onOpenEnvelope}
            />
          </div>
        );

      case 'profile-honoree':
        if (!data.enabledBlocks?.profile) return null;
        return (
          <div key={block.id} id="section-profile" className="scroll-mt-4">
            <ProfileSection data={data} theme={theme} />
          </div>
        );

      case 'countdown-schedule':
        if (!data.enabledBlocks?.schedule) return null;
        return (
          <div key={block.id} id="section-schedule" className="scroll-mt-4">
            <CountdownSchedule data={data} theme={theme} />
          </div>
        );

      case 'gallery-media':
        if (!data.enabledBlocks?.gallery) return null;
        return (
          <div key={block.id} id="section-gallery" className="scroll-mt-4">
            <GallerySection data={data} theme={theme} />
          </div>
        );

      case 'bank-gift':
        if (!data.enabledBlocks?.gift) return null;
        return (
          <div key={block.id} id="section-gift" className="scroll-mt-4">
            <DigitalGiftSection data={data} theme={theme} />
          </div>
        );

      case 'rsvp-guestbook':
        if (!data.enabledBlocks?.rsvp) return null;
        return (
          <div key={block.id} id="section-rsvp" className="scroll-mt-4">
            <RsvpWishesSection
              data={data}
              theme={theme}
              wishes={wishes}
              onAddWish={onAddWish}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="w-full space-y-0 relative min-h-screen transition-colors duration-300 font-sans"
      style={{ backgroundColor: activeBg, color: activeTextMain }}
    >
      {sortedBlocks.map(block => renderBlock(block))}
    </div>
  );
};
