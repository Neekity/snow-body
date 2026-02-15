export type SoundEffect =
  | 'shoot'
  | 'hit'
  | 'freeze'
  | 'kick'
  | 'defeat'
  | 'powerup'
  | 'jump'
  | 'death';

export type BackgroundMusic = 'game' | 'menu' | 'gameover';

export class AudioManager {
  private scene: Phaser.Scene;
  private bgm: Phaser.Sound.BaseSound | null = null;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.7;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();
  }

  private loadSettings(): void {
    // Load volume settings from SaveManager if available
    try {
      const { SaveManager } = require('./SaveManager');
      const save = SaveManager.load();
      this.sfxVolume = save.settings.sfxVolume;
      this.musicVolume = save.settings.musicVolume;
    } catch {
      // SaveManager not available, use defaults
    }
  }

  public playSFX(sound: SoundEffect): void {
    // Play sound effect with volume
    // For now, use placeholder sounds (actual audio files can be added later)
    if (!this.scene.sound.get(sound)) {
      return;
    }

    this.scene.sound.play(sound, { volume: this.sfxVolume });
  }

  public playBGM(music: BackgroundMusic, loop: boolean = true): void {
    // Stop current BGM if playing
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
    }

    // Play new BGM (placeholder for now)
    if (this.scene.sound.get(music)) {
      this.bgm = this.scene.sound.play(music, {
        volume: this.musicVolume,
        loop,
      });
    }
  }

  public stopBGM(): void {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
    }
  }

  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));

    try {
      const { SaveManager } = require('./SaveManager');
      SaveManager.updateSettings({ sfxVolume: this.sfxVolume });
    } catch {
      // SaveManager not available
    }
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));

    if (this.bgm) {
      this.bgm.setVolume(this.musicVolume);
    }

    try {
      const { SaveManager } = require('./SaveManager');
      SaveManager.updateSettings({ musicVolume: this.musicVolume });
    } catch {
      // SaveManager not available
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public getSFXVolume(): number {
    return this.sfxVolume;
  }
}
