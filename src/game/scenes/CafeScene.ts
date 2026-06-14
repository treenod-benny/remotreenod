import Phaser from 'phaser';
import { ASSET_KEYS } from '../constants/assetKeys';
import { loadImageAssets } from '../constants/assetManifest';
import {
  CAFE_BACKGROUND,
  CAFE_DECOR,
  CAFE_EXIT,
  CAFE_GROUND_Y,
  CAFE_MAP_HEIGHT,
  CAFE_MAP_WIDTH,
  CAFE_SURFACES,
} from '../constants/cafeLayout';
import { SCENE_KEYS } from '../constants/sceneKeys';
import { LAYOUT_EDITOR, LayoutEditor } from '../editor/LayoutEditor';
import { Player } from '../objects/Player';
import { canLandOnOneWaySurface } from '../physics/oneWaySurface';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import type { AppUser } from '../../auth/types';

const DEBUG_PHYSICS = import.meta.env.VITE_DEBUG_PHYSICS === 'true';

export class CafeScene extends Phaser.Scene {
  private player!: Player;
  private prompt!: InteractionPrompt;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private escapeKey!: Phaser.Input.Keyboard.Key;
  private collisionSurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private oneWaySurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private layoutEditor!: LayoutEditor;
  private exitPortal!: Phaser.GameObjects.Image;

  constructor() {
    super(SCENE_KEYS.cafe);
  }

  preload() {
    loadImageAssets(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, CAFE_MAP_WIDTH, CAFE_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, CAFE_MAP_WIDTH, CAFE_MAP_HEIGHT);
    this.layoutEditor = new LayoutEditor(this, 'CafeScene');

    this.createBackground();
    this.createSurfaces();
    this.createExitPortal();
    this.createDecor();
    this.createPlayer();
    this.createUi();
    this.layoutEditor.activate();
  }

  update() {
    this.player.update();

    if (LAYOUT_EDITOR) {
      this.layoutEditor.update();
      return;
    }

    this.handleExit();
  }

  private createBackground() {
    const background = this.add
      .image(CAFE_BACKGROUND.x, CAFE_BACKGROUND.y, ASSET_KEYS.cafeBackground)
      .setOrigin(0)
      .setScale(CAFE_BACKGROUND.scale)
      .setDepth(CAFE_BACKGROUND.depth);

    this.layoutEditor.registerImage('background.cafe', background);
  }

  private createSurfaces() {
    this.collisionSurfaces = this.physics.add.staticGroup();
    this.oneWaySurfaces = this.physics.add.staticGroup();

    CAFE_SURFACES.forEach((surface) => {
      this.createSurface(surface.id, surface, surface.solid ? this.collisionSurfaces : this.oneWaySurfaces);
    });
  }

  private createSurface(
    id: string,
    config: { x: number; y: number; width: number; height: number },
    group: Phaser.Physics.Arcade.StaticGroup,
  ) {
    const surface = this.add.zone(config.x, config.y, config.width, config.height);
    this.physics.add.existing(surface, true);
    group.add(surface);
    this.layoutEditor.registerSurface(id, surface);

    if (DEBUG_PHYSICS) {
      this.add
        .rectangle(config.x, config.y, config.width, config.height, 0xff3355, 0.24)
        .setStrokeStyle(1, 0xff3355, 0.9)
        .setDepth(999);
    }
  }

  private createPlayer() {
    const user = this.registry.get('currentUser') as AppUser | undefined;
    this.player = new Player(this, 240, CAFE_GROUND_Y, user);
    const ground = CAFE_SURFACES.find((surface) => surface.id === 'surface.ground') ?? CAFE_SURFACES[0];
    this.player.alignBodyBottomTo(ground.y - ground.height / 2);
    this.physics.add.collider(this.player, this.collisionSurfaces);
    this.physics.add.collider(
      this.player,
      this.oneWaySurfaces,
      undefined,
      canLandOnOneWaySurface,
      this,
    );
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 90);
    this.cameras.main.setDeadzone(180, 120);
  }

  private createExitPortal() {
    this.exitPortal = this.add
      .image(CAFE_EXIT.x, CAFE_EXIT.y, ASSET_KEYS.officePortalBlue)
      .setOrigin(0.5, 1)
      .setScale(CAFE_EXIT.scale)
      .setDepth(22);

    const labelText = this.add
      .text(CAFE_EXIT.x, CAFE_EXIT.y - this.exitPortal.displayHeight - 18, 'Lobby', {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '15px',
        color: '#f6fbff',
        stroke: '#1b2c3d',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(23);

    this.layoutEditor.registerPortal('portal.Lobby.0', this.exitPortal, labelText);
  }

  private createDecor() {
    CAFE_DECOR.forEach((item) => {
      const image = this.add
        .image(item.x, item.y, item.textureKey)
        .setOrigin(0.5, 1)
        .setScale(item.scale)
        .setFlipX(item.flipX)
        .setDepth(item.depth);
      this.layoutEditor.registerImage(item.id, image);
    });
  }

  private createUi() {
    this.prompt = new InteractionPrompt(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private handleExit() {
    const isNearExit =
      Phaser.Math.Distance.Between(this.exitPortal.x, this.exitPortal.y - 40, this.player.x, this.player.y - 45) <= CAFE_EXIT.radius;

    if (isNearExit) {
      this.prompt.show('E Lobby', this.exitPortal.x, this.exitPortal.y - this.exitPortal.displayHeight - 42);
    } else {
      this.prompt.hide();
    }

    if ((isNearExit && Phaser.Input.Keyboard.JustDown(this.interactKey)) || Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      console.log('Lobby portal entered');
      this.scene.start(SCENE_KEYS.lobby);
    }
  }
}
