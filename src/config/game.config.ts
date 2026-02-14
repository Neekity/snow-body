import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { PauseScene } from '../scenes/PauseScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { VictoryScene } from '../scenes/VictoryScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  parent: 'game',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800, x: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    PauseScene,
    GameOverScene,
    VictoryScene,
  ],
};
