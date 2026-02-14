import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load assets needed for the loading screen
    // For now, we'll use simple graphics
  }

  create(): void {
    // Minimal setup, then move to PreloadScene
    this.scene.start('PreloadScene');
  }
}
