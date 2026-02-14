export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  name: string;
  tilemap: TilemapData;
  spawns: SpawnPoint[];
  playerStart: Position;
  timeLimit: number;
  bgmKey: string;
  background: string;
  isBossLevel: boolean;
}

export interface TilemapData {
  width: number;
  height: number;
  tileSize: number;
  layers: TileLayer[];
}

export interface TileLayer {
  name: string;
  data: number[];
  collides: boolean;
}

export interface SpawnPoint {
  enemyType: string;
  x: number;
  y: number;
  delay: number;
  wave: number;
}
