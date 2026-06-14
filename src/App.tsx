import { GuestEntry } from './auth/GuestEntry';
import { useAuth } from './auth/AuthProvider';
import { PhaserGame } from './game/PhaserGame';
import { GameOverlay } from './ui/GameOverlay';

export default function App() {
  const { user } = useAuth();

  return (
    <main className="app-shell">
      {user ? (
        <>
          <PhaserGame user={user} />
          <GameOverlay user={user} />
        </>
      ) : (
        <GuestEntry />
      )}
    </main>
  );
}
