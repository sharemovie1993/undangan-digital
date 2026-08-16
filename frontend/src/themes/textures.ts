import { TexturePatternId } from '../types';

export interface TextureDefinition {
  id: TexturePatternId;
  name: string;
  subtitle: string;
  previewClass: string;
  getStyle: (isDark: boolean) => React.CSSProperties;
}

// Ultra-lightweight inline procedural SVG data-URIs
const NOISE_GRAIN_SVG = `data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.04"/></svg>`;

const LINEN_WEAVE_SVG = `data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="%23ffffff" fill-opacity="0.03" fill-rule="evenodd"><path d="M0 40L40 0H20L0 20M40 40V20L20 40"/></g></svg>`;

const COTTON_PAPER_SVG = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><filter id="c"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/><feDiffuseLighting in="noise" lighting-color="%23fff" surfaceScale="1"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(%23c)" opacity="0.035"/></svg>`;

const MARBLE_VEINS_SVG = `data:image/svg+xml;utf8,<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><filter id="m"><feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="5" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="25" xChannelSelector="R" yChannelSelector="G"/></filter><path d="M0,150 Q75,50 150,150 T300,150" stroke="%23c4a661" stroke-width="1.2" fill="none" opacity="0.08" filter="url(%23m)"/></svg>`;

export const TEXTURE_PRESETS: Record<TexturePatternId, TextureDefinition> = {
  none: {
    id: 'none',
    name: 'Warna Datar (Polos)',
    subtitle: 'Permukaan mulus modern tanpa tekstur',
    previewClass: 'bg-neutral-800',
    getStyle: () => ({ backgroundImage: 'none' }),
  },
  linen: {
    id: 'linen',
    name: 'Tenun Linen (Linen Weave)',
    subtitle: 'Serat tenun kain khas hardcover mewah',
    previewClass: 'bg-neutral-800 border-neutral-600',
    getStyle: (isDark) => ({
      backgroundImage: `url('${LINEN_WEAVE_SVG}')`,
      backgroundRepeat: 'repeat',
      backgroundSize: '24px 24px',
    }),
  },
  cotton: {
    id: 'cotton',
    name: 'Kertas Katun (Handmade Paper)',
    subtitle: 'Pori-pori kertas serat kapas rustic premium',
    previewClass: 'bg-amber-950/40 border-amber-800/40',
    getStyle: (isDark) => ({
      backgroundImage: `url('${COTTON_PAPER_SVG}')`,
      backgroundRepeat: 'repeat',
      backgroundSize: '150px 150px',
    }),
  },
  marble: {
    id: 'marble',
    name: 'Urat Marmer (Marble & Onyx)',
    subtitle: 'Guratan batu marmer elegan aksen emas',
    previewClass: 'bg-gradient-to-br from-neutral-800 to-neutral-900',
    getStyle: (isDark) => ({
      backgroundImage: `url('${MARBLE_VEINS_SVG}')`,
      backgroundRepeat: 'repeat',
      backgroundSize: '280px 280px',
    }),
  },
  grain: {
    id: 'grain',
    name: 'Film Grain (Sinematik 3%)',
    subtitle: 'Tekstur grain halus mengikis kesan flat digital',
    previewClass: 'bg-neutral-900 border-neutral-700',
    getStyle: (isDark) => ({
      backgroundImage: `url('${NOISE_GRAIN_SVG}')`,
      backgroundRepeat: 'repeat',
      backgroundSize: '120px 120px',
    }),
  },
};
