import Phaser from 'phaser';
import { LevelData, SpawnPoint } from '../types/levels';
import { Goblin } from '../entities/enemies/Goblin';
import { Demon } from '../entities/enemies/Demon';
import { RedDemon } from '../entities/enemies/RedDemon';
import { BaseEnemy } from '../entities/enemies/BaseEnemy';

export class SpawnManager {
  private scene: Phaser.Scene;
  private levelData: LevelData;
  private enemies: Phaser.GameObjects.Group;
  private spawnedCount: number = 0;
  private totalEnemies: number = 0;

  constructor(scene: Phaser.Scene, levelData: LevelData) {
    this.scene = scene;
    this.levelData = levelData;
    this.enemies = scene.add.group();
    this.totalEnemies = levelData.spawns.length;
  }

  start(): void {
    // Schedule all spawns based on their delay
    this.levelData.spawns.forEach(spawnPoint => {
      this.scene.time.delayedCall(spawnPoint.delay, () => {
        this.spawnEnemy(spawnPoint);
      });
    });
  }

  private spawnEnemy(spawnPoint: SpawnPoint): void {
    let enemy: BaseEnemy;

    // Create placeholder texture for enemy if it doesn't exist
    if (!this.scene.textures.exists(spawnPoint.enemyType)) {
      this.createPlaceholderTexture(spawnPoint.enemyType);
    }

    // Create enemy based on type
    switch (spawnPoint.enemyType) {
      case 'goblin':
        enemy = new Goblin(this.scene, spawnPoint.x, spawnPoint.y);
        break;
      case 'demon':
        enemy = new Demon(this.scene, spawnPoint.x, spawnPoint.y);
        break;
      case 'red_demon':
        enemy = new RedDemon(this.scene, spawnPoint.x, spawnPoint.y);
        break;
      default:
        console.warn(`Unknown enemy type: ${spawnPoint.enemyType}`);
        return;
    }

    // Set texture
    enemy.setTexture(spawnPoint.enemyType);

    // Add to group
    this.enemies.add(enemy);
    this.spawnedCount++;

    // Listen for enemy defeat
    this.scene.events.once('enemy:defeated', (data: any) => {
      if (data.enemy === enemy) {
        this.onEnemyDefeated();
      }
    });
  }

  private createPlaceholderTexture(enemyType: string): void {
    const graphics = this.scene.add.graphics();

    // Different colors for different enemy types
    let color = 0xffffff;
    switch (enemyType) {
      case 'goblin':
        color = 0xff6666;
        break;
      case 'demon':
        color = 0x6666ff;
        break;
      case 'red_demon':
        color = 0xff66ff;
        break;
    }

    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 24, 32);
    graphics.generateTexture(enemyType, 24, 32);
    graphics.destroy();
  }

  private onEnemyDefeated(): void {
    const remainingEnemies = this.getRemainingEnemies();

    if (remainingEnemies === 0) {
      // All enemies defeated - level complete
      this.scene.events.emit('level:complete');
    }
  }

  update(delta: number, player?: Phaser.Physics.Arcade.Sprite): void {
    // Update all active enemies
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as BaseEnemy;
      if (enemy.active) {
        enemy.update(delta, player);
      }
    });
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  getRemainingEnemies(): number {
    return this.enemies.getChildren().filter(child => (child as BaseEnemy).active).length;
  }

  getTotalEnemies(): number {
    return this.totalEnemies;
  }

  getSpawnedCount(): number {
    return this.spawnedCount;
  }

  destroy(): void {
    this.enemies.clear(true, true);
  }
}
