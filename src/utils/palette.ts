import { Language, PaletteColor } from '../types/blueprint';
import { Translations } from '../i18n/translations';

export const DEFAULT_PALETTE: PaletteColor[] = [
  { id: 'door', name: 'Door / Puerta', hex: '#000000', isDefault: true },
  { id: 'wall', name: 'Wall / Pared', hex: '#4B5262', isDefault: true },
  { id: 'floor', name: 'Floor / Suelo', hex: '#82786B', isDefault: true },
  { id: 'storage', name: 'Storage / Almacén', hex: '#3FA876', isDefault: true },
  { id: 'workshop', name: 'Workshop / Taller', hex: '#E2C943', isDefault: true },
  { id: 'farm', name: 'Farm / Cultivo', hex: '#98BD3E', isDefault: true },
  { id: 'enclosure', name: 'Enclosure / Corral', hex: '#CEAF7B', isDefault: true },
  { id: 'core', name: 'Core / Portal', hex: '#38BDF8', isDefault: true },
  { id: 'statue', name: 'Statue / Estatua', hex: '#EC4899', isDefault: true },
  { id: 'lighting', name: 'Light / Luz', hex: '#FB923C', isDefault: true },
  { id: 'npc', name: 'NPC Room / Muebles', hex: '#6B7280', isDefault: true },
  { id: 'other', name: 'Other / Libre', hex: '#A855F7', isDefault: true },
];

export function getPaletteColor(palette: PaletteColor[], colorId: string): PaletteColor | undefined {
  return palette.find(p => p.id === colorId);
}

export function getColorHex(palette: PaletteColor[], colorId: string): string {
  const found = getPaletteColor(palette, colorId);
  return found ? found.hex : '#64748b';
}

/**
 * Returns the display label for a palette color.
 * Default colors are shown in English when the UI language is English;
 * Spanish keeps the original bilingual names stored in the project.
 */
export function getPaletteColorLabel(
  color: PaletteColor,
  t: Translations,
  language: Language
): string {
  if (language !== 'en' || !color.isDefault) return color.name;
  const key = color.id === 'door' ? 'doorway' : color.id;
  const table = t.defaultColors as Record<string, string>;
  return table[key] ?? color.name;
}
