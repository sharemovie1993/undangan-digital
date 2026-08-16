import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';
import { InvitationData, GalleryItem } from '../types';
import { THEMES } from '../data/presets';

interface GallerySectionProps {
  data: InvitationData;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => setSelectedIdx(idx);
  const closeLightbox = () => setSelectedIdx(null);

  const prevPhoto = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + data.gallery.length) % data.gallery.length);
    }
  };

  const nextPhoto = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % data.gallery.length);
    }
  };

  return (
    <section id="gallery-section" className="relative px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-amber-800 font-semibold">
          OUR MEMORIES
        </span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          Photo & Moments
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-16 bg-amber-400/80 rounded-full" />
      </div>

      {/* Gallery Grid (matching image 3 layout: large hero photo, side-by-side pair, bottom wide arch) */}
      <div className="space-y-3.5 max-w-md mx-auto">
        {/* Photo 1: Large Featured */}
        {data.gallery[0] && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => openLightbox(0)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-amber-200/80 shadow-md aspect-[4/3]"
          >
            <img
              src={data.gallery[0].url}
              alt={data.gallery[0].caption}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs">
              <span className="truncate">{data.gallery[0].caption}</span>
            </div>
          </motion.div>
        )}

        {/* Photos 2 & 3: Side by side 2-column */}
        <div className="grid grid-cols-2 gap-3.5">
          {data.gallery.slice(1, 3).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openLightbox(idx + 1)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-200/80 shadow-md aspect-square"
            >
              <img
                src={item.url}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Photos 4+: Remaining grid */}
        {data.gallery.slice(3).map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => openLightbox(idx + 3)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-amber-200/80 shadow-md aspect-[16/10]"
          >
            <img
              src={item.url}
              alt={item.caption}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4 text-white text-xs">
              <span className="truncate">{item.caption}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && data.gallery[selectedIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 z-10 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-4 z-10 p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-2xl max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={data.gallery[selectedIdx].url}
                alt={data.gallery[selectedIdx].caption}
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
                referrerPolicy="no-referrer"
              />
              <p className="mt-3 text-center text-sm text-neutral-300 px-4">
                {data.gallery[selectedIdx].caption}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1">
                {selectedIdx + 1} of {data.gallery.length}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-4 z-10 p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
