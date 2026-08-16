import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, QrCode, Gift, Building2, MapPin, Sparkles, X } from 'lucide-react';
import { InvitationData, BankAccount } from '../types';
import { THEMES } from '../data/presets';

interface DigitalGiftSectionProps {
  data: InvitationData;
}

export const DigitalGiftSection: React.FC<DigitalGiftSectionProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [selectedQris, setSelectedQris] = useState<BankAccount | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    // Remove formatting spaces if any
    const clean = text.replace(/\s+/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyFullAddress = () => {
    if (!data.physicalGift) return;
    const fullText = `${data.physicalGift.recipientName}\n${data.physicalGift.phoneNumber}\n${data.physicalGift.fullAddress}, ${data.physicalGift.city} ${data.physicalGift.postalCode}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section id="gift-section" className="relative px-6 py-12 bg-gradient-to-b from-transparent via-amber-50/60 to-transparent">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-amber-800 font-semibold">
          DIGITAL GIFT & AMPLOP
        </span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          Send a Gift
        </h2>
        <p className="mt-2 text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui transfer atau kado berikut:
        </p>
        <div className="mx-auto mt-3 h-0.5 w-16 bg-amber-400/80 rounded-full" />
      </div>

      {/* Bank Account Cards (Image 3 design: Luxury metallic cards with bank badge, account number, holder, and copy button) */}
      <div className="space-y-4 max-w-md mx-auto">
        {data.bankAccounts.map((account, index) => {
          const isCopied = copiedId === account.id;

          // Distinct luxury card backgrounds
          const isDarkCard = index % 2 === 0;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-6 shadow-md border ${
                isDarkCard
                  ? 'bg-gradient-to-br from-[#0F1B2B] via-[#16273F] to-[#0A121D] text-white border-slate-700/50'
                  : 'bg-gradient-to-br from-[#B38728] via-[#C5A059] to-[#8C6D37] text-white border-amber-300/40'
              }`}
            >
              {/* Background ambient shine */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Card Header: Bank Name & Icon */}
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-widest uppercase">
                  {account.bankName}
                </span>
                <div className="flex items-center gap-2">
                  {account.qrisImageUrl && (
                    <button
                      onClick={() => setSelectedQris(account)}
                      className="flex items-center gap-1 text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition text-white"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS</span>
                    </button>
                  )}
                  <Building2 className="w-5 h-5 text-white/70" />
                </div>
              </div>

              {/* Account Number */}
              <div className="mt-4 mb-2">
                <p className="font-serif text-xl md:text-2xl font-bold tracking-wider">
                  {account.accountNumber}
                </p>
                <p className="font-display text-[10px] tracking-widest text-white/80 uppercase mt-0.5">
                  A.N {account.accountHolder}
                </p>
              </div>

              {/* Salin No. Rekening Button */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-[10px] text-white/70">
                  {isCopied ? 'Tersalin ke clipboard!' : 'Klik tombol untuk menyalin'}
                </span>
                <button
                  id={`copy-bank-${account.id}`}
                  onClick={() => copyToClipboard(account.accountNumber, account.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isCopied
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin No. Rekening</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Physical Gift Delivery Address */}
        {data.physicalGift && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base mb-2">
              <Gift className="w-4 h-4 text-amber-700" />
              <span>Kirim Kado Fisik</span>
            </div>
            <div className="text-xs text-neutral-700 space-y-1">
              <p className="font-semibold text-neutral-900">{data.physicalGift.recipientName}</p>
              <p>{data.physicalGift.phoneNumber}</p>
              <p className="text-neutral-600 leading-relaxed">
                {data.physicalGift.fullAddress}, {data.physicalGift.city} {data.physicalGift.postalCode}
              </p>
            </div>
            <button
              onClick={copyFullAddress}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAddress ? 'Alamat Berhasil Disalin!' : 'Salin Alamat Lengkap'}</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* QRIS Modal */}
      <AnimatePresence>
        {selectedQris && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setSelectedQris(null)}
          >
            <div
              className="relative w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedQris(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-neutral-900">QRIS Payment</h3>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block mb-3">
                <img
                  src={selectedQris.qrisImageUrl}
                  alt="QRIS Code"
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>

              <p className="font-semibold text-xs text-neutral-800">{selectedQris.accountHolder}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Scan dengan BCA, GoPay, OVO, ShopeePay, DANA</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
