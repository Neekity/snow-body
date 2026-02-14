import Phaser from 'phaser';
import { ComboEvent, ComboState } from '../types/game-state';
import { BALANCE } from '../config/balance.config';

export class ComboSystem {
  private scene: Phaser.Scene;
  private activeCombo: ComboState | null = null;
  private comboTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.scene.events.on('snowball:hit_enemy', this.onSnowballHitEnemy, this);
    this.scene.events.on('enemy:defeated', this.onEnemyDefeated, this);
  }

  private onSnowballHitEnemy(data: {
    snowball: unknown;
    snowballId: string;
    enemy: { defeat: () => void; x: number; y: number };
  }): void {
    if (!this.activeCombo) {
      this.startCombo(data.snowballId);
    } else if (this.activeCombo.snowballId === data.snowballId) {
      this.continueCombo();
    } else {
      this.endCombo();
      this.startCombo(data.snowballId);
    }

    data.enemy.defeat();
  }

  private onEnemyDefeated(data: {
    enemy: { x: number; y: number };
    score: number;
  }): void {
    if (!this.activeCombo) return;

    const multiplier = this.calculateMultiplier(this.activeCombo.chainLength);
    const totalScore = data.score * multiplier;

    const comboEvent: ComboEvent = {
      chainLength: this.activeCombo.chainLength,
      multiplier,
      baseScore: data.score,
      totalScore,
      position: { x: data.enemy.x, y: data.enemy.y },
    };

    this.scene.events.emit('combo:score', comboEvent);
  }

  private startCombo(snowballId: string): void {
    this.activeCombo = {
      active: true,
      chainLength: 1,
      timer: BALANCE.combo.chainTimeWindow,
      snowballId,
    };

    this.resetComboTimer();
  }

  private continueCombo(): void {
    if (!this.activeCombo) return;

    this.activeCombo.chainLength++;
    this.activeCombo.timer = BALANCE.combo.chainTimeWindow;

    this.resetComboTimer();
  }

  private resetComboTimer(): void {
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    this.comboTimer = this.scene.time.delayedCall(
      BALANCE.combo.chainTimeWindow,
      () => this.endCombo(),
    );
  }

  private endCombo(): void {
    if (this.activeCombo && this.activeCombo.chainLength > 1) {
      this.scene.events.emit('combo:complete', {
        chainLength: this.activeCombo.chainLength,
        multiplier: this.calculateMultiplier(this.activeCombo.chainLength),
      });
    }

    this.activeCombo = null;

    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = undefined;
    }
  }

  private calculateMultiplier(chainLength: number): number {
    const multiplier = Math.pow(
      BALANCE.combo.baseMultiplier,
      chainLength - 1,
    );
    return Math.min(multiplier, BALANCE.combo.maxMultiplier);
  }

  public getActiveCombo(): ComboState | null {
    return this.activeCombo;
  }

  public destroy(): void {
    this.scene.events.off('snowball:hit_enemy', this.onSnowballHitEnemy, this);
    this.scene.events.off('enemy:defeated', this.onEnemyDefeated, this);

    if (this.comboTimer) {
      this.comboTimer.destroy();
    }
  }
}