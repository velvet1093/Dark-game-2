'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — data: weapons, enemies, levels and story
// ---------------------------------------------------------------------------

// Swing animation: a = shoulder angle, e = elbow bend, w = blade angle, lean = torso.
// Angles: 0 points down, PI/2 forward, PI up. Index 0 = wound up, 1 = follow-through.
const ANIM = {
  chop: { a: [3.3, 1.2], e: [0.2, 0.15], w: [3.9, 1.25], lean: [-0.12, 0.3] },
  rise: { a: [-0.5, 2.3], e: [0.3, 0.2], w: [-0.7, 2.6], lean: [0.25, -0.05] },
  thrust: { a: [-0.3, 1.5], e: [1.9, 0.05], w: [1.5, 1.57], lean: [-0.05, 0.4] },
  slam: { a: [3.5, 0.9], e: [0.1, 0.1], w: [4.3, 0.95], lean: [-0.3, 0.55] },
  claw: { a: [2.6, 1.1], e: [0.6, 0.2], w: [3.0, 1.2], lean: [0, 0.4] },
};
G.ANIM = ANIM;

// To add a weapon: give it a move set here, then hand it to the player
// (player.weapon = G.WEAPONS.<id>). Everything else reads from this table.
G.WEAPONS = {
  longsword: {
    name: "Knight's Longsword", draw: 'sword', len: 44, bleed: 24,
    light: [
      { wind: 0.13, active: 0.09, rec: 0.22, dmg: 18, st: 13, reach: 76, lunge: 150, sever: 1, anim: ANIM.chop },
      { wind: 0.12, active: 0.09, rec: 0.24, dmg: 20, st: 13, reach: 76, lunge: 150, sever: 1.1, anim: ANIM.rise },
      { wind: 0.18, active: 0.1, rec: 0.34, dmg: 29, st: 18, reach: 88, lunge: 230, sever: 1.5, anim: ANIM.thrust },
    ],
    heavy: { wind: 0.42, active: 0.12, rec: 0.4, dmg: 48, st: 30, reach: 88, lunge: 220, sever: 2.6, poiseBreak: true, anim: ANIM.slam },
  },
  // Slow and brutal: every blow breaks poise and takes limbs off.
  greataxe: {
    name: "Headsman's Greataxe", draw: 'axe', len: 46, bleed: 18,
    light: [
      { wind: 0.28, active: 0.11, rec: 0.36, dmg: 34, st: 22, reach: 84, lunge: 150, sever: 2.2, poiseBreak: true, anim: ANIM.chop },
      { wind: 0.26, active: 0.11, rec: 0.42, dmg: 38, st: 24, reach: 84, lunge: 160, sever: 2.4, poiseBreak: true, anim: ANIM.rise },
    ],
    heavy: { wind: 0.6, active: 0.14, rec: 0.55, dmg: 72, st: 42, reach: 92, lunge: 200, sever: 3.6, poiseBreak: true, anim: ANIM.slam },
  },
  // Quick, light blows that open wounds fast; poor at severing.
  flail: {
    name: "Penitent's Flail", draw: 'flail', len: 34, bleed: 46,
    light: [
      { wind: 0.14, active: 0.1, rec: 0.2, dmg: 12, st: 11, reach: 82, lunge: 130, sever: 0.5, anim: ANIM.chop },
      { wind: 0.12, active: 0.1, rec: 0.2, dmg: 12, st: 11, reach: 82, lunge: 130, sever: 0.5, anim: ANIM.rise },
      { wind: 0.16, active: 0.1, rec: 0.3, dmg: 17, st: 14, reach: 86, lunge: 170, sever: 0.7, anim: ANIM.chop },
    ],
    heavy: { wind: 0.36, active: 0.14, rec: 0.42, dmg: 32, st: 28, reach: 90, lunge: 190, sever: 0.9, poiseBreak: true, anim: ANIM.slam },
  },
  // Reach above all: strikes from outside most enemies' range.
  spear: {
    name: 'Fen-Warden Spear', draw: 'spear', len: 60, bleed: 20,
    light: [
      { wind: 0.16, active: 0.1, rec: 0.22, dmg: 16, st: 12, reach: 112, lunge: 120, sever: 0.7, anim: ANIM.thrust },
      { wind: 0.14, active: 0.1, rec: 0.24, dmg: 16, st: 12, reach: 112, lunge: 120, sever: 0.7, anim: ANIM.thrust },
      { wind: 0.2, active: 0.11, rec: 0.34, dmg: 23, st: 16, reach: 124, lunge: 220, sever: 1.0, anim: ANIM.thrust },
    ],
    heavy: { wind: 0.4, active: 0.14, rec: 0.45, dmg: 42, st: 30, reach: 136, lunge: 380, sever: 1.3, poiseBreak: true, anim: ANIM.thrust },
  },
};

G.ENEMIES = {
  wretch: {
    name: 'Weeping Wretch', hp: 55, limbHp: 24, speed: 58, ichor: 20, aggro: 340, weapon: 'none', hunch: 0.38,
    look: { skin: '#7d8773', body: '#3a2e26', arm: '#7d8773', leg: '#2b2320', helm: 'none', eye: '#ff3b2f' },
    attacks: [{ wind: 0.5, active: 0.12, rec: 0.6, dmg: 12, reach: 52, lunge: 130, anim: ANIM.claw }],
  },
  deserter: {
    name: 'Deserter', hp: 90, limbHp: 38, speed: 78, ichor: 45, aggro: 380, weapon: 'sword', wlen: 38,
    look: { skin: '#8c8576', body: '#4a4038', arm: '#3e3630', leg: '#2a2422', helm: 'helm', helmCol: '#5b5048', eye: '#ff3b2f' },
    attacks: [
      { wind: 0.45, active: 0.1, rec: 0.55, dmg: 18, reach: 68, lunge: 140, anim: ANIM.chop },
      { wind: 0.62, active: 0.14, rec: 0.7, dmg: 24, reach: 96, trigger: 150, min: 80, lunge: 360, anim: ANIM.thrust },
    ],
  },
  flagellant: {
    name: 'Flagellant', hp: 70, limbHp: 28, speed: 125, ichor: 50, aggro: 420, weapon: 'club', wlen: 30,
    look: { skin: '#a79a8c', body: '#a79a8c', arm: '#a79a8c', leg: '#2a1a1a', helm: 'hood', helmCol: '#3b0d10', eye: '#ffb02f' },
    attacks: [
      { wind: 0.3, active: 0.1, rec: 0.25, dmg: 13, reach: 60, lunge: 180, anim: ANIM.chop },
      { wind: 0.26, active: 0.1, rec: 0.5, dmg: 15, reach: 60, lunge: 180, anim: ANIM.rise },
    ],
  },
  brute: {
    name: 'Headsman', hp: 230, limbHp: 85, speed: 46, ichor: 160, aggro: 360, weapon: 'cleaver', wlen: 46, scale: 1.42, poise: true,
    look: { skin: '#8a7f72', body: '#4b1a1a', arm: '#8a7f72', leg: '#221c1c', helm: 'sack', helmCol: '#6b6152', eye: '#000' },
    attacks: [
      { wind: 0.85, active: 0.14, rec: 0.9, dmg: 38, reach: 96, lunge: 170, anim: ANIM.slam },
      { wind: 0.6, active: 0.12, rec: 0.7, dmg: 26, reach: 84, lunge: 120, anim: ANIM.rise },
    ],
  },
  templar: {
    name: 'Knight of the Veil', hp: 135, limbHp: 55, speed: 72, ichor: 90, aggro: 400, weapon: 'sword', wlen: 44,
    look: { skin: '#888', body: '#6e6a66', trim: '#5a1014', arm: '#5d5955', leg: '#3c3a38', helm: 'helm', helmCol: '#77726c', plume: '#5a1014', eye: '#ff3b2f' },
    attacks: [
      { wind: 0.4, active: 0.1, rec: 0.5, dmg: 22, reach: 74, lunge: 150, anim: ANIM.chop },
      { wind: 0.36, active: 0.1, rec: 0.5, dmg: 22, reach: 74, lunge: 150, anim: ANIM.rise },
      { wind: 0.6, active: 0.14, rec: 0.75, dmg: 30, reach: 104, trigger: 170, min: 90, lunge: 400, anim: ANIM.thrust },
    ],
  },
  // --- beasts and stranger things -------------------------------------------
  hound: {
    name: 'Carrion Hound', model: 'hound', hp: 55, limbHp: 22, speed: 175, ichor: 35, aggro: 430, weapon: 'none', height: 52, limbs: ['head', 'legF', 'legB'],
    look: { skin: '#6b5a58', body: '#2e2628', arm: '#2e2628', leg: '#2e2628', helm: 'none', eye: '#ff3b2f' },
    attacks: [
      { wind: 0.38, active: 0.2, rec: 0.65, dmg: 15, reach: 62, trigger: 145, min: 70, lunge: 520, anim: ANIM.claw },
      { wind: 0.25, active: 0.1, rec: 0.45, dmg: 10, reach: 50, lunge: 120, anim: ANIM.claw },
    ],
  },
  crow: {
    name: 'Gallows Crow', model: 'crow', fly: true, hp: 28, limbHp: 12, speed: 150, ichor: 15, aggro: 380, stop: 120, weapon: 'none', height: 30, limbs: ['head', 'armF', 'armB'],
    look: { skin: '#15131a', body: '#15131a', arm: '#1d1a24', leg: '#15131a', helm: 'none', eye: '#ff3b2f' },
    attacks: [{ wind: 0.45, active: 0.3, rec: 0.95, dmg: 9, reach: 42, trigger: 172, min: 60, lunge: 620, anim: ANIM.claw }],
  },
  bloat: {
    name: 'Weeping Bloat', hp: 150, limbHp: 60, speed: 36, ichor: 80, aggro: 320, weapon: 'none', scale: 1.2, hunch: 0.2, burst: 22,
    look: { skin: '#8a9478', body: '#5d6650', arm: '#8a9478', leg: '#3a3a30', helm: 'none', eye: '#ff3b2f', belly: 1 },
    attacks: [{ wind: 0.7, active: 0.14, rec: 0.8, dmg: 20, reach: 60, lunge: 110, anim: ANIM.slam }],
  },
  pikeman: {
    name: 'Rot-Pike', hp: 85, limbHp: 36, speed: 66, ichor: 55, aggro: 420, weapon: 'spear', wlen: 60,
    look: { skin: '#8c8576', body: '#3d4438', arm: '#333a30', leg: '#252a22', helm: 'helm', helmCol: '#4d5348', eye: '#ff3b2f' },
    attacks: [
      { wind: 0.55, active: 0.14, rec: 0.7, dmg: 22, reach: 118, trigger: 135, min: 50, lunge: 260, anim: ANIM.thrust },
      { wind: 0.4, active: 0.1, rec: 0.5, dmg: 12, reach: 56, lunge: 80, anim: ANIM.rise },
    ],
  },
  reaper: {
    name: 'Pale Reaper', hp: 115, limbHp: 42, speed: 64, ichor: 95, aggro: 420, weapon: 'scythe', wlen: 56, scale: 1.18,
    look: { skin: '#c9c2b6', body: '#16131a', arm: '#16131a', leg: '#0f0d12', helm: 'hood', helmCol: '#0f0d12', eye: '#9ad0ff' },
    attacks: [
      { wind: 0.7, active: 0.14, rec: 0.8, dmg: 30, reach: 112, trigger: 125, lunge: 150, anim: ANIM.chop },
      { wind: 0.5, active: 0.12, rec: 0.6, dmg: 22, reach: 100, lunge: 120, anim: ANIM.rise },
    ],
  },
  // --- bosses of the road and the fen ----------------------------------------
  hangman: {
    name: 'Gaunt, the High Headsman', boss: true, hp: 430, limbHp: 140, speed: 60, ichor: 700, aggro: 9999,
    weapon: 'axe', wlen: 50, scale: 1.5, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'GAUNT BELLOWS',
    look: { skin: '#8a7f72', body: '#3a1416', trim: '#5a1a1a', arm: '#8a7f72', leg: '#1c1618', helm: 'sack', helmCol: '#5a5044', eye: '#000000' },
    attacks: [
      { wind: 0.7, active: 0.14, rec: 0.8, dmg: 34, reach: 112, lunge: 180, anim: ANIM.slam },
      { wind: 0.55, active: 0.12, rec: 0.65, dmg: 26, reach: 104, lunge: 150, anim: ANIM.rise },
      { wind: 0.8, active: 0.2, rec: 0.9, dmg: 36, reach: 120, trigger: 300, min: 150, lunge: 620, anim: ANIM.chop },
    ],
  },
  matron: {
    name: 'The Drowned Matron', boss: true, hp: 520, limbHp: 160, speed: 40, ichor: 900, aggro: 9999,
    weapon: 'none', scale: 1.5, poise: true, hunch: 0.15, noSever: ['legF', 'legB'], shout: 'THE MATRON WAILS',
    summon: { type: 'hound', at: [0.66, 0.33], n: 2 },
    look: { skin: '#7f9484', body: '#4a5a4c', arm: '#7f9484', leg: '#2c3430', helm: 'none', eye: '#ff3b2f', belly: 1, hair: '#2a3028' },
    attacks: [
      { wind: 0.75, active: 0.14, rec: 0.85, dmg: 30, reach: 84, lunge: 120, anim: ANIM.slam },
      { wind: 0.6, active: 0.12, rec: 0.7, dmg: 22, reach: 76, lunge: 100, anim: ANIM.claw },
      // she vomits the sickness itself: light damage, a great deal of infection
      { wind: 0.9, active: 0.35, rec: 1.0, dmg: 14, reach: 190, trigger: 230, min: 90, lunge: 0, spew: 22, anim: ANIM.claw },
    ],
  },
  garrick: {
    name: 'Ser Garrick, the Oathkeeper', boss: true, hp: 640, limbHp: 150, speed: 84, ichor: 1500, aggro: 9999,
    weapon: 'greatsword', wlen: 62, scale: 1.3, poise: true, noSever: ['armF', 'legF', 'legB'],
    look: { skin: '#777', body: '#2c2a30', trim: '#5a0c12', arm: '#25232a', leg: '#1d1c22', helm: 'helm', helmCol: '#34323a', plume: '#8a0d14', cape: '#4a0a10', eye: '#ff3b2f' },
    attacks: [
      { wind: 0.5, active: 0.12, rec: 0.55, dmg: 30, reach: 112, lunge: 190, anim: ANIM.chop },
      { wind: 0.45, active: 0.12, rec: 0.6, dmg: 30, reach: 112, lunge: 190, anim: ANIM.rise },
      { wind: 0.7, active: 0.16, rec: 0.8, dmg: 38, reach: 140, trigger: 260, min: 120, lunge: 560, anim: ANIM.thrust },
      { wind: 0.95, active: 0.14, rec: 1.0, dmg: 52, reach: 128, lunge: 240, anim: ANIM.slam },
    ],
  },
};

// Tools that open what was shut. Each is found in one area and is needed in others.
G.ABILITIES = {
  dj: { name: 'Wind-Step Greaves', how: 'Jump again in mid-air. High ledges are now in reach.' },
  lantern: { name: 'Lily Lantern', how: 'Its light parts the red veils that guard some icons.' },
};
G.ICON_NAMES = ['The Saint at the Well', 'The Saint Washing the Dead', 'The Saint and the Miller', 'The Saint Unveiled', 'The Saint Asleep',
  'The First Tear', 'The Saint among Hounds', 'The Saint and the Knight', 'The Saint at the Door', 'The Saint in the Fen',
  'The Bride of Avaric', 'The Saint Refusing the Knife', 'The Saint and Her Brother', 'The Saint Counting Ships', 'The Last Tear'];

G.LOOKS = {
  player: { skin: '#999', body: '#8c9099', trim: '#2b3040', arm: '#737781', leg: '#4c4f58', helm: 'helm', helmCol: '#9a9ea8', plume: '#6b1218', cape: '#5a1016' },
  hanged: { skin: '#6f7a68', body: '#2e2824', arm: '#6f7a68', leg: '#241f1c', helm: 'none', eye: '#d8d2c0' },
  digger: { beard: '#8a8478', skin: '#9a8d7c', body: '#3b352c', arm: '#3b352c', leg: '#26221d', helm: 'hood', helmCol: '#2a261f' },
  nun: { soft: 1, skin: '#b5a99a', body: '#17151a', arm: '#17151a', leg: '#17151a', helm: 'hood', helmCol: '#d6cfc2' },
  doctor: { skin: '#222', body: '#1a1719', arm: '#1a1719', leg: '#121012', helm: 'beak', helmCol: '#1a1719', eye: '#c9a13b' },
  widow: { soft: 1, skin: '#b5a99a', body: '#2b2630', arm: '#2b2630', leg: '#2b2630', helm: 'hood', helmCol: '#55505c' },
  oswin: { skin: '#999', body: '#6a6c70', trim: '#8a6a2a', arm: '#5a5c60', leg: '#3d3f44', helm: 'helm', helmCol: '#74767c' },
  edda: { soft: 1, iris: '#5a7a4a', skin: '#b09a86', body: '#4a3a2a', trim: '#2e241a', arm: '#4a3a2a', leg: '#2a221a', helm: 'hood', helmCol: '#6a3a22' },
  beggar: { skin: '#9a8d7c', body: '#3a352c', arm: '#9a8d7c', leg: '#2a2620', helm: 'none' },
  monk: { skin: '#b5a99a', body: '#3a2a1e', arm: '#3a2a1e', leg: '#3a2a1e', helm: 'hood', helmCol: '#2e2118' },
  rowan: { skin: '#888', body: '#6e6a66', trim: '#2a2a2a', arm: '#5d5955', leg: '#3c3a38', helm: 'helm', helmCol: '#77726c' },
  // Sisters of the Lily: black veil with a white frilled band and a lily, black dress with white trim
  sisterA: { chibi: 1, soft: 1, iris: '#8a5fd0', skin: '#eadfd6', body: '#141216', trim: '#ece6de', arm: '#141216', leg: '#2a2226', helm: 'sister', helmCol: '#141216', hair: '#efeaf2', skirt: 1, cuff: 1 },
  sisterB: { chibi: 1, soft: 1, iris: '#8a5fd0', skin: '#eadfd6', body: '#141216', trim: '#ece6de', arm: '#141216', leg: '#2a2226', helm: 'sister', helmCol: '#141216', hair: '#3a2a26', skirt: 1, cuff: 1 },
  sisterC: { chibi: 1, soft: 1, iris: '#8a5fd0', skin: '#e6d6c8', body: '#141216', trim: '#ece6de', arm: '#141216', leg: '#2a2226', helm: 'sister', helmCol: '#141216', hair: '#7a3a26', skirt: 1, cuff: 1 },
  sisterD: { chibi: 1, soft: 1, iris: '#8a5fd0', skin: '#eadfd6', body: '#141216', trim: '#ece6de', arm: '#141216', leg: '#2a2226', helm: 'sister', helmCol: '#141216', hair: '#c9b48a', skirt: 1, cuff: 1 },
  captain: { skin: '#999', body: '#4a4e58', trim: '#7a2a22', arm: '#3e424c', leg: '#2c2e36', helm: 'helm', helmCol: '#5a5e68', plume: '#7a2a22' },
  smith: { beard: '#3a2a22', skin: '#a88a72', body: '#3a2a22', trim: '#1a1412', arm: '#a88a72', leg: '#2a2422', helm: 'none' },
  innkeep: { soft: 1, skin: '#b89c88', body: '#5a4634', trim: '#cfc4b0', arm: '#5a4634', leg: '#2e2620', helm: 'none', hair: '#5a3a26' },
  crier: { skin: '#b09a86', body: '#5a2a2a', arm: '#5a2a2a', leg: '#2a2020', helm: 'hood', helmCol: '#3a1a1a' },
  peddler: { skin: '#a8927e', body: '#3e4a3a', arm: '#3e4a3a', leg: '#2a2e26', helm: 'hood', helmCol: '#55603e' },
  refugee: { skin: '#a8998a', body: '#4a4238', arm: '#4a4238', leg: '#2e2a24', helm: 'hood', helmCol: '#3a342c' },
  hunter: { skin: '#9a8a78', body: '#2e3a2a', trim: '#1e261c', arm: '#2e3a2a', leg: '#20261e', helm: 'hood', helmCol: '#1e261c' },
  ysolde: { soft: 1, skin: '#d9d0c6', body: '#c9c2b6', arm: '#c9c2b6', leg: '#c9c2b6', helm: 'veil', helmCol: '#e6dfd2', eye: '#c20d16' },
};

// --------------------------------- story -----------------------------------
G.STORY = {
  intro: [
    'In the Weeping Year a sickness came to Morrowmere.\nIt began in the eyes. The infected wept red.',
    'Then it took the mind. It left them no sleep, no speech, no rest —\nonly a restless need to kill whatever was not yet weeping.',
    "King Osric sent his knights across the sea to find the Saint's Tear —\na relic said to burn any infection out of the blood.",
    'Seven winters passed.\nOne knight came home.',
    'You are Ser Aldric Vane. You carry the Tear.\nYou swore to bring it to your king, and to return to your sister, Ysolde.',
    'There is no king to give it to.\nThere is only the road, and what walks it.',
  ],
  endings: {
    kept: {
      title: 'The Vow Kept',
      text: [
        'You press the Tear into her hands. It is warm, as if someone had only just let go of it.',
        'Ysolde closes her eyes. For the first time in seven years, they are dry.',
        'Across Morrowmere the infected stop. The red runs out of their eyes. They sit down in the roads and the fields like labourers at the end of a long day — and some of them, slowly, remember their names.',
        'You carry her out past Garrick, past the doors he held. You dig the grave yourself.\n\nThe vow is kept. No one is left to tell you it was worth it.',
        'Above the grave something small and lavender sighs, bored, and flutters off down the road to find another knight.',
      ],
    },
    broken: {
      title: 'The Vow Broken',
      text: [
        'The Tear rings once on the flagstones and is lost among the pews.',
        'You kneel where Garrick knelt. Ysolde lays a hand on your helm, and where she touches, the steel runs red.',
        '"Then stay," she says. "Hold the door."',
        'The bells of Saint Avaric ring on. The infection burns on, village by village. And at the altar a knight keeps watch, weeping, beside the only thing he came home for.',
        'On his pauldron sits a small lavender thing, chin in her hands, waiting.\n\nShe has all the time in the world.',
      ],
    },
  },
};

G.LEVELS = [
  {
    name: 'The Gallows Road', chapter: 'Chapter I', theme: 'road', length: 6300, seed: 11,
    shrines: [1380, 4580], chapels: [{ x: 4760 }],
    items: [{ x: 3780, weapon: 'greataxe', needs: 'boss_hangman_dead' }, { x: 2085, alt: 142, cache: 180 }, { x: 5510, alt: 72, cache: 120 },
      { x: 1910, alt: 72, icon: 1 }, { x: 2890, icon: 1, gate: 'bars' }, { x: 4410, alt: 132, icon: 1 }],
    platforms: [{ x: 1880, w: 170, h: 72 }, { x: 2010, w: 140, h: 142 }, { x: 5420, w: 180, h: 72 }, { x: 4350, w: 120, h: 132 }],
    pits: [{ x: 1610, w: 68 }, { x: 3340, w: 66 }],
    enemies: [
      ['wretch', 760], ['crow', 900], ['wretch', 1060], ['wretch', 1130], ['deserter', 1750], ['wretch', 2050, 'marta'], ['wretch', 2120, 'marta'],
      ['deserter', 2560], ['hound', 2700], ['hound', 2760], ['wretch', 2950], ['pikeman', 3050], ['crow', 3300], ['deserter', 4060], ['wretch', 4150], ['hound', 4250],
      ['pikeman', 5100], ['wretch', 5200], ['wretch', 5270], ['crow', 5380], ['deserter', 5520], ['bloat', 5680], ['hound', 5820], ['hound', 5880], ['deserter', 6020],
    ],
    npcs: [
      {
        id: 'hanged', x: 430, name: 'The Hanged Man', look: 'hanged', pose: 'hang',
        lines: [
          ['The Hanged Man', 'A knight. A clear-eyed one. Hah... forgive me if I do not kneel.'],
          ['The Hanged Man', 'They hanged me when my eyes went red. But the infection will not let a body rest — not to sleep, not even to finish dying. So here I swing.'],
          ['The Hanged Man', "You wear the King's sun. Did no one tell you? Osric wept himself hollow three winters gone. They burned what was left on the palace steps."],
          ['Aldric', 'Then who rules Morrowmere?'],
          ['The Hanged Man', 'Bishop Malvern. He says the Weeping is no plague but a sacrament. He has even found himself a saint — a girl from Hollowmere who bled from her eyes and would not die.'],
          ['The Hanged Man', 'They ring the bells for her at Saint Avaric. Follow the road east: Brannoc\'s Hold first, where the Sisters of the Lily still keep clear eyes. Then the fen, then Hollowmere, then the bells. And knight — cut me down on your way back, if you come back.'],
        ],
        repeat: [['The Hanged Man', 'Follow the bells. Everyone does, in the end.']],
      },
      {
        id: 'digger', x: 1470, name: 'Wynn the Gravedigger', look: 'digger', pose: 'stand', fighter: true, hp: 150, dmg: 13, weapon: 'club', wlen: 30,
        lines: [
          ['Wynn', "Rest at the candle, ser. Vigil flames still burn clean. Whatever you've bled out of them, the flame will make it part of you."],
          ['Wynn', 'A word for the road. They were people, ser. Still are, somewhere under the red. Cut them and they bleed, same as us. Cut deep enough, and pieces come off. A wretch with no sword-arm is half a wretch. One with no leg can only crawl.'],
          ['Wynn', "And when one's had enough, it kneels. Don't leave it kneeling — it'll only get back up, angrier. Step close and put it down. Mercy is the only sacrament left."],
          ['Wynn', 'And mind your own blood. Every wound they give you lets a little of it in. If your eyes start to run, find a Sister of the Lily — and find her fast.'],
        ],
        repeat: [['Wynn', "I bury the ones you put down. There are always more walking in. Still — a man needs his work."]],
      },
      {
        id: 'marta', x: 2300, name: 'Marta', look: 'widow', pose: 'stand', hp: 90,
        lines: [
          ['Marta', 'Is that — no. No, you are too tall. Forgive me. I am waiting for my husband. He wrote that he would come by the gallows road.'],
          ['Marta', 'I left the lamp lit. Every night. But they come up out of the ditch now, and I cannot run any more.'],
          ['Marta', 'Please, ser. Only until he comes.'],
        ],
        repeat: [['Marta', 'I will keep the lamp lit. Someone should.']],
      },
      {
        id: 'oswin', x: 3230, name: 'Ser Oswin', look: 'oswin', pose: 'stand', fighter: true, hp: 170, dmg: 16, weapon: 'sword', wlen: 40,
        lines: [
          ['Ser Oswin', "Another of Osric's suns! I thought I was the last fool still wearing one."],
          ['Ser Oswin', 'The Headsman is just up the road. I have been working up the nerve for two days. If you are going, I am going. Better than dying alone in a ditch.'],
        ],
        repeat: [['Ser Oswin', 'After you, ser. I insist.']],
      },
      {
        id: 'hesper', x: 4840, name: 'Sister Hesper', look: 'sisterB', pose: 'stand', cleanse: true, fighter: true, hp: 220, dmg: 15, weapon: 'sword', wlen: 36,
        lines: [
          ['Sister Hesper', 'Hold. Let me see your eyes. ...Clear enough. You may approach the chapel.'],
          ['Sister Hesper', 'We are the Sisters of the Lily. The infection is in every wound they give you — it rides the blood. Lily-water cannot burn it out, but it pushes it back down.'],
          ['Sister Hesper', 'When your eyes run red you will have less than a minute before you are one of them. Come to one of us before that. Or drink a tincture. I will fill your vial now.'],
        ],
        repeat: [['Sister Hesper', 'Kneel. This will sting, and then it will not.']],
      },
      {
        id: 'jory', x: 5360, name: 'Jory the Pilgrim', look: 'refugee', pose: 'kneel', hp: 80,
        lines: [
          ['Jory', "I was walking to Brannoc's Hold. For the Sisters. My wife's eyes went red on Sunday and I thought — if I could bring a vial back —"],
          ['Jory', 'I have been sitting here two days. I think I knew on the first that I was walking the wrong way.'],
        ],
        repeat: [['Jory', 'The Hold is just up the road. I can see the wall from here. I only need a little longer.']],
      },
    ],
    lore: [
      { x: 940, title: "A Soldier's Letter", text: "Marta —\n\nThe captain wept at muster this morning. Red, down both cheeks, and him still shouting orders. We ran. All of us. I am not ashamed.\n\nI will come by the gallows road. Leave the lamp lit." },
      { x: 2320, title: 'Edict of Bishop Malvern', text: 'Let it be known in every parish:\n\nThe Weeping is the LORD\'s own grief made flesh. To cut down the weeping is blasphemy. To bar your door to them, cowardice. Their rage is holy. Be embraced.\n\nThe Saint is risen at Hollowmere. Rejoice.' },
      { x: 3300, title: 'Scratched Into a Shield', text: 'OSRIC IS DEAD\nTHE SUN IS DEAD\nGARRICK KEEPS THE DOOR' },
      { x: 4960, title: 'Rule of the Lily', text: 'First: it is a sickness, not a judgement.\n\nSecond: the infected are not dead. They do not sleep and cannot stop; the red in the eye is the last of them trying to get out.\n\nThird: it enters by the wound. Wash every wound in lily-water.\n\nFourth: when a Sister weeps, another Sister holds the knife. We do not turn.' },
    ],
    boss: {
      type: 'hangman', gate: 3420, x: 3760, end: 3990,
      intro: [
        ['Wist', 'Oh, him! Gaunt. He hanged forty in a day once — I counted. Then his eyes went, and he simply kept going.'],
        ['Wist', 'He cannot speak any more. He does not need to. Do go and say hello.'],
      ],
      retry: [['Wist', 'Again! He does so enjoy you.']],
      lastWords: [['Aldric', 'Kneel, headsman. The road is closed.']],
    },
    exit: { x: 6200, label: "Enter Brannoc's Hold" },
    exitSlides: ["A wall. Torches. Voices that are only voices.\n\nBrannoc's Hold has kept its gates shut for three years, and its people clear-eyed with lily-water and the edge of a knife."],
  },
  {
    name: "Brannoc's Hold", chapter: 'Chapter II', theme: 'town', length: 3900, seed: 51,
    shrines: [320], chapels: [{ x: 2330, big: true }],
    items: [{ x: 1695, alt: 146, cache: 250 }, { x: 3110, alt: 72, icon: 1 }, { x: 640, icon: 1, gate: 'veil' }, { x: 3610, alt: 132, icon: 1 }],
    platforms: [{ x: 1440, w: 190, h: 74 }, { x: 1590, w: 160, h: 146 }, { x: 3020, w: 170, h: 72 }, { x: 3550, w: 120, h: 132 }],
    enemies: [],
    npcs: [
      {
        id: 'hale', x: 560, name: 'Captain Hale', look: 'captain', pose: 'stand', fighter: true, hp: 240, dmg: 20, weapon: 'sword', wlen: 42,
        lines: [
          ['Captain Hale', 'Eyes. Show me. ...Fine. You are let in. Anyone bleeding gets walked straight to the chapel; anyone weeping gets walked straight back out.'],
          ['Captain Hale', 'Four hundred souls behind this wall, and every one of them is a wound away from turning. That is the whole of my job.'],
        ],
        repeat: [['Captain Hale', 'Chapel is up the street, past the forge. Get your blood looked at.']],
      },
      {
        id: 'crier', x: 940, name: 'The Crier', look: 'crier', pose: 'stand', essential: true,
        lines: [
          ['The Crier', 'Hear it! Nine days since the last weeping within the wall! Lily-water at the chapel, dawn and dusk!'],
          ['The Crier', '...Between us, ser, it was nine days yesterday as well. And the day before. The Captain says the number is good for people.'],
        ],
        repeat: [['The Crier', 'Nine days! Nine whole days!']],
      },
      {
        id: 'maren', x: 1290, name: 'Maren the Innkeeper', look: 'innkeep', pose: 'stand', essential: true,
        lines: [
          ['Maren', "Bed's a penny, ale's two, and nobody sleeps anyway. You lie there listening for someone in the next room who has stopped breathing right."],
          ['Maren', 'They do not sleep, the infected. Did you know? That is how you tell, early. Before the eyes. My husband paced for three nights. I told myself it was his back.'],
        ],
        repeat: [['Maren', 'Get some rest while you can still want it.']],
      },
      {
        id: 'dunstan', x: 1680, name: 'Dunstan the Smith', look: 'smith', pose: 'stand', essential: true, shop: 'forge',
        lines: [
          ['Dunstan', 'That is a crusader blade. Good steel, bad edge. Seven years of salt air.'],
          ['Dunstan', 'Bring me ichor and I will fold it into the steel. Every weapon you carry, three times over. It holds an edge like nothing else.'],
        ],
        repeat: [['Dunstan', 'Keep it oiled. Blood is worse than salt.']],
      },
      {
        id: 'ilse', x: 1960, name: 'Ilse', look: 'refugee', pose: 'kneel', essential: true,
        lines: [
          ['Ilse', 'We came in from the fen farms. Eleven of us at the gate. The Captain looked at our eyes and let in six.'],
          ['Ilse', 'My brother is out there still. He was not weeping, ser, I swear it. He had only been crying.'],
        ],
        repeat: [['Ilse', 'If you see a tall man in the fen with a green hood... no. No, do not tell me.']],
      },
      {
        id: 'odile', x: 2240, name: 'Mother Odile', look: 'sisterA', pose: 'stand', cleanse: true, essential: true,
        lines: [
          ['Mother Odile', 'A knight of the old sun, and carrying something that hums. Come into the light. Let me look at you.'],
          ['Mother Odile', 'Listen well, for no one else will tell you plainly. The infection is not death. Those things on the road are people — awake for years, unable to stop, with one want left: to kill what is still clean.'],
          ['Mother Odile', 'It rides the blood. Each wound lets more in. We can wash it back with lily-water, here and at the wayside chapels. We cannot burn it out. Nothing can — save, perhaps, what you are carrying.'],
          ['Aldric', "The Saint's Tear. I mean to take it to Saint Avaric."],
          ['Mother Odile', 'Then go through the fen to Hollowmere, and up. And when your eyes begin to run — they will — find a Sister. You will have less than a minute.'],
        ],
        repeat: [['Mother Odile', 'Kneel, child. Let us see how much of it you have let in.']],
      },
      {
        id: 'verena', x: 2350, name: 'Sister Verena', look: 'sisterB', pose: 'stand', cleanse: true, essential: true,
        lines: [
          ['Sister Verena', 'You are the one going into the fen? On purpose? Then you can be of use to someone besides yourself.'],
        ],
        repeat: [['Sister Verena', 'Hold still. Lily-water first. Talk after.']],
      },
      {
        id: 'lys', x: 2450, name: 'Sister Lys', look: 'sisterC', pose: 'kneel', cleanse: true, essential: true,
        lines: [
          ['Sister Lys', 'I was the last one turned away at the gate. Mother Odile washed my eyes for six days and they cleared. So it can be pushed back. Remember that when it has you.'],
          ['Sister Lys', 'It feels like being angry at everyone you love, all at once, for no reason. If you feel that — run to us.'],
        ],
        repeat: [['Sister Lys', 'Breathe. Slower. There. It hates patience.']],
      },
      {
        id: 'fenwick', x: 2940, name: 'Fenwick the Peddler', look: 'peddler', pose: 'stand', essential: true, shop: 'peddler',
        lines: [
          ['Fenwick', 'Charms! Saint-knuckles! Genuine lily petals, pressed! ...None of it works, ser. But people sleep better holding something.'],
          ['Fenwick', 'Except these. Lily tincture, the real thing, liberated from the chapel stores. And flasks, and vials to keep them in. For ichor, naturally. What else is worth anything now?'],
          ['Fenwick', 'A free word, since you look the leaving sort: the big swollen ones in the fen — do not burst them near you. What is inside is the sickness itself. Finish them clean, with the blade, kneeling.'],
        ],
        repeat: [['Fenwick', 'Finish the swollen ones clean. On their knees. Trust a coward: I have watched from very far away.']],
      },
      {
        id: 'bess', x: 3480, name: 'Old Bess', look: 'refugee', pose: 'stand', essential: true,
        lines: [
          ['Old Bess', 'Fen Gate. I work the bar — or did, until the Captain chained it shut. Lost the key out in the fen, he says. Anything heavy enough to cut chain will do, ser.'],
          ['Old Bess', 'There is a Sister keeps a chapel halfway across, by the drowned oak. If you start to weep out there, that is your one door.'],
        ],
        repeat: [['Old Bess', 'Cut the chain if you can. Halfway across, by the drowned oak, there is a Sister. Do not forget it.']],
      },
    ],
    lore: [
      { x: 1100, title: 'Notice at the Well', text: 'BY ORDER OF CAPTAIN HALE\n\nAny who are wounded will present at the chapel before nightfall.\nAny who cannot sleep will present at the chapel.\nAny who weep will be put out by the Fen Gate.\n\nThere are no exceptions. I have made none for my own.' },
      { x: 2560, title: 'Chapel Ledger', text: 'Washed this month: 212.\nCleared: 197.\nPut out the gate: 14.\nSister Amabel: 1. I held the knife. — O.\n\nNote: the lilies are nearly gone. They grow only in the fen now.' },
      { x: 3200, title: 'Pinned to the Gate', text: 'TOMAS — we waited two days. We have gone in. If your eyes are clear, knock three times and say my name.\n\nIf they are not, please do not knock.' },
    ],
    gates: [{ x: 3740, kind: 'bars', need: 'axe', shut: "Chained shut. It would take a headsman's axe", open: 'Cut the chain with the greataxe',
      wist: 'Chained! Oh dear. That big man on the road had such a lovely axe. Shame you left it lying there.' }],
    exit: { x: 3800, label: 'Leave by the Fen Gate' },
    exitSlides: ['The bar drops behind you.\n\nAhead, black water and white flowers, and things that have not slept in three years turning their heads at the sound.'],
  },
  {
    name: 'The Weeping Fen', chapter: 'Chapter III', theme: 'fen', length: 6200, seed: 67,
    shrines: [260, 3120], chapels: [{ x: 3300 }],
    enemies: [
      ['wretch', 700], ['hound', 820], ['wretch', 900], ['crow', 1050], ['bloat', 1350], ['wretch', 1650, 'wenna'], ['wretch', 1720, 'wenna'], ['pikeman', 1950],
      ['hound', 2150], ['hound', 2210], ['crow', 2350], ['deserter', 2500], ['bloat', 2750], ['reaper', 2950],
      ['wretch', 3750], ['wretch', 3820], ['wretch', 3890], ['pikeman', 4050], ['crow', 4200], ['crow', 4260], ['bloat', 4450], ['hound', 4650], ['hound', 4720],
      ['reaper', 5450], ['wretch', 5850], ['hound', 5950],
    ],
    npcs: [
      {
        id: 'wenna', x: 1500, name: 'Wenna', look: 'refugee', pose: 'kneel', hp: 80,
        lines: [
          ['Wenna', 'Do not come close! I am — look, look at my eyes, they are clear, I am only muddy —'],
          ['Wenna', 'They put us out of the Hold. Five of us. I am the one who could still run.'],
        ],
        repeat: [['Wenna', 'I will follow the reeds back. I will knock three times.']],
      },
      {
        id: 'corra', x: 3390, name: 'Sister Corra', look: 'sisterD', pose: 'stand', cleanse: true, fighter: true, hp: 230, dmg: 16, weapon: 'sword', wlen: 36,
        lines: [
          ['Sister Corra', 'Stop there. Eyes. ...Good. Sit. You are bleeding in four places and every one of them is a door.'],
          ['Sister Corra', 'I keep this chapel because the lilies are here and so are they. Somebody has to stand between.'],
        ],
        repeat: [['Sister Corra', 'Again? You collect wounds like a child collects stones. Sit.']],
      },
      {
        id: 'garrow', x: 5650, name: 'Garrow the Fen-Warden', look: 'hunter', pose: 'stand', fighter: true, hp: 210, dmg: 18, weapon: 'spear', wlen: 56,
        lines: [
          ['Garrow', 'You came across. On foot. Through all of that.'],
          ['Garrow', "I watch the far bank for Hale. Count what comes out, send word what doesn't. Hollowmere is past the stones. Nobody has sent word from there in a long time."],
        ],
        repeat: [['Garrow', 'Hollowmere is past the stones. Go quiet.']],
      },
    ],
    items: [{ x: 1200, id: 'lily' }, { x: 2650, id: 'lily' }, { x: 4350, id: 'lily' }, { x: 5080, id: 'lily' }, { x: 4030, weapon: 'spear' }, { x: 2485, alt: 138, cache: 220 },
      { x: 4270, alt: 72, icon: 1 }, { x: 1040, icon: 1, gate: 'bars' }, { x: 5760, icon: 1, gate: 'veil' }],
    platforms: [{ x: 2260, w: 170, h: 70 }, { x: 2390, w: 150, h: 138 }, { x: 4180, w: 170, h: 72 }],
    pits: [{ x: 570, w: 70 }, { x: 3615, w: 68 }, { x: 5525, w: 66 }],
    lore: [
      { x: 1820, title: 'Scratched on a Boat Hull', text: 'day 1 they do not sleep\nday 4 they do not eat\nday 9 father looked at me and did not know me\nday 10 he knew me\nthat was worse' },
      { x: 3560, title: "Sister Corra's Tally", text: 'Washed at the drowned oak: 61.\nOf those, came back a second time: 40.\nA third: 22.\n\nIt is not a cure. It is a delay. I say this to every one of them and every one of them thanks me as if I had said the opposite.' },
      { x: 5350, title: 'A Green Hood, Empty', text: 'Caught on the reeds. Inside the lining, stitched small:\n\nILSE MADE THIS — COME HOME' },
    ],
    boss: {
      type: 'matron', grants: 'dj', gate: 4820, x: 5080, end: 5290,
      intro: [
        ['Wist', 'Mind your step. That one was the fen midwife. She still tries to hold things.'],
        ['Wist', 'And she still calls her dogs. Such a full house!'],
      ],
      retry: [['Wist', 'She missed you. Go on, she is waiting.']],
      lastWords: [['Aldric', 'Whoever you were — it is over now.']],
    },
    exit: { x: 6100, label: 'Enter Hollowmere' },
    exitSlides: ['The road ends where it always ended: at the mill, the well, the crooked chapel.\n\nHollowmere. You were born here.\nNo lamp is lit.'],
  },
  {
    name: 'Hollowmere', chapter: 'Chapter IV', theme: 'village', length: 6500, seed: 23,
    shrines: [220, 2680, 4960], chapels: [{ x: 5120 }],
    items: [{ x: 3330, weapon: 'flail' }, { x: 1485, alt: 144, cache: 260 }, { x: 5905, alt: 72, cache: 140 },
      { x: 5850, alt: 72, ability: 'lantern' }, { x: 1290, alt: 74, icon: 1 }, { x: 3760, alt: 132, icon: 1 }, { x: 4640, icon: 1, gate: 'bars' }],
    platforms: [{ x: 1250, w: 180, h: 74 }, { x: 1390, w: 150, h: 144 }, { x: 5820, w: 170, h: 72 }, { x: 3700, w: 120, h: 132 }],
    pits: [{ x: 1610, w: 70 }, { x: 4710, w: 70 }],
    enemies: [
      ['wretch', 700], ['wretch', 780], ['flagellant', 1100], ['bloat', 1750], ['deserter', 1830], ['hound', 2000], ['flagellant', 2100],
      ['brute', 2380], ['crow', 2950], ['flagellant', 3180], ['flagellant', 3260], ['wretch', 3560], ['wretch', 3620], ['bloat', 3720],
      ['pikeman', 3950], ['crow', 4050], ['brute', 4250], ['flagellant', 4400], ['hound', 4550],
      ['reaper', 5450], ['flagellant', 5560], ['flagellant', 5630], ['wretch', 5760, 'greta'], ['bloat', 5880], ['hound', 6000], ['hound', 6060], ['brute', 6200], ['templar', 6300],
    ],
    npcs: [
      {
        id: 'doctor', x: 1420, name: 'The Plague Doctor', look: 'doctor', pose: 'stand', hp: 90,
        lines: [
          ['Plague Doctor', 'Do not trouble to hold your breath, ser knight. It is not in the air. I have opened four hundred of them looking for where it is.'],
          ['Plague Doctor', 'It is in the grief. The ones who weep longest turn first. I have stopped feeling anything at all, as a precaution.'],
          ['Aldric', 'A girl lived here. Ysolde Vane. The miller\'s daughter.'],
          ['Plague Doctor', '...Ah. Then you are the brother. Speak to Sister Maud, by the far candle, if she still has breath. I only count the dead. She remembers them.'],
        ],
        repeat: [['Plague Doctor', 'Four hundred and one, soon. Mind the Headsman by the square.']],
      },
      {
        id: 'maud', x: 2780, name: 'Sister Maud', look: 'sisterA', pose: 'kneel', essential: true, cleanse: true,
        lines: [
          ['Sister Maud', 'Aldric? Little Aldric Vane, in all that iron... She said you would come. Every day she said it.'],
          ['Sister Maud', 'Ysolde stayed when the rest of us hid. She washed them. Sang to them. And one morning her own eyes ran red — and she did not fall. She did not turn.'],
          ['Sister Maud', 'The Bishop called it a miracle. He put her in a bridal veil and carried her up to Saint Avaric. The infected followed her up the hill like children. They did not touch her. They never touch her.'],
          ['Aldric', 'And no one stopped him.'],
          ['Sister Maud', 'Ser Garrick went with her. Your brother-in-arms. He swore he would guard her door, since you were not here to do it.'],
          ['Sister Maud', 'Whatever is in that reliquary you carry — take it to her. Not to the Bishop. To her.'],
        ],
        repeat: [['Sister Maud', 'Go on, child. The cathedral doors are past the square. I will keep the candle.']],
      },
      {
        id: 'edda', x: 3010, name: 'Edda the Fletcher', look: 'edda', pose: 'stand', fighter: true, hp: 170, dmg: 15, weapon: 'sword', wlen: 36,
        lines: [
          ['Edda', 'Stay back — oh. You bleed the right colour. Good.'],
          ['Edda', 'I was the fletcher here. Now I am the wall. Everything past me is the square.'],
        ],
        repeat: [['Edda', 'Still standing. Both of us. Strange days.']],
      },
      {
        id: 'tobias', x: 3400, name: 'Old Tobias', look: 'beggar', pose: 'kneel', hp: 70,
        lines: [
          ['Old Tobias', 'Alms, ser? No... no, you have nothing I can eat.'],
          ['Old Tobias', 'They walk past me, mostly. I think they forget I am not one of them yet. Do not remind them.'],
        ],
        repeat: [['Old Tobias', 'Still here. Still not one of them. I check every morning.']],
      },
      {
        id: 'liese', x: 5200, name: 'Sister Liese', look: 'sisterC', pose: 'stand', cleanse: true, fighter: true, hp: 230, dmg: 16, weapon: 'sword', wlen: 36,
        lines: [
          ['Sister Liese', 'Maud sent you on? Then she is still breathing. Good. I stayed at this end so that someone would be between the square and the hill.'],
          ['Sister Liese', 'Past me there is no more lily-water until the cathedral. Let me fill your vial and wash what I can.'],
        ],
        repeat: [['Sister Liese', 'Sleeves up. Quickly, before something hears us.']],
      },
      {
        id: 'greta', x: 5700, name: 'Greta', look: 'widow', pose: 'kneel', hp: 80,
        lines: [
          ['Greta', 'That one. The one who keeps circling. That is my Aldous. He has walked round this house for a year. He will not come in and he will not go.'],
          ['Greta', 'I know what he would do if he caught me. I only... I like to hear someone on the path.'],
        ],
        repeat: [['Greta', 'It is quiet now. I had forgotten quiet.']],
      },
    ],
    lore: [
      { x: 960, title: "A Child's Slate", text: 'A chalk drawing: a tall lady with red lines running from her eyes, holding hands with a row of smaller figures.\n\nUnderneath, in careful letters:\n\nYSOLDE MAKES THEM NICE' },
      { x: 2480, title: 'Unsent Letter', text: "Aldric,\n\nSix winters now. I have stopped counting ships.\n\nGarrick says you are dead. I told him even the weeping come home, these days, so it makes no difference. He did not laugh.\n\nIf you find this, I am not angry. I only wanted you to know I kept the mill running as long as there was anyone to eat.\n\n— Y." },
      { x: 3780, title: "The Doctor's Ledger", text: 'Subject 388 wept nine days before turning.\nSubject 391: eleven.\n\nThe Vane girl: four hundred and six days. Still lucid. Still weeping.\n\nShe is not immune. She is the well it is drawn from. God forgive me — I told the Bishop.' },
    ],
    gates: [
      { x: 2580, kind: 'wall', h: 128, need: 'dj', shut: 'Fallen masonry. Too high to climb', hint: 'Jump, then jump again in mid-air',
        wist: 'A wall. You cannot fly, can you? I can. It is wonderful.' },
      { x: 6250, kind: 'veil', need: 'lantern', shut: 'A red veil. It wants a blessed light', open: 'Part the veil with the Lily Lantern',
        wist: 'Pretty, is it not? It eats people. Somebody left a lamp up on those boards behind us, but I would not bother.' },
    ],
    exit: { x: 6400, label: 'Climb to Saint Avaric' },
    exitSlides: ['The cathedral of Saint Avaric crowns the hill like a black tooth.\n\nIts bells have not stopped in three years.\nNo one is pulling the ropes.'],
  },
  {
    name: 'Cathedral of Saint Avaric', chapter: 'Chapter V', theme: 'cathedral', length: 6600, seed: 37,
    shrines: [220, 5280], chapels: [],
    items: [{ x: 1775, alt: 148, cache: 400 }, { x: 4390, alt: 74, cache: 200 }, { x: 900, icon: 1, gate: 'veil' }, { x: 2960, alt: 132, icon: 1 }, { x: 3520, icon: 1, gate: 'bars' }],
    platforms: [{ x: 1500, w: 200, h: 76 }, { x: 1670, w: 170, h: 148 }, { x: 4300, w: 180, h: 74 }, { x: 2900, w: 120, h: 132 }],
    pits: [{ x: 1175, w: 66 }, { x: 3865, w: 70 }],
    enemies: [
      ['flagellant', 720], ['flagellant', 800], ['reaper', 1050], ['templar', 1300], ['crow', 1500], ['wretch', 1600], ['wretch', 1660], ['templar', 1800],
      ['reaper', 2050], ['brute', 2300], ['bloat', 2650], ['flagellant', 2750], ['templar', 2850], ['templar', 3300], ['reaper', 3420], ['pikeman', 3650], ['templar', 3760],
      ['flagellant', 4000], ['flagellant', 4070], ['bloat', 4200], ['reaper', 4350], ['templar', 4500], ['templar', 4570], ['crow', 4700], ['crow', 4760], ['brute', 4900], ['pikeman', 5020], ['templar', 5100],
    ],
    npcs: [
      {
        id: 'anselm', x: 440, name: 'Brother Anselm', look: 'monk', pose: 'kneel', hp: 80,
        lines: [
          ['Brother Anselm', 'Hush! Hush. They hear prayer. I learned that late.'],
          ['Brother Anselm', 'I served Bishop Malvern twenty years. I must know whether he died a believer.'],
        ],
        repeat: [['Brother Anselm', 'I do not pray any more. I only kneel. It is a habit.']],
      },
      {
        id: 'rowan', x: 3090, name: 'Ser Rowan', look: 'rowan', pose: 'stand', fighter: true, hp: 190, dmg: 18, weapon: 'sword', wlen: 44,
        lines: [
          ['Ser Rowan', 'I wore the Veil. I stood in the row when they carried her in, and I said nothing.'],
          ['Ser Rowan', 'I have been killing my own brothers in this aisle ever since. Come — there are more, and I owe.'],
        ],
        repeat: [['Ser Rowan', 'Lead on. I will keep your back.']],
      },
      {
        id: 'ines', x: 5370, name: 'Sister Ines', look: 'sisterD', pose: 'kneel', cleanse: true, essential: true,
        lines: [
          ['Sister Ines', 'Do not be startled. I am not one of the Veil. I came up the hill with a vial of lily-water three years ago to wash the Saint\'s eyes.'],
          ['Sister Ines', 'It did nothing. She only thanked me. The infection does not ride in her blood, ser knight. It rises from it. I have sat by this candle ever since, not knowing whom to tell.'],
          ['Sister Ines', 'Let me wash you. It is the last use I have.'],
        ],
        repeat: [['Sister Ines', 'Once more, then. Garrick is past that door. He was a good man. He still is, which is the trouble.']],
      },
      {
        id: 'ysolde', x: 6420, name: 'Ysolde', look: 'ysolde', pose: 'kneel', needs: 'bossDead', essential: true,
        lines: [
          ['Ysolde', 'Aldric. You are late. I had supper waiting for... oh. For a long time.'],
          ['Ysolde', "Don't look at Garrick like that. He was kind. He held the door so they would not cut me open again. The Bishop tried, you know. He is in the crypt now, with the others. They are quiet for me."],
          ['Aldric', "I brought the Saint's Tear. I swore I would. It ends any plague it touches."],
          ['Ysolde', 'I know what it ends. I can feel it from here, like a cold coin on the tongue.'],
          ['Ysolde', 'It is me, Aldric. I am the well the infection is drawn from. If you give me that, it burns out of every one of them at once — and out of me, and I am mostly made of it now.'],
          ['Ysolde', 'Or throw it away, and stay. I have been so long without anyone who remembers my name. Choose, brother. I will not be angry. I never was.'],
        ],
      },
    ],
    lore: [
      { x: 1000, title: 'Hymnal, Defaced', text: 'Every verse has been scraped out and written over in the same cramped hand:\n\nshe weeps for us she weeps for us she weeps for us she weeps for us she weeps' },
      { x: 2500, title: "Bishop Malvern's Confession", text: 'I do not believe. I never have.\n\nThe doctor says the girl is the source. Cut the spring and the river dries. I have the knives blessed, for form\'s sake.\n\nThe knight Garrick stands at her door and will not be moved. Tonight I send the Headsmen.' },
      { x: 5150, title: "Garrick's Vigil", text: 'Day 900-and-something.\n\nThe Headsmen came. I sent them back in pieces. The Bishop came after. She asked me not to, so I only broke his legs. The infected did the rest.\n\nMy eyes ran this morning. It does not hurt. I can still hold a sword.\n\nAldric, you bastard. If you come now, you come as a thief. I will not let you take her.' },
    ],
    boss: {
      type: 'garrick', final: true, gate: 5550, x: 6050, end: 6290,
      intro: [
        ['Ser Garrick', 'Seven years, Aldric.'],
        ['Ser Garrick', 'She called for you until her voice ran red. I answered instead. Every night. I am the one who stayed.'],
        ['Aldric', 'Stand aside, Garrick. I carry the Tear.'],
        ['Ser Garrick', 'I know what you carry. I know what it does to her. I swore to keep this door — and unlike you, brother, I keep my oaths.'],
      ],
      retry: [['Ser Garrick', 'Again? Good. The fever makes you stubborn. It did the same to me.']],
      lastWords: [
        ['Ser Garrick', '...Hah. You always were the better sword.'],
        ['Ser Garrick', "Don't let me get up again, Aldric. Not as one of them. Do it clean."],
        ['Ser Garrick', 'And tell her... tell her I held the door.'],
      ],
    },
  },
];
