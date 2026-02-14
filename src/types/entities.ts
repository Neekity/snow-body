export type EntityType = 'player' | 'goblin' | 'demon' | 'red_demon' | 'boss' | 'snowball' | 'powerup';
export type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'shooting' | 'hit' | 'dead';
export type EnemyState = 'patrol' | 'chase' | 'stunned' | 'frozen' | 'dead';
export type SnowLevel = 0 | 1 | 2 | 3;

export interface EntityConfig {
  type: EntityType;
  speed: number;
  health: number;
  scoreValue: number;
}

export interface EnemyConfig extends EntityConfig {
  snowThresholds: [number, number, number];
  meltRate: number;
  detectionRange: number;
  jumpForce?: number;
}

export type PowerUpType = 'speed' | 'range' | 'rapid_fire' | 'extra_life' | 'bomb';

export interface PowerUpConfig {
  type: PowerUpType;
  duration: number;
  dropChance: number;
  spriteFrame: number;
}
