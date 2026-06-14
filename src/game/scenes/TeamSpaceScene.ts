import Phaser from 'phaser';
import { loadImageAssets } from '../constants/assetManifest';
import { ASSET_KEYS } from '../constants/assetKeys';
import { SCENE_KEYS } from '../constants/sceneKeys';
import {
  TEAM_SPACE_BACKGROUND,
  TEAM_SPACE_DECOR,
  TEAM_SPACE_EXIT_PORTAL,
  TEAM_SPACE_GROUND_Y,
  TEAM_SPACE_MAP_HEIGHT,
  TEAM_SPACE_MAP_WIDTH,
  TEAM_SPACE_SURFACES,
  TEAM_SPACE_VIEWPORT_HEIGHT,
  TEAM_SPACE_VIEWPORT_WIDTH,
} from '../constants/teamSpaceLayout';
import { LAYOUT_EDITOR, LayoutEditor } from '../editor/LayoutEditor';
import { Player } from '../objects/Player';
import { canLandOnOneWaySurface } from '../physics/oneWaySurface';
import { InteractionPrompt } from '../ui/InteractionPrompt';

const DEBUG_PHYSICS = import.meta.env.VITE_DEBUG_PHYSICS === 'true';

function applyFlip<T extends Phaser.GameObjects.Image>(image: T, config: unknown) {
  const flipX =
    typeof config === 'object' &&
    config !== null &&
    'flipX' in config &&
    typeof (config as { flipX?: unknown }).flipX === 'boolean'
      ? (config as { flipX: boolean }).flipX
      : false;

  return image.setFlipX(flipX);
}

type TeamSpaceData = {
  teamName?: string;
};

export class TeamSpaceScene extends Phaser.Scene {
  private player!: Player;
  private prompt!: InteractionPrompt;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private collisionSurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private oneWaySurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private exitPortal!: Phaser.GameObjects.Image;
  private layoutEditor!: LayoutEditor;
  private teamName = 'Team Space';

  constructor() {
    super(SCENE_KEYS.teamSpace);
  }

  init(data: TeamSpaceData) {
    this.teamName = data.teamName ?? 'Team Space';
  }

  preload() {
    loadImageAssets(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, TEAM_SPACE_MAP_WIDTH, TEAM_SPACE_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, TEAM_SPACE_MAP_WIDTH, TEAM_SPACE_MAP_HEIGHT);
    this.layoutEditor = new LayoutEditor(this, 'TeamSpaceScene');

    this.createBackground();
    this.createSurfaces();
    this.createDecor();
    this.createExitPortal();
    this.createPlayer();
    this.createTitle();
    this.createLayoutEditor();

    this.prompt = new InteractionPrompt(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    this.player.update();

    if (LAYOUT_EDITOR) {
      this.updateLayoutEditor();
      return;
    }

    this.handleInteraction();
  }

  private createBackground() {
    this.add
      .tileSprite(0, 0, TEAM_SPACE_VIEWPORT_WIDTH, TEAM_SPACE_VIEWPORT_HEIGHT, ASSET_KEYS.officeSkyGradient)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1);

    const room = this.add
      .image(TEAM_SPACE_BACKGROUND.room.x, TEAM_SPACE_BACKGROUND.room.y, ASSET_KEYS.teamWorkroomBackground)
      .setOrigin(0)
      .setScale(TEAM_SPACE_BACKGROUND.room.scale)
      .setDepth(2);
    applyFlip(room, TEAM_SPACE_BACKGROUND.room);
    this.registerEditableImage('background.room', room);

    const floor = this.add
      .tileSprite(
        TEAM_SPACE_MAP_WIDTH / 2,
        TEAM_SPACE_BACKGROUND.floor.y,
        TEAM_SPACE_MAP_WIDTH,
        TEAM_SPACE_BACKGROUND.floor.height,
        ASSET_KEYS.officeFloor,
      )
      .setOrigin(0.5, 0)
      .setDepth(10);
    floor.tileScaleX = TEAM_SPACE_BACKGROUND.floor.tileScale;
    floor.tileScaleY = TEAM_SPACE_BACKGROUND.floor.tileScale;
    floor.tilePositionY = TEAM_SPACE_BACKGROUND.floor.tilePositionY;
  }

  private createSurfaces() {
    this.collisionSurfaces = this.physics.add.staticGroup();
    this.oneWaySurfaces = this.physics.add.staticGroup();
    this.createSurface('surface.ground', TEAM_SPACE_SURFACES.ground);

    TEAM_SPACE_SURFACES.middleFloors.forEach((surface, index) => {
      this.createSurface(`surface.middleFloor.${index}`, surface, this.oneWaySurfaces);
    });

    TEAM_SPACE_SURFACES.platforms.forEach((surface, index) => {
      this.createSurface(`surface.platform.${index}`, surface, this.oneWaySurfaces);
    });

    TEAM_SPACE_SURFACES.desks.forEach((surface, index) => {
      this.createSurface(`surface.desk.${index}`, surface, this.oneWaySurfaces);
    });
  }

  private createSurface(
    id: string,
    config: { x: number; y: number; width: number; height: number },
    group = this.collisionSurfaces,
  ) {
    const surface = this.add.zone(config.x, config.y, config.width, config.height);
    this.physics.add.existing(surface, true);
    group.add(surface);

    if (DEBUG_PHYSICS || LAYOUT_EDITOR) {
      const debug = this.add
        .rectangle(config.x, config.y, config.width, config.height, 0xff3355, 0.24)
        .setStrokeStyle(1, 0xff3355, 0.9)
        .setDepth(999);

      this.registerEditableSurface(id, surface, debug);
    }
  }

  private createDecor() {
    TEAM_SPACE_DECOR.furniture.forEach((item) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.key).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.registerEditableImage(`furniture.${item.key}.${item.x}`, image);
    });

    TEAM_SPACE_DECOR.desks.forEach((item, index) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.key).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.registerEditableImage(`desk.${index}`, image);
    });

    TEAM_SPACE_DECOR.plants.forEach((item, index) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.key).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.registerEditableImage(`plant.${index}`, image);
    });

    TEAM_SPACE_DECOR.hangingLanterns.forEach((item, index) => {
      const image = this.add
        .image(item.x, item.y, ASSET_KEYS.officeHangingLantern)
        .setOrigin(0.5, 0)
        .setScale(item.scale)
        .setDepth(item.depth);
      applyFlip(image, item);
      this.registerEditableImage(`hangingLantern.${index}`, image);
    });
  }

  private createExitPortal() {
    this.exitPortal = this.add
      .image(TEAM_SPACE_EXIT_PORTAL.x, TEAM_SPACE_EXIT_PORTAL.y, ASSET_KEYS.officePortalBlue)
      .setOrigin(0.5, 1)
      .setScale(TEAM_SPACE_EXIT_PORTAL.scale)
      .setDepth(22);
    applyFlip(this.exitPortal, TEAM_SPACE_EXIT_PORTAL);
    const labelText = this.add
      .text(this.exitPortal.x, this.exitPortal.y - this.exitPortal.displayHeight - 18, TEAM_SPACE_EXIT_PORTAL.label, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '15px',
        color: '#f6fbff',
        stroke: '#1b2c3d',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(23);
    this.layoutEditor.registerPortal('exitPortal', this.exitPortal, labelText);
  }

  private createPlayer() {
    this.player = new Player(this, 260, TEAM_SPACE_GROUND_Y);
    this.player.alignBodyBottomTo(TEAM_SPACE_SURFACES.ground.y - TEAM_SPACE_SURFACES.ground.height / 2);
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

  private createTitle() {
    this.add
      .text(24, 22, this.teamName, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '18px',
        color: '#f7fbff',
        stroke: '#3b2515',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  private handleInteraction() {
    if (LAYOUT_EDITOR) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.exitPortal.x,
      this.exitPortal.y - 40,
      this.player.x,
      this.player.y - 45,
    );

    if (distance > TEAM_SPACE_EXIT_PORTAL.radius) {
      this.prompt.hide();
      return;
    }

    this.prompt.show('E Office', this.exitPortal.x, this.exitPortal.y - this.exitPortal.displayHeight - 42);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      console.log('Office portal entered');
      this.scene.start(SCENE_KEYS.office);
    }
  }

  private registerEditableImage(id: string, target: Phaser.GameObjects.Image) {
    if (!LAYOUT_EDITOR) {
      return;
    }

    this.layoutEditor.registerImage(id, target);
  }

  private registerEditableSurface(id: string, zone: Phaser.GameObjects.Zone, debug: Phaser.GameObjects.Rectangle) {
    if (!LAYOUT_EDITOR) {
      return;
    }

    debug.destroy();
    this.layoutEditor.registerSurface(id, zone);
  }

  private createLayoutEditor() {
    if (!LAYOUT_EDITOR) {
      return;
    }

    this.layoutEditor.activate();
  }

  private updateLayoutEditor() {
    this.layoutEditor.update();
  }
}
