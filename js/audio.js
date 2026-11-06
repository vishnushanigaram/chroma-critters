/* ==========================================================================
   CHROMA CRITTERS - PROCEDURAL WEB AUDIO SYNTHESIZER
   Zero external audio assets - 100% generated in real-time
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    
    // Settings loaded from local storage
    this.muted = localStorage.getItem('chroma_muted') === 'true';
    this.bgmEnabled = localStorage.getItem('chroma_bgm') !== 'false';
    this.sfxVolume = parseFloat(localStorage.getItem('chroma_sfx_vol') || '0.8');
    this.bgmVolume = parseFloat(localStorage.getItem('chroma_bgm_vol') || '0.35');

    // BGM Sequencer state
    this.isPlayingBGM = false;
    this.bgmInterval = null;
    this.bgmStep = 0;

    // Musical Pentatonic Scales (Frequencies in Hz) - Always harmonious!
    this.chimeScale = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00  // A5
    ];
  }

  // Initialize or resume AudioContext on user interaction
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(mute) {
    this.muted = mute;
    localStorage.setItem('chroma_muted', mute);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = val;
    localStorage.setItem('chroma_sfx_vol', val);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  setBGMVolume(val) {
    this.bgmVolume = val;
    localStorage.setItem('chroma_bgm_vol', val);
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  setBGMEnabled(enable) {
    this.bgmEnabled = enable;
    localStorage.setItem('chroma_bgm', enable);
    if (!enable) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECTS (SFX)
  // ==========================================

  // Button Click / Tap Pop
  playClick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Slingshot Pull / Stretch Tone
  playStretch(factor) {
    // factor from 0 to 1
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    const freq = 180 + factor * 260; // Pitch rises with pull tension
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Slingshot Release / Launch
  playLaunch() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Snappy spring twang
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.18);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Xylophone Crystal Chime (Pentatonic pitch notes)
  playChime(index = 0) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const note = this.chimeScale[index % this.chimeScale.length];

    // Primary bell tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);

    // Overtone harmonic
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(note * 2.76, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.sfxGain);
    gain2.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.66);
    osc2.stop(now + 0.31);
  }

  // Squeaky Jelly Bouncer
  playJellyBoing() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.29);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Color Mixer Gate Pass (Magical Arpeggio)
  playColorMix() {
    this.init();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  // Happy Critter Eating / Nom-Nom Munch
  playMunch() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Double bite effect
    for (let i = 0; i < 2; i++) {
      const biteTime = now + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, biteTime);
      osc.frequency.exponentialRampToValueAtTime(180, biteTime + 0.07);

      gain.gain.setValueAtTime(0.55, biteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, biteTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(biteTime);
      osc.stop(biteTime + 0.09);
    }
  }

  // Wrong Snack (Silly boing / playful "womp womp", never harsh)
  playWrong() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    // Low pass filter for soft cartoon feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.27);
  }

  // Critter Petting Purr & Giggle
  playGiggle() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Multi-chirp cute giggle
    for (let i = 0; i < 3; i++) {
      const chirpTime = now + i * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650 + i * 90, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(950 + i * 90, chirpTime + 0.05);

      gain.gain.setValueAtTime(0.3, chirpTime);
      gain.gain.exponentialRampToValueAtTime(0.01, chirpTime + 0.055);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.06);
    }
  }

  // Triumphal Star Fanfare
  playStarFanfare(starIndex = 1) {
    this.init();
    if (!this.ctx) return;
    const chords = [
      [261.63, 329.63, 392.00], // C Maj
      [329.63, 392.00, 523.25], // E min / C
      [392.00, 523.25, 659.25, 783.99] // High Triumphal C
    ];

    const chord = chords[Math.min(starIndex - 1, chords.length - 1)];
    const now = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.35, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + 0.65);
    });
  }

  // ==========================================
  // PROCEDURAL BACKGROUND MUSIC (BGM)
  // Whimsical, catchy, cheerful music loop
  // ==========================================
  startBGM() {
    if (this.isPlayingBGM || !this.bgmEnabled) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingBGM = true;
    this.bgmStep = 0;

    // 16-step happy melody loop (Pentatonic: C4, D4, E4, G4, A4, C5)
    const melody = [
      523.25, 0, 392.00, 440.00, 523.25, 659.25, 523.25, 0,
      440.00, 523.25, 392.00, 0, 329.63, 392.00, 440.00, 523.25
    ];

    // Bassline notes
    const bassline = [
      130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0,
      174.61, 0, 174.61, 0, 196.00, 0, 196.00, 0
    ];

    const stepDuration = 220; // 136 BPM feel

    this.bgmInterval = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx || this.muted || !this.bgmEnabled) return;

      const now = this.ctx.currentTime;
      const step = this.bgmStep % 16;

      // Play Melody
      const melFreq = melody[step];
      if (melFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(melFreq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.2);
      }

      // Play Bass
      const bassFreq = bassline[step];
      if (bassFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bassFreq, now);

        bGain.gain.setValueAtTime(0.18, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);

        bOsc.start(now);
        bOsc.stop(now + 0.22);
      }

      // Soft percussion tick on quarter notes
      if (step % 4 === 0) {
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(80, now);
        pOsc.frequency.exponentialRampToValueAtTime(30, now + 0.05);

        pGain.gain.setValueAtTime(0.15, now);
        pGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        pOsc.connect(pGain);
        pGain.connect(this.bgmGain);

        pOsc.start(now);
        pOsc.stop(now + 0.06);
      }

      this.bgmStep++;
    }, stepDuration);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// Global Sound Instance
window.sound = new SoundEngine();

