# Snow Bros (雪人兄弟) - Web Game

A web-based recreation of the classic 1990 arcade platformer game Snow Bros, built with Phaser 3 and TypeScript.

![Game Status](https://img.shields.io/badge/status-playable-green)
![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Phaser](https://img.shields.io/badge/Phaser-3.80-orange)

## 🎮 Game Features

### Core Gameplay
- **Player Movement**: Smooth platformer controls with jumping and screen wrapping
- **Snow Shooting**: Fire snow projectiles to freeze enemies
- **Freezing Mechanics**: Hit enemies 3 times to completely freeze them into snowballs
- **Snowball Physics**: Kick frozen enemies to create rolling snowballs
- **Combo System**: Chain reactions with exponential multipliers (2x, 4x, 8x, 16x)
- **Enemy AI**: Three enemy types with distinct behaviors:
  - 🔴 **Goblin**: Simple patrol behavior
  - 🔵 **Demon**: Jumps between platforms
  - 🟣 **RedDemon**: Chases the player

### Technical Features
- ✅ State machine-driven entity behaviors
- ✅ Unified input system (keyboard, gamepad, touch)
- ✅ Collision detection and physics
- ✅ Scene management (Menu, Game, Pause, GameOver, Victory)
- ✅ 67 unit and integration tests (100% passing)
- ✅ TypeScript with strict type checking
- ✅ Vite for fast development and builds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:Neekity/snow-body.git
cd snow-body

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000/`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🎯 Controls

| Action | Keyboard | Alternative |
|--------|----------|-------------|
| Move Left | ← | A |
| Move Right | → | D |
| Jump | ↑ / Space | W |
| Shoot Snow | Z | J |
| Pause | ESC | P |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

**Test Coverage**: 67 tests across 4 test suites
- Unit tests: StateMachine, InputManager, ComboSystem
- Integration tests: Player movement and physics

## 📁 Project Structure

```
snow-bros/
├── src/
│   ├── config/          # Game configuration and balance
│   ├── entities/        # Player, enemies, projectiles
│   ├── fsm/            # Finite state machines
│   ├── scenes/         # Phaser scenes (Menu, Game, etc.)
│   ├── systems/        # Game systems (Input, Collision, Combo)
│   ├── types/          # TypeScript type definitions
│   └── main.ts         # Game entry point
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── assets/             # Game assets (sprites, audio)
└── public/             # Static files
```

## 🎨 Game Architecture

### Entity System
- **Player**: State machine-driven character with movement, jumping, and shooting
- **BaseEnemy**: Abstract enemy class with patrol, chase, and freeze states
- **Snowball**: Physics-based rolling projectile with bounce mechanics

### Systems
- **InputManager**: Unified input handling for keyboard, gamepad, and touch
- **CollisionManager**: Handles all collision detection and responses
- **ComboSystem**: Tracks chain reactions and calculates score multipliers
- **SpawnManager**: Manages enemy spawning based on level data

### State Management
- **StateMachine**: Generic FSM implementation for entity behaviors
- **PlayerStates**: Idle, Running, Jumping, Falling, Shooting, Hit, Dead
- **EnemyStates**: Patrol, Chase, Stunned, Frozen, Dead

## 🔧 Configuration

Game balance parameters can be adjusted in `src/config/balance.config.ts`:

```typescript
export const BALANCE = {
  player: {
    speed: 160,
    jumpForce: -330,
    lives: 3,
    shootCooldown: 300,
  },
  snowShot: {
    speed: 250,
    range: 120,
    snowAmount: 34,  // % per hit (3 hits = 100%)
  },
  combo: {
    baseMultiplier: 2,
    maxMultiplier: 16,
    chainTimeWindow: 500,
  },
  // ... more configuration
};
```

## 🚧 Development Status

### Completed (Phase 1-4)
- ✅ Core engine and rendering
- ✅ Player movement and physics
- ✅ Enemy AI and collision detection
- ✅ Snowball mechanics and combo system

### Planned (Phase 5-7)
- ⏳ Power-up system (speed, range, rapid fire, extra life, bomb)
- ⏳ Audio system (BGM and SFX)
- ⏳ Visual effects (particles, screen shake)
- ⏳ Level design (10 levels with boss fights)
- ⏳ Touch controls for mobile
- ⏳ Save/load system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is a fan recreation for educational purposes. Snow Bros is a trademark of Toaplan/Tengen.

## 🙏 Acknowledgments

- Original game by Toaplan (1990)
- Built with [Phaser 3](https://phaser.io/)
- Developed with [Claude Code](https://claude.com/claude-code)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This is a work-in-progress recreation. The game is currently playable with core mechanics implemented. Additional features and content are planned for future releases.
