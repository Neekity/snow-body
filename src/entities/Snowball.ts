import Phaser from 'phaser';
import { BALANCE } from '../config/balance.config';

export class Snowball extends Phaser.Physics.Arcade.Sprite {
  private bounceCount: number = 0;
  private isRolling: boolean = false;
  private enemyId: string;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyId: string) {
    super(scene, x, y, 'snowball');

    this.enemyId = enemyId;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create placeholder texture if it doesn't exist
    if (!scene.textures.exists('snowball')) {
      this.createPlaceholderTexture(scene);
    }

    // Setup physics
    this.setupPhysics();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setBounce(BALANCE.snowball.bounceDecay, BALANCE.snowball.bounceDecay);
    body.setDrag(50, 0);
    body.setCircle(12);
  }

  private createPlaceholderTexture(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('snowball', 24, 24);
    graphics.destroy();
  }

  public kick(direction: number): void {
    if (this.isRolling) return;

    this.isRolling = true;

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(BALANCE.snowball.kickSpeed * direction);
    }

    this.scene.events.emit('snowball:kicked', {
      snowball: this,
      snowballId: this.enemyId,
    });
  }

  update(): void {
    if (!this.active || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Handle screen wrapping
    this.handleScreenWrap();

    // Check for wall bounce
    if (body.blocked.left || body.blocked.right) {
      this.onWallBounce();
    }

    // Stop rolling if velocity is very low
    if (this.isRolling && Math.abs(body.velocity.x) < 10) {
      this.stopRolling();
    }

    // Rotate based on velocity (visual effect)
    if (this.isRolling) {
      this.rotation += body.velocity.x * 0.01;
    }
  }

  private onWallBounce(): void {
    this.bounceCount++;

    this.scene.events.emit('snowball:bounce', {
      snowball: this,
      bounceCount: this.bounceCount,
    });

    if (this.bounceCount >= BALANCE.snowball.maxBounces) {
      this.destroy();
    }
  }

  private stopRolling(): void {
    this.isRolling = false;

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
  }

  private handleScreenWrap(): void {
    const gameWidth = this.scene.cameras.main.width;

    if (this.x < -24) {
      this.x = gameWidth + 24;
    } else if (this.x > gameWidth + 24) {
      this.x = -24;
    }
  }

  public getEnemyId(): string {
    return this.enemyId;
  }

  public isCurrentlyRolling(): boolean {
    return this.isRolling;
  }

  public onEnemyHit(enemy: Phaser.GameObjects.Sprite): void {
    this.scene.events.emit('snowball:hit_enemy', {
      snowball: this,
      snowballId: this.enemyId,
      enemy: enemy,
    });
  }
}
