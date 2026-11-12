'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Voice. A goddess speaks to the knight, and only to him. When
// she does, the world flashes gold. She has a few words for him in every place,
// at the candles, when he falls, and at the turns of the story; and sometimes
// Misery notices him listening to nothing.
// ---------------------------------------------------------------------------
(() => {
  const WHO = 'Aurelle';   // Aurelle of the Dawn, goddess of vows kept
  // her first words in each place, the first time he comes there
  const PLACES = [
    'East, little knight. Always east.',
    'Living people. Be gentle with them; they are frightened of you.',
    'The water remembers everyone who drowned in it.',
    'You were born here. I remember it. I remember you.',
    'She is waiting for you at the top. So am I.',
    'Your ship. You were so seasick, coming home.',
    'Bones. Do not be afraid of bones. They are only what is left.',
    'They washed so many. No one ever washed them.',
    'Lean into the wind. I am behind you.',
    'Something under the water is singing. Do not sing back.',
    'Ledgers. Names. Keep them in your mind; you will want them.',
    'It is still warm. Grief stays warm a long time.',
    'Seventy-one. Someone remembers them. Good.',
    'Listen to their hymn. I taught it to them, once, long ago.',
  ];
  const DEATH = ['Not yet. Rise.', 'Again. I will always lift you.', 'Up, little knight. I am not finished with you.', 'Breathe. Stand. Go on.'];
  const BOSS = ['It is over. Breathe.', 'One more door open.', 'You did what had to be done. I saw.'];
  G.FAIRY.voiceReact = ['Who are you nodding at? There is nobody there. ...Is there?', 'You went all stiff again. Hearing voices? How delicious.', 'Stop smiling at the air. It is unsettling, and that is MY job.', 'Something just made you feel better. I hate it.'];

  G.voice = {
    WHO,
    // the gold flash, and a sound like a struck glass
    flash() { const g = G.game; if (g) g.voiceFlash = 1; G.sfx('voice'); },
    // a whisper over the play, not stopping it
    say(text, react = 0.35) {
      const g = G.game; if (!g) return;
      g.whisper = { text, t: 0, dur: 2.4 + text.length * 0.05 }; this.flash();
      if (Math.random() < react && !g.fairyAway) setTimeout(() => { g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.voiceReact)); }, (g.whisper.dur + 0.4) * 1000);
    },
    once(key, text, react) { const g = G.game; if (!g || g.flags['voice_' + key]) return; g.flags['voice_' + key] = 1; this.say(text, react); },
    tick(g, dt) {
      if (g.voiceFlash > 0) g.voiceFlash = Math.max(0, g.voiceFlash - dt * 1.8);
      if (g.whisper && (g.whisper.t += dt) > g.whisper.dur) g.whisper = null;
      if (g.voiceQ && g.voiceQ.length && !g.whisper && !G.ui.blocking && g.card <= 0.05) { const [k, t] = g.voiceQ.shift(); this.once(k, t); }
    },
    queue(key, text) { const g = G.game; if (!g || g.flags['voice_' + key]) return; g.voiceQ = g.voiceQ || []; if (!g.voiceQ.some(q => q[0] === key)) g.voiceQ.push([key, text]); },
    place(idx) { if (PLACES[idx]) this.queue('lv' + idx, PLACES[idx]); },
    death() { const g = G.game; if (!g) return; if (!g.flags.voice_death) this.queue('death', DEATH[0]); else if (Math.random() < 0.3) setTimeout(() => this.say(G.pick(DEATH), 0.2), 1500); },
    boss() { if (Math.random() < 0.7) setTimeout(() => this.say(G.pick(BOSS), 0.3), 2600); },
    // drawn over everything: the flash, and her words in gold
    draw(ctx, g, W, H) {
      if (g.voiceFlash > 0 && g.player) {   // a shaft of dawn-light falls on the knight alone
        const k = g.voiceFlash, p = g.player, x = p.x - g.cam, fy = G.GROUND - (p.alt || 0), t = g.time;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const top = 0, wTop = 26, wBot = 70;
        const beam = ctx.createLinearGradient(0, top, 0, fy);
        beam.addColorStop(0, `rgba(255,214,120,${0.05 * k})`); beam.addColorStop(0.7, `rgba(255,220,140,${0.22 * k})`); beam.addColorStop(1, `rgba(255,236,170,${0.42 * k})`);
        ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(x - wTop, top); ctx.lineTo(x + wTop, top); ctx.lineTo(x + wBot, fy + 6); ctx.lineTo(x - wBot, fy + 6); ctx.fill();
        ctx.fillStyle = `rgba(255,240,190,${0.18 * k})`; ctx.beginPath(); ctx.moveTo(x - wTop * 0.35, top); ctx.lineTo(x + wTop * 0.35, top); ctx.lineTo(x + wBot * 0.35, fy); ctx.lineTo(x - wBot * 0.35, fy); ctx.fill();   // the bright core
        const halo = ctx.createRadialGradient(x, fy - 50, 4, x, fy - 50, 90); halo.addColorStop(0, `rgba(255,232,160,${0.5 * k})`); halo.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = halo; ctx.fillRect(x - 90, fy - 140, 180, 180);
        const pool = ctx.createRadialGradient(x, fy, 2, x, fy, 80); pool.addColorStop(0, `rgba(255,226,150,${0.45 * k})`); pool.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = pool; ctx.save(); ctx.translate(x, fy); ctx.scale(1, 0.18); ctx.translate(-x, -fy); ctx.fillRect(x - 80, fy - 80, 160, 160); ctx.restore();
        ctx.fillStyle = `rgba(255,244,200,${0.9 * k})`;   // motes drifting down the shaft
        for (let i = 0; i < 16; i++) { const ph = (t * 0.35 + i * 0.13) % 1, yy = top + ph * (fy - top), half = wTop + (wBot - wTop) * ph; ctx.fillRect(Math.round(x + Math.sin(i * 7.3 + t) * half * 0.8), Math.round(yy), 2, 2); }
        ctx.restore();
      }
      const w = g.whisper; if (!w) return;
      const a = Math.min(1, w.t * 3, (w.dur - w.t) * 2);
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.textAlign = 'center'; ctx.font = 'italic 26px "Jersey 15", "VT323", monospace';
      ctx.fillStyle = 'rgba(40,24,0,0.8)'; ctx.fillText('“' + w.text + '”', W / 2 + 2, H * 0.42 + 2);
      ctx.fillStyle = '#ffe08a'; ctx.fillText('“' + w.text + '”', W / 2, H * 0.42);
      ctx.font = '15px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#c9a13b'; ctx.fillText('Aurelle', W / 2, H * 0.42 + 24);
      ctx.restore();
    },
  };

  // ---- her words in the story
  // the first thing he hears, before Misery finds him
  const intro = G.FAIRY.intro;
  G.FAIRY.intro = [
    [WHO, 'Rise, little knight. Rise. You are not finished.'],
    ['Knight', '...Who is there?'],
    [WHO, 'I am Aurelle, of the Dawn. I keep the vows that mortals make, and I have kept yours, all this long way.'],
    [WHO, 'Only you can hear me. Only you ever will. Walk east, and I will walk with you.'],
  ].concat(intro);
  G.STORY.intro.splice(G.STORY.intro.length - 1, 0, 'On the long road home, in the dark below the deck of the Sun, something spoke to you.\nA voice like warm gold. A woman\'s voice. Aurelle, goddess of the dawn and of vows kept.\nNo one else aboard could hear it.');
  // before the last choice
  G.FAIRY.choice = [[WHO, 'Whatever you choose, little knight, I will be there when it is done.']].concat(G.FAIRY.choice);
  if (G.FAIRY.choiceNamed) G.FAIRY.choiceNamed = [[WHO, 'Corin. Whatever you choose, I will be there when it is done.']].concat(G.FAIRY.choiceNamed);
})();
