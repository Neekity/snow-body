import { Position } from './levels';

export interface GameState {
  version: number;
  currentLevel: number;
  score: number;
  lives: number;
  highScores: HighScoreEntry[];
  settings: GameSettings;
  timestamp: number;
}

export interface HighScoreEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  showFPS: boolean;
  touchControlsOpacity: number;
}

export interface ComboEvent {
  chainLength: number;
  multiplier: number;
  baseScore: number;
  totalScore: number;
  position: Position;
}

export interface ComboState {
  active: boolean;
  chainLength: number;
  timer: number;
  snowballId: string;
}
