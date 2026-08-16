import React, { useState, useRef, useEffect } from 'react';
import { InvitationData } from '../../types';
import { Music, Upload, Loader2, Play, Pause, Check, Volume2 } from 'lucide-react';
import { api } from '../../api/client';

interface MusicSelectorFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

const PRESET_TRACKS = [
  {
    title: 'A Thousand Years (Instrumental Piano)',
    artist: 'Wedding Romance',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  {
    title: 'Canon in D Major (Luxury String)',
    artist: 'Johann Pachelbel',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
  },
  {
    title: 'Islamic Acoustic Soft Oud & Strings',
    artist: 'Middle Eastern Heritage',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'
  },
  {
    title: 'Happy Cheerful Acoustic Birthday',
    artist: 'Celebration Joy',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3'
  }
];

export const MusicSelectorForm: React.FC<MusicSelectorFormProps> = ({ data, onChange }) => {
  const currentUrl = data.audioTrack?.url || data.musicUrl || '';
  const [isUploading, setIsUploading] = useState(false);
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and cleanup audio preview
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingPreviewUrl(null);
    };

    audio.onerror = () => {
      setPlayingPreviewUrl(null);
    };

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const togglePreview = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (playingPreviewUrl === url) {
      audioRef.current.pause();
      setPlayingPreviewUrl(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play().then(() => {
        setPlayingPreviewUrl(url);
      }).catch((err) => {
        console.warn('Audio play prevented:', err);
        setPlayingPreviewUrl(null);
      });
    }
  };

  const selectTrack = (track: { title: string; artist: string; url: string }) => {
    onChange({
      ...data,
      musicTitle: track.title,
      musicArtist: track.artist,
      musicUrl: track.url,
      audioTrack: {
        title: track.title,
        artist: track.artist,
        url: track.url,
        autoplay: true
      }
    });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadAudio(file);
      if (res.data?.fileUrl) {
        const titleName = file.name.replace(/\.[^/.]+$/, '');
        onChange({
          ...data,
          musicTitle: titleName,
          musicArtist: 'Berkas Kustom Anda',
          musicUrl: res.data.fileUrl,
          audioTrack: {
            title: titleName,
            artist: 'Berkas Kustom Anda',
            url: res.data.fileUrl,
            autoplay: true
          }
        });
      }
    } catch (err) {
      console.warn('Upload audio error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#c4a661]">
            <Music className="w-3.5 h-3.5" />
            <span>Koleksi Lagu Latar (Live Audio Preview)</span>
          </div>
          {playingPreviewUrl && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>Memutar Suara...</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {PRESET_TRACKS.map((track, i) => {
            const isSelected = currentUrl === track.url;
            const isPlayingThis = playingPreviewUrl === track.url;

            return (
              <div
                key={i}
                onClick={() => selectTrack(track)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'border-[#c4a661] bg-[#c4a661]/15 text-white shadow-xs'
                    : 'border-neutral-800 bg-neutral-950/80 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {/* 1. Tombol Test / Preview Suara di Tiap Item */}
                <button
                  type="button"
                  onClick={(e) => togglePreview(e, track.url)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isPlayingThis
                      ? 'bg-[#c4a661] text-neutral-950 shadow-md ring-2 ring-[#c4a661]/40'
                      : 'bg-neutral-800 hover:bg-[#c4a661]/30 text-neutral-300 hover:text-white border border-neutral-700'
                  }`}
                  title={isPlayingThis ? 'Jeda Suara' : 'Uji / Dengarkan Suara Musik'}
                >
                  {isPlayingThis ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* 2. Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[11px] text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{track.title}</span>
                    {isPlayingThis && (
                      <span className="flex items-end gap-0.5 h-2.5 shrink-0">
                        <span className="w-0.5 h-full bg-[#c4a661] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-0.5 h-2/3 bg-[#c4a661] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-0.5 h-full bg-[#c4a661] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">{track.artist}</div>
                </div>

                {/* 3. Status Terpilih Badge */}
                <div className="shrink-0">
                  {isSelected ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#c4a661] text-neutral-950 text-[9px] font-bold shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Aktif</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-500 hover:text-neutral-300">Pilih</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Audio Upload & Test */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <label className="block text-[11px] font-semibold text-neutral-300">Unggah Lagu MP3 Sendiri (Kustom)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => onChange({
                ...data,
                musicTitle: 'Custom Audio',
                musicArtist: 'User Upload',
                musicUrl: e.target.value,
                audioTrack: {
                  title: 'Custom Audio',
                  artist: 'User Upload',
                  url: e.target.value,
                  autoplay: true
                }
              })}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="https://... atau unggah MP3 ->"
            />
            {currentUrl && (
              <button
                type="button"
                onClick={(e) => togglePreview(e, currentUrl)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition cursor-pointer shrink-0 ${
                  playingPreviewUrl === currentUrl
                    ? 'bg-[#c4a661] text-neutral-950 border-[#c4a661]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Test Audio Kustom"
              >
                {playingPreviewUrl === currentUrl ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Test</span>
              </button>
            )}
            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer flex items-center gap-1 shrink-0 border border-neutral-700 font-semibold text-xs transition">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4a661]" /> : <Upload className="w-3.5 h-3.5 text-[#c4a661]" />}
              <span>Upload</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
