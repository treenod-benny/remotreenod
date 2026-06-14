export type PlayerCharacterId = 'treetive-01' | 'treetive-02' | 'treetive-03' | 'treetive-04';

export type PlayerCharacter = {
  id: PlayerCharacterId;
  label: string;
  assetKey: string;
  imagePath: string;
};

export const PLAYER_CHARACTERS: PlayerCharacter[] = [
  {
    id: 'treetive-01',
    label: 'Treetive 01',
    assetKey: 'player-treetive-01',
    imagePath: '/assets/treetive/treetive_01.png',
  },
  {
    id: 'treetive-02',
    label: 'Treetive 02',
    assetKey: 'player-treetive-02',
    imagePath: '/assets/treetive/treetive_02.png',
  },
  {
    id: 'treetive-03',
    label: 'Treetive 03',
    assetKey: 'player-treetive-03',
    imagePath: '/assets/treetive/treetive_03.png',
  },
  {
    id: 'treetive-04',
    label: 'Treetive 04',
    assetKey: 'player-treetive-04',
    imagePath: '/assets/treetive/treetive_04.png',
  },
];

export const DEFAULT_PLAYER_CHARACTER = PLAYER_CHARACTERS[0];

export function getPlayerCharacter(characterId?: string) {
  return PLAYER_CHARACTERS.find((character) => character.id === characterId) ?? DEFAULT_PLAYER_CHARACTER;
}
