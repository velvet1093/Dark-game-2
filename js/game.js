'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — game state, level flow, interactions, HUD and the main loop
// ---------------------------------------------------------------------------
(() => {
  const SAVE = 'ashenvow_save_v2', W = G.W, H = G.H, { clamp, rand } = G;
  let ctx = null;
  const store = { get() { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } }, set(v) { try { v ? localStorage.setItem(SAVE, JSON.stringify(v)) : localStorage.removeItem(SAVE); } catch (e) { /* storage is optional */ } } };

  const game = G.game = {
    mode: 'title', time: 0, hitstop: 0, shake: 0, slow: 0, cam: 0, ichor: 0, stain: null, flags: {}, read: {},
    enemies: [], npcs: [], items: {}, bounds: [30, 1000], card: 0, deathT: 0, lvT: 0, levelIdx: 0, level: G.LEVELS[0], cp: { lv: 0, x: 120 },
    player: null, fairy: null, heartT: 0, boss: null, bossFight: false, prompt: null,

    // ------------------------------ flow -----------------------------------
    toTitle() { G.ui.clear(); this.mode = 'title'; G.music('title'); G.ambience('wind'); G.ui.title(!!store.get()); },
    newGame() {
      Object.assign(this, { player: new G.Player(), fairy: new G.Fairy(), ichor: 0, flags: {}, read: {}, items: {}, stain: null, cp: { lv: 0, x: 120 } });
      G.questLog.reset();
      G.ui.slides(G.STORY.intro, () => {
        this.loadLevel(0, 120); this.save();
        G.ui.dialogue(G.FAIRY.intro, () => { this.flags.met_wist = 1; this.save(); });
      });
    },
    continueGame() {
      const s = store.get(); if (!s) return this.newGame();
      this.player = new G.Player(); this.fairy = new G.Fairy(); Object.assign(this.player.stats, s.stats);
      Object.assign(this, { ichor: s.ichor || 0, flags: s.flags || {}, read: s.read || {}, items: s.items || {}, stain: s.stain || null, cp: s.cp });
      this.player.inf = s.inf || 0; this.player.tinct = s.tinct == null ? 1 : s.tinct;
      G.questLog.reset(s.quests);
      G.ui.clear(); this.loadLevel(s.cp.lv, s.cp.x);
    },
    save() { store.set({ cp: this.cp, ichor: this.ichor, stats: this.player.stats, flags: this.flags, read: this.read, items: this.items, stain: this.stain, quests: G.questLog.state, inf: Math.min(this.player.inf, 90), tinct: this.player.tinct }); },
    loadLevel(idx, x) {
      const L = this.level = G.LEVELS[idx]; this.levelIdx = idx;
      G.fxReset(); this.player.reset(); this.player.x = x; this.player.facing = 1;
      this.spawnEnemies(); this.npcs = L.npcs.map(d => new G.Npc(d, this)); this.fairy.place(this.player);
      G.music({ fen: 'road' }[L.theme] || L.theme); G.ambience({ road: 'rain', fen: 'rain', village: 'wind', town: 'wind', cathedral: 'hall' }[L.theme]);
      this.cam = clamp(x - W * 0.42, 0, L.length - W); this.card = 5; this.deathT = 0; this.lvT = 0; this.bossFight = false; this.mode = 'play';
    },
    spawnEnemies() {
      const L = this.level;
      this.enemies = L.enemies.map(([t, x, tag]) => new G.Enemy(t, x, tag)); this.boss = null; this.bossFight = false;
      if (L.boss && !this.flags.bossDead) { this.boss = new G.Enemy(L.boss.type, L.boss.x); this.enemies.push(this.boss); }
    },
    respawn() {
      if (this.ichor > 0) { this.stain = { lv: this.levelIdx, x: this.player.x, n: this.ichor }; this.ichor = 0; }
      const p = this.player; p.turnT = null; p.inf = Math.min(p.inf, 50);   // you wake with the fever broken, not gone
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
        if (near(n.x, 70) && n.canTalk) return { x: n.x, y: G.GROUND - (n.def.pose === 'hang' ? 204 : 132), label: (n.def.cleanse && this.flags['met_' + n.id] && (p.inf > 0 || p.tinct < p.tinctMax) ? 'Be cleansed by ' : 'Speak to ') + n.def.name, hot: n.def.cleanse && p.turnT != null, fn: () => this.talk(n) };
      }
      for (const [i, n] of L.lore.entries()) {
        if (near(n.x, 45)) return { x: n.x, y: G.GROUND - 46, label: 'Read', fn: () => { this.read[this.levelIdx + ':' + i] = 1; G.ui.note(n.title, n.text); } };
      }
      for (const [i, it] of (L.items || []).entries()) {
        const k = 'item_' + this.levelIdx + '_' + i;
        if (!this.flags[k] && near(it.x, 40)) return { x: it.x, y: G.GROUND - 40, label: 'Gather the white lily', fn: () => { this.flags[k] = 1; this.items[it.id] = (this.items[it.id] || 0) + 1; G.sfx('chime'); G.text(it.x, G.GROUND - 50, 'White lily', '#efeaf2', 13); } };
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
        if (d.cleanse) this.cleanse(n);
        if (d.id === 'ysolde') {
          G.ui.dialogue(G.FAIRY.choice, () => G.ui.choice('The Saint\'s Tear is warm in your hand.', [
            { label: 'Give her the Tear', fn: () => this.ending('kept') },
            { label: 'Cast the Tear away', fn: () => this.ending('broken') },
          ]));
        }
      });
    },
    // A Sister washes the infection out of the blood and refills the tincture vial.
    cleanse(n) {
      const p = this.player, had = p.inf > 0 || p.turnT != null;
      p.cleanse(100); p.tinct = p.tinctMax; G.sfx('cleanse');
      G.text(p.x, G.GROUND - 110, had ? 'Cleansed' : 'Vial filled', '#d8c6ff', 16);
      if (had) { this.fairy.cd = 0; this.fairy.bark('cleansed', true); }
      this.save();
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
      this.prompt = (p.state === 'idle' || p.state === 'block') && p.alt === 0 ? this.findInteract() : null;
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
      if (p.dead && (this.deathT += dt) > 1.7) { this.deathT = -99; this.fairy.say = null; G.ui.death(this.ichor, () => this.respawn(), this.fairy.last.death, this.flags.deaths, p.turned); }

      let target = p.x - W * 0.42 + p.facing * 40;
      target = clamp(target, this.bossFight ? L.boss.gate - 110 : 0, L.length - W);
      this.cam += (target - this.cam) * Math.min(1, dt * 5);
    },

    // ------------------------------- draw ----------------------------------
    draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const L = this.level, t = this.time, gy = G.GROUND;
      if (this.mode !== 'play') { G.drawBackdrop(G.bgBegin(), G.LEVELS[0], Math.round(300 + Math.sin(t * 0.05) * 300), t); G.bgEnd(ctx); G.drawAtmosphere(ctx, G.LEVELS[0], 0, t, 0); return; }
      const p = this.player, cam = Math.round(this.cam / 2) * 2;
      const shx = Math.round(rand(-1, 1) * this.shake * 0.25) * 2, shy = Math.round(rand(-1, 1) * this.shake * 0.25) * 2;
      // backdrop, props and ground blood go through the pixel buffer; characters are drawn over it
      const main = ctx; ctx = G.bgBegin();
      G.drawBackdrop(ctx, L, cam, t);
      ctx.save(); ctx.translate(-cam, 0); this.drawWorldProps(L, t); G.drawFx(ctx, 'ground'); ctx.restore();
      G.drawFog(ctx, L, cam, t);
      ctx = main; G.bgEnd(ctx, shx, shy);
      ctx.save();
      ctx.translate(-cam + shx, shy);
      const vis = x => x > cam - 160 && x < cam + W + 160;   // sprites are built per frame, so skip what is off screen
      for (const n of this.npcs) if (vis(n.x)) n.draw(ctx, this);
      for (const e of this.enemies) if (e.dead && vis(e.x)) e.draw(ctx, this);
      for (const e of this.enemies) if (!e.dead && vis(e.x)) e.draw(ctx, this);
      p.draw(ctx, this);
      this.fairy.draw(ctx, this);
      G.drawFx(ctx, 'air');
      if (this.prompt) {
        const pr = this.prompt, s = (document.body.classList.contains('touch') ? 'USE · ' : '[E] ') + pr.label;
        ctx.font = '19px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center';
        const w = ctx.measureText(s).width + 16, by = pr.y - 16 + Math.sin(t * 5) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(pr.x - w / 2, by - 15, w, 22);
        ctx.strokeStyle = pr.hot ? '#e0222c' : '#5a4a44'; ctx.lineWidth = 1; ctx.strokeRect(pr.x - w / 2, by - 15, w, 22);
        ctx.fillStyle = pr.hot ? '#ff5a5a' : '#cfc4b8'; ctx.fillText(s, pr.x, by);
      }
      ctx.restore();
      G.drawAtmosphere(ctx, L, cam, t, p.dead ? 0.6 : p.hp < p.maxHp * 0.35 ? 0.25 + Math.sin(t * 5) * 0.1 : 0,
        p.turnT != null ? 0.42 + Math.sin(t * 7) * 0.12 : p.inf > 40 ? (p.inf - 40) / 60 * 0.3 : 0);   // the fever closing in
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
      // chapels of the Lily
      for (const c of L.chapels || []) {
        const k = c.big ? 1.45 : 1, w = 150 * k, h = 130 * k, x = c.x;
        glow(x, gy - h * 0.5, 190 * k, 'rgba(200,180,255,0.16)');
        ctx.fillStyle = '#0c090c'; ctx.fillRect(x - w / 2, gy - h, w, h);
        ctx.beginPath(); ctx.moveTo(x - w / 2 - 12, gy - h); ctx.lineTo(x, gy - h - 80 * k); ctx.lineTo(x + w / 2 + 12, gy - h); ctx.fill();
        ctx.fillRect(x - 3, gy - h - 118 * k, 6, 44 * k); ctx.fillRect(x - 14 * k, gy - h - 104 * k, 28 * k, 6);
        ctx.fillStyle = `rgba(214,196,255,${0.75 + Math.sin(t * 2 + x) * 0.08})`; ctx.beginPath(); ctx.arc(x, gy - h - 22 * k, 15 * k, 0, 7); ctx.fill();
        ctx.strokeStyle = '#0c090c'; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; ctx.moveTo(x - Math.cos(a) * 15 * k, gy - h - 22 * k - Math.sin(a) * 15 * k); ctx.lineTo(x + Math.cos(a) * 15 * k, gy - h - 22 * k + Math.sin(a) * 15 * k); }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.beginPath(); ctx.moveTo(x - 20 * k, gy); ctx.lineTo(x - 20 * k, gy - 52 * k); ctx.quadraticCurveTo(x, gy - 84 * k, x + 20 * k, gy - 52 * k); ctx.lineTo(x + 20 * k, gy); ctx.fill();
      }
      // white lilies
      (L.items || []).forEach((it, i) => {
        if (this.flags['item_' + this.levelIdx + '_' + i]) return;
        glow(it.x, gy - 12, 30 + Math.sin(t * 3 + i) * 4, 'rgba(235,225,255,0.4)');
        ctx.strokeStyle = '#3a5a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(it.x, gy); ctx.lineTo(it.x + 1, gy - 14); ctx.stroke();
        ctx.fillStyle = '#f4f0fa'; for (let k = 0; k < 5; k++) { const a = k * 1.257 + 0.3; ctx.beginPath(); ctx.ellipse(it.x + 1 + Math.cos(a) * 4, gy - 16 + Math.sin(a) * 3, 3.2, 1.8, a, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.arc(it.x + 1, gy - 16, 1.4, 0, 7); ctx.fill();
      });
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
        const x = 30 + i * 20, y = 78; ctx.fillStyle = i < p.flasks ? '#c9c2b0' : '#2a2424';
        ctx.fillRect(x - 2, y - 4, 4, 6); ctx.fillRect(x - 4, y - 6, 8, 2); ctx.fillRect(x - 4, y + 2, 8, 12); ctx.fillRect(x - 6, y + 4, 12, 8);
      }
      ctx.font = '22px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#c9333b'; ctx.fillText('Ichor  ' + this.ichor, W - 26, 34);
      if (this.bossFight && this.boss) {
        const b = this.boss; ctx.textAlign = 'center'; ctx.font = '20px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#cfc4b8'; ctx.fillText(b.def.name, W / 2, H - 46);
        bar(W / 2 - 260, H - 38, 520, 9, b.hp / b.maxHp, '#9c0c14', '#3a2a2a');
      }
      if (this.card > 0) {
        ctx.globalAlpha = clamp(Math.min(this.card, 5 - this.card) * 1.2, 0, 1); ctx.textAlign = 'center';
        ctx.font = '23px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#8d8177'; ctx.fillText(L.chapter, W / 2, 168);
        ctx.font = '52px "Jacquard 12", "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#b3141c'; ctx.fillText(L.name, W / 2, 216);
        ctx.fillStyle = '#4a1418'; ctx.fillRect(W / 2 - 150, 230, 300, 1); ctx.globalAlpha = 1;
      }
      if (this.levelIdx === 0 && this.lvT < 30 && !document.body.classList.contains('touch')) {
        ctx.globalAlpha = clamp(30 - this.lvT, 0, 1) * 0.8; ctx.textAlign = 'center'; ctx.font = '18px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#9a8f84';
        ctx.fillText('A/D move  ·  W jump  ·  J slash  ·  K heavy  ·  SPACE roll  ·  L block  ·  Q flask  ·  E interact / execute', W / 2, H - 14); ctx.globalAlpha = 1;
      }
      // infection meter, tincture vials and the turning clock
      const sick = p.inf >= 75 || p.turnT != null;
      bar(24, 54, 170, 6, p.inf / 100, sick && Math.sin(t * 9) > 0 ? '#e060f0' : '#8a2a9a', '#3a2a3a');
      ctx.font = '14px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = sick ? '#e060f0' : '#8a7a90'; ctx.fillText('INFECTION', 200, 61);
      for (let i = 0; i < p.tinctMax; i++) {
        const x = 34 + p.flaskMax * 20 + i * 18, y = 85; ctx.fillStyle = i < p.tinct ? '#c9b3f0' : '#2a2430';
        ctx.fillRect(x - 1, y - 9, 2, 18); ctx.fillRect(x - 3, y - 5, 6, 10); ctx.fillRect(x - 5, y - 1, 10, 2);
      }
      if (p.turnT != null && !p.dead) {
        const s = Math.ceil(p.turnT); ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 230, 150, 460, 58);
        ctx.font = '30px "Jersey 15", "VT323", monospace'; ctx.fillStyle = Math.sin(t * 9) > 0 ? '#ff7aff' : '#c04ad0'; ctx.fillText('YOU ARE TURNING  —  0:' + String(s).padStart(2, '0'), W / 2, 176);
        ctx.font = '18px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#d8c6ff';
        ctx.fillText(p.tinct > 0 ? 'Drink a lily tincture (R) or reach a Sister of the Lily' : 'Reach a Sister of the Lily before your eyes run red', W / 2, 198);
      }
      // quest tracker: the main quest and up to two others, with the current step of each
      const Q = G.questLog, act = Q.ids('active').sort((a, b) => (G.QUESTS[b].main ? 1 : 0) - (G.QUESTS[a].main ? 1 : 0)).slice(0, 3);
      ctx.textAlign = 'right'; let qy = 62;
      for (const id of act) {
        ctx.font = '18px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#e0b84a'; ctx.fillText(G.QUESTS[id].title, W - 26, qy);
        ctx.font = '16px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#b9ada0'; ctx.fillText('◇ ' + Q.text(id, Q.state[id].step), W - 26, qy + 15); qy += 38;
      }
      const b = Q.banners[0];
      if (b) {
        const col = b.kind === 'Quest failed' ? '#c9333b' : '#e0b84a';
        ctx.globalAlpha = clamp(Math.min(b.t, 4.4 - b.t) * 2.5, 0, 1); ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 250, 84, 500, 62);
        ctx.fillStyle = col; ctx.fillRect(W / 2 - 250, 84, 500, 1); ctx.fillRect(W / 2 - 250, 145, 500, 1);
        ctx.font = '15px "Jersey 15", "VT323", monospace'; ctx.fillText(b.kind.toUpperCase().split('').join(' '), W / 2, 101);
        ctx.font = '26px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#e8ddd0'; ctx.fillText(b.title, W / 2, 122);
        ctx.font = '16px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#b9ada0'; ctx.fillText(b.sub || '', W / 2, 139); ctx.globalAlpha = 1;
      }
    },
  };

  addEventListener('DOMContentLoaded', () => {
    ctx = document.getElementById('c').getContext('2d');
    G.LEVELS.forEach(G.buildProps);
    game.player = new G.Player(); game.fairy = new G.Fairy();
    game.toTitle();
    let last = 0, lastFlasks = 0; const useBtn = document.getElementById('t-use');
    const frame = ts => {
      const dt = Math.min(0.033, (ts - last) / 1000 || 0); last = ts;
      game.tick(dt); game.draw(); G.input.clear();
      // touch layout: hide the pad under menus, and show the Use button only when there is something to use
      const cl = document.body.classList, open = G.ui.blocking || game.mode !== 'play', pr = open ? null : game.prompt;
      if (cl.contains('ui-open') !== open) { cl.toggle('ui-open', open); if (open) G.input.held = {}; }
      if (cl.contains('can-use') !== !!pr) cl.toggle('can-use', !!pr);
      if (pr && useBtn) { const s = pr.hot ? 'Execute' : pr.label.split(' ')[0]; if (useBtn.textContent !== s) { useBtn.textContent = s; useBtn.classList.toggle('hot', !!pr.hot); } }
      if (game.player.flaskMax !== lastFlasks) { lastFlasks = game.player.flaskMax; document.documentElement.style.setProperty('--flasks', lastFlasks); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
})();
