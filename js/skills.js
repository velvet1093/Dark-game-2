'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — Weapon Arts. Every weapon keeps its own tree of skills, bought at
// a vigil candle with Marks of Martyrdom. Marks come from killing: a meter fills
// with every death you cause, and a boss gives one outright. The last skill of
// each tree is that weapon's own art, and it also needs a Martyr's Relic, found
// in the optional places off the road.
//
//   Keen Edge ─ Bloodletter ─ Final Blow ─┐
//                                         ├─ the weapon's art (+ a relic)
//   Light Hand ─ Plunging Blow ─ Gathered Strength ─┘
// ---------------------------------------------------------------------------
(() => {
  G.SKILL_NODES = [
    { id: 'edge', tier: 1, cost: 1, name: 'Keen Edge', how: 'This weapon deals 15% more damage.' },
    { id: 'thrift', tier: 1, cost: 1, name: 'Light Hand', how: 'Its attacks cost a quarter less stamina.' },
    { id: 'bleed', tier: 2, cost: 2, req: ['edge'], name: 'Bloodletter', how: 'It builds bleeding 60% faster.' },
    { id: 'plunge', tier: 2, cost: 2, req: ['thrift'], name: 'Plunging Blow', how: 'In the air, hold down and attack: drive the blade into the ground and strike everything around where you land.' },
    { id: 'finisher', tier: 3, cost: 3, req: ['bleed'], name: 'Final Blow', how: 'Attack once more at the end of the combo for a crushing finisher that breaks guard.' },
    { id: 'charge', tier: 3, cost: 3, req: ['plunge'], name: 'Gathered Strength', how: 'Hold heavy attack to gather strength; let go for a blow of double damage that breaks any guard.' },
    { id: 'sig', tier: 4, cost: 3, req: ['finisher', 'charge'], relic: true },
  ];
  // each weapon's own art
  G.WEAPON_ARTS = {
    longsword: { name: 'Oath of the Battalion', how: 'Your light attacks come a third faster.' },
    greataxe: { name: "Headsman's Due", how: 'Every limb you sever gives you back 6% of your life.' },
    flail: { name: 'Scourge of the Penitent', how: 'A haemorrhage spreads its bleeding to everything near it.' },
    spear: { name: "Warden's Reach", how: 'Every blow reaches a quarter further.' },
    greatsword: { name: 'Colours of the Sun', how: 'While your life is above three quarters, you deal 30% more damage.' },
    knife: { name: 'The Seventh Cut', how: 'Every seventh hit opens a haemorrhage.' },
    scythe: { name: 'Harvest', how: 'Every kill restores your stamina and 4% of your life.' },
    iceaxe: { name: 'Frostbite', how: 'What you strike is slowed for three seconds.' },
  };
  const markNeed = g => 260 + (g.marksEarned || 0) * 30;

  G.skills = {
    // owned skills of a weapon (the equipped one by default)
    of(g, wid = g.weaponId) { g.wskills = g.wskills || {}; return g.wskills[wid] || (g.wskills[wid] = {}); },
    has(g, id, wid) { return !!G.skills.of(g, wid)[id]; },
    art(g, wid = g.weaponId) { return G.skills.has(g, 'sig', wid) ? wid : null; },
    canBuy(g, n, wid) {
      const own = G.skills.of(g, wid);
      return !own[n.id] && (g.marks || 0) >= n.cost && (n.req || []).every(r => own[r]) && (!n.relic || (g.relics || 0) > 0);
    },
    buy(g, n, wid) {
      if (!G.skills.canBuy(g, n, wid)) return false;
      g.marks -= n.cost; if (n.relic) g.relics--; G.skills.of(g, wid)[n.id] = 1; G.sfx('questdone'); G.sfx('bell'); g.save(); return true;
    },
    // a death fills the meter; a full meter is a Mark
    gainXP(g, n) {
      g.markXP = (g.markXP || 0) + n;
      while (g.markXP >= markNeed(g)) { g.markXP -= markNeed(g); g.marksEarned = (g.marksEarned || 0) + 1; g.marks = (g.marks || 0) + 1; G.text(g.player.x, G.GROUND - 170, 'MARK OF MARTYRDOM', '#e0b84a', 15); G.sfx('chime'); }
    },
    need: markNeed,
    // the finisher and the charged blow, built from the weapon's own heavy
    finisher(w) {
      const top = w.light.reduce((m, a) => Math.max(m, a.dmg), 0), h = w.heavy;
      return { wind: 0.3, active: 0.13, rec: 0.55, dmg: top * 2.2, st: h.st * 0.6, reach: h.reach * 1.05, lunge: h.lunge, sever: h.sever * 1.4, poiseBreak: true, anim: h.anim, finisher: true };
    },
    charged(w) { const h = w.heavy; return Object.assign({}, h, { wind: 0.12, dmg: h.dmg * 2, reach: h.reach * 1.2, sever: h.sever * 1.5, poiseBreak: true, lunge: h.lunge * 1.2, charged: true }); },
    plunge(w) { const h = w.heavy; return { dmg: h.dmg * 1.25, sever: h.sever, poiseBreak: true, quiet: false }; },
  };

  // ---- the screen: the equipped weapon's tree, with arrows to the others you own
  G.ui.weaponArts = function (wid, keep = 0) {
    const g = G.game; wid = wid || g.weaponId;
    const own = G.skills.of(g, wid), W = G.WEAPONS[wid], art = G.WEAPON_ARTS[wid] || { name: 'Its Art', how: '' };
    const items = [], esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    for (const n of G.SKILL_NODES) {
      const name = n.id === 'sig' ? art.name : n.name, how = n.id === 'sig' ? art.how + ' Needs a Martyr\'s Relic.' : n.how;
      const got = own[n.id], open = (n.req || []).every(r => own[r]), can = G.skills.canBuy(g, n, wid);
      items.push({ n, cls: (got ? 'got' : open ? '' : 'locked') + (n.id === 'sig' ? ' sig' : ''), off: !can,
        label: `<b>${got ? '✦ ' : ''}${esc(name)}</b> <span class="cost">${got ? 'learned' : n.cost + ' mark' + (n.cost > 1 ? 's' : '') + (n.relic ? ' + relic' : '')}</span><small>${open || got ? esc(how) : 'Learn the skill' + ((n.req || []).length > 1 ? 's' : '') + ' above it first.'}</small>`,
        fn: () => { if (G.skills.buy(g, n, wid)) { this.keepSel = items.indexOf(items.find(x => x.n === n)); this.weaponArts(wid); } } });
    }
    const list = g.weapons, i = list.indexOf(wid);
    if (list.length > 1) {
      items.push({ cls: 'nav', label: '◀ ' + esc(G.WEAPONS[list[(i - 1 + list.length) % list.length]].name), fn: () => { this.keepSel = items.length - 3; this.weaponArts(list[(i - 1 + list.length) % list.length]); } });
      items.push({ cls: 'nav', label: esc(G.WEAPONS[list[(i + 1) % list.length]].name) + ' ▶', fn: () => { this.keepSel = items.length - 2; this.weaponArts(list[(i + 1) % list.length]); } });
    }
    items.push({ cls: 'back', label: 'Back to the candle', fn: () => this.shrine() });
    const need = G.skills.need(g), pct = Math.round(((g.markXP || 0) / need) * 100);
    this.menu('dim', `<h2>Weapon Arts</h2><div class="ichor">${esc(W.name)} &nbsp;·&nbsp; ${g.marks || 0} mark${(g.marks || 0) === 1 ? '' : 's'} &nbsp;·&nbsp; ${g.relics || 0} relic${(g.relics || 0) === 1 ? '' : 's'}</div><div class="markbar"><i style="width:${pct}%"></i></div>`,
      items, '<div class="keys">Marks of Martyrdom fill from every death you cause. A boss gives one outright. Martyr\'s Relics lie off the road.</div>', 'tree wtree');
    this.advance = () => this.shrine(); this.escAdvance = true;
  };
})();
