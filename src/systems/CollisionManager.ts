import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { Snowball } from '../entities/Snowball';
import { BALANCE } from '../config/balance.config';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private snowballs: Phaser.GameObjects.Group;
  private activeShots: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemies: Phaser.GameObjects.Group,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    snowballs: Phaser.GameObjects.Group
  ) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.platforms = platforms;
    this.snowballs = snowballs;

    this.ensureSnowShotTexture();
    this.setupCollisions();
  }

  private ensureSnowShotTexture(): void {
    if (this.scene.textures.exists('snowshot')) return;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('snowshot', 8, 8);
    graphics.destroy();
  }

  private setupCollisions(): void {
    // Player <-> Platforms (landing)
    this.scene.physics.add.collider(this.player, this.platforms);

    // Enemies <-> Platforms (walking)
    this.scene.physics.add.collider(this.enemies, this.platforms);

    // Player <-> Enemies (damage)
    this.scene.physics.add.overlap(
      this.player,
      this.enemies,
      (obj1, obj2) => {
        this.handlePlayerEnemyCollision(
          obj1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
          obj2 as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      },
      undefined,
      this
    );

    // Snowballs <-> Platforms (rolling on ground)
    this.scene.physics.add.collider(this.snowballs, this.platforms);

    // Player <-> Snowballs (kick)
    this.scene.physics.add.overlap(
      this.player,
      this.snowballs,
      (obj1, obj2) => {
        this.handlePlayerSnowballCollision(
          obj1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
          obj2 as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      },
      undefined,
      this
    );

    // Snowballs <-> Enemies (defeat)
    this.scene.physics.add.overlap(
      this.snowballs,
      this.enemies,
      (obj1, obj2) => {
        this.handleSnowballEnemyCollision(
          obj1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
          obj2 as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      },
      undefined,
      this
    );

    // Listen for snow shot events from player
    this.scene.events.on('player:shoot', this.handlePlayerShoot, this);
  }

  private handlePlayerEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const player = playerObj as Player;
    const enemy = enemyObj as BaseEnemy;

    // Only damage player if enemy is active and not frozen
    if (enemy.getState() !== 'frozen' && enemy.active) {
      player.takeDamage();
    }
  }

  private handlePlayerSnowballCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    snowballObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const player = playerObj as Player;
    const snowball = snowballObj as Snowball;

    if (!snowball.active || snowball.isCurrentlyRolling()) return;

    // Kick direction based on player position relative to snowball
    const direction = player.x < snowball.x ? 1 : -1;
    snowball.kick(direction);
  }

  private handleSnowballEnemyCollision(
    snowballObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const snowball = snowballObj as Snowball;
    const enemy = enemyObj as BaseEnemy;

    if (!snowball.active || !enemy.active || !snowball.isCurrentlyRolling()) return;

    // Notify combo system before defeating
    snowball.onEnemyHit(enemy);

    // Defeat the enemy
    enemy.defeat();
  }

  private handlePlayerShoot(data: {
    x: number;
    y: number;
    direction: number;
  }): void {
    // Enforce max active shots
    this.cleanupDestroyedShots();
    if (this.activeShots.length >= BALANCE.player.maxActiveShots) {
      return;
    }

    const snowShot = this.scene.physics.add.sprite(
      data.x,
      data.y,
      'snowshot'
    );
    snowShot.setSize(8, 8);
    snowShot.setVelocityX(BALANCE.snowShot.speed * data.direction);

    this.activeShots.push(snowShot);

    const startX = data.x;

    // SnowShot <-> Enemies (apply snow)
    const collider = this.scene.physics.add.overlap(
      snowShot,
      this.enemies,
      (_shotObj, enemyObj) => {
        const enemy = enemyObj as BaseEnemy;
        enemy.applySnow(BALANCE.snowShot.snowAmount);
        this.destroyShot(snowShot, collider, updateHandler);
      }
    );

    // Track distance and destroy when out of range
    const updateHandler = () => {
      if (!snowShot.active) {
        this.scene.events.off('update', updateHandler);
        return;
      }

      const distanceTraveled = Math.abs(snowShot.x - startX);
      if (distanceTraveled >= BALANCE.snowShot.range) {
        this.destroyShot(snowShot, collider, updateHandler);
      }
    };

    this.scene.events.on('update', updateHandler);
  }

  private destroyShot(
    shot: Phaser.Physics.Arcade.Sprite,
    collider: Phaser.Physics.Arcade.Collider,
    updateHandler: () => void
  ): void {
    shot.destroy();
    collider.destroy();
    this.scene.events.off('update', updateHandler);
  }

  private cleanupDestroyedShots(): void {
    this.activeShots = this.activeShots.filter(
      (shot) => shot.active
    );
  }

  destroy(): void {
    this.scene.events.off('player:shoot', this.handlePlayerShoot, this);

    for (const shot of this.activeShots) {
      if (shot.active) {
        shot.destroy();
      }
    }
    this.activeShots = [];
  }
}