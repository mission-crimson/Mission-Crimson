window.RA = window.RA || {};

RA.Live = (function () {
  const state = { status: 'idle', flare: null };
  const listeners = [];

  function ymd(d) { return d.toISOString().slice(0, 10); }

  function score(cls) {
    const m = /^([ABCMX])(\d+(\.\d+)?)/.exec(cls || '');
    if (!m) return -1;
    return { A: 0, B: 1, C: 2, M: 3, X: 4 }[m[1]] * 100 + parseFloat(m[2]);
  }

  function notify() { listeners.forEach(fn => fn(state)); }

  async function load() {
    state.status = 'loading'; notify();
    const end = new Date();
    const start = new Date(end.getTime() - RA.CONFIG.LIVE_DAYS * 86400000);
    const url = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=' + ymd(start) + '&endDate=' + ymd(end);
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 7000);
    try {
      const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const flares = Array.isArray(data) ? data.filter(f => f && f.classType) : [];
      if (!flares.length) { state.status = 'none'; notify(); return; }
      flares.sort((a, b) => score(b.classType) - score(a.classType));
      const f = flares[0];
      state.flare = f;
      RA.NASA.liveEvent = {
        id: 'live-' + (f.flrID || 'flare'),
        live: true,
        date: String(f.peakTime || f.beginTime || '').slice(0, 10),
        cls: String(f.classType),
        url: RA.NASA.DONKI_URL
      };
      state.status = 'ok';
    } catch (e) {
      state.status = 'fail';
    } finally {
      clearTimeout(timer);
      notify();
    }
  }

  return { load, state, onChange(fn) { listeners.push(fn); } };
})();
