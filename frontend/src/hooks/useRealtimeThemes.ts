import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { themeRegistry } from '../themes/registry';
import { MasterStyleKit, ThemeToken } from '../types';

export function useRealtimeThemes() {
  // Query 1: Dynamic Database Themes Catalog
  const { data: themesData, isLoading: isThemesLoading } = useQuery({
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
  const { data: styleKitsData, isLoading: isKitsLoading } = useQuery({
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

  const availableKits = (styleKitsData || themeRegistry.getAllStyleKits()) as MasterStyleKit[];
  const availableThemes = themesData || themeRegistry.getAllThemes();

  return {
    themes: availableThemes,
    styleKits: availableKits,
    isLoading: isThemesLoading || isKitsLoading,
  };
}

