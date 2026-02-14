import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Snowball } from '../entities/Snowball';
import { PowerUp } from '../entities/PowerUp';
import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { InputManager } from '../systems/InputManager';
import { SpawnManager } from '../systems/SpawnManager';
import { CollisionManager } from '../systems/CollisionManager';
import { ComboSystem } from '../systems/ComboSystem';
import { SaveManager } from '../systems/SaveManager';
import { LevelData } from '../types/levels';
import { PowerUpType } from '../types/entities';
import { BALANCE } from '../config/balance.config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spawnManager!: SpawnManager;
  private collisionManager!: CollisionManager;
  private comboSystem!: ComboSystem;
  private snowballs!: Phaser.GameObjects.Group;
  private powerUps!: Phaser.GameObjects.Group;
  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  private createTestLevel(): LevelData {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    return {
      id: 1,
      name: 'Test Level',
      tilemap: {
        width: 20,
        height: 15,
        tileSize: 16,
        layers: []
      },
      spawns: [
        {
          enemyType: 'goblin',
          x: width * 0.2,
          y: height - 120,
          delay: 1000,
          wave: 1
        },
        {
          enemyType: 'demon',
          x: width * 0.8,
          y: height - 120,
          delay: 2000,
          wave: 1
        },
        {
          enemyType: 'goblin',
          x: width * 0.5,
          y: height - 180,
          delay: 3000,
          wave: 2
        },
        {
          enemyType: 'red_demon',
          x: width * 0.6,
          y: height - 180,
          delay: 4000,
          wave: 2
        }
      ],
      playerStart: {
        x: width / 2,
        y: height - 100
      },
      timeLimit: 180,
      bgmKey: 'level1',
      background: 'bg1',
      isBossLevel: false
    };
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Load save data
    const saveData = SaveManager.load();

    // Create placeholder background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Create platforms (placeholder - will be replaced with tilemap later)
    this.platforms = this.physics.add.staticGroup();

    // Ground platform
    const ground = this.add.rectangle(width / 2, height - 10, width, 20, 0x8B4513);
    this.platforms.add(ground);

    // Middle platforms
    const platform1 = this.add.rectangle(width / 4, height - 80, 80, 16, 0x8B4513);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(width * 3 / 4, height - 80, 80, 16, 0x8B4513);
    this.platforms.add(platform2);

    const platform3 = this.add.rectangle(width / 2, height - 140, 100, 16, 0x8B4513);
    this.platforms.add(platform3);

    // Create test level data
    const testLevel = this.createTestLevel();

    // Create player
    this.player = new Player(this, testLevel.playerStart.x, testLevel.playerStart.y);

    // Create placeholder sprite for player (colored rectangle)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(0, 0, 24, 32);
    playerGraphics.generateTexture('player', 24, 32);
    playerGraphics.destroy();

    // Set player texture
    this.player.setTexture('player');

    // Create input manager
    this.inputManager = new InputManager(this);

    // Create spawn manager
    this.spawnManager = new SpawnManager(this, testLevel);

    // Create snowballs group
    this.snowballs = this.add.group();

    // Create powerUps group
    this.powerUps = this.add.group({
      classType: PowerUp,
      runChildUpdate: true,
    });

    // Create collision manager
    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.spawnManager.getEnemies(),
      this.platforms,
      this.snowballs,
      this.powerUps
    );

    // Create combo system
    this.comboSystem = new ComboSystem(this);

    // Listen for frozen enemies to convert them to snowballs
    this.events.on('enemy:frozen', this.handleEnemyFrozen, this);

    // Listen for enemy defeated to update score
    this.events.on('enemy:defeated', this.handleEnemyDefeated, this);

    // Listen for power-up collection
    this.events.on('powerup:collected', this.handlePowerUpCollected, this);

    // Start spawning enemies
    this.spawnManager.start();

    // Listen for level complete event
    this.events.on('level:complete', this.handleLevelComplete, this);

    // Listen for player death event
    this.events.on('player:died', this.handlePlayerDeath, this);

    // Add HUD text
    this.hudText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
    });
    this.updateHUD();

    // Add instructions
    this.add.text(width / 2, 20, 'Arrow Keys/WASD: Move | Space/W/Up: Jump | Z/J: Shoot | ESC/P: Pause', {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  update(time: number, delta: number): void {
    // Get input state
    const inputState = this.inputManager.getInputState();

    // Update player
    this.player.update(delta, inputState);

    // Update enemies
    this.spawnManager.update(delta, this.player);

    // Update snowballs
    this.snowballs.getChildren().forEach((child) => {
      const snowball = child as Snowball;
      if (snowball.active) {
        snowball.update();
      }
    });

    // Update HUD
    this.updateHUD();

    // Handle pause
    if (inputState.pause) {
      this.scene.pause();
      this.scene.launch('PauseScene');
    }
  }

  private updateHUD(): void {
    const lives = this.player.getLives();
    const score = this.player.getScore();
    const remaining = this.spawnManager.getRemainingEnemies();
    const total = this.spawnManager.getTotalEnemies();
    const activePowerUps = this.player.getActivePowerUps();
    const saveData = SaveManager.load();

    const powerUpText = activePowerUps.length > 0
      ? `\nPowerUps: ${activePowerUps.join(', ')}`
      : '';

    this.hudText.setText(`Lives: ${lives}\nScore: ${score}\nHigh Score: ${saveData.highScore}\nEnemies: ${remaining}/${total}${powerUpText}`);
  }

  private handleEnemyFrozen(enemy: BaseEnemy): void {
    if (!enemy.active) return;

    // Create snowball at enemy position
    const snowball = new Snowball(
      this,
      enemy.x,
      enemy.y,
      `enemy_${Date.now()}_${Math.random()}`
    );

    // Add snowball to group
    this.snowballs.add(snowball);

    // Random power-up drop
    const roll = Math.random();
    let cumulativeChance = 0;

    for (const [type, config] of Object.entries(BALANCE.powerUps)) {
      cumulativeChance += config.dropChance;
      if (roll < cumulativeChance) {
        const powerUp = new PowerUp(this, enemy.x, enemy.y, type as PowerUpType);
        this.powerUps.add(powerUp);
        break;
      }
    }

    // Remove the frozen enemy (it's now a snowball)
    enemy.setActive(false);
    enemy.setVisible(false);
  }

  private handleEnemyDefeated(data: { enemy: BaseEnemy; score: number }): void {
    // Add score to player
    this.player.addScore(data.score);

    // Update high score
    SaveManager.updateHighScore(this.player.getScore());

    // Update stats
    const saveData = SaveManager.load();
    SaveManager.updateStats({
      totalEnemiesDefeated: saveData.stats.totalEnemiesDefeated + 1,
    });
  }

  private handlePowerUpCollected(data: { type: PowerUpType; powerup: PowerUp }): void {
    this.player.applyPowerUp(data.type);
  }

  private handleLevelComplete(): void {
    // Update level progress
    const saveData = SaveManager.load();
    SaveManager.updateLevelProgress(saveData.currentLevel);

    // Show level complete message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
      fontSize: '32px',
      color: '#ffff00',
    }).setOrigin(0.5);

    // Pause the game after a short delay
    this.time.delayedCall(2000, () => {
      this.scene.pause();
    });
  }

  private handlePlayerDeath(): void {
    // Update stats
    const saveData = SaveManager.load();
    SaveManager.updateStats({
      gamesPlayed: saveData.stats.gamesPlayed + 1,
    });

    this.scene.start('GameOverScene');
  }
}
