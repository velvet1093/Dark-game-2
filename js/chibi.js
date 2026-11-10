'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — chibi pixel sprites for every humanoid, in the manner of 16-bit
// JRPG field sprites: a large head, a small body, three tones per material and
// a dark outline. Each sprite is placed pixel by pixel on a small grid from the
// same pose and look data the old vector rig used, then outlined and drawn at
// twice size with smoothing off. G.drawHumanoid points here; the vector rig
// stays available as G.drawRig.
//
// Also: G.pixBegin / G.pixEnd, which turn any vector drawing (the hound, the
// crow, the fairy) into an outlined pixel sprite.
// ---------------------------------------------------------------------------
(() => {
  const BW = 128, BH = 112, OX = 56, BASE = 100, PX = 2;       // 40-row frame: feet stand on row BASE
  const F0 = BASE - 40;
  let buf = null, b = null;
  const cache = new Map();
  const tones = hex => { let t = cache.get(hex); if (!t) { t = { b: hex, s: G.shade(hex, 0.66), l: G.shade(hex, 1.24) }; cache.set(hex, t); } return t; };
  const WHITE = { b: '#f1ece5', s: '#bdb4c2', l: '#ffffff' }, STEEL = { b: '#b9bcc6', s: '#7d808c', l: '#eef0f5' };
  const BOOT = '#130e13', BLOOD = '#8f0810', LAV = '#9a70e0', WOOD = { b: '#5a4030', s: '#3a2a1e' };
  const ensure = () => { if (!buf) { buf = document.createElement('canvas'); buf.width = BW; buf.height = BH; b = buf.getContext('2d', { willReadFrequently: true }); } };

  // Snap the buffer to solid pixels, tint it if the figure was just struck, and outline it.
  const finish = flash => {
    const img = b.getImageData(0, 0, BW, BH), d = img.data, solid = new Uint8Array(BW * BH);
    for (let i = 0; i < BW * BH; i++) {
      solid[i] = d[i * 4 + 3] > 100 ? 1 : 0; d[i * 4 + 3] = solid[i] ? 255 : 0;
      if (solid[i] && flash) { d[i * 4] = 255; d[i * 4 + 1] = 217; d[i * 4 + 2] = 208; }
    }
    for (let y = 1; y < BH - 1; y++) for (let x = 1; x < BW - 1; x++) {
      const i = y * BW + x;
      if (!solid[i] && (solid[i - 1] || solid[i + 1] || solid[i - BW] || solid[i + BW])) { d[i * 4] = 26; d[i * 4 + 1] = 16; d[i * 4 + 2] = 30; d[i * 4 + 3] = 255; }
    }
    b.putImageData(img, 0, 0);
  };

  // ---- vector -> pixel helper for anything not drawn on the grid
  G.pixBegin = (wx, wy, ax = BW / 2, ay = BH / 2) => { ensure(); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, BW, BH); b.setTransform(1 / PX, 0, 0, 1 / PX, ax - wx / PX, ay - wy / PX); return b; };
  G.pixEnd = (ctx, wx, wy, ax = BW / 2, ay = BH / 2, flash = false) => {
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.shadowBlur = 0; finish(flash);
    const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, Math.round(wx) - ax * PX, Math.round(wy) - ay * PX, BW * PX, BH * PX);
    ctx.imageSmoothingEnabled = sm;
  };

  // ---- shared grid for hand-placed sprites (see sprites.js). Origin (ox, oy) in the buffer; y is negative upward.
  G.spr = {
    ox: 64, oy: 90,
    open(ox = 64, oy = 90) {
      ensure(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.clearRect(0, 0, BW, BH); this.ox = ox; this.oy = oy;
      const R = (x, y, w, h, col) => { if (w > 0 && h > 0) { b.fillStyle = col; b.fillRect(ox + Math.round(x), oy + Math.round(y), w, h); } };
      const E = (cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry + 0.6)))); R(cx - w, cy + y, w * 2 + 1, 1, col); } };
      const line = (x0, y0, x1, y1, col, w = 1) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), o2 = Math.floor(w / 2); for (let i = 0; i <= n; i++) R(x0 + (x1 - x0) * i / n - o2, y0 + (y1 - y0) * i / n - o2, w, w, col); };
      return { R, E, line };
    },
    close(ctx, x, y, o = {}) {
      finish(!!o.flash);
      const sm = ctx.imageSmoothingEnabled; ctx.save(); ctx.imageSmoothingEnabled = false;
      ctx.translate(Math.round(x), Math.round(y)); ctx.scale(o.facing || 1, 1); if (o.rot) ctx.rotate(o.rot);
      ctx.drawImage(buf, -this.ox * PX, -this.oy * PX, BW * PX, BH * PX);
      ctx.restore(); ctx.imageSmoothingEnabled = sm;
    },
  };
  // A line of square blocks snapped to the sprite pixel grid, for trails and marks drawn straight on the screen.
  G.pxLine = (ctx, x0, y0, x1, y1, size, col) => {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / PX)); ctx.fillStyle = col;
    for (let i = 0; i <= n; i++) ctx.fillRect(Math.round((x0 + (x1 - x0) * i / n - size / 2) / PX) * PX, Math.round((y0 + (y1 - y0) * i / n - size / 2) / PX) * PX, size, size);
  };

  // o: the same object the vector rig took — {x,y,facing,scale,pose,look,limbs,weapon,wlen,shield,flash,bloody,alpha,time,weeping}
  function chibi(ctx, o) {
    ensure(); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, BW, BH);
    const p = o.pose, L = o.look, lm = o.limbs || {}, gone = k => lm[k] && lm[k].gone, time = o.time || 0;
    const big = Math.max(0, (o.scale || 1) - 1.05), tl = Math.round(big * 9), tt = Math.round(big * 8), wd = Math.round(big * 5), hr = 6 + (big > 0.2 ? 1 : 0);
    const R = (x, y, w, h, col) => { if (w > 0 && h > 0) { b.fillStyle = col; b.fillRect(OX + Math.round(x), F0 + Math.round(y), w, h); } };
    const E = (cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry + 0.6)))); R(cx - w, cy + y, w * 2 + 1, 1, col); } };
    const line = (x0, y0, x1, y1, col, w = 1) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), o2 = Math.floor(w / 2); for (let i = 0; i <= n; i++) R(x0 + (x1 - x0) * i / n - o2, y0 + (y1 - y0) * i / n - o2, w, w, col); };
    const SK = tones(L.skin), BD = tones(L.body), AR = tones(L.arm), LG = tones(L.leg), HM = tones(L.helmCol || '#444444'), HAIR = L.hair ? tones(L.hair) : null;
    const feral = !!L.eye && L.helm !== 'veil' && L.helm !== 'beak';
    const sister = L.helm === 'sister' || L.helm === 'wimple' || L.helm === 'coif';

    // ---- pose -> pixel offsets
    let u = G.clamp(Math.round((p.crouch || 0) / 2.5), 0, 7);
    const hx = G.clamp(Math.round(Math.sin(p.lean || 0) * 6), -3, 4), tx = Math.round(hx / 2), hd = G.clamp(Math.round((p.head || 0) * 2.5), -1, 2);
    const legTop = 28 - tl, torsoH = 9 + tt, torsoTop = legTop - torsoH, tw = 4 + wd;
    const kneel = !!L.skirt && u >= 5, longSkirt = L.skirt === 'long';
    const fx = 1 + hx, fy = torsoTop - 2 - hr + u + hd;
    const shY = torsoTop + 1 + u, shF = tw + tx, shB = -tw + tx;

    // ---- cape
    if (L.cape) {
      const CP = tones(L.cape), n = legTop - torsoTop + 7;
      for (let i = 0; i < n; i++) {
        const sw = Math.round(i * 0.3 + Math.sin(time * 3 + i * 0.4) * 0.7 - (o.vx || 0) * (o.facing || 1) * 0.004 * i), w = 5 + Math.min(3, Math.round(i / 3));
        if (i === n - 1) { for (let k = 0; k < w; k += 2) R(shB - w - sw + k + 1, torsoTop + u + i, 1, 1, CP.s); }
        else { R(shB - w - sw + 1, torsoTop + u + i, w + 1, 1, CP.b); R(shB - w - sw + 1, torsoTop + u + i, 2, 1, CP.s); if (i % 3 === 1) R(shB - sw - 1, torsoTop + u + i, 1, 1, CP.l); }
      }
    }
    // ---- veil and long hair down the back
    if (sister || L.helm === 'veil') {
      const V = sister ? tones('#211e29') : tones(L.helmCol || '#e6dfd2');
      E(fx - 2, fy, hr + 3, hr + 3, V.s);
      for (let i = 0; i < 17; i++) R(fx - 11 + (i > 13 ? i - 13 : 0), fy + 1 + i, 8 - (i > 13 ? i - 13 : 0), 1, V.s);
      R(fx - 11, fy + 3, 1, 11, V.l);
    }
    if (HAIR && (sister || (L.soft && L.helm === 'none'))) { R(fx - 9, fy + 6, 3, 12, HAIR.b); R(fx - 9, fy + 6, 1, 12, HAIR.s); R(fx - 7, fy + 8, 1, 8, HAIR.l); R(fx - 8, fy + 18, 2, 2, HAIR.s); }

    // ---- limbs
    const armLen = 4 + Math.round(big * 3);
    const arm = (sx0, a, e, front) => {
      const c = front ? AR : { b: AR.s, s: AR.s, l: AR.b };
      const ex = sx0 + Math.sin(a) * armLen, ey = shY + Math.cos(a) * armLen, ax = ex + Math.sin(a + e) * armLen, ay = ey + Math.cos(a + e) * armLen;
      line(sx0, shY, ex, ey, c.b, 3); line(ex, ey, ax, ay, c.b, 3);
      if (front) line(sx0 + 1, shY - 1, ex + 1, ey - 1, c.l, 1);
      if (L.cuff) R(ex + (ax - ex) * 0.7 - 1, ey + (ay - ey) * 0.7 - 1, 3, 2, front ? WHITE.b : WHITE.s);
      return [ax, ay, a + e];
    };
    const hand = (h, front, grip) => {
      const s = big > 0.2 ? 3 : 2, x = h[0] - 1, y = h[1] - 1;
      R(x, y, s, s, front ? SK.b : SK.s); R(x, y + s - 1, s, 1, SK.s);
      if (feral && !grip) { const ux = Math.sin(h[2]), uy = Math.cos(h[2]); line(h[0] + ux * 2, h[1] + uy * 2, h[0] + ux * 4, h[1] + uy * 4, '#2a1a1a', 1); line(h[0] + ux * 2 + uy, h[1] + uy * 2 - ux, h[0] + ux * 3 + uy * 2, h[1] + uy * 3 - ux * 2, '#2a1a1a', 1); }
    };
    const stump = (x, y) => { R(x - 1, y - 1, 3, 3, '#7a0509'); R(x, y, 1, 1, '#d9c9b0'); };
    const shield = (x, y) => {
      R(x - 3, y - 6, 7, 8, '#3d4150'); R(x - 2, y + 2, 5, 2, '#3d4150'); R(x - 1, y + 4, 3, 1, '#3d4150'); R(x, y + 5, 1, 1, '#3d4150');
      R(x - 3, y - 6, 7, 1, '#8a8e9a'); R(x - 3, y - 6, 1, 8, '#8a8e9a'); R(x + 3, y - 5, 1, 7, '#262936'); R(x - 1, y - 3, 3, 3, '#c9a13b'); R(x, y - 2, 1, 1, '#f0d680');
    };
    const leg = (hipx, foot, lift, isGone, c, w) => {
      const top = legTop + u, off = Math.round((foot || 0) / 5), up = G.clamp(Math.round((lift || 0) / 2.5), 0, 3), bot = 37 - up;
      if (isGone) { stump(hipx + 1, top + 1); return; }
      for (let r = top; r <= bot; r++) { const x = hipx + Math.round(off * (r - top) / Math.max(1, bot - top)); R(x, r, w, 1, c.b); R(x, r, 1, 1, c.s); }
      R(hipx + off - (off < 0 ? 1 : 0), bot + 1, w + 1, 2, BOOT); R(hipx + off + 1, bot + 1, w - 1, 1, '#2a2230');
    };
    const lw = 3 + (wd > 1 ? 1 : 0);

    // back arm, then legs
    const bh = gone('armB') ? (stump(shB, shY + 1), null) : arm(shB, p.bA || 0, p.bE || 0, false);
    if (bh) { hand(bh, false, !!o.shield); if (o.shield && !p.shieldFront) shield(bh[0] - 1, bh[1]); }
    if (!kneel && !longSkirt) { leg(-3 - (wd > 1 ? 1 : 0) + tx, p.footB, p.liftB, gone('legB'), { b: LG.s, s: G.shade(L.leg, 0.5) }, lw); leg(1 + tx, p.footF, p.liftF, gone('legF'), LG, lw); }
    else if (!longSkirt) R(-10, 38, 4, 2, BOOT);
    else { R(-3 + tx, 38, 3, 2, BOOT); R(2 + tx, 38, 3, 2, BOOT); }

    // ---- torso
    const ty = torsoTop + u;
    R(tx, ty - 1, 3, 1, SK.s);
    R(-tw + tx, ty, tw * 2 + 1, torsoH, BD.b); R(-tw + tx, ty, 2, torsoH, BD.s); R(tw + tx, ty + 1, 1, torsoH - 3, BD.l);
    if (L.belly) { E(tx + 2, ty + torsoH - 4, tw + 3, 5, BD.b); R(tx - tw - 1, ty + torsoH - 6, 2, 5, BD.s); R(tx + 4, ty + torsoH - 7, 3, 1, BD.l); R(tx + 1, ty + torsoH - 5, 1, 3, '#7a2a2a'); R(tx + 2, ty + torsoH - 3, 2, 1, '#7a2a2a'); R(tx + 5, ty + torsoH - 4, 1, 2, '#7a2a2a'); }
    if (L.skirt) {
      // black bodice, white frilled blouse, lavender ribbon, flared skirt with a scalloped hem
      R(-1 + tx, ty + 1, 5, 5, WHITE.b); R(-1 + tx, ty + 1, 1, 5, WHITE.s); R(-1 + tx, ty + 5, 5, 1, WHITE.s);
      R(tx, ty + 2, 1, 1, WHITE.l); R(tx + 2, ty + 3, 1, 1, WHITE.l); R(tx + 1, ty + 4, 1, 1, WHITE.s); R(tx + 3, ty + 2, 1, 1, WHITE.s);
      R(1 + tx, ty, 2, 1, LAV); R(1 + tx, ty + 1, 1, 1, G.shade(LAV, 0.7));
      const rows = longSkirt ? 38 - (ty + 6) : 7, sy0 = ty + 6;
      for (let i = 0; i < rows; i++) {
        const h = Math.round(5 + Math.min(i, 8) * (kneel ? 1.0 : 0.7)), y = sy0 + i;
        R(-h + tx, y, h * 2 + 1, 1, BD.b); R(-h + tx, y, Math.max(2, Math.round(h * 0.45)), 1, BD.s);
        if (i > 0) { R(-1 + tx, y, 1, 1, BD.s); if (i % 2) { R(2 + tx, y, 1, 1, BD.l); R(h - 1 + tx, y, 1, 1, BD.l); } }
      }
      const hw = kneel ? 12 : 10, hy0 = sy0 + rows - 1;
      R(-hw + tx, hy0, hw * 2 + 1, 1, WHITE.b); R(-hw + tx, hy0, 5, 1, WHITE.s);
      for (let x = -hw; x <= hw; x++) { R(x + tx, hy0 + 1, 1, 1, (x & 1) ? WHITE.b : WHITE.s); if (!(x & 1)) R(x + tx, hy0 + 2, 1, 1, x < -2 ? WHITE.s : WHITE.b); }
    } else {
      if (L.trim) { const TR = tones(L.trim); R(-1 + tx, ty + 1, 3, torsoH + 2, TR.b); R(-1 + tx, ty + 1, 1, torsoH + 2, TR.s); R(tx, ty + 2, 1, 2, TR.l); }
      if (L.helm === 'helm') { R(-tw - 1 + tx, ty, 3, 2, AR.l); R(tw - 1 + tx, ty, 3, 2, AR.l); R(-tw + 2 + tx, ty + 1, tw * 2 - 3, 1, BD.l); R(-tw + tx, ty + 4, tw * 2 + 1, 1, BD.s); }
      if (L.body === L.skin) { R(tx - 2, ty + 3, 2, 1, SK.s); R(tx + 2, ty + 3, 2, 1, SK.s); R(tx + 1, ty + 5, 1, 2, SK.s); }
      if (!L.belly) R(-tw + tx, legTop - 1 + u, tw * 2 + 1, 1, '#1a1414');
    }

    // ---- head
    const RED = '#a00a12';
    if (gone('head')) stump(tx + 1, ty - 1);
    else {
      const covered = L.helm === 'helm' || L.helm === 'sack' || L.helm === 'beak';
      if (!covered) {
        E(fx, fy, hr, hr, SK.b); R(fx - hr, fy - 1, 1, 5, SK.s); R(fx - 3, fy + hr - 1, 7, 1, SK.s); R(fx + 2, fy - 3, 3, 1, SK.l);
        if (L.beard) { const BR = tones(L.beard); for (let y = 2; y <= hr; y++) { const w = Math.round(hr * Math.sqrt(Math.max(0, 1 - y * y / (hr * hr + 0.6)))); R(fx - w, fy + y, w * 2 + 1, 1, BR.b); } R(fx - hr, fy + 1, 2, 2, BR.b); R(fx + hr - 1, fy + 1, 2, 2, BR.b); R(fx - 3, fy + 3, 2, 3, BR.s); }
        if (feral) {
          R(fx - 3, fy - 2, 4, 3, '#2a0a0e'); R(fx + 2, fy - 2, 4, 3, '#2a0a0e');
          R(fx - 2, fy - 1, 2, 2, L.eye); R(fx + 3, fy - 1, 2, 2, L.eye); R(fx - 2, fy - 1, 1, 1, '#ffffff'); R(fx + 3, fy - 1, 1, 1, '#ffffff');
          R(fx - 4, fy - 4, 1, 1, '#1a1010'); R(fx - 3, fy - 3, 3, 1, '#1a1010'); R(fx + 5, fy - 4, 1, 1, '#1a1010'); R(fx + 2, fy - 3, 3, 1, '#1a1010');
          R(fx - 2, fy + 1, 1, 4, RED); R(fx + 4, fy + 1, 1, 2, RED);
          R(fx - 1, fy + 3, 5, 2, '#1a0508'); R(fx - 1, fy + 3, 1, 1, '#e0d6c0'); R(fx + 1, fy + 3, 1, 1, '#e0d6c0'); R(fx + 3, fy + 3, 1, 1, '#e0d6c0'); R(fx, fy + 4, 1, 1, '#e0d6c0');
        } else {
          const eye = G.shade(L.iris || (L.helm === 'veil' ? L.eye : null) || '#5a3d30', 0.72), blink = Math.sin(time * 0.9 + (o.x || 0) * 0.37) > 0.985, shut = blink || (p.head || 0) > 0.45;
          for (const ex of [fx - 2, fx + 3]) {
            if (shut) R(ex, fy + 1, 2, 1, '#2a1c2e');
            else if (L.soft) { R(ex, fy - 1, 2, 3, eye); R(ex, fy - 1, 2, 1, '#231728'); R(ex, fy, 1, 1, '#ffffff'); }
            else { R(ex, fy - 1, 2, 2, eye); R(ex, fy - 1, 1, 1, '#ffffff'); R(ex - (ex < fx ? 1 : 0), fy - 3, 3, 1, G.shade(L.beard || L.hair || '#4a3428', 0.6)); }
          }
          if (L.soft) { R(fx - 4, fy + 2, 2, 1, '#eaa3a3'); R(fx + 5, fy + 2, 1, 1, '#eaa3a3'); }
          if (!L.beard) R(fx + 1, fy + 3, L.soft ? 1 : 2, 1, '#a85a62');
          if (L.helm === 'veil') { R(fx - 2, fy + 2, 1, 5, RED); R(fx + 3, fy + 2, 1, 4, RED); R(fx - 1, fy + 5, 1, 2, RED); }
        }
      }
      if (L.helm === 'none') {
        if (HAIR) { R(fx - 4, fy - hr - 1, 9, 1, HAIR.b); R(fx - hr, fy - hr, hr * 2 + 1, 4, HAIR.b); for (let x = -hr; x <= hr; x += 2) R(fx + x, fy - 2, 1, 1 + ((x / 2) & 1), HAIR.b); R(fx - hr - 1, fy - 3, 2, 7, HAIR.b); R(fx - hr - 1, fy - 3, 1, 7, HAIR.s); R(fx - 2, fy - hr, 5, 1, HAIR.l); }
        else if (feral) { R(fx - 3, fy - hr - 2, 1, 2, '#2a2222'); R(fx, fy - hr - 3, 1, 3, '#2a2222'); R(fx + 3, fy - hr - 2, 1, 2, '#2a2222'); R(fx - 5, fy - hr, 1, 2, '#2a2222'); R(fx - hr, fy, 1, 2, SK.s); }
        else { R(fx - 1, fy - hr, 4, 1, SK.l); R(fx - hr - 1, fy, 1, 2, SK.s); if (L.beard) R(fx - hr, fy - 3, 2, 3, tones(L.beard).s); }
      } else if (L.helm === 'helm') {
        E(fx, fy, hr + 1, hr + 1, HM.b); R(fx - hr - 1, fy - 3, 2, 8, HM.s); R(fx - hr + 1, fy + hr - 1, hr * 2 - 1, 2, HM.s);
        R(fx + 1, fy - hr - 1, 3, 1, HM.l); R(fx + 3, fy - hr, 2, 1, HM.l); R(fx, fy - hr, 1, hr - 1, HM.s);
        R(fx - 2, fy - 1, hr + 3, 2, '#0a0808'); if (L.eye) { R(fx + 2, fy - 1, 2, 2, L.eye); R(fx - 1, fy - 1, 1, 2, L.eye); }
        R(fx + 1, fy + 3, 1, 1, '#0a0808'); R(fx + 3, fy + 3, 1, 1, '#0a0808'); R(fx + 2, fy + 5, 1, 1, '#0a0808');
        if (o.weeping) { R(fx + 2, fy + 1, 1, 4, RED); R(fx - 1, fy + 1, 1, 2, RED); }
        if (L.plume) { const PL = tones(L.plume), py = fy - hr; R(fx - 2, py - 3, 3, 2, PL.b); R(fx - 5, py - 2, 4, 2, PL.b); R(fx - 7, py, 3, 3, PL.b); R(fx - 8, py + 3, 2, 3, PL.s); R(fx - 4, py - 2, 2, 1, PL.l); R(fx - 6, py + 1, 1, 2, PL.s); }
      } else if (L.helm === 'hood' || L.helm === 'veil') {
        R(fx - 4, fy - hr - 2, 9, 1, HM.b); R(fx - hr - 1, fy - hr - 1, hr * 2 + 3, hr - 2, HM.b); R(fx - hr - 2, fy - 3, 3, hr + 6, HM.b);
        R(fx - hr - 2, fy - 3, 1, hr + 6, HM.s); R(fx + hr, fy - 3, 1, hr, HM.s); R(fx - 1, fy - hr - 2, 4, 1, HM.l); R(fx - hr - 1, fy - hr - 1, 3, 2, HM.s);
        for (let x = -hr + 1; x <= hr; x += 2) R(fx + x, fy - 3, 1, 1, HM.b);
      } else if (sister) {
        const V = tones('#211e29'), HH = HAIR || tones('#5a4034');
        R(fx - hr, fy - 5, hr * 2 + 1, 3, HH.b); for (let x = -hr; x <= hr; x += 2) R(fx + x, fy - 2, 1, 1 + ((x / 2) & 1), HH.b);
        R(fx - hr - 1, fy - 2, 2, 9, HH.b); R(fx - hr - 1, fy - 2, 1, 9, HH.s); R(fx + hr, fy - 2, 1, 6, HH.s); R(fx - 2, fy - 4, 5, 1, HH.l);
        R(fx - 5, fy - 10, 10, 1, V.b); R(fx - 7, fy - 9, 14, 2, V.b); R(fx - 3, fy - 10, 5, 1, V.l); R(fx - 7, fy - 9, 3, 2, V.s);
        R(fx - 10, fy - 7, 4, 9, V.b); R(fx - 10, fy - 7, 1, 9, V.s);
        for (let x = -7; x <= 7; x++) { if (x & 1) R(fx + x, fy - 8, 1, 1, WHITE.b); R(fx + x, fy - 7, 1, 1, (x & 1) ? WHITE.l : WHITE.b); R(fx + x, fy - 6, 1, 1, WHITE.s); }
        R(fx - 10, fy - 9, 3, 1, WHITE.l); R(fx - 9, fy - 10, 1, 3, WHITE.l); R(fx - 10, fy - 10, 1, 1, WHITE.b); R(fx - 8, fy - 8, 1, 1, WHITE.b); R(fx - 9, fy - 9, 1, 1, LAV);
        R(fx + 7, fy - 5, 1, 5, WHITE.s); R(fx + 8, fy - 4, 1, 3, WHITE.b);
      } else if (L.helm === 'sack') {
        E(fx, fy, hr + 1, hr + 1, HM.b); R(fx - hr - 1, fy - 3, 2, 8, HM.s); R(fx + 1, fy - hr - 1, 4, 1, HM.l); R(fx - 1, fy - hr - 3, 3, 2, HM.s);
        R(fx - 3, fy - 2, 3, 3, '#000000'); R(fx + 2, fy - 2, 3, 3, '#000000'); R(fx - 2, fy - 4, 1, 1, HM.s); R(fx + 4, fy - 4, 1, 1, HM.s);
        for (let x = -2; x <= 4; x++) R(fx + x, fy + 3 + (x & 1), 1, 1, '#2a2018');
        R(fx - hr + 1, fy + hr, hr * 2 - 1, 1, WOOD.s);
      } else if (L.helm === 'beak') {
        E(fx, fy, hr + 1, hr + 1, HM.b); R(fx - hr - 1, fy - 2, 2, 7, '#0c0a0e');
        R(fx + 4, fy, 6, 1, '#3a3438'); R(fx + 4, fy + 1, 9, 1, '#2a2428'); R(fx + 4, fy + 2, 6, 1, '#1c181c'); R(fx + 4, fy + 3, 3, 1, '#1c181c');
        R(fx + 1, fy - 3, 3, 3, '#0a0808'); R(fx + 2, fy - 2, 2, 2, L.eye || '#c9a13b'); R(fx + 2, fy - 2, 1, 1, '#fff0b0');
        R(fx - hr - 3, fy - hr, hr * 2 + 7, 1, '#0e0c10'); R(fx - 4, fy - hr - 5, 9, 5, '#0e0c10'); R(fx - 4, fy - hr - 1, 9, 1, '#3a3438'); R(fx + 2, fy - hr - 4, 2, 2, '#1e1a22');
      }
    }

    // ---- weapon arm
    const armed = !!o.weapon && o.weapon !== 'none';
    const fh = gone('armF') ? (stump(shF, shY + 1), null) : arm(shF, p.armA || 0, p.armE || 0, true);
    let tip = null;
    if (fh && armed) {
      const w = p.w || 0, ux = Math.sin(w), uy = Math.cos(w), px = uy, py = -ux, len = Math.round((o.wlen || 40) / 2 * (1 + big * 0.5)), x0 = fh[0], y0 = fh[1], x1 = x0 + ux * len, y1 = y0 + uy * len, t = o.weapon;
      const red = (o.bloody || 0) > 0.05;
      if (t === 'sword' || t === 'greatsword') {
        const th = t === 'sword' ? 2 : 3, g = t === 'sword' ? 2 : 4;
        line(x0 - ux * 2, y0 - uy * 2, x0 + ux, y0 + uy, WOOD.s, th - 1 || 1);
        line(x0 + ux * 2, y0 + uy * 2, x1, y1, STEEL.s, th); line(x0 + ux * 2, y0 + uy * 2, x1, y1, STEEL.b, th - 1);
        line(x0 + ux * 3, y0 + uy * 3, x0 + ux * (len - 3), y0 + uy * (len - 3), STEEL.l, 1);
        if (red) line(x0 + ux * len * (1 - Math.min(0.75, o.bloody)), y0 + uy * len * (1 - Math.min(0.75, o.bloody)), x1, y1, BLOOD, th - 1 || 1);
        line(x0 + ux * 2 - px * g, y0 + uy * 2 - py * g, x0 + ux * 2 + px * g, y0 + uy * 2 + py * g, '#c9a13b', th - 1 || 1);
      } else if (t === 'cleaver') {
        line(x0, y0, x0 + ux * len * 0.5, y0 + uy * len * 0.5, WOOD.b, 2);
        for (let k = 0; k <= 6; k++) line(x0 + ux * len * 0.5 + px * k, y0 + uy * len * 0.5 + py * k, x1 + px * k, y1 + py * k, k === 6 ? BLOOD : k < 2 ? STEEL.s : STEEL.b, 2);
        line(x0 + ux * len * 0.6 + px * 2, y0 + uy * len * 0.6 + py * 2, x1 - ux * 2 + px * 2, y1 - uy * 2 + py * 2, STEEL.l, 1);
      } else if (t === 'club') {
        line(x0, y0, x1, y1, WOOD.b, 2); line(x1 - ux * 4, y1 - uy * 4, x1, y1, WOOD.s, 4);
        R(x1 + px * 2, y1 + py * 2, 1, 1, '#1a1212'); R(x1 - px * 2, y1 - py * 2, 1, 1, '#1a1212'); R(x1 - ux * 3 + px * 2, y1 - uy * 3 + py * 2, 1, 1, '#1a1212');
      } else if (t === 'axe') {
        line(x0 - ux * len * 0.25, y0 - uy * len * 0.25, x1, y1, WOOD.s, 2); line(x0 - ux * len * 0.25, y0 - uy * len * 0.25, x1, y1, WOOD.b, 1);
        for (let k = 1; k <= 8; k++) {   // a crescent blade on the leading side
          const in0 = len - 12 + (k > 5 ? (k - 5) * 1.5 : 0) - (k < 3 ? 0 : 1), in1 = len - (k > 5 ? (k - 5) * 1.5 : 0) + (k < 3 ? -2 : 1);
          line(x0 + ux * in0 + px * k, y0 + uy * in0 + py * k, x0 + ux * in1 + px * k, y0 + uy * in1 + py * k, k >= 7 ? (red ? BLOOD : STEEL.l) : k < 3 ? STEEL.s : STEEL.b, 2);
        }
        line(x0 + ux * (len - 7) - px, y0 + uy * (len - 7) - py, x0 + ux * (len - 5) - px * 4, y0 + uy * (len - 5) - py * 4, STEEL.s, 2);
      } else if (t === 'flail') {
        const hl = len * 0.5, cx = x0 + ux * hl, cy = y0 + uy * hl, ex = cx + ux * len * 0.4, ey = cy + uy * len * 0.4 + len * 0.16;
        line(x0 - ux, y0 - uy, cx, cy, WOOD.b, 2);
        for (let i = 1; i <= 5; i++) R(cx + (ex - cx) * i / 6, cy + (ey - cy) * i / 6, 1, 1, i % 2 ? STEEL.s : STEEL.l);
        R(ex - 2, ey - 2, 5, 5, STEEL.s); R(ex - 1, ey - 1, 3, 3, STEEL.b); R(ex, ey - 1, 1, 1, STEEL.l);
        R(ex, ey - 4, 1, 2, STEEL.l); R(ex, ey + 3, 1, 2, STEEL.b); R(ex - 4, ey, 2, 1, STEEL.b); R(ex + 3, ey, 2, 1, STEEL.l);
        if (red) R(ex - 1, ey + 1, 3, 2, BLOOD);
        tip = [ex, ey];
      } else {   // spear, scythe
        line(x0 - ux * len * 0.35, y0 - uy * len * 0.35, x1, y1, WOOD.s, 2); line(x0 - ux * len * 0.35, y0 - uy * len * 0.35, x1, y1, WOOD.b, 1);
        if (t === 'spear') { line(x1, y1, x1 + ux * 6, y1 + uy * 6, STEEL.b, 2); line(x1 + ux * 2, y1 + uy * 2, x1 + ux * 7, y1 + uy * 7, STEEL.l, 1); line(x1 - px * 2, y1 - py * 2, x1 + px * 2, y1 + py * 2, STEEL.s, 1); }
        else for (let k = 0; k <= 16; k++) { const bx = x1 + px * k - ux * k * k * 0.035, by = y1 + py * k - uy * k * k * 0.035, wk = k < 11 ? 3 : k < 14 ? 2 : 1; R(bx - 1, by - 1, wk, wk, k < 3 ? STEEL.s : STEEL.b); if (k > 2 && k < 12) R(bx, by, 1, 1, STEEL.l); }
      }
      if (!tip) tip = [x1, y1];
    }
    if (fh) hand(fh, true, armed);
    if (o.shield && p.shieldFront) shield(tx + 8, ty + 4);

    // ---- outline and place on the screen
    finish(o.flash > 0);
    const ly = p.lying || 0, f = o.facing || 1, sm = ctx.imageSmoothingEnabled;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.translate(Math.round(o.x), Math.round(o.y)); ctx.scale(f, 1);
    if (p.spin) { ctx.translate(0, -34); ctx.rotate(p.spin); ctx.translate(0, 34); }
    if (ly) { ctx.translate(-30 * ly, -12 * Math.abs(ly)); ctx.rotate(Math.PI / 2 * ly); }
    ctx.drawImage(buf, -OX * PX, -BASE * PX, BW * PX, BH * PX);
    ctx.restore(); ctx.imageSmoothingEnabled = sm;

    // joints in world space, for blood, stumps and the sword trail
    const flat = Math.abs(ly) > 0.5;
    const W = (x, y) => (flat ? [o.x + f * (-(y - 40) * PX * Math.sign(ly) - 30 * ly), o.y - 14] : [o.x + f * x * PX, o.y + (y - 40) * PX]);
    o.out = { sh: W(shF, shY), hip: W(tx, legTop + u), head: W(fx, fy), tip: tip && W(tip[0], tip[1]) };
  }

  G.drawRig = G.drawHumanoid;
  G.drawHumanoid = chibi;
  G.drawChibi = chibi;

  // ---- severed parts, as small pixel pieces
  G.drawGib = (ctx, g) => {
    const L = g.look, q = Math.round(g.rot / (Math.PI / 4)) * (Math.PI / 4), sm = ctx.imageSmoothingEnabled;
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); };
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(g.x), Math.round(g.y)); ctx.rotate(g.kind === 'head' ? Math.round(g.rot / (Math.PI / 2)) * (Math.PI / 2) : q);
    if (g.kind === 'head') {
      const hc = L.helm === 'none' ? null : (L.helmCol || '#444444');
      R(-4, -6, 9, 12, '#1a101e'); R(-5, -4, 11, 8, '#1a101e');
      R(-3, -5, 7, 10, L.skin); R(-4, -3, 9, 6, L.skin); R(-4, -1, 1, 4, G.shade(L.skin, 0.66));
      if (hc) { R(-3, -5, 7, 4, hc); R(-4, -3, 9, 2, hc); R(-4, -3, 2, 2, G.shade(hc, 0.66)); if (L.helm === 'helm' || L.helm === 'sack') { R(-3, -1, 7, 5, hc); R(-1, 0, 5, 1, '#0a0808'); } }
      else { R(-2, 0, 2, 2, '#2a0a0e'); R(2, 0, 2, 2, '#2a0a0e'); }
      R(-2, 5, 5, 2, '#7a0509'); R(0, 6, 1, 1, '#d9c9b0');
    } else if (g.kind === 'weapon') {
      const len = Math.round((g.wlen || 36) / 2);
      R(-1, -len / 2 - 1, 3, len + 2, '#1a101e'); R(0, -len / 2, 1, len, g.wtype === 'club' || g.wtype === 'spear' || g.wtype === 'scythe' ? WOOD.b : STEEL.b);
      if (g.wtype === 'sword' || g.wtype === 'greatsword') { R(-2, len / 2 - 4, 5, 1, '#c9a13b'); R(0, len / 2 - 3, 1, 3, WOOD.s); }
      else if (g.wtype === 'cleaver') { R(1, -len / 2, 4, len / 2, STEEL.b); R(0, 0, 1, len / 2, WOOD.b); }
      else if (g.wtype === 'scythe') { R(1, -len / 2, 7, 2, STEEL.b); R(7, -len / 2 + 2, 2, 3, STEEL.s); }
      else if (g.wtype === 'spear') R(-1, -len / 2 - 3, 3, 4, STEEL.b);
    } else {
      const arm = g.kind === 'arm', len = arm ? 9 : 12, c = arm ? L.arm : L.leg;
      R(-2, -len / 2 - 1, 5, len + 2, '#1a101e'); R(-1, -len / 2, 3, len, c); R(-1, -len / 2, 1, len, G.shade(c, 0.66));
      R(-1, -len / 2, 3, 2, '#7a0509'); R(0, -len / 2, 1, 1, '#d9c9b0');
      if (arm) R(-1, len / 2 - 2, 3, 2, L.skin); else R(-1, len / 2 - 2, 4, 2, BOOT);
    }
    ctx.restore(); ctx.imageSmoothingEnabled = sm;
  };
})();
