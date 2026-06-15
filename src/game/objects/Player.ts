import Phaser from 'phaser';
import type { AppUser } from '../../auth/types';
import { getPlayerCharacter } from '../constants/playerCharacters';

type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
};

const DEFAULT_DEPTH = 40;
const SEATED_DEPTH = 19.5;

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
  private nameplate?: Phaser.GameObjects.Text;
  private speechBubble?: Phaser.GameObjects.Container;
  private speechBubbleTimer?: Phaser.Time.TimerEvent;
  private seatedLabel?: Phaser.GameObjects.Text;
  private isSeated = false;

  constructor(scene: Phaser.Scene, x: number, y: number, user?: AppUser) {
    super(scene, x, y, getPlayerCharacter(user?.characterId).assetKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEFAULT_DEPTH);
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

    if (user?.displayName) {
      this.nameplate = scene.add
        .text(x, y - this.displayHeight - 20, user.displayName, {
          fontFamily: 'NanumSquareRound, Arial, sans-serif',
          fontSize: '16px',
          color: '#ffffff',
          stroke: '#142230',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(80);
    }
  }

  destroy(fromScene?: boolean) {
    this.nameplate?.destroy();
    this.speechBubble?.destroy();
    this.speechBubbleTimer?.destroy();
    this.nameplate = undefined;
    this.speechBubble = undefined;
    this.speechBubbleTimer = undefined;
    this.seatedLabel?.destroy();
    this.seatedLabel = undefined;
    super.destroy(fromScene);
  }

  showSpeechBubble(message: string) {
    const bubbleText = message.trim().slice(0, 80);

    if (!bubbleText) {
      return;
    }

    this.speechBubble?.destroy();
    this.speechBubbleTimer?.destroy();

    const text = this.scene.add
      .text(0, 0, bubbleText, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '15px',
        color: '#17202a',
        wordWrap: {
          width: 220,
        },
      })
      .setOrigin(0.5);
    const width = Math.max(72, text.width + 28);
    const height = Math.max(36, text.height + 18);
    const background = this.scene.add
      .rectangle(0, 0, width, height, 0xffffff, 0.94)
      .setStrokeStyle(2, 0x17202a, 0.24)
      .setOrigin(0.5);
    const tail = this.scene.add.triangle(0, height / 2 + 7, 0, 0, 14, 0, 7, 9, 0xffffff, 0.94).setOrigin(0.5);

    this.speechBubble = this.scene.add.container(this.x, this.getSpeechBubbleY(), [background, text, tail]).setDepth(120);
    this.speechBubbleTimer = this.scene.time.delayedCall(3600, () => {
      this.speechBubble?.destroy();
      this.speechBubble = undefined;
      this.speechBubbleTimer = undefined;
    });
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

  setSeatedAt(x: number, y: number, label = '업무중') {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isSeated = true;
    this.setPosition(x, y);
    this.setDepth(SEATED_DEPTH);
    this.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    body.setAllowGravity(false);
    body.updateFromGameObject();

    if (!this.seatedLabel) {
      this.seatedLabel = this.scene.add
        .text(x, y - this.displayHeight - 2, label, {
          fontFamily: 'NanumSquareRound, Arial, sans-serif',
          fontSize: '12px',
          color: '#fff0b8',
          stroke: '#142230',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(81);
      return;
    }

    this.seatedLabel.setText(label).setVisible(true);
  }

  clearSeated() {
    if (!this.isSeated) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isSeated = false;
    this.setDepth(DEFAULT_DEPTH);
    body.setAllowGravity(true);
    this.seatedLabel?.setVisible(false);
  }

  isSeatedForWork() {
    return this.isSeated;
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
    const movementPressed = moveLeft || moveRight || dropPressed || jumpPressed;

    if (this.isSeated) {
      body.setAccelerationX(0);
      body.setVelocity(0, 0);

      if (movementPressed) {
        this.clearSeated();
      }

      this.updateAttachedText();
      return;
    }

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

    this.updateAttachedText();
  }

  private getSpeechBubbleY() {
    return this.y - this.displayHeight - 62;
  }

  private updateAttachedText() {
    if (this.nameplate) {
      this.nameplate.setPosition(this.x, this.y - this.displayHeight - 20);
    }

    if (this.seatedLabel) {
      this.seatedLabel.setPosition(this.x, this.y - this.displayHeight - 2);
    }

    if (this.speechBubble) {
      this.speechBubble.setPosition(this.x, this.getSpeechBubbleY());
    }
  }
}
