'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — boss designs, after the concept sheet. Each boss keeps the
// animated body every figure uses, but it is stretched to its own build (the
// brutes broad, the wraiths tall), recoloured, and dressed: pieces behind the
// body (cattails, a coffin, a halo, shards of ice) are drawn first, pieces in
// front (hoods, masks, chains, tatters, a brazier) after. They hang off the
// joints the sprite reports, so they move with it.
// ---------------------------------------------------------------------------
(() => {
  // how broad and how tall, against an ordinary figure
  const SIZE = { hangman: [1.7, 1.38], matron: [1.5, 1.2], garrick: [1.6, 1.32], bearer: [1.38, 1.25], malvern: [1.3, 1.42], abbess: [1.3, 1.3], windcaller: [1.45, 1.2], gravewarden: [1.5, 1.25],
    widow: [1.4, 1.25], oathwarden: [1.5, 1.45], abbot: [1.35, 1.4], marshal: [1.72, 1.42], lightless: [1.3, 1.62], crowking: [1.4, 1.4], mothmother: [1, 1] };

  const LOOK = {
    hangman: { skin: '#8a7c7c', body: '#8a7c7c', trim: '#3a2418', arm: '#8a7c7c', leg: '#3a2a20', helm: 'sack', helmCol: '#4a3a30' },
    matron: { skin: '#9aa8a0', body: '#2a4a44', trim: '#4a6a60', arm: '#2a4a44', leg: '#22383a', helm: 'veil', helmCol: '#141a1a', skirt: 'long' },
    garrick: { body: '#4a4a54', trim: '#8a6a3a', arm: '#5c5c68', leg: '#34343c', helm: 'helm', helmCol: '#5c5c68', plume: null, cape: '#6a1a24' },
    bearer: { skin: '#8a7868', body: '#b8862a', trim: '#6a1a24', arm: '#6a6a70', leg: '#4a4038', helm: 'helm', helmCol: '#8a8a8c', plume: null, cape: '#6a1a24' },
    malvern: { body: '#e0d8c8', trim: '#8a1018', arm: '#8a1018', helm: 'mitre', helmCol: '#efe8da', cape: '#7a1420', skirt: 'long' },
    abbess: { body: '#d8d0c0', arm: '#d8d0c0', skirt: 'long' },
    windcaller: { helm: 'hood', helmCol: '#5a6a84', skin: '#a89488', hair: null, beard: '#e0e0e8', body: '#46526a', trim: '#8a7a5a', arm: '#5a6a84', leg: '#3a3430', cape: '#5a6a84' },
    gravewarden: { helm: 'hood', helmCol: '#4a4230', skin: '#6a5a50', body: '#4a5a34', trim: '#6a5a3a', arm: '#5a4a34', leg: '#3a3024' },
    widow: { skin: '#b8a8a0', body: '#1a1414', arm: '#1a1414', leg: '#141010', helm: 'hood', helmCol: '#141010', skirt: 'long', cape: '#1a1414' },
    abbot: { helm: 'hood', helmCol: '#e8f0f8', skin: '#b8c8d8', body: '#d0dcea', trim: '#8aa8c8', arm: '#d0dcea', skirt: 'long' },
    oathwarden: { skin: '#f4f0e8', body: '#f0ece0', trim: '#c9a13b', arm: '#c9a13b', leg: '#a8842a', helm: 'helm', helmCol: '#f4f0e8', plume: null, cape: '#c9a13b' },
    marshal: { body: '#7a1a1a', trim: '#c9a13b', arm: '#6a6a72', leg: '#4a4a52', helm: 'helm', helmCol: '#6a6a72', plume: null, cape: '#6a1420' },
    lightless: { helm: 'hood', helmCol: '#1e1a24', skin: '#eee8e0', hair: null, body: '#1a161e', trim: '#2e2836', arm: '#b8a8b8', leg: '#141018', cape: '#1a161e', eye: null },
  };
  for (const k in LOOK) if (G.ENEMIES[k]) { const L = Object.assign({}, G.ENEMIES[k].look, LOOK[k]); for (const q in L) if (L[q] === null) delete L[q]; G.ENEMIES[k].look = L; }

  // a pen for chunky pixels, anchored to a joint and mirrored with the facing
  const pen = (ctx, a, A) => (x, y, w, h, col) => { ctx.fillStyle = col; const X = a[0] + (A.f > 0 ? x : -x - w) * A.ux, Y = a[1] + y * A.uy; ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(w * A.ux)), Math.max(1, Math.round(h * A.uy))); };
  const glow = (ctx, x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  // a ragged hem: strips of uneven length
  const tatter = (p, x0, y, w, len, cols, seed = 0) => { for (let i = 0; i < w; i += 2) p(x0 + i, y, 2, len - ((i * 7 + seed * 3) % 5) - (i % 4 ? 0 : 2), cols[(i >> 1) % cols.length]); };

  const D = {
    hangman: {   // Gaunt: a slab of a man, the pointed sack hood, a coil of rope over one shoulder, iron on his wrists, a butcher's apron in rags
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-6, -8, 12, 4, '#4a3a30'); h(-4, -12, 8, 4, '#4a3a30'); h(-2, -16, 4, 4, '#4a3a30'); h(-1, -19, 2, 3, '#3a2c24'); h(3, -14, 1, 8, '#5e4c40'); h(-6, 5, 12, 3, '#4a3a30'); tatter(h, -6, 8, 12, 4, ['#4a3a30', '#3a2c24']);
        h(-3, -1, 2, 3, '#0a0606'); h(1, -1, 2, 3, '#0a0606');
        for (let k = 0; k < 4; k++) { s(-9 + k, -4 + k * 3, 4, 2, '#a8946a'); s(-9 + k, -3 + k * 3, 4, 1, '#7a6a48'); } s(-10, -5, 3, 12, '#8a7a50'); s(-9, 6, 2, 6, '#a8946a');   // the rope
        p(-6, -12, 12, 3, '#6a4a2a'); p(-5, -9, 10, 12, '#a8862a'); p(-5, -9, 10, 1, '#c8a84a'); p(-2, -6, 4, 6, '#8a1818'); p(-1, 0, 2, 3, '#6a1010'); tatter(p, -5, 3, 10, 6, ['#a8862a', '#8a6a1e'], 1);
        if (A.T) { const t = pen(ctx, A.S, A); t(5, 9, 4, 2, '#4a4a52'); t(5, 9, 4, 1, '#7a7a84'); }
      },
    },
    matron: {   // the Drowned Matron: up to her waist in the reeds, hair like weed over her face, a key on a cord, pale hands held out
      back(ctx, A) { const p = pen(ctx, A.P, A); for (const [x, hgt, sw] of [[-16, 26, 0], [-12, 32, 1], [11, 30, 2], [15, 24, 3], [-8, 20, 4]]) { const w = Math.round(Math.sin(A.t * 1.3 + sw) * 1); p(x + w, 12 - hgt, 1, hgt, '#4a6a3a'); p(x - 1 + w, 12 - hgt - 5, 3, 6, '#6a4a2a'); p(x + w, 12 - hgt - 7, 1, 2, '#8a7a4a'); } },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        for (let k = -7; k <= 6; k += 2) { const len = 15 + ((k * 7 + 30) % 9); h(k, -5, 2, len, k % 4 ? '#0e1414' : '#1a2422'); }
        h(-2, 1, 1, 1, '#ff3b2f'); h(2, 1, 1, 1, '#ff3b2f');
        s(-1, 4, 1, 6, '#8a7a50'); s(-2, 10, 3, 3, '#d8b050'); s(-1, 13, 1, 4, '#d8b050'); s(0, 15, 2, 1, '#d8b050'); s(-1, 11, 1, 1, '#2a4a44');   // the key
        s(8, 6, 4, 2, '#b8c0b8'); for (let f = 0; f < 3; f++) s(11 + f, 7 + f, 1, 4, '#c8d0c8');   // a hand, reaching
        p(-14, 11, 28, 2, '#1a2a2a'); p(-16, 12, 32, 1, '#2a4040'); p(7, 9, 4, 2, '#f4f0fa'); p(8, 8, 2, 1, '#e0b84a'); p(5, 11, 7, 1, '#3a5a3a');   // the water, and a lily on it
        tatter(p, -8, 4, 16, 8, ['#2a4a44', '#1e3836']);
        for (let d = 0; d < 3; d++) { const ph = (A.t * 1.4 + d * 0.33) % 1; ctx.fillStyle = 'rgba(150,200,190,0.7)'; ctx.fillRect(Math.round(A.H[0] + (d - 1) * 10), Math.round(A.H[1] + 20 * A.uy + ph * 40), 2, 3); }
      },
    },
    garrick: {   // Ser Garrick: a wall of grey plate, a baldric and chains across it, wide pauldrons, the red cape in rags
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-1, -11, 2, 5, '#3a3a44'); h(-6, 0, 12, 1, '#0a0606'); h(-4, 0, 2, 1, '#ff3b2f'); h(2, 0, 2, 1, '#ff3b2f'); h(-1, 2, 1, 4, '#3a3a44'); h(1, 2, 1, 4, '#3a3a44');
        s(-11, -4, 9, 5, '#6c6c78'); s(-11, -4, 9, 1, '#9a9aa6'); s(-10, 1, 7, 2, '#4a4a54'); s(3, -4, 8, 5, '#6c6c78'); s(3, -4, 8, 1, '#9a9aa6'); s(-10, -5, 1, 1, '#c9a13b'); s(9, -5, 1, 1, '#c9a13b');
        for (let k = 0; k < 9; k++) s(-6 + k * 1.3, 1 + k * 1.3, 3, 2, '#6a4a2a'); s(-1, 6, 3, 3, '#c9a13b');   // the baldric
        for (let k = 0; k < 6; k++) { s(6, 3 + k * 2, 1, 1, '#b8b8c0'); s(7, 4 + k * 2, 1, 1, '#8a8a94'); } s(5, 15, 3, 2, '#c9a13b');   // a chain, and what hangs on it
        p(-7, -3, 14, 2, '#3a2a1a'); p(-1, -4, 3, 4, '#c9a13b'); tatter(p, -7, -1, 5, 7, ['#4a4a54', '#34343c']); tatter(p, 3, -1, 5, 6, ['#4a4a54', '#34343c'], 2);
      },
    },
    bearer: {   // the Standard-Bearer: a kettle helm, a gold tabard in tatters, and the colours themselves on a tall pole at his back
      back(ctx, A) {
        const s = pen(ctx, A.S, A), wv = t => Math.round(Math.sin(A.t * 2.6 + t) * 1.4);
        s(-9, -46, 2, 64, '#5a4028'); s(-10, -48, 4, 3, '#c9a13b'); s(-9, -51, 2, 3, '#c9a13b');
        for (let r = 0; r < 18; r++) { const len = 26 - (r > 11 ? (r - 11) * 2 : 0) + ((r * 5) % 4) + wv(r * 0.4); s(-7, -44 + r, len, 1, r < 2 || r % 7 === 6 ? '#5a1018' : '#7a1a24'); }
        s(3, -40, 2, 10, '#d8c8a0'); s(0, -37, 8, 2, '#d8c8a0'); s(2, -32, 4, 1, '#d8c8a0'); s(14, -30, 4, 3, '#3a2e38'); s(10, -27, 3, 2, '#3a2e38');   // a cross on the red, and the holes in it
      },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-9, -3, 18, 2, '#9a9a9c'); h(-9, -2, 18, 1, '#5a5a5e'); h(-6, -8, 12, 5, '#8a8a8c'); h(-4, -10, 8, 2, '#a8a8aa'); h(-6, -8, 12, 1, '#c8c8ca');
        h(-5, 0, 10, 3, '#1a1214'); h(-3, 1, 1, 1, '#ff3b2f'); h(2, 1, 1, 1, '#ff3b2f');
        s(-1, 4, 2, 8, '#3a2a1a'); s(-3, 6, 6, 2, '#3a2a1a');
        tatter(p, -6, -2, 12, 8, ['#b8862a', '#8a6420'], 3);
      },
    },
    malvern: {   // the Unmade Bishop: the tall mitre, red over white in tatters, the cracked mask, a skull where his shoulder should be
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-3, -2, 7, 6, '#f2ece2'); h(-2, 0, 2, 1, '#1a0a0a'); h(2, 0, 2, 1, '#1a0a0a'); h(1, -2, 1, 3, '#6a6460'); h(0, 1, 1, 3, '#6a6460'); h(-2, 4, 5, 4, '#cfc8bc');
        s(-10, -3, 6, 5, '#d8d0c0'); s(-9, -2, 1, 2, '#0a0606'); s(-7, -2, 1, 2, '#0a0606'); s(-9, 1, 3, 1, '#0a0606'); s(-10, 2, 6, 1, '#b8b0a0');   // the skull
        s(-4, 0, 2, 24, '#8a1018'); s(2, 0, 2, 24, '#8a1018'); for (let k = 0; k < 4; k++) { s(-4, 4 + k * 5, 2, 1, '#e8d8b0'); s(2, 4 + k * 5, 2, 1, '#e8d8b0'); } s(-1, 6, 2, 10, '#c9a13b');
        tatter(p, -9, 6, 18, 9, ['#e0d8c8', '#c8c0b0', '#8a1018'], 1);
      },
    },
    abbess: {   // Abbess Severine: a crown of white lilies, dead roots grown up behind her like antlers, moss at her hem
      back(ctx, A) { const s = pen(ctx, A.S, A); for (const [x, y, dx, n] of [[-6, 2, -1.4, 12], [-7, 6, -1.7, 10], [-5, -2, -1.1, 13], [-6, 10, -1.5, 8]]) for (let k = 0; k < n; k++) { s(x + k * dx, y - k * 1.3 + Math.sin(k * 0.9 + x) * 1.5, 2, 2, k % 3 ? '#6a4a34' : '#8a6a4a'); if (k === n - 4) for (let j = 1; j < 5; j++) s(x + k * dx - j, y - k * 1.3 - j * 1.6, 1, 2, '#5a3e2a'); } },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-7, -8, 14, 2, '#3a5a2a'); for (const x of [-7, -2, 3]) { h(x, -12, 4, 4, '#f4f0fa'); h(x + 1, -13, 2, 1, '#f4f0fa'); h(x - 1, -11, 1, 2, '#f4f0fa'); h(x + 4, -11, 1, 2, '#f4f0fa'); h(x + 1, -11, 2, 2, '#e0b84a'); }
        h(-3, 2, 1, 6, '#1a1020'); h(3, 2, 1, 5, '#1a1020');
        s(-5, 2, 1, 9, '#3a5a2a'); s(-6, 7, 3, 2, '#4a6a34'); s(4, 4, 1, 8, '#3a5a2a');
        tatter(p, -9, 6, 18, 9, ['#d8d0c0', '#b8b0a0'], 2); p(-10, 14, 6, 2, '#4a6a34'); p(4, 13, 7, 2, '#4a6a34'); p(-3, 15, 5, 1, '#3a5a2a');
      },
    },
    windcaller: {   // Brother Hask: three pennants on poles at his back, a blue-grey hood, a white beard to his belt, the wind going round him
      back(ctx, A) {
        const s = pen(ctx, A.S, A);
        for (const [x, top, col, dk] of [[-17, -24, '#5a6a9a', '#3a4a7a'], [-10, -36, '#c8a040', '#a07e28'], [-3, -27, '#a03038', '#7a1e28']]) {
          s(x, top, 2, 30, '#5a4430'); s(x - 1, top - 2, 4, 2, '#3a2a1e');
          for (let r = 0; r < 8; r++) { const wv = Math.round(Math.sin(A.t * 6 + r * 0.6 + x) * 1), cut = r > 4 ? (r - 4) * 2 : 0; s(x - 8 + cut + wv, top + 1 + r, 8 - cut, 1, r % 4 === 3 ? dk : col); }
        }
      },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-7, -8, 14, 5, '#5a6a84'); h(-8, -4, 3, 10, '#5a6a84'); h(5, -4, 3, 9, '#4a5870'); h(-7, -8, 14, 1, '#7a8aa4'); h(-5, -3, 10, 3, '#14121a'); h(-3, -2, 1, 1, '#ff3b2f'); h(2, -2, 1, 1, '#ff3b2f');
        h(-4, 1, 9, 5, '#e8e8f0'); h(-3, 6, 7, 5, '#d8d8e4'); h(-2, 11, 5, 4, '#c8c8d8'); h(-1, 15, 3, 3, '#b8b8cc');   // the beard
        s(-8, -3, 16, 3, '#6a7a94'); s(-6, 8, 12, 2, '#5a4430'); s(-1, 7, 3, 4, '#c9a13b');
        p(-9, -2, 4, 3, '#e8d8b0'); p(-8, 1, 5, 3, '#c8b890'); p(-5, 3, 6, 3, '#a89870');   // the horn at his hip
        tatter(p, -8, 2, 16, 7, ['#46526a', '#36405a'], 1);
        ctx.strokeStyle = 'rgba(190,215,240,0.6)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { const a0 = A.t * 2.6 + k * 2.1; ctx.beginPath(); ctx.ellipse(A.P[0], A.P[1] + (k * 7 - 4) * A.uy, (18 + k * 4) * A.ux, 4 * A.uy, 0, a0, a0 + 2.0); ctx.stroke(); }
      },
    },
    gravewarden: {   // the Gravewarden: a coffin strapped to his back, moss on it; a deep hood; a lantern at his belt
      back(ctx, A) { const s = pen(ctx, A.S, A); s(-20, -22, 13, 40, '#4a3424'); s(-18, -25, 9, 3, '#4a3424'); s(-20, -22, 13, 1, '#6a4a30'); s(-20, -22, 1, 40, '#5a3e2a'); s(-8, -22, 1, 40, '#2a1c14'); s(-14, -16, 1, 14, '#6a5a3a'); s(-17, -11, 7, 1, '#6a5a3a'); s(-20, 2, 13, 2, '#2a2620'); s(-20, -6, 13, 1, '#2a2620'); s(-20, -22, 5, 3, '#4a6a34'); s(-13, 14, 6, 4, '#4a6a34'); s(-19, 8, 3, 2, '#3a5a2a'); },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-7, -8, 14, 5, '#4a4230'); h(-8, -4, 3, 11, '#4a4230'); h(5, -4, 3, 10, '#3a3426'); h(-2, -10, 4, 2, '#4a4230'); h(-7, -8, 14, 1, '#6a5e44'); h(-5, -3, 10, 6, '#120e0c'); h(-3, -1, 1, 1, '#ff3b2f'); h(2, -1, 1, 1, '#ff3b2f');
        for (let k = 0; k < 9; k++) s(-7 + k * 1.5, -2 + k * 1.5, 3, 2, '#6a4a2a'); s(-8, -3, 16, 3, '#5a4a34');
        p(-7, -3, 14, 2, '#3a2a1a'); p(0, -4, 3, 4, '#8a7a50'); p(-8, -1, 5, 7, '#2a2620'); p(-7, 0, 3, 5, '#f0b050'); p(-7, -2, 3, 1, '#4a4440'); glow(ctx, A.P[0] - A.f * 5.5 * A.ux, A.P[1] + 2 * A.uy, 30 * A.uy, `rgba(255,170,70,${0.38 + Math.sin(A.t * 7) * 0.08})`);
        tatter(p, -6, 2, 12, 5, ['#4a5a34', '#3a4a28'], 2);
      },
    },
    widow: {   // the Charcoal Widow: burnt to cinder under a deep hood, fire in every crack, and a brazier of coals carried before her
      back(ctx, A) { glow(ctx, A.S[0], A.S[1] + 10 * A.uy, 44 * A.uy, `rgba(255,110,40,${0.2 + Math.sin(A.t * 5) * 0.05})`); const s = pen(ctx, A.S, A); tatter(s, -14, 2, 8, 24, ['#1a1414', '#241a18'], 1); },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A), fl = Math.sin(A.t * 9) > 0 ? '#ff8a30' : '#ffb050';
        h(-7, -9, 14, 6, '#141010'); h(-8, -4, 3, 13, '#141010'); h(5, -4, 3, 12, '#1e1616'); h(-3, -11, 6, 2, '#141010'); h(-4, -2, 9, 6, '#b8a8a0'); h(-4, -2, 9, 2, '#0a0606'); h(-2, 1, 2, 1, '#1a0a0a'); h(2, 1, 2, 1, '#1a0a0a'); h(-5, -7, 1, 4, fl); h(4, -8, 2, 1, fl);
        for (const [x, y, l] of [[-5, 2, 5], [-2, 7, 4], [-6, 11, 5], [-3, 17, 4], [3, 14, 3], [-7, 20, 3]]) { s(x, y, 1, l, fl); s(x + 1, y + l - 1, 2, 1, fl); }
        p(4, -4, 10, 10, '#1a1210'); p(3, -6, 12, 2, '#7a6a5e'); for (let k = 0; k < 5; k++) p(4 + k * 2.25, -4, 1, 10, '#6a5a50'); p(4, 0, 10, 1, '#6a5a50'); p(5, 6, 8, 1, '#7a6a5e'); p(5, 7, 1, 3, '#5a4a40'); p(12, 7, 1, 3, '#5a4a40'); for (const [x, y] of [[5, -3], [8, -2], [11, -3], [6, 1], [10, 2], [8, 3]]) p(x, y, 2, 2, (x + y) % 2 ? '#ff7a20' : fl); p(6, -8, 2, 2, fl); p(10, -9, 1, 2, '#ff7a20');   // the brazier
        glow(ctx, A.P[0] + A.f * 9 * A.ux, A.P[1] - A.uy, 22 * A.uy, 'rgba(255,130,40,0.4)');
        for (let k = 0; k < 6; k++) { const ph = (A.t * 0.4 + k / 6) % 1; ctx.fillStyle = `rgba(50,42,42,${0.55 * (1 - ph)})`; ctx.fillRect(Math.round(A.H[0] + Math.sin(A.t + k) * 8 - 3), Math.round(A.H[1] - 14 - ph * 70), 6 + ph * 6, 6 + ph * 6); if (k % 2) { ctx.fillStyle = `rgba(255,150,60,${1 - ph})`; ctx.fillRect(Math.round(A.P[0] + A.f * 18 + Math.sin(A.t * 2 + k) * 10), Math.round(A.P[1] - ph * 70), 2, 2); } }
      },
    },
    abbot: {   // Abbot Ulric: a white hooded shape with ice hanging off every edge of it, and shards standing up out of the floor behind
      back(ctx, A) {
        glow(ctx, A.S[0], A.S[1] + 10 * A.uy, 50 * A.uy, 'rgba(180,220,255,0.22)'); const p = pen(ctx, A.P, A);
        for (const [x, hgt, w] of [[-18, 34, 4], [-13, 46, 5], [-8, 28, 3], [10, 22, 3]]) for (let r = 0; r < hgt; r++) { const ww = Math.max(1, Math.round(w * (1 - r / hgt))); p(x + (w - ww) / 2, 13 - r, ww, 1, r % 5 === 0 ? '#eef8ff' : ww > 2 ? '#a8d0f0' : '#c8e4ff'); }
      },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-7, -9, 14, 6, '#e8f0f8'); h(-8, -4, 3, 12, '#e8f0f8'); h(5, -4, 3, 11, '#c8d8e8'); h(-3, -11, 6, 2, '#e8f0f8'); h(-5, -3, 10, 5, '#5a6a80'); h(-3, -1, 1, 1, '#ff3b2f'); h(2, -1, 1, 1, '#ff3b2f');
        h(-4, 2, 9, 5, '#f2f8ff'); h(-3, 7, 7, 4, '#e0ecf8'); h(-1, 11, 3, 4, '#d0e0f0');
        for (const [x, l] of [[-8, 5], [-6, 3], [6, 4], [8, 6]]) h(x, 8, 1, l, '#c8e4ff');
        for (const [x, l] of [[-9, 5], [-7, 8], [-5, 4], [5, 6], [7, 4], [9, 7]]) s(x, 4, 1, l, '#c8e4ff');
        tatter(p, -9, 5, 18, 10, ['#d0dcea', '#b8c8dc', '#eef8ff'], 3); for (const [x, l] of [[-8, 4], [-3, 6], [2, 3], [7, 5]]) p(x, 12, 1, l, '#c8e4ff');
        for (let k = 0; k < 5; k++) { const ph = (A.t * 0.6 + k * 0.2) % 1; ctx.fillStyle = `rgba(230,240,255,${0.7 * (1 - ph)})`; ctx.fillRect(Math.round(A.H[0] + A.f * (8 + ph * 20) * A.ux / 2), Math.round(A.H[1] + 4 - ph * 10), 2, 2); }
      },
    },
    oathwarden: {   // the Oathwarden: gold plate over a white tabard in rags, a blank white face with a black cross cut in it, a spiked halo
      back(ctx, A) {
        const cx = A.H[0], cy = A.H[1] - 2 * A.uy, r = 13 * A.uy;
        glow(ctx, cx, cy, 34 * A.uy, 'rgba(255,220,140,0.3)');
        ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = Math.max(2, A.uy * 1.4); ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
        ctx.strokeStyle = '#f0d878'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r - A.uy, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
        for (let k = 0; k < 9; k++) { const a = Math.PI + k * Math.PI / 8, len = (k % 2 ? 6 : 10) * A.uy; ctx.fillStyle = k % 2 ? '#c9a13b' : '#f0d878'; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - 0.07) * r, cy + Math.sin(a - 0.07) * r); ctx.lineTo(cx + Math.cos(a) * (r + len), cy + Math.sin(a) * (r + len)); ctx.lineTo(cx + Math.cos(a + 0.07) * r, cy + Math.sin(a + 0.07) * r); ctx.fill(); }
      },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-5, -6, 11, 12, '#f4f0e8'); h(-5, -6, 11, 1, '#ffffff'); h(4, -5, 2, 10, '#c8c0b0'); h(0, -4, 2, 9, '#0a0606'); h(-3, -1, 8, 2, '#0a0606'); h(-6, -7, 13, 1, '#c9a13b'); h(-6, 6, 13, 1, '#c9a13b');
        s(-12, -5, 10, 6, '#c9a13b'); s(-12, -5, 10, 1, '#f0d878'); s(-11, 1, 8, 2, '#a8842a'); s(-10, -7, 6, 2, '#c9a13b'); s(3, -5, 9, 6, '#c9a13b'); s(3, -5, 9, 1, '#f0d878'); s(4, 1, 7, 2, '#a8842a');
        s(-3, 2, 7, 3, '#c9a13b'); s(-1, 6, 2, 9, '#c9a13b'); s(-3, 8, 6, 2, '#c9a13b');
        p(-7, -3, 14, 2, '#8a6a20'); p(-1, -4, 3, 4, '#f0d878'); tatter(p, -8, -1, 16, 13, ['#f0ece0', '#d8d2c0', '#f0ece0', '#c8c2b0'], 1);
      },
    },
    marshal: {   // Lord-Marshal Vane: the heaviest harness on the field, a red horsehair crest, his arms on a red tabard, the rope still round his neck
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A), sw = Math.round(Math.sin(A.t * 1.6) * 1.5);
        for (let k = 0; k < 13; k++) { const y = -9 - Math.round(Math.sin((k / 12) * Math.PI) * 6); h(-7 + k, y, 2, 5 + Math.round(Math.sin((k / 12) * Math.PI) * 3), k % 3 ? '#8a1018' : '#6a0c14'); } h(-7, -5, 3, 6, '#6a0c14');   // the crest
        h(-6, -1, 12, 2, '#0a0606'); h(-4, -1, 2, 1, '#ff3b2f'); h(2, -1, 2, 1, '#ff3b2f'); h(-1, 2, 1, 4, '#3a3a44'); h(2, 2, 1, 4, '#3a3a44');
        h(-5, 7, 10, 2, '#8a7a50'); h(-5, 7, 10, 1, '#a8986a'); h(-6 + sw, 9, 1, 8, '#8a7a50'); h(-7 + sw, 16, 3, 1, '#a8986a');
        for (let k = 0; k < 3; k++) { s(-12 + k, -5 + k * 2, 10 - k, 2, k ? '#6a6a72' : '#8a8a94'); s(3, -5 + k * 2, 9 - k, 2, k ? '#6a6a72' : '#8a8a94'); } s(-12, -6, 2, 1, '#c9a13b'); s(10, -6, 2, 1, '#c9a13b');
        s(-5, 2, 10, 12, '#4a4a52'); s(-4, 3, 8, 10, '#8a1818'); s(-4, 3, 8, 1, '#c9a13b'); s(-1, 5, 2, 7, '#d8c8a0'); s(-3, 7, 6, 2, '#d8c8a0'); s(-4, 12, 8, 1, '#c9a13b');   // his arms: a cross on red
        p(-7, -3, 14, 2, '#3a2a1a'); tatter(p, -8, -1, 6, 9, ['#6a6a72', '#4a4a52']); tatter(p, 2, -1, 6, 8, ['#6a6a72', '#4a4a52'], 2); tatter(p, -3, -1, 6, 11, ['#7a1a1a', '#5a1010'], 1);
      },
    },
    lightless: {   // the Lightless: a tall rag of a thing, a hood of black spikes, a narrow white mask with two slits, and arms that reach the floor
      back(ctx, A) { const s = pen(ctx, A.S, A), p = pen(ctx, A.P, A); for (const [x, y, n] of [[-9, -4, 9], [-6, -8, 11], [-11, 2, 7], [-3, -9, 8]]) for (let k = 0; k < n; k++) s(x - k * 1.2, y - k * 1.5, Math.max(1, 4 - k * 0.4), 2, k % 2 ? '#1a161e' : '#2a2432'); tatter(p, -13, -6, 8, 22, ['#1a161e', '#241e2c'], 2); s(-9, 2, 2, 24, '#8a7a8c'); for (const x of [-11, -9, -7]) s(x, 26, 1, 6, '#b8a8b8'); },
      front(ctx, A) {
        const h = pen(ctx, A.H, A), s = pen(ctx, A.S, A), p = pen(ctx, A.P, A);
        h(-7, -9, 14, 7, '#1e1a24'); h(-8, -4, 3, 14, '#1e1a24'); h(5, -4, 3, 13, '#16121a'); for (const [x, l] of [[-7, 5], [-4, 8], [-1, 6], [2, 9], [5, 5]]) { h(x, -9 - l, 2, l, '#1e1a24'); h(x, -9 - l, 1, l, '#2e2836'); }
        h(-3, -4, 6, 13, '#eee8e0'); h(-2, 9, 4, 3, '#eee8e0'); h(-1, 12, 2, 2, '#d8d0c8'); h(2, -4, 1, 13, '#c8c0b8'); h(-2, -1, 1, 5, '#0a0606'); h(1, -1, 1, 5, '#0a0606');   // the mask
        s(-2, 3, 4, 18, '#d8d0c8'); s(-2, 3, 1, 18, '#eee8e0'); tatter(s, -2, 21, 4, 7, ['#d8d0c8', '#b8b0a8']);   // a strip of winding-cloth
        s(6, 3, 2, 22, '#b8a8b8'); s(6, 3, 1, 22, '#d8c8d8'); for (const [x, l] of [[5, 6], [7, 8], [9, 6], [11, 4]]) s(x, 25, 1, l, '#d8c8d8'); s(5, 24, 6, 2, '#b8a8b8');   // the near arm, and its fingers
        tatter(p, -9, -4, 18, 20, ['#1a161e', '#241e2c', '#141018'], 1);
      },
    },
    // the Lamplight Mother has her own sprite; she gains her crown and the lamp she carries at her breast
    mothmother: {
      front(ctx, A, e) {
        if (e.wingless) return; const sc = e.def.scale || 1, B = { f: A.f, ux: 2 * sc, uy: 2 * sc }, h = pen(ctx, A.H, B), s = pen(ctx, A.S, B);
        h(-3, -9, 6, 2, '#c9a13b'); h(-3, -11, 1, 2, '#e8c860'); h(-1, -12, 2, 3, '#e8c860'); h(2, -11, 1, 2, '#e8c860'); h(-1, -9, 2, 1, '#a00a12');
        s(-1, 4, 3, 3, '#ffd880'); glow(ctx, A.S[0], A.S[1] + 5 * 2 * sc, 22 * sc, `rgba(255,200,110,${0.4 + Math.sin(A.t * 4) * 0.1})`);
      },
    },
    // the Carrion King: far bigger than any crow, a crown of real gold on him, and a collar of finger-bones
    crowking: {
      front(ctx, A, e) {
        const sc = (e.def.scale || 1), B = { f: A.f, ux: 2 * sc * A.kx, uy: 2 * sc * A.ky }, h = pen(ctx, A.H, B);
        h(-3, -6, 8, 2, '#c9a13b'); h(-3, -6, 8, 1, '#f0d878'); for (const x of [-3, 0, 4]) { h(x, -9, 1, 3, '#e8c860'); } h(-1, -8, 1, 2, '#c9a13b'); h(2, -8, 1, 2, '#c9a13b'); h(0, -6, 1, 1, '#a00a12'); h(3, -6, 1, 1, '#a00a12');
        for (let k = 0; k < 5; k++) h(-5 + k * 1.6, 3 + (k % 2), 1, 3, '#d8d0c0');
      },
    },
  };

  // ---- drawing
  const EP = G.Enemy.prototype, ED = EP.draw;
  EP.draw = function (ctx, g) {
    const d = D[this.type], sz = SIZE[this.type];
    if (!d || !this.def.boss) return ED.call(this, ctx, g);
    const t = g.time || 0, beast = !!this.def.model, feet = G.GROUND - Math.round(((this.alt || 0) + (this.lift || 0)) / 2) * 2;
    const kx = sz ? sz[0] : 1, ky = sz ? sz[1] : 1, scaled = kx !== 1 || ky !== 1, py = beast ? feet - 8 : feet;   // beasts grow about their middle
    const anchors = out => out && { H: out.head, S: out.sh, P: out.hip, T: out.tip, f: this.facing, ux: 2 * (beast ? 1 : kx), uy: 2 * (beast ? 1 : ky), kx, ky, t };
    if (this._lastOut && d.back && !this.dead) { const A = anchors(this._lastOut); if (A && A.H) d.back(ctx, A, this); }
    if (scaled) { ctx.save(); ctx.translate(this.x, py); ctx.scale(kx, ky); ctx.translate(-this.x, -py); }
    ED.call(this, ctx, g);
    if (scaled) {
      ctx.restore();
      if (this.out) { const m = p => p && [this.x + (p[0] - this.x) * kx, py + (p[1] - py) * ky]; this.out = { head: m(this.out.head), sh: m(this.out.sh), hip: m(this.out.hip), tip: m(this.out.tip) }; }
    }
    if (this.out && !(this.dead && this.interT != null)) { this._lastOut = this.out; if (d.front && !this.limbs.head.gone) { const A = anchors(this.out); if (A && A.H) d.front(ctx, A, this); } }
  };
  G.BOSS_SIZE = SIZE;
})();
