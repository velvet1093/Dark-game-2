'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Lost Battlegrounds, north of the Weeping Fen.
//
// Forty years ago King Edmar, Osric's father, broke the Marcher lords here in a
// single day of fog. Nine thousand died. The King forbade the traitors their
// names, so both sides went into the ground together, under blank stones. Now
// the weeping has come up through the field and the dead climb out of their
// graves as you pass, and the Lord-Marshal of the Marches still holds the hill.
// One old woman has spent those forty years carving the names back.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM;
  Object.assign(G.LOOKS, {
    tamsin: { soft: 1, skin: '#c0b0a0', body: '#3a3430', arm: '#3a3430', leg: '#2a2622', helm: 'hood', helmCol: '#5a544e', hair: '#d8d4cc' },
  });
  Object.assign(G.ENEMIES, {
    fallen: {
      name: 'Fallen of the Marches', hp: 96, limbHp: 38, speed: 62, ichor: 60, aggro: 380, weapon: 'sword', wlen: 38, hunch: 0.12, rises: true,
      look: { skin: '#6a7468', body: '#5a1a18', trim: '#8a7a50', arm: '#3a3e40', leg: '#2a2c2e', helm: 'helm', helmCol: '#5a4e42', plume: '#2a0a0a', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.42, active: 0.1, rec: 0.5, dmg: 17, reach: 70, lunge: 150, anim: A.chop },
        { wind: 0.6, active: 0.12, rec: 0.7, dmg: 22, reach: 96, trigger: 160, min: 80, lunge: 340, anim: A.thrust },
      ],
    },
    halberd: {
      name: 'Halberdier of King Edmar', hp: 112, limbHp: 42, speed: 50, ichor: 70, aggro: 400, weapon: 'spear', wlen: 70, hunch: 0.08, rises: true,
      look: { skin: '#6e766c', body: '#6a5a2a', trim: '#2a2418', arm: '#4a4a44', leg: '#2e2c26', helm: 'coif', helmCol: '#5a5e5a', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.62, active: 0.14, rec: 0.7, dmg: 24, reach: 124, trigger: 150, min: 60, lunge: 120, anim: A.thrust },
        { wind: 0.55, active: 0.14, rec: 0.6, dmg: 19, reach: 104, lunge: 90, anim: A.chop },
      ],
    },
    marshal: {
      name: 'Lord-Marshal Aldous Vane', boss: true, hp: 620, limbHp: 160, speed: 74, ichor: 1400, aggro: 9999,
      weapon: 'greatsword', wlen: 66, scale: 1.45, poise: true, noSever: ['armF', 'legF', 'legB'], shout: 'NO QUARTER!',
      summon: { type: 'fallen', at: [0.66, 0.33], n: 2, text: 'FORM THE LINE' },
      look: { skin: '#7a847e', body: '#5a1a18', trim: '#8a7a50', arm: '#4a4440', leg: '#2a2624', helm: 'helm', helmCol: '#5a5048', plume: '#3a0a0a', cape: '#4a1010', eye: '#ff3b2f' },
      attacks: [
        { wind: 0.5, active: 0.12, rec: 0.55, dmg: 28, reach: 114, lunge: 170, anim: A.chop },
        { wind: 0.46, active: 0.12, rec: 0.6, dmg: 27, reach: 114, lunge: 170, anim: A.rise },
        { wind: 0.8, active: 0.2, rec: 0.9, dmg: 34, reach: 120, trigger: 320, min: 140, lunge: 760, anim: A.thrust },   // the charge, the length of the field
        { wind: 0.95, active: 0.14, rec: 1.0, dmg: 48, reach: 130, lunge: 200, anim: A.slam },
      ],
    },
  });
  G.ICON_NAMES.push('The Saint Among the Stones', 'The Saint Who Carried the Wounded');
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
  G.BESTIARY_EXTRA.foes.push(
    ['fallen', 'The Marcher dead, in the red of their lords. They were buried without names, and the weeping has found them. They climb out of the ground as you pass.', 'Watch the disturbed earth. They cannot be struck until they stand.'],
    ['halberd', 'The King\'s men, who won, and were buried in the same field as the men they killed, under the same blank stones.', 'The halberd reaches far. Get inside it.'],
  );
  G.BESTIARY_EXTRA.bosses.push(
    ['marshal', 'Lord-Marshal of the Marches. He surrendered at dusk on the last day, and King Edmar hanged him anyway, and struck his name. He has been holding the hill since.', 'His charge crosses half the field. Step aside, and strike while he turns.'],
  );
  G.BESTIARY_EXTRA.people.push(
    { id: 'tamsin', name: 'Tamsin the Stonecutter', look: 'tamsin', text: 'A Marcher widow. For forty years she has carved the names of the dead into the blank stones of the battlefield, one a week. The women came and told her who lay where.' },
  );

  // ---- the way in: an old shield-road north out of the fen
  const BG = G.LEVELS.length, FEN = 2;
  G.LEVELS[FEN].passages = (G.LEVELS[FEN].passages || []).concat([{ x: 4560, to: BG, at: 120, label: 'Take the shield-road north',
    wist: 'Fog. Lovely. And under the fog, can you smell it? Old iron, and older bones.',
    slides: ['An old road leads north out of the fen, paved with shields trodden into the mud.\n\nIt climbs into fog so thick you can hear it. Then the stones begin: first one, then a row, then rows past counting, every way you look.'] }]);

  G.LEVELS.push({
    name: 'The Lost Battlegrounds', chapter: 'North of the Weeping Fen', theme: 'battlefield', length: 5200, seed: 233,
    back: { to: FEN, at: 4620 }, backLabel: 'Back down the shield-road to the fen',
    shrines: [240, 2700], statues: [{ x: 1180 }],
    enemies: [['fallen', 620, 'grave'], ['fallen', 900, 'grave'], ['crow', 1020], ['halberd', 1300], ['fallen', 1520, 'grave'], ['fallen', 1590, 'grave'], ['hound', 1820], ['hound', 1870], ['halberd', 2150, 'grave'], ['fallen', 2380, 'grave'],
      ['fallen', 3050, 'grave'], ['halberd', 3200], ['fallen', 3380, 'grave'], ['fallen', 3440, 'grave'], ['crow', 3600], ['crow', 3660], ['fallen', 3880, 'grave'], ['halberd', 4020, 'grave'], ['fallen', 4120, 'unfair'], ['halberd', 4160, 'unfair']],
    npcs: [{ id: 'tamsin', x: 2860, name: 'Tamsin the Stonecutter', look: 'tamsin', pose: 'kneel', essential: true,
      lines: [
        ['Tamsin', 'Mind the stones, ser. Mind where you put your feet. Every one of them is somebody.'],
        ['Tamsin', 'Forty years ago this was a barley field. King Edmar met the Marcher lords here, in a fog like this one. By dark there were nine thousand dead and the barley was red to the knee.'],
        ['Tamsin', 'The King said traitors do not keep their names. So they dug one long ditch and put them all in it, his men and ours together, and stood blank stones on top so nobody could mourn the wrong man.'],
        ['Knight', 'And you carve them.'],
        ['Tamsin', 'The women came to me, after. Every widow and every mother. "My Hob went down by the elm." "My boys were in the second line." I wrote it all down. And I carve. One a week. Three thousand one hundred and twelve.'],
        ['Tamsin', 'But they will not lie still now. Not since the weeping. They climb up out of the ground, and the ones with blank stones climb first. Like they are looking for something.'],
        ['Misery', 'Their names. Obviously. You lot never listen.'],
        ['Tamsin', 'And the Marshal is up on the hill. Lord Vane. He gave up his sword at dusk and they hanged him anyway. He is still holding the hill. He has been holding it for forty years.'],
      ],
      repeat: [['Tamsin', 'Three thousand one hundred and twelve. My hands are not what they were.']],
      repeatBound: [['Tamsin', 'That girl at your heel has iron round her throat. ...I have carved a lot of stones for people who were somebody\'s property, ser. Mind that.']] }],
    lore: [
      { x: 520, title: 'A Blank Headstone', text: 'Nothing is carved on it. Nothing on the next, or the next, or the one after that.\n\nThe ground in front of it has been dug at from underneath.' },
      { x: 1450, title: 'Order of the Day, King Edmar', text: 'The Marcher lords are traitors to the Sun. No quarter. No ransom. No names: no traitor shall lie under his name in the King\'s earth.\n\nEDMAR, BY THE GRACE OF THE SUN\n\nScratched below, in another hand: and who will tell which of us is which, when we are all bones?' },
      { x: 2420, title: 'A Letter, Folded in a Helm', text: 'Annet. If this finds you I am in the second line by the elm, with Hob and the Carrow boys. The fog is so thick I cannot see the King\'s men, only hear them. They sound like us. They are singing the same hymn we are.\n\nKiss the little one. Tell her my name, so she has it.' },
      { x: 3000, title: 'Tamsin\'s Tally', text: 'A slate, propped on a stone, chalked in rows of five.\n\n3,112 carved.\n5,888 to go.\n\nUnder it, older and smaller: I will not finish. Somebody else must.' },
      { x: 4280, title: 'The Marshal\'s Surrender', text: 'A sword, snapped, laid on a flat stone, with a cord tied round the hilt. The cord is a hangman\'s knot.\n\nCut into the stone beside it, deep and recent, as if with a blade and not a chisel:\n\nI YIELDED' },
    ],
    items: [{ x: 4880, relic: 1, relicName: 'Relic of the Red Banner', needs: 'boss_marshal_dead' }, { x: 1700, alt: 140, relic: 1, relicName: 'Relic of the Nine Thousand' }, { x: 2050, icon: 1 }, { x: 3550, alt: 72, icon: 1 }, { x: 3300, cache: 320 }],
    platforms: [{ x: 1620, w: 140, h: 72 }, { x: 1670, w: 70, h: 140 }, { x: 3490, w: 120, h: 72 }],
    pits: [{ x: 1100, w: 70 }, { x: 2560, w: 74 }, { x: 3760, w: 70 }],
    boss: {
      type: 'marshal', gate: 4400, x: 4720, end: 5000,
      intro: [
        ['Misery', 'Fog, graves, more fog. And a man on a hill who has not noticed the war is over.'],
        ['Lord-Marshal Vane', 'Halt. Name and company.'],
        ['Knight', 'I have no name.'],
        ['Lord-Marshal Vane', 'Then you are one of mine. They took ours too, at the end. Fall in.'],
        ['Knight', 'The war is forty years done, Marshal.'],
        ['Lord-Marshal Vane', 'I yielded once. They hanged me for it. I will not yield again. FORM THE LINE!'],
      ],
      introNamed: [
        ['Lord-Marshal Vane', 'Halt. Name and company.'],
        ['Knight', 'Corin. Of the Long Battalion.'],
        ['Lord-Marshal Vane', 'A name. You walk onto MY field with a NAME, when nine thousand lie here without one?'],
        ['Lord-Marshal Vane', 'I yielded once. They hanged me for it. I will not yield again. FORM THE LINE!'],
      ],
      retry: [['Lord-Marshal Vane', 'Again. Hold the line!']],
      lastWords: [['Lord-Marshal Vane', 'Nine thousand. And I could not tell you one of their names.'], ['Lord-Marshal Vane', 'Tell the stonecutter... carve mine last.']],
      spare: { kind: 'yield', lines: [
        ['Knight', 'You yielded, Marshal. I accept it. It is over.'],
        ['Lord-Marshal Vane', '...Accepted.'],
        ['Lord-Marshal Vane', 'He drives his greatsword into the earth beside the nearest blank stone, kneels by it, and is still. The fog closes over him. All across the field, very quietly, the dead lie back down.'],
      ] },
    },
  });

  // ---- Tamsin's quest
  G.QUESTS.stones = {
    title: 'Nine Thousand Stones', start: { talk: 'tamsin' }, giver: 'tamsin', reward: { ichor: 600, flask: 1 }, doneFlag: 'stones_done',
    steps: [
      { type: 'kill', enemy: 'fallen', level: BG, n: 8, text: 'Lay eight of the Fallen of the Marches back in the ground' },
      { type: 'flag', flag: 'boss_marshal_dead', text: 'Bring Lord-Marshal Vane down off the hill' },
      { type: 'talk', npc: 'tamsin', text: 'Tell Tamsin the hill is quiet', lines: [
        ['Knight', 'The Marshal is down. The hill is quiet.'],
        ['Tamsin', '...Forty years. I could hear him, you know. Every night. Shouting the line to hold.'],
        ['Tamsin', 'Here. Take this. The widows\' book: every name they ever told me, and where the man lay. Nine thousand, near enough. I have only carved a third.'],
        ['Tamsin', 'You are going somewhere they need names, I think. I can see it on you. Take them there. Say them out loud. It is what they were climbing up for.'],
        ['Misery', 'Nine thousand more names to carry. Your arms are going to be SO tired.'],
      ] },
    ],
  };

  // ---- the dead climb out of their graves as you pass
  const EP = G.Enemy.prototype, EU = EP.update, ED = EP.draw, ET = EP.takeHit;
  EP.update = function (dt, g) {
    if (this.buried == null) { this.buried = (this.tag === 'grave' || (g.bossFight && this.def.rises && this.state === 'chase')) ? 1 : 0; if (this.buried) { this.dormant = true; this.rising = !!g.bossFight; this.clods = []; } }
    if (this.buried > 0) {
      const p = g.player; this.t += dt; this.facing = p.x >= this.x ? 1 : -1; this.vx = 0;
      if (!this.rising && !p.dead && Math.abs(p.x - this.x) < 240 && Math.abs((p.alt || 0) - this.alt) < 100) { this.rising = true; G.sfx('thud'); G.sfx('growl'); }
      if (this.rising) {
        this.buried = Math.max(0, this.buried - dt / 1.1);
        if (Math.random() < dt * 30) this.clods.push({ x: this.x + (Math.random() - 0.5) * 40, y: 0, vx: (Math.random() - 0.5) * 120, vy: 120 + Math.random() * 160, t: 0 });
        if (this.buried === 0) { this.dormant = false; this.set('chase'); this.cd = 0.5; }
      }
      return;
    }
    return EU.call(this, dt, g);
  };
  EP.takeHit = function (...a) { if (this.buried > 0) return; return ET.apply(this, a); };
  EP.draw = function (ctx, g) {
    const gy = G.GROUND, bur = this.buried > 0 ? this.buried : 0, inter = this.interT != null;
    if (inter) this.interT = Math.min(2, this.interT + 1 / 60);
    const down = bur ? G.ease(bur) * (110 * this.scale) : inter ? G.ease(Math.min(1, this.interT / 1.6)) * 150 * this.scale : 0;
    if (bur && !this.rising) {   // only the grave shows: a heap of loose earth, and now and then a hand
      ctx.fillStyle = '#1a1612'; ctx.beginPath(); ctx.ellipse(this.x, gy + 1, 26, 6, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2a241e'; ctx.fillRect(this.x - 14, gy - 4, 6, 2); ctx.fillRect(this.x + 6, gy - 3, 8, 2);
      const tw = Math.sin(g.time * 1.3 + this.id * 2.1); if (tw > 0.92) { ctx.fillStyle = this.def.look.skin; ctx.fillRect(this.x - 2 + (this.id % 3) * 4, gy - 8 - Math.round((tw - 0.92) * 120), 3, 8); }
      return;
    }
    if (down > 0) { ctx.save(); ctx.beginPath(); ctx.rect(this.x - 300, -2000, 600, gy + 2000 + 1); ctx.clip(); ctx.translate(0, Math.round(down / 2) * 2); }
    ED.call(this, ctx, g);
    if (down > 0) ctx.restore();
    if (bur || (inter && this.interT < 1.8)) {   // the earth breaking, and clods thrown up
      ctx.fillStyle = '#1a1612'; ctx.beginPath(); ctx.ellipse(this.x, gy + 1, 30, 7, 0, Math.PI, 0); ctx.fill();
      if (inter && Math.random() < 0.5) (this.clods = this.clods || []).push({ x: this.x + (Math.random() - 0.5) * 50, y: 0, vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 90, t: 0 });
    }
    if (this.clods && this.clods.length) {
      ctx.fillStyle = '#2a221a';
      for (const c of this.clods) { c.t += 1 / 60; c.x += c.vx / 60; c.vy -= 600 / 60; c.y += c.vy / 60; ctx.fillRect(Math.round(c.x / 2) * 2, Math.round((gy - Math.max(0, c.y)) / 2) * 2, 4, 4); }
      this.clods = this.clods.filter(c => c.y > 0 || c.t < 0.1);
    }
    if (inter && this.interT < 2) {   // the fog closing over the place
      const k = Math.min(1, this.interT / 1.2), fg = ctx.createRadialGradient(this.x, gy - 20, 4, this.x, gy - 20, 110);
      fg.addColorStop(0, `rgba(170,180,176,${0.45 * k * (2 - this.interT)})`); fg.addColorStop(1, 'rgba(170,180,176,0)'); ctx.fillStyle = fg; ctx.fillRect(this.x - 110, gy - 130, 220, 160);
    }
  };

  // ---- the Marshal's death: the pommel to the helm drops him to his knees, then a thrust through, and the field takes him back
  const BASE = { armA: 0.2, armE: 0.3, w: 0.6, lean: 0, crouch: 0, footF: 12, footB: -10, bA: 0.2, bE: 0.9, head: 0 };
  const K = (t, o) => [t, o];
  G.EXECS.interred = { dur: 2.5, hits: [0.5, 1.45], text: 'THE LAST GRAVE',
    keys: [K(0, BASE), K(0.36, { armA: 3.4, armE: 0.2, w: 4.2, lean: -0.25 }), K(0.5, { armA: 0.95, armE: 0.1, w: 1.05, lean: 0.45 }), K(0.8, { armA: 0.95, armE: 0.1, w: 1.05, lean: 0.3 }),
      K(1.3, { armA: 2.6, armE: 1.4, w: 0.9, lean: -0.2, crouch: 4 }), K(1.45, { armA: 1.35, armE: 0.1, w: 1.35, lean: 0.55, crouch: 8, footF: 16, footB: -14 }), K(2.1, { armA: 1.35, armE: 0.1, w: 1.35, lean: 0.5, crouch: 8, footF: 16, footB: -14 }), K(2.5, BASE)],
    mid: (g, e, p) => { G.sfx('block'); G.sfx('guardbreak'); G.spark(e.x, G.GROUND - 120 * e.scale, 18); g.hitstop = 0.1; g.shake = 9; e.interKneel = true; G.text(e.x, G.GROUND - 160 * e.scale, 'TO HIS KNEES', '#d9c9b0', 15); },
    fin: (g, e) => { e.interT = 0; G.sfx('thud'); G.sfx('bell'); g.shake = 12; g.slow = 0.7; },
  };
  const EPose = EP.pose; EP.pose = function () { const P = EPose.call(this); if (this.interKneel) Object.assign(P, { sit: true, lean: 0.15, head: 0.5 }); return P; };
  const EK = G.execKindFor;
  G.execKindFor = (e, p) => e.type === 'marshal' ? { kind: 'interred', text: 'THE LAST GRAVE' } : EK(e, p);
})();
