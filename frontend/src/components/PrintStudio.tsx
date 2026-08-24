import React, { useState, useRef } from 'react';
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
  Image as ImageIcon,
  Download,
  Share2,
  Copy,
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
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
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Event Type Detection yang tangguh & akurat
  const rawTitle = (data.eventTitle || (data as any).title || '').toLowerCase();
  const rawTagline = (data.tagline || '').toLowerCase();
  const eventTypeStr = (data.eventType || '').toLowerCase();

  const isKhitan =
    eventTypeStr === 'khitanan' ||
    rawTitle.includes('khitan') ||
    rawTagline.includes('khitan');

  const isAqiqah =
    eventTypeStr === 'aqiqah' ||
    rawTitle.includes('aqiqah') ||
    rawTagline.includes('aqiqah');

  const isBirthday =
    eventTypeStr === 'birthday' ||
    rawTitle.includes('birthday') ||
    rawTitle.includes('ulang tahun') ||
    rawTagline.includes('birthday') ||
    rawTagline.includes('ulang tahun');

  const isWedding = !isKhitan && !isAqiqah && !isBirthday;

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

  // Parents Subtitle
  const parentsSubtitle = (() => {
    const p1 = data.profiles?.[0];
    const p2 = data.profiles?.[1];
    if (isKhitan || isAqiqah || isBirthday) {
      if (p1?.fatherName && p1?.motherName) {
        return `Putra dari Bpk. ${p1.fatherName} & Ibu ${p1.motherName}`;
      }
      if (p1?.fatherName) {
        return `Putra dari Bpk. ${p1.fatherName}`;
      }
      if (p1?.motherName) {
        return `Putra dari Ibu ${p1.motherName}`;
      }
      return '';
    }
    if (p1?.fatherName && p2?.fatherName) {
      return `Putra-Putri dari Bpk. ${p1.fatherName} & Bpk. ${p2.fatherName}`;
    }
    return '';
  })();

  // Quote / Pengantar Cetak 100% Sesuai Jenis Acara
  const displayQuote = (() => {
    if (isKhitan) {
      if (data.openingQuoteText && /khitan|anak|sholeh|berbakti|sunat/i.test(data.openingQuoteText)) {
        return data.openingQuoteText;
      }
      return 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Walimatul Khitan putra kami, seraya memanjatkan doa agar ananda menjadi anak yang sholeh, cerdas, dan berbakti kepada orang tua.';
    }

    if (isAqiqah) {
      if (data.openingQuoteText && /aqiqah|kelahiran|buah hati|bayi/i.test(data.openingQuoteText)) {
        return data.openingQuoteText;
      }
      return 'Puji syukur kami panjatkan atas kelahiran buah hati tercinta kami. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Tasyakuran Aqiqah seraya memohon doa keberkahan.';
    }

    if (isBirthday) {
      if (data.openingQuoteText && /ulang tahun|birthday|usia|pesta/i.test(data.openingQuoteText)) {
        return data.openingQuoteText;
      }
      return 'Puji syukur atas usia yang penuh berkah dan kebahagiaan. Merupakan suatu kehormatan dan sukacita atas kehadiran Anda di hari istimewa ini.';
    }

    // Wedding
    if (data.openingQuoteText && !data.openingQuoteText.includes('khitan') && !data.openingQuoteText.includes('aqiqah')) {
      return data.openingQuoteText;
    }
    return 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami.';
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

          {printMode === 'card' && (
            <>
              <button
                onClick={async () => {
                  if (!cardRef.current) return;
                  try {
                    setIsDownloadingImage(true);
                    const dataUrl = await toPng(cardRef.current, {
                      quality: 1.0,
                      pixelRatio: 2.5,
                      cacheBust: true,
                    });
                    const link = document.createElement('a');
                    link.download = `kartu-undangan-${data.slug || 'digital'}.png`;
                    link.href = dataUrl;
                    link.click();
                  } catch (err) {
                    console.error('Failed to download image:', err);
                  } finally {
                    setIsDownloadingImage(false);
                  }
                }}
                disabled={isDownloadingImage}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
                title="Download Gambar HD untuk dibagikan di WhatsApp"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isDownloadingImage ? 'Memproses...' : 'Download Gambar (PNG)'}</span>
              </button>

              <button
                onClick={async () => {
                  if (!cardRef.current) return;
                  try {
                    const blob = await toBlob(cardRef.current, {
                      quality: 1.0,
                      pixelRatio: 2.0,
                      cacheBust: true,
                    });
                    if (blob && (navigator.clipboard as any)?.write) {
                      await (navigator.clipboard as any).write([
                        new ClipboardItem({ 'image/png': blob })
                      ]);
                      setCopiedImage(true);
                      setTimeout(() => setCopiedImage(false), 2500);
                    }
                  } catch (err) {
                    console.error('Clipboard copy failed:', err);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                title="Salin Gambar ke Clipboard"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedImage ? 'Tersalin!' : 'Salin Gambar'}</span>
              </button>
            </>
          )}

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

              {/* Photo Toggle */}
              {Boolean(data.profiles?.[0]?.photoUrl || data.heroImageUrl || data.gallery?.[0]?.url) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPhoto(!showPhoto)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      showPhoto
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{showPhoto ? '✓ Foto Aktif' : 'Foto Nonaktif'}</span>
                  </button>
                </div>
              )}

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
              ref={cardRef}
              className={`relative bg-[#FAF8F5] text-neutral-900 shadow-2xl p-6 sm:p-8 rounded-2xl border-4 flex flex-col items-center justify-between text-center transition-all overflow-hidden ${
                cardSize === 'A5' ? 'w-[420px] min-h-[595px]' : 'w-[320px] min-h-[460px]'
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
                className="w-full h-full p-5 sm:p-6 flex flex-col justify-between rounded-xl border relative z-10"
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

                  {/* Optional Child / Honoree Photo (Arch Gold Frame) */}
                  {showPhoto && Boolean(data.profiles?.[0]?.photoUrl || data.heroImageUrl || data.gallery?.[0]?.url) && (
                    <div className="my-2 flex justify-center">
                      <div
                        className="relative p-1 rounded-t-full rounded-b-2xl border-2 shadow-md overflow-hidden"
                        style={{
                          borderColor: activePrimary,
                          backgroundColor: `${activePrimary}15`,
                        }}
                      >
                        <img
                          src={data.profiles?.[0]?.photoUrl || data.heroImageUrl || data.gallery?.[0]?.url}
                          alt={displayTitle}
                          className={`object-cover rounded-t-full rounded-b-xl ${
                            cardSize === 'A5' ? 'w-24 h-32 sm:w-28 sm:h-36' : 'w-20 h-24'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <h2
                    className="text-xl sm:text-2xl font-bold mt-1 tracking-tight leading-tight"
                    style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}
                  >
                    {displayTitle}
                  </h2>
                  {parentsSubtitle && (
                    <p
                      className="text-[11px] font-medium mt-1 tracking-wide opacity-85"
                      style={{ color: activePrimary }}
                    >
                      {parentsSubtitle}
                    </p>
                  )}
                </div>

                {/* Body: Opening Blessing Quote */}
                <div className="my-2 max-w-xs mx-auto">
                  <p
                    className="text-[11px] sm:text-xs leading-relaxed italic opacity-85"
                    style={{ color: theme.mode === 'dark' ? '#d4d4dc' : '#4b5563' }}
                  >
                    "{displayQuote}"
                  </p>
                </div>

                {/* Event Schedule & Venue */}
                <div
                  className="p-3 rounded-xl border my-1.5"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? '#211f2c' : '#f4eee4',
                    borderColor: `${activePrimary}30`,
                  }}
                >
                  <div className="font-bold text-xs sm:text-sm tracking-wide" style={{ color: activePrimary }}>
                    {displayDate}
                  </div>
                  <div
                    className="text-[11px] font-semibold mt-0.5"
                    style={{ color: theme.mode === 'dark' ? '#e2e2e7' : '#374151' }}
                  >
                    {displayTime}
                  </div>
                  <div
                    className="text-xs font-bold mt-0.5 uppercase tracking-wider"
                    style={{ color: theme.mode === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    {displayVenue}
                  </div>
                  {displayAddress && (
                    <div
                      className="text-[9.5px] mt-0.5 opacity-75 max-w-[260px] mx-auto line-clamp-2"
                      style={{ color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      {displayAddress}
                    </div>
                  )}
                </div>

                {/* Footer: Live QR Code to Open Digital Invitation */}
                <div className="flex flex-col items-center mt-1.5">
                  <div
                    className="p-1.5 bg-white rounded-xl border shadow-sm flex items-center justify-center"
                    style={{ borderColor: `${activePrimary}50` }}
                  >
                    <QrCode className="w-12 h-12 sm:w-14 sm:h-14 text-neutral-950" />
                  </div>
                  <span
                    className="text-[8.5px] font-semibold mt-1 uppercase tracking-widest"
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
                    {isKhitan ? 'SYUKURAN KHITANAN' : isAqiqah ? 'TASYAKURAN AQIQAH' : isBirthday ? 'BIRTHDAY CELEBRATION' : 'WEDDING RECEPTION'}
                  </span>
                  <h4 className="font-bold text-base mt-0.5" style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}>
                    {displayTitle}
                  </h4>
                  <p className="text-[10px] opacity-70">
                    {isKhitan ? 'Kupon Souvenir & Berkat Khitan' : isAqiqah ? 'Kupon Souvenir & Berkat Aqiqah' : isBirthday ? 'Kupon Souvenir & Birthday Treat' : 'Kupon Penukaran Souvenir & Makanan'}
                  </p>
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
                  {isKhitan ? 'WELCOME TO WALIMATUL KHITAN OF' : isAqiqah ? 'WELCOME TO TASYAKURAN AQIQAH OF' : isBirthday ? 'HAPPY BIRTHDAY CELEBRATION OF' : 'WELCOME TO THE WEDDING OF'}
                </span>
                <h3 className="text-xl font-bold mt-1" style={{ fontFamily: headingFont, color: theme.mode === 'dark' ? '#ffffff' : activePrimary }}>
                  {displayTitle}
                </h3>
                {parentsSubtitle && (
                  <p className="text-[10px] opacity-80 mt-0.5" style={{ color: activePrimary }}>
                    {parentsSubtitle}
                  </p>
                )}
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
