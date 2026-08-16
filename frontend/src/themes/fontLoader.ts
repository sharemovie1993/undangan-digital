// Dynamic On-Demand Google Font Loader
const loadedFonts = new Set<string>();

const FONT_MAP: Record<string, string> = {
  Cinzel: 'Cinzel:wght@400;600;700;900',
  'Playfair Display': 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600',
  'Great Vibes': 'Great+Vibes',
  Amiri: 'Amiri:ital,wght@0,400;0,700;1,400',
  Montserrat: 'Montserrat:wght@300;400;500;600;700;800',
  Poppins: 'Poppins:wght@300;400;500;600;700;800',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800',
};

export function loadGoogleFont(fontFamilyName: string) {
  if (typeof document === 'undefined') return;

  const cleanName = fontFamilyName.replace(/['"]/g, '').trim();
  const fontKey = Object.keys(FONT_MAP).find(
    (k) => cleanName.toLowerCase().includes(k.toLowerCase())
  );

  if (!fontKey || loadedFonts.has(fontKey)) return;

  const fontParam = FONT_MAP[fontKey];
  const linkId = `google-font-${fontKey.replace(/\s+/g, '-').toLowerCase()}`;

  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontKey);
  }
}
