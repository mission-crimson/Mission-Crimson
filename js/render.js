window.RA = window.RA || {};

RA.Render = (function () {
  const C = RA.CONFIG, U = RA.U;
  const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  let canvas, ctx, W = 0, H = 0, dpr = 1;
  let mini, mctx;
  const TILT = 0.55;
  let Z = 1.8;

  function init(c, m) {
    canvas = c; ctx = c.getContext('2d');
    mini = m; mctx = m.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    Z = U.clamp(Math.min(W, H) / 320, 1.25, 2.8);
  }

  function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }

  function upright(x, y) { ctx.translate(x, y); ctx.scale(1, 1 / TILT); }

  function label(text, x, y) {
    ctx.save(); upright(x, y); ctx.fillText(text, 0, 0); ctx.restore();
  }

  function draw(s, now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#b8643a';
    ctx.fillRect(0, 0, W, H);
    if (!s) { drawIdle(now); return; }

    const P = s.player;
    const vw = W / Z, vh = H / (Z * TILT);
    let camX = U.clamp(P.x - vw / 2, -200, C.WORLD_W - vw + 200);
    let camY = U.clamp(P.y - 20 - vh / 2, -200, C.WORLD_H - vh + 200);
    if (s.shake > 0) { camX += (Math.random() - 0.5) * 18 * s.shake; camY += (Math.random() - 0.5) * 18 * s.shake; }

    const view = { x0: camX - 60, y0: camY - 60, x1: camX + vw + 60, y1: camY + vh + 60 };
    const inView = (o, m) => o.x > view.x0 - (m || 0) && o.x < view.x1 + (m || 0) && o.y > view.y0 - (m || 0) && o.y < view.y1 + (m || 0);

    ctx.save();
    ctx.scale(Z, Z * TILT);
    ctx.translate(-camX, -camY);

    ctx.fillStyle = '#4a2214';
    ctx.fillRect(-400, -400, C.WORLD_W + 800, 400);
    ctx.fillRect(-400, C.WORLD_H, C.WORLD_W + 800, 400);
    ctx.fillRect(-400, 0, 400, C.WORLD_H);
    ctx.fillRect(C.WORLD_W, 0, 400, C.WORLD_H);

    for (const r of s.world.regions) {
      if (!inView(r, r.r)) continue;
      const g = ctx.createRadialGradient(r.x, r.y, r.r * 0.15, r.x, r.y, r.r);
      g.addColorStop(0, r.color);
      g.addColorStop(0.7, r.color + 'cc');
      g.addColorStop(1, r.color + '00');
      ctx.fillStyle = g;
      circle(r.x, r.y, r.r); ctx.fill();
      ctx.font = 'bold 40px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = r.id === 'polar' ? 'rgba(90,60,50,.45)' : 'rgba(255,240,225,.4)';
      label(RA.i18n.t('region_' + r.id), r.x, r.y - r.r * 0.55);
    }

    for (const d of s.world.decor) {
      if (!inView(d, 30)) continue;
      if (d.k === 'crater') {
        ctx.strokeStyle = 'rgba(80,35,20,.35)'; ctx.lineWidth = 3;
        circle(d.x, d.y, d.s * 1.6); ctx.stroke();
        ctx.fillStyle = 'rgba(80,35,20,.15)'; ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(70,30,18,.45)';
        ctx.beginPath(); ctx.ellipse(d.x, d.y, d.s, d.s * 0.65, d.t * 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    for (const c of s.world.caves) {
      if (!inView(c, 90)) continue;
      ctx.fillStyle = '#5b2c1a';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, C.CAVE_RADIUS, C.CAVE_RADIUS * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e0d07';
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, C.CAVE_RADIUS * 0.55, C.CAVE_RADIUS * 0.4, 0, Math.PI, 0); ctx.fill();
      ctx.font = '14px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,230,210,.8)';
      label('⛰️ ' + RA.i18n.t('cave'), c.x, c.y - C.CAVE_RADIUS * 0.75);
    }

    drawBase(s, now);
    drawShip(s, now);

    for (const p of s.world.parts) {
      if (p.collected || !inView(p, 60)) continue;
      const d = U.dist(P, p);
      const scanned = s.scan.t > 0 && s.scan.target === p;
      if (d > C.PART_REVEAL && !scanned) continue;
      const pulse = 1 + Math.sin(now * 4) * 0.12;
      ctx.fillStyle = 'rgba(255,230,120,.35)';
      circle(p.x, p.y, 34 * pulse); ctx.fill();
      ctx.strokeStyle = '#ffe38a'; ctx.lineWidth = 3;
      circle(p.x, p.y, 26); ctx.stroke();
      ctx.font = '30px ' + EMOJI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      label(p.icon, p.x, p.y - 4);
      ctx.textBaseline = 'alphabetic';
    }

    for (const tr of s.world.traps) {
      if (!tr.active || !inView(tr, 60)) continue;
      const d = U.dist(P, tr);
      if (d > C.TRAP_REVEAL) continue;
      const a = U.clamp(1 - d / C.TRAP_REVEAL, 0, 1);
      const pulse = 1 + Math.sin(now * 5 + tr.phase) * 0.15;
      ctx.globalAlpha = 0.25 + a * 0.75;
      ctx.fillStyle = 'rgba(160,70,255,.35)';
      circle(tr.x, tr.y, C.TRAP_RADIUS * pulse); ctx.fill();
      ctx.strokeStyle = '#c58cff'; ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]); circle(tr.x, tr.y, C.TRAP_RADIUS + 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '26px ' + EMOJI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      label('👾', tr.x, tr.y - 4);
      ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 1;
    }

    if (s.alien.steps > 0) drawAlien(s, now);

    if (s.mode !== 'launch') drawPlayer(s, now);

    if (s.scan.t > 0 && s.scan.target) drawScanArrow(s);

    ctx.restore();

    drawOverlays(s, now, (P.x - camX) * Z, (P.y - camY) * Z * TILT - 20 * Z);
  }

  function drawBase(s, now) {
    const b = s.world.base;
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    circle(b.x, b.y, C.BASE_RADIUS); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2a3f6b';
    for (let i = -1; i <= 1; i += 2) {
      ctx.fillRect(b.x + i * 70 - 18, b.y - 60, 36, 22);
      ctx.strokeStyle = '#8fb0e8'; ctx.lineWidth = 1; ctx.strokeRect(b.x + i * 70 - 18, b.y - 60, 36, 22);
    }
    ctx.save();
    upright(b.x, b.y + 14);
    ctx.fillStyle = '#e8e4de';
    ctx.beginPath(); ctx.arc(0, -14, 48, Math.PI, 0); ctx.lineTo(48, 0); ctx.lineTo(-48, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9fd3ff';
    circle(-16, -30, 7); ctx.fill(); circle(16, -30, 7); ctx.fill();
    ctx.fillStyle = '#555'; ctx.fillRect(-9, -20, 18, 20);
    ctx.restore();
    ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    label(RA.i18n.t('base'), b.x, b.y + 40);
  }

  function drawShip(s, now) {
    const sh = s.world.ship;
    let y = sh.y;
    if (s.mode === 'launch') y -= Math.pow(s.launchT, 2.2) * 90;
    const done = RA.Game.partsCollected(), total = s.world.parts.length;
    ctx.save();
    upright(sh.x, y);
    ctx.fillStyle = '#d9d9de';
    ctx.beginPath(); ctx.moveTo(0, -55); ctx.quadraticCurveTo(24, -20, 20, 30); ctx.lineTo(-20, 30); ctx.quadraticCurveTo(-24, -20, 0, -55); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(-20, 18); ctx.lineTo(-36, 40); ctx.lineTo(-18, 32); ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, 18); ctx.lineTo(36, 40); ctx.lineTo(18, 32); ctx.fill();
    ctx.fillStyle = '#4aa3df'; circle(0, -14, 9); ctx.fill();
    if (s.mode === 'launch') {
      ctx.fillStyle = 'rgba(255,180,60,.9)';
      ctx.beginPath(); ctx.moveTo(-14, 32); ctx.lineTo(0, 70 + Math.random() * 30); ctx.lineTo(14, 32); ctx.fill();
    }
    ctx.restore();
    if (s.mode !== 'launch') {
      ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      label('🚀 ' + done + '/' + total, sh.x, sh.y + 58);
    }
  }

  const astro = new Image();
  astro.src = 'assets/astronaut.png';
  const ASTRO_FRAMES = 4, ASTRO_H = 60;

  function astroFrame(facing) {
    const c = Math.cos(facing), sn = Math.sin(facing);
    if (Math.abs(c) >= Math.abs(sn)) return c < 0 ? 0 : 1;
    return sn < 0 ? 2 : 3;
  }

  function drawPlayer(s, now) {
    const P = s.player;
    const bob = P.moving ? Math.abs(Math.sin(P.walkT)) * 3 : 0;
    const sway = P.moving ? Math.sin(P.walkT) * 0.06 : 0;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(P.x, P.y + 16, 15, 9, 0, 0, Math.PI * 2); ctx.fill();
    if (!astro.complete || !astro.naturalWidth) return;
    const fw = astro.naturalWidth / ASTRO_FRAMES, fh = astro.naturalHeight;
    const h = ASTRO_H, w = fw * h / fh;
    ctx.save();
    upright(P.x, P.y + 16);
    ctx.translate(0, -bob);
    ctx.rotate(sway);
    ctx.drawImage(astro, astroFrame(P.facing) * fw, 0, fw, fh, -w / 2, -h, w, h);
    ctx.restore();
  }

  function drawAlien(s, now) {
    const A = s.alien;
    const k = A.steps / C.ALIEN_STEPS;
    const size = 14 + k * 16 + (A.pulse > 0 ? Math.sin(now * 20) * 4 : 0);
    const hover = Math.sin(now * 3) * 4;
    ctx.save();
    upright(A.x, A.y);
    ctx.translate(0, hover);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(0, size + 10 - hover, size * 0.8, size * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.pulse > 0 ? '#9dff6a' : '#6fd34a';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.85, size, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6fd34a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-size * 0.3, -size * 0.9); ctx.lineTo(-size * 0.5, -size * 1.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(size * 0.3, -size * 0.9); ctx.lineTo(size * 0.5, -size * 1.4); ctx.stroke();
    ctx.fillStyle = '#ff5ad1'; circle(-size * 0.5, -size * 1.45, 3); ctx.fill(); circle(size * 0.5, -size * 1.45, 3); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(-size * 0.32, -size * 0.15, size * 0.22, size * 0.32, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(size * 0.32, -size * 0.15, size * 0.22, size * 0.32, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawScanArrow(s) {
    const P = s.player, T = s.scan.target;
    const a = Math.atan2(T.y - P.y, T.x - P.x);
    const r = 48;
    ctx.save();
    ctx.translate(P.x + Math.cos(a) * r, P.y + Math.sin(a) * r);
    ctx.rotate(a);
    ctx.globalAlpha = Math.min(1, s.scan.t);
    ctx.fillStyle = '#ffe38a';
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -10); ctx.lineTo(-3, 0); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawOverlays(s, now, px, py) {
    const R = Math.max(W, H);
    const v = ctx.createRadialGradient(px, py, Math.min(W, H) * 0.28, px, py, R * 0.62);
    v.addColorStop(0, 'rgba(20,6,2,0)');
    v.addColorStop(1, 'rgba(20,6,2,.78)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    const night = 1 - RA.Game.daylight();
    if (night > 0.01) {
      const g = ctx.createRadialGradient(px, py, 50 * Z, px, py, 230 * Z);
      g.addColorStop(0, 'rgba(8,10,35,0)');
      g.addColorStop(1, 'rgba(8,10,35,' + (0.82 * night).toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    const st = s.storm;
    if (st.phase === 'warning') {
      const a = 0.08 + Math.max(0, Math.sin(now * 6)) * 0.1;
      ctx.strokeStyle = 'rgba(255,200,40,' + a + ')'; ctx.lineWidth = 30;
      ctx.strokeRect(0, 0, W, H);
    } else if (st.phase === 'active') {
      ctx.fillStyle = s.inShelter ? 'rgba(120,60,200,.10)' : 'rgba(200,40,140,' + (0.16 + Math.sin(now * 8) * 0.05) + ')';
      ctx.fillRect(0, 0, W, H);
      if (!s.inShelter) {
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * W, y = Math.random() * H;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 14); ctx.stroke();
        }
      }
    }
    if (s.mode === 'launch') {
      ctx.fillStyle = 'rgba(255,255,255,' + U.clamp((s.launchT - 2.4) / 1, 0, 1) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawIdle(now) {
    ctx.fillStyle = '#8a3f22';
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    g.addColorStop(0, '#3a1d2e'); g.addColorStop(1, '#d58a5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.62);
    ctx.fillStyle = '#5e2a17';
    ctx.beginPath(); ctx.moveTo(0, H * 0.62);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H * 0.62 - 30 - Math.sin(x * 0.01 + now * 0.05) * 25 - Math.sin(x * 0.033) * 12);
    ctx.lineTo(W, H * 0.62); ctx.fill();
  }

  function drawMinimap(s) {
    const w = mini.width, h = mini.height, k = w / C.WORLD_W;
    mctx.clearRect(0, 0, w, h);
    mctx.fillStyle = 'rgba(60,25,15,.75)'; mctx.fillRect(0, 0, w, h);
    for (const r of s.world.regions) {
      mctx.fillStyle = r.color + 'aa';
      mctx.beginPath(); mctx.arc(r.x * k, r.y * k, r.r * k, 0, Math.PI * 2); mctx.fill();
      const part = s.world.parts.find(p => p.region === r.id);
      mctx.font = '12px ' + EMOJI; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
      mctx.globalAlpha = part && part.collected ? 0.3 : 1;
      mctx.fillText(part && part.collected ? '✔' : r.icon, r.x * k, r.y * k);
      mctx.globalAlpha = 1;
    }
    for (const c of s.world.caves) { mctx.fillStyle = '#1e0d07'; mctx.fillRect(c.x * k - 2, c.y * k - 2, 4, 4); }
    mctx.fillStyle = '#fff'; mctx.fillRect(s.world.base.x * k - 3, s.world.base.y * k - 3, 6, 6);
    if (s.scan.t > 0 && s.scan.target) {
      mctx.strokeStyle = '#ffe38a'; mctx.lineWidth = 2;
      mctx.beginPath(); mctx.arc(s.scan.target.x * k, s.scan.target.y * k, 5, 0, Math.PI * 2); mctx.stroke();
    }
    mctx.fillStyle = '#4fc3ff';
    mctx.beginPath(); mctx.arc(s.player.x * k, s.player.y * k, 3.5, 0, Math.PI * 2); mctx.fill();
    mctx.textBaseline = 'alphabetic';
  }

  return { init, draw, drawMinimap };
})();