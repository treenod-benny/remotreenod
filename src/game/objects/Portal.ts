import Phaser from 'phaser';
import { ASSET_KEYS } from '../constants/assetKeys';
import { Player } from './Player';

export type PortalType = 'office' | 'cafe';

type PortalConfig = {
  type: PortalType;
  label: string;
  x: number;
  y: number;
  interactionRadius?: number;
  scale?: number;
};

export class Portal {
  readonly type: PortalType;
  readonly label: string;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly interactionRadius: number;

  constructor(scene: Phaser.Scene, config: PortalConfig) {
    this.type = config.type;
    this.label = config.label;
    this.interactionRadius = config.interactionRadius ?? 130;
    this.sprite = scene.add
      .image(config.x, config.y, ASSET_KEYS.portalBlue)
      .setOrigin(0.5, 1)
      .setScale(config.scale ?? 0.28)
      .setDepth(25);
    this.labelText = scene.add
      .text(config.x, config.y - this.sprite.displayHeight - 18, config.label, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '20px',
        color: '#f6fbff',
        stroke: '#1b2c3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(26);
  }

  isNear(player: Player) {
    return this.getDistanceToPlayer(player) <= this.interactionRadius;
  }

  getDistanceToPlayer(player: Player) {
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y - 40, player.x, player.y - 45);
  }

  getPromptPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y - this.sprite.displayHeight - 48,
    };
  }

  getEditorSprite() {
    return this.sprite;
  }

  getEditorLabelText() {
    return this.labelText;
  }

  enter() {
    const logByType: Record<PortalType, string> = {
      office: 'Office portal entered',
      cafe: 'Cafe portal entered',
    };

    console.log(logByType[this.type]);
  }

  destroy() {
    this.sprite.destroy();
    this.labelText.destroy();
  }
}
