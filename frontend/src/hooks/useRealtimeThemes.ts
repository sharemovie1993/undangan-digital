import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { themeRegistry } from '../themes/registry';
import { MasterStyleKit, ThemeToken } from '../types';

export function useRealtimeThemes() {
  const queryClient = useQueryClient();

  // Query 1: Dynamic Database Themes Catalog
  const {
    data: themesData,
    isLoading: isThemesLoading,
    isRefetching: isThemesRefetching,
    refetch: refetchThemesQuery,
  } = useQuery({
    queryKey: ['themes_catalog'],
    queryFn: async () => {
      try {
        const res = await api.getThemes();
        if (res?.data && Array.isArray(res.data)) {
          // Register dynamic database themes to runtime registry
          res.data.forEach((t: any) => {
            themeRegistry.registerTheme(t);
          });
          return res.data;
        }
      } catch (err) {
        console.warn('Silent fallback to local curated themes:', err);
      }
      return themeRegistry.getAllThemes();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: themeRegistry.getAllThemes(),
  });

  // Query 2: Dynamic Database Master Style Kits
  const {
    data: styleKitsData,
    isLoading: isKitsLoading,
    isRefetching: isKitsRefetching,
    refetch: refetchKitsQuery,
  } = useQuery({
    queryKey: ['style_kits_catalog'],
    queryFn: async () => {
      try {
        const res = await api.getStyleKits();
        if (res?.data && Array.isArray(res.data)) {
          res.data.forEach((k: any) => {
            themeRegistry.registerStyleKit(k);
          });
          return res.data as MasterStyleKit[];
        }
      } catch (err) {
        console.warn('Silent fallback to local master style kits:', err);
      }
      return themeRegistry.getAllStyleKits() as MasterStyleKit[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: themeRegistry.getAllStyleKits() as MasterStyleKit[],
  });

  // Cross-Tab & Event-Driven Realtime Cache Invalidation
  useEffect(() => {
    const handleThemesUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['themes_catalog'] });
      queryClient.invalidateQueries({ queryKey: ['style_kits_catalog'] });
    };

    window.addEventListener('themes_updated', handleThemesUpdated);
    return () => {
      window.removeEventListener('themes_updated', handleThemesUpdated);
    };
  }, [queryClient]);

  // Master Invalidator function
  const invalidateThemes = () => {
    queryClient.invalidateQueries({ queryKey: ['themes_catalog'] });
    queryClient.invalidateQueries({ queryKey: ['style_kits_catalog'] });
    window.dispatchEvent(new Event('themes_updated'));
  };

  const refetchAll = async () => {
    await Promise.all([refetchThemesQuery(), refetchKitsQuery()]);
  };

  const availableKits = (styleKitsData || themeRegistry.getAllStyleKits()) as MasterStyleKit[];
  const availableThemes = themesData || themeRegistry.getAllThemes();

  return {
    themes: availableThemes,
    styleKits: availableKits,
    isLoading: isThemesLoading || isKitsLoading,
    isRefetching: isThemesRefetching || isKitsRefetching,
    invalidateThemes,
    refetchThemes: refetchAll,
  };
}

/**
 * Mutation Hook to dynamically create a new theme and invalidate the cache
 */
export function useCreateThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newThemePayload: any) => {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('absenta_auth_token') || ''}`,
        },
        body: JSON.stringify(newThemePayload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Gagal membuat tema baru');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries so all UI components refresh immediately
      queryClient.invalidateQueries({ queryKey: ['themes_catalog'] });
      queryClient.invalidateQueries({ queryKey: ['style_kits_catalog'] });
      window.dispatchEvent(new Event('themes_updated'));
    },
  });
}
