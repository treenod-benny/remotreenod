import { ASSET_KEYS } from './assetKeys';

export const TEAM_SPACE_VIEWPORT_WIDTH = 1280;
export const TEAM_SPACE_VIEWPORT_HEIGHT = 720;
export const TEAM_SPACE_MAP_WIDTH = 1280;
export const TEAM_SPACE_MAP_HEIGHT = 720;
export const TEAM_SPACE_GROUND_Y = 650;

export const TEAM_SPACE_BACKGROUND = {
  room: { x: 0, y: -82, scale: 0.833 },
  floor: {
    y: TEAM_SPACE_GROUND_Y - 8,
    height: 190,
    tileScale: 0.62,
    tilePositionY: 20,
  },
} as const;

export const TEAM_SPACE_SURFACES = {
  ground: { x: 635, y: 676, width: TEAM_SPACE_MAP_WIDTH, height: 32 },
  middleFloors: [],
  platforms: [
    { x: 467, y: 308, width: 280, height: 18 },
    { x: 1153, y: 291, width: 315, height: 18 },
    { x: 179, y: 428, width: 415, height: 20 },
    { x: 734, y: 433, width: 300, height: 18 },
    { x: 851, y: 243, width: 292, height: 18 },
  ],
  desks: [
    { x: 220, y: 606, width: 186, height: 16 },
    { x: 148, y: 380, width: 150, height: 14 },
    { x: 521, y: 610, width: 190, height: 16 },
    { x: 470, y: 257, width: 150, height: 14 },
    { x: 849, y: 196, width: 150, height: 14 },
  ],
} as const;

export const TEAM_SPACE_DECOR = {
  desks: [
    { key: ASSET_KEYS.teamPropDesks, x: 220, y: 655, scale: 0.44, depth: 20 },
    { key: ASSET_KEYS.teamPropDesks, x: 147, y: 420, scale: 0.34, depth: 20 },
    { key: ASSET_KEYS.teamPropDesks, x: 520, y: 659, scale: 0.44, depth: 20 },
    { key: ASSET_KEYS.teamPropDesks, x: 468, y: 296, scale: 0.34, depth: 20 },
    { key: ASSET_KEYS.teamPropDesks, x: 850, y: 235, scale: 0.34, depth: 20 },
  ],
  furniture: [
    { key: ASSET_KEYS.officeBookshelf, x: 717, y: 657, scale: 0.38, depth: 18 },
    { key: ASSET_KEYS.officeBookshelf02, x: 1066, y: 284, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officeSofa, x: 1207, y: 283, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlatform, x: 467, y: 328, scale: 0.37, depth: 20 },
    { key: ASSET_KEYS.officePlatform, x: 1152, y: 311, scale: 0.41, depth: 20 },
    { key: ASSET_KEYS.officePlatform, x: 179, y: 467, scale: 0.54, depth: 20 },
    { key: ASSET_KEYS.officePlatform, x: 733, y: 454, scale: 0.39, depth: 20 },
    { key: ASSET_KEYS.officePlatform, x: 854, y: 269, scale: 0.38, depth: 20 },
    { key: ASSET_KEYS.officeChair, x: 146, y: 417, scale: 0.16, depth: 20 },
    { key: ASSET_KEYS.officeChair, x: 523, y: 660, scale: 0.2, depth: 20 },
    { key: ASSET_KEYS.officeChair, x: 213, y: 658, scale: 0.19, depth: 20 },
    { key: ASSET_KEYS.officeChair, x: 469, y: 294, scale: 0.16, depth: 20 },
    { key: ASSET_KEYS.officeChair, x: 853, y: 236, scale: 0.16, depth: 20 },
  ],
  plants: [
    { key: ASSET_KEYS.officePlant03, x: 56, y: 654, scale: 0.42, depth: 19 },
    { key: ASSET_KEYS.officePlant02, x: 36, y: 418, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant02, x: 821, y: 655, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant01, x: 369, y: 653, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant04, x: 563, y: 306, scale: 0.27, depth: 20 },
    { key: ASSET_KEYS.officePlant05, x: 800, y: 429, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant07, x: 952, y: 242, scale: 0.3, depth: 20 },
    { key: ASSET_KEYS.officePlant10, x: 260, y: 419, scale: 0.3, depth: 20 },
  ],
  hangingLanterns: [
    { x: 89, y: 23, scale: 0.37, depth: 24 },
    { x: 619, y: 21, scale: 0.34, depth: 24 },
    { x: 1263, y: 21, scale: 0.35, depth: 24 },
  ],
} as const;

export const TEAM_SPACE_EXIT_PORTAL = {
  label: 'Office',
  x: 1210,
  y: 660,
  scale: 0.24,
  radius: 120,
} as const;
