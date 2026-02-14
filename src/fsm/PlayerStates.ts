export type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'shooting' | 'hit' | 'dead';
export type PlayerEvent = 'run' | 'stop' | 'jump' | 'fall' | 'land' | 'shoot' | 'hit' | 'die' | 'respawn';

export const PLAYER_STATES = {
  IDLE: 'idle' as PlayerState,
  RUNNING: 'running' as PlayerState,
  JUMPING: 'jumping' as PlayerState,
  FALLING: 'falling' as PlayerState,
  SHOOTING: 'shooting' as PlayerState,
  HIT: 'hit' as PlayerState,
  DEAD: 'dead' as PlayerState,
};

export const PLAYER_EVENTS = {
  RUN: 'run' as PlayerEvent,
  STOP: 'stop' as PlayerEvent,
  JUMP: 'jump' as PlayerEvent,
  FALL: 'fall' as PlayerEvent,
  LAND: 'land' as PlayerEvent,
  SHOOT: 'shoot' as PlayerEvent,
  HIT: 'hit' as PlayerEvent,
  DIE: 'die' as PlayerEvent,
  RESPAWN: 'respawn' as PlayerEvent,
};
