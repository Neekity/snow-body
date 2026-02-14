import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

// Create and start the Phaser game
const game = new Phaser.Game(gameConfig);

// Export for debugging purposes
export default game;
