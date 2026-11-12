'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — hand-placed pixel sprites for everything that is not a person:
// the carrion hound, the gallows crow and Misery the fairy. Each is drawn on the
// shared sprite grid (G.spr), outlined, and shown at twice size.
// ---------------------------------------------------------------------------
(() => {
  const cache = new Map();
  const T = hex => { let t = cache.get(hex); if (!t) { t = { b: hex, s: G.shade(hex, 0.62), l: G.shade(hex, 1.35) }; cache.set(hex, t); } return t; };
  const BONE = '#e0d6c0', GORE = '#7a0509', RED = '#8f0810';

  // ------------------------------ hound ------------------------------------
  function hound(ctx, e) {
    const { R, line } = G.spr.open(64, 92), L = e.def.look, B = T(e.def.coat || '#3b3236'), SK = T(L.skin), FAR = G.shade(e.def.coat || '#3b3236', 0.5), lm = e.limbs, st = e.state;
    const down = e.dead || st === 'broken' || st === 'executed';
    let by = 0, fd = 0, rd = 0, jaw = 1;
    if (down) by = 9;
    else {
      if (lm.legF.gone) fd = 5; if (lm.legB.gone) rd = 5;
      if (st === 'windup') { by = 3; jaw = 1 + Math.round(2 * Math.min(1, e.t / e.atk.wind)); }
      else if (st === 'strike') { by = -5; jaw = 3; } else if (st === 'stagger') jaw = 2;
    }
    const moving = st === 'chase' && Math.abs(e.vx) > 5, fr = moving ? Math.floor(e.walk * 1.1) % 4 : -1;
    const leg = (xr, k, front, drop, col, isGone) => {
      const hy = -10 + by + drop;
      if (isGone) { R(xr - 1, hy, 3, 3, GORE); R(xr, hy + 1, 1, 1, BONE); return; }
      let fx = xr, fy = 0;
      if (down) { fx = xr + 6; fy = -1; }
      else if (st === 'strike') { fx = xr + (front ? 7 : -7); fy = front ? -5 : -1; }
      else if (fr >= 0) { const i = (fr + k + (front ? 0 : 2)) % 4; fx = xr + [4, -1, -4, 1][i]; fy = -[0, 2, 0, 3][i]; }
      const kx = (xr + fx) / 2 - (front ? -1 : 2), ky = (hy + fy) / 2;
      line(xr, hy, kx, ky, col, 2); line(kx, ky, fx, fy - 1, col, 2); R(fx, fy - 1, 3, 1, col);
    };
    leg(-11, 1, false, rd, FAR, false); leg(9, 1, true, fd, FAR, false);                 // far pair
    // tail, haunch, belly, chest
    if (down) line(-13, -15 + by, -20, -11 + by, B.b, 2); else line(-13, -16 + by + rd, -19, -12 + by + rd + Math.round(Math.sin(e.walk * 2) * 2), B.b, 2);
    const md = Math.round((rd + fd) / 2);
    R(-13, -17 + by + rd, 9, 8, B.b); R(-5, -16 + by + md, 10, 6, B.b); R(4, -18 + by + fd, 8, 10, B.b);
    R(-13, -10 + by + rd, 9, 1, B.s); R(-5, -11 + by + md, 10, 1, B.s); R(4, -9 + by + fd, 8, 1, B.s);
    R(-12, -17 + by + rd, 7, 1, B.l); R(-4, -16 + by + md, 8, 1, B.l); R(5, -18 + by + fd, 6, 1, B.l);
    for (let i = 0; i < 4; i++) R(-4 + i * 2, -14 + by + md, 1, 3, SK.s);                  // ribs
    R(-10, -15 + by + rd, 3, 2, SK.b); R(6, -13 + by + fd, 2, 2, SK.s);                    // mange
    // neck and head
    const hy = by + fd + (down ? 5 : 0);
    R(9, -21 + hy, 5, 7, B.b); R(9, -15 + hy, 5, 1, B.s);
    if (lm.head.gone) { R(11, -22 + hy, 4, 4, GORE); R(12, -21 + hy, 1, 1, BONE); }
    else {
      R(11, -25 + hy, 8, 7, B.b); R(12, -25 + hy, 5, 1, B.l); R(11, -28 + hy, 2, 4, B.b); R(13, -27 + hy, 1, 2, B.s);
      R(18, -22 + hy, 6, 3, B.b); R(18, -22 + hy, 5, 1, B.l); R(23, -22 + hy, 1, 1, '#000000');
      if (jaw > 1) R(18, -19 + hy, 5, jaw - 1, '#2a0508');
      R(18, -19 + hy + jaw - 1, 5, 2, B.s);
      R(19, -19 + hy, 1, 1, BONE); R(21, -19 + hy, 1, 1, BONE); R(23, -19 + hy, 1, 1, BONE); if (jaw > 1) { R(20, -19 + hy + jaw - 1, 1, 1, BONE); R(22, -19 + hy + jaw - 1, 1, 1, BONE); }
      R(20, -17 + hy + jaw, 1, 2, RED);
      if (e.dead) R(15, -22 + hy, 2, 1, '#000000'); else { R(14, -24 + hy, 4, 3, '#2a0a0e'); R(15, -23 + hy, 2, 2, L.eye); R(15, -23 + hy, 1, 1, '#ffffff'); }
    }
    leg(-8, 0, false, rd, B.b, lm.legB.gone); leg(6, 0, true, fd, B.b, lm.legF.gone);     // near pair
    const gy0 = G.GROUND - Math.round(e.alt / 2) * 2;   // hounds can be up on a ledge, or down in a pit
    G.spr.close(ctx, e.x, gy0, { facing: e.facing, flash: e.flash > 0 });
    const W = (x, y) => [e.x + e.facing * x * 2, gy0 + y * 2];
    e.out = { head: W(15, -22 + hy), sh: W(7, -12 + by), hip: W(-9, -12 + by) };
  }

  // ------------------------------- crow ------------------------------------
  function crow(ctx, e, time) {
    const { R } = G.spr.open(64, 60), L = e.def.look, B = T('#2a2734'), W1 = T('#3a3648'), lm = e.limbs, st = e.state;
    const y0 = G.GROUND - 8 - e.alt, grounded = e.alt < 6;
    const f = e.dead ? 2 : grounded ? 3 : [0, 1, 2, 1][Math.floor(time * 11 + e.id) % 4];       // 0 up, 1 level, 2 down, 3 folded
    const wing = (gone, c, ox, fr) => {
      if (gone) { R(ox - 1, -3, 3, 3, GORE); R(ox, -2, 1, 1, BONE); return; }
      if (fr === 0) for (let i = 0; i < 9; i++) R(ox - 2 - Math.round(i * 0.7), -3 - i, 7 - Math.round(i * 0.7), 1, i > 5 ? c.s : c.b);
      else if (fr === 1) { R(ox - 11, -4, 13, 2, c.b); R(ox - 13, -3, 5, 2, c.s); R(ox - 8, -4, 7, 1, c.l); }
      else if (fr === 2) for (let i = 0; i < 8; i++) R(ox - 3 - Math.round(i * 0.6), 1 + i, 7 - Math.round(i * 0.7), 1, i > 4 ? c.s : c.b);
      else { R(ox - 7, -2, 9, 4, c.b); R(ox - 9, 0, 3, 2, c.s); R(ox - 5, -2, 5, 1, c.l); }
    };
    wing(lm.armB.gone, { b: W1.s, s: W1.s, l: W1.s }, 1, f === 3 ? 3 : (f + 1) % 3);
    if (grounded && !e.dead) { R(-1, 3, 1, 4, '#5a5248'); R(2, 3, 1, 4, '#5a5248'); R(-2, 6, 3, 1, '#5a5248'); R(1, 6, 3, 1, '#5a5248'); }
    R(-10, -1, 5, 3, B.b); R(-12, 0, 2, 2, B.s);
    R(-5, -2, 10, 5, B.b); R(-4, 2, 8, 1, B.s); R(-3, -2, 5, 1, B.l);
    if (lm.head.gone) { R(4, -3, 3, 3, GORE); R(5, -2, 1, 1, BONE); }
    else {
      const open = st === 'windup' || st === 'strike' ? 1 : 0;
      R(4, -5, 5, 5, B.b); R(5, -5, 3, 1, B.l); R(9, -3, 4, 1, '#6a6052'); R(9, -2 + open, 3, 1, '#3a342c');
      if (e.dead) R(6, -3, 1, 1, '#000000'); else { R(6, -4, 2, 2, L.eye); R(6, -4, 1, 1, '#ffffff'); }
    }
    wing(lm.armF.gone, W1, -1, f);
    const sc = e.def.scale || 1;
    G.spr.close(ctx, e.x, y0 - (sc - 1) * 10, { facing: e.facing, flash: e.flash > 0, scale: sc, rot: st === 'strike' ? 0.55 : st === 'windup' ? -0.3 : e.dead ? 0.25 : 0 });
    e.out = { head: [e.x + e.facing * 12 * sc, y0 - 8 * sc], sh: [e.x, y0 - 4 * sc], hip: [e.x - e.facing * 8 * sc, y0] };
  }

  G.drawBeast = (ctx, e, time) => (e.def.model === 'hound' ? hound : crow)(ctx, e, time);

  // ------------------------------ Misery -----------------------------------
  // About twenty sprite pixels tall: a small thing, next to the knight.
  const LV = { b: '#b79be8', s: '#8a6ad0', l: '#e3d6ff' }, HR = { b: '#f3f0fa', s: '#c6bedb', l: '#ffffff' }, DR = { b: '#2a1838', s: '#170c22', l: '#4a3260' }, SKN = { b: '#f4e8ec', s: '#d6bfca' };
  const MISERY = { LV, HR, DR, SKN, band: '#1c1026', eye: '#6a48b8', mote: 'rgba(214,190,255,0.8)' };
  G.MISERY_PAL = MISERY;
  // the good fairies of the Lantern Court: same small shape, their own colours
  G.FAIRY_PALS = {
    queen: { LV: { b: '#f0d27a', s: '#c9a13b', l: '#fff4c8' }, HR: { b: '#f6e7b0', s: '#d8c080', l: '#fffbe8' }, DR: { b: '#f2ece0', s: '#c8bfae', l: '#ffffff' }, SKN, band: '#c9a13b', eye: '#3a8a5a', mote: 'rgba(255,230,150,0.9)', crown: true },
    bramble: { LV: { b: '#9ad48a', s: '#5a9a4a', l: '#d8f4c8' }, HR: { b: '#6a4a2a', s: '#4a3018', l: '#8a6a40' }, DR: { b: '#3a6a3a', s: '#244a24', l: '#5a8a4a' }, SKN, band: '#2a1a10', eye: '#2a6a2a', mote: 'rgba(170,230,150,0.85)' },
    dew: { LV: { b: '#a8d8f0', s: '#6aa8d0', l: '#e8f8ff' }, HR: { b: '#dff4ff', s: '#a8c8e0', l: '#ffffff' }, DR: { b: '#4a7aa8', s: '#2a5a88', l: '#7aa8d8' }, SKN, band: '#1a2a4a', eye: '#2a5aa8', mote: 'rgba(170,220,255,0.85)' },
    thimble: { LV: { b: '#f0a8c0', s: '#c87090', l: '#ffe0ea' }, HR: { b: '#e8a050', s: '#b87030', l: '#ffd090' }, DR: { b: '#8a2a4a', s: '#5a1a30', l: '#b84a6a' }, SKN, band: '#3a1020', eye: '#8a3a2a', mote: 'rgba(255,170,200,0.85)' },
  };
  G.drawMisery = (ctx, x, y, facing, t, glee, near, sit, pal = MISERY) => {
    const { LV, HR, DR, SKN } = pal;
    const { R, E, line } = G.spr.open(64, 60), sway = Math.round(Math.sin(t * 2.6) * 0.7);
    const stretch = sit && (t % 7) < 0.6;                                    // now and then she stretches her wings
    const up = sit ? stretch : Math.floor(t * 13) % 2 === 0;
    // four wings: fluttering in flight, folded down her back when she sits
    for (const sd of [-1, 1]) {
      if (sit && !stretch) { line(sd, -3, sd * 6, 0, LV.b, 2); line(sd, -3, sd * 6, -1, LV.l, 1); line(sd, -1, sd * 4, 3, LV.s, 1); }
      else { const ty = up ? -10 : -6; line(sd, -3, sd * 10, ty, LV.b, 2); line(sd, -4, sd * 10, ty, LV.l, 1); R(sd * 10, ty, 1, 1, LV.l); line(sd, 0, sd * 7, up ? 2 : 5, LV.s, 2); }
    }
    // white hair falling behind
    for (let i = 0; i < 12; i++) R(-4 + (i > 6 ? sway : 0), -7 + i, 7 - (i > 8 ? i - 8 : 0), 1, i > 9 ? HR.s : HR.b);
    // legs: tucked in flight; sitting, they hang over the front of the helm and swing
    if (sit) {
      const k1 = Math.sin(t * 3.4) > 0 ? 1 : 0, k2 = Math.sin(t * 3.4 + 2.2) > 0 ? 1 : 0;
      R(1, 3, 3, 1, SKN.s); R(4, 3, 1, 2 + k1, SKN.b); R(4, 5 + k1, 2, 1, DR.s); R(3, 4, 1, 1 + k2, SKN.s); R(3, 5 + k2, 1, 1, DR.s);
    } else { R(-1, 4, 1, 2, SKN.b); R(-1, 6, 1, 1, DR.s); R(1, 4, 1, 1, SKN.s); R(2, 5, 1, 1, DR.s); }
    // gown, sash and hem
    R(-1, -3, 3, 2, DR.b); R(-1, -2, 3, 1, LV.s);
    for (let i = 0; i < 4; i++) { R(-1 - i, -1 + i, 3 + 2 * i, 1, DR.b); R(-1 - i, -1 + i, 1, 1, DR.s); }
    for (let k = -4; k <= 4; k++) R(k, 3, 1, 1, (k & 1) ? LV.b : LV.l);
    // arms: spread in flight; sitting, one hand on her knee and one braced on the helm behind
    if (sit) { line(1, -2, 3, 1, DR.b, 1); R(3, 1, 1, 1, SKN.b); line(-1, -2, -3, 1, DR.b, 1); R(-4, 2, 1, 1, SKN.s); }
    else { line(-1, -2, -4, up ? -2 : -1, DR.b, 1); R(-5, up ? -3 : -2, 1, 1, SKN.b); line(1, -2, 4, up ? -3 : -2, DR.b, 1); R(5, up ? -4 : -3, 1, 1, SKN.b); }
    // head: pointed ears, fringe, the black lace band and its ribbons, two stray strands
    E(0, -6, 3, 3, SKN.b); R(-3, -5, 1, 2, SKN.s);
    R(-5, -7, 2, 1, SKN.b); R(4, -7, 2, 1, SKN.s);
    R(-3, -10, 7, 2, HR.b); R(-3, -8, 1, 1, HR.b); R(-1, -8, 1, 1, HR.b); R(1, -8, 1, 1, HR.b); R(3, -8, 1, 1, HR.b); R(-4, -9, 1, 5, HR.b); R(3, -9, 1, 4, HR.s); R(-1, -10, 2, 1, HR.l);
    R(-3, -11, 7, 1, pal.band); R(-5, -10, 1, 2, LV.b); R(5, -10, 1, 2, LV.b);
    if (pal.crown) { R(-3, -13, 7, 1, '#c9a13b'); R(-3, -15, 1, 2, '#f0d27a'); R(0, -16, 1, 3, '#f0d27a'); R(3, -15, 1, 2, '#f0d27a'); R(0, -16, 1, 1, '#ffffff'); }
    R(-2, -12, 1, 1, HR.b); R(-3, -13, 1, 1, HR.b); R(2, -12, 1, 1, HR.b); R(3, -13, 1, 1, HR.b);
    // face: sweet until something bleeds. Sitting, her eyes wander.
    const look = sit ? (Math.sin(t * 0.7) > 0.55 ? 1 : Math.sin(t * 0.7) < -0.55 ? -1 : 0) : 0, blink = Math.sin(t * 1.3) > 0.97;
    if (glee) { R(-2, -6, 1, 1, '#e0122a'); R(1, -6, 1, 1, '#e0122a'); R(-1, -4, 3, 1, '#5a1030'); }
    else if (blink) { R(-2 + look, -5, 1, 1, '#2a1c48'); R(1 + look, -5, 1, 1, '#2a1c48'); }
    else { R(-2 + look, -6, 1, 2, pal.eye); R(1 + look, -6, 1, 2, pal.eye); R(-3, -4, 1, 1, '#eaa3b3'); R(2, -4, 1, 1, '#eaa3b3'); }
    G.spr.close(ctx, x, y, { facing });
    // motes of light circling her: gold near something hidden, pink when she gloats
    for (let i = 0; i < 4; i++) {
      const a = t * 1.3 + i * 1.57, r = 18 + Math.sin(t * 2 + i) * 4;
      ctx.fillStyle = glee ? 'rgba(255,120,150,0.8)' : near ? 'rgba(240,205,120,0.95)' : pal.mote;
      if (Math.sin(t * 5 + i * 2.1) > -0.2) ctx.fillRect(Math.round((x + Math.cos(a) * r) / 2) * 2, Math.round((y + Math.sin(a) * r * 0.7) / 2) * 2, 2, 2);
    }
    // sitting, she hums: little notes drift up and fade
    if (sit && Math.sin(t * 0.45) > -0.2) for (let k = 0; k < 2; k++) {
      const ph = (t * 0.45 + k * 0.5) % 1, nx = Math.round((x + facing * (8 + ph * 12)) / 2) * 2, ny = Math.round((y - 18 - ph * 30) / 2) * 2;
      ctx.fillStyle = pal.mote.replace(/[\d.]+\)$/, (0.85 * (1 - ph)).toFixed(2) + ')'); ctx.fillRect(nx, ny + 6, 4, 2); ctx.fillRect(nx + 2, ny, 2, 6); ctx.fillRect(nx + 4, ny, 2, 2);
    }
  };
})();
