'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — DOM overlays: title, story slides, dialogue, notes, menus
// ---------------------------------------------------------------------------
(() => {
  const el = () => document.getElementById('overlay');
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>');
  // The controls line under the title and pause menus, built from the current bindings.
  const K = a => `<b>${esc(G.keyName(a))}</b>`;
  const keysHtml = () => (G.inputMode === 'pad'
    ? `<div class="keys">${K('left')} ${K('right')} / stick move &nbsp; ${K('jump')} jump &nbsp; ${K('attack')} slash &nbsp; ${K('heavy')} heavy &nbsp; ${K('roll')} roll &nbsp; ${K('block')} block<br>
      ${K('use')} interact &nbsp; ${K('flask')} flask &nbsp; ${K('cure')} tincture &nbsp; ${K('swap')} change weapon &nbsp; ${K('down')} drop &nbsp; ${K('journal')} quests &nbsp; ${K('bestiary')} bestiary &nbsp; ${K('pause')} pause</div>`
    : `<div class="keys">${K('left')} ${K('right')} move &nbsp; ${K('jump')} jump &nbsp; ${K('attack')} / click slash &nbsp; ${K('heavy')} / right-click heavy &nbsp; ${K('roll')} roll &nbsp; ${K('block')} block<br>
      ${K('flask')} flask &nbsp; ${K('cure')} tincture &nbsp; ${K('swap')} change weapon &nbsp; ${K('use')} interact · execute &nbsp; ${K('down')} drop &nbsp; ${K('journal')} quests &nbsp; ${K('bestiary')} bestiary &nbsp; <b>Esc</b> pause &nbsp; ${K('mute')} mute</div>`);

  const ui = G.ui = {
    blocking: false, advance: null, options: null, sel: 0, openT: 0, grace: 0.45,
    clear() { el().innerHTML = ''; this.blocking = false; this.advance = null; this.options = null; },
    // Called once per frame while an overlay is up.
    handle() {
      const I = G.input;
      if (G.input.capture) return;
      if (this.options) {
        for (let i = 0; i < this.options.length; i++) if (I.hit('opt' + (i + 1))) { this.options[i](); return; }
        // Enter or A picks the highlighted option, but not in the first moments, so mashing through dialogue cannot choose for you
        if (I.hit('confirm') && G.game.time - this.openT > this.grace) { const bt = this.btns()[this.sel]; if (bt && !bt.disabled) this.options[+bt.dataset.opt](); return; }
        if (this.escAdvance && this.advance && (I.hit('pause') || I.hit('journal') || I.hit('back'))) { this.advance(); return; }
        const up = I.hit('menuUp') || I.hit('jump') || I.hit('left'), dn = I.hit('menuDown') || I.hit('down') || I.hit('right');
        if (up || dn) { this.select(this.sel + (dn ? 1 : -1), dn ? 1 : -1); G.sfx('ui'); }
        return;
      }
      if (this.advance && (I.hit('confirm') || I.hit('use') || I.hit('roll') || I.hit('back') || (this.escAdvance && (I.hit('pause') || I.hit('journal'))))) this.advance();
    },
    btns() { return [...el().querySelectorAll('[data-opt]')]; },
    // Highlight option i, stepping past disabled ones in direction d.
    select(i, d = 1) {
      const bs = this.btns(), n = bs.length; if (!n) return;
      for (let k = 0; k < n; k++) { const j = ((i + k * d) % n + n) % n; if (!bs[j].disabled) { this.sel = j; break; } }
      bs.forEach((bt, j) => bt.classList.toggle('sel', j === this.sel));
    },
    show(html, advance, options) {
      el().innerHTML = html; this.blocking = true; this.advance = advance || null; this.options = options || null; this.escAdvance = false;
      el().querySelectorAll('[data-opt]').forEach((b, j) => { b.addEventListener('click', e => { e.stopPropagation(); G.audioInit(); options[+b.dataset.opt](); }); b.addEventListener('mouseenter', () => this.select(j)); });
      if (options) { this.openT = G.game ? G.game.time : 0; this.grace = 0.45; this.select(Math.min(this.keepSel || 0, this.btns().length - 1)); this.keepSel = 0; }
      if (advance) el().firstElementChild.addEventListener('click', () => { G.audioInit(); if (this.advance) this.advance(); });
    },
    menu(cls, head, items, foot = '', listCls = '') {
      const btns = items.map((it, i) => `<button class="btn ${it.cls || ''}" data-opt="${i}" ${it.off ? 'disabled' : ''}>${i < 6 && !listCls ? i + 1 + '. ' : ''}${it.label}</button>`).join('');
      this.show(`<div class="screen ${cls}">${head}<div class="opts ${listCls}">${btns}</div>${foot}</div>`, null, items.map(it => () => { if (!it.off) { G.sfx('ui'); it.fn(); } }));
    },

    title(hasSave) {
      const items = [{ label: 'Take the Vow <small>(new game)</small>', fn: () => G.game.newGame() }];
      if (hasSave) items.unshift({ label: 'Resume the Vigil <small>(continue)</small>', fn: () => G.game.continueGame() });
      items.push({ label: 'Settings', fn: () => this.settings('title') }); this.hasSave = hasSave;
      this.menu('', '<h1>ASHEN VOW</h1><div class="sub">a tale of the Weeping Year</div>', items, keysHtml());
    },
    pause() {
      this.menu('dim', '<h2>Paused</h2>', [
        { label: 'Return to the road', fn: () => this.clear() },
        { label: 'Bestiary', fn: () => this.bestiary() },
        { label: 'Settings', fn: () => this.settings('pause') },
        { label: 'Abandon to title', fn: () => G.game.toTitle() },
      ], keysHtml());
      this.advance = () => this.clear(); this.escAdvance = true;
    },
    // Difficulty, sound and controls.
    settings(from = this.setFrom || 'pause', keep = 0) {
      this.setFrom = from;
      const u = G.unfair(), back = () => (from === 'title' ? this.title(this.hasSave) : this.pause());
      const items = [
        { label: u ? 'Difficulty: Unfair <small>— bosses take more, hit harder, feint, chain blows, punish a drink and turn light hits aside; trials give no warnings</small>'
                   : 'Difficulty: Fair <small>— bosses fight as they always did; trials show their tells</small>', fn: () => { G.setDifficulty(u ? 'fair' : 'unfair'); this.keepSel = 0; this.settings(from); } },
        { label: `Sound: ${G.isMuted() ? 'Off' : 'On'}`, fn: () => { G.toggleMute(); this.keepSel = 1; this.settings(from); } },
        { label: 'Controls', fn: () => this.controls() },
        { label: 'Back', fn: back },
      ];
      this.keepSel = this.keepSel || keep;
      this.menu('dim', '<h2>Settings</h2>', items, '<div class="keys">Difficulty changes only the bosses. It can be changed at any time, even mid-fight.</div>');
      this.advance = back; this.escAdvance = true;
    },
    // Rebind keys. Pick an action, then press the key you want for it.
    controls(waiting) {
      const items = G.BINDABLE.map(([a, name]) => ({ label: waiting === a ? `${name} <small>— press a key (Esc to cancel)</small>` : `${name} <small>— ${G.keys[a].map(G.codeName).join(' / ') || 'unbound'}</small>`,
        fn: () => { const idx = G.BINDABLE.findIndex(b => b[0] === a); this.keepSel = idx; this.controls(a); G.input.capture = code => { if (code !== 'Escape') G.bindKey(a, code); this.keepSel = idx; this.controls(); }; } }));
      items.push({ label: 'Reset to defaults', fn: () => { G.resetKeys(); this.keepSel = G.BINDABLE.length; this.controls(); } }, { label: 'Back', fn: () => { this.keepSel = 2; this.settings(); } });
      this.menu('dim controls', '<h2>Controls</h2>', items,
        '<div class="keys">Controller: A jump · B roll · X slash · Y heavy · LB interact · RB block · LT flask · RT tincture · D-pad up change weapon · D-pad down drop · Select quests · Start pause</div>', 'grid');
      if (waiting) { const bs = this.btns(); bs.forEach(b => (b.disabled = true)); const w = bs[G.BINDABLE.findIndex(b => b[0] === waiting)]; if (w) { w.disabled = false; w.classList.add('sel'); } }
      this.advance = () => { this.keepSel = 2; this.settings(); }; this.escAdvance = !waiting;
    },
    slides(pages, done, title) {
      let i = 0;
      const next = () => {
        if (i >= pages.length) { this.clear(); done(); return; }
        G.sfx('page');
        this.show(`<div class="screen black">${title ? `<h2>${esc(title)}</h2>` : ''}<div class="slide">${esc(pages[i++])}</div><div class="hint">press ${esc(G.keyName('use'))} / Enter / tap</div></div>`, next);
      };
      next();
    },
    dialogue(lines, done) {
      let i = 0, timer = null, shown = 0, full = '';
      const next = () => {
        if (timer && shown < full.length) { shown = full.length; el().querySelector('.txt').textContent = full; return; }
        clearInterval(timer);
        if (i >= lines.length) { this.clear(); if (done) done(); return; }
        const [who, text] = lines[i++]; full = text; shown = 0;
        const wist = who === 'Misery'; let n = 0;
        if (wist) G.sfx('chime');
        this.show(`<div class="dialogue${wist ? ' wist' : ''}"><div class="who">${esc(who)}</div><div class="txt"></div><div class="more">▼ ${esc(G.keyName('use'))}</div></div>`, next);
        const t = el().querySelector('.txt');
        timer = setInterval(() => { shown = Math.min(full.length, shown + 2); if (n++ % 2 === 0 && shown < full.length) G.sfx('blip', wist ? 1100 : who === 'Knight' ? 150 : 200); if (t.isConnected) t.textContent = full.slice(0, shown); if (shown >= full.length || !t.isConnected) clearInterval(timer); }, 22);
      };
      next();
    },
    note(title, text, done) {
      G.sfx('page');
      this.show(`<div class="screen dim"><div class="note"><h3>${esc(title)}</h3>${esc(text)}</div><div class="hint">press ${esc(G.keyName('use'))} / Enter / tap</div></div>`, () => { this.clear(); if (done) done(); });
    },
    shrine() {
      const g = G.game, p = g.player, s = p.stats, cost = g.levelCost();
      const up = k => () => { g.ichor -= cost; s[k]++; p.hp = p.maxHp; p.st = p.maxSt; G.sfx('heal'); g.save(); this.shrine(); };
      const poor = g.ichor < cost;
      this.menu('dim', `<h2>Vigil Candle</h2><div class="ichor">Ichor ${g.ichor} &nbsp;·&nbsp; next blessing costs ${cost}</div>`, [
        { label: `Vigor ${s.vig} <small>— more life</small>`, fn: up('vig'), off: poor },
        { label: `Strength ${s.str} <small>— deeper cuts</small>`, fn: up('str'), off: poor },
        { label: `Endurance ${s.end} <small>— more stamina</small>`, fn: up('end'), off: poor },
        { label: `Weapon arts <small>— ${g.marks || 0} mark${(g.marks || 0) === 1 ? '' : 's'} to spend</small>`, fn: () => this.weaponArts() },
        { label: `Misery's gifts <small>— ${g.misery.thorns} thorn${g.misery.thorns === 1 ? '' : 's'} to give</small>`, fn: () => this.miseryTree() },
        { label: 'Rise', fn: () => this.clear() },
      ], '<div class="keys">Resting restores your flasks — but not your blood. The infected never rest; more will have wandered in.</div>');
      this.advance = () => this.clear(); this.escAdvance = true;
    },
    // Dunstan's forge and Fenwick's cart. Each purchase redraws the menu with the new prices.
    // Misery's gift tree: three branches, each gift needing the one above it.
    miseryTree(keep = 0) {
      const g = G.game, m = g.misery, T = G.MISERY_TREE, items = [];
      for (let tier = 0; tier < 3; tier++) for (const br of T) {
        const n = br.nodes[tier], got = m.got[n.id], open = tier === 0 || m.got[br.nodes[tier - 1].id], can = !got && open && m.thorns >= n.cost;
        items.push({ label: `<b>${got ? '✦ ' : ''}${n.name}</b> <span class="cost">${got ? 'given' : n.cost + ' thorn' + (n.cost > 1 ? 's' : '')}</span><small>${open || got ? n.how : 'Give the gift above it first.'}</small>`,
          off: !can, cls: got ? 'got' : open ? '' : 'locked', fn: () => { const i = items.findIndex(x => x.n === n); if (g.buyGift(n)) { this.keepSel = i; this.miseryTree(); g.fairy.sayLine(G.pick(G.FAIRY.gift)); } }, n });
      }
      items.push({ label: 'Back to the candle', fn: () => this.shrine() });
      const heads = T.map(b => `<div><b>${b.name}</b><small>${b.blurb}</small></div>`).join('');
      this.menu('dim', `<h2>Misery's Gifts</h2><div class="ichor">${m.thorns} thorn${m.thorns === 1 ? '' : 's'} &nbsp;·&nbsp; one for every execution, four for a boss</div><div class="treehead">${heads}</div>`, items,
        '<div class="keys">She stings whatever fights you. Feed her thorns and she gets worse at it — for them.</div>', 'tree');
      this.advance = () => this.shrine(); this.escAdvance = true;
    },
    shop(kind) {
      const g = G.game, p = g.player, back = { label: 'Leave', fn: () => this.clear() };
      let head, items;
      if (kind === 'forge') {
        const COST = [300, 700, 1300];
        items = g.weapons.map(id => {
          const lv = g.weaponLv[id] || 0, w = G.WEAPONS[id], cost = COST[lv];
          if (lv >= 3) return { label: `${w.name} +3 <small>— nothing left to fold in</small>`, off: true, fn: () => {} };
          return { label: `Reforge ${w.name}${lv ? ' +' + lv : ''} to +${lv + 1} <small>— ${cost} ichor</small>`, off: g.ichor < cost,
            fn: () => { if (g.spend(cost)) { g.weaponLv[id] = lv + 1; G.sfx('block'); G.sfx('sever'); g.save(); this.shop(kind); } } };
        });
        head = `<h2>Dunstan's Forge</h2><div class="ichor">Ichor ${g.ichor} &nbsp;·&nbsp; each fold: 15% deeper cuts</div>`;
      } else {
        const fl = g.bought.flask || 0, vi = g.bought.vial || 0, FLASK = [900, 1600];
        items = [
          { label: `Lily tincture <small>— refills one vial · 140 ichor</small>`, off: g.ichor < 140 || p.tinct >= p.tinctMax,
            fn: () => { if (g.spend(140)) { p.tinct++; G.sfx('gulp'); this.shop(kind); } } },
          fl < 2 ? { label: `A spare flask <small>— one more flask, for good · ${FLASK[fl]} ichor</small>`, off: g.ichor < FLASK[fl],
            fn: () => { if (g.spend(FLASK[fl])) { g.bought.flask = fl + 1; p.stats.flask = (p.stats.flask || 0) + 1; p.flasks++; G.sfx('heal'); g.save(); this.shop(kind); } } }
            : { label: 'A spare flask <small>— sold out</small>', off: true, fn: () => {} },
          vi < 1 ? { label: `A spare vial <small>— one more tincture vial, for good · 1400 ichor</small>`, off: g.ichor < 1400,
            fn: () => { if (g.spend(1400)) { g.bought.vial = 1; p.stats.tinct = (p.stats.tinct || 0) + 1; p.tinct++; G.sfx('heal'); g.save(); this.shop(kind); } } }
            : { label: 'A spare vial <small>— sold out</small>', off: true, fn: () => {} },
        ];
        head = `<h2>Fenwick's Cart</h2><div class="ichor">Ichor ${g.ichor} &nbsp;·&nbsp; tinctures ${p.tinct} / ${p.tinctMax} &nbsp;·&nbsp; flasks ${p.flaskMax}</div>`;
      }
      this.menu('dim', head, items.concat([back]));
      this.advance = () => this.clear(); this.escAdvance = true;
    },
    journal() {
      const Q = G.questLog, order = { active: 0, done: 1, failed: 2 }, label = { active: 'in progress', done: 'complete', failed: 'failed' };
      const ids = Q.ids().sort((a, b) => (G.QUESTS[b].main ? 1 : 0) - (G.QUESTS[a].main ? 1 : 0) || order[Q.state[a].status] - order[Q.state[b].status]);
      const html = ids.map(id => {
        const d = G.QUESTS[id], q = Q.state[id];
        const steps = d.steps.map((s, i) => {
          const cls = q.status === 'done' || i < q.step ? 'done' : i === q.step ? (q.status === 'failed' ? 'fail' : 'cur') : 'todo';
          const hidden = d.main && cls === 'todo';
          return `<li class="${cls}">${cls === 'done' ? '✔' : cls === 'cur' ? '◆' : cls === 'fail' ? '✖' : '◇'} ${hidden ? '...' : esc(cls === 'cur' ? Q.text(id, i) : s.text)}</li>`;
        }).join('');
        return `<div class="quest ${q.status}"><h3>${esc(d.title)} <small>${label[q.status]}</small></h3><ul>${steps}</ul></div>`;
      }).join('') || '<div class="sub">Nothing is asked of you yet.</div>';
      const g = G.game, ab = Object.keys(G.ABILITIES).filter(k => g.abilities[k]).map(k => G.ABILITIES[k].name).concat(g.weapons.includes('greataxe') ? ["Headsman's Greataxe (breaks bars)"] : []);
      const mem = Object.keys(G.MEMORIES).filter(k => g.flags['mem_' + k]);
      const memHtml = `<div class="found">Remembrances <b>${mem.length} / ${Object.keys(G.MEMORIES).length}</b>${g.flags.named ? ` &nbsp;·&nbsp; Your name is <b>${esc(G.NAME)}</b>` : mem.length ? ': ' + mem.map(k => esc(G.MEMORIES[k].title.replace('Remembrance: ', ''))).join(', ') : ' &nbsp;·&nbsp; <small>somewhere, the road still has your name</small>'}</div>`;
      const found = `<div class="found">Weeping icons <b>${g.items.icon || 0} / ${g.iconTotal()}</b> &nbsp;·&nbsp; Tools: ${ab.length ? ab.map(esc).join(', ') : 'none yet'}</div>` + memHtml;
      this.show(`<div class="screen dim journal"><h2>Quests</h2>${found}<div class="quests">${html}</div><div class="hint">Tab / Esc to close</div></div>`, () => this.clear());
      this.escAdvance = true; G.sfx('page');
    },
    choice(prompt, opts) {
      this.menu('dim', `<h2>${esc(prompt)}</h2>`, opts.map(o => ({ label: o.label, fn: () => { this.clear(); o.fn(); } })));
      this.grace = 1.2;
    },
    death(lost, done, quote, n, turned) {
      const wist = quote ? `<div class="wistq">“${esc(quote)}”<br><small>— Misery has watched you die ${n === 1 ? 'once' : n + ' times'}.</small></div>` : '';
      this.show(`<div class="screen dim"><h1 style="font-size:3em${turned ? ';color:#c04ad0' : ''}">${turned ? 'TURNED' : 'UNMADE'}</h1><div class="sub">${turned ? 'The infection took you. ' : ''}${lost ? `${lost} ichor lies where you fell.` : 'The vow remains.'}</div>${wist}<div class="hint">press ${esc(G.keyName('use'))} / Enter / tap</div></div>`, () => { this.clear(); done(); });
    },
  };
})();
