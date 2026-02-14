import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);

    // Score text (placeholder)
    const scoreText = this.add.text(width / 2, height / 2 - 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
    });
    scoreText.setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(width / 2, height / 2 + 40, 'Retry', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    retryButton.setOrigin(0.5);
    retryButton.setInteractive({ useHandCursor: true });

    retryButton.on('pointerover', () => {
      retryButton.setStyle({ backgroundColor: '#555555' });
    });
    retryButton.on('pointerout', () => {
      retryButton.setStyle({ backgroundColor: '#333333' });
    });

    retryButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Menu button
    const menuButton = this.add.text(width / 2, height / 2 + 100, 'Main Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#555555' });
    });
    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#333333' });
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
