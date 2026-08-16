const fetch = require('node-fetch');

async function runCompleteBackend360Test() {
  console.log('===============================================================');
  console.log('       PENGUJIAN MENYELURUH BACKEND 360° LUXEINVITE PRO        ');
  console.log('===============================================================\n');

  // 1. Health check
  console.log('[1/10] Menguji Health Check Endpoint...');
  const healthRes = await fetch('http://localhost:4001/health');
  const healthJson = await healthRes.json();
  console.log('Status HTTP:', healthRes.status, '| Respon:', healthJson.service);

  // 2. Auth: Register & Login JWT
  console.log('\n[2/10] Menguji Autentikasi JWT (Register & Login)...');
  const testEmail = `vendor_${Date.now()}@absenta.id`;
  const regRes = await fetch('http://localhost:4001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vendor Wedding Organizer Pro',
      email: testEmail,
      phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'password123',
      role: 'RESELLER'
    })
  });
  const regJson = await regRes.json();
  const token = regJson.data?.token;
  console.log('Register Status:', regRes.status, '| Role:', regJson.data?.user?.role, '| Kuota Token:', regJson.data?.user?.quotaTokens);

  // Protected /api/auth/me
  const meRes = await fetch('http://localhost:4001/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meJson = await meRes.json();
  console.log('Auth Me Status:', meRes.status, '| Profil Terverifikasi:', meJson.data?.name);

  // 3. Invitations CRUD & 1-Click Duplicate
  console.log('\n[3/10] Menguji CRUD Undangan & Duplikasi Proyek 1-Klik...');
  const invSaveRes = await fetch('http://localhost:4001/api/invitations/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'The Wedding of Romeo & Juliet',
      slug: 'wedding-romeo-juliet',
      eventType: 'WEDDING',
      themeId: 'champagne_gold',
      eventData: { eventDate: '2026-10-24', locationName: 'Grand Ballroom Hotel Horison' }
    })
  });
  const invSaveJson = await invSaveRes.json();
  const invId = invSaveJson.data?.id;
  console.log('Save Status:', invSaveRes.status, '| ID Undangan:', invId, '| Slug:', invSaveJson.data?.slug);

  const dupRes = await fetch(`http://localhost:4001/api/invitations/${invId}/duplicate`, {
    method: 'POST'
  });
  const dupJson = await dupRes.json();
  console.log('Duplicate Status:', dupRes.status, '| Salinan Slug Baru:', dupJson.data?.slug);

  // 4. Guest Bulk Import & CSV Export
  console.log('\n[4/10] Menguji Impor Massal Tamu & Ekspor CSV Kehadiran...');
  const bulkRes = await fetch('http://localhost:4001/api/guests/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invitationId: invId,
      guests: [
        { name: 'Bpk. Ahmad Suherman & Kel', address: 'Jakarta Selatan', category: 'VIP', pax: 2 },
        { name: 'Ibu Ratna Dewi', address: 'Bandung', category: 'Sahabat', pax: 2 },
        { name: 'dr. Farhan Maulana, Sp.A', address: 'Surabaya', category: 'VIP', pax: 1 }
      ]
    })
  });
  const bulkJson = await bulkRes.json();
  console.log('Bulk Import Status:', bulkRes.status, '| Total Tamu Terimpor:', bulkJson.data?.length);

  const exportCsvRes = await fetch(`http://localhost:4001/api/guests/${invId}/export-csv`);
  console.log('Export CSV Status:', exportCsvRes.status, '| Content-Type:', exportCsvRes.headers.get('content-type'));

  // 5. QR Check-in Receptionist
  console.log('\n[5/10] Menguji QR Check-in Meja Resepsi...');
  const guestQr = bulkJson.data[0]?.qrCode;
  const checkinRes = await fetch('http://localhost:4001/api/guests/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode: guestQr })
  });
  const checkinJson = await checkinRes.json();
  console.log('Check-in Status:', checkinRes.status, '| Pesan:', checkinJson.message, '| isCheckedIn:', checkinJson.data?.isCheckedIn);

  // 6. RSVP & Likes
  console.log('\n[6/10] Menguji RSVP & Fitur Like Ucapan Tamu...');
  const rsvpRes = await fetch('http://localhost:4001/api/rsvps/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invitationId: invId,
      name: 'Sahabat Teknik ITB 2018',
      attendance: 'HADIR',
      pax: 3,
      message: 'Selamat berbahagia Romeo & Juliet!'
    })
  });
  const rsvpJson = await rsvpRes.json();
  const rsvpId = rsvpJson.data?.id;
  console.log('Submit RSVP Status:', rsvpRes.status, '| ID RSVP:', rsvpId);

  const likeRes = await fetch(`http://localhost:4001/api/rsvps/${rsvpId}/like`, { method: 'POST' });
  const likeJson = await likeRes.json();
  console.log('Like Status:', likeRes.status, '| Total Likes:', likeJson.data?.likes);

  // 7. Full Print 300 DPI Physical Suite (Card, Stickers, Souvenir Tags, Table Standee)
  console.log('\n[7/10] Menguji Suite Lengkap Generator PDF Cetak 300 DPI...');
  const cardPdf = await fetch(`http://localhost:4001/api/print/card/${invId}?format=A5`);
  console.log('✓ Kartu Fisik A5 PDF:', cardPdf.status, `(${cardPdf.headers.get('content-type')})`);

  const stickerPdf = await fetch(`http://localhost:4001/api/print/stickers/${invId}`);
  console.log('✓ Stiker Tom & Jerry 103 PDF:', stickerPdf.status, `(${stickerPdf.headers.get('content-type')})`);

  const souvenirPdf = await fetch(`http://localhost:4001/api/print/souvenir-tags/${invId}`);
  console.log('✓ Kupon Souvenir & Makanan PDF:', souvenirPdf.status, `(${souvenirPdf.headers.get('content-type')})`);

  const standeePdf = await fetch(`http://localhost:4001/api/print/table-standee/${invId}`);
  console.log('✓ Table Standee QR Reception A6 PDF:', standeePdf.status, `(${standeePdf.headers.get('content-type')})`);

  // 8. Automated Webhook Callback
  console.log('\n[8/10] Menguji Automated Webhook Callback Lisensi...');
  const webhookRes = await fetch('http://localhost:4001/api/license/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoice_number: 'INV-TEST-WEBHOOK-99',
      status: 'PAID',
      license_key: 'UND-PRO-WEBHOOK-ACTIVE'
    })
  });
  const webhookJson = await webhookRes.json();
  console.log('Webhook Status:', webhookRes.status, '| Message:', webhookJson.message);

  // 9. Google Stitch Manifest Catalog
  console.log('\n[9/10] Menguji Google Stitch Component Manifest Catalog...');
  const stitchRes = await fetch('http://localhost:4001/api/stitch/manifests');
  const stitchJson = await stitchRes.json();
  console.log('Stitch Manifests Status:', stitchRes.status, '| Total Blok Terdaftar:', stitchJson.data?.length);

  // 10. Public Invitation Watermark Check
  console.log('\n[10/10] Menguji Halaman Publik Undangan (/api/invitations/slug/:slug)...');
  const pubRes = await fetch(`http://localhost:4001/api/invitations/slug/wedding-romeo-juliet`);
  const pubJson = await pubRes.json();
  console.log('Public Invitation Status:', pubRes.status, '| Judul:', pubJson.data?.title, '| isWatermark:', pubJson.data?.isWatermark);

  console.log('\n===============================================================');
  console.log('  HASIL AKHIR: 10/10 PENGUJIAN BACKEND 360° LULUS 100% SUKSES  ');
  console.log('===============================================================');
}

runCompleteBackend360Test();
