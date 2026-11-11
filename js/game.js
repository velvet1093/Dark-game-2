'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — game state, level flow, interactions, HUD and the main loop
// ---------------------------------------------------------------------------
(() => {
  const SAVE = 'ashenvow_save_v2', W = G.W, H = G.H, { clamp, rand } = G;
  let ctx = null;
  const BACK_X = 52;   // where the way back to the previous area stands
  const AMB = { road: 'rain', fen: 'rain', village: 'wind', town: 'wind', cathedral: 'hall', harbour: 'rain', crypt: 'hall', convent: 'wind', mountain: 'wind' };
  const musicFor = L => ({ fen: 'road', harbour: 'road', crypt: 'cathedral', convent: 'village' }[L.theme] || L.theme);
  const store = { get() { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } }, set(v) { try { v ? localStorage.setItem(SAVE, JSON.stringify(v)) : localStorage.removeItem(SAVE); } catch (e) { /* storage is optional */ } } };

  const game = G.game = {
    mode: 'title', time: 0, hitstop: 0, shake: 0, slow: 0, cam: 0, ichor: 0, stain: null, flags: {}, read: {},
    enemies: [], npcs: [], items: {}, npcInf: {}, abilities: {}, weaponLv: {}, bought: {}, surf: [], toldGate: {}, inside: null, outside: null, cleared: {}, fade: 0, bounds: [30, 1000], card: 0, deathT: 0, lvT: 0, levelIdx: 0, level: G.LEVELS[0], cp: { lv: 0, x: 120 },
    player: null, fairy: null, heartT: 0, boss: null, bossFight: false, prompt: null,

    // ------------------------------ flow -----------------------------------
    toTitle() { G.ui.clear(); this.mode = 'title'; G.music('title'); G.ambience('wind'); G.ui.title(!!store.get()); },
    newGame() {
      Object.assign(this, { player: new G.Player(), fairy: new G.Fairy(), ichor: 0, flags: {}, read: {}, items: {}, stain: null, cp: { lv: 0, x: 120 }, weapons: ['longsword'], weaponId: 'longsword', npcInf: {}, abilities: {}, weaponLv: {}, bought: {}, misery: { thorns: 0, got: {} }, watchUsed: false });
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
      this.weapons = (s.weapons || ['longsword']).filter(id => G.WEAPONS[id]); this.equip(this.weapons.includes(s.weapon) ? s.weapon : 'longsword');
      G.questLog.reset(s.quests);
      if (this.flags.bossDead) this.flags.boss_garrick_dead = 1; if (this.flags.metBoss) this.flags.boss_garrick_met = 1;   // saves from before there were three bosses
      this.npcInf = s.npcInf || {}; this.weaponLv = s.weaponLv || {}; this.bought = s.bought || {};
      // saves from before Misery took gifts: a thorn for each boss already put down
      this.misery = s.misery || { thorns: Object.keys(this.flags).filter(k => /^boss_.*_dead$/.test(k)).length * 3, got: {} }; this.watchUsed = !!s.watchUsed;
      this.abilities = s.abilities || {}; if (this.flags.boss_matron_dead) this.abilities.dj = 1;   // saves that beat her before she carried the greaves
      G.LEVELS.forEach((L, lv) => (L.gates || []).forEach((k, i) => { if (s.cp.lv > lv || (s.cp.lv === lv && s.cp.x > k.x)) this.flags[this.gateKey(i, lv)] = 1; }));   // saves already past a gate added later
      G.ui.clear(); this.loadLevel(s.cp.lv, s.cp.x);
    },
    save() { store.set({ cp: this.cp, ichor: this.ichor, stats: this.player.stats, flags: this.flags, read: this.read, items: this.items, npcInf: this.npcInf, abilities: this.abilities, weaponLv: this.weaponLv, bought: this.bought, misery: this.misery, watchUsed: this.watchUsed, weapons: this.weapons, weapon: this.weaponId, stain: this.stain, quests: G.questLog.state, inf: Math.min(this.player.inf, 90), tinct: this.player.tinct }); },
    loadLevel(idx, x) {
      const L = this.level = G.LEVELS[idx]; this.levelIdx = idx; this.inside = null; this.outside = null; this.cleared = {};
      G.fxReset(); this.player.reset(); this.player.x = x; this.player.facing = 1;
      this.spawnEnemies(); this.npcs = L.npcs.map(d => new G.Npc(d, this)); this.toldGate = {};
      // everything that can be stood on: ledges, and the tops of rubble walls
      this.surfAll = (L.platforms || []).concat((L.gates || []).filter(k => k.kind === 'wall').map(k => ({ x: k.x - 18, w: 36, h: k.h })));
      G.traps.init(this, L); this.surf = this.surfAll.filter(pl => !pl.fake && !pl.off); this.fairy.place(this.player);
      G.music(musicFor(L)); G.ambience(AMB[L.theme]); this.flags['reached_' + idx] = 1;
      this.cam = clamp(x - W * 0.42, 0, L.length - W); this.card = 5; this.deathT = 0; this.lvT = 0; this.bossFight = false; this.mode = 'play';
    },
    spawnEnemies() {
      const L = this.level;
      this.enemies = L.enemies.filter(([, , tag]) => tag !== 'unfair' || G.unfair()).map(([t, x, tag]) => new G.Enemy(t, x, tag)); this.boss = null; this.bossFight = false;   // some only come on Unfair
      if (L.boss && !this.flags['boss_' + L.boss.type + '_dead']) { this.boss = new G.Enemy(L.boss.type, L.boss.x); this.enemies.push(this.boss); }
    },
    respawn() {
      if (this.ichor > 0) { this.stain = { lv: this.levelIdx, x: this.inside ? this.inside.door.x : this.player.x, n: this.ichor }; this.ichor = 0; }   // dying indoors leaves the stain at the door
      this.watchUsed = false;
      const p = this.player; p.turnT = null; p.inf = Math.min(p.inf, 50);   // you wake with the fever broken, not gone
      this.loadLevel(this.cp.lv, this.cp.x); this.card = 0; this.save();
      if (this.level.shrines.includes(this.cp.x)) { const q = this.player; q.x = this.cp.x - 42; q.facing = 1; q.set('sit'); q.t = 0.6; }   // you wake beside the candle, already sitting
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
      const items = () => { for (const [i, it] of (L.items || []).entries()) { const pr = this.itemPrompt(it, i, p); if (pr) return pr; } return null; };
      for (const e of this.enemies) {
        if (e.state === 'broken' && near(e.x, 90 * e.scale) && Math.abs((e.alt || 0) - p.alt) < 30) {
          return { x: e.x, y: G.GROUND - (e.crawling ? 50 : 105 * e.scale), label: 'Execute', hot: true, fn: () => {
            if (e.def.boss) { p.vx = 0; G.ui.dialogue(L.boss.lastWords, () => p.startExecute(e)); } else p.startExecute(e);
          } };
        }
      }
      if (p.state === 'sit' || p.state === 'rise') return null;
      if (p.alt >= 30) return items();   // up on a ledge: only what is up here with you can be reached
      for (const n of this.npcs) {   // a wounded villager can be saved with your own tincture, even mid-fight
        if (n.dead || n.gone || n.inf < 35 || !near(n.x, 70)) continue;
        if (p.tinct > 0) return { x: n.x, y: G.GROUND - 132, label: 'Give your tincture to ' + n.def.name, hot: n.turnT != null, fn: () => {
          p.tinct--; n.cure(this); G.sfx('cleanse'); G.text(n.x, G.GROUND - 110, 'Cleansed', '#d8c6ff', 16); this.fairy.cd = 0; this.fairy.bark('cleansed', true); this.save();
        } };
      }
      if (this.enemies.some(e => !e.dead && !e.dormant && e.state !== 'idle' && near(e.x, 260))) return null; // not mid-fight
      for (const n of this.npcs) {
        if (near(n.x, 70) && n.canTalk) return { x: n.x, y: G.GROUND - (n.def.pose === 'hang' ? 204 : 132), label: (n.def.shop && this.flags['met_' + n.id] ? 'Trade with ' : n.def.cleanse && this.flags['met_' + n.id] && (p.inf > 0 || p.tinct < p.tinctMax) ? 'Be cleansed by ' : 'Speak to ') + n.def.name, hot: n.def.cleanse && p.turnT != null, fn: () => this.talk(n) };
      }
      for (const [i, n] of L.lore.entries()) {
        if (near(n.x, 45)) return { x: n.x, y: G.GROUND - 46, label: 'Read', fn: () => { this.read[this.lvKey() + ':' + i] = 1; G.ui.note(n.title, n.text); } };
      }
      const found = items(); if (found) return found;
      for (const sx of L.shrines) if (near(sx, 55)) return { x: sx, y: G.GROUND - 100, label: 'Rest at the vigil candle', fn: () => this.rest(sx) };
      for (const [i, k] of (L.gates || []).entries()) {
        if (this.gateOpen(i) || !near(k.x, 64)) continue;
        const tool = this.hasTool(k.need);
        if (k.kind === 'wall') return { x: k.x, y: G.GROUND - k.h - 30, label: tool ? k.hint : k.shut, fn: () => { if (!tool) this.gateRefused(k); } };
        return { x: k.x, y: G.GROUND - 200, label: tool ? k.open : k.shut, fn: () => (tool ? this.openGate(i) : this.gateRefused(k)) };
      }
      if (L.exit && near(L.exit.x, 60)) return { x: L.exit.x, y: G.GROUND - 150, label: L.exit.label, fn: () => this.travel() };
      if (this.inside) { if (near(60, 50)) return { x: 60, y: G.GROUND - 130, label: L.exitLabel || 'Leave ' + this.level.name, fn: () => this.leaveBuilding() }; return null; }
      for (const d of L.doors || []) if (near(d.x, 36)) return { x: d.x, y: G.GROUND - 110, label: 'Enter ' + G.INTERIORS[d.to].name, fn: () => this.enterBuilding(d) };
      if (this.levelIdx > 0 && near(BACK_X, 50)) return { x: BACK_X + 30, y: G.GROUND - 150, label: L.backLabel || 'Go back to ' + G.LEVELS[this.levelIdx - 1].name, fn: () => this.travelBack() };
      for (const q of L.passages || []) if (near(q.x, 50)) {
        const tool = this.hasTool(q.needs);
        return { x: q.x, y: G.GROUND - 150, label: tool ? q.label : q.shut, fn: () => (tool ? this.travelTo(q.to, q.at, q.slides) : this.gateRefused(q)) };
      }
      return null;
    },
    talk(n) {
      const d = n.def, key = 'met_' + d.id, met = this.flags[key], Q = G.questLog, p = this.player;
      p.vx = 0; p.facing = n.x >= p.x ? 1 : -1;
      // quests whose current step is "speak to this person", and quests they can hand out
      const stepQ = Q.ids('active').filter(id => { const s = Q.cur(id); return s.type === 'talk' && s.npc === d.id; });
      const newQ = Object.keys(G.QUESTS).filter(id => !Q.state[id] && G.QUESTS[id].start && G.QUESTS[id].start.talk === d.id);
      // a trader you already know goes straight to business, unless a quest has something to say
      if (d.shop && met && !stepQ.some(id => Q.cur(id).lines) && !newQ.some(id => G.QUESTS[id].offer)) { stepQ.forEach(id => Q.advance(id)); G.ui.shop(d.shop); return; }
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
        if (d.shop) G.ui.shop(d.shop);
        if (d.gift === 'favour' && !this.flags.seelie) {   // the Lantern Court's favour
          this.flags.seelie = 1; this.flags.court_met = 1; G.sfx('questdone'); G.sfx('cleanse');
          G.questLog.banners.push({ kind: 'A favour', title: 'The Lantern Court', sub: 'The infection takes hold a quarter more slowly', t: 5 }); this.save();
        }
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
    // What can be done with one thing lying in the world, if the knight is beside it and at its height.
    itemPrompt(it, i, p) {
      const k = 'item_' + this.lvKey() + '_' + i, alt = it.alt || 0, y = G.GROUND - alt;
      if (this.flags[k] || Math.abs(p.x - it.x) > 40 || Math.abs(p.alt - alt) > 30 || (it.needs && !this.flags[it.needs])) return null;
      const take = fn => () => { this.flags[k] = 1; fn(); this.save(); };
      if (it.icon) {
        // some icons are shut away until the right tool has been found elsewhere
        const need = it.gate === 'bars' ? !this.weapons.includes('greataxe') : it.gate === 'veil' ? !this.abilities.lantern : false;
        if (need) return { x: it.x, y: y - 64, label: it.gate === 'bars' ? "Barred. It would take a headsman's axe" : 'The red veil burns. It wants a blessed light', fn: () => { G.sfx('block'); this.shake = 4; } };
        return { x: it.x, y: y - 64, label: it.gate === 'bars' ? 'Break the bars and take the icon' : it.gate === 'veil' ? 'Part the veil and take the icon' : 'Take the weeping icon', fn: take(() => {
          if (it.gate === 'bars') { G.sfx('sever'); this.shake = 10; } if (it.gate === 'veil') G.sfx('cleanse');
          this.gainIcon(it.x, y);
        }) };
      }
      if (it.ability) return { x: it.x, y: y - 60, label: 'Take the ' + G.ABILITIES[it.ability].name, fn: take(() => this.gainAbility(it.ability)) };
      if (it.thorns) return { x: it.x, y: y - 54, label: 'Take the bundle of thorns', fn: take(() => { this.misery.thorns += it.thorns; G.sfx('questdone'); G.text(it.x, y - 50, '+' + it.thorns + ' thorns for Misery', '#b89ae0', 16); }) };
      if (it.cache) return { x: it.x, y: y - 54, label: 'Open the reliquary', fn: take(() => { this.ichor += it.cache; G.sfx('ichor'); G.sfx('questdone'); G.text(it.x, y - 50, '+' + it.cache + ' ichor', '#e0b84a', 16); }) };
      if (it.weapon) return { x: it.x, y: y - 70, label: 'Take the ' + G.WEAPONS[it.weapon].name, fn: take(() => this.gainWeapon(it.weapon)) };
      return { x: it.x, y: y - 40, label: 'Gather the white lily', fn: take(() => { this.items[it.id] = (this.items[it.id] || 0) + 1; G.sfx('chime'); G.text(it.x, y - 50, 'White lily', '#efeaf2', 13); }) };
    },
    iconTotal() { return G.LEVELS.concat(Object.values(G.INTERIORS)).reduce((n, l) => n + (l.items || []).filter(it => it.icon).length, 0); },
    // Icons still to be found in the area the knight is in (Misery hints at these).
    iconsHere() {
      const key = this.lvKey(), out = (this.level.items || []).map((it, i) => ({ it, i })).filter(o => o.it.icon && !this.flags['item_' + key + '_' + o.i]).map(o => o.it);
      if (!this.inside) for (const d of this.level.doors || []) (G.INTERIORS[d.to].items || []).forEach((it, i) => { if (it.icon && !this.flags['item_in_' + d.to + '_' + i]) out.push({ x: d.x, alt: 0, gate: 'inside' }); });   // icons behind a door count, hinted at the door
      return out;
    },
    gainIcon(x, y) {
      const n = this.items.icon = (this.items.icon || 0) + 1, total = this.iconTotal(), p = this.player; let sub = n + ' of ' + total + ' found';
      if (n === 5) { p.stats.flask = (p.stats.flask || 0) + 1; p.flasks++; sub += '  ·  +1 flask, for good'; }
      if (n === 10) { p.stats.tinct = (p.stats.tinct || 0) + 1; p.tinct = p.tinctMax; sub += '  ·  +1 tincture vial, for good'; }
      if (n === total) { p.stats.vig += 3; p.hp = p.maxHp; sub = 'The whole set. She smiles in every one.  ·  +3 Vigor'; }
      G.sfx('questdone'); G.questLog.banners.push({ kind: 'Weeping icon', title: G.ICON_NAMES[(n - 1) % G.ICON_NAMES.length], sub, t: 4.6 });
      this.fairy.cd = 0; this.fairy.sayLine(G.pick(G.FAIRY.iconGot));
    },
    gainAbility(id) {
      if (this.abilities[id]) return;
      this.abilities[id] = 1; G.sfx('questdone'); G.sfx('bell'); this.save();
      G.questLog.banners.push({ kind: 'New ability', title: G.ABILITIES[id].name, sub: G.ABILITIES[id].how, t: 6 });
    },
    // ---- gates on the main path: chained bars, rubble walls, red veils
    gateKey(i, lv = this.levelIdx) { return 'gate_' + lv + '_' + i; },
    gateOpen(i) { const k = (this.level.gates || [])[i]; return k && k.kind !== 'wall' && !!this.flags[this.gateKey(i)]; },
    // Main-road areas count as reached once you have been there (side areas do not move the story on).
    mis(id) { return !!(this.misery && this.misery.got[id]); },
    buyGift(n) {
      const m = this.misery; if (m.got[n.id] || m.thorns < n.cost) return false;
      m.thorns -= n.cost; m.got[n.id] = 1; G.sfx('questdone'); this.fairy.cd = 0; this.save(); return true;
    },
    reachedLv(lv) { return !!this.flags['reached_' + lv] || (this.levelIdx >= lv && this.levelIdx <= 4); },
    hasTool(need) { return need === 'axe' ? this.weapons.includes('greataxe') : !!this.abilities[need]; },
    // Stop a body moving from px to x if a closed gate stands between. Rubble walls only stop what is below their top.
    gateClamp(px, x, alt, fly) {
      const gs = this.level.gates; if (!gs) return x;
      for (let i = 0; i < gs.length; i++) {
        const k = gs[i]; if (this.gateOpen(i)) continue;
        if (k.kind === 'wall' && (fly || alt >= k.h - 2)) continue;
        const half = k.kind === 'wall' ? 26 : 22;
        if (px <= k.x && x > k.x - half) x = k.x - half; else if (px > k.x && x < k.x + half) x = k.x + half;
      }
      return x;
    },
    openGate(i) {
      const k = this.level.gates[i]; this.flags[this.gateKey(i)] = 1; this.shake = 10;
      if (k.kind === 'bars') { G.sfx('sever'); G.sfx('thud'); G.spark(k.x, G.GROUND - 90, 18); G.text(k.x, G.GROUND - 150, 'THE CHAIN PARTS', '#e0b84a', 16); }
      else { G.sfx('cleanse'); G.sfx('chime'); G.text(k.x, G.GROUND - 150, 'THE VEIL PARTS', '#d8c6ff', 16); }
      this.fairy.cd = 0; this.fairy.sayLine(G.pick(['Oh. You found a way. How tiresome.', 'Well. Through you go, then. Mind what waits on the other side.']));
      this.save();
    },
    gateRefused(k) { G.sfx('block'); this.shake = 3; this.fairy.cd = 0; this.fairy.sayLine(k.wist); },
    // ---- trade: everything is bought with ichor
    spend(n) { if (this.ichor < n) return false; this.ichor -= n; G.sfx('ichor'); this.save(); return true; },
    // ---- pits
    pitAt(x) { const ps = this.level.pits; if (ps) for (const q of ps) if (x > q.x + 6 && x < q.x + q.w - 6) return q; return null; },
    impale(p, pk) {
      p.state = 'idle'; p.t = 0; p.pitInv = 0;
      p.damage(24, p.x, this); G.blood(p.x, G.GROUND + 30, 34, 0, 280); G.sfx('sever'); this.shake = 10;
      G.text(p.x, G.GROUND - 70, 'IMPALED', '#e0222c', 16);
      if (pk) p.x = (p.safeX != null ? p.safeX : pk.x - 30) < pk.x + pk.w / 2 ? pk.x - 24 : pk.x + pk.w + 24;   // climb out the side you fell from
      p.alt = 0; p.vy = 0; p.vx = 0; p.air = false; p.pitRef = null; p.pitInv = 0.7;
      if (!G.traps.onImpale(this)) this.fairy.bark('hurt', true);
    },
    // ---- buildings: step through a door into a room; the street waits as you left it
    lvKey() { return this.inside ? 'in_' + this.inside.id : this.levelIdx; },
    enterBuilding(d) {
      const B = G.INTERIORS[d.to]; if (!B) return;
      this.outside = { level: this.level, enemies: this.enemies, npcs: this.npcs, surf: this.surf, boss: this.boss, cam: this.cam, x: d.x, decals: G.fx.decals.slice(), gibs: G.fx.gibs.slice() };
      this.inside = { id: d.to, door: d }; this.level = B; G.fxReset();
      const gone = this.cleared[d.to] || {};
      this.enemies = (B.enemies || []).map(([t, x], i) => { const e = new G.Enemy(t, x); e.inIdx = i; return e; }).filter(e => !gone[e.inIdx]);
      this.npcs = (B.npcs || []).map(n => new G.Npc(n, this)); this.surf = (B.platforms || []).slice(); this.boss = null; this.bossFight = false;
      const p = this.player; Object.assign(p, { x: B.entry, alt: 0, air: false, vy: 0, vx: 0, facing: 1 }); p.set('idle');
      this.cam = 0; this.fairy.place(p); this.toldGate = {}; this.card = 3; this.fade = 0.5; G.sfx('page'); G.sfx('thud'); G.ambience(B.style === 'glade' ? 'none' : 'hall');
      if (B.music) G.music(B.music);
      if (B.arrival) { const first = !this.flags['arrived_' + d.to]; G.ui.dialogue(first || !B.arrivalAgain ? B.arrival : B.arrivalAgain, () => { this.flags['arrived_' + d.to] = 1; this.save(); }); }
    },
    leaveBuilding() {
      const o = this.outside; if (!o) return;
      const fromCourt = this.inside && this.inside.id === 'court';
      Object.assign(this, { level: o.level, enemies: o.enemies, npcs: o.npcs, surf: o.surf, boss: o.boss, cam: o.cam, inside: null, outside: null });
      G.fx.decals.splice(0, G.fx.decals.length, ...o.decals); G.fx.gibs.splice(0, G.fx.gibs.length, ...o.gibs); G.fx.drops.length = 0;
      const p = this.player; Object.assign(p, { x: o.x, alt: 0, air: false, vy: 0, vx: 0 }); p.set('idle');
      this.fairyAway = false;
      G.music(musicFor(this.level));
      this.fairy.place(p); if (fromCourt) { this.fairy.cd = 0; this.fairy.sayLine(G.pick(G.FAIRY.backFromCourt)); }
      this.fade = 0.5; G.sfx('page'); G.ambience(AMB[this.level.theme]);
    },
    onScreen(x) { return x > this.cam - 40 && x < this.cam + W + 40; },
    onEnemyDeath(e) { G.questLog.onKill(e, this); if (this.inside && e.inIdx != null) (this.cleared[this.inside.id] || (this.cleared[this.inside.id] = {}))[e.inIdx] = 1; },
    onNpcTurn(n) {
      G.text(n.x, G.GROUND - 130, n.def.name + ' has turned', '#e060f0', 16); G.sfx('infect');
      this.fairy.cd = 0; this.fairy.bark('npcturn', true); this.save();
    },
    onNpcDeath(n) {
      G.text(n.x, G.GROUND - 120, n.def.name + ' is dead', '#d9c9b0', 15);
      this.fairy.cd = 0; this.fairy.bark('npcdeath', true); this.save();
    },
    rest(x) {
      this.player.reset(); this.spawnEnemies(); this.cleared = {}; for (const n of this.npcs) if (!n.dead) n.hp = n.maxHp;
      this.cp = { lv: this.levelIdx, x }; this.watchUsed = false; this.save();
      const p = this.player; p.x = x + (p.x < x ? -42 : 42); p.facing = p.x < x ? 1 : -1; p.vx = 0; p.set('sit');   // sit down by the flame, facing it
      G.sfx('bell'); G.sfx('candle'); this.fairy.cd = 0; this.fairy.bark('rest', true); this.restMenuT = 0.85;   // sit down first, then the candle's menu
    },
    // Return to the far end of the previous area. Its enemies will have wandered back in.
    travelBack() {
      const b = this.level.back, prev = b ? b.to : this.levelIdx - 1, x = b ? b.at : G.LEVELS[prev].exit.x - 100;
      this.cp = { lv: prev, x }; this.loadLevel(prev, x); this.player.facing = -1; this.save();
    },
    // Down a side passage into an optional area (and the area's back arch returns you here).
    travelTo(lv, x, slides) {
      const go = () => { this.cp = { lv, x }; this.loadLevel(lv, x); this.save(); };
      if (slides) G.ui.slides(slides, go); else go();
    },
    equip(id) { this.weaponId = id; this.player.weapon = G.WEAPONS[id]; this.player.combo = 0; },
    gainWeapon(id) {
      if (!this.weapons.includes(id)) this.weapons.push(id);
      this.equip(id); G.sfx('questdone'); this.save();
      G.questLog.banners.push({ kind: 'Weapon found', title: G.WEAPONS[id].name, sub: this.weapons.length > 1 ? 'Press ' + G.keyName('swap') + ', or tap the weapon name, to change weapon' : '', t: 4.4 });
    },
    swapWeapon() {
      if (this.weapons.length < 2) return;
      this.equip(this.weapons[(this.weapons.indexOf(this.weaponId) + 1) % this.weapons.length]);
      G.sfx('ui'); G.text(this.player.x, G.GROUND - 110, this.player.weapon.name, '#e0b84a', 14); this.save();
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
      const th = e.def.boss ? 4 : 1; this.misery.thorns += th; G.text(e.x, G.GROUND - 160 * e.scale, '+' + th + ' thorn' + (th > 1 ? 's' : ''), '#b89ae0', 14);
      this.hitstop = 0.14; this.shake = 14; this.slow = 0.55; G.sfx('exec');
      G.text(e.x, G.GROUND - 130 * e.scale, 'EXECUTED', '#e0222c', 20);
      if (e.def.boss) {
        const B = this.level.boss; this.flags['boss_' + B.type + '_dead'] = 1; if (B.final) this.flags.bossDead = 1;
        if (B.grants) this.gainAbility(B.grants);
        this.bossFight = false; this.boss = null; G.sfx('bell'); G.music(B.final ? null : musicFor(this.level)); this.save();
      }
    },

    // ------------------------------ update ---------------------------------
    tick(dt) {
      this.time += dt;
      if (G.input.hit('mute')) G.toggleMute();
      if (G.ui.blocking) { G.ui.handle(); return; }
      if (this.mode !== 'play') return;
      if (G.input.hit('pause')) { G.ui.pause(); return; }
      if (G.input.hit('journal')) { G.ui.journal(); return; }
      if (G.input.hit('swap') && (this.player.state === 'idle' || this.player.state === 'block')) this.swapWeapon();
      if (this.restMenuT > 0 && (this.restMenuT -= dt) <= 0) { if (this.player.state === 'sit') { G.ui.shrine(); return; } }
      if (this.hitstop > 0) { this.hitstop -= dt; return; }
      if (this.slow > 0) { this.slow -= dt; dt *= 0.3; }
      const p = this.player, L = this.level;
      this.lvT += dt; this.card -= dt; this.fade = Math.max(0, this.fade - dt); this.shake = Math.max(0, this.shake - dt * 40);

      this.bounds = this.bossFight ? [L.boss.gate + 24, L.boss.end + 20] : [30, L.length - 30];
      this.prompt = (p.state === 'idle' || p.state === 'block') && !p.air ? this.findInteract() : null;
      if (this.prompt && G.input.hit('use')) { const f = this.prompt.fn; this.prompt = null; f(); return; }   // the world may have changed under us; pick up next frame

      G.traps.tick(this, dt);
      p.update(dt, this);
      G.wind.tick(this, dt);
      for (const e of this.enemies) e.update(dt, this);
      for (const n of this.npcs) n.update(dt, this);
      G.questLog.tick(this, dt);
      // keep the living from stacking on one another
      for (let i = 0; i < this.enemies.length; i++) for (let j = i + 1; j < this.enemies.length; j++) {
        const a = this.enemies[i], b = this.enemies[j]; if (a.dead || b.dead) continue;
        const d = b.x - a.x; if (Math.abs(d) < 28) { const push = (d >= 0 ? 1 : -1) * 40 * dt; a.x -= push; b.x += push; }
      }
      const held = Object.values(G.input.held).some(Boolean);   // how long the knight has stood still with nothing pressed
      this.idleFor = !held && p.state === 'idle' && Math.abs(p.vx) < 5 && !p.air && !p.dead ? (this.idleFor || 0) + dt : 0;
      if (!this.fairyAway) this.fairy.update(dt, this);
      // the ring of white caps: stand in it, perfectly still, and the Court lets you in
      const sr = !this.inside && L.secret;
      if (sr) {
        const inRing = Math.abs(p.x - sr.x) < 34 && !p.air && !p.dead;
        const was = this.ringT || 0; this.ringT = inRing && this.idleFor > 0.6 ? was + dt : 0;
        if (was < 0.4 && this.ringT >= 0.4) G.sfx('chime');
        if (this.ringT > 2.8) { this.ringT = 0; G.sfx('cleanse'); this.enterBuilding({ x: sr.x, to: sr.to }); return; }
        if (!this.toldRing && !this.flags.court_met && Math.abs(p.x - sr.x) < 200) { this.toldRing = 1; this.fairy.cd = 0; this.fairy.sayLine(G.FAIRY.ringWarn); }   // she would rather you did not
      }
      G.fxUpdate(dt);
      if (!p.dead && p.hp < p.maxHp * 0.35 && (this.heartT -= dt) <= 0) { this.heartT = 0.85; G.sfx('heart'); }

      // the Oathkeeper's door
      for (const [i, k] of (L.gates || []).entries()) {   // Misery cannot resist remarking on a way you cannot take
        if (!this.toldGate[i] && !this.gateOpen(i) && !this.hasTool(k.need) && Math.abs(p.x - k.x) < 170) { this.toldGate[i] = 1; this.fairy.cd = 0; this.fairy.sayLine(k.wist); }
      }
      if (this.boss && this.boss.dormant && !p.dead && p.x > L.boss.gate + 70) {
        p.vx = 0; p.set('idle');
        const met = 'boss_' + L.boss.type + '_met';
        G.ui.dialogue(this.flags[met] ? L.boss.retry : (L.boss.final ? G.FAIRY.boss : []).concat(L.boss.intro), () => { this.flags[met] = 1; this.bossFight = true; this.boss.dormant = false; G.sfx('bell'); G.music('boss'); });
      }
      // reclaim ichor from where you last fell
      const s = this.stain;
      if (s && !this.inside && s.lv === this.levelIdx && Math.abs(p.x - s.x) < 30 && !p.dead) { this.ichor += s.n; G.text(p.x, G.GROUND - 110, 'Ichor reclaimed +' + s.n, '#d9c9b0', 15); G.sfx('ichor'); this.stain = null; }
      if (p.dead && (this.deathT += dt) > 1.7) { this.deathT = -99; this.fairy.say = null; G.ui.death(this.ichor, () => this.respawn(), this.fairy.last.death, this.flags.deaths, p.turned); }

      let target = p.x - W * 0.42 + p.facing * 40;
      target = clamp(target, this.bossFight ? L.boss.gate - 110 : 0, L.length - W);
      this.cam += (target - this.cam) * Math.min(1, dt * 5);
    },

    // ------------------------------- draw ----------------------------------
    draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const L = this.level, t = this.time, gy = G.GROUND;
      if (this.mode !== 'play') { G.drawBackdrop(G.bgBegin(), G.LEVELS[0], Math.round(300 + Math.sin(t * 0.05) * 300), t); G.bgEnd(ctx); G.drawAtmosphere(ctx, G.LEVELS[0], 0, t, null, 0); return; }
      const p = this.player, cam = Math.round(this.cam / 2) * 2;
      const shx = Math.round(rand(-1, 1) * this.shake * 0.25) * 2, shy = Math.round(rand(-1, 1) * this.shake * 0.25) * 2;
      // backdrop, props and ground blood go through the pixel buffer; characters are drawn over it
      const main = ctx; ctx = G.bgBegin();
      if (this.inside) G.drawInterior(ctx, L, cam, t); else G.drawBackdrop(ctx, L, cam, t);
      ctx.save(); ctx.translate(-cam, 0); this.drawWorldProps(L, t); G.traps.draw(ctx, this, t); G.wind.draw(ctx, this, t); G.drawFx(ctx, 'ground'); ctx.restore();
      if (!this.inside) G.drawFog(ctx, L, cam, t);
      if (!this.fairyAway) {   // Misery gives off a little light of her own, more of it indoors
        const f = this.fairy, lx = f.x - cam, ly = f.y, r = this.inside ? 165 : 130, glee = f.glee > 0 || p.dead, lg = ctx.createRadialGradient(lx, ly, 4, lx, ly, r);
        lg.addColorStop(0, glee ? 'rgba(150,70,110,0.34)' : this.inside ? 'rgba(130,105,190,0.36)' : 'rgba(115,90,170,0.28)'); lg.addColorStop(0.45, glee ? 'rgba(80,30,60,0.12)' : 'rgba(70,55,115,0.12)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg; ctx.fillRect(lx - r, ly - r, r * 2, r * 2); ctx.restore();
      }
      ctx = main; G.bgEnd(ctx, shx, shy);
      ctx.save();
      ctx.translate(-cam + shx, shy);
      const vis = x => x > cam - 160 && x < cam + W + 160;   // sprites are built per frame, so skip what is off screen
      for (const n of this.npcs) if (vis(n.x)) n.draw(ctx, this);
      for (const e of this.enemies) if (e.dead && vis(e.x)) e.draw(ctx, this);
      for (const e of this.enemies) if (!e.dead && vis(e.x)) e.draw(ctx, this);
      p.draw(ctx, this);
      if (!this.fairyAway) this.fairy.draw(ctx, this);
      G.drawFx(ctx, 'air');
      if (this.prompt) {
        const pr = this.prompt, s = (G.inputMode === 'touch' ? 'USE · ' : '[' + G.keyName('use') + '] ') + pr.label;
        ctx.font = '19px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center';
        const w = ctx.measureText(s).width + 16, by = pr.y - 16 + Math.sin(t * 5) * 2, px = clamp(pr.x, cam + w / 2 + 8, cam + W - w / 2 - 8);   // keep it on screen
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(px - w / 2, by - 15, w, 22);
        ctx.strokeStyle = pr.hot ? '#e0222c' : '#5a4a44'; ctx.lineWidth = 1; ctx.strokeRect(px - w / 2, by - 15, w, 22);
        ctx.fillStyle = pr.hot ? '#ff5a5a' : '#cfc4b8'; ctx.fillText(s, px, by);
      }
      ctx.restore();
      G.drawAtmosphere(ctx, L, cam, t, this.fairyAway ? { x: 640 - cam + shx, y: G.GROUND - 110, r: 300 } : { x: this.fairy.x - cam + shx, y: this.fairy.y + shy, r: (this.inside ? (this.inside.id === 'court' ? 280 : 150) : 115) * (this.mis('glow') ? 1.45 : 1) }, p.dead ? 0.6 : p.hp < p.maxHp * 0.35 ? 0.25 + Math.sin(t * 5) * 0.1 : 0,
        p.turnT != null ? 0.42 + Math.sin(t * 7) * 0.12 : p.inf > 40 ? (p.inf - 40) / 60 * 0.3 : 0);   // the fever closing in
      if (this.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, this.fade * 2.2)})`; ctx.fillRect(0, 0, W, H); }   // through the door
      this.drawHud(p, L, t);
    },

    drawWorldProps(L, t) {
      const gy = G.GROUND, glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
      // ledges: scaffolds outdoors, stone galleries in the cathedral. Solid from above only.
      for (const pl of L.platforms || []) {
        const lk = G.traps.ledgeLook(pl, t); if (!lk) continue;
        ctx.save(); ctx.globalAlpha = lk.alpha; ctx.translate(lk.sx || 0, lk.dy);
        const x = pl.x, y = gy - pl.h, w = pl.w, stone = L.theme === 'cathedral' || L.theme === 'crypt';
        const dark = stone ? '#1c181c' : '#1c1210', mid = stone ? '#34303a' : '#3a2618', lite = stone ? '#55505c' : '#5e4028';
        if (pl.float) {   // a slab hung over a pit on chains, not stood on posts
          ctx.fillStyle = '#2a2428'; for (const cx of [x + 6, x + w - 8]) for (let cy = y - 4; cy > 0; cy -= 8) ctx.fillRect(cx, cy, 2, 5);
          ctx.fillStyle = mid; ctx.fillRect(x, y, w, 10); ctx.fillStyle = lite; ctx.fillRect(x, y, w, 2); ctx.fillStyle = dark; ctx.fillRect(x, y + 8, w, 4);
          if (pl.crumble && !G.unfair()) { ctx.fillStyle = '#0a0607'; ctx.fillRect(x + w * 0.3, y + 1, 2, 7); ctx.fillRect(x + w * 0.3 + 2, y + 4, 4, 2); ctx.fillRect(x + w * 0.7, y + 2, 2, 8); }   // cracks: the tell, on Fair
          ctx.restore(); continue;
        }
        ctx.fillStyle = dark;
        for (const px of [x + 8, x + w - 14]) ctx.fillRect(px, y + 8, 6, pl.h - 8);
        if (!stone && !L.interior) { ctx.strokeStyle = dark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 11, y + 10); ctx.lineTo(x + w - 11, y + Math.min(pl.h, 70)); ctx.moveTo(x + w - 11, y + 10); ctx.lineTo(x + 11, y + Math.min(pl.h, 70)); ctx.stroke(); }
        else for (let a = x + 30; a < x + w - 30; a += 36) { ctx.beginPath(); ctx.arc(a + 18, y + 26, 16, Math.PI, 0); ctx.lineTo(a + 34, y + 8); ctx.lineTo(a + 2, y + 8); ctx.fill(); }
        ctx.fillStyle = mid; ctx.fillRect(x, y, w, 10); ctx.fillStyle = lite; ctx.fillRect(x, y, w, 2);
        ctx.fillStyle = dark; for (let a = x + (stone ? 22 : 26); a < x + w - 6; a += stone ? 22 : 26) ctx.fillRect(a, y + 2, 2, 8);
        if (stone) { ctx.fillStyle = mid; for (let a = x + 4; a < x + w - 4; a += 12) ctx.fillRect(a, y - 14, 4, 14); ctx.fillStyle = lite; ctx.fillRect(x, y - 16, w, 4); }
        ctx.restore();
      }
      // pits: stakes on the road and in the village, black water in the fen, a broken floor over the crypt
      for (const [pi, pk] of (L.pits || []).entries()) {
        const x = pk.x, w = pk.w, th = L.theme === 'crypt' ? 'cathedral' : L.theme, wall = th === 'cathedral' ? '#1c181c' : th === 'fen' ? '#0e1612' : '#1a1012';
        ctx.fillStyle = '#020102'; ctx.fillRect(x, gy - 3, w, G.H - gy + 3);
        ctx.fillStyle = wall; ctx.fillRect(x, gy - 3, 4, 70); ctx.fillRect(x + w - 4, gy - 3, 4, 70);
        ctx.fillStyle = th === 'cathedral' ? '#34303a' : '#2a1a1e'; for (const [ox, ww] of [[-6, 8], [w - 4, 10], [6, 4], [w - 14, 6]]) ctx.fillRect(x + ox, gy - 4, ww, 3);   // a crumbling lip
        if (th === 'fen') {
          ctx.fillStyle = '#0c201a'; ctx.fillRect(x + 4, gy + 2, w - 8, 110);                                      // black water, brim-full
          ctx.fillStyle = 'rgba(150,200,175,0.45)'; for (let k = 0; k < 5; k++) { const rx = x + 8 + ((k * 23 + t * 9 + pi * 7) % (w - 20)); ctx.fillRect(Math.round(rx / 2) * 2, gy + 2 + (k & 1) * 6, 8 + (k % 2) * 4, 2); }
          ctx.fillStyle = '#2a4034'; for (let k = x + 6; k < x + w - 4; k += 14) { const hh = 18 + ((k * 3) % 13); ctx.fillRect(k, gy - hh, 2, hh + 4); ctx.fillRect(k - 1, gy - hh - 6, 4, 6); }   // reeds at the brink
        } else {
          for (let k = x + 9; k < x + w - 6; k += 12) {
            const top = gy - 6 - ((k * 7) % 11);   // tips just above the ground, so the hole can be seen coming
            ctx.fillStyle = '#3a2618'; ctx.fillRect(k, top, 4, 70); ctx.fillRect(k + 1, top - 6, 2, 6);
            ctx.fillStyle = '#7a0509'; ctx.fillRect(k + 1, top - 6, 2, 5); ctx.fillRect(k, top + 4, 1, 8);
          }
          if (th === 'cathedral') { ctx.fillStyle = '#b8ac98'; ctx.fillRect(x + 14, gy + 52, 10, 4); ctx.fillRect(x + w - 26, gy + 56, 8, 8); ctx.fillStyle = '#0a0607'; ctx.fillRect(x + w - 24, gy + 58, 2, 2); }
        }
      }
      // gates: chained portcullis, rubble wall, red veil
      for (const [i, k] of (L.gates || []).entries()) {
        const x = k.x, open = this.gateOpen(i);
        if (k.kind === 'bars') {
          ctx.fillStyle = '#17110f'; ctx.fillRect(x - 34, gy - 210, 12, 210); ctx.fillRect(x + 22, gy - 210, 12, 210); ctx.fillRect(x - 40, gy - 222, 80, 14);
          ctx.fillStyle = '#2a2024'; ctx.fillRect(x - 34, gy - 210, 3, 210); ctx.fillRect(x + 22, gy - 210, 3, 210); ctx.fillRect(x - 40, gy - 222, 80, 3);
          const drop = open ? 168 : 0;
          ctx.fillStyle = '#3a363e'; for (let q = -20; q <= 20; q += 8) ctx.fillRect(x + q - 1, gy - 208, 3, 208 - drop);
          for (const hy of [60, 120, 180]) if (hy > drop) ctx.fillRect(x - 22, gy - hy, 44, 3);
          ctx.fillStyle = '#5a5660'; for (let q = -20; q <= 20; q += 8) ctx.fillRect(x + q - 1, gy - 208, 1, 208 - drop);
          if (!open) {   // chain and padlock
            ctx.fillStyle = '#8a8690'; for (let q = 0; q < 8; q++) ctx.fillRect(x - 24 + q * 6, gy - 98 + (q & 1) * 2, 5, 3);
            ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 5, gy - 96, 10, 12); ctx.fillStyle = '#3a2416'; ctx.fillRect(x - 1, gy - 92, 2, 4);
          } else { ctx.fillStyle = '#8a8690'; for (let q = 0; q < 5; q++) ctx.fillRect(x - 30 + q * 7, gy - 4 + (q & 1), 5, 3); }
        } else if (k.kind === 'wall') {
          const top = gy - k.h;
          ctx.fillStyle = '#1c1618'; ctx.fillRect(x - 18, top, 36, k.h);
          ctx.beginPath(); ctx.moveTo(x - 18, top + 30); ctx.lineTo(x - 46, gy); ctx.lineTo(x - 18, gy); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 18, top + 40); ctx.lineTo(x + 44, gy); ctx.lineTo(x + 18, gy); ctx.fill();
          ctx.fillStyle = '#2e262a'; for (let r2 = 0; r2 < k.h; r2 += 12) { ctx.fillRect(x - 18, top + r2, 36, 2); for (let q = ((r2 / 12) & 1) * 9; q < 36; q += 18) ctx.fillRect(x - 18 + q, top + r2, 2, 12); }
          ctx.fillStyle = '#4a4046'; ctx.fillRect(x - 20, top, 40, 3); ctx.fillRect(x - 16, top - 6, 10, 6); ctx.fillRect(x + 4, top - 4, 12, 4);
          ctx.fillStyle = '#2a2224'; for (const [ox, oy] of [[-38, 8], [-30, 16], [30, 10], [36, 4], [-24, 4]]) ctx.fillRect(x + ox, gy - oy - 6, 8, 6);
        } else {
          const n = open ? 6 : 46;
          for (let q = 0; q < n; q++) {
            const yy = ((q * 37 + t * (open ? 20 : 34) * (1 + (q % 3) * 0.3)) % (gy + 20)), xx = x + Math.sin(t * 1.1 + q * 1.7) * 22;
            ctx.fillStyle = q % 4 ? `rgba(190,20,40,${open ? 0.25 : 0.6})` : `rgba(255,70,80,${open ? 0.2 : 0.7})`;
            ctx.fillRect(Math.round(xx / 2) * 2 - 4, gy - Math.round(yy / 2) * 2, 8 + (q % 3) * 2, 8);
          }
          if (!open) glow(x, gy - 90, 110, 'rgba(200,20,40,0.22)');
        }
      }
      // the ring of white caps at the edge of the fen, brighter while someone stands still in it
      if (L.secret && !this.inside) {
        const x = L.secret.x, k = Math.min(1, (this.ringT || 0) / 2.8);
        glow(x, gy + 4, 70 + k * 90, `rgba(240,235,200,${0.08 + k * 0.3})`);
        for (let q = 0; q < 11; q++) { const a = q / 11 * Math.PI * 2, mx = x + Math.cos(a) * 34, my = gy + 8 + Math.sin(a) * 7; ctx.fillStyle = '#d8d0c0'; ctx.fillRect(mx - 1, my - 5, 2, 5); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(mx - 4, my - 8, 8, 3); }
        for (let q = 0; q < Math.floor(k * 14); q++) { const a = t * 2 + q * 0.45, r = 60 * (1 - k) + 10; ctx.fillStyle = 'rgba(255,240,180,0.9)'; ctx.fillRect(Math.round((x + Math.cos(a) * r) / 2) * 2, Math.round((gy - 30 + Math.sin(a * 1.3) * r * 0.6) / 2) * 2, 2, 2); }
      }
      // archways: onward at the far end, and back the way you came at the near end
      const arch = (x, col) => {
        glow(x, gy - 70, 130, col);
        ctx.fillStyle = '#050304'; ctx.fillRect(x - 46, gy - 150, 14, 150); ctx.fillRect(x + 32, gy - 150, 14, 150);
        ctx.beginPath(); ctx.moveTo(x - 46, gy - 150); ctx.quadraticCurveTo(x, gy - 215, x + 46, gy - 150); ctx.lineTo(x + 32, gy - 150); ctx.quadraticCurveTo(x, gy - 190, x - 32, gy - 150); ctx.fill();
      };
      if (L.exit) arch(L.exit.x, 'rgba(150,40,30,0.28)');
      if (this.levelIdx > 0 && !this.inside) arch(BACK_X, 'rgba(90,90,120,0.22)');
      if (!this.inside) for (const q of L.passages || []) {   // a stair going down, off the main road
        const open = this.hasTool(q.needs);
        arch(q.x, open ? 'rgba(120,150,190,0.24)' : 'rgba(70,70,80,0.16)');
        for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#0d0a0c' : '#1a1416'; ctx.fillRect(q.x - 30 + k * 4, gy - 12 + k * 2, 60 - k * 8, 2); }
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(q.x - 30, gy - 130, 60, 118);
        if (!open) { ctx.fillStyle = '#2a2224'; for (let k = 0; k < 4; k++) ctx.fillRect(q.x - 28 + k * 4, gy - 40 - k * 9, 56 - k * 8, 7); }
      }
      if (!this.inside) for (const d of L.doors || []) {   // building fronts, with a marker if someone inside has a quest
        const B = G.INTERIORS[d.to], mk = (B.npcs || []).map(n => !this.flags['dead_' + n.id] && G.questLog.marker(n.id)).find(Boolean);
        G.drawFacade(ctx, d, t, mk);
      }
      // boss altar & fog door
      if (L.boss) {
        if (L.boss.final) {
          const ax = L.boss.end + 130; glow(ax, gy - 90, 170, 'rgba(170,20,30,0.3)');
          ctx.fillStyle = '#0a0708'; ctx.fillRect(ax - 60, gy - 30, 150, 30); ctx.fillRect(ax + 30, gy - 190, 8, 160); ctx.fillRect(ax + 12, gy - 165, 44, 7);
        }
        if (!this.flags['boss_' + L.boss.type + '_dead']) {
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
        ctx.fillStyle = '#1a1318'; for (let r2 = 0; r2 < h; r2 += 14) { ctx.fillRect(x - w / 2, gy - h + r2, w, 2); for (let q = ((r2 / 14) & 1) * 16; q < w; q += 32) ctx.fillRect(x - w / 2 + q, gy - h + r2, 2, 14); }
        ctx.fillStyle = '#241a20'; ctx.fillRect(x - w / 2 - 12, gy - h - 2, w + 24, 4);
        ctx.strokeStyle = '#0c090c'; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; ctx.moveTo(x - Math.cos(a) * 15 * k, gy - h - 22 * k - Math.sin(a) * 15 * k); ctx.lineTo(x + Math.cos(a) * 15 * k, gy - h - 22 * k + Math.sin(a) * 15 * k); }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.beginPath(); ctx.moveTo(x - 20 * k, gy); ctx.lineTo(x - 20 * k, gy - 52 * k); ctx.quadraticCurveTo(x, gy - 84 * k, x + 20 * k, gy - 52 * k); ctx.lineTo(x + 20 * k, gy); ctx.fill();
      }
      // things lying in the world: white lilies, and weapons left where their owners fell
      (L.items || []).forEach((it, i) => {
        if (this.flags['item_' + this.lvKey() + '_' + i] || (it.needs && !this.flags[it.needs])) return;
        if (it.icon) {
          const x = it.x, y = gy - (it.alt || 0), bob = Math.round(Math.sin(t * 2 + i) * 2);
          if (it.gate === 'bars') { ctx.fillStyle = '#17110f'; ctx.fillRect(x - 22, y - 58, 44, 58); ctx.fillStyle = '#060304'; ctx.fillRect(x - 16, y - 50, 32, 50); ctx.fillStyle = '#241a1c'; ctx.fillRect(x - 24, y - 62, 48, 6); }
          glow(x, y - 26, 34 + Math.sin(t * 3 + i) * 4, 'rgba(240,205,120,0.38)');
          ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 8, y - 38 + bob, 16, 20); ctx.fillStyle = '#3a2416'; ctx.fillRect(x - 6, y - 36 + bob, 12, 16);          // gilt frame
          ctx.fillStyle = '#e6d6c8'; ctx.fillRect(x - 2, y - 34 + bob, 4, 4); ctx.fillStyle = '#16141c'; ctx.fillRect(x - 4, y - 30 + bob, 8, 8);                // a veiled face
          ctx.fillStyle = '#a00a12'; ctx.fillRect(x - 2, y - 32 + bob, 2, 4); ctx.fillStyle = '#f0d680'; ctx.fillRect(x - 8, y - 38 + bob, 16, 2);               // and its red tear
          if (it.gate === 'bars') { ctx.fillStyle = '#4a464e'; for (let q = -14; q <= 14; q += 7) ctx.fillRect(x + q - 1, y - 50, 3, 50); ctx.fillRect(x - 16, y - 30, 32, 3); }
          if (it.gate === 'veil') for (let q = 0; q < 26; q++) {
            const a = t * 0.9 + q * 0.7, r = 20 + (q % 5) * 5 + Math.sin(t * 2 + q) * 3; ctx.fillStyle = q % 3 ? 'rgba(190,20,40,0.55)' : 'rgba(120,10,30,0.7)';
            ctx.fillRect(x + Math.cos(a) * r - 3, y - 28 + Math.sin(a * 1.3) * r * 0.9 - 3, 6 + (q % 3) * 2, 6);
          }
          return;
        }
        if (it.ability) {   // a tool left where someone last needed it
          const x = it.x, y = gy - (it.alt || 0);
          glow(x, y - 20, 50 + Math.sin(t * 3) * 6, 'rgba(214,196,255,0.45)');
          ctx.fillStyle = '#3a342c'; ctx.fillRect(x - 2, y - 40, 4, 8); ctx.fillRect(x - 8, y - 32, 16, 4); ctx.fillRect(x - 8, y - 8, 16, 6);
          ctx.fillStyle = `rgba(230,215,255,${0.85 + Math.sin(t * 6) * 0.1})`; ctx.fillRect(x - 6, y - 28, 12, 20); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 24, 4, 10);
          ctx.fillStyle = '#3a342c'; ctx.fillRect(x - 8, y - 28, 2, 20); ctx.fillRect(x + 6, y - 28, 2, 20);
          return;
        }
        if (it.thorns) {   // a bundle of black thorns, for Misery
          const x = it.x, y = gy - (it.alt || 0);
          glow(x, y - 14, 40 + Math.sin(t * 3 + i) * 5, 'rgba(180,140,240,0.4)');
          ctx.fillStyle = '#2a1a30'; for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * 4, y - 22 + Math.abs(k) * 3, 2, 22 - Math.abs(k) * 3);
          ctx.fillStyle = '#b89ae0'; for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * 4 + (k & 1 ? 2 : -2), y - 16 + Math.abs(k) * 3, 2, 2);
          ctx.fillStyle = '#7a0509'; ctx.fillRect(x - 6, y - 8, 14, 2);
          return;
        }
        if (it.cache) {   // a reliquary left on a high ledge
          const x = it.x, y = gy - (it.alt || 0);
          glow(x, y - 12, 40 + Math.sin(t * 3 + i) * 5, 'rgba(240,200,110,0.4)');
          ctx.fillStyle = '#3a2416'; ctx.fillRect(x - 12, y - 16, 24, 16); ctx.fillStyle = '#5a3a20'; ctx.fillRect(x - 12, y - 20, 24, 6);
          ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 12, y - 14, 24, 2); ctx.fillRect(x - 2, y - 16, 4, 8); ctx.fillRect(x - 12, y - 20, 2, 20); ctx.fillRect(x + 10, y - 20, 2, 20);
          return;
        }
        if (it.weapon) {
          const x = it.x, kind = G.WEAPONS[it.weapon].draw;
          glow(x, gy - 34, 46 + Math.sin(t * 3 + i) * 5, 'rgba(240,210,150,0.34)');
          if (kind !== 'sword' && kind !== 'greatsword') ctx.fillStyle = '#4a3426', ctx.fillRect(x - 2, gy - 62, 4, 62);   // shaft, driven into the ground
          ctx.fillStyle = '#b9bcc6';
          if (kind === 'axe') { ctx.fillRect(x + 2, gy - 62, 16, 22); ctx.fillRect(x + 14, gy - 66, 6, 30); ctx.fillStyle = '#eef0f5'; ctx.fillRect(x + 18, gy - 64, 2, 26); }
          else if (kind === 'sword' || kind === 'greatsword') {   // a blade driven point-first into the earth
            const big = kind === 'greatsword', h = big ? 70 : 34, w = big ? 8 : 4;
            ctx.fillStyle = '#b9bcc6'; ctx.fillRect(x - w / 2, gy - h, w, h);
            ctx.fillStyle = '#eef0f5'; ctx.fillRect(x - w / 2, gy - h, 1, h); ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - (big ? 12 : 7), gy - h - 4, big ? 24 : 14, 4);
            ctx.fillStyle = '#4a3426'; ctx.fillRect(x - 2, gy - h - (big ? 20 : 12), 4, big ? 16 : 8); ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 3, gy - h - (big ? 24 : 15), 6, 4);
          }
          else if (kind === 'spear') { ctx.fillRect(x - 4, gy - 74, 8, 12); ctx.fillRect(x - 2, gy - 82, 4, 8); }
          else { ctx.fillStyle = '#7d808c'; ctx.fillRect(x + 2, gy - 60, 2, 2); ctx.fillRect(x + 6, gy - 56, 2, 2); ctx.fillRect(x + 10, gy - 50, 2, 2); ctx.fillStyle = '#b9bcc6'; ctx.fillRect(x + 8, gy - 46, 12, 12); ctx.fillRect(x + 12, gy - 50, 4, 20); ctx.fillRect(x + 4, gy - 42, 20, 4); }
          return;
        }
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
        const seen = this.read[this.lvKey() + ':' + i];
        if (!seen) glow(n.x, gy - 8, 34 + Math.sin(t * 3) * 5, 'rgba(230,210,160,0.35)');
        ctx.save(); ctx.translate(n.x, gy - 5); ctx.rotate(-0.2); ctx.fillStyle = seen ? '#5a4f40' : '#c9b78f'; ctx.fillRect(-8, -5, 16, 10); ctx.restore();
      });
      // bloodstain
      const s = this.stain;
      if (s && !this.inside && s.lv === this.levelIdx) { glow(s.x, gy - 14, 44 + Math.sin(t * 4) * 6, 'rgba(220,20,30,0.5)'); ctx.fillStyle = '#7a0509'; ctx.beginPath(); ctx.ellipse(s.x, gy + 6, 22, 5, 0, 0, 7); ctx.fill(); }
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
      if (this.misery.thorns > 0) { ctx.font = '17px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#a88ad0'; ctx.fillText('Thorns ' + this.misery.thorns, 26, 134); ctx.textAlign = 'right'; }
      if (this.bossFight && this.boss) {
        const b = this.boss; ctx.textAlign = 'center'; ctx.font = '20px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#cfc4b8'; ctx.fillText(b.def.name + (G.unfair() ? '  ·  unfair' : ''), W / 2, H - 46);
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
        const k = G.keyName; ctx.fillText(`${k('left')}/${k('right')} move  ·  ${k('jump')} jump  ·  ${k('attack')} slash  ·  ${k('heavy')} heavy  ·  ${k('roll')} roll  ·  ${k('block')} block  ·  ${k('flask')} flask  ·  ${k('use')} interact`, W / 2, H - 14); ctx.globalAlpha = 1;
      }
      // infection meter, tincture vials and the turning clock
      const sick = p.inf >= 75 || p.turnT != null;
      bar(24, 54, 170, 6, p.inf / 100, sick && Math.sin(t * 9) > 0 ? '#e060f0' : '#8a2a9a', '#3a2a3a');
      ctx.font = '14px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = sick ? '#e060f0' : '#8a7a90'; ctx.fillText('INFECTION', 200, 61);
      for (let i = 0; i < p.tinctMax; i++) {
        const x = 34 + p.flaskMax * 20 + i * 18, y = 85; ctx.fillStyle = i < p.tinct ? '#c9b3f0' : '#2a2430';
        ctx.fillRect(x - 1, y - 9, 2, 18); ctx.fillRect(x - 3, y - 5, 6, 10); ctx.fillRect(x - 5, y - 1, 10, 2);
      }
      ctx.font = '16px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#b9ada0';
      const wl = this.weaponLv[this.weaponId] || 0;
      ctx.fillText(p.weapon.name + (wl ? ' +' + wl : '') + (this.weapons.length > 1 ? '  [' + G.keyName('swap') + ']' : ''), 26, 114);
      if (this.items.icon) { ctx.fillStyle = '#c9a13b'; ctx.fillText('Icons  ' + this.items.icon + ' / ' + this.iconTotal(), 26, 132); }
      if (p.turnT != null && !p.dead) {
        const s = Math.ceil(p.turnT); ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 230, 150, 460, 58);
        ctx.font = '30px "Jersey 15", "VT323", monospace'; ctx.fillStyle = Math.sin(t * 9) > 0 ? '#ff7aff' : '#c04ad0'; ctx.fillText('YOU ARE TURNING  —  0:' + String(s).padStart(2, '0'), W / 2, 176);
        ctx.font = '18px "Jersey 15", "VT323", monospace'; ctx.fillStyle = '#d8c6ff';
        ctx.fillText(p.tinct > 0 ? 'Drink a lily tincture (' + G.keyName('cure') + ') or reach a Sister of the Lily' : 'Reach a Sister of the Lily before your eyes run red', W / 2, 198);
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
      G.pollPad(); game.tick(dt); game.draw(); G.input.clear();
      // touch layout: hide the pad under menus, and show the Use button only when there is something to use
      const cl = document.body.classList, open = G.ui.blocking || game.mode !== 'play', pr = open ? null : game.prompt;
      if (cl.contains('ui-open') !== open) { cl.toggle('ui-open', open); if (open) G.input.held = {}; }
      if (cl.contains('can-use') !== !!pr) cl.toggle('can-use', !!pr);
      const ledge = !open && !game.player.air && game.player.alt > 0; if (cl.contains('on-ledge') !== ledge) cl.toggle('on-ledge', ledge);
      if (pr && useBtn) { const s = pr.hot ? 'Execute' : pr.label.split(' ')[0]; if (useBtn.textContent !== s) { useBtn.textContent = s; useBtn.classList.toggle('hot', !!pr.hot); } }
      if (game.player.flaskMax !== lastFlasks) { lastFlasks = game.player.flaskMax; document.documentElement.style.setProperty('--flasks', lastFlasks); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
})();
