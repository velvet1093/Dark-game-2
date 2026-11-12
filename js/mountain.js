'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Pilgrims' Pass: a snowbound mountain road above Hollowmere,
// to the monastery of the Windcallers. Its wind comes in gusts that push the
// knight back down the road (and, on Unfair, sometimes the other way, toward
// the crevasses). Shelter behind the standing stones; hold your guard and the
// wind has less of you; time a crevasse jump for the lull.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM, LV = 8;

  // ---- who lives up here
  Object.assign(G.LOOKS, {
    sigrun: { soft: 1, iris: '#5a7aa0', skin: '#c0a894', body: '#4a3a30', trim: '#d8d0c4', arm: '#4a3a30', leg: '#2e2620', helm: 'hood', helmCol: '#8a3a2a', hair: '#d8d0c4' },
    aldous: { skin: '#a8a0a0', body: '#3a3e4a', arm: '#3a3e4a', leg: '#2a2c34', helm: 'hood', helmCol: '#c8ccd6', beard: '#e0e0e8' },
    bram: { beard: '#7a4a2a', skin: '#b08a72', body: '#5a2a22', trim: '#2a1a14', arm: '#b08a72', leg: '#2e2620', helm: 'hood', helmCol: '#6a6a6a' },
  });
  Object.assign(G.ENEMIES, {
    pilgrim: {
      name: 'Frozen Pilgrim', hp: 88, limbHp: 34, speed: 48, ichor: 55, aggro: 360, weapon: 'club', wlen: 30, hunch: 0.45, windMul: 0.8,
      look: { skin: '#9aa8b8', body: '#5a6070', arm: '#9aa8b8', leg: '#3a3e4a', helm: 'hood', helmCol: '#c8ccd6', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.55, active: 0.12, rec: 0.6, dmg: 18, reach: 64, lunge: 130, anim: A.chop },
        { wind: 0.8, active: 0.16, rec: 0.8, dmg: 26, reach: 70, lunge: 160, anim: A.slam },
      ],
    },
    wolf: {
      name: 'White Wolf', model: 'hound', coat: '#b8c0cc', hp: 58, limbHp: 22, speed: 200, ichor: 45, aggro: 480, weapon: 'none', height: 52, limbs: ['head', 'legF', 'legB'], windMul: 0.2,
      look: { skin: '#d8dce4', body: '#b8c0cc', arm: '#b8c0cc', leg: '#b8c0cc', helm: 'none', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.34, active: 0.2, rec: 0.6, dmg: 16, reach: 62, trigger: 160, min: 70, lunge: 560, anim: A.claw },
        { wind: 0.22, active: 0.1, rec: 0.42, dmg: 11, reach: 50, lunge: 120, anim: A.claw },
      ],
    },
    warden: {
      name: 'Cairn Warden', hp: 175, limbHp: 64, speed: 50, ichor: 140, aggro: 380, weapon: 'spear', wlen: 60, scale: 1.3, poise: true, windMul: 0.15,
      look: { skin: '#8a909a', body: '#4a4e58', trim: '#c8ccd6', arm: '#3e424c', leg: '#2c2e36', helm: 'helm', helmCol: '#6a707a', plume: '#c8ccd6', cape: '#8a8a8a', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.6, active: 0.14, rec: 0.7, dmg: 26, reach: 120, trigger: 150, lunge: 220, anim: A.thrust },
        { wind: 0.7, active: 0.14, rec: 0.75, dmg: 30, reach: 96, lunge: 120, anim: A.chop },
      ],
    },
    windcaller: {
      name: 'Brother Hask, the Windcaller', boss: true, hp: 560, limbHp: 150, speed: 70, ichor: 1300, aggro: 9999, windMul: 0,
      weapon: 'axe', wlen: 52, scale: 1.45, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'THE WIND IS HIS',
      look: { skin: '#9aa8b8', body: '#3a3e4a', trim: '#c9a13b', arm: '#3a3e4a', leg: '#2a2c34', helm: 'hood', helmCol: '#c8ccd6', beard: '#e0e0e8', cape: '#5a6070', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.12, rec: 0.6, dmg: 28, reach: 104, lunge: 180, anim: A.chop },
        { wind: 0.46, active: 0.12, rec: 0.6, dmg: 26, reach: 104, lunge: 170, anim: A.rise },
        { wind: 0.66, active: 0.14, rec: 0.75, dmg: 34, reach: 120, trigger: 260, min: 110, lunge: 560, anim: A.thrust },
        // the horn: no blow at all, only the wind
        { wind: 0.9, active: 0.5, rec: 0.6, dmg: 0, reach: 0, trigger: 250, min: 40, lunge: 0, horn: true, anim: A.claw },
      ],
    },
  });
  G.WEAPONS.iceaxe = {
    name: "Pilgrim's Ice-Axe", draw: 'axe', len: 34, bleed: 30,
    light: [
      { wind: 0.16, active: 0.1, rec: 0.26, dmg: 19, st: 12, reach: 70, lunge: 170, sever: 1.6, anim: A.chop },
      { wind: 0.16, active: 0.1, rec: 0.3, dmg: 21, st: 13, reach: 70, lunge: 170, sever: 1.7, anim: A.rise },
      { wind: 0.2, active: 0.1, rec: 0.38, dmg: 26, st: 15, reach: 72, lunge: 200, sever: 2, anim: A.chop },
    ],
    heavy: { wind: 0.4, active: 0.12, rec: 0.45, dmg: 46, st: 30, reach: 78, lunge: 240, sever: 2.6, poiseBreak: true, anim: A.slam },
  };
  G.ABILITIES.boots = { name: 'Hobnailed Boots', how: 'The wind pushes you only half as far. On the ground, the gusts hardly move you.' };
  G.ICON_NAMES.push('The Saint in the Snow', 'The Saint and the Wolf', 'The Saint on the Summit');

  // ---- the way up: a goat path behind Hollowmere's last houses
  G.LEVELS[3].passages = (G.LEVELS[3].passages || []).concat([{ x: 4860, to: LV, at: 120, needs: 'dj', label: 'Climb the Pilgrims\' Pass',
    shut: 'A goat path up a sheer cliff. There is no way up. Not yet', wist: 'Up THERE? It is all wind and old monks. Nobody dies interestingly in the snow. They just stop.',
    slides: ['The goat path climbs out of the village and keeps climbing, past the last fences, past the last trees.\n\nThe snow begins. Then the wind.\n\nAbove, on the saddle of the mountain, a monastery bell is swinging. Nobody is ringing it. The wind is.'] }]);

  const SHELTERS = [680, 1180, 1700, 2230, 2980, 3620, 4240, 4880, 5400];
  G.LEVELS.push({
    name: 'The Pilgrims\' Pass', chapter: 'Above Hollowmere', theme: 'mountain', length: 6400, seed: 131,
    back: { to: 3, at: 4920 }, backLabel: 'Climb back down to Hollowmere',
    shrines: [240, 3300],
    wind: { dir: -1, strength: 190, calm: [3.2, 5.5], gust: [2.4, 3.6], warn: 1.1, shelters: SHELTERS },
    enemies: [['pilgrim', 620], ['wolf', 900], ['wolf', 960], ['pilgrim', 1620], ['warden', 1900], ['pilgrim', 2400], ['wolf', 2700], ['wolf', 2760], ['wolf', 2820],
      ['pilgrim', 3500, 'bram'], ['pilgrim', 3560, 'bram'], ['warden', 3900], ['wolf', 4400], ['pilgrim', 4500], ['warden', 5000], ['pilgrim', 5200], ['crow', 2000], ['crow', 4700, 'unfair']],
    npcs: [
      { id: 'sigrun', x: 330, name: 'Sigrun the Guide', look: 'sigrun', pose: 'stand', essential: true,
        lines: [
          ['Sigrun', 'Turn back, knight. ...No? Then listen, because I will only say it once and the wind will take half of it.'],
          ['Sigrun', 'When it howls, a gust is coming. Get behind a standing stone, or plant your feet and raise your guard. A man with his shield up is a wall. A man running is a leaf.'],
          ['Sigrun', 'Never jump a crevasse into the wind. Wait for the lull. The pilgrims who did not wait are still down there.'],
          ['Misery', 'Oh, I like her. She sounds like me, but sad.'],
        ],
        repeat: [['Sigrun', 'Stones. Guard. Lulls. Go.']] },
      { id: 'bram', x: 3420, name: 'Bram the Woodcutter', look: 'bram', pose: 'stand', fighter: true, hp: 240, dmg: 17, weapon: 'axe', wlen: 40,
        lines: [
          ['Bram', 'Ha! A knight! Stand with me, the dead are walking up from the road again.'],
          ['Bram', 'I cut wood for the monks. There have not been any monks for a year. I keep cutting. A man needs a reason to stay warm.'],
        ],
        repeat: [['Bram', 'Keep your back to the stone and your edge to the road.']] },
      { id: 'aldous', x: 3210, name: 'Brother Aldous', look: 'aldous', pose: 'kneel', essential: true,
        lines: [
          ['Brother Aldous', 'The last of the Windcallers. Or the second-last. Hask is still up at the bell, and he is not a brother of anything now.'],
          ['Brother Aldous', 'We blew the great horns to drive the weeping-sickness off the mountain. It worked, for a while. The wind carried it down. Down to the villages.'],
          ['Knight', 'To Hollowmere.'],
          ['Brother Aldous', 'To Hollowmere. Hask could not bear it, so he blew harder. He has been blowing for a year. He thinks if he stops, it will all come back up.'],
          ['Misery', 'It will, a bit. That is the fun of it.'],
          ['Brother Aldous', 'Take his boots off him when you are done. Hobnails. They are the only thing up here the wind cannot move.'],
        ],
        repeat: [['Brother Aldous', 'Listen for the howl. It always howls first. Except when it does not.']] },
    ],
    lore: [
      { x: 1050, title: 'Cairn Inscription', text: 'PILGRIM: GO UP WITH THE WIND IN YOUR FACE AND COME DOWN WITH IT AT YOUR BACK.\n\nBeneath, scratched with a knife:\n\nwe are not coming down' },
      { x: 2520, title: "Torvald's Last Note", text: 'Sigrun —\n\nThe rope went in the gust. I am on a shelf below the crack, and the shelf is small, and I am very cold.\n\nDo not come for me. I mean it. You would only stand there at the edge with your guard up like I taught you, and the wind would wait.\n\nIt always waits.\n\n— T.' },
      { x: 5500, title: "Hask's Sermon", text: 'The wind is the breath of God. The wind is the breath of God. The wind is the breath of God, and God is coughing, and I must keep Him coughing, so He does not breathe in.' },
    ],
    items: [{ x: 4460, weapon: 'iceaxe' }, { x: 1330, alt: 140, icon: 1 }, { x: 2900, icon: 1, gate: 'bars' }, { x: 4180, alt: 72, icon: 1 }, { x: 3780, cache: 320 }, { x: 5320, thorns: 2 }],
    platforms: [{ x: 1250, w: 120, h: 72 }, { x: 1300, w: 70, h: 140 }, { x: 4120, w: 120, h: 72 }],
    pits: [{ x: 1450, w: 72 }, { x: 2560, w: 78 }, { x: 4040, w: 74 }, { x: 4620, w: 70 }, { x: 5120, w: 76 }],
    boss: {
      type: 'windcaller', gate: 5620, x: 5980, end: 6280, grants: 'boots',
      intro: [
        ['Brother Hask', 'Back. BACK. Down the mountain with you, with all of it. The wind takes it down. I make the wind.'],
        ['Knight', 'The wind takes it to Hollowmere.'],
        ['Brother Hask', 'Better there than here! Better anywhere than here! Do you know what it is like, to hear them weeping in the snow?'],
        ['Misery', 'I do. It is lovely.'],
        ['Brother Hask', 'Then you can go down WITH it!'],
      ],
      retry: [['Brother Hask', 'Back down the mountain! BACK!']],
      lastWords: [['Brother Hask', 'If I stop... it comes back up...'], ['Knight', 'Then let it come. I am going up anyway.']],
    },
  });

  // Sigrun asks after her brother.
  G.QUESTS.rope = {
    title: 'The Rope Went in the Gust', start: { talk: 'sigrun' }, giver: 'sigrun', reward: { thorns: 3, ichor: 300 },
    offer: [['Sigrun', 'My brother Torvald went up a year ago with a rope and a lantern. If you find him — or what he left — tell me. Just tell me.']],
    waiting: [['Sigrun', 'Torvald. Red scarf. Somewhere up the pass. Tell me if you find him.']],
    steps: [
      { type: 'read', lore: LV + ':1', text: 'Look for Torvald, somewhere up the Pilgrims\' Pass' },
      { type: 'talk', npc: 'sigrun', text: 'Tell Sigrun what you found', lines: [
        ['Knight', 'He was on a shelf below the second crevasse. He left you a note.'],
        ['Sigrun', '...It always waits. He used to say that. I thought he meant the wind.'],
        ['Sigrun', 'Take these. He would have wanted the thorns to go to something with teeth.'],
        ['Misery', 'Oh! She means me.'],
      ] },
    ],
  };

  // ---------------------------------------------------------------------------
  // The wind: calm, a howl of warning, then a gust. Standing stones give shelter
  // on their downwind side. A raised guard halves the push; the hobnailed boots
  // halve it again. On Unfair the warning is shorter, the gusts stronger, and one
  // in three blows the other way.
  // ---------------------------------------------------------------------------
  G.wind = {
    sheltered(L, x, dir) { return (L.wind.shelters || []).some(s => (x - s) * dir > 0 && Math.abs(x - s) < 120); },
    tick(g, dt) {
      const L = g.level, W = L.wind; g.windNow = 0;
      if (!W || g.inside) { g.windS = null; return; }
      const un = G.unfair(), p = g.player;
      let s = g.windS; if (!s || s.lv !== g.levelIdx) s = g.windS = { lv: g.levelIdx, phase: 'calm', t: 0, dur: 3, dir: W.dir, k: 0 };
      s.t += dt;
      const boss = g.bossFight && g.boss && g.boss.def.windMul === 0;
      if (s.phase === 'calm' && s.t >= s.dur && !boss) {
        s.phase = 'warn'; s.t = 0; s.dur = un ? W.warn * 0.3 : W.warn; s.dir = un && Math.random() < 0.33 ? -W.dir : W.dir;
        G.sfx('whoosh'); if (!un || Math.random() < 0.5) G.text(p.x, G.GROUND - 170, 'THE WIND HOWLS', '#c8d0e0', 14);
      } else if (s.phase === 'warn' && s.t >= s.dur) this.gust(g, s, W);
      else if (s.phase === 'gust' && s.t >= s.dur) { s.phase = 'calm'; s.t = 0; s.dur = G.rand(W.calm[0], W.calm[1]) * (un ? 0.75 : 1); }
      // strength eases in and out
      s.k = s.phase === 'gust' ? Math.min(1, s.t / 0.4, (s.dur - s.t) / 0.5 + 0.2) : Math.max(0, s.k - dt * 3);
      const F = W.strength * (un ? 1.3 : 1) * s.k * s.dir; g.windNow = F;
      if (!F) return;
      // the knight
      if (!p.dead && p.state !== 'execute' && p.state !== 'sit' && !this.sheltered(L, p.x, s.dir)) {
        let m = p.air ? 1.05 : p.state === 'block' ? 0.3 : p.state === 'roll' ? 0.5 : 0.65;
        if (g.abilities.boots) m *= p.air ? 0.6 : 0.4;
        const px0 = p.x; p.x += F * m * dt; p.x = G.clamp(p.x, g.bounds[0], g.bounds[1]); p.x = g.gateClamp(px0, p.x, p.alt);
        if (Math.random() < dt * 8) G.fx.sparks.push({ x: p.x - s.dir * 10, y: G.GROUND - p.alt - G.rand(10, 60), vx: F * 0.8, vy: G.rand(-10, 10), t: 0.3 });
      }
      // everything else that stands on the mountain (bosses and wardens hardly at all)
      for (const e of g.enemies) {
        if (e.dead || e.dormant || e.state === 'executed' || this.sheltered(L, e.x, s.dir)) continue;
        const m = e.def.windMul != null ? e.def.windMul : e.def.fly ? 1.2 : 0.6;
        if (m) { e.x += F * m * 0.7 * dt; if (g.bossFight) e.x = G.clamp(e.x, L.boss.gate + 24, L.boss.end + 20); }
      }
      // Misery is very light
      if (!g.fairyAway && !g.fairy.sitting) g.fairy.x += F * 0.9 * dt;
    },
    gust(g, s, W) {
      s.phase = 'gust'; s.t = 0; s.dur = G.rand(W.gust[0], W.gust[1]) * (G.unfair() ? 1.2 : 1); G.sfx('gust'); g.shake = Math.max(g.shake, 2);
      if (!g.windTold) { g.windTold = 1; g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.gust)); }
      else if (Math.random() < 0.25 && !g.fairy.say) g.fairy.sayLine(G.pick(G.FAIRY.gust));
    },
    // Brother Hask's horn: a gust on demand, straight at the knight
    horn(g, e) {
      const L = g.level, W = L.wind; if (!W) return;
      const s = g.windS || (g.windS = { lv: g.levelIdx, phase: 'calm', t: 0, dur: 3, dir: W.dir, k: 0 });
      s.dir = g.player.x >= e.x ? 1 : -1; this.gust(g, s, W); s.dur = G.unfair() ? 2.6 : 2;
      G.sfx('horn'); G.text(e.x, G.GROUND - 170 * e.scale, 'HE SOUNDS THE HORN', '#c8d0e0', 16);
    },
    // The standing stones, drawn in the world.
    draw(ctx, g, t) {
      const L = g.level; if (!L.wind || g.inside) return;
      const gy = G.GROUND;
      for (const x of L.wind.shelters) {
        ctx.fillStyle = '#2a2e3a'; ctx.beginPath(); ctx.moveTo(x - 18, gy); ctx.lineTo(x - 14, gy - 120); ctx.lineTo(x - 2, gy - 132); ctx.lineTo(x + 14, gy - 116); ctx.lineTo(x + 18, gy); ctx.fill();
        ctx.fillStyle = '#3e4452'; ctx.fillRect(x - 12, gy - 118, 6, 110);
        ctx.fillStyle = '#c8d0e0'; ctx.fillRect(x - 14, gy - 124, 24, 4); ctx.fillRect(x - 16, gy - 4, 34, 4);   // snow on its head and at its foot
        ctx.fillStyle = '#5a6070'; ctx.fillRect(x - 4, gy - 90, 8, 2); ctx.fillRect(x - 1, gy - 96, 2, 14);    // a cross cut in it
      }
    },
  };
})();
