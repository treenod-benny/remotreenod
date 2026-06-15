import { ASSET_KEYS } from './assetKeys';

export const OFFICE_VIEWPORT_WIDTH = 1280;
export const OFFICE_VIEWPORT_HEIGHT = 720;
export const OFFICE_MAP_WIDTH = 2688;
export const OFFICE_MAP_HEIGHT = 720;
export const OFFICE_GROUND_Y = 648;

export const OFFICE_BACKGROUND = {
  window: {
    y: 0,
    tileScale: 0.78,
    tilePositionY: 80,
  },
  floor: {
    y: OFFICE_GROUND_Y - 8,
    height: 190,
    tileScale: 0.62,
    tilePositionY: 20,
  },
} as const;

export const OFFICE_SURFACES = {
  ground: { x: 1343, y: 670, width: OFFICE_MAP_WIDTH, height: 32 },
  platforms: [
    {
      sprite: { key: ASSET_KEYS.officePlatform, x: 637, y: 500, scale: 0.56 },
      surface: { x: 640, y: 492, width: 420, height: 24 },
    },
    {
      sprite: { key: ASSET_KEYS.officePlatform, x: 1403, y: 313, scale: 0.59 },
      surface: { x: 1399, y: 275, width: 440, height: 24 },
    },
    {
      sprite: { key: ASSET_KEYS.officePlatform, x: 2106, y: 415, scale: 0.66 },
      surface: { x: 2106, y: 366, width: 506, height: 24 },
    },
  ],
  stairs: [
    { id: 0, key: ASSET_KEYS.officeStair01, x: 866, y: 427, scale: 0.58, surface: { x: 865, y: 420, width: 72, height: 16 } },
    { id: 1, key: ASSET_KEYS.officeStair02, x: 921, y: 401, scale: 0.59, surface: { x: 919, y: 392, width: 88, height: 16 } },
    { id: 2, key: ASSET_KEYS.officeStair03, x: 981, y: 377, scale: 0.55, surface: { x: 977, y: 368, width: 82, height: 16 } },
    { id: 3, key: ASSET_KEYS.officeStair04, x: 1040, y: 349, scale: 0.58, surface: { x: 1041, y: 337, width: 84, height: 16 } },
    { id: 5, key: ASSET_KEYS.officeStair02, x: 1135, y: 312, scale: 0.63, surface: { x: 1133, y: 297, width: 98, height: 16 } },
    { id: 11, key: ASSET_KEYS.officeStair05, x: 1750, y: 338, scale: 0.5, surface: { x: 1750, y: 322, width: 220, height: 16 } },
  ],
  benches: [
    { x: 771, y: 640, width: 130, height: 18 },
    { x: 1916, y: 654, width: 130, height: 18 },
  ],
} as const;

export const OFFICE_DECOR = {
  plants: [
    { key: ASSET_KEYS.officePlant03, x: 54, y: 659, scale: 0.5, depth: 20 },
    { key: ASSET_KEYS.officePlant01, x: 1248, y: 649, scale: 0.36, depth: 20 },
    { key: ASSET_KEYS.officePlant02, x: 498, y: 452, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant01, x: 1392, y: 651, scale: 0.38, depth: 20 },
    { key: ASSET_KEYS.officePlant02, x: 1375, y: 264, scale: 0.28, depth: 20 },
    { key: ASSET_KEYS.officePlant03, x: 2334, y: 646, scale: 0.42, depth: 20 },
  ],
  furniture: [
    { id: 0, key: ASSET_KEYS.officeBookshelf, x: 2260, y: 360, scale: 0.48, depth: 19 },
    { id: 2, key: ASSET_KEYS.officeBookshelf, x: 924, y: 651, scale: 0.35, depth: 18 },
    { id: 3, key: ASSET_KEYS.officeBench, x: 774, y: 653, scale: 0.24, depth: 20 },
    { id: 4, key: ASSET_KEYS.officeBench, x: 1924, y: 651, scale: 0.24, depth: 20 },
  ],
  hangingLanterns: [
    { x: 76, y: 11, scale: 0.5, depth: 24 },
    { x: 2327, y: 16, scale: 0.34, depth: 24 },
  ],
  editorDecor: [
    {
      id: 'added.editor-npc-ovis.1',
      textureKey: 'editor-npc-ovis',
      x: 1050,
      y: 648,
      scale: 0.336,
      flipX: false,
      depth: 20,
    },
    {
      id: 'added.editor-npc-pokota.1',
      textureKey: 'editor-npc-pokota',
      x: 1346,
      y: 650,
      scale: 0.289,
      flipX: true,
      depth: 20,
    },
  ],
} as const;

export type OfficePortalKind =
  | 'lobby'
  | 'chooseCommute'
  | 'aiCollaboration'
  | 'pokomergeShop'
  | 'addressables'
  | 'lobbyUx';

export const OFFICE_PORTALS: Array<{
  kind: OfficePortalKind;
  label: string;
  x: number;
  y: number;
  scale: number;
  log: string;
}> = [
  { kind: 'lobby', label: 'Lobby', x: 150, y: 658, scale: 0.24, log: 'Lobby portal entered' },
  { kind: 'lobbyUx', label: '로비 UX 개선', x: 2015, y: 366, scale: 0.24, log: 'Lobby UX workroom entered' },
  { kind: 'pokomergeShop', label: '포코머지 상점 기능', x: 596, y: 460, scale: 0.24, log: 'Pokomerge shop workroom entered' },
  { kind: 'aiCollaboration', label: 'AI 협업 공유', x: 1286, y: 271, scale: 0.24, log: 'AI collaboration workroom entered' },
  { kind: 'addressables', label: 'Addressables 최적화', x: 730, y: 460, scale: 0.24, log: 'Addressables workroom entered' },
  { kind: 'chooseCommute', label: '출근은선택', x: 2195, y: 366, scale: 0.24, log: 'Choose commute workroom entered' },
];
