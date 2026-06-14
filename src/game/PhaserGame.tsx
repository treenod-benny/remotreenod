import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { LobbyScene } from './scenes/LobbyScene';
import { OfficeScene } from './scenes/OfficeScene';
import { TeamSpaceScene } from './scenes/TeamSpaceScene';
import { CafeScene } from './scenes/CafeScene';

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const DEBUG_PHYSICS = import.meta.env.VITE_DEBUG_PHYSICS === 'true';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!containerRef.current || gameRef.current) {
      return;
    }

    const createGame = async () => {
      await document.fonts.load('400 16px NanumSquareRound');
      await document.fonts.load('700 16px NanumSquareRound');

      if (!isMounted || !containerRef.current || gameRef.current) {
        return;
      }

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        backgroundColor: '#88d6f7',
        pixelArt: false,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 1450 },
            debug: DEBUG_PHYSICS,
          },
        },
        scene: [LobbyScene, OfficeScene, TeamSpaceScene, CafeScene],
      });
    };

    void createGame();

    return () => {
      isMounted = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="phaser-host" />;
}
