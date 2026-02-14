import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { BALANCE } from '../../config/balance.config';

export class Demon extends BaseEnemy {
  private jumpTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'demon', BALANCE.enemies.demon);

    // Demon-specific setup
    this.setTint(0x6666ff); // Blue tint for demon
  }

  protected updatePatrol(): void {
    super.updatePatrol();

    // Demon can jump between platforms
    this.jumpTimer += 16; // Approximate delta

    if (this.jumpTimer >= 2000 && this.isOnGround()) {
      this.jump();
      this.jumpTimer = 0;
    }
  }

  private jump(): void {
    if (!this.body) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.config.jumpForce) {
      body.setVelocityY(this.config.jumpForce);
    }
  }

  private isOnGround(): boolean {
    if (!this.body) return false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }
}
