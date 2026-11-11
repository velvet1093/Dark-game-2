'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Gloamwater: a drowned mire east of the Weeping Fen, where the
// sickness first came up out of the ground. Its water is slow and deep:
// wading halves your pace and steals your jump, and the deep pools weep into
// you. The things that live here fly. Boardwalks on stilts keep you dry, if
// you can stay on them.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM, LV = G.LEVELS.length;   // the next free slot (9)

  Object.assign(G.LOOKS, {
    wren: { soft: 1, iris: '#7a9a4a', skin: '#a89a80', body: '#3a4230', trim: '#6a5a3a', arm: '#a89a80', leg: '#2a2e22', helm: 'hood', helmCol: '#4a5a34', hair: '#b8b0a0' },
    osk: { beard: '#5a5a4a', skin: '#8a8070', body: '#2a2a24', arm: '#2a2a24', leg: '#1e1e1a', helm: 'hood', helmCol: '#3a3a30' },
    pell: { skin: '#9a9088', body: '#c9a13b', trim: '#7a1a14', arm: '#5a5c60', leg: '#3d3f44', helm: 'helm', helmCol: '#6a6c70', plume: '#3a4a2a', eye: '#c20d16' },
  });
  Object.assign(G.ENEMIES, {
    bloodfly: {
      name: 'Bloodfly', model: 'bloodfly', fly: true, hp: 18, limbHp: 8, speed: 190, ichor: 12, aggro: 420, stop: 90, weapon: 'none', height: 20, limbs: ['head', 'armF', 'armB'],
      flyAlt: 96, diveAlt: 40, bob: 18,
      look: { skin: '#5a1018', body: '#3a2a20', arm: '#c8d0c0', leg: '#3a2a20', helm: 'none', eye: '#ff3b2f' },
      attacks: [{ wind: 0.3, active: 0.22, rec: 0.7, dmg: 6, reach: 38, trigger: 150, min: 40, lunge: 640, spew: 6, anim: A.claw }],
    },
    moth: {
      name: 'Weeping Moth', model: 'moth', fly: true, hp: 46, limbHp: 18, speed: 90, ichor: 40, aggro: 400, stop: 130, weapon: 'none', height: 34, limbs: ['head', 'armF', 'armB'],
      flyAlt: 150, diveAlt: 70, bob: 10,
      look: { skin: '#8a7a6a', body: '#4a3e34', arm: '#8a7a6a', leg: '#4a3e34', helm: 'none', eye: '#ff3b2f' },
      // it does not bite; it shakes its wings over you, and the dust is the sickness
      attacks: [{ wind: 0.6, active: 0.45, rec: 0.9, dmg: 8, reach: 120, trigger: 190, min: 0, lunge: 120, spew: 18, anim: A.claw }],
    },
    bogman: {
      name: 'Mire-Drowned', hp: 90, limbHp: 34, speed: 62, ichor: 60, aggro: 340, weapon: 'club', wlen: 28, hunch: 0.5, wade: true,
      look: { skin: '#5a6a4a', body: '#2a3022', arm: '#5a6a4a', leg: '#2a3022', helm: 'none', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.12, rec: 0.55, dmg: 18, reach: 62, lunge: 140, anim: A.chop },
        { wind: 0.7, active: 0.3, rec: 0.7, dmg: 8, reach: 110, trigger: 130, min: 30, lunge: 0, spew: 14, anim: A.claw },
      ],
    },
    mothmother: {
      name: 'The Lamplight Mother', boss: true, model: 'mothgirl', fly: true, hp: 470, limbHp: 140, speed: 120, ichor: 1300, aggro: 9999, stop: 150, weapon: 'none', height: 60, limbs: ['head', 'armF', 'armB'],
      scale: 1.0, poise: true, noSever: ['armF', 'armB'], shout: 'SHE COMES TO THE LIGHT', flyAlt: 125,
      spawn: { type: 'moth', every: 8, first: 4, max: 3, text: 'SHE CALLS THE MOTHS' }, diveAlt: 46, bob: 16,
      summon: { type: 'bloodfly', at: [0.7, 0.4], n: 3, text: 'HER CHILDREN WAKE' },
      look: { skin: '#9a8468', body: '#4a3a2c', arm: '#9a8468', leg: '#4a3a2c', helm: 'none', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.55, active: 0.3, rec: 0.9, dmg: 26, reach: 90, trigger: 260, min: 60, lunge: 700, anim: A.claw },
        { wind: 0.7, active: 0.5, rec: 0.9, dmg: 10, reach: 190, trigger: 230, min: 0, lunge: 80, spew: 24, anim: A.claw },
      ],
    },
  });
  G.ICON_NAMES.push('The Saint by the Black Water', 'The Saint among Moths', 'The Saint and the Ferryman');

  // ---- sprites for the new flyers
  const T = c => ({ b: c, s: G.shade(c, 0.62), l: G.shade(c, 1.35) });
  const GORE = '#7a0509', BONE = '#d9c9b0';
  function bloodfly(ctx, e, time) {
    const { R } = G.spr.open(64, 60), L = e.def.look, lm = e.limbs, st = e.state, B = T(L.body), Bl = T(L.skin);
    const y0 = G.GROUND - 8 - e.alt, up = Math.floor(time * 30 + e.id) % 2;
    const wing = (gone, ox) => { if (gone) { R(ox, -3, 2, 2, GORE); return; } if (up && !e.dead) { R(ox - 3, -9, 5, 6, 'rgba(210,220,210,0.55)'); R(ox - 2, -9, 3, 1, '#e8eee8'); } else { R(ox - 6, -4, 7, 3, 'rgba(210,220,210,0.55)'); R(ox - 6, -4, 7, 1, '#e8eee8'); } };
    wing(lm.armB.gone, 2);
    R(-7, -1, 6, 4, Bl.b); R(-8, 0, 2, 2, Bl.s); R(-6, -1, 3, 1, Bl.l);                                    // a belly swollen with blood
    R(-2, -2, 5, 4, B.b); R(-1, -2, 3, 1, B.l);
    if (lm.head.gone) R(3, -2, 2, 2, GORE); else { R(3, -3, 4, 4, B.b); R(4, -3, 2, 2, e.dead ? '#000' : L.eye); R(7, -1, 4, 1, '#2a1a14'); }   // the proboscis
    R(-1, 2, 1, 3, B.s); R(1, 2, 1, 3, B.s);
    wing(lm.armF.gone, 0);
    G.spr.close(ctx, e.x, y0, { facing: e.facing, flash: e.flash > 0, rot: st === 'strike' ? 0.5 : e.dead ? 0.4 : 0 });
    e.out = { head: [e.x + e.facing * 8, y0 - 4], sh: [e.x, y0 - 2], hip: [e.x - e.facing * 6, y0] };
  }
  function moth(ctx, e, time) {
    const { R } = G.spr.open(64, 60), L = e.def.look, lm = e.limbs, st = e.state, B = T(L.body), W = T(L.skin), sc = e.def.scale || 1;
    const y0 = G.GROUND - 10 * sc - e.alt, down = e.dead || st === 'broken', beat = down ? 0.15 : 0.5 + Math.sin(time * 9 + e.id) * 0.5;   // 1 = wings up, 0 = wings flat
    // forewing: a long slanted blade swept up and back, its tip rising with the beat; hindwing: a rounded lobe below it
    const wing = (gone, front) => {
      const c = front ? W : { b: W.s, s: G.shade(L.skin, 0.4), l: W.s };
      if (gone) { R(-2, -4, 3, 3, GORE); R(-1, -3, 1, 1, BONE); return; }
      const lift = 4 + beat * 14, span = 18;
      for (let i = 0; i <= span; i++) {
        const k = i / span, x = 1 - i, mid = -1 - Math.round(lift * k), half = Math.max(1, Math.round(4.5 * Math.sin(Math.PI * Math.min(1, k * 1.08))));
        R(x, mid - half, 1, half * 2 + 1, c.b); R(x, mid - half, 1, 1, c.l); R(x, mid + half, 1, 1, c.s);
        if (i % 4 === 3) R(x, mid - half + 1, 1, half * 2 - 1, c.s);   // veins
      }
      const ek = 0.62, ex = 1 - Math.round(span * ek), ey = -1 - Math.round(lift * ek);
      R(ex - 1, ey - 1, 3, 3, '#1a100c'); R(ex, ey, 1, 1, front ? '#e0b040' : '#8a7030');   // the eye on the wing
      for (let i = 0; i < 8; i++) { const h = Math.round(3.5 * Math.sin(Math.PI * (i + 1) / 9)); R(-1 - i, 3, 1, h + 1, i === 7 ? c.s : c.b); }   // hindwing
    };
    wing(lm.armB.gone, false);
    R(-5, -1, 9, 5, B.b); R(-7, 0, 3, 3, B.s); for (let i = -4; i < 4; i += 2) R(i, -1, 1, 5, B.s); R(-3, 3, 6, 1, B.l);   // a furred, ringed body
    if (lm.head.gone) { R(4, -3, 3, 3, GORE); R(5, -2, 1, 1, BONE); }
    else {
      R(4, -3, 4, 4, B.l); R(6, -2, 2, 2, e.dead ? '#000' : L.eye);
      R(5, -7, 1, 4, B.s); R(4, -8, 1, 1, B.s); R(3, -9, 1, 1, B.s); R(7, -7, 1, 4, B.s); R(8, -8, 1, 1, B.s); R(9, -9, 1, 1, B.s);   // feathered antennae
    }
    wing(lm.armF.gone, true);
    if (!e.dead && Math.random() < 0.4) R(-6 + Math.random() * 12, 6 + Math.random() * 5, 1, 1, '#c8b8e0');   // the dust
    G.spr.close(ctx, e.x, y0, { facing: e.facing, flash: e.flash > 0, scale: sc, rot: st === 'strike' ? 0.35 : e.dead ? 0.6 : 0 });
    e.out = { head: [e.x + e.facing * 12 * sc, y0 - 6 * sc], sh: [e.x, y0 - 3 * sc], hip: [e.x - e.facing * 8 * sc, y0] };
  }
  // The Lamplight Mother: a moth girl, seen from the front, wings spread. Hovering, wings raised to wind up, tilted into a dive, slumped when broken.
  function mothgirl(ctx, e, time) {
    const sh = (c, k) => G.shade(c, k), T = c => ({ b: c, s: sh(c, 0.62), l: sh(c, 1.3) });
    const { R, E, line } = G.spr.open(64, 78);
    const st = e.state, down = e.dead || st === 'broken' || st === 'executed', wind = st === 'windup', strike = st === 'strike';
    const sc = (e.def && e.def.scale) || 1.6, lm = e.limbs || { head: {}, armF: {}, armB: {} };
    const beat = down ? 0 : wind ? 1 : 0.5 + Math.sin(time * 9 + (e.id || 0)) * 0.5;
    const WG = T('#8a6478'), WD = T('#5a3c4e'), BAND = '#d8c4b4', EDGE = '#3a2432', FUR = T('#efe6d6'), SK = T('#e8d6c8'), DR = T('#2e2030'), HAIR = T('#e6d8b4'), GOLD = '#d8b860';
    const cower = e.wingless && down && !e.dead && !e.calm, by = cower ? 11 : down ? 6 : 0;   // without her wings she curls up small
    const pull = e.ripPull || 0, pside = e.ripSide || 1;                          // a wing being dragged out toward the knight
    // ---- wings: forewing with a pale band and a dark scalloped edge; rounded hindwing below; a wing-eye on each
    const lift = down ? -8 : Math.round(beat * 10);
    const wing = (gone, side) => {
      if (gone) { R(side * 5, -26 + by, 3, 3, '#7a0509'); R(side * 5 + (side > 0 ? 1 : 0), -23 + by, 1, 2 + Math.round((time * 3) % 3), '#a00a12'); return; }   // torn stumps, still dripping
      const ox = side === pside ? Math.round(pull * 12 + (pull > 0 ? Math.sin(time * 40) * pull * 1.5 : 0)) * side : 0;
      for (let i = 0; i < 24; i++) {
        const k = i / 24, x = (side > 0 ? 4 + i : -4 - i) + ox;
        const top = -30 - Math.round(lift * Math.sin(k * 2.4)) - Math.round(11 * Math.sin(k * 2.6)) + by + (i % 3 === 2 && i > 14 ? 1 : 0), bot = -21 + Math.round(3 * k) + by + (down ? Math.round(k * 6) : 0);
        R(x, top, 1, bot - top, WG.b); R(x, top, 1, 2, EDGE);
        const band = top + Math.round((bot - top) * 0.45); R(x, band, 1, 2, i > 3 ? BAND : WG.b);       // the pale band
        if (i > 18) R(x, top, 1, bot - top, WG.s);                                                     // dark tip
        if (i > 2 && i < 19) { const ht = bot, hb = bot + Math.round(11 * Math.sin(Math.PI * (i - 2) / 17)); R(x, ht, 1, hb - ht, WD.b); R(x, hb - 1, 1, 1, EDGE); if (i % 4 === 1) R(x, ht + 1, 1, hb - ht - 2, WD.s); }
      }
      if (ox) for (let y = -28; y < -20; y += 2) R(side > 0 ? 3 : -4 + ox, y + by, ox * side > 0 ? Math.abs(ox) : 1, 1, '#c03040');   // the wing-root, stretched raw
      const ex = side * 13 + ox, ey = -36 - Math.round(lift * 0.7) + by;
      E(ex, ey, 2, 2, '#efe6d6'); R(ex - 1, ey - 1, 3, 3, '#1a100c'); R(ex, ey, 1, 1, '#e0b040');                   // wing-eye
      const hx = side * 10 + ox, hy = -14 + by + (down ? 4 : 0); R(hx - 1, hy, 3, 2, '#1a100c'); R(hx, hy, 1, 1, '#ff3b2f'); // a smaller eye on the hindwing
    };
    wing((lm.armB && lm.armB.gone) || e.wingless, -1); wing((lm.armF && lm.armF.gone) || e.wingless, 1);
    // ---- legs: dark stockings, dangling (kneeling when down)
    if (down) { R(-6, -4, 5, 3, DR.s); R(2, -4, 5, 3, DR.s); R(-7, -2, 2, 2, '#140c12'); R(6, -2, 2, 2, '#140c12'); }
    else { const sw = Math.round(Math.sin(time * 4)); R(-3 + sw, -10, 2, 8, '#2a1e2a'); R(2 + sw, -10, 2, 7, '#2a1e2a'); R(-3 + sw, -2, 2, 1, '#140c12'); R(2 + sw, -3, 2, 1, '#140c12'); }
    // ---- dress: dark bodice, a full skirt with a fluffy pale fur hem
    for (let y = -23; y < -12; y++) { const w = 3 + Math.round((y + 23) * 0.55); R(-w, y + by, w * 2 + 1, 1, DR.b); R(-w, y + by, 2, 1, DR.s); R(w - 1, y + by, 1, 1, DR.l); }
    for (let x = -9; x <= 9; x++) { R(x, -13 + by, 1, 2, FUR.b); if (x & 1) R(x, -11 + by, 1, 1, FUR.s); }
    R(-1, -22 + by, 3, 6, '#5a3c4e'); R(0, -21 + by, 1, 1, GOLD);                                                       // a little lamp-pendant on the bodice
    // ---- arms
    const arm = (side, gone) => {
      if (gone) return;
      const sx = side * 4, sy = -24 + by; let hx, hy;
      if (cower) { hx = side * 3; hy = -44 + by; } else if (wind) { hx = side * 13; hy = -33 + by; } else if (strike) { hx = 10 + (side < 0 ? 2 : 0); hy = -19 + by; } else if (down) { hx = side * 4; hy = -12 + by; } else { hx = side * 7; hy = -16 + by; }
      line(sx, sy, hx, hy, DR.b, 2); R(hx - 1, hy - 1, 3, 3, SK.b); R(hx + (side > 0 ? 1 : -1), hy + 2, 1, 1, '#2a1a1a');
    };
    arm(-1, lm.armB && lm.armB.gone);
    // ---- the fur ruff
    E(0, -25 + by, 7, 3, FUR.b); for (let x = -7; x <= 7; x += 2) R(x, -23 + by, 1, 2, FUR.s); R(-5, -27 + by, 10, 1, FUR.l);
    // ---- head: soft lilac-grey hair, big dark moth eyes with a highlight, red tears
    if (lm.head && lm.head.gone) { R(-2, -30 + by, 5, 3, '#7a0509'); R(0, -29 + by, 1, 1, '#d9c9b0'); }
    else {
      const hy = -36 + by + (down ? 2 : 0) + (cower ? 2 : 0);
      E(0, hy - 1, 8, 7, HAIR.b); R(-8, hy, 3, 9, HAIR.b); R(6, hy, 3, 9, HAIR.b); R(-8, hy + 4, 1, 5, HAIR.s); R(8, hy + 4, 1, 5, HAIR.s);   // fluffy bob
      E(0, hy + 2, 5, 5, SK.b); R(-4, hy + 6, 9, 1, SK.s);                                                                                 // face
      R(-6, hy - 5, 13, 3, HAIR.b); R(-4, hy - 6, 8, 1, HAIR.l); R(-5, hy - 2, 2, 2, HAIR.b); R(-1, hy - 2, 2, 1, HAIR.b); R(4, hy - 2, 2, 2, HAIR.b);   // fringe
      if (cower) { R(-4, hy + 2, 3, 1, '#1a0e16'); R(-3, hy + 1, 1, 1, '#1a0e16'); R(2, hy + 2, 3, 1, '#1a0e16'); R(3, hy + 1, 1, 1, '#1a0e16'); }   // eyes squeezed shut
      else { R(-4, hy + 1, 3, 3, '#1a0e16'); R(2, hy + 1, 3, 3, '#1a0e16'); R(-4, hy + 1, 1, 1, '#ffffff'); R(2, hy + 1, 1, 1, '#ffffff'); }     // big moth eyes
      R(-2, hy + 3, 1, 1, '#c03040'); R(4, hy + 3, 1, 1, '#c03040');                                                                    // red glint
      R(-5, hy + 4, 1, 1, '#e8a0a8'); R(5, hy + 4, 1, 1, '#e8a0a8');                                                                    // blush
      if (!e.dead) { R(-3, hy + 4, 1, 3, '#a00a12'); R(3, hy + 4, 1, 2, '#a00a12'); } else { R(-4, hy + 2, 3, 1, '#1a0e16'); R(2, hy + 2, 3, 1, '#1a0e16'); }
      R(0, hy + 5, 1, 1, strike || wind ? '#5a1018' : SK.s);
      for (let i = 0; i < 9; i++) { const ax = 2 + Math.round(i * 0.7), ay = hy - 7 - i; R(ax, ay, 1, 1, GOLD); R(-ax, ay, 1, 1, GOLD); if (i % 2 === 0 && i > 1) { R(ax + 1, ay, 2, 1, sh(GOLD, 0.7)); R(-ax - 2, ay, 2, 1, sh(GOLD, 0.7)); } }   // feathered antennae
    }
    arm(1, lm.armF && lm.armF.gone);
    if (cower) {   // hands clutched over her head, knees drawn up
      for (const sd of [-1, 1]) { line(sd * 6, -24 + by, sd * 7, -36 + by, DR.b, 2); line(sd * 7, -36 + by, sd * 2, -42 + by, DR.b, 2); R(sd * 2 - 1, -43 + by, 3, 3, SK.b); }
      R(-7, -12 + by, 5, 3, '#2a1e2a'); R(3, -12 + by, 5, 3, '#2a1e2a');
    }
    if (!e.dead && Math.random() < 0.5) R(-10 + Math.random() * 20, -2 + Math.random() * 6, 1, 1, '#d8c8f0');   // dust
    const shiver = cower ? (Math.floor(time * 28) % 2 ? 2 : -2) : pull > 0 ? Math.round(Math.sin(time * 50) * 2) : 0;   // she trembles
    G.spr.close(ctx, e.x + shiver, G.GROUND - 4 * sc - e.alt, { facing: e.facing, flash: e.flash > 0, scale: sc, rot: strike ? 0.32 : e.dead ? 0.5 : 0 });
    e.out = { head: [e.x, G.GROUND - e.alt - 4 * sc - 36 * 2 * sc], sh: [e.x, G.GROUND - e.alt - 24 * 2 * sc], hip: [e.x, G.GROUND - e.alt - 12 * 2 * sc] };
  }
  G.drawMothGirlSprite = mothgirl;
  const prev = G.drawBeast;
  G.drawBeast = (ctx, e, t) => (e.def.model === 'bloodfly' ? bloodfly : e.def.model === 'moth' ? moth : e.def.model === 'mothgirl' ? mothgirl : prev)(ctx, e, t);

  // ---- the way in: an old causeway east out of the fen, past where the Matron fell
  G.LEVELS[2].passages = (G.LEVELS[2].passages || []).concat([{ x: 5400, to: LV, at: 120, label: 'Wade east into the Gloamwater',
    wist: 'East? Into the black water? It is where the weeping comes from, you know. I am not supposed to tell you that.',
    slides: ['The causeway goes under the water, and you go with it.\n\nThe fen thins into something older: drowned trees, drowned roofs, drowned bell-towers leaning in the mud.\n\nThe water is warm. It should not be warm.'] }]);

  // ---- the water: [x, w, deep]
  const WATERS = [[480, 520, 0], [1150, 380, 1], [1700, 600, 0], [2420, 300, 1], [2900, 700, 0], [3780, 460, 1], [4400, 520, 0], [5080, 360, 1]];
  G.LEVELS.push({
    name: 'The Gloamwater', chapter: 'East of the Weeping Fen', theme: 'swamp', length: 6200, seed: 149,
    back: { to: 2, at: 5460 }, backLabel: 'Wade back west to the fen',
    shrines: [240, 3700],
    waters: WATERS.map(([x, w, deep]) => ({ x, w, deep: !!deep })),
    enemies: [['bloodfly', 560], ['bloodfly', 600], ['bogman', 800], ['moth', 1250], ['bogman', 1380], ['bloodfly', 1800], ['bloodfly', 1840], ['bloodfly', 1880],
      ['bogman', 2100], ['moth', 2500], ['wretch', 2700], ['bogman', 3100], ['moth', 3300], ['bloodfly', 3350], ['bloodfly', 3390],
      ['moth', 4000], ['bogman', 4150], ['bloodfly', 4500], ['bloodfly', 4540], ['bogman', 4700], ['moth', 5250], ['bloodfly', 5300, 'unfair'], ['bloodfly', 5340, 'unfair']],
    npcs: [
      { id: 'osk', x: 330, name: 'Osk the Ferryman', look: 'osk', pose: 'stand', essential: true,
        lines: [
          ['Osk', 'No coin. I have not taken coin in three years. Nobody goes anywhere worth paying for.'],
          ['Osk', 'Mind the water. Ankle-deep, it slows you. Waist-deep, it gets in. It is warm, see. It is the only warm thing left in Morrowmere, and it is warm because it is sick.'],
          ['Osk', 'Stay on the boards where you can. The flies cannot drink what they cannot reach. ...That is not true. Stay on the boards anyway.'],
        ],
        repeat: [['Osk', 'Boards. Not water. Boards.']] },
      { id: 'wren', x: 2300, name: 'Hagge Wren, the Mire-Wife', look: 'wren', pose: 'stand', essential: true,
        lines: [
          ['Hagge Wren', 'A knight. With a Tear in his pocket and a fairy on his head. I have been waiting for one of you. Well, for anyone. I would have taken a goat.'],
          ['Hagge Wren', 'Thirty years I have studied this water. Listen. The weeping did not start with your Saint. It came up out of the mire the summer before her eyes ran red. Out of the old spring under Saint Hild\'s.'],
          ['Hagge Wren', 'Your girl did not make the sickness, knight. She drank it. She stood between the spring and the world and let it run into her instead. That is what a saint is, out here.'],
          ['Knight', 'And the Tear?'],
          ['Hagge Wren', 'The Tear does not cure anything. It moves the sickness from one vessel to another. Somebody always has to hold it. Unless...'],
          ['Hagge Wren', 'Unless the spring is stopped. Then nobody has to be the well. Not her. Not you.'],
          ['Misery', 'Oh, do not give him HOPE. He goes all square in the shoulders.'],
        ],
        repeat: [['Hagge Wren', 'The spring. Under Saint Hild\'s. At the end of the black water. Nobody has to be the well.']] },
      { id: 'pell', x: 4300, name: 'Ser Pell', look: 'pell', pose: 'kneel', essential: true,
        lines: [
          ['Ser Pell', 'Stop there. Number?'],
          ['Knight', 'I do not remember it.'],
          ['Ser Pell', 'Doesn\'t matter. I know the walk. Long Battalion. I went over the side of the Sun the night we sighted land, and I swam, and I came here, because I could not bear to bring it home.'],
          ['Ser Pell', 'I brought it home anyway. Look at my eyes. It was in me the whole voyage.'],
          ['Ser Pell', 'The Mother is past the drowned chapel. She came to my lantern, the first night. She comes to every light. Your little friend glows, brother. Mind that.'],
          ['Misery', 'Everyone always wants me. It is exhausting.'],
        ],
        linesNamed: [
          ['Ser Pell', 'Stop there. Number?'],
          ['Knight', 'No number. Corin.'],
          ['Ser Pell', '...Corin. Three-forty. You were three-forty, and I was three-forty-one, and we stood next to each other at the muster in the rain.'],
          ['Ser Pell', 'Your sister was shouting at the barrier. I heard her. I heard your name. I am sorry, I always meant to tell you.'],
          ['Ser Pell', 'The Mother is past the drowned chapel. She comes to every light. Your little friend glows, Corin. Mind that.'],
        ],
        repeat: [['Ser Pell', 'Go on. I will keep the number for you.']] },
    ],
    lore: [
      { x: 1600, title: 'Marker Stone', text: 'HERE STOOD HILDSMERE, A VILLAGE OF FORTY HEARTHS.\n\nThe water rose over it in a single night, warm as a bath. In the morning the drowned were walking in it, and weeping.\n\nThat was the first summer.' },
      { x: 3550, title: "Wren's Daybook", text: 'Day 1,104. The spring is louder. I can hear it through the floor of the hut, like someone breathing in the next room.\n\nDay 1,105. Took a jar of it to the light. It is not water. It is tears. Whose?\n\nDay 1,106. The moths came for the lantern. I did not light it again.' },
      { x: 5900, title: 'Door of Saint Hild\'s', text: 'A chapel door, half under the water, bound in black roots as thick as a man. Behind it something breathes, slow and wet and enormous.\n\nThe roots do not give. Not to steel, not to light.\n\nNot yet.' },
    ],
    items: [{ x: 1280, alt: 72, icon: 1 }, { x: 2560, id: 'blacklily' }, { x: 3950, id: 'blacklily' }, { x: 5200, id: 'blacklily' }, { x: 3300, alt: 120, icon: 1 }, { x: 4620, icon: 1, gate: 'veil' }, { x: 2050, cache: 300 }],
    // boardwalks on stilts: dry, if you can stay on them
    platforms: [{ x: 520, w: 160, h: 50 }, { x: 760, w: 140, h: 50 }, { x: 1180, w: 160, h: 72 }, { x: 1740, w: 180, h: 50 }, { x: 1990, w: 150, h: 50 }, { x: 2450, w: 110, h: 60 },
      { x: 2940, w: 170, h: 50 }, { x: 3180, w: 90, h: 72 }, { x: 3250, w: 100, h: 120 }, { x: 3820, w: 150, h: 60 }, { x: 4440, w: 160, h: 50 }, { x: 5110, w: 110, h: 60 }],
    pits: [{ x: 2790, w: 70 }],
    boss: {
      type: 'mothmother', gate: 5450, x: 5680, end: 5860, wings: true,
      spareWingless: [
        ['The Lamplight Mother', '...don\'t... don\'t... Mother is sorry... Mother is sorry...'],
        ['Knight', 'Go.'],
        ['The Lamplight Mother', 'She drags herself away into the reeds on her hands, without looking back. The moths go with her, the way they always went with her light.'],
      ],
      wingsLines: [['Misery', 'Her wings. Corin. Knight. Whoever you are. Take her WINGS.'], ['The Lamplight Mother', '...no... no, not the wings... Mother needs them for the light...'], ['Knight', 'You will not need them now.']],
      intro: [
        ['Misery', 'Oh. Oh no. She is looking at me. Why is she looking at ME?'],
        ['The Lamplight Mother', '...light... little light... come to Mother...'],
        ['Misery', 'Absolutely not. Corin. Knight. Whoever you are. Kill it. KILL IT.'],
      ],
      retry: [['The Lamplight Mother', '...little light...']],
      lastWords: [['The Lamplight Mother', '...the spring... the spring is so warm... it called us up... it calls everything up...'], ['Misery', 'Well. Do not just stand there. Finish it before she says anything else true.']],
    },
  });

  // Hagge Wren's work: three black lilies, and the long road to the spring.
  G.QUESTS.blacklily = {
    title: 'Black Lilies', start: { talk: 'wren' }, giver: 'wren', reward: { flask: 1 },
    offer: [['Hagge Wren', 'Make yourself useful. Black lilies grow in the deep water: three of them. Pull them up, roots and all, and I will brew you something that keeps the cold out of your blood.']],
    waiting: [['Hagge Wren', 'Three black lilies. The deep water. Roots and all.']],
    steps: [
      { type: 'collect', item: 'blacklily', n: 3, text: 'Pull three black lilies out of the Gloamwater\'s deep pools' },
      { type: 'talk', npc: 'wren', text: 'Bring the lilies to Hagge Wren', lines: [
        ['Hagge Wren', 'Good roots. Sit. Drink. It tastes like a drowned man\'s boot, which is how you know it is working.'],
        ['Hagge Wren', 'There. One more swallow of the good water in you, whenever you need it.'],
      ] },
    ],
  };
  G.QUESTS.spring = {
    title: 'The Black Spring', start: { talk: 'wren' }, giver: 'wren',
    steps: [
      { type: 'read', lore: LV + ':2', text: 'Find the door of Saint Hild\'s, at the end of the Gloamwater' },
      { type: 'flag', flag: 'spring_open', text: 'Find a way through the roots into the spring (the way is not open yet)' },
    ],
  };

  // ---- moth wings: on the knight's back when he double-jumps or glides, and the torn pair fluttering down
  const MW = { b: '#8a6478', s: '#5a3c4e', band: '#d8c4b4', edge: '#3a2432' };
  const px = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, w * 2, h * 2); };
  // one wing from the shoulder (x, y), swept back (dir = which way the body faces) and up; open 0..1
  const wingShape = (ctx, x, y, dir, slope, far, t, span = 22) => {   // slope: how steeply the forewing rises (0 = straight out behind)
    for (let i = 0; i <= span; i++) {
      const k = i / span, cx = x - dir * i * 2, mid = -Math.round(i * slope), half = Math.max(1, Math.round(7 * Math.sin(Math.PI * Math.min(1, k * 1.05))));
      px(ctx, cx, y + (mid - half) * 2, 1, half * 2 + 1, far ? MW.s : MW.b);
      px(ctx, cx, y + (mid - half) * 2, 1, 1, MW.edge); px(ctx, cx, y + (mid + half) * 2, 1, 1, MW.edge);
      if (!far && i > 2 && i < span - 1) px(ctx, cx, y + (mid + Math.round(half * 0.2)) * 2, 1, 1, MW.band);   // the pale band
      if (i > 0 && i < 13) { const hk = i / 13, ht = mid + half, hb = Math.round(4 + 9 * Math.sin(Math.PI * hk)) - Math.round(i * slope * 0.25);   // hindwing below
        if (hb > ht) { px(ctx, cx, y + ht * 2, 1, hb - ht, far ? MW.edge : MW.s); px(ctx, cx, y + hb * 2, 1, 1, MW.edge); } }
    }
    if (!far) { const ei = 12, ex = x - dir * ei * 2, ey = y - Math.round(ei * slope) * 2; px(ctx, ex - 2, ey - 2, 3, 3, '#1a100c'); px(ctx, ex, ey, 1, 1, '#e0b040'); px(ctx, ex - 2, ey - 2, 1, 1, '#efe6d6'); }   // the eye on the wing
  };
  // gliding: held out wide and nearly flat, trembling; double jump (k 1 -> 0): one hard downward beat
  // vis 0..1: the wings unfold as they appear and fold down and fade as they go, never just vanish
  G.drawPlayerWings = (ctx, x, y, facing, k, t, glide, vis = 1) => {
    if (vis <= 0.02) return;
    const open = glide ? 0.42 + Math.sin(t * 18) * 0.03 : -0.25 + k * 1.35, folded = 1.6;   // folded: tucked up tight behind the shoulders
    const slope = folded + (open - folded) * vis, span = Math.max(4, Math.round(22 * (0.35 + 0.65 * vis)));
    ctx.save(); ctx.globalAlpha = Math.min(1, vis * 1.3);
    wingShape(ctx, x + facing * 4, y - 6, facing, slope + 0.3, true, t + 0.3, span);
    wingShape(ctx, x, y, facing, slope, false, t, span);
    ctx.restore();
  };
  const fallen = [];
  // ---- slowing water
  const inWater = (L, x) => (L.waters || []).find(w => x > w.x && x < w.x + w.w);
  G.swamp = {
    inWater,
    dropWings(g, x, y) { fallen.length = 0; for (const d of [-1, 1]) fallen.push({ x: x + d * 10, y, vx: d * 90, vy: -120, dir: d, t: 0, lv: g.levelIdx }); },
    // the wing in the knight's fist, flung away; and the other, torn loose and falling
    throwWings(g, hx, hy, dir, bx, by) { fallen.length = 0; fallen.push({ x: hx, y: hy, vx: dir * 220, vy: -200, dir: -dir, t: 0, lv: g.levelIdx }); fallen.push({ x: bx - dir * 14, y: by, vx: -dir * 60, vy: -60, dir, t: 0, lv: g.levelIdx }); },
    drawHeld(ctx, x, y, dir, t) { wingShape(ctx, x, y, -dir, 0.9 + Math.sin(t * 30) * 0.1, false, t, 16); },
    afterPlayer(g, px0, wasAir, dt) {
      const p = g.player, L = g.level, w = !g.inside && inWater(L, p.x), un = G.unfair();
      if (!w || p.dead) { g.wadeT = 0; return; }
      if (!wasAir && p.air && p.vy > 0 && p.alt < 20) { p.vy *= w.deep ? 0.62 : 0.74; p.alt = Math.min(p.alt, 4); }   // the mud holds on to your boots
      if (p.alt < 4) {
        const m = w.deep ? (un ? 0.3 : 0.38) : 0.55;
        if (!p.air || !wasAir) p.x = px0 + (p.x - px0) * m;
        if (Math.abs(p.x - px0) > 0.5 && (g.wadeT = (g.wadeT || 0) + dt) > 0.32) { g.wadeT = 0; G.sfx('splat'); g.splashes = (g.splashes || []).concat([{ x: p.x, t: 0 }]); }
        if (w.deep) p.infect(dt * (un ? 2.6 : 1.6), g);   // it is warm because it is sick
      }
      if (!g.toldWater) { g.toldWater = 1; g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.water)); }
    },
    afterEnemy(g, e, ex0) {
      if (e.def.fly || e.def.wade || e.alt > 4 || g.inside) return;
      const w = inWater(g.level, e.x); if (w) e.x = ex0 + (e.x - ex0) * (w.deep ? 0.45 : 0.65);
    },
    // the surface, behind everyone
    drawBack(ctx, g, t) {
      const gy = G.GROUND;
      for (const w of g.level.waters) {
        const d = w.deep ? 18 : 10;
        ctx.fillStyle = w.deep ? '#10302a' : '#1a3a30'; ctx.fillRect(w.x, gy - d, w.w, d + 70);
        ctx.fillStyle = 'rgba(30,60,50,0.9)'; for (let k = w.x + 10; k < w.x + w.w - 6; k += 18) ctx.fillRect(k, gy + 4 + (k % 5) * 6, 10, 2);   // reflections
        ctx.fillStyle = 'rgba(140,200,170,0.5)'; for (let k = w.x + 6; k < w.x + w.w - 10; k += 34) ctx.fillRect(k + ((t * 8 + k) % 12), gy - d, 12, 2);
      }
    },
    // the near lip of the water, over feet, paws and the hems of robes
    drawFront(ctx, g, t) {
      const gy = G.GROUND;
      for (const w of fallen) {   // the torn wings, fluttering down to lie in the mud
        if (w.lv !== g.levelIdx) continue;
        if (w.y < gy - 6) { w.t += 1 / 60; w.vy += 260 / 60; w.vy = Math.min(w.vy, 60); w.vx *= 0.97; w.x += w.vx / 60 + Math.sin(w.t * 6) * 0.8; w.y += w.vy / 60; }
        wingShape(ctx, w.x, w.y, w.dir, w.y < gy - 6 ? 0.5 + Math.sin(w.t * 9) * 0.35 : 0.08, false, 0, 18);
      }
      g.splashes = (g.splashes || []).filter(sp => (sp.t += 1 / 60) < 0.5);
      for (const sp of g.splashes) { const r = 6 + sp.t * 40; ctx.fillStyle = `rgba(170,200,150,${0.6 - sp.t})`; ctx.fillRect(sp.x - r, gy - 12, 4, 2); ctx.fillRect(sp.x + r - 4, gy - 12, 4, 2); ctx.fillRect(sp.x - 2, gy - 14 - sp.t * 30, 2, 3); }
      for (const w of g.level.waters) {
        const d = w.deep ? 16 : 8;
        ctx.fillStyle = w.deep ? 'rgba(16,48,40,0.82)' : 'rgba(26,58,48,0.7)'; ctx.fillRect(w.x, gy - d, w.w, d + 4);
        ctx.fillStyle = 'rgba(170,230,200,0.6)'; for (let k = w.x; k < w.x + w.w - 8; k += 22) ctx.fillRect(k + Math.round(Math.sin(t * 1.6 + k) * 3), gy - d, 8, 2);
        if (w.deep) { ctx.fillStyle = 'rgba(180,40,60,0.5)'; for (let k = w.x + 20; k < w.x + w.w - 20; k += 70) { const ph = (t * 0.7 + k * 0.13) % 1; ctx.fillRect(k, gy - d - 2 - ph * 6, 2, 2); } }   // it bubbles red
      }
    },
  };
})();
