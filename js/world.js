window.RA = window.RA || {};

RA.World = (function () {
  const C = RA.CONFIG, U = RA.U;

  const REGIONS = [
    { id: 'jezero',  part: 'engine',   icon: '🔥', topics: ['oxygen', 'water'],     color: '#b0603c' },
    { id: 'gale',    part: 'antenna',  icon: '📡', topics: ['radiation', 'comms'],  color: '#9c5236' },
    { id: 'dunes',   part: 'panel',    icon: '☀️', topics: ['energy'],              color: '#d6914f' },
    { id: 'valles',  part: 'fuel',     icon: '⛽', topics: ['gravity'],             color: '#7f3f2a' },
    { id: 'olympus', part: 'shield',   icon: '🛡️', topics: ['cold', 'general'],     color: '#93533d' },
    { id: 'polar',   part: 'computer', icon: '💻', topics: ['water', 'cold'],       color: '#e9e4df' }
  ];

  function generate(rng) {
    const base = { x: C.BASE.x, y: C.BASE.y };
    const ship = { x: base.x + C.SHIP_OFFSET.x, y: base.y + C.SHIP_OFFSET.y };
    const placed = [
      { x: base.x, y: base.y, r: C.BASE_RADIUS + 80 },
      { x: ship.x, y: ship.y, r: C.SHIP_RADIUS + 80 }
    ];

    function free(p, r) { return placed.every(o => U.dist(o, p) > o.r + r); }

    function place(cx, cy, rMin, rMax, r) {
      for (let i = 0; i < 300; i++) {
        const a = rng() * Math.PI * 2;
        const d = rMin + rng() * (rMax - rMin);
        const p = { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d };
        if (p.x < 100 || p.y < 100 || p.x > C.WORLD_W - 100 || p.y > C.WORLD_H - 100) continue;
        if (free(p, r)) { placed.push({ x: p.x, y: p.y, r }); return p; }
      }
      return { x: cx + (rng() - 0.5) * rMax, y: cy + (rng() - 0.5) * rMax };
    }

    const order = U.shuffle(REGIONS.map(r => Object.assign({}, r)), rng);
    const offset = rng() * Math.PI * 2;
    const regions = order.map((r, i) => {
      const a = offset + i * Math.PI * 2 / order.length + (rng() - 0.5) * 0.25;
      const d = C.RING_RADIUS * (0.92 + rng() * 0.16);
      return Object.assign(r, { x: base.x + Math.cos(a) * d, y: base.y + Math.sin(a) * d, r: C.REGION_RADIUS });
    });

    const parts = regions.map(rg => {
      const p = place(rg.x, rg.y, 60, rg.r * 0.75, 70);
      return { id: rg.part, icon: rg.icon, region: rg.id, x: p.x, y: p.y, collected: false, cool: 0 };
    });

    const traps = [];
    regions.forEach(rg => {
      for (let i = 0; i < C.TRAPS_PER_REGION; i++) {
        const p = place(rg.x, rg.y, 90, rg.r * 0.95, 75);
        traps.push({ x: p.x, y: p.y, region: rg.id, active: true, cool: 0, phase: rng() * 6 });
      }
    });
    for (let i = 0; i < C.TRAPS_WILD; i++) {
      const p = place(base.x, base.y, 450, C.RING_RADIUS - C.REGION_RADIUS, 75);
      traps.push({ x: p.x, y: p.y, region: null, active: true, cool: 0, phase: rng() * 6 });
    }

    const caves = [];
    regions.forEach(rg => { caves.push(place(rg.x, rg.y, rg.r * 0.3, rg.r * 0.9, C.CAVE_RADIUS + 20)); });
    for (let i = 0; i < C.CAVES_WILD; i++) {
      caves.push(place(base.x, base.y, 550, C.RING_RADIUS - C.REGION_RADIUS - 80, C.CAVE_RADIUS + 20));
    }

    const decor = [];
    for (let i = 0; i < C.DECOR_COUNT; i++) {
      decor.push({ x: rng() * C.WORLD_W, y: rng() * C.WORLD_H, s: 4 + rng() * 18, k: rng() < 0.22 ? 'crater' : 'rock', t: rng() });
    }

    return { base, ship, regions, parts, traps, caves, decor };
  }

  function regionAt(world, p) {
    let best = null, bd = Infinity;
    for (const r of world.regions) {
      const d = U.dist(r, p);
      if (d < r.r && d < bd) { best = r; bd = d; }
    }
    return best;
  }

  function rehidePart(world, part, rng) {
    const rg = world.regions.find(r => r.id === part.region);
    const a = rng() * Math.PI * 2, d = 60 + rng() * rg.r * 0.7;
    part.x = rg.x + Math.cos(a) * d;
    part.y = rg.y + Math.sin(a) * d;
    part.collected = false;
    part.cool = 0;
  }

  function regionById(id) { return REGIONS.find(r => r.id === id); }

  return { REGIONS, generate, regionAt, rehidePart, regionById };
})();
