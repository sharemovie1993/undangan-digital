const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndEnsure() {
  const dewi = await prisma.user.findFirst({
    where: { phone: '+6287779937341' }
  });

  console.log('Akun Dewi Nurhasanah ID:', dewi.id);

  // Pastikan kedua proyek (Khitanan & Wedding) tersedia untuk Dewi Nurhasanah
  const weddingExists = await prisma.invitation.findFirst({
    where: { slug: 'wedding-romeo-juliet' }
  });

  if (!weddingExists) {
    await prisma.invitation.create({
      data: {
        userId: dewi.id,
        title: 'The Wedding of Romeo & Juliet',
        slug: 'wedding-romeo-juliet',
        eventType: 'WEDDING',
        themeId: 'champagne_gold',
        status: 'ACTIVE',
        isWatermark: false,
        allowPrintKit: true,
        licenseKey: 'LIC-LUXE-GOLD-9988',
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
    console.log('Proyek Wedding Romeo & Juliet ditambahkan ke akun Dewi');
  } else {
    await prisma.invitation.update({
      where: { id: weddingExists.id },
      data: { userId: dewi.id }
    });
  }

  // Ambil semua undangan milik Dewi
  const dewiInvs = await prisma.invitation.findMany({
    where: { userId: dewi.id }
  });

  console.log('=== PROYEK RESMI MILIK DEWI NURHASANAH ===');
  dewiInvs.forEach((inv, idx) => {
    console.log(`${idx + 1}. [${inv.eventType}] ${inv.title} (Slug: ${inv.slug})`);
  });
}

checkAndEnsure().finally(() => prisma.$disconnect());
