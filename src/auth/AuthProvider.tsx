import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { clearGuestUser, loadGuestUser, persistGuestUser, saveGuestUser } from './guestStorage';
import type { AppUser } from './types';
import type { PlayerCharacterId } from '../game/constants/playerCharacters';

type AuthContextValue = {
  user: AppUser | null;
  loginAsGuest: (displayName: string, characterId: PlayerCharacterId) => void;
  updateGuestProfile: (profile: { displayName: string; characterId: PlayerCharacterId }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(() => loadGuestUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loginAsGuest: (displayName: string, characterId: PlayerCharacterId) => {
        setUser(saveGuestUser(displayName.trim(), characterId));
      },
      updateGuestProfile: ({ displayName, characterId }) => {
        setUser((currentUser) => {
          if (!currentUser) {
            return null;
          }

          const nextUser: AppUser = {
            ...currentUser,
            displayName: displayName.trim(),
            characterId,
          };
          persistGuestUser(nextUser);

          return nextUser;
        });
      },
      logout: () => {
        clearGuestUser();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
