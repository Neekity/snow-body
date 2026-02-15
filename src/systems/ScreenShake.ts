export class ScreenShake {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public shake(intensity: number = 5, duration: number = 200): void {
    this.scene.cameras.main.shake(duration, intensity / 1000);
  }

  public shakeLight(): void {
    this.shake(3, 100);
  }

  public shakeMedium(): void {
    this.shake(5, 200);
  }

  public shakeHeavy(): void {
    this.shake(10, 300);
  }
}
