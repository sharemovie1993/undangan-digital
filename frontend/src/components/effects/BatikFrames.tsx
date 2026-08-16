import React from 'react';
import { FrameShapeId } from '../../types';

interface BatikFrameWrapperProps {
  shapeId?: FrameShapeId;
  primaryColor?: string;
  className?: string;
  children: React.ReactNode;
}

export const BatikFrameWrapper: React.FC<BatikFrameWrapperProps> = ({
  shapeId = 'royal_arch',
  primaryColor = '#c4a661',
  className = '',
  children,
}) => {
  // If standard arch/border, render normal wrapper
  if (shapeId === 'batik_parang_arch') {
    return (
      <div className={`relative p-2.5 ${className}`}>
        {/* SVG Decorative Batik Parang Outer Mask */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Royal Arch Outline */}
          <path
            d="M 10 390 L 10 150 C 10 60, 290 60, 290 150 L 290 390 Z"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeOpacity="0.8"
          />
          {/* Inner Border */}
          <path
            d="M 16 384 L 16 150 C 16 70, 284 70, 284 150 L 284 384 Z"
            stroke={primaryColor}
            strokeWidth="1"
            strokeDasharray="4 3"
            strokeOpacity="0.6"
          />
          {/* Top Arch Crown Monogram Motif */}
          <circle cx="150" cy="50" r="14" fill="#111115" stroke={primaryColor} strokeWidth="1.5" />
          <path d="M 144 50 L 150 42 L 156 50 L 150 58 Z" fill={primaryColor} />
          {/* Corner Parang Accents */}
          <path d="M 20 380 L 35 365 M 25 380 L 40 365 M 30 380 L 45 365" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 280 380 L 265 365 M 275 380 L 260 365 M 270 380 L 255 365" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>

        {/* Inner Content with Arch Clipping */}
        <div className="relative z-10 w-full h-full rounded-t-[140px] rounded-b-2xl overflow-hidden shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    );
  }

  if (shapeId === 'batik_kawung_border') {
    return (
      <div className={`relative p-3 ${className}`}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="8" width="284" height="384" rx="16" stroke={primaryColor} strokeWidth="2" strokeOpacity="0.8" />
          <rect x="14" y="14" width="272" height="372" rx="12" stroke={primaryColor} strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.5" />
          {/* 4 Corners Kawung 4-leaf circles */}
          <g fill="none" stroke={primaryColor} strokeWidth="1.2" opacity="0.85">
            {/* Top-Left */}
            <circle cx="28" cy="28" r="8" fill="#111115" />
            <ellipse cx="28" cy="23" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="28" cy="33" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="23" cy="28" rx="5" ry="3" fill={primaryColor} />
            <ellipse cx="33" cy="28" rx="5" ry="3" fill={primaryColor} />

            {/* Top-Right */}
            <circle cx="272" cy="28" r="8" fill="#111115" />
            <ellipse cx="272" cy="23" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="272" cy="33" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="267" cy="28" rx="5" ry="3" fill={primaryColor} />
            <ellipse cx="277" cy="28" rx="5" ry="3" fill={primaryColor} />

            {/* Bottom-Left */}
            <circle cx="28" cy="372" r="8" fill="#111115" />
            <ellipse cx="28" cy="367" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="28" cy="377" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="23" cy="372" rx="5" ry="3" fill={primaryColor} />
            <ellipse cx="33" cy="372" rx="5" ry="3" fill={primaryColor} />

            {/* Bottom-Right */}
            <circle cx="272" cy="372" r="8" fill="#111115" />
            <ellipse cx="272" cy="367" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="272" cy="377" rx="3" ry="5" fill={primaryColor} />
            <ellipse cx="267" cy="372" rx="5" ry="3" fill={primaryColor} />
            <ellipse cx="277" cy="372" rx="5" ry="3" fill={primaryColor} />
          </g>
        </svg>

        <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    );
  }

  if (shapeId === 'batik_megamendung') {
    return (
      <div className={`relative p-2.5 ${className}`}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft arch top */}
          <path
            d="M 12 388 L 12 140 C 12 50, 288 50, 288 140 L 288 388 Z"
            stroke={primaryColor}
            strokeWidth="2"
            strokeOpacity="0.75"
          />
          {/* Top Megamendung Cloud Swirl */}
          <path
            d="M 110 50 Q 130 30, 150 45 Q 170 30, 190 50 Q 150 65, 110 50 Z"
            fill="#111115"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          <circle cx="150" cy="46" r="3" fill={primaryColor} />
        </svg>

        <div className="relative z-10 w-full h-full rounded-t-[130px] rounded-b-2xl overflow-hidden shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    );
  }

  if (shapeId === 'batik_truntum_corner') {
    return (
      <div className={`relative p-2.5 ${className}`}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="10" y="10" width="280" height="380" rx="20" stroke={primaryColor} strokeWidth="1.8" strokeOpacity="0.8" />
          {/* 4 Truntum Jasmine Star Flowers in corners */}
          {[[30, 30], [270, 30], [30, 370], [270, 370]].map(([cx, cy], idx) => (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              <circle r="6" fill="#111115" stroke={primaryColor} strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, aidx) => (
                <line
                  key={aidx}
                  x1="0"
                  y1="0"
                  x2={Math.cos((angle * Math.PI) / 180) * 8}
                  y2={Math.sin((angle * Math.PI) / 180) * 8}
                  stroke={primaryColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              ))}
              <circle r="2" fill={primaryColor} />
            </g>
          ))}
        </svg>

        <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    );
  }

  // Fallback to basic styled wrapper
  return <div className={`relative ${className}`}>{children}</div>;
};
