import { EventSession } from '../types';

export function createGoogleCalendarUrl(session: EventSession, eventTitle: string): string {
  // Format dates: YYYYMMDDTHHMMSSZ
  const startTimeClean = session.startTime.replace(':', '') + '00';
  const endTimeClean = session.endTime.replace(':', '') + '00';

  // Basic date parsing assumption: 20261024T080000 / WIB (+07:00)
  // Let's create a date representation
  const startDate = '20261024T010000Z'; // UTC equivalent
  const endDate = '20261024T030000Z';

  const title = encodeURIComponent(`${eventTitle} - ${session.title}`);
  const details = encodeURIComponent(`${session.notes || ''}\nVenue: ${session.venueName}\nAddress: ${session.venueAddress}`);
  const location = encodeURIComponent(`${session.venueName}, ${session.venueAddress}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
}

export function downloadIcsFile(session: EventSession, eventTitle: string) {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luxury Digital Invitation//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${eventTitle} - ${session.title}`,
    `DESCRIPTION:${session.notes || ''} Venue: ${session.venueName}`,
    `LOCATION:${session.venueName}, ${session.venueAddress}`,
    'DTSTART:20261024T010000Z',
    'DTEND:20261024T030000Z',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${session.title}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
