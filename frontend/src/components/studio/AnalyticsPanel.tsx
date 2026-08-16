import React from 'react';
import { WishMessage } from '../../types';

interface AnalyticsPanelProps {
  wishes: WishMessage[];
  totalPax: number;
  totalAttending: number;
  totalNotAttending: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  wishes,
  totalPax,
  totalAttending,
  totalNotAttending,
}) => {
  return (
    <div className="w-full max-w-2xl bg-[#111115] border border-[#1f1f27] rounded-2xl p-4 md:p-6 space-y-6">
      <div>
        <h3 className="font-serif text-xl font-bold text-[#c4a661]">
          Live Attendance Analytics
        </h3>
        <p className="text-xs text-gray-400">
          Real-time RSVP confirmation and guestbook sentiment from SQLite database.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Pax Hadir</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalPax} Pax</div>
          <div className="text-[9px] text-gray-500 mt-0.5">{totalAttending} Konfirmasi</div>
        </div>
        <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Tidak Hadir</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{totalNotAttending}</div>
          <div className="text-[9px] text-gray-500 mt-0.5">Berhalangan</div>
        </div>
        <div className="bg-[#1f1f27] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Doa & Ucapan</div>
          <div className="text-2xl font-bold text-[#d4af37] mt-1">{wishes.length}</div>
          <div className="text-[9px] text-gray-500 mt-0.5">Di Buku Tamu</div>
        </div>
      </div>

      {/* Recent RSVP Stream */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {wishes.map((w) => (
          <div key={w.id} className="p-3 bg-[#1f1f27] rounded-xl border border-white/5 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">{w.senderName}</span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  w.status === 'hadir'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {w.status === 'hadir' ? `Hadir (${w.pax || 1} Pax)` : 'Tidak Hadir'}
              </span>
            </div>
            <p className="text-gray-300 italic">"{w.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};
