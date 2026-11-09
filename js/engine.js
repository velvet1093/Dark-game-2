'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — engine: utilities, input, audio, blood & gore particles
// ---------------------------------------------------------------------------
const G = window.G = { W: 960, H: 540, GROUND: 440, uid: 1 };

G.rand = (a, b) => a + Math.random() * (b - a);
G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
G.lerp = (a, b, t) => a + (b - a) * t;
G.ease = u => u * u * (3 - 2 * u);
G.pick = a => a[Math.floor(Math.random() * a.length)];
G.rng = seed => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

// ------------------------------- input -------------------------------------
const KEYMAP = {
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attack', KeyK: 'heavy', Space: 'roll', KeyL: 'block', ShiftLeft: 'block',
  KeyE: 'use', KeyQ: 'flask', Enter: 'confirm', Escape: 'pause',
  Digit1: 'opt1', Digit2: 'opt2', Digit3: 'opt3', Digit4: 'opt4',
};
G.input = {
  held: {}, just: {},
  press(a) { if (!this.held[a]) this.just[a] = true; this.held[a] = true; },
  release(a) { this.held[a] = false; },
  down(a) { return !!this.held[a]; },
  hit(a) { return !!this.just[a]; },
  clear() { this.just = {}; },
};
addEventListener('keydown', e => {
  const a = KEYMAP[e.code];
  if (!a) return;
  e.preventDefault();
  G.audioInit();
  if (!e.repeat) G.input.press(a);
});
addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) G.input.release(a); });
addEventListener('blur', () => { G.input.held = {}; });
addEventListener('DOMContentLoaded', () => {
  const cv = document.getElementById('c');
  cv.addEventListener('mousedown', e => { G.audioInit(); G.input.press(e.button === 2 ? 'heavy' : 'attack'); });
  addEventListener('mouseup', e => G.input.release(e.button === 2 ? 'heavy' : 'attack'));
  cv.addEventListener('contextmenu', e => e.preventDefault());
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
  document.querySelectorAll('#touch button').forEach(b => {
    const a = b.dataset.act;
    b.addEventListener('touchstart', e => { e.preventDefault(); G.audioInit(); G.input.press(a); }, { passive: false });
    const up = e => { e.preventDefault(); G.input.release(a); };
    b.addEventListener('touchend', up, { passive: false });
    b.addEventListener('touchcancel', up, { passive: false });
  });
});

// ------------------------------- audio -------------------------------------
// Everything is synthesised; there are no audio assets.
let ac = null, master = null, noiseBuf = null;
G.audioInit = () => {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // low ambient drone
    [55, 82.5, 110.4].forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = i ? 'sine' : 'sawtooth'; o.frequency.value = f; g.gain.value = i ? 0.035 : 0.012;
      o.connect(g); g.connect(master); o.start();
    });
  } catch (e) { ac = null; }
};
function tone(f, dur, type, vol, slide, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, freq, type = 'lowpass', delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5, dur + 0.05);
}
const SFX = {
  swing: () => noise(0.13, 0.16, 1600, 'highpass'),
  hit: () => { noise(0.12, 0.4, 700); tone(110, 0.1, 'square', 0.12, 45); },
  sever: () => { noise(0.3, 0.5, 500); noise(0.18, 0.3, 2500, 'highpass'); tone(70, 0.3, 'sawtooth', 0.2, 30); },
  block: () => { tone(900, 0.12, 'square', 0.12, 500); noise(0.06, 0.25, 3000, 'highpass'); },
  roll: () => noise(0.22, 0.12, 400),
  hurt: () => { noise(0.18, 0.4, 400); tone(160, 0.2, 'sawtooth', 0.18, 60); },
  heal: () => { tone(330, 0.4, 'sine', 0.15, 660); tone(495, 0.5, 'sine', 0.1, 990, 0.1); },
  exec: () => { noise(0.5, 0.6, 350); tone(55, 0.6, 'sawtooth', 0.3, 28); noise(0.25, 0.3, 3000, 'highpass', 0.05); },
  death: () => { tone(110, 1.6, 'sawtooth', 0.25, 30); noise(1.0, 0.3, 250); },
  ui: () => tone(520, 0.06, 'triangle', 0.08),
  page: () => noise(0.12, 0.1, 2200, 'highpass'),
  bell: () => { tone(196, 2.6, 'sine', 0.28); tone(392.6, 2.0, 'sine', 0.12); tone(587, 1.4, 'sine', 0.06); },
  ichor: () => { tone(220, 0.5, 'sine', 0.14, 440); },
  bleed: () => { noise(0.35, 0.35, 900); tone(200, 0.25, 'square', 0.08, 80); },
};
G.sfx = n => { try { SFX[n] && SFX[n](); } catch (e) { /* audio is optional */ } };

// ---------------------------- blood & gore ---------------------------------
G.fx = { drops: [], decals: [], gibs: [], texts: [], sparks: [] };
G.fxReset = () => { for (const k in G.fx) G.fx[k].length = 0; };

// Spray of blood droplets. dir: -1/0/1 horizontal bias, power: speed.
G.blood = (x, y, n, dir = 0, power = 260) => {
  const d = G.fx.drops;
  for (let i = 0; i < n && d.length < 700; i++) {
    d.push({
      x, y, vx: dir * G.rand(30, power) + G.rand(-70, 70), vy: -G.rand(20, power * 0.9),
      r: G.rand(1, 3.2), c: G.pick(['#7a0509', '#96070d', '#5c0306', '#b00a12']),
    });
  }
};
G.decal = (x, r, grow = 0) => {
  const d = G.fx.decals;
  if (d.length > 900) d.splice(0, 60);
  d.push({ x, y: G.GROUND + G.rand(3, 22), r, max: r + grow });
};
G.gib = (kind, x, y, dir, look, extra = {}) => {
  const g = G.fx.gibs;
  if (g.length > 90) g.shift();
  g.push(Object.assign({
    kind, x, y, look, vx: dir * G.rand(60, 260), vy: -G.rand(180, 380),
    rot: G.rand(0, 6), vr: G.rand(-12, 12), rest: false, scale: 1,
  }, extra));
};
G.text = (x, y, s, color = '#c9333b', size = 15) => G.fx.texts.push({ x, y, s, color, size, t: 0 });
G.spark = (x, y, n) => {
  for (let i = 0; i < n; i++) G.fx.sparks.push({ x, y, vx: G.rand(-200, 200), vy: G.rand(-260, 40), t: G.rand(0.15, 0.4) });
};

G.fxUpdate = dt => {
  const f = G.fx, gy = G.GROUND;
  for (let i = f.drops.length - 1; i >= 0; i--) {
    const p = f.drops[i];
    p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y >= gy + 2) { if (Math.random() < 0.6) G.decal(p.x, p.r * G.rand(1.2, 2.6)); f.drops.splice(i, 1); }
  }
  for (const d of f.decals) if (d.r < d.max) d.r += dt * 9;
  for (const g of f.gibs) {
    if (g.rest) continue;
    g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.rot += g.vr * dt;
    if (Math.random() < 0.5) G.blood(g.x, g.y, 1, 0, 40);
    if (g.y >= gy - 4) {
      g.y = gy - 4;
      if (Math.abs(g.vy) < 120) { g.rest = true; G.decal(g.x, 6, 14); if (g.kind !== 'head') g.rot = Math.PI / 2 + G.rand(-0.3, 0.3); }
      else { g.vy *= -0.35; g.vx *= 0.5; g.vr *= 0.5; G.decal(g.x, 5); }
    }
  }
  for (let i = f.texts.length - 1; i >= 0; i--) { const t = f.texts[i]; t.t += dt; t.y -= 26 * dt; if (t.t > 1.3) f.texts.splice(i, 1); }
  for (let i = f.sparks.length - 1; i >= 0; i--) {
    const s = f.sparks[i]; s.t -= dt; s.vy += 700 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.t <= 0) f.sparks.splice(i, 1);
  }
};
