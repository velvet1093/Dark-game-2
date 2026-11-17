'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the bosses' weapons. Each carried the same plain steel as the
// rank and file; now each carries its own, drawn into the sprite so it gets the
// same outline and pixels as the body. a = along the weapon from the hand,
// c = across it (positive is the cutting side).
// ---------------------------------------------------------------------------
(() => {
  const kit = W => {
    const L = (a0, c0, a1, c1, col, w = 1) => { const [x0, y0] = W.P(a0, c0), [x1, y1] = W.P(a1, c1); W.line(x0, y0, x1, y1, col, w); };
    const D = (a, c, w, h, col) => { const [x, y] = W.P(a, c); W.R(Math.round(x), Math.round(y), w, h, col); };
    return { L, D, n: W.len, red: W.red, t: W.time || 0 };
  };
  const WEAP = {
    // Gaunt: the headsman's axe. Black iron, a moon of a blade, rope bound round the haft, and what it has been used for
    hangman(W) {
      const { L, D, n, red } = kit(W);
      L(-7, 0, n + 1, 0, '#1e140e', 2); for (const a of [2, 8, 14]) D(a, -1, 2, 2, '#8a7a50');
      for (let k = 1; k <= 14; k++) L(n - 6 - k * 0.75, k, n + k * 0.4, k, k >= 13 ? (red ? '#8f0810' : '#d8dce4') : k < 3 ? '#16161a' : k % 4 === 0 ? '#2a2a30' : '#3a3a44', 2);
      L(n - 3, 7, n - 1, 10, '#5a0a0a', 2); D(n - 7, 12, 1, 2, '#6a0a0a'); D(n - 1, 3, 2, 2, '#16161a');
      L(n, 0, n + 5, 0, '#34343c', 2); L(n - 4, -1, n - 2, -4, '#34343c', 2);
      return W.P(n + 1, 14);
    },
    // Ser Garrick: the Oathkeeper, black steel with a violet edge, a gold guard bowed like a door's hinge, a red oath-seal on it, a tassel
    garrick(W) {
      const { L, D, n } = kit(W);
      L(-5, 0, 1, 0, '#3a1a1a', 2); D(-7, -1, 2, 2, '#c9a13b'); L(-7, 0, -11, -2, '#8a1018', 1); L(-7, 0, -11, 1, '#8a1018', 1);
      L(2, -7, 2, 7, '#c9a13b', 2); L(2, -7, 5, -8, '#c9a13b', 1); L(2, 7, 5, 8, '#c9a13b', 1); D(1, -1, 2, 2, '#8a1018');
      L(3, 0, n, 0, '#16121a', 4); L(3, 0, n, 0, '#2e2836', 3); L(4, 1, n - 2, 1, '#9a88b8', 1); L(n, 0, n + 3, 0, '#2e2836', 1);
      for (let a = 8; a < n - 4; a += 5) D(a, -1, 1, 1, '#a070e0');
      return W.P(n + 3, 0);
    },
    // the Standard-Bearer: the Battalion greatsword in its parade dress, a gold fuller, a wide guard with the sun of Osric at its heart, a sun for a pommel
    bearer(W) {
      const { L, D, n } = kit(W);
      L(-6, 0, 1, 0, '#5a3a20', 2); D(-8, -1, 3, 3, '#e8c860'); D(-10, 0, 1, 1, '#e8c860'); D(-8, -3, 1, 1, '#e8c860'); D(-8, 3, 1, 1, '#e8c860');
      L(2, -8, 2, 8, '#c9a13b', 2); D(1, -1, 3, 3, '#f0d878');
      L(3, 0, n, 0, '#8a8c96', 4); L(3, 0, n, 0, '#c8cad4', 3); L(5, 0, n - 6, 0, '#d8b050', 1); L(n, 0, n + 4, 0, '#c8cad4', 2);
      return W.P(n + 4, 0);
    },
    // Malvern: the crozier, gold, the crook coiled over at the head, a red stole knotted below it
    malvern(W) {
      const { L, D, n } = kit(W), b = -n * 0.35;
      L(b, 0, n, 0, '#8a6a20', 2); L(b, 0, n, 0, '#d8b050', 1); for (const a of [n * 0.3, n * 0.65]) D(a - 1, -1, 3, 3, '#e8c860');
      const pts = [[n, 0], [n + 2, 0], [n + 4, 0.5], [n + 6, 1.5], [n + 7, 3], [n + 7, 5], [n + 6, 6.5], [n + 4, 7], [n + 2, 6.5], [n + 1, 5], [n + 1.5, 3.5], [n + 3, 3]];
      for (let i = 1; i < pts.length; i++) L(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], '#d8b050', 2);
      L(n - 1, 0, n - 9, -3, '#8a1018', 2); L(n - 2, 0, n - 7, 2, '#8a1018', 1); D(n - 2, -1, 2, 2, '#c9a13b');
      return W.P(n + 7, 4);
    },
    // Abbess Severine: a lily scythe, the snath bone-white and wound with green, the blade white and rotting black
    abbess(W) {
      const { L, D, n } = kit(W), b = -n * 0.35;
      L(b, 0, n, 0, '#a89c88', 2); L(b, 0, n, 0, '#e0d8c8', 1);
      for (let a = b + 2, s = 1; a < n; a += 4, s = -s) D(a, s, 1, 1, '#3a5a2a');
      D(n * 0.4, -2, 2, 2, '#f4f0fa'); D(n * 0.7, 1, 2, 2, '#f4f0fa');
      for (let k = 0; k <= 16; k++) {
        const [bx, by] = W.P(n - k * k * 0.035, k), wk = k < 11 ? 3 : k < 14 ? 2 : 1;
        W.R(Math.round(bx) - 1, Math.round(by) - 1, wk, wk, k < 3 ? '#a8a090' : (k === 6 || k === 10) ? '#1a1020' : '#e8e2d8');
        if (k > 2 && k < 12 && k !== 6 && k !== 10) W.R(Math.round(bx), Math.round(by), 1, 1, '#ffffff');
      }
      return W.P(n - 9, 16);
    },
    // Brother Hask: an ice-axe of the pass, an ash haft bound in leather, a long rimed pick and an adze, frost growing on it
    windcaller(W) {
      const { L, D, n } = kit(W);
      L(-6, 0, n, 0, '#7a6a4a', 2); for (const a of [0, 4]) L(a, 0, a + 2, 0, '#4a3020', 2);
      L(n - 2, 1, n - 5, 10, '#7ab0d0', 2); L(n - 2, 1, n - 4, 7, '#c8e8ff', 1); D(n - 6, 10, 1, 1, '#f0faff');
      L(n - 1, -1, n - 1, -5, '#7ab0d0', 3); L(n, -1, n, -5, '#c8e8ff', 1);
      for (const [a, c] of [[n - 3, 3], [n + 1, -2], [n - 4, -3], [n - 2, 6]]) D(a, c, 1, 1, '#f0faff');
      L(n - 4, 9, n - 7, 9, '#c8e8ff', 1);
      return W.P(n - 5, 10);
    },
    // the Gravewarden: a grave-spade, the long haft worn pale where he holds it, a D-grip, the blade crusted with what it digs
    gravewarden(W) {
      const { L, D, n } = kit(W);
      L(-9, 0, n - 6, 0, '#5a4030', 2); L(0, 0, 5, 0, '#8a7058', 2);
      L(-9, -3, -9, 3, '#3a2a1e', 2); L(-11, -3, -11, 3, '#3a2a1e', 1); L(-11, -3, -9, -3, '#3a2a1e', 1); L(-11, 3, -9, 3, '#3a2a1e', 1);
      for (let c = -4; c <= 4; c += 1) L(n - 7, c, n + 2 - (Math.abs(c) > 3 ? 1 : 0), c, Math.abs(c) === 4 ? '#4a4a44' : '#6a6a64', 2);
      L(n + 2, -4, n + 2, 4, '#a8a8a0', 2); for (const [a, c] of [[n - 6, -2], [n - 5, 2], [n - 4, 0], [n - 3, -3]]) D(a, c, 2, 1, '#3a2a1a');
      return W.P(n + 2, 0);
    },
    // the Charcoal Widow: a scythe that went through the fire with her, the snath black and split, the blade still red along its edge
    widow(W) {
      const { L, D, n, t } = kit(W), b = -n * 0.35, hot = Math.sin(t * 9) > 0 ? '#ff8a30' : '#ffb050';
      L(b, 0, n, 0, '#0e0a0a', 2); L(b, 0, n, 0, '#2a2020', 1); for (let a = b + 3; a < n; a += 6) D(a, 0, 1, 1, '#ff6a20');
      for (let k = 0; k <= 16; k++) {
        const [bx, by] = W.P(n - k * k * 0.035, k), wk = k < 11 ? 3 : k < 14 ? 2 : 1;
        W.R(Math.round(bx) - 1, Math.round(by) - 1, wk, wk, k < 3 ? '#140e0e' : '#2a2422');
        if (k > 2 && k < 13) W.R(Math.round(bx) + 1, Math.round(by), 1, 1, hot);
      }
      return W.P(n - 9, 16);
    },
    // Abbot Ulric: his conductor's staff, frozen to his hand and grown into a lance of ice
    abbot(W) {
      const { L, D, n } = kit(W), b = -n * 0.35;
      L(b, 0, n, 0, '#7a98b8', 2); L(b, 0, n, 0, '#d8ecff', 1); for (let a = b + 4; a < n; a += 7) D(a, -1, 2, 1, '#f0faff');
      L(n, 0, n + 10, 0, '#8ac0e8', 3); L(n + 1, 0, n + 12, 0, '#f0faff', 1);
      L(n + 2, -2, n + 5, -4, '#c8e8ff', 1); L(n + 2, 2, n + 5, 4, '#c8e8ff', 1); L(n + 5, -1, n + 7, -3, '#c8e8ff', 1);
      return W.P(n + 12, 0);
    },
    // the Oathwarden: the Dawnbrand, gold-white, light running down the middle of it, a sunburst for a guard
    oathwarden(W) {
      const { L, D, n, t } = kit(W);
      L(-6, 0, 1, 0, '#5a4a30', 2); D(-8, -1, 3, 3, '#fff0b0');
      for (let r = 0; r < 8; r++) { const a = r * Math.PI / 4 + t * 0.6; L(2, 0, 2 + Math.cos(a) * 5, Math.sin(a) * 5, '#e8c860', 1); }
      L(3, 0, n, 0, '#c8a860', 4); L(3, 0, n, 0, '#f0e0a8', 3); L(4, 0, n - 1, 0, '#ffffff', 1); L(n, 0, n + 4, 0, '#f0e0a8', 2);
      return W.P(n + 4, 0);
    },
    // Lord-Marshal Vane: the sword he surrendered, rusted, notched from the last day, and still tied with the hangman's cord they bound it with
    marshal(W) {
      const { L, D, n } = kit(W);
      L(-5, 0, 1, 0, '#2a2420', 2); D(-7, -1, 2, 2, '#4a4440'); L(2, -5, 2, 5, '#4a4440', 2);
      L(-1, 1, -5, 4, '#8a7a50', 1); L(-5, 4, -8, 3, '#8a7a50', 1); D(-2, 1, 2, 2, '#a8986a');
      L(3, 0, n - 2, 0, '#3a302a', 4); L(3, 0, n - 2, 0, '#7a6a5e', 3); L(4, 0, n - 4, 0, '#9a8a7a', 1);
      for (const a of [7, 13, 19, n - 8]) D(a, -1, 2, 2, '#7a4a2a');
      for (const a of [10, 17, n - 6]) D(a, 1, 1, 1, '#140e0c');
      L(n - 2, -1, n, 0, '#7a6a5e', 2); L(n - 2, 1, n - 1, 1, '#140e0c', 1);
      return W.P(n, 0);
    },
  };
  for (const k in WEAP) if (G.ENEMIES[k]) G.ENEMIES[k].wdraw = WEAP[k];
  G.BOSS_WEAPONS = WEAP;
})();
