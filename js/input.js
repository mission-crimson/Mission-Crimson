window.RA = window.RA || {};

RA.Input = (function () {
  const down = {};
  const pressed = new Set();
  const touch = { up: false, down: false, left: false, right: false, run: false };
  const api = { modalHandler: null, touch };

  const PREVENT = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  window.addEventListener('keydown', e => {
    if (api.modalHandler) {
      if (!e.repeat) api.modalHandler(e.code);
      if (PREVENT.includes(e.code) || e.code === 'Enter') e.preventDefault();
      return;
    }
    if (!down[e.code] && !e.repeat) pressed.add(e.code);
    down[e.code] = true;
    if (PREVENT.includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    down[e.code] = false;
    if (e.code === 'Space' || e.code === 'Enter') e.preventDefault();
  });
  window.addEventListener('blur', () => { for (const k in down) down[k] = false; });

  function any(codes) { return codes.some(c => down[c]); }

  api.axis = function () {
    let x = 0, y = 0;
    if (any(['ArrowLeft', 'KeyA']) || touch.left) x -= 1;
    if (any(['ArrowRight', 'KeyD']) || touch.right) x += 1;
    if (any(['ArrowUp', 'KeyW']) || touch.up) y -= 1;
    if (any(['ArrowDown', 'KeyS']) || touch.down) y += 1;
    return { x, y };
  };
  api.running = () => any(['ShiftLeft', 'ShiftRight']) || touch.run;
  api.consume = function (code) {
    if (pressed.has(code)) { pressed.delete(code); return true; }
    return false;
  };
  api.press = code => pressed.add(code);
  api.clear = function () { pressed.clear(); for (const k in down) down[k] = false; };

  return api;
})();
