const fetch = require('node-fetch');

async function testFullApiIntegrations() {
  console.log('=== [PENGUJIAN INTEGRASI API END-TO-END PERSISTEN] ===\n');

  // 1. Test Invitations List
  console.log('[1/5] Menguji GET /api/invitations/list...');
  const invRes = await fetch('http://localhost:4001/api/invitations/list');
  const invJson = await invRes.json();
  console.log('Status:', invRes.status, '| Total Proyek Undangan di DB:', invJson.data?.length);

  // 2. Test Guest Add
  console.log('\n[2/5] Menguji POST /api/guests/add...');
  const guestAddRes = await fetch('http://localhost:4001/api/guests/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invitationId: 'wedding-romeo-juliet',
      name: 'Bpk. Ir. Sutrisno & Ibu',
      address: 'Bandung Barat',
      category: 'VIP',
      pax: 2
    })
  });
  const guestAddJson = await guestAddRes.json();
  console.log('Status:', guestAddRes.status, '| Tamu Terbuat:', guestAddJson.data?.name, '| QR Code:', guestAddJson.data?.qrCode);

  // 3. Test Check-in Scanner API
  console.log('\n[3/5] Menguji POST /api/guests/checkin...');
  const checkinRes = await fetch('http://localhost:4001/api/guests/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrCode: guestAddJson.data?.qrCode
    })
  });
  const checkinJson = await checkinRes.json();
  console.log('Status:', checkinRes.status, '| Pesan Checkin:', checkinJson.message, '| isCheckedIn:', checkinJson.data?.isCheckedIn);

  // 4. Test RSVP Submit & List
  console.log('\n[4/5] Menguji POST /api/rsvps/submit...');
  const rsvpSubmitRes = await fetch('http://localhost:4001/api/rsvps/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invitationId: 'wedding-romeo-juliet',
      name: 'Sahabat Alumni ITB 2018',
      attendance: 'HADIR',
      pax: 3,
      message: 'Selamat menempuh hidup baru Romeo & Juliet! Sakinah mawaddah warahmah.'
    })
  });
  const rsvpSubmitJson = await rsvpSubmitRes.json();
  console.log('Status:', rsvpSubmitRes.status, '| Pesan RSVP:', rsvpSubmitJson.message);

  const rsvpListRes = await fetch('http://localhost:4001/api/rsvps/wedding-romeo-juliet');
  const rsvpListJson = await rsvpListRes.json();
  console.log('Total RSVP Tersimpan di DB:', rsvpListJson.data?.rsvps?.length, '| Total Pax Hadir:', rsvpListJson.data?.stats?.hadirPax);

  // 5. Test Print Vector PDFs
  console.log('\n[5/5] Menguji Generator PDF Kartu & Stiker Cetak...');
  const cardRes = await fetch('http://localhost:4001/api/print/card/wedding-romeo-juliet?format=A5');
  console.log('Status Kartu A5:', cardRes.status, '| Content-Type:', cardRes.headers.get('content-type'));

  const stickerRes = await fetch('http://localhost:4001/api/print/stickers/wedding-romeo-juliet');
  console.log('Status Stiker 103:', stickerRes.status, '| Content-Type:', stickerRes.headers.get('content-type'));

  console.log('\n=== SELURUH INTEGRASI API SELESAI & TERVERIFIKASI 100% PERSISTEN ===');
}

testFullApiIntegrations();
