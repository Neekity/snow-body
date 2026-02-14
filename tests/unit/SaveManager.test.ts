import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveManager, GameSave } from '../../src/systems/SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('load', () => {
    it('returns default save when no data exists', () => {
      const save = SaveManager.load();

      expect(save.highScore).toBe(0);
      expect(save.currentLevel).toBe(1);
      expect(save.unlockedLevels).toBe(1);
      expect(save.settings.musicVolume).toBe(0.7);
      expect(save.settings.sfxVolume).toBe(0.8);
    });

    it('loads existing save data', () => {
      const testSave: GameSave = {
        highScore: 5000,
        currentLevel: 3,
        unlockedLevels: 4,
        settings: { musicVolume: 0.5, sfxVolume: 0.6 },
        stats: { totalEnemiesDefeated: 100, totalPlayTime: 3600, gamesPlayed: 5 },
        lastPlayed: '2026-01-01T00:00:00.000Z',
      };

      SaveManager.save(testSave);
      const loaded = SaveManager.load();

      expect(loaded).toEqual(testSave);
    });

    it('returns default save on parse error', () => {
      localStorage.setItem('snow-bros-save', 'invalid json');
      const save = SaveManager.load();

      expect(save.highScore).toBe(0);
    });
  });

  describe('save', () => {
    it('saves data to localStorage', () => {
      const testSave: GameSave = {
        highScore: 1000,
        currentLevel: 2,
        unlockedLevels: 2,
        settings: { musicVolume: 0.5, sfxVolume: 0.5 },
        stats: { totalEnemiesDefeated: 50, totalPlayTime: 1800, gamesPlayed: 2 },
        lastPlayed: '2026-01-01T00:00:00.000Z',
      };

      const result = SaveManager.save(testSave);
      expect(result).toBe(true);

      const loaded = SaveManager.load();
      expect(loaded).toEqual(testSave);
    });
  });

  describe('update', () => {
    it('updates specific fields', () => {
      const initial = SaveManager.load();
      expect(initial.highScore).toBe(0);

      SaveManager.update({ highScore: 2000 });
      const updated = SaveManager.load();

      expect(updated.highScore).toBe(2000);
      expect(updated.currentLevel).toBe(1); // unchanged
    });

    it('updates lastPlayed timestamp', () => {
      const before = Date.now();
      SaveManager.update({ highScore: 100 });
      const after = Date.now();

      const save = SaveManager.load();
      const timestamp = new Date(save.lastPlayed).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('updateHighScore', () => {
    it('updates high score when new score is higher', () => {
      SaveManager.save({ ...SaveManager.load(), highScore: 1000 });

      const result = SaveManager.updateHighScore(2000);
      expect(result).toBe(true);

      const save = SaveManager.load();
      expect(save.highScore).toBe(2000);
    });

    it('does not update when new score is lower', () => {
      SaveManager.save({ ...SaveManager.load(), highScore: 2000 });

      const result = SaveManager.updateHighScore(1000);
      expect(result).toBe(false);

      const save = SaveManager.load();
      expect(save.highScore).toBe(2000);
    });
  });

  describe('updateLevelProgress', () => {
    it('updates current level and unlocks next level', () => {
      SaveManager.updateLevelProgress(3);

      const save = SaveManager.load();
      expect(save.currentLevel).toBe(3);
      expect(save.unlockedLevels).toBe(4);
    });

    it('does not decrease unlocked levels', () => {
      SaveManager.save({ ...SaveManager.load(), unlockedLevels: 5 });
      SaveManager.updateLevelProgress(2);

      const save = SaveManager.load();
      expect(save.unlockedLevels).toBe(5);
    });
  });

  describe('updateSettings', () => {
    it('updates settings partially', () => {
      SaveManager.updateSettings({ musicVolume: 0.3 });

      const save = SaveManager.load();
      expect(save.settings.musicVolume).toBe(0.3);
      expect(save.settings.sfxVolume).toBe(0.8); // unchanged
    });
  });

  describe('updateStats', () => {
    it('updates stats partially', () => {
      SaveManager.updateStats({ totalEnemiesDefeated: 50 });

      const save = SaveManager.load();
      expect(save.stats.totalEnemiesDefeated).toBe(50);
      expect(save.stats.gamesPlayed).toBe(0); // unchanged
    });
  });

  describe('clear', () => {
    it('removes save data from localStorage', () => {
      SaveManager.save({ ...SaveManager.load(), highScore: 5000 });
      SaveManager.clear();

      const save = SaveManager.load();
      expect(save.highScore).toBe(0); // default
    });
  });

  describe('isAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(SaveManager.isAvailable()).toBe(true);
    });
  });
});
