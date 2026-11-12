'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — executions. Each kind of foe dies its own way: beasts are pinned,
// fliers torn apart, bloats ruptured, the big ones hamstrung before the head
// comes off; some are skewered and lifted, some cut to ribbons, and a few are
// given a quiet thrust to the heart. Every boss has its own.
//
// A kind is a set of keyframes for the knight's pose, the moments its blows
// land (the last one kills), and what each blow does.
// ---------------------------------------------------------------------------
(() => {
  const BASE = { armA: 0.2, armE: 0.3, w: 0.6, lean: 0, crouch: 0, footF: 12, footB: -10, bA: 0.2, bE: 0.9, head: 0 };
  const CHOP0 = { armA: 3.4, armE: 0.2, w: 4.2, lean: -0.25 }, CHOP1 = { armA: 0.95, armE: 0.1, w: 1.05, lean: 0.45 };
  const RISE0 = { armA: -0.5, armE: 0.3, w: -0.7, lean: 0.25 }, RISE1 = { armA: 2.3, armE: 0.2, w: 2.6, lean: -0.05 };
  const THR0 = { armA: 2.6, armE: 1.4, w: 0.9, lean: -0.2 }, THR1 = { armA: 1.15, armE: 0.1, w: 1.15, lean: 0.5 };
  const K = (t, o) => [t, o];
  // the flurry: six cuts, chop and rise in turn, then a thrust
  const flurry = (() => { const k = [K(0, BASE)]; for (let i = 0; i < 6; i++) { const a = i % 2 ? RISE0 : CHOP0, b = i % 2 ? RISE1 : CHOP1; k.push(K(0.1 + i * 0.15, a), K(0.2 + i * 0.15, b)); } k.push(K(1.12, THR0), K(1.22, THR1), K(1.5, THR1), K(1.8, BASE)); return k; })();

  G.EXECS = {
    decap: { dur: 1.3, hits: [0.55], decap: true, keys: [K(0, BASE), K(0.5, CHOP0), K(0.58, CHOP1), K(0.95, CHOP1), K(1.3, BASE)] },
    impale: { dur: 1.3, hits: [0.55], keys: [K(0, BASE), K(0.5, THR0), K(0.58, THR1), K(0.95, THR1), K(1.3, BASE)] },
    // a beast on the ground: the blade straight down through it
    pin: { dur: 1.45, hits: [0.6], text: 'PINNED', keys: [K(0, BASE), K(0.45, { armA: 3.3, armE: 0.3, w: 3.4, lean: -0.3, crouch: 2 }), K(0.6, { armA: 1.2, armE: 0.5, w: 0.25, lean: 0.55, crouch: 14, footF: 8, footB: -14 }), K(1.05, { armA: 1.2, armE: 0.5, w: 0.25, lean: 0.55, crouch: 14 }), K(1.45, BASE)],
      fin: (g, e) => { G.decal(e.x, 16, 60); G.sfx('thud'); } },
    // a flier caught in both hands and pulled apart
    wingtear: { dur: 1.5, hits: [0.75], text: 'TORN APART', keys: [K(0, BASE), K(0.3, { armA: 1.6, armE: 0.2, bA: 1.5, bE: 0.2, lean: 0.2 }), K(0.6, { armA: 1.9, armE: 0.2, bA: 1.7, bE: 0.2, lean: -0.1 }), K(0.75, { armA: 2.6, armE: 0.6, bA: 0.3, bE: 0.4, lean: -0.35 }), K(1.1, { armA: 2.6, armE: 0.6, bA: 0.3, bE: 0.4, lean: -0.3 }), K(1.5, BASE)],
      pre: (g, e, p) => { for (const k of ['armF', 'armB']) if (e.limbs[k] && !e.limbs[k].gone && !e.limbs[k].absent) e.sever(k, k === 'armF' ? p.facing : -p.facing, g); } },
    // a bloat: one thrust, and step back from the fountain
    burst: { dur: 1.35, hits: [0.5], text: 'RUPTURED', keys: [K(0, BASE), K(0.4, THR0), K(0.5, THR1), K(0.85, THR1), K(1.35, Object.assign({}, BASE, { footB: -18, lean: -0.2 }))],
      fin: (g, e) => { for (let i = 0; i < 4; i++) G.blood(e.x, G.GROUND - 50, 40, 0, 600); G.decal(e.x, 18, 80); g.shake = 14; G.sfx('sever'); }, step: -60 },
    // the big ones: a cut behind the knee, then the head while they kneel
    hamstring: { dur: 1.75, hits: [0.42, 0.95], decap: true, text: 'HAMSTRUNG', keys: [K(0, BASE), K(0.3, { armA: 1.0, armE: 0.2, w: 2.2, crouch: 12, lean: 0.1 }), K(0.42, { armA: 0.4, armE: 0.2, w: 1.4, crouch: 15, lean: 0.5 }), K(0.6, { armA: 0.4, w: 1.4, crouch: 10, lean: 0.3 }), K(0.85, CHOP0), K(0.95, CHOP1), K(1.35, CHOP1), K(1.75, BASE)],
      mid: (g, e, p) => { const [jx, jy] = e.joint('legF'); G.blood(jx, jy, 30, p.facing, 280); G.sfx('sever'); g.hitstop = 0.08; g.shake = 8; G.text(e.x, G.GROUND - 110 * e.scale, 'HAMSTRUNG', '#e0222c', 15); e.kneelT = 1; } },
    // skewered, lifted on the blade, then flung down
    skewer: { dur: 1.9, hits: [0.48, 1.42], text: 'SKEWERED', keys: [K(0, BASE), K(0.4, THR0), K(0.48, THR1), K(1.1, { armA: 2.4, armE: 0.2, w: 2.6, lean: -0.3 }), K(1.3, { armA: 2.9, armE: 0.2, w: 3.3, lean: -0.45 }), K(1.42, { armA: 1.2, armE: 0.2, w: 1.2, lean: 0.4, crouch: 6 }), K(1.6, { armA: 1.2, w: 1.2, lean: 0.4 }), K(1.9, BASE)],
      mid: (g, e, p) => { const [jx, jy] = e.joint('armF'); G.blood(jx, jy, 30, p.facing, 300); G.sfx('hit'); g.hitstop = 0.06; e.lifting = true; },
      fin: (g, e) => { e.lifting = false; e.lift = 0; G.decal(e.x, 16, 70); g.shake = 16; G.sfx('thud'); } },
    // six cuts and a thrust
    flurry: { dur: 1.8, hits: [0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1.22], text: 'CUT TO RIBBONS', keys: flurry,
      mid: (g, e, p, i) => { G.blood(e.x - p.facing * 4, G.GROUND - 60 * e.scale, 10, p.facing * (i % 2 ? -1 : 1), 260); G.sfx('swing'); G.sfx('hit'); g.hitstop = 0.03; } },
    // the Matron: by the hair, down into the black water, and held there until it stops
    drown: { dur: 2.6, hits: [0.45, 2.05], quiet: true, text: 'RETURNED TO THE WATER', close: 30, qte: { at: 0.62, time: 3.6 },
      keys: [K(0, BASE), K(0.35, { armA: 1.6, armE: 0.2, bA: 1.5, bE: 0.3, lean: 0.4, crouch: 6 }), K(0.6, { armA: 0.75, armE: 0.35, bA: 0.6, bE: 0.4, lean: 0.75, crouch: 18, head: 0.4, footF: 16, footB: -16 }), K(2.05, { armA: 0.7, armE: 0.35, bA: 0.55, bE: 0.4, lean: 0.8, crouch: 18, head: 0.45, footF: 16, footB: -16 }), K(2.6, BASE)],
      wobble: (P, t) => { if (t > 0.6 && t < 2.0) { const k = 1 - (t - 0.6) / 1.4; P.lean += Math.sin(t * 38) * 0.06 * k; P.armA += Math.sin(t * 31) * 0.08 * k; } },   // she fights it, less and less
      mid: (g, e) => { e.sinking = true; G.sfx('splat'); G.sfx('scream'); g.shake = 6; },
      fin: (g, e) => { e.sinking = false; e.struggle = 0; e.sinkTarget = null; e.sink = Math.max(e.sink || 0, 104 * e.scale); G.sfx('bell'); g.slow = 0.6; } },
    // the Standard-Bearer: strike the sword from his hands, salute him, run him through, and let the colours fall over him
    colours: { dur: 2.6, hits: [0.32, 1.28], text: 'RELIEVED OF DUTY',
      keys: [K(0, BASE), K(0.2, RISE0), K(0.32, RISE1), K(0.55, RISE1), K(0.8, { armA: 2.0, armE: 1.25, w: 3.14, lean: 0, head: 0.05, footF: 9, footB: -9 }), K(1.1, { armA: 2.0, armE: 1.25, w: 3.14, lean: 0, footF: 9, footB: -9 }), K(1.2, THR0), K(1.28, THR1), K(2.0, THR1), K(2.6, BASE)],
      mid: (g, e, p) => {   // the greatsword spins away
        e.disarmed = true; G.sfx('block'); G.sfx('guardbreak'); G.spark(e.x, G.GROUND - 70 * e.scale, 20); g.hitstop = 0.1; g.shake = 8;
        const [jx, jy] = e.joint('armF'); G.gib('weapon', jx, jy, p.facing, e.def.look, { wtype: e.def.weapon, wlen: e.def.wlen, scale: e.scale });
        G.text(e.x, G.GROUND - 150 * e.scale, 'DISARMED', '#d9c9b0', 15);
      },
      fin: (g, e) => { e.bannerT = 0; G.sfx('bell'); g.slow = 0.6; } },
    // kneel with them, and a slow thrust to the heart
    mercy: { dur: 2.1, hits: [1.1], quiet: true, text: 'AT REST', keys: [K(0, BASE), K(0.6, { crouch: 10, lean: 0.2, armA: 1.6, armE: 0.3, w: 1.5, head: 0.3, footF: 10, footB: -16 }), K(1.1, { crouch: 12, lean: 0.5, armA: 1.2, armE: 0.1, w: 1.15, head: 0.4 }), K(1.6, { crouch: 12, lean: 0.5, armA: 1.2, w: 1.15, head: 0.5 }), K(2.1, BASE)],
      fin: (g) => { G.sfx('bell'); g.slow = 0.8; } },
  };

  // who dies how
  const BOSS = {
    hangman: ['hamstring', 'THE HEADSMAN, HEADLESS'], matron: ['drown', 'RETURNED TO THE WATER'], garrick: ['mercy', 'THE DOOR IS OPEN'],
    bearer: ['colours', 'RELIEVED OF DUTY'], malvern: ['flurry', 'SEVEN CUTS'], abbess: ['mercy', 'WASHED CLEAN'], windcaller: ['hamstring', 'THE WIND FALLS STILL'],
    mothmother: ['mercy', 'THE LIGHT GOES OUT'], gravewarden: ['hamstring', 'HE KEEPS NO ONE NOW'], widow: ['flurry', 'THE FIRE GOES OUT'],
    crowking: ['wingtear', 'THE KING IS DEAD'], abbot: ['skewer', 'THE CHOIR IS SILENT'],
  };
  G.execKindFor = (e, p) => {
    const d = e.def;
    if (d.boss && BOSS[e.type]) return { kind: BOSS[e.type][0], text: BOSS[e.type][1] };
    if (d.model === 'hound') return { kind: 'pin' };
    if (d.fly) return { kind: 'wingtear' };
    if (d.burst) return { kind: 'burst' };
    if (d.boss || d.poise || e.scale >= 1.25) return { kind: 'hamstring' };
    if (p && p.weapon && p.weapon.draw === 'sword' && p.weapon.len < 30) return { kind: 'flurry' };   // the Seventh Knife cuts many times
    const r = Math.random(); return { kind: r < 0.4 ? 'decap' : r < 0.8 ? 'impale' : 'flurry' };
  };
  // the knight's pose at time t of a kind
  G.execPose = (P, kind, t) => {
    const keys = (G.EXECS[kind] || G.EXECS.decap).keys;
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, a] = keys[i], [t1, b] = keys[i + 1], u = G.clamp((t - t0) / Math.max(0.001, t1 - t0), 0, 1), e = G.ease ? G.ease(u) : u;
    for (const k of Object.keys(BASE)) { const va = a[k] != null ? a[k] : BASE[k], vb = b[k] != null ? b[k] : BASE[k]; P[k] = va + (vb - va) * e; }
    const X = G.EXECS[kind]; if (X && X.wobble) X.wobble(P, t);
  };
})();
