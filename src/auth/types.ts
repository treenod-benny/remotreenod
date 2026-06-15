import type { PlayerCharacterId } from '../game/constants/playerCharacters';

export type AppUser = {
  uid: string;
  displayName: string;
  characterId: PlayerCharacterId;
  email?: string;
  photoURL?: string;
  provider: 'guest';
};
