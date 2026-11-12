'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — two more places off the road:
//   The Hanging Wood   — behind the gibbets of the Gallows Road, where Gaunt's
//                        boy cut the hanged down at night. The Carrion King.
//   The Frozen Chapel  — a chapel on the Pilgrims' Pass where a whole choir froze
//                        mid-hymn, and the wind still blows. Abbot Ulric.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM;
  Object.assign(G.LOOKS, {
    wilm: { skin: '#b09a86', body: '#3a2a22', arm: '#b09a86', leg: '#2a2018', helm: 'hood', helmCol: '#2a1e18', hair: '#3a2a1e' },
    gerd: { skin: '#b0a8a0', body: '#4a4e58', arm: '#4a4e58', leg: '#2c2e36', helm: 'hood', helmCol: '#6a707a', beard: '#d8d8e0', eye: '#d8d8d0' },
  });
  Object.assign(G.ENEMIES, {
    noosed: {
      name: 'Noosed Dead', hp: 82, limbHp: 30, speed: 42, ichor: 52, aggro: 360, weapon: 'none', hunch: 0.2,
      look: { skin: '#6f7a68', body: '#2e2824', arm: '#6f7a68', leg: '#241f1c', helm: 'none', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.55, active: 0.2, rec: 0.6, dmg: 13, reach: 118, trigger: 130, min: 40, lunge: 60, anim: A.claw },   // the rope, still round its neck, swung like a whip
        { wind: 0.4, active: 0.12, rec: 0.5, dmg: 16, reach: 56, lunge: 140, anim: A.claw },
      ],
    },
    crowking: {
      name: 'The Carrion King', boss: true, model: 'crow', fly: true, hp: 430, limbHp: 140, speed: 150, ichor: 1000, aggro: 9999, stop: 150, weapon: 'none', height: 60, limbs: ['head', 'armF', 'armB'],
      scale: 2.4, poise: true, noSever: ['armF', 'armB'], shout: 'THE GIBBETS ANSWER', flyAlt: 150, diveAlt: 50,
      summon: { type: 'crow', at: [0.7, 0.45, 0.2], n: 2, text: 'THE MURDER COMES' },
      look: { skin: '#15131a', body: '#15131a', arm: '#1d1a24', leg: '#15131a', helm: 'none', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.3, rec: 0.9, dmg: 24, reach: 70, trigger: 260, min: 60, lunge: 720, anim: A.claw },
        { wind: 0.35, active: 0.15, rec: 0.6, dmg: 18, reach: 60, lunge: 160, anim: A.claw },
      ],
    },
    frostmonk: {
      name: 'Frozen Chorister', hp: 76, limbHp: 28, speed: 50, ichor: 55, aggro: 360, weapon: 'club', wlen: 26, hunch: 0.15, windMul: 0.5,
      look: { skin: '#a8b8c8', body: '#3a3e4a', arm: '#3a3e4a', leg: '#2a2c34', helm: 'hood', helmCol: '#c8d4e0', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.12, rec: 0.55, dmg: 15, reach: 60, lunge: 130, anim: A.chop },
        { wind: 0.75, active: 0.4, rec: 0.8, dmg: 8, reach: 150, trigger: 160, min: 50, lunge: 0, spew: 14, anim: A.claw },   // the hymn: frozen breath, and the sickness in it
      ],
    },
    abbot: {
      name: 'Abbot Ulric, the Frozen', boss: true, hp: 540, limbHp: 150, speed: 58, ichor: 1100, aggro: 9999, weapon: 'spear', wlen: 60, scale: 1.4, poise: true, windMul: 0, noSever: ['armF', 'legF', 'legB'], shout: 'SING, MY CHILDREN',
      summon: { type: 'frostmonk', at: [0.65, 0.3], n: 2, text: 'THE CHOIR RISES' },
      look: { skin: '#a8b8c8', body: '#e8ecf2', trim: '#6a8ab0', arm: '#d8dce4', leg: '#6a8ab0', helm: 'mitre', helmCol: '#e8f0f8', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.6, active: 0.14, rec: 0.7, dmg: 28, reach: 118, lunge: 150, anim: A.chop },
        { wind: 0.55, active: 0.12, rec: 0.65, dmg: 26, reach: 132, trigger: 220, min: 90, lunge: 420, anim: A.thrust },
        { wind: 0.85, active: 0.5, rec: 0.6, dmg: 0, reach: 0, trigger: 240, min: 40, lunge: 0, horn: true, anim: A.claw },   // he calls the wind down the nave
      ],
    },
  });
  G.ICON_NAMES.push('The Saint Under the Gibbet', 'The Saint and the Hangman\'s Boy', 'The Saint in the Choir', 'The Saint Frozen at Prayer');
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
  G.BESTIARY_EXTRA.foes.push(
    ['noosed', 'The hanged of the Gallows Road, cut down and walking. The rope is still round the neck, and they swing it.', 'Its lash reaches far; close in.'],
    ['frostmonk', 'The choir of the Frozen Chapel, frozen mid-hymn and still singing. Their breath is the sickness.', 'Do not stand in front of an open mouth.'],
  );
  G.BESTIARY_EXTRA.bosses.push(
    ['crowking', 'The crow that ate first, and most. It has eaten the Gallows Road\'s dead for three years and grown to the size of a man.', 'Strike it as it pulls up from a dive.'],
    ['abbot', 'He led the choir up the mountain to sing the weeping away. When they froze he kept conducting.', 'His wind comes down the nave. Find a pillar.'],
  );
  G.BESTIARY_EXTRA.people.push(
    { id: 'wilm', name: 'Wilm, the Hangman\'s Boy', look: 'wilm', text: 'Gaunt\'s son. He cut the hanged down at night and buried what he could. He is still burying.' },
    { id: 'gerd', name: 'Gerd the Bell-Ringer', look: 'gerd', text: 'Blind, and the only one of the choir who did not freeze, because he was up in the tower when they began to sing.' },
  );

  // ---- the ways in
  const HW = G.LEVELS.length, FC = HW + 1;
  G.LEVELS[0].passages = (G.LEVELS[0].passages || []).concat([{ x: 4700, to: HW, at: 120, label: 'Walk into the Hanging Wood',
    wist: 'A whole wood of them, swinging. Oh, take me. Please take me.',
    slides: ['Behind the last gibbet the road\'s trees begin, and every tree is a gibbet too.\n\nRope creaks in the dark. Something big shifts its weight in the branches.'] }]);
  const PASS = G.LEVELS.findIndex(l => l.boss && l.boss.type === 'windcaller');
  G.LEVELS[PASS].passages = (G.LEVELS[PASS].passages || []).concat([{ x: 2100, to: FC, at: 120, label: 'Climb to the Frozen Chapel',
    wist: 'Listen. Singing. In this wind. Nobody sings in this wind unless they are dead.',
    slides: ['A side-path, then steps cut into the ice, then a chapel with its doors blown off.\n\nInside, the choir is still in its stalls, mouths open, white with frost. One of them turns its head to look at you.'] }]);

  // ---- The Hanging Wood
  G.LEVELS.push({
    name: 'The Hanging Wood', chapter: 'Behind the Gallows Road', theme: 'road', length: 4300, seed: 191,
    back: { to: 0, at: 4760 }, backLabel: 'Back out to the Gallows Road',
    shrines: [240, 2250],
    enemies: [['noosed', 600], ['crow', 800], ['crow', 860], ['wretch', 1050], ['noosed', 1300], ['deserter', 1550], ['hound', 1800], ['hound', 1850], ['crow', 2000],
      ['noosed', 2600], ['noosed', 2700], ['crow', 2900], ['flagellant', 3100], ['crow', 3250, 'unfair'], ['crow', 3300, 'unfair']],
    npcs: [{ id: 'wilm', x: 2380, name: 'Wilm, the Hangman\'s Boy', look: 'wilm', pose: 'kneel', essential: true,
      lines: [
        ['Wilm', 'Don\'t mind me. I\'m digging. I am always digging.'],
        ['Wilm', 'My father hanged them. The King\'s order: anyone weeping, up on the rope, so they could not walk. They walked anyway. On the rope, kicking. For days.'],
        ['Wilm', 'So I came out at night and cut them down and buried them. Seventy-one. I know all their names. Father never asked a single one.'],
        ['Knight', 'Your father is dead. I killed him.'],
        ['Wilm', '...I know. I heard the crows go quiet.'],
        ['Wilm', 'The big one is still out there. The Carrion King. It digs them back up. Kill it, and they can stay down.'],
        ['Misery', 'Seventy-one names. Hagge Wren would like him.'],
      ],
      repeat: [['Wilm', 'Seventy-one. I say them every night. It is the only prayer I know.']] }],
    lore: [
      { x: 700, title: 'Order of the King', text: 'BY ORDER OF OSRIC: ALL WHO WEEP RED ARE TO BE HANGED AT THE CROSSROADS AND LEFT AS A WARNING.\n\nCarved into the post beneath, small and neat:\n\nhanging does not kill them. it only makes them climb.' },
      { x: 1950, title: 'Wilm\'s List', text: 'Seventy-one names on a board, burned in with a hot nail. Some have a word beside them: baker. mother. ran. sang. kind.\n\nAt the bottom, in fresher burns:\n\nfather' },
      { x: 3350, title: 'Crow-Picked Bones', text: 'A heap of bones, picked white, arranged in a ring like a nest. In the middle, a crown of rope and a hangman\'s hood.' },
    ],
    items: [{ x: 3980, relic: 1, relicName: 'Relic of the Cut Rope', needs: 'boss_crowking_dead' }, { x: 1400, alt: 140, relic: 1, relicName: 'Relic of the Seventy-One' }, { x: 1150, icon: 1 }, { x: 2900, alt: 72, icon: 1 }, { x: 1700, cache: 280 }],
    platforms: [{ x: 1320, w: 140, h: 72 }, { x: 1370, w: 70, h: 140 }, { x: 2840, w: 120, h: 72 }],
    pits: [{ x: 1000, w: 66 }, { x: 2500, w: 68 }],
    boss: {
      type: 'crowking', gate: 3500, x: 3820, end: 4100,
      intro: [['Misery', 'Oh look. A crow. ...Oh. A BIG crow.'], ['The Carrion King', 'KRAAAAH.'], ['Misery', 'He says he has eaten seventy-one people and you look like seventy-two.']],
      retry: [['The Carrion King', 'KRAAH.']],
      lastWords: [['Misery', 'Pluck it. Go on. Every feather.']],
      spare: { kind: 'yield', lines: [['Knight', 'Go. Eat nothing here again.'], ['The Carrion King', 'It looks at you with one red eye for a long time. Then it lifts itself off the ground, heavily, and flies away over the trees, and does not come back.']] },
    },
  });

  // ---- The Frozen Chapel
  const PASS_WIND = G.LEVELS[PASS].wind;
  G.LEVELS.push({
    name: 'The Frozen Chapel', chapter: 'Above the Pilgrims\' Pass', theme: 'mountain', length: 4300, seed: 203,
    back: { to: PASS, at: 2160 }, backLabel: 'Climb back down to the Pass',
    shrines: [240, 2250],
    wind: { dir: -1, strength: 170, calm: [3.5, 6], gust: [2.2, 3.2], warn: 1.1, shelters: [700, 1250, 1800, 2400, 3000, 3400] },
    enemies: [['frostmonk', 620], ['frostmonk', 680], ['wolf', 950], ['wolf', 1010], ['pilgrim', 1300], ['frostmonk', 1600], ['warden', 1900], ['frostmonk', 2600], ['frostmonk', 2660], ['frostmonk', 2720], ['wolf', 3100], ['pilgrim', 3250, 'unfair']],
    npcs: [{ id: 'gerd', x: 2380, name: 'Gerd the Bell-Ringer', look: 'gerd', pose: 'stand', essential: true,
      lines: [
        ['Gerd', 'Who is that? You walk like iron. You walk like the Battalion.'],
        ['Gerd', 'I was in the tower when the Abbot started the hymn. A hymn against the weeping, he said: if we sang loud enough, high enough, the sickness would hear us and go down the mountain.'],
        ['Gerd', 'They sang all night. The wind came in through the doors. In the morning it was quiet, and I came down, and they were all still there, mouths open. Still singing. Only you cannot hear it.'],
        ['Misery', 'I can hear it. It is lovely. Very high.'],
        ['Gerd', 'The Abbot is in the apse. He is still conducting. If you can, make him stop. They have been singing for two years.'],
      ],
      repeat: [['Gerd', 'Make him stop. Please. Let them rest their voices.']] }],
    lore: [
      { x: 900, title: 'Hymn-Sheet, Frozen to a Stall', text: 'GO DOWN, GO DOWN, O WEEPING,\nGO DOWN THE MOUNTAIN SIDE,\nWE ARE TOO HIGH FOR SORROW,\nWE ARE TOO COLD FOR\n\nThe last word is under the ice.' },
      { x: 2000, title: 'The Choirmaster\'s Book', text: 'Breathe from the belly. Hold the note. Do not stop for the cold. Do not stop for the wind. Do not stop for anything.\n\nUnderlined three times: DO NOT STOP.' },
      { x: 3380, title: 'Prayer Scratched in Frost', text: 'Somebody wrote it on a window with a fingernail, from the inside:\n\nlet us stop let us stop let us stop' },
    ],
    items: [{ x: 3980, relic: 1, relicName: 'Relic of the Last Note', needs: 'boss_abbot_dead' }, { x: 1350, alt: 140, relic: 1, relicName: 'Relic of the Frozen Choir' }, { x: 1550, icon: 1, gate: 'bars' }, { x: 2850, alt: 72, icon: 1 }, { x: 2100, cache: 300 }],
    platforms: [{ x: 1270, w: 140, h: 72 }, { x: 1320, w: 70, h: 140 }, { x: 2790, w: 120, h: 72 }],
    pits: [{ x: 1100, w: 70 }, { x: 2500, w: 72 }],
    boss: {
      type: 'abbot', gate: 3500, x: 3820, end: 4100,
      intro: [['Abbot Ulric', 'Hush. HUSH. We are in the middle of the hymn.'], ['Knight', 'They are dead, Father.'], ['Abbot Ulric', 'They are SINGING. And so will you. From the belly. Hold the note!']],
      retry: [['Abbot Ulric', 'From the top. Again.']],
      lastWords: [['Abbot Ulric', 'Did it... go down the mountain? Did they hear us?'], ['Knight', 'They heard you, Father. You can stop.']],
      spare: { kind: 'enrage', lines: [['Knight', 'Let them stop, Father.'], ['Abbot Ulric', 'STOP? In the middle of the verse? Do you know what happens if we stop?'], ['Abbot Ulric', 'It COMES BACK UP. Sing! SING!']] },
    },
  });
})();
