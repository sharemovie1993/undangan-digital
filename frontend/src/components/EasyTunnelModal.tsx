import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import {
  Globe,
  Zap,
  ZapOff,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  X,
  Radio,
  Server,
  Activity
} from 'lucide-react';

interface EasyTunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasyTunnelModal: React.FC<EasyTunnelModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [tunnels, setTunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'setup' | 'buy' | 'custom_domain'>('list');
  const [wgStatus, setWgStatus] = useState<{
    installed: boolean;
    is_windows: boolean;
    is_admin: boolean;
    platform?: string;
    hostname?: string;
    os_name?: string;
    os_type?: string;
  }>({
    installed: true,
    is_windows: false,
    is_admin: true
  });

  // Setup Form
  const [setupKey, setSetupKey] = useState('');
  const [setupSlug, setSetupSlug] = useState('');
  const [setupPort, setSetupPort] = useState(4001);
  const [setupName, setSetupName] = useState('Studio Undangan Digital');
  const [setupLoading, setSetupLoading] = useState(false);

  // Buy Form
  const [packages, setPackages] = useState<any[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('QRIS2');
  const [customerName, setCustomerName] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isInvoicePaid, setIsInvoicePaid] = useState(false);
  const [checkingInvoice, setCheckingInvoice] = useState(false);

  // Custom Domain Form
  const [selectedTunnelId, setSelectedTunnelId] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);

  // Diagnostic
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleCheckInvoice = async (invoiceNum?: string, silent = false) => {
    const inv = invoiceNum || invoiceData?.invoice_number;
    if (!inv) return;
    if (!silent) setCheckingInvoice(true);
    try {
      const res = await api.checkEasyTunnelInvoice(inv);
      const isPaid = res?.data?.status === 'paid' || res?.status === 'paid' || res?.paid === true;
      if (isPaid) {
        setIsInvoicePaid(true);
        if (!silent) showToast('success', 'Pembayaran berhasil terverifikasi!');
      } else {
        if (!silent) showToast('info', 'Pembayaran belum terdeteksi. Silakan selesaikan pembayaran.');
      }
    } catch (err: any) {
      if (!silent) showToast('error', 'Gagal memeriksa status invoice: ' + err.message);
    } finally {
      if (!silent) setCheckingInvoice(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (invoiceData?.invoice_number && !isInvoicePaid) {
      handleCheckInvoice(invoiceData.invoice_number, true);
      timer = setInterval(() => {
        handleCheckInvoice(invoiceData.invoice_number, true);
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [invoiceData?.invoice_number, isInvoicePaid]);

  const loadData = async () => {
    try {
      const [tunRes, wgRes] = await Promise.all([
        api.getEasyTunnels(),
        api.checkWgInstalled()
      ]);
      if (tunRes.success) setTunnels(tunRes.data || []);
      if (wgRes.success) setWgStatus(wgRes);
    } catch (e: any) {
      console.warn('Failed loading tunnels:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      const interval = setInterval(loadData, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadPackagesAndChannels = async () => {
    try {
      const [pkgs, channels] = await Promise.all([
        api.getEasyTunnelPackages(),
        api.getEasyTunnelPaymentChannels()
      ]);
      if (pkgs.success) {
        setPackages(pkgs.data || []);
        if (pkgs.data?.[0]) setSelectedPkg(pkgs.data[0].id);
      }
      if (channels.success) setPaymentChannels(channels.data || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'buy') {
      loadPackagesAndChannels();
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleInstallWg = async () => {
    setActionLoading((prev) => ({ ...prev, install: true }));
    try {
      const res = await api.installWg();
      showToast(res.success ? 'success' : 'error', res.message);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memasang WireGuard');
    } finally {
      setActionLoading((prev) => ({ ...prev, install: false }));
    }
  };

  const handleStart = async (id: string, name: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await api.startEasyTunnel(id);
      showToast('success', res.message || `Terowongan ${name} berhasil diaktifkan!`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengaktifkan terowongan');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStop = async (id: string, name: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await api.stopEasyTunnel(id);
      showToast('success', res.message || `Terowongan ${name} berhasil dinonaktifkan.`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menonaktifkan terowongan');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isOk = await confirm({
      title: 'Hapus Terowongan VPN?',
      description: `Apakah Anda yakin ingin menghapus terowongan "${name}"? Lisensi akan dilepas dan dapat didaftarkan kembali.`,
      isDestructive: true
    });
    if (!isOk) return;

    try {
      await api.deleteEasyTunnel(id);
      showToast('success', 'Terowongan berhasil dihapus.');
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus terowongan');
    }
  };

  const handleDiagnose = async (id: string) => {
    try {
      const res = await api.diagnoseEasyTunnel(id);
      setDiagnostics((prev) => ({ ...prev, [id]: res.data }));
      showToast('info', 'Diagnostik WireGuard selesai diperbarui.');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menjalankan diagnostik');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupKey || !setupSlug) {
      showToast('error', 'License Key dan Subdomain Slug wajib diisi');
      return;
    }
    setSetupLoading(true);
    try {
      const res = await api.setupEasyTunnel({
        license_key: setupKey,
        subdomain_slug: setupSlug,
        local_port: setupPort,
        app_name: setupName
      });
      showToast('success', res.message || 'Terowongan berhasil dikonfigurasi!');
      setSetupKey('');
      setSetupSlug('');
      setActiveTab('list');
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal melakukan konfigurasi terowongan');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedPkg) {
      showToast('error', 'Nama pemesan dan paket lisensi wajib dipilih.');
      return;
    }
    setBuyLoading(true);
    try {
      const res = await api.buyEasyTunnelLicense({
        school_name: customerName,
        plan_id: selectedPkg,
        payment_method: selectedPayment,
        app_name: setupName || 'Studio Undangan Digital',
        local_port: 4001
      });
      if (res.success && res.data) {
        setInvoiceData(res.data);
        showToast('success', 'Invoice pembayaran berhasil diterbitkan!');
      } else {
        showToast('error', res.message || 'Gagal menerbitkan invoice.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal melakukan transaksi.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTunnelId || !customDomainInput) return;
    setDomainLoading(true);
    try {
      const res = await api.setEasyTunnelCustomDomain(selectedTunnelId, customDomainInput);
      showToast('success', res.message || 'Custom domain berhasil dipasang!');
      setCustomDomainInput('');
      setActiveTab('list');
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memasang custom domain');
    } finally {
      setDomainLoading(false);
    }
  };

  const handleRemoveDomain = async (id: string) => {
    const isOk = await confirm({
      title: 'Lepas Custom Domain?',
      description: 'Aplikasi akan kembali menggunakan subdomain default Easy-Tunnel.',
      isDestructive: true
    });
    if (!isOk) return;

    try {
      await api.removeEasyTunnelCustomDomain(id);
      showToast('success', 'Custom domain berhasil dilepas.');
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal melepas custom domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Tautan disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Easy-Tunnel Cloud Hub
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  WireGuard Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Akses publik instan & aman untuk server undangan lokal maupun VPS tanpa perlu konfigurasi router.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System & OS Info Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 font-medium text-slate-200 shadow-sm">
              {wgStatus.is_windows ? '🪟 Windows On-Premise' : '🐧 Linux Server (Ubuntu)'}
            </span>
            {wgStatus.hostname && (
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                Host: <strong className="text-slate-200">{wgStatus.hostname}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
              wgStatus.installed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${wgStatus.installed ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {wgStatus.installed ? 'WireGuard Engine Terpasang' : 'WireGuard Belum Terpasang'}
            </span>
          </div>
        </div>

        {/* WireGuard Status Alert (if not installed) */}
        {!wgStatus.installed && (
          <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                WireGuard client belum terpasang di sistem ini. Diperlukan untuk menghubungkan terowongan.
              </span>
            </div>
            <button
              onClick={handleInstallWg}
              disabled={actionLoading['install']}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              {actionLoading['install'] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Pasang WireGuard
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/20">
          <button
            onClick={() => { setActiveTab('list'); setInvoiceData(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Terowongan Aktif ({tunnels.length})
          </button>
          <button
            onClick={() => { setActiveTab('setup'); setInvoiceData(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'setup'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Pasang Lisensi
          </button>
          <button
            onClick={() => { setActiveTab('buy'); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'buy'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Beli Lisensi (QRIS)
          </button>
          {tunnels.length > 0 && (
            <button
              onClick={() => {
                setSelectedTunnelId(tunnels[0]?.id || '');
                setActiveTab('custom_domain');
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'custom_domain'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              Custom Domain
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: LIST TUNNELS */}
          {activeTab === 'list' && (
            <div>
              {loading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                  <p>Memuat status terowongan cloud...</p>
                </div>
              ) : tunnels.length === 0 ? (
                <div className="py-12 px-4 border border-dashed border-slate-700 rounded-xl text-center flex flex-col items-center justify-center gap-3 bg-slate-950/30">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-200">Belum Ada Terowongan Aktif</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Hubungkan server undangan lokal atau VPS Anda ke publik dengan memasang lisensi Easy-Tunnel atau membeli paket baru secara instan.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                    >
                      Input Lisensi Eksisting
                    </button>
                    <button
                      onClick={() => setActiveTab('buy')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Beli Lisensi Baru
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {tunnels.map((tunnel) => {
                    const isConnected = tunnel.wg_status?.status === 'connected';
                    const isExpired = tunnel.status === 'expired';
                    const publicUrl = tunnel.customDomain
                      ? `https://${tunnel.customDomain}`
                      : tunnel.public_url;

                    return (
                      <div
                        key={tunnel.id}
                        className={`p-5 rounded-xl border transition-all ${
                          isConnected
                            ? 'bg-slate-950/60 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                            : isExpired
                            ? 'bg-slate-950/60 border-rose-500/30'
                            : 'bg-slate-950/40 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Info */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isConnected
                                    ? 'bg-emerald-400 animate-ping'
                                    : isExpired
                                    ? 'bg-rose-500'
                                    : 'bg-slate-500'
                                }`}
                              />
                              <h4 className="font-bold text-base text-slate-100">{tunnel.appName}</h4>
                              <span
                                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border uppercase tracking-wider ${
                                  isConnected
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : isExpired
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isConnected ? 'ONLINE (CONNECTED)' : isExpired ? 'KEDALUWARSA' : 'OFFLINE'}
                              </span>
                            </div>

                            {/* URL Link */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-semibold text-slate-400">Tautan Publik:</span>
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 max-w-full overflow-hidden">
                                <span className="truncate">{publicUrl}</span>
                                <button
                                  onClick={() => copyToClipboard(publicUrl)}
                                  className="text-slate-400 hover:text-amber-300 p-0.5"
                                  title="Salin Link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-amber-300 p-0.5"
                                  title="Buka Halaman"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            {/* Meta details */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                              <span>Port Lokal: <strong className="text-slate-300">{tunnel.localPort}</strong></span>
                              <span>•</span>
                              <span>IP VPN: <strong className="text-slate-300">{tunnel.wg_status?.wg_ip || '-'}</strong></span>
                              <span>•</span>
                              <span>
                                Masa Aktif:{' '}
                                <strong className="text-slate-300">
                                  {tunnel.expiresAt
                                    ? new Date(tunnel.expiresAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })
                                    : 'Selamanya / Lifetime'}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isConnected ? (
                              <button
                                onClick={() => handleStop(tunnel.id, tunnel.appName)}
                                disabled={actionLoading[tunnel.id]}
                                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
                              >
                                {actionLoading[tunnel.id] ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ZapOff className="w-3.5 h-3.5" />
                                )}
                                Matikan
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStart(tunnel.id, tunnel.appName)}
                                disabled={actionLoading[tunnel.id] || isExpired}
                                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {actionLoading[tunnel.id] ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5" />
                                )}
                                Aktifkan
                              </button>
                            )}

                            <button
                              onClick={() => handleDiagnose(tunnel.id)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                              title="Diagnostik Koneksi"
                            >
                              <Activity className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(tunnel.id, tunnel.appName)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all"
                              title="Hapus Terowongan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Diagnostics result dropdown */}
                        {diagnostics[tunnel.id] && (
                          <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono bg-slate-900/90 p-3 rounded-lg text-slate-300 overflow-x-auto">
                            <div className="flex items-center justify-between mb-1 text-[11px] font-sans text-slate-400">
                              <span>Log Diagnostik WireGuard:</span>
                              <span>{diagnostics[tunnel.id].timestamp}</span>
                            </div>
                            <pre className="text-[11px] text-amber-300">
                              {JSON.stringify(diagnostics[tunnel.id], null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETUP LISENSI EKSISTING */}
          {activeTab === 'setup' && (
            <form onSubmit={handleSetup} className="space-y-4 max-w-xl mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">License Key Easy-Tunnel</label>
                <input
                  type="text"
                  required
                  placeholder="ET-XXXX-XXXX-XXXX"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm font-mono text-amber-300 placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Subdomain Slug (Misal: nikah-luxe)</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="nikah-luxe"
                      value={setupSlug}
                      onChange={(e) => setSetupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200 placeholder-slate-600"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">Hasil: https://{setupSlug || 'slug'}.absenta.id</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Port Web Lokal</label>
                  <input
                    type="number"
                    required
                    value={setupPort}
                    onChange={(e) => setSetupPort(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200"
                  />
                  <span className="text-[11px] text-slate-500">Port backend Fastify (Default: 4001)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nama Aplikasi / Label</label>
                <input
                  type="text"
                  required
                  placeholder="Studio Undangan Digital"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={setupLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {setupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Daftarkan & Pasang Konfigurasi WireGuard
              </button>
            </form>
          )}

          {/* TAB 3: BELI LISENSI BARU (QRIS) */}
          {activeTab === 'buy' && (
            <div className="space-y-5">
              {!invoiceData ? (
                <form onSubmit={handleBuy} className="space-y-4 max-w-xl mx-auto">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nama Instansi / Pemesan</label>
                    <input
                      type="text"
                      required
                      placeholder="Studio Undangan Luxe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200"
                    />
                  </div>

                  {/* Packages */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Pilih Paket Durasi</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkg(pkg.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedPkg === pkg.id
                              ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-sm text-slate-200">{pkg.title || pkg.duration}</div>
                          <div className="text-xs font-semibold text-amber-400 mt-1">{pkg.price}</div>
                          {pkg.badge && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300">
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Metode Pembayaran</label>
                    <select
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200"
                    >
                      <option value="QRIS2">QRIS Instant (Semua Bank & E-Wallet)</option>
                      {paymentChannels.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={buyLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {buyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Terbitkan Invoice & Bayar Sekarang
                  </button>
                </form>
              ) : isInvoicePaid ? (
                /* Invoice Paid Success Card */
                <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="inline-flex p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-emerald-400">Pembayaran Berhasil!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Invoice <span className="font-mono text-white font-bold">{invoiceData.invoice_number}</span> telah terverifikasi lunas.
                    </p>
                  </div>

                  {invoiceData.license_key && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kunci Lisensi Anda (License Key):
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                        <code className="font-mono font-bold text-sm text-amber-300 select-all truncate">
                          {invoiceData.license_key}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(invoiceData.license_key);
                            showToast('success', 'License key berhasil disalin!');
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!invoiceData.license_key) {
                        setInvoiceData(null);
                        setIsInvoicePaid(false);
                        setActiveTab('setup');
                        return;
                      }
                      setSetupLoading(true);
                      try {
                        const targetSlug = setupSlug || invoiceData.subdomain_slug || 'undangan';
                        const res = await api.setupEasyTunnel({
                          license_key: invoiceData.license_key,
                          subdomain_slug: targetSlug,
                          local_port: setupPort || 4001,
                          app_name: setupName || 'Studio Undangan Digital'
                        });
                        showToast('success', res.message || 'Terowongan berhasil dikonfigurasi & diaktifkan!');
                        setInvoiceData(null);
                        setIsInvoicePaid(false);
                        setActiveTab('list');
                        loadData();
                      } catch (err: any) {
                        showToast('error', err.message || 'Gagal konfigurasi otomatis. Silakan pasang manual.');
                        setSetupKey(invoiceData.license_key);
                        setActiveTab('setup');
                      } finally {
                        setSetupLoading(false);
                      }
                    }}
                    disabled={setupLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {setupLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memasang Terowongan...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>⚡ Pasang & Hubungkan Terowongan Sekarang</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (invoiceData.license_key) setSetupKey(invoiceData.license_key);
                      setInvoiceData(null);
                      setIsInvoicePaid(false);
                      setActiveTab('list');
                      loadData();
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Tutup & Pasang Nanti
                  </button>
                </div>
              ) : (
                /* Invoice Waiting Payment Display */
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-100">Menunggu Pembayaran</h4>
                    <p className="text-xs font-mono text-amber-300">{invoiceData.invoice_number}</p>
                  </div>

                  {invoiceData.qr_url && (
                    <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                      <img
                        src={invoiceData.qr_url}
                        alt="QRIS Payment"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  )}

                  <div className="text-sm font-semibold text-slate-300">
                    Total Tagihan: <span className="text-amber-400 text-base font-bold">Rp {Number(invoiceData.amount || 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Mengecek status pembayaran secara realtime...</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleCheckInvoice(invoiceData.invoice_number, false)}
                      disabled={checkingInvoice}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingInvoice ? 'animate-spin' : ''}`} />
                      <span>{checkingInvoice ? 'Memeriksa Pembayaran...' : 'Cek Status Pembayaran Sekarang'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setInvoiceData(null);
                        setActiveTab('list');
                        loadData();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Batal / Bayar Nanti
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOM DOMAIN */}
          {activeTab === 'custom_domain' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Info className="w-4 h-4" />
                  Panduan DNS CNAME Custom Domain
                </div>
                <p>
                  Untuk menggunakan domain sendiri (misal: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">undangan.domainanda.com</code>), tambahkan DNS record berikut di DNS Management provider domain Anda:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-slate-300">
                  Type: <strong>CNAME</strong> | Host: <strong>undangan</strong> | Value: <strong>app.absenta.id</strong>
                </div>
              </div>

              <form onSubmit={handleSaveDomain} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pilih Terowongan</label>
                  <select
                    value={selectedTunnelId}
                    onChange={(e) => setSelectedTunnelId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200"
                  >
                    {tunnels.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.appName} ({t.slug}.absenta.id)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nama Domain Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="undangan.domainanda.com"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-sm text-slate-200 placeholder-slate-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={domainLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {domainLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Daftarkan Custom Domain
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
