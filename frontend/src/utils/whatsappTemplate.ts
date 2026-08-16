import { GuestRecipient, InvitationData } from '../types';

/**
 * Generates an event-specific polite WhatsApp invitation message.
 */
export const generateWhatsAppMessage = (
  guest: GuestRecipient,
  data: InvitationData,
  baseUrl: string
): string => {
  const activeSlug = data.slug || data.id || 'undangan';
  const shareUrl = `${baseUrl}/?slug=${encodeURIComponent(activeSlug)}&to=${encodeURIComponent(guest.name)}&mode=invitation`;
  const eventTitle = data.eventTitle || data.title || 'Momen Bahagia Kami';
  const eventType = (data.eventType || 'wedding').toLowerCase();

  const firstEvent = data.events?.[0];
  const dateInfo = firstEvent?.date ? `\n🗓️ *Tanggal:* ${firstEvent.date}` : '';
  const timeInfo = firstEvent?.startTime ? `\n⏰ *Waktu:* ${firstEvent.startTime} ${firstEvent.endTime ? `- ${firstEvent.endTime}` : ''}` : '';
  const locationInfo = firstEvent?.venueName ? `\n📍 *Lokasi:* ${firstEvent.venueName}` : '';

  switch (eventType) {
    case 'khitanan':
      return (
        `*Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara *Walimatul Khitan* putra kami:\n\n` +
        `👶 *${eventTitle}*\n` +
        `${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Berikut tautan undangan digital Anda untuk melihat detail acara, lokasi, dan konfirmasi kehadiran:\n` +
        `👉 ${shareUrl}\n\n` +
        `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu agar ananda menjadi anak yang sholeh dan berbakti.\n\n` +
        `_Wassalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `*Keluarga Besar ${eventTitle}*`
      );

    case 'aqiqah':
      return (
        `*Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `Puji syukur kami panjatkan atas kelahiran buah hati tercinta kami. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara *Tasyakuran Aqiqah*:\n\n` +
        `✨ *${eventTitle}*\n` +
        `${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Silakan buka tautan undangan digital di bawah ini:\n` +
        `👉 ${shareUrl}\n\n` +
        `Doa dan kehadiran Bapak/Ibu/Saudara/i merupakan kebahagiaan yang tak terhingga bagi keluarga kami.\n\n` +
        `_Wassalamu'alaikum Warahmatullahi Wabarakatuh_\n\n` +
        `*Keluarga Besar ${eventTitle}*`
      );

    case 'birthday':
      return (
        `*Hai ${guest.name}!* 🎉✨\n\n` +
        `You're invited! Yuk datang dan ramaikan pesta perayaan ulang tahun:\n\n` +
        `🎂 *${eventTitle}*\n` +
        `${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Buka undangan spesial kamu di sini untuk info lengkap & dress code:\n` +
        `👉 ${shareUrl}\n\n` +
        `Kehadiranmu sangat berarti untuk merayakan hari bahagia ini bersama-sama. Sampai jumpa di pesta ya!\n\n` +
        `Salam hangat,\n*${eventTitle}*`
      );

    case 'wedding':
    default:
      return (
        `*Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name}*\n\n` +
        `_Assalamu'alaikum Warahmatullahi Wabarakatuh_\n` +
        `_Salam Sejahtera bagi kita semua_\n\n` +
        `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri momen sakral pernikahan kami:\n\n` +
        `💍 *${eventTitle}*\n` +
        `${dateInfo}${timeInfo}${locationInfo}\n\n` +
        `Untuk informasi jadwal acara, peta lokasi, dan konfirmasi kehadiran (RSVP), silakan buka tautan undangan digital berikut:\n` +
        `👉 ${shareUrl}\n\n` +
        `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kedua mempelai.\n\n` +
        `Atas kehadiran dan doa restunya, kami ucapkan terima kasih yang sebesar-besarnya.\n\n` +
        `*Kami yang berbahagia,*\n` +
        `*${eventTitle}*`
      );
  }
};
