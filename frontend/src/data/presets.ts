import { InvitationData, GuestRecipient, WishMessage } from '../types';
import { UNIFIED_THEMES, UNIFIED_STYLE_KITS } from '../themes/registry';

// Re-export unified theme & style kit catalogs
export const THEMES = UNIFIED_THEMES;
export const MASTER_STYLE_KITS = UNIFIED_STYLE_KITS;

export const FONT_PRESETS = {
  royal_serif: {
    id: 'royal_serif' as const,
    name: 'Royal Luxury Serif',
    headingFamily: "'Cinzel', serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: 'Romeo & Juliet',
    description: 'Megah & Berwibawa (Cinzel + Jakarta Sans)'
  },
  romantic_calligraphy: {
    id: 'romantic_calligraphy' as const,
    name: 'Romantic Calligraphy',
    headingFamily: "'Great Vibes', 'Playfair Display', cursive",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: 'Romeo & Juliet',
    description: 'Puitis & Luwes (Great Vibes + Playfair)'
  },
  islamic_arabic: {
    id: 'islamic_arabic' as const,
    name: 'Islamic Arabic Elegance',
    headingFamily: "'Amiri', serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: 'Rayyan Al-Farizi',
    description: 'Anggun Islami (Amiri + Jakarta Sans)'
  },
  nusantara_heritage: {
    id: 'nusantara_heritage' as const,
    name: 'Nusantara Keraton Serif',
    headingFamily: "'Playfair Display', serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: 'Raden & Ayu',
    description: 'Klasik Nusantara (Playfair + Jakarta Sans)'
  },
  modern_clean: {
    id: 'modern_clean' as const,
    name: 'Modern Clean Minimalist',
    headingFamily: "'Montserrat', sans-serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: 'Valerie & Kevin',
    description: 'Rapi & Kontemporer (Montserrat + Sans)'
  },
  playful_party: {
    id: 'playful_party' as const,
    name: 'Playful Party Display',
    headingFamily: "'Poppins', sans-serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    previewText: "Valerie's Party",
    description: 'Ceria & Bersahabat (Poppins + Nunito)'
  }
};

export const FRAME_SHAPES = {
  royal_arch: {
    id: 'royal_arch' as const,
    name: 'Royal Arch',
    className: 'arch-frame',
    badge: 'Lengkungan Atas'
  },
  islamic_dome: {
    id: 'islamic_dome' as const,
    name: 'Islamic Dome',
    className: 'rounded-t-[100px] rounded-b-2xl',
    badge: 'Kubah Masjid'
  },
  jawa_joglo: {
    id: 'jawa_joglo' as const,
    name: 'Jawa Gunungan',
    className: 'rounded-t-[70px] rounded-b-xl border-2',
    badge: 'Joglo Keraton'
  },
  sunda_parahyangan: {
    id: 'sunda_parahyangan' as const,
    name: 'Sunda Megamendung',
    className: 'rounded-t-3xl rounded-b-3xl border-2',
    badge: 'Liku Awan'
  },
  minang_suntiang: {
    id: 'minang_suntiang' as const,
    name: 'Minang Gonjong',
    className: 'rounded-t-2xl rounded-b-2xl border-4',
    badge: 'Gonjong Emas'
  },
  bali_aesthetic: {
    id: 'bali_aesthetic' as const,
    name: 'Bali Candi Bentar',
    className: 'rounded-2xl border-2',
    badge: 'Candi Frangipani'
  },
  soft_oval: {
    id: 'soft_oval' as const,
    name: 'Soft Oval',
    className: 'rounded-full',
    badge: 'Lingkaran Elips'
  },
  double_border: {
    id: 'double_border' as const,
    name: 'Double Gold Box',
    className: 'rounded-2xl border-4',
    badge: 'Kotak Garis Ganda'
  }
};

export const DEFAULT_WEDDING_DATA: InvitationData = {
  id: 'wedding-romeo-juliet',
  eventType: 'wedding',
  theme: 'champagne_gold',
  eventTitle: 'Romeo & Juliet',
  eventDate: '2026-10-24T09:00:00',
  tagline: 'THE WEDDING OF',
  openingQuoteArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  openingQuoteText: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
  openingQuoteSource: 'QS. Ar-Rum: 21',
  profiles: [
    {
      name: 'Romeo',
      fullName: 'Romeo Montague, S.T.',
      role: 'Mempelai Pria',
      fatherName: 'Bpk. Montague',
      motherName: 'Ibu Montague',
      instagram: 'romeo.montague',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      bio: 'Putra pertama dari pasangan Bpk. Montague & Ibu Montague.',
    },
    {
      name: 'Juliet',
      fullName: 'Juliet Capulet, S.Ds.',
      role: 'Mempelai Wanita',
      fatherName: 'Bpk. Capulet',
      motherName: 'Ibu Capulet',
      instagram: 'juliet.capulet',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      bio: 'Putri kedua dari pasangan Bpk. Capulet & Ibu Capulet.',
    },
  ],
  sessions: [
    {
      id: 'session-1',
      title: 'Akad Nikah',
      date: 'Sabtu, 24 Oktober 2026',
      startTime: '08:00',
      endTime: '10:00',
      timeZone: 'WIB',
      venueName: 'The Grand Ballroom - Ritz-Carlton Jakarta',
      venueAddress: 'Jl. DR. Ide Anak Agung Gde Agung Kav. E.1.1 No. 1, Mega Kuningan, Jakarta Selatan',
      mapsUrl: 'https://maps.google.com/?q=The+Ritz-Carlton+Jakarta+Mega+Kuningan',
      notes: 'Khusus untuk keluarga inti & kerabat dekat. Mohon hadir 15 menit sebelum acara dimulai.',
    },
    {
      id: 'session-2',
      title: 'Resepsi Pernikahan',
      date: 'Sabtu, 24 Oktober 2026',
      startTime: '19:00',
      endTime: '22:00',
      timeZone: 'WIB',
      venueName: 'The Grand Ballroom - Ritz-Carlton Jakarta',
      venueAddress: 'Jl. DR. Ide Anak Agung Gde Agung Kav. E.1.1 No. 1, Mega Kuningan, Jakarta Selatan',
      mapsUrl: 'https://maps.google.com/?q=The+Ritz-Carlton+Jakarta+Mega+Kuningan',
      notes: 'Sesi ramah tamah, makan malam, dan hiburan musik.',
    },
  ],
  gallery: [
    {
      id: 'g1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
      caption: 'Two souls, one heart walking through the historic abbey archway.',
    },
    {
      id: 'g2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&auto=format&fit=crop&q=80',
      caption: 'The golden ring as an eternal circle of promise.',
    },
    {
      id: 'g3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80',
      caption: 'Laughter and warmth under the morning Mediterranean sun.',
    },
    {
      id: 'g4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&auto=format&fit=crop&q=80',
      caption: 'Silhouette of love by the cathedral window.',
    },
    {
      id: 'g5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1000&auto=format&fit=crop&q=80',
      caption: 'Pre-wedding memories in Lake Como.',
    },
    {
      id: 'g6',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1000&auto=format&fit=crop&q=80',
      caption: 'A gentle embrace as the sun sets over the hills.',
    },
  ],
  videoTeaserUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  loveStory: [
    {
      id: 'ls1',
      year: '2020',
      title: 'Pertama Kali Bertemu',
      story: 'Takdir mempertemukan kami di sebuah perpustakaan seni di Bandung saat mengerjakan proyek desain bersama.',
    },
    {
      id: 'ls2',
      year: '2023',
      title: 'Komitmen Menuju Masa Depan',
      story: 'Di bawah indahnya matahari terbenam Danau Como, Romeo mengutarakan niat tulus untuk melangkah ke jenjang pernikahan.',
    },
    {
      id: 'ls3',
      year: '2026',
      title: 'Menuju Ikatan Suci',
      story: 'Dengan restu kedua orang tua dan keluarga besar, kami memohon doa restu untuk mengarungi bahtera rumah tangga.',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-bca',
      bankName: 'BCA',
      accountNumber: '1234 5678 9012',
      accountHolder: 'ROMEO MONTAGUE',
      badgeColor: '#003688',
    },
    {
      id: 'bank-mandiri',
      bankName: 'MANDIRI',
      accountNumber: '9876 5432 1098',
      accountHolder: 'JULIET CAPULET',
      badgeColor: '#003366',
    },
    {
      id: 'bank-qris',
      bankName: 'QRIS',
      accountNumber: 'NMID: ID102003892019',
      accountHolder: 'ROMEO & JULIET WEDDING',
      qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570011ID.CO.QRIS520454115802ID5920ROMEO+JULIET+WEDDING6007JAKARTA530336054000',
    },
  ],
  physicalGift: {
    recipientName: 'Romeo & Juliet (Keluarga Montague)',
    phoneNumber: '+62 812-3456-7890',
    fullAddress: 'Jl. Kemang Raya No. 45, RT 04 / RW 02, Bangka, Mampang Prapatan',
    city: 'Jakarta Selatan, DKI Jakarta',
    postalCode: '12730',
  },
  defaultMusicTrack: 'canon-in-d',
  musicTitle: 'Canon in D Major (Romantic Harp & Strings)',
  musicArtist: 'Johann Pachelbel (Acoustic Arr.)',
  protocolHealthNotice: true,
  enabledBlocks: {
    hero: true,
    quote: true,
    profile: true,
    countdown: true,
    schedule: true,
    story: true,
    gallery: true,
    gift: true,
    rsvp: true,
    wishes: true,
    closing: true,
  },
};

export const DEFAULT_KHITANAN_DATA: InvitationData = {
  id: 'khitanan-rayyan',
  eventType: 'khitanan',
  theme: 'emerald_sage',
  eventTitle: 'Walimatul Khitan Rayyan',
  eventDate: '2026-11-15T09:00:00',
  tagline: 'TASYAKURAN WALIMATUL KHITAN',
  openingQuoteArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  openingQuoteText: 'Semoga ananda menjadi anak yang sholeh, berbakti kepada kedua orang tua, berguna bagi agama, nusa, dan bangsa.',
  openingQuoteSource: 'Doa Khitan',
  profiles: [
    {
      name: 'Muhammad Rayyan',
      fullName: 'Muhammad Rayyan Al-Farizi',
      role: 'Anak yang Dikhitan',
      fatherName: 'Bpk. Ahmad Fauzi, M.T.',
      motherName: 'Ibu Siti Nurhaliza, S.Pd.',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      bio: 'Putra pertama dari Bpk. Ahmad Fauzi & Ibu Siti Nurhaliza.',
    },
  ],
  sessions: [
    {
      id: 'session-khitan',
      title: 'Tasyakuran & Walimah Khitan',
      date: 'Minggu, 15 November 2026',
      startTime: '09:00',
      endTime: '14:00',
      timeZone: 'WIB',
      venueName: 'Gedung Serbaguna Al-Azhar',
      venueAddress: 'Jl. Sisingamangaraja No. 1, Kebayoran Baru, Jakarta Selatan',
      mapsUrl: 'https://maps.google.com/?q=Al+Azhar+Kebayoran+Baru',
      notes: 'Acara ramah tamah, doa bersama, dan santunan anak yatim.',
    },
  ],
  gallery: [
    {
      id: 'k1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
      caption: 'Senyum ceria ananda Rayyan.',
    },
    {
      id: 'k2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&auto=format&fit=crop&q=80',
      caption: 'Kebersamaan hangat bersama keluarga tercinta.',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-bsi',
      bankName: 'BSI (Bank Syariah Indonesia)',
      accountNumber: '7123 4567 89',
      accountHolder: 'AHMAD FAUZI (AN. RAYYAN)',
      badgeColor: '#00A39D',
    },
  ],
  physicalGift: {
    recipientName: 'Rayyan Al-Farizi (Kel. Ahmad Fauzi)',
    phoneNumber: '+62 813-8899-7766',
    fullAddress: 'Jl. Senopati No. 12, Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12190',
  },
  defaultMusicTrack: 'canon-in-d',
  musicTitle: 'Shalawat & Instrumental Barakah',
  musicArtist: 'Oud & Acoustic Strings',
  protocolHealthNotice: true,
  enabledBlocks: {
    hero: true,
    quote: true,
    profile: true,
    countdown: true,
    schedule: true,
    story: false,
    gallery: true,
    gift: true,
    rsvp: true,
    wishes: true,
    closing: true,
  },
};

export const DEFAULT_AQIQAH_DATA: InvitationData = {
  id: 'aqiqah-aisyah',
  eventType: 'aqiqah',
  theme: 'champagne_gold',
  eventTitle: 'Tasyakuran Aqiqah Aisyah',
  eventDate: '2026-09-20T10:00:00',
  tagline: 'TASYAKURAN AQIQAH & GUNTING RAMBUT',
  openingQuoteArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  openingQuoteText: 'Setiap anak tergadai dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya dan diberi nama.',
  openingQuoteSource: 'HR. Abu Dawud & At-Tirmidzi',
  profiles: [
    {
      name: 'Aisyah Azzahra',
      fullName: 'Aisyah Azzahra Khairunnisa',
      role: 'Putri Tercinta',
      fatherName: 'Bpk. Rizky Pratama, S.Kom.',
      motherName: 'Ibu Amanda Putri, S.E.',
      photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80',
      bio: 'Lahir pada hari Jumat, 28 Agustus 2026.',
    },
  ],
  sessions: [
    {
      id: 'session-aqiqah',
      title: 'Tasyakuran & Doa Bersama',
      date: 'Minggu, 20 September 2026',
      startTime: '10:00',
      endTime: '13:00',
      timeZone: 'WIB',
      venueName: 'Kediaman Keluarga Rizky Pratama',
      venueAddress: 'Cluster Palm Spring Blok A3 No. 8, BSD City, Tangerang Selatan',
      mapsUrl: 'https://maps.google.com/?q=BSD+City+Tangerang+Selatan',
      notes: 'Pemotongan rambut bayi, pembacaan Maulid Nabi, dan ramah tamah.',
    },
  ],
  gallery: [
    {
      id: 'a1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1000&auto=format&fit=crop&q=80',
      caption: 'Selamat datang ke dunia, putri kecil kami.',
    },
    {
      id: 'a2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1000&auto=format&fit=crop&q=80',
      caption: 'Sentuhan cinta pertama.',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-bca-aqiqah',
      bankName: 'BCA',
      accountNumber: '5420 1122 33',
      accountHolder: 'RIZKY PRATAMA',
      badgeColor: '#003688',
    },
  ],
  defaultMusicTrack: 'canon-in-d',
  musicTitle: 'Lullaby of Blessing (Calm Harp)',
  musicArtist: 'Acoustic Nursery Melodies',
  enabledBlocks: {
    hero: true,
    quote: true,
    profile: true,
    countdown: true,
    schedule: true,
    story: false,
    gallery: true,
    gift: true,
    rsvp: true,
    wishes: true,
    closing: true,
  },
};

export const DEFAULT_BIRTHDAY_DATA: InvitationData = {
  id: 'birthday-valerie',
  eventType: 'birthday',
  theme: 'velvet_navy',
  eventTitle: "Valerie's Sweet 17th",
  eventDate: '2026-12-05T18:30:00',
  tagline: 'SWEET SEVENTEEN CELEBRATION',
  openingQuoteText: 'A night of elegance, sparkling memories, and joyful laughter as I step into seventeen.',
  openingQuoteSource: 'Valerie Anastasya',
  profiles: [
    {
      name: 'Valerie',
      fullName: 'Valerie Anastasya Tanujaya',
      role: 'The Birthday Star',
      fatherName: 'Mr. Hendra Tanujaya',
      motherName: 'Mrs. Cynthia Wijaya',
      instagram: 'valerie.anastasya',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      bio: 'Celebrating 17 years of precious moments and bright dreams.',
    },
  ],
  sessions: [
    {
      id: 'session-sweet17',
      title: 'Sweet 17 Gala Dinner & Party',
      date: 'Sabtu, 5 Desember 2026',
      startTime: '18:30',
      endTime: '22:30',
      timeZone: 'WIB',
      venueName: 'The Glass House - Plataran Dharmawangsa',
      venueAddress: 'Jl. Dharmawangsa Raya No. 6, Kebayoran Baru, Jakarta Selatan',
      mapsUrl: 'https://maps.google.com/?q=Plataran+Dharmawangsa',
      notes: 'Dress code: Black Tie / Navy Glam / Champagne Gold.',
    },
  ],
  gallery: [
    {
      id: 'b1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
      caption: 'Sparkling seventeen.',
    },
    {
      id: 'b2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
      caption: 'Let the magical night begin.',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-jago',
      bankName: 'Bank Jago',
      accountNumber: '1029 3847 5612',
      accountHolder: 'VALERIE ANASTASYA',
      badgeColor: '#FF6600',
    },
  ],
  defaultMusicTrack: 'canon-in-d',
  musicTitle: 'Golden Hour (Lounge Piano Edition)',
  musicArtist: 'JVKE (Orchestral Cover)',
  enabledBlocks: {
    hero: true,
    quote: true,
    profile: true,
    countdown: true,
    schedule: true,
    story: false,
    gallery: true,
    gift: true,
    rsvp: true,
    wishes: true,
    closing: true,
  },
};

export const INITIAL_GUESTS: GuestRecipient[] = [
  { id: 'g-1', name: 'Bapak Joko & Istri', addressOrCity: 'Jakarta', group: 'VVIP', paxQuota: 2, hasOpened: true },
  { id: 'g-2', name: 'Theodore & Partner', addressOrCity: 'Bandung', group: 'Sahabat', paxQuota: 2, hasOpened: true },
  { id: 'g-3', name: 'Eleanor Vance', addressOrCity: 'Surabaya', group: 'Teman Kuliah', paxQuota: 1, hasOpened: true },
  { id: 'g-4', name: 'Keluarga Besar Bpk. Handoko', addressOrCity: 'Semarang', group: 'Keluarga', paxQuota: 4, hasOpened: false },
  { id: 'g-5', name: 'dr. Sarah & Suami', addressOrCity: 'Yogyakarta', group: 'Kolega', paxQuota: 2, hasOpened: false },
  { id: 'g-6', name: 'Bpk. Michael & Rekan', addressOrCity: 'Bali', group: 'VVIP', paxQuota: 2, hasOpened: false },
  { id: 'g-7', name: 'Clara & Keluarga', addressOrCity: 'Medan', group: 'Sahabat', paxQuota: 3, hasOpened: false },
  { id: 'g-8', name: 'Bpk. Ir. Bambang S.', addressOrCity: 'Jakarta', group: 'Kolega', paxQuota: 2, hasOpened: false },
  { id: 'g-9', name: 'Ibu Ratna Dewi', addressOrCity: 'Bogor', group: 'Keluarga', paxQuota: 2, hasOpened: false },
  { id: 'g-10', name: 'Kevin & Jessica', addressOrCity: 'Tangerang', group: 'Sahabat', paxQuota: 2, hasOpened: false },
  { id: 'g-11', name: 'Bpk. Hendra Kurnia', addressOrCity: 'Malang', group: 'VVIP', paxQuota: 2, hasOpened: false },
  { id: 'g-12', name: 'Sdr. Dimas Aditya', addressOrCity: 'Solo', group: 'Teman Kantor', paxQuota: 1, hasOpened: false },
];

export const DEFAULT_GUESTS = INITIAL_GUESTS;

export const INITIAL_WISHES: WishMessage[] = [
  {
    id: 'w-1',
    senderName: 'Theodore',
    relationship: 'Sahabat',
    status: 'hadir',
    pax: 2,
    message: 'Wishing you both a lifetime of happiness, endless love, and joy! Cant wait to celebrate with you guys on this magical day!',
    createdAt: '10 menit yang lalu',
    likes: 5,
  },
  {
    id: 'w-2',
    senderName: 'Eleanor Vance',
    relationship: 'Teman Kuliah',
    status: 'tidak_hadir',
    pax: 0,
    message: 'So sorry I couldn\'t make it, sending all my love and best heartfelt prayers from afar. May your journey be blessed abundantly!',
    createdAt: '1 jam yang lalu',
    likes: 3,
  },
  {
    id: 'w-3',
    senderName: 'Bapak Joko & Istri',
    relationship: 'Keluarga / VVIP',
    status: 'hadir',
    pax: 2,
    message: 'Selamat menempuh hidup baru untuk kedua mempelai. Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah. Aamiin ya Rabbal Alamin.',
    createdAt: '3 jam yang lalu',
    likes: 8,
  },
];

export const DEFAULT_WISHES = INITIAL_WISHES;
