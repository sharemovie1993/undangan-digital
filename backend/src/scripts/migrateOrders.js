const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndPolishOrders() {
  const dewi = await prisma.user.findFirst({
    where: { phone: '+6287779937341' }
  });

  // Update deskripsi nama paket pada transaksi yang sudah lunas
  await prisma.order.updateMany({
    where: { userId: dewi.id, status: 'paid' },
    data: {
      planName: 'Paket Undangan Gold Pro (Lunas)',
      status: 'PAID'
    }
  });

  const orders = await prisma.order.findMany({
    where: { userId: dewi.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log('=== DAFTAR RESMI RIWAYAT TRANSAKSI DEWI NURHASANAH ===');
  orders.forEach((o, i) => {
    console.log(`${i + 1}. [${o.status}] ${o.invoiceNumber} | ${o.planName || 'Paket Undangan Digital'} | Rp ${o.amount.toLocaleString('id-ID')} | Key: ${o.licenseKey}`);
  });
}

cleanAndPolishOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
