import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, FileDown, Eye, Sliders, Users, Sparkles, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { InvitationData, GuestRecipient } from '../types';
import { THEMES } from '../data/presets';

interface PrintStudioProps {
  data: InvitationData;
  guests: GuestRecipient[];
  onBack: () => void;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ data, guests, onBack }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;

  // Print Mode: 'card' (A5 / 4R physical invitation) or 'label' (Tom & Jerry 103 Stickers)
  const [printMode, setPrintMode] = useState<'card' | 'label'>('card');
  const [cardSize, setCardSize] = useState<'A5' | '4R'>('A5');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  // Label configuration
  const [selectedGuests, setSelectedGuests] = useState<string[]>(guests.map((g) => g.id));
  const [labelPrefix, setLabelPrefix] = useState('Kepada Yth. Bapak/Ibu/Saudara/i:');
  const [labelSubtext, setLabelSubtext] = useState('Di Tempat');
  const [labelFontSize, setLabelFontSize] = useState<'small' | 'medium' | 'large'>('medium');

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

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4 md:p-8">
      {/* Top Bar (no-print) */}
      <div className="no-print mx-auto max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-amber-200">
              Print Studio (300 DPI & Sticker Labels)
            </h1>
            <p className="text-xs text-neutral-400">
              Cetak undangan fisik resolusi tinggi & stiker label tamu Tom & Jerry 103
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl bg-neutral-800 p-1 border border-neutral-700">
            <button
              onClick={() => setPrintMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                printMode === 'card' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kartu Fisik (A5 / 4R)
            </button>
            <button
              onClick={() => setPrintMode('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                printMode === 'label' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Label Tom & Jerry 103
            </button>
          </div>

          <button
            onClick={handlePrint}
            id="trigger-print-btn"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-neutral-950 hover:opacity-95 shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl">
        {printMode === 'card' ? (
          /* CARD PRINT STUDIO (Matches Image 1: Arch photo, luxury textured card, gold typography) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Controls (no-print) */}
            <div className="no-print space-y-5 rounded-2xl bg-neutral-800/80 p-5 border border-neutral-700">
              <h2 className="font-serif text-base font-bold text-amber-200">
                Pengaturan Kartu Fisik
              </h2>

              {/* Format Size */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Ukuran Cetak
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCardSize('A5')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      cardSize === 'A5'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    A5 (14.8 × 21.0 cm)
                  </button>
                  <button
                    onClick={() => setCardSize('4R')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      cardSize === '4R'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    4R (10.2 × 15.2 cm)
                  </button>
                </div>
              </div>

              {/* Front / Back View */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Sisi Tampilan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCardSide('front')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      cardSide === 'front'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Sisi Depan (Cover)
                  </button>
                  <button
                    onClick={() => setCardSide('back')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      cardSide === 'back'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Sisi Belakang (Acara)
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-amber-950/40 p-3.5 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                💡 <strong>Tips Cetak:</strong> Gunakan kertas <em>Jasmine 220gsm</em>, <em>Linen</em>, atau <em>Concorde</em> bertekstur untuk hasil mewah seperti pada gambar!
              </div>
            </div>

            {/* Printable Card Preview (300 DPI styling) */}
            <div className="lg:col-span-2 flex justify-center">
              <div
                id="printable-card"
                className={`printable-sheet bg-[#FAF7F2] text-neutral-900 shadow-2xl p-8 md:p-12 transition-all border border-neutral-300 relative overflow-hidden flex flex-col items-center justify-between ${
                  cardSize === 'A5'
                    ? 'w-[380px] md:w-[460px] min-h-[580px] md:min-h-[650px] rounded-2xl'
                    : 'w-[320px] md:w-[380px] min-h-[480px] md:min-h-[540px] rounded-xl'
                }`}
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 20%, #FFFFFF 0%, #FAF7F2 100%)`,
                }}
              >
                {/* Textured border rim */}
                <div className="absolute inset-3 border border-amber-300/40 rounded-xl pointer-events-none" />

                {cardSide === 'front' ? (
                  /* FRONT CARD (Exact style of Image 1) */
                  <>
                    {/* Arch Photo */}
                    <div className="w-full flex justify-center mt-2">
                      <div className="relative w-48 h-64 arch-frame border-2 border-amber-300/80 shadow-md overflow-hidden bg-neutral-200">
                        <img
                          src={data.gallery[0]?.url || data.profiles[0]?.photoUrl}
                          alt="Cover Couple"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                    </div>

                    {/* Text block */}
                    <div className="text-center mt-6 mb-2 space-y-2">
                      <p className="font-display text-[10px] tracking-[0.28em] uppercase text-amber-800 font-semibold">
                        {data.tagline}
                      </p>
                      <p className="text-[10px] text-neutral-600 max-w-[280px] mx-auto leading-relaxed">
                        TOGETHER WITH OUR FAMILIES, WE CORDIALLY INVITE YOU TO CELEBRATE THE UNION OF
                      </p>

                      <h2 className="font-script text-4xl md:text-5xl text-amber-900 pt-1 font-normal">
                        {data.profiles[0]?.name} & {data.profiles[1]?.name || 'Juliet'}
                      </h2>

                      <p className="font-display text-xs tracking-widest text-neutral-800 font-semibold pt-1">
                        SABTU, 24 OKTOBER 2026
                      </p>

                      <p className="font-script text-lg text-amber-700/90 italic">
                        join us as our story begins
                      </p>
                    </div>
                  </>
                ) : (
                  /* BACK CARD (Event sessions & venue details) */
                  <div className="w-full text-center space-y-5 my-auto">
                    <p className="font-arabic text-2xl text-amber-800">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>

                    <h3 className="font-serif text-2xl font-bold text-neutral-900">
                      {data.eventTitle}
                    </h3>

                    <div className="space-y-4 max-w-sm mx-auto text-xs text-neutral-800 pt-2">
                      {data.sessions.map((sess, idx) => (
                        <div key={sess.id} className="p-3 bg-white/70 rounded-xl border border-amber-200/80">
                          <p className="font-serif font-bold text-sm text-amber-900">{sess.title}</p>
                          <p className="font-medium mt-0.5">{sess.date}</p>
                          <p className="text-neutral-600">{sess.startTime} - {sess.endTime} {sess.timeZone}</p>
                          <p className="font-medium text-neutral-900 mt-1">{sess.venueName}</p>
                          <p className="text-[11px] text-neutral-500">{sess.venueAddress}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-neutral-500 italic max-w-xs mx-auto">
                      Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TOM & JERRY 103 STICKER LABEL SHEET GENERATOR */
          <div className="space-y-6">
            {/* Label Controls (no-print) */}
            <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-neutral-800 p-5 border border-neutral-700 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Prefix Label
                </label>
                <input
                  type="text"
                  value={labelPrefix}
                  onChange={(e) => setLabelPrefix(e.target.value)}
                  className="w-full rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Suffix / Kota
                </label>
                <input
                  type="text"
                  value={labelSubtext}
                  onChange={(e) => setLabelSubtext(e.target.value)}
                  className="w-full rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={selectAll}
                  className="flex-1 rounded-xl bg-neutral-700 py-2 font-semibold hover:bg-neutral-600 transition"
                >
                  Pilih Semua ({guests.length})
                </button>
                <button
                  onClick={deselectAll}
                  className="flex-1 rounded-xl bg-neutral-700 py-2 font-semibold hover:bg-neutral-600 transition"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            {/* Tom & Jerry No. 103 Sticker Sheet (3 Columns x 4 Rows = 12 Labels per Sheet) */}
            <div className="printable-sheet bg-white text-neutral-900 p-6 md:p-8 rounded-2xl shadow-2xl mx-auto max-w-[850px]">
              <div className="no-print mb-4 flex items-center justify-between border-b pb-2 text-xs text-neutral-500">
                <span className="font-bold text-amber-800">
                  Format Tom & Jerry 103 (12 Stiker per Lembar: 3 Kolom × 4 Baris - Ukuran 32 × 64 mm)
                </span>
                <span>Terpilih: {selectedGuests.length} Tamu</span>
              </div>

              {/* 3x4 Grid matching Tom & Jerry 103 dimensions */}
              <div className="grid grid-cols-3 gap-3.5 md:gap-4">
                {selectedGuestObjects.map((guest, idx) => (
                  <div
                    key={guest.id}
                    className="relative flex flex-col justify-center items-center text-center p-3 h-28 md:h-32 border border-dashed border-neutral-300 rounded-lg bg-neutral-50/40"
                  >
                    <p className="text-[9px] md:text-[10px] text-neutral-500 font-sans leading-tight uppercase tracking-wider mb-1">
                      {labelPrefix}
                    </p>
                    <h4 className="font-serif font-bold text-xs md:text-sm text-neutral-900 capitalize px-1">
                      {guest.name}
                    </h4>
                    <p className="text-[9px] md:text-[10px] text-neutral-600 font-sans mt-0.5">
                      {guest.addressOrCity ? `di ${guest.addressOrCity}` : labelSubtext}
                    </p>
                  </div>
                ))}

                {/* Fill empty cells to complete standard 12 slots if fewer */}
                {Array.from({
                  length: Math.max(0, 12 - (selectedGuestObjects.length % 12 || 12)),
                }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex flex-col justify-center items-center text-center p-3 h-28 md:h-32 border border-dashed border-neutral-200 rounded-lg bg-neutral-50/20 text-neutral-300 text-[10px]"
                  >
                    <span>Slot Kosong</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
