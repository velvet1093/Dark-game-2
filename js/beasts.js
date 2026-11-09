'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — non-humanoid enemy models: the carrion hound and the gallows crow
// Each sets e.out (head / sh / hip joints) the way the humanoid rig does, so
// blood, stumps and executions work on them unchanged.
// ---------------------------------------------------------------------------
(() => {
  const stump = (ctx, x, y, r = 3.6) => { ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = '#d9c9b0'; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, 7); ctx.fill(); };

  function hound(ctx, e) {
    const s = e.scale, st = e.state, L = e.def.look, fl = e.flash > 0, C = c => (fl ? '#ffd9d0' : c), lm = e.limbs, gy = G.GROUND;
    const down = e.dead || st === 'broken' || st === 'executed';
    let by = -22, tilt = 0, jaw = 0.15;
    if (down) { by = -8; tilt = 0.12; jaw = e.dead ? 0.6 : 0.3; }
    else if (e.crawling) { by = -14; tilt = lm.legF.gone ? 0.28 : -0.22; }
    if (!down) {
      if (st === 'windup') { by += 5; tilt += 0.16; jaw = 0.2 + 0.6 * Math.min(1, e.t / e.atk.wind); }
      else if (st === 'strike') { by -= 9; tilt -= 0.22; jaw = 1; }
      else if (st === 'stagger') { tilt -= 0.3; jaw = 0.7; }
    }
    const moving = st === 'chase' && Math.abs(e.vx) > 5, ph = e.walk * 1.5;
    ctx.save(); ctx.translate(e.x, gy); ctx.scale(e.facing * s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const leg = (xr, off, gone, col) => {
      const ry = by + 3;
      if (gone) { stump(ctx, xr, ry + 3); return; }
      let fx = xr, fy = 0;
      if (down) { fx = xr + 11; fy = -1; }
      else if (st === 'strike') { fx = xr + (xr > 0 ? 13 : -13); fy = xr > 0 ? by + 12 : -2; }
      else if (moving) { fx = xr + Math.sin(ph + off) * 10; fy = -Math.max(0, Math.cos(ph + off)) * 6; }
      const kx = (xr + fx) / 2 - 4, ky = (ry + fy) / 2;
      ctx.strokeStyle = C(col); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xr, ry); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    };
    leg(-14, Math.PI, false, '#1c1719'); leg(14, 0, false, '#1c1719');           // far pair
    ctx.save(); ctx.translate(0, by); ctx.rotate(tilt);
    ctx.strokeStyle = C(L.body); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-19, -3); ctx.quadraticCurveTo(-30, -8, -33, 4 + Math.sin(e.walk * 2) * 3); ctx.stroke();
    ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.ellipse(0, 0, 21, 8.5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11, -1, 11, 10, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = C(L.skin); ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-9 + i * 5, -2, 7, 0.5, 2.2); ctx.stroke(); }
    ctx.strokeStyle = C(L.body); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(17, -4); ctx.lineTo(25, -10); ctx.stroke();
    if (lm.head.gone) stump(ctx, 24, -9, 4.5);
    else {
      ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.ellipse(28, -11, 7.5, 6, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(23, -15); ctx.lineTo(21, -24); ctx.lineTo(28, -16); ctx.fill();
      ctx.beginPath(); ctx.moveTo(31, -15); ctx.lineTo(43, -11); ctx.lineTo(32, -8.5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(31, -8); ctx.lineTo(41, -7 + jaw * 7); ctx.lineTo(30, -5); ctx.fill();
      ctx.fillStyle = '#d9c9b0'; for (let i = 0; i < 3; i++) ctx.fillRect(34 + i * 3, -9.5, 1.2, 2 + jaw * 2);
      if (!e.dead && !fl) { ctx.fillStyle = L.eye; ctx.shadowColor = L.eye; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(30, -12.5, 1.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    }
    ctx.restore();
    leg(-14, 0, lm.legB.gone, L.leg); leg(14, Math.PI, lm.legF.gone, L.leg);        // near pair
    ctx.restore();
    const W = (x, y) => [e.x + e.facing * s * x, gy + s * y];
    e.out = { head: W(27, by - 10), sh: W(13, by), hip: W(-14, by) };
  }

  function crow(ctx, e, time) {
    const s = e.scale * 1.3, st = e.state, L = e.def.look, fl = e.flash > 0, C = c => (fl ? '#ffd9d0' : c), lm = e.limbs;
    const y = G.GROUND - 7 - e.alt, grounded = e.alt < 6;
    const flap = e.dead ? -0.25 : grounded ? Math.sin(time * 20 + e.id) * 0.3 - 0.1 : Math.sin(time * 24 + e.id);
    ctx.save(); ctx.translate(e.x, y); ctx.scale(e.facing * s, s);
    if (st === 'strike') ctx.rotate(0.55); else if (st === 'windup') ctx.rotate(-0.3); else if (e.dead) ctx.rotate(0.25);
    const wing = (gone, col, ox) => {
      if (gone) { stump(ctx, ox, -2, 2.6); return; }
      ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(ox + 3, -2); ctx.lineTo(ox - 5, -2 - 17 * flap); ctx.lineTo(ox - 15, 1 - 9 * flap); ctx.lineTo(ox - 5, 1); ctx.closePath(); ctx.fill();
    };
    wing(lm.armB.gone, '#0e0c12', -1);
    if (grounded && !e.dead) { ctx.strokeStyle = '#3a3530'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, 4); ctx.lineTo(-2, 8); ctx.moveTo(3, 4); ctx.lineTo(3, 8); ctx.stroke(); }
    ctx.fillStyle = C(L.body); ctx.beginPath(); ctx.ellipse(0, 0, 9.5, 5.2, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-18, -3); ctx.lineTo(-17, 3); ctx.lineTo(-7, 3); ctx.fill();
    if (lm.head.gone) stump(ctx, 8, -2, 2.8);
    else {
      ctx.beginPath(); ctx.arc(8.5, -3, 4.4, 0, 7); ctx.fill();
      const open = st === 'windup' || st === 'strike' ? 2.5 : 0.4;
      ctx.fillStyle = C('#4a443c'); ctx.beginPath(); ctx.moveTo(11.5, -5); ctx.lineTo(20, -3 - open * 0.5); ctx.lineTo(11.5, -2.6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(11.5, -2.4); ctx.lineTo(18.5, -2 + open); ctx.lineTo(11.5, -0.8); ctx.fill();
      if (!e.dead && !fl) { ctx.fillStyle = L.eye; ctx.shadowColor = L.eye; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(9.6, -4, 1.1, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    }
    wing(lm.armF.gone, L.arm, 1);
    ctx.restore();
    e.out = { head: [e.x + e.facing * s * 8, y - 3 * s], sh: [e.x, y - 2], hip: [e.x - e.facing * s * 4, y] };
  }

  G.drawBeast = (ctx, e, time) => (e.def.model === 'hound' ? hound : crow)(ctx, e, time);
})();
