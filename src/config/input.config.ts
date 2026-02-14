import { InputBinding } from '../types/input';

export const INPUT_CONFIG: InputBinding = {
  keyboard: {
    left: ['LEFT', 'A'],
    right: ['RIGHT', 'D'],
    jump: ['UP', 'W', 'SPACE'],
    shoot: ['Z', 'J'],
    pause: ['ESC', 'P'],
  },
  gamepad: {
    jump: 0,
    shoot: 1,
    pause: 9,
  },
};
