'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — quests. Each quest is an ordered list of steps; the log tracks
// which step you are on and completes steps as the world changes.
//
// Step types:
//   talk  {npc, lines?, meet?}  speak to an NPC (lines = what is said there)
//   kill  {enemy|tag, n, level?} slay n enemies of a type, or carrying a tag
//   reach {level}               arrive in a chapter
//   read  {lore: 'level:index'} read a note
//   flag  {flag}                any game flag becomes set
//   collect {item, n}           gather n of an item lying in the world
// start: {auto} | {talk: npcId} | {read: loreKey}. failIfDead: npcId.
// ---------------------------------------------------------------------------
G.QUESTS = {
  main: {
    title: 'The Ashen Vow', main: true, start: { auto: true },
    steps: [
      { type: 'talk', npc: 'hanged', meet: true, text: 'Speak to the Hanged Man on the Gallows Road' },
      { type: 'reach', level: 1, text: "Follow the road east to the walled town of Brannoc's Hold" },
      { type: 'talk', npc: 'odile', meet: true, text: 'Speak to Mother Odile at the Chapel of the Lily' },
      { type: 'reach', level: 3, text: 'Leave by the Fen Gate and cross the Weeping Fen to Hollowmere' },
      { type: 'talk', npc: 'maud', meet: true, text: 'Find Sister Maud by the second candle in Hollowmere' },
      { type: 'reach', level: 4, text: 'Climb to the Cathedral of Saint Avaric' },
      { type: 'flag', flag: 'bossDead', text: 'Defeat Ser Garrick, the Oathkeeper' },
      { type: 'talk', npc: 'ysolde', meet: true, text: "Bring the Saint's Tear to Ysolde" },
    ],
  },
  cut: {
    title: 'Cut Him Down', start: { talk: 'hanged' }, giver: 'hanged', reward: { ichor: 250 }, doneFlag: 'hanged_down',
    offer: [
      ['The Hanged Man', 'One favour, since you have a sword and I have only a neck. The Headsman who strung me up still walks the far end of this road.'],
      ['The Hanged Man', 'Take his head. Then come back and cut me down. I should like to lie flat, just the once.'],
    ],
    waiting: [['The Hanged Man', 'The Headsman. Far end of the road. I am not going anywhere.']],
    steps: [
      { type: 'flag', flag: 'boss_hangman_dead', text: 'Slay Gaunt, the High Headsman, who bars the Gallows Road' },
      { type: 'talk', npc: 'hanged', text: 'Return to the Hanged Man and cut him down', lines: [
        ['The Hanged Man', 'I heard him fall from here. Like a cart going over.'],
        ['The Hanged Man', 'Now the rope, ser. Gently... there. Oh. Oh, the ground is cold. I had forgotten. Thank you.'],
      ] },
    ],
  },
  spade: {
    title: 'Spadework', start: { talk: 'digger' }, giver: 'digger', failIfDead: 'digger', reward: { flask: 1 },
    offer: [
      ['Wynn', "If you want to be useful: the wretches never sleep and never stop, and they keep wandering in off the moor. Put four down for good and I'll share what the old priest left me."],
    ],
    waiting: [['Wynn', 'Four wretches, ser. I am counting. It is all I do.']],
    steps: [
      { type: 'kill', enemy: 'wretch', level: 0, n: 4, text: 'Put down Weeping Wretches on the Gallows Road' },
      { type: 'talk', npc: 'digger', text: 'Return to Wynn the Gravedigger', lines: [
        ['Wynn', 'Four. Good clean work. Here — blessed water, the last of the parish stock. It keeps better in you than in the ground.'],
      ] },
    ],
  },
  lamp: {
    title: 'The Lamp Left Lit', start: { read: '0:0', talk: 'marta' }, giver: 'marta', failIfDead: 'marta', reward: { ichor: 220 },
    steps: [
      { type: 'talk', npc: 'marta', text: 'Find Marta further along the Gallows Road' },
      { type: 'kill', tag: 'marta', n: 2, text: 'Slay the wretches hunting Marta' },
      { type: 'talk', npc: 'marta', text: 'Speak to Marta', lines: [
        ['Marta', 'You stayed. He would have stayed too — he was that sort of fool.'],
        ['Marta', 'This was for his homecoming. Take it. I will keep the lamp lit all the same. Someone should.'],
      ] },
    ],
  },
  doctor: {
    title: 'Four Hundred and One', start: { talk: 'doctor' }, giver: 'doctor', failIfDead: 'doctor', reward: { flask: 1 },
    offer: [
      ['Plague Doctor', 'A proposal. The Flagellants weep by choice — they whip it out of themselves. I need to know whether their blood differs.'],
      ['Plague Doctor', 'Open three of them for me. I will see the result on your sword. In exchange: a tincture. It works. Mostly.'],
    ],
    waiting: [['Plague Doctor', 'Three Flagellants. The hooded ones. Do try to keep the samples off your boots.']],
    steps: [
      { type: 'kill', enemy: 'flagellant', level: 3, n: 3, text: 'Slay Flagellants in Hollowmere' },
      { type: 'talk', npc: 'doctor', text: 'Return to the Plague Doctor', lines: [
        ['Plague Doctor', 'Hold the blade to the light... Ordinary. Entirely ordinary. So it truly is only grief.'],
        ['Plague Doctor', 'How disappointing. Your tincture, as agreed.'],
      ] },
    ],
  },
  square: {
    title: 'Hold the Square', start: { talk: 'edda' }, giver: 'edda', failIfDead: 'edda', reward: { ichor: 450 },
    offer: [
      ['Edda', 'There are two Headsmen in Hollowmere. One behind you, by the well. One ahead, on the chapel steps.'],
      ['Edda', 'Put both in the ground and this village might see a morning. I will hold here. It is what I do now.'],
    ],
    waiting: [['Edda', 'Two Headsmen. Count them out for me.']],
    steps: [
      { type: 'kill', enemy: 'brute', level: 3, n: 2, text: 'Slay both Headsmen in Hollowmere' },
      { type: 'talk', npc: 'edda', text: 'Return to Edda at the barricade', lines: [
        ['Edda', 'Both? ...Huh. I had your eulogy half written.'],
        ['Edda', 'Take this. The ones I put down were carrying it; I am paying it on.'],
      ] },
    ],
  },
  lilies: {
    title: 'Lilies for the Sisters', start: { talk: 'verena' }, giver: 'verena', failIfDead: 'liese', reward: { tinct: 1 },
    offer: [
      ['Sister Verena', 'Our lily-water is nearly gone, and the lilies grow only in the fen now. White ones, low on the water. Gather three.'],
      ['Sister Verena', 'It is a long way back through the fen, so carry them on to Sister Liese, at the far end of Hollowmere. She is worse off than we are. She will see you right.'],
    ],
    waiting: [['Sister Verena', 'Three white lilies. From the fen. To Sister Liese, in Hollowmere.']],
    steps: [
      { type: 'collect', item: 'lily', n: 3, text: 'Gather white lilies in the Weeping Fen' },
      { type: 'talk', npc: 'liese', text: 'Bring the lilies to Sister Liese at the far end of Hollowmere', lines: [
        ['Sister Liese', 'Lilies. Fresh ones. Oh — Verena, you stubborn woman.'],
        ['Sister Liese', 'Give me your vial. No, the other one too. You will carry a second from now on; you have earned the weight.'],
      ] },
    ],
  },
  gate: {
    title: 'The Gate Must Hold', start: { talk: 'hale' }, giver: 'hale', failIfDead: 'garrow', reward: { ichor: 600 },
    offer: [
      ['Captain Hale', 'Since you are going out the Fen Gate regardless: thin them. Ten, between here and the far bank. Fewer at my wall tonight.'],
      ['Captain Hale', 'My warden Garrow watches the far side. He keeps the purse. He will know if you did it — he counts everything.'],
    ],
    waiting: [['Captain Hale', 'Ten in the fen. Garrow has your pay, on the far bank.']],
    steps: [
      { type: 'kill', any: true, level: 2, n: 10, text: 'Put down the infected in the Weeping Fen' },
      { type: 'talk', npc: 'garrow', text: 'Collect the bounty from Garrow on the far bank of the fen', lines: [
        ['Garrow', 'Ten. I counted eleven, but one was mine. Hale said to pay a knight with a red plume if he lived.'],
        ['Garrow', 'Here. First purse I have handed over in a year.'],
      ] },
    ],
  },
  edge: {
    title: 'A Better Edge', start: { talk: 'dunstan' }, giver: 'dunstan', reward: { str: 1 },
    offer: [
      ['Dunstan', 'Give it here. I will grind it now, no charge. If that edge takes three of those pike-carrying bastards, it was good work and you owe me nothing.'],
      ['Dunstan', 'If it does not, you will be dead, and I will owe you nothing. Fair?'],
    ],
    waiting: [['Dunstan', 'Three Rot-Pikes. Then you will know what the edge is worth.']],
    steps: [
      { type: 'kill', enemy: 'pikeman', n: 3, text: 'Prove the edge: slay Rot-Pikes' },
    ],
  },
  wenna: {
    title: 'Three Knocks', start: { talk: 'wenna' }, giver: 'wenna', failIfDead: 'wenna', reward: { ichor: 260 },
    steps: [
      { type: 'kill', tag: 'wenna', n: 2, text: 'Slay the infected stalking Wenna' },
      { type: 'talk', npc: 'wenna', text: 'Speak to Wenna', lines: [
        ['Wenna', 'You did not have to. Nobody has to do anything any more; I had noticed that.'],
        ['Wenna', 'Take it. It was for the gate-guard, to look the other way. He did not.'],
      ] },
    ],
  },
  greta: {
    title: 'The One Who Circles', start: { talk: 'greta' }, giver: 'greta', failIfDead: 'greta', reward: { ichor: 400 },
    offer: [['Greta', 'Would you — no. Yes. Would you stop him, ser? Gently, if there is a gentle way. He was a gentle man.']],
    waiting: [['Greta', 'He is still out there. I can hear him on the path.']],
    steps: [
      { type: 'kill', tag: 'greta', n: 1, text: 'Put Aldous to rest — the wretch circling Greta\'s house' },
      { type: 'talk', npc: 'greta', text: 'Return to Greta', lines: [
        ['Greta', 'Is it done? ...Thank you. He had his ring on still? Keep the rest. I only wanted the quiet.'],
      ] },
    ],
  },
  rites: {
    title: 'Last Rites', start: { talk: 'anselm' }, giver: 'anselm', failIfDead: 'anselm', reward: { ichor: 500 },
    offer: [
      ['Brother Anselm', 'He kept a confession, they say — further up the nave, among the pews. Read it. Come back and tell me what it says.'],
      ['Brother Anselm', 'I cannot go myself. My legs remember what is up there.'],
    ],
    waiting: [['Brother Anselm', 'The confession. Up the nave. Quietly, ser — quietly.']],
    steps: [
      { type: 'read', lore: '4:1', text: "Find Bishop Malvern's confession in the nave" },
      { type: 'talk', npc: 'anselm', text: 'Return to Brother Anselm', lines: [
        ['Knight', 'He never believed. He meant to cut her open and call it mercy.'],
        ['Brother Anselm', '...Then for twenty years I knelt to a butcher. Good. Good. That is lighter to carry than a saint.'],
        ['Brother Anselm', 'Take the offertory. No one else is coming for it.'],
      ] },
    ],
  },
};

G.questLog = {
  state: {}, banners: [],
  reset(s) { this.state = s || {}; this.banners = []; },
  cur(id) { const q = this.state[id]; return q && q.status === 'active' ? G.QUESTS[id].steps[q.step] : null; },
  ids(status) { return Object.keys(G.QUESTS).filter(id => this.state[id] && (!status || this.state[id].status === status)); },
  banner(kind, id, sub, sfx) { this.banners.push({ kind, title: G.QUESTS[id].title, sub, t: 4.4 }); G.sfx(sfx); },
  text(id, i) {
    const s = G.QUESTS[id].steps[i], q = this.state[id];
    if (!q || q.status !== 'active' || q.step !== i) return s.text;
    const n = s.type === 'kill' ? q.count : s.type === 'collect' ? (G.game.items[s.item] || 0) : null;
    return s.text + (n == null ? '' : ` (${Math.min(n, s.n)}/${s.n})`);
  },
  // Set up the step that has just become current.
  enter(id) {
    const s = this.cur(id), q = this.state[id]; q.count = 0;
    if (s && s.type === 'kill' && s.tag) q.count = G.game.enemies.filter(e => e.dead && e.tag === s.tag).length;
  },
  start(id, quiet) {
    if (this.state[id]) return;
    this.state[id] = { step: 0, count: 0, status: 'active' }; this.enter(id);
    if (!quiet) this.banner('New quest', id, this.text(id, 0), 'quest');
  },
  advance(id) {
    const q = this.state[id], d = G.QUESTS[id], g = G.game;
    if (!q || q.status !== 'active') return;
    if (++q.step >= d.steps.length) {
      q.status = 'done'; const r = d.reward || {}, got = [];
      if (r.thorns) { g.misery.thorns += r.thorns; got.push('+' + r.thorns + ' thorns for Misery'); }
      if (r.ichor) { g.ichor += r.ichor; got.push('+' + r.ichor + ' ichor'); }
      if (r.tinct) { g.player.stats.tinct = (g.player.stats.tinct || 0) + r.tinct; g.player.tinct = g.player.tinctMax; got.push('+1 lily tincture, for good'); }
      if (r.str) { g.player.stats.str += r.str; got.push('+1 Strength'); }
      if (r.flask) { g.player.stats.flask = (g.player.stats.flask || 0) + r.flask; g.player.flasks += r.flask; got.push('+1 flask, for good'); }
      if (r.keepsake) { g.flags[r.keepsake.flag] = 1; got.push(r.keepsake.name); }
      if (d.doneFlag) g.flags[d.doneFlag] = 1;
      this.banner('Quest complete', id, got.join('  ·  '), 'questdone');
    } else { this.enter(id); this.banner('Quest updated', id, this.text(id, q.step), 'quest'); }
    g.save();
  },
  fail(id, why) { this.state[id].status = 'failed'; this.banner('Quest failed', id, why, 'questfail'); G.game.save(); },
  onKill(e, g) {
    for (const id of this.ids('active')) {
      const s = this.cur(id);
      if (s.type === 'kill' && (s.level == null || s.level === g.levelIdx) && (s.any || (s.enemy ? s.enemy === e.type : s.tag === e.tag))) this.state[id].count++;
    }
  },
  tick(g, dt) {
    for (const id in G.QUESTS) {
      const st = G.QUESTS[id].start || {};
      const lost = G.QUESTS[id].failIfDead && g.flags['dead_' + G.QUESTS[id].failIfDead];   // nobody left to do it for
      if (!this.state[id] && !lost && (st.auto || (st.read && g.read[st.read]))) this.start(id);
    }
    for (const id of this.ids('active')) {
      const d = G.QUESTS[id], q = this.state[id];
      // the story moves on even if an early step was walked past
      if (d.main) for (let j = d.steps.length - 1; j > q.step; j--) { const f = d.steps[j]; if ((f.type === 'reach' && g.reachedLv(f.level)) || (f.type === 'flag' && g.flags[f.flag])) { q.step = j; break; } }
      const s = this.cur(id);
      if (d.failIfDead && g.flags['dead_' + d.failIfDead]) { const n = G.LEVELS.flatMap(l => l.npcs).find(x => x.id === d.failIfDead); this.fail(id, (n ? n.name : 'They') + ' did not survive.'); continue; }
      const done = s.type === 'reach' ? g.reachedLv(s.level) : s.type === 'read' ? !!g.read[s.lore] : s.type === 'flag' ? !!g.flags[s.flag]
        : s.type === 'kill' ? q.count >= s.n : s.type === 'collect' ? (g.items[s.item] || 0) >= s.n : s.type === 'talk' ? !!(s.meet && g.flags['met_' + s.npc]) : false;
      if (done) this.advance(id);
    }
    if (this.banners.length && (this.banners[0].t -= dt) <= 0) this.banners.shift();
  },
  // '!' over someone with a quest to give, '?' over someone a step sends you to.
  marker(npc) {
    if (this.ids('active').some(id => { const s = this.cur(id); return s.type === 'talk' && s.npc === npc; })) return '?';
    if (Object.keys(G.QUESTS).some(id => !this.state[id] && G.QUESTS[id].start && G.QUESTS[id].start.talk === npc)) return '!';
    return null;
  },
};
