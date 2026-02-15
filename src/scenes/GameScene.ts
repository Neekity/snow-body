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
import { AudioManager } from '../systems/AudioManager';
import { ParticleManager } from '../systems/ParticleManager';
import { ScreenShake } from '../systems/ScreenShake';
import { TouchControls } from '../systems/TouchControls';
import { LevelLoader } from '../systems/LevelLoader';
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
  private audioManager!: AudioManager;
  private particleManager!: ParticleManager;
  private screenShake!: ScreenShake;
  private touchControls!: TouchControls;
  private snowballs!: Phaser.GameObjects.Group;
  private powerUps!: Phaser.GameObjects.Group;
  private hudText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;

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

    // Load save data to get current level
    const saveData = SaveManager.load();
    this.currentLevel = saveData.currentLevel;

    // Load level data
    const levelData = LevelLoader.loadLevel(this.currentLevel);
    if (!levelData) {
      console.error('Failed to load level:', this.currentLevel);
      return;
    }

    // Create background based on level
    const bgColors = [
      0x87CEEB, 0x98D8E8, 0xB0E0E6, 0x87CEFA, 0x4682B4,
      0x5F9EA0, 0x6495ED, 0x7B68EE, 0x9370DB, 0x8B7D8B,
    ];
    const bgColor = bgColors[(this.currentLevel - 1) % bgColors.length];
    this.add.rectangle(0, 0, width, height, bgColor).setOrigin(0);

    // Create particle texture for effects
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // Initialize systems
    this.audioManager = new AudioManager(this);
    this.particleManager = new ParticleManager(this);
    this.screenShake = new ScreenShake(this);
    this.touchControls = new TouchControls(this);

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

    // Create player
    this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);

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

    // Create spawn manager with level data
    this.spawnManager = new SpawnManager(this, levelData);

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

    // Create touch controls
    this.touchControls.create();

    // Play background music
    this.audioManager.playBGM('game');

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

    // Listen for player actions for audio feedback
    this.events.on('player:shoot', () => {
      this.audioManager.playSFX('shoot');
      this.screenShake.shakeLight();
    });

    this.events.on('player:jump', () => {
      this.audioManager.playSFX('jump');
    });

    this.events.on('player:hit', () => {
      this.audioManager.playSFX('hit');
      this.screenShake.shakeMedium();
    });

    this.events.on('snowball:kick', (data: { x: number; y: number }) => {
      this.audioManager.playSFX('kick');
      this.particleManager.createSnowEffect(data.x, data.y);
      this.screenShake.shakeLight();
    });

    // Listen for boss events
    this.events.on('boss:attack', this.handleBossAttack, this);
    this.events.on('boss:defeated', this.handleBossDefeated, this);
    this.events.on('boss:explosion', this.handleBossExplosion, this);

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
    // Get input state from keyboard
    const keyboardInput = this.inputManager.getInputState();

    // Get input state from touch controls
    const touchInput = this.touchControls.getInputState();

    // Merge keyboard and touch inputs
    const inputState = {
      left: keyboardInput.left || touchInput.left,
      right: keyboardInput.right || touchInput.right,
      jump: keyboardInput.jump || touchInput.jump,
      shoot: keyboardInput.shoot || touchInput.shoot,
      pause: keyboardInput.pause || touchInput.pause,
    };

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

    // Play freeze sound and effects
    this.audioManager.playSFX('freeze');
    this.particleManager.createFreezeEffect(enemy.x, enemy.y);
    this.screenShake.shakeLight();

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
    // Play defeat sound and effects
    this.audioManager.playSFX('defeat');
    this.particleManager.createDefeatEffect(data.enemy.x, data.enemy.y);
    this.screenShake.shakeMedium();

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
    // Play power-up sound and effects
    this.audioManager.playSFX('powerup');
    this.particleManager.createPowerUpEffect(
      data.powerup.x,
      data.powerup.y,
      this.getPowerUpTint(data.type)
    );
    this.screenShake.shakeLight();

    this.player.applyPowerUp(data.type);
  }

  private getPowerUpTint(type: PowerUpType): number {
    switch (type) {
      case 'speed':
        return 0x00ff00; // Green
      case 'range':
        return 0x0000ff; // Blue
      case 'rapid_fire':
        return 0xff0000; // Red
      case 'extra_life':
        return 0xffff00; // Yellow
      case 'bomb':
        return 0xff00ff; // Magenta
      default:
        return 0xffffff; // White
    }
  }

  private handleLevelComplete(): void {
    // Update level progress
    SaveManager.updateLevelProgress(this.currentLevel);

    // Check if there are more levels
    if (this.currentLevel < LevelLoader.getTotalLevels()) {
      // Show level complete message and advance
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
        fontSize: '32px',
        color: '#ffff00',
      }).setOrigin(0.5);

      // Restart scene to load next level
      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    } else {
      // All levels complete - show victory screen
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      this.add.text(width / 2, height / 2, 'ALL LEVELS COMPLETE!', {
        fontSize: '32px',
        color: '#ffff00',
      }).setOrigin(0.5);

      this.time.delayedCall(3000, () => {
        this.scene.start('MenuScene');
      });
    }
  }

  private handleBossAttack(data: { x: number; y: number }): void {
    this.screenShake.shakeHeavy();
    this.audioManager.playSFX('hit');
  }

  private handleBossDefeated(data: { boss: any }): void {
    this.audioManager.playSFX('defeat');
    this.particleManager.createDefeatEffect(data.boss.x, data.boss.y);
    this.screenShake.shakeHeavy();

    // Level complete
    this.time.delayedCall(2000, () => {
      this.handleLevelComplete();
    });
  }

  private handleBossExplosion(data: { x: number; y: number }): void {
    // Create multiple explosion effects
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 200, () => {
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        this.particleManager.createDefeatEffect(data.x + offsetX, data.y + offsetY);
      });
    }
  }

  private handlePlayerDeath(): void {
    // Play death sound and effects
    this.audioManager.playSFX('death');
    this.screenShake.shakeHeavy();
    this.audioManager.stopBGM();

    // Update stats
    const saveData = SaveManager.load();
    SaveManager.updateStats({
      gamesPlayed: saveData.stats.gamesPlayed + 1,
    });

    this.scene.start('GameOverScene');
  }
}
