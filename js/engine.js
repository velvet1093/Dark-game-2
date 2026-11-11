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
// Keys that cannot be rebound: menus and pause depend on them.
const FIXED = { Enter: 'confirm', Escape: 'pause', Digit1: 'opt1', Digit2: 'opt2', Digit3: 'opt3', Digit4: 'opt4', Digit5: 'opt5', Digit6: 'opt6' };
const DEFAULT_KEYS = {
  left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], jump: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'],
  attack: ['KeyJ'], heavy: ['KeyK'], roll: ['Space'], block: ['KeyL', 'ShiftLeft'], use: ['KeyE'], flask: ['KeyQ'],
  cure: ['KeyR', 'KeyF'], swap: ['KeyC', 'KeyX'], journal: ['Tab', 'KeyT'], bestiary: ['KeyB'], mute: ['KeyM'],
};
G.BINDABLE = [['left', 'Move left'], ['right', 'Move right'], ['jump', 'Jump'], ['down', 'Drop through a ledge'], ['attack', 'Slash'], ['heavy', 'Heavy attack'],
  ['roll', 'Roll'], ['block', 'Block'], ['use', 'Interact · execute'], ['flask', 'Drink flask'], ['cure', 'Drink tincture'], ['swap', 'Change weapon'], ['journal', 'Quests'], ['bestiary', 'Bestiary'], ['mute', 'Mute']];
const KEYSTORE = 'ashenvow_keys';
let KEYMAP = {};
const rebuildKeys = () => { KEYMAP = Object.assign({}, FIXED); for (const a in G.keys) for (const c of G.keys[a]) KEYMAP[c] = a; };
G.keys = JSON.parse(JSON.stringify(DEFAULT_KEYS));
try { const k = JSON.parse(localStorage.getItem(KEYSTORE)); if (k) for (const a in DEFAULT_KEYS) if (Array.isArray(k[a])) G.keys[a] = k[a]; } catch (e) { /* defaults */ }
rebuildKeys();
const saveKeys = () => { try { localStorage.setItem(KEYSTORE, JSON.stringify(G.keys)); } catch (e) { /* storage is optional */ } };
// Give an action one key, taking that key from whatever had it.
G.bindKey = (action, code) => { if (FIXED[code]) return false; for (const a in G.keys) G.keys[a] = G.keys[a].filter(c => c !== code); G.keys[action] = [code]; rebuildKeys(); saveKeys(); return true; };
G.resetKeys = () => { G.keys = JSON.parse(JSON.stringify(DEFAULT_KEYS)); rebuildKeys(); saveKeys(); };
const PRETTY = { Space: 'Space', ShiftLeft: 'Shift', ShiftRight: 'R-Shift', ControlLeft: 'Ctrl', ControlRight: 'R-Ctrl', AltLeft: 'Alt', AltRight: 'R-Alt', Tab: 'Tab',
  ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down', Backspace: 'Bksp', Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=', Backquote: '`' };
G.codeName = c => PRETTY[c] || c.replace(/^Key|^Digit|^Numpad/, '');
const PAD_NAMES = { bestiary: 'Start, then Bestiary', jump: 'A', roll: 'B', attack: 'X', heavy: 'Y', use: 'LB', block: 'RB', flask: 'LT', cure: 'RT', journal: 'Select', pause: 'Start', swap: 'D-pad up', down: 'D-pad down', left: 'Left', right: 'Right', confirm: 'A', mute: '—' };
// What to show for an action: a controller button if the controller was used last, otherwise the first bound key.
G.inputMode = 'keys';
G.keyName = a => (G.inputMode === 'pad' ? PAD_NAMES[a] : G.keys[a] && G.keys[a].length ? G.codeName(G.keys[a][0]) : a === 'confirm' ? 'Enter' : a === 'pause' ? 'Esc' : '—');

// Standard controller layout. Polled once a frame.
const PAD = { 0: ['jump', 'confirm'], 1: ['roll', 'back'], 2: ['attack'], 3: ['heavy'], 4: ['use'], 5: ['block'], 6: ['flask'], 7: ['cure'], 8: ['journal'], 9: ['pause'],
  12: ['swap', 'menuUp'], 13: ['down', 'menuDown'], 14: ['left'], 15: ['right'] };
const STICK = { sl: ['left'], sr: ['right'], sd: ['down', 'menuDown'], su: ['menuUp'] };
let padPrev = {};
G.pollPad = () => {
  const list = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null;
  for (const p of list) if (p && p.connected) { gp = p; break; }
  if (!gp) { padPrev = {}; return; }
  const now = {};
  gp.buttons.forEach((bt, i) => { if (bt.pressed || bt.value > 0.5) now['b' + i] = 1; });
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  if (ax < -0.45) now.sl = 1; if (ax > 0.45) now.sr = 1; if (ay > 0.6) now.sd = 1; if (ay < -0.6) now.su = 1;
  const acts = k => (k[0] === 'b' ? PAD[+k.slice(1)] : STICK[k]) || [];
  for (const k in now) if (!padPrev[k]) { G.inputMode = 'pad'; G.audioInit(); acts(k).forEach(a => G.input.press(a)); }
  for (const k in padPrev) if (!now[k]) acts(k).forEach(a => G.input.release(a));
  padPrev = now;
};
// Settings kept per browser. Difficulty: 'unfair' (the default) or 'fair'.
const SETSTORE = 'ashenvow_settings';
G.settings = { difficulty: 'unfair' };
try { const s = JSON.parse(localStorage.getItem(SETSTORE)); if (s && (s.difficulty === 'fair' || s.difficulty === 'unfair')) G.settings.difficulty = s.difficulty; } catch (e) { /* defaults */ }
G.unfair = () => G.settings.difficulty === 'unfair';
const BOSS_HP = 1.6;   // how much more a boss can take on Unfair
G.setDifficulty = d => {
  const was = G.unfair(); G.settings.difficulty = d;
  try { localStorage.setItem(SETSTORE, JSON.stringify(G.settings)); } catch (e) { /* storage is optional */ }
  if (was !== G.unfair() && G.game) for (const e of G.game.enemies) if (e.def.boss && !e.dead) { const r = e.hp / e.maxHp; e.maxHp = e.def.hp * (G.unfair() ? BOSS_HP : 1); e.hp = r * e.maxHp; }   // a fight in progress keeps its share of health
};
G.bossHpMul = () => (G.unfair() ? BOSS_HP : 1);

G.input = {
  held: {}, just: {},
  press(a) { if (!this.held[a]) this.just[a] = true; this.held[a] = true; },
  release(a) { this.held[a] = false; },
  down(a) { return !!this.held[a]; },
  hit(a) { return !!this.just[a]; },
  clear() { this.just = {}; },
};
addEventListener('keydown', e => {
  if (G.input.capture) { e.preventDefault(); const f = G.input.capture; G.input.capture = null; f(e.code); return; }   // rebinding a key
  const a = KEYMAP[e.code];
  if (!a) return;
  e.preventDefault();
  G.audioInit(); G.inputMode = 'keys';
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
    b.addEventListener('touchstart', e => { e.preventDefault(); G.audioInit(); G.inputMode = 'touch'; G.input.press(a); }, { passive: false });
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
