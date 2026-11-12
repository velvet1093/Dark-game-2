'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Fane of the Dawn: a ruined temple on the cliffs west of where
// the road begins, across a bridge that fell long ago. Its statues have had
// their faces worn away; nobody living remembers whose house it was. The knight
// knows the voice that answers there.
// Also: Aurelle's statues, here and beside the Chapel of the Lily. Kneel at one
// and she speaks.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM, FANE = G.LEVELS.length;

  // ---- the look of the place: a dawn that never quite comes
  Object.assign(G.LOOKS, {
    bettany: { soft: 1, skin: '#b5a99a', body: '#5a4a3a', arm: '#5a4a3a', leg: '#3a2e24', helm: 'hood', helmCol: '#8a7a5a', hair: '#d8d0c4' },
  });
  Object.assign(G.ENEMIES, {
    sentinel: {
      name: 'Faceless Sentinel', hp: 150, limbHp: 60, speed: 44, ichor: 110, aggro: 340, weapon: 'sword', wlen: 44, scale: 1.2, poise: true,
      look: { skin: '#a8a090', body: '#8a8478', trim: '#c9a13b', arm: '#9a9488', leg: '#6a6458', helm: 'helm', helmCol: '#b0a898', plume: '#c9a13b', eye: '#ffd070' },
      attacks: [
        { wind: 0.7, active: 0.14, rec: 0.7, dmg: 26, reach: 96, lunge: 140, anim: A.chop },
        { wind: 0.9, active: 0.16, rec: 0.85, dmg: 34, reach: 110, trigger: 160, min: 60, lunge: 300, anim: A.thrust },
      ],
    },
    dawnmoth: {
      name: 'Dawn-Moth', model: 'moth', fly: true, hp: 40, limbHp: 16, speed: 110, ichor: 36, aggro: 400, stop: 120, weapon: 'none', height: 34, limbs: ['head', 'armF', 'armB'],
      flyAlt: 140, diveAlt: 60, bob: 12,
      look: { skin: '#e8c880', body: '#a07a40', arm: '#e8c880', leg: '#a07a40', helm: 'none', eye: '#ffffff' },
      attacks: [{ wind: 0.45, active: 0.25, rec: 0.8, dmg: 12, reach: 60, trigger: 200, min: 60, lunge: 560, anim: A.claw }],
    },
    oathwarden: {
      name: 'The Oathwarden', boss: true, hp: 600, limbHp: 160, speed: 52, ichor: 1300, aggro: 9999, weapon: 'greatsword', wlen: 70, scale: 1.65, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'THE VOW IS KEPT',
      summon: { type: 'sentinel', at: [0.6, 0.3], n: 1, text: 'THE STATUES STEP DOWN' },
      look: { skin: '#b8b0a0', body: '#a09888', trim: '#e0b850', arm: '#a8a090', leg: '#7a7468', helm: 'helm', helmCol: '#c0b8a8', plume: '#e0b850', cape: '#8a6a30', eye: '#ffe080' },
      attacks: [
        { wind: 0.65, active: 0.15, rec: 0.7, dmg: 32, reach: 130, lunge: 160, anim: A.chop },
        { wind: 0.6, active: 0.15, rec: 0.7, dmg: 30, reach: 130, lunge: 150, anim: A.rise },
        { wind: 1.0, active: 0.16, rec: 1.0, dmg: 48, reach: 150, lunge: 240, anim: A.slam },
        { wind: 0.8, active: 0.15, rec: 0.8, dmg: 36, reach: 150, trigger: 300, min: 130, lunge: 600, anim: A.thrust },
      ],
    },
  });
  G.WEAPONS.dawnbrand = {
    name: 'Dawnbrand', draw: 'sword', len: 48, bleed: 16,
    light: [
      { wind: 0.17, active: 0.11, rec: 0.3, dmg: 21, st: 13, reach: 80, lunge: 140, sever: 1.1, anim: A.chop },
      { wind: 0.17, active: 0.11, rec: 0.32, dmg: 23, st: 14, reach: 80, lunge: 140, sever: 1.1, anim: A.rise },
      { wind: 0.22, active: 0.12, rec: 0.42, dmg: 30, st: 16, reach: 88, lunge: 200, sever: 1.3, anim: A.thrust },
    ],
    heavy: { wind: 0.44, active: 0.13, rec: 0.48, dmg: 54, st: 30, reach: 94, lunge: 220, sever: 2.2, poiseBreak: true, anim: A.slam },
  };
  if (G.WEAPON_ARTS) G.WEAPON_ARTS.dawnbrand = { name: 'Dawnfire', how: 'Every guard-breaking blow sears for 40% more, and lights the knight gold.' };
  G.ICON_NAMES.push('The Saint at Daybreak', 'The Saint and the Faceless Statue');
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
  G.BESTIARY_EXTRA.foes.push(
    ['sentinel', 'Stone knights from the Fane\'s colonnade, their faces worn smooth. They still keep their posts.', 'Slow, and they do not flinch. Strike after the swing.'],
    ['dawnmoth', 'Moths the colour of first light. They hatch in the Fane and never fly toward lamps; only east.', 'Hit them as they dive.'],
  );
  G.BESTIARY_EXTRA.bosses.push(['oathwarden', 'The great statue at the heart of the Fane. Whoever swore before it, it holds to the oath.', 'Its slam is slow and enormous. More statues step down as it weakens.']);
  G.BESTIARY_EXTRA.people.push({ id: 'bettany', name: 'Old Bettany', look: 'bettany', text: 'A hermit who sweeps the Fane of the Dawn. She does not know whose house it was. Nobody does.' });

  // ---- the way in: a fallen bridge at the very start of the road
  G.LEVELS[0].passages = (G.LEVELS[0].passages || []).concat([{ x: 64, to: FANE, at: 120, needs: 'dj', label: 'Cross the gorge to the west',
    shut: 'The old bridge lies broken in the gorge. There is no way across. Not yet',
    wist: 'West? There is nothing west but the sea and some old stones. Nobody goes west.',
    slides: ['You cross where the bridge was, on air and nerve.\n\nOn the far side the road climbs to the cliff top, and there, facing the sea and the east at once, stands a temple older than Morrowmere.\n\nThe sky over it is the colour of a dawn that has not quite come.'] }]);

  G.LEVELS.push({
    name: 'The Fane of the Dawn', chapter: 'West of the Gallows Road', theme: 'dawn', length: 4400, seed: 221,
    back: { to: 0, at: 130 }, backLabel: 'Cross back over the gorge',
    shrines: [240, 2300],
    statues: [{ x: 1000 }, { x: 2050 }, { x: 3300, big: true }],
    enemies: [['dawnmoth', 600], ['sentinel', 820], ['dawnmoth', 1250], ['dawnmoth', 1290], ['sentinel', 1600], ['sentinel', 1900], ['dawnmoth', 2600], ['sentinel', 2800], ['dawnmoth', 3050], ['dawnmoth', 3100], ['sentinel', 3200, 'unfair']],
    npcs: [{ id: 'bettany', x: 2450, name: 'Old Bettany', look: 'bettany', pose: 'stand', essential: true,
      lines: [
        ['Old Bettany', 'Mind the dust, I have just done that bit. I have been doing that bit for forty years.'],
        ['Old Bettany', 'Whose house? Nobody knows. The statues had faces once. The sea took them, or the sun. Every one is a woman, and every one is looking east.'],
        ['Old Bettany', 'My grandmother said that people came here to swear. Marriages. Vows. Oaths of service. And the stones remembered, and held them to it.'],
        ['Misery', 'Oh, I do not like it here. It is all very... bright. And watchful.'],
        ['Old Bettany', 'The big statue at the end still stands. It moves, if you go near. It thinks you have come to break an oath.'],
      ],
      repeat: [['Old Bettany', 'Mind the dust. Mind the statue at the end. Mind your oaths.']] }],
    lore: [
      { x: 700, title: 'Inscription on the Lintel', text: 'WHAT IS SWORN BEFORE THE DAWN, THE DAWN WILL KEEP.\n\nThe name of the one it was carved for has been chiselled away, carefully, letter by letter.' },
      { x: 1750, title: 'Votive Tablet', text: 'A small clay tablet, one of hundreds stacked in a niche:\n\nI, Aldric of the Gallows Road, swear before the Dawn that I will come home to Marren.\n\nOn the back, in another hand, much later: he came home. He was not himself. But he came home.' },
      { x: 3500, title: 'The Keepers\' Rule', text: 'The Dawn keeps the vow. The Dawn does not ask whether you still wish it kept.\n\nWeigh your words before you speak them here. She will hold you to every one.' },
    ],
    items: [{ x: 4120, weapon: 'dawnbrand', needs: 'boss_oathwarden_dead' }, { x: 1150, alt: 140, relic: 1, relicName: 'Relic of the First Light' }, { x: 3980, relic: 1, relicName: 'Relic of the Kept Vow', needs: 'boss_oathwarden_dead' }, { x: 1550, icon: 1, gate: 'veil' }, { x: 2860, alt: 72, icon: 1 }, { x: 2150, cache: 320 }],
    platforms: [{ x: 1080, w: 140, h: 72 }, { x: 1130, w: 70, h: 140 }, { x: 2800, w: 120, h: 72 }],
    pits: [{ x: 1350, w: 70 }, { x: 2650, w: 68 }],
    boss: {
      type: 'oathwarden', gate: 3600, x: 3920, end: 4200,
      intro: [['The Oathwarden', '...SWORN.'], ['Misery', 'It is a statue. It is a STATUE and it is talking. I want to go home.'], ['The Oathwarden', 'WHAT WAS SWORN. WILL BE KEPT.']],
      retry: [['The Oathwarden', 'KEPT.']],
      lastWords: [['The Oathwarden', 'KEPT...'], ['Misery', 'Break it. Break every bit of it.']],
      spare: { kind: 'yield', lines: [['Knight', 'I have broken no oath. Stand down.'], ['The Oathwarden', '...KEPT.'], ['The Oathwarden', 'It lowers its great sword, turns to face the east, and is stone again.']] },
    },
  });

  // ---- the dawn: a pale gold horizon, broken columns, a sun that never clears the sea
  // her first words there
  if (G.voice) {
    const prev = G.voice.place.bind(G.voice);
    G.voice.place = idx => (idx === FANE ? G.voice.queue('lv' + idx, 'My house. You came home to me, little knight.') : prev(idx));
  }

  // ---- statues of Aurelle: robed, a sun at her back, the face worn smooth
  G.drawStatue = (ctx, x, gy, t, big, lit) => {
    const k = big ? 1.6 : 1, h = 120 * k;
    const glow = ctx.createRadialGradient(x, gy - h * 0.7, 4, x, gy - h * 0.7, 80 * k); glow.addColorStop(0, `rgba(255,220,140,${lit ? 0.5 : 0.18})`); glow.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = glow; ctx.fillRect(x - 80 * k, gy - h * 0.7 - 80 * k, 160 * k, 160 * k);
    // plinth
    ctx.fillStyle = '#4a4440'; ctx.fillRect(x - 22 * k, gy - 16 * k, 44 * k, 16 * k); ctx.fillStyle = '#6a625a'; ctx.fillRect(x - 24 * k, gy - 18 * k, 48 * k, 4 * k);
    // the sun at her back
    ctx.save(); ctx.translate(x, gy - h * 0.82);
    ctx.fillStyle = lit ? '#e8c060' : '#9a8450'; ctx.beginPath(); ctx.arc(0, 0, 18 * k, 0, 7); ctx.fill();
    for (let r = 0; r < 12; r++) { ctx.save(); ctx.rotate(r * Math.PI / 6 + (lit ? t * 0.2 : 0)); ctx.fillRect(-1.5 * k, -30 * k, 3 * k, 10 * k); ctx.restore(); }
    ctx.restore();
    // robed figure
    const S = '#b8b0a2', D = '#8a8274', L = '#d8d0c2';
    ctx.fillStyle = S; ctx.beginPath(); ctx.moveTo(x - 18 * k, gy - 18 * k); ctx.lineTo(x - 9 * k, gy - h * 0.62); ctx.lineTo(x + 9 * k, gy - h * 0.62); ctx.lineTo(x + 18 * k, gy - 18 * k); ctx.fill();
    ctx.fillStyle = D; for (let f = -2; f <= 2; f++) ctx.fillRect(x + f * 6 * k, gy - h * 0.55, 2 * k, h * 0.36);   // folds
    ctx.fillStyle = S; ctx.fillRect(x - 11 * k, gy - h * 0.72, 22 * k, 14 * k);                                       // shoulders
    ctx.fillStyle = L; ctx.fillRect(x - 6 * k, gy - h * 0.66, 12 * k, 12 * k);                                        // hands at her breast
    ctx.fillStyle = S; ctx.beginPath(); ctx.arc(x, gy - h * 0.8, 8 * k, 0, 7); ctx.fill();                            // head, under a veil
    ctx.fillStyle = D; ctx.beginPath(); ctx.moveTo(x - 10 * k, gy - h * 0.8); ctx.quadraticCurveTo(x, gy - h * 0.92, x + 10 * k, gy - h * 0.8); ctx.lineTo(x + 12 * k, gy - h * 0.68); ctx.lineTo(x - 12 * k, gy - h * 0.68); ctx.fill();
    ctx.fillStyle = '#a8a092'; ctx.fillRect(x - 5 * k, gy - h * 0.82, 10 * k, 7 * k);                                // the face, worn smooth
    ctx.fillStyle = 'rgba(60,50,40,0.5)'; ctx.fillRect(x - 4 * k, gy - h * 0.79, 8 * k, 1);
  };
  // the statues of the world: in the Fane, and one beside the Chapel of the Lily
  G.LEVELS[1].statues = (G.LEVELS[1].statues || []).concat([{ x: 2640 }]);
  const KNEEL = ['I am here. I have always been here.', 'Rest your hands, little knight. They have done enough today.', 'The vow is kept. Every step of it.', 'They do not know my face any more. You know my voice. That is enough.', 'East. Always east. I will tell you when to stop.'];
  for (const L of G.LEVELS) if (L.statues) {
    L.hooks = (L.hooks || []).concat(L.statues.map(st => ({ x: st.x, r: 46, label: 'Kneel before the faceless statue', fn: g => {
      const p = g.player; p.vx = 0; p.set('sit'); p.t = 0.6; G.sfx('bell');
      const key = 'kneel_' + g.levelIdx + '_' + st.x, first = !g.flags[key]; g.flags[key] = 1;
      if (!g.flags.knelt) { g.flags.knelt = 1; G.ui.dialogue([['Aurelle', 'You found my face, or what is left of it. They wore it away, little knight. All of them forgot me. Except you.'], ['Aurelle', 'Kneel here whenever you need me. I will lift you.']], () => {}); G.voice.flash(); }
      else G.voice.say(G.pick(KNEEL), 0.3);
      if (!g.kneelHealed) { g.kneelHealed = true; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.25); G.sfx('heal'); G.text(p.x, G.GROUND - 110, 'Her warmth', '#ffe08a', 14); }   // once between rests
      st.litT = 3; g.save();
    } })));
  }
})();
