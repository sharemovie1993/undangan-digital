/**
 * Dynamic Universal Slug Generator
 * Converts any title (e.g. "The Wedding of Romeo & Juliet", "Walimatul Khitan Muhammad Rayyan")
 * into a URL-safe, clean slug with zero hardcoded assumptions.
 */
export const generateSlug = (text?: string): string => {
  if (!text || !text.trim()) {
    return `undangan-${Date.now().toString(36)}`;
  }
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric except space/hyphen
    .trim()
    .replace(/\s+/g, '-')          // spaces to hyphens
    .replace(/-+/g, '-');          // collapse multiple hyphens

  return clean || `undangan-${Date.now().toString(36)}`;
};
