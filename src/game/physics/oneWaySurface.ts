import Phaser from 'phaser';
import { Player } from '../objects/Player';

export function canLandOnOneWaySurface(
  playerObject:
    | Phaser.Types.Physics.Arcade.GameObjectWithBody
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody
    | Phaser.Tilemaps.Tile,
  surfaceObject:
    | Phaser.Types.Physics.Arcade.GameObjectWithBody
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody
    | Phaser.Tilemaps.Tile,
) {
  const playerBody = (playerObject as Phaser.Types.Physics.Arcade.GameObjectWithBody).body as Phaser.Physics.Arcade.Body;
  const surfaceBody = (surfaceObject as Phaser.Types.Physics.Arcade.GameObjectWithBody).body as Phaser.Physics.Arcade.StaticBody;
  const player = playerObject as Player;

  if (player.isDroppingThroughOneWaySurface?.()) {
    return false;
  }

  const canLand = playerBody.velocity.y >= 0 && playerBody.bottom <= surfaceBody.top + 14;

  if (canLand) {
    player.enableDropThroughOneWaySurface?.();
  }

  return canLand;
}
