window.RA = window.RA || {};

RA.Main = (function () {
  const $ = id => document.getElementById(id);
  let diff = 'normal';
  let last = performance.now();
  let started = false;

  function isTouch() {
    return ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  function startGame() {
    RA.UI.closeModal();
    $('screen-start').classList.add('hidden');
    $('screen-end').classList.add('hidden');
    $('hud').classList.remove('hidden');
    $('touch').classList.toggle('hidden', !isTouch());
    document.body.classList.toggle('touch', isTouch());
    RA.UI.resetHUDCache();
    RA.Game.newGame(diff);
    started = true;
    RA.UI.showMission(() => RA.Game.begin());
  }

  function toStart() {
    started = false;
    RA.UI.closeModal();
    RA.UI.setHint(null);
    RA.UI.setStorm(null);
    $('hud').classList.add('hidden');
    $('touch').classList.add('hidden');
    $('screen-end').classList.add('hidden');
    $('screen-start').classList.add('hidden');
    $('screen-title').classList.remove('hidden');
  }

  function play() {
    RA.Audio.ensure();
    $('screen-title').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const s = started ? RA.Game.get() : null;
    if (s) {
      RA.Game.update(dt);
      RA.UI.frame(s);
    }
    RA.Render.draw(s, now / 1000);
    requestAnimationFrame(loop);
  }

  function init() {
    RA.i18n.apply();
    RA.Render.init($('game'), $('minimap'));
    RA.UI.init({
      setDiff(d) { diff = d; },
      start: startGame
    });
    RA.UI.markDiff(diff);
    $('btn-play').addEventListener('click', play);
    document.addEventListener('keydown', e => {
      if ((e.code === 'Enter' || e.code === 'Space') && !$('screen-title').classList.contains('hidden')) { e.preventDefault(); play(); }
    });
    RA.Live.load();
    requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { startGame, toStart };
})();
