import { ASSET_KEYS } from './assetKeys';
import type { PortalType } from '../objects/Portal';

export const VIEWPORT_WIDTH = 1280;
export const VIEWPORT_HEIGHT = 720;
export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 720;
export const GROUND_Y = 648;
export const PLATFORM_Y = 470;

export const BACKGROUND = {
  x: -240,
  y: 0,
  scale: 1,
  factor: 0.36,
  depth: 1,
} as const;

export const SURFACES = {
  ground: { x: 959, y: 678, width: MAP_WIDTH, height: 30 },
  platforms: [
    {
      sprite: { key: ASSET_KEYS.platformLarge, x: 674, y: 471, scale: 0.32 },
      surface: { x: 681, y: 437, width: 458, height: 22 },
    },
    {
      sprite: { key: ASSET_KEYS.platformLarge, x: 1592, y: 472, scale: 0.32 },
      surface: { x: 1592, y: 437, width: 446, height: 22 },
    },
    {
      sprite: { key: ASSET_KEYS.platformSmall, x: 1128, y: 391, scale: 0.28 },
      surface: { x: 1129, y: 369, width: 332, height: 22 },
    },
  ],
  benches: [
    {
      sprite: { x: 646, y: 646, scale: 0.24, flipX: true },
      surface: { x: 643, y: 641, width: 140, height: 18 },
    },
    {
      sprite: { x: 1600, y: 649, scale: 0.24, flipX: false },
      surface: { x: 1601, y: 640, width: 138, height: 18 },
    },
  ],
} as const;

export const OBJECTS = {
  lamps: [
    { x: 425, y: 648, scale: 0.24 },
    { x: 1830, y: 647, scale: 0.24 },
  ],
  fences: [
    { id: 'added.editor-lobby-fence.1', x: 38, y: 772, scale: 0.3, depth: 20 },
    { id: 'added.editor-lobby-fence.2', x: 498, y: 772, scale: 0.3, depth: 20 },
    { id: 'added.editor-lobby-fence.2.copy.1', x: 955, y: 772, scale: 0.3, depth: 20 },
    { id: 'added.editor-lobby-fence.2.copy.1.copy.1', x: 1416, y: 772, scale: 0.3, depth: 20 },
    { id: 'added.editor-lobby-fence.2.copy.1.copy.1.copy.1', x: 1877, y: 772, scale: 0.3, depth: 20 },
  ],
  editorDecor: [
    {
      id: 'added.editor-npc-coco.1',
      textureKey: 'editor-npc-coco',
      x: 526,
      y: 645,
      scale: 0.294,
      flipX: true,
      depth: 20,
    },
    {
      id: 'added.editor-npc-lion.1',
      textureKey: 'editor-npc-lion',
      x: 494,
      y: 417,
      scale: 0.261,
      flipX: true,
      depth: 20,
    },
    {
      id: 'added.editor-npc-tigo.1',
      textureKey: 'editor-npc-tigo',
      x: 1490,
      y: 651,
      scale: 0.124,
      flipX: false,
      depth: 20,
    },
  ],
} as const;

export const PORTALS: Array<{ type: PortalType; label: string; x: number; y: number; scale?: number }> = [
  { type: 'office', label: 'Office', x: 671, y: 425, scale: 0.29 },
  { type: 'cafe', label: 'Cafe', x: 1594, y: 427, scale: 0.29 },
];

export const NPCS = [
  {
    name: '포코타',
    x: 1078,
    y: 351,
    scale: 0.336,
    flipX: true,
  },
] as const;
