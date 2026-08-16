import React from 'react';
import { InvitationData } from '../../types';
import { Calendar, MapPin, Clock, Plus, Trash2 } from 'lucide-react';

interface EventScheduleFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

// Helper to format ISO date (2026-09-02) into Indonesian date preview
const getIndonesianDatePreview = (dateString?: string) => {
  if (!dateString) return 'Pilih tanggal acara';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
  } catch {}
  return dateString;
};

export const EventScheduleForm: React.FC<EventScheduleFormProps> = ({ data, onChange }) => {
  const events = data.events && data.events.length > 0 ? data.events : [
    {
      title: data.eventType === 'wedding' ? 'Akad Nikah' : 'Tasyakuran & Walimah',
      date: '2026-09-02',
      time: '08:00 - 16:00 WIB',
      venueName: 'Kediaman / Rumah',
      address: 'Kp. Pasir Peuteuy RT/RW 017/006, Purwakarta',
      googleMapsUrl: 'https://maps.google.com'
    }
  ];

  const updateEvent = (index: number, key: string, value: string) => {
    const updated = [...events];
    if (!updated[index]) {
      updated[index] = { title: '', date: '', time: '', venueName: '', address: '', googleMapsUrl: '' };
    }
    updated[index] = { ...updated[index], [key]: value };
    
    // Auto sync sessions & eventDate
    const syncedSessions = updated.map((ev, i) => ({
      id: `session-${i + 1}`,
      title: ev.title || `Sesi ${i + 1}`,
      date: ev.date,
      startTime: (ev.time || '').split('-')[0]?.trim() || '08:00',
      endTime: (ev.time || '').split('-')[1]?.trim() || 'Selesai',
      timeZone: 'WIB',
      venueName: ev.venueName,
      venueAddress: ev.address,
      mapUrl: ev.googleMapsUrl || ev.mapsUrl,
      mapsUrl: ev.googleMapsUrl || ev.mapsUrl,
    }));

    onChange({
      ...data,
      events: updated,
      sessions: syncedSessions,
      eventDate: updated[0]?.date ? `${updated[0].date}T08:00:00` : data.eventDate
    });
  };

  const addEvent = () => {
    const newEvent = {
      title: `Sesi ${events.length + 1}: Resepsi / Ramah Tamah`,
      date: events[0]?.date || '2026-09-02',
      time: '11:00 - 14:00 WIB',
      venueName: events[0]?.venueName || 'Gedung Serbaguna',
      address: events[0]?.address || '',
      googleMapsUrl: events[0]?.googleMapsUrl || ''
    };
    const updated = [...events, newEvent];
    onChange({
      ...data,
      events: updated,
      sessions: updated.map((ev, i) => ({
        id: `session-${i + 1}`,
        title: ev.title || `Sesi ${i + 1}`,
        date: ev.date,
        startTime: (ev.time || '').split('-')[0]?.trim() || '08:00',
        endTime: (ev.time || '').split('-')[1]?.trim() || 'Selesai',
        timeZone: 'WIB',
        venueName: ev.venueName,
        venueAddress: ev.address,
        mapUrl: ev.googleMapsUrl || ev.mapsUrl,
        mapsUrl: ev.googleMapsUrl || ev.mapsUrl,
      }))
    });
  };

  const removeEvent = (index: number) => {
    const updated = events.filter((_, i) => i !== index);
    onChange({
      ...data,
      events: updated,
      sessions: updated.map((ev, i) => ({
        id: `session-${i + 1}`,
        title: ev.title || `Sesi ${i + 1}`,
        date: ev.date,
        startTime: (ev.time || '').split('-')[0]?.trim() || '08:00',
        endTime: (ev.time || '').split('-')[1]?.trim() || 'Selesai',
        timeZone: 'WIB',
        venueName: ev.venueName,
        venueAddress: ev.address,
        mapUrl: ev.googleMapsUrl || ev.mapsUrl,
        mapsUrl: ev.googleMapsUrl || ev.mapsUrl,
      }))
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-neutral-400 font-medium">Jadwal & Sesi Acara</span>
        <button
          type="button"
          onClick={addEvent}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#c4a661] hover:text-[#d5b874] bg-[#c4a661]/10 px-2.5 py-1 rounded-lg border border-[#c4a661]/30 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Tambah Sesi</span>
        </button>
      </div>

      {events.map((ev, index) => (
        <div key={index} className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[#c4a661]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sesi {index + 1}: {ev.title || `Acara Sesi ${index + 1}`}</span>
            </div>
            {events.length > 1 && (
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                title="Hapus sesi ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Nama / Judul Acara</label>
            <input
              type="text"
              value={ev.title || ''}
              onChange={(e) => updateEvent(index, 'title', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder={data.eventType === 'khitanan' ? 'Contoh: Tasyakuran & Walimah Khitan' : data.eventType === 'wedding' ? (index === 0 ? 'Contoh: Akad Nikah' : 'Contoh: Resepsi Pernikahan') : 'Contoh: Acara Utama'}
            />
            <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5 scrollbar-none">
              {(data.eventType === 'khitanan'
                ? ['Tasyakuran & Walimah Khitan', 'Acara Ramah Tamah', 'Doa Bersama']
                : data.eventType === 'wedding'
                ? ['Akad Nikah', 'Resepsi Pernikahan', 'Pemberkatan', 'Temu Manten']
                : data.eventType === 'aqiqah'
                ? ['Tasyakuran & Aqiqah', 'Gunting Rambut & Doa']
                : ['Pesta Ulang Tahun', 'After Party']
              ).map((presetTitle) => (
                <button
                  key={presetTitle}
                  type="button"
                  onClick={() => updateEvent(index, 'title', presetTitle)}
                  className="text-[9px] px-2 py-0.5 bg-neutral-950 hover:bg-[#c4a661]/20 hover:text-[#c4a661] border border-neutral-800 rounded text-neutral-300 shrink-0 cursor-pointer transition"
                >
                  {presetTitle}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-neutral-400 mb-1">Tanggal Acara</label>
              <input
                type="date"
                value={ev.date || ''}
                onChange={(e) => updateEvent(index, 'date', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661] cursor-pointer"
              />
              <div className="text-[10px] text-[#c4a661] mt-1 font-medium truncate">
                {getIndonesianDatePreview(ev.date)}
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Waktu / Jam Acara</label>
              <input
                type="text"
                value={ev.time || ''}
                onChange={(e) => updateEvent(index, 'time', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                placeholder="10:00 s/d Selesai atau 08:00 - 16:00 WIB"
              />
              <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5 scrollbar-none">
                {['10:00 s/d Selesai', '08:00 s/d Selesai', '08:00 - 16:00 WIB', '09:00 - 14:00 WIB', '19:00 s/d Selesai'].map((presetTime) => (
                  <button
                    key={presetTime}
                    type="button"
                    onClick={() => updateEvent(index, 'time', presetTime)}
                    className="text-[9px] px-2 py-0.5 bg-neutral-950 hover:bg-[#c4a661]/20 hover:text-[#c4a661] border border-neutral-800 rounded text-neutral-300 shrink-0 cursor-pointer transition"
                  >
                    {presetTime}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Nama Tempat / Gedung / Rumah</label>
            <input
              type="text"
              value={ev.venueName || ''}
              onChange={(e) => updateEvent(index, 'venueName', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Contoh: Rumah / Gedung Graha Kencana"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={ev.address || ''}
              onChange={(e) => updateEvent(index, 'address', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Jl. Gatot Subroto No. 45, Bandung"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Link Google Maps (Tombol Navigasi)</label>
            <input
              type="text"
              value={ev.googleMapsUrl || ''}
              onChange={(e) => updateEvent(index, 'googleMapsUrl', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
        </div>
      ))}
    </div>
  );
};
