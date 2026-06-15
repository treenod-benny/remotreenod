import type { PlayerCharacterId } from './playerCharacters';

export type PresenceStatus = 'working' | 'ai-working' | 'meeting' | 'focus' | 'afk';

export type PresenceBehavior = 'idle' | 'walk' | 'look-around' | 'sleep';

export type PresenceLocation = 'lobby' | 'office' | 'workroom';

export type PresenceEntity = {
  id: string;
  displayName: string;
  entityType: 'player' | 'fake-user' | 'remote-user';
  currentTask?: string;
  status: PresenceStatus;
  x: number;
  y: number;
  location: PresenceLocation;
  behavior: PresenceBehavior;
  characterId: PlayerCharacterId;
};

export const PRESENCE_STATUS_LABELS: Record<PresenceStatus, string> = {
  working: '작업중',
  'ai-working': 'AI 작업중',
  meeting: '회의중',
  focus: '집중중',
  afk: '자리비움',
};

export const FAKE_PRESENCE_ENTITIES: PresenceEntity[] = [
  {
    id: 'fake-benny',
    displayName: 'Benny',
    entityType: 'fake-user',
    currentTask: '포코머지 상점 기능',
    status: 'focus',
    x: 840,
    y: 650,
    location: 'office',
    behavior: 'idle',
    characterId: 'treetive-01',
  },
  {
    id: 'fake-mina',
    displayName: 'Mina',
    entityType: 'fake-user',
    currentTask: 'AI 협업 공유',
    status: 'ai-working',
    x: 1288,
    y: 275,
    location: 'office',
    behavior: 'look-around',
    characterId: 'treetive-02',
  },
  {
    id: 'fake-jun',
    displayName: 'Jun',
    entityType: 'fake-user',
    currentTask: 'Addressables 최적화',
    status: 'working',
    x: 1960,
    y: 650,
    location: 'office',
    behavior: 'walk',
    characterId: 'treetive-03',
  },
  {
    id: 'fake-arin',
    displayName: 'Arin',
    entityType: 'fake-user',
    currentTask: '로비 UX 개선',
    status: 'meeting',
    x: 760,
    y: 649,
    location: 'lobby',
    behavior: 'idle',
    characterId: 'treetive-04',
  },
  {
    id: 'fake-sora',
    displayName: 'Sora',
    entityType: 'fake-user',
    currentTask: 'AI Workspace 설계',
    status: 'afk',
    x: 210,
    y: 655,
    location: 'workroom',
    behavior: 'sleep',
    characterId: 'treetive-02',
  },
  {
    id: 'fake-tae',
    displayName: 'Tae',
    entityType: 'fake-user',
    currentTask: '출근은선택',
    status: 'working',
    x: 520,
    y: 655,
    location: 'workroom',
    behavior: 'idle',
    characterId: 'treetive-03',
  },
];
