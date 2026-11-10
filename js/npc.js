'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the people of Morrowmere. The dead hunt them as well as you.
// Fighters (def.fighter) take up arms against nearby enemies; the rest cower,
// flee, and die if nobody comes. A death is permanent for that save.
// def.essential and hanging NPCs can never be targeted.
// ---------------------------------------------------------------------------
(() => {
  const NPC_ATK = { sever: 0.5, quiet: true, anim: G.ANIM.chop }, NPC_WEAPON = { bleed: 8 };
  const WIND = 0.42, ACT = 0.12, REC = 0.5;

  G.Npc = class {
    constructor(def, g) {
      Object.assign(this, { def, id: def.id, x: def.x, home: def.x, look: G.LOOKS[def.look], maxHp: def.hp || 90, hp: def.hp || 90,
        fighter: !!def.fighter, state: 'idle', t: 9, vx: 0, facing: 1, flash: 0, walk: 0, cd: 0, cry: 0, struck: false, foe: null });
      this.dead = !!g.flags['dead_' + def.id];
      // infection: wounds raise it; at 100 the villager has a few seconds left before turning on you
      this.inf = (g.npcInf && g.npcInf[def.id]) || 0; this.turnT = this.inf >= 100 ? 12 : null; this.gone = !!g.flags['turned_' + def.id];
      if (this.dead) this.state = 'dead';
    }
    get atRest() { return !!(this.def.restFlag && G.game.flags[this.def.restFlag]); }
    get canTurn() { return !this.def.cleanse && !this.def.essential && this.def.pose !== 'hang'; }   // the Sisters wash daily and do not turn
    get targetable() { return !this.gone && !this.dead && !this.def.essential && this.def.pose !== 'hang' && !this.atRest; }
    get canTalk() { const g = G.game; return !this.gone && !this.dead && !this.atRest && this.state !== 'cower' && (!this.def.needs || g.flags[this.def.needs]); }
    set(s) { this.state = s; this.t = 0; }

    // Same signature as Player.damage so enemies can strike either.
    damage(dmg, fromX, g) {
      if (!this.targetable) return false;
      const dir = this.x >= fromX ? 1 : -1;
      this.hp -= dmg * 0.6; this.flash = 0.12; this.vx = dir * 120;
      if (this.canTurn && this.turnT == null) {
        this.inf = Math.min(100, this.inf + dmg * 2); g.npcInf[this.id] = this.inf;
        if (this.inf >= 100) { this.turnT = 12; G.sfx('infect'); G.text(this.x, G.GROUND - 118, G.pick(['My eyes — my eyes!', 'It is in me. Oh God, it is in me.', 'Do not let me — please —']), '#e060f0', 14); }
      }
      G.blood(this.x, G.GROUND - 50, 12, dir, 220); G.sfx('hit');
      if (this.hp <= 0) {
        this.hp = 0; this.dead = true; this.set('dead'); this.fall = dir * this.facing > 0 ? -1 : 1;
        G.blood(this.x, G.GROUND - 40, 45, dir, 300); G.decal(this.x, 10, 28); G.sfx('scream');
        g.flags['dead_' + this.id] = 1; g.onNpcDeath(this);
      } else if (this.state !== 'windup' && this.state !== 'strike') this.set(this.fighter ? 'hurt' : 'cower');
      return true;
    }

    cure(g) { this.inf = 0; this.turnT = null; g.npcInf[this.id] = 0; this.sick = null; }
    // The fever wins: the villager is gone, and one more of the infected stands in their place.
    turn(g) {
      const d = this.def, base = G.ENEMIES[this.fighter ? 'deserter' : 'wretch'], key = 'turned_' + this.id;
      G.ENEMIES[key] = Object.assign({}, base, { name: d.name + ', turned', weapon: this.fighter ? d.weapon : 'none', wlen: d.wlen || base.wlen, hunch: this.fighter ? 0.1 : 0.3,
        look: Object.assign({}, this.look, { eye: '#ff3b2f', soft: 0 }) });
      const e = new G.Enemy(key, this.x); e.facing = this.facing; e.set('stagger'); e.stun = 1.1; g.enemies.push(e);
      G.blood(this.x, G.GROUND - 70, 30, 0, 260);
      this.gone = true; this.dead = true; this.turnT = null; g.flags['dead_' + this.id] = 1; g.flags[key] = 1; g.onNpcTurn(this);
    }
    update(dt, g) {
      this.t += dt; this.flash -= dt; this.cd -= dt; this.cry -= dt;
      if (this.turnT != null && !this.dead && (this.turnT -= dt) <= 0) { this.turn(g); return; }
      if (this.dead || !this.targetable) { this.vx = 0; return; }
      // nearest enemy that is awake and close
      let foe = null, fd = 300;
      for (const e of g.enemies) {
        if (e.dead || e.dormant || e.state === 'idle' || e.state === 'broken' || e.state === 'executed') continue;
        const d = Math.abs(e.x - this.x); if (d < fd) { fd = d; foe = e; }
      }
      const L = g.level;
      if (this.fighter) {
        if (this.state === 'hurt') { if (this.t > 0.3) this.set('idle'); }
        else if (this.state === 'windup') { this.vx = 0; if (this.t >= WIND) { this.set('strike'); this.struck = false; this.vx = this.facing * 120; G.sfx('swing'); } }
        else if (this.state === 'strike') {
          const e = this.foe;
          if (!this.struck && e && !e.dead && (e.x - this.x) * this.facing > -10 && Math.abs(e.x - this.x) < 74 && (e.alt || 0) < 95) { this.struck = true; e.takeHit(this.def.dmg || 14, NPC_ATK, this.facing, g, NPC_WEAPON); }
          if (this.t >= ACT) this.set('recover');
        } else if (this.state === 'recover') { if (this.t >= REC) { this.set('idle'); this.cd = G.rand(0.2, 0.6); } }
        else if (foe) {
          this.facing = foe.x >= this.x ? 1 : -1;
          if (fd > 54) { this.vx = this.facing * 74; this.walk += dt * 8; } else this.vx = 0;
          if (fd < 66 && this.cd <= 0) { this.foe = foe; this.set('windup'); }
        } else if (Math.abs(this.x - this.home) > 10) { this.facing = this.home > this.x ? 1 : -1; this.vx = this.facing * 52; this.walk += dt * 6; }
        else { this.vx = 0; this.facing = g.player.x >= this.x ? 1 : -1; }
      } else if (foe && fd < 240) {
        // helpless: back away and beg
        if (this.state !== 'cower') this.set('cower');
        const away = foe.x >= this.x ? -1 : 1; this.facing = -away;
        const nx = this.x + away * 48 * dt;
        if (Math.abs(nx - this.home) < 240 && fd < 150) { this.vx = away * 48; this.walk += dt * 9; } else this.vx = 0;
        if (this.cry <= 0) { this.cry = G.rand(2.5, 4.5); G.text(this.x, G.GROUND - 100, G.pick(['Help!', 'Ser knight — please!', 'No, no, no—', 'Get it away!']), '#d9c9b0', 13); }
      } else { if (this.state === 'cower' && this.t > 0.6) this.set('idle'); this.vx = 0; if (this.state === 'idle') this.facing = g.player.x >= this.x ? 1 : -1; }
      this.x = G.clamp(this.x + this.vx * dt, 40, L.length - 40);
      if (this.state === 'hurt' || this.state === 'strike' || this.state === 'recover') this.vx *= Math.pow(0.002, dt);
    }

    pose() {
      const P = basePose(), d = this.def, s = this.state, t = this.t, armed = this.fighter;
      Object.assign(P, { lean: 0.06, head: 0.05, armA: armed ? 0.45 : 0.2, armE: armed ? 0.9 : 0.3, w: armed ? 2.4 : 0, bA: -0.1, bE: 0.3, footF: 5, footB: -5 });
      if (this.atRest) { P.lying = -1; P.armA = 0.3; P.bA = 0.2; return P; }
      if (s === 'dead') { const u = G.ease(Math.min(1, t / 0.45)); P.lying = (this.fall || -1) * u; P.armA = 2.4; P.bA = -0.8; P.w = 2.8; return P; }
      const moving = Math.abs(this.vx) > 5;
      if (s === 'windup') { P.footF = 11; P.footB = -10; G.swing(P, NPC_ATK.anim, 0, Math.min(1, t / WIND)); }
      else if (s === 'strike') { P.footF = 13; P.footB = -10; G.swing(P, NPC_ATK.anim, 1, Math.min(1, t / ACT)); }
      else if (s === 'recover') { P.footF = 12; P.footB = -9; G.swing(P, NPC_ATK.anim, 2, Math.min(1, t / REC)); }
      else if (s === 'hurt') { P.lean = -0.3; P.head = -0.3; P.armA = -0.3; P.footB = -12; }
      else if (s === 'cower') {
        P.lean = 0.45; P.head = 0.5; P.armA = 2.5; P.armE = 1.1; P.bA = 2.3; P.bE = 1.3; P.crouch = moving ? 4 : 13;
        if (moving) walkPose(P, this.walk, 9); else { P.footF = 10; P.footB = -12; }
      } else if (moving) walkPose(P, this.walk, 10);
      else if (d.pose === 'kneel') Object.assign(P, { crouch: 15, lean: 0.3, head: 0.35, footF: 11, footB: -13, armA: 0.7, armE: 1.2, bA: 0.6, bE: 1.3 });
      return P;
    }

    draw(ctx, g) {
      if (this.gone) return;
      const sickening = !this.dead && this.inf >= 60;
      if (sickening && !this.sick) this.sick = Object.assign({}, this.look, { eye: '#ff3b2f', soft: 0 });
      const d = this.def, gy = G.GROUND, t = g.time;
      let y = gy, facing = this.facing, P = this.pose();
      if (d.pose === 'hang') {
        // the gallows stay; the rope is cut once he is laid to rest
        ctx.strokeStyle = '#060304'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(this.x - 70, gy); ctx.lineTo(this.x - 70, gy - 210); ctx.lineTo(this.x + 20, gy - 210); ctx.moveTo(this.x - 70, gy - 170); ctx.lineTo(this.x - 34, gy - 210); ctx.stroke();
        ctx.lineWidth = 2; ctx.strokeStyle = '#3a2e22'; ctx.beginPath(); ctx.moveTo(this.x, gy - 210);
        if (this.atRest) { ctx.lineTo(this.x + 2, gy - 180); ctx.stroke(); facing = 1; }
        else {
          const sw = Math.sin(t * 0.9) * 0.05; y = gy - 62; facing = 1;
          ctx.lineTo(this.x + sw * 30, y - 68); ctx.stroke();
          Object.assign(P, { lean: sw, head: 0.5, footF: 2 + sw * 40, footB: -2 + sw * 40 });
        }
      }
      if (d.id === 'ysolde') { const gl = ctx.createRadialGradient(this.x, gy - 50, 1, this.x, gy - 50, 90); gl.addColorStop(0, 'rgba(230,220,210,0.16)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(this.x - 90, gy - 140, 180, 180); }
      G.drawHumanoid(ctx, { x: this.x, y, facing, scale: 1, pose: P, look: sickening ? this.sick : this.look, weapon: this.fighter ? d.weapon : 'none', wlen: d.wlen, flash: this.flash, time: t, vx: this.vx });
      if (this.dead || this.atRest) return;
      if (this.inf > 0) { ctx.fillStyle = '#000'; ctx.fillRect(this.x - 21, gy - 91, 42, 4); ctx.fillStyle = this.turnT != null && Math.sin(t * 12) > 0 ? '#e060f0' : '#8a2a9a'; ctx.fillRect(this.x - 20, gy - 90, 40 * this.inf / 100, 2); }
      if (this.turnT != null) {
        ctx.font = '16px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText('TURNING  0:' + String(Math.ceil(this.turnT)).padStart(2, '0'), this.x + 1, gy - 103);
        ctx.fillStyle = Math.sin(t * 12) > 0 ? '#ff7aff' : '#c04ad0'; ctx.fillText('TURNING  0:' + String(Math.ceil(this.turnT)).padStart(2, '0'), this.x, gy - 104);
      }
      if (this.hp < this.maxHp) {
        ctx.fillStyle = '#000'; ctx.fillRect(this.x - 21, gy - 97, 42, 5); ctx.fillStyle = '#6f8a4a'; ctx.fillRect(this.x - 20, gy - 96, 40 * this.hp / this.maxHp, 3);
      }
      const m = G.questLog.marker(d.id);
      if (m && this.canTalk) {
        const my = (d.pose === 'hang' ? gy - 176 : gy - 112) + Math.sin(t * 4) * 3;
        ctx.font = '27px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText(m, this.x + 1, my + 1);
        ctx.fillStyle = '#e0b84a'; ctx.fillText(m, this.x, my);
      }
    }
  };
})();
