# Snow Bros Web Game - Implementation Plan

## Overview

This plan breaks down the Snow Bros web game implementation into 7 phases with specific tasks, dependencies, and acceptance criteria. Each task is assigned a complexity level to guide agent tier selection.

---

## Phase 1: Project Setup & Core Engine

### Task 1.1: Initialize Project Structure
**Files:**
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `.eslintrc.cjs`
- `.prettierrc`
- `index.html`

**Complexity:** Simple
**Dependencies:** None
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- `npm install` succeeds
- `npm run dev` starts dev server
- `npm run build` creates production bundle
- `npm run test` runs Vitest

### Task 1.2: Create Directory Structure
**Files:**
- Create all directories from spec: `src/config/`, `src/scenes/`, `src/entities/`, `src/systems/`, `src/fsm/`, `src/levels/data/`, `src/ui/`, `src/utils/`, `src/types/`, `assets/sprites/`, `assets/audio/bgm/`, `assets/audio/sfx/`, `assets/fonts/`, `tests/unit/`, `tests/integration/`

**Complexity:** Simple
**Dependencies:** 1.1
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- All directories exist
- Directory structure matches spec

### Task 1.3: Create TypeScript Type Definitions
**Files:**
- `src/types/entities.ts`
- `src/types/levels.ts`
- `src/types/input.ts`
- `src/types/game-state.ts`

**Complexity:** Simple
**Dependencies:** 1.2
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- All interfaces defined per spec
- TypeScript compiles without errors
- Types exported correctly

### Task 1.4: Create Game Configuration Files
**Files:**
- `src/config/game.config.ts` (Phaser config)
- `src/config/balance.config.ts` (gameplay parameters)
- `src/config/input.config.ts` (key bindings)

**Complexity:** Simple
**Dependencies:** 1.3
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Phaser config with 256x224 resolution (scaled up)
- Arcade Physics enabled
- All balance parameters externalized
- Input bindings for keyboard/gamepad defined

### Task 1.5: Create Phaser Game Bootstrap
**Files:**
- `src/main.ts`

**Complexity:** Simple
**Dependencies:** 1.4
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Phaser game instance created
- Game config imported and applied
- Game renders in browser
- No console errors

### Task 1.6: Create Boot and Preload Scenes
**Files:**
- `src/scenes/BootScene.ts`
- `src/scenes/PreloadScene.ts`

**Complexity:** Medium
**Dependencies:** 1.5
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- BootScene initializes minimal setup
- PreloadScene shows loading bar
- PreloadScene loads placeholder assets
- Transitions to MenuScene when complete

---

## Phase 2: Player Movement & Physics

### Task 2.1: Create State Machine System
**Files:**
- `src/fsm/StateMachine.ts`
- `tests/unit/StateMachine.test.ts`

**Complexity:** Medium
**Dependencies:** 1.6
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Generic FSM implementation
- State transitions with guards
- Event emission on state changes
- 80%+ test coverage

### Task 2.2: Create Player States
**Files:**
- `src/fsm/PlayerStates.ts`

**Complexity:** Simple
**Dependencies:** 2.1
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- States: idle, running, jumping, falling, shooting, hit, dead
- State transition logic defined
- Exports state definitions for Player entity

### Task 2.3: Create Input Manager
**Files:**
- `src/systems/InputManager.ts`
- `tests/unit/InputManager.test.ts`

**Complexity:** Medium
**Dependencies:** 1.6
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Normalizes keyboard/gamepad/touch input
- Returns InputState object
- Handles multiple input sources simultaneously
- 80%+ test coverage

### Task 2.4: Create Player Entity
**Files:**
- `src/entities/Player.ts`
- `tests/integration/PlayerMovement.test.ts`

**Complexity:** Complex
**Dependencies:** 2.2, 2.3
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- Extends Phaser.Physics.Arcade.Sprite
- Integrates StateMachine
- Reads from InputManager
- Movement: left/right with acceleration
- Jump with gravity
- Horizontal screen wrap
- Placeholder animations
- 80%+ test coverage

### Task 2.5: Create Menu and Game Scenes (Basic)
**Files:**
- `src/scenes/MenuScene.ts`
- `src/scenes/GameScene.ts` (basic version)

**Complexity:** Medium
**Dependencies:** 2.4
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- MenuScene with "Start Game" button
- GameScene creates Player instance
- GameScene renders placeholder tilemap
- Player controllable with keyboard
- Smooth 60 FPS

---

## Phase 3: Enemy AI & Collision

### Task 3.1: Create Enemy States
**Files:**
- `src/fsm/EnemyStates.ts`

**Complexity:** Simple
**Dependencies:** 2.1
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- States: patrol, chase, stunned, frozen, dead
- State transition logic defined
- Exports state definitions for Enemy entities

### Task 3.2: Create Base Enemy Class
**Files:**
- `src/entities/enemies/BaseEnemy.ts`

**Complexity:** Medium
**Dependencies:** 3.1
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Extends Phaser.Physics.Arcade.Sprite
- Integrates StateMachine
- Snow accumulation tracking (snowLevel 0-3)
- Snow melt timer
- Patrol behavior (walk, turn at edges)
- Abstract methods for subclasses

### Task 3.3: Create Enemy Types
**Files:**
- `src/entities/enemies/Goblin.ts`
- `src/entities/enemies/Demon.ts`
- `src/entities/enemies/RedDemon.ts`

**Complexity:** Medium
**Dependencies:** 3.2
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Goblin: walks, turns at edges
- Demon: jumps between platforms
- RedDemon: chases player when in range
- Each uses config from balance.config.ts
- Visual state changes based on snowLevel

### Task 3.4: Create Spawn Manager
**Files:**
- `src/systems/SpawnManager.ts`

**Complexity:** Medium
**Dependencies:** 3.3
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Reads spawn points from level data
- Spawns enemies with delays
- Tracks wave groups
- Emits events when all enemies defeated

### Task 3.5: Create Collision Manager
**Files:**
- `src/systems/CollisionManager.ts`

**Complexity:** Complex
**Dependencies:** 3.4
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- Sets up all collision pairs per spec
- Player-Enemy collision (damage)
- Player-Platform collision (landing)
- Handles collision callbacks
- Proper collision groups

### Task 3.6: Integrate Enemies into GameScene
**Files:**
- `src/scenes/GameScene.ts` (update)

**Complexity:** Medium
**Dependencies:** 3.5
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- SpawnManager instantiated
- Enemies spawn per level data
- Collision detection active
- Player takes damage from enemies
- Lives system working

---

## Phase 4: Snowball Mechanics & Combos

### Task 4.1: Create SnowShot Entity
**Files:**
- `src/entities/SnowShot.ts`

**Complexity:** Simple
**Dependencies:** 3.6
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Projectile with velocity
- Range limit (despawns after distance)
- Collision with enemies applies snow
- Max 3 active shots per player

### Task 4.2: Integrate Shooting into Player
**Files:**
- `src/entities/Player.ts` (update)

**Complexity:** Medium
**Dependencies:** 4.1
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Shoot button fires SnowShot
- Cooldown between shots
- Shooting animation state
- SnowShot spawns at player position

### Task 4.3: Implement Snow Accumulation
**Files:**
- `src/entities/enemies/BaseEnemy.ts` (update)
- `tests/integration/SnowMechanics.test.ts`

**Complexity:** Complex
**Dependencies:** 4.2
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- SnowShot collision increases enemy snowLevel
- Visual changes at 33%, 66%, 100%
- Snow melts over time if not fully frozen
- At 100%, enemy becomes Snowball
- 80%+ test coverage

### Task 4.4: Create Snowball Entity
**Files:**
- `src/entities/Snowball.ts`

**Complexity:** Complex
**Dependencies:** 4.3
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- Created when enemy reaches 100% snow
- Kickable by player (applies velocity)
- Rolls with physics (bounces off walls)
- Defeats enemies on contact
- Despawns after max bounces

### Task 4.5: Create Combo System
**Files:**
- `src/systems/ComboSystem.ts`
- `tests/unit/ComboSystem.test.ts`

**Complexity:** Complex
**Dependencies:** 4.4
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- Tracks chain reactions (snowball hits enemy → new snowball → hits another)
- Calculates multiplier (2^(chain-1))
- Chain window timing (500ms)
- Emits ComboEvent with score
- 80%+ test coverage

### Task 4.6: Integrate Combo System into GameScene
**Files:**
- `src/scenes/GameScene.ts` (update)

**Complexity:** Medium
**Dependencies:** 4.5
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- ComboSystem instantiated
- Listens for snowball-enemy collisions
- Displays floating score text
- Score accumulates correctly

---

## Phase 5: Power-ups & Scoring

### Task 5.1: Create PowerUp Entity
**Files:**
- `src/entities/PowerUp.ts`

**Complexity:** Medium
**Dependencies:** 4.6
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- 5 types: speed, range, rapidFire, extraLife, bomb
- Drops from defeated enemies (random chance)
- Collision with player triggers effect
- Despawns after collection

### Task 5.2: Implement Power-up Effects
**Files:**
- `src/entities/Player.ts` (update)
- `src/entities/enemies/BaseEnemy.ts` (update for bomb)

**Complexity:** Medium
**Dependencies:** 5.1
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Speed: increases player speed for duration
- Range: increases snow shot range for duration
- RapidFire: reduces shoot cooldown for duration
- ExtraLife: adds 1 life
- Bomb: freezes all enemies instantly

### Task 5.3: Create HUD
**Files:**
- `src/ui/HUD.ts`

**Complexity:** Simple
**Dependencies:** 5.2
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Displays score
- Displays lives
- Displays level number
- Displays timer (if level has time limit)
- Updates in real-time

### Task 5.4: Create Save Manager
**Files:**
- `src/systems/SaveManager.ts`
- `tests/unit/SaveManager.test.ts`

**Complexity:** Medium
**Dependencies:** 5.3
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Saves GameState to localStorage
- Loads GameState from localStorage
- Handles schema versioning
- Saves high scores
- Saves settings (volume, etc.)
- 80%+ test coverage

---

## Phase 6: Audio & Polish

### Task 6.1: Create Audio Manager
**Files:**
- `src/systems/AudioManager.ts`

**Complexity:** Medium
**Dependencies:** 5.4
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Wraps Phaser audio system
- Plays BGM with looping
- Plays SFX
- Volume control
- Mute toggle
- Handles mobile unlock

### Task 6.2: Integrate Audio into Scenes
**Files:**
- `src/scenes/MenuScene.ts` (update)
- `src/scenes/GameScene.ts` (update)

**Complexity:** Simple
**Dependencies:** 6.1
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Menu BGM plays
- Gameplay BGM plays
- SFX for: shoot, freeze, kick, chain, powerup, enemy-defeat, player-hit, jump
- Audio stops/starts appropriately

### Task 6.3: Create Pause Scene
**Files:**
- `src/scenes/PauseScene.ts`

**Complexity:** Simple
**Dependencies:** 6.2
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Overlay scene launched on Esc/P key
- Pauses GameScene
- Shows "Resume" and "Quit" buttons
- Resume returns to GameScene
- Quit returns to MenuScene

### Task 6.4: Add Particle Effects
**Files:**
- `src/scenes/GameScene.ts` (update)

**Complexity:** Medium
**Dependencies:** 6.3
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Snow particles when shooting
- Explosion particles when enemy defeated
- Sparkle particles for combos
- Particle emitters configured

### Task 6.5: Add Screen Shake
**Files:**
- `src/utils/camera.ts`
- `src/scenes/GameScene.ts` (update)

**Complexity:** Simple
**Dependencies:** 6.4
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Camera shake on player hit
- Camera shake on combo
- Configurable intensity and duration

### Task 6.6: Create Touch Controls
**Files:**
- `src/ui/TouchControls.ts`

**Complexity:** Medium
**Dependencies:** 6.5
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Virtual D-pad for left/right
- Jump button
- Shoot button
- Only visible on mobile/touch devices
- Opacity configurable
- Integrates with InputManager

---

## Phase 7: Levels & Content

### Task 7.1: Create Level Loader
**Files:**
- `src/levels/LevelLoader.ts`

**Complexity:** Medium
**Dependencies:** 6.6
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Parses level JSON
- Creates Phaser tilemap
- Returns spawn points
- Returns player start position
- Validates level data

### Task 7.2: Create Level Data Files (1-9)
**Files:**
- `src/levels/data/level-01.json` through `level-09.json`

**Complexity:** Complex
**Dependencies:** 7.1
**Agent Tier:** executor-high (Opus) or designer (Sonnet)

**Acceptance Criteria:**
- 9 unique level layouts
- 4-6 platforms per level
- Progressive difficulty (enemy count, types)
- Spawn points defined
- Player start positions defined
- All levels playable

### Task 7.3: Create Boss Enemy
**Files:**
- `src/entities/enemies/Boss.ts`
- `src/ui/HealthBar.ts`

**Complexity:** Complex
**Dependencies:** 7.2
**Agent Tier:** executor-high (Opus)

**Acceptance Criteria:**
- Boss has 10 health
- Unique attack patterns
- Takes snowball hits (not snow shots)
- Health bar displays above boss
- Defeated when health reaches 0

### Task 7.4: Create Boss Level Data
**Files:**
- `src/levels/data/level-10.json`

**Complexity:** Medium
**Dependencies:** 7.3
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Boss arena layout
- Boss spawn point
- isBossLevel: true
- Different BGM key

### Task 7.5: Create Victory and GameOver Scenes
**Files:**
- `src/scenes/VictoryScene.ts`
- `src/scenes/GameOverScene.ts`

**Complexity:** Simple
**Dependencies:** 7.4
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- VictoryScene shows score, level complete
- GameOverScene shows final score, high scores
- Both have "Retry" and "Menu" buttons
- Transitions work correctly

### Task 7.6: Implement Level Progression
**Files:**
- `src/scenes/GameScene.ts` (update)

**Complexity:** Medium
**Dependencies:** 7.5
**Agent Tier:** executor (Sonnet)

**Acceptance Criteria:**
- Level loads from LevelLoader
- All enemies defeated → next level
- Boss defeated → VictoryScene
- Player dies with 0 lives → GameOverScene
- Level number tracked
- Progress saved to localStorage

### Task 7.7: Create Placeholder Assets
**Files:**
- `assets/sprites/player.png` (placeholder)
- `assets/sprites/enemies.png` (placeholder)
- `assets/sprites/effects.png` (placeholder)
- `assets/sprites/powerups.png` (placeholder)
- `assets/sprites/tileset.png` (placeholder)
- Corresponding `.json` atlas files

**Complexity:** Medium
**Dependencies:** None (can be done in parallel)
**Agent Tier:** designer (Sonnet) or executor (Sonnet)

**Acceptance Criteria:**
- Simple colored rectangles as placeholders
- Correct dimensions (32x32 for player/enemies, 16x16 for effects/powerups/tiles)
- Atlas JSON files with frame definitions
- All frames referenced in code exist

### Task 7.8: Create Placeholder Audio
**Files:**
- `assets/audio/bgm/menu.ogg`
- `assets/audio/bgm/gameplay.ogg`
- `assets/audio/bgm/boss.ogg`
- `assets/audio/sfx/*.ogg` (all SFX files)

**Complexity:** Simple
**Dependencies:** None (can be done in parallel)
**Agent Tier:** executor-low (Haiku)

**Acceptance Criteria:**
- Silent audio files or simple beeps
- Correct format (.ogg)
- All audio keys referenced in code exist
- Files load without errors

---

## Critical Path

The following tasks MUST be completed in order (cannot be parallelized):

1. Phase 1: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
2. Phase 2: 2.1 → 2.2 → 2.4 (2.3 can be parallel with 2.2)
3. Phase 3: 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
4. Phase 4: 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6
5. Phase 5: 5.1 → 5.2 → 5.3 (5.4 can be parallel)
6. Phase 6: 6.1 → 6.2 (6.3-6.6 can be parallel)
7. Phase 7: 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6

---

## Parallel Work Opportunities

These tasks can be done simultaneously by different agents:

**Phase 1:**
- 1.3 (types) and 1.4 (config) can be parallel after 1.2

**Phase 2:**
- 2.2 (PlayerStates) and 2.3 (InputManager) can be parallel after 2.1

**Phase 5:**
- 5.4 (SaveManager) can be parallel with 5.1-5.3

**Phase 6:**
- 6.3 (PauseScene), 6.4 (Particles), 6.5 (ScreenShake), 6.6 (TouchControls) can all be parallel after 6.2

**Phase 7:**
- 7.7 (Placeholder Assets) and 7.8 (Placeholder Audio) can be done anytime, even in Phase 1

**Cross-Phase:**
- Tests can be written in parallel with implementation
- Documentation can be written in parallel

---

## Risk Areas

### High Risk (Require Extra Attention)

1. **Snowball Chain Reaction Physics (Task 4.5)**
   - Complex timing and collision detection
   - Edge cases: simultaneous collisions, multiple chains
   - Mitigation: Extensive unit tests, careful event ordering

2. **Combo System Timing (Task 4.5)**
   - Chain window must feel right (not too strict, not too loose)
   - Mitigation: Externalize timing in balance.config.ts for easy tuning

3. **Mobile Touch Controls (Task 6.6)**
   - Must feel responsive on touch devices
   - Virtual joystick can be imprecise
   - Mitigation: Test on real devices, adjust dead zones

4. **Asset Creation Pipeline (Tasks 7.7, 7.8)**
   - Placeholder assets are fine for MVP
   - Real pixel art requires significant time
   - Mitigation: Use simple colored shapes, focus on gameplay first

### Medium Risk

5. **Enemy AI Pathfinding (Task 3.3)**
   - Jumping enemies need to find platforms
   - Mitigation: Simple heuristics (jump if player is above), not full pathfinding

6. **Screen Wrap Edge Cases (Task 2.4)**
   - Collision detection at wrap boundary
   - Mitigation: Test thoroughly, handle teleport cleanly

7. **Power-up Stacking (Task 5.2)**
   - What happens if player collects 2 speed boosts?
   - Mitigation: Define behavior in spec (refresh duration, don't stack)

### Low Risk

8. **Audio Mobile Unlock (Task 6.1)**
   - Phaser handles this, but test on iOS Safari
   - Mitigation: Use Phaser's built-in unlock mechanism

---

## Acceptance Criteria (Overall)

### Functional
- [ ] Game runs at stable 60 FPS on Chrome/Firefox (2020-era laptop)
- [ ] All core mechanics functional: shoot, freeze, kick, chain-kill, power-ups
- [ ] 10 levels playable from start to finish
- [ ] Boss fight on level 10
- [ ] Score persists across browser sessions
- [ ] High scores saved locally
- [ ] No game-breaking bugs

### Technical
- [ ] TypeScript compiles without errors
- [ ] All tests pass (80%+ coverage)
- [ ] ESLint passes with no errors
- [ ] Build produces optimized bundle (<5MB)
- [ ] No console errors in production build

### UX
- [ ] Audio plays correctly with user-gesture unlock
- [ ] Game playable with keyboard only
- [ ] Touch controls work on mobile
- [ ] Pause/resume works correctly
- [ ] Menu navigation intuitive

---

## Estimated Complexity Distribution

- **Simple tasks (Haiku):** 15 tasks (~20% of work)
- **Medium tasks (Sonnet):** 25 tasks (~50% of work)
- **Complex tasks (Opus):** 10 tasks (~30% of work)

**Total:** 50 tasks across 7 phases

---

## Next Steps

1. Begin Phase 1 with parallel execution of setup tasks
2. Use executor-low for simple tasks, executor for medium, executor-high for complex
3. Run tests after each phase
4. Use build-fixer agent if build errors occur
5. Use code-reviewer agent after significant code changes
6. Use security-reviewer agent before final deployment

**Plan Complete - Ready for Execution Phase**
