import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PLAYER_STATES } from '../../src/fsm/PlayerStates';
import { BALANCE } from '../../src/config/balance.config';
import { InputState } from '../../src/types/input';

// --- Phaser mock ---
// We must mock Phaser before importing Player since Player extends Phaser.Physics.Arcade.Sprite

let mockBody: any;
let delayedCallbacks: Array<{ delay: number; cb: () => void }>;
let mockSceneRef: any;

function freshMockBody() {
  const body: any = {
    velocity: { x: 0, y: 0 },
    blocked: { down: false, up: false, left: false, right: false },
    touching: { down: false, up: false, left: false, right: false },
    setGravityY: vi.fn(),
    setCollideWorldBounds: vi.fn(),
    setSize: vi.fn(),
  };
  body.setVelocityX = vi.fn((vx: number) => {
    body.velocity.x = vx;
  });
  body.setVelocityY = vi.fn((vy: number) => {
    body.velocity.y = vy;
  });
  body.setVelocity = vi.fn((vx: number, vy: number) => {
    body.velocity.x = vx;
    body.velocity.y = vy;
  });
  return body;
}

vi.mock('phaser', () => {
  class MockSprite {
    scene: any;
    x: number;
    y: number;
    body: any;
    flipX: boolean = false;
    active: boolean = true;
    private _tint: number = 0xffffff;
    private _alpha: number = 1;

    constructor(scene: any, x: number, y: number, _texture: string) {
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.body = mockBody;
    }

    setFlipX(val: boolean) {
      this.flipX = val;
      return this;
    }
    setTint(val: number) {
      this._tint = val;
      return this;
    }
    setAlpha(val: number) {
      this._alpha = val;
      return this;
    }
    setActive(val: boolean) {
      this.active = val;
      return this;
    }
    setPosition(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    }
  }

  return {
    default: {
      Physics: {
        Arcade: {
          Sprite: MockSprite,
        },
      },
    },
    Physics: {
      Arcade: {
        Sprite: MockSprite,
      },
    },
  };
});

// Import Player AFTER mock is set up
import { Player } from '../../src/entities/Player';

function createMockScene() {
  delayedCallbacks = [];
  const scene = {
    add: { existing: vi.fn() },
    physics: { add: { existing: vi.fn() } },
    cameras: { main: { width: 256, height: 224 } },
    events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    time: {
      delayedCall: vi.fn((delay: number, cb: () => void) => {
        delayedCallbacks.push({ delay, cb });
      }),
    },
  };
  mockSceneRef = scene;
  return scene;
}

function input(overrides: Partial<InputState> = {}): InputState {
  return {
    left: false,
    right: false,
    jump: false,
    shoot: false,
    pause: false,
    ...overrides,
  };
}

describe('Player Integration', () => {
  let player: Player;
  let scene: any;
  let body: any;

  beforeEach(() => {
    mockBody = freshMockBody();
    scene = createMockScene();
    player = new Player(scene, 128, 100);
    body = player.body as any;
  });

  // --- Initialization ---

  describe('initialization', () => {
    it('starts in idle state', () => {
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
    });

    it('has correct initial lives from config', () => {
      expect(player.lives).toBe(BALANCE.player.lives);
    });

    it('sets up physics body', () => {
      expect(body.setGravityY).toHaveBeenCalledWith(
        BALANCE.player.gravity,
      );
      expect(body.setCollideWorldBounds).toHaveBeenCalledWith(false);
      expect(body.setSize).toHaveBeenCalledWith(24, 32);
    });

    it('registers with scene', () => {
      expect(scene.add.existing).toHaveBeenCalledWith(player);
      expect(scene.physics.add.existing).toHaveBeenCalledWith(player);
    });
  });

  // --- Horizontal Movement ---

  describe('horizontal movement', () => {
    it('moves left and flips sprite', () => {
      body.blocked.down = true;
      player.update(16, input({ left: true }));

      expect(body.setVelocityX).toHaveBeenCalledWith(
        -BALANCE.player.speed,
      );
      expect(player.flipX).toBe(true);
      expect(player.getState()).toBe(PLAYER_STATES.RUNNING);
    });

    it('moves right and faces right', () => {
      body.blocked.down = true;
      player.update(16, input({ right: true }));

      expect(body.setVelocityX).toHaveBeenCalledWith(
        BALANCE.player.speed,
      );
      expect(player.flipX).toBe(false);
      expect(player.getState()).toBe(PLAYER_STATES.RUNNING);
    });

    it('stops and returns to idle when no input', () => {
      body.blocked.down = true;
      // Start running
      player.update(16, input({ right: true }));
      expect(player.getState()).toBe(PLAYER_STATES.RUNNING);

      // Release
      player.update(16, input());
      expect(body.setVelocityX).toHaveBeenLastCalledWith(0);
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
    });
  });

  // --- Jumping ---

  describe('jumping', () => {
    it('jumps when on ground', () => {
      body.blocked.down = true;
      player.update(16, input({ jump: true }));

      expect(player.getState()).toBe(PLAYER_STATES.JUMPING);
      expect(body.setVelocityY).toHaveBeenCalledWith(
        BALANCE.player.jumpForce,
      );
    });

    it('does not jump when airborne', () => {
      body.blocked.down = false;
      player.update(16, input({ jump: true }));

      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
      expect(body.setVelocityY).not.toHaveBeenCalled();
    });

    it('transitions to falling when velocity becomes positive', () => {
      body.blocked.down = true;
      player.update(16, input({ jump: true }));
      expect(player.getState()).toBe(PLAYER_STATES.JUMPING);

      // Simulate apex passed - velocity now positive (downward)
      body.blocked.down = false;
      body.velocity.y = 50;
      player.update(16, input());

      expect(player.getState()).toBe(PLAYER_STATES.FALLING);
    });

    it('lands and returns to idle', () => {
      body.blocked.down = true;
      player.update(16, input({ jump: true }));

      // In air, falling
      body.blocked.down = false;
      body.velocity.y = 50;
      player.update(16, input());
      expect(player.getState()).toBe(PLAYER_STATES.FALLING);

      // Land
      body.blocked.down = true;
      player.update(16, input());
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
    });

    it('can jump while running', () => {
      body.blocked.down = true;
      player.update(16, input({ right: true }));
      expect(player.getState()).toBe(PLAYER_STATES.RUNNING);

      player.update(16, input({ right: true, jump: true }));
      expect(player.getState()).toBe(PLAYER_STATES.JUMPING);
    });
  });

  // --- Screen Wrap ---

  describe('screen wrap', () => {
    it('wraps to right edge when going off left', () => {
      body.blocked.down = true;
      player.x = -5;
      player.update(16, input());

      expect(player.x).toBe(256); // scene width
    });

    it('wraps to left edge when going off right', () => {
      body.blocked.down = true;
      player.x = 260;
      player.update(16, input());

      expect(player.x).toBe(0);
    });

    it('does not wrap when within bounds', () => {
      body.blocked.down = true;
      player.x = 128;
      player.update(16, input());

      expect(player.x).toBe(128);
    });
  });

  // --- Shooting ---

  describe('shooting', () => {
    it('emits shoot event with position and direction', () => {
      body.blocked.down = true;
      player.update(16, input({ shoot: true }));

      expect(scene.events.emit).toHaveBeenCalledWith('player:shoot', {
        x: player.x,
        y: player.y,
        direction: 1, // facing right by default
        rangeMultiplier: 1,
      });
    });

    it('respects shoot cooldown', () => {
      body.blocked.down = true;

      // First shot
      player.update(16, input({ shoot: true }));
      expect(scene.events.emit).toHaveBeenCalledTimes(1);

      // Immediate second shot - blocked by cooldown
      player.update(16, input({ shoot: true }));
      expect(scene.events.emit).toHaveBeenCalledTimes(1);
    });

    it('allows shooting after cooldown expires', () => {
      body.blocked.down = true;

      player.update(16, input({ shoot: true }));
      expect(scene.events.emit).toHaveBeenCalledTimes(1);

      // Wait for cooldown (300ms from config)
      player.update(BALANCE.player.shootCooldown + 1, input());

      player.update(16, input({ shoot: true }));
      expect(scene.events.emit).toHaveBeenCalledTimes(2);
    });

    it('shoots left when facing left', () => {
      body.blocked.down = true;

      // Face left first
      player.update(16, input({ left: true }));
      scene.events.emit.mockClear();

      // Expire cooldown and shoot
      player.update(BALANCE.player.shootCooldown + 1, input());
      player.update(16, input({ left: true, shoot: true }));

      expect(scene.events.emit).toHaveBeenCalledWith(
        'player:shoot',
        expect.objectContaining({ direction: -1, rangeMultiplier: 1 }),
      );
    });
  });

  // --- Damage & Invincibility ---

  describe('damage and invincibility', () => {
    it('transitions to hit state on damage', () => {
      player.takeDamage();
      expect(player.getState()).toBe(PLAYER_STATES.HIT);
    });

    it('loses a life on damage', () => {
      const before = player.lives;
      player.takeDamage();
      expect(player.lives).toBe(before - 1);
    });

    it('becomes invincible after hit', () => {
      player.takeDamage();
      const livesAfterFirst = player.lives;

      // Try to hit again immediately - should be blocked
      // First recover from hit state via delayed callback
      delayedCallbacks[0]?.cb();
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);

      // Now try damage while invincible
      player.takeDamage();
      expect(player.lives).toBe(livesAfterFirst);
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
    });

    it('invincibility expires over time', () => {
      body.blocked.down = true;
      player.takeDamage();

      // Recover
      delayedCallbacks[0]?.cb();

      // Tick past invincibility duration
      player.update(BALANCE.player.invincibilityDuration + 1, input());

      // Now damage should work
      player.takeDamage();
      expect(player.lives).toBe(BALANCE.player.lives - 2);
    });

    it('applies knockback on hit', () => {
      player.takeDamage();
      expect(body.setVelocity).toHaveBeenCalled();
    });
  });

  // --- Death & Respawn ---

  describe('death and respawn', () => {
    it('dies when lives reach zero', () => {
      player.lives = 1;
      player.takeDamage();

      expect(player.getState()).toBe(PLAYER_STATES.DEAD);
      expect(player.active).toBe(false);
    });

    it('stops velocity on death', () => {
      player.lives = 1;
      player.takeDamage();

      expect(body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    it('does not process input when dead', () => {
      player.lives = 1;
      player.takeDamage();
      body.setVelocityX.mockClear();

      player.update(16, input({ right: true }));
      expect(body.setVelocityX).not.toHaveBeenCalled();
    });

    it('respawns with full lives and invincibility', () => {
      player.lives = 1;
      player.takeDamage();
      expect(player.getState()).toBe(PLAYER_STATES.DEAD);

      player.respawn(64, 50);

      expect(player.getState()).toBe(PLAYER_STATES.IDLE);
      expect(player.lives).toBe(BALANCE.player.lives);
      expect(player.active).toBe(true);
      expect(player.x).toBe(64);
      expect(player.y).toBe(50);
    });

    it('is invincible after respawn', () => {
      player.lives = 1;
      player.takeDamage();
      player.respawn(64, 50);

      // Should not take damage due to invincibility
      const livesAfterRespawn = player.lives;
      player.takeDamage();
      expect(player.lives).toBe(livesAfterRespawn);
    });
  });

  // --- Input blocking in hit state ---

  describe('input blocking', () => {
    it('does not process input when in hit state', () => {
      player.takeDamage();
      body.setVelocityX.mockClear();

      player.update(16, input({ right: true }));
      expect(body.setVelocityX).not.toHaveBeenCalled();
    });

    it('resumes input after recovering from hit', () => {
      body.blocked.down = true;
      player.takeDamage();

      // Recover
      delayedCallbacks[0]?.cb();
      expect(player.getState()).toBe(PLAYER_STATES.IDLE);

      // Expire invincibility
      player.update(BALANCE.player.invincibilityDuration + 1, input());

      // Input should work again
      player.update(16, input({ right: true }));
      expect(player.getState()).toBe(PLAYER_STATES.RUNNING);
    });
  });
});
