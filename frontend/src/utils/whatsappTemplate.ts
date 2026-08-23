import { GuestRecipient, InvitationData } from '../types';

/**
 * Helper memformat tanggal ke format Bahasa Indonesia lengkap dengan nama HARI (e.g. "Rabu, 02 September 2026")
 */
const formatIndonesianDate = (rawDate?: string): string => {
  if (!rawDate) return '';
  const clean = rawDate.trim();

  // Jika sudah berbentuk teks yang memiliki nama hari (misal "Minggu, 15 November 2026" atau "Rabu, 02 September 2026")
  if (/(senin|selasa|rabu|kamis|jumat|sabtu|minggu)/i.test(clean)) {
    return clean;
  }

  try {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Tangani format YYYY-MM-DD secara aman (tanpa timezone shift)
    const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const d = new Date(year, month, day);
      const dayName = days[d.getDay()];
      const monthName = months[month];
      return `${dayName}, ${day} ${monthName} ${year}`;
    }

    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      return `${dayName}, ${d.getDate()} ${monthName} ${d.getFullYear()}`;
    }
  } catch {}

  return clean;
};

/**
 * Generates an event-specific polite WhatsApp invitation message with explicit Day, Date, and Full Names.
 */
export const generateWhatsAppMessage = (
  guest: GuestRecipient,
  data: InvitationData,
  baseUrl: string
): string => {
  const activeSlug = data.slug || data.id || 'undangan';
  const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;
  const eventType = (data.eventType || 'wedding').toLowerCase();

  // 1. Ambil Nama Profil Lengkap & Utuh (Prioritaskan Nama Lengkap)
  const p1 = data.profiles?.[0];
  const p2 = data.profiles?.[1];

  const rawTitle = data.eventTitle || (data as any).title || '';

  const cleanChildName = (() => {
    if (p1?.fullName && p1.fullName.trim()) return p1.fullName.trim();
    if (p1?.name && p1.name.trim()) return p1.name.trim();
    const stripped = rawTitle.replace(/^(Walimatul Khitan|Tasyakuran Aqiqah|Syukuran Khitan|Ulang Tahun|Birthday)\s*/i, '').trim();
    return stripped || 'Putra Tercinta';
  })();

  const cleanCoupleNames = (() => {
    const name1 = p1?.fullName?.trim() || p1?.name?.trim();
    const name2 = p2?.fullName?.trim() || p2?.name?.trim();
    if (name1 && name2) return `${name1} & ${name2}`;
    return rawTitle || 'Romeo & Juliet';
  })();

  // 2. Ambil Informasi Hari, Tanggal, Jam & Tempat Acara
  const firstSession = data.sessions?.[0] || (data as any).events?.[0];
  const rawDate = firstSession?.date || data.eventDate;
  const formattedDate = formatIndonesianDate(rawDate);

  const sessionTitle = firstSession?.title ? `\n🏷️ *Acara:* ${firstSession.title}` : '';
  const dateInfo = formattedDate ? `\n🗓️ *Hari/Tanggal:* ${formattedDate}` : '';
  const timeInfo = firstSession?.startTime
    ? `\n⏰ *Waktu:* ${firstSession.startTime} ${firstSession.endTime ? `- ${firstSession.endTime}` : ''} ${firstSession.timeZone || 'WIB'}`.trim()
    : '';
  const locationInfo = firstSession?.venueName
    ? `\n📍 *Tempat / Lokasi:* ${firstSession.venueName}${firstSession.venueAddress ? ` (${firstSession.venueAddress})` : ''}`
    : '';

  // 3. Tanda Tangan Keluarga Besar
  const familySignature = (() => {
    if (p1?.fatherName && p1?.motherName) {
      return `Keluarga Besar Bpk. ${p1.fatherName} & Ibu ${p1.motherName}`;
    }
    if (p1?.fatherName) {
      return `Keluarga Besar Bpk. ${p1.fatherName}`;
    }
    if (eventType === 'khitanan' || eventType === 'aqiqah' || eventType === 'birthday') {
      return `Keluarga Besar ${cleanChildName}`;
    }
    return `Keluarga Besar ${cleanCoupleNames}`;
  })();

  switch (eventType) {
    case 'khitanan':
      return (
        `*Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara *Walimatul Khitan* putra kami:\n\n` +
        `👶 *${cleanChildName}*\n` +
        `${sessionTitle}${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Berikut tautan undangan digital Anda untuk melihat detail acara, peta lokasi, dan konfirmasi kehadiran:\n` +
        `👉 ${shareUrl}\n\n` +
        `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu agar ananda menjadi anak yang sholeh, cerdas, dan berbakti kepada orang tua.\n\n` +
        `_Wassalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `*${familySignature}*`
      );

    case 'aqiqah':
      return (
        `*Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `Puji syukur kami panjatkan atas kelahiran buah hati tercinta kami. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara *Tasyakuran Aqiqah*:\n\n` +
        `✨ *${cleanChildName}*\n` +
        `${sessionTitle}${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Silakan buka tautan undangan digital di bawah ini untuk informasi lengkap dan konfirmasi kehadiran:\n` +
        `👉 ${shareUrl}\n\n` +
        `Doa dan kehadiran Bapak/Ibu/Saudara/i merupakan kebahagiaan yang tak terhingga bagi keluarga kami.\n\n` +
        `_Wassalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `*${familySignature}*`
      );

    case 'birthday':
      return (
        `*Hai ${guest.name}!* 🎉✨\n\n` +
        `You're invited! Yuk datang dan ramaikan pesta perayaan ulang tahun:\n\n` +
        `🎂 *${cleanChildName}*\n` +
        `${sessionTitle}${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Buka undangan spesial kamu di sini untuk info lengkap, peta lokasi & dress code:\n` +
        `👉 ${shareUrl}\n\n` +
        `Kehadiranmu sangat berarti untuk merayakan hari bahagia ini bersama-sama. Sampai jumpa di pesta ya!\n\n` +
        `Salam hangat,\n*${familySignature}*`
      );

    case 'wedding':
    default:
      return (
        `*Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n` +
        `_Salam Sejahtera bagi kita semua_\n\n` +
        `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri momen sakral pernikahan kami:\n\n` +
        `💍 *${cleanCoupleNames}*\n` +
        `${sessionTitle}${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Untuk informasi jadwal acara, peta lokasi, dan konfirmasi kehadiran (RSVP), silakan buka tautan undangan digital berikut:\n` +
        `👉 ${shareUrl}\n\n` +
        `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kedua mempelai.\n\n` +
        `Atas kehadiran dan doa restunya, kami ucapkan terima kasih yang sebesar-besarnya.\n\n` +
        `*Kami yang berbahagia,*\n` +
        `*${familySignature}*`
      );
  }
};

