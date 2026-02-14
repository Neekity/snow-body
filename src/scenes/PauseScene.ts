import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Pause text
    const pauseText = this.add.text(width / 2, height / 3, 'PAUSED', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    pauseText.setOrigin(0.5);

    // Resume button
    const resumeButton = this.add.text(width / 2, height / 2, 'Resume', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive({ useHandCursor: true });

    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#555555' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#333333' });
    });

    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });

    // Quit button
    const quitButton = this.add.text(width / 2, height / 2 + 60, 'Quit to Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    quitButton.setOrigin(0.5);
    quitButton.setInteractive({ useHandCursor: true });

    quitButton.on('pointerover', () => {
      quitButton.setStyle({ backgroundColor: '#555555' });
    });
    quitButton.on('pointerout', () => {
      quitButton.setStyle({ backgroundColor: '#333333' });
    });

    quitButton.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.stop('PauseScene');
      this.scene.start('MenuScene');
    });

    // Also allow ESC key to resume
    this.input.keyboard?.once('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop('PauseScene');
  }
}
