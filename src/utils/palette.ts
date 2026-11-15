import { Language, PaletteColor } from '../types/blueprint';
import { Translations } from '../i18n/translations';
import { BLOCK_COLOR_BY_ID, GAME_PALETTE } from './blockCatalog';

export const DEFAULT_PALETTE: PaletteColor[] = GAME_PALETTE;

export function getPaletteColor(palette: PaletteColor[], colorId: string): PaletteColor | undefined {
  return palette.find(p => p.id === colorId);
}

export function getColorHex(palette: PaletteColor[], colorId: string): string {
  if (colorId === 'door-horizontal' || colorId === 'door-vertical' || colorId === 'doorway') colorId = 'door';
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
  const blockColor = BLOCK_COLOR_BY_ID.get(color.id);
  if (blockColor) return language === 'en' ? blockColor.nameEn ?? blockColor.name : blockColor.nameEs ?? blockColor.name;
  if (language !== 'en' || !color.isDefault) return color.name;
  const key = color.id === 'door' ? 'doorway' : color.id;
  const table = t.defaultColors as Record<string, string>;
  return table[key] ?? color.name;
}
