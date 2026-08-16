// Luxury Web Audio Romantic Synthesizer & Audio Engine

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.6;
  private listeners: Set<(playing: boolean) => void> = new Set();

  // Canon in D progression chords & arpeggios: D - A - Bm - F#m - G - D - G - A
  private chordProgression = [
    // D Major
    { bass: 146.83, notes: [293.66, 369.99, 440.0, 587.33] },
    // A Major
    { bass: 110.0, notes: [220.0, 277.18, 329.63, 440.0] },
    // B minor
    { bass: 123.47, notes: [246.94, 293.66, 369.99, 493.88] },
    // F# minor
    { bass: 92.5, notes: [185.0, 220.0, 277.18, 369.99] },
    // G Major
    { bass: 98.0, notes: [196.0, 246.94, 293.66, 392.0] },
    // D Major
    { bass: 146.83, notes: [220.0, 293.66, 369.99, 440.0] },
    // G Major
    { bass: 98.0, notes: [196.0, 246.94, 293.66, 392.0] },
    // A Major
    { bass: 110.0, notes: [220.0, 277.18, 329.63, 440.0] },
  ];

  private currentStep = 0;

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

  private playPluck(freq: number, time: number, duration: number = 2.4, isBass = false) {
    if (!this.ctx || !this.gainNode) return;

    // Harmonic layers for lush warm harp/acoustic sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = isBass ? 'triangle' : 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * (isBass ? 1 : 2), time);

    // Warm envelope
    const peakGain = isBass ? 0.25 : 0.12;
    noteGain.gain.setValueAtTime(0.001, time);
    noteGain.gain.exponentialRampToValueAtTime(peakGain, time + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private scheduleNextMeasure = () => {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chordProgression[this.currentStep % this.chordProgression.length];
    const now = this.ctx.currentTime;
    const stepDuration = 0.55; // 0.55s per arpeggio note

    // Bass note
    this.playPluck(chord.bass, now, 3.2, true);

    // Harp arpeggios
    chord.notes.forEach((freq, idx) => {
      this.playPluck(freq, now + idx * stepDuration, 2.2, false);
      // Gentle echo / shimmer
      this.playPluck(freq * 1.5, now + idx * stepDuration + 0.2, 1.6, false);
    });

    this.currentStep++;
    this.timerId = window.setTimeout(this.scheduleNextMeasure, stepDuration * 4 * 1000);
  };

  public play() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextMeasure();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
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

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }
}

export const romanticAudio = new RomanticAudioEngine();
