import { GuestEntry } from './auth/GuestEntry';
import { useAuth } from './auth/AuthProvider';
import { PhaserGame } from './game/PhaserGame';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <main className="app-shell">
      {user ? (
        <>
          <div className="user-bar">
            <span>{user.displayName}</span>
            <button type="button" onClick={logout}>
              로그아웃
            </button>
          </div>
          <PhaserGame user={user} />
        </>
      ) : (
        <GuestEntry />
      )}
    </main>
  );
}
