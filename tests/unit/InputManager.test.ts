import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputManager } from '../../src/systems/InputManager';

// Mock Phaser Scene
const createMockScene = () => {
  const keys = new Map();

  return {
    input: {
      keyboard: {
        createCursorKeys: vi.fn(() => ({})),
        addKey: vi.fn((keyCode: string) => {
          const key = { isDown: false };
          keys.set(keyCode, key);
          return key;
        }),
      },
      gamepad: {
        once: vi.fn(),
      },
    },
    _mockKeys: keys,
  } as any;
};

describe('InputManager', () => {
  let scene: any;
  let inputManager: InputManager;

  beforeEach(() => {
    scene = createMockScene();
    inputManager = new InputManager(scene);
  });

  it('should initialize with all inputs false', () => {
    const state = inputManager.getInputState();

    expect(state.left).toBe(false);
    expect(state.right).toBe(false);
    expect(state.jump).toBe(false);
    expect(state.shoot).toBe(false);
    expect(state.pause).toBe(false);
  });

  it('should detect left arrow key press', () => {
    const leftKey = scene._mockKeys.get('LEFT');
    leftKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.left).toBe(true);
  });

  it('should detect right arrow key press', () => {
    const rightKey = scene._mockKeys.get('RIGHT');
    rightKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.right).toBe(true);
  });

  it('should detect jump key press (Space)', () => {
    const spaceKey = scene._mockKeys.get('SPACE');
    spaceKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.jump).toBe(true);
  });

  it('should detect shoot key press (KeyZ)', () => {
    const zKey = scene._mockKeys.get('Z');
    zKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.shoot).toBe(true);
  });

  it('should detect pause key press (Escape)', () => {
    const escKey = scene._mockKeys.get('ESC');
    escKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.pause).toBe(true);
  });

  it('should handle multiple simultaneous inputs', () => {
    const leftKey = scene._mockKeys.get('LEFT');
    const jumpKey = scene._mockKeys.get('SPACE');
    leftKey.isDown = true;
    jumpKey.isDown = true;

    const state = inputManager.getInputState();
    expect(state.left).toBe(true);
    expect(state.jump).toBe(true);
    expect(state.right).toBe(false);
  });

  it('should support alternative key bindings (WASD)', () => {
    const aKey = scene._mockKeys.get('A');
    const dKey = scene._mockKeys.get('D');
    aKey.isDown = true;

    let state = inputManager.getInputState();
    expect(state.left).toBe(true);

    aKey.isDown = false;
    dKey.isDown = true;

    state = inputManager.getInputState();
    expect(state.right).toBe(true);
  });

  it('should clean up on destroy', () => {
    inputManager.destroy();
    // Verify no errors occur after destroy
    const state = inputManager.getInputState();
    expect(state).toBeDefined();
  });
});
