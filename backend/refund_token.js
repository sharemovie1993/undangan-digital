const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const allUsers = await prisma.user.findMany({ select: { id: true, name: true, phone: true, quotaTokens: true } });
  console.log('=== Semua User ===');
  allUsers.forEach(u => console.log('  ' + u.name + ' | ' + u.phone + ' | Token: ' + u.quotaTokens));
  const target = allUsers.find(u => u.phone && u.phone.includes('87779937341'));
  if (!target) { console.log('User tidak ditemukan'); await prisma.(); return; }
  console.log('Target: ' + target.name + ' (' + target.phone + ')');
  const updated = await prisma.user.update({ where: { id: target.id }, data: { quotaTokens: { increment: 1 } } });
  console.log('Token setelah: ' + updated.quotaTokens);
  await prisma.();
}
run().catch(console.error);
