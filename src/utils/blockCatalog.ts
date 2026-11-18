import { PaletteColor } from '../types/blueprint';
import { STRUCTURE_ITEMS } from './storageCatalog';

export interface BlockCatalogEntry {
  id: string;
  nameEn: string;
  nameEs: string;
  category?: 'wall' | 'floor' | 'bridge' | 'fence' | 'rail';
  swatch?: string;
  swatchEstimated?: boolean;
  wall?: string;
  ground?: string;
  wallEstimated?: boolean;
  groundEstimated?: boolean;
}

// Wiki HEX values are used where published. For missing values, the planner
// keeps a representative color based on the block's sprite and marks it estimated.
const STRUCTURE_COLOR_CATEGORIES = new Set(['wall', 'bridge', 'fence', 'rail']);
const STRUCTURE_COLOR_BLOCKS: BlockCatalogEntry[] = STRUCTURE_ITEMS
  .filter(item => STRUCTURE_COLOR_CATEGORIES.has(item.category) && item.color)
  .map(item => ({
    id: item.id,
    nameEn: item.nameEn,
    nameEs: item.nameEs,
    category: item.category as 'wall' | 'floor' | 'bridge' | 'fence' | 'rail',
    swatch: item.color,
    swatchEstimated: true,
  }));

export const BLOCK_CATALOG: BlockCatalogEntry[] = [
  // Structure colors are representative estimates from each item's dominant sprite tone.
  ...STRUCTURE_COLOR_BLOCKS,
  { id: 'wood', nameEn: 'Wood Block', nameEs: 'Bloque de madera', wall: '#946933', wallEstimated: true },
  { id: 'sand', nameEn: 'Sand Block', nameEs: 'Bloque de arena', wall: '#ac8f3a', ground: '#d4b959' },
  { id: 'snow', nameEn: 'Snow Block', nameEs: 'Bloque de nieve', wall: '#6db1b4', ground: '#9be7eb', groundEstimated: true },
  { id: 'dirt', nameEn: 'Dirt Block', nameEs: 'Bloque de tierra', wall: '#614927', ground: '#7f5f30' },
  { id: 'meadow', nameEn: 'Meadow Block', nameEs: 'Bloque de pradera', wall: '#e0c961', ground: '#efe1b3', groundEstimated: true },
  { id: 'turf', nameEn: 'Turf Block', nameEs: 'Bloque de césped', wall: '#466751', ground: '#568064' },
  { id: 'clay', nameEn: 'Clay Block', nameEs: 'Bloque de arcilla', wall: '#c16436', ground: '#e88b69' },
  { id: 'dark-stone', nameEn: 'Dark Stone Block', nameEs: 'Bloque de piedra oscura', wall: '#7b8cac', ground: '#9eafc4', wallEstimated: true, groundEstimated: true },
  { id: 'stone', nameEn: 'Stone Block', nameEs: 'Bloque de piedra', wall: '#49677d', ground: '#678397' },
  { id: 'larva-hive', nameEn: 'Larva Hive Block', nameEs: 'Bloque de colmena de larvas', wall: '#a36153', ground: '#c77463' },
  { id: 'grass', nameEn: 'Grass Block', nameEs: 'Bloque de hierba', wall: '#16831b', ground: '#3d9b41' },
  { id: 'beach', nameEn: 'Beach Block', nameEs: 'Bloque de playa', wall: '#b4939a', ground: '#ebc0be' },
  { id: 'mold', nameEn: 'Mold Block', nameEs: 'Bloque de moho', wall: '#599cba', ground: '#6cbce0' },
  { id: 'desert', nameEn: 'Desert Block', nameEs: 'Bloque del desierto', wall: '#a69298', ground: '#d29a7c' },
  { id: 'oasis', nameEn: 'Oasis Block', nameEs: 'Bloque de oasis', wall: '#c6a663', ground: '#e5d08d', wallEstimated: true, groundEstimated: true },
  { id: 'metropolis', nameEn: 'Metropolis Block', nameEs: 'Bloque de metrópolis', wall: '#314d57', ground: '#578084' },
  { id: 'alien-tech', nameEn: 'Alien Tech Block', nameEs: 'Bloque de tecnología alienígena', wall: '#463e66', ground: '#456a73', groundEstimated: true },
  { id: 'crystal', nameEn: 'Crystal Block', nameEs: 'Bloque de cristal', wall: '#2a70ba', ground: '#3988db', groundEstimated: true },
  { id: 'desert-temple', nameEn: 'Desert Temple Block', nameEs: 'Bloque del templo del desierto', wall: '#006cb1', ground: '#9e8a86', groundEstimated: true },
  { id: 'maze', nameEn: 'Maze Block', nameEs: 'Bloque de laberinto', wall: '#3c4f39', ground: '#536460', groundEstimated: true },
  { id: 'lava-rock', nameEn: 'Lava Rock Block', nameEs: 'Bloque de roca de lava', wall: '#383447', ground: '#554e6a', groundEstimated: true },
  { id: 'fossil', nameEn: 'Fossil Block', nameEs: 'Bloque fósil', wall: '#9b9181', ground: '#c8baa0', wallEstimated: true, groundEstimated: true },
  { id: 'obsidian', nameEn: 'Obsidian Block', nameEs: 'Bloque de obsidiana', wall: '#162a27' },
];

export const BLOCK_PALETTE: PaletteColor[] = BLOCK_CATALOG.flatMap(block => ([
  ...(block.swatch ? [{
    id: `color-${block.id}`,
    name: block.nameEn,
    nameEn: block.nameEn,
    nameEs: block.nameEs,
    hex: block.swatch,
    isDefault: true,
    estimated: block.swatchEstimated ?? true,
  }] : []),
    ...(block.wall ? [{
    id: `block-${block.id}-wall`,
    name: `${block.nameEn} (Wall)`,
    nameEn: `${block.nameEn} (Wall)`,
    nameEs: `${block.nameEs} (Pared)`,
    hex: block.wall,
    isDefault: true,
    estimated: block.wallEstimated,
  }] : []),
]));

export const DEFAULT_ACTIVE_COLOR = BLOCK_PALETTE.find(color => color.id === 'block-wood-wall') ?? BLOCK_PALETTE[0];

export const GAME_PALETTE: PaletteColor[] = BLOCK_PALETTE;

export const BLOCK_COLOR_BY_ID = new Map(BLOCK_PALETTE.map(color => [color.id, color]));

export function paletteWithBlockColors(palette: PaletteColor[] = []): PaletteColor[] {
  const colorMap = new Map(GAME_PALETTE.map(color => [color.id, color]));
  for (const color of palette) {
    if (!colorMap.has(color.id)) colorMap.set(color.id, color);
  }
  return [...colorMap.values()];
}
