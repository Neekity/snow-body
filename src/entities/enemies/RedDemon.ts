import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { BALANCE } from '../../config/balance.config';

export class RedDemon extends BaseEnemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'red_demon', BALANCE.enemies.redDemon);

    // RedDemon-specific setup
    this.setTint(0xff66ff); // Purple/magenta tint for red demon
  }

  // RedDemon uses chase behavior from BaseEnemy
  // Has higher speed and detection range than other enemies
}
