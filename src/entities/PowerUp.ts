import Phaser from 'phaser';
import { PowerUpType } from '../types/entities';
import { BALANCE } from '../config/balance.config';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private lifespan: number = 10000; // 10 seconds before despawn
  private createdAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, 'powerup');

    this.powerUpType = type;
    this.createdAt = Date.now();

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    this.setupPhysics();

    // Create placeholder texture if it doesn't exist
    if (!scene.textures.exists('powerup')) {
      this.createPlaceholderTexture(scene);
    }

    // Set visual based on type
    this.updateVisual();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0.3, 0.3);
    body.setSize(16, 16);
  }

  private createPlaceholderTexture(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffff00, 1); // Yellow for powerup
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('powerup', 16, 16);
    graphics.destroy();
  }

  private updateVisual(): void {
    // Set different tints for different power-up types
    switch (this.powerUpType) {
      case 'speed':
        this.setTint(0xff0000); // Red
        break;
      case 'range':
        this.setTint(0x0000ff); // Blue
        break;
      case 'rapid_fire':
        this.setTint(0xffff00); // Yellow
        break;
      case 'extra_life':
        this.setTint(0x00ff00); // Green
        break;
      case 'bomb':
        this.setTint(0xff00ff); // Magenta
        break;
    }
  }

  update(): void {
    if (!this.active) return;

    // Check lifespan
    const age = Date.now() - this.createdAt;
    if (age >= this.lifespan) {
      this.destroy();
    }

    // Blink when about to despawn (last 3 seconds)
    if (age >= this.lifespan - 3000) {
      this.setAlpha(Math.sin(Date.now() / 100) * 0.5 + 0.5);
    }
  }

  public collect(): void {
    // Emit event for player to handle
    this.scene.events.emit('powerup:collected', {
      type: this.powerUpType,
      powerup: this,
    });

    this.destroy();
  }

  public getType(): PowerUpType {
    return this.powerUpType;
  }
}
