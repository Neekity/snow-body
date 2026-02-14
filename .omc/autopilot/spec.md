# Snow Bros Web Game - Product Specification

## Project Overview

Recreate the classic 1990 arcade platformer game Snow Bros (雪人兄弟) using modern web technologies. This is a 2D platformer where players control snowman characters who shoot snow at enemies to freeze them into snowballs, then kick the snowballs to defeat other enemies with chain reactions.

---

# Part 1: Requirements Analysis

## 1. Functional Requirements (What It Must Do)

### Core Gameplay Mechanics
- Player controls a snowman character (Nick or Tom) on a 2D platformer stage
- Player shoots snow projectiles at enemies to progressively cover them
- Enemies require multiple snow hits to become fully encased in a snowball
- Fully encased enemies become kickable snowballs that roll across platforms
- Rolling snowballs defeat other enemies on contact and bounce off walls
- Snowballs that hit other snowballs create chain reactions (combo scoring)
- Gravity, jumping, and platform collision physics
- Wrapping: characters falling off the bottom reappear at the top (classic Snow Bros behavior)

### Level Structure
- Multiple floors/platforms per stage (typically 4-6 platforms)
- **MVP Scope: 10 levels** (original had 50)
- Boss fights every 10 levels (1 boss for MVP)
- Level completion: defeat all enemies on the stage
- Timeout mechanic: if player takes too long, an invincible pumpkin head enemy appears

### Enemy Types
- **MVP: 4 enemy types + 1 boss**
- Enemies patrol platforms, jump between platforms, and pursue the player
- Enemy difficulty increases with level progression
- Boss enemies with health bars and attack patterns

### Power-Up System
- Speed boost (red potion)
- Larger snow shots (blue potion)
- Longer snow range (yellow potion)
- Invincibility / special attack power-ups
- Power-ups drop from defeated enemies or appear at specific triggers

### Scoring System
- Points for defeating enemies
- Combo multiplier for chain snowball kills
- Bonus items (sushi, money bags, etc.) that appear after combos
- High score tracking with local persistence

### Player Controls
- Move left/right
- Jump
- Shoot snow
- Keyboard input (arrow keys + Z/X or WASD + J/K)
- Gamepad support
- Mobile touch controls (virtual D-pad + buttons)

### Game Flow
- Title screen / main menu
- Game start with life counter (typically 3 lives)
- Continue system
- Game over screen
- Level transition animations

---

## 2. Non-Functional Requirements

### Performance
- Stable 60 FPS on mid-range hardware
- Game loop using `requestAnimationFrame`
- Efficient sprite rendering (Canvas 2D or WebGL)
- No perceptible input lag (< 16ms input-to-render)
- Asset preloading before gameplay starts

### Browser Compatibility
- Modern evergreen browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 support needed
- WebAudio API for sound (with fallback or user-gesture unlock)

### UX
- Pixel-art aesthetic faithful to the original
- Smooth animations (walk cycles, snow effects, death animations)
- Clear visual feedback for hits, combos, power-ups
- Audio: background music per level group, sound effects for actions
- Pause functionality (Esc or P key)

### Code Quality
- TypeScript for type safety
- Modular architecture (game engine, rendering, input, audio, entities as separate modules)
- Entity-Component or simple OOP game architecture
- < 800 lines per file, < 50 lines per function

### Asset Management
- Sprite sheets for characters, enemies, tiles, effects
- Tile-based level maps (JSON or similar data format)
- Audio files in web-friendly formats (MP3 + OGG fallback)

---

## 3. Implicit Requirements (Not Stated but Needed)

- Save/load game state (localStorage for progress, high scores)
- Responsive canvas scaling (fit different screen sizes while maintaining aspect ratio)
- Mobile touch controls (virtual D-pad + buttons)
- Gamepad API support for USB/Bluetooth controllers
- Audio mute/volume toggle (critical for web games)
- Fullscreen mode toggle
- Asset loading progress bar
- Graceful handling of browser tab visibility change (pause when tab hidden)
- Frame-rate independent physics (delta-time based updates)
- Sprite/asset pipeline: original-style pixel art or clear plan for sourcing assets

---

## 4. Out of Scope

- Online multiplayer (network sync is massive scope increase)
- Mobile native app (PWA acceptable, but not App Store/Play Store builds)
- Level editor (nice-to-have, but not MVP)
- Backend server (purely client-side game)
- Monetization features
- Leaderboard server (local high scores only)
- Faithful ROM-level accuracy (recreation, not emulator)
- 2-Player local co-op (deferred to post-MVP)
- Accessibility features beyond basic keyboard support

---

## 5. Critical Decisions

### Resolved for MVP:
1. **Level count**: 10 levels (not 50)
2. **2-Player co-op**: Deferred to post-MVP (single-player only)
3. **Enemy types**: 4 types + 1 boss
4. **Technology stack**: TypeScript + Phaser 3 + Vite
5. **Assets**: Original pixel art (no copyrighted ROM sprites)
6. **Audio**: Original compositions / CC0 licensed

---

# Part 2: Technical Specification

## 1. Tech Stack Decision

| Layer | Choice | Justification |
|-------|--------|---------------|
| Framework | **Phaser 3.80+** | Built-in physics (Arcade), sprite sheets, tilemaps, input (keyboard/gamepad/touch), audio, scene management. Cuts months off raw Canvas development. |
| Language | **TypeScript 5.x** | Type safety across entity system, level data, game state. |
| Build | **Vite 6.x** | Sub-second HMR, native ESM, trivial Phaser integration. |
| Audio | **Phaser's built-in audio** | Wraps Web Audio API, handles sprite-based SFX, BGM looping, volume control, mobile unlock. |
| Testing | **Vitest** | Same Vite pipeline, fast unit tests for game logic. |
| Linting | **ESLint + Prettier** | Standard TypeScript quality gates. |

**Why Phaser 3 over raw Canvas:**
- Arcade Physics provides AABB collision, gravity, velocity, bounce
- Built-in gamepad API, touch zones, keyboard handling
- Scene management maps to game states
- Sprite sheet animation, tilemap rendering, camera systems are production-ready
- Trade-off: larger bundle (~1MB gzipped) but acceptable for web game

---

## 2. Architecture Overview

### 2.1 Game Loop

Phaser handles core loop (requestAnimationFrame at 60 FPS). Code hooks into `update(time, delta)` per scene.

Update order within game scene:
1. Input polling
2. Player update (movement, shooting, state machine)
3. Enemy AI update
4. Snowball physics
5. Combo/chain resolution
6. Power-up spawning and collection
7. HUD update
8. Camera follow

### 2.2 Entity System

Use Phaser's `Sprite` class with composition:

```
Phaser.Physics.Arcade.Sprite
    │
    ├── Player
    ├── Enemy
    │   ├── Goblin
    │   ├── Demon
    │   ├── RedDemon
    │   └── Boss
    ├── Snowball
    └── PowerUp
```

Each entity has:
- Finite state machine (FSM) for behavior states
- Reference to shared game config
- Typed event emitters for decoupled communication

### 2.3 State Management (Scenes)

```
BootScene → PreloadScene → MenuScene ⇄ GameScene → GameOverScene
                                          ↕
                                      PauseScene (overlay)
                                          ↕
                                     VictoryScene
```

### 2.4 Input Handling

Single `InputManager` normalizes all input sources:

```
Keyboard ──┐
Gamepad  ──┼──→ InputManager ──→ InputState { left, right, jump, shoot }
Touch    ──┘
```

### 2.5 Collision Detection

Phaser Arcade Physics with collision groups:

| Group A | Group B | Handler |
|---------|---------|---------|
| Player | Platforms | Land on platform |
| Player | Enemies | Player takes damage |
| Player | PowerUps | Collect power-up |
| SnowShot | Enemies | Apply snow layer |
| Snowball (rolling) | Enemies | Defeat enemy, chain check |
| Snowball (rolling) | Snowball | Chain reaction |

### 2.6 Snow Mechanics State Machine

```
Normal → Dusted → HalfFrozen → Frozen (Snowball)
  0%       33%       66%          100%

Frozen → Kicked → Rolling → (hits wall → bounces / hits enemy → chain)
```

---

## 3. File Structure

```
snow-bros/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.ts
│   │
│   ├── config/
│   │   ├── game.config.ts
│   │   ├── balance.config.ts
│   │   └── input.config.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── PauseScene.ts
│   │   ├── GameOverScene.ts
│   │   └── VictoryScene.ts
│   │
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── enemies/
│   │   │   ├── BaseEnemy.ts
│   │   │   ├── Goblin.ts
│   │   │   ├── Demon.ts
│   │   │   ├── RedDemon.ts
│   │   │   └── Boss.ts
│   │   ├── SnowShot.ts
│   │   ├── Snowball.ts
│   │   └── PowerUp.ts
│   │
│   ├── systems/
│   │   ├── InputManager.ts
│   │   ├── CollisionManager.ts
│   │   ├── ComboSystem.ts
│   │   ├── AudioManager.ts
│   │   ├── SaveManager.ts
│   │   └── SpawnManager.ts
│   │
│   ├── fsm/
│   │   ├── StateMachine.ts
│   │   ├── PlayerStates.ts
│   │   └── EnemyStates.ts
│   │
│   ├── levels/
│   │   ├── LevelLoader.ts
│   │   └── data/
│   │       ├── level-01.json
│   │       └── ... (through level-10.json)
│   │
│   ├── ui/
│   │   ├── HUD.ts
│   │   ├── TouchControls.ts
│   │   └── HealthBar.ts
│   │
│   ├── utils/
│   │   ├── math.ts
│   │   ├── constants.ts
│   │   └── debug.ts
│   │
│   └── types/
│       ├── entities.ts
│       ├── levels.ts
│       ├── input.ts
│       └── game-state.ts
│
├── assets/
│   ├── sprites/
│   │   ├── player.png
│   │   ├── player.json
│   │   ├── enemies.png
│   │   ├── enemies.json
│   │   ├── effects.png
│   │   ├── effects.json
│   │   ├── powerups.png
│   │   ├── powerups.json
│   │   └── tileset.png
│   ├── audio/
│   │   ├── bgm/
│   │   │   ├── menu.ogg
│   │   │   ├── gameplay.ogg
│   │   │   └── boss.ogg
│   │   └── sfx/
│   │       ├── shoot.ogg
│   │       ├── freeze.ogg
│   │       ├── kick.ogg
│   │       ├── chain.ogg
│   │       ├── powerup.ogg
│   │       ├── enemy-defeat.ogg
│   │       ├── player-hit.ogg
│   │       ├── jump.ogg
│   │       └── boss-defeat.ogg
│   └── fonts/
│       └── pixel.ttf
│
└── tests/
    ├── unit/
    │   ├── ComboSystem.test.ts
    │   ├── StateMachine.test.ts
    │   ├── InputManager.test.ts
    │   ├── SaveManager.test.ts
    │   └── balance.test.ts
    └── integration/
        ├── PlayerMovement.test.ts
        └── SnowMechanics.test.ts
```

---

## 4. Dependencies

```json
{
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@types/node": "^22.0.0",
    "vitest": "^3.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "prettier": "^3.4.0"
  }
}
```

---

## 5. Key TypeScript Interfaces

### Input State
```typescript
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
  pause: boolean;
}
```

### Entity Interfaces
```typescript
export type EntityType = 'player' | 'goblin' | 'demon' | 'red_demon' | 'boss' | 'snowball' | 'powerup';
export type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'shooting' | 'hit' | 'dead';
export type EnemyState = 'patrol' | 'chase' | 'stunned' | 'frozen' | 'dead';
export type SnowLevel = 0 | 1 | 2 | 3;

export interface EnemyConfig extends EntityConfig {
  snowThresholds: [number, number, number];
  meltRate: number;
  detectionRange: number;
  jumpForce?: number;
}
```

### Level Data Schema
```typescript
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
```

### Game State (Save/Load)
```typescript
export interface GameState {
  version: number;
  currentLevel: number;
  score: number;
  lives: number;
  highScores: HighScoreEntry[];
  settings: GameSettings;
  timestamp: number;
}
```

---

## 6. Asset Pipeline

### Sprite Sheets

| Sheet | Tile Size | Format | Contents |
|-------|-----------|--------|----------|
| player.png | 32x32 | Texture Atlas | 24 frames: idle(4), run(6), jump(2), fall(2), shoot(4), hit(2), dead(4) |
| enemies.png | 32x32 | Texture Atlas | Per enemy: walk(4), chase(4), stunned(2), frozen(3), death(4) |
| effects.png | 16x16 | Texture Atlas | Snow particles(4), snowball roll(4), explosion(6), sparkle(4) |
| powerups.png | 16x16 | Texture Atlas | 5 power-up types, 2 frames each |
| tileset.png | 16x16 | Sprite Sheet | Platform tiles, walls, decorations |

All sprites are original pixel art - no copyrighted assets.

### Audio
- Format: `.ogg` + `.mp3` fallback
- All audio is original compositions / CC0 licensed

### Level Data Format
- JSON files in `src/levels/data/`
- Loaded via Phaser's `this.load.json()`

---

## 7. Game Balance Config

All tunable parameters externalized:

```typescript
export const BALANCE = {
  player: {
    speed: 160,
    jumpForce: -330,
    gravity: 800,
    lives: 3,
    invincibilityDuration: 2000,
    shootCooldown: 300,
    maxActiveShots: 3,
  },
  snowShot: {
    speed: 250,
    range: 120,
    snowAmount: 34,
  },
  snowball: {
    kickSpeed: 300,
    bounceDecay: 0.8,
    maxBounces: 3,
    chainWindow: 500,
  },
  enemies: {
    goblin: { speed: 60, health: 1, scoreValue: 100, ... },
    demon: { speed: 80, health: 1, scoreValue: 200, ... },
    redDemon: { speed: 120, health: 1, scoreValue: 300, ... },
    boss: { speed: 50, health: 10, scoreValue: 5000, ... },
  },
  combo: {
    baseMultiplier: 2,
    maxMultiplier: 16,
    chainTimeWindow: 500,
  },
  powerUps: {
    speed: { duration: 10000, multiplier: 1.5, dropChance: 0.15 },
    range: { duration: 10000, multiplier: 1.8, dropChance: 0.10 },
    rapidFire: { duration: 8000, cooldownMultiplier: 0.5, dropChance: 0.10 },
    extraLife: { duration: 0, dropChance: 0.05 },
    bomb: { duration: 0, dropChance: 0.03 },
  },
};
```

---

## 8. Development Phases

### Phase 1: Core Engine + Basic Rendering
- Vite + TypeScript + Phaser scaffold
- Boot/Preload/Menu/Game scenes
- Static tilemap rendering
- Build pipeline verified

### Phase 2: Player Movement + Physics
- Player entity with FSM
- InputManager with keyboard support
- Arcade Physics: gravity, platform collision, wrap
- Player animations

### Phase 3: Enemy AI + Collision
- BaseEnemy with patrol behavior
- Goblin, Demon, RedDemon implementations
- SpawnManager reading from level data
- Player-enemy collision

### Phase 4: Snowball Mechanics + Combos
- SnowShot projectile
- Snow accumulation on enemies
- Snowball entity (frozen enemy)
- Kick mechanic
- ComboSystem with chain detection
- Floating score text

### Phase 5: Power-ups + Scoring
- PowerUp entity
- Power-up effects (speed, range, rapid fire)
- Score tracking
- HUD display

### Phase 6: Audio + Polish
- AudioManager
- BGM and SFX integration
- Particle effects
- Screen shake
- Pause menu

### Phase 7: Levels + Content
- 10 level designs
- Boss implementation
- Level progression
- Victory/GameOver screens
- Save/load system

---

## Acceptance Criteria

1. Game runs at stable 60 FPS on Chrome/Firefox (2020-era laptop)
2. All core mechanics functional: shoot, freeze, kick, chain-kill, power-ups
3. 10 levels playable from start to finish
4. Score persists across browser sessions
5. No game-breaking bugs
6. Audio plays correctly with user-gesture unlock
7. Game playable with keyboard only

---

## Edge Cases to Handle

1. Multiple snowballs colliding simultaneously
2. Player at screen wrap boundary
3. All enemies frozen at once
4. Browser tab loses focus mid-game
5. Rapid input (button mashing)
6. Boss fight with different layouts
7. Power-up stacking behavior

---

**Specification Complete - Ready for Planning Phase**
