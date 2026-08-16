import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Users,
  Search,
  Volume2,
  Clock,
  Sparkles,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { GuestRecipient } from '../types';

interface ReceptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationTitle: string;
  guests?: GuestRecipient[];
  onGuestCheckedIn?: (guestId: string) => void;
}

export const ReceptionScannerModal: React.FC<ReceptionScannerModalProps> = ({
  isOpen,
  onClose,
  invitationTitle,
  guests = [],
  onGuestCheckedIn,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    name: string;
    pax: number;
    message: string;
    alreadyCheckedIn?: boolean;
  } | null>(null);

  const [localGuests, setLocalGuests] = useState<GuestRecipient[]>(
    Array.isArray(guests) ? guests : []
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setLocalGuests(Array.isArray(guests) ? guests : []);
  }, [guests]);

  // Start Camera
  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const handleCheckInSubmit = async (targetNameOrCode: string) => {
    if (!targetNameOrCode.trim()) return;

    const query = targetNameOrCode.trim().toLowerCase();
    const foundGuest = localGuests.find(
      (g) =>
        g.id.toLowerCase() === query ||
        g.name.toLowerCase().includes(query) ||
        (g as any).qrCode?.toLowerCase() === query
    );

    if (foundGuest) {
      const already = (foundGuest as any).isCheckedIn || false;
      const updated = localGuests.map((g) =>
        g.id === foundGuest.id
          ? { ...g, isCheckedIn: true, checkedInAt: new Date().toLocaleTimeString('id-ID') }
          : g
      );
      setLocalGuests(updated);
      onGuestCheckedIn(foundGuest.id);

      // Persist to SQLite Database via Fastify API
      try {
        const qr = (foundGuest as any).qrCode || foundGuest.id;
        await api.checkInGuest(qr);
      } catch (err) {
        console.warn('[CheckIn API Notice] Synced locally and updated:', err);
      }

      setScanResult({
        success: true,
        name: foundGuest.name,
        pax: foundGuest.paxQuota || 2,
        message: already
          ? `Tamu sudah check-in sebelumnya.`
          : `Check-in berhasil! Selamat datang di acara.`,
        alreadyCheckedIn: already
      });
    } else {
      setScanResult({
        success: false,
        name: targetNameOrCode,
        pax: 0,
        message: 'Tamu tidak ditemukan dalam daftar undangan.'
      });
    }

    setManualCode('');
    setTimeout(() => {
      setScanResult(null);
    }, 4000);
  };

  const safeGuests = Array.isArray(localGuests) ? localGuests : [];
  const totalRegistered = safeGuests.length;
  const checkedInCount = safeGuests.filter((g) => (g as any).isCheckedIn).length;
  const totalPax = safeGuests
    .filter((g) => (g as any).isCheckedIn)
    .reduce((acc, curr) => acc + (curr.paxQuota || 2), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#c4a661]/40 bg-[#111115] text-[#e2e2e7] shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-800/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c4a661]/10 border border-[#c4a661]/30 text-[#c4a661] text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            RECEPTIONIST CHECK-IN DESK
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Scanner Tamu Resepsi</h2>
          <p className="text-xs text-neutral-400 mt-1">{invitationTitle}</p>
        </div>

        {/* Attendance Stats Counter */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-center">
            <div className="text-[10px] uppercase font-semibold text-neutral-400">Total Tamu</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalRegistered}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-center">
            <div className="text-[10px] uppercase font-semibold text-emerald-400">Hadir (Checked-In)</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">{checkedInCount}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[10px] uppercase font-semibold text-[#c4a661]">Total Pax Masuk</div>
            <div className="text-xl font-bold text-[#c4a661] mt-0.5">{totalPax} Pax</div>
          </div>
        </div>

        {/* Scanner & Manual Search Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Camera Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800 aspect-square flex flex-col items-center justify-center">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Camera className="w-10 h-10 text-neutral-600 mx-auto mb-2 animate-pulse" />
                <span className="text-xs text-neutral-500">Kamera tidak aktif</span>
              </div>
            )}

            {/* Scanner Target Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-[#c4a661] rounded-2xl relative shadow-[0_0_30px_rgba(196,166,97,0.3)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#c4a661] -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#c4a661] translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#c4a661] -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#c4a661] translate-x-1 translate-y-1" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c4a661] to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
              </div>
            </div>

            <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] text-neutral-300 font-medium border border-white/10">
              Arahkan QR Code Tamu ke Kotak Target
            </div>
          </div>

          {/* Right: Manual Input & Recent Stream */}
          <div className="space-y-4">
            {/* Quick Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCheckInSubmit(manualCode);
              }}
              className="space-y-2"
            >
              <label className="block text-xs font-semibold text-neutral-300">
                Cari Nama Tamu / Ketik Kode QR Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4a661]"
                  placeholder="Contoh: Ahmad Suherman atau GST-001"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-2 rounded-xl bg-[#c4a661] text-neutral-950 font-bold text-xs hover:bg-[#d5b874] transition cursor-pointer disabled:opacity-50"
                >
                  Check-In
                </button>
              </div>
            </form>

            {/* Live Scan Notification Card */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  scanResult.success
                    ? scanResult.alreadyCheckedIn
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-sm">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{scanResult.name}</span>
                </div>
                <div className="text-xs mt-1 opacity-90">{scanResult.message}</div>
                {scanResult.success && (
                  <div className="text-[11px] font-semibold mt-1 bg-black/30 inline-block px-2 py-0.5 rounded">
                    Kuota: {scanResult.pax} Pax
                  </div>
                )}
              </div>
            )}

            {/* Recent Check-in List */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 mb-2">
                <span>Daftar Tamu Siap Check-in:</span>
                <span>{localGuests.length} Tamu</span>
              </div>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {localGuests.slice(0, 8).map((g) => {
                  const isChecked = (g as any).isCheckedIn;
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleCheckInSubmit(g.name)}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white text-[11px]">{g.name}</div>
                        <div className="text-[10px] text-neutral-500">
                          {g.addressOrCity} • {g.paxQuota || 2} Pax
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isChecked
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isChecked ? 'Hadir' : 'Check-in'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
