import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { api } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'RESELLER' | 'PERCETAKAN'>('RESELLER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        if (res.data?.token) {
          localStorage.setItem('absenta_auth_token', res.data.token);
          onSuccess(res.data.user);
          onClose();
        }
      } else {
        const res = await api.register({ name, email, phone, password, role });
        if (res.data?.token) {
          localStorage.setItem('absenta_auth_token', res.data.token);
          onSuccess(res.data.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat memproses otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-6 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[#c4a661]/10 text-[#c4a661] border border-[#c4a661]/30 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white">
            {isLogin ? 'Masuk ke Akun Vendor' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Kelola proyek undangan digital & kuota token lisensi reseller.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#191920] p-1 rounded-xl mb-5 border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${isLogin ? 'bg-[#c4a661] text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${!isLogin ? 'bg-[#c4a661] text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
          >
            Daftar Akun
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="block text-neutral-400 mb-1">Nama Lengkap / Nama Vendor</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Baraya Wedding Organizer"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Peran Akun (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'USER', label: 'Retail' },
                    { id: 'RESELLER', label: 'Reseller WO' },
                    { id: 'PERCETAKAN', label: 'Percetakan' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition ${
                        role === r.id
                          ? 'border-[#c4a661] bg-[#c4a661]/15 text-[#c4a661]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-neutral-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isLoading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Daftar & Dapatkan Akun'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
