'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — Wist, the "guide". A small lavender fairy who follows the
// knight, offers advice that is mostly bad, and is waiting to watch him die.
// ---------------------------------------------------------------------------
G.FAIRY = {
  intro: [
    ['Wist', 'Oh! A live one. And so shiny.'],
    ['Wist', 'I am Wist. I guide lost knights along the gallows road. I have guided ever so many.'],
    ['Aldric', 'Where are they now?'],
    ['Wist', 'Oh, here and there. Mostly there. Under things.'],
    ['Wist', 'Walk on, ser knight. I shall be right behind you. I would not miss it for the world.'],
  ],
  boss: [['Wist', 'Ooh, this one. I have such hopes for this one. Do stand nice and still for him.']],
  choice: [['Wist', 'Give it, keep it — I do not mind. Only hurry up and die of something. I have been so patient.']],
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

G.Fairy = class {
  constructor() { this.x = 0; this.y = 0; this.t = Math.random() * 9; this.say = null; this.sayT = 0; this.cd = 3; this.idleT = 16; this.facing = 1; this.glee = 0; this.lowSaid = false; this.motes = []; this.last = {}; }
  place(p) { this.x = p.x - 60; this.y = G.GROUND - 120; this.say = null; this.cd = 3; this.idleT = 14; }

  // Say a random line of the given kind in a speech bubble.
  bark(kind, force, chance = 1) {
    if ((!force && (this.cd > 0 || Math.random() > chance)) || G.ui.blocking) return;
    const lines = G.FAIRY[kind]; let s;
    do s = G.pick(lines); while (lines.length > 1 && s === this.last[kind]);
    this.last[kind] = s; this.say = s; this.sayT = 2.6 + s.length * 0.045; this.cd = this.sayT + 3;
    const cruel = kind === 'hurt' || kind === 'death' || kind === 'low' || kind === 'gore' || kind === 'npcdeath' || kind === 'turning';
    if (cruel) this.glee = 2.5;
    G.sfx(cruel ? 'giggle' : 'chime');
  }

  update(dt, g) {
    const p = g.player, gy = G.GROUND;
    this.t += dt; this.cd -= dt; this.glee -= dt;
    if (this.say && (this.sayT -= dt) <= 0) this.say = null;
    const fight = g.enemies.some(e => !e.dead && !e.dormant && e.state !== 'idle' && e.state !== 'broken' && Math.abs(e.x - p.x) < 320);
    // hover behind the knight; keep well clear of the fighting; lean in close to enjoy a death
    let tx = p.x - p.facing * (fight ? 96 : 50), ty = gy - (fight ? 168 : 118);
    if (p.dead) { tx = p.x + 26; ty = gy - 52; }
    tx += Math.sin(this.t * 0.9) * 10; ty += Math.sin(this.t * 2.3) * 7;
    const k = Math.min(1, dt * (p.dead ? 1.6 : 3.2));
    this.x += (tx - this.x) * k; this.y += (ty - this.y) * k;
    if (Math.abs(p.x - this.x) > 4) this.facing = p.x > this.x ? 1 : -1;
    // dust falling from her wings
    if (Math.random() < dt * 14) this.motes.push({ x: this.x + G.rand(-12, 12), y: this.y + G.rand(-8, 10), t: 0 });
    for (let i = this.motes.length - 1; i >= 0; i--) { const m = this.motes[i]; m.t += dt; m.y += 16 * dt; if (m.t > 1.1) this.motes.splice(i, 1); }
    if (p.dead) return;
    if (p.hp < p.maxHp * 0.35) { if (!this.lowSaid) { this.lowSaid = true; this.bark('low', true); } } else if (p.hp > p.maxHp * 0.5) this.lowSaid = false;
    if (!fight && !this.say && (this.idleT -= dt) <= 0) { this.idleT = G.rand(16, 28); this.bark('idle'); }
  }

  draw(ctx, g) {
    const t = this.t, glee = this.glee > 0 || g.player.dead;
    // motes
    for (const m of this.motes) { ctx.fillStyle = `rgba(214,190,255,${0.8 * (1 - m.t / 1.1)})`; ctx.fillRect(m.x, m.y, 1.6, 1.6); }
    ctx.save(); ctx.translate(this.x, this.y);
    const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 46);
    gl.addColorStop(0, glee ? 'rgba(210,120,220,0.34)' : 'rgba(180,150,240,0.3)'); gl.addColorStop(1, 'rgba(180,150,240,0)');
    ctx.fillStyle = gl; ctx.fillRect(-46, -46, 92, 92);
    ctx.restore();
    // the fairy herself is drawn as vectors into a half-size buffer and shown as an outlined pixel sprite
    const main = ctx; ctx = G.pixBegin(0, 0); ctx.save();
    ctx.scale(this.facing * 1.4, 1.4); ctx.rotate(0.12); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // wings: two long pairs, fluttering
    const flap = Math.sin(t * 34) * 0.22;
    const wing = (ang, len, wid) => {
      ctx.save(); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.35, -wid, len, -wid * 0.15); ctx.quadraticCurveTo(len * 0.5, wid * 0.9, 0, 0);
      ctx.fillStyle = 'rgba(176,144,232,0.5)'; ctx.fill(); ctx.strokeStyle = 'rgba(236,224,255,0.85)'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len * 0.85, -wid * 0.1); ctx.stroke(); ctx.restore();
    };
    ctx.save(); ctx.translate(-2, -6);
    wing(Math.PI + 0.55 + flap, 34, 9); wing(Math.PI - 0.35 - flap, 26, 8); wing(-0.6 - flap, 34, 9); wing(0.4 + flap, 26, 8);
    ctx.restore();
    // long white hair, trailing behind
    const sway = Math.sin(t * 2.6) * 2.5;
    ctx.fillStyle = '#f3f0fa'; ctx.beginPath(); ctx.moveTo(-6, -17); ctx.quadraticCurveTo(-14 + sway, -2, -11 + sway * 1.4, 20);
    ctx.lineTo(-7 + sway, 13); ctx.lineTo(-5 + sway * 1.2, 23); ctx.lineTo(-2, 10); ctx.quadraticCurveTo(-1, -6, 4, -16); ctx.closePath(); ctx.fill();
    // legs: pale, one tucked up, little dark boots
    ctx.strokeStyle = '#e9dfe6'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-1, 8); ctx.lineTo(-2, 17); ctx.moveTo(2, 8); ctx.lineTo(5, 13); ctx.lineTo(1, 16); ctx.stroke();
    ctx.strokeStyle = '#1c1026'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-2, 17); ctx.lineTo(-1, 19.5); ctx.moveTo(1, 16); ctx.lineTo(-0.5, 17.5); ctx.stroke();
    // arms in long dark sleeves, spread wide
    ctx.strokeStyle = '#2a1838'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(-10, -5 + flap * 6); ctx.moveTo(0, -7); ctx.lineTo(10, -9 - flap * 6); ctx.stroke();
    ctx.fillStyle = '#efe6ec'; ctx.beginPath(); ctx.arc(-10.5, -5 + flap * 6, 1.4, 0, 7); ctx.arc(10.5, -9 - flap * 6, 1.4, 0, 7); ctx.fill();
    // dress: dark plum gown with a lavender hem and sash
    ctx.fillStyle = '#2a1838'; ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(3, -9); ctx.lineTo(4, -1); ctx.lineTo(9, 10); ctx.quadraticCurveTo(0, 13, -8, 10); ctx.lineTo(-4, -1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b79be8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-8, 10); ctx.quadraticCurveTo(0, 13, 9, 10); ctx.moveTo(-4, -1.5); ctx.lineTo(4, -1.5); ctx.stroke();
    ctx.fillStyle = '#b79be8'; ctx.beginPath(); ctx.moveTo(0, -8.5); ctx.lineTo(-2, -6); ctx.lineTo(2, -6); ctx.fill();
    // head, pointed ear, fringe
    ctx.fillStyle = '#efe6ec'; ctx.beginPath(); ctx.arc(0, -15, 6.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -15); ctx.lineTo(-11, -18); ctx.lineTo(-5, -12); ctx.fill();
    ctx.fillStyle = '#f3f0fa'; ctx.beginPath(); ctx.arc(0, -16, 6.6, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(4, -15); ctx.lineTo(2, -17); ctx.lineTo(0, -14.5); ctx.lineTo(-2, -17); ctx.lineTo(-5, -14); ctx.closePath(); ctx.fill();
    // two long stray strands
    ctx.strokeStyle = '#f3f0fa'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-2, -22); ctx.quadraticCurveTo(-9, -31, -13 + sway, -25); ctx.moveTo(2, -22); ctx.quadraticCurveTo(9, -32, 14 + sway, -27); ctx.stroke();
    // black lace headdress with lavender ribbons
    ctx.strokeStyle = '#1c1026'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, -16, 6.8, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
    ctx.fillStyle = '#b79be8'; ctx.fillRect(-7.5, -18.5, 2.6, 2.6); ctx.fillRect(5, -18.5, 2.6, 2.6);
    // face: sweet until something bleeds
    ctx.fillStyle = glee ? '#d0122a' : '#8a5fd0';
    if (glee) { ctx.shadowColor = '#ff2a3a'; ctx.shadowBlur = 6; }
    ctx.fillRect(-0.4, -16, 1.7, 3); ctx.fillRect(3.4, -16, 1.7, 3); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#5a1030'; ctx.lineWidth = 0.9; ctx.beginPath();
    if (glee) ctx.arc(2.7, -12.6, 2.3, 0.1, Math.PI - 0.1); else ctx.arc(2.7, -12.4, 1.1, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
    G.pixEnd(main, this.x, this.y); ctx = main;
    // speech bubble
    if (this.say) {
      ctx.font = 'italic 13px Georgia, serif'; ctx.textAlign = 'left';
      const words = this.say.split(' '), lines = [''];
      for (const w of words) { const l = lines[lines.length - 1]; if (ctx.measureText(l + ' ' + w).width > 200 && l) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; }
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 18, h = lines.length * 16 + 10;
      const bx = G.clamp(this.x - w / 2, g.cam + 8, g.cam + G.W - w - 8), by = Math.max(8, this.y - 50 - h);
      ctx.globalAlpha = G.clamp(this.sayT * 3, 0, 1);
      ctx.fillStyle = 'rgba(14,8,22,0.88)'; ctx.fillRect(bx, by, w, h); ctx.strokeStyle = '#7a5fb0'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, w, h);
      ctx.fillStyle = '#d8c6ff'; lines.forEach((l, i) => ctx.fillText(l, bx + 9, by + 18 + i * 16));
      ctx.globalAlpha = 1;
    }
  }
};
