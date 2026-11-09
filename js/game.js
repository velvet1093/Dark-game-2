'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — game state, level flow, interactions, HUD and the main loop
// ---------------------------------------------------------------------------
(() => {
  const SAVE = 'ashenvow_save_v1', W = G.W, H = G.H, { clamp, rand } = G;
  let ctx = null;
  const store = { get() { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } }, set(v) { try { v ? localStorage.setItem(SAVE, JSON.stringify(v)) : localStorage.removeItem(SAVE); } catch (e) { /* storage is optional */ } } };

  const game = G.game = {
    mode: 'title', time: 0, hitstop: 0, shake: 0, slow: 0, cam: 0, ichor: 0, stain: null, flags: {}, read: {},
    enemies: [], npcs: [], bounds: [30, 1000], card: 0, deathT: 0, lvT: 0, levelIdx: 0, level: G.LEVELS[0], cp: { lv: 0, x: 120 },
    player: null, fairy: null, heartT: 0, boss: null, bossFight: false, prompt: null,

    // ------------------------------ flow -----------------------------------
    toTitle() { G.ui.clear(); this.mode = 'title'; G.music('title'); G.ambience('wind'); G.ui.title(!!store.get()); },
    newGame() {
      Object.assign(this, { player: new G.Player(), fairy: new G.Fairy(), ichor: 0, flags: {}, read: {}, stain: null, cp: { lv: 0, x: 120 } });
      G.questLog.reset();
      G.ui.slides(G.STORY.intro, () => {
        this.loadLevel(0, 120); this.save();
        G.ui.dialogue(G.FAIRY.intro, () => { this.flags.met_wist = 1; this.save(); });
      });
    },
    continueGame() {
      const s = store.get(); if (!s) return this.newGame();
      this.player = new G.Player(); this.fairy = new G.Fairy(); Object.assign(this.player.stats, s.stats);
      Object.assign(this, { ichor: s.ichor || 0, flags: s.flags || {}, read: s.read || {}, stain: s.stain || null, cp: s.cp });
      G.questLog.reset(s.quests);
      G.ui.clear(); this.loadLevel(s.cp.lv, s.cp.x);
    },
    save() { store.set({ cp: this.cp, ichor: this.ichor, stats: this.player.stats, flags: this.flags, read: this.read, stain: this.stain, quests: G.questLog.state }); },
    loadLevel(idx, x) {
      const L = this.level = G.LEVELS[idx]; this.levelIdx = idx;
      G.fxReset(); this.player.reset(); this.player.x = x; this.player.facing = 1;
      this.spawnEnemies(); this.npcs = L.npcs.map(d => new G.Npc(d, this)); this.fairy.place(this.player);
      G.music(L.theme); G.ambience({ road: 'rain', village: 'wind', cathedral: 'hall' }[L.theme]);
      this.cam = clamp(x - W * 0.42, 0, L.length - W); this.card = 5; this.deathT = 0; this.lvT = 0; this.bossFight = false; this.mode = 'play';
    },
    spawnEnemies() {
      const L = this.level;
      this.enemies = L.enemies.map(([t, x, tag]) => new G.Enemy(t, x, tag)); this.boss = null; this.bossFight = false;
      if (L.boss && !this.flags.bossDead) { this.boss = new G.Enemy(L.boss.type, L.boss.x); this.enemies.push(this.boss); }
    },
    respawn() {
      if (this.ichor > 0) { this.stain = { lv: this.levelIdx, x: this.player.x, n: this.ichor }; this.ichor = 0; }
      this.loadLevel(this.cp.lv, this.cp.x); this.card = 0; this.save();
    },
    onPlayerDeath() {
      this.flags.deaths = (this.flags.deaths || 0) + 1; G.music(null);
      this.fairy.cd = 0; this.fairy.bark('death', true);
    },
    levelCost() { const s = this.player.stats; return 90 + (s.vig + s.str + s.end) * 55; },
    addIchor(n, x) { this.ichor += n; G.text(x, G.GROUND - 130, '+' + n, '#b98a8a', 12); },

    // --------------------------- interactions ------------------------------
    findInteract() {
      const p = this.player, L = this.level, near = (x, r) => Math.abs(p.x - x) < r;
      for (const e of this.enemies) {
        if (e.state === 'broken' && near(e.x, 90 * e.scale)) {
          return { x: e.x, y: G.GROUND - (e.crawling ? 50 : 105 * e.scale), label: 'Execute', hot: true, fn: () => {
            if (e.def.boss) { p.vx = 0; G.ui.dialogue(L.boss.lastWords, () => p.startExecute(e)); } else p.startExecute(e);
          } };
        }
      }
      if (this.enemies.some(e => !e.dead && !e.dormant && e.state !== 'idle' && near(e.x, 260))) return null; // not mid-fight
      for (const n of this.npcs) {
        if (near(n.x, 70) && n.canTalk) return { x: n.x, y: G.GROUND - (n.def.pose === 'hang' ? 204 : 132), label: 'Speak to ' + n.def.name, fn: () => this.talk(n) };
      }
      for (const [i, n] of L.lore.entries()) {
        if (near(n.x, 45)) return { x: n.x, y: G.GROUND - 46, label: 'Read', fn: () => { this.read[this.levelIdx + ':' + i] = 1; G.ui.note(n.title, n.text); } };
      }
      for (const sx of L.shrines) if (near(sx, 55)) return { x: sx, y: G.GROUND - 100, label: 'Rest at the vigil candle', fn: () => this.rest(sx) };
      if (L.exit && near(L.exit.x, 60)) return { x: L.exit.x, y: G.GROUND - 150, label: L.exit.label, fn: () => this.travel() };
      return null;
    },
    talk(n) {
      const d = n.def, key = 'met_' + d.id, met = this.flags[key], Q = G.questLog, p = this.player;
      p.vx = 0; p.facing = n.x >= p.x ? 1 : -1;
      // quests whose current step is "speak to this person", and quests they can hand out
      const stepQ = Q.ids('active').filter(id => { const s = Q.cur(id); return s.type === 'talk' && s.npc === d.id; });
      const newQ = Object.keys(G.QUESTS).filter(id => !Q.state[id] && G.QUESTS[id].start && G.QUESTS[id].start.talk === d.id);
      let lines = met ? [] : d.lines.slice();
      const stepLines = stepQ.map(id => Q.cur(id).lines).find(Boolean);
      if (stepLines) lines = lines.concat(stepLines);
      for (const id of newQ) if (G.QUESTS[id].offer) lines = lines.concat(G.QUESTS[id].offer);
      if (!lines.length) {
        const w = Q.ids('active').map(id => G.QUESTS[id]).find(q => q.giver === d.id && q.waiting);
        lines = w ? w.waiting : d.repeat || d.lines;
      }
      G.ui.dialogue(lines, () => {
        this.flags[key] = 1;
        stepQ.forEach(id => Q.advance(id));
        newQ.forEach(id => { Q.start(id); const s = Q.cur(id); if (s && s.type === 'talk' && s.npc === d.id && !s.lines) Q.advance(id); });
        this.save();
        if (d.id === 'ysolde') {
          G.ui.dialogue(G.FAIRY.choice, () => G.ui.choice('The Saint\'s Tear is warm in your hand.', [
            { label: 'Give her the Tear', fn: () => this.ending('kept') },
            { label: 'Cast the Tear away', fn: () => this.ending('broken') },
          ]));
        }
      });
    },
    onScreen(x) { return x > this.cam - 40 && x < this.cam + W + 40; },
    onEnemyDeath(e) { G.questLog.onKill(e, this); },
    onNpcDeath(n) {
      G.text(n.x, G.GROUND - 120, n.def.name + ' is dead', '#d9c9b0', 15);
      this.fairy.cd = 0; this.fairy.bark('npcdeath', true); this.save();
    },
    rest(x) {
      this.player.reset(); this.spawnEnemies(); for (const n of this.npcs) if (!n.dead) n.hp = n.maxHp;
      this.cp = { lv: this.levelIdx, x }; this.save();
      G.sfx('bell'); G.sfx('candle'); this.fairy.cd = 0; this.fairy.bark('rest', true); G.ui.shrine();
    },
    travel() {
      const next = this.levelIdx + 1;
      G.ui.slides(this.level.exitSlides, () => { this.cp = { lv: next, x: 120 }; this.loadLevel(next, 120); this.save(); });
    },
    ending(id) {
      const e = G.STORY.endings[id];
      G.sfx('bell'); this.mode = 'title'; G.music('title');
      G.ui.slides(e.text.concat(['ASHEN VOW\n\nThank you for playing.']), () => { store.set(null); this.toTitle(); }, e.title);
    },
    // Called at the moment the executioner's blow lands.
    executeStrike(e, p) {
      const dir = p.facing, decap = p.execKind === 'decap' && !e.crawling && e.def.model !== 'crow';
      const [jx, jy] = decap ? e.joint('head') : e.joint('armF');
      G.blood(jx, jy, 70, dir, 460); G.blood(jx, jy, 30, -dir, 200);
      e.vx = dir * 60; e.die({ exec: true, decap, dir });
      if (!decap) { e.fountain = 0; G.decal(e.x, 12, 40); }
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.12);
      this.hitstop = 0.14; this.shake = 14; this.slow = 0.55; G.sfx('exec');
      G.text(e.x, G.GROUND - 130 * e.scale, 'EXECUTED', '#e0222c', 20);
      if (e.def.boss) { this.flags.bossDead = 1; this.bossFight = false; this.boss = null; G.sfx('bell'); G.music(null); this.save(); }
    },

    // ------------------------------ update ---------------------------------
    tick(dt) {
      this.time += dt;
      if (G.input.hit('mute')) G.toggleMute();
      if (G.ui.blocking) { G.ui.handle(); return; }
      if (this.mode !== 'play') return;
      if (G.input.hit('pause')) { G.ui.pause(); return; }
      if (G.input.hit('journal')) { G.ui.journal(); return; }
      if (this.hitstop > 0) { this.hitstop -= dt; return; }
      if (this.slow > 0) { this.slow -= dt; dt *= 0.3; }
      const p = this.player, L = this.level;
      this.lvT += dt; this.card -= dt; this.shake = Math.max(0, this.shake - dt * 40);

      this.bounds = this.bossFight ? [L.boss.gate + 24, L.boss.end + 20] : [30, L.length - 30];
      this.prompt = (p.state === 'idle' || p.state === 'block') ? this.findInteract() : null;
      if (this.prompt && G.input.hit('use')) { const f = this.prompt.fn; this.prompt = null; f(); if (G.ui.blocking) return; }

      p.update(dt, this);
      for (const e of this.enemies) e.update(dt, this);
      for (const n of this.npcs) n.update(dt, this);
      G.questLog.tick(this, dt);
      // keep the living from stacking on one another
      for (let i = 0; i < this.enemies.length; i++) for (let j = i + 1; j < this.enemies.length; j++) {
        const a = this.enemies[i], b = this.enemies[j]; if (a.dead || b.dead) continue;
        const d = b.x - a.x; if (Math.abs(d) < 28) { const push = (d >= 0 ? 1 : -1) * 40 * dt; a.x -= push; b.x += push; }
      }
      this.fairy.update(dt, this);
      G.fxUpdate(dt);
      if (!p.dead && p.hp < p.maxHp * 0.35 && (this.heartT -= dt) <= 0) { this.heartT = 0.85; G.sfx('heart'); }

      // the Oathkeeper's door
      if (this.boss && this.boss.dormant && !p.dead && p.x > L.boss.gate + 70) {
        p.vx = 0; p.set('idle');
        G.ui.dialogue(this.flags.metBoss ? L.boss.retry : G.FAIRY.boss.concat(L.boss.intro), () => { this.flags.metBoss = 1; this.bossFight = true; this.boss.dormant = false; G.sfx('bell'); G.music('boss'); });
      }
      // reclaim ichor from where you last fell
      const s = this.stain;
      if (s && s.lv === this.levelIdx && Math.abs(p.x - s.x) < 30 && !p.dead) { this.ichor += s.n; G.text(p.x, G.GROUND - 110, 'Ichor reclaimed +' + s.n, '#d9c9b0', 15); G.sfx('ichor'); this.stain = null; }
      if (p.dead && (this.deathT += dt) > 1.7) { this.deathT = -99; this.fairy.say = null; G.ui.death(this.ichor, () => this.respawn(), this.fairy.last.death, this.flags.deaths); }

      let target = p.x - W * 0.42 + p.facing * 40;
      target = clamp(target, this.bossFight ? L.boss.gate - 110 : 0, L.length - W);
      this.cam += (target - this.cam) * Math.min(1, dt * 5);
    },

    // ------------------------------- draw ----------------------------------
    draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const L = this.level, t = this.time, gy = G.GROUND;
      if (this.mode !== 'play') { G.drawBackdrop(ctx, G.LEVELS[0], 300 + Math.sin(t * 0.05) * 300, t); G.drawAtmosphere(ctx, G.LEVELS[0], 0, t, 0); return; }
      const p = this.player, cam = Math.round(this.cam);
      G.drawBackdrop(ctx, L, cam, t);
      ctx.save();
      ctx.translate(-cam + rand(-1, 1) * this.shake * 0.5, rand(-1, 1) * this.shake * 0.5);
      this.drawWorldProps(L, t);
      G.drawFx(ctx, 'ground');
      for (const n of this.npcs) n.draw(ctx, this);
      for (const e of this.enemies) if (e.dead) e.draw(ctx, this);
      for (const e of this.enemies) if (!e.dead) e.draw(ctx, this);
      p.draw(ctx, this);
      this.fairy.draw(ctx, this);
      G.drawFx(ctx, 'air');
      if (this.prompt) {
        const pr = this.prompt, s = (document.body.classList.contains('touch') ? 'USE · ' : '[E] ') + pr.label;
        ctx.font = '14px Georgia, serif'; ctx.textAlign = 'center';
        const w = ctx.measureText(s).width + 16, by = pr.y - 16 + Math.sin(t * 5) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(pr.x - w / 2, by - 15, w, 22);
        ctx.strokeStyle = pr.hot ? '#e0222c' : '#5a4a44'; ctx.lineWidth = 1; ctx.strokeRect(pr.x - w / 2, by - 15, w, 22);
        ctx.fillStyle = pr.hot ? '#ff5a5a' : '#cfc4b8'; ctx.fillText(s, pr.x, by);
      }
      ctx.restore();
      G.drawAtmosphere(ctx, L, cam, t, p.dead ? 0.6 : p.hp < p.maxHp * 0.35 ? 0.25 + Math.sin(t * 5) * 0.1 : 0);
      this.drawHud(p, L, t);
    },

    drawWorldProps(L, t) {
      const gy = G.GROUND, glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
      // exit archway
      if (L.exit) {
        const x = L.exit.x; glow(x, gy - 70, 130, 'rgba(150,40,30,0.28)');
        ctx.fillStyle = '#050304'; ctx.fillRect(x - 46, gy - 150, 14, 150); ctx.fillRect(x + 32, gy - 150, 14, 150);
        ctx.beginPath(); ctx.moveTo(x - 46, gy - 150); ctx.quadraticCurveTo(x, gy - 215, x + 46, gy - 150); ctx.lineTo(x + 32, gy - 150); ctx.quadraticCurveTo(x, gy - 190, x - 32, gy - 150); ctx.fill();
      }
      // boss altar & fog door
      if (L.boss) {
        const ax = L.boss.end + 130; glow(ax, gy - 90, 170, 'rgba(170,20,30,0.3)');
        ctx.fillStyle = '#0a0708'; ctx.fillRect(ax - 60, gy - 30, 150, 30); ctx.fillRect(ax + 30, gy - 190, 8, 160); ctx.fillRect(ax + 12, gy - 165, 44, 7);
        if (!this.flags.bossDead) {
          const x = L.boss.gate;
          for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(200,190,200,${0.06 + 0.03 * Math.sin(t * 2 + i)})`; ctx.fillRect(x - 18 + Math.sin(t * 1.3 + i * 2) * 8, gy - 260, 36, 262); }
        }
      }
      // vigil candles
      for (const sx of L.shrines) {
        const lit = this.cp.lv === this.levelIdx && this.cp.x === sx, f = Math.sin(t * 11 + sx) * 1.5;
        glow(sx, gy - 62, lit ? 110 : 70, lit ? 'rgba(255,170,80,0.3)' : 'rgba(255,170,80,0.14)');
        ctx.fillStyle = '#17110f'; ctx.fillRect(sx - 3, gy - 46, 6, 46); ctx.fillRect(sx - 14, gy - 4, 28, 4); ctx.fillRect(sx - 10, gy - 48, 20, 4);
        ctx.fillStyle = '#cfc4b0'; ctx.fillRect(sx - 2.5, gy - 60, 5, 12);
        ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(sx, gy - 66 + f * 0.3, 3, 6 + f, 0, 0, 7); ctx.fill();
      }
      // lore
      L.lore.forEach((n, i) => {
        const seen = this.read[this.levelIdx + ':' + i];
        if (!seen) glow(n.x, gy - 8, 34 + Math.sin(t * 3) * 5, 'rgba(230,210,160,0.35)');
        ctx.save(); ctx.translate(n.x, gy - 5); ctx.rotate(-0.2); ctx.fillStyle = seen ? '#5a4f40' : '#c9b78f'; ctx.fillRect(-8, -5, 16, 10); ctx.restore();
      });
      // bloodstain
      const s = this.stain;
      if (s && s.lv === this.levelIdx) { glow(s.x, gy - 14, 44 + Math.sin(t * 4) * 6, 'rgba(220,20,30,0.5)'); ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.ellipse(s.x, gy + 6, 22, 5, 0, 0, 7); ctx.fill(); }
    },

    drawHud(p, L, t) {
      const bar = (x, y, w, h, v, col, back = '#000') => { ctx.fillStyle = back; ctx.fillRect(x - 1, y - 1, w + 2, h + 2); ctx.fillStyle = '#1c1416'; ctx.fillRect(x, y, w, h); ctx.fillStyle = col; ctx.fillRect(x, y, w * clamp(v, 0, 1), h); };
      bar(24, 22, Math.min(440, p.maxHp * 1.7), 11, p.hp / p.maxHp, '#9c0c14', '#3a2a2a');
      bar(24, 39, Math.min(400, p.maxSt * 1.3), 7, p.st / p.maxSt, '#6f8a4a', '#3a2a2a');
      for (let i = 0; i < p.flaskMax; i++) {
        const x = 30 + i * 20, y = 62; ctx.fillStyle = i < p.flasks ? '#c9c2b0' : '#2a2424';
        ctx.beginPath(); ctx.arc(x, y + 8, 6, 0, 7); ctx.fill(); ctx.fillRect(x - 2, y - 3, 4, 6);
      }
      ctx.font = '16px Georgia, serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#c9333b'; ctx.fillText('Ichor  ' + this.ichor, W - 26, 34);
      if (this.bossFight && this.boss) {
        const b = this.boss; ctx.textAlign = 'center'; ctx.font = '15px Georgia, serif'; ctx.fillStyle = '#cfc4b8'; ctx.fillText(b.def.name, W / 2, H - 46);
        bar(W / 2 - 260, H - 38, 520, 9, b.hp / b.maxHp, '#9c0c14', '#3a2a2a');
      }
      if (this.card > 0) {
        ctx.globalAlpha = clamp(Math.min(this.card, 5 - this.card) * 1.2, 0, 1); ctx.textAlign = 'center';
        ctx.font = 'italic 17px Georgia, serif'; ctx.fillStyle = '#8d8177'; ctx.fillText(L.chapter, W / 2, 168);
        ctx.font = '40px Georgia, serif'; ctx.fillStyle = '#b3141c'; ctx.fillText(L.name.toUpperCase(), W / 2, 214);
        ctx.fillStyle = '#4a1418'; ctx.fillRect(W / 2 - 150, 230, 300, 1); ctx.globalAlpha = 1;
      }
      if (this.levelIdx === 0 && this.lvT < 30 && !document.body.classList.contains('touch')) {
        ctx.globalAlpha = clamp(30 - this.lvT, 0, 1) * 0.8; ctx.textAlign = 'center'; ctx.font = '13px Georgia, serif'; ctx.fillStyle = '#9a8f84';
        ctx.fillText('A/D move  ·  J slash  ·  K heavy  ·  SPACE roll  ·  L block  ·  Q flask  ·  E interact / execute', W / 2, H - 14); ctx.globalAlpha = 1;
      }
      // quest tracker: the main quest and up to two others, with the current step of each
      const Q = G.questLog, act = Q.ids('active').sort((a, b) => (G.QUESTS[b].main ? 1 : 0) - (G.QUESTS[a].main ? 1 : 0)).slice(0, 3);
      ctx.textAlign = 'right'; let qy = 62;
      for (const id of act) {
        ctx.font = '13px Georgia, serif'; ctx.fillStyle = '#e0b84a'; ctx.fillText(G.QUESTS[id].title, W - 26, qy);
        ctx.font = '12px Georgia, serif'; ctx.fillStyle = '#b9ada0'; ctx.fillText('◇ ' + Q.text(id, Q.state[id].step), W - 26, qy + 15); qy += 38;
      }
      const b = Q.banners[0];
      if (b) {
        const col = b.kind === 'Quest failed' ? '#c9333b' : '#e0b84a';
        ctx.globalAlpha = clamp(Math.min(b.t, 4.4 - b.t) * 2.5, 0, 1); ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 250, 84, 500, 62);
        ctx.fillStyle = col; ctx.fillRect(W / 2 - 250, 84, 500, 1); ctx.fillRect(W / 2 - 250, 145, 500, 1);
        ctx.font = '11px Georgia, serif'; ctx.fillText(b.kind.toUpperCase().split('').join(' '), W / 2, 101);
        ctx.font = '19px Georgia, serif'; ctx.fillStyle = '#e8ddd0'; ctx.fillText(b.title, W / 2, 122);
        ctx.font = 'italic 12px Georgia, serif'; ctx.fillStyle = '#b9ada0'; ctx.fillText(b.sub || '', W / 2, 139); ctx.globalAlpha = 1;
      }
    },
  };

  addEventListener('DOMContentLoaded', () => {
    ctx = document.getElementById('c').getContext('2d');
    G.LEVELS.forEach(G.buildProps);
    game.player = new G.Player(); game.fairy = new G.Fairy();
    game.toTitle();
    let last = 0;
    const frame = ts => {
      const dt = Math.min(0.033, (ts - last) / 1000 || 0); last = ts;
      game.tick(dt); game.draw(); G.input.clear();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
})();
