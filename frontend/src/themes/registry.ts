import { ThemeDefinition, MasterStyleKitDefinition, ThemeCategory, ThemeTone } from './types';
import { ROYAL_THEMES, ROYAL_STYLE_KITS } from './catalog/royal';
import { TRADITIONAL_THEMES, TRADITIONAL_STYLE_KITS } from './catalog/traditional';
import { ISLAMIC_THEMES, ISLAMIC_STYLE_KITS } from './catalog/islamic';
import { ROMANTIC_THEMES, ROMANTIC_STYLE_KITS } from './catalog/romantic';
import { MODERN_THEMES, MODERN_STYLE_KITS } from './catalog/modern';
import { FESTIVE_STYLE_KITS } from './catalog/festive';
import { loadGoogleFont } from './fontLoader';

// 1. Unified Catalogs
export const UNIFIED_THEMES: Record<string, ThemeDefinition> = {
  ...ROYAL_THEMES,
  ...TRADITIONAL_THEMES,
  ...ISLAMIC_THEMES,
  ...ROMANTIC_THEMES,
  ...MODERN_THEMES,
};

export const UNIFIED_STYLE_KITS: Record<string, MasterStyleKitDefinition> = {
  ...ROYAL_STYLE_KITS,
  ...TRADITIONAL_STYLE_KITS,
  ...ISLAMIC_STYLE_KITS,
  ...ROMANTIC_STYLE_KITS,
  ...MODERN_STYLE_KITS,
  ...FESTIVE_STYLE_KITS,
};

// 2. Theme Registry Class
class ThemeRegistryEngine {
  private themes: Map<string, ThemeDefinition> = new Map();
  private styleKits: Map<string, MasterStyleKitDefinition> = new Map();

  constructor() {
    Object.values(UNIFIED_THEMES).forEach((t) => this.themes.set(t.id, t));
    Object.values(UNIFIED_STYLE_KITS).forEach((k) => this.styleKits.set(k.id, k));
  }

  /**
   * Register a new theme dynamically at runtime (e.g. fetched from API / plugin)
   */
  public registerTheme(theme: ThemeDefinition) {
    this.themes.set(theme.id, theme);
  }

  public registerStyleKit(kit: MasterStyleKitDefinition) {
    this.styleKits.set(kit.id, kit);
  }

  public getTheme(id: string): ThemeDefinition {
    return this.themes.get(id) || UNIFIED_THEMES.champagne_gold;
  }

  public getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values()).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }

  public getAllStyleKits(): MasterStyleKitDefinition[] {
    return Array.from(this.styleKits.values()).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }

  public getThemesByCategory(category: ThemeCategory | 'all'): ThemeDefinition[] {
    if (category === 'all') return this.getAllThemes();
    return this.getAllThemes().filter((t) => t.category === category);
  }

  public getThemesByTone(tone: ThemeTone | 'all'): ThemeDefinition[] {
    if (tone === 'all') return this.getAllThemes();
    return this.getAllThemes().filter((t) => t.mode === tone);
  }

  public searchThemes(query: string, filters?: { category?: string; tone?: string }): ThemeDefinition[] {
    const q = query.trim().toLowerCase();
    return this.getAllThemes().filter((th) => {
      // Category filter
      if (filters?.category && filters.category !== 'all' && th.category !== filters.category) {
        return false;
      }
      // Tone filter
      if (filters?.tone && filters.tone !== 'all' && th.mode !== filters.tone) {
        return false;
      }
      // Text search
      if (!q) return true;
      const matchName = th.name.toLowerCase().includes(q);
      const matchSubtitle = th.subtitle.toLowerCase().includes(q);
      const matchTags = th.tags?.some((tag) => tag.toLowerCase().includes(q)) || false;
      return matchName || matchSubtitle || matchTags;
    });
  }

  public searchStyleKits(query: string, category?: string): MasterStyleKitDefinition[] {
    const q = query.trim().toLowerCase();
    return this.getAllStyleKits().filter((k) => {
      if (category && category !== 'all' && k.category !== category) {
        return false;
      }
      if (!q) return true;
      const matchName = k.name.toLowerCase().includes(q);
      const matchTagline = k.tagline.toLowerCase().includes(q);
      const matchDesc = k.description.toLowerCase().includes(q);
      const matchTags = k.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      return matchName || matchTagline || matchDesc || matchTags;
    });
  }

  /**
   * Apply theme and preload associated Google Fonts
   */
  public activateTheme(themeId: string) {
    const theme = this.getTheme(themeId);
    if (theme.typography?.headingFamily) {
      loadGoogleFont(theme.typography.headingFamily);
    }
    return theme;
  }
}

export const themeRegistry = new ThemeRegistryEngine();
