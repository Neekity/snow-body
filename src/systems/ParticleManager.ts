export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createSnowEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: 0xffffff,
    });

    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  public createFreezeEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 10,
      tint: 0x00ffff,
    });

    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  public createDefeatEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 600,
      quantity: 15,
      tint: 0xffff00,
    });

    this.scene.time.delayedCall(700, () => {
      particles.destroy();
    });
  }

  public createPowerUpEffect(x: number, y: number, tint: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 20,
      tint,
    });

    this.scene.time.delayedCall(900, () => {
      particles.destroy();
    });
  }
}
