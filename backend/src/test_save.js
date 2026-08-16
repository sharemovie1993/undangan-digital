const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:4001/api/invitations/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Aris & Sarah Wedding',
        slug: 'demo-invitation',
        eventType: 'WEDDING',
        themeId: 'gold',
        eventData: {
          couple: { groomName: 'Aris', brideName: 'Sarah' },
          eventDate: 'Sabtu, 24 Oktober 2026',
          locationName: 'Graha Kencana Bandung',
          locationAddress: 'Jl. Gatot Subroto No. 45'
        }
      })
    });
    const data = await res.json();
    console.log('Save result:', data.success ? 'OK' : data);

    const pdfRes = await fetch('http://localhost:4001/api/print/card/' + data.data.id + '?format=A5');
    console.log('PDF Header Content-Type:', pdfRes.headers.get('content-type'));
    const pdfBuf = await pdfRes.buffer();
    console.log('PDF Generated Size (bytes):', pdfBuf.length);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
