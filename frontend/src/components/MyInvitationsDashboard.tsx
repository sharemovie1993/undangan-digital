import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Crown,
  Search,
  Copy,
  Loader2,
  ExternalLink,
  ArrowRight,
  Phone,
  CreditCard,
  Zap,
  RefreshCw,
  Key
} from 'lucide-react';
import { EventType, ThemeToken } from '../types';
import { VendorAuthModal } from './auth/VendorAuthModal';
import { PricingModal } from './PricingModal';
import { TransferLicenseModal } from './TransferLicenseModal';
import { ActiveLicenseModal } from './ActiveLicenseModal';
import { useAuth } from '../hooks/useAuth';
import { useInvitations } from '../hooks/useInvitations';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { isPrintKitAllowed, getPlanDetails } from '../constants/plans';

interface MyInvitationsDashboardProps {
  onSelectInvitation: (invitationData: any) => void;
  onOpenPrintStudio: (invitationData: any) => void;
  onViewGuestMode: (guestName?: string, slug?: string) => void;
  onLogout?: () => void;
}

// Helper to format ISO date (2026-09-02) into Indonesian date
const formatIndonesianDate = (dateString?: string) => {
  if (!dateString) return '24 Oktober 2026';
  if (
    dateString.includes('Minggu') ||
    dateString.includes('Senin') ||
    dateString.includes('Selasa') ||
    dateString.includes('Rabu') ||
    dateString.includes('Kamis') ||
    dateString.includes('Jumat') ||
    dateString.includes('Sabtu')
  ) {
    return dateString;
  }
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
  } catch {}
  return dateString;
};

export const MyInvitationsDashboard: React.FC<MyInvitationsDashboardProps> = ({
  onSelectInvitation,
  onOpenPrintStudio,
  onViewGuestMode,
  onLogout
}) => {
  const { user: currentUser, role, isReseller, quotaTokens, logout: authLogout } = useAuth();
  const {
    invitations: list,
    unassignedOrders,
    standbyCount: standbyLicensesCount,
    isLoading,
    createMutation,
    duplicateMutation,
    deleteMutation,
    activateTokenMutation,
    transferMutation
  } = useInvitations();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invitation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('wedding');
  const [newTheme, setNewTheme] = useState<ThemeToken>('champagne_gold');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isActiveLicenseModalOpen, setIsActiveLicenseModalOpen] = useState(false);
  const [activeLicenseTarget, setActiveLicenseTarget] = useState<any>(null);
  const [pricingTargetInvitation, setPricingTargetInvitation] = useState<any>(null);
  const [transferTargetInvitation, setTransferTargetInvitation] = useState<any>(null);

  const filteredList = list.filter((item: any) => {
    const matchesType = filterType === 'all' || item.eventType?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenPricingForInvitation = (inv?: any) => {
    setPricingTargetInvitation(inv || list[0] || null);
    setIsPricingModalOpen(true);
  };

  const handleOpenTransferForInvitation = (inv: any) => {
    setTransferTargetInvitation(inv);
    setIsTransferModalOpen(true);
  };

  const handleOpenActiveLicense = (inv: any) => {
    setActiveLicenseTarget(inv);
    setIsActiveLicenseModalOpen(true);
  };

  const handleTriggerActivateToken = async (inv: any) => {
    if (quotaTokens < 1) {
      showToast('warning', 'Saldo token Anda tidak mencukupi. Silakan lakukan top-up token.', 'Saldo Token Habis');
      handleOpenPricingForInvitation(inv);
      return;
    }

    const confirmed = await confirm({
      type: 'token_activate',
      title: 'Aktivasi Lisensi dengan Token',
      description: 'Gunakan 1 Token untuk mengaktifkan seluruh fitur luxury, masa aktif permanen, dan menghapus watermark resmi.',
      details: {
        invitationTitle: inv.title,
        tokenCost: 1,
        remainingTokens: quotaTokens - 1
      },
      confirmLabel: '⚡ Aktifkan Sekarang',
      cancelLabel: 'Batal'
    });

    if (confirmed) {
      activateTokenMutation.mutate(inv.id);
    }
  };

  const handleTriggerDelete = async (inv: any) => {
    const isLicensed = !inv.isWatermark && inv.licenseKey;
    const isTokenPlan = inv.planId === 'UND-RESELLER-TOKEN';
    const isPaidLicense = isLicensed && !isTokenPlan;

    let desc = 'Proyek draft undangan ini akan dihapus secara permanen.';
    if (isTokenPlan) {
      desc = '1 Token aktivasi akan dikembalikan secara otomatis ke saldo akun Anda setelah penghapusan.';
    } else if (isPaidLicense) {
      desc = 'License key resmi Anda akan tetap tersimpan di Riwayat Pesanan dan dapat digunakan pada undangan baru.';
    }

    const confirmed = await confirm({
      type: 'delete',
      title: 'Hapus Proyek Undangan?',
      description: desc,
      details: {
        invitationTitle: inv.title,
        planName: isTokenPlan ? 'Aktivasi Token Reseller (Refund 1 Token)' : isPaidLicense ? `${inv.planId || 'Lisensi Resmi'} (Tersimpan di Akun)` : 'Draft Undangan'
      },
      confirmLabel: 'Ya, Hapus Undangan',
      cancelLabel: 'Batal',
      isDestructive: true
    });

    if (confirmed) {
      deleteMutation.mutate(inv.id);
    }
  };

  const handleTriggerPrintStudio = async (inv: any) => {
    if (isPrintKitAllowed(inv.planId, inv.allowPrintKit, role)) {
      onOpenPrintStudio(inv);
    } else {
      const confirmed = await confirm({
        type: 'upgrade_print',
        title: 'Fitur Eksklusif Print Studio',
        description: `Fitur Print Studio (Cetak File HD 300 DPI, Label Stiker Tom & Jerry 103, & Kupon Souvenir) tersedia eksklusif pada Paket Platinum & Reseller.\n\nUndangan "${inv.title}" saat ini menggunakan ${inv.planId || 'Paket Standar'}.`,
        details: {
          invitationTitle: inv.title,
          planName: 'Upgrade ke Paket Platinum'
        },
        confirmLabel: '🚀 Buka Menu Upgrade',
        cancelLabel: 'Tutup'
      });

      if (confirmed) {
        handleOpenPricingForInvitation(inv);
      }
    }
  };

  const handleUseStandbyLicense = async (order: any) => {
    if (!order || !order.licenseKey) return;
    const targetId = pricingTargetInvitation?.id || (list[0]?.id);
    if (!targetId) {
      showToast('warning', 'Silakan buat undangan terlebih dahulu untuk memasangkan lisensi ini.', 'Peringatan');
      return;
    }

    transferMutation.mutate({
      targetInvitationId: targetId,
      licenseKey: order.licenseKey
    }, {
      onSuccess: () => {
        setIsPricingModalOpen(false);
      }
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'undangan-digital';
    const defaultProfiles = newEventType === 'khitanan' ? [
      {
        name: newTitle.replace('Walimatul Khitan', '').trim() || 'Muhammad Rayyan',
        role: 'Anak yang Dikhitan',
        bio: 'Putra pertama dari Bpk. Ir. Hendra & Ibu Nurlela',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80'
      }
    ] : [
      {
        name: newTitle.split('&')[0]?.trim() || 'Romeo Aris Pratama, S.Kom',
        role: 'Mempelai Pria',
        bio: 'Putra dari Bpk. Handoko & Ibu Ratna',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
      },
      {
        name: newTitle.split('&')[1]?.trim() || 'Juliet Sarah Aulia, S.Ked',
        role: 'Mempelai Wanita',
        bio: 'Putri dari Bpk. Suryadi & Ibu Dewi',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80'
      }
    ];

    createMutation.mutate({
      title: newTitle.trim(),
      slug,
      eventType: newEventType.toUpperCase(),
      themeId: newTheme,
      eventData: {
        eventTitle: newTitle.trim(),
        eventType: newEventType,
        theme: newTheme,
        eventDate: '2026-10-24T08:00:00',
        profiles: defaultProfiles,
        events: [
          {
            title: newEventType === 'wedding' ? 'Akad Nikah & Resepsi' : 'Tasyakuran & Walimah',
            date: '2026-10-24',
            time: '08:00 - 16:00 WIB',
            venueName: 'Grand Ballroom Graha Kencana',
            address: 'Jl. Gatot Subroto No. 45, Bandung',
            googleMapsUrl: 'https://maps.google.com'
          }
        ]
      }
    }, {
      onSuccess: (res) => {
        setIsCreateModalOpen(false);
        setNewTitle('');
        if (res.data) {
          onSelectInvitation(res.data);
        }
      }
    });
  };

  const handleLogout = () => {
    authLogout();
    onLogout?.();
  };

  const totalInvitations = list.length;
  const totalGuests = list.reduce((acc, curr) => acc + (curr.guestCount || 0), 0);
  const totalRsvps = list.reduce((acc, curr) => acc + (curr.rsvpCount || 0), 0);
  const activeLicenses = list.filter((i) => !i.isWatermark || i.licenseKey).length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e2e2e7] flex flex-col font-sans">
      {/* Top Navbar - Responsive for 3 Devices (Mobile, Tablet, Desktop) */}
      <header className="min-h-16 shrink-0 border-b border-[#1f1f27] bg-[#111115] px-3.5 sm:px-6 lg:px-12 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-serif font-bold text-base sm:text-lg shadow-lg shrink-0">
            L
          </div>
          <div>
            <div className="font-serif font-bold text-sm sm:text-base tracking-wide text-white flex items-center gap-1.5 sm:gap-2">
              <span>LUXEINVITE</span>
              <span className="text-[9px] sm:text-[10px] bg-[#c4a661]/15 text-[#c4a661] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#c4a661]/30 font-sans font-semibold">
                STUDIO
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-neutral-500 hidden sm:block">Multi-Invitation & Vendor Hub</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs shadow-md">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-bold text-xs shadow shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'V'}
              </div>
              <div className="text-left max-w-[130px] sm:max-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white leading-none truncate text-[11px] sm:text-xs">{currentUser.name || 'Vendor'}</span>
                  <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    (currentUser?.role || 'USER').toUpperCase() === 'RESELLER'
                      ? 'bg-[#c4a661]/25 text-[#c4a661] border border-[#c4a661]/40'
                      : (currentUser?.role || 'USER').toUpperCase() === 'PERCETAKAN'
                      ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/40'
                      : (currentUser?.role || 'USER').toUpperCase() === 'ADMIN'
                      ? 'bg-purple-500/25 text-purple-400 border border-purple-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {(currentUser?.role || 'USER').toUpperCase() === 'RESELLER'
                      ? '👑 RESELLER'
                      : (currentUser?.role || 'USER').toUpperCase() === 'PERCETAKAN'
                      ? '🖨️ MITRA CETAK'
                      : (currentUser?.role || 'USER').toUpperCase() === 'ADMIN'
                      ? '🛡️ ADMIN'
                      : '👤 PERSONAL'}
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="text-emerald-400">{currentUser.phone ? currentUser.phone.slice(-4).padStart(currentUser.phone.length, '*') : 'Aktif'}</span>
                  {Boolean(currentUser?.quotaTokens) && (
                    <span className="text-[#c4a661] font-bold font-sans">
                      • 💎 {currentUser.quotaTokens} Token
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] text-neutral-400 hover:text-rose-400 font-medium pl-1.5 ml-1 border-l border-neutral-800 transition cursor-pointer"
                title="Keluar Akun"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[#c4a661] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Phone className="w-3.5 h-3.5 text-[#c4a661]" />
              <span>Masuk</span>
            </button>
          )}

          {currentUser && (
            <>
              <button
                onClick={() => handleOpenPricingForInvitation()}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#c4a661]/15 hover:bg-[#c4a661]/25 border border-[#c4a661]/40 text-[#c4a661] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                title="Beli Paket atau Top-Up Saldo Token"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Beli Paket / Top-Up</span>
                <span className="md:hidden text-[11px]">Top-Up</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 shadow-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Buat Undangan Baru</span>
                <span className="sm:hidden">Buat</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area - Optimized for Mobile, Tablet & Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
        {!currentUser ? (
          <div className="py-12 px-6 md:p-14 bg-[#111115] rounded-3xl border border-[#c4a661]/30 text-center max-w-md mx-auto shadow-2xl space-y-5 my-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-serif font-bold text-2xl mx-auto shadow-lg">
              L
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Sesi Akun Berakhir</h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Anda telah keluar dari akun. Masukkan nomor WhatsApp Anda untuk kembali mengelola proyek undangan digital Anda.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span>Masuk dengan Nomor WhatsApp</span>
            </button>
          </div>
        ) : (
          <>
            {/* Analytics Summary Stats (Responsive 2 cols on mobile, 4 cols on tablet/desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 bg-[#111115] rounded-2xl border border-[#1f1f27] flex items-center gap-2.5 sm:gap-3.5 shadow-md">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-[#c4a661] shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">Total Proyek</div>
                  <div className="text-base sm:text-xl font-bold text-white mt-0.5 truncate">{totalInvitations} Proyek</div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[#111115] rounded-2xl border border-[#1f1f27] flex items-center gap-2.5 sm:gap-3.5 shadow-md">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">Total Tamu</div>
                  <div className="text-base sm:text-xl font-bold text-white mt-0.5 truncate">{totalGuests} Tamu</div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[#111115] rounded-2xl border border-[#1f1f27] flex items-center gap-2.5 sm:gap-3.5 shadow-md">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">RSVP Masuk</div>
                  <div className="text-base sm:text-xl font-bold text-white mt-0.5 truncate">{totalRsvps} RSVP</div>
                </div>
              </div>

              {(currentUser?.role || '').toUpperCase() === 'RESELLER' || (currentUser?.role || '').toUpperCase() === 'PERCETAKAN' ? (
                <div className="p-3 sm:p-4 bg-[#111115] rounded-2xl border border-[#c4a661]/40 flex items-center justify-between shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c4a661]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#c4a661]/15 border border-[#c4a661]/35 flex items-center justify-center text-[#c4a661] shrink-0">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] sm:text-[10px] text-[#c4a661] font-bold truncate">Saldo Token</div>
                      <div className="text-base sm:text-xl font-bold text-white mt-0.5 truncate">{currentUser?.quotaTokens || 0} Token</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenPricingForInvitation()}
                    className="px-2 py-1 rounded-lg sm:rounded-xl bg-[#c4a661] hover:bg-[#d5b874] text-neutral-950 font-bold text-[9px] sm:text-[10px] transition cursor-pointer shrink-0 shadow ml-1"
                  >
                    + Top-Up
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (standbyLicensesCount > 0) {
                      handleOpenTransferForInvitation(list[0] || null);
                    }
                  }}
                  className={`p-3 sm:p-4 bg-[#111115] rounded-2xl border flex items-center gap-2.5 sm:gap-3.5 shadow-md transition ${
                    standbyLicensesCount > 0 ? 'border-emerald-500/50 bg-emerald-500/5 cursor-pointer hover:border-emerald-400' : 'border-[#1f1f27]'
                  }`}
                  title={standbyLicensesCount > 0 ? `${standbyLicensesCount} lisensi standby siap dipasang` : 'Total Lisensi Aktif'}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a661]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">Lisensi Aktif</span>
                      {standbyLicensesCount > 0 && (
                        <span className="text-[8px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30 shrink-0">
                          {standbyLicensesCount} Siap Pakai
                        </span>
                      )}
                    </div>
                    <div className="text-base sm:text-xl font-bold text-emerald-400 mt-0.5 truncate">
                      {activeLicenses + standbyLicensesCount} Lisensi
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Bar & Search (Horizontal scroll on mobile, flex row on tablet/desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#111115] p-2.5 sm:p-3 rounded-2xl border border-[#1f1f27]">
              {/* Category Tabs */}
              <div className="flex gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0 scrollbar-none">
                {[
                  { key: 'all', label: 'Semua Undangan' },
                  { key: 'wedding', label: '💍 Wedding' },
                  { key: 'khitanan', label: '🌿 Khitanan' },
                  { key: 'aqiqah', label: '👶 Aqiqah' },
                  { key: 'birthday', label: '🎂 Birthday' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      filterType === tab.key
                        ? 'bg-[#c4a661] text-neutral-950 font-bold shadow-md'
                        : 'text-neutral-400 hover:text-white bg-neutral-900/50 sm:bg-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 md:w-80 shrink-0">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari acara / slug..."
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#c4a661] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition"
                />
              </div>
            </div>

            {/* Invitations Grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop) */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-5 sm:p-6 rounded-3xl bg-[#111115] border border-[#1f1f27] animate-pulse space-y-4">
                    <div className="h-4 bg-neutral-800 rounded w-1/3" />
                    <div className="h-6 bg-neutral-800 rounded w-3/4" />
                    <div className="h-4 bg-neutral-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-[#111115] rounded-3xl border border-[#1f1f27] space-y-4">
                {standbyLicensesCount > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-[#c4a661]/40 text-left max-w-md mx-auto flex items-start gap-3 shadow-lg mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#c4a661]/20 border border-[#c4a661]/40 flex items-center justify-center text-[#c4a661] shrink-0 mt-0.5">
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>💎 {standbyLicensesCount} Lisensi Siap Pakai ({unassignedOrders[0]?.planName || 'Paket Platinum'})</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#c4a661] mt-0.5">
                        Key: {unassignedOrders[0]?.licenseKey}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                        Lisensi resmi Anda siap digunakan. Klik <b>"+ Buat Undangan Sekarang"</b> di bawah untuk otomatis mengaktifkan undangan pertama Anda!
                      </p>
                    </div>
                  </div>
                )}
                <Sparkles className="w-8 h-8 text-[#c4a661] mx-auto opacity-60" />
                <h3 className="text-base font-bold text-white">Belum Ada Proyek Undangan</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Mulai buat undangan digital pertama Anda untuk pernikahan, walimatul khitan, aqiqah, atau ulang tahun.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 transition cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Buat Undangan Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredList.map((inv) => {
                  const isLicenseActive = !inv.isWatermark || inv.licenseKey;
                  const rawDate = inv.eventData?.events?.[0]?.date || inv.eventData?.eventDate || '2026-10-24';
                  const eventDate = formatIndonesianDate(rawDate);
                  const location = inv.eventData?.events?.[0]?.venueName || inv.eventData?.sessions?.[0]?.venueName || inv.eventData?.locationName || 'Lokasi Acara';

                  return (
                    <div
                      key={inv.id}
                      className="group bg-[#111115] rounded-2xl sm:rounded-3xl border border-[#1f1f27] hover:border-[#c4a661]/50 p-4 sm:p-5 flex flex-col justify-between transition duration-200 shadow-xl relative overflow-hidden"
                    >
                      {/* Top Badge Row */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 shrink-0">
                            {inv.eventType}
                          </span>

                          {isLicenseActive ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenActiveLicense(inv);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 transition cursor-pointer shrink-0 shadow-xs"
                              title="Klik untuk melihat nomor License Key & detail lisensi"
                            >
                              <Crown className="w-3 h-3 text-[#c4a661]" />
                              <span>Lisensi Aktif</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                              {/* ⚡ Tombol Pakai Token */}
                              {(['RESELLER','PERCETAKAN','ADMIN'].includes((role || '').toUpperCase())) &&
                                (quotaTokens || 0) >= 1 && (
                                <button
                                  type="button"
                                  disabled={activateTokenMutation.isPending && activateTokenMutation.variables === inv.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTriggerActivateToken(inv);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-500/40 transition cursor-pointer disabled:opacity-60 shrink-0"
                                  title={`Aktifkan dengan Token (Sisa: ${quotaTokens || 0})`}
                                >
                                  {activateTokenMutation.isPending && activateTokenMutation.variables === inv.id
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Zap className="w-3 h-3" />}
                                  <span>{activateTokenMutation.isPending && activateTokenMutation.variables === inv.id ? '...' : 'Token'}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTransferForInvitation(inv);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30 transition cursor-pointer shrink-0"
                                title="Pindahkan lisensi dari undangan lain atau riwayat pesanan"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Pindah</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPricingForInvitation(inv);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c4a661] bg-[#c4a661]/15 hover:bg-[#c4a661]/25 px-2 py-0.5 rounded-full border border-[#c4a661]/40 transition cursor-pointer shrink-0"
                              >
                                <Crown className="w-3 h-3 text-[#c4a661]" />
                                <span>Beli</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Title */}
                        <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#c4a661] transition line-clamp-1">
                          {inv.title}
                        </h3>

                        {/* Direct License Key Badge */}
                        {inv.licenseKey && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenActiveLicense(inv);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#c4a661] bg-[#c4a661]/10 hover:bg-[#c4a661]/20 px-2 py-0.5 rounded-lg border border-[#c4a661]/25 mt-1 cursor-pointer transition"
                            title="Klik untuk melihat rincian lisensi resmi"
                          >
                            <Key className="w-3 h-3 shrink-0" />
                            <span>{inv.licenseKey}</span>
                          </div>
                        )}

                        <div className="text-xs text-neutral-400 space-y-1.5 mt-2.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#c4a661] shrink-0" />
                            <span className="truncate">{eventDate}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#c4a661] shrink-0" />
                            <span className="truncate">{location}</span>
                          </div>
                        </div>

                        {/* Stats Badges */}
                        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                          <span className="bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                            👥 {inv.guestCount || 0} Tamu
                          </span>
                          <span className="bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                            💌 {inv.rsvpCount || 0} RSVP
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1 sm:gap-1.5">
                        <button
                          onClick={() => onSelectInvitation(inv)}
                          className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit Studio</span>
                        </button>

                        <button
                          onClick={() => handleTriggerPrintStudio(inv)}
                          className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition cursor-pointer"
                          title={inv.allowPrintKit ? "Buka Print Studio (PDF HD 300 DPI)" : "Print Studio (Fitur Paket Platinum & Reseller)"}
                        >
                          <Printer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inv.allowPrintKit ? 'text-[#c4a661]' : 'text-neutral-500'}`} />
                        </button>

                        <button
                          onClick={() => onViewGuestMode('Bpk. Ahmad Suherman & Kel', inv.slug)}
                          className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition cursor-pointer"
                          title="Lihat Tampilan Live Tamu Undangan"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <button
                          onClick={() => duplicateMutation.mutate(inv.id)}
                          disabled={duplicateMutation.isPending}
                          className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition cursor-pointer"
                          title="Duplikasi Proyek Undangan"
                        >
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                        </button>

                        <button
                          onClick={() => handleTriggerDelete(inv)}
                          className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Undangan"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Buat Undangan Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-6 md:p-8">
            <h2 className="text-xl font-serif font-bold text-white mb-1">Buat Undangan Baru</h2>
            <p className="text-xs text-neutral-400 mb-5">Pilih jenis acara dan tentukan judul undangan Anda.</p>

            <form
              onSubmit={handleCreateSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Jenis Acara (Event Type)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'wedding' as EventType, label: '💍 Wedding' },
                    { type: 'khitanan' as EventType, label: '🌿 Khitanan' },
                    { type: 'aqiqah' as EventType, label: '👶 Aqiqah' },
                    { type: 'birthday' as EventType, label: '🎂 Ultah' }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.type}
                      onClick={() => setNewEventType(t.type)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                        newEventType === t.type
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Judul Undangan / Nama Pasangan</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={newEventType === 'khitanan' ? 'Contoh: Walimatul Khitan Muhammad Rayyan' : 'Contoh: The Wedding of Romeo & Juliet'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c4a661]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Tema Warna Awal</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { token: 'champagne_gold' as ThemeToken, label: 'Gold', color: '#c4a661' },
                    { token: 'emerald_sage' as ThemeToken, label: 'Sage', color: '#3a4d3a' },
                    { token: 'velvet_navy' as ThemeToken, label: 'Navy', color: '#101426' }
                  ].map((thm) => (
                    <button
                      type="button"
                      key={thm.token}
                      onClick={() => setNewTheme(thm.token)}
                      className={`p-2 rounded-xl border text-center font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        newTheme === thm.token
                          ? 'border-[#c4a661] bg-neutral-900 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-500'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thm.color }} />
                      <span>{thm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold hover:bg-[#d5b874] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{createMutation.isPending ? 'Membuat...' : 'Buat Undangan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Auth Modal */}
      <VendorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
        }}
      />

      {/* Pricing & License Activation Modal (Operational Hub) */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        invitationTitle={pricingTargetInvitation?.title || 'Undangan Digital'}
        invitationId={pricingTargetInvitation?.id || pricingTargetInvitation?.slug}
        currentUser={currentUser}
        standbyOrders={unassignedOrders}
        currentInvitationPlan={pricingTargetInvitation?.planId}
        onUseStandbyLicense={handleUseStandbyLicense}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
          queryClient.invalidateQueries({ queryKey: ['my-orders-license'] });
          queryClient.invalidateQueries({ queryKey: ['auth-me-profile'] });
          setIsPricingModalOpen(false);
        }}
      />

      {/* Transfer License Modal (Pindah Lisensi Antar Proyek) */}
      <TransferLicenseModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        targetInvitation={transferTargetInvitation}
        allInvitations={list}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
          setIsTransferModalOpen(false);
        }}
      />

      {/* Active License Detail Modal (Detail Lisensi Resmi & Key) */}
      <ActiveLicenseModal
        isOpen={isActiveLicenseModalOpen}
        onClose={() => setIsActiveLicenseModalOpen(false)}
        planName={getPlanDetails(activeLicenseTarget?.planId).name}
        licenseKey={activeLicenseTarget?.licenseKey || 'UND-ACTIVE'}
        quotaTokens={quotaTokens}
        userRole={role}
        onUpgrade={() => {
          setIsActiveLicenseModalOpen(false);
          handleOpenPricingForInvitation(activeLicenseTarget);
        }}
      />
    </div>
  );
};
