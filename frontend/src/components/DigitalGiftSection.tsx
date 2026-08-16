import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, QrCode, Gift, Building2, MapPin, Sparkles, X, Phone, ExternalLink } from 'lucide-react';
import { InvitationData, BankAccount, PhysicalGiftAddress } from '../types';
import { FONT_PRESETS, THEMES } from '../data/presets';
import { themeRegistry } from '../themes/registry';

interface DigitalGiftSectionProps {
  data: InvitationData;
  theme?: any;
}

export const DigitalGiftSection: React.FC<DigitalGiftSectionProps> = ({ data, theme: themeProp }) => {
  const defaultTheme = themeRegistry.getTheme(data.theme) || THEMES[data.theme] || THEMES.champagne_gold;
  const theme = themeProp || defaultTheme;
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const activeBg = data.themeConfig?.bgColor || theme.bg || '#0a0a0b';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';
  const headingFont =
    FONT_PRESETS[data.themeConfig?.fontPairingId || 'royal_serif']?.headingFamily || 'serif';

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [selectedQris, setSelectedQris] = useState<BankAccount | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    const clean = text.replace(/\s+/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const physicalGift: PhysicalGiftAddress | undefined = data.physicalGift || (
    data.physicalGiftAddress ? {
      recipientName: data.eventTitle || 'Penerima Kado',
      phoneNumber: '',
      fullAddress: typeof data.physicalGiftAddress === 'string' ? data.physicalGiftAddress : '',
      city: '',
      postalCode: '',
    } : undefined
  );

  const copyFullAddress = () => {
    if (!physicalGift) return;
    const parts = [
      physicalGift.recipientName,
      physicalGift.phoneNumber,
      `${physicalGift.fullAddress}${physicalGift.city ? `, ${physicalGift.city}` : ''}${physicalGift.postalCode ? ` ${physicalGift.postalCode}` : ''}`,
      physicalGift.notes ? `Catatan Kurir: ${physicalGift.notes}` : ''
    ].filter(Boolean);

    navigator.clipboard.writeText(parts.join('\n'));
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section
      id="gift-section"
      className="relative px-5 py-12"
      style={{
        backgroundColor: activeBg,
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ color: activePrimary }}
        >
          DIGITAL GIFT & AMPLOP
        </span>
        <h2
          className="text-2xl sm:text-3xl font-bold mt-1"
          style={{ fontFamily: headingFont, color: theme.textMain }}
        >
          Tanda Kasih & Amplop Digital
        </h2>
        <p className="mt-2 text-xs max-w-xs mx-auto leading-relaxed" style={{ color: theme.textMuted }}>
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui transfer atau kado berikut:
        </p>
        <div
          className="mx-auto mt-3 h-0.5 w-16 rounded-full"
          style={{ backgroundColor: activePrimary }}
        />
      </div>

      {/* Bank Account & Gift Cards Container */}
      <div className="space-y-4 max-w-md mx-auto">
        {data.bankAccounts?.map((account, index) => {
          const isCopied = copiedId === account.id;
          const isDarkCard = index % 2 === 0;

          return (
            <motion.div
              key={account.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-xl border"
              style={{
                background: isDarkCard
                  ? `linear-gradient(135deg, ${cardBg} 0%, ${theme.accentBg || cardBg} 100%)`
                  : `linear-gradient(135deg, ${activePrimary}20 0%, ${cardBg} 100%)`,
                borderColor: `${activePrimary}40`,
              }}
            >
              {/* Background ambient shine */}
              <div
                className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: activePrimary }}
              />

              {/* Card Header: Bank Name & Icon */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs sm:text-sm font-bold tracking-widest uppercase font-mono"
                  style={{ color: activePrimary }}
                >
                  {account.bankName}
                </span>
                <div className="flex items-center gap-2">
                  {account.qrisImageUrl && (
                    <button
                      onClick={() => setSelectedQris(account)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition border cursor-pointer"
                      style={{
                        backgroundColor: `${activePrimary}20`,
                        borderColor: `${activePrimary}40`,
                        color: theme.textMain,
                      }}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS</span>
                    </button>
                  )}
                  <Building2 className="w-5 h-5 opacity-70" style={{ color: theme.textMain }} />
                </div>
              </div>

              {/* Account Number */}
              <div className="mt-4 mb-3">
                <p className="text-xl sm:text-2xl font-bold tracking-wider font-mono" style={{ color: theme.textMain }}>
                  {account.accountNumber}
                </p>
                <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: theme.textMuted }}>
                  A.N {account.accountHolder}
                </p>
              </div>

              {/* Salin No. Rekening Button */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[10px] text-neutral-400">
                  {isCopied ? 'Tersalin ke clipboard!' : 'Klik tombol untuk menyalin'}
                </span>
                <button
                  id={`copy-bank-${account.id || index}`}
                  onClick={() => copyToClipboard(account.accountNumber, account.id || `acc-${index}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  style={{
                    backgroundColor: isCopied ? '#10b981' : activePrimary,
                    color: '#0a0a0b',
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Tersalin!</span>
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

        {/* Physical Gift Delivery Address (100% Theme-Aware & Fully Integrated) */}
        {physicalGift && (physicalGift.fullAddress || physicalGift.recipientName) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden"
            style={{
              backgroundColor: `${cardBg}f5`,
              borderColor: `${activePrimary}40`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <Gift className="w-5 h-5" style={{ color: activePrimary }} />
                <span className="text-white" style={{ fontFamily: headingFont }}>
                  Kirim Kado Fisik
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase"
                style={{
                  backgroundColor: `${activePrimary}15`,
                  borderColor: `${activePrimary}40`,
                  color: activePrimary,
                }}>
                Alamat Kirim
              </span>
            </div>

            <div className="text-xs text-neutral-300 space-y-1.5 bg-black/40 p-3.5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">{physicalGift.recipientName || 'Penerima Kado'}</p>
                {physicalGift.phoneNumber && (
                  <a
                    href={`https://wa.me/${physicalGift.phoneNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{physicalGift.phoneNumber}</span>
                  </a>
                )}
              </div>

              <p className="text-neutral-300 leading-relaxed pt-1">
                {physicalGift.fullAddress}
                {physicalGift.city ? `, ${physicalGift.city}` : ''}
                {physicalGift.postalCode ? ` ${physicalGift.postalCode}` : ''}
              </p>

              {physicalGift.notes && (
                <p className="text-amber-300/90 text-[11px] italic pt-1 border-t border-white/5">
                  📍 Catatan: {physicalGift.notes}
                </p>
              )}
            </div>

            {/* Action Buttons: Copy Address & Google Maps */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={copyFullAddress}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
                style={{
                  backgroundColor: copiedAddress ? '#10b981' : `${activePrimary}25`,
                  borderColor: copiedAddress ? '#10b981' : `${activePrimary}50`,
                  color: copiedAddress ? '#ffffff' : activePrimary,
                }}
              >
                {copiedAddress ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAddress ? 'Alamat Berhasil Disalin!' : 'Salin Alamat Lengkap'}</span>
              </button>

              {physicalGift.mapsUrl && (
                <a
                  href={physicalGift.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border-neutral-700 transition cursor-pointer"
                  title="Buka Alamat di Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden xs:inline">Maps</span>
                </a>
              )}
            </div>
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
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setSelectedQris(null)}
          >
            <div
              className="relative w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl border"
              style={{
                backgroundColor: cardBg,
                borderColor: `${activePrimary}50`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedQris(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-3">
                <QrCode className="w-5 h-5" style={{ color: activePrimary }} />
                <span className="font-bold text-sm text-white">QRIS {selectedQris.bankName}</span>
              </div>

              <div className="mx-auto rounded-2xl bg-white p-3 shadow-inner max-w-[200px] border border-neutral-300">
                <img
                  src={selectedQris.qrisImageUrl}
                  alt={`QRIS ${selectedQris.bankName}`}
                  className="h-auto w-full object-contain"
                />
              </div>

              <p className="mt-3 text-[11px] text-neutral-400">
                A.N <span className="font-bold text-white">{selectedQris.accountHolder}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
