import { ASSET_KEYS } from './assetKeys';
import type { PortalType } from '../objects/Portal';

export const VIEWPORT_WIDTH = 1280;
export const VIEWPORT_HEIGHT = 720;
export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 720;
export const GROUND_Y = 648;
export const PLATFORM_Y = 470;

export const BACKGROUND = {
  skyline: {
    x: VIEWPORT_WIDTH + 360,
    y: 495,
    scale: 0.44,
    alpha: 0.82,
    factor: 0.18,
    depth: 4.5,
  },
  parallaxLayers: [
    {
      key: ASSET_KEYS.bgBridge,
      y: 96,
      factor: 0.36,
      depth: 5,
      alpha: 1,
      tileScale: 0.64,
      tilePositionY: 250,
    },
    {
      key: ASSET_KEYS.bgOcean,
      y: 270,
      factor: 0.5,
      depth: 4,
      alpha: 1,
      tileScale: 0.72,
      tilePositionY: 340,
    },
  ],
  clouds: [
    { key: ASSET_KEYS.cloudSmall01, x: 90, y: 84, scale: 0.34, factor: 0.08, alpha: 0.78 },
    { key: ASSET_KEYS.cloudLarge01, x: 330, y: 92, scale: 0.44, factor: 0.1, alpha: 0.82 },
    { key: ASSET_KEYS.cloudMedium01, x: 820, y: 130, scale: 0.4, factor: 0.12, alpha: 0.74 },
    { key: ASSET_KEYS.cloudLarge02, x: 1260, y: 82, scale: 0.42, factor: 0.09, alpha: 0.8 },
    { key: ASSET_KEYS.cloudSmall02, x: 1760, y: 156, scale: 0.34, factor: 0.13, alpha: 0.72 },
  ],
} as const;

export const SURFACES = {
  ground: { x: MAP_WIDTH / 2, y: GROUND_Y + 15, width: MAP_WIDTH, height: 30 },
  platforms: [
    {
      sprite: { key: ASSET_KEYS.platformLarge, x: 674, y: 471, scale: 0.32 },
      surface: { x: 673, y: 428, width: 416, height: 22 },
    },
    {
      sprite: { key: ASSET_KEYS.platformLarge, x: 1592, y: 472, scale: 0.32 },
      surface: { x: 1590, y: 426, width: 416, height: 22 },
    },
    {
      sprite: { key: ASSET_KEYS.platformSmall, x: 1128, y: 392, scale: 0.28 },
      surface: { x: 1128, y: 356, width: 290, height: 22 },
    },
  ],
  benches: [
    {
      sprite: { x: 646, y: 646, scale: 0.24, flipX: true },
      surface: { x: 654, y: 624, width: 130, height: 18 },
    },
    {
      sprite: { x: 1600, y: 649, scale: 0.24, flipX: false },
      surface: { x: 1593, y: 626, width: 130, height: 18 },
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
    { id: 'added.editor-lobby-fence.2.copy.1.copy.1.copy.1', x: 1876, y: 772, scale: 0.3, depth: 20 },
  ],
  editorDecor: [
    {
      id: 'added.editor-lobby-npc-coco.1',
      textureKey: 'editor-lobby-npc-coco',
      x: 773,
      y: 649,
      scale: 0.3,
      flipX: false,
      depth: 20,
    },
  ],
} as const;

export const PORTALS: Array<{ type: PortalType; label: string; x: number; y: number; scale?: number }> = [
  { type: 'office', label: 'Office', x: 536, y: 428, scale: 0.28 },
  { type: 'cafe', label: 'Cafe', x: 1717, y: 427, scale: 0.28 },
];

export const NPCS = [
  {
    name: '포코타',
    x: 1128,
    y: 342,
    scale: 0.33,
  },
] as const;
