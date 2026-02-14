import Phaser from 'phaser';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Victory text
    const victoryText = this.add.text(width / 2, height / 3, 'VICTORY!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    victoryText.setOrigin(0.5);

    // Score text (placeholder)
    const scoreText = this.add.text(width / 2, height / 2 - 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
    });
    scoreText.setOrigin(0.5);

    // Continue button
    const continueButton = this.add.text(width / 2, height / 2 + 40, 'Continue', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    continueButton.setOrigin(0.5);
    continueButton.setInteractive({ useHandCursor: true });

    continueButton.on('pointerover', () => {
      continueButton.setStyle({ backgroundColor: '#555555' });
    });
    continueButton.on('pointerout', () => {
      continueButton.setStyle({ backgroundColor: '#333333' });
    });

    continueButton.on('pointerdown', () => {
      // TODO: Load next level
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
