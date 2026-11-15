window.RA = window.RA || {};

RA.UI = (function () {
  const C = RA.CONFIG, U = RA.U;
  const $ = id => document.getElementById(id);
  const t = (k, v) => RA.i18n.t(k, v);
  const L = () => RA.i18n.lang;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function button(cls, html, onClick) {
    const b = el('button', 'btn ' + (cls || ''), html);
    b.addEventListener('click', e => { e.stopPropagation(); b.blur(); RA.Audio.ensure(); onClick(); });
    return b;
  }

  function openModal(node, keyHandler) {
    const card = $('modal-card');
    card.innerHTML = '';
    card.appendChild(node);
    $('modal').classList.remove('hidden');
    RA.Input.modalHandler = keyHandler || null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    card.scrollTop = 0;
  }

  function closeModal() {
    $('modal').classList.add('hidden');
    RA.Input.modalHandler = null;
  }

  function continueHandler(fn) {
    return code => { if (code === 'Space' || code === 'Enter' || code === 'NumpadEnter') fn(); };
  }

  function showInfo(title, html, onClose, btnLabel) {
    const box = el('div', 'info');
    box.appendChild(el('h2', null, title));
    box.appendChild(el('div', 'info-body', html));
    let done = false;
    const close = () => { if (done) return; done = true; closeModal(); onClose && onClose(); };
    const row = el('div', 'row');
    row.appendChild(button('btn-primary', (btnLabel || t('continue')) + ' <kbd>Space</kbd>', close));
    box.appendChild(row);
    openModal(box, continueHandler(close));
  }

  function showQuestion(q, kind, partName, cb) {
    const box = el('div', 'qbox ' + kind);
    box.appendChild(el('h2', null, kind === 'part' ? t('guardTitle', { part: U.esc(partName) }) : t('trapTitle')));
    box.appendChild(el('p', 'sub', t('trapSub')));
    box.appendChild(el('div', 'question', U.esc(q[L()].q)));
    const row = el('div', 'answers');
    let done = false;
    const answer = v => { if (done) return; done = true; closeModal(); cb(v); };
    row.appendChild(button('btn-yes', t('yes') + ' <kbd>' + t('keyYes') + '</kbd>', () => answer(true)));
    row.appendChild(button('btn-no', t('no') + ' <kbd>' + t('keyNo') + '</kbd>', () => answer(false)));
    box.appendChild(row);
    const yesCodes = ['KeyY'];
    const noCodes = ['KeyN'];
    openModal(box, code => {
      if (yesCodes.includes(code) || code === 'Digit1' || code === 'ArrowLeft') answer(true);
      else if (noCodes.includes(code) || code === 'Digit2' || code === 'ArrowRight') answer(false);
    });
  }

  function showFact(q, correct, effects, onClose) {
    const box = el('div', 'fact ' + (correct ? 'ok' : 'ko'));
    box.appendChild(el('h2', null, correct ? t('correct') : t('wrong')));
    const ul = el('ul', 'effects');
    effects.forEach(e => ul.appendChild(el('li', e.cls, U.esc(e.text))));
    box.appendChild(ul);
    const dyk = el('div', 'dyk');
    dyk.appendChild(el('h3', null, t('didYouKnow')));
    dyk.appendChild(el('p', null, U.esc(q[L()].x)));
    if (q.src) dyk.appendChild(el('p', 'muted small', t('source') + ': <a href="' + U.esc(q.src) + '" target="_blank" rel="noopener">NASA ↗</a>'));
    box.appendChild(dyk);
    let done = false;
    const close = () => { if (done) return; done = true; closeModal(); onClose(); };
    const row = el('div', 'row');
    row.appendChild(button('btn-primary', t('continue') + ' <kbd>Space</kbd>', close));
    box.appendChild(row);
    openModal(box, continueHandler(close));
  }

  function eventTexts(ev) {
    if (ev.live) {
      const date = formatDate(ev.date);
      return { title: t('liveEventTitle', { cls: ev.cls }), text: t('liveEventText', { cls: ev.cls, date }) };
    }
    return ev[L()] || ev.el;
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T12:00:00Z');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function showStormReport(ev, delay, hit, onClose) {
    const tx = eventTexts(ev);
    const html =
      '<p class="' + (hit ? 'bad' : 'good') + '">' + U.esc(hit ? t('stormHit') : t('stormNoHit')) + '</p>' +
      '<div class="event"><span class="tag ' + (ev.live ? 'live' : 'arch') + '">' + (ev.live ? t('live') : t('archive')) + '</span>' +
      '<p class="muted">' + U.esc(t('stormReal')) + '</p>' +
      '<h3>' + U.esc(tx.title) + '</h3><p>' + U.esc(tx.text) + '</p>' +
      '<p class="muted small">' + t('source') + ': <a href="' + U.esc(ev.url) + '" target="_blank" rel="noopener">NASA</a></p></div>' +
      '<p>' + U.esc(t('stormWhy', { m: delay })) + '</p>';
    showInfo(t('stormOverTitle'), html, onClose);
  }

  function showBase(s, actions) {
    const box = el('div', 'base');
    let msg = '';
    function render() {
      box.innerHTML = '';
      box.appendChild(el('h2', null, t('baseTitle')));
      box.appendChild(el('p', null, t('baseText')));
      box.appendChild(el('div', 'base-res',
        '🫁 ' + Math.round(s.res.o2) + ' · ⚡ ' + Math.round(s.res.energy) + ' · ❤️ ' + Math.round(s.res.health) +
        ' · ' + (RA.Game.isDay() ? '☀️' : '🌙') + ' ' + RA.Game.clockText()));
      const list = el('div', 'base-actions');
      const o2 = button('btn-opt', '<b>1. ' + t('baseO2') + '</b><span>' + t('baseO2d', { e: C.OXYGEN_REFILL.energy, o: C.OXYGEN_REFILL.oxygen }) + '</span>', doO2);
      const rest = button('btn-opt', '<b>2. ' + t('baseRest') + '</b><span>' + t('baseRestd', { e: C.REST.energy, h: C.REST.health }) + '</span>', doRest);
      const m = RA.Game.callMinutes();
      const call = button('btn-opt', '<b>3. ' + t('baseCall') + '</b><span>' + t('baseCalld', { e: C.CALL_EARTH.energy, m: m, s: 2 * m }) + '</span>', doCall);
      const leave = button('btn-opt', '<b>4. ' + t('baseLeave') + '</b>', doLeave);
      list.append(o2, rest, call, leave);
      box.appendChild(list);
      box.appendChild(el('p', 'base-msg', msg ? U.esc(msg) : '&nbsp;'));
      updateHUD(s);
    }
    function doO2() { msg = actions.makeO2() || ''; render(); }
    function doRest() { msg = actions.rest() || ''; render(); }
    function doCall() { msg = actions.callEarth() || ''; render(); }
    let done = false;
    function doLeave() { if (done) return; done = true; closeModal(); actions.leave(); }
    render();
    openModal(box, code => {
      if (code === 'Digit1' || code === 'Numpad1') doO2();
      else if (code === 'Digit2' || code === 'Numpad2') doRest();
      else if (code === 'Digit3' || code === 'Numpad3') doCall();
      else if (code === 'Digit4' || code === 'Numpad4' || code === 'Escape' || code === 'Space') doLeave();
    });
  }

  function showPause(onResume) {
    const box = el('div', 'pause');
    box.appendChild(el('h2', null, t('pausedTitle')));
    let done = false;
    const resume = () => { if (done) return; done = true; closeModal(); onResume(); };
    const col = el('div', 'col');
    col.appendChild(button('btn-primary', t('resume'), resume));
    col.appendChild(button('', t('sources'), () => { done = true; showSources(() => showPause(onResume)); }));
    col.appendChild(button('btn-ghost', t('restart'), () => { done = true; closeModal(); RA.Main.toStart(); }));
    box.appendChild(col);
    openModal(box, code => { if (code === 'KeyP' || code === 'Escape') resume(); });
  }

  function showSources(onBack) {
    const box = el('div', 'sources');
    box.appendChild(el('h2', null, t('sourcesTitle')));
    box.appendChild(el('p', null, t('sourcesIntro')));
    box.appendChild(el('h3', null, t('dataTitle')));
    const ul = el('ul', 'src-list');
    RA.NASA.sources.forEach(src => {
      ul.appendChild(el('li', null, '<a href="' + U.esc(src.url) + '" target="_blank" rel="noopener">' + U.esc(src.name) + '</a><br><span>' + U.esc(src[L()]) + '</span>'));
    });
    box.appendChild(ul);
    box.appendChild(el('h3', null, t('eventsTitle')));
    const ev = el('ul', 'src-list');
    const all = (RA.NASA.liveEvent ? [RA.NASA.liveEvent] : []).concat(RA.NASA.events);
    all.forEach(e => {
      const tx = eventTexts(e);
      ev.appendChild(el('li', null,
        '<span class="tag ' + (e.live ? 'live' : 'arch') + '">' + (e.live ? t('live') : t('archive')) + '</span> ' +
        '<b>' + U.esc(formatDate(e.date)) + ' · ' + U.esc(e.cls) + '</b><br><span>' + U.esc(tx.text) + '</span>'));
    });
    box.appendChild(ev);
    box.appendChild(el('p', 'muted small', t('ccmcAck')));
    box.appendChild(el('p', 'muted small', t('notEndorsed')));
    let done = false;
    const back = () => { if (done) return; done = true; closeModal(); onBack && onBack(); };
    const row = el('div', 'row');
    row.appendChild(button('btn-primary', t('back'), back));
    box.appendChild(row);
    openModal(box, code => { if (code === 'Escape') back(); });
  }

  function showMission(onGo) {
    const lines = t('missionLines').map(l => '<li>' + l + '</li>').join('');
    showInfo(t('missionTitle'), '<ul class="mission">' + lines + '</ul><p class="muted small">' + t('solExplain') + '</p>', onGo, t('letsGo'));
  }

  function showEnd(s, badges) {
    const win = s.endReason === 'win';
    $('hud').classList.add('hidden');
    $('touch').classList.add('hidden');
    setHint(null); setStorm(null);
    closeModal();
    const p = $('end-panel');
    const total = s.world.parts.length;
    const stat = (k, v) => '<div class="stat"><b>' + v + '</b><span>' + t(k) + '</span></div>';
    let html = '<h1>' + (win ? t('winTitle') : t('loseTitle')) + '</h1>';
    if (!win) html += '<p class="lead">' + t(s.endReason === 'o2' ? 'loseO2' : 'loseHealth') + '</p><p class="muted">' + t('loseTip') + '</p>';
    html += '<div class="stats">' +
      stat('statTime', U.fmtTime(s.time.elapsed)) +
      stat('statSols', s.time.sol) +
      stat('statCorrect', s.stats.correct) +
      stat('statWrong', s.stats.wrong) +
      stat('statParts', RA.Game.partsCollected() + '/' + total) + '</div>';
    html += '<h3>' + t('badges') + '</h3>';
    html += badges.length
      ? '<div class="badges">' + badges.map(b => '<div class="badge"><b>' + t('badge_' + b) + '</b><span>' + t('badge_' + b + 'd') + '</span></div>').join('') + '</div>'
      : '<p class="muted">' + t('noBadges') + '</p>';
    const facts = s.stats.facts.map(id => RA.QUESTIONS.find(q => q.id === id)).filter(Boolean).slice(-6);
    if (facts.length) {
      html += '<h3>' + t('learned') + '</h3><ul class="learned">' + facts.map(q => '<li>' + U.esc(q[L()].x) + '</li>').join('') + '</ul>';
    }
    html += '<h3>' + t('planners') + '</h3><ul class="learned">' + t('plannersLines').map(l => '<li>' + l + '</li>').join('') + '</ul>';
    html += '<div class="start-actions"><button id="btn-again" class="btn btn-big">' + t('playAgain') + '</button>' +
            '<button id="btn-home" class="btn btn-ghost">' + t('home') + '</button></div>';
    p.innerHTML = html;
    $('screen-end').classList.remove('hidden');
    $('btn-again').onclick = () => { RA.Audio.ensure(); RA.Main.startGame(); };
    $('btn-home').onclick = () => RA.Main.toStart();
    p.scrollTop = 0;
  }

  function setBar(id, v) {
    const b = $(id);
    b.querySelector('.fill').style.width = U.clamp(v, 0, 100) + '%';
    b.querySelector('.val').textContent = Math.round(v);
    b.classList.toggle('low', v < 25);
  }

  let lastPartsKey = '', lastAlien = -1;
  function updateHUD(s) {
    setBar('bar-o2', s.res.o2);
    setBar('bar-energy', s.res.energy);
    setBar('bar-health', s.res.health);
    const key = s.world.parts.map(p => p.collected ? 1 : 0).join('') + L();
    if (key !== lastPartsKey) {
      lastPartsKey = key;
      $('parts-count').innerHTML = '<span class="lbl">' + t('parts') + '</span> ' +
        s.world.parts.map(p => '<span class="pc ' + (p.collected ? 'got' : '') + '" title="' + U.esc(t('part_' + p.id)) + '">' + p.icon + '</span>').join('');
    }
    if (s.alien.steps !== lastAlien) {
      lastAlien = s.alien.steps;
      let dots = '';
      for (let i = 0; i < C.ALIEN_STEPS; i++) dots += '<span class="dot ' + (i < s.alien.steps ? 'on' : '') + '"></span>';
      $('alien-track').innerHTML = '👽 ' + dots;
      $('alien-track').classList.toggle('danger', s.alien.steps >= C.ALIEN_STEPS - 1);
    }
    $('clock').innerHTML = (RA.Game.isDay() ? '☀️' : '🌙') + ' Sol ' + s.time.sol + ' · ' + RA.Game.clockText();
    $('clock').title = t('solExplain');
  }

  function resetHUDCache() { lastPartsKey = ''; lastAlien = -1; }

  function setHint(text) {
    const h = $('hint');
    if (!text) { h.classList.add('hidden'); return; }
    if (h.textContent !== text) h.textContent = text;
    h.classList.remove('hidden');
  }

  function setStorm(html, kind) {
    const b = $('storm-banner');
    if (!html) { b.classList.add('hidden'); return; }
    b.className = kind || '';
    b.innerHTML = html;
  }

  function toast(text, kind) {
    const box = $('toasts');
    const d = el('div', 'toast ' + (kind || ''));
    d.textContent = text;
    box.appendChild(d);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    setTimeout(() => d.classList.add('out'), 3000);
    setTimeout(() => d.remove(), 3600);
  }

  function frame(s) {
    if (s.mode === 'end') return;
    updateHUD(s);
    RA.Render.drawMinimap(s);

    let hint = null;
    const all = RA.Game.partsCollected() === s.world.parts.length;
    if (s.nearShip) hint = all ? t('hintShipReady') : t('hintShipMissing', { n: s.world.parts.length - RA.Game.partsCollected() });
    else if (s.inBase) hint = t('hintBase') + ' · ' + (RA.Game.isDay() ? t('hintCharging') : t('hintNoSun'));
    else if (s.inCave) hint = t('hintCave');
    setHint(s.mode === 'play' ? hint : null);

    const st = s.storm;
    if (st.phase === 'warning') {
      setStorm('<b>' + U.esc(t('stormWarn', { s: Math.ceil(st.t) })) + '</b><br><span>' + U.esc(t('stormDelay', { m: st.delay })) + '</span>', 'warn');
    } else if (st.phase === 'active') {
      setStorm('<b>' + U.esc(t('stormActive', { s: Math.ceil(st.t) })) + '</b><br><span>' +
        U.esc(s.inShelter ? t('stormSafe') : t('stormExposed')) + '</span>', s.inShelter ? 'safe' : 'danger');
    } else setStorm(null);
  }

  function renderLiveStatus() {
    const st = RA.Live.state, p = $('live-status');
    const d = C.LIVE_DAYS;
    if (st.status === 'loading' || st.status === 'idle') p.textContent = t('liveLoading');
    else if (st.status === 'ok') p.textContent = t('liveOk', { d, cls: RA.NASA.liveEvent.cls, date: formatDate(RA.NASA.liveEvent.date) });
    else if (st.status === 'none') p.textContent = t('liveNone', { d });
    else p.textContent = t('liveFail');
    p.className = 'live-status ' + st.status;
  }

  function init(handlers) {
    document.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => {
      handlers.setDiff(b.dataset.diff); markDiff(b.dataset.diff);
    }));
    $('btn-start').addEventListener('click', () => { RA.Audio.ensure(); handlers.start(); });
    $('btn-sources').addEventListener('click', () => showSources());
    $('btn-scan').addEventListener('click', e => { e.currentTarget.blur(); RA.Input.press('KeyE'); });
    $('btn-pause').addEventListener('click', e => { e.currentTarget.blur(); RA.Input.press('KeyP'); });
    $('btn-mute').addEventListener('click', e => { e.currentTarget.blur(); const m = RA.Audio.toggle(); $('btn-mute').textContent = m ? '🔇' : '🔊'; });

    document.querySelectorAll('#touch [data-dir]').forEach(b => {
      const dir = b.dataset.dir;
      const on = e => { e.preventDefault(); RA.Input.touch[dir] = true; };
      const off = e => { e.preventDefault(); RA.Input.touch[dir] = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
    $('t-run').addEventListener('click', () => { RA.Input.touch.run = !RA.Input.touch.run; $('t-run').classList.toggle('on', RA.Input.touch.run); });
    $('t-scan').addEventListener('click', () => RA.Input.press('KeyE'));
    $('t-action').addEventListener('click', () => RA.Input.press('Space'));

    RA.Live.onChange(renderLiveStatus);
    renderLiveStatus();
  }

  function markDiff(d) {
    document.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('on', b.dataset.diff === d));
  }

  return {
    init, markDiff, showQuestion, showFact, showInfo, showStormReport, showBase, showPause, showSources,
    showMission, showEnd, frame, updateHUD, resetHUDCache, toast, setHint, setStorm, closeModal
  };
})();
