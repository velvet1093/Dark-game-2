'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — platforming trials. Long spike pits crossed on ledges that do
// not all behave: some crumble under you, some move, some are not there at
// all; blades swing across the way and bone spikes drop from above. Falling
// in impales you and puts you back at the start.
//
// On Fair (Settings) the trials are hard: false ledges shimmer, spikes shake
// before they drop, ledges take a moment to give way, blades keep time.
// On Unfair they are not: no shimmer, no warning, quicker crumbling, blades
// that change speed, and crows that come for you only when you are mid-air.
//
// Level data:  platforms[i].crumble / .fake / .move (half-range px) + .period
//              blades:   [{ x, top, len, period, phase }]   (top = pivot height)
//              droppers: [{ x, h }]
//              trials:   [{ x, end, name }]
//              enemies tagged 'unfair' only appear on Unfair.
// ---------------------------------------------------------------------------
(() => {
  const PI2 = Math.PI * 2;
  G.traps = {
    init(g, L) {
      for (const pl of L.platforms || []) { if (pl.x0 == null) pl.x0 = pl.x; pl.x = pl.x0; pl.float = (L.pits || []).some(q => pl.x0 + pl.w / 2 > q.x && pl.x0 + pl.w / 2 < q.x + q.w); pl.st = 0; pl.off = false; pl.fallT = 0; pl.dx = 0; }
      L._drops = (L.droppers || []).map(d => ({ d, state: 'hang', t: 0, alt: d.h, vy: 0 }));
      L._blades = (L.blades || []).map(b => ({ b, ph: b.phase || 0, a: 0, tip: [b.x, b.top - b.len] }));
      L._live = !!((L.platforms || []).some(pl => pl.crumble || pl.fake || pl.move) || L._drops.length || L._blades.length);
      g.trialIn = -1; g.trapInv = 0;
    },
    standingOn(p, pl) { return !p.air && Math.abs(p.alt - pl.h) < 1 && p.x >= pl.x - 4 && p.x <= pl.x + pl.w + 4; },
    tick(g, dt) {
      const L = g.level, p = g.player, un = G.unfair();
      if (g.inside || !L._live && !L.trials) return;
      g.trapInv = Math.max(0, (g.trapInv || 0) - dt);
      let changed = false;
      for (const pl of L.platforms || []) {
        if (pl.move) {   // carried along: whoever stands on it moves with it
          const nx = pl.x0 + Math.sin(g.time * PI2 / pl.period + (pl.phase || 0)) * pl.move;
          pl.dx = nx - pl.x; if (!p.dead && this.standingOn(p, pl)) p.x += pl.dx; pl.x = nx;
        }
        if (pl.crumble) {
          if (pl.off) { pl.fallT += dt; if (pl.fallT > (un ? 4.5 : 3)) { pl.off = false; pl.fallT = 0; pl.st = 0; changed = true; } continue; }
          if (!p.dead && this.standingOn(p, pl)) pl.st += dt; else if (pl.st > 0 && !un) pl.st = Math.max(0, pl.st - dt * 0.5);   // on Fair it settles again if you step off
          const hold = pl.cruel && un ? 0.05 : un ? 0.3 : 0.6;
          if (pl.st > 0 && pl.st - dt <= 0) G.sfx('step');
          if (pl.st >= hold) { pl.off = true; pl.fallT = 0; changed = true; G.sfx('thud'); g.shake = Math.max(g.shake, 3); for (let k = 0; k < 6; k++) G.fx.sparks.push({ x: pl.x + Math.random() * pl.w, y: G.GROUND - pl.h, vx: G.rand(-40, 40), vy: G.rand(-40, 60), t: 0.4 }); }
        }
      }
      if (changed || L._live) g.surf = g.surfAll.filter(pl => !pl.fake && !pl.off);
      const body = [p.x, p.alt + 36];
      // swinging blades
      for (const s of L._blades) {
        const b = s.b, speed = un ? 1 + Math.sin(g.time * 0.9 + b.x) * 0.45 : 1;   // on Unfair it never keeps the same time twice
        s.ph += dt * PI2 / b.period * speed;
        const a = Math.sin(s.ph) * 1.05, va = Math.cos(s.ph);
        s.a = a; s.tip = [b.x + Math.sin(a) * b.len, b.top - Math.cos(a) * b.len];
        if (!p.dead && g.trapInv <= 0 && Math.hypot(s.tip[0] - body[0], s.tip[1] - body[1]) < 30) {
          g.trapInv = 0.9; const dir = va >= 0 ? 1 : -1;
          if (p.damage(26, p.x - dir * 10, g)) { p.vx = dir * 300; G.blood(p.x, G.GROUND - p.alt - 40, 22, dir, 320); G.sfx('sever'); }
        }
      }
      // spikes that drop from above
      for (const s of L._drops) {
        const d = s.d;
        if (s.state === 'hang') {
          const ahead = (d.x - p.x) * (p.facing || 1);
          if (!p.dead && p.alt < d.h - 60 && (Math.abs(p.x - d.x) < 34 || (un && ahead > 0 && ahead < 70 && Math.abs(p.vx) > 40))) { s.state = 'shake'; s.t = 0; G.sfx('grunt'); }
        } else if (s.state === 'shake') {
          if ((s.t += dt) >= (un ? 0.06 : 0.42)) { s.state = 'fall'; s.vy = 0; }
        } else if (s.state === 'fall') {
          s.vy += 1700 * dt; s.alt -= s.vy * dt;
          if (!p.dead && g.trapInv <= 0 && Math.abs(p.x - d.x) < 18 && s.alt - 30 < body[1] + 34 && s.alt > p.alt) {
            g.trapInv = 0.9; if (p.damage(30, d.x, g)) { G.blood(p.x, G.GROUND - p.alt - 60, 26, 0, 260); G.sfx('sever'); }
          }
          if (s.alt < -90) { s.state = 'gone'; s.t = 0; }
        } else if ((s.t += dt) > 3) { s.state = 'hang'; s.alt = d.h; }
      }
      // entering and finishing a trial
      (L.trials || []).forEach((tr, i) => {
        const key = 'trial_' + g.levelIdx + '_' + i, inside = p.x > tr.x && p.x < tr.end;
        if (inside && g.trialIn !== i) {
          g.trialIn = i; g.trialFalls = 0;
          G.questLog.banners.push({ kind: g.flags[key] ? 'Trial (passed before)' : 'Trial', title: tr.name, sub: un ? 'Unfair: no warnings, no mercy' : 'Hard: watch for the tells', t: 3.4 });
          g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.trial));
        }
        if (g.trialIn === i && !inside) {
          g.trialIn = -1;
          if (p.x >= tr.end && !p.dead) {
            if (!g.flags[key]) { g.flags[key] = 1; G.sfx('questdone'); G.questLog.banners.push({ kind: 'Trial passed', title: tr.name, sub: g.trialFalls ? 'after ' + g.trialFalls + ' fall' + (g.trialFalls > 1 ? 's' : '') : 'without a single fall', t: 4 }); g.save(); }
            g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.trialDone));
          }
        }
      });
    },
    // A fall into a trial's pit: count it, and let Misery enjoy it.
    onImpale(g) { if (g.trialIn >= 0) { g.trialFalls = (g.trialFalls || 0) + 1; g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.trialFall)); return true; } return false; },

    // How a ledge is drawn this frame: shaking, falling away, or (on Fair) shimmering if it is false.
    ledgeLook(pl, t) {
      const un = G.unfair();
      if (pl.off) return pl.fallT < 0.7 ? { dy: pl.fallT * pl.fallT * 600, alpha: 1 - pl.fallT / 0.7 } : null;
      if (pl.fake) return { dy: 0, alpha: un ? 1 : 0.5 + Math.sin(t * 6 + pl.x) * 0.2 };
      if (pl.crumble && pl.st > 0) return { dy: 0, sx: ((t * 40) | 0) % 2 ? 1 : -1, alpha: 1 };
      return { dy: 0, alpha: 1 };
    },
    draw(ctx, g, t) {
      const L = g.level, gy = G.GROUND; if (g.inside) return;
      const bone = L.theme === 'crypt', iron = L.theme === 'harbour';
      for (const s of L._blades || []) {
        const b = s.b, px = b.x, py = gy - b.top, tx = s.tip[0], ty = gy - s.tip[1];
        ctx.fillStyle = '#17110f'; ctx.fillRect(px - 10, py - 8, 20, 8);                         // the beam it hangs from
        G.pxLine(ctx, px, py, tx, ty, 2, iron ? '#4a3a2a' : '#3a3438');                       // rope or chain
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(-s.a);
        if (L.theme === 'convent') {   // a cracked bell
          ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(8, -14); ctx.lineTo(18, 14); ctx.lineTo(-18, 14); ctx.fill();
          ctx.fillStyle = '#7a6040'; ctx.fillRect(-18, 12, 36, 4); ctx.fillStyle = '#1a1210'; ctx.fillRect(-2, 6, 4, 10);
        } else {   // a crescent blade
          ctx.fillStyle = '#2a2428'; ctx.fillRect(-3, -14, 6, 14);
          ctx.fillStyle = '#9a9ca6'; ctx.beginPath(); ctx.moveTo(-24, -2); ctx.quadraticCurveTo(0, 26, 24, -2); ctx.quadraticCurveTo(0, 12, -24, -2); ctx.fill();
          ctx.fillStyle = '#e6e8ee'; ctx.fillRect(-20, 2, 3, 2); ctx.fillRect(16, 2, 3, 2); ctx.fillStyle = '#7a0509'; ctx.fillRect(-6, 10, 10, 2);
        }
        ctx.restore();
      }
      for (const s of L._drops || []) {
        if (s.state === 'gone') continue;
        const x = s.d.x + (s.state === 'shake' ? (((t * 50) | 0) % 2 ? 2 : -2) : 0), y = gy - s.alt;
        ctx.fillStyle = '#17110f'; ctx.fillRect(s.d.x - 14, gy - s.d.h - 6, 28, 6);
        ctx.fillStyle = bone ? '#b8ac98' : '#5a4a3a'; ctx.beginPath(); ctx.moveTo(x - 9, y - 30); ctx.lineTo(x + 9, y - 30); ctx.lineTo(x, y + 8); ctx.fill();
        ctx.fillStyle = bone ? '#e0d6c4' : '#7a6a58'; ctx.fillRect(x - 6, y - 30, 3, 20); ctx.fillStyle = '#7a0509'; ctx.fillRect(x - 1, y, 2, 6);
      }
    },
  };
})();
