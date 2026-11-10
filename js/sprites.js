'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — hand-placed pixel sprites for everything that is not a person:
// the carrion hound, the gallows crow and Wist the fairy. Each is drawn on the
// shared sprite grid (G.spr), outlined, and shown at twice size.
// ---------------------------------------------------------------------------
(() => {
  const cache = new Map();
  const T = hex => { let t = cache.get(hex); if (!t) { t = { b: hex, s: G.shade(hex, 0.62), l: G.shade(hex, 1.35) }; cache.set(hex, t); } return t; };
  const BONE = '#e0d6c0', GORE = '#7a0509', RED = '#8f0810';

  // ------------------------------ hound ------------------------------------
  function hound(ctx, e) {
    const { R, line } = G.spr.open(64, 92), L = e.def.look, B = T('#3b3236'), SK = T(L.skin), FAR = G.shade('#3b3236', 0.5), lm = e.limbs, st = e.state;
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
    G.spr.close(ctx, e.x, G.GROUND, { facing: e.facing, flash: e.flash > 0 });
    const W = (x, y) => [e.x + e.facing * x * 2, G.GROUND + y * 2];
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
    G.spr.close(ctx, e.x, y0, { facing: e.facing, flash: e.flash > 0, rot: st === 'strike' ? 0.55 : st === 'windup' ? -0.3 : e.dead ? 0.25 : 0 });
    e.out = { head: [e.x + e.facing * 12, y0 - 8], sh: [e.x, y0 - 4], hip: [e.x - e.facing * 8, y0] };
  }

  G.drawBeast = (ctx, e, time) => (e.def.model === 'hound' ? hound : crow)(ctx, e, time);

  // ------------------------------- Wist ------------------------------------
  const LV = { b: '#b79be8', s: '#8a6ad0', l: '#e3d6ff' }, HR = { b: '#f3f0fa', s: '#c6bedb', l: '#ffffff' }, DR = { b: '#2a1838', s: '#170c22', l: '#4a3260' }, SKN = { b: '#f4e8ec', s: '#d6bfca' };
  G.drawWist = (ctx, x, y, facing, t, glee) => {
    const { R, E, line } = G.spr.open(64, 60), up = Math.floor(t * 13) % 2 === 0, sway = Math.round(Math.sin(t * 2.6) * 1.2);
    // four long wings
    for (const s of [-1, 1]) {
      const tx = s * 19, ty = up ? -19 : -11, lx = s * 14, ly = up ? 4 : 10;
      line(s * 3, -5, tx, ty, LV.b, 4); line(s * 5, -5, tx - s * 2, ty + 3, LV.b, 3); line(s * 4, -6, tx, ty, LV.l, 1); R(tx - 1, ty - 1, 2, 2, LV.l);
      line(s * 3, 0, lx, ly, LV.s, 3); line(s * 4, 0, lx, ly, LV.b, 1);
    }
    // long white hair behind
    for (let i = 0; i < 20; i++) R(-6 + (i > 12 ? Math.round((i - 12) * 0.5) : 0) + (i > 8 ? sway : 0), -9 + i, 12 - (i > 12 ? i - 12 : 0), 1, i > 14 ? HR.s : HR.b);
    R(-6, -6, 1, 12, HR.s);
    // legs, one tucked
    R(-2, 7, 2, 4, SKN.b); R(-2, 11, 2, 1, DR.s); R(1, 7, 2, 2, SKN.s); R(2, 9, 2, 1, DR.s);
    // arms in dark sleeves, spread wide
    line(-3, 0, -8, up ? 0 : 1, DR.b, 2); R(-10, up ? -1 : 0, 2, 2, SKN.b); line(3, 0, 8, up ? -2 : -1, DR.b, 2); R(9, up ? -3 : -2, 2, 2, SKN.b);
    // plum gown, lavender sash and hem
    R(-3, -2, 6, 5, DR.b); R(-3, -2, 1, 5, DR.s); R(2, -1, 1, 3, DR.l);
    for (let i = 0; i < 5; i++) { R(-3 - i, 3 + i, 7 + 2 * i, 1, DR.b); R(-3 - i, 3 + i, 2, 1, DR.s); if (i % 2) R(1 + i, 3 + i, 1, 1, DR.l); }
    for (let k = -7; k <= 7; k++) R(k, 8, 1, 1, (k & 1) ? LV.b : LV.l);
    R(-3, 2, 6, 1, LV.s); R(-1, -2, 2, 1, LV.b);
    // head, pointed ears, fringe, stray strands
    E(0, -9, 6, 6, SKN.b); R(-6, -9, 1, 4, SKN.s); R(-3, -4, 6, 1, SKN.s);
    R(-9, -11, 3, 1, SKN.b); R(-10, -12, 2, 1, SKN.b); R(7, -11, 3, 1, SKN.b); R(9, -12, 2, 1, SKN.s);
    R(-6, -14, 13, 4, HR.b); for (let k = -6; k <= 6; k += 2) R(k, -10, 1, 1 + ((k / 2) & 1), HR.b);
    R(-7, -11, 2, 8, HR.b); R(6, -11, 2, 7, HR.s); R(-2, -13, 5, 1, HR.l);
    line(-2, -15, -6, -20, HR.b, 1); line(-6, -20, -10, -18, HR.b, 1); line(2, -15, 6, -21, HR.b, 1); line(6, -21, 11, -19, HR.b, 1);
    // black lace headdress with lavender ribbons
    R(-5, -16, 11, 2, '#1c1026'); for (let k = -5; k <= 5; k += 2) R(k, -17, 1, 1, '#1c1026'); R(-8, -15, 2, 3, LV.b); R(7, -15, 2, 3, LV.b); R(-8, -15, 1, 1, LV.l); R(7, -15, 1, 1, LV.l);
    // face: sweet until something bleeds
    if (glee) {
      R(-4, -9, 3, 2, '#e0122a'); R(2, -9, 3, 2, '#e0122a'); R(-3, -9, 1, 1, '#ffb0b0'); R(3, -9, 1, 1, '#ffb0b0');
      R(-4, -11, 1, 1, '#3a1020'); R(-3, -10, 2, 1, '#3a1020'); R(4, -11, 1, 1, '#3a1020'); R(2, -10, 2, 1, '#3a1020');
      R(-3, -6, 7, 1, '#5a1030'); R(-2, -5, 5, 1, '#5a1030'); R(-2, -6, 5, 1, '#ffffff');
    } else {
      for (const ex of [-3, 2]) { R(ex, -9, 2, 3, '#6a48b8'); R(ex, -9, 2, 1, '#2a1c48'); R(ex, -8, 1, 1, '#ffffff'); }
      R(-5, -6, 2, 1, '#eaa3b3'); R(4, -6, 2, 1, '#eaa3b3'); R(0, -5, 1, 1, '#a85a72');
    }
    G.spr.close(ctx, x, y, { facing });
    // a few motes of light around her instead of a soft glow
    for (let i = 0; i < 5; i++) {
      const a = t * 1.3 + i * 1.257, r = 30 + Math.sin(t * 2 + i) * 6;
      ctx.fillStyle = glee ? 'rgba(255,120,150,0.8)' : 'rgba(214,190,255,0.8)';
      if (Math.sin(t * 5 + i * 2.1) > -0.2) ctx.fillRect(Math.round((x + Math.cos(a) * r) / 2) * 2, Math.round((y + Math.sin(a) * r * 0.7) / 2) * 2, 2, 2);
    }
  };
})();
