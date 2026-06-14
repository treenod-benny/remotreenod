import Phaser from 'phaser';
import { ASSET_KEYS } from './assetKeys';
import { EDITOR_IMAGE_ASSETS } from './editorAssets';
import { PLAYER_CHARACTERS } from './playerCharacters';

const LOBBY_ASSET_BASE = '/assets/lobby';
const OFFICE_ASSET_BASE = '/assets/office';
const CAFE_ASSET_BASE = '/assets/cafe';

export const IMAGE_ASSETS = [
  { key: ASSET_KEYS.skyGradient, path: `${LOBBY_ASSET_BASE}/sky_gradient.png` },
  { key: ASSET_KEYS.skyLightRays, path: `${LOBBY_ASSET_BASE}/sky_light_rays.png` },
  { key: ASSET_KEYS.cloudLarge01, path: `${LOBBY_ASSET_BASE}/cloud_large_01.png` },
  { key: ASSET_KEYS.cloudLarge02, path: `${LOBBY_ASSET_BASE}/cloud_large_02.png` },
  { key: ASSET_KEYS.cloudMedium01, path: `${LOBBY_ASSET_BASE}/cloud_medium_01.png` },
  { key: ASSET_KEYS.cloudSmall01, path: `${LOBBY_ASSET_BASE}/cloud_small_01.png` },
  { key: ASSET_KEYS.cloudSmall02, path: `${LOBBY_ASSET_BASE}/cloud_small_02.png` },
  { key: ASSET_KEYS.bgCity, path: `${LOBBY_ASSET_BASE}/bg_city.png` },
  { key: ASSET_KEYS.bgBridge, path: `${LOBBY_ASSET_BASE}/bg_bridge.png` },
  { key: ASSET_KEYS.bgOcean, path: `${LOBBY_ASSET_BASE}/bg_ocean.png` },
  { key: ASSET_KEYS.ground, path: `${LOBBY_ASSET_BASE}/ground.png` },
  { key: ASSET_KEYS.platformLarge, path: `${LOBBY_ASSET_BASE}/platform_grass_large.png` },
  { key: ASSET_KEYS.platformSmall, path: `${LOBBY_ASSET_BASE}/platform_grass_small.png` },
  { key: ASSET_KEYS.portalBlue, path: `${LOBBY_ASSET_BASE}/portal_blue.png` },
  { key: ASSET_KEYS.npcPokota, path: `${LOBBY_ASSET_BASE}/npc_pokota.png` },
  { key: ASSET_KEYS.bench, path: `${LOBBY_ASSET_BASE}/obj_bench.png` },
  { key: ASSET_KEYS.lamp, path: `${LOBBY_ASSET_BASE}/obj_lamp.png` },
  ...PLAYER_CHARACTERS.map((character) => ({ key: character.assetKey, path: character.imagePath })),
  { key: ASSET_KEYS.officeSkyGradient, path: `${OFFICE_ASSET_BASE}/sky_gradient.png` },
  { key: ASSET_KEYS.officeWindow, path: `${OFFICE_ASSET_BASE}/bg_window.png` },
  { key: ASSET_KEYS.officeFloor, path: `${OFFICE_ASSET_BASE}/office_floor.png` },
  { key: ASSET_KEYS.officePlatform, path: `${OFFICE_ASSET_BASE}/platform.png` },
  { key: ASSET_KEYS.officeStair01, path: `${OFFICE_ASSET_BASE}/stair_01.png` },
  { key: ASSET_KEYS.officeStair02, path: `${OFFICE_ASSET_BASE}/stair_02.png` },
  { key: ASSET_KEYS.officeStair03, path: `${OFFICE_ASSET_BASE}/stair_03.png` },
  { key: ASSET_KEYS.officeStair04, path: `${OFFICE_ASSET_BASE}/stair_04.png` },
  { key: ASSET_KEYS.officeStair05, path: `${OFFICE_ASSET_BASE}/stair_05.png` },
  { key: ASSET_KEYS.officePortalBlue, path: `${OFFICE_ASSET_BASE}/portal_blue.png` },
  { key: ASSET_KEYS.officeBench, path: `${OFFICE_ASSET_BASE}/bench.png` },
  { key: ASSET_KEYS.officeChair, path: `${OFFICE_ASSET_BASE}/chair.png` },
  { key: ASSET_KEYS.officeBookshelf, path: `${OFFICE_ASSET_BASE}/bookshelf.png` },
  { key: ASSET_KEYS.officeBookshelf02, path: `${OFFICE_ASSET_BASE}/bookshelf_02.png` },
  { key: ASSET_KEYS.officeSofa, path: `${OFFICE_ASSET_BASE}/sofa.png` },
  { key: ASSET_KEYS.officeHangingLantern, path: `${OFFICE_ASSET_BASE}/hanging_lantern.png` },
  { key: ASSET_KEYS.officePlant01, path: `${OFFICE_ASSET_BASE}/plant_01.png` },
  { key: ASSET_KEYS.officePlant02, path: `${OFFICE_ASSET_BASE}/plant_02.png` },
  { key: ASSET_KEYS.officePlant03, path: `${OFFICE_ASSET_BASE}/plant_03.png` },
  { key: ASSET_KEYS.officePlant04, path: `${OFFICE_ASSET_BASE}/plant_04.png` },
  { key: ASSET_KEYS.officePlant05, path: `${OFFICE_ASSET_BASE}/plant_05.png` },
  { key: ASSET_KEYS.officePlant06, path: `${OFFICE_ASSET_BASE}/plant_06.png` },
  { key: ASSET_KEYS.officePlant07, path: `${OFFICE_ASSET_BASE}/plant_07.png` },
  { key: ASSET_KEYS.officePlant08, path: `${OFFICE_ASSET_BASE}/plant_08.png` },
  { key: ASSET_KEYS.officePlant09, path: `${OFFICE_ASSET_BASE}/plant_09.png` },
  { key: ASSET_KEYS.officePlant10, path: `${OFFICE_ASSET_BASE}/plant_10.png` },
  { key: ASSET_KEYS.teamWorkroomBackground, path: `${OFFICE_ASSET_BASE}/workroom_background.png` },
  { key: ASSET_KEYS.teamWorkroomStructure, path: `${OFFICE_ASSET_BASE}/workroom_structure.png` },
  { key: ASSET_KEYS.teamWorkSpot, path: `${OFFICE_ASSET_BASE}/work_spot_02.png` },
  { key: ASSET_KEYS.teamPropDesks, path: `${OFFICE_ASSET_BASE}/prop_desks.png` },
  { key: ASSET_KEYS.cafeBackground, path: `${CAFE_ASSET_BASE}/cafe_background.png` },
] as const;

const ALL_IMAGE_ASSETS = [...IMAGE_ASSETS, ...EDITOR_IMAGE_ASSETS] as const;

export function loadImageAssets(scene: Phaser.Scene) {
  ALL_IMAGE_ASSETS.forEach(({ key, path }) => {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  });
}
