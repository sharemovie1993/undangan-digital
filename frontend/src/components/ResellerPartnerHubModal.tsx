import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Coins,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  X,
  Plus,
  Loader2,
  Calendar,
  Key,
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  Building2,
  Save,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { resellerApi, ResellerAnalytics, ResellerBranding } from '../api/reseller.api';
import { useToast } from '../context/ToastContext';

interface ResellerPartnerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaTokens: number;
  onOpenPricing: () => void;
}

export const ResellerPartnerHubModal: React.FC<ResellerPartnerHubModalProps> = ({
  isOpen,
  onClose,
  quotaTokens,
  onOpenPricing
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profit' | 'branding' | 'ledger' | 'parser'>('profit');
  const [analytics, setAnalytics] = useState<ResellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Financial State
  const [sellingPrice, setSellingPrice] = useState<number>(() => {
    const saved = localStorage.getItem('absenta_reseller_selling_price');
    return saved ? parseInt(saved, 10) : 100000;
  });
  const [tokenCost, setTokenCost] = useState<number>(() => {
    const saved = localStorage.getItem('absenta_reseller_token_cost');
    return saved ? parseInt(saved, 10) : 45000;
  });

  // Branding State
  const [studioName, setStudioName] = useState<string>(() => {
    return localStorage.getItem('absenta_reseller_studio_name') || 'Luxe Studio Wedding';
  });
  const [studioPhone, setStudioPhone] = useState<string>(() => {
    return localStorage.getItem('absenta_reseller_studio_phone') || '';
  });
  const [studioWebsite, setStudioWebsite] = useState<string>(() => {
    return localStorage.getItem('absenta_reseller_studio_website') || '';
  });

  // WhatsApp Parser State
  const [rawText, setRawText] = useState<string>('');
  const [parsedGuests, setParsedGuests] = useState<string[]>([]);
  const [isCopiedParsed, setIsCopiedParsed] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await resellerApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.warn('Load reseller analytics error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSaveSellingPrice = (price: number) => {
    setSellingPrice(price);
    localStorage.setItem('absenta_reseller_selling_price', price.toString());
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('absenta_reseller_studio_name', studioName);
    localStorage.setItem('absenta_reseller_studio_phone', studioPhone);
    localStorage.setItem('absenta_reseller_studio_website', studioWebsite);
    showToast(
      'success',
      'Identitas Studio & White-Label berhasil disimpan!',
      'Branding Disimpan'
    );
  };

  // WhatsApp Parser logic
  const handleParseWhatsAppText = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsedGuests([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    const cleaned: string[] = [];

    for (let line of lines) {
      let trimmed = line.trim();
      // Remove leading bullets or numbers: "1.", "1)", "-", "*", "•", "1 - "
      trimmed = trimmed.replace(/^[\d]+[\.\)\-\s]+/, '').trim();
      trimmed = trimmed.replace(/^[\-\*\•\+]\s*/, '').trim();

      // Skip empty lines or header lines
      if (!trimmed || trimmed.toLowerCase().startsWith('daftar tamu') || trimmed.toLowerCase().startsWith('list tamu')) {
        continue;
      }
      if (trimmed.length > 1) {
        cleaned.push(trimmed);
      }
    }

    setParsedGuests(cleaned);
  };

  const handleCopyParsedList = () => {
    if (parsedGuests.length === 0) return;
    navigator.clipboard.writeText(parsedGuests.join('\n'));
    setIsCopiedParsed(true);
    showToast('success', `${parsedGuests.length} nama tamu berhasil disalin!`, 'Tersalin');
    setTimeout(() => setIsCopiedParsed(false), 2500);
  };

  // Calculation formulas
  const tokensUsed = analytics?.tokensUsed || 0;
  const netProfitPerUnit = Math.max(0, sellingPrice - tokenCost);
  const profitMarginPercent = tokenCost > 0 ? Math.round((netProfitPerUnit / tokenCost) * 100) : 0;
  const totalGrossRevenue = tokensUsed * sellingPrice;
  const totalNetProfit = tokensUsed * netProfitPerUnit;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#111116] border border-[#2a2a38] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[#20202b] bg-[#14141c] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white tracking-wide truncate">
                    Reseller Partner Hub & Profit Suite
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                    👑 MITRA BISNIS
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate">
                  Pusat kalkulasi laba bersih, kustomisasi studio branding, dan alat percepatan produksi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Horizontal Scroll on Mobile) */}
          <div className="px-4 sm:px-6 border-b border-[#20202b] bg-[#111116] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 py-2.5">
            {[
              { id: 'profit', label: '📊 Laba & Finansial', icon: DollarSign },
              { id: 'branding', label: '🏷️ White-Label Studio', icon: Building2 },
              { id: 'ledger', label: '📜 Buku Kas Token', icon: Coins },
              { id: 'parser', label: '⚡ WhatsApp List Parser', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* TAB 1: 📊 Laba & Finansial (Profit Calculator) */}
            {activeTab === 'profit' && (
              <div className="space-y-5">
                {/* 4 Analytics Highlight Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#151520] border border-amber-500/30 space-y-1">
                    <div className="text-[10px] sm:text-xs text-amber-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Total Laba Bersih</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-bold text-white">
                      Rp {totalNetProfit.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Margin Profit: <strong className="text-emerald-400">+{profitMarginPercent}%</strong>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14141c] border border-neutral-800 space-y-1">
                    <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                      <span>Estimasi Omzet Kotor</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-bold text-blue-400">
                      Rp {totalGrossRevenue.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Dari {tokensUsed} proyek aktif
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14141c] border border-neutral-800 space-y-1">
                    <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sisa Saldo Token</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-bold text-amber-300">
                      {quotaTokens} <span className="text-xs font-normal text-neutral-400">Token</span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenPricing}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      + Beli Token Lagi
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14141c] border border-neutral-800 space-y-1">
                    <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Total Undangan Dibuat</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-bold text-purple-400">
                      {analytics?.totalInvitations || 0} <span className="text-xs font-normal text-neutral-400">Proyek</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {tokensUsed} Lisensi Platinum
                    </div>
                  </div>
                </div>

                {/* Profit Calculator Setting Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-[#232330] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>🎯 Simulasi Harga Jual & Margin Keuntungan Anda</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Platform membebaskan Anda menentukan harga jual ke klien. Sesuaikan patokan harga di bawah:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Input Harga Jual Reseller */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-300">
                        Harga Jual yang Anda Kenakan ke Klien (per Undangan):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                          Rp
                        </span>
                        <input
                          type="number"
                          step="5000"
                          value={sellingPrice}
                          onChange={(e) => handleSaveSellingPrice(parseInt(e.target.value, 10) || 0)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-neutral-500">Pilihan Cepat:</span>
                        {[75000, 100000, 125000, 150000, 200000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSaveSellingPrice(preset)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition cursor-pointer ${
                              sellingPrice === preset
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Rp {preset / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Breakdown Modal Token & Margin */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Modal Beli Token (Est. Paket 10-50):</span>
                        <span className="font-mono text-neutral-200">Rp {tokenCost.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Harga Jual ke Klien:</span>
                        <span className="font-mono text-blue-400 font-bold">Rp {sellingPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="h-px bg-neutral-800 my-1" />
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span className="text-amber-400">Laba Bersih per Undangan:</span>
                        <span className="font-mono text-emerald-400">
                          Rp {netProfitPerUnit.toLocaleString('id-ID')} (+{profitMarginPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 🏷️ White-Label Studio Branding */}
            {activeTab === 'branding' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#14141c] border border-[#232330] space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Pengaturan Identitas Studio Reseller</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Kustomisasi nama studio Anda agar undangan klien menampilkan identitas brand Anda di footer.
                    </p>
                  </div>

                  <form onSubmit={handleSaveBranding} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Nama Studio / Brand:</label>
                      <input
                        type="text"
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="Contoh: Baraya Creative Studio"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Nomor WhatsApp Konsultasi:</label>
                        <input
                          type="text"
                          value={studioPhone}
                          onChange={(e) => setStudioPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Link Website / Instagram:</label>
                        <input
                          type="text"
                          value={studioWebsite}
                          onChange={(e) => setStudioWebsite(e.target.value)}
                          placeholder="Contoh: @baraya_wedding"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Footer Preview */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="text-[10px] text-neutral-500 font-semibold uppercase">Pratinjau Footer Undangan Klien:</div>
                      <div className="p-3 rounded-lg bg-[#0d0d12] border border-neutral-800 text-center text-xs text-neutral-400">
                        <span>Designed with ❤️ by </span>
                        <strong className="text-amber-400 font-serif">{studioName || 'Studio Anda'}</strong>
                        {studioPhone && (
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Konsultasi & Pemesanan: <span className="text-neutral-300 font-mono">{studioPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Branding Studio</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: 📜 Buku Kas Token (Token Usage Ledger) */}
            {activeTab === 'ledger' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Buku Kas & Riwayat Penggunaan Token</h3>
                    <p className="text-xs text-neutral-400">Daftar seluruh undangan klien yang telah diaktifkan dengan token:</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Total: <strong className="text-white">{analytics?.tokenLedger?.length || 0}</strong> Transaksi
                  </span>
                </div>

                {!analytics?.tokenLedger || analytics.tokenLedger.length === 0 ? (
                  <div className="p-8 text-center bg-[#14141c] rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                    Belum ada token yang digunakan. Undangan yang diaktifkan dengan token akan tercatat otomatis di sini.
                  </div>
                ) : (
                  <div className="bg-[#14141c] rounded-2xl border border-[#232330] overflow-hidden shadow">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-[#181824] text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Proyek Undangan</th>
                            <th className="py-3 px-4">Kode Lisensi</th>
                            <th className="py-3 px-4 text-center">Tamu</th>
                            <th className="py-3 px-4 text-center">RSVP</th>
                            <th className="py-3 px-4">Est. Omzet</th>
                            <th className="py-3 px-4">Laba Bersih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                          {analytics.tokenLedger.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-900/60 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white">{item.title}</div>
                                <div className="text-[10px] text-neutral-500 font-mono">/{item.slug}</div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                                {item.licenseKey}
                              </td>
                              <td className="py-3 px-4 text-center font-mono">{item.guestCount || 0}</td>
                              <td className="py-3 px-4 text-center font-mono">{item.rsvpCount || 0}</td>
                              <td className="py-3 px-4 font-mono text-blue-400">
                                Rp {sellingPrice.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                                Rp {netProfitPerUnit.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ⚡ WhatsApp Guest List Parser */}
            {activeTab === 'parser' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#14141c] border border-[#232330] space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Raw Text to Guest List Parser</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Tempel teks daftar tamu dari chat WA klien (meskipun ada nomor 1., 2., strip - atau bintang *), sistem akan otomatis membersihkannya:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Raw Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Tempel Teks Chat WhatsApp:</label>
                      <textarea
                        rows={8}
                        value={rawText}
                        onChange={(e) => handleParseWhatsAppText(e.target.value)}
                        placeholder="Contoh:&#10;1. Bpk. Joko Widodo & Kel&#10;2. Ibu Siti Aminah&#10;- Bpk. Haji Rahmat&#10;* dr. Irwan Pratama, Sp.A"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Cleaned Result Box */}
                    <div className="space-y-1.5 flex flex-col">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-300">
                          Hasil Bersih ({parsedGuests.length} Tamu):
                        </label>
                        {parsedGuests.length > 0 && (
                          <button
                            type="button"
                            onClick={handleCopyParsedList}
                            className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {isCopiedParsed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopiedParsed ? 'Tersalin!' : 'Salin Semua'}</span>
                          </button>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex-1 overflow-y-auto max-h-[190px] font-mono text-xs text-neutral-300 space-y-1">
                        {parsedGuests.length === 0 ? (
                          <span className="text-neutral-500 text-[11px]">Hasil daftar tamu yang sudah bersih akan tampil di sini...</span>
                        ) : (
                          parsedGuests.map((g, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-neutral-600 text-[10px]">{idx + 1}.</span>
                              <span>{g}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#20202b] bg-[#14141c] flex items-center justify-between text-xs text-neutral-400 shrink-0">
            <span className="text-[11px] truncate mr-2">
              💎 Saldo Anda: <strong className="text-amber-400 font-mono">{quotaTokens} Token</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
