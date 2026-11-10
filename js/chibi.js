'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — chibi pixel sprites, in the manner of 16-bit JRPG field sprites:
// a large head, a small body, three tones per material and a dark outline.
// The sprite is placed pixel by pixel on a 64x60 grid, outlined, then drawn at
// twice size with smoothing off. Only the Sisters of the Lily use it so far.
// ---------------------------------------------------------------------------
(() => {
  const BW = 64, BH = 60, OX = 28, TOP = 18;        // sprite is 40 rows tall; feet rest on row TOP + 39
  let buf = null;
  const tones = (hex, s = 0.66, l = 1.22) => ({ b: hex, s: G.shade(hex, s), l: G.shade(hex, l) });
  const CLOTH = { b: '#211e29', s: '#121018', l: '#3b3647' }, WHITE = { b: '#f1ece5', s: '#bdb4c2', l: '#ffffff' };
  const SKIN = { b: '#f2dccb', s: '#d6ad98', l: '#fff0e4' }, STOCK = { b: '#322b38', s: '#1d1822' }, BOOT = '#130e13', LAV = '#9a70e0';
  const STEEL = { b: '#b9bcc6', s: '#7d808c', l: '#eef0f5' };

  // o: {x, y, facing, look, act, t, flash, armed, turn}   act: stand | walk | kneel | cower | windup | strike | hurt
  G.drawChibi = (ctx, o, px = 2) => {
    if (!buf) { buf = document.createElement('canvas'); buf.width = BW; buf.height = BH; }
    const b = buf.getContext('2d', { willReadFrequently: true });
    b.clearRect(0, 0, BW, BH);
    const R = (x, y, w, h, col) => { b.fillStyle = col; b.fillRect(OX + x, TOP + y, w, h); };
    const E = (cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry + 0.6)))); R(cx - w, cy + y, w * 2 + 1, 1, col); } };
    const line = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) R(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, col); };
    const HAIR = tones(o.look.hair || '#5a4034'), act = o.act, t = o.t || 0;
    const kneel = act === 'kneel', cower = act === 'cower';
    const step = act === 'walk' ? Math.floor(t * 8) % 4 : -1;
    let u = kneel ? 6 : cower ? 3 : 0;                                   // how far the upper body sinks
    if (act === 'stand' && Math.sin(t * 2.2) > 0.55) u += 1;             // breathing
    if (step === 1 || step === 3) u -= 1;                                // walking bounce
    const hx = act === 'hurt' ? -1 : act === 'strike' ? 1 : 0;           // head lean

    // --- veil and hair falling down the back
    E(-1 + hx, 11 + u, 9, 9, CLOTH.s);
    for (let i = 0; i < 17; i++) R(-10 + (i > 13 ? i - 13 : 0), 12 + u + i, 8 - (i > 13 ? i - 13 : 0), 1, CLOTH.s);
    R(-10, 14 + u, 1, 11, CLOTH.l);
    R(-8, 17 + u, 3, 12, HAIR.b); R(-8, 17 + u, 1, 12, HAIR.s); R(-6, 19 + u, 1, 8, HAIR.l); R(-7, 29 + u, 2, 2, HAIR.s);

    // --- legs, stockings and boots (hidden when kneeling)
    if (!kneel) {
      const lf = step === 1 ? 2 : step === 3 ? -1 : 0, lb = step === 3 ? 2 : step === 1 ? -1 : 0, up = step === 1 ? 1 : 0, upB = step === 3 ? 1 : 0;
      R(-3 + lb, 32, 3, 6 - upB, STOCK.s); R(-4 + lb, 38 - upB, 4, 2, BOOT);
      R(1 + lf, 32, 3, 6 - up, STOCK.b); R(1 + lf, 32, 1, 6 - up, STOCK.s); R(1 + lf, 38 - up, 4, 2, BOOT); R(2 + lf, 38 - up, 2, 1, '#2a2230');
    } else { R(-10, 38, 4, 2, BOOT); }

    // --- back arm
    if (cower) { R(-8, 13 + u, 3, 8, CLOTH.s); R(-8, 12 + u, 3, 1, WHITE.s); R(-7, 10 + u, 2, 2, SKIN.s); }
    else if (!kneel) { R(-7, 20 + u, 3, 6, CLOTH.s); R(-7, 26 + u, 3, 1, WHITE.s); R(-6, 27 + u, 2, 2, SKIN.s); }

    // --- torso: black bodice, white frilled blouse, lavender ribbon
    R(0, 18 + u, 3, 1, SKIN.s);
    R(-4, 19 + u, 9, 7, CLOTH.b); R(-4, 19 + u, 2, 7, CLOTH.s); R(4, 20 + u, 1, 5, CLOTH.l);
    R(-1, 20 + u, 5, 5, WHITE.b); R(-1, 20 + u, 1, 5, WHITE.s); R(-1, 24 + u, 5, 1, WHITE.s);
    R(0, 21 + u, 1, 1, WHITE.l); R(2, 22 + u, 1, 1, WHITE.l); R(1, 23 + u, 1, 1, WHITE.s); R(3, 21 + u, 1, 1, WHITE.s);
    R(1, 19 + u, 2, 1, LAV); R(1, 20 + u, 1, 1, G.shade(LAV, 0.7));

    // --- skirt with folds and a scalloped white hem
    for (let i = 0; i < 7; i++) {
      const h = Math.round(5 + i * (kneel ? 1.0 : 0.7)), y = 25 + i + u;
      R(-h, y, h * 2 + 1, 1, CLOTH.b); R(-h, y, Math.max(2, Math.round(h * 0.45)), 1, CLOTH.s);
      if (i > 0) { R(-1, y, 1, 1, CLOTH.s); if (i % 2) { R(2, y, 1, 1, CLOTH.l); R(h - 1, y, 1, 1, CLOTH.l); } }
    }
    const hw = kneel ? 12 : 10;
    for (let x = -hw; x <= hw; x++) { R(x, 32 + u, 1, 1, (x & 1) ? WHITE.b : WHITE.s); if (!(x & 1)) R(x, 33 + u, 1, 1, x < -2 ? WHITE.s : WHITE.b); }
    R(-hw, 31 + u, hw * 2 + 1, 1, WHITE.b); R(-hw, 31 + u, 5, 1, WHITE.s);

    // --- head: face, eyes, fringe
    const fx = 1 + hx, fy = 11 + u;
    E(fx, fy, 6, 6, SKIN.b); R(fx - 6, fy - 1, 1, 5, SKIN.s); R(fx - 3, fy + 5, 7, 1, SKIN.s); R(fx + 2, fy - 3, 3, 1, SKIN.l);
    R(fx - 6, fy - 5, 13, 3, HAIR.b); for (let x = -6; x <= 6; x += 2) R(fx + x, fy - 2, 1, 1 + ((x / 2) & 1), HAIR.b);
    R(fx - 7, fy - 2, 2, 9, HAIR.b); R(fx - 7, fy - 2, 1, 9, HAIR.s); R(fx + 6, fy - 2, 1, 6, HAIR.s);
    R(fx - 2, fy - 4, 5, 1, HAIR.l); R(fx - 5, fy - 5, 2, 1, HAIR.s);
    const eye = G.shade(o.look.iris || '#6a4a3a', 0.72), blink = Math.sin(t * 0.9 + (o.seed || 0)) > 0.985;
    for (const ex of [fx - 2, fx + 3]) {
      if (blink || act === 'hurt' || cower) R(ex, fy + 1, 2, 1, '#2a1c2e');
      else { R(ex, fy - 1, 2, 3, eye); R(ex, fy - 1, 2, 1, '#231728'); R(ex, fy, 1, 1, '#ffffff'); }
    }
    R(fx - 4, fy + 2, 2, 1, '#eaa3a3'); R(fx + 5, fy + 2, 1, 1, '#eaa3a3'); R(fx + 1, fy + 3, cower || act === 'hurt' ? 2 : 1, 1, '#a85a62');

    // --- veil over the crown, white frilled band, lily at the temple, ribbon tail
    R(fx - 5, fy - 10, 10, 1, CLOTH.b); R(fx - 7, fy - 9, 14, 2, CLOTH.b); R(fx - 3, fy - 10, 5, 1, CLOTH.l); R(fx - 7, fy - 9, 3, 2, CLOTH.s);
    R(fx - 10, fy - 7, 4, 9, CLOTH.b); R(fx - 10, fy - 7, 1, 9, CLOTH.s);
    for (let x = -7; x <= 7; x++) { if (x & 1) R(fx + x, fy - 8, 1, 1, WHITE.b); R(fx + x, fy - 7, 1, 1, (x & 1) ? WHITE.l : WHITE.b); R(fx + x, fy - 6, 1, 1, WHITE.s); }
    R(fx - 10, fy - 9, 3, 1, WHITE.l); R(fx - 9, fy - 10, 1, 3, WHITE.l); R(fx - 10, fy - 10, 1, 1, WHITE.b); R(fx - 8, fy - 8, 1, 1, WHITE.b); R(fx - 9, fy - 9, 1, 1, LAV);
    R(fx + 7, fy - 5, 1, 5, WHITE.s); R(fx + 8, fy - 4, 1, 3, WHITE.b);

    // --- front arm and whatever it holds
    const sword = (x0, y0, x1, y1) => {
      const n = Math.hypot(x1 - x0, y1 - y0), dx = (x1 - x0) / n, dy = (y1 - y0) / n;
      line(x0 - dx * 2, y0 - dy * 2, x0, y0, '#3a2a1e');
      line(Math.round(x0 + dx * 2), Math.round(y0 + dy * 2), x1, y1, STEEL.b); line(Math.round(x0 + dx * 2) + (Math.abs(dy) > Math.abs(dx) ? 1 : 0), Math.round(y0 + dy * 2) + (Math.abs(dy) > Math.abs(dx) ? 0 : 1), x1, y1, STEEL.s);
      line(Math.round(x0 + dx * 3), Math.round(y0 + dy * 3), Math.round(x0 + dx * (n - 3)), Math.round(y0 + dy * (n - 3)), STEEL.l);
      line(Math.round(x0 + dx - dy * 2), Math.round(y0 + dy + dx * 2), Math.round(x0 + dx + dy * 2), Math.round(y0 + dy - dx * 2), '#c9a13b');
    };
    if (kneel) { R(3, 21 + u, 4, 2, CLOTH.b); R(-3, 22 + u, 3, 2, CLOTH.s); R(0, 21 + u, 3, 3, SKIN.b); R(0, 23 + u, 3, 1, SKIN.s); R(3, 22 + u, 1, 1, WHITE.b); }
    else if (cower) { R(6, 13 + u, 3, 8, CLOTH.b); R(8, 14 + u, 1, 6, CLOTH.l); R(6, 12 + u, 3, 1, WHITE.b); R(6, 10 + u, 2, 2, SKIN.b); }
    else if (act === 'windup') { R(5, 13 + u, 3, 8, CLOTH.b); R(7, 14 + u, 1, 6, CLOTH.l); R(5, 12 + u, 3, 1, WHITE.b); if (o.armed) sword(6, 10 + u, 1, -5 + u); R(5, 10 + u, 2, 2, SKIN.b); }
    else if (act === 'strike') { R(5, 20 + u, 7, 3, CLOTH.b); R(5, 20 + u, 7, 1, CLOTH.l); R(12, 20 + u, 1, 3, WHITE.b); if (o.armed) sword(14, 21 + u, 28, 17 + u); R(13, 20 + u, 2, 3, SKIN.b); }
    else {
      R(4, 19 + u, 4, 2, CLOTH.b); R(5, 20 + u, 3, 6, CLOTH.b); R(7, 20 + u, 1, 5, CLOTH.l); R(5, 26 + u, 3, 1, WHITE.b);
      if (o.armed) sword(6, 27 + u, 14, 12 + u);
      R(5, 27 + u, 2, 2, SKIN.b); R(5, 28 + u, 2, 1, SKIN.s);
    }

    // --- snap to solid, flash when struck, add the outline
    const img = b.getImageData(0, 0, BW, BH), d = img.data, solid = new Uint8Array(BW * BH);
    for (let i = 0; i < BW * BH; i++) { solid[i] = d[i * 4 + 3] > 100 ? 1 : 0; d[i * 4 + 3] = solid[i] ? 255 : 0; if (solid[i] && o.flash > 0) { d[i * 4] = 255; d[i * 4 + 1] = 217; d[i * 4 + 2] = 208; } }
    for (let y = 1; y < BH - 1; y++) for (let x = 1; x < BW - 1; x++) {
      const i = y * BW + x;
      if (!solid[i] && (solid[i - 1] || solid[i + 1] || solid[i - BW] || solid[i + BW])) { d[i * 4] = 34; d[i * 4 + 1] = 22; d[i * 4 + 2] = 40; d[i * 4 + 3] = 255; }
    }
    b.putImageData(img, 0, 0);
    const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.save(); ctx.translate(Math.round(o.x), Math.round(o.y)); ctx.scale(o.facing, 1);
    if (o.turn) { ctx.translate(-22 * o.turn, -8 * o.turn); ctx.rotate(-Math.PI / 2 * o.turn); }
    ctx.drawImage(buf, -OX * px, -(TOP + 40) * px, BW * px, BH * px);
    ctx.restore(); ctx.imageSmoothingEnabled = sm;
  };
})();
