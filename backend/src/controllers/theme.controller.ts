import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ThemeController {
  // GET /api/themes - Get all active themes
  static async getAllThemes(req: FastifyRequest, reply: FastifyReply) {
    try {
      const themes = await prisma.themePreset.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      // Parse JSON strings to structured objects
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
          tags: t.tags ? t.tags.split(',').map((s) => s.trim()) : [],
          isPremium: t.isPremium,
          palette,
          ...palette,
        };
      });

      return reply.status(200).send({
        success: true,
        data: parsedThemes,
      });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal memuat tema dari database.' });
    }
  }

  // GET /api/themes/style-kits - Get all master style kits
  static async getAllStyleKits(req: FastifyRequest, reply: FastifyReply) {
    try {
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
        tags: k.tags ? k.tags.split(',').map((s) => s.trim()) : [],
      }));

      return reply.status(200).send({
        success: true,
        data: parsedKits,
      });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal memuat style kits dari database.' });
    }
  }

  // POST /api/themes - Create a new theme dynamically (Admin)
  static async createTheme(req: FastifyRequest, reply: FastifyReply) {
    try {
      const body = req.body as any;
      if (!body.id || !body.name || !body.palette) {
        return reply.status(400).send({ success: false, message: 'ID, Nama, dan Palette wajib diisi.' });
      }

      const paletteJson = typeof body.palette === 'string' ? body.palette : JSON.stringify(body.palette);
      const tags = Array.isArray(body.tags) ? body.tags.join(',') : body.tags || '';

      const theme = await prisma.themePreset.create({
        data: {
          id: body.id,
          name: body.name,
          subtitle: body.subtitle || '',
          category: body.category || 'modern',
          mode: body.mode || 'dark',
          archetype: body.archetype || 'royal_arch',
          paletteJson,
          tags,
          isPremium: !!body.isPremium,
          sortOrder: body.sortOrder || 99,
        },
      });

      return reply.status(201).send({ success: true, data: theme });
    } catch (err: any) {
      req.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal menyimpan tema baru ke database.' });
    }
  }
}
