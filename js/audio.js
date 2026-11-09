'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — audio: synthesised sound effects, ambience and music
// Nothing here loads a file; every sound is built from oscillators and noise.
// ---------------------------------------------------------------------------
(() => {
  let ac = null, master, sfxBus, musBus, delay, noiseBuf, ambFilter, ambGain, muted = false, ambName = 'none';
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const mus = { name: null, tr: null, step: 0, next: 0 };

  G.audioInit = () => {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const gain = (v, to) => { const g = ac.createGain(); g.gain.value = v; if (to) g.connect(to); return g; };
      master = gain(muted ? 0 : 0.6, ac.destination);
      sfxBus = gain(1, master);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(master);
      musBus = gain(0.8, lp);
      delay = ac.createDelay(1); delay.delayTime.value = 0.39;
      const fb = gain(0.4, delay); delay.connect(fb); delay.connect(gain(0.5, lp));
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // constant low drone under everything
      [55, 82.5].forEach((f, i) => { const o = ac.createOscillator(); o.type = i ? 'sine' : 'sawtooth'; o.frequency.value = f; o.connect(gain(i ? 0.025 : 0.008, master)); o.start(); });
      // looping weather / room tone
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      ambFilter = ac.createBiquadFilter(); ambGain = gain(0, master); src.connect(ambFilter); ambFilter.connect(ambGain); src.start();
      applyAmb();
      mus.next = ac.currentTime + 0.1;
      setInterval(musTick, 80);
    } catch (e) { ac = null; }
  };

  function voice(f, t, dur, type, vol, att = 0.004, dest = sfxBus, slide) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
    return g;
  }
  function noiseAt(t, dur, vol, freq, type = 'lowpass', dest = sfxBus) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random(), dur + 0.05);
  }
  const tone = (f, dur, type, vol, slide, d = 0) => voice(f, ac.currentTime + d, dur, type, vol, 0.004, sfxBus, slide);
  const noise = (dur, vol, freq, type, d = 0) => noiseAt(ac.currentTime + d, dur, vol, freq, type);

  // ------------------------------ effects ----------------------------------
  const SFX = {
    swing: () => noise(0.13, 0.16, 1600, 'highpass'),
    whoosh: () => noise(0.38, 0.1, 700, 'bandpass'),
    hit: () => { noise(0.12, 0.4, 700); tone(110, 0.1, 'square', 0.12, 45); },
    splat: () => noise(0.1, 0.16, 500),
    sever: () => { noise(0.3, 0.5, 500); noise(0.18, 0.3, 2500, 'highpass'); tone(70, 0.3, 'sawtooth', 0.2, 30); },
    thud: () => { noise(0.12, 0.22, 160); tone(60, 0.12, 'sine', 0.2, 35); },
    block: () => { tone(900, 0.12, 'square', 0.12, 500); noise(0.06, 0.25, 3000, 'highpass'); },
    guardbreak: () => { tone(300, 0.3, 'square', 0.15, 90); noise(0.2, 0.3, 2000, 'highpass'); },
    roll: () => noise(0.22, 0.12, 400),
    step: () => noise(0.05, 0.06, 260 + Math.random() * 120),
    hurt: () => { noise(0.18, 0.4, 400); tone(160, 0.2, 'sawtooth', 0.18, 60); },
    gulp: () => { tone(300, 0.08, 'sine', 0.12, 170); tone(280, 0.08, 'sine', 0.12, 160, 0.15); tone(260, 0.08, 'sine', 0.12, 150, 0.3); },
    heal: () => { tone(330, 0.4, 'sine', 0.15, 660); tone(495, 0.5, 'sine', 0.1, 990, 0.1); },
    exec: () => { noise(0.5, 0.6, 350); tone(55, 0.6, 'sawtooth', 0.3, 28); noise(0.25, 0.3, 3000, 'highpass', 0.05); },
    death: () => { tone(110, 1.6, 'sawtooth', 0.25, 30); noise(1.0, 0.3, 250); tone(147, 2.4, 'sine', 0.14, 73, 0.3); },
    growl: () => { tone(95, 0.45, 'sawtooth', 0.09, 55); noise(0.4, 0.1, 300); },
    grunt: () => tone(72, 0.32, 'sawtooth', 0.13, 48),
    roar: () => { tone(120, 1.1, 'sawtooth', 0.25, 40); noise(1.0, 0.3, 500); },
    heart: () => { tone(55, 0.12, 'sine', 0.3, 40); tone(55, 0.12, 'sine', 0.2, 40, 0.24); },
    ui: () => tone(520, 0.06, 'triangle', 0.08),
    page: () => noise(0.12, 0.1, 2200, 'highpass'),
    blip: (f = 170) => tone(f * (0.94 + Math.random() * 0.12), 0.035, f > 500 ? 'sine' : 'square', f > 500 ? 0.04 : 0.022),
    bell: () => { tone(196, 2.6, 'sine', 0.28); tone(392.6, 2.0, 'sine', 0.12); tone(587, 1.4, 'sine', 0.06); },
    candle: () => { noise(0.5, 0.1, 1200, 'bandpass'); tone(660, 0.9, 'sine', 0.06); },
    ichor: () => tone(220, 0.5, 'sine', 0.14, 440),
    bleed: () => { noise(0.35, 0.35, 900); tone(200, 0.25, 'square', 0.08, 80); },
    chime: () => { tone(1320, 0.5, 'sine', 0.06); tone(1760, 0.6, 'sine', 0.045, 0, 0.09); tone(2640, 0.5, 'sine', 0.025, 0, 0.18); },
    giggle: () => { for (let i = 0; i < 5; i++) tone(1500 + (i % 2 ? 320 : 0) - i * 60, 0.09, 'triangle', 0.07, 1950 - i * 90, i * 0.085); },
  };
  G.sfx = (n, a) => { if (!ac) return; try { SFX[n] && SFX[n](a); } catch (e) { /* audio is optional */ } };

  // ------------------------------ ambience ---------------------------------
  const AMB = { none: ['lowpass', 200, 0], rain: ['highpass', 2600, 0.045], wind: ['lowpass', 420, 0.09], hall: ['lowpass', 180, 0.12] };
  function applyAmb() {
    if (!ac) return;
    const [type, freq, vol] = AMB[ambName] || AMB.none;
    ambFilter.type = type; ambFilter.frequency.value = freq; ambGain.gain.setTargetAtTime(vol, ac.currentTime, 0.6);
  }
  G.ambience = n => { ambName = n; applyAmb(); };

  // -------------------------------- music ----------------------------------
  // Each track loops a 4-bar chord progression (8 steps per bar) under a
  // 32-step melody. Notes are MIDI numbers; 0 is a rest.
  const TRACKS = {
    title: { spb: 0.5, pad: 'triangle', lead: 'sine', chords: [[45, 52, 60], [41, 48, 57], [43, 50, 59], [40, 47, 56]],
      mel: [69, 0, 0, 72, 0, 71, 0, 0, 69, 0, 0, 65, 0, 0, 64, 0, 67, 0, 0, 71, 0, 69, 0, 0, 68, 0, 0, 0, 64, 0, 0, 0] },
    road: { spb: 0.45, pad: 'triangle', lead: 'triangle', chords: [[38, 45, 53], [34, 41, 50], [36, 43, 52], [33, 40, 49]],
      mel: [62, 0, 65, 0, 69, 0, 0, 67, 65, 0, 0, 62, 0, 0, 58, 0, 64, 0, 67, 0, 72, 0, 0, 67, 69, 0, 0, 0, 61, 0, 64, 0] },
    village: { spb: 0.42, pad: 'sine', lead: 'sine', chords: [[40, 47, 55], [36, 43, 52], [38, 45, 54], [35, 42, 51]],
      mel: [76, 0, 79, 0, 83, 0, 79, 0, 76, 0, 79, 0, 84, 0, 0, 0, 78, 0, 81, 0, 86, 0, 81, 0, 75, 0, 78, 0, 83, 0, 0, 0] },
    cathedral: { spb: 0.6, pad: 'sawtooth', lead: 'square', bell: true, chords: [[36, 43, 51], [32, 39, 48], [34, 41, 50], [31, 38, 47]],
      mel: [72, 0, 0, 0, 75, 0, 74, 0, 72, 0, 0, 0, 68, 0, 0, 0, 70, 0, 0, 0, 74, 0, 77, 0, 74, 0, 0, 0, 71, 0, 0, 0] },
    boss: { spb: 0.16, pad: 'sawtooth', lead: 'sawtooth', drums: true, chords: [[38, 45, 53], [38, 45, 53], [34, 41, 50], [33, 40, 49]],
      mel: [74, 0, 74, 77, 0, 74, 0, 72, 74, 0, 74, 77, 0, 81, 0, 79, 70, 0, 70, 74, 0, 70, 0, 77, 69, 0, 73, 0, 76, 0, 73, 0] },
  };
  function playStep(tr, s, t) {
    const i = s % 8, chord = tr.chords[Math.floor(s / 8) % tr.chords.length], d = tr.spb;
    const sawPad = tr.pad === 'sawtooth';
    if (i === 0) for (const m of chord) voice(mf(m), t, d * 8.6, tr.pad, sawPad ? 0.022 : 0.045, d * 2, musBus);
    const n = tr.mel[s % tr.mel.length];
    if (n && (tr.drums || Math.random() > 0.12)) voice(mf(n), t, d * (tr.drums ? 1.6 : 3.2), tr.lead, tr.lead === 'sine' ? 0.06 : 0.035, 0.01, musBus).connect(delay);
    if (tr.bell && s % 32 === 0) { voice(98, t, 4, 'sine', 0.16, 0.005, musBus); voice(196.4, t, 3, 'sine', 0.07, 0.005, musBus).connect(delay); }
    if (tr.drums) {
      voice(mf(chord[0]), t, d * 0.9, 'sawtooth', 0.07, 0.005, musBus);
      if (i % 4 === 0) voice(110, t, 0.16, 'sine', 0.3, 0.002, musBus, 38);
      if (i % 4 === 2) noiseAt(t, 0.12, 0.14, 1800, 'highpass', musBus);
      if (i % 2 === 1) noiseAt(t, 0.03, 0.05, 6000, 'highpass', musBus);
    }
  }
  function musTick() {
    if (!ac || !mus.tr || ac.state !== 'running') return;
    if (mus.next < ac.currentTime - 0.5) mus.next = ac.currentTime + 0.05;
    while (mus.next < ac.currentTime + 0.25) { playStep(mus.tr, mus.step++, mus.next); mus.next += mus.tr.spb; }
  }
  G.music = name => {
    if (mus.name === name) return;
    mus.name = name; mus.tr = TRACKS[name] || null; mus.step = 0;
    if (ac) mus.next = ac.currentTime + 0.25;
  };
  G.toggleMute = () => { muted = !muted; if (ac) master.gain.setTargetAtTime(muted ? 0 : 0.6, ac.currentTime, 0.05); return muted; };
})();
