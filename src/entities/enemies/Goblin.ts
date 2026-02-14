import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { BALANCE } from '../../config/balance.config';

export class Goblin extends BaseEnemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'goblin', BALANCE.enemies.goblin);

    // Goblin-specific setup
    this.setTint(0xff6666); // Red tint for goblin
  }

  // Goblin uses default patrol behavior from BaseEnemy
  // No chase behavior (detectionRange = 0)
}
