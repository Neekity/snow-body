import Phaser from 'phaser';
import { InputState } from '../types/input';
import { INPUT_CONFIG } from '../config/input.config';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.keys = new Map();
    this.setupKeyboard();
    this.setupGamepad();
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Register all keys from INPUT_CONFIG
    const allKeys = [
      ...INPUT_CONFIG.keyboard.left,
      ...INPUT_CONFIG.keyboard.right,
      ...INPUT_CONFIG.keyboard.jump,
      ...INPUT_CONFIG.keyboard.shoot,
      ...INPUT_CONFIG.keyboard.pause,
    ];

    allKeys.forEach(keyCode => {
      if (!this.keys.has(keyCode)) {
        const key = this.scene.input.keyboard!.addKey(keyCode);
        this.keys.set(keyCode, key);
      }
    });
  }

  private setupGamepad(): void {
    if (this.scene.input.gamepad) {
      this.scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.gamepad = pad;
      });
    }
  }

  getInputState(): InputState {
    return {
      left: this.isLeftPressed(),
      right: this.isRightPressed(),
      jump: this.isJumpPressed(),
      shoot: this.isShootPressed(),
      pause: this.isPausePressed(),
    };
  }

  private isLeftPressed(): boolean {
    return this.isAnyKeyPressed(INPUT_CONFIG.keyboard.left) ||
           this.isGamepadAxisLeft();
  }

  private isRightPressed(): boolean {
    return this.isAnyKeyPressed(INPUT_CONFIG.keyboard.right) ||
           this.isGamepadAxisRight();
  }

  private isJumpPressed(): boolean {
    return this.isAnyKeyPressed(INPUT_CONFIG.keyboard.jump) ||
           this.isGamepadButtonPressed(INPUT_CONFIG.gamepad.jump);
  }

  private isShootPressed(): boolean {
    return this.isAnyKeyPressed(INPUT_CONFIG.keyboard.shoot) ||
           this.isGamepadButtonPressed(INPUT_CONFIG.gamepad.shoot);
  }

  private isPausePressed(): boolean {
    return this.isAnyKeyPressed(INPUT_CONFIG.keyboard.pause) ||
           this.isGamepadButtonPressed(INPUT_CONFIG.gamepad.pause);
  }

  private isAnyKeyPressed(keyCodes: string[]): boolean {
    return keyCodes.some(keyCode => {
      const key = this.keys.get(keyCode);
      return key?.isDown ?? false;
    });
  }

  private isGamepadAxisLeft(): boolean {
    if (!this.gamepad) return false;
    const leftStick = this.gamepad.leftStick;
    return leftStick.x < -0.5;
  }

  private isGamepadAxisRight(): boolean {
    if (!this.gamepad) return false;
    const leftStick = this.gamepad.leftStick;
    return leftStick.x > 0.5;
  }

  private isGamepadButtonPressed(buttonIndex: number): boolean {
    if (!this.gamepad) return false;
    return this.gamepad.buttons[buttonIndex]?.pressed ?? false;
  }

  destroy(): void {
    this.keys.clear();
  }
}
