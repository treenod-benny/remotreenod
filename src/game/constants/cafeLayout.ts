export const CAFE_VIEWPORT_WIDTH = 1280;
export const CAFE_VIEWPORT_HEIGHT = 720;
export const CAFE_MAP_WIDTH = 1932;
export const CAFE_MAP_HEIGHT = 720;
export const CAFE_GROUND_Y = 648;

export const CAFE_BACKGROUND = {
  x: 0,
  y: 0,
  scale: 0.974,
  depth: 2,
} as const;

export const CAFE_SURFACES = [
  { id: 'surface.ground', x: 968, y: 714, width: 1932, height: 32, solid: true },
  { id: 'surface.upperLeft', x: 275, y: 361, width: 536, height: 26, solid: false },
  { id: 'surface.upperRight', x: 1661, y: 362, width: 528, height: 26, solid: false },
  { id: 'surface.rightStairs', x: 1892, y: 665, width: 78, height: 18, solid: false },
  { id: 'surface.rightStairs.copy.1', x: 1887, y: 475, width: 78, height: 18, solid: false },
  { id: 'surface.rightStairs.copy.2', x: 1487, y: 659, width: 78, height: 18, solid: false },
  { id: 'surface.rightStairs.copy.2.copy.1', x: 1345, y: 661, width: 78, height: 18, solid: false },
  { id: 'surface.rightStairs.copy.2.copy.1.copy.1', x: 1221, y: 660, width: 78, height: 18, solid: false },
  { id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1', x: 1115, y: 658, width: 78, height: 18, solid: false },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1',
    x: 958,
    y: 661,
    width: 78,
    height: 18,
    solid: false,
  },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1.copy.1',
    x: 812,
    y: 660,
    width: 78,
    height: 18,
    solid: false,
  },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1',
    x: 615,
    y: 660,
    width: 78,
    height: 18,
    solid: false,
  },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1',
    x: 462,
    y: 661,
    width: 78,
    height: 18,
    solid: false,
  },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1',
    x: 278,
    y: 641,
    width: 50,
    height: 12,
    solid: false,
  },
  {
    id: 'surface.rightStairs.copy.2.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1.copy.1',
    x: 190,
    y: 641,
    width: 50,
    height: 12,
    solid: false,
  },
] as const;

export const CAFE_DECOR = [
  {
    id: 'added.editor-npc-midori.1',
    textureKey: 'editor-npc-midori',
    x: 288,
    y: 296,
    scale: 0.366,
    flipX: true,
    depth: 20,
  },
  {
    id: 'added.editor-npc-noi.1',
    textureKey: 'editor-npc-noi',
    x: 1040,
    y: 676,
    scale: 0.683,
    flipX: false,
    depth: 20,
  },
  {
    id: 'added.editor-npc-zeff.1',
    textureKey: 'editor-npc-zeff',
    x: 1660,
    y: 296,
    scale: 0.231,
    flipX: false,
    depth: 20,
  },
] as const;

export const CAFE_EXIT = {
  x: 92,
  y: 686,
  scale: 0.22,
  width: 120,
  height: 170,
  radius: 120,
} as const;
