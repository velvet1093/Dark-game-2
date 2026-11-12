'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — entities: the knight and the things he cuts apart
// ---------------------------------------------------------------------------
const { rand, clamp, lerp } = G;
const basePose = () => ({ lean: 0.08, head: 0, crouch: 0, armA: 0.5, armE: 1.0, w: 2.5, bA: -0.25, bE: 0.5, footF: 7, footB: -7, liftF: 0, liftB: 0 });
const walkPose = (P, ph, stride = 12) => {
  P.footF = Math.sin(ph) * stride; P.footB = -Math.sin(ph) * stride;
  P.liftF = Math.max(0, Math.cos(ph)) * 5; P.liftB = Math.max(0, -Math.cos(ph)) * 5;
};

// ================================ PLAYER ===================================
G.Player = class {
  constructor() {
    this.stats = { vig: 0, str: 0, end: 0 };
    this.weapon = G.WEAPONS.longsword;
    this.look = G.LOOKS.player;
    this.x = 120; this.facing = 1;
    // Infection: 0-100. It climbs with every wound. At 100 the knight begins to turn
    // and has turnT seconds to reach a Sister or drink a lily tincture.
    this.inf = 0; this.turnT = null; this.tinct = 1;
    this.reset();
  }
  get maxHp() { return 100 + this.stats.vig * 16; }
  get flaskMax() { return 3 + (this.stats.flask || 0); }
  get maxSt() { return 100 + this.stats.end * 12; }
  get dmgMul() { const g = G.game, lv = (g.weaponLv && g.weaponLv[g.weaponId]) || 0, S = G.skills, art = S && S.art(g); return (1 + this.stats.str * 0.09) * (1 + 0.15 * lv) * (this.turnT != null ? 1.25 : 1) * (S && S.has(g, 'edge') ? 1.15 : 1) * (art === 'greatsword' && this.hp > this.maxHp * 0.75 ? 1.3 : 1); }
  get tinctMax() { return 1 + (this.stats.tinct || 0); }
  infect(n, g) {
    if (this.dead || this.turnT != null) return;
    if (g && g.flags && g.flags.seelie) n *= 0.75;   // the Lantern Court's favour
    this.inf = Math.min(100, this.inf + n);
    if (this.inf >= 100) {
      this.turnT = 45; G.sfx('infect'); g.shake = 10;
      G.text(this.x, G.GROUND - 120, 'THE INFECTION TAKES HOLD', '#c04ad0', 18);
      g.fairy.cd = 0; g.fairy.bark('turning', true);
    }
  }
  // Lily-water: from a Sister (full) or a tincture (partial).
  cleanse(amount) { this.inf = Math.max(0, this.inf - amount); if (this.inf < 100) this.turnT = null; }
  reset() {
    this.hp = this.maxHp; this.st = this.maxSt; this.flasks = this.flaskMax;
    this.state = 'idle'; this.t = 0; this.vx = 0; this.dead = false; this.walk = 0;
    this.combo = 0; this.buf = null; this.stDelay = 0; this.flash = 0; this.bloody = 0; this.trail = []; this.turned = false; this.curing = false; this.alt = 0; this.vy = 0; this.air = false; this.dropT = 0; this.pitInv = 0; this.pitRef = null; this.safeX = null;
  }
  set(state) { this.state = state; this.t = 0; }
  startAttack(atk, combo) {
    const g = G.game, S = G.skills;
    if (S && combo >= 0 && S.art(g) === 'longsword' && !atk.finisher) atk = Object.assign({}, atk, { wind: atk.wind * 0.67, rec: atk.rec * 0.75 });   // Oath of the Battalion
    this.atk = atk; this.combo = combo; this.set('attack'); this.hitSet = new Set(); this.swung = false;
    this.st = Math.max(0, this.st - atk.st * (S && S.has(g, 'thrift') ? 0.75 : 1));
    if (atk.finisher) G.text(this.x, G.GROUND - 120, 'FINAL BLOW', '#e0b84a', 14); if (atk.charged) G.text(this.x, G.GROUND - 120, 'GATHERED STRENGTH', '#e0b84a', 14); this.stDelay = 0.7; this.buf = null;
    if (atk.poiseBreak) G.sfx('whoosh');
  }
  // The flask in his hand while he drinks: a small bottle, tipped up under the visor, emptying.
  drawFlask(ctx, o, time) {
    const t = this.t, f = this.facing, [hx, hy] = o.out.head, [px, py] = o.out.hip;
    const up = G.ease(Math.min(1, t / 0.25)), down = G.ease(Math.max(0, Math.min(1, (t - 0.72) / 0.3))), k = up * (1 - down);
    const x = px - f * 6 + (hx + f * 7 - (px - f * 6)) * k, y = py + 2 + (hy + 8 - (py + 2)) * k;   // from the belt to the mouth and back
    const tilt = k * (t > 0.25 && t < 0.72 ? 2.2 : 1.4) * f, level = Math.max(0, 1 - Math.max(0, t - 0.3) / 0.35), liquid = this.curing ? '#b79be8' : '#e8d49a';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(tilt); ctx.scale(1.6, 1.6);
    ctx.fillStyle = '#1a1214'; ctx.fillRect(-5, -6, 10, 12); ctx.fillRect(-3, -11, 6, 5);                         // outline
    ctx.fillStyle = 'rgba(220,226,236,0.85)'; ctx.fillRect(-4, -5, 8, 10); ctx.fillRect(-2, -10, 4, 5);         // glass
    ctx.fillStyle = liquid; const lh = Math.round(9 * level); ctx.fillRect(-4, 5 - lh, 8, lh);                   // what is left
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-3, -4, 1, 4); ctx.fillStyle = '#5a3a20'; ctx.fillRect(-2, -12, 4, 2); // shine, cork
    ctx.restore();
    if (t > 0.3 && t < 0.62 && Math.random() < 0.5) { ctx.fillStyle = liquid; ctx.fillRect(Math.round(hx + f * 4), Math.round(hy + 10 + Math.random() * 8), 2, 2); }   // a drip
  }
  // A blow landing, with whatever the weapon's skills add to it.
  landHit(e, a, dmg, g, w) {
    const S = G.skills, art = S && S.art(g), fx = { bleed: w.bleed * (S && S.has(g, 'bleed') ? 1.6 : 1) };
    if (art === 'dawnbrand' && a.poiseBreak) { dmg *= 1.4; if (G.voice) G.game.voiceFlash = Math.max(G.game.voiceFlash || 0, 0.45); }   // Dawnfire
    if (art === 'knife' && (this.cut7 = (this.cut7 || 0) + 1) % 7 === 0) e.bleed = Math.max(e.bleed, 100 - fx.bleed);   // the seventh cut
    e.takeHit(dmg, a, this.facing, g, fx); this.bloody = Math.min(1, this.bloody + 0.25);
    if (art === 'iceaxe' && !e.dead) { if (!(e.frostT > 0)) G.text(e.x, G.GROUND - 120 * e.scale, 'FROSTBITE', '#b8d8f0', 12); e.frostT = 3; }
  }
  startExecute(e) {
    this.target = e; e.state = 'executed'; e.t = 0; e.vx = 0;
    this.facing = e.x >= this.x ? 1 : -1; this.x = e.x - this.facing * 46 * e.scale; e.facing = -this.facing;
    const X = G.execKindFor ? G.execKindFor(e, this) : { kind: Math.random() < 0.5 ? 'decap' : 'impale' };
    this.execKind = X.kind; this.execText = X.text || null; this.execHit = 0; this.struck = false; this.set('execute'); this.vx = 0; this.qte = null; this.qteDone = false;
    const XD = G.EXECS && G.EXECS[X.kind]; if (XD && XD.close) this.x = e.x - this.facing * XD.close * e.scale;   // close enough to take hold
  }
  get invulnerable() { return this.dead || this.pitInv > 0 || this.state === 'execute' || (this.state === 'roll' && this.t < 0.32); }

  damage(dmg, fromX, g) {
    if (this.invulnerable || this.state === 'rip') return false;   // nothing interrupts the tearing
    const dir = this.x >= fromX ? 1 : -1;
    if (this.state === 'block' && this.facing === -dir) {
      this.st -= dmg * 1.15; this.stDelay = 0.9; this.vx = dir * 110;
      G.sfx('block'); G.spark(this.x + this.facing * 16, G.GROUND - 50, 8);
      if (this.st > 0) return false;
      this.st = 0; G.text(this.x, G.GROUND - 90, 'GUARD BROKEN', '#d9c9b0'); G.sfx('guardbreak'); dmg *= 0.4;
    }
    this.hp -= dmg; this.flash = 0.12; this.vx = dir * 220; this.set('hurt'); this.infect(dmg * 0.55, g);
    G.blood(this.x, G.GROUND - 50, 14, dir, 240); G.sfx('hurt'); g.shake = 8;
    if (this.hp <= 0 && g.mis && g.mis('watch') && !g.watchUsed) { this.hp = 1; g.watchUsed = true; G.text(this.x, G.GROUND - 150, 'NOT YET', '#d8c6ff', 20); G.sfx('chime'); g.fairy.cd = 0; g.fairy.sayLine(G.pick(G.FAIRY.notYet)); g.save && g.save(); }
    if (this.hp <= 0) { this.hp = 0; this.dead = true; this.set('dead'); G.sfx('death'); G.blood(this.x, G.GROUND - 40, 50, dir, 320); G.decal(this.x, 10, 30); g.onPlayerDeath(); }
    else g.fairy.bark('hurt', false, 0.5);
    return true;
  }

  update(dt, g) {
    const I = G.input, w = this.weapon;
    this.t += dt; this.flash -= dt; this.bloody = Math.max(0, this.bloody - dt * 0.03);
    if (this.dead) { this.vx *= Math.pow(0.002, dt); this.x += this.vx * dt; this.alt = Math.max(0, this.alt - 500 * dt); return; }
    if (this.turnT != null && this.state !== 'execute' && (this.turnT -= dt) <= 0) {
      // out of time: the knight turns
      this.turnT = null; this.turned = true; this.hp = 0; this.dead = true; this.set('dead'); G.sfx('death'); G.sfx('roar'); g.onPlayerDeath(); return;
    }
    for (const a of ['attack', 'heavy', 'roll', 'jump']) if (I.hit(a)) this.buf = { a, t: 0.25 };
    if (this.buf && (this.buf.t -= dt) <= 0) this.buf = null;
    const dir = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0);
    const want = a => this.buf && this.buf.a === a;
    let friction = 0.0005;

    if (this.state === 'idle' || this.state === 'block') {
      const blocking = I.down('block');
      this.state = blocking ? 'block' : 'idle';
      if (dir) {
        const before = Math.floor(this.walk / Math.PI);
        this.facing = dir; this.walk += dt * (blocking ? 7 : 11);
        if (Math.floor(this.walk / Math.PI) !== before) G.sfx('step');
      }
      this.vx = dir * (blocking ? 62 : 158);
      if (want('jump') && this.air && g.abilities.dj && !this.jumped2 && this.st > 0) {
        // Moth Wings: a second jump from thin air
        this.buf = null; this.jumped2 = true; this.wingT = 0.5; this.st = Math.max(0, this.st - 8); this.vy = 470; G.sfx('roll'); G.sfx('chime');
        for (let i = 0; i < 6; i++) G.fx.sparks.push({ x: this.x + G.rand(-12, 12), y: G.GROUND - this.alt, vx: G.rand(-60, 60), vy: G.rand(20, 120), t: 0.3 });
      } else if (want('jump') && !this.air && this.st > 0) {
        // a short hop: clears hounds and crawlers, and lets the sword reach what flies
        this.buf = null; this.st = Math.max(0, this.st - 10); this.stDelay = 0.4; this.vy = 520; this.air = true; G.sfx('roll');
      } else if (want('roll') && !this.air && this.st > 0) {
        this.buf = null; this.st = Math.max(0, this.st - 22); this.stDelay = 0.6;
        if (dir) this.facing = dir; this.set('roll'); G.sfx('roll');
      } else if (want('attack') && this.air && I.down('down') && this.st > 0 && G.skills && G.skills.has(g, 'plunge')) { this.buf = null; this.set('plunge'); this.vy = -950; this.vx = 0; this.st = Math.max(0, this.st - 14); G.sfx('whoosh'); }
      else if (want('attack') && this.st > 0) this.startAttack(w.light[0], 0);
      else if (want('heavy') && this.st > 0 && G.skills && G.skills.has(g, 'charge') && !this.air) { this.buf = null; this.set('charge'); this.chargeReady = false; }
      else if (want('heavy') && this.st > 0) this.startAttack(w.heavy, -1);
      else if (I.hit('flask') && this.flasks > 0 && this.hp < this.maxHp) { this.flasks--; this.healed = false; this.curing = false; this.set('heal'); G.sfx('gulp'); g.fairy.bark('heal', false, 0.6); }
      else if (I.hit('cure') && this.tinct > 0 && this.inf > 0) { this.tinct--; this.healed = false; this.curing = true; this.set('heal'); G.sfx('gulp'); }
    } else if (this.state === 'attack') {
      const a = this.atk, t1 = a.wind, t2 = t1 + a.active, t3 = t2 + a.rec;
      if (!this.swung && this.t >= t1) { this.swung = true; this.vx = this.facing * a.lunge; G.sfx('swing'); }
      if (this.t >= t1 && this.t < t2) {
        for (const e of g.enemies) {
          if (e.dead || e.state === 'executed' || this.hitSet.has(e.id) || e.alt - this.alt > 95 || this.alt - e.alt > 64) continue;
          const rel = (e.x - this.x) * this.facing;
          if (rel > -12 && rel < a.reach * (G.skills && G.skills.art(g) === 'spear' ? 1.25 : 1) + 14 * e.scale) { this.hitSet.add(e.id); this.landHit(e, a, a.dmg * this.dmgMul, g, w); }
        }
      }
      if (this.t > t2 + a.rec * 0.35) {
        if (want('attack') && this.combo >= 0 && this.combo < w.light.length - 1 && this.st > 0) { if (dir) this.facing = dir; this.startAttack(w.light[this.combo + 1], this.combo + 1); }
        else if (want('attack') && this.combo === w.light.length - 1 && this.st > 0 && G.skills && G.skills.has(g, 'finisher')) { if (dir) this.facing = dir; this.startAttack(G.skills.finisher(w), w.light.length); }
        else if (want('roll') && this.st > 0) { this.buf = null; this.st = Math.max(0, this.st - 22); if (dir) this.facing = dir; this.set('roll'); G.sfx('roll'); }
      }
      if (this.t >= t3) this.set('idle');
    } else if (this.state === 'roll') {
      if (this.t < 0.34) this.vx = this.facing * 340;
      if (this.t >= 0.46) this.set('idle');
      friction = 0.02;
    } else if (this.state === 'hurt') {
      if (this.t >= 0.36) this.set('idle');
    } else if (this.state === 'heal') {
      this.vx = 0;
      if (!this.healed && this.t >= 0.62) this.healFx = 0.7;   // the warmth going through him
      if (!this.healed && this.t >= 0.62 && this.curing) { this.healed = true; this.cleanse(55); G.sfx('cleanse'); G.text(this.x, G.GROUND - 90, 'Lily tincture', '#d8c6ff', 13); g.fairy.bark('cleansed', false, 0.7); }
      if (!this.healed && this.t >= 0.62) { this.healed = true; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.45); G.sfx('heal'); G.text(this.x, G.GROUND - 90, 'Blessed water', '#d9c9b0', 13); }
      if (this.t >= 1.05) this.set('idle');
    } else if (this.state === 'sit' || this.state === 'rise') {
      // resting at a vigil candle: sit until something is pressed, then get up
      this.vx = 0; this.buf = null;
      if (this.state === 'sit' && !G.ui.blocking && this.t > 0.7 && (dir || I.down('block') || ['attack', 'heavy', 'roll', 'jump', 'flask', 'cure', 'use'].some(a => I.hit(a)))) { this.set('rise'); G.sfx('step'); }
      if (this.state === 'rise' && this.t >= 0.42) this.set('idle');
    } else if (this.state === 'charge') {   // gathering strength while heavy is held
      this.vx = 0;
      if (!this.chargeReady && this.t >= 0.5) { this.chargeReady = true; G.sfx('chime'); for (let i = 0; i < 8; i++) G.fx.sparks.push({ x: this.x + G.rand(-16, 16), y: G.GROUND - this.alt - G.rand(20, 80), vx: G.rand(-40, 40), vy: G.rand(-80, -20), t: 0.35 }); }
      if (!I.down('heavy') || this.t >= 1.2) this.startAttack(this.chargeReady ? G.skills.charged(w) : w.heavy, -1);
    } else if (this.state === 'plunge') {   // falling blade-first
      this.vx = 0;
      if (!this.air && !this.plunged) {
        this.plunged = true; g.shake = 12; G.sfx('thud'); G.sfx('sever'); G.spark(this.x, G.GROUND - this.alt, 16);
        const a = G.skills.plunge(w);
        for (const e of g.enemies) if (!e.dead && e.state !== 'executed' && Math.abs(e.x - this.x) < 90 && Math.abs((e.alt || 0) - this.alt) < 70) this.landHit(e, a, a.dmg * this.dmgMul, g, w);
        this.plungeT = 0.35;
      }
      if (this.plunged && (this.plungeT -= dt) <= 0) { this.plunged = false; this.set('idle'); }
    } else if (this.state === 'rip') {   // tearing out the Lamplight Mother's wings
      this.vx = 0; const e = this.target;
      if (e) { e.ripSide = (this.x >= e.x ? 1 : -1) * e.facing; e.ripPull = this.t < 0.35 ? 0 : this.t < 1.15 ? Math.min(1, (this.t - 0.35) / 0.6) : 0; }
      if (this.t > 0.4 && this.t < 1.15 && Math.floor(this.t * 6) !== Math.floor((this.t - dt) * 6)) { G.sfx('grunt'); g.shake = Math.max(g.shake, 3); if (e) G.blood(e.x + (this.x >= e.x ? 14 : -14), G.GROUND - 50, 4, this.facing * -1, 160); }   // tug, tug
      if (!this.ripped && this.t >= 1.15) { this.ripped = true; g.ripWings(e, this); }
      if (this.t > 1.5 && this.t < 2.0) this.x -= this.facing * 40 * dt;   // step back from what you have done
      if (this.t >= 2.0) { this.set('idle'); this.target = null; }
    } else if (this.state === 'execute') {
      this.vx = 0;
      const X = G.EXECS[this.execKind] || G.EXECS.decap, e = this.target;
      if (X.qte && e && !this.qteDone && this.t >= X.qte.at) {   // hold her under: press, press, press
        const Q = this.qte || (this.qte = { fill: 0.4, time: X.qte.time, shove: 0 }), un = G.unfair();
        this.t = X.qte.at; Q.time -= dt; Q.shove = Math.max(0, Q.shove - dt * 6);
        Q.fill -= dt * (un ? 0.34 : 0.26);                                   // she fights back up
        if (I.hit('use') || I.hit('attack') || I.hit('confirm')) { Q.fill += un ? 0.075 : 0.09; Q.shove = 1; G.sfx('splat'); g.shake = Math.max(g.shake, 3); }
        Q.fill = Math.min(1, Q.fill);
        e.struggle = 1 - Q.fill; e.sinkTarget = (26 + Q.fill * 34) * e.scale;   // only her head and arms above the water
        if (Math.random() < dt * (4 + e.struggle * 10)) G.sfx(Math.random() < 0.3 ? 'scream' : 'splat');
        if (Q.fill >= 1) { this.qteDone = true; this.qte = null; e.struggle = 0.5; e.sinkTarget = 44 * e.scale; G.text(e.x, G.GROUND - 120, 'HELD UNDER', '#e0d8c8', 16); g.hitstop = 0.08; }
        else if (Q.fill <= 0 || Q.time <= 0) {   // she breaks free and throws him off
          this.qte = null; e.struggle = 0; e.sinking = false; e.sinkTarget = null; e.sink = 0; e.set('broken'); e.vx = 0;
          G.text(e.x, G.GROUND - 140, 'SHE BREAKS FREE', '#e0222c', 18); G.sfx('roar'); g.shake = 12;
          G.blood(e.x, G.GROUND - 30, 20, -this.facing, 260);
          this.set('hurt'); this.vx = -this.facing * 260; this.hp = Math.max(1, this.hp - this.maxHp * 0.12); this.flash = 0.2; this.target = null;
          return;
        }
      }
      if (e && e.struggle && this.qteDone && this.t < X.hits[X.hits.length - 1]) { const u = (this.t - X.qte.at) / 1.43; e.struggle = Math.max(0, 0.5 - u * 0.5); e.sinkTarget = (44 + u * 70) * e.scale; }   // weaker, and slowly under
      while (!this.struck && this.execHit < X.hits.length && this.t >= X.hits[this.execHit]) {   // each blow as its moment comes; the last one kills
        if (this.execHit === X.hits.length - 1) { this.struck = true; this.bloody = 1; g.executeStrike(e, this); }
        else if (X.mid && e) X.mid(g, e, this, this.execHit);
        this.execHit++;
      }
      if (e && e.lifting) e.lift = Math.min(70 * e.scale, (e.lift || 0) + 140 * e.scale * dt);   // up on the blade
      if (X.step && this.struck && this.t < X.dur) this.x += this.facing * X.step * dt;
      if (this.t >= X.dur) this.set('idle');
    }

    // stamina
    this.stDelay -= dt;
    if (this.stDelay <= 0 && this.state !== 'attack' && this.state !== 'roll') this.st = Math.min(this.maxSt, this.st + (this.state === 'block' ? 14 : 48) * (this.inf >= 75 ? 0.6 : this.inf >= 50 ? 0.8 : 1) * dt);

    // movement: enemies are solid unless we are rolling through them
    const px0 = this.x; this.x += this.vx * dt;
    if (this.state !== 'idle' && this.state !== 'block') this.vx *= Math.pow(friction, dt);
    if (this.state !== 'roll' && this.state !== 'execute') {
      for (const e of g.enemies) {
        if (e.dead || e.crawling || e.state === 'broken' || e.def.fly || (this.alt > 30 && e.def.model === 'hound') || Math.abs(this.alt - e.alt) > 50) continue;
        const d = this.x - e.x, min = 22 * e.scale;
        if (Math.abs(d) < min) this.x = e.x + (d >= 0 ? min : -min);
      }
    }
    this.x = clamp(this.x, g.bounds[0], g.bounds[1]);
    this.x = g.gateClamp(px0, this.x, this.alt);
    // pits: the ground gives way under a body that walks or rolls onto one
    this.pitInv -= dt;
    const pit = g.pitAt(this.x);
    if (!this.air && this.alt === 0) { if (pit && this.state !== 'execute') { this.air = true; this.vy = 0; } else if (!pit) this.safeX = this.x; }
    if (this.alt < 0) {
      const pk = this.pitRef || (this.pitRef = g.pitAt(this.x) || (g.level.pits || []).find(q => this.x > q.x - 20 && this.x < q.x + q.w + 20));
      if (pk) this.x = clamp(this.x, pk.x + 8, pk.x + pk.w - 8);
      if (this.alt < -64) { g.impale(this, pk); return; }
    } else this.pitRef = null;
    // gravity, ledges and the ground. Ledges are solid from above only; hold down to drop through one.
    const plats = g.surf;
    this.dropT -= dt;
    if (!this.air && this.alt > 0) {
      if (I.down('down')) { this.air = true; this.dropT = 0.25; this.vy = 0; }
      else if (!plats.some(pl => Math.abs(pl.h - this.alt) < 1 && this.x >= pl.x - 4 && this.x <= pl.x + pl.w + 4)) { this.air = true; this.vy = 0; }
    }
    if (this.air) {
      // gliding: falling with jump held, on the Lamplight Mother's wings
      this.gliding = !!(g.abilities.dj && this.vy < 0 && I.down('jump') && (this.state === 'idle' || this.state === 'block') && !this.dead);
      const prev = this.alt; this.vy -= 1500 * dt; if (this.gliding) this.vy = Math.max(this.vy, -80); this.alt += this.vy * dt;
      if (this.vy <= 0) {
        let land = -1;
        if (this.dropT <= 0) for (const pl of plats) if (this.x >= pl.x && this.x <= pl.x + pl.w && pl.h <= prev + 0.5 && pl.h >= this.alt && pl.h > land) land = pl.h;
        if (land < 0 && this.alt <= 0 && !g.pitAt(this.x)) land = 0;
        if (land >= 0) { this.alt = land; this.vy = 0; this.air = false; this.jumped2 = false; G.sfx('step'); G.sfx('thud'); }
      }
    }
  }

  pose() {
    const P = basePose(), s = this.state, t = this.t;
    P.bA = 0.2; P.bE = 0.9;
    if (s === 'idle' || s === 'block') {
      if (Math.abs(this.vx) > 5) walkPose(P, this.walk); else P.crouch = Math.sin(G.game.time * 2) * 0.6 + 0.6;
      if (s === 'block') { P.shieldFront = true; P.bA = 1.2; P.bE = 0.6; P.lean = 0.2; P.crouch = 4; P.armA = 0.1; P.w = 2.9; }
    } else if (s === 'attack') {
      const a = this.atk; P.footF = 13; P.footB = -11; P.crouch = 3;
      if (t < a.wind) G.swing(P, a.anim, 0, t / a.wind);
      else if (t < a.wind + a.active) G.swing(P, a.anim, 1, (t - a.wind) / a.active);
      else G.swing(P, a.anim, 2, Math.min(1, (t - a.wind - a.active) / a.rec));
    } else if (s === 'roll') {
      P.spin = Math.min(1, t / 0.42) * Math.PI * 2; P.crouch = 16; P.lean = 0.9; P.head = 0.5; P.armA = 1.2; P.armE = 1.6; P.w = 1.5; P.footF = 6; P.footB = 0;
    } else if (s === 'hurt') {
      P.lean = -0.3; P.head = -0.3; P.armA = -0.3; P.w = 1.8; P.footF = 2; P.footB = -12;
    } else if (s === 'heal') {
      // the flask off the belt, up under the visor, head back, a long swallow, and down
      const up = G.ease(Math.min(1, t / 0.25)), down = G.ease(Math.max(0, Math.min(1, (t - 0.72) / 0.3))), k = up * (1 - down), sw = t > 0.25 && t < 0.7 ? Math.sin(t * 22) * 0.04 : 0;
      P.bA = 0.2 + 2.3 * k; P.bE = 0.9 - 0.3 * k; P.head = -0.45 * k + sw; P.lean = -0.18 * k; P.armA = 0.2; P.w = 0.6; P.footF = 10; P.footB = -9; P.crouch = t > 0.62 && t < 0.8 ? 2 : 0;
    } else if (s === 'charge') {
      G.swing(P, this.weapon.heavy.anim, 0, Math.min(1, t / 0.5)); P.crouch = 6 + Math.sin(t * 40) * (this.chargeReady ? 1 : 0); P.footF = 13; P.footB = -12;
    } else if (s === 'plunge') {
      G.swing(P, G.ANIM.slam, this.plunged ? 2 : 1, this.plunged ? 0.3 : 0.9); P.footF = 6; P.footB = -4; P.crouch = this.plunged ? 10 : 0;
    } else if (s === 'rip') {
      // reach in, grip with both hands, haul back in jerks, then the tear: arms flung up and back with the wing
      if (t < 0.35) { const u = t / 0.35; Object.assign(P, { armA: 2.1 * u, armE: 0.3, bA: 1.9 * u, bE: 0.4, lean: 0.3 * u, footF: 12, footB: -8 }); }
      else if (t < 1.15) { const tug = Math.sin((t - 0.35) * 6 * Math.PI) * 0.12; Object.assign(P, { armA: 1.8, armE: 0.2, bA: 1.6, bE: 0.3, lean: -0.25 + tug, head: -0.2, crouch: 4, footF: 16, footB: -14 }); }
      else if (t < 1.5) { const u = (t - 1.15) / 0.35; Object.assign(P, { armA: 1.8 + u * 1.7, armE: 0.2 + u * 0.6, bA: 1.6 - u * 1.2, bE: 0.3, lean: -0.25 - u * 0.2, head: -0.35, crouch: 2, footF: 14, footB: -14 }); }
      else { const u = Math.min(1, (t - 1.5) / 0.5); Object.assign(P, { armA: 3.5 * (1 - u), armE: 0.8 * (1 - u), bA: 0.4, bE: 0.3, lean: -0.45 * (1 - u), footF: 10, footB: -10 }); }
    } else if (s === 'execute') {
      G.execPose(P, this.execKind, t);
      if (this.qte) { const sh = this.qte.shove; P.crouch += sh * 5; P.lean += sh * 0.12 + Math.sin(G.game.time * 30) * 0.04 * (1 - this.qte.fill); P.armE += sh * 0.25; }   // shoving her down
    } else if (s === 'sit' || s === 'rise') {
      // down onto one knee, then onto the ground beside the flame; rising runs it backwards
      const k = s === 'sit' ? Math.min(1, t / 0.5) : 1 - Math.min(1, t / 0.42);
      if (k > 0.55) {
        const br = Math.sin(G.game.time * 1.6) * 0.04;
        Object.assign(P, { sit: true, lean: 0.2 + br, head: 0.45 + br, armA: 0.9, armE: 0.35, bA: -0.35, bE: 0.5, w: 2.92 });
      } else Object.assign(P, { crouch: 15 * k / 0.55, lean: 0.3 * k, head: 0.3 * k, footF: 11, footB: -13, armA: 0.6 * k, armE: 0.9 * k });
    } else if (s === 'dead') {
      const u = G.ease(Math.min(1, t / 0.5)); P.lying = -u; P.armA = 2.6; P.w = 3.0; P.bA = -0.6; P.head = -0.3 * u;
    }
    return P;
  }

  draw(ctx, g) {
    const pose = this.pose();
    if (this.air && (this.state === 'idle' || this.state === 'block')) { pose.footF = 9; pose.footB = -3; pose.liftF = 7; pose.liftB = 3; pose.crouch = 2; pose.lean = 0.15; }
    if (this.air && this.alt > 0) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; const w = Math.max(6, 18 - this.alt * 0.1); ctx.fillRect(Math.round((this.x - w) / 2) * 2, G.GROUND + 2, Math.round(w) * 2, 4); }
    const o = { x: this.x, y: G.GROUND - Math.round(this.alt / 2) * 2, facing: this.facing, scale: 1.05, pose, look: G.wardrobe ? G.wardrobe.look(g) : this.look, steel: G.wardrobe ? G.wardrobe.steel(g, g.weaponId) : null, weapon: this.weapon.draw, wlen: this.weapon.len, shield: true, flash: this.flash, bloody: this.bloody, time: g.time, vx: this.vx };
    if (this.state === 'roll' && this.t < 0.32) o.alpha = 0.75;
    this.wingT = Math.max(0, (this.wingT || 0) - 1 / 60);
    const wantW = (this.gliding || this.wingT > 0) && this.air ? 1 : 0;   // the wings unfold quickly and fold away gently
    this.wingVis = (this.wingVis || 0) + (wantW - (this.wingVis || 0)) * (wantW ? 0.3 : 0.07);
    if (wantW) this.wingGlide = this.gliding && this.wingT <= 0;
    if (this.wingVis > 0.02 && G.drawPlayerWings) {
      if (!wantW && this.wingVis > 0.3 && Math.random() < 0.5) G.fx.sparks.push({ x: this.x - this.facing * G.rand(10, 40), y: o.y - G.rand(40, 70), vx: G.rand(-20, 20), vy: G.rand(10, 40), t: 0.25 });   // a little moth-dust as they fold
      G.drawPlayerWings(ctx, this.x - this.facing * 6, o.y - 50, this.facing, this.wingT / 0.5, g.time, this.wingGlide, this.wingVis);   // her wings, on your back
    }
    if (this.state === 'rip' && this.t > 1.15 && this.t < 1.45 && G.swamp) G.swamp.drawHeld(ctx, this.x + this.facing * 18, o.y - 58 - (this.t - 1.15) * 60, this.facing, g.time);   // her wing, in your fist
    const grab = this.state === 'execute' && this.execKind === 'drown' && this.t > 0.3 && this.t < 2.2;
    if (grab) {   // the sword stuck in the mud beside him, both hands free
      o.weapon = 'none'; const sx = this.x - this.facing * 22, gy = G.GROUND;
      ctx.fillStyle = '#7d808c'; ctx.fillRect(sx - 1, gy - 30, 3, 32); ctx.fillStyle = '#eef0f5'; ctx.fillRect(sx - 1, gy - 30, 1, 30); ctx.fillStyle = '#c9a13b'; ctx.fillRect(sx - 6, gy - 32, 13, 3); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(sx - 1, gy - 42, 3, 10); ctx.fillStyle = '#c9a13b'; ctx.fillRect(sx - 2, gy - 45, 5, 3);
    }
    G.drawHumanoid(ctx, o); this.headPos = o.out.head;
    if (this.state === 'heal' && o.out.head) this.drawFlask(ctx, o, g.time);
    if (this.healFx > 0) {   // a glow rising through him when the water takes
      this.healFx -= 1 / 60; const k = this.healFx / 0.7, col = this.curing ? '200,170,255' : '255,220,150', y0 = G.GROUND - this.alt;
      const gr = ctx.createRadialGradient(this.x, y0 - 40, 4, this.x, y0 - 40, 60); gr.addColorStop(0, `rgba(${col},${0.35 * k})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(this.x - 60, y0 - 100, 120, 120);
      ctx.fillStyle = `rgba(${col},${k})`; for (let i = 0; i < 10; i++) { const a = i * 2.4 + g.time * 3, r = 14 + (i % 3) * 6; ctx.fillRect(Math.round(this.x + Math.cos(a) * r), Math.round(y0 - 10 - (1 - k) * 70 - (i * 7) % 40), 2, 2); }
    }
    // sword trail
    const swinging = (this.state === 'attack' && this.t >= this.atk.wind - 0.03 && this.t < this.atk.wind + this.atk.active + 0.06) || (this.state === 'execute' && this.t > 0.48 && this.t < 0.64);
    if (swinging && o.out.tip) this.trail.push(o.out.tip); else this.trail.shift();
    if (this.trail.length > 7) this.trail.shift();
    for (let i = 1; i < this.trail.length; i++) {   // the blade's wake, in blocks
      const k = i / this.trail.length;
      G.pxLine(ctx, this.trail[i - 1][0], this.trail[i - 1][1], this.trail[i][0], this.trail[i][1], k > 0.6 ? 4 : 2, k > 0.75 ? '#f4ece6' : k > 0.4 ? '#a89aa2' : '#5a4e58');
    }
  }
};

// ================================ ENEMY ====================================
const LIMBS = ['head', 'armF', 'armB', 'legF', 'legB'];
const LIMB_WEIGHT = { torso: 3, head: 1, armF: 2, armB: 2, legF: 1.5, legB: 1.5 };

G.Enemy = class {
  constructor(type, x, tag) {
    const d = G.ENEMIES[type];
    Object.assign(this, {
      id: G.uid++, type, def: d, x, vx: 0, facing: -1, hp: d.hp, maxHp: d.hp, scale: d.scale || 1,
      state: 'idle', t: 0, cd: rand(0, 0.5), flash: 0, walk: rand(0, 6), dead: false, dormant: !!d.boss,
      bleed: 0, bleedT: 0, drip: 0, frenzy: false, wasBroken: false, atk: null, hitDone: false, fountain: 0, phase2: false, out: null, tag, alt: 0, focus: 0, tgt: null, air: false, vy: 0, jumpCd: 0, dropT: 0,
    });
    if (d.boss) { this.maxHp = this.hp = d.hp * G.bossHpMul(); }
    this.limbs = {};
    for (const k of LIMBS) this.limbs[k] = { hp: d.limbHp, gone: false, absent: !!d.limbs && !d.limbs.includes(k) };
  }
  // grounded: a walker missing a leg, or a flyer missing a wing
  // On Unfair, bosses feint, chain blows, punish a drink, shrug off staggers and turn light hits aside.
  get hard() { return this.def.boss && G.unfair(); }
  // the lighter infected climb after you; the heavy, the swollen and the bosses do not
  get canClimb() { const d = this.def; return !d.boss && !d.fly && !d.poise && !d.burst && !this.crawling; }
  get crawling() { const L = this.limbs; return L.legF.gone || L.legB.gone || (!!this.def.fly && (L.armF.gone || L.armB.gone)); }
  // Enemies hunt whoever is nearest, the knight or a villager in view, and lean
  // towards the villager. An enemy tagged with an NPC's id hunts that NPC.
  pickTarget(g) {
    const pl = g.player;
    if (this.def.boss || this.focus > 0 || !g.onScreen(this.x)) return pl;
    let best = pl, bd = pl.dead ? 1e9 : Math.abs(pl.x - this.x);
    for (const n of g.npcs) { if (!n.targetable || !g.onScreen(n.x)) continue; const hunted = this.tag === n.id, d = Math.abs(n.x - this.x) * (hunted ? 0.3 : 0.6); if (d < bd && d < (hunted ? 130 : 150)) { best = n; bd = d; } }
    return best;
  }
  get stumps() { return LIMBS.reduce((n, k) => n + (this.limbs[k].gone ? 1 : 0), 0); }
  get speed() {
    let s = this.def.speed * (this.frenzy ? 1.35 : 1);
    if (this.crawling) s *= this.limbs.legF.gone && this.limbs.legB.gone ? 0.22 : 0.4;
    return s;
  }
  // Losing arms cripples an enemy's offence; crawling shortens its reach.
  get mods() {
    const lost = (this.limbs.armF.gone ? 1 : 0) + (this.limbs.armB.gone ? 1 : 0);
    let dmg = this.limbs.armF.gone ? 0.5 : 1, reach = this.limbs.armF.gone ? 0.7 : 1;
    if (lost === 2) { dmg = 0.35; reach = 0.55; }
    if (this.crawling) reach *= 0.85;
    return { dmg: dmg * (this.frenzy ? 1.15 : 1) * (this.enraged ? 1.3 : 1), reach, speed: (this.frenzy ? 0.8 : 1) * (this.enraged ? 0.75 : 1) };
  }
  set(state) { this.state = state; this.t = 0; }
  joint(k) {
    const o = this.out, y = G.GROUND;
    if (!o) return [this.x, y - 50 * this.scale];
    return k === 'head' ? o.head : k[0] === 'a' ? o.sh : o.hip;
  }

  // Raw damage (weapon hits, bleeding). Handles the broken / dead thresholds.
  hurt(dmg, o = {}) {
    if (this.dead || this.state === 'executed') return;
    this.hp -= dmg;
    if (this.hp <= 0) {
      if (this.def.boss) { this.hp = 0; if (this.state !== 'broken') this.setBroken(); }
      else this.die(o);
    } else if (!this.def.boss && !this.wasBroken && this.state !== 'broken' && this.hp <= this.maxHp * 0.3) this.setBroken();
  }
  setBroken() {
    this.wasBroken = true; this.set('broken'); this.vx *= 0.3; this.atk = null;
    G.text(this.x, G.GROUND - 100 * this.scale, 'BROKEN', '#d9c9b0', 14);
    if (!this.def.boss) G.game.fairy.bark('broken', false, 0.5);
  }

  takeHit(dmg, atk, dir, g, weapon) {
    if (this.dead || this.state === 'executed') return;
    if (this.def.boss && this.state === 'broken') return;
    if (this.dormant) this.dormant = false;
    if (this.hard && this.phase2 && this.def.weapon !== 'none' && !atk.poiseBreak && !atk.quiet && this.state !== 'strike' && Math.random() < 0.28) {
      // turned aside, and the knight is thrown off balance
      const p = g.player; G.sfx('block'); G.spark(this.x - dir * 18 * this.scale, G.GROUND - 70 * this.scale, 12); G.text(this.x, G.GROUND - 130 * this.scale, 'DEFLECTED', '#d9c9b0', 16);
      g.hitstop = 0.07; p.vx = -dir * 260; p.st = Math.max(0, p.st - 22); p.stDelay = 0.8; return;
    }
    // which part did the blade find?
    const opts = Object.keys(LIMB_WEIGHT).filter(k => k === 'torso' || (!this.limbs[k].gone && !this.limbs[k].absent));
    let roll = Math.random() * opts.reduce((s, k) => s + LIMB_WEIGHT[k], 0), part = 'torso';
    for (const k of opts) { roll -= LIMB_WEIGHT[k]; if (roll <= 0) { part = k; break; } }
    if (part === 'head') dmg *= 1.3;
    const [jx, jy] = this.joint(part === 'torso' ? 'armF' : part);
    this.flash = 0.1;
    if (!atk.quiet) { this.focus = 4; g.hitstop = atk.poiseBreak ? 0.09 : 0.05; g.shake = Math.max(g.shake, atk.poiseBreak ? 7 : 4); }
    G.blood(jx, jy + (part === 'torso' ? 12 : 0), 10 + dmg * 0.4, dir, 300); G.sfx('hit');
    let severed = false;
    if (part !== 'torso') {
      const L = this.limbs[part]; L.hp -= dmg * atk.sever;
      const lethal = this.hp - dmg <= 0;
      const allowed = !(this.def.noSever || []).includes(part);
      if (L.hp <= 0 && allowed && (part !== 'head' || lethal)) { this.sever(part, dir, g); severed = true; }
    }
    // bleed build-up -> haemorrhage
    this.bleed += weapon.bleed * (this.def.boss ? 0.5 : 1);
    if (this.bleed >= 100) {
      this.bleed = 0; this.bleedT = 5; dmg += this.maxHp * (this.def.boss ? 0.06 : 0.12);
      G.text(this.x, G.GROUND - 112 * this.scale, 'HAEMORRHAGE', '#e0222c', 16); G.blood(this.x, G.GROUND - 55 * this.scale, 40, 0, 320); G.sfx('bleed');
      if (G.skills && G.skills.art(g) === 'flail') for (const o of g.enemies) if (o !== this && !o.dead && Math.abs(o.x - this.x) < 140) { o.bleed = Math.min(99, o.bleed + 60); G.blood(o.x, G.GROUND - 50 * o.scale, 8, 0, 200); }   // Scourge of the Penitent
    }
    const wasBroken = this.state === 'broken';
    this.hurt(dmg, { dir, decap: part === 'head' && this.limbs.head.gone });
    if (this.dead || this.state === 'executed') return;
    if (this.state === 'broken') { if (!wasBroken) this.vx = dir * 80; return; }
    if (atk.noStagger && !severed) return;   // Misery's sting hurts, but does not stop anything
    if (this.hard && !severed && Math.random() < 0.6) return;   // on Unfair a boss mostly ignores what would stagger it
    if (!this.def.poise || atk.poiseBreak || severed) { this.set('stagger'); this.stun = severed ? 0.6 : atk.poiseBreak ? 0.5 : 0.3; this.vx = dir * (this.def.poise ? 60 : 150); this.atk = null; }
  }

  sever(k, dir, g) {
    const L = this.limbs[k], [jx, jy] = this.joint(k);
    L.gone = true; g.shake = 10; if (g.onScreen(this.x)) g.hitstop = 0.1; G.sfx('sever'); g.fairy.bark('gore', false, 0.35);
    G.blood(jx, jy, 45, dir, 380);
    G.gib(k === 'head' ? 'head' : k[0] === 'a' ? 'arm' : 'leg', jx, jy, dir, this.def.look, { scale: this.scale });
    if (k === 'armF' && this.def.weapon !== 'none') G.gib('weapon', jx, jy, dir, this.def.look, { wtype: this.def.weapon, wlen: this.def.wlen, scale: this.scale });
    if (k !== 'head') { G.text(this.x, G.GROUND - 120 * this.scale, 'SEVERED', '#e0222c', 17); this.hp -= this.maxHp * 0.08; }
    if (G.skills && G.skills.art(g) === 'greataxe') { const p = g.player; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.06); }   // Headsman's Due
  }

  die(o = {}) {
    if (this.dead) return;
    this.dead = true; this.hp = 0; this.set('dead'); this.fall = o.dir === this.facing ? 1 : -1;
    if (o.decap) {
      if (!this.limbs.head.gone) { this.limbs.head.gone = true; const [jx, jy] = this.joint('head'); G.gib('head', jx, jy, o.dir || 1, this.def.look, { scale: this.scale, vy: -420 }); }
      this.fountain = 1.6;
    }
    G.decal(this.x, 8, 26 * this.scale); G.sfx('thud'); G.game.fairy.bark('kill', false, 0.25);
    const g = G.game;
    g.addIchor(Math.round(this.def.ichor * (o.exec ? 1.5 : 1)), this.x); g.onEnemyDeath(this);
    // a bloat that is not cleanly executed bursts over everyone nearby
    if (this.def.burst && !o.exec) {
      G.blood(this.x, G.GROUND - 50, 140, 0, 520); G.decal(this.x, 14, 60); G.sfx('sever'); g.shake = 12;
      G.text(this.x, G.GROUND - 120, 'BURST', '#e0222c', 18);
      for (const t of [g.player, ...g.npcs]) if (Math.abs(t.x - this.x) < 100) t.damage(this.def.burst, this.x, g);
    }
  }

  update(dt, g) {
    if (this.frostT > 0) { this.frostT -= dt; dt *= 0.65; }   // Frostbite: everything it does, slower
    this.t += dt; this.flash -= dt; this.cd -= dt;
    if (this.leaving) {   // spared: it turns away and is gone
      this.leaving += dt; this.state = 'idle'; this.facing = this.x > g.player.x ? 1 : -1; this.vx = this.facing * 60; this.x += this.vx * dt;
      if (this.def.fly && !this.grounded) this.alt += 70 * dt;
      if (this.grounded) this.vx *= 0.5;   // on her hands, slowly
      if (this.leaving > 2.2) { this.dead = true; this.left = true; }
      return;
    }
    if (this.focus > 0) this.focus -= dt;
    if (!this.tgt || this.tgt.dead || this.state === 'idle' || this.state === 'chase') this.tgt = this.pickTarget(g);
    const p = this.tgt, dx = p.x - this.x, dist = Math.abs(dx), gy = G.GROUND;
    if (this.dead) {
      if (this.alt > 0) {   // a body falls to whatever is under it: crows to the ground, the rest to a ledge or the ground
        const under = this.def.fly ? 0 : g.surf.filter(pl => this.x >= pl.x - 4 && this.x <= pl.x + pl.w + 4 && pl.h <= this.alt + 0.5).reduce((mx, pl) => Math.max(mx, pl.h), 0);
        this.alt = Math.max(under, this.alt - 420 * dt);
      }
      if (this.fountain > 0) { this.fountain -= dt; const [jx, jy] = this.joint('head'); G.blood(jx, Math.min(jy, gy - 10), 3, 0, 300 * this.fountain); }
      this.vx *= Math.pow(0.001, dt); this.x += this.vx * dt; return;
    }
    // bleeding: haemorrhage ticks and open stumps
    if (this.state !== 'executed') {
      const n = this.stumps;
      if (this.bleedT > 0) { this.bleedT -= dt; this.hurt(this.maxHp * 0.035 * dt); }
      if (n) this.hurt(n * 1.4 * dt);
      if (this.dead) return;
      this.drip -= dt * (n * 2 + (this.bleedT > 0 ? 3 : 0) + (this.hp < this.maxHp * 0.5 ? 0.6 : 0));
      if (this.drip <= 0) {
        this.drip = rand(0.25, 0.5);
        const k = LIMBS.find(l => this.limbs[l].gone && Math.random() < 0.6), [jx, jy] = this.joint(k || 'armF');
        G.blood(jx, jy + (k ? 0 : 14), k ? 4 : 2, 0, k ? 120 : 50); if (k && Math.random() < 0.4) G.sfx('splat');
        if (Math.abs(this.vx) > 8 && n) G.decal(this.x + rand(-8, 8), rand(2, 5));
      }
    }
    const boss = this.def.boss, m = this.mods;
    if (boss && !this.phase2 && this.hp < this.maxHp * 0.5) { this.phase2 = true; this.frenzy = true; G.text(this.x, gy - 150 * this.scale / 1.3, this.def.shout || '"I HELD THE DOOR!"', '#e0222c', 18); G.sfx('bell'); G.sfx('roar'); g.shake = 12; }

    const sp = this.def.spawn;   // some bosses keep calling their kind for as long as the fight lasts
    if (sp && boss && !this.dormant && this.hp > 0 && this.state !== 'broken' && this.state !== 'executed' && g.bossFight) {
      this.spawnT = (this.spawnT == null ? sp.first || sp.every : this.spawnT) - dt * (this.enraged ? 1.8 : this.phase2 ? 1.3 : 1);
      const alive = g.enemies.filter(e => e.type === sp.type && !e.dead).length;
      if (this.spawnT <= 0) { this.spawnT = sp.every; if (alive < sp.max + (this.hard ? 1 : 0)) {
        const side = Math.random() < 0.5 ? g.level.boss.gate + 60 : g.level.boss.end - 20, e = new G.Enemy(sp.type, side); e.alt = 200; e.set('chase'); g.enemies.push(e);
        G.text(this.x, gy - 140 * this.scale, sp.text || 'SHE CALLS', '#e0b84a', 14); G.sfx('whoosh');
      } }
    }
    const sm = this.def.summon;   // some bosses call for help as their health falls
    if (sm && this.hp > 0 && this.state !== 'broken' && this.state !== 'executed' && (this.summoned || 0) < sm.at.length && this.hp < this.maxHp * sm.at[this.summoned || 0]) {
      this.summoned = (this.summoned || 0) + 1; G.sfx('roar'); G.text(this.x, gy - 170, sm.text || 'SHE CALLS HER HOUNDS', '#e0222c', 16); g.shake = 8;
      for (let k = 0; k < sm.n + (this.hard ? 1 : 0); k++) { const e = new G.Enemy(sm.type, clamp(this.x + (k ? -1 : 1) * rand(150, 210), g.level.boss.gate + 40, g.level.boss.end)); e.set('chase'); g.enemies.push(e); }
    }
    // ledges: walking off an edge, and flight through the air. Nothing fights in mid-air.
    if (!this.def.fly) {
      this.jumpCd -= dt; this.dropT -= dt;
      const S = g.surf;
      if (!this.air && this.alt > 0 && !S.some(pl => Math.abs(pl.h - this.alt) < 1 && this.x >= pl.x - 4 && this.x <= pl.x + pl.w + 4)) { this.air = true; this.vy = 0; }
      if (this.air) {
        const prev = this.alt, px1 = this.x; this.vy -= 1500 * dt; this.alt += this.vy * dt; this.x += this.vx * dt;
        if (this.vy <= 0) {
          let land = -1;
          if (this.dropT <= 0) for (const pl of S) if (this.x >= pl.x && this.x <= pl.x + pl.w && pl.h <= prev + 0.5 && pl.h >= this.alt && pl.h > land) land = pl.h;
          if (land < 0 && this.alt <= 0) land = 0;
          if (land >= 0) { this.alt = land; this.air = false; this.vy = 0; this.vx = 0; this.jumpCd = 0.3; G.sfx('step'); if (this.state !== 'chase') this.set('chase'); }
        }
        this.x = g.gateClamp(px1, clamp(this.x, 30, g.level.length - 30), this.alt);
        if (!this.air && this.alt === 0 && g.pitAt(this.x)) this.fallInPit(g);
        return;
      }
    }
    switch (this.state) {
      case 'idle':
        if (!this.dormant && dist < this.def.aggro) { this.set('chase'); G.sfx('growl'); }
        break;
      case 'chase': {
        this.facing = dx >= 0 ? 1 : -1;
        const stop = this.def.stop || 40 * this.scale;
        if (dist > stop + (this.def.fly ? 12 : 0)) { this.vx = this.facing * this.speed; this.walk += dt * this.speed * 0.11; }
        else if (this.def.fly && !this.crawling && dist < stop - 35) this.vx = -this.facing * this.speed * 0.7;
        else this.vx = 0;
        if (dist > this.def.aggro * 1.7 && !boss) { this.set('idle'); this.vx = 0; break; }
        if (this.canClimb && this.jumpCd <= 0) {
          const ta = p.alt || 0;
          if (ta > this.alt + 30 && dist < 220 && !p.air) {
            // leap for the reachable ledge nearest the target
            let best = null, bd = 1e9;
            for (const pl of g.surf) {
              if (pl.h <= this.alt + 20 || pl.h - this.alt > 88 || pl.h > ta + 5) continue;
              const lx = clamp(p.x, pl.x + 12, pl.x + pl.w - 12), d = Math.abs(lx - p.x) + Math.abs(ta - pl.h);
              if (d < bd) { bd = d; best = { pl, lx }; }
            }
            if (best && Math.abs(best.lx - this.x) < 150) {
              const h = best.pl.h - this.alt, tl = (560 + Math.sqrt(560 * 560 - 3000 * h)) / 1500;
              this.air = true; this.vy = 560; this.vx = (best.lx - this.x) / tl; this.facing = best.lx >= this.x ? 1 : -1; this.jumpCd = 1.2; G.sfx('roll'); break;
            }
          } else if (ta < this.alt - 30 && this.alt > 0) { this.air = true; this.dropT = 0.25; this.vy = 0; this.vx = this.facing * this.speed; this.jumpCd = 0.8; break; }
        }
        if (this.hard && p === g.player && p.state === 'heal' && !this.punished && dist < 360) {
          // drink in front of a boss on Unfair and it comes for you at once, with its longest reach
          this.punished = true; this.atk = this.def.attacks.reduce((a, b) => ((b.trigger || b.reach) > (a.trigger || a.reach) ? b : a)); this.windMul = 0.3;
          this.set('windup'); this.vx = 0; G.sfx('grunt'); G.text(this.x, gy - 150 * this.scale / 1.3, '!', '#e0222c', 26); break;
        }
        if (p.state !== 'heal') this.punished = false;
        if (this.cd <= 0 && !p.dead) {
          const c = this.def.attacks.filter(a => dist >= (a.min || 0) && dist <= (a.trigger || a.reach * m.reach * this.scale * 0.92));
          // on Unfair the wind-up is never the same length twice: some blows come early, some are held
          if (c.length) { this.atk = G.pick(c); this.windMul = this.hard ? rand(0.55, 1.45) : 1; this.set('windup'); this.vx = 0; if (this.def.poise) G.sfx('grunt'); }
        }
        break;
      }
      case 'windup':
        if (this.t >= this.atk.wind * m.speed * (this.windMul || 1)) { this.set('strike'); if (this.atk.horn && G.wind) G.wind.horn(g, this); this.rolledChain = false; this.hitDone = false; this.vx = this.facing * this.atk.lunge * (this.crawling ? 0.4 : 1); G.sfx('swing'); }
        break;
      case 'strike': {
        const rel = (p.x - this.x) * this.facing;
        if (this.atk.spew) G.blood(this.x + this.facing * 26 * this.scale, gy - 62 * this.scale, 5, this.facing, 460);   // a gout of infected blood
        // the knight jumped clean over a low attack, or stands on a ledge above this weapon's reach
        const reachUp = this.alt + (['spear', 'scythe', 'axe', 'greatsword'].includes(this.def.weapon) ? 150 : 96 * this.scale);
        const over = (p.alt > 44 && (this.crawling || this.def.model === 'hound')) || (p.alt || 0) > reachUp || this.alt - (p.alt || 0) > 60;
        if (!this.hitDone && !over && rel > -14 && rel < this.atk.reach * m.reach * this.scale) { if (p.damage(this.atk.dmg * m.dmg * (this.hard ? 1.35 : 1), this.x, g)) { this.hitDone = true; if (this.atk.spew && p.infect) p.infect(this.atk.spew * (this.hard ? 1.5 : 1), g); } else if (p.state === 'block') this.hitDone = true; }
        if (this.t >= this.atk.active) this.set('recover');
        break;
      }
      case 'recover':
        if (this.hard && !this.rolledChain && this.t >= this.atk.rec * 0.25) {
          // on Unfair a boss can follow one blow straight into another, twice over
          this.rolledChain = true; this.facing = dx >= 0 ? 1 : -1;
          const c = this.def.attacks.filter(a => dist >= (a.min || 0) && dist <= (a.trigger || a.reach * m.reach * this.scale * 0.95));
          if ((this.chains || 0) < 2 && c.length && Math.random() < 0.6) { this.chains = (this.chains || 0) + 1; this.atk = G.pick(c); this.windMul = rand(0.35, 0.6); this.set('windup'); this.vx = 0; break; }
        }
        if (this.t >= this.atk.rec * m.speed * (this.hard ? 0.7 : 1)) { this.set('chase'); this.chains = 0; this.cd = rand(0.15, 0.6) * m.speed * (this.hard ? 0.5 : 1); }
        break;
      case 'stagger':
        if (this.t >= this.stun) this.set('chase');
        break;
      case 'broken':
        this.vx = 0;
        if (!boss && this.t > 5) { this.frenzy = true; this.set('chase'); G.text(this.x, gy - 100 * this.scale, 'FRENZY', '#e0222c', 15); }
        break;
    }
    if (this.def.fly) {
      const s = this.state, low = this.crawling || this.grounded || s === 'broken' || s === 'executed' || s === 'idle';
      const fa = this.def.flyAlt || 122, want = low ? 0 : s === 'strike' ? (this.def.diveAlt || 46) : s === 'windup' ? fa + 16 : s === 'stagger' ? 70 : fa + Math.sin(g.time * 2.3 + this.id) * (this.def.bob || 0);
      this.alt += (want - this.alt) * Math.min(1, dt * (s === 'strike' ? 14 : low ? 6 : 3));
    }
    const px0 = this.x; this.x += this.vx * dt;
    if (this.state !== 'chase') this.vx *= Math.pow(0.002, dt);
    this.x = clamp(this.x, 30, g.level.length - 30);
    if (boss && !this.dormant) this.x = clamp(this.x, g.level.boss.gate + 30, g.level.boss.end);
    this.x = g.gateClamp(px0, this.x, this.alt, this.def.fly);
    // on a ledge, with the quarry level or above: stay on it rather than stepping off the edge
    if (!this.def.fly && !this.air && this.alt > 0 && (p.alt || 0) >= this.alt - 5 && this.state !== 'stagger') {
      const pl = g.surf.find(q => Math.abs(q.h - this.alt) < 1 && this.x >= q.x - 4 && this.x <= q.x + q.w + 4);
      if (pl) this.x = clamp(this.x, pl.x + 2, pl.x + pl.w - 2);
    }
    // pits: the infected will not walk into one, but a blow can knock them in
    if (!this.def.fly && this.alt === 0 && g.pitAt(this.x)) {
      if (['idle', 'chase', 'windup', 'strike', 'recover'].includes(this.state)) this.x = px0;
      if (g.pitAt(this.x)) this.fallInPit(g);
    }
  }
  fallInPit(g) {
    if (this.dead || this.def.boss) return;
    this.alt = -40; this.vx = 0; G.blood(this.x, G.GROUND + 20, 40, 0, 240); G.sfx('sever');
    G.text(this.x, G.GROUND - 70, 'IMPALED', '#e0222c', 16); this.die({ dir: this.facing });
  }

  pose() {
    const P = basePose(), s = this.state, t = this.t, d = this.def, a = this.atk, m = this.mods;
    P.lean = d.hunch || 0.1; P.head = d.hunch ? 0.2 : 0; P.armA = 0.45; P.armE = 0.8; P.w = d.weapon === 'none' ? 1.2 : 2.3; P.bA = d.hunch ? 0.7 : -0.2; P.bE = 0.6;
    if (s === 'dead') {
      const u = G.ease(Math.min(1, t / 0.45)); P.lying = (this.crawling ? 1 : this.fall) * (this.crawling ? 1 : u); P.armA = 2.4; P.w = 2.8; P.bA = -0.8;
      return P;
    }
    if (this.crawling) {
      P.lying = 1; P.lean = 0; P.footF = 2; P.footB = -2;
      P.armA = Math.PI - 0.5 + Math.sin(this.walk) * 0.5; P.armE = 0.3; P.bA = Math.PI + 0.3 - Math.sin(this.walk) * 0.5; P.bE = -0.3; P.w = Math.PI - 0.2; P.head = -0.5;
      if (s === 'windup') P.armA = Math.PI + 0.6; if (s === 'strike') P.armA = Math.PI - 1.0;
      if (s === 'broken' || s === 'executed') { P.armA = Math.PI - 1.3; P.bA = Math.PI + 1.2; P.head = 0.2; }
      return P;
    }
    if (s === 'chase' && Math.abs(this.vx) > 5) walkPose(P, this.walk, 11);
    else if (s === 'idle') P.crouch = Math.sin(G.game.time * 1.6 + this.id) * 0.8 + 0.8;
    else if (s === 'windup') { P.footF = 11; P.footB = -10; G.swing(P, a.anim, 0, Math.min(1, t / (a.wind * m.speed))); }
    else if (s === 'strike') { P.footF = 14; P.footB = -10; G.swing(P, a.anim, 1, Math.min(1, t / a.active)); }
    else if (s === 'recover') { P.footF = 12; P.footB = -9; G.swing(P, a.anim, 2, Math.min(1, t / (a.rec * m.speed))); }
    else if (s === 'stagger') { P.lean = -0.35; P.head = -0.4; P.armA = -0.4; P.bA = -0.9; P.footF = 2; P.footB = -13; }
    else if (s === 'executed' && this.struggle > 0) {   // held under: arms clawing up out of the water, head thrashing
      const k = this.struggle, tt = G.game.time;
      Object.assign(P, { crouch: 4, lean: -0.3 + Math.sin(tt * 13) * 0.25 * k, head: -0.4 + Math.sin(tt * 17) * 0.4 * k, armA: Math.PI - 0.7 + Math.sin(tt * 19) * 0.7 * k, armE: 0.4 + Math.sin(tt * 23) * 0.6 * k, bA: Math.PI + 0.5 + Math.sin(tt * 16 + 1) * 0.7 * k, bE: 0.5 + Math.sin(tt * 21) * 0.5 * k, footF: 6, footB: -6 });
    }
    else if (s === 'broken' || s === 'executed') {
      const u = G.ease(Math.min(1, t / 0.3)), sway = s === 'broken' ? Math.sin(t * 2.2) * 0.06 : 0;
      P.crouch = 15 * u; P.lean = 0.42 * u + sway; P.head = 0.6 * u; P.armA = 0.15; P.armE = 0.2; P.w = 0.5; P.bA = 0; P.bE = 0.1; P.footF = 12; P.footB = -14;
    }
    return P;
  }

  draw(ctx, g) {
    const d = this.def, o = { x: this.x, y: G.GROUND - Math.round((this.alt + (this.lift || 0)) / 2) * 2, facing: this.facing, scale: this.scale, pose: this.pose(), look: d.look, limbs: this.limbs, weapon: d.weapon, wlen: d.wlen, flash: this.flash, time: g.time, vx: this.vx, weeping: d.boss && this.phase2 };
    // attack telegraph
    if (this.state === 'windup') {   // a blinking pixel warning over the attacker
      const u = Math.min(1, this.t / this.atk.wind), on = Math.sin(this.t * (14 + u * 30)) > -0.3, x = Math.round(this.x / 2) * 2;
      const y = Math.round((G.GROUND - this.alt - (d.height ? d.height + 16 : 100 * this.scale + 8)) / 2) * 2;
      ctx.fillStyle = '#1a0608'; ctx.fillRect(x - 4, y - 2, 8, 22);
      ctx.fillStyle = on ? (u > 0.7 ? '#fff0e0' : '#ff3a2a') : '#7a1210'; ctx.fillRect(x - 2, y, 4, 10); ctx.fillRect(x - 2, y + 14, 4, 4);
    }
    if (this.enraged && !this.dead) {   // humiliated: a red haze about it
      const ay = G.GROUND - this.alt - 60 * this.scale, gr = ctx.createRadialGradient(this.x, ay, 4, this.x, ay, 110 * this.scale);
      gr.addColorStop(0, `rgba(255,20,30,${0.6 + Math.sin(g.time * 8) * 0.15})`); gr.addColorStop(0.5, 'rgba(200,10,20,0.25)'); gr.addColorStop(1, 'rgba(220,20,30,0)'); ctx.fillStyle = gr; ctx.fillRect(this.x - 120 * this.scale, ay - 120 * this.scale, 240 * this.scale, 240 * this.scale);
    }
    if (this.sinkTarget != null) this.sink = (this.sink || 0) + (this.sinkTarget - (this.sink || 0)) * 0.2;   // pushed down, fighting up
    else if (this.sinking) this.sink = Math.min(70 * this.scale, (this.sink || 0) + 60 * this.scale / 60);   // going under
    if (this.sink) { o.y += Math.round(this.sink); o.y = Math.round(o.y / 2) * 2; }
    if (this.disarmed) o.weapon = 'none';
    const fade = this.leaving ? Math.max(0, 1 - this.leaving / 2.2) : 1; if (fade < 1) { ctx.save(); ctx.globalAlpha = fade; }
    if (this.sink) { ctx.save(); ctx.beginPath(); ctx.rect(this.x - 200, 0, 400, G.GROUND + 2); ctx.clip(); }   // nothing shows below the waterline
    if (d.model) G.drawBeast(ctx, this, g.time); else { G.drawHumanoid(ctx, o); this.out = o.out; }
    if (this.sink) {
      ctx.restore();
      const gy = G.GROUND, k = this.sinking ? 1 : 0.4;   // rings on the black water, and bubbles while she still breathes
      ctx.strokeStyle = `rgba(150,190,170,${0.5 * k})`; ctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) { const rr = ((g.time * 30 + r * 14) % 42) + 8; ctx.beginPath(); ctx.ellipse(this.x, gy, rr * this.scale, 3, 0, 0, 7); ctx.stroke(); }
      if (this.struggle > 0.05) {   // thrashing: water flung up, white and black
        const k2 = this.struggle; ctx.fillStyle = `rgba(220,236,228,${0.5 + k2 * 0.4})`;
        for (let sp = 0; sp < 6 + k2 * 10; sp++) { const ph = (g.time * (2 + sp % 3) + sp * 0.37) % 1, dx = Math.sin(sp * 2.1 + g.time * 4) * 34 * this.scale; ctx.fillRect(Math.round(this.x + dx * ph), Math.round(gy - 4 - Math.sin(ph * Math.PI) * (24 + k2 * 30)), 3, 3); }
      }
      if (this.sinking) { ctx.fillStyle = 'rgba(210,230,220,0.85)'; for (let b = 0; b < 4; b++) { const ph = (g.time * 1.8 + b * 0.27) % 1; ctx.fillRect(Math.round(this.x - 14 + b * 9 + Math.sin(g.time * 5 + b) * 3), Math.round(gy - 4 - ph * 26), 3, 3); } }
    }
    if (this.bannerT != null) {   // the Long Battalion's colours, settling over him
      this.bannerT = Math.min(1.6, this.bannerT + 1 / 60); const k = G.ease(Math.min(1, this.bannerT / 1.4)), bx = this.x - 30, by = G.GROUND - 120 + k * 102, sw = (1 - k) * Math.sin(g.time * 3) * 10;
      ctx.save(); ctx.translate(bx + 30 + sw, by); ctx.rotate((1 - k) * 0.25);
      ctx.fillStyle = '#7a1a14'; ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(34, -4); ctx.lineTo(30 + Math.sin(g.time * 2) * 2 * (1 - k), 14 - k * 4); ctx.lineTo(-30, 14 - k * 4); ctx.fill();
      ctx.fillStyle = '#c9a13b'; ctx.beginPath(); ctx.arc(0, 4 - k * 2, 6, 0, 7); ctx.fill(); for (let r = 0; r < 8; r++) { const a2 = r * Math.PI / 4; ctx.fillRect(Math.round(Math.cos(a2) * 9) - 1, Math.round(4 - k * 2 + Math.sin(a2) * 9 * (1 - k * 0.4)) - 1, 2, 2); }   // the sun of Osric
      ctx.fillStyle = '#5a0e0a'; ctx.fillRect(-34, -4, 68, 2); ctx.restore();
    }
    if (fade < 1) ctx.restore();
    if (!this.dead && !d.boss && this.hp < this.maxHp && this.state !== 'executed') {
      const w = 40 * this.scale, y = G.GROUND - this.alt - (d.height || (this.crawling ? 34 : 96 * this.scale));
      ctx.fillStyle = '#000'; ctx.fillRect(this.x - w / 2 - 1, y - 1, w + 2, 5);
      ctx.fillStyle = this.state === 'broken' ? '#d9c9b0' : '#8f0810'; ctx.fillRect(this.x - w / 2, y, w * this.hp / this.maxHp, 3);
      if (this.bleed > 0) { ctx.fillStyle = '#e0222c'; ctx.fillRect(this.x - w / 2, y + 4, w * this.bleed / 100, 1.5); }
    }
  }
};
