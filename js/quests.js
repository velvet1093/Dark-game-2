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
// start: {auto} | {talk: npcId} | {read: loreKey}. failIfDead: npcId.
// ---------------------------------------------------------------------------
G.QUESTS = {
  main: {
    title: 'The Ashen Vow', main: true, start: { auto: true },
    steps: [
      { type: 'talk', npc: 'hanged', meet: true, text: 'Speak to the Hanged Man on the Gallows Road' },
      { type: 'reach', level: 1, text: 'Follow the road east to Hollowmere' },
      { type: 'talk', npc: 'maud', meet: true, text: 'Find Sister Maud by the far candle in Hollowmere' },
      { type: 'reach', level: 2, text: 'Climb to the Cathedral of Saint Avaric' },
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
      { type: 'kill', enemy: 'brute', level: 0, n: 1, text: 'Slay the Headsman at the far end of the Gallows Road' },
      { type: 'talk', npc: 'hanged', text: 'Return to the Hanged Man and cut him down', lines: [
        ['The Hanged Man', 'I heard him fall from here. Like a cart going over.'],
        ['The Hanged Man', 'Now the rope, ser. Gently... there. Oh. Oh, the ground is cold. I had forgotten. Thank you.'],
      ] },
    ],
  },
  spade: {
    title: 'Spadework', start: { talk: 'digger' }, giver: 'digger', failIfDead: 'digger', reward: { flask: 1 },
    offer: [
      ['Wynn', "If you want to be useful: the wretches keep unburying themselves faster than I can plant them. Put four down for good and I'll share what the old priest left me."],
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
      { type: 'kill', enemy: 'flagellant', level: 1, n: 3, text: 'Slay Flagellants in Hollowmere' },
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
      { type: 'kill', enemy: 'brute', level: 1, n: 2, text: 'Slay both Headsmen in Hollowmere' },
      { type: 'talk', npc: 'edda', text: 'Return to Edda at the barricade', lines: [
        ['Edda', 'Both? ...Huh. I had your eulogy half written.'],
        ['Edda', 'Take this. The dead paid it to me; I am paying it on.'],
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
      { type: 'read', lore: '2:1', text: "Find Bishop Malvern's confession in the nave" },
      { type: 'talk', npc: 'anselm', text: 'Return to Brother Anselm', lines: [
        ['Aldric', 'He never believed. He meant to cut her open and call it mercy.'],
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
    return s.text + (s.type === 'kill' && q && q.status === 'active' && q.step === i ? ` (${Math.min(q.count, s.n)}/${s.n})` : '');
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
      if (r.ichor) { g.ichor += r.ichor; got.push('+' + r.ichor + ' ichor'); }
      if (r.flask) { g.player.stats.flask = (g.player.stats.flask || 0) + r.flask; g.player.flasks += r.flask; got.push('+1 flask, for good'); }
      if (d.doneFlag) g.flags[d.doneFlag] = 1;
      this.banner('Quest complete', id, got.join('  ·  '), 'questdone');
    } else { this.enter(id); this.banner('Quest updated', id, this.text(id, q.step), 'quest'); }
    g.save();
  },
  fail(id, why) { this.state[id].status = 'failed'; this.banner('Quest failed', id, why, 'questfail'); G.game.save(); },
  onKill(e, g) {
    for (const id of this.ids('active')) {
      const s = this.cur(id);
      if (s.type === 'kill' && (s.level == null || s.level === g.levelIdx) && (s.enemy ? s.enemy === e.type : s.tag === e.tag)) this.state[id].count++;
    }
  },
  tick(g, dt) {
    for (const id in G.QUESTS) {
      const st = G.QUESTS[id].start || {};
      const lost = G.QUESTS[id].failIfDead && g.flags['dead_' + G.QUESTS[id].failIfDead];   // nobody left to do it for
      if (!this.state[id] && !lost && (st.auto || (st.read && g.read[st.read]))) this.start(id);
    }
    for (const id of this.ids('active')) {
      const d = G.QUESTS[id], s = this.cur(id), q = this.state[id];
      if (d.failIfDead && g.flags['dead_' + d.failIfDead]) { const n = g.level.npcs.find(x => x.id === d.failIfDead); this.fail(id, (n ? n.name : 'They') + ' did not survive.'); continue; }
      const done = s.type === 'reach' ? g.levelIdx >= s.level : s.type === 'read' ? !!g.read[s.lore] : s.type === 'flag' ? !!g.flags[s.flag]
        : s.type === 'kill' ? q.count >= s.n : s.type === 'talk' ? !!(s.meet && g.flags['met_' + s.npc]) : false;
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
