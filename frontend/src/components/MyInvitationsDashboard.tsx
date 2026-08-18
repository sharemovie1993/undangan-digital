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
  Key,
  Globe,
  Database,
  LogOut,
  LayoutGrid,
  List,
  ArrowRightLeft,
  UserCheck,
  Check,
  CheckCircle2,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { EventType, ThemeToken } from '../types';
import { VendorAuthModal } from './auth/VendorAuthModal';
import { PricingModal } from './PricingModal';
import { TransferLicenseModal } from './TransferLicenseModal';
import { ActiveLicenseModal } from './ActiveLicenseModal';
import { EasyTunnelModal } from './EasyTunnelModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { AdminUserManagementModal } from './AdminUserManagementModal';
import { AdminTransferModal } from './AdminTransferModal';
import { AdminOverrideModal } from './AdminOverrideModal';
import { useAuth } from '../hooks/useAuth';
import { useInvitations } from '../hooks/useInvitations';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useQueryClient } from '@tanstack/react-query';
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
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const MyInvitationsDashboard: React.FC<MyInvitationsDashboardProps> = ({
  onSelectInvitation,
  onOpenPrintStudio,
  onViewGuestMode,
  onLogout
}) => {
  const { user: currentUser, role, isReseller, quotaTokens, logout: authLogout, login } = useAuth();
  const isAdmin = (role || currentUser?.role || '').toUpperCase() === 'ADMIN' ||
    (role || currentUser?.role || '').toUpperCase() === 'OWNER' ||
    currentUser?.email === 'admin@absenta.id';
  const queryClient = useQueryClient();
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

  // Dual-View Switcher State (Deck Cards vs Table List)
  const [viewMode, setViewMode] = useState<'deck' | 'table'>(() => {
    return (localStorage.getItem('absenta_invitations_view_mode') as 'deck' | 'table') || 'deck';
  });

  // Admin Multi-Tab & Filter State
  const [adminTab, setAdminTab] = useState<'my' | 'all'>('all');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('ALL');

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
  const [isEasyTunnelModalOpen, setIsEasyTunnelModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAdminUserManagementOpen, setIsAdminUserManagementOpen] = useState(false);
  const [adminTransferTarget, setAdminTransferTarget] = useState<any>(null);
  const [adminOverrideTarget, setAdminOverrideTarget] = useState<any>(null);
  const [copiedSlugId, setCopiedSlugId] = useState<string | null>(null);

  const [activeLicenseTarget, setActiveLicenseTarget] = useState<any>(null);
  const [pricingTargetInvitation, setPricingTargetInvitation] = useState<any>(null);
  const [transferTargetInvitation, setTransferTargetInvitation] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewModeChange = (mode: 'deck' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('absenta_invitations_view_mode', mode);
  };

  // Extract unique owners for Admin filter
  const uniqueOwners = React.useMemo(() => {
    if (!isAdmin) return [];
    const map = new Map<string, { id: string; name: string; phone?: string; email?: string; role?: string }>();
    list.forEach((inv: any) => {
      if (inv.owner && inv.owner.id) {
        map.set(inv.owner.id, inv.owner);
      }
    });
    return Array.from(map.values());
  }, [list, isAdmin]);

  const filteredList = list.filter((item: any) => {
    // Filter Admin Tab (Undangan Saya vs Semua Undangan Pengguna)
    if (isAdmin && adminTab === 'my') {
      if (item.userId !== currentUser?.id) return false;
    }
    if (isAdmin && adminTab === 'all' && selectedOwnerId !== 'ALL') {
      if (item.userId !== selectedOwnerId) return false;
    }

    const matchesType = filterType === 'all' || item.eventType?.toLowerCase() === filterType.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.title?.toLowerCase().includes(q) ||
      item.slug?.toLowerCase().includes(q) ||
      (item.owner?.name && item.owner.name.toLowerCase().includes(q)) ||
      (item.owner?.phone && item.owner.phone.includes(q)) ||
      (item.owner?.email && item.owner.email.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlugId(id);
    showToast('success', `Link "${url}" berhasil disalin ke clipboard!`, 'Link Disalin');
    setTimeout(() => setCopiedSlugId(null), 2500);
  };

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
        ],
        bankAccounts: [
          {
            id: 'bank-bca',
            bankName: 'BCA',
            accountNumber: '1234567890',
            accountHolder: newTitle.trim() || 'Romeo Aris Pratama'
          }
        ],
        physicalGift: {
          recipientName: newTitle.trim() || 'Keluarga Mempelai',
          phoneNumber: '+62 812-3456-7890',
          fullAddress: 'Jl. Kemang Raya No. 45, RT 04 / RW 02',
          city: 'Bandung, Jawa Barat',
          postalCode: '40115',
          notes: 'Titip di Pos Satpam / Bel Rumah'
        },
        enabledBlocks: {
          hero: true,
          quote: true,
          profile: true,
          countdown: true,
          schedule: true,
          story: true,
          gallery: true,
          gift: true,
          rsvp: true,
          wishes: true,
          closing: true
        }
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
      {/* Top Navbar - Responsive for Mobile, Tablet, Desktop */}
      <header className="h-16 shrink-0 border-b border-[#1f1f27] bg-[#111115] px-3.5 sm:px-6 lg:px-12 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <>
              {/* Desktop Only Extra Action Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setIsAdminUserManagementOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                      title="Manajemen Pengguna & Saldo Token"
                    >
                      <Users className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      <span>Kelola Pengguna</span>
                    </button>

                    <button
                      onClick={() => setIsEasyTunnelModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                      title="Akses Publik Instan & Terowongan WireGuard"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      <span>Easy Tunnel</span>
                    </button>

                    <button
                      onClick={() => setIsBackupModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                      title="Backup & Restore Data untuk Migrasi Server"
                    >
                      <Database className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>Backup & Restore</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleOpenPricingForInvitation()}
                  className="px-3 py-1.5 rounded-xl bg-[#c4a661]/15 hover:bg-[#c4a661]/25 border border-[#c4a661]/40 text-[#c4a661] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                  title="Beli Paket atau Top-Up Saldo Token"
                >
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>Beli Paket / Top-Up</span>
                </button>
              </div>

              {/* Create New Invitation CTA */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs hover:opacity-95 shadow-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Buat Undangan Baru</span>
                <span className="sm:hidden font-bold">Buat Baru</span>
              </button>

              {/* User Account Popover Dropdown (Mobile & Desktop) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs transition cursor-pointer shadow"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#c4a661] to-[#8a7238] flex items-center justify-center text-neutral-950 font-bold text-xs shadow shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <span className="font-semibold text-white max-w-[90px] sm:max-w-[140px] truncate hidden xs:inline text-[11px] sm:text-xs">
                    {currentUser.name || 'Vendor'}
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider hidden sm:inline ${
                    (currentUser?.role || 'USER').toUpperCase() === 'RESELLER'
                      ? 'bg-[#c4a661]/25 text-[#c4a661] border border-[#c4a661]/40'
                      : (currentUser?.role || 'USER').toUpperCase() === 'ADMIN'
                      ? 'bg-purple-500/25 text-purple-400 border border-purple-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {(currentUser?.role || 'USER').toUpperCase()}
                  </span>
                </button>

                {/* Floating Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#111115] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 mb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs truncate">{currentUser.name || 'Vendor'}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 uppercase">
                          {currentUser.role || 'USER'}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-1">
                        {currentUser.phone || currentUser.email || 'Akun Aktif'}
                      </div>
                      {Boolean(currentUser?.quotaTokens) && (
                        <div className="text-[10px] text-[#c4a661] font-bold mt-1">
                          💎 Saldo: {currentUser.quotaTokens} Token
                        </div>
                      )}
                    </div>

                    {/* Mobile Quick Action Links */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleOpenPricingForInvitation();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-neutral-300 hover:text-white transition cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#c4a661]" />
                      <span>Beli Paket / Top-Up Token</span>
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsAdminUserManagementOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-indigo-300 hover:text-white transition cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Kelola Pengguna (Admin)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsEasyTunnelModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-neutral-300 hover:text-white transition cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Easy Tunnel WireGuard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsBackupModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-emerald-300 hover:text-white transition cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Backup & Restore Studio</span>
                        </button>
                      </>
                    )}

                    <div className="h-px bg-neutral-800/80 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-400 flex items-center gap-2 transition cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area - Optimized for Mobile, Tablet & Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-10 space-y-4 sm:space-y-6">
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

            {/* 👑 SUPER ADMIN MULTI-TAB BAR & OWNER FILTER (Zero-Leak: Only visible to ADMIN) */}
            {isAdmin && (
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#14141d] border border-indigo-500/30 shadow-lg">
                <div className="flex items-center gap-1.5 p-1 bg-neutral-950/80 rounded-xl border border-neutral-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdminTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      adminTab === 'all'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Semua Undangan Klien ({list.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('my')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      adminTab === 'my'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Undangan Saya ({list.filter((i: any) => i.userId === currentUser?.id).length})</span>
                  </button>
                </div>

                {adminTab === 'all' && uniqueOwners.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <select
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="w-full md:w-auto px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Semua Pemilik ({uniqueOwners.length} Pengguna)</option>
                      {uniqueOwners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} {o.phone ? `(${o.phone})` : ''} - {o.role || 'USER'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Filter Bar, Search, & Dual-View Switcher (Deck vs Table) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 bg-[#111115] p-2.5 sm:p-3 rounded-2xl border border-[#1f1f27]">
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

              {/* Right Toolbar: Search & View Switcher */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, slug, atau nama klien..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#c4a661] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition"
                  />
                </div>

                {/* 🎴 Deck Cards vs 📋 Table View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('deck')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'deck'
                        ? 'bg-[#c4a661] text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Tampilan Kartu (Grid Deck)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-[#c4a661] text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Tampilan Tabel Kompak (Table View)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Display: Loading / Empty / Table / Deck Grid */}
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
            ) : viewMode === 'table' ? (
              /* 📋 TABLE VIEW (Responsive: Compact Mobile Tile List on <sm, Multi-Column Table on >=sm) */
              <div className="bg-[#111115] rounded-2xl sm:rounded-3xl border border-[#1f1f27] overflow-hidden shadow-xl">
                {/* 📱 MOBILE VIEW: Compact Thumb-Friendly List (<640px) */}
                <div className="block sm:hidden divide-y divide-[#1b1b24]">
                  {filteredList.map((inv: any) => {
                    const isLicenseActive = !inv.isWatermark || inv.licenseKey;
                    const isCopied = copiedSlugId === inv.id;

                    return (
                      <div key={inv.id} className="p-3.5 space-y-2.5 hover:bg-[#14141c] transition">
                        {/* Header: Event Icon + Title + Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                              {inv.eventType === 'KHITANAN' ? '🌿' : inv.eventType === 'AQIQAH' ? '👶' : inv.eventType === 'BIRTHDAY' ? '🎂' : '💍'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4
                                onClick={() => onSelectInvitation(inv)}
                                className="font-bold text-white text-xs truncate active:text-[#c4a661] cursor-pointer"
                              >
                                {inv.title}
                              </h4>
                              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                <span className="uppercase font-semibold text-neutral-300">{inv.eventType}</span>
                                <span>•</span>
                                <span>{inv.themeId || 'Default'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isLicenseActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold shrink-0">
                              <Crown className="w-2.5 h-2.5 text-[#c4a661]" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[9px] font-medium shrink-0">
                              <span>Draft</span>
                            </span>
                          )}
                        </div>

                        {/* Owner Info for Admin */}
                        {isAdmin && inv.owner && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/25 w-fit">
                            <span>👤 {inv.owner.name}</span>
                            {inv.owner.phone && <span className="text-neutral-400">({inv.owner.phone})</span>}
                          </div>
                        )}

                        {/* Middle Row: Link / Slug + Stats */}
                        <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                          {/* Slug with Copy */}
                          <div className="flex items-center gap-1 min-w-0 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                            <span className="font-mono text-[10px] text-neutral-300 truncate max-w-[120px]">
                              /{inv.slug}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.slug, inv.id)}
                              className="p-0.5 text-neutral-400 hover:text-white"
                              title="Salin Link"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewGuestMode('Tamu Undangan', inv.slug)}
                              className="p-0.5 text-neutral-500 hover:text-white"
                              title="Buka Preview"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Stats Chips */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
                              👥 {inv.guestCount || 0}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
                              💌 {inv.rsvpCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Actions Toolbar on Mobile */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-neutral-800/60">
                          <button
                            onClick={() => onSelectInvitation(inv)}
                            className="flex-1 py-1.5 rounded-lg bg-[#c4a661] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 active:bg-[#d5b874] transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Studio</span>
                          </button>

                          <button
                            onClick={() => handleTriggerPrintStudio(inv)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300"
                            title="Print Studio"
                          >
                            <Printer className={`w-3.5 h-3.5 ${inv.allowPrintKit ? 'text-[#c4a661]' : 'text-neutral-500'}`} />
                          </button>

                          <button
                            onClick={() => duplicateMutation.mutate(inv.id)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sky-400"
                            title="Duplikasi"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setAdminTransferTarget(inv)}
                                className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                title="Transfer"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setAdminOverrideTarget(inv)}
                                className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                                title="Override"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleTriggerDelete(inv)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-rose-400"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 💻 TABLET & DESKTOP VIEW: Full Multi-Column Table (>=640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-[#14141c] text-neutral-400 border-b border-[#1f1f27] text-[11px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Proyek & Acara</th>
                        {isAdmin && <th className="py-3.5 px-4">Pemilik Klien</th>}
                        <th className="py-3.5 px-4">Link / Slug</th>
                        <th className="py-3.5 px-4 text-center">Tamu</th>
                        <th className="py-3.5 px-4 text-center">RSVP</th>
                        <th className="py-3.5 px-4">Status & Lisensi</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b1b24]">
                      {filteredList.map((inv: any) => {
                        const isLicenseActive = !inv.isWatermark || inv.licenseKey;
                        const isCopied = copiedSlugId === inv.id;

                        return (
                          <tr key={inv.id} className="hover:bg-[#16161f] transition group">
                            {/* Proyek & Acara */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                                  {inv.eventType === 'KHITANAN' ? '🌿' : inv.eventType === 'AQIQAH' ? '👶' : inv.eventType === 'BIRTHDAY' ? '🎂' : '💍'}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    onClick={() => onSelectInvitation(inv)}
                                    className="font-bold text-white hover:text-[#c4a661] transition cursor-pointer truncate max-w-[200px] sm:max-w-[280px]"
                                  >
                                    {inv.title}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                    <span className="uppercase font-semibold text-neutral-400">{inv.eventType}</span>
                                    <span>•</span>
                                    <span>Tema: {inv.themeId || 'Default'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Pemilik (Khusus Admin) */}
                            {isAdmin && (
                              <td className="py-3 px-4">
                                {inv.owner ? (
                                  <div>
                                    <div className="font-semibold text-white truncate max-w-[140px]">{inv.owner.name}</div>
                                    <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                      {inv.owner.phone && <span>{inv.owner.phone}</span>}
                                      <span className="px-1 py-0.2 rounded bg-neutral-800 text-[8px] font-bold text-indigo-400 border border-neutral-700 uppercase">
                                        {inv.owner.role || 'USER'}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-neutral-500 text-[11px]">-</span>
                                )}
                              </td>
                            )}

                            {/* Link / Slug */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(inv.slug, inv.id)}
                                  className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                                  title="Salin Link Publik"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <span className="font-mono text-xs text-neutral-300 truncate max-w-[120px] sm:max-w-[180px]">
                                  /{inv.slug}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onViewGuestMode('Tamu Undangan', inv.slug)}
                                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition cursor-pointer"
                                  title="Buka Preview Tamu"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Tamu */}
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
                                {inv.guestCount || 0}
                              </span>
                            </td>

                            {/* RSVP */}
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
                                {inv.rsvpCount || 0}
                              </span>
                            </td>

                            {/* Status & Lisensi */}
                            <td className="py-3 px-4">
                              {isLicenseActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                  <Crown className="w-3 h-3 text-[#c4a661]" />
                                  <span>Lisensi Aktif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-semibold">
                                  <span>Draft (Watermark)</span>
                                </span>
                              )}
                            </td>

                            {/* Aksi Cepat */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => onSelectInvitation(inv)}
                                  className="px-2.5 py-1 rounded-lg bg-[#c4a661] hover:bg-[#d5b874] text-neutral-950 font-bold text-[11px] transition cursor-pointer shadow flex items-center gap-1"
                                  title="Buka Studio Editor"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleTriggerPrintStudio(inv)}
                                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition cursor-pointer"
                                  title="Print Studio"
                                >
                                  <Printer className={`w-3.5 h-3.5 ${inv.allowPrintKit ? 'text-[#c4a661]' : 'text-neutral-500'}`} />
                                </button>

                                <button
                                  onClick={() => duplicateMutation.mutate(inv.id)}
                                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sky-400 transition cursor-pointer"
                                  title="Duplikasi Undangan"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Admin Actions: Transfer & Override */}
                                {isAdmin && (
                                  <>
                                    <button
                                      onClick={() => setAdminTransferTarget(inv)}
                                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition cursor-pointer"
                                      title="Super Admin: Transfer Kepemilikan ke User Lain"
                                    >
                                      <ArrowRightLeft className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setAdminOverrideTarget(inv)}
                                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition cursor-pointer"
                                      title="Super Admin: Override Lisensi / Watermark"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => handleTriggerDelete(inv)}
                                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                                  title="Hapus Undangan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* 🎴 DECK CARDS GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredList.map((inv: any) => {
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
                        <div className="flex items-center justify-between gap-2 mb-2">
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
                                  handleOpenPricingForInvitation(inv);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded-full border border-neutral-700 transition cursor-pointer shrink-0"
                                title="Beli Paket Lisensi Digital"
                              >
                                <span>Beli</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Owner Badge for Super Admin (Zero-Leak: Only rendered if Admin) */}
                        {isAdmin && inv.owner && (
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/25 mb-2 w-fit">
                            <span>👤 {inv.owner.name}</span>
                            {inv.owner.phone && <span className="text-neutral-400">({inv.owner.phone})</span>}
                          </div>
                        )}

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
                      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1 sm:gap-1.5 flex-wrap">
                        <button
                          onClick={() => onSelectInvitation(inv)}
                          className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 cursor-pointer shadow min-w-[100px]"
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

                        {/* Admin Action Buttons on Card (Transfer & Override) */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setAdminTransferTarget(inv)}
                              className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition cursor-pointer"
                              title="Super Admin: Transfer Kepemilikan"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            <button
                              onClick={() => setAdminOverrideTarget(inv)}
                              className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition cursor-pointer"
                              title="Super Admin: Override Lisensi & Status"
                            >
                              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </>
                        )}

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
        onSuccess={(user, token) => {
          if (token && user) {
            login(token, user);
          }
          setIsAuthModalOpen(false);
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

      {/* Easy-Tunnel WireGuard Modal */}
      <EasyTunnelModal
        isOpen={isEasyTunnelModalOpen}
        onClose={() => setIsEasyTunnelModalOpen(false)}
      />

      {/* Backup & Disaster Recovery Studio Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* 👑 Super Admin: User Management Modal */}
      <AdminUserManagementModal
        isOpen={isAdminUserManagementOpen}
        onClose={() => setIsAdminUserManagementOpen(false)}
        onUserUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
          queryClient.invalidateQueries({ queryKey: ['auth-me-profile'] });
        }}
      />

      {/* 👑 Super Admin: Transfer Invitation Ownership Modal */}
      <AdminTransferModal
        isOpen={Boolean(adminTransferTarget)}
        onClose={() => setAdminTransferTarget(null)}
        invitation={adminTransferTarget}
        onTransferred={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
        }}
      />

      {/* 👑 Super Admin: License & Feature Override Modal */}
      <AdminOverrideModal
        isOpen={Boolean(adminOverrideTarget)}
        onClose={() => setAdminOverrideTarget(null)}
        invitation={adminOverrideTarget}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations-list'] });
        }}
      />
    </div>
  );
};
