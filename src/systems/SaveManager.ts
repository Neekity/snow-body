import { BALANCE } from '../config/balance.config';

export interface GameSave {
  highScore: number;
  currentLevel: number;
  unlockedLevels: number;
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
  stats: {
    totalEnemiesDefeated: number;
    totalPlayTime: number;
    gamesPlayed: number;
  };
  lastPlayed: string; // ISO timestamp
}

export class SaveManager {
  private static readonly SAVE_KEY = 'snow-bros-save';
  private static readonly VERSION = 1;

  /**
   * Load game save from localStorage
   * Returns default save if none exists or if loading fails
   */
  public static load(): GameSave {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      if (!data) {
        return this.getDefaultSave();
      }

      const parsed = JSON.parse(data);

      // Version check
      if (parsed.version !== this.VERSION) {
        console.warn('Save version mismatch, using default save');
        return this.getDefaultSave();
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to load save:', error);
      return this.getDefaultSave();
    }
  }

  /**
   * Save game data to localStorage
   */
  public static save(data: GameSave): boolean {
    try {
      const saveData = {
        version: this.VERSION,
        data,
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else {
        console.error('Failed to save:', error);
      }
      return false;
    }
  }

  /**
   * Update specific fields in the save
   */
  public static update(updates: Partial<GameSave>): boolean {
    const current = this.load();
    const updated = {
      ...current,
      ...updates,
      lastPlayed: new Date().toISOString(),
    };
    return this.save(updated);
  }

  /**
   * Update high score if new score is higher
   */
  public static updateHighScore(score: number): boolean {
    const current = this.load();
    if (score > current.highScore) {
      return this.update({ highScore: score });
    }
    return false;
  }

  /**
   * Update level progress
   */
  public static updateLevelProgress(level: number): boolean {
    const current = this.load();
    const updates: Partial<GameSave> = {
      currentLevel: level,
      unlockedLevels: Math.max(current.unlockedLevels, level + 1),
    };
    return this.update(updates);
  }

  /**
   * Update settings
   */
  public static updateSettings(settings: Partial<GameSave['settings']>): boolean {
    const current = this.load();
    return this.update({
      settings: {
        ...current.settings,
        ...settings,
      },
    });
  }

  /**
   * Update stats
   */
  public static updateStats(stats: Partial<GameSave['stats']>): boolean {
    const current = this.load();
    return this.update({
      stats: {
        ...current.stats,
        ...stats,
      },
    });
  }

  /**
   * Clear all save data
   */
  public static clear(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  /**
   * Get default save data
   */
  private static getDefaultSave(): GameSave {
    return {
      highScore: 0,
      currentLevel: 1,
      unlockedLevels: 1,
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
      },
      stats: {
        totalEnemiesDefeated: 0,
        totalPlayTime: 0,
        gamesPlayed: 0,
      },
      lastPlayed: new Date().toISOString(),
    };
  }

  /**
   * Check if localStorage is available
   */
  public static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
