'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — soul lilies. Pale, cold, faintly glowing lilies that grow only
// where someone died whom nobody named. Twelve of them, hidden across the
// world, most where the knight must climb, glide or fight to reach. Picking one
// frees the soul in it: a wisp rises, says its name once, and goes. Each makes
// the knight a little harder to kill; all twelve light his wings.
// ---------------------------------------------------------------------------
(() => {
  G.SOUL_HP = 5;   // life gained for each soul set free
  const SOULS = [
    { lv: 0, x: -900, name: 'Ada', line: 'I kept bees. They stung the soldiers for me.' },
    { lv: 2, x: 4200, alt: 72, name: 'Tobin', line: 'I went in after my dog. I found him. That was something.' },
    { lv: 3, x: 2200, name: 'Mother Rue', line: 'I counted the children out of the village. I never counted myself.' },
    { lv: 4, x: 4320, alt: 74, name: 'Brother Ivo', line: 'I lit the candles every morning. Who lights them now?' },
    { lv: 5, x: 5255, alt: 120, name: 'Hal Brennick', line: 'Ship\'s boy. I climbed the mast to see home. I saw it.' },
    { lv: 6, x: 5415, alt: 140, name: 'Sister Agna', line: 'They put me down here alive. I sang so the others would not be afraid.' },
    { lv: 7, x: 4960, alt: 80, name: 'Mirel', line: 'A novice. I was going to take my vows on the Sunday.' },
    { lv: 9, x: 2500, alt: 60, name: 'Old Fenn', line: 'Ferryman before Osk. The water took me back. It always does.' },
    { lv: 11, x: 2600, name: 'Cate', line: 'The pickers\' girl. I hid in the apple loft when the fire came.' },
    { lv: 12, x: 3200, name: 'Jon Tallow', line: 'I was hanged for stealing bread. I did steal it. It was good bread.' },
    { lv: 14, x: 3110, name: 'Wenna the Elder', line: 'I walked west to see the dawn. I am still walking.' },
    { lv: 15, x: 4180, name: 'Fennick', line: 'Third line. Nobody told my mother. Tell her. Tell her Fennick.' },
  ];
  G.SOUL_TOTAL = SOULS.length;
  for (const s of SOULS) (G.LEVELS[s.lv].items = G.LEVELS[s.lv].items || []).push({ x: s.x, alt: s.alt || 0, kind: 'soul', soul: s });

  // the freed souls, rising
  const wisps = [];
  const free = (g, s, x, y) => {
    const p = g.player, n = g.items.soul = (g.items.soul || 0) + 1;
    p.hp = Math.min(p.maxHp, p.hp + G.SOUL_HP + 20);
    wisps.push({ x, y: y - 30, t: 0, lv: g.levelIdx, s });
    G.sfx('cleanse'); G.sfx('chime');
    G.questLog.banners.push({ kind: 'Soul lily  ·  ' + n + ' of ' + G.SOUL_TOTAL, title: '"' + s.line + '"', sub: s.name + ' is free. You feel a little harder to kill', t: 5.5 });
    if (n >= G.SOUL_TOTAL) setTimeout(() => {
      G.questLog.banners.push({ kind: 'Every soul lily', title: 'Twelve names, said aloud', sub: 'Your wings take on their light: Soul-Lit, in the Wardrobe', t: 6 }); G.sfx('bell');
      if (g.fairy) g.fairy.sayLine('Twelve. You let twelve of them go. ...I could have kept them, you know. I did not ask to. Remember that.');
    }, 5600);
  };
  G.ITEM_KINDS = Object.assign(G.ITEM_KINDS || {}, {
    soul: {
      prompt: (g, it, i, take, y) => ({ x: it.x, y: y - 56, label: 'Free the soul in the lily', fn: take(() => free(g, it.soul, it.x, y - 24)) }),
      draw(ctx, g, it, i, t, y) {
        const x = Math.round(it.x / 2) * 2, fl = 0.75 + Math.sin(t * 2.3 + i) * 0.15;
        ctx.save(); ctx.translate(x, y); ctx.scale(1.5, 1.5); ctx.translate(-x, -y);   /* a little larger than life */
        const gl = ctx.createRadialGradient(x, y - 18, 2, x, y - 18, 46); gl.addColorStop(0, `rgba(170,220,255,${0.5 * fl})`); gl.addColorStop(1, 'rgba(170,220,255,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 46, y - 64, 92, 92);
        ctx.fillStyle = '#5a8aa0'; ctx.fillRect(x, y - 16, 2, 16); ctx.fillRect(x - 4, y - 6, 4, 2); ctx.fillRect(x + 2, y - 9, 4, 2);   // stem and leaves
        ctx.globalAlpha = 0.8 + Math.sin(t * 3.1 + i) * 0.15;
        ctx.fillStyle = '#d8f0fa'; ctx.fillRect(x - 6, y - 26, 4, 10); ctx.fillRect(x + 4, y - 26, 4, 10); ctx.fillRect(x - 2, y - 30, 6, 14);   // three pale petals
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y - 28, 2, 8); ctx.fillRect(x - 8, y - 28, 2, 4); ctx.fillRect(x + 8, y - 28, 2, 4);   // their tips curling out
        ctx.fillStyle = '#9ad0ea'; ctx.fillRect(x - 4, y - 18, 10, 2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(220,245,255,0.8)';   // motes rising off it
        for (let k = 0; k < 4; k++) { const ph = (t * 0.5 + k * 0.25 + i * 0.13) % 1; ctx.fillRect(x - 6 + k * 4 + Math.round(Math.sin(t * 2 + k) * 3), Math.round(y - 30 - ph * 40), 2, 2); }
        ctx.restore();
      },
    },
  });
  G.EXTRA_DRAW = (G.EXTRA_DRAW || []).concat([(ctx, g, t) => {
    for (let i = wisps.length - 1; i >= 0; i--) {
      const w = wisps[i]; w.t += 1 / 60; if (w.t > 4 || w.lv !== g.levelIdx) { wisps.splice(i, 1); continue; }
      const k = w.t / 4, a = w.t < 0.5 ? w.t / 0.5 : 1 - Math.max(0, (w.t - 2.6) / 1.4), x = w.x + Math.sin(w.t * 2.4) * 14 * (1 + k), y = w.y - w.t * 46;
      const gl = ctx.createRadialGradient(x, y, 1, x, y, 30); gl.addColorStop(0, `rgba(200,236,255,${0.6 * a})`); gl.addColorStop(1, 'rgba(200,236,255,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 30, y - 30, 60, 60);
      ctx.save(); ctx.translate(x, y); ctx.scale(1.8, 1.8); ctx.translate(-x, -y);
      ctx.globalAlpha = a; ctx.fillStyle = '#eefaff';   // a small figure, hood and trailing hem, looking back once
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 10, 6, 6); ctx.fillRect(Math.round(x) - 4, Math.round(y) - 4, 8, 10);
      for (let q = 0; q < 5; q++) ctx.fillRect(Math.round(x - 4 + q * 2 + Math.sin(w.t * 6 + q) * 1.5), Math.round(y + 6 + (q % 2) * 2), 2, 3 + (q % 3));
      ctx.fillStyle = '#3a6a8a'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 8, 1, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) - 8, 1, 1);
      ctx.globalAlpha = 1; ctx.restore();
      if (w.t > 0.6 && w.t < 3.4) { ctx.font = '15px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, (w.t - 0.6) * 2, (3.4 - w.t) * 2); ctx.fillStyle = '#000'; ctx.fillText(w.s.name, x + 1, y - 33); ctx.fillStyle = '#cfeeff'; ctx.fillText(w.s.name, x, y - 34); ctx.globalAlpha = 1; }
    }
  }]);
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
})();
