window.RA = window.RA || {};

RA.U = (function () {
  const U = {};

  U.makeRng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;

  U.shuffle = function (arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  U.fmtTime = function (sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60), r = sec % 60;
    return m + ':' + String(r).padStart(2, '0');
  };

  U.esc = function (str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  U.lightMinutes = function (date) {
    const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const rad = Math.PI / 180;
    const le = (100.464 + 0.9856474 * d) * rad;
    const lm = (355.453 + 0.5240208 * d) * rad;
    const re = 1.0, rm = 1.524;
    const au = Math.sqrt(re * re + rm * rm - 2 * re * rm * Math.cos(le - lm));
    return au * 499.0 / 60;
  };

  return U;
})();
