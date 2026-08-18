import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  User,
  X,
  Loader2,
  LogIn,
  ShieldCheck,
  Crown,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface VendorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export type AuthMode = 'login' | 'register';
export type UserRoleChoice = 'USER' | 'RESELLER' | 'PERCETAKAN';

interface AuthErrorDetail {
  message: string;
  action?: 'switch_to_login' | 'switch_to_register';
}

export const VendorAuthModal: React.FC<VendorAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRoleChoice>('USER');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<AuthErrorDetail | null>(null);

  useEffect(() => {
    setErrorDetail(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setPhone('');
      setName('');
      setPassword('');
      setConfirmPassword('');
      setErrorDetail(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAndSuccess = (data: { token: string; user: any }, isNewRegistration: boolean = false) => {
    // Simpan token dulu sebelum apapun
    localStorage.setItem('absenta_auth_token', data.token);
    localStorage.setItem('absenta_auth_user', JSON.stringify(data.user));

    if (isNewRegistration) {
      showToast(
        'success',
        `Selamat datang di LuxeInvite Studio, ${data.user?.name || 'Vendor'}! Akun Anda telah aktif dan siap digunakan.`,
        'Pendaftaran Berhasil 🎉'
      );
    } else {
      showToast(
        'success',
        `Selamat datang kembali, ${data.user?.name || 'Vendor'}!`,
        'Login Berhasil ✨'
      );
    }

    // Defer onSuccess+onClose agar finally block tidak jalan pada unmounted component
    setTimeout(() => {
      onSuccess(data.user, data.token);
      onClose();
    }, 0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setErrorDetail({ message: 'Nomor WhatsApp / HP wajib diisi.' }); return; }
    if (!password.trim()) { setErrorDetail({ message: 'Password wajib diisi.' }); return; }
    setIsLoading(true);
    setErrorDetail(null);
    try {
      const res = await api.login({ phone: phone.trim(), password: password.trim() } as any);
      // res sudah merupakan response body: { success, data: { token, user } }
      const payload = res?.data ?? res;
      if (payload?.token) {
        saveAndSuccess(payload, false);
        return; // pastikan tidak lanjut ke catch
      }

    } catch (err: any) {
      const data = err.response?.data;
      if (data?.notFound) {
        setErrorDetail({ message: 'Nomor HP belum terdaftar.', action: 'switch_to_register' });
      } else if (data?.wrongPassword) {
        setErrorDetail({ message: 'Password yang Anda masukkan salah.' });
      } else {
        setErrorDetail({ message: data?.message || 'Login gagal. Silakan coba lagi.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorDetail({ message: 'Nama lengkap wajib diisi.' }); return; }
    if (!phone.trim()) { setErrorDetail({ message: 'Nomor WhatsApp / HP wajib diisi.' }); return; }
    if (password.length < 8) { setErrorDetail({ message: 'Password minimal 8 karakter.' }); return; }
    if (password !== confirmPassword) { setErrorDetail({ message: 'Konfirmasi password tidak cocok.' }); return; }
    setIsLoading(true);
    setErrorDetail(null);
    try {
      const res = await api.register({
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: role,
        email: `${phone.replace(/[^0-9]/g, '')}@luxeinvite.id`
      });
      const payload = res?.data ?? res;
      if (payload?.token) {
        saveAndSuccess(payload, true);
        return;
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.alreadyRegistered) {
        setErrorDetail({ message: 'Nomor HP sudah terdaftar.', action: 'switch_to_login' });
      } else {
        setErrorDetail({ message: data?.message || 'Pendaftaran gagal. Silakan coba lagi.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[#c4a661] focus:ring-1 focus:ring-[#c4a661]/30 transition';

  const isLogin = mode === 'login';
  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4;
  const pwStrengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-green-500'];
  const pwStrengthLabels = ['', 'Terlalu pendek', 'Lemah', 'Cukup', 'Kuat'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto"
          >
            {/* Header (Fixed) */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c4a661] to-amber-600 flex items-center justify-center shadow-lg shrink-0">
                  <Crown className="w-3.5 h-3.5 text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">LuxeInvite Studio</p>
                  <h2 className="text-white font-bold text-sm sm:text-base leading-tight">
                    {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
                  </h2>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            {/* Tabs (Fixed) */}
            <div className="flex border-b border-neutral-800 shrink-0 bg-neutral-950/80">
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === m ? 'text-[#c4a661] border-b-2 border-[#c4a661] bg-[#c4a661]/5' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {m === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {m === 'login' ? 'Masuk' : 'Daftar Akun'}
                </button>
              ))}
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
              <AnimatePresence mode="wait">
                {errorDetail && (
                  <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-300 text-xs">{errorDetail.message}</p>
                      {errorDetail.action && (
                        <button onClick={() => { setMode(errorDetail.action === 'switch_to_login' ? 'login' : 'register'); setErrorDetail(null); }}
                          className="mt-1 text-[#c4a661] text-[11px] font-semibold hover:underline cursor-pointer">
                          {errorDetail.action === 'switch_to_login' ? '→ Masuk sekarang' : '→ Daftar sekarang'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin ? (
                <motion.form key="login" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Nomor WhatsApp / HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input autoFocus type="tel" required value={phone} onChange={e => { setPhone(e.target.value); setErrorDetail(null); }}
                        placeholder="08xxxxxxxxxx" className={inputClass + ' pl-9'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input type={showPassword ? 'text' : 'password'} required value={password}
                        onChange={e => { setPassword(e.target.value); setErrorDetail(null); }}
                        placeholder="Masukkan password Anda" className={inputClass + ' pl-9 pr-9'} />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-[#c4a661] to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    {isLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Memeriksa...</span></> : <><LogIn className="w-3.5 h-3.5" /><span>Masuk Sekarang</span></>}
                  </button>
                  <p className="text-center text-neutral-500 text-xs pt-1">
                    Belum punya akun?{' '}
                    <button type="button" onClick={() => setMode('register')} className="text-[#c4a661] font-semibold hover:underline cursor-pointer">Daftar di sini</button>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Daftar Sebagai</label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {([
                        { value: 'USER' as UserRoleChoice, icon: '👤', label: 'Personal', desc: 'Acara pribadi' },
                        { value: 'RESELLER' as UserRoleChoice, icon: '🤝', label: 'Reseller', desc: 'Jasa & desainer' },
                        { value: 'PERCETAKAN' as UserRoleChoice, icon: '🖨️', label: 'Percetakan/WO', desc: 'Vendor cetak' }
                      ]).map(r => (
                        <button key={r.value} type="button" onClick={() => setRole(r.value)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${role === r.value ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661]' : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600 text-white'}`}>
                          <div className="text-sm mb-0.5">{r.icon}</div>
                          <div className={`text-[11px] font-bold truncate ${role === r.value ? 'text-[#c4a661]' : 'text-white'}`}>{r.label}</div>
                          <div className="text-[8px] text-neutral-400 mt-0.5 leading-tight truncate">{r.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Benefit Highlight for Business Partners */}
                    {(role === 'RESELLER' || role === 'PERCETAKAN') && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-[10px] text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Termasuk akses <strong>Reseller Partner Hub</strong>, White-Label Studio & Modal Grosir!</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">
                      {role === 'PERCETAKAN' ? 'Nama Percetakan / Usaha WO' : role === 'RESELLER' ? 'Nama Studio / Brand Jasa' : 'Nama Lengkap Anda'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input autoFocus type="text" required value={name} onChange={e => { setName(e.target.value); setErrorDetail(null); }}
                        placeholder={role === 'PERCETAKAN' ? 'Nama Percetakan / Usaha Anda' : role === 'RESELLER' ? 'Nama Studio / Brand Anda' : 'Nama lengkap Anda'}
                        className={inputClass + ' pl-9'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Nomor WhatsApp / HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input type="tel" required value={phone} onChange={e => { setPhone(e.target.value); setErrorDetail(null); }}
                        placeholder="08xxxxxxxxxx" className={inputClass + ' pl-9'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">
                      Password <span className="text-neutral-500 normal-case font-normal">(min. 8 karakter)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password}
                        onChange={e => { setPassword(e.target.value); setErrorDetail(null); }}
                        placeholder="Buat password yang kuat" className={inputClass + ' pl-9 pr-9'} />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthColors[pwStrength] : 'bg-neutral-700'}`} />)}
                        <span className="text-[9px] text-neutral-400 ml-1 whitespace-nowrap">{pwStrengthLabels[pwStrength]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Konfirmasi Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                      <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setErrorDetail(null); }}
                        placeholder="Ulangi password Anda"
                        className={`${inputClass} pl-9 pr-9 ${confirmPassword && confirmPassword !== password ? 'border-red-500/60' : confirmPassword && confirmPassword === password ? 'border-green-500/50' : ''}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer">
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {confirmPassword && confirmPassword === password && (
                        <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500 pointer-events-none" />
                      )}
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-[#c4a661] to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    {isLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Membuat akun...</span></> : <><Sparkles className="w-3.5 h-3.5" /><span>Daftar Sekarang</span></>}
                  </button>
                  <p className="text-center text-neutral-500 text-xs pt-1">
                    Sudah punya akun?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-[#c4a661] font-semibold hover:underline cursor-pointer">Masuk di sini</button>
                  </p>
                </motion.form>
              )}

              <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 text-center">
                <KeyRound className="w-3 h-3 shrink-0 text-[#c4a661]" />
                <span>Data terenkripsi dan aman. Tidak memerlukan kode OTP.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VendorAuthModal;
