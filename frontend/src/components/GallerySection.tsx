import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Grid, Eye } from 'lucide-react';
import { InvitationData } from '../types';
import { THEMES, FONT_PRESETS } from '../data/presets';

interface GallerySectionProps {
  data: InvitationData;
}

// Progressive Image Component with Shimmer Placeholder
const GalleryImageItem: React.FC<{
  src: string;
  alt?: string;
  onClick: () => void;
  className?: string;
  aspectClass?: string;
  activePrimary: string;
  caption?: string;
  delay?: number;
}> = ({ src, alt, onClick, aspectClass = 'aspect-square', activePrimary, caption, delay = 0 }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border shadow-md bg-neutral-950 ${aspectClass}`}
      style={{ borderColor: `${activePrimary}35` }}
    >
      {/* Shimmer Placeholder Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-neutral-700 opacity-50" />
        </div>
      )}

      <img
        src={src}
        alt={alt || caption || 'Foto Galeri'}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white text-xs">
        <span className="truncate max-w-[80%] text-[11px] font-medium">{caption}</span>
        <div
          className="p-1.5 rounded-full backdrop-blur-md shrink-0"
          style={{ backgroundColor: `${activePrimary}30`, color: activePrimary }}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

export const GallerySection: React.FC<GallerySectionProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const activeBg = data.themeConfig?.bgColor || theme.bg || '#0a0a0b';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';
  const headingFont =
    FONT_PRESETS[data.themeConfig?.fontPairingId || 'royal_serif']?.headingFamily || 'serif';

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  if (gallery.length === 0) return null;

  // Show first 6 photos initially for instant sub-second rendering, with expand button for 6+
  const INITIAL_VISIBLE_COUNT = 6;
  const visiblePhotos = isExpanded ? gallery : gallery.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = gallery.length - INITIAL_VISIBLE_COUNT;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % gallery.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <section
      id="gallery-section"
      className="relative px-5 py-12 scroll-mt-6"
      style={{
        backgroundColor: activeBg,
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ color: activePrimary }}
        >
          OUR MEMORIES & GALLERY
        </span>
        <h2
          className="text-2xl sm:text-3xl font-bold mt-1 text-white"
          style={{ fontFamily: headingFont }}
        >
          {data.eventType === 'khitanan'
            ? 'Galeri & Dokumentasi'
            : data.eventType === 'aqiqah'
            ? 'Momen Manis Buah Hati'
            : 'Galeri & Momen Bahagia'}
        </h2>
        <div
          className="mx-auto mt-2 h-0.5 w-16 rounded-full"
          style={{ backgroundColor: activePrimary }}
        />
      </div>

      {/* Gallery Grid */}
      <div className="space-y-3 max-w-md mx-auto">
        {/* Photo 1: Large Featured */}
        {visiblePhotos[0] && (
          <GalleryImageItem
            src={visiblePhotos[0].url}
            caption={visiblePhotos[0].caption}
            onClick={() => openLightbox(0)}
            aspectClass="aspect-[16/10]"
            activePrimary={activePrimary}
            delay={0}
          />
        )}

        {/* Photos 2-N: Fast 2-Column Grid */}
        {visiblePhotos.length > 1 && (
          <div className="grid grid-cols-2 gap-3">
            {visiblePhotos.slice(1).map((item, idx) => (
              <GalleryImageItem
                key={item.id || idx + 1}
                src={item.url}
                caption={item.caption}
                onClick={() => openLightbox(idx + 1)}
                aspectClass="aspect-square"
                activePrimary={activePrimary}
                delay={Math.min(idx * 0.05, 0.3)}
              />
            ))}
          </div>
        )}

        {/* Expand / Collapse Button for Large Albums (e.g. 20+ photos) */}
        {gallery.length > INITIAL_VISIBLE_COUNT && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-lg cursor-pointer border"
              style={{
                backgroundColor: `${activePrimary}20`,
                borderColor: `${activePrimary}50`,
                color: activePrimary,
              }}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>
                {isExpanded
                  ? 'Sembunyikan Sebagian Foto'
                  : `Lihat Semua Foto (+${remainingCount} Foto Lainnya)`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* High Performance Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && gallery[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2.5 text-white/80 hover:text-white rounded-full bg-neutral-900/80 hover:bg-neutral-800 cursor-pointer border border-neutral-700"
              title="Tutup Galeri"
            >
              <X className="w-5 h-5" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 sm:left-6 z-50 p-2.5 text-white/80 hover:text-white rounded-full bg-neutral-900/80 hover:bg-neutral-800 cursor-pointer border border-neutral-700 shadow-xl"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextPhoto}
                  className="absolute right-3 sm:right-6 z-50 p-2.5 text-white/80 hover:text-white rounded-full bg-neutral-900/80 hover:bg-neutral-800 cursor-pointer border border-neutral-700 shadow-xl"
                  title="Foto Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="relative max-w-3xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={gallery[lightboxIndex].url}
                alt={gallery[lightboxIndex].caption || 'Foto Galeri'}
                decoding="async"
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="mt-3 text-center">
                {gallery[lightboxIndex].caption && (
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {gallery[lightboxIndex].caption}
                  </p>
                )}
                <p className="text-neutral-400 text-[11px] mt-0.5 font-mono">
                  {lightboxIndex + 1} dari {gallery.length} foto
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
