const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndLinkBoth() {
  const user = await prisma.user.findFirst({
    where: { phone: '+6281912526367' }
  });

  // Pastikan kedua undangan ada dan terikat ke user 6367
  const weddingExists = await prisma.invitation.findFirst({
    where: { slug: 'wedding-romeo-juliet' }
  });

  if (!weddingExists) {
    await prisma.invitation.create({
      data: {
        userId: user.id,
        title: 'The Wedding of Romeo & Juliet',
        slug: 'wedding-romeo-juliet',
        eventType: 'WEDDING',
        themeId: 'champagne_gold',
        status: 'ACTIVE',
        isWatermark: false,
        allowPrintKit: true,
        licenseKey: 'UND-L9QL-XT1Q-1G12',
        planId: 'UND-GOLD',
        eventDataJson: JSON.stringify({
          title: 'The Wedding of Romeo & Juliet',
          eventTitle: 'The Wedding of Romeo & Juliet',
          eventType: 'wedding',
          theme: 'champagne_gold',
          slug: 'wedding-romeo-juliet',
          eventDate: '2026-10-24T08:00:00'
        })
      }
    });
  } else {
    await prisma.invitation.update({
      where: { id: weddingExists.id },
      data: { userId: user.id, licenseKey: 'UND-L9QL-XT1Q-1G12', isWatermark: false }
    });
  }

  // Update semua invitation lain ke user ini
  await prisma.invitation.updateMany({
    data: { userId: user.id }
  });

  const invitations = await prisma.invitation.findMany({
    where: { userId: user.id }
  });

  console.log('=== DAFTAR FINAL PROYEK UNDANGAN +6281912526367 ===');
  invitations.forEach((inv, i) => {
    console.log(`${i + 1}. [${inv.eventType}] ${inv.title} (Slug: ${inv.slug}) | Lisensi: ${inv.licenseKey || 'DRAFT'}`);
  });
}

checkAndLinkBoth().finally(() => prisma.$disconnect());
