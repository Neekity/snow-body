import Phaser from 'phaser';
import { BALANCE } from '../config/balance.config';

export class SnowShot extends Phaser.Physics.Arcade.Sprite {
  private distanceTraveled: number = 0;
  private startX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    super(scene, x, y, 'snowshot');

    this.startX = x;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(BALANCE.snowShot.speed * direction);
      body.setSize(8, 8);
    }

    // Create placeholder texture if it doesn't exist
    if (!scene.textures.exists('snowshot')) {
      this.createPlaceholderTexture(scene);
    }
  }

  private createPlaceholderTexture(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('snowshot', 8, 8);
    graphics.destroy();
  }

  update(): void {
    if (!this.active) return;

    // Track distance traveled
    this.distanceTraveled = Math.abs(this.x - this.startX);

    // Destroy if exceeded range
    if (this.distanceTraveled >= BALANCE.snowShot.range) {
      this.destroy();
    }
  }

  public hit(): void {
    // Called when snow shot hits an enemy
    this.destroy();
  }
}
