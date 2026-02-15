import { InputState } from '../types/input';

export class TouchControls {
  private scene: Phaser.Scene;
  private leftButton!: Phaser.GameObjects.Rectangle;
  private rightButton!: Phaser.GameObjects.Rectangle;
  private jumpButton!: Phaser.GameObjects.Circle;
  private shootButton!: Phaser.GameObjects.Circle;
  private inputState: InputState = {
    left: false,
    right: false,
    jump: false,
    shoot: false,
    pause: false,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public create(): void {
    // Only create touch controls on mobile devices
    if (!this.isMobile()) {
      return;
    }

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Left button
    this.leftButton = this.scene.add.rectangle(60, height - 80, 80, 80, 0x000000, 0.3)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    this.scene.add.text(60, height - 80, '←', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Right button
    this.rightButton = this.scene.add.rectangle(160, height - 80, 80, 80, 0x000000, 0.3)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    this.scene.add.text(160, height - 80, '→', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Jump button
    this.jumpButton = this.scene.add.circle(width - 160, height - 80, 40, 0x000000, 0.3)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    this.scene.add.text(width - 160, height - 80, 'A', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Shoot button
    this.shootButton = this.scene.add.circle(width - 60, height - 80, 40, 0x000000, 0.3)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    this.scene.add.text(width - 60, height - 80, 'B', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    // Left button
    this.leftButton.on('pointerdown', () => {
      this.inputState.left = true;
    });
    this.leftButton.on('pointerup', () => {
      this.inputState.left = false;
    });
    this.leftButton.on('pointerout', () => {
      this.inputState.left = false;
    });

    // Right button
    this.rightButton.on('pointerdown', () => {
      this.inputState.right = true;
    });
    this.rightButton.on('pointerup', () => {
      this.inputState.right = false;
    });
    this.rightButton.on('pointerout', () => {
      this.inputState.right = false;
    });

    // Jump button
    this.jumpButton.on('pointerdown', () => {
      this.inputState.jump = true;
    });
    this.jumpButton.on('pointerup', () => {
      this.inputState.jump = false;
    });

    // Shoot button
    this.shootButton.on('pointerdown', () => {
      this.inputState.shoot = true;
    });
    this.shootButton.on('pointerup', () => {
      this.inputState.shoot = false;
    });
  }

  public getInputState(): InputState {
    return this.inputState;
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public destroy(): void {
    if (this.leftButton) this.leftButton.destroy();
    if (this.rightButton) this.rightButton.destroy();
    if (this.jumpButton) this.jumpButton.destroy();
    if (this.shootButton) this.shootButton.destroy();
  }
}
