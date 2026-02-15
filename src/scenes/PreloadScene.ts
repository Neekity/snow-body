import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    this.createLoadingBar();

    // Set up loading progress callbacks
    this.load.on('progress', this.updateLoadingBar, this);
    this.load.on('complete', this.onLoadComplete, this);

    // TODO: Load all game assets here
    // For now, we'll just simulate loading
    // this.load.atlas('player', 'assets/sprites/player.png', 'assets/sprites/player.json');
    // this.load.atlas('enemies', 'assets/sprites/enemies.png', 'assets/sprites/enemies.json');
    // etc.

    // TODO: Load audio files when available
    // Sound effects
    // this.load.audio('shoot', 'assets/audio/sfx/shoot.mp3');
    // this.load.audio('hit', 'assets/audio/sfx/hit.mp3');
    // this.load.audio('freeze', 'assets/audio/sfx/freeze.mp3');
    // this.load.audio('kick', 'assets/audio/sfx/kick.mp3');
    // this.load.audio('defeat', 'assets/audio/sfx/defeat.mp3');
    // this.load.audio('powerup', 'assets/audio/sfx/powerup.mp3');
    // this.load.audio('jump', 'assets/audio/sfx/jump.mp3');
    // this.load.audio('death', 'assets/audio/sfx/death.mp3');

    // Background music
    // this.load.audio('game', 'assets/audio/bgm/game.mp3');
    // this.load.audio('menu', 'assets/audio/bgm/menu.mp3');
    // this.load.audio('gameover', 'assets/audio/bgm/gameover.mp3');
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background bar
    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0x222222, 0.8);
    this.progressBar.fillRect(width / 4, height / 2 - 15, width / 2, 30);

    // Loading bar
    this.loadingBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);
  }

  private updateLoadingBar(progress: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.loadingBar.clear();
    this.loadingBar.fillStyle(0xffffff, 1);
    this.loadingBar.fillRect(
      width / 4 + 5,
      height / 2 - 10,
      (width / 2 - 10) * progress,
      20
    );
  }

  private onLoadComplete(): void {
    // Clean up loading bar
    this.loadingBar.destroy();
    this.progressBar.destroy();
  }

  create(): void {
    // Move to MenuScene when loading is complete
    this.scene.start('MenuScene');
  }
}
