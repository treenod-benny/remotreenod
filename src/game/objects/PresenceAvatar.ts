import Phaser from 'phaser';
import { getPlayerCharacter } from '../constants/playerCharacters';
import { PRESENCE_STATUS_LABELS, type PresenceEntity } from '../constants/presence';

export class PresenceAvatar {
  private readonly entity: PresenceEntity;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly nameplate: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly tooltip: Phaser.GameObjects.Container;
  private readonly baseX: number;
  private readonly baseY: number;
  private readonly phase: number;

  constructor(scene: Phaser.Scene, entity: PresenceEntity) {
    this.entity = entity;
    this.baseX = entity.x;
    this.baseY = entity.y;
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.sprite = scene.add
      .image(entity.x, entity.y, getPlayerCharacter(entity.characterId).assetKey)
      .setOrigin(0.5, 1)
      .setScale(0.38)
      .setDepth(38)
      .setAlpha(entity.status === 'afk' ? 0.72 : 0.95)
      .setInteractive({ useHandCursor: true });

    this.nameplate = scene.add
      .text(entity.x, entity.y - this.sprite.displayHeight - 20, entity.displayName, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#142230',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(82);

    const status = PRESENCE_STATUS_LABELS[entity.status];
    this.statusText = scene.add
      .text(entity.x, entity.y - this.sprite.displayHeight - 2, status, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '11px',
        color: '#dcebf3',
        stroke: '#142230',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(82);

    this.tooltip = this.createTooltip(scene, entity.currentTask ?? status).setVisible(false);
    this.sprite.on(Phaser.Input.Events.POINTER_OVER, () => this.tooltip.setVisible(true));
    this.sprite.on(Phaser.Input.Events.POINTER_OUT, () => this.tooltip.setVisible(false));
  }

  update(time: number) {
    let x = this.baseX;
    let y = this.baseY;

    if (this.entity.behavior === 'walk') {
      x += Math.sin(time / 900 + this.phase) * 42;
      this.sprite.setFlipX(Math.cos(time / 900 + this.phase) > 0);
    }

    if (this.entity.behavior === 'look-around') {
      this.sprite.setFlipX(Math.sin(time / 1200 + this.phase) > 0);
    }

    if (this.entity.behavior === 'sleep') {
      y += Math.sin(time / 700 + this.phase) * 2;
    }

    this.sprite.setPosition(x, y);
    this.nameplate.setPosition(x, y - this.sprite.displayHeight - 20);
    this.statusText.setPosition(x, y - this.sprite.displayHeight - 2);
    this.tooltip.setPosition(x, y - this.sprite.displayHeight - 50);
  }

  destroy() {
    this.sprite.destroy();
    this.nameplate.destroy();
    this.statusText.destroy();
    this.tooltip.destroy();
  }

  private createTooltip(scene: Phaser.Scene, message: string) {
    const text = scene.add
      .text(0, 0, message, {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '13px',
        color: '#17202a',
        wordWrap: {
          width: 220,
        },
      })
      .setOrigin(0.5);
    const width = Math.max(92, text.width + 24);
    const height = Math.max(34, text.height + 16);
    const background = scene.add
      .rectangle(0, 0, width, height, 0xffffff, 0.94)
      .setStrokeStyle(2, 0x17202a, 0.18)
      .setOrigin(0.5);
    const tail = scene.add.triangle(0, height / 2 + 6, 0, 0, 14, 0, 7, 8, 0xffffff, 0.94).setOrigin(0.5);

    return scene.add.container(this.baseX, this.baseY - this.sprite.displayHeight - 50, [background, text, tail]).setDepth(122);
  }
}
