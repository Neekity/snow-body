import { BaseEnemy } from './BaseEnemy';
import { BALANCE } from '../../config/balance.config';

export class BossEnemy extends BaseEnemy {
  private health: number;
  private maxHealth: number;
  private attackCooldown: number = 0;
  private phase: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss', BALANCE.enemies.boss);

    this.maxHealth = this.config.health;
    this.health = this.maxHealth;

    // Boss is larger
    this.setScale(2);
    this.setTint(0xff0000);
  }

  update(delta: number, player?: Phaser.Physics.Arcade.Sprite): void {
    super.update(delta, player);

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    // Update phase based on health
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent <= 0.33) {
      this.phase = 3;
    } else if (healthPercent <= 0.66) {
      this.phase = 2;
    }

    // Boss-specific behavior
    if (this.attackCooldown <= 0 && this.isOnGround()) {
      this.performAttack();
      this.attackCooldown = 3000 / this.phase; // Faster attacks in later phases
    }
  }

  private isOnGround(): boolean {
    if (!this.body) return false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  private performAttack(): void {
    // Jump attack
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(this.config.jumpForce || -350);

      // Emit event for boss attack (could trigger screen shake, particles, etc.)
      this.scene.events.emit('boss:attack', { x: this.x, y: this.y });
    }
  }

  public takeDamage(amount: number = 1): void {
    this.health -= amount;

    // Flash effect
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.setTint(0xff0000);
    });

    if (this.health <= 0) {
      this.onDefeated();
    }
  }

  private onDefeated(): void {
    // Emit boss defeated event
    this.scene.events.emit('boss:defeated', { boss: this });

    // Create explosion effect
    this.scene.events.emit('boss:explosion', { x: this.x, y: this.y });

    this.destroy();
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getPhase(): number {
    return this.phase;
  }
}
