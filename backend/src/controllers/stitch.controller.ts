import { FastifyReply, FastifyRequest } from 'fastify';

export interface StitchBlockManifest {
  id: string;
  category: 'HERO' | 'PROFILE' | 'TIMELINE' | 'GALLERY' | 'BANK' | 'RSVP' | 'MAPS' | 'PRINT';
  name: string;
  supportedEvents: ('WEDDING' | 'KHITANAN' | 'AQIQAH' | 'BIRTHDAY')[];
  defaultTokens: Record<string, string>;
}

export class StitchController {
  private static manifests: StitchBlockManifest[] = [
    {
      id: 'hero-envelope-luxury',
      category: 'HERO',
      name: 'Luxury 3D Opening Envelope Hero',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY'],
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
      supportedEvents: ['KHITANAN', 'AQIQAH'],
      defaultTokens: { '--accent': '#7DA87B', '--font-serif': 'Amiri' }
    },
    {
      id: 'timeline-countdown-sessions',
      category: 'TIMELINE',
      name: 'Live Countdown & Event Sessions (Akad & Resepsi)',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'gallery-grid-lightbox',
      category: 'GALLERY',
      name: 'Interactive Photo Grid & YouTube Lightbox',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'bank-gift-qris',
      category: 'BANK',
      name: 'Digital Gift Bank Accounts & QRIS with 1-Click Copy',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY'],
      defaultTokens: { '--accent': '#D4AF37' }
    },
    {
      id: 'rsvp-guestbook-feed',
      category: 'RSVP',
      name: 'Live RSVP Form & Guestbook Feed with Confetti',
      supportedEvents: ['WEDDING', 'KHITANAN', 'AQIQAH', 'BIRTHDAY'],
      defaultTokens: { '--accent': '#D4AF37' }
    }
  ];

  /**
   * Mengambil katalog seluruh manifest komponen Stitch
   */
  static async getManifests(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      data: StitchController.manifests
    });
  }

  /**
   * Validasi struktur komposisi blok Stitch
   */
  static async validateComposition(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { blocks: any[] };
    if (!body || !Array.isArray(body.blocks)) {
      return reply.status(400).send({ success: false, message: 'Invalid blocks composition array.' });
    }

    return reply.send({
      success: true,
      message: 'Komposisi blok Stitch valid.',
      totalBlocks: body.blocks.length
    });
  }
}
