import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { romanticAudio } from '../utils/audioPlayer';
import { InvitationData } from '../types';
import { THEMES } from '../data/presets';

interface FloatingMusicPlayerProps {
  data: InvitationData;
  position?: 'fixed' | 'absolute';
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ data, position = 'absolute' }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
  const activePrimary = data.themeConfig?.primaryColor || theme.primary || '#c4a661';
  const cardBg = data.themeConfig?.cardBgColor || theme.cardBg || '#121216';

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const unsub = romanticAudio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    romanticAudio.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    romanticAudio.setVolume(val);
  };

  return (
    <>
      {/* Floating Vinyl Disc Button */}
      <div className={`${position === 'fixed' ? 'fixed bottom-20 right-4' : 'absolute bottom-6 right-4'} z-30 flex flex-col items-end pointer-events-auto`}>
        {/* Animated Pop-out details Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mb-2 w-64 rounded-2xl border p-4 text-white shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: `${cardBg}fa`,
                borderColor: `${activePrimary}50`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5 animate-pulse" style={{ color: activePrimary }} />
                  <span
                    className="text-[10px] tracking-wider uppercase font-semibold font-mono"
                    style={{ color: activePrimary }}
                  >
                    Background Music
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">Audio Track</span>
              </div>

              <p className="text-xs font-bold text-white truncate">
                {data.musicTitle || 'Instrumental Romance'}
              </p>
              <p className="text-[10px] text-neutral-400 truncate mb-3">
                {data.musicArtist || 'LuxeInvite Wedding'}
              </p>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" style={{ color: activePrimary }} />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                  style={{ accentColor: activePrimary }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vinyl Disc Container */}
        <div className="flex items-center gap-2">
          {/* Quick Info Chip */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowDrawer(!showDrawer)}
              className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] backdrop-blur-md shadow-lg"
              style={{
                backgroundColor: `${cardBg}ee`,
                borderColor: `${activePrimary}40`,
                color: activePrimary,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-ping"
                style={{ backgroundColor: activePrimary }}
              />
              <span className="truncate max-w-[110px] text-white">{data.musicTitle}</span>
            </motion.div>
          )}

          {/* Interactive Vinyl Button */}
          <motion.button
            id="floating-vinyl-music-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggle}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowDrawer(!showDrawer);
            }}
            title={isPlaying ? 'Jeda Musik (Klik untuk Jeda)' : 'Putar Musik Latar'}
            className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-neutral-950 p-1 shadow-2xl cursor-pointer border-2"
            style={{
              borderColor: activePrimary,
              boxShadow: `0 0 20px ${activePrimary}40`,
            }}
          >
            {/* Spinning Vinyl Texture */}
            <div
              className={`relative flex h-full w-full items-center justify-center rounded-full bg-radial from-neutral-800 via-neutral-950 to-black ${
                isPlaying ? 'animate-spin-slow' : 'paused'
              }`}
            >
              {/* Vinyl Groove Rings */}
              <div className="absolute inset-1 rounded-full border border-neutral-700/60" />
              <div className="absolute inset-2.5 rounded-full border border-neutral-600/40" />

              {/* Center Theme-Aware Label */}
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full border shadow-inner"
                style={{
                  backgroundColor: activePrimary,
                  borderColor: `${activePrimary}90`,
                }}
              >
                {isPlaying ? (
                  <Pause className="h-2.5 w-2.5 text-neutral-950 fill-neutral-950" />
                ) : (
                  <Play className="h-2.5 w-2.5 text-neutral-950 fill-neutral-950 ml-0.5" />
                )}
              </div>
            </div>

            {/* Pulsing Aura when playing */}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: activePrimary }}
                />
                <span
                  className="relative inline-flex h-3.5 w-3.5 rounded-full border border-white"
                  style={{ backgroundColor: activePrimary }}
                />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
};
