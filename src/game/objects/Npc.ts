import Phaser from 'phaser';
import { ASSET_KEYS } from '../constants/assetKeys';
import { Player } from './Player';

type NpcConfig = {
  name: string;
  x: number;
  y: number;
  dialogue: string[];
  interactionRadius?: number;
  scale?: number;
};

export class Npc {
  readonly name: string;
  readonly dialogue: string[];
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly interactionRadius: number;
  private dialogueIndex = 0;

  constructor(scene: Phaser.Scene, config: NpcConfig) {
    this.name = config.name;
    this.dialogue = config.dialogue;
    this.interactionRadius = config.interactionRadius ?? 125;
    this.sprite = scene.add
      .image(config.x, config.y, ASSET_KEYS.npcPokota)
      .setOrigin(0.5, 1)
      .setScale(config.scale ?? 0.33)
      .setDepth(35);
  }

  isNear(player: Player) {
    return this.getDistanceToPlayer(player) <= this.interactionRadius;
  }

  getDistanceToPlayer(player: Player) {
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y - 44, player.x, player.y - 45);
  }

  getPromptPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y - this.sprite.displayHeight - 34,
    };
  }

  getEditorSprite() {
    return this.sprite;
  }

  getNextLine() {
    const line = this.dialogue[this.dialogueIndex] ?? '';
    this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogue.length;
    return line;
  }

  destroy() {
    this.sprite.destroy();
  }
}
