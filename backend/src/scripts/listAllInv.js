const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAll() {
  const invitations = await prisma.invitation.findMany();
  console.log('=== SEMUA UNDANGAN DI DATABASE ===');
  invitations.forEach((inv, i) => {
    console.log(`${i + 1}. [${inv.eventType}] ${inv.title} (Slug: ${inv.slug}) | isWatermark: ${inv.isWatermark} | LicenseKey: ${inv.licenseKey || '-'}`);
  });
}

listAll().finally(() => prisma.$disconnect());
