import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Printer,
  FileDown,
  ArrowLeft,
  QrCode,
  Sparkles,
  Layout,
  Palette,
  Check,
  Moon,
  Star,
  Heart,
} from 'lucide-react';
import { InvitationData, GuestRecipient, CornerOrnamentId } from '../types';
import { FONT_PRESETS } from '../data/presets';
import { themeRegistry } from '../themes/registry';
import { CornerOrnaments } from './effects/CornerOrnaments';
import { api } from '../api/client';

interface PrintStudioProps {
  data: InvitationData;
  guests: GuestRecipient[];
  onBack: () => void;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ data, guests, onBack }) => {
  const theme = themeRegistry.getTheme(data.theme);
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';

  // Typography
  const fontPreset = data.themeConfig?.fontPairingId ? FONT_PRESETS[data.themeConfig.fontPairingId] : null;
  const headingFont = fontPreset?.headingFamily || "'Cinzel', 'Playfair Display', serif";

  // Print Mode: 'card' | 'label' | 'souvenir' | 'standee'
  const [printMode, setPrintMode] = useState<'card' | 'label' | 'souvenir' | 'standee'>('card');
  const [cardSize, setCardSize] = useState<'A5' | '4R'>('A5');
  const [cardStyle, setCardStyle] = useState<'royal' | 'traditional' | 'islamic' | 'modern' | 'botanical'>('royal');

  // Label configuration
  const [selectedGuests, setSelectedGuests] = useState<string[]>(guests.map((g) => g.id));
  const [labelPrefix, setLabelPrefix] = useState('Kepada Yth. Bapak/Ibu/Saudara/i:');
  const [labelSubtext, setLabelSubtext] = useState('Di Tempat');

  const invId = data.id || data.slug || 'undangan-digital';

  // Event Type Detection
  const rawTitle = data.eventTitle || (data as any).title || '';
  const isKhitan =
    data.eventType === 'khitanan' ||
    /khitan/i.test(rawTitle) ||
    /khitan/i.test(data.tagline || '');
  const isAqiqah =
    data.eventType === 'aqiqah' ||
    /aqiqah/i.test(rawTitle) ||
    /aqiqah/i.test(data.tagline || '');
  const isBirthday =
    data.eventType === 'birthday' ||
    /birthday|ulang tahun/i.test(rawTitle) ||
    /birthday|ulang tahun/i.test(data.tagline || '');

  // Tagline & Clean Full Name
  const displayTagline = (() => {
    if (isKhitan) return data.tagline && !data.tagline.includes('WEDDING') ? data.tagline : 'WALIMATUL KHITAN';
    if (isAqiqah) return data.tagline && !data.tagline.includes('WEDDING') ? data.tagline : 'TASYAKURAN AQIQAH';
    if (isBirthday) return data.tagline && !data.tagline.includes('WEDDING') ? data.tagline : 'HAPPY BIRTHDAY';
    return data.tagline || 'THE WEDDING OF';
  })();

  const displayTitle = (() => {
    const p1 = data.profiles?.[0];
    const p2 = data.profiles?.[1];
    if (isKhitan || isAqiqah || isBirthday) {
      if (p1?.fullName && p1.fullName.trim()) return p1.fullName.trim();
      if (p1?.name && p1.name.trim()) return p1.name.trim();
      const stripped = (data.eventTitle || '').replace(/^(Walimatul Khitan|Tasyakuran Aqiqah|Happy Birthday|Ulang Tahun)\s*/i, '').trim();
      if (stripped && stripped.length > 2) return stripped;
      return 'M. Akmal Abdul Jalil';
    }
    if (p1?.name && p2?.name) return `${p1.name} & ${p2.name}`;
    return data.eventTitle || 'Romeo & Juliet';
  })();

  // Quote
  const displayQuote = (() => {
    if (data.openingQuoteText && !data.openingQuoteText.includes('berpasang-pasangan')) {
      return data.openingQuoteText;
    }
    if (isKhitan) {
      return 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Walimatul Khitan putra kami, seraya memanjatkan doa agar ananda menjadi anak yang sholeh dan berbakti.';
    }
    if (isBirthday) {
      return 'Puji syukur atas usia yang penuh berkah dan kebahagiaan. Merupakan suatu kehormatan atas kehadiran Anda di hari istimewa ini.';
    }
    return data.openingQuoteText || 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...';
  })();

  // Event Date & Time
  const session1 = data.sessions?.[0] || (data as any).events?.[0];
  const displayDate = (() => {
    const rawDate = session1?.date || data.eventDate;
    if (!rawDate) return 'Sabtu, 24 Oktober 2026';
    try {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const isoMatch = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const d = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
    } catch {}
    return rawDate;
  })();

  const displayTime = session1?.startTime
    ? `${session1.startTime} - ${session1.endTime || 'Selesai'} ${session1.timeZone || 'WIB'}`
    : '08:00 WIB s/d Selesai';
  const displayVenue = session1?.venueName || 'Kediaman Mempelai';
  const displayAddress = session1?.venueAddress || '';

  // Corner ornament style
  const cornerOrnamentType: CornerOrnamentId =
    cardStyle === 'traditional'
      ? 'batik_prada'
      : cardStyle === 'islamic'
      ? 'islamic_arabesque'
      : cardStyle === 'modern'
      ? 'art_deco'
      : cardStyle === 'botanical'
      ? 'botanical_leaves'
      : data.themeConfig?.cornerOrnament || 'royal_crown';

  const toggleGuestSelect = (id: string) => {
    setSelectedGuests((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedGuests(guests.map((g) => g.id));
  const deselectAll = () => setSelectedGuests([]);

  const handlePrint = () => {
    window.print();
  };

  const selectedGuestObjects = guests.filter((g) => selectedGuests.includes(g.id));

  // Determine active PDF download URL
  const getActivePdfUrl = () => {
    switch (printMode) {
      case 'card':
        return api.getCardPdfUrl(invId, cardSize);
      case 'label':
        return api.getStickersPdfUrl(invId);
      case 'souvenir':
        return api.getSouvenirTagsPdfUrl(invId);
      case 'standee':
        return api.getTableStandeePdfUrl(invId);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 selection:bg-[#c4a661] selection:text-neutral-950">
      {/* Top Bar (no-print) */}
      <div className="no-print mx-auto max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-amber-200 flex items-center gap-2">
              <span>Print Studio 300 DPI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-sans font-semibold border border-amber-500/30">
                Theme-Aware HD
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cetak kartu fisik, stiker label 103, kupon souvenir, & standee QR meja resepsi
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
            <button
              onClick={() => setPrintMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'card' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kartu (A5/4R)
            </button>
            <button
              onClick={() => setPrintMode('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'label' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Stiker 103
            </button>
            <button
              onClick={() => setPrintMode('souvenir')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'souvenir' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kupon Souvenir
            </button>
            <button
              onClick={() => setPrintMode('standee')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'standee' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Standee QR
            </button>
          </div>

          <button
            onClick={handlePrint}
            id="trigger-print-btn"
            className="flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Browser Print</span>
          </button>

          <a
            href={getActivePdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            id="download-pdf-btn"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-neutral-950 shadow-lg hover:opacity-95 transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF HD (300 DPI)</span>
          </a>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="mx-auto max-w-5xl">
        {printMode === 'card' && (
          <div className="flex flex-col items-center">
            {/* Card Config Controls */}
            <div className="no-print mb-6 flex flex-wrap items-center justify-center gap-4 bg-neutral-900/90 p-3 rounded-2xl border border-neutral-800 shadow-xl">
              {/* Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Ukuran:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCardSize('A5')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      cardSize === 'A5' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    A5 (148 x 210 mm)
                  </button>
                  <button
                    onClick={() => setCardSize('4R')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      cardSize === '4R' ? 'bg-[#c4a661] text-neutral-950 shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    4R (102 x 152 mm)
                  </button>
                </div>
              </div>

              <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

              {/* Layout Styles */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5" />
                  <span>Gaya Desain:</span>
                </span>
                <div className="flex gap-1">
                  {[
                    { id: 'royal', label: '👑 Royal' },
                    { id: 'modern', label: '📐 Art Deco' },
                    { id: 'traditional', label: '🏛️ Batik' },
                    { id: 'islamic', label: '🌙 Islami' },
                    { id: 'botanical', label: '🍃 Floral' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCardStyle(st.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        cardStyle === st.id
                          ? 'bg-[#c4a661]/20 border border-[#c4a661] text-amber-300'
                          : 'bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Card Canvas (100% Theme-Aware & 300 DPI Print Calibrated) */}
            <div
              className={`relative bg-[#FAF8F5] text-neutral-900 shadow-2xl p-6 sm:p-8 rounded-2xl border-4 flex flex-col items-center justify-between text-center transition-all overflow-hidden ${
                cardSize === 'A5' ? 'w-[420px] min-h-[595px]' : 'w-[310px] min-h-[440px]'
              }`}
              style={{
                borderColor: activePrimary,
                backgroundColor: theme.mode === 'dark' ? '#0f0e13' : '#faf8f5',
                color: theme.mode === 'dark' ? '#f5f5f7' : '#1a191e',
              }}
            >
              {/* 4 Luxury Corner Ornaments */}
              <CornerOrnaments type={cornerOrnamentType} primaryColor={activePrimary} />

              {/* Inner Double Line Border Frame */}
              <div
                className="w-full h-full p-6 sm:p-7 flex flex-col justify-between rounded-xl border relative z-10"
                style={{
                  borderColor: `${activePrimary}40`,
                  backgroundColor: theme.mode === 'dark' ? '#17161f50' : '#ffffff80',
                }}
              >
                {/* Header: Tagline & Event Title */}
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    {isKhitan || isAqiqah ? (
                      <Moon className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    ) : isBirthday ? (
                      <Star className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    ) : (
                      <Heart className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    )}
                    <p
                      className="font-display text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold"
                      style={{ color: activePrimary }}
                    >
                      {displayTagline}
                    </p>
                    {isKhitan || isAqiqah ? (
                      <Moon className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    ) : isBirthday ? (
                      <Star className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    ) : (
                      <Heart className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                    )}
                  </div>

                  <h2
                    className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight leading-tight"
                    style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}
                  >
                    {displayTitle}
                  </h2>
                </div>

                {/* Body: Opening Blessing Quote */}
                <div className="my-3 max-w-xs mx-auto">
                  <p
                    className="text-xs sm:text-sm leading-relaxed italic opacity-85"
                    style={{ color: theme.mode === 'dark' ? '#d4d4dc' : '#4b5563' }}
                  >
                    "{displayQuote}"
                  </p>
                </div>

                {/* Event Schedule & Venue */}
                <div
                  className="p-3.5 rounded-xl border my-2"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? '#211f2c' : '#f4eee4',
                    borderColor: `${activePrimary}30`,
                  }}
                >
                  <div className="font-bold text-sm sm:text-base tracking-wide" style={{ color: activePrimary }}>
                    {displayDate}
                  </div>
                  <div
                    className="text-xs font-semibold mt-0.5"
                    style={{ color: theme.mode === 'dark' ? '#e2e2e7' : '#374151' }}
                  >
                    {displayTime}
                  </div>
                  <div
                    className="text-xs font-bold mt-1 uppercase tracking-wider"
                    style={{ color: theme.mode === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    {displayVenue}
                  </div>
                  {displayAddress && (
                    <div
                      className="text-[10px] mt-0.5 opacity-75 max-w-[260px] mx-auto line-clamp-2"
                      style={{ color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      {displayAddress}
                    </div>
                  )}
                </div>

                {/* Footer: Live QR Code to Open Digital Invitation */}
                <div className="flex flex-col items-center mt-2">
                  <div
                    className="p-2 bg-white rounded-xl border shadow-sm flex items-center justify-center"
                    style={{ borderColor: `${activePrimary}50` }}
                  >
                    <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-neutral-950" />
                  </div>
                  <span
                    className="text-[9px] font-semibold mt-1.5 uppercase tracking-widest"
                    style={{ color: activePrimary }}
                  >
                    Scan untuk Buka Undangan Digital
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {printMode === 'label' && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-300">
                Total Stiker Terpilih: <strong className="text-amber-400">{selectedGuestObjects.length}</strong> / {guests.length}
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1 bg-neutral-800 text-xs rounded-lg hover:bg-neutral-700 font-semibold cursor-pointer">Pilih Semua</button>
                <button onClick={deselectAll} className="px-3 py-1 bg-neutral-800 text-xs rounded-lg hover:bg-neutral-700 font-semibold cursor-pointer">Batalkan</button>
              </div>
            </div>

            {/* Grid 12 Stiker Label Tom & Jerry 103 */}
            <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-xl text-neutral-900 shadow-2xl">
              {selectedGuestObjects.slice(0, 12).map((g) => (
                <div key={g.id} className="border border-dashed border-neutral-300 p-4 rounded-md text-center flex flex-col justify-center min-h-[95px] bg-[#fcfcfc] relative overflow-hidden">
                  <p className="text-[9px] text-neutral-500 font-medium">{labelPrefix}</p>
                  <h4 className="font-bold text-sm text-neutral-900 mt-0.5">{g.name}</h4>
                  <p className="text-[10px] text-neutral-600 mt-0.5">{g.addressOrCity ? `di ${g.addressOrCity}` : labelSubtext}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {printMode === 'souvenir' && (
          <div className="space-y-6">
            <div className="no-print bg-neutral-900 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
              Kupon Penukaran Souvenir & Makanan (8 Kupon per Lembar A4 siap gunting).
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-xl text-neutral-900 shadow-2xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className="border-2 p-4 rounded-xl text-center flex flex-col justify-between min-h-[120px] relative overflow-hidden"
                  style={{
                    borderColor: `${activePrimary}60`,
                    backgroundColor: theme.mode === 'dark' ? '#17161f' : '#FAF8F5',
                    color: theme.mode === 'dark' ? '#f5f5f7' : '#1a191e',
                  }}
                >
                  <CornerOrnaments type={cornerOrnamentType} primaryColor={activePrimary} />
                  <span className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: activePrimary }}>
                    THANK YOU FOR CELEBRATING
                  </span>
                  <h4 className="font-bold text-base mt-1" style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}>
                    {displayTitle}
                  </h4>
                  <p className="text-[10px] opacity-70">Kupon Penukaran Souvenir & Makanan</p>
                  <span className="text-[11px] font-bold font-mono mt-1" style={{ color: activePrimary }}>
                    NO. 00{num}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {printMode === 'standee' && (
          <div className="flex flex-col items-center">
            <div className="no-print mb-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 text-center">
              Standee Akrilik Meja Resepsi Ukuran A6 (105 x 148 mm). Pindai QR langsung menuju buku tamu.
            </div>
            <div
              className="w-[310px] h-[440px] border-4 p-6 rounded-2xl shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden"
              style={{
                borderColor: activePrimary,
                backgroundColor: theme.mode === 'dark' ? '#0f0e13' : '#FAF8F5',
                color: theme.mode === 'dark' ? '#f5f5f7' : '#1a191e',
              }}
            >
              <CornerOrnaments type={cornerOrnamentType} primaryColor={activePrimary} />

              <div className="relative z-10">
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: activePrimary }}>
                  WELCOME TO THE EVENT OF
                </span>
                <h3 className="text-xl font-bold mt-1" style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}>
                  {displayTitle}
                </h3>
              </div>

              <div className="p-3 bg-white border rounded-2xl shadow-md relative z-10" style={{ borderColor: `${activePrimary}50` }}>
                <QrCode className="w-28 h-28 text-neutral-950" />
              </div>

              <div className="relative z-10">
                <p className="font-bold text-xs uppercase tracking-wider" style={{ color: activePrimary }}>
                  SCAN UNTUK BUKU TAMU & RSVP DIGITAL
                </p>
                <p className="text-[9px] opacity-75 mt-0.5">
                  Silakan pindai untuk mengisi ucapan doa dan galeri momen
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
