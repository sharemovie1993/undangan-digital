export type EventType = 'wedding' | 'khitanan' | 'aqiqah' | 'birthday';

export type ThemeToken = 'champagne_gold' | 'emerald_sage' | 'velvet_navy';

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
  eventType: EventType;
  theme: ThemeToken;
  eventTitle: string; // e.g. "The Wedding of Romeo & Juliet"
  eventDate: string; // Countdown target e.g. "2026-10-24T09:00:00"
  tagline: string; // e.g. "Save the Date"
  openingQuoteArabic?: string;
  openingQuoteText: string;
  openingQuoteSource: string;
  profiles: ProfilePerson[];
  sessions: EventSession[];
  gallery: GalleryItem[];
  videoTeaserUrl?: string;
  loveStory?: LoveStoryTimeline[];
  bankAccounts: BankAccount[];
  physicalGift?: PhysicalGiftAddress;
  defaultMusicTrack: string;
  musicTitle: string;
  musicArtist: string;
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
}
