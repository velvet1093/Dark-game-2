'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — the Blind Deep, a mine under the Pilgrims' Pass that went too far.
//
// There is no light down here but Misery's. In the dark she goes ahead of the
// knight, and the dark eats at her: her circle shrinks the longer he is down
// here, and grows back only at the glowcaps, clusters of pale cave-fungus the
// miners left their marks by. Let it go out and the dark gets into him.
// Blind things live here. The biggest of them hates the light most.
// ---------------------------------------------------------------------------
(() => {
  const A = G.ANIM;
  G.LOOKS.dagna = { soft: 1, skin: '#b8aca0', body: '#3a3430', arm: '#3a3430', leg: '#2a2622', helm: 'hood', helmCol: '#4a4038', hair: '#c8c4bc', eye: '#e8e4dc' };
  Object.assign(G.ENEMIES, {
    lurker: {
      name: 'Lurker in the Deep', hp: 70, limbHp: 28, speed: 96, ichor: 55, aggro: 300, weapon: 'none', hunch: 0.45, glowEyes: true,
      look: { skin: '#d8d0c8', body: '#5a524a', arm: '#d8d0c8', leg: '#4a423a', helm: 'none', eye: '#9ae8ff' },
      attacks: [
        { wind: 0.36, active: 0.1, rec: 0.45, dmg: 15, reach: 54, lunge: 170, anim: A.claw },
        { wind: 0.5, active: 0.14, rec: 0.6, dmg: 19, reach: 72, trigger: 150, min: 70, lunge: 420, anim: A.claw },   // out of the dark, all at once
      ],
    },
    blindbat: {
      name: 'Blind Bat', model: 'crow', fly: true, hp: 24, limbHp: 10, speed: 170, ichor: 15, aggro: 340, stop: 110, weapon: 'none', height: 26, limbs: ['head', 'armF', 'armB'], glowEyes: true,
      look: { skin: '#2a2224', body: '#2a2224', arm: '#3a3034', leg: '#2a2224', helm: 'none', eye: '#9ae8ff' },
      attacks: [{ wind: 0.4, active: 0.2, rec: 0.7, dmg: 9, reach: 50, trigger: 200, min: 40, lunge: 520, anim: A.claw }],
    },
    lightless: {
      name: 'The Lightless', boss: true, hp: 560, limbHp: 150, speed: 70, ichor: 1300, aggro: 9999, weapon: 'none', scale: 1.55, poise: true, hunch: 0.35, glowEyes: true,
      noSever: ['armF', 'legF', 'legB'], shout: 'PUT OUT THE LIGHT',
      summon: { type: 'lurker', at: [0.7, 0.35], n: 2, text: 'THE DARK STIRS' },
      look: { skin: '#e0d8d0', body: '#4a4440', trim: '#2a2624', arm: '#e0d8d0', leg: '#3a3430', helm: 'none', eye: '#9ae8ff' },
      attacks: [
        { wind: 0.45, active: 0.12, rec: 0.55, dmg: 26, reach: 92, lunge: 200, anim: A.claw },
        { wind: 0.7, active: 0.18, rec: 0.8, dmg: 32, reach: 110, trigger: 300, min: 120, lunge: 680, anim: A.claw },
        { wind: 0.9, active: 0.5, rec: 0.7, dmg: 0, reach: 0, trigger: 260, min: 40, lunge: 0, horn: true, anim: A.claw },   // it breathes on the light
      ],
    },
  });
  G.ICON_NAMES.push('The Saint Who Went Down', 'The Saint With the Miner\'s Lamp');
  G.BESTIARY_EXTRA = G.BESTIARY_EXTRA || { foes: [], bosses: [], people: [] };
  G.BESTIARY_EXTRA.foes.push(
    ['lurker', 'Miners, once, from the dig under the Pass. Three generations in the dark have taken their colour and their eyes. They hunt by sound, and come at a run.', 'In the dark you see only their eyes. Watch for two pale points, close together, getting closer.'],
    ['blindbat', 'They hang from the roof in thousands and drop on anything warm.', 'Keep the light high, and they come at you in the open.'],
  );
  G.BESTIARY_EXTRA.bosses.push(['lightless', 'The first of the miners to go blind, and the last to forget the sun. It hates light the way a burned man hates fire.', 'It breathes on Misery\'s light and puts it out. Get back to a glowcap.']);
  G.BESTIARY_EXTRA.people.push({ id: 'dagna', name: 'Dagna the Lamp-Woman', look: 'dagna', text: 'She carried the lamps for the miners for forty years. Her own went out a long time ago. She stays anyway, by the fungus, and listens for them.' });

  // ---- the way in: a crack in the mountain, part-way up the Pass
  const CV = G.LEVELS.length, PASS = G.LEVELS.findIndex(l => l.boss && l.boss.type === 'windcaller');
  G.LEVELS[PASS].passages = (G.LEVELS[PASS].passages || []).concat([{ x: 3540, to: CV, at: 120, label: 'Go down into the old mine',
    wist: 'Dark. Properly dark. Oh, you are going to need me SO much in there.',
    slides: ['A crack in the mountain, timbered up by men who are long gone, and a ladder going down.\n\nAt the bottom there is no light at all. Then Misery comes down the ladder after you, glowing, and the dark moves back from her a few feet, as if it had been touched.'] }]);

  const GLOW = [380, 1080, 1700, 2350, 2950, 3560, 4300, 4700];   // the glowcaps
  G.LEVELS.push({
    name: 'The Blind Deep', chapter: 'Under the Pilgrims\' Pass', theme: 'cave', length: 5000, seed: 251,
    back: { to: PASS, at: 3600 }, backLabel: 'Climb the ladder back to the Pass',
    shrines: [240, 2600],
    enemies: [['lurker', 760], ['blindbat', 980], ['blindbat', 1020], ['lurker', 1400], ['lurker', 1460], ['blindbat', 1900], ['lurker', 2150], ['lurker', 2800], ['blindbat', 3150], ['blindbat', 3190], ['lurker', 3350], ['lurker', 3420], ['lurker', 3850], ['blindbat', 3950, 'unfair'], ['lurker', 4000, 'unfair']],
    npcs: [{ id: 'dagna', x: 1760, name: 'Dagna the Lamp-Woman', look: 'dagna', pose: 'kneel', essential: true,
      lines: [
        ['Dagna', 'Light. Oh, light. Do not bring it any closer, love, my eyes have forgotten what it is for. ...No. Closer. Just a little.'],
        ['Dagna', 'I carried the lamps for the dig. Forty years. They dug for silver and found a seam that went down, and down, and the deeper they went the less they wanted to come up.'],
        ['Dagna', 'Then the lamps started going out. Not the oil: the light. The dark here eats it. It ate my lamp, and then my eyes, and it ate the men a bit at a time.'],
        ['Knight', 'How do I get through?'],
        ['Dagna', 'Keep your little light fed. The pale fungus, the glowcaps, the men marked their way by them. Stand by one and your light drinks from it.'],
        ['Dagna', 'And do not let it go out. If it goes out, the dark gets into you. You will feel it in your blood.'],
        ['Misery', 'Did you hear that? I am VITAL. I am the most important thing in this entire hole. Say it.'],
        ['Dagna', 'At the bottom is Old Brann. First of them to go blind. He hates the light worse than any of them. He will try to put yours out.'],
      ],
      repeat: [['Dagna', 'Feed your light at the glowcaps. Do not let it go out.']] }],
    lore: [
      { x: 620, title: 'Chalked on a Timber', text: 'SHIFT TALLY\n\nDown: 14\nUp: 14\n\nThe next row:\nDown: 14\nUp: 11\n\nThe rows go on. The second number gets smaller.' },
      { x: 2250, title: 'A Foreman\'s Note', text: 'Lamps going out again on the lower seam. Not the oil. Checked it twice. They burn, but they light nothing.\n\nThe men say they can hear singing in the rock. I have told them it is the water.\n\nI can hear it too.' },
      { x: 3700, title: 'Scratched by Touch', text: 'Letters cut deep and crooked, by someone who could not see them.\n\nI REMEMBER THE SUN. IT WAS YELLOW. I REMEMBER IT WAS YELLOW.' },
    ],
    items: [{ x: 4880, relic: 1, relicName: 'Relic of the Last Lamp', needs: 'boss_lightless_dead' }, { x: 1320, alt: 140, relic: 1, relicName: 'Relic of the Blind Seam' }, { x: 2050, icon: 1 }, { x: 3260, alt: 72, icon: 1 }, { x: 3000, cache: 340 }],
    platforms: [{ x: 1240, w: 140, h: 72 }, { x: 1290, w: 70, h: 140 }, { x: 3200, w: 120, h: 72 }],
    pits: [{ x: 1150, w: 70 }, { x: 1950, w: 74 }, { x: 2700, w: 70 }, { x: 3780, w: 74 }],
    boss: {
      type: 'lightless', gate: 4200, x: 4560, end: 4880,
      intro: [
        ['Misery', 'Something is breathing. Something big. Over there, where I cannot reach.'],
        ['The Lightless', '...Light. Who brought light down. Who brought it HERE.'],
        ['Knight', 'Brann. Dagna is still waiting for you.'],
        ['The Lightless', 'Dagna. ...She had a lamp. I put it out. I put them ALL out. It is the only thing that stops the hurting. PUT IT OUT.'],
      ],
      retry: [['The Lightless', 'Still burning. Still. BURNING.']],
      lastWords: [['The Lightless', 'Yellow. It was... yellow.'], ['Misery', '...I could be yellow. For a moment. If it would help.']],
      spare: { kind: 'yield', lines: [
        ['Knight', 'Look at it, Brann. It does not hurt. Look.'],
        ['The Lightless', 'It turns its blind white face up towards Misery, a long time, the way a plant turns to a window.'],
        ['The Lightless', '...Warm. It was warm. I had forgotten that it was warm.'],
        ['The Lightless', 'It goes back into the dark on its hands and knees, slowly, towards the place where Dagna sits, and does not come back.'],
      ] },
    },
  });

  // ---- the light
  const cave = G.cave = {
    light: 1, flare: 0, warned: false, darkT: 0,
    radius(g) { return 64 + 170 * this.light + this.flare * 420; },
    reset() { this.light = 1; this.flare = 0; this.warned = false; },
  };
  const here = g => g.levelIdx === CV && !g.inside;
  G.EXTRA_DRAW = (G.EXTRA_DRAW || []).concat([(ctx, g, t) => {
    if (!here(g)) { G.lightsNow = null; cave.key = null; return; }
    const key = g.levelIdx + ':' + (g.flags.deaths || 0) + ':' + (g.cp && g.cp.x); if (cave.key !== key) { cave.key = key; cave.reset(); }   /* a fresh light each time down, and after each death */
    const dt = 1 / 60, p = g.player, gy = G.GROUND, cam = g.cam, lights = [];
    const live = g.mode === 'play' && !G.ui.blocking && !p.dead;
    if (live) {
      const nearCap = GLOW.some(x => Math.abs(p.x - x) < 56);
      if (nearCap) { if (cave.light < 0.98 && Math.random() < 0.2) G.sfx('chime'); cave.light = Math.min(1, cave.light + dt * 0.9); cave.warned = false; }
      else cave.light = Math.max(0, cave.light - dt / (g.bossFight ? 30 : 48));
      cave.flare = Math.max(0, cave.flare - dt * 0.8);
      if (cave.light <= 0.02) {   // gone out: the dark gets in
        cave.darkT += dt; if (p.infect) p.infect(dt * 5, g);
        if (!cave.warned) { cave.warned = true; g.fairy.sayLine('I am going OUT. Glowcap. GLOWCAP. Now.'); G.sfx('growl'); }
      } else if (cave.light < 0.25 && !cave.warned && Math.random() < dt * 0.5) g.fairy.sayLine('I am getting smaller. I do not like getting smaller.');
      // the Lightless breathes on her
      const B = g.boss; if (B && !B.dead && B.atk && B.atk.horn && B.state === 'strike' && !B._breathed) { B._breathed = true; cave.light = Math.min(cave.light, 0.12); G.text(B.x, gy - 190, 'IT BREATHES ON THE LIGHT', '#9ae8ff', 16); G.sfx('whoosh'); g.shake = 6; }
      if (B && B.state !== 'strike') B._breathed = false;
    }
    // the glowcaps: pale blue-green fungus, a few feet of light round each
    for (const [k, x] of GLOW.entries()) {
      const sx = x - cam; if (sx < -120 || sx > G.W + 120) continue;
      const pul = 0.8 + Math.sin(t * 1.7 + k) * 0.15, gl = ctx.createRadialGradient(x, gy - 12, 2, x, gy - 12, 60); gl.addColorStop(0, `rgba(120,240,210,${0.45 * pul})`); gl.addColorStop(1, 'rgba(120,240,210,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 60, gy - 72, 120, 90);
      for (let m = 0; m < 6; m++) { const mx = x - 22 + m * 8 + (m % 2) * 3, h = 6 + ((k * 7 + m * 5) % 10); ctx.fillStyle = '#7ab8b0'; ctx.fillRect(mx, gy - h, 2, h); ctx.fillStyle = m % 2 ? '#a8fff0' : '#78e8d0'; ctx.fillRect(mx - 3, gy - h - 3, 8, 3); ctx.fillRect(mx - 2, gy - h - 4, 6, 1); }
      lights.push({ x: sx, y: gy - 20, r: 110 * pul, a: 0.8 });
    }
    for (const x of g.level.shrines) lights.push({ x: x - cam, y: gy - 60, r: 120, a: 0.75 });   // the vigil candles
    for (const e of g.enemies) {   // the blind things' eyes: two pale points in the black
      const hd = e.def.model ? [e.x, G.GROUND - (e.alt || 0) - (e.def.height || 30) * 0.7] : e.out && e.out.head; if (e.dead || !e.def.glowEyes || !hd || e.buried > 0) continue;
      const [hx, hy] = hd, sx = hx - cam; if (sx < -40 || sx > G.W + 40) continue;
      lights.push({ x: sx, y: hy, r: 16 * e.scale, a: 0.9 });
    }
    if (g.fairy.say) lights.push({ x: g.fairy.x - cam, y: g.fairy.y - 46, r: 120, a: 0.9 });   // so what she says can be read
    if (cave.flare > 0) lights.push({ x: g.fairy.x - cam, y: g.fairy.y, r: 60 + cave.flare * 500, a: 0.95 });
    G.lightsNow = lights;
  }]);

  // the meter: Misery's light, under the infection bar, while down here
  G.EXTRA_HUD = (G.EXTRA_HUD || []).concat([(ctx, g) => {
    if (!here(g)) return;
    const w = 130, x = 262, y = 55, k = cave.light, low = k < 0.25;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 2, y - 2, w + 4, 8);
    ctx.fillStyle = low ? `rgba(160,220,255,${0.6 + Math.sin(g.time * 10) * 0.3})` : '#bfe8f4'; ctx.fillRect(x, y, Math.round(w * k), 4);
    ctx.font = '12px "Jersey 15", "VT323", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#9ac8d8'; ctx.fillText('MISERY\'S LIGHT', x + w + 8, y + 5);
  }]);

  // ---- the Lightless dies in the light: held, and Misery flares in its face
  const BASE = { armA: 0.2, armE: 0.3, w: 0.6, lean: 0, crouch: 0, footF: 12, footB: -10, bA: 0.2, bE: 0.9, head: 0 };
  const K = (t, o) => [t, o];
  G.EXECS.flare = { dur: 2.2, hits: [0.45, 1.5], text: 'THE LIGHT WINS',
    keys: [K(0, BASE), K(0.3, { armA: 1.6, armE: 0.2, bA: 1.5, bE: 0.2, lean: 0.3 }), K(0.45, { armA: 1.7, armE: 0.2, bA: 1.6, bE: 0.2, lean: 0.35 }), K(1.2, { armA: 1.7, armE: 0.2, bA: 1.6, bE: 0.2, lean: 0.25 }),
      K(1.36, { armA: 2.6, armE: 1.4, w: 0.9, lean: -0.2 }), K(1.5, { armA: 1.15, armE: 0.1, w: 1.15, lean: 0.5 }), K(1.9, { armA: 1.15, armE: 0.1, w: 1.15, lean: 0.5 }), K(2.2, BASE)],
    mid: (g, e) => { cave.flare = 1; cave.light = 1; G.sfx('cleanse'); G.sfx('scream'); g.shake = 10; g.hitstop = 0.12; G.text(e.x, G.GROUND - 170 * e.scale / 1.4, 'MISERY FLARES', '#e8fbff', 18); g.fairy.sayLine('LOOK AT ME.'); },
    fin: (g) => { G.sfx('bell'); g.slow = 0.7; },
  };
  const EK = G.execKindFor;
  G.execKindFor = (e, p) => e.type === 'lightless' ? { kind: 'flare', text: 'THE LIGHT WINS' } : EK(e, p);
})();
