import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { BLOCK_CATALOG, BLOCK_PALETTE, DOOR_COLOR } from '../../utils/blockCatalog';
import { Language, PaletteColor } from '../../types/blueprint';
import { FUNCTIONAL_ITEMS, STORAGE_ITEMS, STRUCTURE_ITEMS, StorageItemDefinition } from '../../utils/storageCatalog';
import { GameSpriteEntry } from '../../utils/gameSpriteCatalog';
import { GameSpriteThumbnail } from '../GameSpriteThumbnail';

interface BlockPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: PaletteColor) => void;
  activeColor: PaletteColor;
  language: Language;
  selectedStorageItemId: string | null;
  onSelectStorageItem: (item: StorageItemDefinition) => void;
  gameSprites?: Record<string, GameSpriteEntry>;
}

export const BlockPaletteModal: React.FC<BlockPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  activeColor,
  language,
  selectedStorageItemId,
  onSelectStorageItem,
  gameSprites = {},
}) => {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'blocks' | 'storage'>('blocks');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const isSpanish = language === 'es';
  const filteredBlocks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return BLOCK_CATALOG;
    return BLOCK_CATALOG.filter(block =>
      `${block.nameEn} ${block.nameEs}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);
  const filteredStorageItems = useMemo(() => {
    const allPlaceables = [
      ...STORAGE_ITEMS,
      ...FUNCTIONAL_ITEMS,
      ...STRUCTURE_ITEMS.filter(item => item.category === 'light'),
    ];
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return allPlaceables.filter(item =>
      (categoryFilter === 'all' || item.category === categoryFilter) &&
      (!normalizedQuery || `${item.nameEn} ${item.nameEs} ${item.width}x${item.height} ${item.width}×${item.height}`.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [categoryFilter, query]);
  if (!isOpen) return null;

  const select = (colorId: string) => {
    if (colorId === DOOR_COLOR.id) {
      onSelectColor(DOOR_COLOR);
      onClose();
      return;
    }
    const color = BLOCK_PALETTE.find(candidate => candidate.id === colorId);
    if (color) onSelectColor(color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#15161b] text-zinc-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{isSpanish ? 'Catálogo de construcción' : 'Construction catalog'}</h2>
            <p className="mt-1 text-xs text-zinc-400">
              {section === 'storage'
                ? (isSpanish ? 'Muebles, estaciones, iluminación, plantas y árboles' : 'Furniture, stations, lighting, plants and trees')
                : (isSpanish ? 'Bloques, paredes, suelos, puentes, cercas, rieles, tapetes y alfombras como colores' : 'Blocks, walls, floors, bridges, fences, rails, mats and rugs as colors')}
              <span className="ml-2 text-zinc-500">{section === 'storage'
                ? `${STORAGE_ITEMS.length + FUNCTIONAL_ITEMS.length + STRUCTURE_ITEMS.filter(item => item.category === 'light').length} ${isSpanish ? 'objetos' : 'items'}`
                : `${BLOCK_CATALOG.length} ${isSpanish ? 'bloques' : 'blocks'}`}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label={isSpanish ? 'Cerrar' : 'Close'} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 px-4 pt-3">
          <button onClick={() => { setSection('blocks'); setCategoryFilter('all'); }} className={`border-b-2 px-3 pb-2 text-xs font-medium ${section === 'blocks' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Bloques y colores' : 'Blocks and colors'}</button>
          <button onClick={() => { setSection('storage'); setCategoryFilter('all'); }} className={`border-b-2 px-3 pb-2 text-xs font-medium ${section === 'storage' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Muebles, estaciones, plantas y árboles' : 'Furniture, stations, plants and trees'} <span className="ml-1 text-zinc-500">{STORAGE_ITEMS.length + FUNCTIONAL_ITEMS.length + STRUCTURE_ITEMS.filter(item => item.category === 'light').length}</span></button>
        </div>

        <div className="border-b border-zinc-800 p-4">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#0f1014] px-3 py-2.5 focus-within:border-amber-500/70">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={section === 'storage'
                ? (isSpanish ? 'Buscar muebles, estaciones, plantas, árboles o luces…' : 'Search furniture, stations, plants, trees or lights…')
                : (isSpanish ? 'Buscar bloques en español o inglés…' : 'Search blocks in English or Spanish…')}
              className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            {query && <button onClick={() => setQuery('')} className="text-xs text-zinc-400 hover:text-white">{isSpanish ? 'Limpiar' : 'Clear'}</button>}
          </label>
          {section === 'storage' && (() => {
            const source = [...STORAGE_ITEMS, ...FUNCTIONAL_ITEMS, ...STRUCTURE_ITEMS.filter(item => item.category === 'light')];
            const options = [...new Set(source.map(item => item.category))];
            const labelFor = (category: string) => ({
              all: isSpanish ? 'Todo' : 'All',
              chest: isSpanish ? 'Cofres' : 'Chests',
              table: isSpanish ? 'Mesas' : 'Tables',
              pedestal: isSpanish ? 'Pedestales' : 'Pedestals',
              pet: isSpanish ? 'Mascotas' : 'Pets',
              bed: isSpanish ? 'Camas' : 'Beds',
              chair: isSpanish ? 'Sillas' : 'Chairs',
              terrarium: 'Terrarios',
              aquarium: 'Acuarios',
              other: isSpanish ? 'Otros' : 'Other',
              station: isSpanish ? 'Estaciones' : 'Stations',
              mechanism: isSpanish ? 'Mecanismos' : 'Mechanisms',
              nature: isSpanish ? 'Plantas y árboles' : 'Plants and trees',
              door: isSpanish ? 'Puertas' : 'Doors',
              gate: isSpanish ? 'Portones' : 'Gates',
              wall: isSpanish ? 'Paredes' : 'Walls',
              floor: isSpanish ? 'Pisos' : 'Floors',
              bridge: isSpanish ? 'Puentes' : 'Bridges',
              rail: isSpanish ? 'Rieles' : 'Rails',
              fence: isSpanish ? 'Cercas' : 'Fences',
              light: isSpanish ? 'Luces' : 'Lights',
            }[category] ?? category);
            return <div className="mt-3 flex flex-wrap gap-1.5">
              {['all', ...options].map(category => <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full border px-2.5 py-1 text-[10px] transition ${categoryFilter === category ? 'border-amber-500/60 bg-amber-500/15 text-amber-200' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}
              >{labelFor(category)}</button>)}
            </div>;
          })()}
        </div>

        <div className="overflow-y-auto p-4">
          {section === 'storage' ? (
            filteredStorageItems.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredStorageItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelectStorageItem(item)}
                    className={`group flex min-h-40 flex-col rounded-xl border p-3 text-left transition ${selectedStorageItemId === item.id ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-800 bg-[#1b1c22] hover:border-zinc-600 hover:bg-zinc-800/60'}`}
                    title={`${isSpanish ? item.nameEs : item.nameEn}: ${item.width}×${item.height} ${isSpanish ? 'tiles' : 'tiles'}`}
                  >
                    <div className="relative mb-2 flex h-20 w-full items-center justify-center rounded-lg border border-zinc-800 bg-[#111216] p-2">
                      <span data-image-fallback className="absolute hidden h-10 w-10 rounded border border-white/10" style={{ backgroundColor: item.color ?? '#64748b' }} />
                      {item.spriteId && gameSprites[item.spriteId]
                        ? <GameSpriteThumbnail sprite={gameSprites[item.spriteId]} label={isSpanish ? item.nameEs : item.nameEn} fallbackColor={item.color} />
                        : item.imageUrl
                          ? <img src={item.imageUrl} alt={isSpanish ? item.nameEs : item.nameEn} loading="lazy" className="relative h-16 w-16 object-contain [image-rendering:pixelated]" onError={event => {
                              event.currentTarget.style.display = 'none';
                              (event.currentTarget.parentElement?.querySelector('[data-image-fallback]') as HTMLElement | null)?.classList.remove('hidden');
                            }} />
                          : <span className="h-10 w-10 rounded border border-white/10" style={{ backgroundColor: item.color ?? '#64748b' }} />}
                    </div>
                    <span className="line-clamp-2 text-xs font-semibold">{isSpanish ? item.nameEs : item.nameEn}</span>
                    <span className="mt-1 line-clamp-1 text-[10px] text-zinc-500">{isSpanish ? item.nameEn : item.nameEs}</span>
                    <span className="mt-auto flex items-center justify-between pt-2 text-[10px]">
                      <span className="rounded bg-zinc-800 px-1.5 py-1 font-mono text-amber-200">{item.width}×{item.height} {isSpanish ? 'tiles' : 'tiles'}</span>
                      {item.estimatedSize && <span className="text-amber-300">{isSpanish ? 'Tamaño estimado' : 'Estimated size'}</span>}
                    </span>
                  </button>
                ))}
              </div>
            ) : <p className="py-10 text-center text-sm text-zinc-500">{isSpanish ? 'No se encontraron objetos.' : 'No items found.'}</p>
          ) : <>
          {(!query.trim() || 'door puerta'.includes(query.trim().toLocaleLowerCase())) && (
            <button
              onClick={() => select(DOOR_COLOR.id)}
              className={`mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left ${activeColor.id === DOOR_COLOR.id ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-800 bg-[#1b1c22] hover:border-zinc-600'}`}
            >
              <span className="h-8 w-8 rounded border border-zinc-600 bg-[#15161b] p-3"><span className="block h-1 w-full bg-zinc-300" /></span>
              <span><span className="block text-sm font-semibold">{isSpanish ? 'Puerta' : 'Door'}</span><span className="block text-[11px] text-zinc-500">{isSpanish ? 'Marcador especial' : 'Special marker'}</span></span>
            </button>
          )}
          {filteredBlocks.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredBlocks.map(block => {
                const wallId = `block-${block.id}-wall`;
                const groundId = `block-${block.id}-ground`;
                const wall = BLOCK_PALETTE.find(color => color.id === wallId);
                const ground = BLOCK_PALETTE.find(color => color.id === groundId);
                const samples = [
                  ...(block.swatch ? [{
                    color: BLOCK_PALETTE.find(color => color.id === `color-${block.id}`)!,
                    label: block.category === 'wall'
                      ? (isSpanish ? 'Pared' : 'Wall')
                      : block.category === 'floor'
                        ? (isSpanish ? 'Suelo / alfombra' : 'Floor / rug')
                        : block.category === 'bridge'
                          ? (isSpanish ? 'Puente' : 'Bridge')
                          : block.category === 'fence'
                            ? (isSpanish ? 'Cerca' : 'Fence')
                            : (isSpanish ? 'Riel' : 'Rail'),
                  }] : []),
                  ...(wall ? [{ color: wall, label: isSpanish ? 'Pared' : 'Wall' }] : []),
                  ...(ground ? [{ color: ground, label: isSpanish ? 'Suelo' : 'Ground' }] : []),
                ];
                return (
                  <section key={block.id} className="rounded-xl border border-zinc-800 bg-[#1b1c22] p-3">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold">{isSpanish ? block.nameEs : block.nameEn}</h3>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{isSpanish ? block.nameEn : block.nameEs}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {samples.map(sample => {
                        const selected = activeColor.id === sample.color.id;
                        return (
                          <button
                            key={sample.color.id}
                            onClick={() => select(sample.color.id)}
                            className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition ${selected ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/70'}`}
                            title={`${sample.label}: ${sample.color.hex}`}
                          >
                            <span className="h-8 w-8 shrink-0 rounded-md border border-white/10 shadow-inner" style={{ backgroundColor: sample.color.hex }} />
                            <span className="min-w-0">
                              <span className="block text-[11px] text-zinc-400">{sample.label}</span>
                              <span className="block font-mono text-xs font-medium">{sample.color.hex}</span>
                              {sample.color.estimated && <span className="block text-[9px] text-amber-300">{isSpanish ? 'Estimado' : 'Estimated'}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">{isSpanish ? 'No se encontraron bloques.' : 'No blocks found.'}</p>
          )}
          </>}
        </div>
        <div className="border-t border-zinc-800 px-5 py-3 text-[11px] text-zinc-500">
          {section === 'storage'
            ? (isSpanish ? 'El tamaño indica las casillas ocupadas; “estimado” marca medidas aún no verificadas pieza por pieza.' : 'Footprints show occupied tiles; “estimated” marks sizes not yet verified item by item.')
            : (isSpanish ? 'Los colores marcados como estimados no aparecen en la tabla de colores de la wiki.' : 'Colors marked estimated are missing from the wiki color table.')}
        </div>
      </div>
    </div>
  );
};
