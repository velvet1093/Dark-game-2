'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — DOM overlays: title, story slides, dialogue, notes, menus
// ---------------------------------------------------------------------------
(() => {
  const el = () => document.getElementById('overlay');
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>');
  const KEYS = `<div class="keys"><b>A</b> <b>D</b> move &nbsp; <b>J</b> / click slash &nbsp; <b>K</b> / right-click heavy &nbsp; <b>Space</b> roll<br>
    <b>L</b> / <b>Shift</b> block &nbsp; <b>Q</b> flask &nbsp; <b>E</b> interact · execute &nbsp; <b>Esc</b> pause &nbsp; <b>M</b> mute</div>`;

  const ui = G.ui = {
    blocking: false, advance: null, options: null,
    clear() { el().innerHTML = ''; this.blocking = false; this.advance = null; this.options = null; },
    // Called once per frame while an overlay is up.
    handle() {
      const I = G.input;
      if (this.options) { for (let i = 0; i < this.options.length; i++) if (I.hit('opt' + (i + 1))) { this.options[i](); return; } }
      if (this.advance && (I.hit('confirm') || I.hit('use') || I.hit('roll') || (this.escAdvance && I.hit('pause')))) this.advance();
    },
    show(html, advance, options) {
      el().innerHTML = html; this.blocking = true; this.advance = advance || null; this.options = options || null; this.escAdvance = false;
      el().querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); G.audioInit(); options[+b.dataset.opt](); }));
      if (advance) el().firstElementChild.addEventListener('click', () => { G.audioInit(); if (this.advance) this.advance(); });
    },
    menu(cls, head, items, foot = '') {
      const btns = items.map((it, i) => `<button class="btn" data-opt="${i}" ${it.off ? 'disabled' : ''}>${i + 1}. ${it.label}</button>`).join('');
      this.show(`<div class="screen ${cls}">${head}${btns}${foot}</div>`, null, items.map(it => () => { if (!it.off) { G.sfx('ui'); it.fn(); } }));
    },

    title(hasSave) {
      const items = [{ label: 'Take the Vow <small>(new game)</small>', fn: () => G.game.newGame() }];
      if (hasSave) items.unshift({ label: 'Resume the Vigil <small>(continue)</small>', fn: () => G.game.continueGame() });
      this.menu('', '<h1>ASHEN VOW</h1><div class="sub">a tale of the Weeping Year</div>', items, KEYS);
    },
    pause() {
      this.menu('dim', '<h2>Paused</h2>', [
        { label: 'Return to the road', fn: () => this.clear() },
        { label: 'Abandon to title', fn: () => G.game.toTitle() },
      ], KEYS);
      this.advance = () => this.clear(); this.escAdvance = true;
    },
    slides(pages, done, title) {
      let i = 0;
      const next = () => {
        if (i >= pages.length) { this.clear(); done(); return; }
        G.sfx('page');
        this.show(`<div class="screen black">${title ? `<h2>${esc(title)}</h2>` : ''}<div class="slide">${esc(pages[i++])}</div><div class="hint">press E / Enter / tap</div></div>`, next);
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
        const wist = who === 'Wist'; let n = 0;
        if (wist) G.sfx('chime');
        this.show(`<div class="dialogue${wist ? ' wist' : ''}"><div class="who">${esc(who)}</div><div class="txt"></div><div class="more">▼ E</div></div>`, next);
        const t = el().querySelector('.txt');
        timer = setInterval(() => { shown = Math.min(full.length, shown + 2); if (n++ % 2 === 0 && shown < full.length) G.sfx('blip', wist ? 1100 : who === 'Aldric' ? 150 : 200); if (t.isConnected) t.textContent = full.slice(0, shown); if (shown >= full.length || !t.isConnected) clearInterval(timer); }, 22);
      };
      next();
    },
    note(title, text, done) {
      G.sfx('page');
      this.show(`<div class="screen dim"><div class="note"><h3>${esc(title)}</h3>${esc(text)}</div><div class="hint">press E / Enter / tap</div></div>`, () => { this.clear(); if (done) done(); });
    },
    shrine() {
      const g = G.game, p = g.player, s = p.stats, cost = g.levelCost();
      const up = k => () => { g.ichor -= cost; s[k]++; p.hp = p.maxHp; p.st = p.maxSt; G.sfx('heal'); g.save(); this.shrine(); };
      const poor = g.ichor < cost;
      this.menu('dim', `<h2>Vigil Candle</h2><div class="ichor">Ichor ${g.ichor} &nbsp;·&nbsp; next blessing costs ${cost}</div>`, [
        { label: `Vigor ${s.vig} <small>— more life</small>`, fn: up('vig'), off: poor },
        { label: `Strength ${s.str} <small>— deeper cuts</small>`, fn: up('str'), off: poor },
        { label: `Endurance ${s.end} <small>— more stamina</small>`, fn: up('end'), off: poor },
        { label: 'Rise', fn: () => this.clear() },
      ], '<div class="keys">Resting restores your flasks — and returns the dead to their feet.</div>');
      this.advance = () => this.clear(); this.escAdvance = true;
    },
    choice(prompt, opts) {
      this.menu('dim', `<h2>${esc(prompt)}</h2>`, opts.map(o => ({ label: o.label, fn: () => { this.clear(); o.fn(); } })));
    },
    death(lost, done, quote, n) {
      const wist = quote ? `<div class="wistq">“${esc(quote)}”<br><small>— Wist has watched you die ${n === 1 ? 'once' : n + ' times'}.</small></div>` : '';
      this.show(`<div class="screen dim"><h1 style="font-size:3em">UNMADE</h1><div class="sub">${lost ? `${lost} ichor lies where you fell.` : 'The vow remains.'}</div>${wist}<div class="hint">press E / Enter / tap</div></div>`, () => { this.clear(); done(); });
    },
  };
})();
