'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — two more places off the road, each with Martyr's Relics for the
// Weapon Arts, a mini-boss, people and notes:
//   The Under-Hold      — the catacombs under Brannoc's Hold, from the town.
//   The Ashfall Orchard — Hollowmere's burnt orchard, from the village's first lane.
// The trials hold relics too.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM;
  Object.assign(G.LOOKS, {
    quill: { skin: '#b5a99a', body: '#3a2e24', trim: '#c9a13b', arm: '#3a2e24', leg: '#2a2018', helm: 'hood', helmCol: '#2a2018', beard: '#cfc8b8' },
    teodor: { skin: '#9a8070', body: '#3a2a20', arm: '#9a8070', leg: '#2a2018', helm: 'none', beard: '#5a4a3a', hair: '#5a4a3a' },
  });
  Object.assign(G.ENEMIES, {
    rat: {
      name: 'Under-Hold Rat', model: 'hound', coat: '#4a3a32', hp: 34, limbHp: 14, speed: 215, ichor: 22, aggro: 420, weapon: 'none', height: 40, limbs: ['head', 'legF', 'legB'],
      look: { skin: '#c89a90', body: '#4a3a32', arm: '#4a3a32', leg: '#4a3a32', helm: 'none', eye: '#ff3b2f' },
      attacks: [{ wind: 0.26, active: 0.16, rec: 0.5, dmg: 9, reach: 52, trigger: 130, min: 50, lunge: 480, anim: A.claw }, { wind: 0.18, active: 0.1, rec: 0.36, dmg: 7, reach: 44, lunge: 100, anim: A.claw }],
    },
    ghoul: {
      name: 'Catacomb Ghoul', hp: 75, limbHp: 28, speed: 105, ichor: 50, aggro: 380, weapon: 'none', hunch: 0.6,
      look: { skin: '#8a9088', body: '#3a3a36', arm: '#8a9088', leg: '#2a2a26', helm: 'none', eye: '#ff3b2f' },
      attacks: [{ wind: 0.32, active: 0.12, rec: 0.45, dmg: 14, reach: 56, lunge: 260, anim: A.claw }, { wind: 0.5, active: 0.2, rec: 0.7, dmg: 20, reach: 70, trigger: 200, min: 80, lunge: 520, anim: A.claw }],
    },
    gravewarden: {
      name: 'The Gravewarden of Brannoc', boss: true, hp: 520, limbHp: 150, speed: 64, ichor: 1100, aggro: 9999, weapon: 'axe', wlen: 50, scale: 1.45, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'THE DEAD ARE MINE TO KEEP',
      summon: { type: 'rat', at: [0.66, 0.33], n: 3, text: 'THE RATS COME UP FROM THE GRAVES' },
      look: { skin: '#8a8478', body: '#2e2a26', trim: '#5a4a3a', arm: '#2e2a26', leg: '#1e1a18', helm: 'hood', helmCol: '#1a1614', beard: '#5a5448', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.55, active: 0.13, rec: 0.6, dmg: 28, reach: 104, lunge: 170, anim: A.chop },
        { wind: 0.85, active: 0.15, rec: 0.9, dmg: 40, reach: 118, lunge: 220, anim: A.slam },
        { wind: 0.65, active: 0.14, rec: 0.7, dmg: 30, reach: 120, trigger: 250, min: 110, lunge: 520, anim: A.thrust },
      ],
    },
    picker: {
      name: 'Ash-Picker', hp: 70, limbHp: 26, speed: 90, ichor: 48, aggro: 380, weapon: 'scythe', wlen: 32, hunch: 0.25,
      look: { skin: '#5a4a42', body: '#2a1e1a', arm: '#5a4a42', leg: '#1e1612', helm: 'hood', helmCol: '#3a2a20', eye: '#ffb040' },
      attacks: [{ wind: 0.38, active: 0.12, rec: 0.5, dmg: 16, reach: 70, lunge: 170, anim: A.chop }, { wind: 0.32, active: 0.12, rec: 0.45, dmg: 14, reach: 66, lunge: 160, anim: A.rise }],
    },
    widow: {
      name: 'The Charcoal Widow', boss: true, hp: 540, limbHp: 150, speed: 80, ichor: 1150, aggro: 9999, weapon: 'scythe', wlen: 66, scale: 1.4, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'BURN WITH THEM',
      summon: { type: 'picker', at: [0.6, 0.3], n: 2, text: 'SHE CALLS THE PICKERS FROM THE ASH' },
      look: { soft: 1, skin: '#3a302c', body: '#161012', trim: '#6a2410', arm: '#161012', leg: '#120c0e', helm: 'veil', helmCol: '#1a1214', eye: '#ffb040' },
      attacks: [
        { wind: 0.5, active: 0.15, rec: 0.6, dmg: 27, reach: 128, lunge: 170, anim: A.chop },
        { wind: 0.46, active: 0.15, rec: 0.6, dmg: 25, reach: 128, lunge: 160, anim: A.rise },
        // she shakes out her veil: ash and embers, and the sickness in them
        { wind: 0.75, active: 0.45, rec: 0.85, dmg: 12, reach: 200, trigger: 240, min: 70, lunge: 0, spew: 20, anim: A.claw },
      ],
    },
  });
  G.ICON_NAMES.push('The Saint Counting the Dead', 'The Saint among the Rats', 'The Saint in the Orchard', 'The Saint and the Ashes');
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
  G.BESTIARY_EXTRA.foes.push(
    ['rat', 'Rats as big as dogs, fat on three years of the dead nobody buried.', 'They come in fours. Back to a wall.'],
    ['ghoul', 'The catacomb diggers, still digging. They eat what they dig up.', 'A long leap from far off: step aside, then cut.'],
    ['picker', 'Hollowmere\'s orchard hands, burnt black and still out picking in the ash.', 'Quick sickles; their eyes glow like coals.'],
  );
  G.BESTIARY_EXTRA.bosses.push(
    ['gravewarden', 'He kept the graves under Brannoc\'s Hold, and when the dead stopped staying in them he kept them anyway.', 'His slam is slow and terrible. The rats come twice.'],
    ['widow', 'Teodor\'s wife. She stayed in the orchard when he lit it.', 'Her veil throws embers that fill your infection bar.'],
  );
  G.BESTIARY_EXTRA.people.push(
    { id: 'quill', name: 'Brother Quill', look: 'quill', text: 'Archivist of Brannoc\'s Hold, living in the catacombs with the town\'s records. He knows where the muster book went.' },
    { id: 'teodor', name: 'Teodor the Orchard-Keeper', look: 'teodor', text: 'He burnt Hollowmere\'s orchard to stop the weeping. His wife was in it.' },
  );

  // ---- the ways in
  G.LEVELS[1].passages = (G.LEVELS[1].passages || []).concat([{ x: 2700, to: G.LEVELS.length, at: 120, label: 'Go down into the Under-Hold',
    wist: 'Down there? It is just the dead. Lots and lots of the dead. I adore it.',
    slides: ['A grate behind the chapel, a stair, and the smell.\n\nUnder Brannoc\'s Hold the town keeps everything it does not want to look at: its records, its dead, and the man who looks after both.'] }]);
  G.LEVELS[3].passages = (G.LEVELS[3].passages || []).concat([{ x: 860, to: G.LEVELS.length + 1, at: 120, label: 'Walk out into the burnt orchard',
    wist: 'Smell that. Somebody burnt something they loved. My favourite smell.',
    slides: ['Behind the first lane of Hollowmere the orchard begins, or began.\n\nEvery tree is black. The ash is ankle-deep and still warm.\n\nSomeone is out there picking.'] }]);

  // ---- The Under-Hold
  const UH = G.LEVELS.length;
  G.LEVELS.push({
    name: 'The Under-Hold', chapter: 'Beneath Brannoc\'s Hold', theme: 'crypt', length: 4300, seed: 163,
    back: { to: 1, at: 2760 }, backLabel: 'Climb back up into Brannoc\'s Hold',
    shrines: [220, 2250],
    enemies: [['rat', 560], ['rat', 600], ['ghoul', 900], ['wretch', 1150], ['rat', 1400], ['rat', 1440], ['rat', 1480], ['ghoul', 1700], ['templar', 1950],
      ['ghoul', 2500], ['rat', 2700], ['rat', 2740], ['bloat', 2950], ['ghoul', 3150], ['rat', 3300, 'unfair'], ['rat', 3340, 'unfair']],
    npcs: [{ id: 'quill', x: 2380, name: 'Brother Quill', look: 'quill', pose: 'stand', essential: true,
      lines: [
        ['Brother Quill', 'Mind the rats. And the ledgers. Mostly the ledgers: the rats will only eat you.'],
        ['Brother Quill', 'Births, marriages, debts, deaths. Every name in Brannoc\'s Hold for two hundred years, and I am the last one who reads them.'],
        ['Knight', 'The muster book. The Long Battalion\'s names.'],
        ['Brother Quill', '...Ah. That one did not stay with me. It came through here three years ago in a sealed box, Bishop Malvern\'s seal, going up the hill.'],
        ['Brother Quill', 'To the Scriptorium, in the bell-tower of Saint Avaric, where the cathedral counts its dead. The tower has been shut since the Saint began to weep. I would very much like it back.'],
        ['Misery', 'Another locked door. How thrilling. You collect them.'],
      ],
      repeat: [['Brother Quill', 'The Scriptorium. The bell-tower of Saint Avaric. The muster book is there, I would stake my eyes on it.']] }],
    lore: [
      { x: 700, title: 'Charnel Notice', text: 'BY ORDER: THE WEEPING DEAD ARE TO BE STACKED, NOT BURIED. THERE IS NO MORE ROOM.\n\nBELOW, IN CHALK: there is no more room for stacking either' },
      { x: 1850, title: 'Ledger, Torn Out', text: 'Deaths, the Weeping Year. Column after column, and then the names stop and there are only tallies.\n\nIIII IIII IIII IIII IIII IIII IIII\n\nOn the last page: I could not keep up with the names. God forgive me, I started counting.' },
      { x: 3400, title: "The Gravewarden's Oath", text: 'I KEEP THE DEAD OF BRANNOC.\nI KEEP THEM IN.\nI KEEP THEM SAFE.\nNONE LEAVES.\n\nScratched over and over until the stone is soft.' },
    ],
    items: [{ x: 3950, relic: 1, relicName: 'Relic of the Uncounted', needs: 'boss_gravewarden_dead' }, { x: 1250, alt: 140, relic: 1, relicName: 'Relic of the Charnel Stair' }, { x: 1600, icon: 1, gate: 'bars' }, { x: 2900, alt: 72, icon: 1 }, { x: 2050, cache: 300 }],
    platforms: [{ x: 1180, w: 140, h: 72 }, { x: 1220, w: 80, h: 140 }, { x: 2840, w: 120, h: 72 }],
    pits: [{ x: 1000, w: 68 }, { x: 2600, w: 66 }],
    boss: {
      type: 'gravewarden', gate: 3500, x: 3800, end: 4100,
      intro: [['The Gravewarden', 'Living. LIVING. You are in the wrong place, little thing.'], ['The Gravewarden', 'Nobody leaves the Under-Hold. Not the dead. Not you.'], ['Misery', 'I love him. He is so committed.']],
      retry: [['The Gravewarden', 'Back again. They all come back. Down here.']],
      lastWords: [['The Gravewarden', 'Who will keep them... when I am gone...'], ['Knight', 'Nobody. Let them go.']],
      spare: { kind: 'yield', lines: [['Knight', 'Keep them, then. Keep them safe.'], ['The Gravewarden', '...Yes. Yes. Safe. I keep them safe.'], ['The Gravewarden', 'He turns his back on you and goes down among the stacked dead, counting softly, and does not come back up.']] },
    },
  });

  // ---- The Ashfall Orchard
  const AO = G.LEVELS.length;
  G.LEVELS.push({
    name: 'The Ashfall Orchard', chapter: 'Behind Hollowmere', theme: 'orchard', length: 4300, seed: 177,
    back: { to: 3, at: 920 }, backLabel: 'Walk back to Hollowmere',
    shrines: [240, 2300],
    enemies: [['picker', 650], ['picker', 720], ['crow', 900], ['hound', 1200], ['hound', 1260], ['picker', 1550], ['bloat', 1800], ['picker', 2100],
      ['crow', 2550], ['picker', 2700], ['picker', 2780], ['reaper', 3000], ['hound', 3250, 'unfair']],
    npcs: [{ id: 'teodor', x: 2420, name: 'Teodor the Orchard-Keeper', look: 'teodor', pose: 'kneel', essential: true,
      lines: [
        ['Teodor', 'Don\'t walk on the roots. They are still warm. Everything is still warm.'],
        ['Teodor', 'The weeping came into the orchard on the pickers. One by one, under the trees. I thought: if I burn it, it stops here. It does not go down into the village.'],
        ['Teodor', 'Marit would not leave. She said the pickers were frightened and somebody had to stay with them. So I lit it with her in it.'],
        ['Misery', 'Oh, I like this one very much.'],
        ['Teodor', 'It did not stop anything. It came down into Hollowmere anyway, on the wind. She is still out there, in the middle of the rows. She does not burn any more. She only burns everything else.'],
        ['Teodor', 'If you go to her... tell her the pickers are all gone. She can stop staying now.'],
      ],
      repeat: [['Teodor', 'Tell her she can stop staying now.']] }],
    lore: [
      { x: 1000, title: 'Picking Tally', text: 'Rows I to XII: picked.\nRows XIII to XX: picked.\nRows XXI onward: the pickers are weeping. Do not send more.\nRows XXI onward: send more.' },
      { x: 2200, title: 'Marit\'s Scarf', text: 'Caught on a black branch. Blue wool, unburnt, as if the fire went around it.\n\nInside, in thread: for T., who keeps the trees, from M., who keeps the people.' },
      { x: 3380, title: 'Charred Sign', text: 'HOLLOWMERE ORCHARD. APPLES, PEARS, MEDLARS.\n\nBurnt into it with a hot iron, later:\n\nI AM SORRY I AM SORRY I AM SORRY' },
    ],
    items: [{ x: 3980, relic: 1, relicName: 'Relic of the Last Picker', needs: 'boss_widow_dead' }, { x: 2915, alt: 150, relic: 1, relicName: 'Relic of the Blue Scarf' }, { x: 1350, alt: 120, icon: 1 }, { x: 3100, icon: 1, gate: 'veil' }, { x: 1700, cache: 300 }],
    platforms: [{ x: 1260, w: 120, h: 70 }, { x: 1320, w: 80, h: 120 }, { x: 2870, w: 90, h: 150 }],   // the high one wants the wings
    pits: [{ x: 1900, w: 66 }],
    boss: {
      type: 'widow', gate: 3500, x: 3800, end: 4100,
      intro: [['The Charcoal Widow', 'Another picker? No. You are too clean. Who sent you into my rows?'], ['Knight', 'Teodor.'], ['The Charcoal Widow', 'TEODOR. He lights the fire and sends a knight to put it out. Burn, then. BURN WITH THEM.']],
      retry: [['The Charcoal Widow', 'Still clean. Not for long.']],
      lastWords: [['The Charcoal Widow', 'Are the pickers... all gone?'], ['Knight', 'All gone. You can stop staying.']],
      spare: { kind: 'enrage', lines: [['Knight', 'Teodor says the pickers are all gone. You can stop staying.'], ['The Charcoal Widow', 'He SAYS. He always says. He said the fire would save them.'], ['The Charcoal Widow', 'I will not be pitied by his errand-boy. I will not be SAVED again!']] },
    },
  });
  // the trials keep a relic each, at their far end
  for (const [lv, x] of [[5, 5660], [6, 5980], [7, 5690]]) G.LEVELS[lv].items.push({ x, relic: 1, relicName: 'Relic of the Far Side' });
})();
