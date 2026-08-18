import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Coins,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  X,
  Plus,
  Loader2,
  Phone,
  Mail,
  FolderOpen
} from 'lucide-react';
import { adminApi, AdminUserItem } from '../api/admin.api';
import { useToast } from '../context/ToastContext';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserForToken, setSelectedUserForToken] = useState<AdminUserItem | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number>(5);
  const [tokenMode, setTokenMode] = useState<'add' | 'set'>('add');
  const [isUpdatingToken, setIsUpdatingToken] = useState<boolean>(false);

  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserItem | null>(null);
  const [newRole, setNewRole] = useState<string>('USER');
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat daftar pengguna.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserForToken(null);
      setSelectedUserForRole(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const handleSaveToken = async () => {
    if (!selectedUserForToken) return;
    try {
      setIsUpdatingToken(true);
      const res = await adminApi.updateTokens(selectedUserForToken.id, tokenAmount, tokenMode);
      showToast(
        'success',
        `Saldo ${res.name} berhasil diubah menjadi ${res.quotaTokens} Token.`,
        'Token Berhasil Diperbarui'
      );
      setSelectedUserForToken(null);
      loadUsers();
      if (onUserUpdated) onUserUpdated();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memperbarui saldo token.', 'Error');
    } finally {
      setIsUpdatingToken(false);
    }
  };

  const handleSaveRole = async () => {
    if (!selectedUserForRole) return;
    try {
      setIsUpdatingRole(true);
      const res = await adminApi.updateRole(selectedUserForRole.id, newRole);
      showToast('success', `Role ${res.name} berhasil diubah menjadi ${res.role}.`, 'Role Diperbarui');
      setSelectedUserForRole(null);
      loadUsers();
      if (onUserUpdated) onUserUpdated();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengubah role pengguna.', 'Error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#111116] border border-[#262633] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 border-b border-[#20202b] bg-[#14141c]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white tracking-wide truncate">
                    User Management & Token Central
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate sm:whitespace-normal">
                  Kelola hak akses pengguna, pemantauan total proyek, dan top-up saldo token aktivasi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer shrink-0 ml-2"
              aria-label="Tutup Modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="p-3.5 sm:p-4 border-b border-[#20202b] bg-[#111116] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, WhatsApp, email, atau role..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#14141c] border border-[#262633] focus:border-indigo-500 focus:outline-none text-xs sm:text-sm text-white placeholder:text-neutral-500 transition"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-neutral-400">
                Total: <strong className="text-white">{filteredUsers.length}</strong> Pengguna
              </span>
              <button
                onClick={loadUsers}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Body Content (User List Table) */}
          <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-3">
            {isLoading && users.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-xs">Memuat data pengguna...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                Tidak ada pengguna yang sesuai dengan pencarian "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredUsers.map((u) => {
                  const roleUpper = (u.role || 'USER').toUpperCase();
                  const isOwnerAdmin = roleUpper === 'ADMIN';

                  return (
                    <div
                      key={u.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#14141c] border border-[#22222e] hover:border-[#38384d] transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm"
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-700 text-neutral-200 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 sm:mt-0 shadow">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[220px] sm:max-w-[300px]">
                              {u.name}
                            </span>
                            {/* Role Badge */}
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                roleUpper === 'ADMIN'
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : roleUpper === 'RESELLER'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : roleUpper === 'PERCETAKAN'
                                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                              }`}
                            >
                              {roleUpper}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 flex-wrap">
                            {u.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-500" />
                                <span>{u.phone}</span>
                              </span>
                            )}
                            {u.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-neutral-500" />
                                <span className="truncate max-w-[180px]">{u.email}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-neutral-300">
                              <FolderOpen className="w-3 h-3 text-neutral-500" />
                              <span>{u.invitationsCount} Undangan</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Token Balance & Actions */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t border-neutral-800/40 md:border-t-0 shrink-0">
                        {/* Token Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-mono text-xs sm:text-sm font-bold">
                            {u.quotaTokens} <span className="text-[10px] font-normal text-neutral-400">Token</span>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForToken(u);
                              setTokenAmount(5);
                              setTokenMode('add');
                            }}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Tambah / Atur Saldo Token"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Token</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUserForRole(u);
                              setNewRole(u.role || 'USER');
                            }}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Ubah Role Pengguna"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Role</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Token Modal Sub-Dialog */}
          <AnimatePresence>
            {selectedUserForToken && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md bg-[#16161f] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-neutral-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Coins className="w-5 h-5" />
                      <span>Kelola Saldo Token: {selectedUserForToken.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedUserForToken(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400">
                    Saldo saat ini: <strong className="text-white font-mono">{selectedUserForToken.quotaTokens} Token</strong>
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">Mode Operasi:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setTokenMode('add')}
                        className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                          tokenMode === 'add'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        ➕ Tambah Saldo (+N)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTokenMode('set')}
                        className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                          tokenMode === 'set'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        🎯 Set Saldo Pasti (=N)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Jumlah Token:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 5, 10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTokenAmount(preset)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 border border-neutral-700 transition cursor-pointer"
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForToken(null)}
                      className="w-1/2 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingToken}
                      onClick={handleSaveToken}
                      className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isUpdatingToken ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Role Modal Sub-Dialog */}
          <AnimatePresence>
            {selectedUserForRole && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md bg-[#16161f] border border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-neutral-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <UserCheck className="w-5 h-5" />
                      <span>Ubah Role: {selectedUserForRole.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedUserForRole(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400">
                    Pilih tingkat hak akses untuk pengguna ini:
                  </p>

                  <div className="space-y-2">
                    {[
                      { role: 'USER', label: 'USER (Pengguna Biasa)', desc: 'Hanya dapat membuat & mengelola undangan sendiri.' },
                      { role: 'RESELLER', label: 'RESELLER (Mitra Penjual)', desc: 'Akses diskon token & fitur reseller studio.' },
                      { role: 'PERCETAKAN', label: 'PERCETAKAN (Vendor Cetak)', desc: 'Akses ekspor Print Kit 300 DPI dan label tamu.' },
                      { role: 'ADMIN', label: 'ADMIN (Super Administrator)', desc: 'Akses penuh seluruh proyek, Easy Tunnel & Backup.' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setNewRole(item.role)}
                        className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                          newRole === item.role
                            ? 'bg-indigo-500/15 border-indigo-500 text-white'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-indigo-300">{item.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{item.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForRole(null)}
                      className="w-1/2 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingRole}
                      onClick={handleSaveRole}
                      className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isUpdatingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Ubah Role</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 border-t border-[#20202b] bg-[#14141c] flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 shrink-0">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <span className="truncate">RBAC Protected: Hanya Super Admin yang memiliki hak akses ini</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition cursor-pointer shrink-0"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
