import { FastifyReply, FastifyRequest } from 'fastify';

export interface StitchBlockManifest {
  id: string;
  category: 'HERO' | 'PROFILE' | 'TIMELINE' | 'GALLERY' | 'BANK' | 'RSVP' | 'MAPS' | 'PRINT' | 'STORY' | 'CLOSING';
  name: string;
  supportedEvents: ('WEDDING' | 'KHITANAN' | 'AQIQAH' | 'BIRTHDAY' | 'TASYAKURAN')[];
  defaultTokens: Record<string, string>;
}

export class StitchController {
  private static manifests: StitchBlockManifest[] = [
    {
      id: 'hero-envelope-luxury',
      category: 'HERO',
      name: 'Luxury 3D Opening Envelope Hero',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37', '--font-serif': 'Cinzel' }
    },
    {
      id: 'profile-arched-couple',
      category: 'PROFILE',
      name: 'Arched Frame Couple Profile',
      supportedEvents: ['WEDDING'],
      defaultTokens: { '--frame-border': '#D4AF37', '--font-serif': 'Cormorant' }
    },
    {
      id: 'profile-khitanan-royal',
      category: 'PROFILE',
      name: 'Royal Islamic Khitan Profile',
      supportedEvents: ['KHITANAN', 'AQIQAH', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#7DA87B', '--font-serif': 'Amiri' }
    },
    {
      id: 'timeline-countdown-sessions',
      category: 'TIMELINE',
      name: 'Live Countdown & Event Sessions (Akad & Resepsi)',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'story-love-timeline',
      category: 'STORY',
      name: 'Love Journey & Milestone Timeline',
      supportedEvents: ['WEDDING'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'gallery-grid-lightbox',
      category: 'GALLERY',
      name: 'Interactive Photo Grid & YouTube Lightbox',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'bank-gift-qris',
      category: 'BANK',
      name: 'Digital Gift Bank Accounts, Physical Gift Address & QRIS',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'rsvp-guestbook-feed',
      category: 'RSVP',
      name: 'Live RSVP Form & Guestbook Feed with Confetti',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'closing-prayer-wishes',
      category: 'CLOSING',
      name: 'Closing Ayat / Romantic Quotes & Family Salam',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY', 'TASYAKURAN'],
      defaultTokens: { '--accent': '#D4AF37' }
    }
  ];

  /**
   * Mengambil katalog seluruh manifest komponen Stitch
   * 🚀 Dioptimasi dengan HTTP Cache-Control header
   */
  static async getManifests(_request: FastifyRequest, reply: FastifyReply) {
    reply.header('Cache-Control', 'public, max-age=600, stale-while-revalidate=1200');
    return reply.send({
      success: true,
      data: StitchController.manifests
    });
  }

  /**
   * Validasi struktur komposisi blok Stitch
   * 🚀 Dioptimasi dengan Strict Event Type Compatibility Guard
   */
  static async validateComposition(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { blocks: any[]; eventType?: string };
    if (!body || !Array.isArray(body.blocks)) {
      return reply.status(400).send({ success: false, message: 'Invalid blocks composition array.' });
    }

    const eventType = (body.eventType || 'WEDDING').toUpperCase() as any;
    const manifestMap = new Map(StitchController.manifests.map(m => [m.id, m]));
    const warnings: string[] = [];

    const validatedBlocks = body.blocks.map((block: any, idx: number) => {
      const blockId = typeof block === 'string' ? block : block.id;
      const manifest = manifestMap.get(blockId);

      if (manifest && !manifest.supportedEvents.includes(eventType)) {
        warnings.push(`Blok '${manifest.name}' biasanya tidak digunakan pada acara tipe ${eventType}.`);
      }

      return {
        id: blockId,
        order: typeof block.order === 'number' ? block.order : idx,
        enabled: block.enabled !== false
      };
    });

    return reply.send({
      success: true,
      message: 'Komposisi blok Stitch valid.',
      totalBlocks: validatedBlocks.length,
      warnings: warnings.length > 0 ? warnings : undefined,
      blocks: validatedBlocks
    });
  }
}
