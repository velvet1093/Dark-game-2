'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — after the Lamplight Mother. If you spared her, Nell (that was her
// name) is at Hagge Wren's hut, wingless. Her moths can eat the black roots off
// Saint Hild's door if a light leads them, and Misery is a light. Behind the
// door is the first well, and the first true answer to how the weeping ends.
// If you executed her, her orphaned moths can still be led; it is only colder.
// ---------------------------------------------------------------------------
(() => {
  const LV = G.LEVELS.findIndex(l => l.boss && l.boss.type === 'mothmother'), L = G.LEVELS[LV];

  G.LOOKS.hild = { soft: 1, iris: '#7aa090', skin: '#9aaca4', body: '#d8d4c8', arm: '#d8d4c8', leg: '#c8c4b8', helm: 'veil', helmCol: '#c8d0c8', eye: '#c20d16' };

  // ---- Nell, at the Mire-Wife's hut
  L.npcs.push({
    id: 'nell', x: 2190, name: 'Nell', sprite: 'mothgirl', needs: 'boss_mothmother_spared', hidden: true, essential: true, hideIf: 'nell_follow',
    lines: [
      ['Nell', 'Don\'t... oh. It is you. The one who took them.'],
      ['Nell', '...And let me go. Nobody has ever let me go. Not the water, not the moths, not the light.'],
      ['Hagge Wren', 'Found her in my reeds, shaking like a wet cat. I gave her a blanket. She ate a candle.'],
      ['Nell', 'My name is Nell. Mother was what the moths called me. I was nineteen, the summer the water came up warm over Hildsmere. I went in to find my brother, and something under the water said: be a light for us.'],
      ['Nell', 'It is not water, knight. It is crying. Everyone the mire ever took is crying in it, and it wanted something to cry toward.'],
      ['Misery', 'Lovely. A ghost story. Can we go?'],
      ['Nell', 'The roots on Saint Hild\'s door are the spring\'s. They grow toward the dark and hate the light. My children eat roots. They would eat right through, if something bright went in front of them.'],
      ['Nell', '...She glows.'],
      ['Misery', 'No.'],
      ['Nell', 'They will follow her. They followed me.'],
      ['Misery', 'I said NO. I am not a lantern. I am not anybody\'s lantern.'],
    ],
    repeat: [['Nell', 'The roots on the chapel door. My children are waiting in the reeds there. They only need a light.']],
    repeatBound: [['Nell', 'Master.'], ['Nell', 'They are by the chapel door. They will do what you say. ...Everything does, now.']],
    callBack: true,
  });
  // What becomes of her: left be, or bound in iron to your service.
  G.NELL = {
    choose(g) {
      G.ui.choice('Nell sits in the reeds, wingless, waiting to see what you will do with her.', [
        { label: 'Leave her be <small>— she is free to stay with Wren</small>', fn: () => { g.flags.nell_fate = 'free'; g.save(); G.ui.dialogue([['Nell', '...Thank you. I will be here. My children will be in the reeds, by the chapel door, if you want them.']], () => {}); } },
        { label: 'Bind her to your service <small>— her moths will be yours</small>', fn: () => this.bind(g) },
      ]);
    },
    bind(g) {
      g.flags.nell_fate = 'bound'; g.flags.nell_bound = 1; g.save();
      G.ui.dialogue([
        ['Knight', 'You will serve me.'],
        ['Nell', '...Serve.'],
        ['Hagge Wren', 'Knight. She is not a dog. Whatever she was, she is not a dog.'],
        ['The Gloamwater', 'The knight takes the eel-chain from the wall of the hut, closes the iron round her neck, and drives the stake into the mud beside her. She does not fight. She has nothing left to fight with.'],
        ['Nell', 'Yes. Yes, master. My children are yours. They will not touch you. They will go where you send them.'],
        ['Misery', 'Oh. OH. Look at you. Look at what you have done. I have never been so proud of anyone in my life.'],
        ['Aurelle', 'A vow taken in iron is still a vow, little knight. I will keep it. I keep them all.'],
      ], () => { G.sfx('thud'); G.sfx('bell'); g.flags.nell_follow = 1; G.companion.place(g); g.save(); G.questLog.banners.push({ kind: 'Nell is bound', title: 'She follows on her chain', sub: 'Her moths fight for you. Weeping Moths and Bloodflies will not attack you', t: 5 }); });
    },
  };
  G.QUESTS.moths = {
    title: 'The Moths and the Light', start: { talk: 'nell' }, giver: 'nell', reward: { thorns: 3, ichor: 300 },
    steps: [{ type: 'flag', flag: 'roots_eaten', text: 'Take Nell\'s moths to the roots on the door of Saint Hild\'s, at the far end of the Gloamwater' }],
  };
  G.QUESTS.spring.reward = { ichor: 400 };

  // ---- the roots on the door
  const scene = g => {
    const spared = g.flags.boss_mothmother_spared, mercy = g.flags.court_met, lines = [];
    if (g.flags.nell_bound) {   // they need no light: they are his
      G.ui.dialogue([['Knight', 'Eat the roots.'], ['The Gloamwater', 'At the word the moths rise out of the reeds in a white storm, without a light to follow, and settle on the black roots, and eat.'], ['Misery', 'You did not even need me. I am almost offended. ...No. I am delighted.']], () => { g.flags.roots_eaten = 1; g.flags.spring_open = 1; g.read[LV + ':2'] = 1; g.rootsT = 4; G.sfx('cleanse'); G.sfx('bell'); g.shake = 6; G.text(5960, G.GROUND - 160, 'THE ROOTS GIVE WAY', '#e0d8c8', 18); g.save(); });
      return;
    }
    if (spared) lines.push(['Knight', 'Nell sent her children.'], ['Misery', 'I can see them. Hundreds of them, in the reeds, all looking at me.']);
    else lines.push(['Knight', 'Her children are still here.'], ['Misery', 'Orphans. You made them orphans. And now they are all looking at me.']);
    lines.push(['Misery', 'I know what you want. I am not your lantern.']);
    if (mercy) lines.push(['Misery', 'Mercy used to do this, you know. Walk in front of the dying, glowing, so they would not be afraid of the dark.'], ['Misery', 'I stopped. Do you know why I stopped? Because they always went. Every single one. They went, and I stayed.']);
    lines.push(['Knight', 'Then go in front of these.'], ['Misery', '...'], ['Misery', 'Fine. FINE. Nobody goes alone.'], ['Misery', '...That was the rule.']);
    lines.push(['The Gloamwater', 'Misery drifts to the roots, glowing. The moths rise out of the reeds after her in a slow white storm, and where they settle the black roots blister, split, and fall away into the water.']);
    G.ui.dialogue(lines, () => {
      g.flags.roots_eaten = 1; g.flags.spring_open = 1; g.read[LV + ':2'] = 1;   /* you have seen the door, whatever order you did things in */ g.rootsT = 4; G.sfx('cleanse'); G.sfx('bell'); g.shake = 6;
      G.text(5960, G.GROUND - 160, 'THE ROOTS GIVE WAY', '#e0d8c8', 18); g.save();
      setTimeout(() => { g.fairy.cd = 0; g.fairy.sayLine('Do not thank me. Do not even look at me.'); }, 1500);
    });
  };
  L.hooks = [{ x: 5960, r: 50, label: 'Call the moths to the roots', when: g => !g.flags.roots_eaten && g.flags.boss_mothmother_dead, fn: scene }];
  L.doors = (L.doors || []).concat([{ x: 5960, to: 'undercroft', needs: 'spring_open', bare: true }]);

  // ---- under the chapel: the first well
  G.INTERIORS.undercroft = {
    name: 'Saint Hild\'s Undercroft', area: LV, style: 'stone', length: 1000, entry: 120, music: 'cathedral', exitLabel: 'Climb back up into the mire',
    furniture: [['candles', 300], ['altar', 560], ['candles', 760]],
    platforms: [], enemies: [],
    items: [{ x: 900, icon: 1 }],
    lore: [{ x: 380, title: 'Carved in the Font', text: 'HILD OF HILDSMERE, WHO DRANK.\n\nUnderneath, much newer, a list of names scratched with a knife-point. Hundreds. They go on down the side of the font and onto the floor.\n\nThe last one is half-finished.' }],
    npcs: [{
      id: 'hild', x: 620, name: 'Saint Hild', look: 'hild', pose: 'kneel', essential: true,
      lines: [
        ['Saint Hild', 'Light. Someone has brought a light down here. Oh, it has been so long.'],
        ['Misery', 'Do not get attached. I am leaving.'],
        ['Saint Hild', 'Three hundred years ago the weeping came up out of this ground for the first time. I was a girl of Hildsmere. I stood in the spring and I drank, so it would not reach the houses.'],
        ['Saint Hild', 'They called me a saint for it. They built a chapel over my head, and they let the water rise.'],
        ['Saint Hild', 'When I could hold no more I wept, once, and my tear came out hard and bright as a coin. A bishop carried it east, so that no one could ever pour it back. Your King sent you to fetch it home.'],
        ['Knight', 'The Saint\'s Tear.'],
        ['Saint Hild', 'Mine. It does not cure, knight. It moves the weeping from one well into another. I was the first well. Your sister is the second. Whoever uses it becomes the third.'],
        ['Saint Hild', 'Listen to me, because this is the only thing I have learned in three hundred years. The spring is not a sickness. It is grief.'],
        ['Saint Hild', 'Every death that was never mourned. Every dead thing nobody named. They weep up out of the ground because nobody wept for them.'],
        ['Saint Hild', 'Seven hundred knights gave up their names at the muster, and most of them died in the east with no name to be buried under. Since then the spring has run like a river.'],
        ['Knight', 'Then how is it stopped?'],
        ['Saint Hild', 'Name them. Every one. Mourn them by name, and the spring has nothing left to weep. The priests wrote every name in a muster book before they struck them out. They would not have burned it. Priests never burn the books.'],
        ['Misery', 'Seven hundred names. Oh, this will take FOREVER.'],
        ['Misery', '...Good.'],
      ],
      repeat: [['Saint Hild', 'The muster book. Seven hundred names. Begin with the ones you know.']],
    }],
  };
  Object.assign(G.INTERIORS.undercroft, { interior: true, chapter: L.name, theme: 'cathedral', _theme: { indoor: true, weather: 'dust' }, shrines: [] });   // (interiors.js prepares the others)
  // The names quest, the long road to the end of the weeping.
  G.QUESTS.names = {
    title: 'Seven Hundred Names', start: { talk: 'hild' }, giver: 'hild',
    steps: [
      { type: 'flag', flag: 'named', text: 'Remember your own name (the five Remembrances)' },
      { type: 'flag', flag: 'muster_book', text: 'Find the muster book where the priests wrote the Battalion\'s true names (the road to it is not open yet)' },
    ],
  };

  // ---- the roots, drawn on the door; then the open way down
  const drawDoor = (ctx, g, t) => {
    if (g.inside || g.level !== L) return;
    const x = 5960, gy = G.GROUND, open = g.flags.roots_eaten, k = g.rootsT > 0 ? g.rootsT / 4 : 0;
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(x - 40, gy - 150, 80, 150); ctx.beginPath(); ctx.moveTo(x - 46, gy - 150); ctx.quadraticCurveTo(x, gy - 205, x + 46, gy - 150); ctx.fill();   // the chapel's sunken arch
    ctx.fillStyle = open ? '#020102' : '#3a2c24'; ctx.fillRect(x - 28, gy - 130, 56, 130); if (!open) { ctx.fillStyle = '#5a4434'; for (let k2 = 0; k2 < 4; k2++) ctx.fillRect(x - 26 + k2 * 14, gy - 128, 2, 126); }   // the old chapel door, planked
    if (open) {   // a stair going down, and the faint red of the spring
      for (let s = 0; s < 6; s++) { ctx.fillStyle = s % 2 ? '#141012' : '#1e181a'; ctx.fillRect(x - 26 + s * 3, gy - 18 + s * 3, 52 - s * 6, 3); }
      const gr = ctx.createRadialGradient(x, gy - 10, 2, x, gy - 10, 50); gr.addColorStop(0, 'rgba(170,30,40,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 50, gy - 60, 100, 70);
    }
    if (!open || k > 0) {   // black roots, as thick as a man
      ctx.save(); if (open) ctx.globalAlpha = k;
      ctx.strokeStyle = '#120808'; ctx.lineWidth = 8;
      for (let r = 0; r < 7; r++) { ctx.beginPath(); ctx.moveTo(x - 34 + r * 11, gy - 140 + (r % 3) * 6); ctx.bezierCurveTo(x - 30 + r * 7, gy - 90, x + 20 - r * 9, gy - 60, x - 26 + r * 9, gy + 2 + (open ? (1 - k) * 30 : 0)); ctx.stroke(); }
      ctx.strokeStyle = '#6a3a30'; ctx.lineWidth = 2; for (let r = 0; r < 7; r++) { ctx.beginPath(); ctx.moveTo(x - 33 + r * 11, gy - 138 + (r % 3) * 6); ctx.bezierCurveTo(x - 29 + r * 7, gy - 90, x + 21 - r * 9, gy - 60, x - 25 + r * 9, gy); ctx.stroke(); }
      ctx.restore();
    }
    if (k > 0) {   // the moths at work
      g.rootsT -= 1 / 60;
      for (let m = 0; m < 90; m++) { const a = t * (2 + (m % 5) * 0.4) + m * 1.7, rr = 16 + (m % 11) * 8, mx = Math.round(x + Math.cos(a) * rr), my = Math.round(gy - 75 + Math.sin(a * 1.3) * rr * 1.1), flap = Math.floor(t * 20 + m) % 2; ctx.fillStyle = m % 3 ? 'rgba(232,222,200,0.95)' : 'rgba(190,170,150,0.95)'; ctx.fillRect(mx - 3, my - (flap ? 2 : 0), 3, 2); ctx.fillRect(mx + 1, my - (flap ? 2 : 0), 3, 2); ctx.fillStyle = '#3a2a20'; ctx.fillRect(mx, my, 1, 2); }   // a white storm of moths
    }
  };
  const prevDraw = G.swamp.drawBack;
  G.swamp.drawBack = (ctx, g, t) => { prevDraw(ctx, g, t); drawDoor(ctx, g, t); };

  // ---------------------------------------------------------------------------
  // Nell as a companion: collared, she walks a few steps behind the knight,
  // through every place he goes, and sends her moths at whatever fights him.
  // ---------------------------------------------------------------------------
  const LINES = {
    follow: ['Yes, master.', 'I am coming.', 'Where you go.'],
    swarm: ['Children. There.', 'Go. Eat.', 'Take that one.'],
    idle: ['...', 'The chain is cold.', 'It is very dark, master. Even with her.', 'I can hear them weeping, under the ground. Always.'],
  };
  G.FAIRY.nellJab = ['Walk faster, moth. You are holding up the parade.', 'Do not look at me. I am not the one who put a collar on you.', 'She is very quiet. I like her better quiet.'];
  G.companion = {
    s: null,
    on(g) { return !!(g.flags.nell_bound && g.flags.nell_follow); },
    place(g) { const p = g.player; this.s = { x: p.x - p.facing * 70, vx: 0, facing: p.facing, cd: 2, say: null, sayT: 0, idleT: 18, swarms: [], walk: 0 }; },
    sayLine(t) { if (this.s) { this.s.say = t; this.s.sayT = 2.4 + t.length * 0.04; } },
    tick(g, dt) {
      if (!this.on(g) || g.inside) return;
      if (!this.s) this.place(g);
      const S = this.s, p = g.player;
      // follow: keep a few paces behind him, on the ground
      const want = p.x - p.facing * 64, d = want - S.x;
      S.vx = S.cast ? 0 : Math.abs(d) > 14 ? Math.sign(d) * Math.min(220, Math.abs(d) * 3) : 0; S.x += S.vx * dt; S.walk += Math.abs(S.vx) * dt * 0.1;
      if (Math.abs(p.x - S.x) > 500) S.x = p.x - p.facing * 64;   // she does not get left behind
      if (!S.cast) S.facing = Math.abs(S.vx) > 5 ? Math.sign(S.vx) : (p.x >= S.x ? 1 : -1);
      if (S.say && (S.sayT -= dt) <= 0) S.say = null;
      // the swarm: every few seconds, at the nearest thing fighting him
      S.cd -= dt;
      if (S.cd <= 0) {
        let best = null, bd = 300;
        for (const e of g.enemies) { if (e.dead || e.dormant || e.state === 'idle' || e.state === 'broken' || e.state === 'executed' || e.type === 'moth' || e.type === 'bloodfly') continue; const dd = Math.abs(e.x - S.x); if (dd < bd) { bd = dd; best = e; } }
        if (best) { S.cd = 3.6 + Math.random() * 0.8; S.cast = { t: 0, e: best }; S.facing = best.x >= S.x ? 1 : -1; G.sfx('chime'); if (Math.random() < 0.35) this.sayLine(G.pick(LINES.swarm)); }
        else S.cd = 0.5;
      }
      if (S.cast) {   // 0-0.45 gather with both hands raised; at 0.45 the swarm leaves her outstretched hand; 0.45-0.8 hold; then let the arm fall
        const C = S.cast; C.t += dt; S.vx = 0; if (C.e && !C.e.dead) S.facing = C.e.x >= S.x ? 1 : -1;
        if (!C.sent && C.t >= 0.45) { C.sent = true; if (C.e && !C.e.dead) { S.swarms.push({ x: S.x + S.facing * 18, y: G.GROUND - 40, e: C.e, t: 0 }); G.sfx('whoosh'); g.shake = Math.max(g.shake, 2); } }
        if (C.t >= 0.85) S.cast = null;
      }
      for (let i = S.swarms.length - 1; i >= 0; i--) {
        const w = S.swarms[i], e = w.e; w.t += dt;
        if (!e || e.dead) { S.swarms.splice(i, 1); continue; }
        const tx = e.x, ty = G.GROUND - (e.alt || 0) - 50 * e.scale, k = Math.min(1, dt * 4);
        w.x += (tx - w.x) * k; w.y += (ty - w.y) * k;
        if (Math.hypot(tx - w.x, ty - w.y) < 20 || w.t > 1.2) {
          e.takeHit(e.def.boss ? 9 : 16, { sever: 0, quiet: true, noStagger: !!e.def.boss }, w.x <= e.x ? 1 : -1, g, { bleed: 14 });
          G.text(e.x, G.GROUND - 120 * e.scale, 'SWARMED', '#e8dcc0', 12); S.swarms.splice(i, 1);
        }
      }
      if ((S.idleT -= dt) <= 0) { S.idleT = 20 + Math.random() * 15; if (Math.random() < 0.5) this.sayLine(G.pick(LINES.idle)); else { g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.nellJab)); } }
    },
    draw(ctx, g, t) {
      if (!this.on(g) || g.inside || !this.s || !G.drawMothGirlSprite) return;
      const S = this.s, gy = G.GROUND, walking = Math.abs(S.vx) > 5;
      this.mg = this.mg || { id: 9, def: { scale: 0.95 }, limbs: { head: {}, armF: {}, armB: {} }, wingless: true, flash: 0, alt: 0, dead: false };
      const C = S.cast, ct = C ? C.t : 0, cast = C && ct < 0.45 ? Math.min(1, ct / 0.3) : 0, point = C && ct >= 0.45 ? Math.max(0, 1 - Math.max(0, ct - 0.65) / 0.2) : 0;
      Object.assign(this.mg, { x: S.x, alt: walking ? Math.abs(Math.sin(S.walk * 3)) * 3 : cast * 4, facing: S.facing, state: 'chase', calm: true, cast, point });
      if (cast > 0) {   // moths spiralling in to her raised hands, and a pale glow gathering
        const hx = S.x, hy = gy - 76 - cast * 10, gl = ctx.createRadialGradient(hx, hy, 2, hx, hy, 40); gl.addColorStop(0, `rgba(255,236,190,${0.5 * cast})`); gl.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = gl; ctx.fillRect(hx - 40, hy - 40, 80, 80);
        for (let m = 0; m < 14; m++) { const a = t * 7 + m * 0.45, r = (1 - cast) * 50 + 8 + (m % 3) * 4; ctx.fillStyle = m % 3 ? '#e8dcc0' : '#b8a888'; ctx.fillRect(Math.round(hx + Math.cos(a) * r) - 1, Math.round(hy + Math.sin(a) * r * 0.7), 3, 2); }
      }
      G.drawMothGirlSprite(ctx, this.mg, t);
      if (point > 0.5 && ct < 0.6) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; for (let m = 0; m < 8; m++) ctx.fillRect(Math.round(S.x + S.facing * (22 + m * 5)), Math.round(gy - 52 + Math.sin(m * 2 + t * 30) * 4), 3, 2); }   // the burst from her hand
      // the collar, and the chain running to his hand
      const p = g.player, cx = S.x, cy = gy - 38 - this.mg.alt, hx = p.x - p.facing * 4, hy = gy - 46 - (p.alt || 0);
      ctx.fillStyle = '#3a3438'; ctx.fillRect(cx - 6, cy, 12, 4); ctx.fillStyle = '#8a848c'; ctx.fillRect(cx - 6, cy, 12, 1); ctx.fillRect(cx - 1, cy + 3, 2, 2);
      ctx.fillStyle = '#5a5458'; const sag = Math.max(6, 30 - Math.abs(hx - cx) * 0.25);
      for (let k = 1; k < 14; k++) { const u = k / 14, x = cx + (hx - cx) * u, y = cy + 3 + (hy - cy - 3) * u + Math.sin(u * Math.PI) * sag; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 2); }
      // her moths in flight
      for (const w of S.swarms) for (let m = 0; m < 12; m++) { const a = t * 9 + m * 1.9, r = 6 + (m % 4) * 4, x = w.x + Math.cos(a) * r, y = w.y + Math.sin(a * 1.3) * r, f = Math.floor(t * 20 + m) % 2; ctx.fillStyle = m % 3 ? '#e8dcc0' : '#b8a888'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - (f ? 1 : 0), 2, 2); ctx.fillRect(Math.round(x) + 1, Math.round(y) - (f ? 1 : 0), 2, 2); }
      if (S.say) {
        ctx.font = '16px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center'; const w = ctx.measureText(S.say).width + 16, bx = S.x, by = gy - 108;
        ctx.globalAlpha = Math.min(1, S.sayT * 3); ctx.fillStyle = 'rgba(20,14,10,0.88)'; ctx.fillRect(bx - w / 2, by - 18, w, 24); ctx.strokeStyle = '#a08870'; ctx.lineWidth = 1; ctx.strokeRect(bx - w / 2 + 0.5, by - 17.5, w, 24); ctx.fillStyle = '#e8dcc0'; ctx.fillText(S.say, bx, by); ctx.globalAlpha = 1;
      }
    },
    // speak to her on the road: keep her with you, or send her back to the hut
    prompt(g) {
      if (!this.on(g) || g.inside || !this.s || Math.abs(g.player.x - this.s.x) > 50) return null;
      return { x: this.s.x, y: G.GROUND - 120, label: 'Speak to Nell', fn: () => G.ui.choice('Nell waits at the end of her chain.', [
        { label: 'Keep walking <small>— she follows</small>', fn: () => this.sayLine(G.pick(LINES.follow)) },
        { label: 'Send her back to Wren\'s hut <small>— she waits there, chained</small>', fn: () => { g.flags.nell_follow = 0; this.s = null; g.save(); G.text(g.player.x, G.GROUND - 130, 'Nell goes back to the hut', '#d9c9b0', 14); } },
      ]) };
    },
  };
  // and at the hut, chained, she can be called to follow again
  G.NELL.callAgain = g => G.ui.choice('Nell sits chained by the hut.', [
    { label: 'Take her with you <small>— she follows on her chain</small>', fn: () => { g.flags.nell_follow = 1; G.companion.place(g); g.save(); G.companion.sayLine('Yes, master.'); } },
    { label: 'Leave her here', fn: () => {} },
  ]);
})();
