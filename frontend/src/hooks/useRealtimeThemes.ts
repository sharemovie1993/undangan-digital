import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { MASTER_STYLE_KITS, THEMES } from '../data/presets';
import { MasterStyleKit, ThemeToken } from '../types';

export function useRealtimeThemes() {
  // Query 1: Dynamic Themes Catalog
  const { data: themesData, isLoading: isThemesLoading } = useQuery({
    queryKey: ['themes_catalog'],
    queryFn: async () => {
      try {
        const res = await api.getThemes();
        if (res?.data && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (err) {
        console.warn('Silent fallback to local curated themes:', err);
      }
      return Object.values(THEMES);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    placeholderData: Object.values(THEMES),
  });

  // Query 2: Dynamic Master Style Kits
  const { data: styleKitsData, isLoading: isKitsLoading } = useQuery({
    queryKey: ['style_kits_catalog'],
    queryFn: async () => {
      try {
        const res = await api.getStyleKits();
        if (res?.data && Array.isArray(res.data)) {
          return res.data as MasterStyleKit[];
        }
      } catch (err) {
        console.warn('Silent fallback to local master style kits:', err);
      }
      return Object.values(MASTER_STYLE_KITS) as MasterStyleKit[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    placeholderData: Object.values(MASTER_STYLE_KITS) as MasterStyleKit[],
  });

  const availableKits = (styleKitsData || Object.values(MASTER_STYLE_KITS)) as MasterStyleKit[];
  const availableThemes = themesData || Object.values(THEMES);

  return {
    themes: availableThemes,
    styleKits: availableKits,
    isLoading: isThemesLoading || isKitsLoading,
  };
}
