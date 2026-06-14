import type { AppUser } from './types';
import { PLAYER_CHARACTERS, type PlayerCharacterId } from '../game/constants/playerCharacters';

const GUEST_USER_KEY = 'remotreenod.guestUser';

function isPlayerCharacterId(value: unknown): value is PlayerCharacterId {
  return typeof value === 'string' && PLAYER_CHARACTERS.some((character) => character.id === value);
}

function createGuestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadGuestUser(): AppUser | null {
  const stored = window.localStorage.getItem(GUEST_USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppUser>;

    if (!parsed.uid || !parsed.displayName || parsed.provider !== 'guest' || !isPlayerCharacterId(parsed.characterId)) {
      return null;
    }

    return {
      uid: parsed.uid,
      displayName: parsed.displayName,
      characterId: parsed.characterId,
      provider: 'guest',
    };
  } catch {
    return null;
  }
}

export function saveGuestUser(displayName: string, characterId: PlayerCharacterId): AppUser {
  const user: AppUser = {
    uid: createGuestId(),
    displayName,
    characterId,
    provider: 'guest',
  };

  window.localStorage.setItem(GUEST_USER_KEY, JSON.stringify(user));

  return user;
}

export function persistGuestUser(user: AppUser) {
  window.localStorage.setItem(GUEST_USER_KEY, JSON.stringify(user));
}

export function clearGuestUser() {
  window.localStorage.removeItem(GUEST_USER_KEY);
}
