export type EnemyState = 'patrol' | 'chase' | 'stunned' | 'frozen' | 'dead';
export type EnemyEvent = 'startChase' | 'stopChase' | 'stun' | 'freeze' | 'unfreeze' | 'die' | 'respawn';

export const ENEMY_STATES = {
  PATROL: 'patrol' as EnemyState,
  CHASE: 'chase' as EnemyState,
  STUNNED: 'stunned' as EnemyState,
  FROZEN: 'frozen' as EnemyState,
  DEAD: 'dead' as EnemyState,
};

export const ENEMY_EVENTS = {
  START_CHASE: 'startChase' as EnemyEvent,
  STOP_CHASE: 'stopChase' as EnemyEvent,
  STUN: 'stun' as EnemyEvent,
  FREEZE: 'freeze' as EnemyEvent,
  UNFREEZE: 'unfreeze' as EnemyEvent,
  DIE: 'die' as EnemyEvent,
  RESPAWN: 'respawn' as EnemyEvent,
};
