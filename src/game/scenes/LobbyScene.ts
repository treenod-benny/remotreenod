import Phaser from 'phaser';
import { loadImageAssets } from '../constants/assetManifest';
import { ASSET_KEYS } from '../constants/assetKeys';
import { DIALOGUES, NOTICE_BOARD } from '../constants/dialogues';
import {
  BACKGROUND,
  GROUND_Y,
  MAP_HEIGHT,
  MAP_WIDTH,
  NPCS,
  OBJECTS,
  PORTALS,
  SURFACES,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../constants/lobbyLayout';
import { SCENE_KEYS } from '../constants/sceneKeys';
import { LayoutEditor } from '../editor/LayoutEditor';
import { Npc } from '../objects/Npc';
import { Player } from '../objects/Player';
import { PresenceAvatar } from '../objects/PresenceAvatar';
import { Portal } from '../objects/Portal';
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

type ParallaxLayer = {
  image: Phaser.GameObjects.Image;
  factor: number;
  baseX: number;
  baseY: number;
};

type InteractionTarget =
  | {
      kind: 'npc';
      object: Npc;
      distance: number;
    }
  | {
      kind: 'portal';
      object: Portal;
      distance: number;
    };

export class LobbyScene extends Phaser.Scene {
  private player!: Player;
  private portals: Portal[] = [];
  private npcs: Npc[] = [];
  private presenceAvatars: PresenceAvatar[] = [];
  private prompt!: InteractionPrompt;
  private noticePanel?: Phaser.GameObjects.Container;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private parallaxLayers: ParallaxLayer[] = [];
  private collisionSurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private oneWaySurfaces!: Phaser.Physics.Arcade.StaticGroup;
  private layoutEditor!: LayoutEditor;
  private localChatHandler?: (event: Event) => void;

  constructor() {
    super(SCENE_KEYS.lobby);
  }

  preload() {
    loadImageAssets(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.layoutEditor = new LayoutEditor(this, 'LobbyScene');

    this.createBackground();
    this.createGround();
    this.createObjects();
    this.createInteractables();
    this.createPresence();
    this.createPlayer();
    this.createUi();
    this.layoutEditor.activate();
    this.game.events.emit('remote-tree-node:lobby-ready');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.portals.forEach((portal) => portal.destroy());
      this.npcs.forEach((npc) => npc.destroy());
      this.presenceAvatars.forEach((avatar) => avatar.destroy());
      this.removeLocalChatHandler();
    });
  }

  update() {
    this.player.update();
    this.presenceAvatars.forEach((avatar) => avatar.update(this.time.now));
    this.updateParallax();
    this.handleInteraction();
    this.layoutEditor.update();
  }

  private createPlayer() {
    const user = this.registry.get('currentUser') as AppUser | undefined;
    const treetiveNpc = NPCS[0];
    const treetivePlatform = SURFACES.platforms[2].surface;
    const spawnX = treetiveNpc.x + 92;
    const spawnY = treetivePlatform.y - treetivePlatform.height / 2;
    this.player = new Player(this, spawnX, spawnY, user);
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

  private createUi() {
    this.prompt = new InteractionPrompt(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private createBackground() {
    const image = this.add
      .image(BACKGROUND.x, BACKGROUND.y, ASSET_KEYS.lobbyBackground)
      .setOrigin(0)
      .setScrollFactor(0)
      .setScale(BACKGROUND.scale)
      .setDepth(BACKGROUND.depth);

    this.parallaxLayers = [{ image, factor: BACKGROUND.factor, baseX: BACKGROUND.x, baseY: BACKGROUND.y }];
  }

  private createGround() {
    this.collisionSurfaces = this.physics.add.staticGroup();
    this.oneWaySurfaces = this.physics.add.staticGroup();

    const ground = this.add
      .tileSprite(MAP_WIDTH / 2, GROUND_Y - 8, MAP_WIDTH, 190, ASSET_KEYS.ground)
      .setOrigin(0.5, 0)
      .setDepth(10);
    ground.tileScaleX = 0.62;
    ground.tileScaleY = 0.62;
    ground.tilePositionY = 20;
    this.layoutEditor.registerImage('ground.visual', ground);

    this.createSurface('surface.ground', SURFACES.ground, this.collisionSurfaces);

    SURFACES.platforms.forEach(({ sprite, surface }, index) => {
      const platform = applyFlip(
        this.add.image(sprite.x, sprite.y, sprite.key).setOrigin(0.5, 1).setScale(sprite.scale).setDepth(11),
        sprite,
      );
      this.layoutEditor.registerImage(`platform.${index}`, platform);
      this.createSurface(`surface.platform.${index}`, surface, this.oneWaySurfaces);
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

  private createObjects() {
    SURFACES.benches.forEach(({ sprite, surface }, index) => {
      const bench = applyFlip(
        this.add.image(sprite.x, sprite.y, ASSET_KEYS.bench).setOrigin(0.5, 1).setScale(sprite.scale).setDepth(22),
        sprite,
      );
      this.layoutEditor.registerImage(`bench.${index}`, bench);
      this.createSurface(`surface.bench.${index}`, surface, this.oneWaySurfaces);
    });

    OBJECTS.lamps.forEach((lamp, index) => {
      const image = applyFlip(
        this.add.image(lamp.x, lamp.y, ASSET_KEYS.lamp).setOrigin(0.5, 1).setScale(lamp.scale).setDepth(21),
        lamp,
      );
      this.layoutEditor.registerImage(`lamp.${index}`, image);
    });

    OBJECTS.fences.forEach((fence) => {
      const image = applyFlip(
        this.add.image(fence.x, fence.y, 'editor-lobby-fence').setOrigin(0.5, 1).setScale(fence.scale).setDepth(fence.depth),
        fence,
      );
      this.layoutEditor.registerImage(fence.id, image);
    });

    OBJECTS.editorDecor.forEach((item) => {
      const image = applyFlip(
        this.add.image(item.x, item.y, item.textureKey).setOrigin(0.5, 1).setScale(item.scale).setDepth(item.depth),
        item,
      );
      this.layoutEditor.registerImage(item.id, image);
    });
  }

  private createInteractables() {
    this.portals = PORTALS.map((portal) => new Portal(this, portal));
    this.npcs = NPCS.map(
      (npc) =>
        new Npc(this, {
          ...npc,
          dialogue: [...DIALOGUES.pokota],
        }),
    );
    this.portals.forEach((portal, index) =>
      this.layoutEditor.registerPortal(`portal.${portal.label}.${index}`, portal.getEditorSprite(), portal.getEditorLabelText()),
    );
    this.npcs.forEach((npc, index) => this.layoutEditor.registerImage(`npc.${npc.name}.${index}`, npc.getEditorSprite()));
  }

  private createPresence() {
    this.presenceAvatars = FAKE_PRESENCE_ENTITIES.filter((entity) => entity.location === 'lobby').map(
      (entity) => new PresenceAvatar(this, entity),
    );
  }

  private updateParallax() {
    const scrollX = this.cameras.main.scrollX;
    this.parallaxLayers.forEach(({ image, factor, baseX, baseY }) => {
      image.x = baseX - scrollX * factor;
      image.y = baseY;
    });
  }

  private getClosestInteractionTarget(): InteractionTarget | undefined {
    const candidates: InteractionTarget[] = [
      ...this.npcs
        .filter((npc) => npc.isNear(this.player))
        .map((npc) => ({
          kind: 'npc' as const,
          object: npc,
          distance: npc.getDistanceToPlayer(this.player),
        })),
      ...this.portals
        .filter((portal) => portal.isNear(this.player))
        .map((portal) => ({
          kind: 'portal' as const,
          object: portal,
          distance: portal.getDistanceToPlayer(this.player),
        })),
    ];

    return candidates.sort((a, b) => a.distance - b.distance)[0];
  }

  private handleInteraction() {
    const target = this.getClosestInteractionTarget();

    if (!target) {
      this.prompt.hide();
      this.hideNoticeBoard();
      return;
    }

    if (target.kind === 'npc') {
      const position = target.object.getPromptPosition();
      this.prompt.show('E 공지사항', position.x, position.y);
    } else {
      const position = target.object.getPromptPosition();
      this.prompt.show(`E ${target.object.label}`, position.x, position.y);
    }

    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      return;
    }

    if (target.kind === 'npc') {
      this.showNoticeBoard();
      return;
    }

    this.hideNoticeBoard();

    if (target.object.type === 'office') {
      target.object.enter();
      this.scene.start(SCENE_KEYS.office);
      return;
    }

    if (target.object.type === 'cafe') {
      target.object.enter();
      this.scene.start(SCENE_KEYS.cafe);
      return;
    }

    target.object.enter();
  }

  private showNoticeBoard() {
    this.hideNoticeBoard();

    const width = 820;
    const height = 520;
    const x = VIEWPORT_WIDTH / 2;
    const y = VIEWPORT_HEIGHT / 2;
    const background = this.add
      .rectangle(0, 0, width, height, 0x142230, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.65)
      .setOrigin(0.5);
    const titleText = this.add
      .text(-width / 2 + 26, -height / 2 + 20, NOTICE_BOARD.title, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '24px',
        color: '#fff0b8',
      })
      .setOrigin(0);
    const messageText = this.add
      .text(-width / 2 + 26, -height / 2 + 64, NOTICE_BOARD.body, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        lineSpacing: 6,
        wordWrap: {
          width: width - 52,
        },
      })
      .setOrigin(0);

    this.noticePanel = this.add.container(x, y, [background, titleText, messageText]).setScrollFactor(0).setDepth(1001);
  }

  private hideNoticeBoard() {
    this.noticePanel?.destroy();
    this.noticePanel = undefined;
  }
}
