window.RA = window.RA || {};

RA.Game = (function () {
  const C = RA.CONFIG, U = RA.U;
  const t = (k, v) => RA.i18n.t(k, v);
  let s = null;

  function newGame(diff) {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const rng = U.makeRng(seed);
    const world = RA.World.generate(rng);
    const cfg = C.DIFFICULTY[diff] || C.DIFFICULTY.normal;

    const stormTimes = [];
    let tt = 140 + rng() * 80;
    for (let i = 0; i < cfg.storms; i++) { stormTimes.push(tt); tt += 250 + rng() * 150; }
    const events = U.shuffle(RA.NASA.events.slice(), rng);
    if (RA.NASA.liveEvent) events.unshift(RA.NASA.liveEvent);

    const start = { x: world.base.x, y: world.base.y - 40 };
    s = {
      diff, cfg, rng, world,
      player: { x: start.x, y: start.y, facing: Math.PI / 2, moving: false, running: false, walkT: 0 },
      res: { o2: C.START.o2, energy: C.START.energy, health: C.START.health },
      alien: { steps: 0, x: start.x, y: start.y - 600, angle: rng() * Math.PI * 2, pulse: 0 },
      time: { elapsed: 0, solT: 0.03, sol: 1, wasDay: true },
      scan: { t: 0, target: null },
      call: { t: 0, target: null },
      storm: { phase: 'none', t: 0, event: null, delay: 0, idx: 0, times: stormTimes, events, hitThis: false },
      seenQ: new Set(),
      stats: { correct: 0, wrong: 0, stormHits: 0, storms: 0, minO2: 100, maxAlien: 0, facts: [] },
      streak: 0,
      mode: 'modal',
      shake: 0,
      warnCd: { o2: 0, health: 0 },
      inBase: false, nearShip: false, inCave: false, inShelter: false,
      launchT: 0,
      endReason: null
    };
    return s;
  }

  function get() { return s; }
  function partsCollected() { return s.world.parts.filter(p => p.collected).length; }
  function isDay() { return s.time.solT < C.DAY_FRACTION; }

  function daylight() {
    const f = s.time.solT, D = C.DAY_FRACTION, r = 0.04;
    if (f < r) return f / r;
    if (f < D - r) return 1;
    if (f < D) return (D - f) / r;
    return 0;
  }

  function clockText() {
    const f = s.time.solT, D = C.DAY_FRACTION;
    let h = f < D ? 6 + (f / D) * 12.5 : 18.5 + ((f - D) / (1 - D)) * 12.16;
    h = h % 24;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function advanceSol(dtFraction) {
    s.time.solT += dtFraction;
    while (s.time.solT >= 1) {
      s.time.solT -= 1;
      s.time.sol++;
      RA.UI.toast(t('newSol', { n: s.time.sol }));
    }
    const day = isDay();
    if (s.time.wasDay && !day) RA.UI.toast(t('nightFalls'));
    s.time.wasDay = day;
  }

  function update(dt) {
    if (!s) return;
    if (s.mode === 'launch') { updateLaunch(dt); return; }
    if (s.mode !== 'play') return;

    const P = s.player, W = s.world;
    s.time.elapsed += dt;
    advanceSol(dt / C.SOL_SECONDS);

    const ax = RA.Input.axis();
    const len = Math.hypot(ax.x, ax.y);
    const run = RA.Input.running();
    P.moving = len > 0;
    P.running = P.moving && run;
    if (P.moving) {
      const sp = C.PLAYER_SPEED * (run ? C.RUN_MULT : 1);
      P.x = U.clamp(P.x + ax.x / len * sp * dt, 60, C.WORLD_W - 60);
      P.y = U.clamp(P.y + ax.y / len * sp * dt, 60, C.WORLD_H - 60);
      P.facing = Math.atan2(ax.y, ax.x);
      P.walkT += dt * (run ? 14 : 9);
    }

    s.inBase = U.dist(P, W.base) < C.BASE_RADIUS;
    s.nearShip = U.dist(P, W.ship) < C.SHIP_RADIUS;
    s.inCave = W.caves.some(c => U.dist(P, c) < C.CAVE_RADIUS);
    s.inShelter = s.inBase || s.nearShip || s.inCave;

    if (!s.inBase && !s.nearShip) {
      const rate = P.moving ? s.cfg.o2Walk * (P.running ? C.RUN_O2_MULT : 1) : s.cfg.o2Idle;
      s.res.o2 = Math.max(0, s.res.o2 - rate * dt);
    }
    if (s.inBase && isDay()) s.res.energy = Math.min(100, s.res.energy + C.BASE_CHARGE_PER_S * dt);
    s.stats.minO2 = Math.min(s.stats.minO2, s.res.o2);

    s.warnCd.o2 -= dt; s.warnCd.health -= dt;
    if (s.res.o2 < 25 && !s.inBase && s.warnCd.o2 <= 0) { RA.UI.toast(t('lowO2'), 'warn'); s.warnCd.o2 = 15; }
    if (s.res.health < 25 && s.warnCd.health <= 0) { RA.UI.toast(t('lowHealth'), 'warn'); s.warnCd.health = 18; }

    updateCall(dt);
    if (s.scan.t > 0) {
      s.scan.t -= dt;
      if (s.scan.target && s.scan.target.collected) s.scan.t = 0;
    }
    if (RA.Input.consume('KeyE')) doScan();

    if (RA.Input.consume('Space') || RA.Input.consume('Enter')) {
      if (s.nearShip && partsCollected() === W.parts.length) { startLaunch(); return; }
      if (s.nearShip) RA.UI.toast(t('hintShipMissing', { n: W.parts.length - partsCollected() }));
      else if (s.inBase) { openBase(); return; }
    }
    if (RA.Input.consume('KeyP') || RA.Input.consume('Escape')) { openPause(); return; }

    updateAlien(dt);

    updateStorm(dt);
    if (checkDeath()) return;

    for (const p of W.parts) p.cool = Math.max(0, p.cool - dt);
    for (const tr of W.traps) tr.cool = Math.max(0, tr.cool - dt);
    for (const p of W.parts) {
      if (!p.collected && p.cool <= 0 && U.dist(P, p) < C.PART_RADIUS) { askQuestion('part', p); return; }
    }
    for (const tr of W.traps) {
      if (tr.active && tr.cool <= 0 && U.dist(P, tr) < C.TRAP_RADIUS) { askQuestion('trap', tr); return; }
    }

    if (s.shake > 0) s.shake = Math.max(0, s.shake - dt);
    if (s.alien.pulse > 0) s.alien.pulse = Math.max(0, s.alien.pulse - dt);
  }

  function alienDistance() {
    const k = (s.alien.steps - 1) / (C.ALIEN_STEPS - 1);
    return U.lerp(380, 70, U.clamp(k, 0, 1));
  }

  function updateAlien(dt) {
    const A = s.alien, P = s.player;
    if (A.steps <= 0) return;
    const behind = P.facing + Math.PI;
    let da = behind - A.angle;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    A.angle += da * Math.min(1, dt * 0.6) + Math.sin(s.time.elapsed * 0.7) * dt * 0.3;
    const D = alienDistance();
    const tx = P.x + Math.cos(A.angle) * D, ty = P.y + Math.sin(A.angle) * D;
    const k = Math.min(1, dt * (A.pulse > 0 ? 5 : 1.8));
    A.x += (tx - A.x) * k;
    A.y += (ty - A.y) * k;
  }

  function placeAlienFar() {
    const A = s.alien, P = s.player;
    A.x = P.x + Math.cos(A.angle) * 700;
    A.y = P.y + Math.sin(A.angle) * 700;
  }

  function checkCaught() {
    if (s.alien.steps < C.ALIEN_STEPS) return false;
    s.mode = 'modal';
    const collected = s.world.parts.filter(p => p.collected);
    let text;
    if (collected.length) {
      const part = collected[Math.floor(s.rng() * collected.length)];
      RA.World.rehidePart(s.world, part, s.rng);
      text = t('caughtText', { part: t('part_' + part.id) });
    } else {
      text = t('caughtTextNone');
    }
    s.player.x = s.world.base.x; s.player.y = s.world.base.y - 40;
    s.alien.steps = C.ALIEN_RESET_STEPS;
    placeAlienFar();
    RA.Audio.play('alien');
    RA.UI.showInfo(t('caughtTitle'), U.esc(text), () => { s.mode = 'play'; RA.Input.clear(); });
    return true;
  }

  function pickQuestion(topics) {
    const Q = RA.QUESTIONS;
    let maxL = s.cfg.maxLevel;
    let pool = [];
    while (maxL <= 3 && !pool.length) {
      pool = Q.filter(q => q.lvl <= maxL && !s.seenQ.has(q.id));
      if (!pool.length) maxL++;
    }
    if (!pool.length) { s.seenQ.clear(); pool = Q.filter(q => q.lvl <= s.cfg.maxLevel); }
    if (s.diff === 'hard') {
      const hp = pool.filter(q => q.lvl >= 2);
      if (hp.length) pool = hp;
    }
    if (topics) {
      const tp = pool.filter(q => topics.includes(q.topic));
      if (tp.length && s.rng() < 0.75) pool = tp;
    }
    const q = pool[Math.floor(s.rng() * pool.length)];
    s.seenQ.add(q.id);
    return q;
  }

  function pushBack(obj) {
    const P = s.player;
    let dx = P.x - obj.x, dy = P.y - obj.y;
    let d = Math.hypot(dx, dy);
    if (d < 1) { dx = -Math.cos(P.facing); dy = -Math.sin(P.facing); d = 1; }
    P.x = U.clamp(obj.x + dx / d * C.PUSHBACK, 60, C.WORLD_W - 60);
    P.y = U.clamp(obj.y + dy / d * C.PUSHBACK, 60, C.WORLD_H - 60);
  }

  function askQuestion(kind, obj) {
    s.mode = 'modal';
    RA.Input.clear();
    const region = obj.region ? RA.World.regionById(obj.region) : null;
    const q = pickQuestion(region ? region.topics : null);

    RA.UI.showQuestion(q, kind, kind === 'part' ? t('part_' + obj.id) : null, answerYes => {
      const correct = answerYes === q.a;
      const effects = [];
      let found = null;

      if (correct) {
        s.stats.correct++;
        s.streak++;
        const cost = kind === 'trap' ? C.TRAP_COST_CORRECT : C.PART_COST_CORRECT;
        s.res.energy = Math.max(0, s.res.energy - cost);
        effects.push({ cls: 'cost', text: t(kind === 'trap' ? 'disarmCost' : 'partCost', { n: cost }) });
        if (kind === 'trap') {
          obj.active = false;
        } else {
          obj.collected = true;
          found = obj;
          effects.push({ cls: 'good', text: t('found', { part: t('part_' + obj.id), n: partsCollected() }) });
          if (s.alien.steps > 0) { s.alien.steps--; effects.push({ cls: 'good', text: t('alienBack') }); }
        }
        if (s.streak >= C.STREAK_FOR_RETREAT) {
          s.streak = 0;
          if (s.alien.steps > 0) { s.alien.steps--; effects.push({ cls: 'good', text: t('alienBack') }); }
        }
        RA.Audio.play('correct');
      } else {
        s.stats.wrong++;
        s.streak = 0;
        s.res[q.pen.res] = Math.max(0, s.res[q.pen.res] - q.pen.n);
        effects.push({ cls: 'bad', text: t('penalty', { n: q.pen.n, res: t('res_' + q.pen.res) }) });
        if (s.alien.steps === 0) placeAlienFar();
        s.alien.steps = Math.min(C.ALIEN_STEPS, s.alien.steps + 1);
        s.stats.maxAlien = Math.max(s.stats.maxAlien, s.alien.steps);
        effects.push({ cls: 'bad', text: t('alienCloser') });
        pushBack(obj);
        obj.cool = 1.5;
        RA.Audio.play('wrong');
      }

      if (!s.stats.facts.includes(q.id)) s.stats.facts.push(q.id);

      RA.UI.showFact(q, correct, effects, () => {
        s.mode = 'play';
        RA.Input.clear();
        if (found) RA.Audio.play('pickup');
        if (!correct) { s.shake = 0.7; s.alien.pulse = 1.6; RA.Audio.play('alien'); }
        if (checkDeath()) return;
        checkCaught();
      });
    });
  }

  function doScan() {
    const remaining = s.world.parts.filter(p => !p.collected);
    if (!remaining.length) { RA.UI.toast(t('scanAll')); return; }
    if (s.res.energy < C.SCAN_COST) { RA.UI.toast(t('scanNo', { n: C.SCAN_COST }), 'warn'); return; }
    s.res.energy -= C.SCAN_COST;
    let best = null, bd = Infinity;
    for (const p of remaining) { const d = U.dist(s.player, p); if (d < bd) { bd = d; best = p; } }
    s.scan.t = C.SCAN_TIME;
    s.scan.target = best;
    RA.Audio.play('scan');
    RA.UI.toast(t('scanOn', { m: Math.round(bd) }));
  }

  function updateStorm(dt) {
    const st = s.storm;
    if (st.phase === 'none') {
      if (st.idx < st.times.length && s.time.elapsed >= st.times[st.idx]) {
        st.event = st.events[st.idx % st.events.length];
        const d = st.event.live ? new Date() : new Date(st.event.date + 'T12:00:00Z');
        st.delay = Math.max(3, Math.round(U.lightMinutes(d)));
        st.phase = 'warning';
        st.t = s.cfg.warnS;
        st.hitThis = false;
        RA.Audio.play('alarm');
      }
    } else if (st.phase === 'warning') {
      st.t -= dt;
      if (st.t <= 0) { st.phase = 'active'; st.t = C.STORM.durationS; RA.Audio.play('alarm'); }
    } else if (st.phase === 'active') {
      st.t -= dt;
      if (!s.inShelter) {
        s.res.health = Math.max(0, s.res.health - C.STORM.damagePerS * s.cfg.damageMult * dt);
        st.hitThis = true;
      }
      if (st.t <= 0) endStorm();
    }
  }

  function endStorm() {
    const st = s.storm;
    st.phase = 'none';
    st.idx++;
    s.stats.storms++;
    if (st.hitThis) s.stats.stormHits++;
    if (checkDeath()) return;
    s.mode = 'modal';
    RA.UI.showStormReport(st.event, st.delay, st.hitThis, () => { s.mode = 'play'; RA.Input.clear(); });
  }

  function openBase() {
    s.mode = 'modal';
    RA.Input.clear();
    RA.UI.showBase(s, {
      makeO2() {
        if (s.res.o2 >= 99.5) return t('o2Full');
        if (s.res.energy < C.OXYGEN_REFILL.energy) return t('noEnergy');
        s.res.energy -= C.OXYGEN_REFILL.energy;
        s.res.o2 = Math.min(100, s.res.o2 + C.OXYGEN_REFILL.oxygen);
        RA.Audio.play('click');
        return null;
      },
      rest() {
        if (s.res.health >= 99.5) return t('healthFull');
        if (s.res.energy < C.REST.energy) return t('noEnergy');
        s.res.energy -= C.REST.energy;
        const steps = 40;
        const frac = C.REST.solFraction / steps;
        for (let i = 0; i < steps; i++) {
          advanceSol(frac);
          s.time.elapsed += frac * C.SOL_SECONDS;
        }
        s.res.health = Math.min(100, s.res.health + C.REST.health);
        RA.Audio.play('click');
        return t('rested', { h: Math.round(C.REST.solFraction * 24.66) });
      },
      callEarth() {
        if (s.call.t > 0) return t('callWaiting');
        const remaining = s.world.parts.filter(p => !p.collected);
        if (!remaining.length) return t('scanAll');
        if (s.res.energy < C.CALL_EARTH.energy) return t('noEnergy');
        s.res.energy -= C.CALL_EARTH.energy;
        s.call.t = 2 * callMinutes();
        s.call.target = remaining[Math.floor(Math.random() * remaining.length)];
        RA.Audio.play('scan');
        return t('callSent', { s: Math.round(s.call.t) });
      },
      leave() { s.mode = 'play'; RA.Input.clear(); }
    });
  }

  function callMinutes() { return Math.max(1, Math.round(U.lightMinutes(new Date()))); }

  function updateCall(dt) {
    if (s.call.t <= 0) return;
    s.call.t -= dt;
    if (s.call.t > 0) return;
    s.call.t = 0;
    const p = s.call.target;
    s.call.target = null;
    if (!p || p.collected) return;
    s.scan.t = C.CALL_EARTH.markTime;
    s.scan.target = p;
    RA.Audio.play('pickup');
    RA.UI.toast(t('callAnswer', { part: t('part_' + p.id) }));
  }

  function openPause() {
    s.mode = 'modal';
    RA.Input.clear();
    RA.UI.showPause(() => { s.mode = 'play'; RA.Input.clear(); });
  }

  function checkDeath() {
    if (s.mode === 'end') return true;
    if (s.res.o2 <= 0) { endGame('o2'); return true; }
    if (s.res.health <= 0) { endGame('health'); return true; }
    return false;
  }

  function startLaunch() {
    s.mode = 'launch';
    s.launchT = 0;
    RA.Audio.play('launch');
  }

  function updateLaunch(dt) {
    s.launchT += dt;
    if (s.launchT > 3.4) endGame('win');
  }

  function badges() {
    const st = s.stats, total = st.correct + st.wrong, out = [];
    if (s.endReason !== 'win') return out;
    if (st.minO2 >= 20) out.push('o2');
    if (st.storms > 0 && st.stormHits === 0) out.push('storm');
    if (total >= 5 && st.correct / total >= 0.8) out.push('brain');
    if (s.time.elapsed < 20 * 60) out.push('fast');
    if (st.maxAlien <= 2) out.push('brave');
    return out;
  }

  function endGame(reason) {
    s.mode = 'end';
    s.endReason = reason;
    RA.Input.clear();
    RA.Audio.play(reason === 'win' ? 'pickup' : 'lose');
    RA.UI.showEnd(s, badges());
  }

  function begin() { if (s) { s.mode = 'play'; RA.Input.clear(); } }

  return { callMinutes, newGame, get, update, begin, isDay, daylight, clockText, partsCollected };
})();
