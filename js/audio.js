window.RA = window.RA || {};

RA.Audio = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  const sfx = {
    correct() { tone(660, 0.12, 'triangle', 0.14); tone(880, 0.2, 'triangle', 0.14, 0.1); },
    wrong() { tone(240, 0.35, 'sawtooth', 0.1, 0, 110); },
    alien() { tone(150, 0.5, 'square', 0.06, 0, 70); tone(190, 0.45, 'square', 0.05, 0.15, 90); },
    pickup() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.13, i * 0.08)); },
    alarm() { for (let i = 0; i < 3; i++) { tone(880, 0.15, 'square', 0.07, i * 0.32); tone(660, 0.15, 'square', 0.07, i * 0.32 + 0.16); } },
    scan() { tone(1200, 0.08, 'sine', 0.1); tone(1600, 0.12, 'sine', 0.1, 0.1); },
    click() { tone(520, 0.05, 'sine', 0.07); },
    launch() { tone(70, 3, 'sawtooth', 0.12, 0, 500); },
    lose() { tone(392, 0.3, 'triangle', 0.12); tone(330, 0.3, 'triangle', 0.12, 0.3); tone(262, 0.6, 'triangle', 0.12, 0.6); }
  };

  return {
    ensure,
    play(name) { ensure(); if (sfx[name]) sfx[name](); },
    toggle() { muted = !muted; return muted; },
    get muted() { return muted; }
  };
})();
