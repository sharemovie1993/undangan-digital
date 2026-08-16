import { EventType, FontPairingId, FrameShapeId, ArchetypeStyle } from '../types';

export type ThemeCategory = 'royal' | 'traditional' | 'islamic' | 'romantic' | 'modern' | 'festive';
export type ThemeTone = 'light' | 'dark';

export interface ThemePalette {
  primary: string;
  secondary: string;
  bg: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  accentBg: string;
  goldFoil?: string;
  badge?: string;
  button?: string;
  secondaryButton?: string;
  headerBg?: string;
  previewGradient: string;
}

export interface ThemeTypographyConfig {
  fontPairingId: FontPairingId;
  headingFamily?: string;
  bodyFamily?: string;
}

export interface ThemeOrnamentsConfig {
  archetype: ArchetypeStyle;
  frameShape?: FrameShapeId;
  motif?: string;
  particles?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  subtitle: string;
  category: ThemeCategory;
  mode: ThemeTone;
  palette: ThemePalette;
  typography?: ThemeTypographyConfig;
  ornaments?: ThemeOrnamentsConfig;
  suitableEvents?: EventType[];
  tags?: string[];
  badge?: string;
  // Flattened properties for backward compatibility with presets.ts
  archetype: ArchetypeStyle;
  primary: string;
  secondary: string;
  bg: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  accentBg: string;
  goldFoil: string;
  button: string;
  secondaryButton: string;
  headerBg: string;
  previewGradient: string;
}

export interface MasterStyleKitDefinition {
  id: string;
  name: string;
  category: ThemeCategory;
  tagline: string;
  themeId: string;
  fontPairingId: FontPairingId;
  frameShape: FrameShapeId;
  previewGradient: string;
  primaryColor: string;
  description: string;
  badge: string;
  tags?: string[];
}
