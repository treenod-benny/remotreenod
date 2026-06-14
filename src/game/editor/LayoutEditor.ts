import Phaser from 'phaser';
import { EDITOR_IMAGE_ASSETS } from '../constants/editorAssets';

function hasEditorQueryParam() {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('editor') === '1' || params.get('editor') === 'true';
}

export const LAYOUT_EDITOR = import.meta.env.VITE_LAYOUT_EDITOR === 'true' || hasEditorQueryParam();

type ImageEntry = {
  type: 'image';
  id: string;
  target: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite;
  outline: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  linkedTexts: Array<{
    text: Phaser.GameObjects.Text;
    offsetX: number;
    offsetY: number;
  }>;
};

type SurfaceEntry = {
  type: 'surface';
  id: string;
  zone: Phaser.GameObjects.Zone;
  outline: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

type Entry = ImageEntry | SurfaceEntry;

type EditorKeys = Record<
  | 'copy'
  | 'duplicate'
  | 'delete'
  | 'backspace'
  | 'flip'
  | 'togglePalette'
  | 'nextAsset'
  | 'previousAsset'
  | 'addAsset'
  | 'smaller'
  | 'larger'
  | 'wider'
  | 'narrower'
  | 'taller'
  | 'shorter'
  | 'left'
  | 'right'
  | 'up'
  | 'down',
  Phaser.Input.Keyboard.Key
>;

export class LayoutEditor {
  private entries: Entry[] = [];
  private selected?: Entry;
  private keys?: EditorKeys;
  private activated = false;
  private deletedIds: string[] = [];
  private paletteOpen = false;
  private selectedAssetIndex = 0;
  private paletteText?: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sceneId: string,
  ) {}

  registerImage(
    id: string,
    target: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite,
    linkedTexts: Phaser.GameObjects.Text[] = [],
  ) {
    if (!LAYOUT_EDITOR) {
      return;
    }

    const bounds = target.getBounds();
    const outline = this.scene.add
      .rectangle(bounds.centerX, bounds.centerY, bounds.width, bounds.height, 0x00d8ff, 0.08)
      .setStrokeStyle(2, 0x00d8ff, 0.9)
      .setDepth(1200)
      .setInteractive({ draggable: true });
    const label = this.createLabel(id, bounds.left, bounds.top, 0x00d8ff);
    const entry: ImageEntry = {
      type: 'image',
      id,
      target,
      outline,
      label,
      linkedTexts: linkedTexts.map((text) => ({
        text,
        offsetX: text.x - target.x,
        offsetY: text.y - target.y,
      })),
    };

    this.entries.push(entry);
    outline.on('pointerdown', () => this.select(entry));
  }

  registerPortal(id: string, target: Phaser.GameObjects.Image, labelText?: Phaser.GameObjects.Text) {
    this.registerImage(id, target, labelText ? [labelText] : []);
  }

  registerSurface(id: string, zone: Phaser.GameObjects.Zone) {
    if (!LAYOUT_EDITOR) {
      return;
    }

    const outline = this.scene.add
      .rectangle(zone.x, zone.y, zone.width, zone.height, 0xff3355, 0.24)
      .setStrokeStyle(2, 0xff3355, 0.95)
      .setDepth(1210)
      .setInteractive({ draggable: true });
    const label = this.createLabel(id, zone.x - zone.width / 2, zone.y - zone.height / 2, 0xff6b7b);
    const entry: SurfaceEntry = { type: 'surface', id, zone, outline, label };

    this.entries.push(entry);
    outline.on('pointerdown', () => this.select(entry));
  }

  activate() {
    if (!LAYOUT_EDITOR || this.activated) {
      return;
    }

    this.activated = true;
    this.keys = this.scene.input.keyboard!.addKeys({
      copy: Phaser.Input.Keyboard.KeyCodes.C,
      duplicate: Phaser.Input.Keyboard.KeyCodes.R,
      delete: Phaser.Input.Keyboard.KeyCodes.DELETE,
      backspace: Phaser.Input.Keyboard.KeyCodes.BACKSPACE,
      flip: Phaser.Input.Keyboard.KeyCodes.F,
      togglePalette: Phaser.Input.Keyboard.KeyCodes.P,
      nextAsset: Phaser.Input.Keyboard.KeyCodes.N,
      previousAsset: Phaser.Input.Keyboard.KeyCodes.B,
      addAsset: Phaser.Input.Keyboard.KeyCodes.A,
      smaller: Phaser.Input.Keyboard.KeyCodes.Q,
      larger: Phaser.Input.Keyboard.KeyCodes.E,
      wider: Phaser.Input.Keyboard.KeyCodes.L,
      narrower: Phaser.Input.Keyboard.KeyCodes.J,
      taller: Phaser.Input.Keyboard.KeyCodes.I,
      shorter: Phaser.Input.Keyboard.KeyCodes.K,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    }) as EditorKeys;

    this.entries.forEach((entry) => this.scene.input.setDraggable(entry.outline));

    this.scene.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      const entry = this.entries.find((candidate) => candidate.outline === gameObject);

      if (!entry) {
        return;
      }

      this.select(entry);
      this.move(entry, Math.round(dragX), Math.round(dragY));
    });

    console.info(`${this.sceneId} layout editor enabled.`);
    console.info('Asset palette: P toggle, N/B select asset, A add selected asset at camera center.');
  }

  update() {
    if (!LAYOUT_EDITOR) {
      return;
    }

    this.syncOverlays();
    this.updatePalette();

    if (!this.keys) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.togglePalette)) {
      this.paletteOpen = !this.paletteOpen;
      this.updatePaletteText();
    }

    if (this.paletteOpen && Phaser.Input.Keyboard.JustDown(this.keys.nextAsset)) {
      this.selectedAssetIndex = Phaser.Math.Wrap(this.selectedAssetIndex + 1, 0, EDITOR_IMAGE_ASSETS.length);
      this.updatePaletteText();
    }

    if (this.paletteOpen && Phaser.Input.Keyboard.JustDown(this.keys.previousAsset)) {
      this.selectedAssetIndex = Phaser.Math.Wrap(this.selectedAssetIndex - 1, 0, EDITOR_IMAGE_ASSETS.length);
      this.updatePaletteText();
    }

    if (this.paletteOpen && Phaser.Input.Keyboard.JustDown(this.keys.addAsset)) {
      this.addSelectedAsset();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.copy)) {
      void this.copySnapshot();
      return;
    }

    if (!this.selected) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.duplicate)) {
      this.duplicateSelected();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.delete) || Phaser.Input.Keyboard.JustDown(this.keys.backspace)) {
      this.deleteSelected();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
      this.nudge(-1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
      this.nudge(1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
      this.nudge(0, -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
      this.nudge(0, 1);
    }

    if (this.selected.type === 'image') {
      if (Phaser.Input.Keyboard.JustDown(this.keys.flip)) {
        this.selected.target.setFlipX(!this.selected.target.flipX);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.smaller)) {
        this.selected.target.setScale(Math.max(0.03, Number((this.selected.target.scaleX - 0.01).toFixed(3))));
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.larger)) {
        this.selected.target.setScale(Number((this.selected.target.scaleX + 0.01).toFixed(3)));
      }
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.keys.narrower)) {
        this.resizeSurface(this.selected, -2, 0);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.wider)) {
        this.resizeSurface(this.selected, 2, 0);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.shorter)) {
        this.resizeSurface(this.selected, 0, -2);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.taller)) {
        this.resizeSurface(this.selected, 0, 2);
      }
    }
  }

  private createLabel(id: string, x: number, y: number, color: number) {
    return this.scene.add
      .text(x, y - 16, id, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '11px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: '#101010',
        strokeThickness: 3,
      })
      .setDepth(1220);
  }

  private select(entry: Entry) {
    this.selected = entry;
    this.entries.forEach((candidate) => {
      const selected = candidate === entry;
      const color = candidate.type === 'image' ? 0x00d8ff : 0xff3355;
      candidate.outline.setStrokeStyle(selected ? 4 : 2, selected ? 0xffff00 : color, 0.95);
    });
  }

  private nudge(deltaX: number, deltaY: number) {
    if (!this.selected) {
      return;
    }

    this.move(this.selected, this.selected.outline.x + deltaX, this.selected.outline.y + deltaY);
  }

  private move(entry: Entry, x: number, y: number) {
    if (entry.type === 'image') {
      const bounds = entry.target.getBounds();
      entry.target.x += x - bounds.centerX;
      entry.target.y += y - bounds.centerY;
      this.syncImage(entry);
      return;
    }

    entry.zone.setPosition(x, y);
    const body = entry.zone.body as Phaser.Physics.Arcade.StaticBody | undefined;
    body?.updateFromGameObject();
    this.syncSurface(entry);
  }

  private resizeSurface(entry: SurfaceEntry, widthDelta: number, heightDelta: number) {
    const width = Math.max(8, entry.zone.width + widthDelta);
    const height = Math.max(8, entry.zone.height + heightDelta);
    entry.zone.setSize(width, height);

    const body = entry.zone.body as Phaser.Physics.Arcade.StaticBody | undefined;
    body?.setSize(width, height);
    body?.updateFromGameObject();
    this.syncSurface(entry);
  }

  private duplicateSelected() {
    if (!this.selected) {
      return;
    }

    const id = `${this.selected.id}.copy.${this.entries.filter((entry) => entry.id.startsWith(`${this.selected!.id}.copy`)).length + 1}`;

    if (this.selected.type === 'image') {
      const source = this.selected.target;
      const x = source.x + 24;
      const y = source.y + 24;
      const textureKey = source.texture.key;
      const frameName = source.frame.name;
      const duplicate =
        source instanceof Phaser.GameObjects.TileSprite
          ? this.scene.add.tileSprite(x, y, source.width, source.height, textureKey, frameName)
          : this.scene.add.image(x, y, textureKey, frameName);

      duplicate
        .setOrigin(source.originX, source.originY)
        .setScale(source.scaleX, source.scaleY)
        .setFlipX(source.flipX)
        .setAlpha(source.alpha)
        .setDepth(source.depth)
        .setScrollFactor(source.scrollFactorX, source.scrollFactorY);

      if (duplicate instanceof Phaser.GameObjects.TileSprite && source instanceof Phaser.GameObjects.TileSprite) {
        duplicate.tileScaleX = source.tileScaleX;
        duplicate.tileScaleY = source.tileScaleY;
        duplicate.tilePositionX = source.tilePositionX;
        duplicate.tilePositionY = source.tilePositionY;
      }

      this.registerImage(id, duplicate);
      const entry = this.entries[this.entries.length - 1];
      this.select(entry);
      return;
    }

    const zone = this.scene.add.zone(this.selected.zone.x + 24, this.selected.zone.y + 24, this.selected.zone.width, this.selected.zone.height);
    this.scene.physics.add.existing(zone, true);
    this.registerSurface(id, zone);
    const entry = this.entries[this.entries.length - 1];
    this.select(entry);
  }

  private deleteSelected() {
    if (!this.selected) {
      return;
    }

    const entry = this.selected;
    this.entries = this.entries.filter((candidate) => candidate !== entry);

    if (entry.type === 'image') {
      entry.linkedTexts.forEach(({ text }) => text.destroy());
      entry.target.destroy();
    } else {
      entry.zone.destroy();
    }

    this.deletedIds.push(entry.id);
    entry.outline.destroy();
    entry.label.destroy();
    this.selected = undefined;
  }

  private syncOverlays() {
    this.entries.forEach((entry) => {
      if (entry.type === 'image') {
        this.syncImage(entry);
      } else {
        this.syncSurface(entry);
      }
    });
  }

  private syncImage(entry: ImageEntry) {
    const bounds = entry.target.getBounds();
    entry.outline.setPosition(bounds.centerX, bounds.centerY).setSize(bounds.width, bounds.height);
    entry.label.setPosition(bounds.left, bounds.top - 16);
    entry.linkedTexts.forEach(({ text, offsetX, offsetY }) => {
      text.setPosition(entry.target.x + offsetX, entry.target.y + offsetY);
    });
  }

  private syncSurface(entry: SurfaceEntry) {
    entry.outline.setPosition(entry.zone.x, entry.zone.y).setSize(entry.zone.width, entry.zone.height);
    entry.label.setPosition(entry.zone.x - entry.zone.width / 2, entry.zone.y - entry.zone.height / 2 - 16);
  }

  private async copySnapshot() {
    const snapshot = {
      scene: this.sceneId,
      images: this.entries
        .filter((entry): entry is ImageEntry => entry.type === 'image')
        .map(({ id, target }) => ({
          id,
          textureKey: target.texture.key,
          x: Math.round(target.x),
          y: Math.round(target.y),
          scale: Number(target.scaleX.toFixed(3)),
          flipX: target.flipX,
          depth: target.depth,
        })),
      portals: this.entries
        .filter((entry): entry is ImageEntry => entry.type === 'image' && (entry.id.startsWith('portal.') || entry.id === 'exitPortal'))
        .map(({ id, target }) => ({
          id,
          x: Math.round(target.x),
          y: Math.round(target.y),
          scale: Number(target.scaleX.toFixed(3)),
          flipX: target.flipX,
          depth: target.depth,
        })),
      surfaces: this.entries
        .filter((entry): entry is SurfaceEntry => entry.type === 'surface')
        .map(({ id, zone }) => ({
          id,
          x: Math.round(zone.x),
          y: Math.round(zone.y),
          width: Math.round(zone.width),
          height: Math.round(zone.height),
        })),
      deleted: [...this.deletedIds],
    };
    const json = JSON.stringify(snapshot, null, 2);

    console.info(`${this.sceneId} layout snapshot:`, json);

    try {
      await navigator.clipboard?.writeText(json);
      console.info(`${this.sceneId} layout snapshot copied to clipboard.`);
    } catch {
      console.info('Clipboard write failed. Use the console output instead.');
    }
  }

  private updatePalette() {
    if (!this.paletteText) {
      return;
    }

    this.paletteText.setVisible(this.paletteOpen).setPosition(18, 18);
  }

  private updatePaletteText() {
    if (!this.paletteText) {
      this.paletteText = this.scene.add
        .text(18, 18, '', {
          fontFamily: 'NanumSquareRound, Arial, sans-serif',
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#101820dd',
          padding: {
            x: 10,
            y: 8,
          },
        })
        .setScrollFactor(0)
        .setDepth(1300);
    }

    const asset = EDITOR_IMAGE_ASSETS[this.selectedAssetIndex];
    const previous = EDITOR_IMAGE_ASSETS[Phaser.Math.Wrap(this.selectedAssetIndex - 1, 0, EDITOR_IMAGE_ASSETS.length)];
    const next = EDITOR_IMAGE_ASSETS[Phaser.Math.Wrap(this.selectedAssetIndex + 1, 0, EDITOR_IMAGE_ASSETS.length)];
    this.paletteText
      .setText(
        [
          'Asset Palette',
          'P close | N next | B prev | A add',
          '',
          `> ${asset.label}`,
          `  prev: ${previous.label}`,
          `  next: ${next.label}`,
        ].join('\n'),
      )
      .setVisible(this.paletteOpen);
  }

  private addSelectedAsset() {
    const asset = EDITOR_IMAGE_ASSETS[this.selectedAssetIndex];
    const camera = this.scene.cameras.main;
    const x = Math.round(camera.scrollX + camera.width / 2);
    const y = Math.round(camera.scrollY + camera.height / 2);
    const image = this.scene.add.image(x, y, asset.key).setOrigin(0.5, 1).setScale(0.3).setDepth(20);
    const id = `added.${asset.key}.${this.entries.filter((entry) => entry.id.startsWith(`added.${asset.key}`)).length + 1}`;

    this.registerImage(id, image);
    const entry = this.entries[this.entries.length - 1];
    this.select(entry);
  }
}
