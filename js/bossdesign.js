'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — boss designs. The bosses were drawn with the same body as the
// rank and file, only recoloured. Here each one is given its own silhouette:
// the human ones stand a head taller than anything else on the road, and each
// wears, carries or grows the thing it is remembered for. Pieces behind the
// body (a banner pole, a door for a shield, a halo) are drawn first; pieces in
// front (a crown, a mask, icicles, a noose) after. They hang off the joints the
// sprite reports, so they follow the body as it moves.
// ---------------------------------------------------------------------------
(() => {
  const SIZE = { hangman: 1.3, matron: 1.25, garrick: 1.3, bearer: 1.3, malvern: 1.3, abbess: 1.25, windcaller: 1.25, gravewarden: 1.3, widow: 1.25, oathwarden: 1.35, abbot: 1.3, marshal: 1.3, lightless: 1.35, crowking: 1.15 };

  // some bodies change too, not just what is laid over them
  const LOOK = {
    hangman: { skin: '#9a7a66', body: '#9a7a66', trim: '#3a2418', arm: '#9a7a66', leg: '#2a1e18', helm: 'sack', helmCol: '#1a1414' },   // bare to the waist under the hood, the way they hang people
    matron: { skin: '#7a9488', body: '#2a3a36', trim: '#5a6e64', arm: '#7a9488', leg: '#22302c', helm: 'veil', helmCol: '#141c1a', skirt: 'long' },
    malvern: { body: '#e8e0d0', trim: '#8a1018', helm: 'mitre', helmCol: '#efe8da' },
    abbot: { helm: 'hood', helmCol: '#dfe8f2', body: '#c8d4e2', trim: '#6a8ab0', skirt: 'long' },
    abbess: { skirt: 'long' },
    widow: { skin: '#3a2a24', body: '#1a1414', arm: '#1a1414', leg: '#141010', helm: 'veil', helmCol: '#0e0a0a', skirt: 'long' },
    gravewarden: { helm: 'hood', helmCol: '#2a2620' },
    lightless: { hair: '#c8c0b8' },
  };
  for (const k in LOOK) if (G.ENEMIES[k]) G.ENEMIES[k].look = Object.assign({}, G.ENEMIES[k].look, LOOK[k]);

  // a pen for chunky pixels, anchored to a joint and mirrored with the facing
  const pen = (ctx, a, f, u) => (x, y, w, h, col) => { ctx.fillStyle = col; const X = a[0] + (f > 0 ? x : -x - w) * u, Y = a[1] + y * u; ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u))); };
  const glow = (ctx, x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };

  // what each boss is remembered for. back(): behind the body; front(): over it.
  const D = {
    hangman: {   // Gaunt: the tall executioner's cowl, nooses at his belt, a leather apron dark with use
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), p = pen(ctx, A.P, A.f, A.u);
        h(-5, -11, 10, 4, '#1a1414'); h(-3, -15, 7, 4, '#1a1414'); h(-1, -18, 3, 3, '#1a1414'); h(2, -17, 1, 6, '#2e2622');   // the point of the hood
        p(-5, -10, 10, 13, '#3a2418'); p(-5, -10, 10, 1, '#5a3a24'); p(-2, -6, 3, 4, '#5a0a0a'); p(1, -1, 2, 3, '#4a0808');   // the apron, and what is on it
        p(-7, -2, 2, 2, '#8a7a50'); p(-8, 0, 1, 6, '#8a7a50'); p(-9, 6, 3, 2, '#8a7a50'); p(-9, 7, 1, 1, '#000');   // a noose
        p(5, -1, 2, 2, '#8a7a50'); p(6, 1, 1, 5, '#8a7a50'); p(5, 6, 3, 2, '#8a7a50');
      },
    },
    matron: {   // her hair down over her face, black and wet to the knee; reeds in it; water running off her; a ring of keys
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), p = pen(ctx, A.P, A.f, A.u);
        for (let k = -6; k <= 6; k += 2) { const len = 14 + ((k * 7 + 30) % 9); h(k, -4, 2, len, k % 4 ? '#0e1414' : '#16201e'); }
        h(-4, -9, 1, 4, '#5a7a4a'); h(-1, -10, 1, 5, '#6a8a5a'); h(3, -9, 1, 4, '#5a7a4a'); h(1, -11, 2, 1, '#a8a060');   // reeds, and a dead lily
        h(-2, 2, 1, 1, '#ff3b2f'); h(2, 2, 1, 1, '#ff3b2f');   // something looks out between the strands
        p(4, -3, 4, 4, '#6a5a3a'); p(5, -2, 2, 2, '#22302c'); p(6, 1, 1, 3, '#8a7a50'); p(8, 1, 1, 2, '#8a7a50');
        for (let d = 0; d < 4; d++) { const ph = (A.t * 1.4 + d * 0.27) % 1; ctx.fillStyle = 'rgba(150,200,190,0.7)'; ctx.fillRect(Math.round(A.H[0] + (d - 1.5) * 10 * A.u / 2), Math.round(A.H[1] + 30 * A.u / 2 + ph * 60), 2, 3); }
      },
    },
    garrick: {   // the Oathkeeper: he held a door, so he carries one; the wax seals of his oath on his chest; a great crest
      back(ctx, A) { const s = pen(ctx, A.S, A.f, A.u); s(-24, -12, 15, 32, '#3a2a1c'); s(-24, -12, 15, 1, '#6a4a2e'); s(-24, -12, 1, 32, '#5a3e26'); for (let k = 0; k < 5; k++) s(-24, -6 + k * 6, 15, 1, '#24180e'); s(-23, -4, 13, 2, '#4a4440'); s(-23, 10, 13, 2, '#4a4440'); s(-12, 3, 2, 3, '#8a8478'); s(-20, 0, 2, 2, '#8a1018'); },   // a whole door, iron-banded, with the knocker still on it
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u);
        h(-2, -14, 4, 6, '#2a2628'); h(-1, -18, 2, 4, '#3a3438'); h(-6, -12, 2, 4, '#2a2628'); h(4, -12, 2, 4, '#2a2628');   // a three-horned crest
        s(-6, 2, 3, 3, '#8a1018'); s(-2, 4, 3, 3, '#8a1018'); s(-5, 5, 1, 5, '#d8d0b8'); s(-1, 7, 1, 4, '#d8d0b8');   // two seals, and their ribbons
      },
    },
    bearer: {   // the Standard-Bearer: the Long Battalion's colours on a pole across his back, the sun of Osric on them
      back(ctx, A) {
        const s = pen(ctx, A.S, A.f, A.u), wv = Math.sin(A.t * 2.2) * 2;
        s(-8, -40, 2, 58, '#4a3420'); s(-9, -42, 4, 3, '#c9a13b');
        for (let r = 0; r < 14; r++) s(-6, -38 + r, 20 + Math.round(Math.sin(A.t * 3 + r * 0.4) * 1.5 + wv * (r / 14)), 1, r < 2 ? '#5a0e0a' : '#7a1a14');
        s(1, -34, 6, 6, '#c9a13b'); s(2, -33, 4, 4, '#e8c860'); s(0, -32, 1, 2, '#c9a13b'); s(7, -32, 1, 2, '#c9a13b'); s(3, -36, 2, 1, '#c9a13b'); s(3, -27, 2, 1, '#c9a13b');
      },
    },
    malvern: {   // the Unmade Bishop: a halo of nails, a white face that is a mask, cracked, and the red stole
      back(ctx, A) { for (let k = 0; k < 12; k++) { const a = Math.PI + k * Math.PI / 11, r1 = 13 * A.u, r2 = 20 * A.u; ctx.strokeStyle = k % 2 ? '#6a6460' : '#8a8480'; ctx.lineWidth = Math.max(1, A.u * 0.8); ctx.beginPath(); ctx.moveTo(A.H[0] + Math.cos(a) * r1, A.H[1] - 6 * A.u + Math.sin(a) * r1); ctx.lineTo(A.H[0] + Math.cos(a) * r2, A.H[1] - 6 * A.u + Math.sin(a) * r2); ctx.stroke(); } },
      front(ctx, A) { const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u); h(-3, -2, 7, 6, '#f2ece2'); h(-2, 0, 2, 1, '#1a0a0a'); h(2, 0, 2, 1, '#1a0a0a'); h(1, -2, 1, 3, '#6a6460'); h(0, 1, 1, 3, '#6a6460'); h(-1, 3, 3, 1, '#8a1018'); s(-4, 0, 2, 22, '#8a1018'); s(1, 0, 2, 22, '#8a1018'); s(-4, 18, 2, 2, '#c9a13b'); s(1, 18, 2, 2, '#c9a13b'); },
    },
    abbot: {   // the Frozen Abbot: rimed white, icicles from his arms and hood, a frost beard, and the cold coming off him
      back(ctx, A) { glow(ctx, A.H[0], A.H[1] + 20 * A.u, 46 * A.u, 'rgba(180,220,255,0.25)'); },
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u);
        h(-3, 3, 7, 6, '#f2f8ff'); h(-2, 9, 5, 2, '#e0ecf8'); h(0, 11, 2, 2, '#d0e0f0');   // the beard, frozen into a spike
        for (const [x, l] of [[-6, 3], [-4, 5], [4, 4], [6, 3]]) h(x, -2, 1, l, '#c8e4ff');
        for (const [x, l] of [[-2, 4], [0, 6], [2, 3]]) s(x + 4, 8, 1, l, '#c8e4ff');
        for (let k = 0; k < 5; k++) { const ph = (A.t * 0.6 + k * 0.2) % 1; ctx.fillStyle = `rgba(230,240,255,${0.7 * (1 - ph)})`; ctx.fillRect(Math.round(A.H[0] + A.f * (8 + ph * 20) * A.u / 2), Math.round(A.H[1] + 4 - ph * 10), 2, 2); }   // his breath
      },
    },
    abbess: {   // the Lily Rotted: black lilies growing out of her, a crown of them, and the wash-water running from her mouth
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u);
        for (const x of [-6, -2, 2, 6]) { h(x, -12, 1, 4, '#2a3a24'); h(x - 1, -14, 3, 2, '#1a1020'); h(x, -15, 1, 1, '#3a2040'); }
        h(-1, 3, 2, 6, '#2a2a20'); h(0, 9, 1, 3, '#2a2a20');
        s(-7, -2, 1, 6, '#2a3a24'); s(-9, -4, 3, 2, '#1a1020'); s(4, 0, 1, 5, '#2a3a24'); s(3, -2, 3, 2, '#1a1020'); s(-2, 10, 1, 8, '#2a3a24'); s(-3, 17, 3, 2, '#1a1020');
      },
    },
    windcaller: {   // Brother Hask: a staff on his back strung with prayer-flags that the wind never lets hang, a fur mantle, and the great horn at his hip
      back(ctx, A) {
        const s = pen(ctx, A.S, A.f, A.u); s(-9, -34, 2, 50, '#5a4430');
        for (let k = 0; k < 6; k++) { const wv = Math.round(Math.sin(A.t * 7 + k * 0.9) * 2); s(-8 - k * 4, -33 + k * 2 + wv, 4, 4, ['#a03030', '#e8e8f0', '#3060a0', '#c0a040', '#3a8a4a', '#e8e8f0'][k]); }
        s(-32, -33, 25, 1, '#8a8478');
      },
      front(ctx, A) {
        const s = pen(ctx, A.S, A.f, A.u), p = pen(ctx, A.P, A.f, A.u);
        s(-8, -3, 15, 4, '#6a5a4a'); s(-8, -3, 15, 1, '#8a7a6a'); for (let k = -7; k < 7; k += 3) s(k, 1, 2, 2, '#5a4a3a');   // the fur
        for (let k = 0; k < 9; k++) s(-5 + k, 1 + k * 2, 1, 2, '#3a2a1a');   // the strap
        p(-10, -6, 3, 3, '#e8d8b0'); p(-9, -3, 3, 3, '#d8c8a0'); p(-8, 0, 4, 3, '#c8b890'); p(-6, 2, 5, 3, '#b8a880'); p(-5, 4, 7, 4, '#a89870'); p(1, 4, 2, 5, '#3a2a1a');   // the horn, curling up behind him
      },
    },
    gravewarden: {   // the Gravewarden: a spade over his shoulder, a ring of keys, a lantern that is never out
      back(ctx, A) { const s = pen(ctx, A.S, A.f, A.u); s(-10, -16, 2, 30, '#4a3420'); s(-12, -22, 6, 7, '#6a6a64'); s(-12, -22, 6, 1, '#8a8a84'); },
      front(ctx, A) { const p = pen(ctx, A.P, A.f, A.u); p(-7, -2, 4, 6, '#2a2620'); p(-6, -1, 2, 4, '#e8a040'); glow(ctx, A.P[0] - A.f * 5 * A.u, A.P[1] + 2 * A.u, 26 * A.u, `rgba(255,170,70,${0.35 + Math.sin(A.t * 7) * 0.08})`); p(4, -2, 4, 4, '#6a5a3a'); p(5, -1, 2, 2, '#2a2620'); p(5, 2, 1, 4, '#8a7a50'); p(7, 2, 1, 3, '#8a7a50'); },
    },
    widow: {   // the Charcoal Widow: burnt black, the fire still in her cracks, smoke going up off her
      back(ctx, A) { glow(ctx, A.S[0], A.S[1] + 10 * A.u, 40 * A.u, `rgba(255,110,40,${0.22 + Math.sin(A.t * 5) * 0.06})`); },
      front(ctx, A) {
        const s = pen(ctx, A.S, A.f, A.u), fl = Math.sin(A.t * 9) > 0 ? '#ff8a30' : '#ffb050';
        for (const [x, y, l] of [[-3, 2, 5], [1, 6, 4], [-1, 12, 6], [3, 16, 4], [-4, 20, 3]]) { s(x, y, 1, l, fl); s(x + 1, y + l - 1, 2, 1, fl); }
        for (let k = 0; k < 6; k++) { const ph = (A.t * 0.4 + k / 6) % 1; ctx.fillStyle = `rgba(60,50,50,${0.6 * (1 - ph)})`; ctx.fillRect(Math.round(A.H[0] + Math.sin(A.t + k) * 8 - 3), Math.round(A.H[1] - 10 - ph * 70), 6 + ph * 6, 6 + ph * 6); if (k % 2) { ctx.fillStyle = `rgba(255,150,60,${1 - ph})`; ctx.fillRect(Math.round(A.H[0] + Math.sin(A.t * 2 + k) * 14), Math.round(A.H[1] - ph * 60), 2, 2); } }
      },
    },
    oathwarden: {   // the Oathwarden of the Fane: a gilded statue that walks, a sunburst behind it, its visor full of light, the stone cracking
      back(ctx, A) { for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + A.t * 0.2, r1 = 12 * A.u, r2 = (k % 2 ? 22 : 28) * A.u; ctx.strokeStyle = 'rgba(240,200,110,0.7)'; ctx.lineWidth = Math.max(1, A.u); ctx.beginPath(); ctx.moveTo(A.H[0] + Math.cos(a) * r1, A.H[1] + Math.sin(a) * r1); ctx.lineTo(A.H[0] + Math.cos(a) * r2, A.H[1] + Math.sin(a) * r2); ctx.stroke(); } glow(ctx, A.H[0], A.H[1], 34 * A.u, 'rgba(255,220,140,0.35)'); },
      front(ctx, A) { const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u); h(-3, 0, 7, 1, '#fff4c8'); glow(ctx, A.H[0] + A.f * A.u, A.H[1] + A.u, 10 * A.u, 'rgba(255,240,190,0.6)'); s(-3, 2, 1, 6, '#5a4a30'); s(-2, 7, 2, 1, '#5a4a30'); s(2, 12, 1, 5, '#5a4a30'); s(-5, 18, 3, 1, '#5a4a30'); },
    },
    marshal: {   // the Lord-Marshal: hanged and still standing; the rope round his neck, the cut end trailing; a tall marshal's crest
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), sw = Math.round(Math.sin(A.t * 1.6) * 1.5);
        h(-2, -14, 3, 7, '#2a0a0a'); h(-1, -17, 2, 4, '#3a0a0a'); h(1, -15, 2, 2, '#2a0a0a');   // the crest, red gone to black
        h(-5, 6, 10, 2, '#8a7a50'); h(-5, 6, 10, 1, '#a8986a'); h(-6, 7, 2, 3, '#8a7a50');   // the noose
        h(-6 + sw, 10, 1, 8, '#8a7a50'); h(-7 + sw, 17, 3, 1, '#a8986a');
      },
    },
    lightless: {   // the Lightless: Old Brann in what is left of his miner's cap, the lamp on it dead, and long, long fingers
      front(ctx, A) {
        const h = pen(ctx, A.H, A.f, A.u), s = pen(ctx, A.S, A.f, A.u);
        h(-6, -8, 12, 4, '#3a3430'); h(-7, -5, 14, 1, '#2a2420'); h(2, -10, 4, 3, '#5a5450'); h(3, -9, 2, 1, '#1a1a1a');   // the cap, and the lamp gone dark
        h(-6, -5, 1, 10, '#c8c0b8'); h(5, -5, 1, 12, '#c8c0b8'); h(-4, -4, 1, 8, '#b8b0a8');   // what hair is left
        h(-3, 0, 2, 2, '#000'); h(1, 0, 2, 2, '#000');   // the sockets
        if (A.T) { const t = pen(ctx, A.T, A.f, A.u); for (let k = 0; k < 4; k++) t(0, -1 + k * 2, 6 + (k % 2) * 2, 1, '#e0d8d0'); }
      },
    },
  };

  // the Carrion King: the crown of rope and the hangman's hood from his nest, and a necklace of finger-bones
  D.crowking = {
    front(ctx, A, e) {
      const sc = e.def.scale || 1, u = 2 * sc, h = pen(ctx, A.H, A.f, u);
      h(-3, -6, 7, 2, '#8a7a50'); for (const x of [-3, -1, 1, 3]) h(x, -8, 1, 2, '#8a7a50');   // rope, knotted into a crown
      h(-5, -2, 2, 6, '#1a1414'); h(-6, 3, 4, 2, '#1a1414');   // the hood, worn as a cape
      for (let k = 0; k < 5; k++) h(-4 + k * 1.5, 4 + (k % 2), 1, 2, '#d8d0c0');
    },
  };

  // ---- drawing
  const EP = G.Enemy.prototype, ED = EP.draw;
  EP.draw = function (ctx, g) {
    const d = D[this.type], k = SIZE[this.type];
    if (!d || !this.def.boss) return ED.call(this, ctx, g);
    const t = g.time || 0, beast = !!this.def.model, feet = G.GROUND - Math.round(((this.alt || 0) + (this.lift || 0)) / 2) * 2;
    const scaled = !beast && k && k !== 1;
    const anchors = out => out && { H: out.head, S: out.sh, P: out.hip, T: out.tip, f: this.facing, u: 2 * (scaled ? k : 1) * (this.scale > 1.3 ? 1.05 : 1), t };
    if (this._lastOut && d.back && !this.dead) { const A = anchors(this._lastOut); if (A && A.H) d.back(ctx, A, this); }
    if (scaled) { ctx.save(); ctx.translate(this.x, feet); ctx.scale(k, k); ctx.translate(-this.x, -feet); }
    ED.call(this, ctx, g);
    if (scaled) {
      ctx.restore();
      if (this.out) { const m = p => p && [this.x + (p[0] - this.x) * k, feet + (p[1] - feet) * k]; this.out = { head: m(this.out.head), sh: m(this.out.sh), hip: m(this.out.hip), tip: m(this.out.tip) }; }
    }
    if (this.out && !(this.dead && this.interT != null)) { this._lastOut = this.out; if (d.front && (!this.limbs.head.gone || !beast)) { const A = anchors(this.out); if (A && A.H && !this.limbs.head.gone) d.front(ctx, A, this); } }
  };
  G.BOSS_SIZE = SIZE;
})();
