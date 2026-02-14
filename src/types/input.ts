export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
  pause: boolean;
}

export interface InputBinding {
  keyboard: {
    left: string[];
    right: string[];
    jump: string[];
    shoot: string[];
    pause: string[];
  };
  gamepad: {
    jump: number;
    shoot: number;
    pause: number;
  };
}
