import { useEffect, useState } from 'react';
import { GuestEntry } from './auth/GuestEntry';
import { useAuth } from './auth/AuthProvider';
import { PhaserGame } from './game/PhaserGame';
import { GameOverlay } from './ui/GameOverlay';

const LOADING_ASSETS = ['/assets/loading/bg_loading.png', '/assets/loading/logo.png'];

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function LoadingScreen() {
  return (
    <section className="loading-screen" aria-label="리모트리노드 로딩">
      <img className="loading-logo" src="/assets/loading/logo.png" alt="리모트리노드" />
    </section>
  );
}

export default function App() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const minimumDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 900));

    Promise.all([minimumDelay, ...LOADING_ASSETS.map((src) => preloadImage(src))]).then(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsGameReady(false);
  }, [user?.uid]);

  return (
    <main className="app-shell">
      {isLoading ? (
        <LoadingScreen />
      ) : user ? (
        <>
          <PhaserGame user={user} onReady={() => setIsGameReady(true)} />
          {isGameReady && <GameOverlay user={user} />}
          {!isGameReady && (
            <div className="game-loading-layer">
              <LoadingScreen />
            </div>
          )}
        </>
      ) : (
        <GuestEntry />
      )}
    </main>
  );
}
