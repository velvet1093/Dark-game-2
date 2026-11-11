'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — Misery, the "guide". A small lavender fairy who follows the
// knight, offers advice that is mostly bad, and is waiting to watch him die.
// ---------------------------------------------------------------------------
G.FAIRY = {
  intro: [
    ['Misery', 'Oh! A live one. And so shiny. What do they call you? ...Nothing? A Long Battalion boy. How delicious. No name to carve on the stone.'],
    ['Misery', 'I am Misery. Someone named me that a long time ago, and I have grown into it. I guide lost knights along the gallows road. I have guided ever so many.'],
    ['Knight', 'Where are they now?'],
    ['Misery', 'Oh, here and there. Mostly there. Under things.'],
    ['Misery', 'Walk on, ser knight. I shall be right behind you. I would not miss it for the world.'],
  ],
  boss: [['Misery', 'Ooh, this one. I have such hopes for this one. Do stand nice and still for him.']],
  choice: [['Misery', 'Give it, keep it — I do not mind. Only hurry up and die of something. I have been so patient.']],
  idle: [
    'Rolling is undignified. A real knight stands and takes it.',
    'Save your flasks. You will want them later. Much later.',
    'You look tired. Lie down in the road a while.',
    'That one is only resting. Go and pat it. ...No, they never rest. Pat it anyway.',
    'You are bleeding. Good. That is how it gets in, you know.',
    'I knew a knight like you. He lasted until Tuesday.',
    'Do not mind me. I am only here for the ending.',
    'Lower your shield, it spoils the view.',
    'Is that all the blood you have? It looked like more.',
    'The candles are a trap, you know. ...No? Worth a try.',
    'Hum hum hum. Still alive. Hum hum.',
  ],
  hurt: ['Oh, lovely!', 'Again! Do that again!', 'Yes — just there!', 'Hee hee. Red suits you.', 'A little to the left next time. The neck.'],
  low: ['Oh, oh, here it comes!', 'Do not drink anything. You are doing wonderfully.', 'So close. Hold still now.', 'Shh. Do not spoil it.'],
  heal: ['Must you?', 'Cheat.', 'And you were so close.', 'Spoilsport.'],
  kill: ['Hmph.', 'That one was not even trying.', 'Boring.', 'It will get you next time.'],
  broken: ['Oh, leave it be. Let it get back up — it is funnier.', 'Do not finish it! Give the poor thing a chance.', 'Walk away. Go on. Turn your back.'],
  gore: ['Ew. Splendid.', 'Now imagine that was your arm.', 'Pieces! I love pieces.'],
  npcdeath: ['Oh! And I did not even have to wait for that one.', 'Too slow, ser knight. Hee.', 'One fewer. Do keep up.', 'They were never yours to save. None of them are.'],
  turning: ['Oh! Your eyes! They are going such a pretty red.', 'There it is. Now do not go looking for a Sister. They are all so far away.', 'Tick, tick, tick, ser knight.'],
  cleansed: ['Ugh. Lilies.', 'They cannot cure you, you know. Only make me wait longer.', 'Spoilsport nuns.', 'It will be back. It always comes back.'],
  npcturn: ['Oh, look. One of yours is one of theirs now.', 'You had a vial. You kept it. How sensible.', 'Hee! They do change quickly, do they not?'],
  iconGot: ['Ugh, her again. They painted her everywhere.', 'Another one. You do like to hoard.', 'Put it back. ...No? Suit yourself.'],
  // Hints at an icon still hidden in this area. She would rather not, but she cannot help noticing.
  clueFar: ['I smell old paint and candle smoke. Somewhere {dir}. Probably nothing.', 'Something gilt is sulking {dir}. Do not go and look.', 'There is a little painted face {dir} that has not been found. Not that I care.'],
  clueNear: ['Mm. Close. {how}', 'You are standing very near something. {how}', 'Warm. Warmer. {how}'],
  clueHow: { high: 'Not down here, though. Look up.', bars: 'Someone shut it behind iron.', veil: 'It is sitting in that red mist. Lovely colour.', plain: 'It is not even hidden properly.', inside: 'It is indoors. Knock, why not.' },
  clueNone: ['Nothing left to steal here. You have been thorough. How dull.'],
  perch: ['Comfy. Your helmet is warm.', 'Do not move. I can see every way you might die from up here.', 'Your head makes a lovely chair. Empty, mostly.', 'Hum hum. Nobody comes. Hum hum.', 'If you stand still long enough, they will think you are one of them.'],
  ringWarn: 'Mushrooms. Just mushrooms. If you stand in that ring, I am coming in with you, and they will HATE it.',
  backFromCourt: ['Four hundred years, and they still say my old name like it is a sweet. Never again.', 'Did you see Bramble\'s face when I sat on her moss? Worth the whole visit.', 'They let me in because of you. Do not think I am grateful.', 'Go and sit with the little lanterns whenever you like. See if they come when you are dying. I will.'],
  inCourt: ['Do not touch anything. It is all honey and good intentions. Sticky.', 'They are all looking at me. Let them look.', 'I used to sit there, by the pool. Do not ask.', 'If one more of them says Mercy, I will bite it.', 'Nothing weeps in here. Nothing bleeds. How do they stand it?'],
  idleCourt: ['Mercy. Ugh. Nobody has called me that in four hundred years. Do not start.', 'They hide in a ring of mushrooms and call it a court. I sit on a knight. Who is winning?'],
  // when she darts in to sting something that is fighting you
  sting: ['Mine. MINE. Get your own knight.', 'Nobody kills him but the dark. Shoo.', 'Hee! Did that sting?', 'I am not helping. I am protecting my seat.', 'Not THAT one. That one is boring.', 'Hands off. I was here first.'],
  notYet: ['Not yet. Not by THEM.', 'No no no. You die when I say. Up.', 'Get up. That one did not count.'],
  gift: ['Oh, you are giving me things now? How sweet. How strange.', 'Mm. I feel sharper already. You will regret that.', 'Thorns. You brought me thorns. You do understand me.'],
  rest: ['Resting again? More of them wander in while you sleep. They never do. Lovely.', 'Sleep well. I will watch you. I always watch.'],
  death: [
    'Hee hee hee! Oh, that was a good one.',
    'There it is. I do love this part.',
    'Again! Again!',
    'I shall remember that one fondly.',
    'Oh, do get up. I want to see it once more.',
    'Lovely. Even better than the last.',
  ],
};

// ---- Misery's gifts: thorns, earned by executions, spent at a vigil candle.
// Three branches; each gift needs the one above it in its branch.
G.MISERY_TREE = [
  { name: 'Spite', blurb: 'her sting', nodes: [
    { id: 'needle', name: 'Sharper Needle', cost: 1, how: 'Her sting does nearly twice the damage.' },
    { id: 'kiss', name: 'Bleeding Kiss', cost: 2, how: 'Her sting builds bleeding.' },
    { id: 'frenzy', name: 'Jealousy', cost: 3, how: 'Against a boss, she stings twice as often.' },
  ] },
  { name: 'Glow', blurb: 'her light', nodes: [
    { id: 'glow', name: 'Brighter Wings', cost: 1, how: 'She lights a wider circle in the dark.' },
    { id: 'magpie', name: 'Magpie Eye', cost: 2, how: 'She hints at icons twice as often, counts them, and says how far.' },
    { id: 'dazzle', name: 'Dazzle', cost: 3, how: 'Her sting staggers lesser foes and delays a boss\'s blow.' },
  ] },
  { name: 'Old Name', blurb: 'what Mercy was', nodes: [
    { id: 'sip', name: 'Sip', cost: 1, how: 'Each sting gives you back a little life.' },
    { id: 'fever', name: 'Fever-Eater', cost: 2, how: 'Each sting draws some infection out of you.' },
    { id: 'watch', name: 'Not Yet', cost: 3, how: 'Once per rest, a killing blow leaves you standing at 1 life.' },
  ] },
];

G.Fairy = class {
  constructor() { this.x = 0; this.y = 0; this.t = Math.random() * 9; this.say = null; this.sayT = 0; this.cd = 3; this.idleT = 16; this.facing = 1; this.glee = 0; this.lowSaid = false; this.motes = []; this.last = {}; }
  // Say one specific line in a speech bubble.
  // (she says nothing while she is shut outside the Court)
  sayLine(s) { if (G.ui.blocking || G.game.fairyAway) return; this.say = s; this.sayT = 2.8 + s.length * 0.05; this.cd = this.sayT + 4; G.sfx('chime'); }
  place(p) { this.x = p.x - 60; this.y = G.GROUND - 120; this.say = null; this.cd = 3; this.idleT = 14; this.clueT = 28; this.toldNone = false; }

  // Say a random line of the given kind in a speech bubble.
  bark(kind, force, chance = 1) {
    if ((!force && (this.cd > 0 || Math.random() > chance)) || G.ui.blocking || G.game.fairyAway) return;
    if (kind === 'idle' && G.game.inside && G.game.inside.id === 'court') kind = 'inCourt';   // sulking in the ring
    else if (kind === 'idle' && G.game.flags.court_met && Math.random() < 0.35) kind = 'idleCourt';   // since you met the Court, she brings it up
    const lines = G.FAIRY[kind]; let s;
    do s = G.pick(lines); while (lines.length > 1 && s === this.last[kind]);
    this.last[kind] = s; this.say = s; this.sayT = 2.6 + s.length * 0.045; this.cd = this.sayT + 3;
    const cruel = kind === 'hurt' || kind === 'death' || kind === 'low' || kind === 'gore' || kind === 'npcdeath' || kind === 'npcturn' || kind === 'turning';
    if (cruel) this.glee = 2.5;
    G.sfx(cruel ? 'giggle' : 'chime');
  }

  // ---- her sting: she darts at whatever is fighting the knight. She is protecting her seat.
  stingTarget(g) {
    const p = g.player; let best = null, bd = 1e9;
    for (const e of g.enemies) {
      if (e.dead || e.dormant || e.state === 'idle' || e.state === 'broken' || e.state === 'executed' || e.pitT != null) continue;
      const d = Math.abs(e.x - p.x); if (d < 300 && d < bd) { bd = d; best = e; }
    }
    return best;
  }
  sting(e, g) {
    const has = id => g.mis(id), p = g.player, dir = e.x >= p.x ? 1 : -1, dmg = has('needle') ? 12 : 7;
    e.takeHit(dmg, { sever: 0, quiet: true, noStagger: !has('dazzle') }, dir, g, { bleed: has('kiss') ? 26 : 0 });
    if (has('dazzle') && e.state === 'windup' && e.def.boss) e.t = Math.max(0, e.t - 0.25);   // a flash in the eyes: the blow comes later
    const [jx, jy] = e.joint('head'); G.spark(jx, jy, 6); G.sfx('chime');
    G.text(jx, jy - 18, 'STING', '#d8c6ff', 12);
    if (has('sip')) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.02);
    if (has('fever') && p.inf > 0) p.cleanse(3);
    this.glee = 0.6;
    if (!this.say && Math.random() < 0.18) this.sayLine(G.pick(G.FAIRY.sting));
  }

  update(dt, g) {
    const p = g.player, gy = G.GROUND;
    this.t += dt; this.cd -= dt; this.glee -= dt;
    this.stingCd = (this.stingCd == null ? 2 : this.stingCd) - dt;
    if (this.say && (this.sayT -= dt) <= 0) this.say = null;
    const fight = g.enemies.some(e => !e.dead && !e.dormant && e.state !== 'idle' && e.state !== 'broken' && Math.abs(e.x - p.x) < 320);
    // hover behind the knight; keep well clear of the fighting; lean in close to enjoy a death
    let tx = p.x - p.facing * (fight ? 96 : 50), ty = gy - (fight ? 168 : 118);
    if (this.dive) {   // darting in, and back out
      const e = this.dive.e; this.dive.t += dt;
      if (e.dead || e.state === 'broken' || this.dive.t > 0.7 || p.dead) this.dive = null;
      else {
        const [hx, hy] = e.joint('head'); tx = hx - (e.x >= this.x ? 10 : -10); ty = hy - 8;
        if (!this.dive.hit && (Math.hypot(tx - this.x, ty - this.y) < 22 || this.dive.t > 0.45)) { this.dive.hit = true; this.sting(e, g); this.dive.t = Math.max(this.dive.t, 0.5); }
        if (this.dive.hit && this.dive.t > 0.58) this.dive = null;
      }
    } else if (fight && !p.dead && this.stingCd <= 0 && !G.ui.blocking) {
      const e = this.stingTarget(g);
      if (e) { this.dive = { e, t: 0, hit: false }; this.stingCd = (g.mis('frenzy') && g.bossFight ? 1.2 : 2.3) + G.rand(0, 0.6); }
    }
    // left standing long enough, the knight becomes a chair
    const perch = (g.idleFor || 0) > 6 && !fight && !this.dive && !p.dead && p.headPos;
    if (perch) { tx = p.headPos[0] + p.facing * 2; ty = p.headPos[1] - 22; }   // on the crown of the helm, in front of the plume
    else if (p.dead) { tx = p.x + 26; ty = gy - 52; }
    if (!perch) { tx += Math.sin(this.t * 0.9) * 10; ty += Math.sin(this.t * 2.3) * 7; }
    const k = Math.min(1, dt * (this.dive ? 14 : p.dead ? 1.6 : perch ? 4 : 3.2));
    const wasSitting = this.sitting; this.sitting = !!perch && Math.hypot(tx - this.x, ty - this.y) < 6;
    if (this.sitting && !wasSitting && !this.say && Math.random() < 0.6) this.sayLine(G.pick(G.FAIRY.perch));
    this.sitT = this.sitting ? (this.sitT || 0) + dt : 0;
    if (this.sitting) { this.x = tx; this.y = ty + (this.sitT < 0.1 ? -4 : this.sitT < 0.22 ? 2 : 0); this.facing = p.facing; }   // a little hop as she lands
    if (!this.sitting) { this.x += (tx - this.x) * k; this.y += (ty - this.y) * k; if (Math.abs(p.x - this.x) > 4) this.facing = p.x > this.x ? 1 : -1; }
    // dust falling from her wings
    if (Math.random() < dt * 14) this.motes.push({ x: this.x + G.rand(-12, 12), y: this.y + G.rand(-8, 10), t: 0 });
    for (let i = this.motes.length - 1; i >= 0; i--) { const m = this.motes[i]; m.t += dt; m.y += 16 * dt; if (m.t > 1.1) this.motes.splice(i, 1); }
    if (p.dead) return;
    if (p.hp < p.maxHp * 0.35) { if (!this.lowSaid) { this.lowSaid = true; this.bark('low', true); } } else if (p.hp > p.maxHp * 0.5) this.lowSaid = false;
    // every so often she lets slip that something is hidden nearby: vague from afar, plainer when close
    const icons = g.iconsHere ? g.iconsHere() : []; this.near = false;
    if (icons.length) {
      let best = icons[0]; for (const it of icons) if (Math.abs(it.x - p.x) < Math.abs(best.x - p.x)) best = it;
      const d = Math.abs(best.x - p.x); this.near = d < (g.mis('magpie') ? 520 : 320);
      if (!fight && !this.say && this.cd <= 0 && (this.clueT -= dt) <= 0) {
        this.clueT = g.mis('magpie') ? G.rand(35, 60) : G.rand(75, 120);
        const how = G.FAIRY.clueHow[(best.alt || 0) > p.alt + 60 ? 'high' : best.gate || 'plain'], dir = best.x > p.x ? 'ahead of us' : 'back the way we came';
        let line = G.pick(d < 360 ? G.FAIRY.clueNear : G.FAIRY.clueFar).replace('{dir}', dir).replace('{how}', how);
        if (g.mis('magpie')) line += ' ' + icons.length + (icons.length > 1 ? ' left here.' : ' left here.') + (d >= 360 ? ' About ' + Math.round(d / 100) * 10 + ' paces.' : '');
        this.sayLine(line);
      }
    } else if (g.level.items && g.level.items.some(it => it.icon) && !this.toldNone && !fight && !this.say && this.cd <= 0 && (this.clueT -= dt) <= 0) { this.toldNone = true; this.sayLine(G.FAIRY.clueNone[0]); }
    if (!fight && !this.say && (this.idleT -= dt) <= 0) { this.idleT = G.rand(16, 28); this.bark('idle'); }
  }

  draw(ctx, g) {
    const t = this.t, glee = this.glee > 0 || g.player.dead;
    // motes
    for (const m of this.motes) { ctx.fillStyle = `rgba(214,190,255,${0.8 * (1 - m.t / 1.1)})`; ctx.fillRect(Math.round(m.x / 2) * 2, Math.round(m.y / 2) * 2, 2, 2); }
    G.drawMisery(ctx, this.x, this.y, this.facing, t, glee, this.near, this.sitting && this.sitT > 0.1);
    // speech bubble
    if (this.say) {
      ctx.font = '18px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left';
      const words = this.say.split(' '), lines = [''];
      for (const w of words) { const l = lines[lines.length - 1]; if (ctx.measureText(l + ' ' + w).width > 200 && l) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; }
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 18, h = lines.length * 16 + 10;
      const bx = G.clamp(this.x - w / 2, g.cam + 8, g.cam + G.W - w - 8), by = Math.max(8, this.y - 34 - h);
      ctx.globalAlpha = G.clamp(this.sayT * 3, 0, 1);
      ctx.fillStyle = 'rgba(14,8,22,0.88)'; ctx.fillRect(bx, by, w, h); ctx.strokeStyle = '#7a5fb0'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, w, h);
      ctx.fillStyle = '#d8c6ff'; lines.forEach((l, i) => ctx.fillText(l, bx + 9, by + 18 + i * 16));
      ctx.globalAlpha = 1;
    }
  }
};
