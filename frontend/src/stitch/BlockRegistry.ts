import { StitchBlockManifest, StitchBlockInstance } from '../contracts/stitch.contract';

export const STITCH_BLOCK_MANIFESTS: StitchBlockManifest[] = [
  {
    id: 'hero-envelope',
    category: 'HERO',
    name: '3D Luxury Envelope Opening Hero',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'profile-honoree',
    category: 'PROFILE',
    name: 'Honoree / Couple Visual Profile Card',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'countdown-schedule',
    category: 'TIMELINE',
    name: 'Live Countdown Timer & Event Schedule',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'story-love',
    category: 'STORY',
    name: 'Love Story & Milestones Journey',
    supportedEvents: ['wedding'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'gallery-media',
    category: 'GALLERY',
    name: 'Photo Gallery Grid & YouTube Streaming',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'bank-gift',
    category: 'BANK',
    name: 'Digital Gift Bank Accounts & QRIS',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'rsvp-guestbook',
    category: 'RSVP',
    name: 'Live RSVP Form & Guestbook Wishes Feed',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  },
  {
    id: 'closing-prayer',
    category: 'CLOSING',
    name: 'Closing Ayat / Romantic Quotes & Salam',
    supportedEvents: ['wedding', 'khitanan', 'aqiqah', 'birthday'],
    defaultTokens: { '--accent': '#D4AF37' }
  }
];

export const DEFAULT_STITCH_INSTANCES: StitchBlockInstance[] = [
  { id: 'inst-1', blockId: 'hero-envelope', name: 'Opening Hero & Envelope', category: 'HERO', isEnabled: true, order: 1 },
  { id: 'inst-2', blockId: 'profile-honoree', name: 'Profil Mempelai / Anak', category: 'PROFILE', isEnabled: true, order: 2 },
  { id: 'inst-3', blockId: 'countdown-schedule', name: 'Hitung Mundur & Jadwal Acara', category: 'TIMELINE', isEnabled: true, order: 3 },
  { id: 'inst-4', blockId: 'story-love', name: 'Cerita Cinta / Love Journey', category: 'STORY', isEnabled: true, order: 4 },
  { id: 'inst-5', blockId: 'gallery-media', name: 'Galeri Foto & Video Teaser', category: 'GALLERY', isEnabled: true, order: 5 },
  { id: 'inst-6', blockId: 'bank-gift', name: 'Amplop Digital & Rekening Bank', category: 'BANK', isEnabled: true, order: 6 },
  { id: 'inst-7', blockId: 'rsvp-guestbook', name: 'Konfirmasi RSVP & Buku Tamu', category: 'RSVP', isEnabled: true, order: 7 },
  { id: 'inst-8', blockId: 'closing-prayer', name: 'Doa Restu & Salam Penutup', category: 'CLOSING', isEnabled: true, order: 8 },
];
