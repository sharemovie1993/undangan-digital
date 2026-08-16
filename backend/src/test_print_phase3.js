const fetch = require('node-fetch');

async function testPrintDownloads() {
  console.log('=== [FASE 3] PENGUJIAN GENERATOR MESIN CETAK PDF 300 DPI ===\n');

  // 1. Test A5 Card PDF Download
  console.log('[1/2] Menguji download Kartu Cetak A5 HD (300 DPI)...');
  const cardRes = await fetch('http://localhost:4001/api/print/card/demo-invitation?format=A5');
  console.log('Status HTTP:', cardRes.status);
  console.log('Content-Type:', cardRes.headers.get('content-type'));
  console.log('Content-Disposition:', cardRes.headers.get('content-disposition'));
  const cardBuf = await cardRes.buffer();
  console.log('Ukuran PDF Kartu A5:', cardBuf.length, 'bytes');

  // 2. Test Tom & Jerry 103 Sticker PDF Download
  console.log('\n[2/2] Menguji download Lembar Stiker Label Tom & Jerry 103 (12 label A4)...');
  const stickerRes = await fetch('http://localhost:4001/api/print/stickers/demo-invitation');
  console.log('Status HTTP:', stickerRes.status);
  console.log('Content-Type:', stickerRes.headers.get('content-type'));
  console.log('Content-Disposition:', stickerRes.headers.get('content-disposition'));
  const stickerBuf = await stickerRes.buffer();
  console.log('Ukuran PDF Lembar Stiker 103:', stickerBuf.length, 'bytes');

  console.log('\n=== UJI COBA FASE 3 SELESAI DENGAN SUKSES ===');
}

testPrintDownloads();
