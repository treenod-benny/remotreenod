import Phaser from 'phaser';
import { loadImageAssets } from '../constants/assetManifest';
import { ASSET_KEYS } from '../constants/assetKeys';
import {
  OFFICE_BACKGROUND,
  OFFICE_DECOR,
  OFFICE_GROUND_Y,
  OFFICE_MAP_HEIGHT,
  OFFICE_MAP_WIDTH,
  OFFICE_PORTALS,
  OFFICE_SURFACES,
  OFFICE_VIEWPORT_HEIGHT,
  OFFICE_VIEWPORT_WIDTH,
  type OfficePortalKind,
} from '../constants/officeLayout';
import { SCENE_KEYS } from '../constants/sceneKeys';
import { LayoutEditor } from '../editor/LayoutEditor';
import { Player } from '../objects/Player';
import { PresenceAvatar } from '../objects/PresenceAvatar';
import { canLandOnOneWaySurface } from '../physics/oneWaySurface';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import type { AppUser } from '../../auth/types';
import { FAKE_PRESENCE_ENTITIES } from '../constants/presence';

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

type OfficePortal = {
  kind: OfficePortalKind;
  label: string;
  log: string;
  sprite: Phaser.GameObjects.Image;
  labelText: Phaser.GameObjects.Text;
  radius: number;
};

export class OfficeScene extends Phaser.Scene {
  private player!: Player;
  private prompt!: InteractionPrompt;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private collisionSurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private oneWaySurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private portals: OfficePortal[] = [];
  private presenceAvatars: PresenceAvatar[] = [];
  private layoutEditor!: LayoutEditor;
  private localChatHandler?: (event: Event) => void;

  constructor() {
    super(SCENE_KEYS.office);
  }

  preload() {
    loadImageAssets(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, OFFICE_MAP_WIDTH, OFFICE_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, OFFICE_MAP_WIDTH, OFFICE_MAP_HEIGHT);
    this.layoutEditor = new LayoutEditor(this, 'OfficeScene');

    this.createBackground();
    this.createSurfaces();
    this.createDecor();
    this.createPortals();
    this.createPresence();
    this.createPlayer();
    this.layoutEditor.activate();

    this.prompt = new InteractionPrompt(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.presenceAvatars.forEach((avatar) => avatar.destroy());
      this.removeLocalChatHandler();
    });
  }

  update() {
    this.player.update();
    this.presenceAvatars.forEach((avatar) => avatar.update(this.time.now));
    this.handleInteraction();
    this.layoutEditor.update();
  }

  private createBackground() {
    this.add
      .tileSprite(0, 0, OFFICE_VIEWPORT_WIDTH, OFFICE_VIEWPORT_HEIGHT, ASSET_KEYS.officeSkyGradient)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1);

    const window = this.add
      .tileSprite(OFFICE_MAP_WIDTH / 2, OFFICE_BACKGROUND.window.y, OFFICE_MAP_WIDTH, OFFICE_VIEWPORT_HEIGHT, ASSET_KEYS.officeWindow)
      .setOrigin(0.5, 0)
      .setDepth(2);
    window.tileScaleX = OFFICE_BACKGROUND.window.tileScale;
    window.tileScaleY = OFFICE_BACKGROUND.window.tileScale;
    window.tilePositionY = OFFICE_BACKGROUND.window.tilePositionY;

    const floor = this.add
      .tileSprite(
        OFFICE_MAP_WIDTH / 2,
        OFFICE_BACKGROUND.floor.y,
        OFFICE_MAP_WIDTH,
        OFFICE_BACKGROUND.floor.height,
        ASSET_KEYS.officeFloor,
      )
      .setOrigin(0.5, 0)
      .setDepth(9);
    floor.tileScaleX = OFFICE_BACKGROUND.floor.tileScale;
    floor.tileScaleY = OFFICE_BACKGROUND.floor.tileScale;
    floor.tilePositionY = OFFICE_BACKGROUND.floor.tilePositionY;
    this.layoutEditor.registerImage('floor.visual', floor);
  }

  private createSurfaces() {
    this.collisionSurfaces = this.physics.add.staticGroup();
    this.oneWaySurfaces = this.physics.add.staticGroup();
    this.createSurface('surface.ground', OFFICE_SURFACES.ground);

    OFFICE_SURFACES.platforms.forEach(({ sprite, surface }, index) => {
      const image = applyFlip(
        this.add.image(sprite.x, sprite.y, sprite.key).setOrigin(0.5, 1).setScale(sprite.scale).setDepth(14),
        sprite,
      );
      this.layoutEditor.registerImage(`platform.${index}`, image);
      this.createSurface(`surface.platform.${index}`, surface, this.oneWaySurfaces);
    });

    OFFICE_SURFACES.stairs.forEach((stair, index) => {
      const editorId = 'id' in stair ? stair.id : index;
      const image = applyFlip(
        this.add.image(stair.x, stair.y, stair.key).setOrigin(0.5, 1).setScale(stair.scale).setDepth(13),
        stair,
      );
      this.layoutEditor.registerImage(`stair.${editorId}`, image);
      this.createSurface(`surface.stair.${editorId}`, stair.surface, this.oneWaySurfaces);
    });

    OFFICE_SURFACES.benches.forEach((surface, index) => {
      this.createSurface(`surface.bench.${index}`, surface, this.oneWaySurfaces);
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
    this.layoutEditor.registerSurface(id, surface);

    if (DEBUG_PHYSICS) {
      this.add
        .rectangle(config.x, config.y, config.width, config.height, 0xff3355, 0.24)
        .setStrokeStyle(1, 0xff3355, 0.9)
        .setDepth(999);
    }
  }

  private createDecor() {
    OFFICE_DECOR.furniture.forEach((item, index) => {
      const editorId = 'id' in item ? item.id : index;
      const image = applyFlip(
        this.add.image(item.x, item.y, item.key).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.layoutEditor.registerImage(`furniture.${editorId}`, image);
    });

    OFFICE_DECOR.plants.forEach((item, index) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.key).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.layoutEditor.registerImage(`plant.${index}`, image);
    });

    OFFICE_DECOR.hangingLanterns.forEach((item, index) => {
      const image = this.add
        .image(item.x, item.y, ASSET_KEYS.officeHangingLantern)
        .setOrigin(0.5, 0)
        .setScale(item.scale)
        .setDepth(item.depth);
      applyFlip(image, item);
      this.layoutEditor.registerImage(`hangingLantern.${index}`, image);
    });

    OFFICE_DECOR.editorDecor.forEach((item) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.textureKey).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.layoutEditor.registerImage(item.id, image);
    });
  }

  private createPortals() {
    this.portals = OFFICE_PORTALS.map((portal) => {
      const sprite = this.add
        .image(portal.x, portal.y, ASSET_KEYS.officePortalBlue)
        .setOrigin(0.5, 1)
        .setScale(portal.scale)
        .setDepth(22);
      applyFlip(sprite, portal);
      const labelText = this.add
        .text(portal.x, portal.y - sprite.displayHeight - 18, portal.label, {
          fontFamily: 'NanumSquareRound, Arial, sans-serif',
          fontSize: '15px',
          color: '#f6fbff',
          stroke: '#1b2c3d',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(23);

      return {
        kind: portal.kind,
        label: portal.label,
        log: portal.log,
        sprite,
        labelText,
        radius: 120,
      };
    });
    this.portals.forEach((portal, index) => this.layoutEditor.registerPortal(`portal.${portal.label}.${index}`, portal.sprite, portal.labelText));
  }

  private createPresence() {
    this.presenceAvatars = FAKE_PRESENCE_ENTITIES.filter((entity) => entity.location === 'office').map(
      (entity) => new PresenceAvatar(this, entity),
    );
  }

  private createPlayer() {
    const user = this.registry.get('currentUser') as AppUser | undefined;
    this.player = new Player(this, 260, OFFICE_GROUND_Y, user);
    this.player.alignBodyBottomTo(OFFICE_SURFACES.ground.y - OFFICE_SURFACES.ground.height / 2);
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
    this.bindLocalChatHandler();
  }

  private bindLocalChatHandler() {
    this.removeLocalChatHandler();
    this.localChatHandler = (event: Event) => {
      const message = (event as CustomEvent<{ body?: string }>).detail?.body;

      if (message) {
        this.player.showSpeechBubble(message);
      }
    };
    window.addEventListener('remote-tree-node:local-chat', this.localChatHandler);
  }

  private removeLocalChatHandler() {
    if (!this.localChatHandler) {
      return;
    }

    window.removeEventListener('remote-tree-node:local-chat', this.localChatHandler);
    this.localChatHandler = undefined;
  }

  private handleInteraction() {
    const portal = this.getClosestPortal();

    if (!portal) {
      this.prompt.hide();
      return;
    }

    this.prompt.show(`E ${portal.label}`, portal.sprite.x, portal.sprite.y - portal.sprite.displayHeight - 42);

    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      return;
    }

    console.log(portal.log);

    if (portal.kind === 'lobby') {
      this.scene.start(SCENE_KEYS.lobby);
      return;
    }

    this.scene.start(SCENE_KEYS.teamSpace, { teamName: portal.label });
  }

  private getClosestPortal() {
    return this.portals
      .map((portal) => ({
        portal,
        distance: Phaser.Math.Distance.Between(portal.sprite.x, portal.sprite.y - 40, this.player.x, this.player.y - 45),
      }))
      .filter(({ portal, distance }) => distance <= portal.radius)
      .sort((a, b) => a.distance - b.distance)[0]?.portal;
  }
}
