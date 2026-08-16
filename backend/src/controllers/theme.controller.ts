import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db';

/**
 * 🧠 In-Memory RAM Cache for Themes & Style Kits (5 Menit)
 */
let cachedThemesList: { data: any; cachedAt: number } | null = null;
let cachedStyleKitsList: { data: any; cachedAt: number } | null = null;
const THEME_CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidateThemeCache() {
  cachedThemesList = null;
  cachedStyleKitsList = null;
}

export class ThemeController {
  /**
   * GET /api/themes - Get all active themes with HTTP Cache-Control header
   * 🚀 Dioptimasi dengan In-Memory RAM Cache (Latensi < 0.1ms)
   */
  static async getAllThemes(req: FastifyRequest, reply: FastifyReply) {
    if (cachedThemesList && (Date.now() - cachedThemesList.cachedAt) < THEME_CACHE_TTL_MS) {
      reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return reply.status(200).send({
        success: true,
        cached: true,
        data: cachedThemesList.data,
      });
    }

    try {
      reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const themes = await prisma.themePreset.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      const parsedThemes = themes.map((t) => {
        let palette = {};
        try {
          palette = JSON.parse(t.paletteJson);
        } catch {}

        return {
          id: t.id,
          name: t.name,
          subtitle: t.subtitle || '',
          category: t.category,
          mode: t.mode,
          archetype: t.archetype,
          sortOrder: t.sortOrder,
          tags: t.tags ? t.tags.split(',').map((s) => s.trim()) : [],
          isPremium: t.isPremium,
          palette,
          ...palette,
        };
      });

      cachedThemesList = { data: parsedThemes, cachedAt: Date.now() };

      return reply.status(200).send({
        success: true,
        cached: false,
        data: parsedThemes,
      });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal memuat tema dari database.' });
    }
  }

  /**
   * GET /api/themes/style-kits - Get all master style kits with caching
   * 🚀 Dioptimasi dengan In-Memory RAM Cache
   */
  static async getAllStyleKits(req: FastifyRequest, reply: FastifyReply) {
    if (cachedStyleKitsList && (Date.now() - cachedStyleKitsList.cachedAt) < THEME_CACHE_TTL_MS) {
      reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return reply.status(200).send({
        success: true,
        cached: true,
        data: cachedStyleKitsList.data,
      });
    }

    try {
      reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const kits = await prisma.styleKitPreset.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      const parsedKits = kits.map((k) => ({
        id: k.id,
        name: k.name,
        category: k.category,
        tagline: k.tagline,
        themeId: k.themeId,
        fontPairingId: k.fontPairingId,
        frameShape: k.frameShape,
        previewGradient: k.previewGradient,
        primaryColor: k.primaryColor,
        description: k.description,
        badge: k.badge,
        sortOrder: k.sortOrder,
        tags: k.tags ? k.tags.split(',').map((s) => s.trim()) : [],
      }));

      cachedStyleKitsList = { data: parsedKits, cachedAt: Date.now() };

      return reply.status(200).send({
        success: true,
        cached: false,
        data: parsedKits,
      });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal memuat style kits dari database.' });
    }
  }

  /**
   * POST /api/themes - Create a new theme dynamically (Protected: ADMIN Only)
   */
  static async createTheme(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Akses ditolak. Hanya administrator yang dapat menambahkan tema baru.',
        });
      }

      const body = req.body as any;
      if (!body.id || !body.name || !body.palette) {
        return reply.status(400).send({ success: false, message: 'ID, Nama, dan Palette wajib diisi.' });
      }

      // Sanitize & Validate ID (slug format: lowercase alphanumeric and underscores only)
      const cleanId = String(body.id).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanId.length < 3 || cleanId.length > 50) {
        return reply.status(400).send({ success: false, message: 'ID tema harus 3-50 karakter alfanumerik.' });
      }

      const paletteJson = typeof body.palette === 'string' ? body.palette : JSON.stringify(body.palette);
      const tags = Array.isArray(body.tags) ? body.tags.join(',') : String(body.tags || '').substring(0, 200);

      const theme = await prisma.themePreset.upsert({
        where: { id: cleanId },
        update: {
          name: String(body.name).substring(0, 100),
          subtitle: String(body.subtitle || '').substring(0, 200),
          category: String(body.category || 'modern').substring(0, 50),
          mode: body.mode === 'light' ? 'light' : 'dark',
          archetype: String(body.archetype || 'royal_arch').substring(0, 50),
          paletteJson,
          tags,
          isPremium: !!body.isPremium,
          sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 99,
          isActive: true,
        },
        create: {
          id: cleanId,
          name: String(body.name).substring(0, 100),
          subtitle: String(body.subtitle || '').substring(0, 200),
          category: String(body.category || 'modern').substring(0, 50),
          mode: body.mode === 'light' ? 'light' : 'dark',
          archetype: String(body.archetype || 'royal_arch').substring(0, 50),
          paletteJson,
          tags,
          isPremium: !!body.isPremium,
          sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 99,
          isActive: true,
        },
      });

      // 🧹 Invalidate Cache Tema
      invalidateThemeCache();

      return reply.status(201).send({ success: true, data: theme });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal menyimpan tema baru ke database.' });
    }
  }
}
