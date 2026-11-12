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
    dawnbrand: { name: 'Dawnfire', how: 'Every guard-breaking blow sears for 40% more, and lights the knight gold.' },
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

  // ---- weapon portraits: each weapon painted large, in pixels, laid across the root of its tree
  const paint = (wid, fin) => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 200; const x = c.getContext('2d');
    const u = 4, R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px * u, py * u, w * u, h * u); };
    x.translate(100, 100); x.rotate(-Math.PI / 4); x.translate(-100, -100);   // laid on the diagonal, point up and right
    const STEEL = fin ? [G.shade(fin.s, 0.8), fin.b, fin.l, '#ffffff'] : ['#5a5e6a', '#9a9eaa', '#d8dce6', '#f4f6fa'], GOLD = ['#7a5a1a', '#c9a13b', '#f0d680'], WOOD = ['#3a2416', '#5e3a20', '#8a5a30'], RED = '#8a1018';
    const blade = (x0, y0, len, w, tip) => { for (let i = 0; i < len; i++) { const ww = i > len - tip ? Math.max(1, Math.round(w * (len - i) / tip)) : w; const cx = 25 - Math.floor(ww / 2); R(cx, y0 - i, ww, 1, STEEL[1]); R(cx, y0 - i, 1, 1, STEEL[2]); R(cx + ww - 1, y0 - i, 1, 1, STEEL[0]); if (ww > 2) R(25, y0 - i, 1, 1, STEEL[3]); } };
    const grip = (y0, len, col = WOOD) => { for (let i = 0; i < len; i++) { R(24, y0 + i, 2, 1, i % 2 ? col[1] : col[0]); } };
    switch (wid) {
      case 'greatsword': blade(0, 34, 30, 5, 5); R(17, 35, 17, 2, GOLD[1]); R(17, 35, 17, 1, GOLD[2]); grip(37, 8); R(23, 45, 4, 3, GOLD[1]); R(25, 6, 1, 26, STEEL[0]); break;
      case 'knife': blade(0, 34, 14, 3, 4); R(21, 35, 9, 1, STEEL[0]); grip(36, 6, ['#2a1a1a', '#4a2a2a']); x.strokeStyle = GOLD[1]; x.lineWidth = u; x.beginPath(); x.arc(25.5 * u, 44.5 * u, 2 * u, 0, 7); x.stroke(); x.fillStyle = RED; x.font = 'bold 22px serif'; x.fillText('VII', 30 * u, 28 * u); break;
      case 'greataxe': for (let i = 0; i < 44; i++) R(24, 4 + i, 2, 1, i % 3 ? WOOD[1] : WOOD[0]); for (let i = 0; i < 16; i++) { const w = Math.round(10 * Math.sin(Math.PI * i / 15)) + 2; R(26, 4 + i, w, 1, i === 0 || i === 15 ? STEEL[0] : STEEL[1]); R(26 + w - 1, 4 + i, 1, 1, STEEL[3]); } R(22, 2, 6, 3, STEEL[0]); break;
      case 'iceaxe': for (let i = 0; i < 30; i++) R(24, 14 + i, 2, 1, i % 3 ? WOOD[1] : WOOD[0]); R(14, 12, 22, 3, STEEL[1]); R(14, 12, 22, 1, STEEL[2]); for (let i = 0; i < 6; i++) R(14 - i, 13 + i, 2, 1, STEEL[1]); R(34, 9, 4, 6, STEEL[0]); R(12, 18, 2, 2, '#b8d8f0'); R(30, 16, 2, 1, '#b8d8f0'); R(20, 20, 1, 2, '#e8f4ff'); break;
      case 'spear': for (let i = 0; i < 40; i++) R(24, 10 + i, 2, 1, i % 4 ? WOOD[1] : WOOD[2]); for (let i = 0; i < 10; i++) { const w = Math.round(4 * Math.sin(Math.PI * i / 9)) + 1; R(25 - Math.floor(w / 2), 10 - i, w, 1, STEEL[1]); R(25, 10 - i, 1, 1, STEEL[3]); } R(22, 11, 6, 2, GOLD[1]); R(21, 13, 2, 6, RED); R(27, 13, 2, 5, RED); break;
      case 'flail': grip(28, 18); R(23, 26, 4, 2, STEEL[0]); for (let i = 0; i < 6; i++) R(25 + (i % 2), 25 - i * 2, 2, 2, STEEL[i % 2 ? 0 : 1]); x.fillStyle = STEEL[1]; x.beginPath(); x.arc(27 * u, 8 * u, 6 * u, 0, 7); x.fill(); x.fillStyle = STEEL[2]; x.beginPath(); x.arc(25.5 * u, 6.5 * u, 2 * u, 0, 7); x.fill(); for (const [a, b] of [[27, 0], [35, 8], [27, 16], [19, 8], [32, 3], [32, 13], [22, 3], [22, 13]]) R(a, b, 2, 2, STEEL[0]); break;
      case 'scythe': for (let i = 0; i < 46; i++) R(24 + Math.round(i * 0.05), 4 + i, 2, 1, i % 3 ? WOOD[1] : WOOD[0]); for (let i = 0; i < 22; i++) { const yy = 4 + Math.round(Math.pow(i / 22, 1.6) * 10); R(24 - i, yy, 1, 3 - (i > 17 ? 1 : 0), STEEL[1]); R(24 - i, yy, 1, 1, STEEL[3]); } R(23, 16, 4, 2, WOOD[2]); break;
      default: blade(0, 34, 26, 3, 4); R(18, 35, 15, 2, GOLD[1]); R(18, 35, 15, 1, GOLD[2]); grip(37, 7); R(23, 44, 4, 3, GOLD[1]); R(24, 45, 2, 1, RED);   // the longsword
    }
    return c.toDataURL();
  };
  const PORTRAITS = {};
  G.weaponPortrait = (wid, finId) => { const fin = finId !== undefined ? finId : G.wardrobe && G.game ? G.wardrobe.finishOf(G.game, wid) : null, k = wid + ':' + (fin || ''); return PORTRAITS[k] || (PORTRAITS[k] = paint(wid, fin && G.wardrobe ? G.wardrobe.FIN[fin].pal : null)); };

  // node icons, small inline drawings
  const ICON = {
    edge: '<path d="M12 1 L15 5 V15 H9 V5 Z" fill="currentColor"/><path d="M6 15 H18 V17 H6 Z M11 17 H13 V21 H11 Z M10 21 H14 V23 H10 Z" fill="currentColor"/>',
    thrift: '<path d="M6 20 C6 10 12 4 20 4 C18 12 12 18 6 20 Z M6 20 L13 11" fill="none" stroke="currentColor" stroke-width="2"/>',
    bleed: '<path d="M12 3 C12 3 5 12 5 15 a7 7 0 0 0 14 0 C19 12 12 3 12 3 Z" fill="currentColor"/>',
    plunge: '<path d="M12 2 v14 M6 11 l6 7 l6 -7 M4 22 h16" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    finisher: '<path d="M12 2 l2.5 6 6.5 .5 -5 4.2 1.6 6.3 -5.6 -3.5 -5.6 3.5 1.6 -6.3 -5 -4.2 6.5 -.5 Z" fill="currentColor"/>',
    charge: '<path d="M13 2 L5 13 h6 l-2 9 L19 10 h-6 l2 -8 Z" fill="currentColor"/>',
    sig: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 5 l2 5 5 0 -4 3 1.5 5 -4.5 -3 -4.5 3 1.5 -5 -4 -3 5 0 Z" fill="currentColor"/>',
  };
  // where each node sits in the tree (percent of the tree box), and what it grows from
  const POS = { edge: [27, 70], bleed: [13, 44], finisher: [25, 17], thrift: [73, 70], plunge: [87, 44], charge: [75, 17], sig: [50, 9] };
  const ROOT = [50, 90];
  const EDGES = [['root', 'edge'], ['root', 'thrift'], ['edge', 'bleed'], ['bleed', 'finisher'], ['thrift', 'plunge'], ['plunge', 'charge'], ['finisher', 'sig'], ['charge', 'sig']];
  const ORDER = ['edge', 'bleed', 'finisher', 'sig', 'charge', 'plunge', 'thrift'];   // the way the cursor walks the tree

  // ---- the screen
  G.ui.weaponArts = function (wid, keep) {
    const g = G.game; wid = wid || g.weaponId;
    const own = G.skills.of(g, wid), W = G.WEAPONS[wid], art = G.WEAPON_ARTS[wid] || { name: 'Its Art', how: '' };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const node = id => G.SKILL_NODES.find(n => n.id === id), learned = id => id === 'root' || !!own[id];
    const info = n => {
      const got = own[n.id], open = (n.req || []).every(r => own[r]), can = G.skills.canBuy(g, n, wid);
      const name = n.id === 'sig' ? art.name : n.name, how = n.id === 'sig' ? art.how : n.how;
      const cost = n.cost + ' mark' + (n.cost > 1 ? 's' : '') + (n.relic ? ' and a Martyr\'s Relic' : '');
      const state = got ? 'Learned' : can ? 'Press ' + G.keyName('use') + ' or Enter to learn' : !open ? 'Learn ' + (n.req || []).map(r => node(r).name).join(' and ') + ' first' : (g.marks || 0) < n.cost ? 'Not enough marks' : 'You need a Martyr\'s Relic';
      return { got, open, can, name, how, cost, state };
    };
    // lines between the nodes, lit gold where both ends are learned
    const pt = id => id === 'root' ? ROOT : POS[id];
    const lines = EDGES.map(([a, b]) => { const [x1, y1] = pt(a), [x2, y2] = pt(b), lit = learned(a) && learned(b), next = learned(a) && !learned(b);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${lit ? 'lit' : next ? 'next' : ''}"/>`; }).join('');
    const opts = [];
    const nodes = ORDER.map(id => {
      const n = node(id), f = info(n), [x, y] = POS[id], k = opts.length;
      opts.push(() => { if (f.can && G.skills.buy(g, n, wid)) { this.weaponArts(wid, k); if (n.id === 'sig') G.text(g.player.x, G.GROUND - 160, art.name.toUpperCase(), '#f0d680', 18); } else { G.sfx('block'); } });
      return `<button class="btn wa-node ${id === 'sig' ? 'sig' : ''} ${f.got ? 'got' : f.can ? 'can' : f.open ? 'open' : 'locked'}" data-opt="${k}" style="left:${x}%;top:${y}%"><svg viewBox="0 0 24 24">${ICON[id]}</svg></button>`;
    }).join('');
    const list = g.weapons, i = list.indexOf(wid), nav = [];
    if (list.length > 1) {
      const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
      nav.push(`<button class="btn wa-nav" data-opt="${opts.length}">◀ ${esc(G.WEAPONS[prev].name)}</button>`); opts.push(() => this.weaponArts(prev, opts.length - 3));
      nav.push(`<button class="btn wa-nav" data-opt="${opts.length}">${esc(G.WEAPONS[next].name)} ▶</button>`); opts.push(() => this.weaponArts(next, opts.length - 2));
    }
    nav.push(`<button class="btn wa-nav" data-opt="${opts.length}">Back to the candle</button>`); opts.push(() => this.shrine());
    const learnedN = G.SKILL_NODES.filter(n => own[n.id]).length, need = G.skills.need(g), pct = Math.round(((g.markXP || 0) / need) * 100);
    const html = `<div class="screen dim warts">
      <h2>Weapon Arts</h2>
      <div class="wa-top"><span class="wa-wname">${esc(W.name)}</span><span>${learnedN} / ${G.SKILL_NODES.length} learned</span><span class="wa-marks">✦ ${g.marks || 0} mark${(g.marks || 0) === 1 ? '' : 's'}</span><span class="wa-relic">✚ ${g.relics || 0} relic${(g.relics || 0) === 1 ? '' : 's'}</span><span class="markbar"><i style="width:${pct}%"></i></span></div>
      <div class="wa-body">
        <div class="wa-tree">
          <svg class="wa-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>
          <img class="wa-weapon ${own.sig ? 'awake' : ''}" src="${G.weaponPortrait(wid)}" alt=""><div class="wa-root" style="left:${ROOT[0]}%;top:${ROOT[1]}%"></div>
          ${nodes}
        </div>
        <div class="wa-detail"></div>
      </div>
      <div class="wa-navs">${nav.join('')}</div>
    </div>`;
    const detail = j => {
      const box = document.querySelector('.wa-detail'); if (!box) return;
      if (j < ORDER.length) {
        const n = node(ORDER[j]), f = info(n);
        box.innerHTML = `<div class="wa-dkind">${n.id === 'sig' ? 'The weapon\'s art' : n.tier === 1 ? 'First skill' : n.tier === 2 ? 'Second skill' : 'Third skill'}</div><h3>${esc(f.name)}</h3><p>${esc(f.how)}</p><div class="wa-dcost">${esc(f.cost)}</div><div class="wa-dstate ${f.got ? 'got' : f.can ? 'can' : ''}">${esc(f.state)}</div>`;
      } else {
        const b = W.light.reduce((m, a) => Math.max(m, a.dmg), 0);
        box.innerHTML = `<div class="wa-dkind">The weapon</div><h3>${esc(W.name)}</h3><p>A ${W.light.length}-blow combo, hitting up to ${b}; a heavy blow of ${W.heavy.dmg}. Bleeding ${W.bleed}.</p><p>${esc(art.name)}: ${esc(art.how)}</p>`;
      }
    };
    this.nextOnSel = detail; this.keepSel = keep != null ? keep : 0;
    this.show(html, null, opts.map(f => () => { G.sfx('ui'); f(); }));
    this.advance = () => this.shrine(); this.escAdvance = true;
  };
})();
