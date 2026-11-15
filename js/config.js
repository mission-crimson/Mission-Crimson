window.RA = window.RA || {};

RA.CONFIG = {
  WORLD_W: 5000,
  WORLD_H: 5000,
  BASE: { x: 2500, y: 2500 },
  SHIP_OFFSET: { x: 0, y: 180 },
  BASE_RADIUS: 110,
  SHIP_RADIUS: 75,

  RING_RADIUS: 1700,
  REGION_RADIUS: 520,

  PLAYER_SPEED: 150,
  RUN_MULT: 1.7,
  RUN_O2_MULT: 2.0,

  SOL_SECONDS: 180,
  DAY_FRACTION: 0.68,

  START: { o2: 100, energy: 70, health: 100 },

  SCAN_COST: 10,
  SCAN_TIME: 5,
  TRAP_COST_CORRECT: 10,
  PART_COST_CORRECT: 5,
  OXYGEN_REFILL: { energy: 20, oxygen: 45 },
  REST: { health: 30, solFraction: 0.22, energy: 15 },
  CALL_EARTH: { energy: 10, markTime: 25 },
  BASE_CHARGE_PER_S: 4,

  ALIEN_STEPS: 5,
  ALIEN_RESET_STEPS: 2,
  STREAK_FOR_RETREAT: 3,

  TRAPS_PER_REGION: 2,
  TRAPS_WILD: 6,
  CAVES_WILD: 3,
  DECOR_COUNT: 900,

  TRAP_RADIUS: 34,
  TRAP_REVEAL: 115,
  PART_RADIUS: 38,
  PART_REVEAL: 240,
  CAVE_RADIUS: 70,
  PUSHBACK: 80,

  STORM: { damagePerS: 2.6, durationS: 22 },

  LIVE_DAYS: 30,

  DIFFICULTY: {
    easy:   { o2Walk: 0.42, o2Idle: 0.20, maxLevel: 1, storms: 2, warnS: 28, damageMult: 0.7 },
    normal: { o2Walk: 0.55, o2Idle: 0.28, maxLevel: 2, storms: 3, warnS: 22, damageMult: 1.0 },
    hard:   { o2Walk: 0.68, o2Idle: 0.35, maxLevel: 3, storms: 4, warnS: 16, damageMult: 1.3 }
  }
};
