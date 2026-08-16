const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setDewiAsPersonalUser() {
  const dewi = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: '+6287779937341' },
        { phone: '087779937341' },
        { phone: '6287779937341' }
      ]
    }
  });

  if (!dewi) {
    console.error('Akun Dewi Nurhasanah tidak ditemukan.');
    return;
  }

  const updated = await prisma.user.update({
    where: { id: dewi.id },
    data: {
      role: 'USER',
      quotaTokens: 0
    }
  });

  console.log('=== STATUS AKUN BERHASIL DIUBAH ===');
  console.log('Nama:', updated.name);
  console.log('Phone:', updated.phone);
  console.log('Role Baru:', updated.role, '(USER PERSONAL)');
  console.log('Saldo Token:', updated.quotaTokens);
}

setDewiAsPersonalUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
