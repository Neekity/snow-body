export const BALANCE = {
  player: {
    speed: 160,
    jumpForce: -420,
    gravity: 800,
    lives: 3,
    invincibilityDuration: 2000,
    shootCooldown: 300,
    maxActiveShots: 3,
  },

  snowShot: {
    speed: 250,
    range: 120,
    snowAmount: 34,
  },

  snowball: {
    kickSpeed: 300,
    bounceDecay: 0.8,
    maxBounces: 3,
    chainWindow: 500,
  },

  enemies: {
    goblin: {
      type: 'goblin' as const,
      speed: 40,
      health: 1,
      scoreValue: 100,
      snowThresholds: [34, 67, 100] as [number, number, number],
      meltRate: 5,
      detectionRange: 0,
    },
    demon: {
      type: 'demon' as const,
      speed: 50,
      health: 1,
      scoreValue: 200,
      snowThresholds: [34, 67, 100] as [number, number, number],
      meltRate: 8,
      detectionRange: 100,
      jumpForce: -280,
    },
    redDemon: {
      type: 'red_demon' as const,
      speed: 80,
      health: 1,
      scoreValue: 300,
      snowThresholds: [25, 50, 100] as [number, number, number],
      meltRate: 10,
      detectionRange: 200,
    },
    boss: {
      type: 'boss' as const,
      speed: 50,
      health: 10,
      scoreValue: 5000,
      snowThresholds: [10, 20, 30] as [number, number, number],
      meltRate: 15,
      detectionRange: 300,
      jumpForce: -350,
    },
  },

  combo: {
    baseMultiplier: 2,
    maxMultiplier: 16,
    chainTimeWindow: 500,
    floatingScoreDuration: 1000,
  },

  powerUps: {
    speed: { duration: 10000, multiplier: 1.5, dropChance: 0.15 },
    range: { duration: 10000, multiplier: 1.8, dropChance: 0.10 },
    rapidFire: { duration: 8000, cooldownMultiplier: 0.5, dropChance: 0.10 },
    extraLife: { duration: 0, dropChance: 0.05 },
    bomb: { duration: 0, dropChance: 0.03 },
  },

  level: {
    timeLimitDefault: 120,
    wrapHorizontal: true,
    enemyClearBonus: 1000,
    timeBonusPerSecond: 10,
  },

  difficulty: {
    speedScale: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.0],
    meltScale: [1.0, 1.0, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.5, 1.0],
    enemyCount: [3, 4, 4, 5, 5, 6, 6, 7, 8, 1],
  },
} as const;
