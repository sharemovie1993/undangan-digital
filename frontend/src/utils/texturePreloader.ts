/**
 * 📱 Theme & Texture Preloader (Mobile-First RAM Cache)
 *
 * Mengoptimalkan pergantian tema dan latar bertekstur agar 0ms (instant).
 * Mencegah background flicker/delay saat beralih antara tema Royal, Islamic,
 * Traditional, Romantic, atau Modern di perangkat seluler.
 */
import { useEffect, useRef } from 'react';
import { TEXTURE_PRESETS } from '../themes/textures';
import { TexturePatternId } from '../types';

// Global Set untuk melacak asset yang sudah di-preload ke memory browser
const preloadedCache = new Set<string>();

/**
 * Preload satu data-URI / URL gambar ke browser memory cache
 */
export function preloadImageSource(src: string): Promise<void> {
  if (!src || src === 'none' || preloadedCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedCache.add(src);
      resolve();
    };
    img.onerror = () => resolve(); // Non-blocking
    img.src = src;
  });
}

/**
 * Preload semua texture SVG presets ke memory browser saat awal dimuat
 */
export function preloadAllTextures(): void {
  if (typeof window === 'undefined') return;

  const textureIds = Object.keys(TEXTURE_PRESETS) as TexturePatternId[];
  textureIds.forEach((id) => {
    const preset = TEXTURE_PRESETS[id];
    if (preset && preset.getStyle) {
      const style = preset.getStyle(true);
      if (style.backgroundImage && typeof style.backgroundImage === 'string') {
        const match = style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
          preloadImageSource(match[1]);
        }
      }
    }
  });
}

/**
 * React Hook untuk auto-preload textures di background saat app/component mount
 */
export function useTexturePreloader(): void {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Jalankan di requestIdleCallback atau setTimeout agar tidak membebani main thread saat LCP
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        preloadAllTextures();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        preloadAllTextures();
      }, 500);
    }
  }, []);
}
