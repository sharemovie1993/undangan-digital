# Platform Webapp Undangan Digital Multi-Event & Print-Ready Studio

Aplikasi Webapp Undangan Digital modern dengan arsitektur **Multi-Event (Wedding, Khitanan, Aqiqah, Birthday)**, **Multi-Template Builder**, **Print-Ready Kit Engine (300 DPI A5/4R & Label Tom & Jerry 103)**, dan **Terintegrasi Terpusat dengan Server Lisensi Absenta**.

---

## Fitur Utama

1. **Multi-Event & Multi-Template**:
   - Mendukung Wedding, Khitanan, Aqiqah, dan Birthday.
   - Pilihan token tema luxury: *Champagne Gold*, *Emerald Sage*, dan *Midnight Velvet Navy*.
2. **Live Split-View Studio Editor**:
   - Manajemen blok, live preview 430px smartphone canvas, custom data acara, galeri, musik piringan vinyl, dan buku tamu.
3. **Print-Ready Kit Engine**:
   - Generator PDF Kartu Undangan Fisik Resolusi Tinggi 300 DPI (A5 dan 4R).
   - Generator PDF Stiker Label Tamu Standar Indonesia (Tom & Jerry 103 - 12 label per lembar).
4. **Terintegrasi Server Lisensi (`Project-Server-Lisensi`)**:
   - Master katalog paket dinamis (*UND-BASIC, UND-GOLD, UND-PLATINUM, UND-RESELLER*).
   - Checkout & Pembayaran Otomatis Tripay QRIS / Virtual Account.
   - Auto-notifikasi invoice & status bayar via bot WhatsApp resmi.
5. **Modern Tech Stack**:
   - Frontend: React 18, Vite, Tailwind CSS, TanStack React Query v5, Motion, Lucide Icons.
   - Backend: Fastify, TypeScript, Prisma ORM (SQLite / PostgreSQL), PDFKit Vector Engine, QRCode.

---

## Cara Menjalankan Aplikasi

### 1. Menjalankan Backend API
```bash
cd backend
npm install
npm run dev
# Backend berjalan di http://localhost:4000
```

### 2. Menjalankan Frontend Webapp
```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:3000
```

### 3. Server Lisensi (Opsional untuk integrasi pembayaran penuh)
```bash
cd D:\BarayaProject\Project-Server-Lisensi
npm run dev
# Server Lisensi berjalan di http://localhost:5000
```
