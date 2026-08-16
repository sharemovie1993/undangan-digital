// Luxury High-Performance Audio Engine & Streamer
// Supports real MP3/AAC audio streaming with buffer management + Zero-Drift Web Audio Harp Synth fallback

class RomanticAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private isPlaying: boolean = false;
  private isBuffering: boolean = false;
  private volume: number = 0.6;
  private baseVolume: number = 0.6;
  private isDucked: boolean = false;
  private wasPlayingBeforeHidden: boolean = false;
  private listeners: Set<(playing: boolean) => void> = new Set();

  // Web Audio Synth Fallback (Lookahead Scheduler)
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private lookaheadTimer: number | null = null;
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private currentChordIndex: number = 0;

  // Canon in D progression chords
  private chordProgression = [
    { bass: 146.83, notes: [293.66, 369.99, 440.0, 587.33] }, // D
    { bass: 110.0, notes: [220.0, 277.18, 329.63, 440.0] },    // A
    { bass: 123.47, notes: [246.94, 293.66, 369.99, 493.88] },  // Bm
    { bass: 92.5, notes: [185.0, 220.0, 277.18, 369.99] },      // F#m
    { bass: 98.0, notes: [196.0, 246.94, 293.66, 392.0] },       // G
    { bass: 146.83, notes: [220.0, 293.66, 369.99, 440.0] },    // D
    { bass: 98.0, notes: [196.0, 246.94, 293.66, 392.0] },       // G
    { bass: 110.0, notes: [220.0, 277.18, 329.63, 440.0] },     // A
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.setupLifecycleGuards();
    }
  }

  // 📱 Mobile-First Tab & App Lifecycle Guard
  private setupLifecycleGuards() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this.isPlaying) {
          this.wasPlayingBeforeHidden = true;
          // Soft pause when tab in background to save mobile battery
          if (this.audioElement) {
            this.audioElement.pause();
          }
          this.stopSynth();
        }
      } else if (document.visibilityState === 'visible') {
        if (this.wasPlayingBeforeHidden) {
          this.wasPlayingBeforeHidden = false;
          this.play();
        }
      }
    });

    window.addEventListener('pagehide', () => this.destroy());
    window.addEventListener('beforeunload', () => this.destroy());
  }

  private initAudioElement() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isBuffering = false;
      this.notify();
    });

    this.audioElement.addEventListener('pause', () => {
      if (!this.isBuffering) {
        this.isPlaying = false;
        this.notify();
      }
    });

    this.audioElement.addEventListener('waiting', () => {
      this.isBuffering = true;
    });

    this.audioElement.addEventListener('canplay', () => {
      this.isBuffering = false;
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[AudioEngine] Stream error, falling back to WebAudio synth:', e);
      this.isBuffering = false;
      if (this.isPlaying) {
        this.startSynth();
      }
    });
  }

  public setTrack(url?: string | null) {
    const cleanUrl = url?.trim() || null;
    if (cleanUrl === this.currentUrl) return;

    this.currentUrl = cleanUrl;
    const wasPlaying = this.isPlaying;

    if (this.audioElement) {
      this.audioElement.pause();
      if (cleanUrl) {
        this.audioElement.src = cleanUrl;
        this.audioElement.load();
      } else {
        this.audioElement.removeAttribute('src');
      }
    }

    this.stopSynth();

    if (wasPlaying) {
      this.play();
    }
  }

  public async play() {
    this.isPlaying = true;
    this.notify();

    if (this.currentUrl && this.audioElement) {
      try {
        this.stopSynth();
        if (this.audioElement.src !== this.currentUrl) {
          this.audioElement.src = this.currentUrl;
          this.audioElement.load();
        }
        await this.audioElement.play();
        return;
      } catch (err: any) {
        console.warn('[AudioEngine] HTMLAudio play error, using synth:', err.message);
      }
    }

    // Fallback: WebAudio Synthesizer
    this.startSynth();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // 📱 Audio Ducking for Video Preview & Dialog Overlays
  public duck(factor: number = 0.2) {
    if (this.isDucked) return;
    this.isDucked = true;
    this.baseVolume = this.volume;
    const duckedVol = Math.max(0, this.baseVolume * factor);
    if (this.audioElement) {
      this.audioElement.volume = duckedVol;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(duckedVol, this.ctx.currentTime);
    }
  }

  public unduck() {
    if (!this.isDucked) return;
    this.isDucked = false;
    this.setVolume(this.baseVolume);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    this.baseVolume = this.volume;
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume() {
    return this.volume;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public destroy() {
    this.stopSynth();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }

  // --- PRECISE LOOKAHEAD WEB AUDIO SYNTHESIZER ---
  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private startSynth() {
    this.initContext();
    if (!this.ctx) return;
    if (this.lookaheadTimer !== null) return;

    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.currentNoteIndex = 0;
    this.currentChordIndex = 0;
    this.scheduler();
  }

  private stopSynth() {
    if (this.lookaheadTimer !== null) {
      window.clearTimeout(this.lookaheadTimer);
      this.lookaheadTimer = null;
    }
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.ctx) return;

    // Schedule ahead 120ms to prevent any stutter/jitter during scrolling
    const scheduleAheadTime = 0.12;
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.advanceNote();
    }

    this.lookaheadTimer = window.setTimeout(this.scheduler, 30);
  };

  private advanceNote() {
    const stepDuration = 0.52; // 520ms per harp note
    this.nextNoteTime += stepDuration;
    this.currentNoteIndex++;
    if (this.currentNoteIndex >= 4) {
      this.currentNoteIndex = 0;
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgression.length;
    }
  }

  private scheduleNote(time: number) {
    if (!this.ctx || !this.gainNode) return;

    const chord = this.chordProgression[this.currentChordIndex];
    const freq = chord.notes[this.currentNoteIndex];

    // Play root bass on first beat of chord
    if (this.currentNoteIndex === 0) {
      this.playSynthPluck(chord.bass, time, 2.8, true);
    }

    // Play arpeggio harp note
    this.playSynthPluck(freq, time, 2.0, false);
    // Subtle acoustic shimmer
    this.playSynthPluck(freq * 1.5, time + 0.15, 1.4, false);
  }

  private playSynthPluck(freq: number, time: number, duration: number, isBass: boolean) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = isBass ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const peakGain = isBass ? 0.22 : 0.11;
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.exponentialRampToValueAtTime(peakGain, time + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const romanticAudio = new RomanticAudioEngine();

