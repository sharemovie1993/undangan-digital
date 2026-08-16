import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys } from '../query/queryClient';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'USER' | 'RESELLER' | 'PERCETAKAN' | 'ADMIN';
  quotaTokens: number;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('absenta_auth_token') || null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('absenta_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Polling User Profile Realtime (Saldo Token & Role)
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: async () => {
      const currentToken = localStorage.getItem('absenta_auth_token');
      if (!currentToken) return null;
      try {
        const res = await api.getMe();
        if (res.success && res.data) {
          const stored = localStorage.getItem('absenta_auth_user');
          const prevUser = stored ? JSON.parse(stored) : {};
          const merged = { ...prevUser, ...res.data };
          localStorage.setItem('absenta_auth_user', JSON.stringify(merged));
          setUser(merged);
          return merged;
        }
      } catch {}
      return null;
    },
    enabled: Boolean(token),
    refetchInterval: 3500,
    retry: false
  });

  const login = useCallback((newToken: string, newUser: UserProfile) => {
    localStorage.setItem('absenta_auth_token', newToken);
    localStorage.setItem('absenta_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem('absenta_auth_token');
    localStorage.removeItem('absenta_auth_user');
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const updateUserData = useCallback((partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem('absenta_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const role = user?.role || 'USER';
  const isReseller = ['RESELLER', 'PERCETAKAN', 'ADMIN'].includes(role.toUpperCase());
  const quotaTokens = user?.quotaTokens || 0;
  const isLoggedIn = Boolean(token && user);

  return {
    user,
    token,
    role,
    isLoggedIn,
    isReseller,
    quotaTokens,
    login,
    logout,
    updateUserData,
    refetchProfile
  };
};
