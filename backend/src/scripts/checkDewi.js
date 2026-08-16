const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDewi() {
  const dewi = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: '+6287779937341' },
        { phone: '087779937341' },
        { phone: '6287779937341' }
      ]
    },
    include: {
      _count: {
        select: { invitations: true, orders: true }
      }
    }
  });

  console.log('=== STATUS AKUN 087779937341 DI DATABASE ===');
  console.log(JSON.stringify(dewi, null, 2));
}

checkDewi().finally(() => prisma.$disconnect());
