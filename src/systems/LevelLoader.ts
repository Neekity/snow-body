import { LevelData, Position, SpawnPoint } from '../types/levels';
import { BALANCE } from '../config/balance.config';

export class LevelLoader {
  private static levels: Map<number, LevelData> = new Map();

  public static loadLevel(levelNumber: number): LevelData | null {
    // Check if level exists in cache
    if (this.levels.has(levelNumber)) {
      return this.levels.get(levelNumber)!;
    }

    // Load level data
    const levelData = this.getLevelData(levelNumber);
    if (levelData) {
      this.levels.set(levelNumber, levelData);
      return levelData;
    }

    return null;
  }

  private static getLevelData(levelNumber: number): LevelData | null {
    // For now, generate procedural levels based on level number
    // In the future, this could load from JSON files

    if (levelNumber < 1 || levelNumber > 10) {
      return null;
    }

    const isBossLevel = levelNumber === 10;
    const difficulty = BALANCE.difficulty;

    return {
      id: levelNumber,
      name: `Level ${levelNumber}`,
      tilemap: {
        width: 50,
        height: 37,
        tileSize: 16,
        layers: [],
      },
      spawns: this.generateSpawns(levelNumber, isBossLevel),
      playerStart: { x: 128, y: 150 },
      timeLimit: BALANCE.level.timeLimitDefault,
      bgmKey: 'level1',
      background: this.getBackgroundName(levelNumber),
      isBossLevel,
    };
  }

  private static generateSpawns(levelNumber: number, isBossLevel: boolean): SpawnPoint[] {
    const spawns: SpawnPoint[] = [];

    if (isBossLevel) {
      // Boss level - single boss enemy
      spawns.push({
        enemyType: 'boss',
        x: 400,
        y: 200,
        delay: 1000,
        wave: 1,
      });
      return spawns;
    }

    // Normal level - generate enemy spawns
    const difficulty = BALANCE.difficulty;
    const totalEnemies = difficulty.enemyCount[levelNumber - 1];
    const spawnPoints = this.getSpawnPositions(levelNumber);

    // Distribute enemies based on level
    let enemyTypes: string[] = [];
    if (levelNumber <= 2) {
      // Early levels: only goblins
      enemyTypes = Array(totalEnemies).fill('goblin');
    } else if (levelNumber <= 5) {
      // Mid levels: goblins and demons
      const demonCount = Math.floor(totalEnemies * 0.3);
      enemyTypes = [
        ...Array(totalEnemies - demonCount).fill('goblin'),
        ...Array(demonCount).fill('demon'),
      ];
    } else if (levelNumber <= 9) {
      // Late levels: all three types
      const redDemonCount = Math.floor(totalEnemies * 0.2);
      const demonCount = Math.floor(totalEnemies * 0.3);
      const goblinCount = totalEnemies - redDemonCount - demonCount;
      enemyTypes = [
        ...Array(goblinCount).fill('goblin'),
        ...Array(demonCount).fill('demon'),
        ...Array(redDemonCount).fill('red_demon'),
      ];
    }

    // Create spawn points with delays
    enemyTypes.forEach((type, index) => {
      const spawnPos = spawnPoints[index % spawnPoints.length];
      spawns.push({
        enemyType: type,
        x: spawnPos.x,
        y: spawnPos.y,
        delay: 1000 + index * 2000,
        wave: Math.floor(index / 3) + 1,
      });
    });

    return spawns;
  }

  private static getSpawnPositions(levelNumber: number): Position[] {
    // Generate spawn positions based on level layout
    const positions: Position[] = [];

    positions.push({ x: 100, y: 100 });
    positions.push({ x: 700, y: 100 });
    positions.push({ x: 400, y: 100 });

    if (levelNumber > 3) {
      positions.push({ x: 250, y: 100 });
      positions.push({ x: 550, y: 100 });
    }

    return positions;
  }

  private static getBackgroundName(levelNumber: number): string {
    // Vary background by level
    const backgrounds = [
      'bg1', 'bg2', 'bg3', 'bg4', 'bg5',
      'bg6', 'bg7', 'bg8', 'bg9', 'bg10',
    ];

    return backgrounds[(levelNumber - 1) % backgrounds.length];
  }

  public static getTotalLevels(): number {
    return 10;
  }
}
