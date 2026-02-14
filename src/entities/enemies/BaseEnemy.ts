import Phaser from 'phaser';
import { StateMachine } from '../../fsm/StateMachine';
import { EnemyState, EnemyEvent, ENEMY_STATES, ENEMY_EVENTS } from '../../fsm/EnemyStates';
import { EnemyConfig } from '../../types/entities';

export abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  protected stateMachine: StateMachine<EnemyState, EnemyEvent>;
  protected config: EnemyConfig;
  protected snowLevel: number = 0;
  protected meltTimer: number = 0;
  protected direction: number = 1; // 1 = right, -1 = left
  protected player?: Phaser.Physics.Arcade.Sprite;
  protected turnCooldown: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EnemyConfig
  ) {
    super(scene, x, y, texture);

    this.config = config;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    this.setupPhysics();

    // Setup state machine
    this.stateMachine = new StateMachine<EnemyState, EnemyEvent>(ENEMY_STATES.PATROL);
    this.setupStateMachine();
  }

  protected setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false); // We handle wrapping manually
    body.setSize(24, 32);
  }

  protected setupStateMachine(): void {
    // Patrol <-> Chase
    this.stateMachine.addTransition({
      from: ENEMY_STATES.PATROL,
      to: ENEMY_STATES.CHASE,
      event: ENEMY_EVENTS.START_CHASE,
      guard: () => this.canChase(),
    });
    this.stateMachine.addTransition({
      from: ENEMY_STATES.CHASE,
      to: ENEMY_STATES.PATROL,
      event: ENEMY_EVENTS.STOP_CHASE,
    });

    // Any state -> Stunned (when hit by snow)
    [ENEMY_STATES.PATROL, ENEMY_STATES.CHASE].forEach(state => {
      this.stateMachine.addTransition({
        from: state,
        to: ENEMY_STATES.STUNNED,
        event: ENEMY_EVENTS.STUN,
      });
    });

    // Stunned -> Frozen (when fully covered)
    this.stateMachine.addTransition({
      from: ENEMY_STATES.STUNNED,
      to: ENEMY_STATES.FROZEN,
      event: ENEMY_EVENTS.FREEZE,
      guard: () => this.snowLevel >= 100,
    });

    // Frozen -> Patrol (if snow melts)
    this.stateMachine.addTransition({
      from: ENEMY_STATES.FROZEN,
      to: ENEMY_STATES.PATROL,
      event: ENEMY_EVENTS.UNFREEZE,
    });

    // Any state -> Dead
    [ENEMY_STATES.PATROL, ENEMY_STATES.CHASE, ENEMY_STATES.STUNNED, ENEMY_STATES.FROZEN].forEach(state => {
      this.stateMachine.addTransition({
        from: state,
        to: ENEMY_STATES.DEAD,
        event: ENEMY_EVENTS.DIE,
      });
    });

    // Setup state entry callbacks
    this.stateMachine.onEnter(ENEMY_STATES.FROZEN, () => this.onFreeze());
    this.stateMachine.onEnter(ENEMY_STATES.DEAD, () => this.onDeath());
  }

  update(delta: number, player?: Phaser.Physics.Arcade.Sprite): void {
    if (!this.body || !this.active) return;

    this.player = player;

    // Update timers
    this.updateSnowMelt(delta);

    // Update state machine
    this.updateStateMachine();

    // Update behavior based on state
    const currentState = this.stateMachine.getState();
    switch (currentState) {
      case ENEMY_STATES.PATROL:
        this.updatePatrol();
        break;
      case ENEMY_STATES.CHASE:
        this.updateChase();
        break;
      case ENEMY_STATES.STUNNED:
        this.updateStunned();
        break;
      case ENEMY_STATES.FROZEN:
        // Frozen enemies don't move
        break;
      case ENEMY_STATES.DEAD:
        // Dead enemies don't move
        break;
    }

    // Handle screen wrapping
    this.handleScreenWrap();

    // Update visuals
    this.updateVisuals();
  }

  protected updateStateMachine(): void {
    const currentState = this.stateMachine.getState();

    // Check for chase conditions
    if (currentState === ENEMY_STATES.PATROL && this.shouldChasePlayer()) {
      this.stateMachine.transition(ENEMY_EVENTS.START_CHASE);
    } else if (currentState === ENEMY_STATES.CHASE && !this.shouldChasePlayer()) {
      this.stateMachine.transition(ENEMY_EVENTS.STOP_CHASE);
    }

    // Check for freeze
    if (currentState === ENEMY_STATES.STUNNED && this.snowLevel >= 100) {
      this.stateMachine.transition(ENEMY_EVENTS.FREEZE);
    }

    // Check for unfreeze (snow melted)
    if (currentState === ENEMY_STATES.FROZEN && this.snowLevel < 100) {
      this.stateMachine.transition(ENEMY_EVENTS.UNFREEZE);
    }
  }

  protected updatePatrol(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Move in current direction
    body.setVelocityX(this.config.speed * this.direction);
    this.setFlipX(this.direction < 0);

    // Update turn cooldown
    if (this.turnCooldown > 0) {
      this.turnCooldown -= 16; // Approximate delta (60fps = ~16ms)
      return;
    }

    // Turn around at edges or walls (if on ground)
    if (body.blocked.down && (body.blocked.left || body.blocked.right)) {
      this.direction *= -1;
      this.turnCooldown = 500; // 500ms cooldown before next turn
    }
  }

  protected updateChase(): void {
    if (!this.body || !this.player) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Chase player
    const directionToPlayer = Math.sign(this.player.x - this.x);
    body.setVelocityX(this.config.speed * 1.5 * directionToPlayer);
    this.setFlipX(directionToPlayer < 0);
  }

  protected updateStunned(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Slow down when stunned
    body.setVelocityX(body.velocity.x * 0.9);
  }

  protected updateSnowMelt(delta: number): void {
    if (this.snowLevel > 0 && this.snowLevel < 100) {
      this.meltTimer += delta;

      // Melt snow over time
      if (this.meltTimer >= 1000) {
        this.snowLevel = Math.max(0, this.snowLevel - this.config.meltRate);
        this.meltTimer = 0;

        // Return to patrol if snow melted completely
        if (this.snowLevel === 0 && this.stateMachine.getState() === ENEMY_STATES.STUNNED) {
          this.stateMachine.setState(ENEMY_STATES.PATROL);
        }
      }
    }
  }

  protected handleScreenWrap(): void {
    const gameWidth = this.scene.cameras.main.width;

    if (this.x < 0) {
      this.x = gameWidth;
    } else if (this.x > gameWidth) {
      this.x = 0;
    }
  }

  protected updateVisuals(): void {
    const currentState = this.stateMachine.getState();

    // Update tint based on snow level and state
    if (currentState === ENEMY_STATES.FROZEN) {
      this.setTint(0x00ffff); // Cyan for frozen
    } else if (this.snowLevel > 66) {
      this.setTint(0xaaffff); // Light blue for heavily snowed
    } else if (this.snowLevel > 33) {
      this.setTint(0xddffff); // Very light blue for partially snowed
    } else if (currentState === ENEMY_STATES.DEAD) {
      this.setTint(0x000000); // Black for dead
    } else {
      this.clearTint();
    }
  }

  protected shouldChasePlayer(): boolean {
    if (!this.player || this.config.detectionRange === 0) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    );

    return distance < this.config.detectionRange;
  }

  protected canChase(): boolean {
    return this.config.detectionRange > 0;
  }

  protected onFreeze(): void {
    if (!this.body) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Emit event for conversion to snowball
    this.scene.events.emit('enemy:frozen', this);
  }

  protected onDeath(): void {
    this.setActive(false);
    this.setVisible(false);

    // Emit event for scoring
    this.scene.events.emit('enemy:defeated', {
      enemy: this,
      score: this.config.scoreValue,
    });
  }

  public applySnow(amount: number): void {
    this.snowLevel = Math.min(100, this.snowLevel + amount);

    // Transition to stunned if not already
    const currentState = this.stateMachine.getState();
    if (currentState === ENEMY_STATES.PATROL || currentState === ENEMY_STATES.CHASE) {
      this.stateMachine.transition(ENEMY_EVENTS.STUN);
    }
  }

  public defeat(): void {
    this.stateMachine.transition(ENEMY_EVENTS.DIE);
  }

  public getState(): EnemyState {
    return this.stateMachine.getState();
  }

  public getSnowLevel(): number {
    return this.snowLevel;
  }

  public getScoreValue(): number {
    return this.config.scoreValue;
  }
}