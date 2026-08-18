import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Check,
  CheckCircle2,
  X,
  ShieldCheck,
  QrCode,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CreditCard,
  Building,
  Smartphone,
  Store,
  Crown,
  Key
} from 'lucide-react';
import { api } from '../api/client';
import { queryKeys, queryClient, invalidateLicenseFlow } from '../query/queryClient';
import { PLANS_CONFIG, getPlanDetails } from '../constants/plans';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationTitle: string;
  invitationId?: string;
  onSuccess: (licenseKey: string) => void;
  currentUser?: any;
  standbyOrders?: any[];
  currentInvitationPlan?: string;
  onUseStandbyLicense?: (order: any) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  invitationTitle,
  invitationId,
  onSuccess,
  currentUser: propUser,
  standbyOrders = [],
  currentInvitationPlan,
  onUseStandbyLicense
}) => {
  const userJson = localStorage.getItem('absenta_auth_user');
  const loggedUser = propUser || (userJson ? (() => { try { return JSON.parse(userJson); } catch { return null; } })() : null);
  const isResellerUser = ['RESELLER', 'PERCETAKAN', 'ADMIN'].includes((loggedUser?.role || '').toUpperCase());

  const [step, setStep] = useState<'plan' | 'channel'>('plan');
  const [pricingCategory, setPricingCategory] = useState<'single' | 'bulk'>(() => {
    return isResellerUser ? 'bulk' : 'single';
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (isResellerUser) return 'UND-RESELLER';
    if (currentInvitationPlan?.toUpperCase().includes('BASIC')) return 'UND-PLATINUM';
    return 'UND-GOLD';
  });
  const [selectedChannel, setSelectedChannel] = useState<string>('QRIS2');

  const [customerName, setCustomerName] = useState<string>(() => {
    return loggedUser?.name || invitationTitle || '';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return (loggedUser?.phone || '').replace(/^\+62/, '0');
  });
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedVA, setCopiedVA] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOrderError(null);
      if (loggedUser?.name) {
        setCustomerName(loggedUser.name);
      } else if (invitationTitle) {
        setCustomerName(invitationTitle);
      }

      if (loggedUser?.phone) {
        setCustomerPhone(loggedUser.phone.replace(/^\+62/, '0'));
      }
    }
  }, [isOpen, invitationTitle]);

  // Fetch Packages Realtime from Server Lisensi
  const { data: packagesData, isLoading: isLoadingPackages, error: packagesError } = useQuery({
    queryKey: queryKeys.packages.list,
    queryFn: async () => {
      const res = await api.getPackages();
      return res.data || [];
    },
    enabled: isOpen
  });

  // Fetch Payment Channels Realtime dari Server Lisensi (Tripay)
  const { data: channelsData } = useQuery({
    queryKey: queryKeys.orders.channels,
    queryFn: async () => {
      const res = await api.getPaymentChannels();
      return res.data || [];
    },
    enabled: isOpen
  });

  const [isManualChecking, setIsManualChecking] = useState(false);

  // Polling Invoice Payment Status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: queryKeys.orders.status(activeInvoice?.invoice_number || ''),
    queryFn: async () => {
      if (!activeInvoice?.invoice_number) return null;
      const res = await api.checkOrderStatus(activeInvoice.invoice_number);
      return res.data;
    },
    enabled: !!activeInvoice?.invoice_number && activeInvoice?.status !== 'paid',
    refetchInterval: (query) => {
      const rawStatus = (query.state.data?.status || '').toLowerCase();
      return (rawStatus === 'paid' || rawStatus === 'success') ? false : 2500;
    }
  });

  useEffect(() => {
    const rawStatus = (statusData?.status || '').toLowerCase();
    const isPaid = rawStatus === 'paid' || rawStatus === 'success' || statusData?.is_active === true || statusData?.is_active === 1;

    if (isPaid) {
      const finalKey = statusData.license_key || activeInvoice?.license_key || 'UND-ACTIVE';
      setActiveInvoice((prev: any) => ({
        ...prev,
        status: 'paid',
        license_key: finalKey
      }));
      // Refresh semua query terkait proyek, profil token, dan riwayat pesanan
      invalidateLicenseFlow(queryClient);
      if (invitationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invitations.detail(invitationId) });
      }
    }
  }, [statusData]);

  const handleManualCheck = async () => {
    if (!activeInvoice?.invoice_number) return;
    setIsManualChecking(true);
    try {
      const res = await api.checkOrderStatus(activeInvoice.invoice_number);
      const rawStatus = (res.data?.status || '').toLowerCase();
      if (rawStatus === 'paid' || rawStatus === 'success' || res.data?.is_active) {
        const finalKey = res.data.license_key || activeInvoice?.license_key || 'UND-ACTIVE';
        setActiveInvoice((prev: any) => ({ ...prev, status: 'paid', license_key: finalKey }));
        // Refresh semua query terkait proyek, profil token, dan riwayat pesanan
        invalidateLicenseFlow(queryClient);
        if (invitationId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.invitations.detail(invitationId) });
        }
      } else {
        await refetchStatus();
      }
    } catch (e) {
      console.warn('Manual check error:', e);
    } finally {
      setIsManualChecking(false);
    }
  };

  // Mutation Create Tripay Invoice
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      setOrderError(null);
      return await api.createOrder({
        invitationId: invitationId || 'inv-preview-123',
        planId: selectedPlanId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod: selectedChannel || 'QRIS2'
      });
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        const d = res.data;
        const pData = d.payment_data || {};
        setActiveInvoice({
          ...d,
          ...pData,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          payment_method: selectedChannel || pData.payment_method || 'QRIS2'
        });
      } else {
        setOrderError(res.message || 'Gagal membuat transaksi ke Server Lisensi.');
      }
    },
    onError: (err: any) => {
      console.error('Create order error:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menghubungi server pembayaran.';
      setOrderError(msg);
    }
  });

  const selectedPlan = (packagesData || []).find((p: any) => p.id === selectedPlanId) || packagesData?.[0];

  // Group channels by category
  const channelList: any[] = channelsData || [];
  const qrisChannels = channelList.filter(c => c.group === 'E-Wallet' || c.code?.includes('QRIS'));
  const vaChannels = channelList.filter(c => c.group === 'Virtual Account' || c.code?.endsWith('VA'));
  const retailChannels = channelList.filter(c => c.group === 'Convenience Store' || c.code === 'ALFAMART' || c.code === 'INDOMARET');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col max-h-[92vh] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-neutral-400 hover:text-white p-1.5 sm:p-2 rounded-full bg-neutral-800/80 cursor-pointer z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {!activeInvoice ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="text-center mb-4 sm:mb-5 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#c4a661]/15 border border-[#c4a661]/30 text-[#c4a661] text-[10px] sm:text-xs font-semibold mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>SERVER LISENSI RESMI ABSENTA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {step === 'plan'
                  ? (isResellerUser ? 'Top-Up Saldo Token Reseller' : 'Pilih Paket Lisensi Undangan')
                  : 'Pilih Metode Pembayaran'}
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                {step === 'plan'
                  ? (isResellerUser
                      ? 'Beli kuota aktivasi instan untuk mengaktifkan undangan klien Anda (Rp 45.000 / undangan)'
                      : 'Aktifkan seluruh tema luxury, musik & hapus watermark resmi')
                  : `Paket: ${selectedPlan?.name || selectedPlanId} (Rp ${(selectedPlan?.priceOnetime || selectedPlan?.priceMonthly || 0).toLocaleString('id-ID')})`}
              </p>
            </div>

            {step === 'plan' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {standbyOrders && standbyOrders.length > 0 && (
                  <div className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-transparent border border-[#c4a661]/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shrink-0 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] text-neutral-950 flex items-center justify-center font-bold text-sm shrink-0 shadow">
                        <Key className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>💡 Anda Memiliki {standbyOrders.length} Lisensi Standby ({standbyOrders[0]?.planName || 'Paket Platinum'})</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#c4a661] mt-0.5">
                          Key: {standbyOrders[0]?.licenseKey}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Lisensi siap dipasangkan tanpa biaya tambahan, atau pilih paket di bawah untuk acara baru.
                        </div>
                      </div>
                    </div>

                    {onUseStandbyLicense && (
                      <button
                        type="button"
                        onClick={() => onUseStandbyLicense(standbyOrders[0])}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-neutral-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        ⚡ Pasang ke Undangan Ini
                      </button>
                    )}
                  </div>
                )}

                {(() => {
                  const tokenCount = loggedUser?.quotaTokens || 0;
                  if (tokenCount <= 0) return null;

                  return (
                    <div className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#c4a661]/25 via-[#c4a661]/15 to-transparent border border-[#c4a661]/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shrink-0">
                      <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
                        <div className="w-9 h-9 rounded-xl bg-[#c4a661] text-neutral-950 flex items-center justify-center font-bold text-sm shrink-0 shadow">
                          💎
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Saldo Token Akun Anda:</span>
                            <span className="text-[#c4a661] font-mono font-bold text-sm bg-neutral-950 px-2 py-0.5 rounded-lg border border-[#c4a661]/40">
                              {tokenCount} Token
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            Terhubung ke Akun: <span className="text-emerald-400 font-semibold">{loggedUser?.phone || loggedUser?.name}</span>
                          </div>
                        </div>
                      </div>

                      {invitationId && invitationId !== 'inv-preview-123' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await api.activateWithToken(invitationId);
                              if (res.success && res.data?.licenseKey) {
                                const updatedUser = { ...loggedUser, quotaTokens: res.data.remainingTokens };
                                localStorage.setItem('absenta_auth_user', JSON.stringify(updatedUser));
                                queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
                                queryClient.invalidateQueries({ queryKey: ['auth-me-profile'] });
                                onSuccess(res.data.licenseKey);
                                onClose();
                              }
                            } catch (err: any) {
                              setOrderError('Gagal aktivasi token: ' + err.message);
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#c4a661] hover:bg-[#d5b874] text-neutral-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          ⚡ Gunakan 1 Token Sekarang
                        </button>
                      )}
                    </div>
                  );
                })()}

                {orderError && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                    <span>⚠️ {orderError}</span>
                    <button type="button" onClick={() => setOrderError(null)} className="text-rose-400 font-bold ml-2">✕</button>
                  </div>
                )}

                {/* 🎴 DUAL-MODE SEGMENT SWITCHER (Satuan 1 Acara vs Grosir Saldo Token) */}
                <div className="flex p-1 bg-neutral-900/90 rounded-2xl border border-neutral-800 shrink-0 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPricingCategory('single');
                      if (selectedPlanId.includes('RESELLER')) {
                        setSelectedPlanId('UND-GOLD');
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      pricingCategory === 'single'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>💍 Paket Satuan (1 Acara)</span>
                    <span className="text-[10px] opacity-75 font-normal hidden sm:inline">• Personal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPricingCategory('bulk');
                      if (!selectedPlanId.includes('RESELLER')) {
                        setSelectedPlanId('UND-RESELLER');
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      pricingCategory === 'bulk'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>💎 Grosir Saldo Token</span>
                    <span className="text-[10px] opacity-75 font-normal hidden sm:inline">• Reseller & Percetakan</span>
                  </button>
                </div>

                {/* Reseller Value Callout in Bulk Mode */}
                {pricingCategory === 'bulk' && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Keuntungan Mitra:</strong> Setiap token otomatis mengaktifkan fitur <strong>PLATINUM LENGKAP</strong> (Print Kit 300 DPI + Aktif Selamanya). Saldo token tidak pernah hangus & Anda bebas menentukan tarif ke klien!
                    </span>
                  </div>
                )}

                {/* Plan Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 pt-1 pb-3 scrollbar-thin flex-1">
                  {(pricingCategory === 'single'
                    ? [
                        {
                          id: 'UND-BASIC',
                          name: 'Paket Hemat (Khitan & Ultah)',
                          badge: 'Hemat 🔥',
                          badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
                          price: 49000,
                          features: [
                            'Bebas Watermark Resmi',
                            '1 Acara Aktif (Khitan / Aqiqah / Ultah)',
                            'Musik Latar & Galeri Foto',
                            'Buku Tamu & Ucapan Doa Online',
                            'Amplop Digital (Rekening Bank)',
                            'Masa Aktif 3 Bulan'
                          ]
                        },
                        {
                          id: 'UND-GOLD',
                          name: 'Paket Wedding Gold (All Features)',
                          badge: 'Populer ⭐',
                          badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold',
                          price: 89000,
                          features: [
                            'Bebas Watermark & Semua Tema Mewah',
                            'Galeri Foto Unlimited & Kisah Cinta',
                            'Musik Latar Eksklusif (Player Melayang)',
                            'Buku Tamu & RSVP Realtime',
                            'Amplop Digital + QRIS Donasi',
                            'Peta Lokasi Google Maps Presisi',
                            'Masa Aktif 1 Tahun Penuh'
                          ]
                        },
                        {
                          id: 'UND-PLATINUM',
                          name: 'Paket Platinum + Siap Cetak',
                          badge: 'Lengkap + Cetak 🖨️',
                          badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
                          price: 149000,
                          features: [
                            'Semua Fitur Paket Gold Termasuk',
                            'Masa Aktif Selamanya (Tanpa Batas)',
                            'File Undangan Siap Cetak HD (A5 & 4R)',
                            'Cetak Label Nama Tamu (Tom & Jerry 103)',
                            'Kartu Souvenir & Voucher Siap Print',
                            'QR Scanner Check-in Tamu Resepsi',
                            'WhatsApp Broadcast Generator'
                          ]
                        }
                      ]
                    : [
                        {
                          id: 'UND-RESELLER-5',
                          name: 'Starter Reseller (5 Token)',
                          badge: 'Starter 🥉',
                          badgeClass: 'bg-neutral-800 text-amber-300 border border-amber-500/40',
                          price: 225000,
                          tokens: 5,
                          unitPrice: 45000,
                          profitEstimate: 'Potensi Laba ~Rp 275.000',
                          features: [
                            '5 Token Saldo Permanen (Tidak Hangus)',
                            'Modal Rp 45.000 / Undangan',
                            'Fitur Platinum Lengkap di Semua Proyek',
                            'Unduh Print Kit 300 DPI Sepuasnya',
                            'White-Label Studio & Bebas Watermark'
                          ]
                        },
                        {
                          id: 'UND-RESELLER',
                          name: 'Business Reseller (10 Token)',
                          badge: 'Paling Populer 🥈',
                          badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold',
                          price: 450000,
                          tokens: 10,
                          unitPrice: 45000,
                          profitEstimate: 'Potensi Laba ~Rp 550.000',
                          features: [
                            '10 Token Saldo Permanen (Tidak Hangus)',
                            'Modal Rp 45.000 / Undangan',
                            'Fitur Platinum Lengkap di Semua Proyek',
                            'Unduh Print Kit HD Sepuasnya',
                            'White-Label Studio & Bebas Watermark'
                          ]
                        },
                        {
                          id: 'UND-RESELLER-25',
                          name: 'Pro Reseller (25 Token)',
                          badge: 'Hemat 22% 🥇',
                          badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
                          price: 875000,
                          tokens: 25,
                          unitPrice: 35000,
                          profitEstimate: 'Potensi Laba ~Rp 1.625.000',
                          features: [
                            '25 Token Saldo Permanen (Tidak Hangus)',
                            'Modal Super Hemat: Rp 35.000 / Acara',
                            'Fitur Platinum Lengkap di Semua Proyek',
                            'Unduh Print Kit HD 300 DPI Sepuasnya',
                            'Bebas Watermark & Prioritas Render'
                          ]
                        },
                        {
                          id: 'UND-RESELLER-50',
                          name: 'Vendor & Percetakan (50 Token)',
                          badge: 'Super Hemat 44% 👑',
                          badgeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold',
                          price: 1250000,
                          tokens: 50,
                          unitPrice: 25000,
                          profitEstimate: 'Potensi Laba ~Rp 3.750.000',
                          features: [
                            '50 Token Saldo Permanen (Tidak Hangus)',
                            'Modal Grosir: Rp 25.000 / Acara',
                            'Fitur Platinum Lengkap di Semua Proyek',
                            'Unduh Print Kit HD Sepuasnya',
                            'Akses Vendor Prioritas & VIP Support'
                          ]
                        }
                      ]
                  ).map((pkg: any) => {
                    const isSelected = selectedPlanId === pkg.id;
                    const planIdUpper = (pkg.id || '').toUpperCase();

                    let badgeText = pkg.badge;
                    let badgeClass = pkg.badgeClass;

                    // Dynamic badge jika membuka modal dari undangan yang sudah berlisensi
                    if (currentInvitationPlan && pricingCategory === 'single') {
                      const curUpper = currentInvitationPlan.toUpperCase();
                      if (
                        pkg.id === currentInvitationPlan ||
                        (curUpper.includes('BASIC') && planIdUpper.includes('BASIC')) ||
                        (curUpper.includes('GOLD') && planIdUpper.includes('GOLD')) ||
                        (curUpper.includes('PLATINUM') && planIdUpper.includes('PLATINUM'))
                      ) {
                        badgeText = '✓ Paket Anda';
                        badgeClass = 'bg-neutral-800 text-emerald-400 border border-emerald-500/50';
                      } else if (planIdUpper.includes('PLATINUM') && (curUpper.includes('BASIC') || curUpper.includes('GOLD'))) {
                        badgeText = '🚀 Upgrade (+ Print Kit)';
                        badgeClass = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold animate-pulse';
                      }
                    }

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPlanId(pkg.id)}
                        className={`relative rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#c4a661] bg-[#c4a661]/15 shadow-[0_0_25px_rgba(196,166,97,0.2)] ring-1 ring-[#c4a661]'
                            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                        }`}
                      >
                        {badgeText && (
                          <div className={`absolute top-3.5 right-3.5 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider ${badgeClass}`}>
                            {badgeText}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 pr-24">
                            <Crown className="w-4 h-4 text-[#c4a661] shrink-0" />
                            <h3 className="font-bold text-sm text-white leading-tight">{pkg.name}</h3>
                          </div>
                          <div className="text-lg font-serif font-bold text-[#c4a661] mb-1">
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </div>

                          {pkg.unitPrice && (
                            <div className="text-[10px] text-emerald-400 font-semibold mb-2 flex items-center justify-between">
                              <span>Modal: Rp {pkg.unitPrice.toLocaleString('id-ID')}/acara</span>
                              {pkg.profitEstimate && <span className="text-amber-300 font-mono text-[9px]">{pkg.profitEstimate}</span>}
                            </div>
                          )}

                          <ul className="space-y-1.5 text-[11px] text-neutral-300 mt-2">
                            {pkg.features.map((feat: string, idx: number) => {
                              const isHighlight = feat.toLowerCase().includes('watermark') || feat.toLowerCase().includes('selamanya') || feat.toLowerCase().includes('modal');
                              return (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isHighlight ? 'text-emerald-400' : 'text-[#c4a661]'}`} />
                                  <span className={`leading-tight ${isHighlight ? 'text-white font-medium' : ''}`}>{feat}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-bold">
                          <span className={isSelected ? 'text-[#c4a661]' : 'text-neutral-400'}>
                            {isSelected ? '✓ Paket Terpilih' : 'Klik untuk Memilih'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sticky Bottom Action */}
                <div className="pt-3 mt-2 border-t border-neutral-800 flex items-center justify-between shrink-0 bg-[#111115]">
                  <div className="text-[11px] text-neutral-400 hidden sm:block">
                    Terpilih: <span className="font-bold text-white">{selectedPlan?.name || selectedPlanId}</span>
                  </div>
                  <button
                    onClick={() => setStep('channel')}
                    disabled={!selectedPlanId}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PILIH METODE / CHANNEL PEMBAYARAN */}
            {step === 'channel' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Form Data Pelanggan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800 mb-3 shrink-0">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Nama Pemesan</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c4a661]"
                      placeholder="Nama Lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Nomor WhatsApp (Kirim Lisensi)</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c4a661]"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                {/* List Channel Pembayaran (Responsive Grid) */}
                <div className="space-y-3 overflow-y-auto pr-1 pb-2 scrollbar-thin flex-1">
                  {/* Category: E-Wallet / QRIS */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#c4a661] mb-2">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>QRIS & Dompet Digital (Instan)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {(qrisChannels.length > 0 ? qrisChannels : [{ code: 'QRIS2', name: 'QRIS Realtime (Semua E-Wallet)' }]).map((c: any) => (
                        <div
                          key={c.code}
                          onClick={() => setSelectedChannel(c.code)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                            selectedChannel === c.code
                              ? 'border-[#c4a661] bg-[#c4a661]/15 text-white shadow-xs'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-[#c4a661] shrink-0" />
                          <div className="text-[11px] font-medium leading-tight truncate">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: Virtual Account */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#c4a661] mb-2">
                      <Building className="w-3.5 h-3.5" />
                      <span>Virtual Account Bank (Otomatis)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {(vaChannels.length > 0 ? vaChannels : [
                        { code: 'BCAVA', name: 'BCA Virtual Account' },
                        { code: 'BRIVA', name: 'BRI Virtual Account' },
                        { code: 'MANDIRIVA', name: 'Mandiri Virtual Account' },
                        { code: 'BNIVA', name: 'BNI Virtual Account' },
                        { code: 'PERMATAVA', name: 'Permata Virtual Account' }
                      ]).map((c: any) => (
                        <div
                          key={c.code}
                          onClick={() => setSelectedChannel(c.code)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                            selectedChannel === c.code
                              ? 'border-[#c4a661] bg-[#c4a661]/15 text-white shadow-xs'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-[#c4a661] shrink-0" />
                          <div className="text-[11px] font-medium leading-tight truncate">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: Convenience Store */}
                  {retailChannels.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#c4a661] mb-2">
                        <Store className="w-3.5 h-3.5" />
                        <span>Gerai Retail</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {retailChannels.map((c: any) => (
                          <div
                            key={c.code}
                            onClick={() => setSelectedChannel(c.code)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                              selectedChannel === c.code
                                ? 'border-[#c4a661] bg-[#c4a661]/15 text-white shadow-xs'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <Store className="w-4 h-4 text-[#c4a661] shrink-0" />
                            <div className="text-[11px] font-medium leading-tight truncate">{c.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Price & Fee Breakdown Bar */}
                {(() => {
                  const basePrice = selectedPlan?.priceOnetime || selectedPlan?.priceMonthly || selectedPlan?.price_onetime || selectedPlan?.price_monthly || 49000;
                  const currentChannelObj = (channelList || []).find((c: any) => c.code === selectedChannel);

                  // Ikuti pola Absenta: fee_flat + fee_percent (top-level langsung di channel object)
                  // Fallback ke nested total_fee / fee_customer jika format berbeda
                  let feeFlat = 0;
                  let feePercent = 0;

                  if (currentChannelObj) {
                    if (typeof currentChannelObj.fee_flat !== 'undefined') {
                      feeFlat = Number(currentChannelObj.fee_flat) || 0;
                      feePercent = Number(currentChannelObj.fee_percent) || 0;
                    } else if (currentChannelObj.fee_customer) {
                      feeFlat = Number(currentChannelObj.fee_customer.flat) || 0;
                      feePercent = Number(currentChannelObj.fee_customer.percent) || 0;
                    } else if (currentChannelObj.total_fee) {
                      feeFlat = Number(currentChannelObj.total_fee.flat) || 0;
                      feePercent = Number(currentChannelObj.total_fee.percent) || 0;
                    }
                  }

                  const feeAmount = Math.round(feeFlat + (basePrice * feePercent / 100));
                  const totalEstimate = basePrice + feeAmount;

                  return (
                    <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-1.5 shrink-0">
                      <div className="flex justify-between text-neutral-400">
                        <span>Harga Paket:</span>
                        <span className="font-mono text-white">Rp {basePrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>
                          Biaya Transaksi
                          {feePercent > 0 && ` (${feePercent}%${feeFlat > 0 ? ` + Rp ${feeFlat.toLocaleString('id-ID')}` : ''})`}
                          {feePercent === 0 && feeFlat > 0 && ` (Flat)`}
                          :
                        </span>
                        <span className="font-mono text-amber-400">
                          {feeAmount > 0 ? `+ Rp ${feeAmount.toLocaleString('id-ID')}` : 'Gratis'}
                        </span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-1.5 border-t border-neutral-800 text-xs sm:text-sm">
                        <span>Total Dibayarkan:</span>
                        <span className="font-mono text-[#c4a661] text-sm">Rp {totalEstimate.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Sticky Navigation Action Bar */}
                <div className="pt-2 mt-1 border-t border-neutral-800 flex items-center justify-between shrink-0 bg-[#111115] gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('plan')}
                    className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Ganti Paket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => createOrderMutation.mutate()}
                    disabled={createOrderMutation.isPending || !customerName.trim() || !customerPhone.trim()}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Membuat Tagihan Tripay...</span>
                      </>
                    ) : (
                      <>
                        <span>Bayar Sekarang ({channelList.find((c: any) => c.code === selectedChannel)?.name || selectedChannel})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeInvoice.status === 'paid' ? (
          /* STEP 4: CELEBRATORY PAYMENT SUCCESS SCREEN */
          <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 my-auto space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)] mx-auto">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#c4a661] to-[#8a7238] p-1.5 rounded-full text-neutral-950 shadow-md">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pembayaran Terverifikasi Lunas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Transaksi Berhasil!
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {(activeInvoice.plan_name || selectedPlan?.name || '').toLowerCase().includes('reseller') ? (
                  <>Selamat! Kuota <span className="text-[#c4a661] font-bold">10 Token Reseller</span> telah aktif di akun Anda dan siap digunakan untuk mengaktifkan proyek undangan.</>
                ) : (
                  <>Lisensi resmi telah aktif untuk undangan <span className="text-[#c4a661] font-bold">"{invitationTitle || activeInvoice.customer_name}"</span>. Seluruh fitur luxury dan bebas watermark telah terbuka.</>
                )}
              </p>
            </div>

            {/* Receipt Box */}
            <div className="w-full max-w-md bg-neutral-950/90 rounded-2xl border border-neutral-800 p-4 text-xs space-y-2.5 shadow-xl text-left">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-500">Nomor Invoice:</span>
                <span className="font-mono font-bold text-white">{activeInvoice.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Paket Layanan:</span>
                <span className="font-semibold text-[#c4a661]">{activeInvoice.plan_name || selectedPlan?.name || selectedPlanId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Total Biaya:</span>
                <span className="font-mono font-bold text-emerald-400">Rp {(activeInvoice.amount || 0).toLocaleString('id-ID')}</span>
              </div>
              {activeInvoice.license_key && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">License Key Resmi:</span>
                    <span className="font-mono font-bold text-[#c4a661] text-xs">{activeInvoice.license_key}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeInvoice.license_key);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-[10px] transition cursor-pointer"
                  >
                    {copiedKey ? '✓ Tersalin!' : 'Salin Key'}
                  </button>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => {
                onSuccess(activeInvoice.license_key || 'UND-ACTIVE');
                onClose();
              }}
              className="w-full max-w-md py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 font-bold text-sm transition cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Dashboard & Mulai Kelola</span>
            </button>
          </div>
        ) : (
          /* STEP 3: LIVE TRIPAY INVOICE & INSTRUCTIONS SCREEN */
          <div className="flex flex-col flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {/* Header Status */}
            <div className="text-center shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-400 text-xs font-semibold mb-2 shadow">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>MENUNGGU PEMBAYARAN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Invoice #{activeInvoice.invoice_number}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Total Tagihan: <span className="text-[#c4a661] font-mono font-bold text-sm bg-neutral-900 px-2 py-0.5 rounded-lg border border-[#c4a661]/30">Rp {(activeInvoice.amount || 0).toLocaleString('id-ID')}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Details & Pay Code */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-md">
                <div className="text-xs font-bold text-[#c4a661] border-b border-neutral-800 pb-2 flex items-center justify-between">
                  <span>Informasi Tagihan</span>
                  <span className="text-[10px] bg-[#c4a661]/15 text-[#c4a661] px-2 py-0.5 rounded-full border border-[#c4a661]/30">
                    {channelList.find((c: any) => c.code === activeInvoice.payment_method)?.name || activeInvoice.payment_name || activeInvoice.payment_method}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nama Pemesan:</span>
                    <span className="font-semibold text-white">{activeInvoice.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">WhatsApp:</span>
                    <span className="font-semibold text-white">{activeInvoice.customer_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Paket:</span>
                    <span className="font-semibold text-[#c4a661]">{activeInvoice.plan_name || selectedPlan?.name || selectedPlanId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Metode:</span>
                    <span className="font-semibold text-emerald-400">
                      {channelList.find((c: any) => c.code === activeInvoice.payment_method)?.name || activeInvoice.payment_method}
                    </span>
                  </div>

                  {activeInvoice.pay_code && (
                    <div className="pt-2 border-t border-neutral-800/80">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Nomor Virtual Account / Kode Bayar:
                      </span>
                      <div className="flex items-center justify-between bg-black/80 p-2.5 rounded-xl border border-[#c4a661]/50 shadow-inner">
                        <span className="text-base sm:text-lg font-mono font-bold tracking-widest text-[#c4a661] select-all">
                          {activeInvoice.pay_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeInvoice.pay_code);
                            setCopiedVA(true);
                            setTimeout(() => setCopiedVA(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#c4a661] hover:bg-[#d5b874] text-neutral-950 font-bold text-[10px] transition cursor-pointer shrink-0"
                        >
                          {copiedVA ? '✓ Tersalin!' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code / Instructions */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-center justify-center text-center shadow-md">
                {activeInvoice.qr_url ? (
                  <div className="bg-white p-3.5 rounded-2xl border shadow-xl max-w-[210px]">
                    <img src={activeInvoice.qr_url} alt="QRIS Code" className="w-full h-auto object-contain" />
                    <div className="text-[10px] font-bold text-neutral-800 mt-1 uppercase tracking-wider">
                      Scan dengan E-Wallet / Mobile Banking
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-neutral-300 text-xs flex flex-col items-center gap-2">
                    <Building className="w-10 h-10 text-[#c4a661]" />
                    <div className="font-bold text-sm text-white">
                      {channelList.find((c: any) => c.code === activeInvoice.payment_method)?.name || 'Virtual Account Bank'}
                    </div>
                    <p className="text-[11px] text-neutral-400 max-w-xs">
                      Transfer tepat sejumlah <span className="text-[#c4a661] font-bold">Rp {(activeInvoice.amount || 0).toLocaleString('id-ID')}</span> ke nomor VA di samping.
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[10px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sistem mendeteksi pembayaran realtime otomatis via Tripay Webhook</span>
                </div>
              </div>
            </div>

            {/* Interactive Payment Instructions Accordion */}
            {activeInvoice.instructions && Array.isArray(activeInvoice.instructions) && activeInvoice.instructions.length > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
                <div className="text-xs font-bold text-[#c4a661] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Petunjuk Pembayaran Resmi {channelList.find((c: any) => c.code === activeInvoice.payment_method)?.name || ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeInvoice.instructions.map((inst: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] space-y-1.5 text-neutral-300">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#c4a661]/20 text-[#c4a661] flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>{inst.title}</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-neutral-400 pl-1 text-[10px]">
                        {inst.steps.map((stepStr: string, sIdx: number) => (
                          <li key={sIdx} dangerouslySetInnerHTML={{ __html: stepStr }} />
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check Status Action Bar */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={isManualChecking}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c4a661] hover:bg-[#d5b874] text-neutral-950 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {isManualChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isManualChecking ? 'Mengecek Pembayaran...' : 'Cek Status Pembayaran Sekarang'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
