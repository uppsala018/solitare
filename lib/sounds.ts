type SoundKey =
  | 'cardFlip'
  | 'cardPlace'
  | 'cardSlide'
  | 'foundationComplete'
  | 'gameWin'
  | 'invalidMove'
  | 'tokenEarn'
  | 'levelUp'
  | 'packOpen'
  | 'buttonClick'
  | 'countdown'
  | 'milestone';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

const MUTE_KEY = 'solitaire-crown-muted';

export class SoundEngine {
  private ctx: AudioContext | null = null;

  get muted() {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(MUTE_KEY) === 'true';
  }

  setMuted(muted: boolean) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(MUTE_KEY, String(muted));
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  private getCtx() {
    if (typeof window === 'undefined' || this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      this.ctx = Ctor ? new Ctor() : null;
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, duration: number, options: {
    delay?: number;
    endFreq?: number;
    gain?: number;
    type?: OscillatorType;
  } = {}) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + (options.delay ?? 0);
    const end = start + duration;

    osc.type = options.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (options.endFreq) osc.frequency.exponentialRampToValueAtTime(options.endFreq, end);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain ?? 0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.03);
  }

  cardFlip() {
    this.tone(800, 0.08, { endFreq: 400, gain: 0.12, type: 'triangle' });
  }

  cardPlace() {
    this.tone(200, 0.12, { gain: 0.22, type: 'triangle' });
    this.tone(90, 0.09, { delay: 0.02, gain: 0.08, type: 'sine' });
  }

  cardSlide() {
    this.tone(600, 0.06, { endFreq: 200, gain: 0.1, type: 'sawtooth' });
  }

  foundationComplete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      this.tone(freq, 0.1, { delay: index * 0.1, gain: 0.16, type: 'sine' });
    });
  }

  gameWin() {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      this.tone(freq, 0.45, { delay: index * 0.16, gain: 0.18, type: 'sine' });
      this.tone(freq * 2, 0.35, { delay: index * 0.16, gain: 0.05, type: 'triangle' });
    });
    this.tone(130.81, 1.2, { delay: 0.5, gain: 0.08, type: 'sine' });
  }

  invalidMove() {
    this.tone(150, 0.1, { gain: 0.16, type: 'sawtooth' });
    this.tone(145, 0.1, { gain: 0.08, type: 'square' });
  }

  tokenEarn() {
    this.tone(1200, 0.08, { gain: 0.16, type: 'triangle' });
    this.tone(1800, 0.05, { delay: 0.04, gain: 0.08, type: 'sine' });
  }

  levelUp() {
    this.tone(220, 1.2, { endFreq: 880, gain: 0.12, type: 'sine' });
    [440, 554.37, 659.25].forEach((freq) => this.tone(freq, 0.7, { delay: 0.75, gain: 0.1 }));
  }

  packOpen() {
    this.tone(160, 0.45, { endFreq: 900, gain: 0.12, type: 'sawtooth' });
    [880, 1174.66, 1567.98].forEach((freq, index) => {
      this.tone(freq, 0.15, { delay: 0.45 + index * 0.08, gain: 0.12 });
    });
  }

  buttonClick() {
    this.tone(600, 0.03, { gain: 0.08, type: 'triangle' });
  }

  countdown() {
    this.tone(800, 0.02, { gain: 0.08, type: 'square' });
  }

  milestone() {
    this.tokenEarn();
    [1400, 1700, 2100].forEach((freq, index) => {
      this.tone(freq, 0.08, { delay: 0.14 + index * 0.08, gain: 0.08 });
    });
  }

  play(name: SoundKey) {
    this[name]();
  }
}

export const soundEngine = new SoundEngine();
