/**
 * 📱 SmartImage — Universal Lazy-Load Image Component
 *
 * Fitur Mobile-First:
 * - loading="lazy" native browser (iOS 15.4+, Android 5+)
 * - decoding="async" agar main thread tidak terblokir saat decode gambar
 * - Shimmer skeleton placeholder selagi gambar loading
 * - onError fallback agar tidak tampil broken image
 * - fetchpriority="high" untuk LCP gambar pertama (above the fold)
 * - Bisa wrap dengan React.memo di parent agar tidak re-render ikut parent
 */
import React, { useState, memo } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  /** Jika true, gambar ini adalah LCP (above the fold) — tidak lazy, prioritas tinggi */
  priority?: boolean;
  /** CSS class untuk wrapper div */
  wrapperClassName?: string;
  /** Warna background shimmer (default neutral-900) */
  shimmerColor?: string;
}

export const SmartImage = memo(function SmartImage({
  src,
  alt = '',
  priority = false,
  wrapperClassName = '',
  shimmerColor,
  className = '',
  style,
  ...rest
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`} style={style}>
      {/* Shimmer Skeleton */}
      {!isLoaded && !isError && (
        <div
          className="absolute inset-0 animate-pulse flex items-center justify-center"
          style={{ backgroundColor: shimmerColor || '#171717' }}
        >
          {/* Subtle shimmer gradient sweep */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.08) 50%, transparent 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.6s infinite',
            }}
          />
        </div>
      )}

      {/* Broken Image Fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
          <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' } as any : {})}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setIsError(true); setIsLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-400 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        referrerPolicy="no-referrer"
        {...rest}
      />
    </div>
  );
});

SmartImage.displayName = 'SmartImage';
