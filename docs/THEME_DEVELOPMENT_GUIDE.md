# 🎨 Panduan Developer: Cara Membuat & Menambahkan Tema Baru (LuxeInvite Studio)

Panduan ini ditujukan bagi developer dan desainer untuk menambahkan tema undangan baru ke dalam **Modular Theme Engine**. Dengan arsitektur berbasis token dan registry terpusat, penambahan tema baru **tidak memerlukan perubahan pada komponen halaman undangan**.

---

## 📁 Struktur Folder Tema

Seluruh konfigurasi tema berlokasi di folder `frontend/src/themes/`:

```
frontend/src/themes/
├── types.ts              # Definisi interface ThemeDefinition & MasterStyleKitDefinition
├── registry.ts           # Registry terpusat, search engine, dan filter
├── fontLoader.ts         # Preloader Google Fonts on-demand
└── catalog/              # Modul katalog berdasarkan kategori
    ├── traditional.ts    # Tema Adat Nusantara (Jawa, Sunda, Minang, Bali, dll.)
    ├── royal.ts          # Tema Royal Palace & Classic Gold
    ├── islamic.ts        # Tema Islami & Syar'i
    ├── romantic.ts       # Tema Romantis & Floral
    ├── modern.ts         # Tema Modern & Minimalis
    └── festive.ts        # Tema Pesta, Ulang Tahun & Ceria
```

---

## 🛠️ Langkah-Langkah Menambahkan Tema Baru (Hanya 3 Langkah!)

### Langkah 1: Tentukan Kategori & Buka File Katalog yang Sesuai
Pilih file di dalam `frontend/src/themes/catalog/`:
- Ingin membuat tema adat daerah baru (misal: *Batak Toba*, *Bugis Makassar*, *Palembang*)? Buka `traditional.ts`.
- Ingin membuat tema pastel baru (misal: *Lavender Lilac*, *Peach Blossom*)? Buka `romantic.ts`.
- Ingin membuat kategori baru? Anda bisa membuat file `.ts` baru di dalam folder `catalog/`.

---

### Langkah 2: Daftarkan Objek Definisi Tema (`ThemeDefinition`)

Tambahkan objek tema baru ke dalam konstanta export katalog:

```typescript
// Contoh: Menambahkan tema "Batak Mandailing" di traditional.ts
export const TRADITIONAL_THEMES: Record<string, ThemeDefinition> = {
  // ... tema lain ...

  batak_mandailing: {
    id: 'batak_mandailing',
    name: 'Batak Mandailing (Ulos & Gorga)',
    subtitle: 'Keagungan Kain Ulos Sadum & Ukiran Gorga Tradisional',
    category: 'traditional',
    mode: 'dark', // 'dark' atau 'light'
    archetype: 'batak_mandailing', // ID ornamen di OrnamentEngine
    primary: '#c2410c',   // Warna aksen utama (e.g. Oranye Ulos/Tembaga)
    secondary: '#ea580c', // Warna aksen sekunder
    bg: '#0c0806',        // Warna latar belakang utama
    cardBg: '#18100c',    // Warna kartu & section
    textMain: '#fdeee9',  // Warna teks utama (kontras tinggi)
    textMuted: '#bda69e', // Warna teks sekunder/deskripsi
    border: '#361d15',    // Warna garis pembatas
    accentBg: '#24140e',  // Warna hover/input background
    goldFoil: 'linear-gradient(135deg, #ea580c 0%, #fed7aa 30%, #c2410c 70%, #7c2d12 100%)',
    button: 'bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#9a3412] hover:opacity-95 text-white font-bold shadow-lg shadow-black/50',
    secondaryButton: 'border-[#c2410c]/40 text-orange-400 hover:bg-[#24140e]',
    headerBg: 'bg-[#0c0806] text-orange-100',
    previewGradient: 'from-[#ea580c] via-[#c2410c] to-[#18100c]',
    tags: ['batak', 'mandailing', 'ulos', 'gorga', 'sumatera', 'adat', 'gelap'],
    palette: {
      primary: '#c2410c',
      secondary: '#ea580c',
      bg: '#0c0806',
      cardBg: '#18100c',
      textMain: '#fdeee9',
      textMuted: '#bda69e',
      border: '#361d15',
      accentBg: '#24140e',
      previewGradient: 'from-[#ea580c] via-[#c2410c] to-[#18100c]',
    },
  },
};
```

---

### Langkah 3: (Opsional) Daftarkan 1-Click Master Style Kit

Agar tema baru muncul di tombol switcher cepat (`◀` / `▶`) dan Galeri Visual Style Kit, tambahkan definisinya di bagian Style Kits file tersebut:

```typescript
export const TRADITIONAL_STYLE_KITS: Record<string, MasterStyleKitDefinition> = {
  // ... kit lain ...

  batak_mandailing_ulos: {
    id: 'batak_mandailing_ulos',
    name: 'Batak Mandailing Ulos Gorga',
    category: 'traditional',
    tagline: 'Filosofi Luhur Ulos & Ornamen Gorga',
    themeId: 'batak_mandailing',             // Merujuk ke id tema di Langkah 2
    fontPairingId: 'nusantara_heritage',     // 'royal_serif' | 'romantic_calligraphy' | 'islamic_arabic' | 'modern_clean'
    frameShape: 'jawa_joglo',               // Bentuk frame
    previewGradient: 'from-orange-700 via-red-600 to-amber-950',
    primaryColor: '#ea580c',
    description: 'Mahakarya budaya Batak dengan sentuhan kain Ulos tenun dan ornamen ukiran Gorga sakral.',
    badge: '🏛️ Batak Klasik',
    tags: ['batak', 'mandailing', 'ulos', 'gorga'],
  },
};
```

---

## 🏛️ Menambahkan Ornamen SVG Khusus (Jika Tema Adat/Budaya Baru)

Jika tema Anda memiliki ornamen khas (seperti ukiran Gorga, Songket, dll.):

1. Buka `frontend/src/components/themes/OrnamentEngine.tsx`.
2. Buat komponen SVG baru:
   ```tsx
   export const BatakGorgaOrnament: React.FC<{ color?: string; className?: string }> = ({
     color = '#ea580c',
     className = 'w-24 h-24',
   }) => (
     <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
       {/* Path SVG Ornamen Khas */}
       <path d="..." stroke={color} strokeWidth="1.5" />
     </svg>
   );
   ```
3. Tambahkan ke switch case di dalam `OrnamentEngine`:
   ```tsx
   case 'batak_mandailing':
     return <BatakGorgaOrnament color={activeColor} className={className} />;
   ```

---

## 🔤 Menambahkan Google Font Baru

Jika tema membutuhkan font Google yang belum ada di sistem:

1. Buka `frontend/src/themes/fontLoader.ts`.
2. Tambahkan font ke `FONT_MAP`:
   ```typescript
   const FONT_MAP: Record<string, string> = {
     // ...
     'Marcellus': 'Marcellus',
     'Alex Brush': 'Alex+Brush',
   };
   ```
Sistem akan **secara otomatis mengunduh font tersebut secara on-demand** saat pengguna memilih tema tersebut!

---

## 🧪 Verifikasi & Uji Coba

Setelah menambahkan tema:
1. Jalankan build di lokal:
   ```bash
   cd frontend
   npm run build
   ```
2. Buka Studio Editor:
   - Ketik nama tema di kotak **Search Bar Sidebar**.
   - Klik tema atau buka **Galeri Style Kit** untuk melihat preview dan menerapkan tema baru.
   - Periksa bahwa teks, kartu, dan ornamen tampil kontras dan responsif di mode Cerah maupun Gelap.

---

## ⚡ Panduan Warna Kontras (Accessibility & Contrast Rules)

| Mode Tema | `bg` (Background) | `cardBg` (Card) | `textMain` (Teks Utama) | `textMuted` (Subteks) |
| :--- | :--- | :--- | :--- | :--- |
| **Dark Mode** | Sangat gelap (`#050505` - `#101015`) | Gelap pekat (`#0d0d12` - `#181820`) | Putih/Krem terang (`#f3f4f6` - `#fdfbf7`) | Abu-abu lembut (`#94949e` - `#b0b0ba`) |
| **Light Mode** | Sangat terang (`#faf8f5` - `#fcf8f9`) | Putih bersih (`#ffffff`) | Gelap pekat (`#1c1c22` - `#281a0b`) | Abu-abu gelap (`#586b7c` - `#6b583e`) |
