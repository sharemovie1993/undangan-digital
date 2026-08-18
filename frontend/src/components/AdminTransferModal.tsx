import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Search, UserCheck, X, Loader2, AlertCircle } from 'lucide-react';
import { adminApi, AdminUserItem } from '../api/admin.api';
import { useToast } from '../context/ToastContext';

interface AdminTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: {
    id: string;
    title: string;
    slug: string;
    userId: string;
    owner?: { name?: string; phone?: string; email?: string };
  } | null;
  onTransferred: () => void;
}

export const AdminTransferModal: React.FC<AdminTransferModalProps> = ({
  isOpen,
  onClose,
  invitation,
  onTransferred
}) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTargetUserId('');
      setSearchQuery('');
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat daftar pengguna tujuan.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (invitation && u.id === invitation.userId) return false; // Jangan tampilkan pemilik saat ini
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const handleTransfer = async () => {
    if (!invitation || !selectedTargetUserId) return;

    try {
      setIsSubmitting(true);
      await adminApi.transferInvitation(invitation.id, selectedTargetUserId);
      showToast(
        'success',
        `Undangan "${invitation.title}" berhasil dialihkan ke pemilik baru!`,
        'Transfer Selesai'
      );
      onTransferred();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memindahkan kepemilikan undangan.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !invitation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#14141d] border border-[#2a2a3d] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222233] bg-[#161622] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Transfer Kepemilikan Undangan</h3>
                <p className="text-xs text-neutral-400">Pindahkan proyek undangan ini ke akun pengguna lain</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Invitation Info */}
          <div className="p-4 bg-[#111118] border-b border-[#20202b] space-y-1.5 shrink-0">
            <div className="text-xs text-neutral-400">Proyek yang Ditransfer:</div>
            <div className="text-sm font-bold text-white">{invitation.title}</div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Pemilik Saat Ini: <strong className="text-amber-400">{invitation.owner?.name || 'User Lain'}</strong></span>
              <span>•</span>
              <span className="font-mono text-neutral-500">/{invitation.slug}</span>
            </div>
          </div>

          {/* Body: Select Target User */}
          <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pengguna / WhatsApp baru..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#181824] border border-[#2a2a3d] focus:border-amber-500 focus:outline-none text-xs text-white placeholder:text-neutral-500 transition"
              />
            </div>

            <div className="text-xs font-semibold text-neutral-300">Pilih Pemilik Baru:</div>

            {isLoading ? (
              <div className="py-8 flex justify-center text-neutral-500 text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 text-xs">
                Tidak ada pengguna yang cocok.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isSelected = selectedTargetUserId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedTargetUserId(u.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-[#181824] border-[#252535] text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{u.name}</div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          {u.phone && <span>{u.phone}</span>}
                          {u.email && <span className="truncate">{u.email}</span>}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase">
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-snug flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Setelah ditransfer, proyek ini akan berpindah ke dashboard pemilik baru dan pemilik lama tidak lagi memiliki hak edit.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#222233] bg-[#161622] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!selectedTargetUserId || isSubmitting}
              onClick={handleTransfer}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Konfirmasi Transfer</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
