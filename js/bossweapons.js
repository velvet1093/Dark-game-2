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
    // Gaunt: a butcher's cleaver the size of a door, the edge chewed into teeth, red to the spine
    hangman(W) {
      const { L, D, n, red } = kit(W);
      L(-6, 0, 6, 0, '#3a2418', 3); D(-7, -1, 2, 2, '#6a4a2a');
      for (let c = -2; c <= 11; c++) L(7, c, n + 3, c, c <= -1 ? '#2a2a30' : c >= 9 ? '#8a1818' : c % 5 === 0 ? '#5a5a64' : '#7a7a84', 2);
      L(7, -2, n + 3, -2, '#9a9aa6', 1); L(n + 3, -2, n + 3, 11, '#4a4a52', 2); D(n - 3, 0, 3, 3, '#1a1a1e');
      for (let a = 8; a < n + 2; a += 3) { L(a, 11, a + 1.5, 13, red ? '#8f0810' : '#d8d0c8', 2); }
      for (const [a, c] of [[12, 6], [18, 8], [n - 4, 5]]) D(a, c, 2, 3, '#5a0a0a');
      return W.P(n + 3, 12);
    },
    // Ser Garrick: the Oathkeeper, a broad violet blade with a pale edge, a gold guard, a red seal on it
    garrick(W) {
      const { L, D, n } = kit(W);
      L(-5, 0, 1, 0, '#3a1a1a', 2); D(-7, -1, 3, 3, '#c9a13b');
      L(2, -7, 2, 7, '#c9a13b', 3); D(1, -1, 3, 3, '#8a1018');
      L(4, 0, n, 0, '#2a1a3a', 6); L(4, 0, n, 0, '#5a3a7a', 4); L(5, -1, n - 2, -1, '#7a5aa0', 1); L(5, 2, n - 3, 2, '#c8b0e8', 1); L(n, 0, n + 4, 0, '#5a3a7a', 3); L(n + 4, 0, n + 6, 0, '#7a5aa0', 1);
      return W.P(n + 6, 0);
    },
    // the Standard-Bearer: the colours are on his back; in his hand, a short curved sabre, sea-pitted
    bearer(W) {
      const { L, D, n } = kit(W), m = Math.round(n * 0.62);
      L(-4, 0, 1, 0, '#3a2a1a', 2); L(2, -4, 2, 4, '#c9a13b', 2); L(2, 4, -3, 5, '#c9a13b', 1);
      for (let a = 3; a <= m; a++) { const c = (a * a) / (m * 2.2); W.R(...W.P(a, c).map(Math.round), 3, 3, '#8a8c96'); W.R(...W.P(a, c + 1).map(Math.round), 2, 2, '#c8cad4'); }
      for (const a of [8, 14]) { const c = (a * a) / (m * 2.2); W.R(...W.P(a, c).map(Math.round), 1, 1, '#5a6a64'); }
      return W.P(m, (m * m) / (m * 2.2));
    },
    // Malvern: the gold crozier, thorned, and a censer swinging from the crook, smoking
    malvern(W) {
      const { L, D, n, t } = kit(W), b = -n * 0.35;
      L(b, 0, n, 0, '#8a6a20', 2); L(b, 0, n, 0, '#d8b050', 1); for (const a of [n * 0.3, n * 0.65]) D(a - 1, -1, 3, 3, '#e8c860');
      const pts = [[n, 0], [n + 2, 0], [n + 4, 0.5], [n + 6, 1.5], [n + 7, 3], [n + 7, 5], [n + 6, 6.5], [n + 4, 7], [n + 2, 6.5], [n + 1, 5], [n + 1.5, 3.5], [n + 3, 3]];
      for (let i = 1; i < pts.length; i++) L(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], '#d8b050', 2);
      for (const [a, c] of [[n + 5, -1], [n + 8, 2], [n + 8, 6], [n + 4, 8]]) D(a, c, 1, 1, '#f0d878');
      const [hx, hy] = W.P(n + 5, 7), sw = Math.round(Math.sin(t * 2.4) * 2);   // the censer hangs straight down, whatever the staff does
      for (let k = 1; k <= 7; k++) W.R(Math.round(hx + sw * k / 7), Math.round(hy + k), 1, 1, k % 2 ? '#8a8478' : '#c8c0b0');
      W.R(Math.round(hx + sw) - 2, Math.round(hy) + 8, 5, 2, '#c9a13b'); W.R(Math.round(hx + sw) - 3, Math.round(hy) + 10, 7, 4, '#a8842a'); W.R(Math.round(hx + sw) - 2, Math.round(hy) + 11, 5, 2, '#ff8a30'); W.R(Math.round(hx + sw) - 1, Math.round(hy) + 14, 3, 1, '#8a6a20');
      for (let k = 0; k < 3; k++) { const ph = (t * 0.7 + k / 3) % 1; W.R(Math.round(hx + sw + Math.sin(t * 2 + k * 2) * 3), Math.round(hy + 7 - ph * 12), 1, 1, '#b8b0c0'); }
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
    // the Charcoal Widow: a long iron poker from the kilns, the hooked end still white-hot, dropping sparks
    widow(W) {
      const { L, D, n, t } = kit(W), b = -n * 0.3, hot = Math.sin(t * 9) > 0 ? '#ffb050' : '#ffe0a0';
      L(b, 0, n - 6, 0, '#0e0a0a', 2); L(b, 0, n - 6, 0, '#3a3030', 1); L(b - 1, -2, b - 1, 2, '#3a3030', 2);
      L(n - 6, 0, n, 0, '#8a2a10', 2); L(n - 3, 0, n + 2, 0, '#ff7a20', 2); L(n + 2, 0, n + 3, 3, hot, 2); L(n + 3, 3, n, 5, hot, 2);
      for (let k = 0; k < 3; k++) { const ph = (t * 1.2 + k / 3) % 1, [x, y] = W.P(n + 1, 4); W.R(Math.round(x + Math.sin(k * 3 + t * 5) * 2), Math.round(y + ph * 8), 1, 1, ph < 0.5 ? '#ffe0a0' : '#ff7a20'); }
      return W.P(n + 3, 3);
    },
    // Abbot Ulric: his staff, frozen to his hand, its head grown into a cross of ice
    abbot(W) {
      const { L, D, n } = kit(W), b = -n * 0.35;
      L(b, 0, n, 0, '#7a98b8', 2); L(b, 0, n, 0, '#d8ecff', 1); for (let a = b + 4; a < n; a += 7) { D(a, -1, 2, 1, '#f0faff'); L(a, 1, a - 1, 4, '#c8e4ff', 1); }
      L(n, 0, n + 13, 0, '#8ac0e8', 3); L(n + 1, 0, n + 15, 0, '#f0faff', 1); L(n + 6, -6, n + 6, 6, '#8ac0e8', 3); L(n + 6, -7, n + 6, 7, '#f0faff', 1);
      L(n + 2, -2, n + 4, -4, '#c8e8ff', 1); L(n + 2, 2, n + 4, 4, '#c8e8ff', 1); L(n + 9, -2, n + 11, -3, '#c8e8ff', 1); L(n + 9, 2, n + 11, 3, '#c8e8ff', 1);
      return W.P(n + 15, 0);
    },
    // the Oathwarden: the Dawnbrand, a broad gold blade with a cross let into it, a wide straight guard
    oathwarden(W) {
      const { L, D, n } = kit(W);
      L(-6, 0, 1, 0, '#5a4a30', 2); D(-8, -1, 3, 3, '#f0d878'); L(2, -8, 2, 8, '#c9a13b', 3); L(2, -8, 2, 8, '#f0d878', 1);
      L(4, 0, n, 0, '#a8842a', 6); L(4, 0, n, 0, '#e8c860', 4); L(5, 0, n - 1, 0, '#fff4c8', 1); L(n, 0, n + 5, 0, '#e8c860', 3); L(n + 5, 0, n + 7, 0, '#fff4c8', 1);
      L(9, 0, 17, 0, '#8a6a20', 1); L(12, -2, 12, 2, '#8a6a20', 1);
      return W.P(n + 7, 0);
    },
    // Lord-Marshal Vane: a war-sword as broad as a hand, notched all down one edge, bloodied, the hangman's cord still on the hilt
    marshal(W) {
      const { L, D, n } = kit(W);
      L(-5, 0, 1, 0, '#2a2420', 3); D(-7, -1, 3, 3, '#4a4440'); L(2, -7, 2, 7, '#5a5450', 3); L(-1, 1, -5, 4, '#8a7a50', 1); D(-2, 1, 2, 2, '#a8986a');
      L(4, 0, n, 0, '#3a3438', 7); L(4, 0, n, 0, '#8a8a90', 5); L(5, -1, n - 2, -1, '#b0b0b8', 1); L(n, 0, n + 4, 0, '#8a8a90', 4); L(n + 4, 0, n + 6, 0, '#8a8a90', 2);
      for (const a of [9, 15, 22, n - 5]) D(a, 3, 2, 2, '#1c181c');
      for (const [a, c, w] of [[n - 10, -2, 8], [n - 14, 1, 5], [12, 0, 4], [20, -1, 3]]) L(a, c, a + w, c, '#8a1818', 2);
      return W.P(n + 6, 0);
    },
  };
  for (const k in WEAP) if (G.ENEMIES[k]) G.ENEMIES[k].wdraw = WEAP[k];
  G.BOSS_WEAPONS = WEAP;
})();
