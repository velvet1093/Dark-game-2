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
  KeyW: 'jump', ArrowUp: 'jump', KeyJ: 'attack', KeyK: 'heavy', Space: 'roll', KeyL: 'block', ShiftLeft: 'block',
  KeyE: 'use', KeyQ: 'flask', KeyM: 'mute', KeyR: 'cure', KeyF: 'cure', Tab: 'journal', KeyT: 'journal', Enter: 'confirm', Escape: 'pause',
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
  // full-screen toggle: shown only where the browser allows it
  const fs = document.getElementById('fs'), root = document.documentElement;
  const req = root.requestFullscreen || root.webkitRequestFullscreen, exit = document.exitFullscreen || document.webkitExitFullscreen;
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (fs && req && exit && document.fullscreenEnabled !== false) {
    fs.hidden = false;
    fs.addEventListener('click', () => {
      G.audioInit(); fs.blur();
      try {
        const p = isFs() ? exit.call(document) : req.call(root);
        if (p && p.then) p.then(() => { if (isFs() && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
      } catch (e) { /* refused: stay windowed */ }
    });
    const sync = () => { fs.classList.toggle('on', isFs()); fs.title = isFs() ? 'Leave full screen' : 'Full screen'; fs.setAttribute('aria-label', fs.title); };
    document.addEventListener('fullscreenchange', sync); document.addEventListener('webkitfullscreenchange', sync);
  }
  document.querySelectorAll('[data-act]').forEach(b => {
    const a = b.dataset.act;
    b.addEventListener('touchstart', e => { e.preventDefault(); G.audioInit(); G.input.press(a); }, { passive: false });
    const up = e => { e.preventDefault(); G.input.release(a); };
    b.addEventListener('touchend', up, { passive: false });
    b.addEventListener('touchcancel', up, { passive: false });
  });
});

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
      if (Math.abs(g.vy) < 120) { g.rest = true; G.sfx('thud'); G.decal(g.x, 6, 14); if (g.kind !== 'head') g.rot = Math.PI / 2 + G.rand(-0.3, 0.3); }
      else { g.vy *= -0.35; g.vx *= 0.5; g.vr *= 0.5; G.decal(g.x, 5); }
    }
  }
  for (let i = f.texts.length - 1; i >= 0; i--) { const t = f.texts[i]; t.t += dt; t.y -= 26 * dt; if (t.t > 1.3) f.texts.splice(i, 1); }
  for (let i = f.sparks.length - 1; i >= 0; i--) {
    const s = f.sparks[i]; s.t -= dt; s.vy += 700 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.t <= 0) f.sparks.splice(i, 1);
  }
};
