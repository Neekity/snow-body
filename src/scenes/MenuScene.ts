import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, height / 3, 'Snow Bros', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // Button hover effect
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#555555' });
    });
    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#333333' });
    });

    // Start game on click
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Also allow Enter key to start
    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}
