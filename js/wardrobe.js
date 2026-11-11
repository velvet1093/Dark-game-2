'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Wardrobe: skins for the knight's harness, a finish for each
// weapon, the dye of the Moth Wings, and Misery's colours. A few are yours from
// the start; the rest are earned on the road, and the screen says how.
// Chosen at any vigil candle, or from the pause menu.
// ---------------------------------------------------------------------------
(() => {
  const F = g => g.flags, done = id => G.questLog.state[id] && G.questLog.state[id].status === 'done';
  const kills = g => Object.values(g.kills || {}).reduce((a, b) => a + b, 0);
  const gifts = g => Object.keys((g.misery && g.misery.got) || {}).length;

  // the knight: changes laid over his own harness
  const KNIGHT = {
    battalion: { name: 'Harness of the Long Battalion', look: {}, need: null },
    black: { name: "Headsman's Black", look: { body: '#2a2628', trim: '#5a0a10', arm: '#3a3438', leg: '#1e1a1c', helmCol: '#3a3438', plume: '#8a0a12', cape: '#1a1214' }, need: [g => F(g).boss_hangman_dead, 'Defeat Gaunt, the High Headsman'] },
    sun: { name: 'Gilded Sun of Osric', look: { body: '#c9a13b', trim: '#7a1a14', arm: '#8a7a50', leg: '#5a4a2a', helmCol: '#d8b860', plume: '#f2ece0', cape: '#7a1a14' }, need: [g => F(g).boss_bearer_dead, 'Defeat (or spare) the Standard-Bearer'] },
    lily: { name: 'Knight of the Lily', look: { body: '#e8e2d8', trim: '#8a5fd0', arm: '#c8c2b8', leg: '#9a948c', helmCol: '#ece6de', plume: '#b79be8', cape: '#141216' }, need: [() => done('lilies'), 'Bring the white lilies to Sister Liese'] },
    pilgrim: { name: 'Pilgrim of the Pass', look: { body: '#8a8e98', trim: '#c8ccd6', arm: '#6a707a', leg: '#4a4e58', helmCol: '#c8ccd6', plume: '#5a6070', cape: '#d8dce4' }, need: [g => F(g).boss_windcaller_dead, 'Defeat (or spare) the Windcaller'] },
    moth: { name: 'Moth-Knight', look: { body: '#8a6478', trim: '#d8c4b4', arm: '#6a4a5a', leg: '#4a3442', helmCol: '#a888b0', plume: '#e6d8b4', cape: '#5a3c4e' }, need: [g => F(g).boss_mothmother_dead, 'Take the Lamplight Mother\'s wings'] },
    weeping: { name: 'The Weeping Knight', look: { body: '#5a2a2e', trim: '#a00a12', arm: '#4a2a2e', leg: '#2e1a1c', helmCol: '#6a3a3e', plume: '#c20d16', cape: '#3a0a10' }, need: [g => (F(g).deaths || 0) >= 10, 'Die ten times'] },
    corin: { name: 'Corin, Bareheaded', look: { helm: 'none', skin: '#d0b098', hair: '#6a4a30' }, need: [g => F(g).named, 'Remember your name'] },
  };
  // weapon finishes: what the steel looks like
  const FIN = {
    steel: { name: 'Plain Steel', pal: null, need: null },
    bloodied: { name: 'Bloodied', pal: { b: '#a0262c', s: '#5a0a10', l: '#e06060' }, need: [g => kills(g) >= 100, 'Kill a hundred of the infected'] },
    gilded: { name: 'Gilded', pal: { b: '#d8b050', s: '#9a7020', l: '#fff0b0' }, need: [g => (g.items.icon || 0) >= 15, 'Find fifteen weeping icons'] },
    bone: { name: 'Bone', pal: { b: '#e0d6c0', s: '#a89c84', l: '#ffffff' }, need: [g => F(g).boss_malvern_dead, 'Defeat (or spare) Malvern'] },
    frost: { name: 'Rimed', pal: { b: '#a8d0e8', s: '#6a98b8', l: '#eef8ff' }, need: [g => F(g).boss_windcaller_dead, 'Defeat (or spare) the Windcaller'] },
    moth: { name: 'Moth-Dust', pal: { b: '#a888b0', s: '#6a4a72', l: '#e8d8f0' }, need: [g => F(g).boss_mothmother_dead, 'Take the Lamplight Mother\'s wings'] },
    obsidian: { name: 'Oathkeeper\'s Black', pal: { b: '#3a3440', s: '#1a161e', l: '#7a6a8a' }, need: [g => F(g).boss_garrick_dead, 'Defeat (or spare) Ser Garrick'] },
  };
  // the Moth Wings
  const WINGS = {
    lamplight: { name: 'Lamplight', pal: null, need: null },
    luna: { name: 'Luna', pal: { b: '#9ac8a0', s: '#5a8a62', band: '#e8f4d8', edge: '#2a4a32', eye: '#c87040' }, need: [g => F(g).met_nell, 'Find Nell, if you let her live'] },
    ghost: { name: 'Ghost', pal: { b: '#d8d4e0', s: '#a8a4b4', band: '#ffffff', edge: '#6a6878', eye: '#8a70c0' }, need: [g => F(g).court_met, 'Find the Lantern Court'] },
    ember: { name: 'Ember', pal: { b: '#8a3a1a', s: '#4a1a0a', band: '#f0a040', edge: '#1a0a06', eye: '#ffe080' }, need: [g => F(g).boss_widow_dead, 'Defeat (or spare) the Charcoal Widow'] },
    deathshead: { name: 'Death\'s-Head', pal: { b: '#4a3a2a', s: '#2a2018', band: '#c8a860', edge: '#140c08', eye: '#e8e0d0' }, need: [g => F(g).boss_gravewarden_dead, 'Defeat (or spare) the Gravewarden'] },
    seraph: { name: 'Seraph', pal: { b: '#d8b860', s: '#9a7a30', band: '#fff4c8', edge: '#5a4210', eye: '#ff3b2f' }, need: [g => (g.items.icon || 0) >= 30, 'Find thirty weeping icons'] },
  };
  // Misery's colours
  const M = G.MISERY_PAL, SKN = M.SKN;
  const MIS = {
    misery: { name: 'Misery', pal: null, need: null },
    mercy: { name: 'Mercy, As She Was', pal: { LV: { b: '#f0d27a', s: '#c9a13b', l: '#fff4c8' }, HR: { b: '#ffffff', s: '#e0d8c8', l: '#ffffff' }, DR: { b: '#f2ece0', s: '#c8bfae', l: '#ffffff' }, SKN, band: '#c9a13b', eye: '#6a8ac8', mote: 'rgba(255,236,170,0.85)' }, need: [g => F(g).court_met && F(g).named, 'Take her to the Court, and remember your name'] },
    weeping: { name: 'Crimson', pal: { LV: { b: '#d86070', s: '#a03040', l: '#ffc0c8' }, HR: { b: '#f3f0fa', s: '#c6bedb', l: '#ffffff' }, DR: { b: '#3a0a14', s: '#22060c', l: '#6a1a28' }, SKN, band: '#1a0408', eye: '#c20d16', mote: 'rgba(255,140,150,0.8)' }, need: [g => (F(g).deaths || 0) >= 25, 'Let her watch you die twenty-five times'] },
    moonmoth: { name: 'Moonmoth', pal: { LV: { b: '#a8e0b0', s: '#6aa878', l: '#e8fff0' }, HR: { b: '#f0fff4', s: '#c0d8c8', l: '#ffffff' }, DR: { b: '#24402c', s: '#14281a', l: '#3a6048' }, SKN, band: '#0e1a12', eye: '#3a8a5a', mote: 'rgba(200,255,210,0.8)' }, need: [g => F(g).roots_eaten, 'Have her lead the moths to the roots'] },
    thorned: { name: 'Thorned', pal: { LV: { b: '#6a4a8a', s: '#3a2450', l: '#a888c8' }, HR: { b: '#2a2030', s: '#140e18', l: '#4a3a50' }, DR: { b: '#140a18', s: '#08040a', l: '#2a1a30' }, SKN, band: '#a00a12', eye: '#ff3b2f', mote: 'rgba(160,120,200,0.8)' }, need: [g => gifts(g) >= 9, 'Give her every one of her gifts'] },
  };
  const SETS = { knight: KNIGHT, weapon: FIN, wings: WINGS, misery: MIS };
  const looks = {};

  G.wardrobe = {
    FIN, SETS,
    cos(g) { return g.cos || (g.cos = { knight: 'battalion', wings: 'lamplight', misery: 'misery', weapon: {} }); },
    open(set, id, g) { const s = SETS[set][id]; return !s.need || !!s.need[0](g); },
    look(g) { const id = this.cos(g).knight; if (!KNIGHT[id] || !this.open('knight', id, g)) return G.LOOKS.player; return looks[id] || (looks[id] = Object.assign({}, G.LOOKS.player, KNIGHT[id].look)); },
    finishOf(g, wid) { const f = this.cos(g).weapon[wid]; return f && FIN[f] && this.open('weapon', f, g) ? f : null; },
    steel(g, wid) { const f = this.finishOf(g, wid); return f ? FIN[f].pal : null; },
    wingPal(g) { const w = this.cos(g).wings; return WINGS[w] && this.open('wings', w, g) ? WINGS[w].pal : null; },
    miseryPal(g) { const m = this.cos(g).misery; return MIS[m] && this.open('misery', m, g) ? MIS[m].pal || undefined : undefined; },
    count(g) { let n = 0, t = 0; for (const k in SETS) for (const id in SETS[k]) { t++; if (this.open(k, id, g)) n++; } return [n, t]; },
  };

  // ---- a preview of one choice
  const preview = (g, set, id, wid) => {
    const c = document.createElement('canvas'); c.width = 240; c.height = 260; const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const t = 1.3;
    if (set === 'misery') {
      ctx.translate(120, 130); ctx.scale(3.2, 3.2); G.drawMisery(ctx, 0, 0, 1, t, false, false, false, MIS[id].pal || undefined);
      return c.toDataURL();
    }
    if (set === 'weapon') {   // the weapon itself, large, in that finish
      const img = new Image(); img.src = G.weaponPortrait(wid, id === 'steel' ? null : id);
      return img.src;
    }
    const look = set === 'knight' ? Object.assign({}, G.LOOKS.player, KNIGHT[id].look) : G.wardrobe.look(g);
    const W = G.WEAPONS[wid];
    ctx.translate(120, 238); ctx.scale(1.6, 1.6); ctx.translate(0, -G.GROUND);
    if (set === 'wings' || g.abilities.dj) G.drawPlayerWings(ctx, -8, G.GROUND - 52, 1, 0, t, true, set === 'wings' ? 1 : 0.85, set === 'wings' ? WINGS[id].pal || undefined : G.wardrobe.wingPal(g) || undefined);
    G.drawHumanoid(ctx, { x: 0, y: G.GROUND, facing: 1, scale: 1.05, pose: { bA: 0.2, bE: 0.9 }, look, steel: G.wardrobe.steel(g, wid), weapon: W.draw, wlen: W.len, shield: true, flash: 0, time: t, vx: 0 });
    return c.toDataURL();
  };

  // ---- the screen
  const TABS = [['knight', 'Knight'], ['weapon', 'Weapon'], ['wings', 'Wings'], ['misery', 'Misery']];
  G.ui.wardrobe = function (tab = 'knight', wid, keep, from) {
    const g = G.game, C = G.wardrobe.cos(g); wid = wid || g.weaponId; this.wardFrom = from || this.wardFrom || 'shrine';
    const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const set = SETS[tab], ids = Object.keys(set), cur = tab === 'weapon' ? (C.weapon[wid] || 'steel') : C[tab];
    const opts = [], btn = (label, fn, cls = '') => { opts.push(fn); return `<button class="btn ${cls}" data-opt="${opts.length - 1}">${label}</button>`; };
    const tabs = TABS.map(([k, n]) => btn(n, () => this.wardrobe(k, wid, TABS.findIndex(x => x[0] === k)), k === tab ? 'tab on' : 'tab')).join('');
    const first = opts.length;
    const rows = ids.map(id => { const s = set[id], open = G.wardrobe.open(tab, id, g), on = id === cur;
      return btn(`${on ? '✦ ' : ''}${open ? esc(s.name) : '? ? ?'}${open ? '' : `<small>${esc(s.need[1])}</small>`}`, () => {
        if (!open) { G.sfx('block'); return; }
        if (tab === 'weapon') C.weapon[wid] = id; else C[tab] = id;
        g.save(); G.sfx('questdone'); this.wardrobe(tab, wid, opts.indexOf(opts[first + ids.indexOf(id)]));
      }, (on ? 'on ' : '') + (open ? '' : 'unknown')); }).join('');
    let navs = '';
    if (tab === 'weapon' && g.weapons.length > 1) {
      const i = g.weapons.indexOf(wid), prev = g.weapons[(i - 1 + g.weapons.length) % g.weapons.length], next = g.weapons[(i + 1) % g.weapons.length];
      navs += btn('◀ ' + esc(G.WEAPONS[prev].name), () => this.wardrobe('weapon', prev, opts.length - 3), 'wd-nav');
      navs += btn(esc(G.WEAPONS[next].name) + ' ▶', () => this.wardrobe('weapon', next, opts.length - 2), 'wd-nav');
    }
    navs += btn('Back', () => (this.wardFrom === 'pause' ? this.pause() : this.shrine()), 'wd-nav');
    const [n, t] = G.wardrobe.count(g);
    const html = `<div class="screen dim wardrobe"><h2>Wardrobe</h2><div class="found">${n} of ${t} unlocked${tab === 'weapon' ? ' &nbsp;·&nbsp; ' + esc(G.WEAPONS[wid].name) : ''}</div>
      <div class="btabs">${tabs}</div>
      <div class="wd-body"><div class="wd-prev"><img alt=""><div class="wd-name"></div><div class="wd-need"></div></div><div class="opts blist wd-list">${rows}</div></div>
      <div class="wa-navs">${navs}</div></div>`;
    const show = j => {
      const box = document.querySelector('.wd-prev'); if (!box) return;
      const k = j - first, id = k >= 0 && k < ids.length ? ids[k] : cur, s = set[id], open = G.wardrobe.open(tab, id, g);
      box.querySelector('img').src = preview(g, tab, id, wid); box.querySelector('img').className = open ? '' : 'locked';
      box.querySelector('.wd-name').textContent = open ? s.name : '? ? ?';
      box.querySelector('.wd-need').textContent = open ? (id === cur ? 'Worn' : 'Press ' + G.keyName('use') + ' or Enter to wear') : 'Locked: ' + s.need[1];
    };
    this.nextOnSel = show; this.keepSel = keep != null ? keep : first + Math.max(0, ids.indexOf(cur));
    this.show(html, null, opts.map(f => () => { G.sfx('ui'); f(); }));
    this.advance = () => (this.wardFrom === 'pause' ? this.pause() : this.shrine()); this.escAdvance = true;
  };
})();
