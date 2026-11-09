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
  // Planned: greataxe (slow, huge sever), flail (bleed build-up), spear (reach) ...
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

G.LOOKS = {
  player: { skin: '#999', body: '#8c9099', trim: '#2b3040', arm: '#737781', leg: '#4c4f58', helm: 'helm', helmCol: '#9a9ea8', plume: '#6b1218', cape: '#5a1016' },
  hanged: { skin: '#6f7a68', body: '#2e2824', arm: '#6f7a68', leg: '#241f1c', helm: 'none', eye: '#d8d2c0' },
  digger: { skin: '#9a8d7c', body: '#3b352c', arm: '#3b352c', leg: '#26221d', helm: 'hood', helmCol: '#2a261f' },
  nun: { skin: '#b5a99a', body: '#17151a', arm: '#17151a', leg: '#17151a', helm: 'hood', helmCol: '#d6cfc2' },
  doctor: { skin: '#222', body: '#1a1719', arm: '#1a1719', leg: '#121012', helm: 'beak', helmCol: '#1a1719', eye: '#c9a13b' },
  widow: { skin: '#b5a99a', body: '#2b2630', arm: '#2b2630', leg: '#2b2630', helm: 'hood', helmCol: '#55505c' },
  oswin: { skin: '#999', body: '#6a6c70', trim: '#8a6a2a', arm: '#5a5c60', leg: '#3d3f44', helm: 'helm', helmCol: '#74767c' },
  edda: { skin: '#b09a86', body: '#4a3a2a', trim: '#2e241a', arm: '#4a3a2a', leg: '#2a221a', helm: 'hood', helmCol: '#6a3a22' },
  beggar: { skin: '#9a8d7c', body: '#3a352c', arm: '#9a8d7c', leg: '#2a2620', helm: 'none' },
  monk: { skin: '#b5a99a', body: '#3a2a1e', arm: '#3a2a1e', leg: '#3a2a1e', helm: 'hood', helmCol: '#2e2118' },
  rowan: { skin: '#888', body: '#6e6a66', trim: '#2a2a2a', arm: '#5d5955', leg: '#3c3a38', helm: 'helm', helmCol: '#77726c' },
  ysolde: { skin: '#d9d0c6', body: '#c9c2b6', arm: '#c9c2b6', leg: '#c9c2b6', helm: 'veil', helmCol: '#e6dfd2', eye: '#c20d16' },
};

// --------------------------------- story -----------------------------------
G.STORY = {
  intro: [
    'In the Weeping Year, the dead of Morrowmere did not lie still.\nThey bled, and they rose, and they wept red.',
    "King Osric sent his knights across the sea to find the Saint's Tear —\na relic said to end any plague it touched.",
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
        'Across Morrowmere the dead sit down in the roads and the fields, like labourers at the end of a long day, and do not rise again.',
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
        'The bells of Saint Avaric ring on. The dead walk on. And at the altar a knight keeps watch, weeping, beside the only thing he came home for.',
        'On his pauldron sits a small lavender thing, chin in her hands, waiting.\n\nShe has all the time in the world.',
      ],
    },
  },
};

G.LEVELS = [
  {
    name: 'The Gallows Road', chapter: 'Chapter I', theme: 'road', length: 4300, seed: 11,
    shrines: [1380],
    enemies: [
      ['wretch', 760], ['crow', 900], ['wretch', 1060], ['wretch', 1130], ['deserter', 1750], ['wretch', 2050, 'marta'], ['wretch', 2120, 'marta'],
      ['deserter', 2560], ['hound', 2700], ['hound', 2760], ['wretch', 2950], ['pikeman', 3050], ['crow', 3300], ['brute', 3600], ['deserter', 3900],
    ],
    npcs: [
      {
        id: 'hanged', x: 430, name: 'The Hanged Man', look: 'hanged', pose: 'hang',
        lines: [
          ['The Hanged Man', 'A knight. A living one. Hah... forgive me if I do not kneel.'],
          ['The Hanged Man', "You wear the King's sun. Did no one tell you? Osric wept himself hollow three winters gone. They burned what was left on the palace steps."],
          ['Aldric', 'Then who rules Morrowmere?'],
          ['The Hanged Man', 'Bishop Malvern. He says the Weeping is no plague but a sacrament. He has even found himself a saint — a girl from Hollowmere who bled from her eyes and would not die.'],
          ['The Hanged Man', 'They ring the bells for her at Saint Avaric. Follow the road. Follow the bells. And knight — cut me down on your way back, if you come back.'],
        ],
        repeat: [['The Hanged Man', 'Follow the bells. Everyone does, in the end.']],
      },
      {
        id: 'digger', x: 1470, name: 'Wynn the Gravedigger', look: 'digger', pose: 'stand', fighter: true, hp: 150, dmg: 13, weapon: 'club', wlen: 30,
        lines: [
          ['Wynn', "Rest at the candle, ser. Vigil flames still burn clean. Whatever you've bled out of them, the flame will make it part of you."],
          ['Wynn', 'A word for the road. Cut them and they bleed, same as us. Cut deep enough, and pieces come off. A wretch with no sword-arm is half a wretch. One with no leg can only crawl.'],
          ['Wynn', "And when one's had enough, it kneels. Don't leave it kneeling — it'll only get back up, angrier. Step close and put it down. Mercy is the only sacrament left."],
        ],
        repeat: [['Wynn', "I dig them deep. They climb out anyway. Still — a man needs his work."]],
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
    ],
    lore: [
      { x: 940, title: "A Soldier's Letter", text: "Marta —\n\nThe captain wept at muster this morning. Red, down both cheeks, and him still shouting orders. We ran. All of us. I am not ashamed.\n\nI will come by the gallows road. Leave the lamp lit." },
      { x: 2320, title: 'Edict of Bishop Malvern', text: 'Let it be known in every parish:\n\nThe Weeping is the LORD\'s own grief made flesh. To burn the weeping dead is blasphemy. To flee them, cowardice. Open your doors. Be embraced.\n\nThe Saint is risen at Hollowmere. Rejoice.' },
      { x: 3300, title: 'Scratched Into a Shield', text: 'OSRIC IS DEAD\nTHE SUN IS DEAD\nGARRICK KEEPS THE DOOR' },
    ],
    exit: { x: 4200, label: 'Enter Hollowmere' },
    exitSlides: ['The road ends where it always ended: at the mill, the well, the crooked chapel.\n\nHollowmere. You were born here.\nNo lamp is lit.'],
  },
  {
    name: 'Hollowmere', chapter: 'Chapter II', theme: 'village', length: 4900, seed: 23,
    shrines: [220, 2680],
    enemies: [
      ['wretch', 700], ['wretch', 780], ['flagellant', 1100], ['bloat', 1750], ['deserter', 1830], ['hound', 2000], ['flagellant', 2100],
      ['brute', 2380], ['crow', 2950], ['flagellant', 3180], ['flagellant', 3260], ['wretch', 3560], ['wretch', 3620], ['bloat', 3720],
      ['pikeman', 3950], ['crow', 4050], ['brute', 4250], ['flagellant', 4400], ['hound', 4550],
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
        id: 'maud', x: 2780, name: 'Sister Maud', look: 'nun', pose: 'kneel', essential: true,
        lines: [
          ['Sister Maud', 'Aldric? Little Aldric Vane, in all that iron... She said you would come. Every day she said it.'],
          ['Sister Maud', 'Ysolde stayed when the rest of us hid. She washed them. Sang to them. And one morning her own eyes ran red — and she did not fall. She did not turn.'],
          ['Sister Maud', 'The Bishop called it a miracle. He put her in a bridal veil and carried her up to Saint Avaric. The dead followed her like children.'],
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
    ],
    lore: [
      { x: 960, title: "A Child's Slate", text: 'A chalk drawing: a tall lady with red lines running from her eyes, holding hands with a row of smaller figures.\n\nUnderneath, in careful letters:\n\nYSOLDE MAKES THEM NICE' },
      { x: 2480, title: 'Unsent Letter', text: "Aldric,\n\nSix winters now. I have stopped counting ships.\n\nGarrick says you are dead. I told him the dead come home too, these days, so it makes no difference. He did not laugh.\n\nIf you find this, I am not angry. I only wanted you to know I kept the mill running as long as there was anyone to eat.\n\n— Y." },
      { x: 3780, title: "The Doctor's Ledger", text: 'Subject 388 wept nine days before turning.\nSubject 391: eleven.\n\nThe Vane girl: four hundred and six days. Still lucid. Still weeping.\n\nShe is not immune. She is the well it is drawn from. God forgive me — I told the Bishop.' },
    ],
    exit: { x: 4800, label: 'Climb to Saint Avaric' },
    exitSlides: ['The cathedral of Saint Avaric crowns the hill like a black tooth.\n\nIts bells have not stopped in three years.\nNo one is pulling the ropes.'],
  },
  {
    name: 'Cathedral of Saint Avaric', chapter: 'Chapter III', theme: 'cathedral', length: 5300, seed: 37,
    shrines: [220, 3980],
    enemies: [
      ['flagellant', 720], ['flagellant', 800], ['reaper', 1050], ['templar', 1300], ['crow', 1500], ['wretch', 1600], ['wretch', 1660], ['templar', 1800],
      ['reaper', 2050], ['brute', 2300], ['bloat', 2650], ['flagellant', 2750], ['templar', 2850], ['templar', 3300], ['reaper', 3420], ['pikeman', 3650], ['templar', 3760],
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
        id: 'ysolde', x: 5120, name: 'Ysolde', look: 'ysolde', pose: 'kneel', needs: 'bossDead', essential: true,
        lines: [
          ['Ysolde', 'Aldric. You are late. I had supper waiting for... oh. For a long time.'],
          ['Ysolde', "Don't look at Garrick like that. He was kind. He held the door so they would not cut me open again. The Bishop tried, you know. He is in the crypt now, with the others. They are quiet for me."],
          ['Aldric', "I brought the Saint's Tear. I swore I would. It ends any plague it touches."],
          ['Ysolde', 'I know what it ends. I can feel it from here, like a cold coin on the tongue.'],
          ['Ysolde', 'It is me, Aldric. I am the well. If you give me that, they all lie down — and so do I.'],
          ['Ysolde', 'Or throw it away, and stay. I have been so long without anyone who remembers my name. Choose, brother. I will not be angry. I never was.'],
        ],
      },
    ],
    lore: [
      { x: 1000, title: 'Hymnal, Defaced', text: 'Every verse has been scraped out and written over in the same cramped hand:\n\nshe weeps for us she weeps for us she weeps for us she weeps for us she weeps' },
      { x: 2500, title: "Bishop Malvern's Confession", text: 'I do not believe. I never have.\n\nThe doctor says the girl is the source. Cut the spring and the river dries. I have the knives blessed, for form\'s sake.\n\nThe knight Garrick stands at her door and will not be moved. Tonight I send the Headsmen.' },
      { x: 3850, title: "Garrick's Vigil", text: 'Day 900-and-something.\n\nThe Headsmen came. I sent them back in pieces. The Bishop came after. She asked me not to, so I only broke his legs. The dead did the rest.\n\nMy eyes ran this morning. It does not hurt. I can still hold a sword.\n\nAldric, you bastard. If you come now, you come as a thief. I will not let you take her.' },
    ],
    boss: {
      type: 'garrick', gate: 4250, x: 4750, end: 4990,
      intro: [
        ['Ser Garrick', 'Seven years, Aldric.'],
        ['Ser Garrick', 'She called for you until her voice ran red. I answered instead. Every night. I am the one who stayed.'],
        ['Aldric', 'Stand aside, Garrick. I carry the Tear.'],
        ['Ser Garrick', 'I know what you carry. I know what it does to her. I swore to keep this door — and unlike you, brother, I keep my oaths.'],
      ],
      retry: [['Ser Garrick', 'Again? Good. The dead at least are persistent.']],
      lastWords: [
        ['Ser Garrick', '...Hah. You always were the better sword.'],
        ['Ser Garrick', "Don't let me get up again, Aldric. Not as one of them. Do it clean."],
        ['Ser Garrick', 'And tell her... tell her I held the door.'],
      ],
    },
  },
];
