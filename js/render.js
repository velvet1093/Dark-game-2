'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — rendering: procedural figures, weapons, gore and backdrops
// ---------------------------------------------------------------------------

G.drawWeapon = (ctx, x, y, w, type, len, bloody = 0, C = c => c) => {
  if (!type || type === 'none') return;
  const sx = Math.sin(w), cy = Math.cos(w), tx = x + sx * len, ty = y + cy * len;
  const line = (x1, y1, x2, y2, lw, col) => { ctx.strokeStyle = C(col); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  if (type === 'sword' || type === 'greatsword') {
    const bw = type === 'sword' ? 3 : 5.5, g = type === 'sword' ? 5 : 8;
    line(x - sx * 5, y - cy * 5, x + sx * 3, y + cy * 3, 3, '#2a1c14');
    line(x + sx * 3, y + cy * 3, tx, ty, bw, type === 'sword' ? '#b9bcc4' : '#8d8f98');
    if (bloody > 0.05) { ctx.globalAlpha *= Math.min(1, bloody); line(x + sx * len * 0.35, y + cy * len * 0.35, tx, ty, bw, '#8f0810'); ctx.globalAlpha /= Math.min(1, bloody); }
    line(x + sx * 3 - cy * g, y + cy * 3 + sx * g, x + sx * 3 + cy * g, y + cy * 3 - sx * g, 3, '#5c5148');
  } else if (type === 'cleaver') {
    line(x, y, x + sx * len * 0.55, y + cy * len * 0.55, 4, '#3a2a1e');
    ctx.fillStyle = C('#77777c'); ctx.beginPath();
    const bx = x + sx * len * 0.5, by = y + cy * len * 0.5;
    ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.lineTo(tx + cy * 16, ty - sx * 16); ctx.lineTo(bx + cy * 13, by - sx * 13); ctx.fill();
    line(tx + cy * 16, ty - sx * 16, bx + cy * 13, by - sx * 13, 2, '#7a0a10');
  } else if (type === 'spear' || type === 'scythe') {
    line(x - sx * len * 0.35, y - cy * len * 0.35, tx, ty, 3, '#3a2a1e');
    ctx.fillStyle = C('#a9acb4'); ctx.beginPath();
    if (type === 'spear') { ctx.moveTo(tx + cy * 3.5, ty - sx * 3.5); ctx.lineTo(tx + sx * 15, ty + cy * 15); ctx.lineTo(tx - cy * 3.5, ty + sx * 3.5); }
    else { ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + cy * 16 + sx * 10, ty - sx * 16 + cy * 10, tx + cy * 34 - sx * 8, ty - sx * 34 - cy * 8); ctx.quadraticCurveTo(tx + cy * 14 + sx * 2, ty - sx * 14 + cy * 2, tx - sx * 5, ty - cy * 5); }
    ctx.fill();
  } else if (type === 'club') {
    line(x, y, tx, ty, 4, '#3a2a1e');
    for (let i = 0; i < 3; i++) line(tx, ty, tx + sx * 6 + cy * (i - 1) * 9, ty + cy * 6 - sx * (i - 1) * 9 + 8, 1.5, '#1a1212');
  }
};

// Darken (f < 1) or lighten a #rgb / #rrggbb colour.
G.shade = (hex, f) => {
  let h = hex.slice(1); if (h.length === 3) h = h.replace(/./g, c => c + c);
  const n = parseInt(h, 16), ch = s => Math.max(0, Math.min(255, Math.round((n >> s & 255) * f)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

// Draws a jointed humanoid. Local space: feet at (0,0), facing +x, y up is negative.
// o: {x,y,facing,scale,pose,look,limbs,weapon,wlen,shield,flash,bloody,alpha}
G.drawHumanoid = (ctx, o) => {
  const p = o.pose, L = o.look, lm = o.limbs || {}, fl = o.flash > 0;
  const C = c => (fl ? '#ffd9d0' : c);
  const gone = k => lm[k] && lm[k].gone;
  ctx.save();
  ctx.translate(o.x, o.y); ctx.scale(o.facing * o.scale, o.scale);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (p.spin) { ctx.translate(0, -20); ctx.rotate(p.spin); ctx.translate(0, 20); }
  if (p.lying) { ctx.translate(-28 * p.lying, -6 * Math.abs(p.lying)); ctx.rotate(Math.PI / 2 * p.lying); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cr = p.crouch || 0, hx = 0, hy = -34 + cr, ln = p.lean || 0;
  const sx = hx + Math.sin(ln) * 28, sy = hy - Math.cos(ln) * 28;
  const ha = ln + (p.head || 0), hdx = sx + Math.sin(ha) * 12, hdy = sy - Math.cos(ha) * 12;
  const seg = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = C(col); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  const stump = (x, y) => { ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = '#d9c9b0'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); };
  const leg = (fx, lift, isGone) => {
    if (isGone) { stump(hx + (fx > 0 ? 2 : -2), hy + 4); return; }
    let dx = fx - hx, dy = -lift - hy, d = Math.hypot(dx, dy);
    if (d > 33.5) { dx *= 33.5 / d; dy *= 33.5 / d; d = 33.5; }
    const h = Math.sqrt(Math.max(0, 289 - d * d / 4)), kx = hx + dx / 2 + dy / d * h, ky = hy + dy / 2 - dx / d * h;
    seg(hx, hy, kx, ky, 7.5, L.leg); seg(kx, ky, hx + dx, hy + dy, 6.5, L.leg);
    seg(hx + dx, hy + dy, hx + dx + 5, hy + dy, 5, '#151213');
  };
  // A hand at the end of a forearm pointing along `ang`. grip: closed round a hilt or strap.
  const feral = !!L.eye && L.helm !== 'veil' && L.helm !== 'beak';
  const hand = (x, y, ang, grip) => {
    const ux = Math.sin(ang), uy = Math.cos(ang), px = uy, py = -ux, skin = C(L.skin), dark = C(G.shade(L.skin, 0.62));
    const claw = feral && !grip, len = claw ? 5.2 : 3.4;
    ctx.lineCap = 'round';
    if (grip) {
      ctx.fillStyle = skin; ctx.strokeStyle = dark; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.ellipse(x, y, 3.3, 2.9, Math.atan2(uy, ux), 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 0.55; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + ux * i * 1.5 - px * 2.2, y + uy * i * 1.5 - py * 2.2); ctx.lineTo(x + ux * i * 1.5 + px * 0.6, y + uy * i * 1.5 + py * 0.6); ctx.stroke(); }
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(x - ux * 1.6 + px * 1.7, y - uy * 1.6 + py * 1.7, 1.9, 1.1, Math.atan2(uy, ux) + 0.5, 0, 7); ctx.fill(); ctx.stroke();
      return;
    }
    // fingers first, then the palm over their roots, then the thumb
    for (let i = 0; i < 4; i++) {
      const k = (i - 1.5) * (claw ? 0.34 : 0.2), fx = Math.sin(ang + k), fy = Math.cos(ang + k), bx = x + ux * 1.6 + px * (i - 1.5) * 1.15, by = y + uy * 1.6 + py * (i - 1.5) * 1.15, l = len - Math.abs(i - 1.5) * 0.5;
      ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + fx * l, by + fy * l); ctx.stroke();
      ctx.strokeStyle = skin; ctx.lineWidth = 1.0; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + fx * l, by + fy * l); ctx.stroke();
      if (claw) { ctx.strokeStyle = C('#2a1a1a'); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(bx + fx * (l - 1.2), by + fy * (l - 1.2)); ctx.lineTo(bx + fx * (l + 0.8), by + fy * (l + 0.8)); ctx.stroke(); }
    }
    ctx.fillStyle = skin; ctx.strokeStyle = dark; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.ellipse(x + ux * 0.4, y + uy * 0.4, 3.0, 2.5, Math.atan2(uy, ux), 0, 7); ctx.fill(); ctx.stroke();
    const tx = Math.sin(ang + 1.0), ty = Math.cos(ang + 1.0);
    ctx.strokeStyle = dark; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(x + px * 1.6, y + py * 1.6); ctx.lineTo(x + px * 1.6 + tx * 2.6, y + py * 1.6 + ty * 2.6); ctx.stroke();
    ctx.strokeStyle = skin; ctx.lineWidth = 1.15; ctx.beginPath(); ctx.moveTo(x + px * 1.6, y + py * 1.6); ctx.lineTo(x + px * 1.6 + tx * 2.6, y + py * 1.6 + ty * 2.6); ctx.stroke();
  };
  const arm = (a, e, isGone, grip, defer) => {
    if (isGone) { stump(sx, sy + 2); return null; }
    const ex = sx + Math.sin(a) * 13, ey = sy + Math.cos(a) * 13;
    const ax = ex + Math.sin(a + e) * 13, ay = ey + Math.cos(a + e) * 13;
    seg(sx, sy, ex, ey, 6.5, L.arm); seg(ex, ey, ax, ay, 5.5, L.arm);
    if (L.cuff) { ctx.fillStyle = C('#ece6de'); ctx.beginPath(); ctx.arc(ex + (ax - ex) * 0.78, ey + (ay - ey) * 0.78, 3.8, 0, 7); ctx.fill(); }
    if (!defer) hand(ax, ay, a + e, grip);
    return [ax, ay, a + e];
  };
  const shield = h => {
    if (!h) return;
    ctx.fillStyle = C('#3d4150'); ctx.strokeStyle = C('#888c96'); ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(h[0] - 3, h[1] - 14); ctx.lineTo(h[0] + 6, h[1] - 14); ctx.lineTo(h[0] + 6, h[1] + 6); ctx.lineTo(h[0] + 1.5, h[1] + 15); ctx.lineTo(h[0] - 3, h[1] + 6);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C('#8a6a2a'); ctx.beginPath(); ctx.arc(h[0] + 1.5, h[1] - 3, 2.6, 0, 7); ctx.fill();
  };

  // back arm (+shield), back leg, cape
  const bh = arm(p.bA, p.bE, gone('armB'), !!o.shield);
  if (o.shield && !p.shieldFront) shield(bh);
  leg(p.footB, p.liftB || 0, gone('legB'));
  if (L.cape) {
    const sway = Math.sin((o.time || 0) * 3 + o.x * 0.02) * 3 - (o.vx || 0) * o.facing * 0.04;
    ctx.fillStyle = C(L.cape); ctx.beginPath();
    ctx.moveTo(sx - 2, sy - 2); ctx.lineTo(sx - 12 + sway, sy + 22); ctx.lineTo(sx - 16 + sway * 1.6, hy + 20);
    ctx.lineTo(sx - 9 + sway, hy + 16); ctx.lineTo(sx - 6 + sway, hy + 22); ctx.lineTo(hx - 2, hy + 2); ctx.closePath(); ctx.fill();
  }
  leg(p.footF, p.liftF || 0, gone('legF'));
  if (L.hair) {   // long hair down the back
    ctx.fillStyle = C(L.hair); ctx.beginPath(); ctx.moveTo(hdx - 2, hdy - 6); ctx.quadraticCurveTo(sx - 13, sy + 6, hx - 9, hy - 2); ctx.lineTo(hx - 3, hy - 6); ctx.lineTo(sx - 2, sy); ctx.closePath(); ctx.fill();
  }
  // torso
  seg(hx, hy, sx, sy + 3, 14, L.body);
  if (L.trim) seg(hx + 1, hy + 4, sx + 1, sy + 6, 6, L.trim);
  if (L.belly) { ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.arc((hx + sx) / 2 + 6, (hy + sy) / 2 + 5, 14, 0, 7); ctx.fill(); ctx.strokeStyle = C('#7a2a2a'); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc((hx + sx) / 2 + 8, (hy + sy) / 2 + 5, 9, -0.6, 1.2); ctx.stroke(); }
  seg(hx - 4, hy, hx + 4, hy, 4, '#1a1414');
  if (L.skirt === 'long') {   // full-length habit, white scapular with a lily, rope belt
    ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.moveTo(hx - 7, hy - 4); ctx.lineTo(hx + 7, hy - 4); ctx.lineTo(hx + 12, -3); ctx.lineTo(hx - 11, -3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C('#ece6de'); ctx.beginPath(); ctx.moveTo(sx - 3, sy + 3); ctx.lineTo(sx + 5, sy + 3); ctx.lineTo(hx + 6, -9); ctx.lineTo(hx - 2, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C('#8a5fd0'); for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; ctx.beginPath(); ctx.ellipse((hx + sx) / 2 + 2 + Math.cos(a) * 2.2, (hy + sy) / 2 + Math.sin(a) * 2.2, 2, 1.1, a, 0, 7); ctx.fill(); }
    seg(hx - 7, hy - 3, hx + 7, hy - 3, 2, '#b79b6a'); seg(hx + 5, hy - 3, hx + 7, hy + 12, 1.6, '#b79b6a');
  } else if (L.skirt === 'armor') {   // battle sister: breastplate, tassets and a red sash over a knee-length habit
    ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.moveTo(hx - 7, hy - 4); ctx.lineTo(hx + 7, hy - 4); ctx.lineTo(hx + 11, hy + 20); ctx.lineTo(hx + 2, hy + 20); ctx.lineTo(hx, hy + 6); ctx.lineTo(hx - 2, hy + 20); ctx.lineTo(hx - 10, hy + 20); ctx.closePath(); ctx.fill();
    seg(hx - 9, hy + 20, hx - 3, hy + 20, 1.6, '#8a1a20'); seg(hx + 3, hy + 20, hx + 10, hy + 20, 1.6, '#8a1a20');
    seg(hx + 1, hy - 5, sx + 1, sy + 6, 13, '#8a8e98'); seg(hx + 3, hy - 6, sx + 3, sy + 8, 3, '#b4b8c2');
    ctx.fillStyle = C('#74787f'); ctx.beginPath(); ctx.moveTo(hx - 8, hy - 2); ctx.lineTo(hx - 1, hy - 2); ctx.lineTo(hx - 3, hy + 10); ctx.lineTo(hx - 10, hy + 8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 1, hy - 2); ctx.lineTo(hx + 8, hy - 2); ctx.lineTo(hx + 10, hy + 8); ctx.lineTo(hx + 3, hy + 10); ctx.closePath(); ctx.fill();
    seg(hx - 7, hy - 3, hx + 7, hy - 3, 3, '#8a1a20'); seg(hx - 5, hy - 2, hx - 8, hy + 13, 2.4, '#8a1a20');
    seg(sx - 4, sy + 4, sx + 5, sy + 4, 3, '#ece6de');
    ctx.fillStyle = C('#9a9ea8'); ctx.beginPath(); ctx.arc(sx - 1, sy + 3, 6.5, Math.PI, 0); ctx.fill();
  } else if (L.skirt) {   // black dress with a white frilled hem and collar
    ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.moveTo(hx - 7, hy - 4); ctx.lineTo(hx + 7, hy - 4); ctx.lineTo(hx + 12, hy + 15); ctx.lineTo(hx - 11, hy + 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C('#ece6de'); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(hx - 9.5 + i * 4.1, hy + 15, 2.3, 0, 7); ctx.fill(); }
    seg(sx - 5, sy + 4, sx + 5, sy + 4, 3.5, '#ece6de');
  }
  // head
  if (gone('head')) stump(sx + Math.sin(ha) * 4, sy - Math.cos(ha) * 4);
  else {
    ctx.fillStyle = C(L.skin); ctx.beginPath(); ctx.arc(hdx, hdy, 8, 0, 7); ctx.fill();
    const hc = C(L.helmCol || '#444');
    if (L.helm === 'helm') {
      ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(hdx, hdy, 9, 0, 7); ctx.fill();
      ctx.fillRect(hdx - 7, hdy + 2, 14, 8);
      seg(hdx + 1, hdy - 1, hdx + 9, hdy - 1, 2, '#0a0808');
      if (L.plume) { ctx.strokeStyle = C(L.plume); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hdx, hdy - 9); ctx.quadraticCurveTo(hdx - 10, hdy - 18, hdx - 15, hdy - 4); ctx.stroke(); }
    } else if (L.helm === 'hood' || L.helm === 'veil') {
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hdx + 7, hdy - 6); ctx.quadraticCurveTo(hdx, hdy - 15, hdx - 9, hdy - 6);
      ctx.lineTo(hdx - (L.helm === 'veil' ? 13 : 9), hdy + (L.helm === 'veil' ? 24 : 10)); ctx.lineTo(hdx - 2, hdy + 6); ctx.lineTo(hdx + 1, hdy - 5); ctx.closePath(); ctx.fill();
    } else if (L.helm === 'sister') {
      // fringe, black veil, white frilled band with a lily at the temple
      ctx.fillStyle = C(L.hair || '#333'); ctx.beginPath(); ctx.arc(hdx, hdy - 1, 8.4, Math.PI * 0.95, Math.PI * 1.95); ctx.lineTo(hdx + 5, hdy - 3); ctx.lineTo(hdx - 2, hdy - 3); ctx.fill();
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hdx + 5, hdy - 8); ctx.quadraticCurveTo(hdx - 2, hdy - 16, hdx - 10, hdy - 6);
      ctx.lineTo(hdx - 14, hdy + 15); ctx.lineTo(hdx - 6, hdy + 10); ctx.lineTo(hdx - 5, hdy - 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C('#ece6de'); for (let i = 0; i < 5; i++) { const a = Math.PI * (1.12 + i * 0.17); ctx.beginPath(); ctx.arc(hdx + Math.cos(a) * 9, hdy - 1 + Math.sin(a) * 9, 2.3, 0, 7); ctx.fill(); }
      for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; ctx.beginPath(); ctx.ellipse(hdx - 6 + Math.cos(a) * 2.6, hdy - 8 + Math.sin(a) * 2.6, 2.4, 1.3, a, 0, 7); ctx.fill(); }
    } else if (L.helm === 'wimple') {
      // white wimple framing the face under a long black veil
      ctx.fillStyle = C('#ece6de'); ctx.beginPath(); ctx.arc(hdx - 1, hdy + 1, 9.6, 0, 7); ctx.fill(); ctx.fillRect(hdx - 7, hdy + 5, 12, 8);
      ctx.fillStyle = C(L.skin); ctx.beginPath(); ctx.arc(hdx + 2, hdy + 0.5, 6.2, 0, 7); ctx.fill();
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hdx + 7, hdy - 7); ctx.quadraticCurveTo(hdx - 1, hdy - 17, hdx - 11, hdy - 6);
      ctx.quadraticCurveTo(hdx - 17, hdy + 16, hdx - 13, hdy + 36); ctx.lineTo(hdx - 5, hdy + 30); ctx.lineTo(hdx - 6, hdy - 3); ctx.lineTo(hdx + 3, hdy - 6); ctx.closePath(); ctx.fill();
    } else if (L.helm === 'coif') {
      // short white coif and cropped veil, steel circlet, a braid over the shoulder
      ctx.fillStyle = C(L.hair || '#333'); ctx.beginPath(); ctx.arc(hdx, hdy - 1, 8.4, Math.PI * 0.95, Math.PI * 1.95); ctx.lineTo(hdx + 5, hdy - 3); ctx.lineTo(hdx - 2, hdy - 3); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(hdx - 5 + i * 0.9, hdy + 5 + i * 3.6, 2.5 - i * 0.2, 0, 7); ctx.fill(); }
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hdx + 3, hdy - 9); ctx.quadraticCurveTo(hdx - 3, hdy - 15, hdx - 10, hdy - 6); ctx.lineTo(hdx - 11, hdy + 7); ctx.lineTo(hdx - 6, hdy + 3); ctx.lineTo(hdx - 4, hdy - 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C('#ece6de'); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(hdx, hdy - 1, 8.6, Math.PI * 1.08, Math.PI * 1.8); ctx.stroke();
      ctx.strokeStyle = C('#9a9ea8'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(hdx, hdy - 1, 8.8, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    } else if (L.helm === 'sack') {
      ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(hdx, hdy, 9.5, 0, 7); ctx.fill(); ctx.fillRect(hdx - 8, hdy + 3, 16, 9);
    } else if (L.helm === 'beak') {
      ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(hdx, hdy, 9, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hdx + 5, hdy - 3); ctx.lineTo(hdx + 24, hdy + 5); ctx.lineTo(hdx + 5, hdy + 5); ctx.fill();
      ctx.fillRect(hdx - 13, hdy - 10, 26, 3); ctx.fillRect(hdx - 7, hdy - 17, 14, 8);
    }
    const covered = L.helm === 'helm' || L.helm === 'sack' || L.helm === 'beak';
    if (!covered) {
      // ---- face: brows, two eyes, nose, mouth. The infected get sunken glowing eyes, a snarl and red tears.
      const fx = hdx + (L.helm === 'wimple' ? 1 : 0), fy = hdy, skin = C(L.skin), dark = C(G.shade(L.skin, 0.6));
      const dot = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
      const ln2 = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
      if (L.helm === 'none') {
        ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(fx - 3.6, fy + 0.6, 1.5, 2.3, 0, 0, 7); ctx.fill();
        if (L.hair) { ctx.fillStyle = C(L.hair); ctx.beginPath(); ctx.arc(fx, fy - 0.5, 8.5, Math.PI * 0.85, Math.PI * 1.9); ctx.lineTo(fx + 3, fy - 4); ctx.lineTo(fx - 5, fy - 2); ctx.fill(); }
        else if (feral) for (let i = 0; i < 4; i++) ln2(fx - 5 + i * 2.6, fy - 7.4, fx - 6.5 + i * 2.6, fy - 10 - (i % 2) * 1.5, 0.8, C('#2a2222'));
      }
      // nose: only the infected get a hard profile; people keep a soft, sprite-like face
      if (feral) { ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(fx + 7.2, fy - 0.2); ctx.lineTo(fx + 9.5, fy + 2.0); ctx.lineTo(fx + 7.2, fy + 2.8); ctx.fill();
      ln2(fx + 7.4, fy + 2.7, fx + 9.2, fy + 2.1, 0.6, dark); }
      if (L.beard) { ctx.fillStyle = C(L.beard); ctx.beginPath(); ctx.arc(fx + 1, fy + 1.5, 7.6, 0.15, Math.PI * 0.95); ctx.lineTo(fx + 3, fy + 3.2); ctx.fill(); }
      if (feral) {
        ctx.fillStyle = C('rgba(24,2,4,0.6)'); ctx.beginPath(); ctx.ellipse(fx + 4.4, fy - 1, 2.7, 2.1, 0, 0, 7); ctx.ellipse(fx + 7.3, fy - 1, 1.2, 1.7, 0, 0, 7); ctx.fill();
        ln2(fx + 1.8, fy - 4.2, fx + 6.6, fy - 2.6, 1.0, C('#1a1010'));
        if (!fl) { ctx.shadowColor = L.eye; ctx.shadowBlur = 8; dot(fx + 4.6, fy - 1, 1.35, L.eye); dot(fx + 7.3, fy - 1, 0.8, L.eye); ctx.shadowBlur = 0; }
        ln2(fx + 4.3, fy + 0.6, fx + 3.8, fy + 6, 0.9, C('#a00a12'));
        ctx.fillStyle = C('#1a0508'); ctx.beginPath(); ctx.ellipse(fx + 5.6, fy + 4.5, 2.3, 1.7, -0.1, 0, 7); ctx.fill();
        ctx.fillStyle = C('#d9cdb8'); for (let i = 0; i < 3; i++) ctx.fillRect(fx + 4.1 + i * 1.1, fy + 3.1, 0.7, 1.1);
      } else {
        // people: a simple sprite-style face. Two dark eyes with a glint, a hint of blush, no hard nose or lips.
        const eye = C(G.shade(L.iris || (L.helm === 'veil' ? L.eye : null) || '#3a2a22', L.iris ? 0.62 : 0.8));
        if (L.soft) { ctx.fillStyle = C('rgba(224,120,128,0.3)'); ctx.beginPath(); ctx.ellipse(fx + 5.4, fy + 2.3, 1.7, 0.9, 0, 0, 7); ctx.fill(); }
        ctx.fillStyle = eye;
        if (o.pixel) { ctx.fillRect(fx + 2.6, fy - 2.4, 2.2, 4.4); ctx.fillRect(fx + 6.2, fy - 2.4, 1.8, 4.4); }   // eyes that survive the downscale
        else {
          ctx.beginPath(); ctx.ellipse(fx + 4.2, fy - 0.2, 0.95, L.soft ? 1.6 : 1.3, 0, 0, 7); ctx.ellipse(fx + 7.0, fy - 0.2, 0.7, L.soft ? 1.4 : 1.15, 0, 0, 7); ctx.fill();
          dot(fx + 4.45, fy - 0.9, 0.38, C('#ffffff')); dot(fx + 7.15, fy - 0.85, 0.28, C('#ffffff'));
        }
        if (!L.soft) { ln2(fx + 3, fy - 2.6, fx + 5.3, fy - 2.5, 0.7, C(L.beard || '#3a2a22')); ln2(fx + 4.9, fy + 4.2, fx + 6.4, fy + 4.2, 0.6, dark); }
      }
      if (L.helm === 'veil') { ln2(fx + 4.3, fy + 0.4, fx + 3.9, fy + 8, 1.0, C('#a00a12')); ln2(fx + 7.2, fy + 0.4, fx + 7, fy + 6, 0.8, C('#a00a12')); }
    }
    if (covered && L.eye && !fl) {
      ctx.fillStyle = L.eye; ctx.shadowColor = L.eye; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(hdx + 4.5, hdy - 1, 1.6, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      if (o.weeping) { ctx.strokeStyle = '#a00a12'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hdx + 4.5, hdy); ctx.lineTo(hdx + 4, hdy + 9); ctx.stroke(); }
    }
  }
  // weapon arm
  const armed = !!o.weapon && o.weapon !== 'none', fh = arm(p.armA, p.armE, gone('armF'), armed, true);
  let tip = null;
  if (fh && o.weapon && o.weapon !== 'none') {
    G.drawWeapon(ctx, fh[0], fh[1], p.w, o.weapon, o.wlen, o.bloody, C);
    tip = [fh[0] + Math.sin(p.w) * o.wlen, fh[1] + Math.cos(p.w) * o.wlen];
  }
  if (fh) hand(fh[0], fh[1], fh[2], armed);
  if (o.shield && p.shieldFront) shield([sx + 14, sy + 12]);
  ctx.restore();
  const lying = Math.abs(p.lying || 0) > 0.5;
  const W = pt => (lying ? [o.x + o.facing * o.scale * (-pt[1] * Math.sign(p.lying) - 28 * p.lying), o.y - 8 * o.scale]
    : [o.x + o.facing * o.scale * pt[0], o.y + o.scale * pt[1]]);
  o.out = { sh: W([sx, sy]), hip: W([hx, hy]), head: W([hdx, hdy]), tip: tip && W(tip) };
};

// Pixel-art variant: draws the same rig into a small buffer at 1/px size, snaps every
// pixel to solid or empty, adds a one-pixel dark outline, then scales it up unsmoothed.
let pixBuf = null;
G.drawPixelHumanoid = (ctx, o, px = 2) => {
  const BW = 112, BH = 80, OX = 48, OY = 72;
  if (!pixBuf) { pixBuf = document.createElement('canvas'); pixBuf.width = BW; pixBuf.height = BH; }
  const b = pixBuf.getContext('2d', { willReadFrequently: true });
  b.clearRect(0, 0, BW, BH);
  G.drawHumanoid(b, Object.assign({}, o, { x: OX, y: OY, scale: o.scale / px, facing: 1, pixel: true }));
  const img = b.getImageData(0, 0, BW, BH), d = img.data, solid = new Uint8Array(BW * BH);
  for (let i = 0; i < BW * BH; i++) { const on = d[i * 4 + 3] > 110; solid[i] = on ? 1 : 0; d[i * 4 + 3] = on ? 255 : 0; }
  for (let y = 1; y < BH - 1; y++) for (let x = 1; x < BW - 1; x++) {
    const i = y * BW + x;
    if (!solid[i] && (solid[i - 1] || solid[i + 1] || solid[i - BW] || solid[i + BW])) { d[i * 4] = 12; d[i * 4 + 1] = 7; d[i * 4 + 2] = 10; d[i * 4 + 3] = 255; }
  }
  b.putImageData(img, 0, 0);
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.save(); ctx.translate(Math.round(o.x), Math.round(o.y)); ctx.scale(o.facing, 1);
  ctx.drawImage(pixBuf, -OX * px, -OY * px, BW * px, BH * px);
  ctx.restore(); ctx.imageSmoothingEnabled = sm;
};

// Apply a swing animation to a pose. ph: 0 wind-up, 1 active, 2 recovery; u: 0..1
G.swing = (P, an, ph, u) => {
  const base = { a: P.armA, e: P.armE, w: P.w, lean: P.lean }, e = G.ease(u), L = G.lerp;
  const set = (f, t, k) => { P.armA = L(f.a, t.a, k); P.armE = L(f.e, t.e, k); P.w = L(f.w, t.w, k); P.lean = L(f.lean, t.lean, k); };
  const at = i => ({ a: an.a[i], e: an.e[i], w: an.w[i], lean: an.lean[i] });
  if (ph === 0) set(base, at(0), e); else if (ph === 1) set(at(0), at(1), u); else set(at(1), base, e);
};

G.drawGib = (ctx, g) => {
  ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot); ctx.scale(g.scale, g.scale); ctx.lineCap = 'round';
  const L = g.look;
  if (g.kind === 'head') {
    ctx.fillStyle = L.skin; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
    if (L.helm !== 'none') { ctx.fillStyle = L.helmCol || '#444'; ctx.beginPath(); ctx.arc(0, -1, 9, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); }
    ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.arc(0, 7, 4, 0, 7); ctx.fill();
  } else if (g.kind === 'weapon') {
    G.drawWeapon(ctx, 0, 0, 0, g.wtype, g.wlen);
  } else {
    const len = g.kind === 'arm' ? 24 : 32;
    ctx.strokeStyle = g.kind === 'arm' ? L.arm : L.leg; ctx.lineWidth = g.kind === 'arm' ? 6 : 7;
    ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(2, 0); ctx.lineTo(0, len / 2); ctx.stroke();
    ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.arc(0, -len / 2, 4, 0, 7); ctx.fill();
  }
  ctx.restore();
};

G.drawFx = (ctx, layer) => {
  const f = G.fx;
  if (layer === 'ground') {
    for (const d of f.decals) {
      ctx.fillStyle = 'rgba(92,4,8,0.78)'; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * 0.28, 0, 0, 7); ctx.fill();
    }
    for (const g of f.gibs) G.drawGib(ctx, g);
    return;
  }
  for (const p of f.drops) { const s = p.r > 2.2 ? 4 : 2; ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, s, s); }
  ctx.fillStyle = '#ffd98a';
  for (const s of f.sparks) ctx.fillRect(s.x, s.y, 2, 2);
  ctx.textAlign = 'center';
  for (const t of f.texts) {
    ctx.globalAlpha = G.clamp(1.3 - t.t, 0, 1); ctx.font = `${Math.round(t.size * 1.35)}px "Jersey 15", "VT323", monospace`;
    ctx.fillStyle = '#000'; ctx.fillText(t.s, t.x + 1, t.y + 1); ctx.fillStyle = t.color; ctx.fillText(t.s, t.x, t.y);
  }
  ctx.globalAlpha = 1;
};

// ------------------------------ backdrops ----------------------------------
const THEMES = {
  road: { sky: ['#07050a', '#1a0a10', '#3a0f14'], moon: true, mid: ['tree', 'tree', 'gallows', 'tree', 'tree'], near: ['cross', 'stake', 'fence', 'grave', 'cross'], ground: '#0e090a', edge: '#241517', weather: 'rain' },
  village: { sky: ['#08060a', '#1c0b0c', '#47160f'], moon: true, mid: ['house', 'house', 'tree', 'house', 'chapel'], near: ['fence', 'stake', 'cart', 'grave', 'fence'], ground: '#0f0a09', edge: '#2a1a14', weather: 'ash' },
  town: { sky: ['#08070c', '#17101a', '#3a1c1a'], moon: true, mid: ['house', 'house', 'wall', 'house', 'chapel', 'wall'], near: ['lamp', 'stall', 'fence', 'lamp', 'cart', 'lamp'], ground: '#12100f', edge: '#2e2420', weather: 'ash' },
  fen: { sky: ['#040706', '#0b1512', '#1b2c24'], moon: true, mid: ['tree', 'tree', 'tree', 'gallows', 'tree'], near: ['reeds', 'stake', 'reeds', 'grave', 'reeds', 'reeds'], ground: '#080d0b', edge: '#1d2c22', weather: 'rain', water: true },
  cathedral: { sky: ['#060406', '#0b0709', '#12090b'], mid: ['window', 'pillar'], near: ['pew', 'candles', 'pew', 'candles'], ground: '#0c090b', edge: '#2a2226', weather: 'ash', indoor: true },
};

G.buildProps = level => {
  const r = G.rng(level.seed), T = THEMES[level.theme];
  level._mid = []; level._near = []; level._theme = T;
  if (T.indoor) for (let x = 60, i = 0; x < level.length * 0.6 + G.W; x += 170, i++) level._mid.push({ x, k: T.mid[i % 2], s: 1, seed: i });
  else for (let x = 40; x < level.length * 0.5 + G.W; x += 150 + r() * 230) level._mid.push({ x, k: T.mid[r() * T.mid.length | 0], s: 0.8 + r() * 0.6, seed: r() * 1e9 | 0 });
  for (let x = 260; x < level.length; x += 190 + r() * 300) level._near.push({ x, k: T.near[r() * T.near.length | 0], s: 0.85 + r() * 0.4, seed: r() * 1e9 | 0 });
};

const PROPS = {
  tree(c, x, y, s, seed) {
    const r = G.rng(seed);
    const br = (x1, y1, a, len, w, d) => {
      const x2 = x1 + Math.sin(a) * len, y2 = y1 - Math.cos(a) * len;
      c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      if (d > 0) { br(x2, y2, a - 0.3 - r() * 0.5, len * 0.68, w * 0.6, d - 1); br(x2, y2, a + 0.3 + r() * 0.5, len * 0.68, w * 0.6, d - 1); }
    };
    br(x, y, (r() - 0.5) * 0.3, 90 * s, 12 * s, 4);
  },
  gallows(c, x, y, s, seed, t) {
    c.lineWidth = 8; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 190 * s); c.lineTo(x + 90 * s, y - 190 * s); c.moveTo(x, y - 150 * s); c.lineTo(x + 34 * s, y - 190 * s); c.stroke();
    const sw = Math.sin(t * 0.8 + seed) * 5, bx = x + 80 * s + sw, by = y - 190 * s + 50 * s;
    c.lineWidth = 2; c.beginPath(); c.moveTo(x + 80 * s, y - 190 * s); c.lineTo(bx, by); c.stroke();
    c.beginPath(); c.arc(bx, by + 6, 7 * s, 0, 7); c.fill(); c.fillRect(bx - 6 * s, by + 10, 12 * s, 40 * s); c.fillRect(bx - 5 * s, by + 48 * s, 4 * s, 30 * s); c.fillRect(bx + 1 * s, by + 48 * s, 4 * s, 28 * s);
  },
  house(c, x, y, s, seed) {
    const w = 170 * s, h = 110 * s;
    c.fillRect(x, y - h, w, h); c.beginPath(); c.moveTo(x - 14, y - h); c.lineTo(x + w * 0.5, y - h - 70 * s); c.lineTo(x + w + 14, y - h); c.fill();
    c.fillRect(x + w * 0.7, y - h - 70 * s, 16 * s, 50 * s);
    if (seed % 3 === 0) { c.save(); c.fillStyle = 'rgba(140,40,20,0.5)'; c.fillRect(x + w * 0.2, y - h * 0.6, 18 * s, 22 * s); c.restore(); }
  },
  chapel(c, x, y, s) {
    c.fillRect(x, y - 130 * s, 120 * s, 130 * s); c.beginPath(); c.moveTo(x + 30 * s, y - 130 * s); c.lineTo(x + 60 * s, y - 260 * s); c.lineTo(x + 90 * s, y - 130 * s); c.fill();
    c.fillRect(x + 57 * s, y - 290 * s, 6 * s, 40 * s); c.fillRect(x + 48 * s, y - 278 * s, 24 * s, 6 * s);
  },
  window(c, x, y, s, seed, t) {
    const g = c.createLinearGradient(0, y - 330, 0, y - 120), fl = 0.5 + Math.sin(t * 1.3 + seed) * 0.08;
    g.addColorStop(0, `rgba(150,14,24,${fl})`); g.addColorStop(1, `rgba(60,6,12,${fl * 0.8})`);
    c.save(); c.fillStyle = g; c.beginPath(); c.moveTo(x - 32, y - 110); c.lineTo(x - 32, y - 290); c.quadraticCurveTo(x, y - 360, x + 32, y - 290); c.lineTo(x + 32, y - 110); c.fill();
    c.strokeStyle = '#0a0607'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y - 340); c.lineTo(x, y - 110); c.moveTo(x - 32, y - 230); c.lineTo(x + 32, y - 230); c.moveTo(x - 32, y - 170); c.lineTo(x + 32, y - 170); c.stroke(); c.restore();
  },
  wall(c, x, y, s) { const w = 260 * s, h = 150; c.fillRect(x, y - h, w, h); for (let i = 0; i < w; i += 34) c.fillRect(x + i, y - h - 16, 20, 16); c.fillRect(x + w * 0.4, y - h - 60, 54, 60); },
  lamp(c, x, y, s, seed, t) {
    c.fillRect(x - 2, y - 96 * s, 4, 96 * s); c.fillRect(x - 2, y - 96 * s, 18, 3);
    c.save(); const f = 0.75 + Math.sin(t * 8 + seed) * 0.1, g = c.createRadialGradient(x + 15, y - 84 * s, 1, x + 15, y - 84 * s, 60);
    g.addColorStop(0, `rgba(255,180,90,${0.5 * f})`); g.addColorStop(1, 'rgba(255,180,90,0)'); c.fillStyle = g; c.fillRect(x - 45, y - 144 * s, 120, 120);
    c.fillStyle = `rgba(255,200,120,${f})`; c.fillRect(x + 11, y - 92 * s, 8, 11); c.restore();
  },
  stall(c, x, y, s) { c.fillRect(x, y - 34 * s, 96 * s, 6); c.fillRect(x + 4, y - 34 * s, 5, 34 * s); c.fillRect(x + 88 * s, y - 34 * s, 5, 34 * s); c.fillRect(x + 2, y - 86 * s, 4, 54 * s); c.fillRect(x + 90 * s, y - 86 * s, 4, 54 * s); c.beginPath(); c.moveTo(x - 10, y - 80 * s); c.lineTo(x + 106 * s, y - 80 * s); c.lineTo(x + 96 * s, y - 98 * s); c.lineTo(x, y - 98 * s); c.fill(); },
  reeds(c, x, y, s, seed, t) { const r = G.rng(seed); c.lineWidth = 2; for (let i = 0; i < 9; i++) { const h = (26 + r() * 40) * s, bx = x + i * 7, sw = Math.sin(t * 1.4 + i + seed) * 3; c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx + sw * 0.4, y - h * 0.5, bx + sw, y - h); c.stroke(); if (i % 3 === 0) c.fillRect(bx + sw - 2, y - h - 8, 4, 10); } },
  pillar(c, x, y) { c.fillRect(x - 22, 0, 44, y); c.fillRect(x - 32, y - 26, 64, 26); c.fillRect(x - 30, 60, 60, 16); },
  cross(c, x, y, s) { c.save(); c.translate(x, y); c.rotate((s - 1) * 0.5); c.fillRect(-4, -70 * s, 8, 70 * s); c.fillRect(-22 * s, -54 * s, 44 * s, 7); c.restore(); },
  grave(c, x, y, s) { c.beginPath(); c.moveTo(x - 16 * s, y); c.lineTo(x - 16 * s, y - 30 * s); c.quadraticCurveTo(x, y - 52 * s, x + 16 * s, y - 30 * s); c.lineTo(x + 16 * s, y); c.fill(); },
  fence(c, x, y, s) { for (let i = 0; i < 5; i++) c.fillRect(x + i * 22, y - 40 * s - (i * 7 % 11), 6, 46 * s); c.fillRect(x - 6, y - 26 * s, 110, 5); },
  stake(c, x, y, s) {
    c.fillRect(x - 3, y - 120 * s, 6, 120 * s); c.beginPath(); c.moveTo(x - 3, y - 120 * s); c.lineTo(x, y - 140 * s); c.lineTo(x + 3, y - 120 * s); c.fill();
    c.save(); c.translate(x, y - 84 * s); c.rotate(0.5); c.fillRect(-7, -24, 14, 44); c.beginPath(); c.arc(0, -32, 8, 0, 7); c.fill(); c.fillRect(-20, -18, 12, 5); c.fillRect(8, 16, 5, 28); c.restore();
  },
  cart(c, x, y, s) { c.fillRect(x, y - 44 * s, 110 * s, 22 * s); c.beginPath(); c.arc(x + 26 * s, y - 16 * s, 16 * s, 0, 7); c.arc(x + 90 * s, y - 16 * s, 16 * s, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 55 * s, y - 50 * s, 46 * s, 14 * s, 0, Math.PI, 0); c.fill(); },
  pew(c, x, y, s) { c.fillRect(x, y - 30 * s, 100 * s, 8); c.fillRect(x, y - 56 * s, 8, 56 * s); c.fillRect(x + 92 * s, y - 30 * s, 8, 30 * s); },
  candles(c, x, y, s, seed, t) {
    c.fillRect(x - 2, y - 70 * s, 4, 70 * s); c.fillRect(x - 18, y - 70 * s, 36, 4);
    c.save();
    for (let i = -1; i <= 1; i++) { c.fillStyle = '#1a1416'; c.fillRect(x + i * 15 - 2, y - 84 * s, 4, 14 * s); c.fillStyle = `rgba(255,${150 + Math.sin(t * 9 + i + seed) * 40 | 0},60,0.9)`; c.beginPath(); c.ellipse(x + i * 15, y - 88 * s, 2.2, 4.5, 0, 0, 7); c.fill(); }
    c.restore();
  },
};

let vignette = null;

// The backdrop, world props and ground blood are drawn at half size into this buffer, reduced to
// a limited palette with an ordered dither, then scaled up unsmoothed so they match the sprites.
let bgBuf = null, bgCtx = null;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
G.bgBegin = () => {
  if (!bgBuf) { bgBuf = document.createElement('canvas'); bgBuf.width = G.W / 2; bgBuf.height = G.H / 2; bgCtx = bgBuf.getContext('2d', { willReadFrequently: true }); }
  bgCtx.setTransform(0.5, 0, 0, 0.5, 0, 0); bgCtx.globalAlpha = 1; bgCtx.shadowBlur = 0;
  return bgCtx;
};
G.bgEnd = (ctx, ox = 0, oy = 0) => {
  const w = bgBuf.width, h = bgBuf.height, STEP = 10;
  bgCtx.setTransform(1, 0, 0, 1, 0, 0);
  const img = bgCtx.getImageData(0, 0, w, h), d = img.data;
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
    const th = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * STEP;
    d[i] = Math.round((d[i] + th) / STEP) * STEP; d[i + 1] = Math.round((d[i + 1] + th) / STEP) * STEP; d[i + 2] = Math.round((d[i + 2] + th) / STEP) * STEP;
  }
  bgCtx.putImageData(img, 0, 0);
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.W, G.H);
  ctx.drawImage(bgBuf, ox, oy, G.W, G.H); ctx.imageSmoothingEnabled = sm;
};
G.drawBackdrop = (ctx, level, cam, t) => {
  const T = level._theme, W = G.W, H = G.H, gy = G.GROUND;
  const g = ctx.createLinearGradient(0, 0, 0, gy);
  g.addColorStop(0, T.sky[0]); g.addColorStop(0.6, T.sky[1]); g.addColorStop(1, T.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!T.indoor) for (let i = 0; i < 46; i++) {   // a few stars
    const x = Math.round((((i * 197.3 - cam * 0.02) % W) + W) % W / 2) * 2, y = Math.round((i * 61.7) % (gy - 150) / 2) * 2;
    ctx.fillStyle = `rgba(230,215,215,${0.12 + (i % 4) * 0.07 + (i % 7 === 0 ? Math.sin(t * 2 + i) * 0.08 : 0)})`; ctx.fillRect(x, y, 2, 2);
  }
  if (T.moon) {
    const mx = 700 - cam * 0.02, mg = ctx.createRadialGradient(mx, 110, 20, mx, 110, 200);
    mg.addColorStop(0, 'rgba(160,30,30,0.35)'); mg.addColorStop(1, 'rgba(160,30,30,0)');
    ctx.fillStyle = mg; ctx.fillRect(mx - 200, -90, 400, 400);
    ctx.fillStyle = '#b89a86'; ctx.beginPath(); ctx.arc(mx, 110, 40, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(120,20,24,0.35)'; ctx.beginPath(); ctx.arc(mx - 10, 100, 14, 0, 7); ctx.arc(mx + 14, 124, 9, 0, 7); ctx.fill();
    // distant hills
    ctx.fillStyle = '#120a0d'; ctx.beginPath(); ctx.moveTo(0, gy);
    for (let x = 0; x <= W; x += 20) { const wx = x + cam * 0.12; ctx.lineTo(x, gy - 70 - Math.sin(wx * 0.004) * 36 - Math.sin(wx * 0.013) * 14); }
    ctx.lineTo(W, gy); ctx.fill();
  }
  G.drawFar(ctx, level, cam, t);
  const par = T.indoor ? 0.6 : 0.5;
  ctx.fillStyle = ctx.strokeStyle = T.indoor ? '#0f0b0d' : '#0b0708'; ctx.lineCap = 'round';
  for (const p of level._mid) { const x = Math.round((p.x - cam * par) / 2) * 2; if (x > -300 && x < W + 300) PROPS[p.k](ctx, x, gy + 4, p.s, p.seed, t); }
  // ground
  ctx.fillStyle = T.ground; ctx.fillRect(0, gy - 3, W, H - gy + 3);
  ctx.fillStyle = T.edge; ctx.fillRect(0, gy - 3, W, 2);
  if (level.theme === 'town') {   // cobbles
    for (let row = 0; row < 5; row++) for (let wx = Math.floor(cam / 22) * 22 - 22; wx < cam + W; wx += 22) {
      const x = Math.round((wx - cam + (row & 1) * 11) / 2) * 2, y = gy + 2 + row * 12; ctx.fillStyle = ((wx / 22 + row) & 3) ? 'rgba(255,235,225,0.045)' : 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y, 18, 2); ctx.fillRect(x, y, 2, 10);
    }
  }
  for (let wx = Math.floor(cam / 12) * 12; wx < cam + W; wx += 12) {   // pebbles and scuffs so the ground is not flat
    const h = Math.imul(wx | 0, 2654435761) >>> 0, x = Math.round((wx - cam + h % 11) / 2) * 2, y = gy + 4 + Math.round((h >>> 5) % 84 / 2) * 2;
    ctx.fillStyle = (h & 3) ? 'rgba(0,0,0,0.28)' : 'rgba(255,235,225,0.06)'; ctx.fillRect(x, y, 2 + ((h >>> 12) & 1) * 4, 2);
  }
  if (T.water) { ctx.fillStyle = 'rgba(40,70,60,0.22)'; for (let x = -(cam % 190); x < W; x += 190) { ctx.beginPath(); ctx.ellipse(x + 60, gy + 34 + ((x + cam) % 3) * 9, 70, 5, 0, 0, 7); ctx.fill(); } }
  if (T.indoor) { ctx.strokeStyle = '#191316'; ctx.lineWidth = 1; for (let x = -(cam % 80); x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 30, H); ctx.stroke(); } }
  else { ctx.strokeStyle = T.edge; ctx.lineWidth = 1.5; for (let x = -(cam % 37); x < W; x += 37) { const h = 4 + ((x + cam) * 7 % 9); ctx.beginPath(); ctx.moveTo(x, gy - 2); ctx.lineTo(x + 3, gy - 2 - h); ctx.moveTo(x + 5, gy - 2); ctx.lineTo(x + 9, gy - h); ctx.stroke(); } }
  ctx.fillStyle = ctx.strokeStyle = '#060304';
  for (const p of level._near) { const x = Math.round((p.x - cam) / 2) * 2; if (x > -200 && x < W + 200) PROPS[p.k](ctx, x, gy + 2, p.s, p.seed, t); }
};

// Ground fog, drawn into the backdrop buffer so it is dithered with the scenery.
G.drawFog = (ctx, level, cam, t) => {
  const W = G.W;
  for (let i = 0; i < 3; i++) {
    const fx = ((i * 420 - cam * 0.8 + t * (12 + i * 7)) % (W + 600) + W + 600) % (W + 600) - 300;
    const fg = ctx.createRadialGradient(fx, G.GROUND - 10, 10, fx, G.GROUND - 10, 280);
    fg.addColorStop(0, 'rgba(90,70,74,0.2)'); fg.addColorStop(1, 'rgba(90,70,74,0)');
    ctx.fillStyle = fg; ctx.fillRect(fx - 280, G.GROUND - 160, 560, 260);
  }
};

// Everything that lies over the scene — weather, the vignette, the hurt and fever tints — is drawn at
// half size and its transparency dithered into steps, so it reads as pixels rather than a soft wash.
let ovBuf = null, ovCtx = null;
G.drawAtmosphere = (ctx, level, cam, t, hurt, fever = 0) => {
  const T = level._theme, W = G.W, H = G.H;
  if (!ovBuf) { ovBuf = document.createElement('canvas'); ovBuf.width = W / 2; ovBuf.height = H / 2; ovCtx = ovBuf.getContext('2d', { willReadFrequently: true }); }
  const c = ovCtx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W / 2, H / 2); c.setTransform(0.5, 0, 0, 0.5, 0, 0);
  if (T.weather === 'rain') {
    c.fillStyle = 'rgba(170,170,195,0.5)';
    for (let i = 0; i < 70; i++) {
      const x = Math.round(((((i * 137.5 + t * 300 - cam * 0.5) % W) + W) % W) / 2) * 2, y = Math.round(((i * 71.3 + t * 900) % H) / 2) * 2;
      c.fillRect(x, y, 2, 6); c.fillRect(x - 2, y + 6, 2, 6);
    }
  } else {
    c.fillStyle = T.indoor ? 'rgba(200,170,150,0.5)' : 'rgba(255,120,60,0.7)';
    for (let i = 0; i < 40; i++) { const x = ((i * 97.3 + Math.sin(t * 0.7 + i) * 30 - cam * 0.3) % W + W) % W, y = H - ((i * 53.7 + t * (14 + i % 5 * 6)) % H); c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 2, 2); }
  }
  const ring = (inner, outer, col, a) => { if (a <= 0) return; const g = c.createRadialGradient(W / 2, H / 2, H * inner, W / 2, H / 2, H * outer); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); };
  ring(0.35, 0.95, '0,0,0', 0.8); ring(0.3, 0.8, '140,0,6', hurt); ring(0.28, 0.8, '120,20,130', fever);
  c.setTransform(1, 0, 0, 1, 0, 0);
  const img = c.getImageData(0, 0, W / 2, H / 2), d = img.data, STEP = 28;
  for (let y = 0, i = 3; y < H / 2; y++) for (let x = 0; x < W / 2; x++, i += 4) {
    const a = d[i]; if (a === 0 || a === 255) continue;
    d[i] = Math.max(0, Math.min(255, Math.round((a + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * STEP) / STEP) * STEP));
  }
  c.putImageData(img, 0, 0);
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false; ctx.drawImage(ovBuf, 0, 0, W, H); ctx.imageSmoothingEnabled = sm;
};

// ---------------------------------------------------------------------------
// Scenery detail. The props above are silhouettes; these versions add the
// things that make a place read as a place: timber frames, tiles, lit and dark
// windows, brick courses, stained glass, market goods. A distant skyline per
// theme sits between the hills and the nearer buildings.
// ---------------------------------------------------------------------------
const D1 = '#1c1215', D2 = '#2a1a1e', D3 = '#3a2428';
const lit = (c, x, y, w, h, on, t, seed, col = '224,130,56') => {
  c.fillStyle = on ? `rgba(${col},${0.78 + Math.sin(t * 3.1 + seed) * 0.1})` : '#05030a'; c.fillRect(x, y, w, h);
  if (on) { const g = c.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, w * 2.6); g.addColorStop(0, `rgba(${col},0.28)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - w * 2.6, y - h * 2.6, w * 6.2, h * 6.2); }
  c.fillStyle = D1; c.fillRect(x + w / 2 - 1, y, 2, h); c.fillRect(x, y + h / 2 - 1, w, 2);
};
Object.assign(PROPS, {
  house(c, x, y, s, seed, t) {
    const w = Math.round(170 * s), h = Math.round(110 * s), rh = Math.round(70 * s), r = G.rng(seed);
    c.fillRect(x, y - h, w, h); c.beginPath(); c.moveTo(x - 14, y - h); c.lineTo(x + w * 0.5, y - h - rh); c.lineTo(x + w + 14, y - h); c.fill();
    c.fillRect(x + w * 0.7, y - h - rh, 16 * s, 50 * s);
    c.save();
    c.fillStyle = D1; for (let i = 1; i < 7; i++) { const k = i / 7, half = (w / 2 + 14) * k; c.fillRect(x + w / 2 - half, y - h - rh + rh * k, half * 2, 2); }      // roof courses
    c.fillStyle = D2; c.fillRect(x - 14, y - h - 2, w + 28, 4); c.fillRect(x + w * 0.7 - 2, y - h - rh - 4, 16 * s + 4, 4);
    c.fillStyle = D1; c.fillRect(x, y - h * 0.52, w, 4); for (const k of [0, 0.34, 0.67, 1]) c.fillRect(x + k * (w - 5), y - h, 5, h);                      // timber frame
    c.strokeStyle = D1; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 4, y - h * 0.5); c.lineTo(x + w * 0.33, y - h + 4); c.moveTo(x + w - 4, y - h * 0.5); c.lineTo(x + w * 0.67, y - h + 4); c.stroke();
    const dx = x + w * 0.42, dw = Math.round(28 * s), dh = Math.round(50 * s);
    c.fillStyle = '#0a0607'; c.fillRect(dx, y - dh, dw, dh); c.fillStyle = D2; c.fillRect(dx, y - dh, dw, 3); c.fillRect(dx, y - dh, 3, dh); c.fillRect(dx + dw - 3, y - dh, 3, dh); c.fillRect(dx + dw / 2 - 1, y - dh, 2, dh);
    c.fillStyle = D3; c.fillRect(dx + dw - 9, y - dh / 2, 3, 3);
    lit(c, x + w * 0.12, y - h * 0.86, Math.round(22 * s), Math.round(26 * s), r() < 0.5, t, seed);
    lit(c, x + w * 0.74, y - h * 0.86, Math.round(22 * s), Math.round(26 * s), r() < 0.35, t, seed + 3);
    lit(c, x + w * 0.76, y - h * 0.4, Math.round(20 * s), Math.round(24 * s), r() < 0.3, t, seed + 7);
    if (r() < 0.5) { c.fillStyle = D2; c.fillRect(x + w * 0.1, y - 16, 20, 16); c.fillRect(x + w * 0.1 + 22, y - 10, 12, 10); }                             // crates by the wall
    c.restore();
  },
  chapel(c, x, y, s, seed, t) {
    const w = 120 * s, h = 130 * s;
    c.fillRect(x, y - h, w, h); c.beginPath(); c.moveTo(x + 30 * s, y - h); c.lineTo(x + 60 * s, y - 260 * s); c.lineTo(x + 90 * s, y - h); c.fill();
    c.fillRect(x + 57 * s, y - 290 * s, 6 * s, 40 * s); c.fillRect(x + 48 * s, y - 278 * s, 24 * s, 6 * s);
    c.save();
    c.fillStyle = D1; for (let r2 = 0; r2 < h; r2 += 12) { c.fillRect(x, y - h + r2, w, 2); for (let k = (r2 / 12 & 1) * 12; k < w; k += 24) c.fillRect(x + k, y - h + r2, 2, 12); }   // stone courses
    for (let i = 1; i < 6; i++) c.fillRect(x + 60 * s - i * 5 * s, y - 260 * s + i * 22 * s, i * 10 * s, 2);
    c.fillStyle = '#0a0607'; c.beginPath(); c.moveTo(x + w / 2 - 16, y); c.lineTo(x + w / 2 - 16, y - 40 * s); c.quadraticCurveTo(x + w / 2, y - 66 * s, x + w / 2 + 16, y - 40 * s); c.lineTo(x + w / 2 + 16, y); c.fill();
    c.fillStyle = `rgba(190,170,240,${0.55 + Math.sin(t * 1.7 + seed) * 0.08})`; c.beginPath(); c.arc(x + w / 2, y - h * 0.72, 11 * s, 0, 7); c.fill();
    c.fillStyle = D1; c.fillRect(x + w / 2 - 1, y - h * 0.72 - 11 * s, 2, 22 * s); c.fillRect(x + w / 2 - 11 * s, y - h * 0.72 - 1, 22 * s, 2);
    c.restore();
  },
  wall(c, x, y, s, seed, t) {
    const w = Math.round(260 * s), h = 150;
    c.fillRect(x, y - h, w, h); for (let i = 0; i < w; i += 34) c.fillRect(x + i, y - h - 16, 20, 16); c.fillRect(x + w * 0.4, y - h - 60, 54, 60); for (let i = 0; i < 54; i += 18) c.fillRect(x + w * 0.4 + i, y - h - 72, 10, 12);
    c.save();
    c.fillStyle = D1; for (let r2 = 0; r2 < h; r2 += 14) { c.fillRect(x, y - h + r2, w, 2); for (let k = (r2 / 14 & 1) * 16; k < w; k += 32) c.fillRect(x + k, y - h + r2, 2, 14); }
    c.fillStyle = '#05030a'; c.fillRect(x + w * 0.4 + 24, y - h - 44, 6, 22); c.fillRect(x + w * 0.15, y - h + 40, 5, 20); c.fillRect(x + w * 0.8, y - h + 40, 5, 20);
    c.fillStyle = '#3a2618'; c.fillRect(x + w * 0.62, y - 96, 4, 26);                                                                                    // a torch in its bracket
    const f = 0.8 + Math.sin(t * 9 + seed) * 0.15, g = c.createRadialGradient(x + w * 0.62 + 2, y - 102, 1, x + w * 0.62 + 2, y - 102, 70);
    g.addColorStop(0, `rgba(255,170,80,${0.4 * f})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(x + w * 0.62 - 70, y - 172, 144, 140);
    c.fillStyle = `rgba(255,${190 * f | 0},90,0.95)`; c.fillRect(x + w * 0.62 - 2, y - 108, 8, 12); c.fillStyle = '#fff0b0'; c.fillRect(x + w * 0.62, y - 104, 4, 6);
    c.fillStyle = '#4a1014'; c.fillRect(x + w * 0.4 + 18, y - h - 96, 4, 26); c.fillRect(x + w * 0.4 + 22, y - h - 96, 22 + Math.sin(t * 2 + seed) * 4, 14);        // banner on the tower
    c.restore();
  },
  window(c, x, y, s, seed, t) {
    // stained glass: a leaded mosaic of dim panes under a pointed arch
    c.save(); c.beginPath(); c.moveTo(x - 32, y - 110); c.lineTo(x - 32, y - 290); c.quadraticCurveTo(x, y - 366, x + 32, y - 290); c.lineTo(x + 32, y - 110); c.closePath(); c.clip();
    const pal = ['#6a0d18', '#8a1420', '#4a0c2a', '#7a3a10', '#2a1440', '#5a0a12', '#96281c'], fl = 0.86 + Math.sin(t * 1.3 + seed) * 0.1;
    c.globalAlpha = fl;
    for (let r2 = 0; r2 < 22; r2++) for (let k = 0; k < 6; k++) { const h2 = Math.imul(seed * 31 + r2 * 7 + k, 2654435761) >>> 0; c.fillStyle = pal[h2 % pal.length]; c.fillRect(x - 32 + k * 11 + (r2 & 1) * -5, y - 366 + r2 * 12, 11, 12); }
    c.globalAlpha = 1; c.fillStyle = 'rgba(255,200,150,0.5)'; c.beginPath(); c.arc(x, y - 250, 10, 0, 7); c.fill();                                         // the saint's halo
    c.fillStyle = '#d8c8b0'; c.fillRect(x - 4, y - 242, 8, 34); c.fillRect(x - 10, y - 232, 20, 5);
    c.fillStyle = '#0a0607'; for (let r2 = 0; r2 < 22; r2++) c.fillRect(x - 34, y - 366 + r2 * 12, 68, 1); for (let k = 1; k < 6; k++) c.fillRect(x - 32 + k * 11, y - 366, 1, 260);
    c.restore();
    c.save(); c.strokeStyle = '#17110f'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 32, y - 110); c.lineTo(x - 32, y - 290); c.quadraticCurveTo(x, y - 366, x + 32, y - 290); c.lineTo(x + 32, y - 110); c.closePath(); c.stroke();
    c.fillStyle = '#17110f'; c.fillRect(x - 2, y - 340, 4, 230); c.fillRect(x - 38, y - 112, 76, 8); c.restore();
  },
  pillar(c, x, y) {
    c.fillRect(x - 22, 0, 44, y); c.fillRect(x - 32, y - 26, 64, 26); c.fillRect(x - 30, 60, 60, 16);
    c.save(); c.fillStyle = '#1a1418'; for (const k of [-14, -5, 4, 13]) c.fillRect(x + k, 76, 3, y - 102);                                                  // fluting
    c.fillStyle = '#231b20'; c.fillRect(x - 22, 76, 3, y - 102); c.fillRect(x - 32, y - 26, 64, 3); c.fillRect(x - 30, 60, 60, 3); c.fillRect(x - 26, 50, 52, 10);
    c.fillStyle = '#080506'; c.fillRect(x + 19, 76, 3, y - 102); c.restore();
  },
  pew(c, x, y, s) {
    c.fillRect(x, y - 30 * s, 100 * s, 8); c.fillRect(x, y - 56 * s, 8, 56 * s); c.fillRect(x + 92 * s, y - 30 * s, 8, 30 * s);
    c.save(); c.fillStyle = D1; c.fillRect(x, y - 56 * s, 100 * s, 5); for (let k = 14; k < 92 * s; k += 14) c.fillRect(x + k, y - 51 * s, 3, 21 * s); c.fillStyle = D2; c.fillRect(x, y - 30 * s, 100 * s, 2); c.restore();
  },
  stall(c, x, y, s, seed) {
    c.fillRect(x, y - 34 * s, 96 * s, 6); c.fillRect(x + 4, y - 34 * s, 5, 34 * s); c.fillRect(x + 88 * s, y - 34 * s, 5, 34 * s); c.fillRect(x + 2, y - 86 * s, 4, 54 * s); c.fillRect(x + 90 * s, y - 86 * s, 4, 54 * s);
    c.save();
    for (let k = 0; k < 8; k++) { c.fillStyle = k & 1 ? '#3a1418' : '#22161a'; c.beginPath(); c.moveTo(x - 10 + k * 14.5 * s, y - 80 * s); c.lineTo(x - 10 + (k + 1) * 14.5 * s, y - 80 * s); c.lineTo(x + (k + 1) * 12 * s, y - 98 * s); c.lineTo(x + k * 12 * s, y - 98 * s); c.fill(); }
    const goods = ['#6a1a1a', '#7a6030', '#3a4a2a', '#6a5a4a', '#5a2a4a']; for (let k = 0; k < 6; k++) { c.fillStyle = goods[(seed + k) % goods.length]; c.fillRect(x + 10 + k * 13 * s, y - 42 * s, 9, 8); }
    c.fillStyle = D2; c.fillRect(x, y - 34 * s, 96 * s, 2); c.restore();
  },
  cart(c, x, y, s) {
    c.fillRect(x, y - 44 * s, 110 * s, 22 * s); c.beginPath(); c.arc(x + 26 * s, y - 16 * s, 16 * s, 0, 7); c.arc(x + 90 * s, y - 16 * s, 16 * s, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 55 * s, y - 50 * s, 46 * s, 14 * s, 0, Math.PI, 0); c.fill();
    c.save(); c.fillStyle = D1; for (let k = 0; k < 110 * s; k += 16) c.fillRect(x + k, y - 44 * s, 2, 22 * s); c.fillRect(x, y - 44 * s, 110 * s, 2);
    c.strokeStyle = D2; c.lineWidth = 2; for (const wx of [26, 90]) for (let a = 0; a < 3; a++) { c.beginPath(); c.moveTo(x + wx * s - Math.cos(a * 1.05) * 14 * s, y - 16 * s - Math.sin(a * 1.05) * 14 * s); c.lineTo(x + wx * s + Math.cos(a * 1.05) * 14 * s, y - 16 * s + Math.sin(a * 1.05) * 14 * s); c.stroke(); }
    c.fillStyle = '#2a2224'; c.fillRect(x + 30 * s, y - 60 * s, 14, 6); c.fillRect(x + 62 * s, y - 62 * s, 10, 8); c.restore();                                 // what the cart was carrying
  },
  grave(c, x, y, s) {
    c.beginPath(); c.moveTo(x - 16 * s, y); c.lineTo(x - 16 * s, y - 30 * s); c.quadraticCurveTo(x, y - 52 * s, x + 16 * s, y - 30 * s); c.lineTo(x + 16 * s, y); c.fill();
    c.save(); c.fillStyle = D2; c.fillRect(x - 1, y - 38 * s, 3, 18 * s); c.fillRect(x - 6 * s, y - 32 * s, 12 * s, 3); c.fillStyle = '#1a2416'; c.fillRect(x - 16 * s, y - 6, 10, 6); c.fillRect(x + 6 * s, y - 4, 8, 4); c.restore();
  },
});

// A distant skyline, far behind the playfield.
G.drawFar = (ctx, level, cam, t) => {
  const W = G.W, gy = G.GROUND, th = level.theme, off = cam * 0.25;
  ctx.save(); ctx.fillStyle = th === 'cathedral' ? '#0c080b' : th === 'fen' ? '#0b1210' : '#150b0f';
  const each = (step, fn) => { for (let i = Math.floor(off / step) - 1; i * step - off < W + step; i++) fn(Math.round((i * step - off) / 2) * 2, Math.imul(i + 7, 2654435761) >>> 0, i); };
  if (th === 'road') each(760, (x, h) => {           // a ruined keep on the ridge
    const y = gy - 60 - h % 30; ctx.fillRect(x, y - 120, 46, 120); ctx.fillRect(x - 6, y - 132, 14, 14); ctx.fillRect(x + 16, y - 128, 12, 10); ctx.fillRect(x + 46, y - 60, 90, 60); ctx.fillRect(x + 136, y - 34, 40, 34);
    ctx.fillStyle = '#05030a'; ctx.fillRect(x + 18, y - 96, 6, 14); ctx.fillStyle = '#150b0f';
  });
  else if (th === 'village') each(980, (x, h) => {    // a windmill, still turning
    const y = gy - 50 - h % 24; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 12, y - 110); ctx.lineTo(x + 12, y - 110); ctx.lineTo(x + 22, y); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 16, y - 110); ctx.lineTo(x, y - 132); ctx.lineTo(x + 16, y - 110); ctx.fill();
    ctx.save(); ctx.translate(x, y - 112); ctx.rotate(t * 0.25 + h % 6); for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-3, 0, 6, 70); ctx.fillRect(3, 14, 12, 52); } ctx.restore();
  });
  else if (th === 'town') each(120, (x, h) => {       // rooftops and spires beyond the street
    const hh = 60 + h % 70, w = 90 + (h >>> 8) % 40; ctx.fillRect(x, gy - hh, w, hh); ctx.beginPath(); ctx.moveTo(x - 6, gy - hh); ctx.lineTo(x + w / 2, gy - hh - 34); ctx.lineTo(x + w + 6, gy - hh); ctx.fill();
    if (h % 5 === 0) { ctx.fillRect(x + w / 2 - 8, gy - hh - 110, 16, 90); ctx.beginPath(); ctx.moveTo(x + w / 2 - 10, gy - hh - 110); ctx.lineTo(x + w / 2, gy - hh - 150); ctx.lineTo(x + w / 2 + 10, gy - hh - 110); ctx.fill(); }
    if (h % 3 === 0) { ctx.fillStyle = `rgba(200,110,50,${0.35 + Math.sin(t * 2 + h) * 0.08})`; ctx.fillRect(x + 20 + h % 30, gy - hh + 16, 6, 8); ctx.fillStyle = '#150b0f'; }
  });
  else if (th === 'fen') each(150, (x, h) => {        // a drowned tree line
    const hh = 70 + h % 90; ctx.fillRect(x, gy - hh, 5, hh); ctx.fillRect(x - 16, gy - hh * 0.7, 20, 3); ctx.fillRect(x + 4, gy - hh * 0.85, 22, 3); ctx.fillRect(x - 10, gy - hh * 0.45, 12, 3); ctx.fillRect(x + 22, gy - hh * 0.85 - 12, 3, 14);
  });
  else each(340, (x) => {                              // the far arcade of the nave
    ctx.fillRect(x, 0, 26, gy); ctx.beginPath(); ctx.moveTo(x + 26, 150); ctx.quadraticCurveTo(x + 183, -40, x + 340, 150); ctx.lineTo(x + 340, 0); ctx.lineTo(x + 26, 0); ctx.fill();
  });
  ctx.restore();
};
