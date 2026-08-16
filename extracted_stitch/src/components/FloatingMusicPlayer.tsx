import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Play, Pause, Volume2, VolumeX, Disc, Sparkles } from 'lucide-react';
import { romanticAudio } from '../utils/audioPlayer';
import { InvitationData } from '../types';
import { THEMES } from '../data/presets';

interface FloatingMusicPlayerProps {
  data: InvitationData;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ data }) => {
  const theme = THEMES[data.theme] || THEMES.champagne_gold;
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
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
        {/* Animated Pop-out details Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mb-2 w-64 rounded-2xl border border-amber-300/40 bg-neutral-900/90 p-4 text-white shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="font-display text-[10px] tracking-wider text-amber-300 uppercase font-semibold">
                    Background Music
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">Romantic Harp</span>
              </div>

              <p className="font-serif text-xs font-bold text-amber-100 truncate">
                {data.musicTitle}
              </p>
              <p className="text-[10px] text-neutral-400 truncate mb-3">
                {data.musicArtist}
              </p>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-400 h-1 bg-white/20 rounded-lg cursor-pointer"
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
              className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-300/40 bg-neutral-950/80 px-3 py-1 text-[10px] text-amber-200 backdrop-blur-md shadow-lg"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="truncate max-w-[110px]">{data.musicTitle}</span>
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
            title={isPlaying ? 'Pause Music (Click to Pause / Right Click for Volume)' : 'Play Romantic Music'}
            className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-neutral-950 p-1 shadow-2xl ring-2 ring-amber-400/80 cursor-pointer"
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

              {/* Center Gold Label */}
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-gradient-to-tr from-amber-600 to-amber-300 shadow-inner">
                {isPlaying ? (
                  <Pause className="h-2.5 w-2.5 text-neutral-900 fill-neutral-900" />
                ) : (
                  <Play className="h-2.5 w-2.5 text-neutral-900 fill-neutral-900 ml-0.5" />
                )}
              </div>
            </div>

            {/* Pulsing Aura when playing */}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500 border border-white" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
};
