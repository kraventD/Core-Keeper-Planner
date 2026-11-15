export type StorageCategory = 'chest' | 'table' | 'pedestal' | 'pet' | 'bed' | 'chair' | 'terrarium' | 'aquarium' | 'other' | 'station' | 'mechanism' | 'rail' | 'door' | 'gate' | 'wall' | 'floor' | 'bridge' | 'fence' | 'light';

export interface StorageItemDefinition {
  id: string;
  nameEn: string;
  nameEs: string;
  category: StorageCategory;
  width: number;
  height: number;
  imageUrl: string;
  spriteId?: string;
  color?: string;
  estimatedColor?: boolean;
  layer?: 'bridge' | 'floor' | 'rail' | 'fence' | 'wall' | 'object' | 'light';
  defaultLightRadius?: number;
  estimatedSize?: boolean;
}

type ItemSeed = [id: string, en: string, es: string, category: StorageCategory, width: number, height: number, estimated?: boolean];

const seeds: ItemSeed[] = [
  // The Storage items page states that single-wide chests are 1×1 tiles.
  ['chest', 'Chest', 'Cofre', 'chest', 1, 1],
  ['valentines-chest', "Valentine's Chest", 'Cofre de San Valentín', 'chest', 1, 1],
  ['eerie-chest', 'Eerie Chest', 'Cofre siniestro', 'chest', 1, 1],
  ['gingerbread-house-chest', 'Gingerbread House Chest', 'Cofre de casa de jengibre', 'chest', 1, 1],
  ['larva-hive-chest', 'Larva Hive Chest', 'Cofre de colmena de larvas', 'chest', 1, 1],
  ['ancient-chest', 'Ancient Chest', 'Cofre antiguo', 'chest', 1, 1],
  ['mold-covered-chest', 'Mold Covered Chest', 'Cofre cubierto de moho', 'chest', 1, 1],
  ['seashell-chest', 'Seashell Chest', 'Cofre de concha marina', 'chest', 1, 1],
  ['golden-ancient-chest', 'Golden Ancient Chest', 'Cofre antiguo dorado', 'chest', 1, 1],
  ['smoldering-chest', 'Smoldering Chest', 'Cofre humeante', 'chest', 1, 1],
  ['alien-tech-chest', 'Alien Tech Chest', 'Cofre de tecnología alienígena', 'chest', 1, 1],
  ['cultist-chest', 'Cultist Chest', 'Cofre de cultista', 'chest', 1, 1],
  ['copper-chest', 'Copper Chest', 'Cofre de cobre', 'chest', 1, 1],
  ['iron-chest', 'Iron Chest', 'Cofre de hierro', 'chest', 1, 1],
  ['scarlet-chest', 'Scarlet Chest', 'Cofre escarlata', 'chest', 1, 1],
  ['octarine-chest', 'Octarine Chest', 'Cofre de octarina', 'chest', 1, 1],
  ['galaxite-chest', 'Galaxite Chest', 'Cofre de galaxita', 'chest', 1, 1],
  ['solarite-chest', 'Solarite Chest', 'Cofre de solarita', 'chest', 1, 1],
  ['desert-queen-chest', 'Desert Queen Chest', 'Cofre de la Reina del Desierto', 'chest', 1, 1],
  ['desert-king-chest', 'Desert King Chest', 'Cofre del Rey del Desierto', 'chest', 1, 1],
  ['desert-prince-chest', 'Desert Prince Chest', 'Cofre del Príncipe del Desierto', 'chest', 1, 1],
  ['locked-copper-chest', 'Locked Copper Chest', 'Cofre de cobre cerrado', 'chest', 1, 1],
  ['locked-iron-chest', 'Locked Iron Chest', 'Cofre de hierro cerrado', 'chest', 1, 1],
  ['locked-scarlet-chest', 'Locked Scarlet Chest', 'Cofre escarlata cerrado', 'chest', 1, 1],
  ['locked-octarine-chest', 'Locked Octarine Chest', 'Cofre de octarina cerrado', 'chest', 1, 1],
  ['locked-galaxite-chest', 'Locked Galaxite Chest', 'Cofre de galaxita cerrado', 'chest', 1, 1],
  ['locked-solarite-chest', 'Locked Solarite Chest', 'Cofre de solarita cerrado', 'chest', 1, 1],

  // The Storage items page states that double-wide chests occupy 2×1 tiles.
  ['glurch-chest', 'Glurch Chest', 'Cofre de Glurch', 'chest', 2, 1],
  ['ghorm-chest', 'Ghorm Chest', 'Cofre de Ghorm', 'chest', 2, 1],
  ['king-slimes-chest', "King Slime's Chest", 'Cofre del Rey Slime', 'chest', 2, 1],
  ['hive-mother-chest', 'Hive Mother Chest', 'Cofre de la Madre de la Colmena', 'chest', 2, 1],
  ['haunted-hive-mother-chest', 'Haunted Hive Mother Chest', 'Cofre de la Madre de la Colmena encantada', 'chest', 2, 1],
  ['malugaz-chest', 'Malugaz Chest', 'Cofre de Malugaz', 'chest', 2, 1],
  ['titans-chest', "Titan's Chest", 'Cofre del Titán', 'chest', 2, 1],
  ['golden-titans-chest', "Golden Titan's Chest", 'Cofre dorado del Titán', 'chest', 2, 1],
  ['ivys-chest', "Ivy's Chest", 'Cofre de Ivy', 'chest', 2, 1],
  ['floating-titans-chest', "Floating Titan's Chest", 'Cofre del Titán flotante', 'chest', 2, 1],
  ['morpha-chest', "Morpha's Chest", 'Cofre de Morpha', 'chest', 2, 1],
  ['igneous-chest', "Igneous' Chest", 'Cofre de Igneous', 'chest', 2, 1],
  ['atlantean-worm-chest', 'Atlantean Worm Chest', 'Cofre del Gusano Atlanteano', 'chest', 2, 1],
  ['druidra-chest', 'Druidra Chest', 'Cofre de Druidra', 'chest', 2, 1],
  ['crydra-chest', 'Crydra Chest', 'Cofre de Crydra', 'chest', 2, 1],
  ['pyrdra-chest', 'Pyrdra Chest', 'Cofre de Pyrdra', 'chest', 2, 1],
  ['core-tech-chest', 'Core Tech Chest', 'Cofre tecnológico del Núcleo', 'chest', 2, 1],
  ['urschleims-chest', "Urschleim's Chest", 'Cofre de Urschleim', 'chest', 2, 1],
  ['colossal-cicada-chest', 'Colossal Cicada Chest', 'Cofre de cigarra colosal', 'chest', 2, 1],

  // Footprints transcribed from each item's Placeable field on the wiki.
  ['wood-table', 'Wood Table', 'Mesa de madera', 'table', 2, 2],
  ['caveling-table', 'Caveling Table', 'Mesa caveling', 'table', 2, 2],
  ['driftwood-table', 'Driftwood Table', 'Mesa de madera flotante', 'table', 2, 2],
  ['big-gold-edged-table', 'Big Gold-edged Table', 'Mesa grande con bordes dorados', 'table', 4, 2],
  ['gold-edged-table', 'Gold-edged Table', 'Mesa con bordes dorados', 'table', 3, 2],
  ['grimy-table', 'Grimy Table', 'Mesa mugrienta', 'table', 2, 2],
  ['easter-meadow-table', 'Easter Meadow Table', 'Mesa de pradera de Pascua', 'table', 2, 2],
  ['eerie-table', 'Eerie Table', 'Mesa siniestra', 'table', 2, 2],
  ['festive-table', 'Festive Table', 'Mesa festiva', 'table', 4, 2],

  ['pedestal', 'Pedestal', 'Pedestal', 'pedestal', 1, 1],
  ['stone-pedestal', 'Stone Pedestal', 'Pedestal de piedra', 'pedestal', 1, 1],
  ['blue-glass-pedestal', 'Blue Glass Pedestal', 'Pedestal de vidrio azul', 'pedestal', 1, 1],
  ['temple-pedestal', 'Temple Pedestal', 'Pedestal del templo', 'pedestal', 1, 1],
  ['easter-pedestal', 'Easter Pedestal', 'Pedestal de Pascua', 'pedestal', 1, 1],

  ['pet-bed', 'Pet Bed', 'Cama para mascota', 'pet', 1, 1],
  ['perch-pole', 'Perch Pole', 'Percha', 'pet', 1, 1],
  ['naptree-nook', 'Naptree Nook', 'Rincón del árbol siesta', 'pet', 1, 1],
  ['woof-cabin', 'Woof Cabin', 'Cabaña guau', 'pet', 1, 1],

  ['terrarium', 'Terrarium', 'Terrario', 'terrarium', 2, 2],
  ['wilderness-terrarium', 'Wilderness Terrarium', 'Terrario de la naturaleza', 'terrarium', 2, 2],
  ['beach-terrarium', 'Beach Terrarium', 'Terrario de playa', 'terrarium', 2, 2],
  ['desert-terrarium', 'Desert Terrarium', 'Terrario del desierto', 'terrarium', 2, 2],
  ['crystal-terrarium', 'Crystal Terrarium', 'Terrario de cristal', 'terrarium', 2, 2],
  ['passage-terrarium', 'Passage Terrarium', 'Terrario del Pasaje', 'terrarium', 2, 2],
  ['aquarium', 'Aquarium', 'Acuario', 'aquarium', 2, 2],
  ['wilderness-aquarium', 'Wilderness Aquarium', 'Acuario de la naturaleza', 'aquarium', 2, 2],
  ['sunken-aquarium', 'Sunken Aquarium', 'Acuario hundido', 'aquarium', 2, 2],
  ['rocky-aquarium', 'Rocky Aquarium', 'Acuario rocoso', 'aquarium', 2, 2],
  ['crystal-aquarium', 'Crystal Aquarium', 'Acuario de cristal', 'aquarium', 2, 2],
  ['passage-aquarium', 'Passage Aquarium', 'Acuario del Pasaje', 'aquarium', 2, 2],

  ['amalgam-basin', 'Amalgam Basin', 'Cuenca de amalgama', 'other', 5, 4],
  ['deceased-explorer', 'Deceased Explorer', 'Explorador fallecido', 'other', 1, 1],
  ['decorative-pot', 'Decorative Pot', 'Maceta decorativa', 'other', 1, 1],
  ['feeding-tray', 'Feeding Tray', 'Comedero', 'other', 3, 1],
  ['fishing-net-rack', 'Fishing Net Rack', 'Soporte para redes de pesca', 'other', 3, 1],
  ['mannequin', 'Mannequin', 'Maniquí', 'other', 1, 1],
  ['planter-box', 'Planter Box', 'Jardinera', 'other', 3, 1],
];

export const STORAGE_ITEMS: StorageItemDefinition[] = seeds.map(([id, nameEn, nameEs, category, width, height, estimatedSize]) => ({
  id,
  nameEn,
  nameEs,
  category,
  width,
  height,
  estimatedSize,
  imageUrl: `/storage-items/${id}.png`,
}));

// Buildable wall segments and bridges. Wall pieces use flat colors in the planner.
export const STRUCTURE_ITEMS: StorageItemDefinition[] = [
  { id: 'wood-wall', nameEn: 'Wood Wall', nameEs: 'Pared de madera', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#946933' },
  { id: 'stone-bricks-wall', nameEn: 'Stone Bricks Wall', nameEs: 'Pared de ladrillos de piedra', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#6a6c72' },
  { id: 'scarlet-wall', nameEn: 'Scarlet Wall', nameEs: 'Pared escarlata', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#902613' },
  { id: 'coral-wall', nameEn: 'Coral Wall', nameEs: 'Pared de coral', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#ff7fcd' },
  { id: 'galaxite-wall', nameEn: 'Galaxite Wall', nameEs: 'Pared de galaxita', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#dddddd' },
  { id: 'gleam-wood-wall', nameEn: 'Gleam Wood Wall', nameEs: 'Pared de madera resplandeciente', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#0fa1ae' },
  { id: 'eerie-wall', nameEn: 'Eerie Wall', nameEs: 'Pared siniestra', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#705582', estimatedColor: true },
  { id: 'paintable-wall', nameEn: 'Paintable Wall', nameEs: 'Pared pintable', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#9aa5d4' },
  { id: 'paintable-wall-yellow', nameEn: 'Paintable Wall (Yellow)', nameEs: 'Pared pintable (amarilla)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#d4c22a' },
  { id: 'paintable-wall-green', nameEn: 'Paintable Wall (Green)', nameEs: 'Pared pintable (verde)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#40a910' },
  { id: 'paintable-wall-red', nameEn: 'Paintable Wall (Red)', nameEs: 'Pared pintable (roja)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#bb0a0a' },
  { id: 'paintable-wall-purple', nameEn: 'Paintable Wall (Purple)', nameEs: 'Pared pintable (morada)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#6d3189' },
  { id: 'paintable-wall-blue', nameEn: 'Paintable Wall (Blue)', nameEs: 'Pared pintable (azul)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#1c5dd8' },
  { id: 'paintable-wall-brown', nameEn: 'Paintable Wall (Brown)', nameEs: 'Pared pintable (marrón)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#7c3a1c' },
  { id: 'paintable-wall-white', nameEn: 'Paintable Wall (White)', nameEs: 'Pared pintable (blanca)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#9db4cb' },
  { id: 'paintable-wall-black', nameEn: 'Paintable Wall (Black)', nameEs: 'Pared pintable (negra)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#3e3e3e' },
  { id: 'paintable-wall-orange', nameEn: 'Paintable Wall (Orange)', nameEs: 'Pared pintable (naranja)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#e27929' },
  { id: 'paintable-wall-cyan', nameEn: 'Paintable Wall (Cyan)', nameEs: 'Pared pintable (cian)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#1fc1b3' },
  { id: 'paintable-wall-pink', nameEn: 'Paintable Wall (Pink)', nameEs: 'Pared pintable (rosa)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#f61e78' },
  { id: 'paintable-wall-grey', nameEn: 'Paintable Wall (Grey)', nameEs: 'Pared pintable (gris)', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#83979f' },
  { id: 'thermite-wall', nameEn: 'Thermite Wall', nameEs: 'Pared de termita', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#a94436', estimatedColor: true },
  { id: 'glass-wall', nameEn: 'Glass Wall', nameEs: 'Pared de vidrio', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#8bbdca', estimatedColor: true },
  { id: 'thin-glass-wall', nameEn: 'Thin Glass Wall', nameEs: 'Pared de vidrio delgado', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#a7d5df', estimatedColor: true },
  { id: 'straw-bale-wall', nameEn: 'Straw-bale Wall', nameEs: 'Pared de fardos de paja', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#dbd489' },
  { id: 'explosives-deposit', nameEn: 'Explosives Deposit', nameEs: 'Depósito de explosivos', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#c0171a' },
  { id: 'molten-wall', nameEn: 'Molten Wall', nameEs: 'Pared fundida', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#cf5632', estimatedColor: true },
  { id: 'poison-berry-wall', nameEn: 'Poison Berry Wall', nameEs: 'Pared de bayas venenosas', category: 'wall', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#5c7339', estimatedColor: true },
  { id: 'wood-floor', nameEn: 'Wood Floor', nameEs: 'Suelo de madera', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#c7944f' },
  { id: 'stone-floor', nameEn: 'Stone Floor', nameEs: 'Suelo de piedra', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#81848c' },
  { id: 'paintable-floor', nameEn: 'Paintable Floor', nameEs: 'Suelo pintable', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#aebdf1' },
  { id: 'scarlet-floor', nameEn: 'Scarlet Floor', nameEs: 'Suelo escarlata', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#b23526' },
  { id: 'lit-floor', nameEn: 'Lit Floor', nameEs: 'Suelo iluminado', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#9f9f9f', defaultLightRadius: 2 },
  { id: 'coral-floor', nameEn: 'Coral Floor', nameEs: 'Suelo de coral', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#ef39c2' },
  { id: 'galaxite-floor', nameEn: 'Galaxite Floor', nameEs: 'Suelo de galaxita', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#c5c5c5' },
  { id: 'glass-floor', nameEn: 'Glass Floor', nameEs: 'Suelo de vidrio', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#89c7d2', estimatedColor: true },
  { id: 'woven-straw-floor', nameEn: 'Woven Straw Floor', nameEs: 'Suelo de paja tejida', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#fff371' },
  { id: 'gleam-wood-floor', nameEn: 'Gleam Wood Floor', nameEs: 'Suelo de madera resplandeciente', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#80f2ff' },
  { id: 'grimy-stone-floor', nameEn: 'Grimy Stone Floor', nameEs: 'Suelo de piedra mugrienta', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#776d65', estimatedColor: true },
  { id: 'eerie-floor', nameEn: 'Eerie Floor', nameEs: 'Suelo siniestro', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#78618b', estimatedColor: true },
  { id: 'rug', nameEn: 'Rug', nameEs: 'Alfombra', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#7c477b' },
  { id: 'woven-mat', nameEn: 'Woven Mat', nameEs: 'Tapete tejido', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#3a8b41' },
  { id: 'loose-flooring', nameEn: 'Loose Flooring', nameEs: 'Piso suelto', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#b48467', estimatedColor: true },
  { id: 'rose-petal-flooring', nameEn: 'Rose Petal Flooring', nameEs: 'Piso de pétalos de rosa', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#d988a9', estimatedColor: true },
  { id: 'daisy-flooring', nameEn: 'Daisy Flooring', nameEs: 'Piso de margaritas', category: 'floor', layer: 'floor', width: 1, height: 1, imageUrl: '', color: '#e8dfbd', estimatedColor: true },
  { id: 'wood-bridge', nameEn: 'Wood Bridge', nameEs: 'Puente de madera', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeWood', color: '#a17a4d' },
  { id: 'stone-bridge', nameEn: 'Stone Bridge', nameEs: 'Puente de piedra', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeStone', color: '#6a7780' },
  { id: 'scarlet-bridge', nameEn: 'Scarlet Bridge', nameEs: 'Puente escarlata', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeScarlet', color: '#9f3447' },
  { id: 'coral-bridge', nameEn: 'Coral Bridge', nameEs: 'Puente de coral', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeCoral', color: '#ce8291' },
  { id: 'galaxite-bridge', nameEn: 'Galaxite Bridge', nameEs: 'Puente de galaxita', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeGalaxite', color: '#5658a8' },
  { id: 'glass-bridge', nameEn: 'Glass Bridge', nameEs: 'Puente de vidrio', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeGlass', color: '#8bc7d3' },
  { id: 'gleam-wood-bridge', nameEn: 'Gleam Wood Bridge', nameEs: 'Puente de madera resplandeciente', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeGleamWood', color: '#68c9be' },
  { id: 'metal-grate', nameEn: 'Metal Grate', nameEs: 'Rejilla metálica', category: 'bridge', layer: 'bridge', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_bridgeMetalGrate', color: '#798590' },
  { id: 'rail', nameEn: 'Rail', nameEs: 'Riel', category: 'rail', layer: 'rail', width: 1, height: 1, imageUrl: '/object-sprites/rail.png', color: '#7a7a7a' },
  { id: 'wood-fence', nameEn: 'Wood Fence', nameEs: 'Cerca de madera', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#9c7046' },
  { id: 'stone-fence', nameEn: 'Stone Fence', nameEs: 'Cerca de piedra', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_stoneFence', color: '#727a7a' },
  { id: 'scarlet-fence', nameEn: 'Scarlet Fence', nameEs: 'Cerca escarlata', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#9b3447' },
  { id: 'coral-fence', nameEn: 'Coral Fence', nameEs: 'Cerca de coral', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#d48b9a' },
  { id: 'galaxite-fence', nameEn: 'Galaxite Fence', nameEs: 'Cerca de galaxita', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#615bb3' },
  { id: 'gleam-wood-fence', nameEn: 'Gleam Wood Fence', nameEs: 'Cerca de madera resplandeciente', category: 'fence', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#61b9b1' },
  { id: 'torch', nameEn: 'Torch', nameEs: 'Antorcha', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'Torch', color: '#f7bd4b', defaultLightRadius: 4 },
  { id: 'campfire', nameEn: 'Campfire', nameEs: 'Fogata', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/campfire-wiki.png', color: '#e48736', defaultLightRadius: 6 },
  { id: 'candle', nameEn: 'Candle', nameEs: 'Vela', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/candle.png', color: '#f4d889', defaultLightRadius: 3 },
  { id: 'candle-stack', nameEn: 'Candle Stack', nameEs: 'Pila de velas', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/candle-stack.png', color: '#f2d587', defaultLightRadius: 4 },
  { id: 'decorative-torch', nameEn: 'Decorative Torch', nameEs: 'Antorcha decorativa', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/decorative-torch.png', color: '#f6b64b', defaultLightRadius: 4 },
  { id: 'lamp', nameEn: 'Lamp', nameEs: 'Lámpara', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/lamp.png', color: '#e4c36a', defaultLightRadius: 5 },
  { id: 'lamp-post', nameEn: 'Lamp Post', nameEs: 'Poste de luz', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_lampPost', color: '#e4c36a', defaultLightRadius: 5 },
  { id: 'stone-lantern', nameEn: 'Stone Lantern', nameEs: 'Farol de piedra', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_stoneLantern', color: '#e6bd5a', defaultLightRadius: 5 },
  { id: 'soul-lantern', nameEn: 'Soul Lantern', nameEs: 'Farol de almas', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_soulLantern', color: '#79b6cf', defaultLightRadius: 5 },
  { id: 'chinese-lantern', nameEn: 'Chinese Lantern', nameEs: 'Farol chino', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_chineseLantern', color: '#d97758', defaultLightRadius: 5 },
  { id: 'chinese-wall-lantern', nameEn: 'Chinese Wall Lantern', nameEs: 'Farol chino de pared', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_chineseWallLantern', color: '#d97758', defaultLightRadius: 5 },
  { id: 'crystal-lamp', nameEn: 'Crystal Lamp', nameEs: 'Lámpara de cristal', category: 'light', layer: 'light', width: 1, height: 1, imageUrl: '/object-sprites/crystal-lamp.png', color: '#78c3d9', defaultLightRadius: 6 },
  { id: 'wood-door', nameEn: 'Wood Door', nameEs: 'Puerta de madera', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#9c7046' },
  { id: 'stone-door', nameEn: 'Stone Door', nameEs: 'Puerta de piedra', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#727a7a' },
  { id: 'electrical-door', nameEn: 'Electrical Door', nameEs: 'Puerta eléctrica', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#5793a8' },
  { id: 'scarlet-door', nameEn: 'Scarlet Door', nameEs: 'Puerta escarlata', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#9b3447' },
  { id: 'coral-door', nameEn: 'Coral Door', nameEs: 'Puerta de coral', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_coralDoor', color: '#d48b9a' },
  { id: 'galaxite-door', nameEn: 'Galaxite Door', nameEs: 'Puerta de galaxita', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_galaxiteDoor', color: '#615bb3' },
  { id: 'gleam-wood-door', nameEn: 'Gleam Wood Door', nameEs: 'Puerta de madera resplandeciente', category: 'door', layer: 'wall', width: 1, height: 1, imageUrl: '', color: '#61b9b1' },
  { id: 'wood-fence-gate', nameEn: 'Wood Fence Gate', nameEs: 'Portón de cerca de madera', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#9c7046' },
  { id: 'stone-fence-gate', nameEn: 'Stone Fence Gate', nameEs: 'Portón de cerca de piedra', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', spriteId: 'fence_gate_stone_0', color: '#727a7a' },
  { id: 'scarlet-fence-gate', nameEn: 'Scarlet Fence Gate', nameEs: 'Portón de cerca escarlata', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', spriteId: 'fence_gate_scarlet_0', color: '#9b3447' },
  { id: 'coral-fence-gate', nameEn: 'Coral Fence Gate', nameEs: 'Portón de cerca de coral', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#d48b9a' },
  { id: 'galaxite-fence-gate', nameEn: 'Galaxite Fence Gate', nameEs: 'Portón de cerca de galaxita', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#615bb3' },
  { id: 'gleam-wood-fence-gate', nameEn: 'Gleam Wood Fence Gate', nameEs: 'Portón de cerca de madera resplandeciente', category: 'gate', layer: 'fence', width: 1, height: 1, imageUrl: '', color: '#61b9b1' },
];

// Additional buildable furniture, stations and mechanisms. Items tagged with
// estimatedSize still need their own wiki Placeable field checked.
export const FUNCTIONAL_ITEMS: StorageItemDefinition[] = [
  { id: 'basic-workbench', nameEn: 'Basic Workbench', nameEs: 'Banco de trabajo básico', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/basic-workbench.png', color: '#a47a4f' },
  { id: 'copper-workbench', nameEn: 'Copper Workbench', nameEs: 'Banco de trabajo de cobre', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/copper-workbench.png', color: '#b8764e' },
  { id: 'tin-workbench', nameEn: 'Tin Workbench', nameEs: 'Banco de trabajo de estaño', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/tin-workbench.png', color: '#87969a' },
  { id: 'iron-workbench', nameEn: 'Iron Workbench', nameEs: 'Banco de trabajo de hierro', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/iron-workbench.png', color: '#69747a' },
  { id: 'scarlet-workbench', nameEn: 'Scarlet Workbench', nameEs: 'Banco de trabajo escarlata', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/scarlet-workbench.png', color: '#9b3447' },
  { id: 'octarine-workbench', nameEn: 'Octarine Workbench', nameEs: 'Banco de trabajo de octarina', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/octarine-workbench.png', color: '#7659a8' },
  { id: 'galaxite-workbench', nameEn: 'Galaxite Workbench', nameEs: 'Banco de trabajo de galaxita', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/galaxite-workbench.png', color: '#615bb3' },
  { id: 'solarite-workbench', nameEn: 'Solarite Workbench', nameEs: 'Banco de trabajo de solarita', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/solarite-workbench.png', color: '#d5a349' },
  { id: 'alchemy-table', nameEn: 'Alchemy Table', nameEs: 'Mesa de alquimia', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/alchemy-table.png', color: '#765a71' },
  { id: 'laboratory-table', nameEn: 'Laboratory Table', nameEs: 'Mesa de laboratorio', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/laboratory-table.png', color: '#7f6a92' },
  { id: 'furnace', nameEn: 'Furnace', nameEs: 'Horno', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/furnace.png', color: '#b9653e' },
  { id: 'glass-smelter', nameEn: 'Glass Smelter', nameEs: 'Fundidora de vidrio', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/glass-smelter.png', color: '#83bac4' },
  { id: 'fury-forge', nameEn: 'Fury Forge', nameEs: 'Forja de furia', category: 'station', width: 2, height: 2, imageUrl: '/storage-items/fury-forge.png', color: '#cb633b' },
  { id: 'automation-table', nameEn: 'Automation Table', nameEs: 'Mesa de automatización', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/automation-table.png', color: '#73898a' },
  { id: 'cartography-table', nameEn: 'Cartography Table', nameEs: 'Mesa de cartografía', category: 'station', width: 2, height: 2, imageUrl: '/storage-items/cartography-table.png', color: '#91734f' },
  { id: 'copper-anvil', nameEn: 'Copper Anvil', nameEs: 'Yunque de cobre', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/copper-anvil.png', color: '#b8764e' },
  { id: 'tin-anvil', nameEn: 'Tin Anvil', nameEs: 'Yunque de estaño', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/tin-anvil.png', color: '#87969a' },
  { id: 'iron-anvil', nameEn: 'Iron Anvil', nameEs: 'Yunque de hierro', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/iron-anvil.png', color: '#69747a' },
  { id: 'scarlet-anvil', nameEn: 'Scarlet Anvil', nameEs: 'Yunque escarlata', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/scarlet-anvil.png', color: '#9b3447' },
  { id: 'octarine-anvil', nameEn: 'Octarine Anvil', nameEs: 'Yunque de octarina', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/octarine-anvil.png', color: '#7659a8' },
  { id: 'galaxite-anvil', nameEn: 'Galaxite Anvil', nameEs: 'Yunque de galaxita', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/galaxite-anvil.png', color: '#615bb3' },
  { id: 'solarite-anvil', nameEn: 'Solarite Anvil', nameEs: 'Yunque de solarita', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/solarite-anvil.png', color: '#d5a349' },
  { id: 'smelter-kiln', nameEn: 'Smelter Kiln', nameEs: 'Horno de fundición', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/smelter-kiln.png', color: '#bd633e' },
  { id: 'cooking-pot', nameEn: 'Cooking Pot', nameEs: 'Olla de cocina', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/cooking-pot.png', color: '#77848b' },
  { id: 'carpenters-table', nameEn: "Carpenter's Table", nameEs: 'Mesa de carpintería', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/carpenters-table.png', color: '#a47a4f' },
  { id: 'electronics-table', nameEn: 'Electronics Table', nameEs: 'Mesa de electrónica', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/electronics-table.png', color: '#687d8e' },
  { id: 'painter-table', nameEn: "Painter's Table", nameEs: 'Mesa del pintor', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/painter-table.png', color: '#b98575' },
  { id: 'salvage-repair-station', nameEn: 'Salvage and Repair Station', nameEs: 'Estación de salvamento y reparación', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/salvage-repair-station.png', color: '#858278' },
  { id: 'upgrade-station', nameEn: 'Upgrade Station', nameEs: 'Estación de mejora', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/upgrade-station.png', color: '#b78e4f' },
  { id: 'table-saw', nameEn: 'Table Saw', nameEs: 'Sierra de mesa', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/table-saw.png', color: '#8a7360' },
  { id: 'railway-forge', nameEn: 'Railway Forge', nameEs: 'Forja ferroviaria', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/railway-forge.png', color: '#9a684b' },
  { id: 'loom', nameEn: 'Loom', nameEs: 'Telar', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/loom.png', color: '#a8835e' },
  { id: 'music-workbench', nameEn: 'Music Workbench', nameEs: 'Banco de trabajo musical', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/music-workbench.png', color: '#765b77' },
  { id: 'egg-incubator', nameEn: 'Egg Incubator', nameEs: 'Incubadora de huevos', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/egg-incubator.png', color: '#82a070' },
  { id: 'boat-workbench', nameEn: 'Boat Workbench', nameEs: 'Banco de botes', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/boat-workbench.png', color: '#a7794d' },
  { id: 'distillery-table', nameEn: 'Distillery Table', nameEs: 'Mesa de destilación', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/distillery-table.png', color: '#8b654b' },
  { id: 'easter-workbench', nameEn: 'Easter Workbench', nameEs: 'Banco de Pascua', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/easter-workbench.png', color: '#95a77e' },
  { id: 'festive-workbench', nameEn: 'Festive Workbench', nameEs: 'Banco festivo', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/festive-workbench.png', color: '#a33d43' },
  { id: 'glass-workbench', nameEn: 'Glass Workbench', nameEs: 'Banco de vidrio', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/glass-workbench.png', color: '#7eb5c1' },
  { id: 'go-kart-workbench', nameEn: 'Go-Kart Workbench', nameEs: 'Banco de karts', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/go-kart-workbench.png', color: '#a76f4f' },
  { id: 'jewelry-workbench', nameEn: 'Jewelry Workbench', nameEs: 'Banco de joyería', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/jewelry-workbench.png', color: '#a48760' },
  { id: 'key-casting-table', nameEn: 'Key Casting Table', nameEs: 'Mesa de fundición de llaves', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/key-casting-table.png', color: '#ac8754' },
  { id: 'livestock-workbench', nameEn: 'Livestock Workbench', nameEs: 'Banco de ganado', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/livestock-workbench.png', color: '#9a7855' },
  { id: 'proficient-jewelry-workbench', nameEn: 'Proficient Jewelry Workbench', nameEs: 'Banco de joyería avanzado', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/proficient-jewelry-workbench.png', color: '#a48760' },
  { id: 'samhain-workbench', nameEn: 'Samhain Workbench', nameEs: 'Banco de Samhain', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/samhain-workbench.png', color: '#66516f' },
  { id: 'valentine-crafting-table', nameEn: 'Valentine Crafting Table', nameEs: 'Mesa de San Valentín', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/valentine-crafting-table.png', color: '#bf646f' },
  { id: 'advanced-automation-table', nameEn: 'Advanced Automation Table', nameEs: 'Mesa de automatización avanzada', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/advanced-automation-table.png', color: '#73898a' },
  { id: 'fishing-workbench', nameEn: 'Fishing Workbench', nameEs: 'Banco de trabajo de pesca', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/fishing-workbench.png', color: '#7ba2a6' },
  { id: 'little-helperling', nameEn: 'Little Helperling', nameEs: 'Pequeño ayudante', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/little-helperling.png', color: '#9daeb0' },
  { id: 'metalcrafters-table', nameEn: "Metalcrafter's Table", nameEs: 'Mesa de metalistería', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/metalcrafters-table.png', color: '#7f898b' },
  { id: 'pouch-workbench', nameEn: 'Pouch Workbench', nameEs: 'Banco de bolsas', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/pouch-workbench.png', color: '#9a7655' },
  { id: 'relucite-smithing-table', nameEn: 'Relucite Smithing Table', nameEs: 'Mesa de forja de relucita', category: 'station', width: 1, height: 1, imageUrl: '/storage-items/relucite-smithing-table.png', color: '#8a93a1' },
  { id: 'bed', nameEn: 'Bed', nameEs: 'Cama', category: 'bed', width: 1, height: 2, imageUrl: '/storage-items/bed.png', color: '#9d6a58' },
  { id: 'caveling-bed', nameEn: 'Caveling Bed', nameEs: 'Cama caveling', category: 'bed', width: 2, height: 1, imageUrl: '/storage-items/caveling-bed.png', color: '#77736d' },
  { id: 'wood-stool', nameEn: 'Wood Stool', nameEs: 'Taburete de madera', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/wood-stool.png', color: '#9c7046' },
  { id: 'floor-pillow', nameEn: 'Floor Pillow', nameEs: 'Cojín de suelo', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/floor-pillow.png', color: '#c86f72', estimatedSize: true },
  { id: 'caveling-chair', nameEn: 'Caveling Chair', nameEs: 'Silla caveling', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/caveling-chair.png', color: '#807b72' },
  { id: 'caveling-toilet', nameEn: 'Caveling Toilet', nameEs: 'Retrete caveling', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/caveling-toilet.png', color: '#8b8277', estimatedSize: true },
  { id: 'caveling-throne', nameEn: 'Caveling Throne', nameEs: 'Trono caveling', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/caveling-throne.png', color: '#8a7b64', estimatedSize: true },
  { id: 'driftwood-stool', nameEn: 'Driftwood Stool', nameEs: 'Taburete de madera flotante', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/driftwood-stool.png', color: '#967454', estimatedSize: true },
  { id: 'caveling-stool', nameEn: 'Caveling Stool', nameEs: 'Taburete caveling', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/caveling-stool.png', color: '#807b72' },
  { id: 'temple-throne', nameEn: 'Temple Throne', nameEs: 'Trono del templo', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/temple-throne.png', color: '#b3965d', estimatedSize: true },
  { id: 'easter-meadow-stool', nameEn: 'Easter Meadow Stool', nameEs: 'Taburete de pradera de Pascua', category: 'chair', width: 1, height: 1, imageUrl: '/object-sprites/easter-meadow-stool.png', color: '#8eaa76', estimatedSize: true },
  { id: 'eerie-stool', nameEn: 'Eerie Stool', nameEs: 'Taburete siniestro', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/eerie-stool.png', color: '#766181', estimatedSize: true },
  { id: 'festive-stool', nameEn: 'Festive Stool', nameEs: 'Taburete festivo', category: 'chair', width: 1, height: 1, imageUrl: '/storage-items/festive-stool.png', color: '#a73b42', estimatedSize: true },
  { id: 'electricity-generator', nameEn: 'Electricity Generator', nameEs: 'Generador eléctrico', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/electricity-generator.png', color: '#c5a354', estimatedSize: true },
  { id: 'electricity-stick', nameEn: 'Electricity Stick', nameEs: 'Varilla eléctrica', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/electricity-stick.png', color: '#82a8ac', estimatedSize: true },
  { id: 'lever', nameEn: 'Lever', nameEs: 'Palanca', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/lever.png', color: '#908772', estimatedSize: true },
  { id: 'pressure-plate', nameEn: 'Pressure Plate', nameEs: 'Placa de presión', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/pressure-plate.png', color: '#7b858b', estimatedSize: true },
  { id: 'electrical-wire', nameEn: 'Electrical Wire', nameEs: 'Cable eléctrico', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/electrical-wire.png', color: '#bd9d53', estimatedSize: true },
  { id: 'logic-circuit', nameEn: 'Logic Circuit', nameEs: 'Circuito lógico', category: 'mechanism', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_logicCircuit', color: '#638d8b', estimatedSize: true },
  { id: 'pulse-circuit', nameEn: 'Pulse Circuit', nameEs: 'Circuito de pulso', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/pulse-circuit.png', color: '#638d8b', estimatedSize: true },
  { id: 'delay-circuit', nameEn: 'Delay Circuit', nameEs: 'Circuito de retardo', category: 'mechanism', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_delayCircuit', color: '#638d8b', estimatedSize: true },
  { id: 'cross-circuit', nameEn: 'Cross Circuit', nameEs: 'Circuito cruzado', category: 'mechanism', width: 1, height: 1, imageUrl: '', spriteId: 'lootsprite_crossCircuit', color: '#638d8b', estimatedSize: true },
  { id: 'crude-drill', nameEn: 'Crude Drill', nameEs: 'Taladro rudimentario', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/crude-drill.png', color: '#a17959', estimatedSize: true },
  { id: 'drill', nameEn: 'Drill', nameEs: 'Taladro', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/drill.png', color: '#8b9094', estimatedSize: true },
  { id: 'robot-arm', nameEn: 'Robot Arm', nameEs: 'Brazo robótico', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/robot-arm.png', color: '#91a4a4', estimatedSize: true },
  { id: 'conveyor-belt', nameEn: 'Conveyor Belt', nameEs: 'Cinta transportadora', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/conveyor-belt.png', color: '#747a80', estimatedSize: true },
  { id: 'sprinkler', nameEn: 'Sprinkler', nameEs: 'Aspersor', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/sprinkler.png', color: '#7198a2', estimatedSize: true },
  { id: 'materializer', nameEn: 'Materializer', nameEs: 'Materializador', category: 'mechanism', width: 1, height: 1, imageUrl: '/object-sprites/materializer.png', color: '#715d9a', estimatedSize: true },
  { id: 'dresser', nameEn: 'Dresser', nameEs: 'Cómoda', category: 'other', width: 2, height: 1, imageUrl: '/storage-items/dresser.png', color: '#986d4e' },
  { id: 'eerie-dresser', nameEn: 'Eerie Dresser', nameEs: 'Cómoda siniestra', category: 'other', width: 2, height: 1, imageUrl: '/storage-items/eerie-dresser.png', color: '#6f5a78', estimatedSize: true },
  { id: 'wash-basin', nameEn: 'Wash Basin', nameEs: 'Lavabo', category: 'other', width: 1, height: 1, imageUrl: '/storage-items/wash-basin.png', color: '#829295' },
  { id: 'water-well', nameEn: 'Water Well', nameEs: 'Pozo de agua', category: 'other', width: 2, height: 2, imageUrl: '/storage-items/water-well.png', color: '#8e8a79' },
  { id: 'mold-well', nameEn: 'Mold Well', nameEs: 'Pozo de moho', category: 'other', width: 2, height: 2, imageUrl: '/storage-items/mold-well.png', color: '#667653', estimatedSize: true },
  { id: 'sign', nameEn: 'Sign', nameEs: 'Letrero', category: 'other', width: 1, height: 1, imageUrl: '/storage-items/sign.png', color: '#a47a4f' },
  { id: 'arrow-sign', nameEn: 'Arrow Sign', nameEs: 'Letrero con flecha', category: 'other', width: 1, height: 1, imageUrl: '/storage-items/arrow-sign.png', color: '#a47a4f', estimatedSize: true },
  { id: 'anteverse-portal', nameEn: 'Anteverse Portal', nameEs: 'Portal anteverso', category: 'other', layer: 'light', width: 3, height: 1, imageUrl: '/object-sprites/anteverse-portal.png', color: '#ce61d5', defaultLightRadius: 4 },
  { id: 'portal', nameEn: 'Portal', nameEs: 'Portal', category: 'other', layer: 'light', width: 3, height: 1, imageUrl: '/object-sprites/portal.png', color: '#54c9e3', defaultLightRadius: 4 },
  { id: 'ancient-waypoint', nameEn: 'Ancient Waypoint', nameEs: 'Punto de teletransporte antiguo', category: 'other', layer: 'light', width: 3, height: 3, imageUrl: '/object-sprites/ancient-waypoint.png', color: '#69c8dc', defaultLightRadius: 5 },
];

export const STORAGE_ITEM_BY_ID = new Map([...STORAGE_ITEMS, ...FUNCTIONAL_ITEMS, ...STRUCTURE_ITEMS].map(item => [item.id, item]));

export function migrateStructurePlacementsToColors(
  cells: Record<string, string>,
  placements: import('../types/blueprint').StorageItemPlacement[],
): { cells: Record<string, string>; storagePlacements: import('../types/blueprint').StorageItemPlacement[] } {
  const migratedCells = { ...cells };
  const remainingPlacements: import('../types/blueprint').StorageItemPlacement[] = [];

  for (const placement of placements) {
    const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
    if (!item || !['wall', 'floor', 'bridge', 'fence', 'rail', 'door', 'gate'].includes(item.category)) {
      remainingPlacements.push(placement);
      continue;
    }

    const colorId = item.category === 'door' || item.category === 'gate'
      ? placement.rotation === 90 ? 'door-vertical' : 'door-horizontal'
      : `color-${item.id}`;
    for (let y = placement.y; y < placement.y + placement.height; y++) {
      for (let x = placement.x; x < placement.x + placement.width; x++) {
        migratedCells[`${x},${y}`] = colorId;
      }
    }
  }

  return { cells: migratedCells, storagePlacements: remainingPlacements };
}
