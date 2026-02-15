import Phaser from 'phaser';
import { StateMachine } from '../fsm/StateMachine';
import {
  PlayerState,
  PlayerEvent,
  PLAYER_STATES,
  PLAYER_EVENTS,
} from '../fsm/PlayerStates';
import { InputState } from '../types/input';
import { BALANCE } from '../config/balance.config';
import { PowerUpType } from '../types/entities';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private stateMachine: StateMachine<PlayerState, PlayerEvent>;
  private shootCooldown: number = 0;
  private invincibilityTimer: number = 0;
  public lives: number;
  private activePowerUps: Map<PowerUpType, number> = new Map();
  private baseSpeed: number = BALANCE.player.speed;
  private baseShootCooldown: number = BALANCE.player.shootCooldown;
  private score: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.lives = BALANCE.player.lives;

    this.setupPhysics();

    this.stateMachine = new StateMachine<PlayerState, PlayerEvent>(
      PLAYER_STATES.IDLE,
    );
    this.setupStateMachine();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(BALANCE.player.gravity);
    body.setCollideWorldBounds(false);
    body.setSize(24, 32);
  }

  private setupStateMachine(): void {
    // Idle <-> Running
    this.stateMachine.addTransition({
      from: PLAYER_STATES.IDLE,
      to: PLAYER_STATES.RUNNING,
      event: PLAYER_EVENTS.RUN,
    });
    this.stateMachine.addTransition({
      from: PLAYER_STATES.RUNNING,
      to: PLAYER_STATES.IDLE,
      event: PLAYER_EVENTS.STOP,
    });

    // Idle/Running -> Jumping
    this.stateMachine.addTransition({
      from: PLAYER_STATES.IDLE,
      to: PLAYER_STATES.JUMPING,
      event: PLAYER_EVENTS.JUMP,
      guard: () => this.isOnGround(),
    });
    this.stateMachine.addTransition({
      from: PLAYER_STATES.RUNNING,
      to: PLAYER_STATES.JUMPING,
      event: PLAYER_EVENTS.JUMP,
      guard: () => this.isOnGround(),
    });

    // Jumping -> Falling
    this.stateMachine.addTransition({
      from: PLAYER_STATES.JUMPING,
      to: PLAYER_STATES.FALLING,
      event: PLAYER_EVENTS.FALL,
    });

    // Falling -> Idle (land)
    this.stateMachine.addTransition({
      from: PLAYER_STATES.FALLING,
      to: PLAYER_STATES.IDLE,
      event: PLAYER_EVENTS.LAND,
      guard: () => this.isOnGround(),
    });

    // Jumping -> Idle (land directly without falling phase)
    this.stateMachine.addTransition({
      from: PLAYER_STATES.JUMPING,
      to: PLAYER_STATES.IDLE,
      event: PLAYER_EVENTS.LAND,
      guard: () => this.isOnGround(),
    });

    // Any state -> Hit (except dead)
    const hittableStates = [
      PLAYER_STATES.IDLE,
      PLAYER_STATES.RUNNING,
      PLAYER_STATES.JUMPING,
      PLAYER_STATES.FALLING,
      PLAYER_STATES.SHOOTING,
    ];
    for (const state of hittableStates) {
      this.stateMachine.addTransition({
        from: state,
        to: PLAYER_STATES.HIT,
        event: PLAYER_EVENTS.HIT,
        guard: () => !this.isInvincible(),
      });
    }

    // Hit -> Idle (recover)
    this.stateMachine.addTransition({
      from: PLAYER_STATES.HIT,
      to: PLAYER_STATES.IDLE,
      event: PLAYER_EVENTS.LAND,
      guard: () => this.lives > 0,
    });

    // Hit -> Dead
    this.stateMachine.addTransition({
      from: PLAYER_STATES.HIT,
      to: PLAYER_STATES.DEAD,
      event: PLAYER_EVENTS.DIE,
      guard: () => this.lives <= 0,
    });

    // Dead -> Idle (respawn)
    this.stateMachine.addTransition({
      from: PLAYER_STATES.DEAD,
      to: PLAYER_STATES.IDLE,
      event: PLAYER_EVENTS.RESPAWN,
    });

    // State entry callbacks
    this.stateMachine.onEnter(PLAYER_STATES.JUMPING, () => this.onJump());
    this.stateMachine.onEnter(PLAYER_STATES.HIT, () => this.onHit());
    this.stateMachine.onEnter(PLAYER_STATES.DEAD, () => this.onDeath());
  }

  update(delta: number, inputState: InputState): void {
    if (!this.body || !this.active) return;

    this.shootCooldown = Math.max(0, this.shootCooldown - delta);
    this.invincibilityTimer = Math.max(0, this.invincibilityTimer - delta);
    this.updatePowerUps();

    this.updateStateMachine();
    this.handleInput(inputState);
    this.handleScreenWrap();
    this.updateVisuals();
  }

  private updateStateMachine(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const currentState = this.stateMachine.getState();

    if (currentState === PLAYER_STATES.JUMPING && body.velocity.y > 0) {
      this.stateMachine.transition(PLAYER_EVENTS.FALL);
    }

    if (
      (currentState === PLAYER_STATES.FALLING ||
        currentState === PLAYER_STATES.JUMPING) &&
      this.isOnGround()
    ) {
      this.stateMachine.transition(PLAYER_EVENTS.LAND);
    }
  }

  private handleInput(inputState: InputState): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const currentState = this.stateMachine.getState();

    if (
      currentState === PLAYER_STATES.DEAD ||
      currentState === PLAYER_STATES.HIT
    ) {
      return;
    }

    const speed = this.activePowerUps.has('speed')
      ? this.baseSpeed * BALANCE.powerUps.speed.multiplier
      : this.baseSpeed;

    if (inputState.left) {
      body.setVelocityX(-speed);
      this.setFlipX(true);
      if (currentState === PLAYER_STATES.IDLE) {
        this.stateMachine.transition(PLAYER_EVENTS.RUN);
      }
    } else if (inputState.right) {
      body.setVelocityX(speed);
      this.setFlipX(false);
      if (currentState === PLAYER_STATES.IDLE) {
        this.stateMachine.transition(PLAYER_EVENTS.RUN);
      }
    } else {
      body.setVelocityX(0);
      if (currentState === PLAYER_STATES.RUNNING) {
        this.stateMachine.transition(PLAYER_EVENTS.STOP);
      }
    }

    if (inputState.jump && this.isOnGround()) {
      this.stateMachine.transition(PLAYER_EVENTS.JUMP);
    }

    if (inputState.shoot && this.canShoot()) {
      this.shoot();
    }
  }

  private handleScreenWrap(): void {
    const gameWidth = this.scene.cameras.main.width;

    if (this.x < 0) {
      this.x = gameWidth;
    } else if (this.x > gameWidth) {
      this.x = 0;
    }
  }

  private updateVisuals(): void {
    const currentState = this.stateMachine.getState();

    switch (currentState) {
      case PLAYER_STATES.IDLE:
        this.setTint(0x4444ff); // Blue tint for visibility
        break;
      case PLAYER_STATES.RUNNING:
        this.setTint(0xaaaaff);
        break;
      case PLAYER_STATES.JUMPING:
      case PLAYER_STATES.FALLING:
        this.setTint(0xffaaaa);
        break;
      case PLAYER_STATES.HIT:
        this.setTint(0xff0000);
        break;
      case PLAYER_STATES.DEAD:
        this.setTint(0x000000);
        break;
    }

    if (this.isInvincible()) {
      this.setAlpha(Math.sin(Date.now() / 100) * 0.5 + 0.5);
    } else {
      this.setAlpha(1);
    }
  }

  private onJump(): void {
    if (!this.body) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(BALANCE.player.jumpForce);
  }

  private onHit(): void {
    this.lives--;
    this.invincibilityTimer = BALANCE.player.invincibilityDuration;

    if (this.lives <= 0) {
      this.stateMachine.transition(PLAYER_EVENTS.DIE);
    } else {
      if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(this.flipX ? 100 : -100, -200);
      }

      this.scene.time.delayedCall(500, () => {
        if (this.stateMachine.getState() === PLAYER_STATES.HIT) {
          this.stateMachine.transition(PLAYER_EVENTS.LAND);
        }
      });
    }
  }

  private onDeath(): void {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
    this.setActive(false);
    this.scene.events.emit('player:died');
  }

  private shoot(): void {
    const cooldown = this.activePowerUps.has('rapid_fire')
      ? this.baseShootCooldown * BALANCE.powerUps.rapidFire.cooldownMultiplier
      : this.baseShootCooldown;

    this.shootCooldown = cooldown;

    const rangeMultiplier = this.activePowerUps.has('range')
      ? BALANCE.powerUps.range.multiplier
      : 1.0;

    this.scene.events.emit('player:shoot', {
      x: this.x,
      y: this.y,
      direction: this.flipX ? -1 : 1,
      rangeMultiplier,
    });
  }

  private canShoot(): boolean {
    return this.shootCooldown <= 0;
  }

  private isOnGround(): boolean {
    if (!this.body) return false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  private isInvincible(): boolean {
    return this.invincibilityTimer > 0;
  }

  public takeDamage(): void {
    this.stateMachine.transition(PLAYER_EVENTS.HIT);
  }

  public respawn(x: number, y: number): void {
    this.setPosition(x, y);
    this.lives = BALANCE.player.lives;
    this.invincibilityTimer = BALANCE.player.invincibilityDuration;
    this.activePowerUps.clear();
    this.setActive(true);
    this.stateMachine.transition(PLAYER_EVENTS.RESPAWN);
  }

  public getState(): PlayerState {
    return this.stateMachine.getState();
  }

  public getLives(): number {
    return this.lives;
  }

  public getScore(): number {
    return this.score;
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public applyPowerUp(type: PowerUpType): void {
    const config = BALANCE.powerUps;

    switch (type) {
      case 'speed':
        this.activePowerUps.set('speed', Date.now() + config.speed.duration);
        break;
      case 'range':
        this.activePowerUps.set('range', Date.now() + config.range.duration);
        break;
      case 'rapid_fire':
        this.activePowerUps.set('rapid_fire', Date.now() + config.rapidFire.duration);
        break;
      case 'extra_life':
        this.lives++;
        this.scene.events.emit('player:life-gained');
        break;
      case 'bomb':
        this.scene.events.emit('player:bomb-activated');
        break;
    }
  }

  private updatePowerUps(): void {
    if (!this.activePowerUps) return;

    const now = Date.now();

    for (const [type, expiry] of this.activePowerUps.entries()) {
      if (now >= expiry) {
        this.activePowerUps.delete(type);
      }
    }
  }

  public getActivePowerUps(): PowerUpType[] {
    return Array.from(this.activePowerUps.keys());
  }
}
