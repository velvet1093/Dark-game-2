'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — two side areas off the main road, each behind a tool:
//   The Wreck of the Sun  — the Long Battalion's ship, run aground below the
//                           Gallows Road. The cliff path needs the wings.
//   The Ossuary           — the bone vaults under Saint Avaric, where the
//                           Bishop was chained. The stair needs the lantern.
// They are appended to G.LEVELS (indices 5 and 6) and reached by `passages`.
// A level's `back` says where its near-end archway leads.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM;

  // ---- who you meet there
  Object.assign(G.LOOKS, {
    bosun: { skin: '#9a8a78', body: '#2a3448', trim: '#c9a13b', arm: '#2a3448', leg: '#1e2230', helm: 'hood', helmCol: '#3a3a3a', beard: '#8a8478' },
    amabel: Object.assign({}, G.LOOKS.sisterC, { iris: '#b02a30', hair: '#4a3a3a' }),
  });
  Object.assign(G.ENEMIES, {
    sailor: {
      name: 'Drowned Deckhand', hp: 62, limbHp: 26, speed: 70, ichor: 30, aggro: 360, weapon: 'club', wlen: 26, hunch: 0.3,
      look: { skin: '#7a908a', body: '#3a4a5a', trim: '#c8c0b0', arm: '#7a908a', leg: '#2a3038', helm: 'none', eye: '#ff3b2f' },
      attacks: [{ wind: 0.42, active: 0.1, rec: 0.5, dmg: 14, reach: 58, lunge: 150, anim: A.chop }],
    },
    drowned: {
      name: 'Drowned Knight of the Battalion', hp: 125, limbHp: 50, speed: 66, ichor: 85, aggro: 400, weapon: 'sword', wlen: 42,
      look: { skin: '#6f8a80', body: '#c9a13b', trim: '#7a1a14', arm: '#3e4c4c', leg: '#2c3636', helm: 'helm', helmCol: '#5a6a6a', plume: '#2a4a4a', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.4, active: 0.1, rec: 0.5, dmg: 21, reach: 74, lunge: 150, anim: A.chop },
        { wind: 0.62, active: 0.14, rec: 0.7, dmg: 28, reach: 104, trigger: 170, min: 90, lunge: 380, anim: A.thrust },
      ],
    },
    bearer: {
      name: 'The Standard-Bearer of the Long Battalion', boss: true, hp: 560, limbHp: 150, speed: 78, ichor: 1100, aggro: 9999,
      weapon: 'greatsword', wlen: 64, scale: 1.4, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'FOR THE SUN!',
      look: { skin: '#7a8a84', body: '#c9a13b', trim: '#7a1a14', arm: '#4a5052', leg: '#2a2e30', helm: 'helm', helmCol: '#8a8a7a', plume: '#c9a13b', cape: '#7a1a14', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.12, rec: 0.55, dmg: 28, reach: 112, lunge: 180, anim: A.chop },
        { wind: 0.46, active: 0.12, rec: 0.6, dmg: 28, reach: 112, lunge: 180, anim: A.rise },
        { wind: 0.72, active: 0.16, rec: 0.8, dmg: 36, reach: 140, trigger: 270, min: 120, lunge: 580, anim: A.thrust },
        { wind: 0.9, active: 0.14, rec: 0.95, dmg: 46, reach: 126, lunge: 220, anim: A.slam },
      ],
    },
    malvern: {
      name: 'Malvern, the Unmade Bishop', boss: true, hp: 600, limbHp: 160, speed: 52, ichor: 1300, aggro: 9999,
      weapon: 'spear', wlen: 64, scale: 1.45, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'KNEEL!',
      summon: { type: 'flagellant', at: [0.66, 0.33], n: 2, text: 'HE CALLS HIS PENITENTS' },
      look: { skin: '#b8a898', body: '#e8e0d0', trim: '#8a1018', arm: '#e8e0d0', leg: '#8a1018', helm: 'mitre', helmCol: '#efe8da', eye: '#ff3b2f', skirt: 'long' },
      attacks: [
        { wind: 0.6, active: 0.14, rec: 0.7, dmg: 30, reach: 116, lunge: 140, anim: A.chop },
        { wind: 0.55, active: 0.12, rec: 0.65, dmg: 26, reach: 132, trigger: 200, min: 80, lunge: 320, anim: A.thrust },
        // a swing of the censer: little damage, a great deal of red smoke
        { wind: 0.85, active: 0.35, rec: 0.95, dmg: 12, reach: 200, trigger: 240, min: 90, lunge: 0, spew: 20, anim: A.claw },
      ],
    },
  });
  // ---- what their bosses leave behind
  Object.assign(G.WEAPONS, {
    greatsword: {
      name: 'Battalion Greatsword', draw: 'greatsword', len: 60, bleed: 20,
      light: [
        { wind: 0.3, active: 0.12, rec: 0.4, dmg: 31, st: 21, reach: 104, lunge: 160, sever: 1.7, anim: A.chop },
        { wind: 0.28, active: 0.12, rec: 0.44, dmg: 34, st: 22, reach: 104, lunge: 170, sever: 1.8, anim: A.rise },
      ],
      heavy: { wind: 0.58, active: 0.14, rec: 0.55, dmg: 64, st: 38, reach: 112, lunge: 220, sever: 3, poiseBreak: true, anim: A.slam },
    },
    knife: {
      name: 'The Seventh Knife', draw: 'sword', len: 26, bleed: 58,
      light: [
        { wind: 0.08, active: 0.08, rec: 0.16, dmg: 10, st: 8, reach: 62, lunge: 160, sever: 0.6, anim: A.thrust },
        { wind: 0.08, active: 0.08, rec: 0.16, dmg: 10, st: 8, reach: 62, lunge: 160, sever: 0.6, anim: A.chop },
        { wind: 0.1, active: 0.08, rec: 0.2, dmg: 12, st: 9, reach: 64, lunge: 180, sever: 0.7, anim: A.thrust },
        { wind: 0.12, active: 0.1, rec: 0.3, dmg: 16, st: 11, reach: 66, lunge: 220, sever: 0.8, anim: A.rise },
      ],
      heavy: { wind: 0.3, active: 0.12, rec: 0.4, dmg: 34, st: 24, reach: 70, lunge: 300, sever: 1.2, poiseBreak: true, anim: A.thrust },
    },
  });
  G.ICON_NAMES.push('The Saint on the Shore', 'The Saint Counting Sails', 'The Saint and the Roll', 'The Saint among the Bones', 'The Saint Unchained', 'The Saint Below');

  // ---- the ways in
  G.LEVELS[0].passages = [{ x: 250, to: 5, at: 120, needs: 'dj', label: 'Climb down the cliff path to the harbour',
    shut: 'The cliff path has fallen. Too far to climb back up without wings', wist: 'Down there? It is only a shipwreck. Full of men who were sure they were coming home.',
    slides: ['A broken stair, cut into the cliff.\n\nBelow, a great ship lies on her side in the shallows, her sun-banner still flying at the stern.\n\nYou know her. You sailed home on her.'] }];
  G.LEVELS[4].passages = [{ x: 2600, to: 6, at: 120, needs: 'lantern', label: 'Descend into the Ossuary',
    shut: 'A stair into the dark. You would need a light', wist: 'It is so dark down there. Lovely. Do go first.',
    slides: ['The stair goes down past the crypt, past the old saints, past where the candles stop.\n\nSomething at the bottom is praying. It has been praying for three years.'] }];

  G.LEVELS.push({
    name: 'The Wreck of the Sun', chapter: 'Below the Gallows Road', theme: 'harbour', length: 4400, seed: 81,
    back: { to: 0, at: 310 }, backLabel: 'Climb back up to the Gallows Road',
    shrines: [260, 2500],
    enemies: [['sailor', 600], ['sailor', 680], ['crow', 900], ['drowned', 1150], ['sailor', 1500], ['bloat', 1800], ['drowned', 2150], ['pikeman', 2320],
      ['sailor', 2800], ['sailor', 2870], ['drowned', 3100], ['crow', 3200], ['hound', 3380], ['hound', 3440]],
    npcs: [{
      id: 'bosun', x: 1000, name: 'The Bosun', look: 'bosun', pose: 'kneel', essential: true,
      lines: [
        ['The Bosun', 'Seven hundred. I rowed seven hundred out to the Sun, and I rowed back... you. One. You remember me? No. Nobody remembers anybody, after the muster.'],
        ['The Bosun', 'We ran her aground coming home. The fever came aboard in the east and sailed back with us, quiet as a stowaway. By the time we sighted Morrowmere, the whole deck was weeping.'],
        ['The Bosun', 'The Standard-Bearer still holds the colours at the stern. He will not let her be boarded. He was always good at his orders.'],
        ['Knight', 'Did I have a name, on the roll?'],
        ['The Bosun', "Everyone did, before the priests took them. The roll is in the captain's chest at the stern, if the tide has left it."],
      ],
      repeat: [['The Bosun', 'The tide comes in. The tide goes out. The Sun stays where she is.']],
    }],
    lore: [
      { x: 1700, title: "The Sun's Log", text: 'Day 1 of the return. 700 aboard.\nDay 9. A knight wept at prayers. Put him in the hold.\nDay 14. The hold is full.\nDay 20. We have stopped putting them anywhere.\nDay 31. Land. God forgive us, land.' },
      { x: 2700, title: 'A Letter Never Sent', text: "To Wenna, at the fen farms.\n\nMy love — they made us give up our names at the muster. The priests said it was so the Saint would know us only by our deeds.\n\nI have done such deeds, Wenna. Do not let her know me by them.\n\nI will come home by the fen road. Knock three times." },
      { x: 4180, title: 'Roll of the Long Battalion', text: "Seven hundred numbers in a clerk's hand. Beside each, a name, every one carefully blacked out.\n\nOne line has been scratched through so many times the vellum is torn. Beside it, in a different hand:\n\nRETURNED.\n\nUnder the tear, three letters of the name survive. You do not read them. You find you cannot." },
    ],
    items: [{ x: 4120, weapon: 'greatsword', needs: 'boss_bearer_dead' }, { x: 1320, alt: 72, icon: 1 }, { x: 2070, alt: 140, icon: 1 }, { x: 2950, icon: 1, gate: 'bars' }, { x: 1960, alt: 72, cache: 260 }],
    platforms: [{ x: 1250, w: 160, h: 72 }, { x: 1900, w: 140, h: 72 }, { x: 2010, w: 120, h: 140 }],
    pits: [{ x: 820, w: 66 }, { x: 3020, w: 68 }],
    boss: {
      type: 'bearer', gate: 3600, x: 3960, end: 4260,
      intro: [
        ['The Standard-Bearer', '...Halt. Name and number.'],
        ['Knight', 'I have no name.'],
        ['The Standard-Bearer', 'None of us do. NUMBER.'],
        ['Misery', 'Oh, he still thinks he is on parade. How sweet.'],
        ['The Standard-Bearer', 'No one boards the Sun without orders. The colours stay at the stern. FOR THE SUN!'],
      ],
      retry: [['The Standard-Bearer', 'Halt. Name and number.']],
      lastWords: [['The Standard-Bearer', 'Relieved... of duty? At last.'], ['The Standard-Bearer', 'Take the colours down, brother. They are so heavy.']],
    },
  });

  G.LEVELS.push({
    name: 'The Ossuary', chapter: 'Beneath Saint Avaric', theme: 'crypt', length: 4800, seed: 93,
    back: { to: 4, at: 2660 }, backLabel: 'Climb back up to the cathedral',
    shrines: [220, 2700],
    enemies: [['wretch', 600], ['wretch', 660], ['flagellant', 900], ['reaper', 1300], ['bloat', 1600], ['templar', 1900], ['wretch', 2100], ['wretch', 2160], ['wretch', 2220],
      ['reaper', 2480], ['flagellant', 3000], ['flagellant', 3060], ['templar', 3300], ['bloat', 3540], ['reaper', 3720]],
    npcs: [{
      id: 'amabel', x: 2860, name: 'Sister Amabel', look: 'amabel', pose: 'kneel', essential: true, cleanse: true,
      lines: [
        ['Sister Amabel', 'Do not come closer than the candle. I am further gone than I look.'],
        ['Sister Amabel', 'Mother Odile held the knife. Her hand shook. I do not blame her; I crawled down here so she would not have to try again.'],
        ['Sister Amabel', 'The Bishop is below. They chained him in his own vault when the Saint asked them to stop cutting her. He has had three years to think about mercy. He has not been thinking about it.'],
        ['Misery', 'Mercy. Everyone keeps saying that word at me.'],
        ['Sister Amabel', 'If you go down, take his knife from him. The seventh one. It is the only one he ever used. Here, let me wash you first. I still have a little lily-water. I saved it for someone clean.'],
      ],
      repeat: [['Sister Amabel', 'Tell Odile her hand did not shake as much as she thinks.']],
    }],
    lore: [
      { x: 600, title: 'Plaque on the Wall', text: 'HERE LIE THE FAITHFUL OF SAINT AVARIC, WHO DID NOT WEEP.\n\nScratched underneath:\n\nthe rest of us are upstairs' },
      { x: 1400, title: "The Bone-Keeper's Count", text: 'Skulls: 4,212.\nFemurs: in excess of counting.\nSaints: none.\n\nAdded in another hand:\n\nOne. Upstairs. Do not let him near her.' },
      { x: 3820, title: "Malvern's Second Confession", text: 'They have chained me under my own church.\n\nI did it for the kingdom. A kingdom cannot be ruled by a girl who weeps the plague.\n\nI did it for the kingdom. I did it for the kingdom. I did it for the kingdom. I did it for' },
    ],
    items: [{ x: 4460, weapon: 'knife', needs: 'boss_malvern_dead' }, { x: 1150, alt: 72, icon: 1 }, { x: 2320, icon: 1, gate: 'veil' }, { x: 3150, alt: 132, icon: 1 }, { x: 2000, cache: 300 }],
    platforms: [{ x: 1080, w: 150, h: 72 }, { x: 3090, w: 120, h: 132 }],
    pits: [{ x: 1700, w: 66 }, { x: 3420, w: 68 }],
    boss: {
      type: 'malvern', gate: 3900, x: 4300, end: 4560,
      intro: [
        ['Malvern', "A knight. Osric's sun on your chest. How quaint. Have you come to free me?"],
        ['Knight', 'I have come for the seventh knife.'],
        ['Malvern', 'Then you have come for me. I am the seventh knife. I was always the knife. They only gave me a mitre so I would not cut myself.'],
        ['Misery', 'Oh, I like him.'],
      ],
      retry: [['Malvern', 'Kneel, then. Everyone does, in the end.']],
      lastWords: [['Malvern', 'She asked them to stop. Did they tell you that? She asked. I never could.'], ['Knight', 'Then stop.']],
    },
  });

  // ---------------------------------------------------------------------------
  // The Lily Convent — the mother house of the Sisters, out past the fen. The
  // Abbess stayed to wash the last of the sick, and drank what she washed out.
  // Its gate is chained: it needs the headsman's axe.
  // ---------------------------------------------------------------------------
  const rot = { chibi: 1, soft: 1, iris: '#ff3b2f', eye: '#ff3b2f', skin: '#a8b0a0', body: '#1c1418', trim: '#8a6a6a', arm: '#1c1418', leg: '#2a1a1e', helm: 'sister', helmCol: '#1c1418', hair: '#c8c0c8', skirt: 1, cuff: 1 };
  Object.assign(G.LOOKS, { petra: Object.assign({}, G.LOOKS.sisterB, { hair: '#b07a3a', iris: '#6a8a5a' }) });
  Object.assign(G.ENEMIES, {
    novice: {
      name: 'Weeping Novice', hp: 70, limbHp: 28, speed: 92, ichor: 45, aggro: 380, weapon: 'sword', wlen: 22, hunch: 0.2,
      look: Object.assign({}, rot, { trim: '#6a5050' }),
      attacks: [
        { wind: 0.3, active: 0.08, rec: 0.4, dmg: 12, reach: 52, lunge: 200, anim: A.thrust },
        { wind: 0.5, active: 0.3, rec: 0.6, dmg: 6, reach: 120, trigger: 140, min: 40, lunge: 0, spew: 14, anim: A.claw },
      ],
    },
    abbess: {
      name: 'Abbess Severine, the Lily Rotted', boss: true, hp: 580, limbHp: 150, speed: 84, ichor: 1300, aggro: 9999,
      weapon: 'scythe', wlen: 70, scale: 1.45, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'BE WASHED!',
      summon: { type: 'novice', at: [0.7, 0.35], n: 2, text: 'SHE CALLS HER NOVICES' },
      look: Object.assign({}, rot, { trim: '#efe8e0', helmCol: '#efe8e0', body: '#efe8e0', arm: '#d8d0c8', leg: '#8a1018' }),
      attacks: [
        { wind: 0.52, active: 0.14, rec: 0.6, dmg: 28, reach: 130, lunge: 170, anim: A.chop },
        { wind: 0.44, active: 0.14, rec: 0.55, dmg: 26, reach: 130, lunge: 160, anim: A.rise },
        { wind: 0.68, active: 0.14, rec: 0.75, dmg: 32, reach: 150, trigger: 280, min: 120, lunge: 600, anim: A.thrust },
        // she weeps over you: the tears are the plague
        { wind: 0.8, active: 0.4, rec: 0.9, dmg: 10, reach: 210, trigger: 250, min: 80, lunge: 0, spew: 26, anim: A.claw },
      ],
    },
  });
  G.WEAPONS.scythe = {
    name: "The Abbess's Scythe", draw: 'scythe', len: 62, bleed: 34,
    light: [
      { wind: 0.22, active: 0.14, rec: 0.36, dmg: 24, st: 17, reach: 118, lunge: 130, sever: 1.6, anim: A.chop },
      { wind: 0.22, active: 0.14, rec: 0.4, dmg: 26, st: 18, reach: 118, lunge: 130, sever: 1.6, anim: A.rise },
    ],
    heavy: { wind: 0.5, active: 0.18, rec: 0.5, dmg: 50, st: 34, reach: 140, lunge: 200, sever: 2.6, poiseBreak: true, anim: A.chop },
  };
  G.ICON_NAMES.push('The Saint at Matins', 'The Saint and the Abbess', 'The Saint Washing Feet');

  G.LEVELS[2].passages = [{ x: 3250, to: 7, at: 120, needs: 'axe', label: 'Break the chain on the convent road',
    shut: 'A convent road, chained shut. It would take a headsman\'s axe', wist: 'The nuns\' road. Chained, see? They did not want visitors. Or they did not want to be visited BY something.',
    slides: ['The chain parts. Beyond it, a causeway of white stones runs out over the water to an island of lilies.\n\nOn the island stands the mother house of the Sisters. Its bell has not rung in a year.\n\nSomeone inside is still singing the office. Alone. Every hour.'] }];

  G.LEVELS.push({
    name: 'The Lily Convent', chapter: 'Beyond the Weeping Fen', theme: 'convent', length: 4600, seed: 107,
    back: { to: 2, at: 3310 }, backLabel: 'Go back across the causeway to the fen',
    shrines: [240, 2400],
    enemies: [['novice', 620], ['novice', 700], ['crow', 950], ['wretch', 1200], ['flagellant', 1450], ['novice', 1700], ['novice', 1760], ['reaper', 2050],
      ['bloat', 2700], ['novice', 2950], ['novice', 3010], ['novice', 3070], ['flagellant', 3300], ['reaper', 3450]],
    npcs: [{
      id: 'petra', x: 2550, name: 'Sister Petra', look: 'petra', pose: 'kneel', cleanse: true, essential: true,
      lines: [
        ['Sister Petra', 'You are clean? You are. Oh, thank the Saint. Come here, let me wash you. I have not washed anyone in so long.'],
        ['Sister Petra', 'Mother Severine kept the convent open when every other door shut. She washed them by the hundred. She drank the water after, so none of us would have to.'],
        ['Sister Petra', 'She said the Saint drinks the world\'s sickness, so a bride of the Saint could drink a little. A little became all of it.'],
        ['Misery', 'I remember her. She sat up with the dying too. We used to nod to each other.'],
        ['Sister Petra', 'She is in the chapter house. She still sings the hours. Please. She would not want to be like this. She would want to be washed.'],
      ],
      repeat: [['Sister Petra', 'Wash her for me. Gently, if you can. It does not have to be gently.']],
    }],
    lore: [
      { x: 900, title: 'Rule of the House', text: 'I. A Sister does not weep.\nII. A Sister washes all who come, and asks nothing.\nIII. A Sister does not drink the wash-water.\n\nThe third rule has been underlined many times. In a later hand, beside it: "Forgive me. There is no one else."' },
      { x: 2200, title: 'Infirmary Tally', text: 'Washed this week: 212.\nWashed this week: 340.\nWashed this week: 518.\nSisters remaining: 9.\nSisters remaining: 4.\nSisters remaining: Mother, Petra, me.\n\nThe last line is blotted, as if the writer had been crying. Sisters do not cry.' },
      { x: 3600, title: "The Abbess's Psalter", text: 'Every margin is filled with one word, written smaller and smaller until it is only a red line:\n\nclean clean clean clean clean clean clean clean' },
    ],
    items: [{ x: 4380, weapon: 'scythe', needs: 'boss_abbess_dead' }, { x: 1300, alt: 72, icon: 1 }, { x: 2860, icon: 1, gate: 'veil' }, { x: 3330, alt: 140, icon: 1 }, { x: 1900, cache: 280 }],
    platforms: [{ x: 1230, w: 150, h: 72 }, { x: 3200, w: 130, h: 72 }, { x: 3290, w: 110, h: 140 }],
    pits: [{ x: 1580, w: 66 }, { x: 3850, w: 66 }],
    boss: {
      type: 'abbess', gate: 3950, x: 4250, end: 4520,
      intro: [
        ['Abbess Severine', '...and the third hour, and the sixth, and the ninth... Who comes to the chapter house? Are you sick, child?'],
        ['Knight', 'Mother. Petra sent me.'],
        ['Abbess Severine', 'Petra. Good girl. She never drank. I drank for her.'],
        ['Abbess Severine', 'You are so dirty, knight. Blood to the elbows. Come here. Let Mother wash you. Let Mother wash you CLEAN.'],
        ['Misery', 'Oh, Severine. You poor thing. You look wonderful.'],
      ],
      retry: [['Abbess Severine', 'Back again, and dirtier. Come. Mother will wash you.']],
      lastWords: [['Abbess Severine', 'Is it the ninth hour? I have to sing the ninth...'], ['Misery', 'Shh. I am here. Nobody goes alone. Do you remember that?'], ['Abbess Severine', '...Mercy?']],
    },
  });

  // ---------------------------------------------------------------------------
  // Trials: optional platforming gauntlets past each side area's boss (see traps.js).
  // ---------------------------------------------------------------------------
  const trial = (lv, len, t) => {
    const L = G.LEVELS[lv]; L.length = len;
    L.pits = (L.pits || []).concat(t.pits); L.platforms = (L.platforms || []).concat(t.platforms);
    L.items = L.items.concat(t.items); L.blades = t.blades || []; L.droppers = t.droppers || []; L.trials = [t.trial];
    L.enemies = L.enemies.concat(t.enemies || []);
  };
  G.ICON_NAMES.push('The Saint in the Rigging', 'The Saint over the Bones', 'The Saint in the Bell Tower');
  // The Wreck: the Sun's broken rigging, over the ribs of her hull. Needs the double jump.
  trial(5, 5700, {
    trial: { x: 4440, end: 5460, name: 'The Rigging of the Sun' },
    pits: [{ x: 4450, w: 1000 }],
    platforms: [
      { x: 4470, w: 70, h: 60 },
      { x: 4620, w: 80, h: 90, move: 60, period: 3.2 },
      { x: 4800, w: 60, h: 130, crumble: true },
      { x: 4930, w: 54, h: 160, crumble: true },
      { x: 5070, w: 60, h: 170, fake: true },
      { x: 5090, w: 60, h: 100 },
      { x: 5220, w: 70, h: 120 },
      { x: 5350, w: 56, h: 80, crumble: true, cruel: true },
    ],
    blades: [{ x: 5255, top: 330, len: 180, period: 2.4 }],
    enemies: [['crow', 5000, 'unfair'], ['crow', 5300, 'unfair']],
    items: [{ x: 5560, icon: 1 }, { x: 5620, thorns: 3 }],
  });
  // The Ossuary: a bridge of hung slabs over the bone pit; spikes in the vault, scythes on chains.
  trial(6, 6000, {
    trial: { x: 4690, end: 5770, name: 'The Bone Bridge' },
    pits: [{ x: 4700, w: 1060 }],
    platforms: [
      { x: 4720, w: 80, h: 50 },
      { x: 4880, w: 60, h: 90, crumble: true },
      { x: 5020, w: 60, h: 120 },
      { x: 5160, w: 60, h: 120, fake: true },
      { x: 5240, w: 60, h: 100 },
      { x: 5390, w: 50, h: 140, crumble: true },
      { x: 5520, w: 60, h: 110 },
      { x: 5660, w: 50, h: 70, crumble: true, cruel: true },
    ],
    droppers: [{ x: 4910, h: 330 }, { x: 5280, h: 330 }, { x: 5545, h: 340 }],
    blades: [{ x: 5050, top: 360, len: 200, period: 2.0 }, { x: 5550, top: 360, len: 210, period: 1.7, phase: 1.3 }],
    enemies: [['crow', 5300, 'unfair']],
    items: [{ x: 5880, icon: 1 }, { x: 5940, thorns: 3 }],
  });
  // The Convent: stepping stones across the drowned garth, under the swinging bells. One jump only.
  trial(7, 5700, {
    trial: { x: 4640, end: 5560, name: 'The Drowned Garth' },
    pits: [{ x: 4650, w: 900 }],
    platforms: [
      { x: 4665, w: 60, h: 40 },
      { x: 4800, w: 50, h: 60, crumble: true },
      { x: 4930, w: 60, h: 80 },
      { x: 5080, w: 70, h: 60, move: 50, period: 2.8 },
      { x: 5250, w: 50, h: 60, fake: true },
      { x: 5262, w: 50, h: 22 },
      { x: 5360, w: 50, h: 60, crumble: true },
      { x: 5466, w: 64, h: 40, crumble: true },
    ],
    blades: [{ x: 4960, top: 320, len: 200, period: 2.6 }, { x: 5385, top: 320, len: 220, period: 2.2, phase: 2 }],
    droppers: [{ x: 5110, h: 320 }],
    enemies: [['crow', 5200, 'unfair']],
    items: [{ x: 5610, icon: 1 }, { x: 5650, thorns: 3 }],
  });
})();
