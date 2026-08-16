import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, FileDown, Eye, Sliders, Users, Sparkles, Check, ArrowLeft, RefreshCw, Tag, QrCode } from 'lucide-react';
import { InvitationData, GuestRecipient } from '../types';
import { THEMES } from '../data/presets';
import { api } from '../api/client';

interface PrintStudioProps {
  data: InvitationData;
  guests: GuestRecipient[];
  onBack: () => void;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ data, guests, onBack }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

  // Print Mode: 'card' | 'label' | 'souvenir' | 'standee'
  const [printMode, setPrintMode] = useState<'card' | 'label' | 'souvenir' | 'standee'>('card');
  const [cardSize, setCardSize] = useState<'A5' | '4R'>('A5');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  // Label configuration
  const [selectedGuests, setSelectedGuests] = useState<string[]>(guests.map((g) => g.id));
  const [labelPrefix, setLabelPrefix] = useState('Kepada Yth. Bapak/Ibu/Saudara/i:');
  const [labelSubtext, setLabelSubtext] = useState('Di Tempat');

  const invId = data.id || data.slug || 'wedding-romeo-juliet';

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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4 md:p-8">
      {/* Top Bar (no-print) */}
      <div className="no-print mx-auto max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-amber-200">
              Print Studio 300 DPI (Suite Fisik Lengkap)
            </h1>
            <p className="text-xs text-neutral-400">
              Cetak kartu fisik, stiker label 103, kupon souvenir, & standee QR meja resepsi
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex rounded-xl bg-neutral-800 p-1 border border-neutral-700">
            <button
              onClick={() => setPrintMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'card' ? 'bg-[#C5A059] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kartu (A5/4R)
            </button>
            <button
              onClick={() => setPrintMode('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'label' ? 'bg-[#C5A059] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Stiker 103
            </button>
            <button
              onClick={() => setPrintMode('souvenir')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'souvenir' ? 'bg-[#C5A059] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kupon Souvenir
            </button>
            <button
              onClick={() => setPrintMode('standee')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                printMode === 'standee' ? 'bg-[#C5A059] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Standee QR
            </button>
          </div>

          <button
            onClick={handlePrint}
            id="trigger-print-btn"
            className="flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition cursor-pointer"
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
            <div className="no-print mb-6 flex items-center gap-4 bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
              <span className="text-xs text-neutral-400">Ukuran Kartu:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCardSize('A5')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    cardSize === 'A5' ? 'bg-[#C5A059] text-black' : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  A5 (148 x 210 mm)
                </button>
                <button
                  onClick={() => setCardSize('4R')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    cardSize === '4R' ? 'bg-[#C5A059] text-black' : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  4R (102 x 152 mm)
                </button>
              </div>
            </div>

            {/* Visual Card Canvas */}
            <div
              className={`relative bg-[#FAF8F5] text-neutral-900 shadow-2xl p-8 rounded-lg border-4 border-[#C5A059] flex flex-col items-center justify-between text-center ${
                cardSize === 'A5' ? 'w-[420px] h-[595px]' : 'w-[290px] h-[430px]'
              }`}
            >
              <div className="w-full border border-[#C5A059]/40 h-full p-6 flex flex-col justify-between">
                <div>
                  <p className="font-display text-[10px] tracking-[0.3em] text-[#8C7A4F] uppercase font-semibold">
                    {data.eventType === 'wedding' ? 'THE WEDDING OF' : 'UNDANGAN SYUKURAN'}
                  </p>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-2">
                    {data.eventTitle}
                  </h2>
                </div>

                <div className="space-y-2 text-xs text-neutral-600">
                  <p className="font-serif italic text-sm text-[#8C7A4F]">
                    {data.openingQuoteText?.slice(0, 75) || 'Dengan memohon rahmat Allah SWT'}...
                  </p>
                  <div className="font-bold text-neutral-900 text-sm mt-3">
                    {data.events[0]?.date || 'Sabtu, 24 Oktober 2026'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {data.events[0]?.time || '09:00 - 13:00 WIB'}
                  </div>
                  <div className="text-xs font-medium text-neutral-700">
                    {data.events[0]?.venueName || 'Grand Ballroom Hotel Horison'}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-2 bg-white rounded-lg border border-neutral-300 shadow-xs">
                    <QrCode className="w-16 h-16 text-neutral-900" />
                  </div>
                  <span className="text-[9px] text-neutral-400 mt-1">Scan untuk Buka Undangan Digital</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {printMode === 'label' && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
              <span className="text-xs text-neutral-300">
                Total Stiker Terpilih: <strong className="text-amber-400">{selectedGuestObjects.length}</strong> / {guests.length}
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1 bg-neutral-700 text-xs rounded-lg hover:bg-neutral-600">Pilih Semua</button>
                <button onClick={deselectAll} className="px-3 py-1 bg-neutral-700 text-xs rounded-lg hover:bg-neutral-600">Batalkan</button>
              </div>
            </div>

            {/* Grid 12 Stiker Label Tom & Jerry 103 */}
            <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-xl text-neutral-900 shadow-2xl">
              {selectedGuestObjects.slice(0, 12).map((g) => (
                <div key={g.id} className="border border-dashed border-neutral-400 p-4 rounded-md text-center flex flex-col justify-center min-h-[95px] bg-[#fcfcfc]">
                  <p className="text-[9px] text-neutral-500">{labelPrefix}</p>
                  <h4 className="font-bold text-sm text-neutral-900 mt-0.5">{g.name}</h4>
                  <p className="text-[10px] text-neutral-600">{g.addressOrCity ? `di ${g.addressOrCity}` : labelSubtext}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {printMode === 'souvenir' && (
          <div className="space-y-6">
            <div className="no-print bg-neutral-800 p-4 rounded-2xl border border-neutral-700 text-xs text-neutral-300">
              Kupon Penukaran Souvenir & Makanan (8 Kupon per Lembar A4 siap gunting).
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-xl text-neutral-900 shadow-2xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num} className="border-2 border-[#C5A059] p-4 rounded-lg text-center flex flex-col justify-between min-h-[120px] bg-[#FAF8F5]">
                  <span className="text-[8px] text-neutral-400 uppercase tracking-widest font-semibold">THANK YOU FOR CELEBRATING</span>
                  <h4 className="font-serif font-bold text-base text-neutral-900">{data.eventTitle}</h4>
                  <p className="text-[10px] text-neutral-600">Kupon Penukaran Souvenir & Makanan</p>
                  <span className="text-[11px] font-bold text-[#C5A059]">NO. 00{num}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {printMode === 'standee' && (
          <div className="flex flex-col items-center">
            <div className="no-print mb-4 bg-neutral-800 p-4 rounded-2xl border border-neutral-700 text-xs text-neutral-300 text-center">
              Standee Akrilik Meja Resepsi Ukuran A6 (105 x 148 mm). Pindai QR langsung menuju buku tamu.
            </div>
            <div className="w-[300px] h-[420px] bg-[#FAF8F5] border-4 border-[#C5A059] p-6 rounded-xl shadow-2xl flex flex-col justify-between items-center text-center text-neutral-900">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#8C7A4F] font-bold">WELCOME TO THE RECEPTION OF</span>
                <h3 className="font-serif text-xl font-bold mt-1 text-neutral-900">{data.eventTitle}</h3>
              </div>

              <div className="p-3 bg-white border border-[#C5A059]/50 rounded-xl shadow-md">
                <QrCode className="w-28 h-28 text-neutral-900" />
              </div>

              <div>
                <p className="font-bold text-xs text-[#8C7A4F]">SCAN UNTUK BUKU TAMU & RSVP DIGITAL</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Silakan pindai untuk mengisi ucapan doa dan galeri momen</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
