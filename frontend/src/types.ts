export type EventType = 'wedding' | 'khitanan' | 'aqiqah' | 'birthday';

export type ThemeToken =
  | 'champagne_gold'
  | 'emerald_sage'
  | 'velvet_navy'
  | 'rose_gold'
  | 'midnight_obsidian'
  | 'crimson_ruby'
  | 'ivory_gold'
  | 'soft_blush_floral'
  | 'botanical_sage'
  | 'terracotta_cream'
  | 'celestial_blue'
  | 'javanese_heritage'
  | 'jawa_joglo'
  | 'sunda_parahyangan'
  | 'minang_suntiang'
  | 'bali_aesthetic';

export type ArchetypeStyle =
  | 'royal_arch'
  | 'islamic_dome'
  | 'modern_glass'
  | 'organic_wave'
  | 'jawa_joglo'
  | 'sunda_parahyangan'
  | 'minang_suntiang'
  | 'bali_aesthetic';

export type FontPairingId =
  | 'royal_serif'
  | 'romantic_calligraphy'
  | 'islamic_arabic'
  | 'modern_clean'
  | 'playful_party'
  | 'nusantara_heritage';

export type FrameShapeId =
  | 'royal_arch'
  | 'islamic_dome'
  | 'soft_oval'
  | 'double_border'
  | 'jawa_joglo'
  | 'sunda_parahyangan'
  | 'minang_suntiang'
  | 'bali_aesthetic'
  | 'batik_parang_arch'
  | 'batik_kawung_border'
  | 'batik_megamendung'
  | 'batik_truntum_corner';

export type TexturePatternId = 'none' | 'linen' | 'cotton' | 'marble' | 'grain';
export type ParticleEffectId = 'none' | 'gold_dust' | 'jasmine_petals' | 'rose_petals' | 'bokeh_glow';
export type WaxSealColorId = 'maroon' | 'gold' | 'sage' | 'navy' | 'rose';
export type CornerOrnamentId = 'none' | 'royal_crown' | 'batik_prada' | 'art_deco' | 'javanese_flourish';
export type SectionDividerId = 'none' | 'gold_line' | 'batik_parang' | 'olive_branch' | 'flourish';

export interface MasterStyleKit {
  id: string;
  name: string;
  category: 'royal' | 'islamic' | 'romantic' | 'modern' | 'festive' | 'traditional';
  tagline: string;
  themeId: ThemeToken;
  fontPairingId: FontPairingId;
  frameShape: FrameShapeId;
  previewGradient: string;
  primaryColor: string;
  description: string;
  badge: string;
}

export interface CustomThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  bgColor?: string;
  cardBgColor?: string;
  fontFamily?: string;
  fontPairingId?: FontPairingId;
  frameShape?: FrameShapeId;
  archetypeStyle?: ArchetypeStyle;
  textureId?: TexturePatternId;
  particleEffect?: ParticleEffectId;
  waxSealColor?: WaxSealColorId;
  cornerOrnament?: CornerOrnamentId;
  sectionDivider?: SectionDividerId;
}

export interface ProfilePerson {
  name: string;
  fullName: string;
  title?: string;
  role: string; // e.g. "Mempelai Pria", "Mempelai Wanita", "Anak Tercinta", "Birthday Star"
  fatherName: string;
  motherName: string;
  instagram?: string;
  photoUrl: string;
  bio?: string;
}

export interface EventSession {
  id: string;
  title: string; // e.g. "Akad Nikah", "Resepsi", "Tasyakuran", "Party Celebration"
  date: string; // ISO date or formatted
  startTime: string;
  endTime: string;
  timeZone: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  bankName: string; // "BCA", "Mandiri", "BRI", "BNI", "Bank Jago", "QRIS"
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl?: string;
  badgeColor?: string;
}

export interface PhysicalGiftAddress {
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

export interface WishMessage {
  id: string;
  senderName: string;
  relationship?: string; // "Teman Kantor", "Keluarga", "Sahabat"
  status: 'hadir' | 'tidak_hadir' | 'ragu';
  pax: number;
  message: string;
  createdAt: string;
  likes: number;
}

export interface GuestRecipient {
  id: string;
  name: string;
  addressOrCity: string;
  group?: string; // "Keluarga", "VVIP", "Teman Kuliah", "Rekan Kerja"
  paxQuota?: number;
  hasOpened?: boolean;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
}

export interface LoveStoryTimeline {
  id: string;
  year: string;
  title: string;
  story: string;
}

export interface InvitationData {
  id: string;
  slug?: string;
  eventType: EventType;
  theme: ThemeToken;
  themeConfig?: CustomThemeConfig;
  eventTitle: string; // e.g. "The Wedding of Romeo & Juliet"
  eventDate: string; // Countdown target e.g. "2026-10-24T09:00:00"
  tagline: string; // e.g. "Save the Date"
  openingQuoteArabic?: string;
  openingQuoteText: string;
  openingQuoteSource: string;
  profiles: ProfilePerson[];
  sessions: EventSession[];
  events?: any[]; // for backwards compatibility
  gallery: GalleryItem[];
  videoTeaserUrl?: string;
  youtubeVideoId?: string;
  loveStory?: LoveStoryTimeline[];
  bankAccounts: BankAccount[];
  physicalGift?: PhysicalGiftAddress;
  defaultMusicTrack: string;
  musicTitle: string;
  musicArtist: string;
  customMusicUrl?: string;
  protocolHealthNotice?: boolean;
  enabledBlocks: {
    hero: boolean;
    quote: boolean;
    profile: boolean;
    countdown: boolean;
    schedule: boolean;
    story: boolean;
    gallery: boolean;
    gift: boolean;
    rsvp: boolean;
    wishes: boolean;
    closing: boolean;
  };
  isWatermarked?: boolean;
  licenseKey?: string;
  planId?: string;
  planName?: string;
  licenseStatus?: 'active' | 'unpaid' | 'expired' | 'trial';
}
