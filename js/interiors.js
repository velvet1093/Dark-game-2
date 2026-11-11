'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — buildings you can walk into. Each interior is a small room with
// its own furniture, people, enemies, notes and treasure. A door in an area's
// `doors` list leads to one; the area outside is kept as it was while you are in.
//
// Interior fields: name, area (index into G.LEVELS), style (wood | plaster |
// stone), length, entry (where you stand on arrival), furniture [[kind, x, opts]],
// and the usual level lists: npcs, enemies, items, platforms, lore.
// ---------------------------------------------------------------------------
G.INTERIORS = {
  cottage: {
    name: "The Cooper's Cottage", area: 0, style: 'wood', facade: 'cottage', length: 1000, entry: 120,
    furniture: [['window', 360], ['window', 700], ['bed', 230], ['cradle', 330], ['table', 470], ['chair', 430], ['chair', 560], ['shelfdeco', 640], ['hearth', 830, { cold: true }], ['barrel', 930], ['barrel', 965]],
    platforms: [{ x: 600, w: 110, h: 72 }],
    enemies: [['wretch', 760]],
    items: [{ x: 655, alt: 72, icon: 1 }, { x: 905, cache: 90 }],
    lore: [{ x: 470, title: 'Note on the Table', text: "Tam —\n\nI have barred the door from outside. If you can still read this, you are still you.\n\nSleep if you can. I am going for the Sisters. I will come back with lily-water and we will all laugh about this.\n\n— Ada" }],
    npcs: [],
  },
  inn: {
    name: 'The Drowned Lamb', area: 1, style: 'plaster', facade: 'inn', length: 1300, entry: 120,
    furniture: [['hearth', 260], ['window', 480], ['window', 760], ['table', 380], ['chair', 340], ['chair', 420], ['table', 620], ['chair', 580], ['bar', 880, { w: 300 }], ['barrel', 1230], ['barrel', 1262]],
    platforms: [{ x: 790, w: 70, h: 70 }, { x: 880, w: 380, h: 140 }],
    enemies: [],
    items: [{ x: 1220, alt: 140, icon: 1 }],
    lore: [{ x: 300, title: 'Chalked Under a Table', text: "A child's rhyme, in a child's hand:\n\nWhite caps in a ring where the fen begins,\nstand very still, and they let you in.\nBring nothing that laughs when the red runs thin." },
      { x: 620, title: 'Tally Scratched in the Table', text: "Nights without sleep, by room:\n\nRoom 1  IIII\nRoom 2  IIII IIII\nRoom 3  I  (gone)\nRoom 4  IIII IIII IIII IIII\n\nRoom 4 is the Captain's." }],
    npcs: [
      { id: 'maren', x: 1000, name: 'Maren the Innkeeper', look: 'innkeep', pose: 'stand', essential: true,
        lines: [
          ['Maren', "Bed's a penny, ale's two, and nobody sleeps anyway. You lie there listening for someone in the next room who has stopped breathing right."],
          ['Maren', 'They do not sleep, the infected. Did you know? That is how you tell, early. Before the eyes. My husband paced for three nights. I told myself it was his back.'],
        ],
        repeat: [['Maren', 'Get some rest while you can still want it. The loft is warmer, if you can get up there.']] },
      { id: 'hob', x: 400, name: 'Hob the Drover', look: 'peddler', pose: 'kneel', essential: true,
        lines: [['Hob', 'Forty head of cattle I drove in. The Captain let the cattle through the gate and turned my brother back. Cattle do not weep, see.'], ['Hob', 'I drink to him every night. He would want me to pay for it, so I do not.']],
        repeat: [['Hob', 'To my brother. Who was not weeping. Only crying.']] },
      { id: 'nell', x: 620, name: 'Nell', look: 'widow', pose: 'kneel', essential: true,
        lines: [['Nell', 'Sit, if you like. Nobody sits here. It was my husband\'s seat, and the room thinks he will want it back.']],
        repeat: [['Nell', 'He will want it back. That is what frightens me.']] },
    ],
  },
  forge: {
    name: "Dunstan's Forge", area: 1, style: 'stone', facade: 'forge', length: 1000, entry: 120,
    furniture: [['rack', 300], ['window', 430], ['anvil', 560], ['quench', 650], ['furnace', 800], ['barrel', 940]],
    platforms: [], enemies: [], items: [], lore: [],
    npcs: [
      { id: 'dunstan', x: 600, name: 'Dunstan the Smith', look: 'smith', pose: 'stand', essential: true, shop: 'forge',
        lines: [
          ['Dunstan', 'That is a crusader blade. Good steel, bad edge. Seven years of salt air.'],
          ['Dunstan', 'Bring me ichor and I will fold it into the steel. Every weapon you carry, three times over. It holds an edge like nothing else.'],
        ],
        repeat: [['Dunstan', 'Keep it oiled. Blood is worse than salt.']] },
    ],
  },
  hovel: {
    name: "The Eel-Catcher's Hovel", area: 2, style: 'wood', facade: 'hovel', flooded: true, length: 1000, entry: 120,
    furniture: [['nets', 300], ['cot', 260], ['window', 430], ['table', 540], ['traps', 660], ['hearth', 840, { cold: true }]],
    platforms: [{ x: 780, w: 180, h: 72 }],
    enemies: [['wretch', 560], ['hound', 840]],
    items: [{ x: 900, alt: 72, cache: 200 }],
    lore: [{ x: 540, title: "Slate by the Door", text: "eels gone\nfrogs gone\nherons gone\n\nthe weeping ones do not eat. that is how you know which is which, at the end. they do not eat and they do not sleep and they do not stop" }],
    npcs: [],
  },
  mill: {
    name: 'The Old Mill', area: 3, style: 'wood', facade: 'mill', length: 1300, entry: 120,
    furniture: [['heightmarks', 150], ['hearth', 270, { cold: true }], ['window', 520], ['table', 420], ['chair', 380], ['chair', 470], ['window', 760], ['sacks', 850], ['millstone', 1000], ['bed', 1150, { loft: true }]],
    platforms: [{ x: 820, w: 80, h: 70 }, { x: 920, w: 340, h: 140 }],
    enemies: [],
    items: [{ x: 1230, alt: 140, icon: 1 }],
    lore: [
      { x: 150, title: 'Marks on the Doorframe', text: 'Two rows of notches, cut with a knife.\n\n— 6\nY. — 4\n— 9\nY. — 7\n— 12\nY. — 10\n— 16  (the day he marched)\n\nThe letters on the first row have been gouged out, one by one, the way the Battalion priests ask a family to do at the muster.\n\nAfter that, only one row. It goes on for a long time.\n\nY. — 20\nY. — 22\nY. — 23' },
      { x: 420, title: "Ysolde's Ledger", text: "Flour, four sacks. Owed by the Tanners, two pence.\nFlour, two sacks. Paid in eggs.\nFlour, one sack. Not paid. They are gone.\n\nBrother — the wheel still turns. I keep it turning so the house sounds like someone lives here. I still say your name to it, every night, so that one of us remembers.\n\nIf you come home, the key is where Mother kept it." },
    ],
    npcs: [],
  },
  sacristy: {
    name: 'The Sacristy', area: 4, style: 'stone', facade: 'sacristy', length: 1100, entry: 120,
    furniture: [['vestments', 300], ['glass', 480], ['altar', 660], ['candles', 560], ['candles', 760], ['shelfdeco', 940]],
    platforms: [{ x: 400, w: 120, h: 72 }],
    enemies: [['templar', 720], ['flagellant', 900]],
    items: [{ x: 455, alt: 72, icon: 1 }, { x: 1000, cache: 350 }],
    lore: [{ x: 660, title: 'Seven Knives', text: "Laid out on a cloth, each blessed and labelled in the Bishop's hand.\n\nFOR THE SPRING. FOR THE SOURCE. FOR THE WELL. FOR HER. FOR MERCY. FOR THE KINGDOM.\n\nThe seventh is unlabelled. It is the only one that has been used." }],
    npcs: [],
  },
  // Not behind any door. Stand still inside the ring of white caps at the edge of the fen.
  court: {
    name: 'The Lantern Court', area: 2, style: 'glade', length: 1100, entry: 120, music: 'court', noMisery: true, exitLabel: 'Leave the Court',
    furniture: [], platforms: [], enemies: [],
    items: [{ x: 1000, icon: 1 }],
    lore: [],
    npcs: [
      { id: 'thimble', x: 330, sitH: 78, name: 'Thimble', fairy: 'thimble', look: 'nun', essential: true,
        lines: [['Thimble', "Ooh, a real knight! Can I sit on your head? Mercy does, doesn't she. I can tell. You've a dent."], ['Thimble', "Don't tell the Queen I said her old name. Don't tell Mercy either. Don't tell anyone anything. That's the rule."]],
        repeat: [['Thimble', 'Your head looks very comfortable. I am only saying.']] },
      { id: 'bramble', x: 480, sitH: 108, name: 'Bramble', fairy: 'bramble', look: 'nun', essential: true,
        lines: [['Bramble', 'Mind the moss, big feet. Took me a hundred years to grow it.'], ['Bramble', 'We used to dance out in the fen. Now we hide in it. Your kind made the weeping. Our kind only has to watch it. Some of us got to liking that.']],
        repeat: [['Bramble', 'Moss. Feet. We have discussed this.']] },
      { id: 'elowen', x: 640, name: 'Elowen, Queen of the Lantern Court', fairy: 'queen', look: 'nun', essential: true, gift: 'favour',
        lines: [
          ['Elowen', 'A knight with no name, and clear eyes. Sit, if you can sit in all that iron. You found the ring, so you are welcome here.'],
          ['Elowen', 'You came without her. Good. She would not have been let in, and she knows it.'],
          ['Knight', 'The fairy who follows me.'],
          ['Elowen', 'We called her Mercy, once. She was the one of us who sat with the dying, so that no one went alone. She was very good at it.'],
          ['Elowen', 'Then she came to love the watching more than the easing. We took her name back. She chose the new one herself, and she has worn it well.'],
          ['Elowen', 'She cannot hurt you with her hands. Only with your own despair. Do not give her any.'],
          ['Elowen', 'Take our favour. It will not cure you. It will make the sickness walk more slowly through you. That is all kindness ever does.'],
        ],
        repeat: [['Elowen', 'Rest a while, if you need to. Nothing weeps inside the ring.']] },
      { id: 'dew', x: 800, sitH: 92, name: 'Dew', fairy: 'dew', look: 'nun', essential: true,
        lines: [['Dew', 'Is it true the bells never stop, up on the hill? ...I thought so. I can hear them in the pool.'], ['Dew', 'The Saint used to come here, when she was small. She left a little picture by the water. We kept it for her. You may take it to her, if you like.']],
        repeat: [['Dew', 'By the water. We kept it dry.']] },
    ],
  },
};
// the doors that lead into them, on the street outside
G.LEVELS[0].doors = [{ x: 1220, to: 'cottage' }];
G.LEVELS[1].doors = [{ x: 1190, to: 'inn' }, { x: 1850, to: 'forge' }];
G.LEVELS[2].doors = [{ x: 2050, to: 'hovel' }];
G.LEVELS[2].secret = { x: 420, to: 'court' };   // the ring of white caps where the fen begins
G.LEVELS[3].doors = [{ x: 4120, to: 'mill' }];
G.LEVELS[4].doors = [{ x: 2200, to: 'sacristy' }];
// Maren and Dunstan now keep to their own houses
G.LEVELS[1].npcs = G.LEVELS[1].npcs.filter(n => n.id !== 'maren' && n.id !== 'dunstan');
for (const B of Object.values(G.INTERIORS)) { B.interior = true; B.chapter = G.LEVELS[B.area].name; B.theme = B.style === 'stone' ? 'cathedral' : 'interior'; B._theme = { indoor: true, weather: 'dust' }; B.shrines = []; }
G.ICON_NAMES.push('The Saint by the Moon Pool', 'The Saint in the Doorway', 'The Saint Who Stayed', 'The Saint and the Wheel', 'The Saint among Knives');

// ---------------------------------------------------------------------------
// Drawing: the room itself (into the backdrop buffer), and each building's
// front on the street.
// ---------------------------------------------------------------------------
(() => {
  const STYLE = {
    wood: { wall: '#1d1311', line: '#120b0a', lite: '#2c1d18', floor: '#170f0c', floorLine: '#0e0807' },
    plaster: { wall: '#272022', line: '#150d0c', lite: '#342a2c', floor: '#1a110e', floorLine: '#0e0807' },
    stone: { wall: '#1c1a1e', line: '#121014', lite: '#2a272c', floor: '#141216', floorLine: '#0a090b' },
  };
  const glow = (c, x, y, r, col) => { const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  const FURN = {
    window(c, x, gy, o, t) {
      R(c, x - 34, gy - 218, 68, 78, '#0c0809'); R(c, x - 30, gy - 214, 60, 70, '#1c2438');
      R(c, x - 30, gy - 214, 60, 12, '#2c3a58'); R(c, x - 1, gy - 214, 2, 70, '#0c0809'); R(c, x - 30, gy - 181, 60, 2, '#0c0809'); R(c, x - 38, gy - 142, 76, 6, '#2a1c18');
      c.fillStyle = 'rgba(150,170,220,0.07)'; c.beginPath(); c.moveTo(x - 30, gy - 144); c.lineTo(x + 30, gy - 144); c.lineTo(x + 110, gy); c.lineTo(x + 20, gy); c.fill();   // moonlight on the floor
    },
    glass(c, x, gy, o, t) {   // a small stained window
      R(c, x - 30, gy - 230, 60, 96, '#0c0809');
      const pal = ['#6a0d18', '#8a1420', '#2a1440', '#7a3a10'];
      for (let r = 0; r < 7; r++) for (let k = 0; k < 4; k++) R(c, x - 26 + k * 13, gy - 226 + r * 13, 12, 12, pal[(r * 3 + k) % 4]);
      c.fillStyle = 'rgba(200,60,80,0.07)'; c.beginPath(); c.moveTo(x - 26, gy - 134); c.lineTo(x + 26, gy - 134); c.lineTo(x + 100, gy); c.lineTo(x + 10, gy); c.fill();
    },
    hearth(c, x, gy, o, t) {
      R(c, x - 62, gy - 120, 124, 120, '#2a2224'); R(c, x - 70, gy - 128, 140, 12, '#3a3034');
      for (let r = 0; r < 120; r += 14) R(c, x - 62, gy - 120 + r, 124, 2, '#1c1618');
      R(c, x - 36, gy - 64, 72, 64, '#060304');
      if (o && o.cold) { R(c, x - 28, gy - 8, 56, 8, '#3a3436'); R(c, x - 10, gy - 30, 20, 16, '#151215'); R(c, x - 2, gy - 42, 4, 12, '#151215'); return; }   // ash and a hanging pot
      glow(c, x, gy - 30, 230, 'rgba(255,140,60,0.32)');
      for (let k = 0; k < 7; k++) { const h = 14 + ((k * 13 + Math.floor(t * 12)) % 18); R(c, x - 26 + k * 8, gy - 8 - h, 6, h, k % 2 ? '#ff9a3a' : '#e0582a'); }
      R(c, x - 30, gy - 8, 60, 8, '#4a1a10');
    },
    table(c, x, gy) { R(c, x - 55, gy - 48, 110, 8, '#3a261a'); R(c, x - 55, gy - 48, 110, 2, '#5a3c28'); R(c, x - 48, gy - 40, 6, 40, '#2a1a12'); R(c, x + 42, gy - 40, 6, 40, '#2a1a12'); R(c, x - 20, gy - 58, 8, 10, '#5a5048'); R(c, x + 18, gy - 54, 10, 6, '#3a3430'); },
    chair(c, x, gy) { R(c, x - 14, gy - 30, 28, 5, '#3a261a'); R(c, x - 14, gy - 25, 4, 25, '#2a1a12'); R(c, x + 10, gy - 25, 4, 25, '#2a1a12'); R(c, x + 10, gy - 66, 4, 36, '#2a1a12'); R(c, x + 2, gy - 60, 10, 3, '#3a261a'); },
    bed(c, x, gy, o) { const y = o && o.loft ? gy - 140 : gy; R(c, x - 70, y - 30, 140, 10, '#3a261a'); R(c, x - 70, y - 50, 8, 50, '#2a1a12'); R(c, x + 62, y - 40, 8, 40, '#2a1a12'); R(c, x - 62, y - 40, 124, 10, '#4a1416'); R(c, x - 60, y - 44, 30, 8, '#8a8070'); R(c, x + 10, y - 32, 18, 4, '#2a0608'); },
    cradle(c, x, gy) { c.fillStyle = '#3a261a'; c.beginPath(); c.ellipse(x, gy - 22, 30, 14, 0, 0, Math.PI); c.fill(); R(c, x - 30, gy - 26, 60, 4, '#4a3020'); R(c, x - 24, gy - 6, 4, 6, '#2a1a12'); R(c, x + 20, gy - 6, 4, 6, '#2a1a12'); },
    shelfdeco(c, x, gy) { R(c, x - 60, gy - 160, 120, 6, '#3a261a'); for (let k = 0; k < 5; k++) R(c, x - 52 + k * 22, gy - 178 + (k % 2) * 4, 12, 18 - (k % 2) * 4, ['#4a4048', '#3a2a20', '#5a3a2a', '#2a3a3a', '#4a2a2a'][k]); },
    barrel(c, x, gy) { R(c, x - 17, gy - 48, 34, 48, '#3a2618'); R(c, x - 17, gy - 48, 34, 3, '#5a3c28'); R(c, x - 17, gy - 36, 34, 3, '#4a4248'); R(c, x - 17, gy - 14, 34, 3, '#4a4248'); R(c, x + 10, gy - 46, 3, 44, '#2a1a12'); },
    bar(c, x, gy, o) {
      const w = (o && o.w) || 260;
      R(c, x, gy - 64, w, 64, '#2e1e16'); R(c, x - 6, gy - 70, w + 12, 8, '#4a3020'); R(c, x - 6, gy - 70, w + 12, 2, '#6a4a30');
      for (let k = 20; k < w; k += 30) R(c, x + k, gy - 62, 2, 62, '#1e130e');
      R(c, x, gy - 190, w, 6, '#3a261a'); for (let k = 10; k < w; k += 18) R(c, x + k, gy - 210, 8, 20, ['#3a5a3a', '#5a2a2a', '#5a4a2a', '#2a3a5a'][(k / 18 | 0) % 4]);
    },
    anvil(c, x, gy) { R(c, x - 14, gy - 26, 28, 26, '#2a2624'); R(c, x - 34, gy - 44, 68, 18, '#5a5660'); R(c, x + 34, gy - 40, 16, 8, '#5a5660'); R(c, x - 34, gy - 44, 68, 3, '#8a8690'); R(c, x - 10, gy - 52, 30, 6, '#3a3640'); },
    quench(c, x, gy) { R(c, x - 22, gy - 34, 44, 34, '#3a2618'); R(c, x - 20, gy - 32, 40, 6, '#1a2a30'); R(c, x - 22, gy - 24, 44, 3, '#4a4248'); },
    furnace(c, x, gy, o, t) {
      R(c, x - 70, gy - 170, 140, 170, '#2a1a18'); for (let r = 0; r < 170; r += 12) { R(c, x - 70, gy - 170 + r, 140, 2, '#1a1010'); for (let k = (r / 12 & 1) * 14; k < 140; k += 28) R(c, x - 70 + k, gy - 170 + r, 2, 12, '#1a1010'); }
      R(c, x - 30, gy - 270, 60, 100, '#221614');
      glow(c, x, gy - 50, 240, `rgba(255,${110 + Math.sin(t * 6) * 20 | 0},40,0.36)`);
      R(c, x - 34, gy - 80, 68, 56, '#ff7a2a'); R(c, x - 26, gy - 72, 52, 40, '#ffc060'); R(c, x - 34, gy - 84, 68, 6, '#3a2420');
    },
    rack(c, x, gy) { R(c, x - 60, gy - 130, 120, 6, '#3a261a'); R(c, x - 60, gy - 40, 120, 6, '#3a261a'); for (let k = 0; k < 5; k++) { R(c, x - 50 + k * 24, gy - 150, 3, 112, '#8a8e98'); R(c, x - 54 + k * 24, gy - 54, 11, 3, '#c9a13b'); } R(c, x + 50, gy - 160, 4, 120, '#3a2618'); R(c, x + 46, gy - 160, 16, 20, '#7d808c'); },
    millstone(c, x, gy, o, t) {
      R(c, x - 70, gy - 40, 140, 40, '#2a1a12');
      c.save(); c.translate(x, gy - 110); c.rotate(t * 0.4);
      c.fillStyle = '#4a4246'; c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fill(); c.fillStyle = '#5a5258'; c.beginPath(); c.arc(0, 0, 50, 0, 7); c.fill();
      c.fillStyle = '#2a2428'; for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillRect(-2, 12, 4, 38); }
      c.fillStyle = '#1a1416'; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.restore();
    },
    sacks(c, x, gy) { for (let k = 0; k < 4; k++) { const sx = x - 40 + k * 26; c.fillStyle = k % 2 ? '#5a4a34' : '#6a5a40'; c.beginPath(); c.ellipse(sx, gy - 18, 15, 18, 0, 0, 7); c.fill(); R(c, sx - 4, gy - 38, 8, 4, '#3a2a1a'); } },
    nets(c, x, gy) { c.strokeStyle = '#3a4a3a'; c.lineWidth = 1.5; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x - 60 + k * 15, gy - 200); c.lineTo(x - 40 + k * 15, gy - 90); c.stroke(); c.beginPath(); c.moveTo(x - 60, gy - 200 + k * 14); c.lineTo(x + 60, gy - 196 + k * 14); c.stroke(); } },
    cot(c, x, gy) { R(c, x - 50, gy - 24, 100, 8, '#3a261a'); R(c, x - 46, gy - 30, 92, 6, '#3a3a2a'); R(c, x - 50, gy - 16, 4, 16, '#2a1a12'); R(c, x + 46, gy - 16, 4, 16, '#2a1a12'); },
    traps(c, x, gy) { for (let k = 0; k < 3; k++) { R(c, x - 40 + k * 30, gy - 30, 24, 30, '#2a2a20'); for (let q = 0; q < 4; q++) R(c, x - 38 + k * 30, gy - 28 + q * 7, 20, 1, '#4a4a3a'); } },
    heightmarks(c, x, gy) { R(c, x - 18, gy - 180, 6, 180, '#3a261a'); for (let k = 0; k < 10; k++) R(c, x - 18, gy - 60 - k * 10, k < 7 ? 12 : 8, 2, '#8a7a60'); },
    altar(c, x, gy) { R(c, x - 80, gy - 60, 160, 60, '#2a272c'); R(c, x - 86, gy - 66, 172, 8, '#3a363c'); R(c, x - 60, gy - 66, 120, 10, '#d8d0c0'); for (let k = 0; k < 7; k++) R(c, x - 54 + k * 18, gy - 72, 2, 10, k === 6 ? '#8f0810' : '#c6c8d0'); },
    candles(c, x, gy, o, t) { R(c, x - 2, gy - 80, 4, 80, '#3a3236'); R(c, x - 18, gy - 80, 36, 4, '#3a3236'); for (let i = -1; i <= 1; i++) { R(c, x + i * 15 - 2, gy - 94, 4, 14, '#d8d0c0'); glow(c, x + i * 15, gy - 98, 40, 'rgba(255,190,110,0.22)'); R(c, x + i * 15 - 2, gy - 102 + Math.sin(t * 9 + i) * 1, 4, 6, '#ffb347'); } },
    vestments(c, x, gy) { R(c, x - 70, gy - 200, 140, 5, '#3a261a'); for (let k = 0; k < 4; k++) { const vx = x - 56 + k * 36; R(c, vx, gy - 195, 28, 110, ['#3a0a10', '#d8d0c0', '#1a1418', '#4a3a10'][k]); R(c, vx + 12, gy - 200, 4, 8, '#5a5660'); } },
  };

  // The Lantern Court: a moonlit clearing, giant glowing caps, a ring of light, a still pool.
  const drawGlade = (c, B, cam, t) => {
    const W = G.W, H = G.H, gy = G.GROUND;
    const sky = c.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#070818'); sky.addColorStop(0.7, '#141a34'); sky.addColorStop(1, '#1c2a3a');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { const sx = (i * 173.3 - cam * 0.1) % W, sy = (i * 47.1) % (gy - 160); c.fillStyle = `rgba(230,235,255,${0.25 + (i % 4) * 0.12 + Math.sin(t * 2 + i) * 0.08})`; c.fillRect(Math.round(((sx + W) % W) / 2) * 2, Math.round(sy / 2) * 2, 2, 2); }
    const mx = 760 - cam * 0.15; glow(c, mx, 120, 220, 'rgba(200,215,255,0.22)'); R(c, 0, 0, 0, 0, '#000'); c.fillStyle = '#e8ecf8'; c.beginPath(); c.arc(mx, 120, 46, 0, 7); c.fill(); c.fillStyle = 'rgba(180,190,220,0.5)'; c.beginPath(); c.arc(mx - 12, 110, 10, 0, 7); c.arc(mx + 16, 132, 7, 0, 7); c.fill();
    c.save(); c.translate(-cam, 0);
    // a wall of old trees around the clearing, their canopy closing overhead
    for (let x = -60; x < B.length + 80; x += 130) { const h = Math.imul(x + 999, 2654435761) >>> 0; c.fillStyle = '#060a10'; c.fillRect(x + (h % 30), 0, 26 + h % 16, gy); c.beginPath(); c.ellipse(x + 20, 30 + (h % 40), 110, 60, 0, 0, 7); c.fill(); }
    // ground: deep moss, pale flowers
    R(c, 0, gy - 3, B.length, H - gy + 3, '#0c1810'); R(c, 0, gy - 3, B.length, 3, '#2a4a2a');
    for (let x = 0; x < B.length; x += 9) { const h = Math.imul(x + 7, 2654435761) >>> 0; if (h % 3 === 0) R(c, x, gy - 2 - h % 6, 2, 2 + h % 6, '#1e3a1e'); if (h % 23 === 0) R(c, x, gy - 6, 2, 2, h % 2 ? '#e8ecf8' : '#a8c8f0'); }
    // giant caps, glowing, where the Court sits
    for (const n of B.npcs) if (n.sitH) {
      const x = n.x, h = n.sitH - 8, col = { thimble: ['#c87090', '255,170,200'], bramble: ['#5a9a4a', '170,230,150'], dew: ['#6aa8d0', '170,220,255'] }[n.fairy];
      glow(c, x, gy - h, 110, `rgba(${col[1]},0.22)`);
      R(c, x - 6, gy - h, 12, h, '#d8d0c0'); R(c, x - 6, gy - h, 3, h, '#a8a090');
      c.fillStyle = col[0]; c.beginPath(); c.ellipse(x, gy - h, 34, 14, 0, Math.PI, 0); c.fill(); R(c, x - 34, gy - h - 1, 68, 3, '#1a1416');
      c.fillStyle = `rgba(${col[1]},0.9)`; for (let k = -2; k <= 2; k++) c.fillRect(x + k * 11 - 2, gy - h - 8 - (k & 1) * 3, 4, 3);
    }
    // the ring of light, and the little white caps that make it
    glow(c, 640, gy - 20, 170, 'rgba(255,235,170,0.2)');
    c.strokeStyle = `rgba(255,240,190,${0.35 + Math.sin(t * 1.5) * 0.08})`; c.lineWidth = 3; c.beginPath(); c.ellipse(640, gy + 10, 110, 16, 0, 0, 7); c.stroke();
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, x = 640 + Math.cos(a) * 110, y = gy + 10 + Math.sin(a) * 16; R(c, x - 1, y - 6, 3, 6, '#d8d0c0'); R(c, x - 4, y - 9, 9, 4, '#f4f0e8'); }
    // the moon pool, and what was left beside it
    c.fillStyle = '#0a1830'; c.beginPath(); c.ellipse(920, gy + 14, 70, 13, 0, 0, 7); c.fill();
    c.fillStyle = `rgba(220,230,255,${0.55 + Math.sin(t * 1.2) * 0.1})`; c.beginPath(); c.ellipse(912, gy + 13, 14, 4, 0, 0, 7); c.fill();
    // fireflies
    for (let i = 0; i < 26; i++) { const fx = (i * 97 + Math.sin(t * 0.6 + i) * 40) % B.length, fy = gy - 40 - ((i * 53 + t * 9) % 220); if (Math.sin(t * 3 + i * 1.7) > -0.3) { c.fillStyle = 'rgba(230,255,150,0.9)'; c.fillRect(Math.round(fx / 2) * 2, Math.round(fy / 2) * 2, 2, 2); glow(c, fx, fy, 10, 'rgba(230,255,150,0.25)'); } }
    // the way out: a gap in the briars
    c.fillStyle = '#05080a'; c.beginPath(); c.moveTo(24, gy); c.quadraticCurveTo(62, gy - 150, 100, gy); c.fill();
    c.fillStyle = '#0e1a14'; c.beginPath(); c.moveTo(38, gy); c.quadraticCurveTo(62, gy - 118, 86, gy); c.fill();
    c.strokeStyle = '#1a2416'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(24 + k * 9, gy - 20 - (k * 13) % 60); c.lineTo(30 + k * 9, gy - 30 - (k * 13) % 60); c.stroke(); }
    R(c, -40, 0, 40, H, '#030405'); R(c, B.length, 0, 40, H, '#030405');
    c.restore();
  };

  G.drawInterior = (c, B, cam, t) => {
    if (B.style === 'glade') return drawGlade(c, B, cam, t);
    const S = STYLE[B.style] || STYLE.wood, W = G.W, H = G.H, gy = G.GROUND;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(-cam, 0);
    // back wall
    R(c, 0, 0, B.length, gy, S.wall);
    if (B.style === 'stone') for (let y = 40; y < gy; y += 22) { R(c, 0, y, B.length, 2, S.line); for (let x = (y / 22 & 1) * 22; x < B.length; x += 44) R(c, x, y, 2, 22, S.line); }
    else if (B.style === 'plaster') { for (let x = 0; x < B.length; x += 160) { R(c, x, 40, 10, gy - 40, '#150d0c'); } R(c, 0, gy - 110, B.length, 8, '#150d0c'); for (let x = 30; x < B.length; x += 97) R(c, x, 70 + (x % 7) * 9, 14, 2, S.lite); }
    else for (let x = 0; x < B.length; x += 22) { R(c, x, 34, 2, gy - 34, S.line); if ((x / 22) % 5 === 2) R(c, x + 6, 120 + (x % 60), 2, 10, S.lite); }
    // ceiling and beams
    R(c, 0, 0, B.length, 36, '#0c0708'); for (let x = 40; x < B.length; x += 150) { R(c, x, 0, 18, 44, '#1a100c'); R(c, x, 40, 18, 4, '#2a1a12'); }
    // floor
    R(c, 0, gy - 3, B.length, H - gy + 3, S.floor); R(c, 0, gy - 3, B.length, 2, S.lite);
    if (B.style === 'stone') for (let y = gy + 14; y < H; y += 18) { R(c, 0, y, B.length, 2, S.floorLine); for (let x = (y / 18 & 1) * 30; x < B.length; x += 60) R(c, x, y, 2, 18, S.floorLine); }
    else for (let y = gy + 10; y < H; y += 12) R(c, 0, y, B.length, 2, S.floorLine);
    for (const [kind, x, o] of B.furniture) FURN[kind] && FURN[kind](c, x, gy, o, t);
    if (B.flooded) {   // black fen water standing on the floor
      c.fillStyle = 'rgba(16,40,32,0.75)'; c.fillRect(0, gy - 8, B.length, H - gy + 8);
      c.fillStyle = 'rgba(150,200,175,0.3)'; for (let k = 0; k < 18; k++) c.fillRect(Math.round(((k * 61 + t * 14) % B.length) / 2) * 2, gy - 6 + (k % 3) * 8, 10, 2);
    }
    // the way out
    R(c, 30, gy - 112, 64, 112, '#0c0708'); R(c, 36, gy - 106, 52, 106, '#0a0c18'); R(c, 36, gy - 106, 6, 106, '#2a1a12');
    c.fillStyle = 'rgba(150,170,220,0.09)'; c.beginPath(); c.moveTo(42, gy); c.lineTo(88, gy); c.lineTo(170, gy + 40); c.lineTo(60, gy + 40); c.fill();
    // thick end walls
    R(c, -40, 0, 40, H, '#050304'); R(c, B.length, 0, 40, H, '#050304');
    c.restore();
  };

  // Building fronts on the street: drawn at the door, in the playfield.
  G.drawFacade = (c, d, t, marker) => {
    const B = G.INTERIORS[d.to], x = d.x, gy = G.GROUND, f = B.facade;
    const lit = (wx, wy, on) => { R(c, wx, wy, 22, 26, on ? `rgba(230,140,60,${0.82 + Math.sin(t * 3 + wx) * 0.08})` : '#05030a'); R(c, wx + 10, wy, 2, 26, '#120a0a'); R(c, wx, wy + 12, 22, 2, '#120a0a'); if (on) glow(c, wx + 11, wy + 13, 50, 'rgba(230,140,60,0.25)'); };
    if (f === 'sacristy') {
      R(c, x - 70, gy - 170, 140, 170, '#1c181c'); for (let r = 0; r < 170; r += 14) { R(c, x - 70, gy - 170 + r, 140, 2, '#121014'); for (let k = (r / 14 & 1) * 16; k < 140; k += 32) R(c, x - 70 + k, gy - 170 + r, 2, 14, '#121014'); }
      c.fillStyle = '#080506'; c.beginPath(); c.moveTo(x - 24, gy); c.lineTo(x - 24, gy - 70); c.quadraticCurveTo(x, gy - 104, x + 24, gy - 70); c.lineTo(x + 24, gy); c.fill();
      R(c, x - 20, gy - 66, 40, 66, '#2a1a12'); for (let k = -12; k <= 12; k += 8) R(c, x + k, gy - 66, 2, 66, '#1a100c'); R(c, x + 12, gy - 36, 4, 4, '#c9a13b');
    } else {
      const w = f === 'mill' ? 240 : f === 'hovel' ? 170 : 210, h = f === 'mill' ? 170 : f === 'hovel' ? 100 : 130, rh = f === 'hovel' ? 50 : 72;
      const wall = f === 'forge' ? '#221a1c' : '#1e1412';
      R(c, x - w / 2, gy - h, w, h, wall);
      c.fillStyle = '#120a0a'; c.beginPath(); c.moveTo(x - w / 2 - 14, gy - h); c.lineTo(x, gy - h - rh); c.lineTo(x + w / 2 + 14, gy - h); c.fill();
      for (let i = 1; i < 6; i++) { const k = i / 6, half = (w / 2 + 14) * k; R(c, x - half, gy - h - rh + rh * k, half * 2, 2, '#1e1210'); }
      if (f === 'forge') { for (let r = 0; r < h; r += 12) R(c, x - w / 2, gy - h + r, w, 2, '#160f10'); R(c, x + w / 2 - 40, gy - h - rh - 30, 22, 60, '#1a1214'); for (let k = 0; k < 4; k++) R(c, x + w / 2 - 36 + Math.sin(t * 2 + k) * 4, gy - h - rh - 46 - k * 14, 10, 8, 'rgba(110,100,100,0.25)'); }
      else { R(c, x - w / 2, gy - h * 0.52, w, 4, '#120a0a'); for (const k of [0, 0.5, 1]) R(c, x - w / 2 + k * (w - 5), gy - h, 5, h, '#120a0a'); }
      if (f === 'mill') {   // the wheel, still turning
        c.save(); c.translate(x - w / 2 - 6, gy - 60); c.rotate(t * 0.35); c.strokeStyle = '#2a1a12'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 54, 0, 7); c.stroke();
        for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillStyle = '#2a1a12'; c.fillRect(-3, 0, 6, 54); c.fillRect(-10, 46, 20, 8); } c.restore();
      }
      const inhabited = f === 'inn' || f === 'forge';
      if (f !== 'hovel') { lit(x - w / 2 + 22, gy - h + 20, inhabited); lit(x + w / 2 - 44, gy - h + 20, inhabited && f === 'inn'); }
      R(c, x - 20, gy - 72, 40, 72, inhabited ? '#3a261a' : '#2a1a12'); R(c, x - 20, gy - 72, 40, 3, '#4a3020'); for (let k = -12; k <= 12; k += 8) R(c, x + k, gy - 70, 2, 70, '#1a100c'); R(c, x + 12, gy - 38, 4, 4, '#8a6a2a');
      if (inhabited) glow(c, x, gy - 40, 70, 'rgba(230,140,60,0.18)');
      if (f === 'cottage') { R(c, x - 24, gy - 46, 48, 6, '#3a2618'); }   // the bar across the door, lifted off
      if (f === 'inn' || f === 'forge') {   // a hanging sign
        R(c, x + 30, gy - h - 4, 40, 3, '#2a1a12'); R(c, x + 34, gy - h, 30, 22, '#3a261a');
        if (f === 'inn') { R(c, x + 40, gy - h + 8, 16, 8, '#d8d0c0'); R(c, x + 54, gy - h + 6, 4, 4, '#d8d0c0'); } else { R(c, x + 40, gy - h + 10, 18, 5, '#8a8690'); R(c, x + 44, gy - h + 15, 8, 4, '#5a5660'); }
      }
    }
    if (marker) { c.font = 'bold 22px "Jersey 15", monospace'; c.textAlign = 'center'; c.fillStyle = '#e0b84a'; c.fillText(marker, x, gy - 110 + Math.sin(t * 4) * 3); }
  };
})();
