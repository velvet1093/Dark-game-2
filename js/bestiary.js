'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Bestiary: every kind of foe you have seen, every boss, and
// the people who matter, with a portrait drawn from their own sprite.
// Foes appear once seen and count your kills; people appear once met.
// Entries can grow: some have a `more` line that only appears once a flag is set.
// ---------------------------------------------------------------------------
(() => {
  const FOES = [
    ['wretch', 'Once a farmhand, a weaver, a child. The first to go, and the most of them. They do not sleep, and they cannot stop.', 'Slow, weak alone, dangerous in threes.'],
    ['deserter', 'Soldiers who ran from the King\'s muster and caught the weeping anyway. They still fight like soldiers.', 'Watch the second swing.'],
    ['flagellant', 'They whipped themselves to drive the sickness out. It liked the open wounds.', 'They come fast and do not flinch.'],
    ['brute', 'The town\'s headsman, kept on after the town was gone. Light blows do not move him.', 'Heavy hits or a severed leg will put him down.'],
    ['templar', 'Knights of the Veil swore to guard the Saint. They are guarding her still.', 'Shielded, patient, and they punish a careless roll.'],
    ['hound', 'Somebody\'s dogs, fed on the dead until they wanted only the living.', 'Cut a leg and it drags itself. Jump the lunge.'],
    ['crow', 'Gallows crows. They ate the weeping off the hanged and it came up into the trees with them.', 'Strike as it pulls up from a dive, or take a wing.'],
    ['bloat', 'The sickness pooling in one body until it cannot hold any more.', 'Execute it, or it bursts over everyone near.'],
    ['pikeman', 'Militia with rotting pikes, holding a line nobody gave them.', 'Long thrust. Get inside it.'],
    ['reaper', 'Field-hands who took their scythes to their own harvest. Tall, wide sweeps.', 'Roll through, not away.'],
    ['sailor', 'Crew of the Sun, who rowed the Long Battalion home and brought the weeping with it.', 'Clumsy, but there are always more below deck.'],
    ['drowned', 'Your own brothers of the Battalion, still wearing the gold of Osric\'s sun.', 'They know the same lunges you do.'],
    ['novice', 'Young Sisters of the Lily who drank the wash-water when their Abbess did.', 'Quick knives, and they weep on you.'],
    ['pilgrim', 'Pilgrims who climbed to pray for the Saint and froze on the way down.', 'Heavy, slow, and the wind hardly moves them.'],
    ['wolf', 'White wolves of the pass, low and fast. They hunt in the gusts while you cannot move.', 'Keep your guard up in the wind.'],
    ['warden', 'Cairn Wardens kept the pilgrims\' road. They are rooted to it now.', 'Long spear, poise, and they never get blown away.'],
    ['bloodfly', 'Fat with blood, and the blood is sick. They come in swarms over the black water.', 'One hit kills, but they rarely come one at a time.'],
    ['moth', 'Weeping moths, drawn to every light. The dust of their wings is the sickness.', 'Hit it as it sweeps down. Do not stand under it.'],
    ['bogman', 'Drowned when Hildsmere went under, and never came up. The mire does not slow them.', 'Fight them on the boardwalks, not in the water.'],
  ];
  const BOSSES = [
    ['hangman', 'The High Headsman of the Gallows Road. He hanged the first of the weeping on the King\'s order, and kept hanging.', 'Watch the long charge.'],
    ['matron', 'The Drowned Matron of the fen. She took in the sick children, and kept them.', 'Her vomit is the sickness; her hounds come twice.'],
    ['bearer', 'He holds the Long Battalion\'s colours at the stern of the Sun, waiting for an order to stand down.', 'Long lunges and an overhead slam.'],
    ['malvern', 'Bishop of Saint Avaric. He cut the Saint for her tears, and sent seven hundred men east for a relic he already knew about.', 'The censer fills your infection bar.'],
    ['abbess', 'Mother Severine of the Lily Convent. She drank the wash-water so her Sisters would not have to.', 'Long scythe, longer lunge, and tears.'],
    ['windcaller', 'Brother Hask blew the great horns to drive the sickness off the mountain. It went down to Hollowmere.', 'His horn is a gust, aimed at you.'],
    ['mothmother', 'The Lamplight Mother, queen of the moths: a girl of drowned Hildsmere who went into the water the first summer and came up with wings. The spring called her up, and she calls the moths.', 'She dives for the light. Misery glows.'],
    ['garrick', 'Ser Garrick of the Long Battalion. He came home first, took his name back, and held the cathedral door.', 'The better sword, until he is not.'],
  ];
  // Important people: [id, name, look, what is known, more-when-flag, flag, art]
  const PEOPLE = [
    { id: 'misery', name: 'Misery', art: 'misery', always: true,
      text: 'A small lavender fairy with white hair who has followed you since the road began. She wants, very sincerely, to watch you die. She stings what fights you, because nobody else gets to.',
      more: [['court_met', 'The Lantern Court called her Mercy. She was the one of them who sat with the dying, so that no one went alone, until she came to love the watching more than the easing.'],
        ['named', 'When you said your name, she said it suited you, and that Mercy was someone else.']] },
    { id: 'ysolde', name: 'Ysolde', look: 'ysolde', text: 'The miller\'s daughter of Hollowmere. The Saint of Morrowmere. Your sister.',
      more: [['named', 'She said your name every night for seven years, so that she would not forget it.'], ['met_wren', 'Hagge Wren says she did not make the sickness. She stood between the spring and the world and let it run into her.']] },
    { id: 'hanged', name: 'The Hanged Man', look: 'hanged', text: 'Still talking on his gibbet on the Gallows Road. The first to tell you where the road goes.' },
    { id: 'odile', name: 'Mother Odile', look: 'sisterA', text: 'Mother of the Chapel of the Lily in Brannoc\'s Hold. She held the knife when Sister Amabel turned. Her hand shook.' },
    { id: 'maud', name: 'Sister Maud', look: 'sisterB', text: 'She stayed in Hollowmere to wash the sick. She knew Ysolde.' },
    { id: 'amabel', name: 'Sister Amabel', look: 'amabel', text: 'She crawled down into the Ossuary so Mother Odile would not have to try again. She saved a little lily-water for someone clean.' },
    { id: 'petra', name: 'Sister Petra', look: 'petra', text: 'The last clean Sister of the Lily Convent. She never drank. Her Abbess drank for her.' },
    { id: 'bosun', name: 'The Bosun', look: 'bosun', text: 'He rowed seven hundred out to the Sun, and rowed back one.' },
    { id: 'elowen', name: 'Elowen', art: 'queen', text: 'Queen of the Lantern Court, the good kind of fairy, hidden in a ring of white caps at the edge of the fen. Her favour slows the sickness in you.' },
    { id: 'sigrun', name: 'Sigrun the Guide', look: 'sigrun', text: 'Guide of the Pilgrims\' Pass. Stones, guard, lulls. Her brother Torvald went up with a rope a year ago.' },
    { id: 'aldous', name: 'Brother Aldous', look: 'aldous', text: 'The last Windcaller who is still a brother of anything. He knows where the wind took the sickness.' },
    { id: 'bram', name: 'Bram the Woodcutter', look: 'bram', text: 'He cuts wood for monks who are gone, because a man needs a reason to stay warm. He fights beside you.' },
    { id: 'osk', name: 'Osk the Ferryman', look: 'osk', text: 'He takes no coin. Nobody goes anywhere worth paying for.' },
    { id: 'wren', name: 'Hagge Wren', look: 'wren', text: 'The Mire-Wife has studied the black water for thirty years. The weeping came up out of a spring under Saint Hild\'s. If the spring is stopped, nobody has to be the well.' },
    { id: 'nell', name: 'Nell', art: 'nell', text: 'Once the Lamplight Mother, queen of the moths. A girl of drowned Hildsmere who went into the water the first summer and came up with wings. You tore them out, and let her go. Hagge Wren took her in.',
      more: [['roots_eaten', 'She sent her children to eat the roots off Saint Hild\'s door, and they followed Misery\'s light to do it.']] },
    { id: 'hild', name: 'Saint Hild', look: 'hild', text: 'The first well. Three hundred years ago she stood in the spring under Hildsmere and drank the weeping, so it would not reach the houses. Her tear is the Saint\'s Tear.',
      more: [['met_hild', 'She says the spring is grief: the weeping of every dead thing nobody named. Name them, and it runs dry.']] },
    { id: 'pell', name: 'Ser Pell', look: 'pell', text: 'A knight of the Long Battalion who went over the side of the Sun rather than bring the sickness home. He brought it anyway.',
      more: [['named', 'Number three-forty-one. He stood beside you at the muster, and heard your sister shouting your name.']] },
  ];

  // ---- portraits, drawn once from the real sprites and kept as images
  const cache = {};
  const portrait = (key, draw, w = 140, h = 150) => {
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    try { draw(ctx, w, h); } catch (e) { /* a portrait is optional */ }
    return (cache[key] = c.toDataURL());
  };
  const foeArt = type => portrait('foe_' + type, (ctx, w, h) => {
    const d = G.ENEMIES[type], e = new G.Enemy(type, 0), big = (d.scale || 1) > 1.2;
    e.facing = 1; e.dormant = false; e.state = 'idle'; e.alt = d.fly ? 30 : 0;
    const k = big ? 0.62 : d.model === 'bloodfly' ? 1.4 : 0.95;
    ctx.translate(w / 2, h - 12); ctx.scale(k, k); ctx.translate(0, -G.GROUND); e.x = 0;
    if (d.model) G.drawBeast(ctx, e, 1.3); else G.drawHumanoid(ctx, { x: 0, y: G.GROUND, facing: 1, scale: e.scale, pose: e.pose(), look: d.look, limbs: e.limbs, weapon: d.weapon, wlen: d.wlen, flash: 0, time: 1.3, vx: 0 });
  });
  const personArt = p => portrait('npc_' + p.id, (ctx, w, h) => {
    if (p.art === 'nell') { ctx.translate(w / 2, h - 16); ctx.translate(0, -G.GROUND); G.drawMothGirlSprite(ctx, { x: 0, alt: 0, facing: 1, state: 'broken', dead: false, limbs: { head: {}, armF: {}, armB: {} }, flash: 0, id: 7, def: { scale: 1.2 }, wingless: true, calm: true }, 1.3); return; }
    if (p.art === 'misery' || p.art === 'queen') { ctx.translate(w / 2, h / 2); ctx.scale(2.2, 2.2); G.drawMisery(ctx, 0, 0, 1, 1.3, false, false, false, p.art === 'queen' ? G.FAIRY_PALS.queen : undefined); return; }
    ctx.translate(w / 2, h - 12); ctx.scale(0.95, 0.95); ctx.translate(0, -G.GROUND);
    G.drawHumanoid(ctx, { x: 0, y: G.GROUND, facing: 1, scale: 1, pose: {}, look: G.LOOKS[p.look], weapon: 'none', flash: 0, time: 1.3, vx: 0 });
  });

  G.bestiary = {
    entries(g) {
      const kills = g.kills || {}, seen = g.seen || {};
      const foe = ([type, text, tip], boss) => ({ key: type, kind: boss ? 'Boss' : 'Foe', name: G.ENEMIES[type].name, known: !!(seen[type] || kills[type] || (boss && g.flags['boss_' + type + '_dead'])), text, tip, kills: kills[type] || 0, art: () => foeArt(type) });
      const person = p => ({ key: p.id, kind: 'Person', name: p.name, known: p.always || !!g.flags['met_' + p.id], text: p.text + (p.more || []).filter(([f]) => g.flags[f]).map(([, t]) => '\n\n' + t).join(''), art: () => personArt(p) });
      const X = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };   // entries added by later content
      return { Foes: FOES.concat(X.foes).map(f => foe(f)), Bosses: BOSSES.concat(X.bosses).map(b => foe(b, true)), People: PEOPLE.concat(X.people).map(person) };
    },
    count(g) { const E = this.entries(g); let n = 0, t = 0; for (const k in E) for (const e of E[k]) { t++; if (e.known) n++; } return [n, t]; },
  };

  // ---- the screen: tabs, a list, and the open page
  G.ui.bestiary = function (tab = 'Foes', sel = 0) {
    const g = G.game, E = G.bestiary.entries(g), list = E[tab], esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const cur = list[Math.min(sel, list.length - 1)], [n, t] = G.bestiary.count(g);
    const opts = [], btn = (label, fn, cls = '') => { opts.push(fn); return `<button class="btn ${cls}" data-opt="${opts.length - 1}">${label}</button>`; };
    const tabs = Object.keys(E).map(k => btn(`${k} <small>${E[k].filter(e => e.known).length}/${E[k].length}</small>`, () => { this.keepSel = Object.keys(E).indexOf(k); this.bestiary(k, 0); }, k === tab ? 'tab on' : 'tab')).join('');
    const rows = list.map((e, i) => btn(e.known ? esc(e.name) : '? ? ?', () => { this.keepSel = Object.keys(E).length + i; this.bestiary(tab, i); }, (i === sel ? 'on ' : '') + (e.known ? '' : 'unknown'))).join('');
    const page = cur.known
      ? `<img class="bport" src="${cur.art()}" alt=""><div class="btext"><h3>${esc(cur.name)}</h3><div class="bkind">${cur.kind}${cur.kind === 'Foe' ? ' &nbsp;·&nbsp; slain ' + cur.kills : cur.kind === 'Boss' ? (g.flags['boss_' + cur.key + '_spared'] ? ' &nbsp;·&nbsp; spared' : g.flags['boss_' + cur.key + '_dead'] ? ' &nbsp;·&nbsp; defeated' : ' &nbsp;·&nbsp; not yet defeated') : ''}</div><p>${esc(cur.text).replace(/\n/g, '<br>')}</p>${cur.tip ? `<p class="btip">${esc(cur.tip)}</p>` : ''}</div>`
      : `<div class="btext"><h3>? ? ?</h3><p>${cur.kind === 'Person' ? 'You have not met them yet.' : 'You have not seen this one yet.'}</p></div>`;
    opts.push(() => this.clear());
    this.show(`<div class="screen dim bestiary"><h2>Bestiary</h2><div class="found">${n} of ${t} entries</div><div class="btabs">${tabs}</div><div class="bwrap"><div class="opts blist">${rows}</div><div class="bpage">${page}</div></div><button class="btn bclose" data-opt="${opts.length - 1}">Close</button></div>`, null, opts);
    this.advance = () => this.clear(); this.escAdvance = true; G.sfx('page');
  };
})();
