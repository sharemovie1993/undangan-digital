import React, { useCallback, memo } from 'react';
import { InvitationData } from '../../types';
import { Calendar, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import { useLocalField } from '../../hooks/useLocalField';

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

// EventSessionRow — React.memo per sesi dengan local-buffered input
interface EventSession {
  title?: string;
  date?: string;
  time?: string;
  venueName?: string;
  address?: string;
  googleMapsUrl?: string;
  mapsUrl?: string;
  [key: string]: unknown;
}

interface EventSessionRowProps {
  ev: EventSession;
  index: number;
  eventType: string;
  canRemove: boolean;
  onUpdate: (index: number, key: string, value: string) => void;
  onRemove: (index: number) => void;
}

const EventSessionRow = memo(({ ev, index, eventType, canRemove, onUpdate, onRemove }: EventSessionRowProps) => {
  const commit = useCallback((key: string) => (value: string) => onUpdate(index, key, value), [index, onUpdate]);

  const [localTitle, setLocalTitle] = useLocalField(ev.title || '', commit('title'));
  const [localTime, setLocalTime] = useLocalField(ev.time || '', commit('time'));
  const [localVenue, setLocalVenue] = useLocalField(ev.venueName || '', commit('venueName'));
  const [localAddress, setLocalAddress] = useLocalField(ev.address || '', commit('address'));
  const [localMaps, setLocalMaps] = useLocalField(ev.googleMapsUrl || '', commit('googleMapsUrl'));

  const titlePresets = eventType === 'khitanan'
    ? ['Tasyakuran & Walimah Khitan', 'Acara Ramah Tamah', 'Doa Bersama']
    : eventType === 'wedding'
    ? ['Akad Nikah', 'Resepsi Pernikahan', 'Pemberkatan', 'Temu Manten']
    : eventType === 'aqiqah'
    ? ['Tasyakuran & Aqiqah', 'Gunting Rambut & Doa']
    : ['Pesta Ulang Tahun', 'After Party'];

  const titlePlaceholder = eventType === 'khitanan'
    ? 'Contoh: Tasyakuran & Walimah Khitan'
    : eventType === 'wedding'
    ? (index === 0 ? 'Contoh: Akad Nikah' : 'Contoh: Resepsi Pernikahan')
    : 'Contoh: Acara Utama';

  return (
    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-[#c4a661]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Sesi {index + 1}: {localTitle || `Acara Sesi ${index + 1}`}</span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
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
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
          placeholder={titlePlaceholder}
        />
        <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5 scrollbar-none">
          {titlePresets.map((presetTitle) => (
            <button
              key={presetTitle}
              type="button"
              onClick={() => { setLocalTitle(presetTitle); onUpdate(index, 'title', presetTitle); }}
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
            onChange={(e) => onUpdate(index, 'date', e.target.value)}
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
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder="10:00 s/d Selesai atau 08:00 - 16:00 WIB"
          />
          <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5 scrollbar-none">
            {['10:00 s/d Selesai', '08:00 s/d Selesai', '08:00 - 16:00 WIB', '09:00 - 14:00 WIB', '19:00 s/d Selesai'].map((presetTime) => (
              <button
                key={presetTime}
                type="button"
                onClick={() => { setLocalTime(presetTime); onUpdate(index, 'time', presetTime); }}
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
          value={localVenue}
          onChange={(e) => setLocalVenue(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
          placeholder="Contoh: Rumah / Gedung Graha Kencana"
        />
      </div>

      <div>
        <label className="block text-neutral-400 mb-1">Alamat Lengkap</label>
        <textarea
          rows={2}
          value={localAddress}
          onChange={(e) => setLocalAddress(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
          placeholder="Jl. Gatot Subroto No. 45, Bandung"
        />
      </div>

      <div>
        <label className="block text-neutral-400 mb-1">Link Google Maps (Tombol Navigasi)</label>
        <input
          type="text"
          value={localMaps}
          onChange={(e) => setLocalMaps(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
          placeholder="https://maps.app.goo.gl/..."
        />
      </div>
    </div>
  );
});
EventSessionRow.displayName = 'EventSessionRow';

export const EventScheduleForm: React.FC<EventScheduleFormProps> = ({ data, onChange }) => {
  const events: EventSession[] = data.events && data.events.length > 0 ? data.events : [
    {
      title: data.eventType === 'wedding' ? 'Akad Nikah' : 'Tasyakuran & Walimah',
      date: '2026-09-02',
      time: '08:00 - 16:00 WIB',
      venueName: 'Kediaman / Rumah',
      address: 'Kp. Pasir Peuteuy RT/RW 017/006, Purwakarta',
      googleMapsUrl: 'https://maps.google.com'
    }
  ];

  const updateEvent = useCallback((index: number, key: string, value: string) => {
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
  }, [data, onChange, events]);

  const addEvent = useCallback(() => {
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
  }, [data, onChange, events]);

  const removeEvent = useCallback((index: number) => {
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
  }, [data, onChange, events]);

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
        <EventSessionRow
          key={index}
          ev={ev}
          index={index}
          eventType={data.eventType || 'wedding'}
          canRemove={events.length > 1}
          onUpdate={updateEvent}
          onRemove={removeEvent}
        />
      ))}
    </div>
  );
};


