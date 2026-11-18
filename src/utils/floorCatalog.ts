import { StorageItemDefinition } from './storageCatalog';

// Core Keeper placed floor and ground tiles. The images are local 16×16 game
// item sprites so a floor remains legible at one blueprint cell per tile.
const floorDefinitions: Array<[string, string, string, string]> = [
  ['wood-floor', 'Wood Floor', 'Suelo de madera', 'WoodFloor'],
  ['stone-floor', 'Stone Floor', 'Suelo de piedra', 'StoneFloor'],
  ['paintable-floor', 'Paintable Floor', 'Suelo pintable', 'PaintableFloor'],
  ['scarlet-floor', 'Scarlet Floor', 'Suelo escarlata', 'ScarletFloor'],
  ['lit-floor', 'Lit Floor', 'Suelo iluminado', 'PaintableLitFloor'],
  ['coral-floor', 'Coral Floor', 'Suelo de coral', 'CoralFloor'],
  ['galaxite-floor', 'Galaxite Floor', 'Suelo de galaxita', 'GalaxiteFloor'],
  ['glass-floor', 'Glass Floor', 'Suelo de vidrio', 'GlassFloor'],
  ['woven-straw-floor', 'Woven Straw Floor', 'Suelo de paja tejida', 'WovenStrawFloor'],
  ['gleam-wood-floor', 'Gleam Wood Floor', 'Suelo de madera resplandeciente', 'GleamWoodFloor'],
  ['grimy-stone-floor', 'Grimy Stone Floor', 'Suelo de piedra mugrienta', 'GrimyStoneFloor'],
  ['eerie-floor', 'Eerie Floor', 'Suelo siniestro', 'EerieFloor'],
  ['rug', 'Rug', 'Alfombra', 'Rug'],
  ['woven-mat', 'Woven Mat', 'Tapete tejido', 'WovenMat'],
  ['loose-flooring', 'Loose Flooring', 'Piso suelto', 'LooseFlooring'],
  ['rose-petal-flooring', 'Rose Petal Flooring', 'Piso de pétalos de rosa', 'ValentineFloorPetals'],
  ['daisy-flooring', 'Daisy Flooring', 'Piso de margaritas', 'EasterDaisyFloorspread'],
  ['caveling-floor-tile', 'Caveling Floor Tile', 'Baldosa caveling', 'CavelingFloorTile'],
  ['dark-caveling-floor-tile', 'Dark Caveling Floor Tile', 'Baldosa caveling oscura', 'CavelingFloorTileDark'],
  ['core-relief-tile', 'Core Relief Tile', 'Baldosa de relieve del Núcleo', 'RuinsCoreRelief'],
  ['gemstone-stone-tile', 'Gemstone Stone Tile', 'Baldosa de piedra con gema', 'BigFloorTileGemstone'],
  ['cavelings-stone-tile', 'Cavelings Stone Tile', 'Baldosa de piedra caveling', 'BigFloorTileCaveling'],
  ['scholar-stone-tile', 'Scholar Stone Tile', 'Baldosa de piedra de erudito', 'BigFloorTileScholar'],
  ['temple-decor-rug', 'Temple Decor Rug', 'Alfombra decorativa del templo', 'SmallTempleRug'],
  ['large-temple-decor-rug', 'Large Temple Decor Rug', 'Alfombra grande del templo', 'LargeTempleRug'],
  ['heart-shaped-rug', 'Heart-shaped Rug', 'Alfombra de corazón', 'ValentineRug'],
  ['larvaskin-rug', 'Larvaskin Rug', 'Alfombra de piel de larva', 'LarvaskinRug'],
  ['hive-larvaskin-rug', 'Hive Larvaskin Rug', 'Alfombra de piel de larva de colmena', 'LarvaskinRugRed'],
];

const RUG_OBJECT_IDS = new Set(['rug', 'woven-mat', 'heart-shaped-rug', 'temple-decor-rug', 'large-temple-decor-rug', 'larvaskin-rug', 'hive-larvaskin-rug']);

export const FLOOR_ITEMS: StorageItemDefinition[] = floorDefinitions.map(([id, nameEn, nameEs, sprite]) => ({
  id,
  nameEn,
  nameEs,
  category: RUG_OBJECT_IDS.has(id) ? 'other' : 'floor',
  layer: RUG_OBJECT_IDS.has(id) ? 'object' : 'floor',
  width: 1,
  height: 1,
  imageUrl: `/floor-sprites/${sprite}.png`,
  placementImageUrl: `/floor-sprites/${sprite}.png`,
  renderAtNativeScale: true,
}));

// Terrain blocks whose ground face can be placed as a floor. Their wall faces
// remain represented by the existing color palette.
const groundDefinitions: Array<[string, string, string, string]> = [
  ['sand', 'Sand Ground', 'Suelo de arena', 'GroundSandBlock'],
  ['snow', 'Snow Ground', 'Suelo nevado', 'GroundSnowBlock'],
  ['dirt', 'Dirt Ground', 'Suelo de tierra', 'GroundDirtBlock'],
  ['meadow', 'Meadow Ground', 'Suelo de pradera', 'GroundMeadowBlock'],
  ['turf', 'Turf Ground', 'Suelo de césped', 'GroundTurfBlock'],
  ['clay', 'Clay Ground', 'Suelo de arcilla', 'GroundClayBlock'],
  ['dark-stone', 'Dark Stone Ground', 'Suelo de piedra oscura', 'GroundDarkStoneBlock'],
  ['stone', 'Stone Ground', 'Suelo de piedra natural', 'GroundStoneBlock'],
  ['larva-hive', 'Larva Hive Ground', 'Suelo de colmena de larvas', 'GroundHiveBlock'],
  ['grass', 'Grass Ground', 'Suelo de hierba', 'GroundGrassBlock'],
  ['beach', 'Beach Sand Ground', 'Suelo de arena de playa', 'GroundBeachSandBlock'],
  ['mold', 'Mold Ground', 'Suelo de moho', 'GroundMoldBlock'],
  ['desert', 'Desert Sand Ground', 'Suelo de arena del desierto', 'GroundDesertSandBlock'],
  ['oasis', 'Oasis Ground', 'Suelo de oasis', 'GroundOasisblock'],
  ['metropolis', 'City Floor', 'Suelo de ciudad', 'GroundCityBlock'],
  ['alien-tech', 'Alien Tech Floor', 'Suelo de tecnología alienígena', 'GroundAlienBlock'],
  ['crystal', 'Crystal Ground', 'Suelo de cristal', 'GroundCrystalBlock'],
  ['desert-temple', 'Temple Floor', 'Suelo de templo', 'GroundDesertTempleBlock'],
  ['maze', 'Maze Floor', 'Suelo de laberinto', 'GroundDesertTempleBlock2'],
  ['lava-rock', 'Lava Rock Ground', 'Suelo de roca de lava', 'GroundLavaBlock'],
  ['fossil', 'Passage Ground', 'Suelo de pasaje', 'GroundPassageBlock'],
  ['obsidian', 'Obsidian Ground', 'Suelo de obsidiana', 'GroundObsidianBlock'],
  ['excavation', 'Excavation Ground', 'Suelo de excavación', 'GroundExcavationBlock'],
  ['excavation-border', 'Excavation Border Ground', 'Suelo de borde de excavación', 'GroundExcavationBorderBlock'],
  ['excavation-dungeon', 'Excavation Dungeon Ground', 'Suelo de mazmorra de excavación', 'GroundExcavationDungeonBlock'],
  ['excavation-rock', 'Excavation Rock Ground', 'Suelo de roca de excavación', 'GroundExcavationRockBlock'],
  ['excavation-void', 'Excavation Void Ground', 'Suelo de vacío de excavación', 'GroundExcavationVoidBlock'],
  ['moss', 'Moss Ground', 'Suelo de musgo', 'GroundMossBlock'],
  ['acid-slime', 'Acid Slime Ground', 'Suelo de limo ácido', 'GroundAcidSlime'],
  ['slime', 'Slime Ground', 'Suelo de limo', 'GroundSlime'],
  ['slippery-slime', 'Slippery Slime Ground', 'Suelo de limo resbaladizo', 'GroundSlipperySlime'],
  ['poison-slime', 'Poison Slime Ground', 'Suelo de limo venenoso', 'GroundPoisonSlime'],
  ['oil', 'Oil Ground', 'Suelo de petróleo', 'GroundOilSlime'],
  ['magma-slime', 'Magma Slime Ground', 'Suelo de limo de magma', 'GroundLavaSlime'],
];

export const GROUND_ITEMS: StorageItemDefinition[] = groundDefinitions.map(([blockId, nameEn, nameEs, sprite]) => ({
  id: `block-${blockId}-ground`,
  nameEn,
  nameEs,
  category: 'floor',
  layer: 'floor',
  width: 1,
  height: 1,
  imageUrl: `/floor-sprites/${sprite}.png`,
  placementImageUrl: `/floor-sprites/${sprite}.png`,
  renderAtNativeScale: true,
}));

export const ALL_FLOOR_ITEMS = [...FLOOR_ITEMS, ...GROUND_ITEMS];
export const FLOOR_ITEM_BY_ID = new Map(ALL_FLOOR_ITEMS.map(item => [item.id, item]));
