import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  User,
  Sparkles,
  X,
  Loader2,
  LogIn,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Crown,
  CheckCircle2,
  Mail,
  UserPlus,
  AlertCircle,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api/client';

interface VendorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export type AuthMode = 'login' | 'register';
export type UserRoleChoice = 'USER' | 'RESELLER';

interface AuthErrorDetail {
  message: string;
  action?: 'switch_to_login' | 'switch_to_register';
}

export const VendorAuthModal: React.FC<VendorAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRoleChoice>('USER');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<AuthErrorDetail | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    if (mode === 'register' && !name.trim()) {
      setErrorDetail({ message: 'Silakan isi Nama Lengkap atau Nama Studio Anda.' });
      return;
    }

    setIsLoading(true);
    setErrorDetail(null);

    try {
      const res = await api.sendOtp({
        phone: phone.trim(),
        name: name.trim() || undefined,
        role: role,
        email: email.trim() || undefined,
        mode: mode
      });

      if (res.success) {
        setCooldown(res.cooldownSeconds || 60);
        setStep('otp');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.alreadyRegistered) {
        setErrorDetail({
          message: data.message || 'Nomor WhatsApp ini sudah terdaftar.',
          action: 'switch_to_login'
        });
      } else if (data?.notRegistered) {
        setErrorDetail({
          message: data.message || 'Nomor WhatsApp belum terdaftar.',
          action: 'switch_to_register'
        });
      } else {
        setErrorDetail({
          message: data?.message || 'Gagal mengirim kode OTP. Silakan periksa kembali nomor Anda.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      setErrorDetail({ message: 'Silakan masukkan 6 digit kode OTP yang diterima.' });
      return;
    }

    setIsLoading(true);
    setErrorDetail(null);

    try {
      const res = await api.verifyOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        name: name.trim() || undefined,
        role: role,
        email: email.trim() || undefined,
        mode: mode
      });

      if (res.data?.token) {
        localStorage.setItem('absenta_auth_token', res.data.token);
        localStorage.setItem('absenta_auth_user', JSON.stringify(res.data.user));
        onSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorDetail({
        message: err.response?.data?.message || 'Kode OTP tidak valid atau telah kedaluwarsa.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorDetail(null);

    try {
      const res = await api.sendOtp({
        phone: phone.trim(),
        name: name.trim() || undefined,
        role: role,
        email: email.trim() || undefined,
        mode: mode
      });

      if (res.success) {
        setCooldown(res.cooldownSeconds || 60);
      }
    } catch (err: any) {
      setErrorDetail({
        message: err.response?.data?.message || 'Gagal mengirim ulang kode OTP.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login (Langsung Terbitkan Token)
  const handleQuickDemoLogin = async (demoPhone: string, demoName: string, demoRole: UserRoleChoice) => {
    setPhone(demoPhone);
    setName(demoName);
    setRole(demoRole);
    setIsLoading(true);
    setErrorDetail(null);

    try {
      const res = await api.loginWithWhatsApp({
        phone: demoPhone,
        name: demoName,
        role: demoRole,
        mode: 'login'
      });

      if (res.data?.token) {
        localStorage.setItem('absenta_auth_token', res.data.token);
        localStorage.setItem('absenta_auth_user', JSON.stringify(res.data.user));
        onSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorDetail({ message: 'Gagal masuk akun demo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-lg rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-36 w-36 rounded-full bg-[#c4a661]/15 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900/80 cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c4a661] via-amber-400 to-[#8a7238] flex items-center justify-center text-neutral-950 font-serif font-bold text-xl mx-auto mb-2.5 shadow-lg">
            {step === 'otp' ? <KeyRound className="w-5 h-5" /> : 'L'}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            {step === 'otp'
              ? 'Verifikasi WhatsApp OTP'
              : mode === 'login'
              ? 'Masuk ke Studio Editor'
              : 'Registrasi Akun Resmi'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {step === 'otp'
              ? `Kode verifikasi 6 digit telah dikirim ke nomor WhatsApp ${phone}.`
              : mode === 'login'
              ? 'Akses aman menggunakan verifikasi kode OTP resmi via WhatsApp.'
              : 'Pilih tipe akun dan verifikasi nomor WhatsApp Anda.'}
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Daftar (Hanya di Step Input) */}
        {step === 'input' && (
          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorDetail(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#c4a661] text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorDetail(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#c4a661] text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        )}

        {/* Role Selection Cards (Hanya Tampil Saat Mode Registrasi di Step Input) */}
        {step === 'input' && mode === 'register' && (
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Pilih Kategori Akun Anda <span className="text-[#c4a661]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opsi 1: User Personal */}
              <div
                onClick={() => setRole('USER')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                  role === 'USER'
                    ? 'bg-[#c4a661]/10 border-[#c4a661] text-white shadow-lg'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      role === 'USER' ? 'bg-[#c4a661] text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">User Personal</div>
                      <div className="text-[10px] text-neutral-400">Pemilik Acara / Pengantin</div>
                    </div>
                  </div>
                  {role === 'USER' && <CheckCircle2 className="w-4 h-4 text-[#c4a661] shrink-0" />}
                </div>
                <p className="text-[10px] text-neutral-400 leading-snug">
                  Ideal untuk membuat dan mengelola undangan pernikahan atau acara keluarga sendiri.
                </p>
              </div>

              {/* Opsi 2: Mitra Reseller / Percetakan */}
              <div
                onClick={() => setRole('RESELLER')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                  role === 'RESELLER'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      role === 'RESELLER' ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
                    }`}>
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300">Mitra Reseller & WO</div>
                      <div className="text-[10px] text-neutral-400">Percetakan & Vendor Pro</div>
                    </div>
                  </div>
                  {role === 'RESELLER' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-neutral-400 leading-snug">
                  Multi-proyek klien, saldo token hemat (Rp 45rb/acara), dan akses Print Kit HD.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'input' && mode === 'login' && (
          <div className="mb-4 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-2.5 text-xs text-neutral-400">
            <Sparkles className="w-4 h-4 text-[#c4a661] shrink-0" />
            <span>Sistem akan otomatis mendeteksi role akun Anda (<strong>Personal</strong> atau <strong>Mitra Reseller</strong>).</span>
          </div>
        )}

        {/* Error Notification Banner dengan Pesan Jelas & Tombol Switcher */}
        {errorDetail && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorDetail.message}</div>
            </div>

            {errorDetail.action === 'switch_to_login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorDetail(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Pindah ke Tab Masuk (Login) Sekarang</span>
              </button>
            )}

            {errorDetail.action === 'switch_to_register' && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorDetail(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Pindah ke Tab Daftar Akun Baru</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 1: FORM INPUT WHATSAPP & PROFILE */}
        {step === 'input' && (
          <form onSubmit={handleRequestOtp} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Nomor WhatsApp Aktif <span className="text-[#c4a661]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorDetail) setErrorDetail(null);
                  }}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] text-sm font-mono"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Kode verifikasi OTP 6 digit akan dikirimkan ke nomor ini.
              </span>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  {role === 'RESELLER' ? 'Nama Usaha / Vendor / Studio' : 'Nama Lengkap'}
                  <span className="text-[#c4a661]"> *</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorDetail) setErrorDetail(null);
                    }}
                    placeholder={role === 'RESELLER' ? 'Contoh: Baraya Digital Wedding' : 'Contoh: Ahmad Pratama'}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Alamat Email <span className="text-neutral-500 font-normal">(Opsional untuk E-Invoice)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorDetail) setErrorDetail(null);
                    }}
                    placeholder="Contoh: studio@domain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#c4a661]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#c4a661] to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kirim Kode OTP WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFIKASI KODE OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="text-center">
              <label className="block text-neutral-300 font-semibold mb-2 text-xs">
                Masukkan 6 Digit Kode OTP:
              </label>
              <input
                ref={otpInputRef}
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(val);
                  if (errorDetail) setErrorDetail(null);
                }}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-neutral-950 border-2 border-[#c4a661] rounded-2xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c4a661]/40 shadow-inner"
              />
              <span className="text-[11px] text-neutral-400 mt-2 block">
                Kode OTP telah dikirimkan ke WhatsApp <span className="font-mono text-white font-bold">{phone}</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#c4a661] to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi OTP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Masuk Sekarang</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setErrorDetail(null);
                }}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ubah Nomor HP</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isLoading}
                className="hover:text-[#c4a661] disabled:opacity-50 flex items-center gap-1 cursor-pointer transition disabled:cursor-not-allowed font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim Ulang OTP'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Options */}
        <div className="mt-5 pt-3.5 border-t border-neutral-800/80 text-center space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">
            Akses Cepat Akun Demo (Bypass Testing):
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('081288990011', 'Baraya Studio', 'USER')}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#c4a661]" />
              <span>User Personal</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('085711223344', 'Vendor Mitra Percetakan', 'RESELLER')}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-amber-300 text-[11px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Mitra Reseller</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
