# Authentication Plan

## Goal

Build a temporary guest identity flow now, then replace or extend it with Firebase Google Login later without changing the rest of the app flow.

## Priority

1. Guest identity
   - Let the user enter a display name before entering the lobby.
   - Generate a stable local `uid`.
   - Store the guest profile in `localStorage`.

2. App-level auth boundary
   - Add `AuthProvider` and `useAuth()`.
   - Show the entry screen when there is no user.
   - Show `PhaserGame` only after a user exists.

3. Phaser user handoff
   - Pass the current user into `PhaserGame`.
   - Store the current user in the Phaser registry.
   - Display the user's name above the local player.

4. Storage abstraction
   - Keep local guest persistence behind a small service.
   - Avoid direct `localStorage` reads from UI or Phaser scene code.

5. Firebase migration
   - Add Firebase config and SDK.
   - Add `loginWithGoogle()`.
   - Map Firebase `User` into the existing app user shape.
   - Keep the Phaser handoff unchanged.

## Current Implementation Scope

- Guest display name entry
- Guest character selection from `public/assets/treetive/`
- Persistent guest profile
- Logout
- Auth-aware app shell
- Current user display in React
- Player nameplate in Phaser scenes

## Later Firebase Data Shape

```ts
type AppUser = {
  uid: string;
  displayName: string;
  characterId: 'treetive-01' | 'treetive-02' | 'treetive-03' | 'treetive-04';
  email?: string;
  photoURL?: string;
  provider: 'guest' | 'google';
};
```

Firestore can later use this path:

```txt
users/{uid}
```

Suggested fields:

- `displayName`
- `email`
- `photoURL`
- `characterId`
- `provider`
- `createdAt`
- `lastLoginAt`
- `lastScene`
- `lastPosition`
