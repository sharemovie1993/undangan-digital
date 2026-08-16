import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys, invalidateLicenseFlow } from '../query/queryClient';
import { useToast } from '../context/ToastContext';

export const useInvitations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 1. Fetch List Undangan
  const {
    data: invitations = [],
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: queryKeys.invitations.list,
    queryFn: async () => {
      try {
        const res = await api.listInvitations();
        return res.data || [];
      } catch {
        return [];
      }
    }
  });

  // 2. Fetch Riwayat Order Resmi (Untuk lisensi standby)
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: queryKeys.orders.myOrders,
    queryFn: async () => {
      try {
        const res = await api.getMyOrders();
        return res.data || [];
      } catch {
        return [];
      }
    }
  });

  // Hitung Lisensi Standby
  const activeKeysSet = new Set(
    invitations.filter((i: any) => i.licenseKey).map((i: any) => i.licenseKey)
  );
  const unassignedOrders = orders.filter(
    (o: any) => o.licenseKey && !activeKeysSet.has(o.licenseKey)
  );

  // 3. Mutation: Buat Undangan Baru
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.saveInvitation(payload);
    },
    onSuccess: async (res) => {
      await invalidateLicenseFlow(queryClient);
      if (res.data?.licenseKey) {
        showToast('success', `Undangan berhasil dibuat dan lisensi ${res.data.licenseKey} otomatis terpasang!`, 'Proyek Dibuat');
      } else {
        showToast('success', 'Undangan baru berhasil dibuat!', 'Sukses');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan undangan.';
      showToast('error', msg, 'Gagal Membuat Undangan');
    }
  });

  // 4. Mutation: Duplikasi Undangan
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.duplicateInvitation(id);
    },
    onSuccess: async () => {
      await invalidateLicenseFlow(queryClient);
      showToast('success', 'Proyek undangan berhasil diduplikasi.', 'Duplikasi Berhasil');
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Gagal menduplikasi undangan.', 'Gagal');
    }
  });

  // 5. Mutation: Hapus Undangan
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.deleteInvitation(id);
    },
    onSuccess: async () => {
      await invalidateLicenseFlow(queryClient);
      showToast('success', 'Undangan berhasil dihapus.', 'Dihapus');
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Gagal menghapus undangan.', 'Gagal Hapus');
    }
  });

  // 6. Mutation: Aktivasi Lisensi dengan Token Akun
  const activateTokenMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await api.activateWithToken(invitationId);
    },
    onSuccess: async (res) => {
      await invalidateLicenseFlow(queryClient);
      showToast('success', `Undangan berhasil diaktifkan dengan 1 Token! Sisa token: ${res.data?.remainingTokens ?? 0}`, 'Aktivasi Berhasil');
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || err.message || 'Gagal mengaktifkan token.', 'Aktivasi Gagal');
    }
  });

  // 7. Mutation: Pindah Lisensi (Transfer)
  const transferMutation = useMutation({
    mutationFn: async (payload: { targetInvitationId: string; sourceInvitationId?: string; licenseKey?: string }) => {
      return await api.transferLicense(payload);
    },
    onSuccess: async (res) => {
      await invalidateLicenseFlow(queryClient);
      showToast('success', res.message || 'Lisensi resmi berhasil dipindahkan ke undangan ini!', 'Transfer Sukses');
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || err.message || 'Gagal memindahkan lisensi.', 'Transfer Gagal');
    }
  });

  return {
    invitations,
    orders,
    unassignedOrders,
    standbyCount: unassignedOrders.length,
    isLoading: isLoadingInvitations || isLoadingOrders,
    refetchInvitations,
    refetchOrders,
    createMutation,
    duplicateMutation,
    deleteMutation,
    activateTokenMutation,
    transferMutation
  };
};
