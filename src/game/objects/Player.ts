import Phaser from 'phaser';
import { ASSET_KEYS } from '../constants/assetKeys';

type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: MovementKeys;
  private readonly speed = 260;
  private readonly acceleration = 1400;
  private readonly drag = 1800;
  private readonly jumpSpeed = 700;
  private jumpsRemaining = 2;
  private dropThroughUntil = 0;
  private oneWayDropEnabledUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.player);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(40);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);
    this.setScale(0.42);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(84, 132);
    body.setOffset(58, 54);
    body.setMaxVelocity(this.speed, 900);
    body.setDragX(this.drag);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as MovementKeys;
  }

  alignBodyBottomTo(surfaceTop: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.updateFromGameObject();
    this.y -= body.bottom - surfaceTop;
    body.updateFromGameObject();
  }

  isDroppingThroughOneWaySurface() {
    return this.scene.time.now < this.dropThroughUntil;
  }

  enableDropThroughOneWaySurface() {
    this.oneWayDropEnabledUntil = this.scene.time.now + 120;
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const moveLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const moveRight = this.cursors.right.isDown || this.wasd.right.isDown;
    const dropPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.down);
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.jump);

    let accelerationX = 0;

    if (moveLeft) {
      accelerationX = -this.acceleration;
    }

    if (moveRight) {
      accelerationX = this.acceleration;
    }

    body.setAccelerationX(accelerationX);

    if (accelerationX !== 0) {
      this.setFlipX(accelerationX > 0);
    }

    if (body.blocked.down) {
      this.jumpsRemaining = 2;
    }

    if (dropPressed && body.blocked.down && this.scene.time.now < this.oneWayDropEnabledUntil) {
      this.dropThroughUntil = this.scene.time.now + 260;
      this.y += 8;
      body.updateFromGameObject();
    }

    if (jumpPressed && this.jumpsRemaining > 0) {
      body.setVelocityY(-this.jumpSpeed);
      this.jumpsRemaining -= 1;
    }
  }
}
