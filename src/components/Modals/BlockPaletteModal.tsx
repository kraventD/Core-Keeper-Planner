import React, { useMemo, useState } from 'react';
import { Search, X, Star, SlidersHorizontal } from 'lucide-react';
import { BLOCK_CATALOG, BLOCK_PALETTE } from '../../utils/blockCatalog';
import { Language, PaletteColor } from '../../types/blueprint';
import { FUNCTIONAL_ITEMS, STORAGE_ITEMS, STRUCTURE_ITEMS, StorageItemDefinition } from '../../utils/storageCatalog';
import { GameSpriteEntry } from '../../utils/gameSpriteCatalog';
import { GameSpriteThumbnail } from '../GameSpriteThumbnail';
import { ALL_FLOOR_ITEMS } from '../../utils/floorCatalog';
import { getStorageItemLayerId } from '../../utils/plannerLayers';

const PLACEABLE_ITEMS = [
  ...STORAGE_ITEMS.filter(item => item.category !== 'nature'),
  ...FUNCTIONAL_ITEMS.filter(item => item.category !== 'nature'),
  ...STRUCTURE_ITEMS.filter(item => item.category === 'light' || item.category === 'wall_decoration' || item.category === 'door'),
];

const STORAGE_CATEGORY_ORDER = [
  'chest', 'table', 'pedestal', 'pet', 'bed', 'chair', 'terrarium', 'aquarium', 'other',
  'station', 'mechanism', 'door', 'gate', 'wall', 'wall_decoration', 'floor', 'bridge', 'rail', 'fence', 'light',
];

interface BlockPaletteModalProps {
  isOpen: boolean;
  docked?: boolean;
  onClose: () => void;
  onSelectColor: (color: PaletteColor) => void;
  activeColor: PaletteColor;
  language: Language;
  selectedStorageItemId: string | null;
  onSelectStorageItem: (item: StorageItemDefinition) => void;
  selectedFloorItemId?: string | null;
  onSelectFloorItem?: (item: StorageItemDefinition) => void;
  gameSprites?: Record<string, GameSpriteEntry>;
}

export const BlockPaletteModal: React.FC<BlockPaletteModalProps> = ({
  isOpen,
  docked = false,
  onClose,
  onSelectColor,
  activeColor,
  language,
  selectedStorageItemId,
  onSelectStorageItem,
  selectedFloorItemId = null,
  onSelectFloorItem,
  gameSprites = {},
}) => {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'blocks' | 'floors' | 'storage' | 'nature'>('blocks');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [layerFilter, setLayerFilter] = useState('all');
  const [floorTypeFilter, setFloorTypeFilter] = useState('all');
  const [natureTypeFilter, setNatureTypeFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ck_catalog_favorites');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch { return []; }
  });
  const isSpanish = language === 'es';
  const toggleFavorite = (id: string) => setFavorites(previous => {
    const next = previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id];
    try { localStorage.setItem('ck_catalog_favorites', JSON.stringify(next)); } catch { /* Favorites still work for this session. */ }
    return next;
  });
  const hasFavorite = (id: string) => favorites.includes(id);
  const resetFilters = () => { setQuery(''); setCategoryFilter('all'); setSizeFilter('all'); setLayerFilter('all'); setFloorTypeFilter('all'); setNatureTypeFilter('all'); setFavoritesOnly(false); };
  const filteredBlocks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return BLOCK_CATALOG.filter(block =>
      (!favoritesOnly || hasFavorite(`block:${block.id}`)) &&
      (!normalizedQuery || `${block.nameEn} ${block.nameEs}`.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [favorites, favoritesOnly, query]);
  const filteredStorageItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return PLACEABLE_ITEMS.filter(item =>
      (categoryFilter === 'all' || item.category === categoryFilter) &&
      (sizeFilter === 'all' || `${item.width}x${item.height}` === sizeFilter) &&
      (layerFilter === 'all' || getStorageItemLayerId(item, item.layer) === layerFilter) &&
      (!favoritesOnly || hasFavorite(`item:${item.id}`)) &&
      (!normalizedQuery || `${item.nameEn} ${item.nameEs} ${item.width}x${item.height} ${item.width}×${item.height}`.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [categoryFilter, favorites, favoritesOnly, layerFilter, query, sizeFilter]);
  const filteredNatureItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return [...STORAGE_ITEMS, ...FUNCTIONAL_ITEMS, ...STRUCTURE_ITEMS].filter(item => item.category === 'nature' &&
      (natureTypeFilter === 'all' || (natureTypeFilter === 'crops' ? item.id.startsWith('crop-') : natureTypeFilter === 'trees' ? item.nameEn.toLocaleLowerCase().includes('tree') : !item.id.startsWith('crop-') && !item.nameEn.toLocaleLowerCase().includes('tree'))) &&
      (sizeFilter === 'all' || `${item.width}x${item.height}` === sizeFilter) &&
      (layerFilter === 'all' || getStorageItemLayerId(item, item.layer) === layerFilter) &&
      (!favoritesOnly || hasFavorite(`item:${item.id}`)) &&
      (!normalizedQuery || `${item.nameEn} ${item.nameEs} ${item.width}x${item.height} ${item.width}×${item.height}`.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [favorites, favoritesOnly, layerFilter, natureTypeFilter, query, sizeFilter]);
  const filteredFloors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ALL_FLOOR_ITEMS.filter(item =>
      (floorTypeFilter === 'all' || (floorTypeFilter === 'rugs' ? item.layer === 'object' : item.layer !== 'object')) &&
      (!favoritesOnly || hasFavorite(`item:${item.id}`)) &&
      (!normalizedQuery || `${item.nameEn} ${item.nameEs}`.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [favorites, favoritesOnly, floorTypeFilter, query]);
  const sizeOptions = useMemo(() => [...new Set([...PLACEABLE_ITEMS, ...[...STORAGE_ITEMS, ...FUNCTIONAL_ITEMS, ...STRUCTURE_ITEMS].filter(item => item.category === 'nature')].map(item => `${item.width}x${item.height}`))].sort((a, b) => {
    const [aw, ah] = a.split('x').map(Number); const [bw, bh] = b.split('x').map(Number); return aw * ah - bw * bh || aw - bw;
  }), []);
  if (!isOpen) return null;

  const select = (colorId: string) => {
    const color = BLOCK_PALETTE.find(candidate => candidate.id === colorId);
    if (color) onSelectColor(color);
    if (!docked) onClose();
  };

  return (
    <div className={docked ? 'flex h-full min-w-0 w-[300px] xl:w-[340px] shrink-0 flex-col border-r border-[#24334b] bg-[#0b1423] text-zinc-100' : 'fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm'} onMouseDown={event => !docked && event.target === event.currentTarget && onClose()}>
      <div className={docked ? 'flex min-h-0 h-full w-full flex-col overflow-hidden bg-[#0d1728]' : 'flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#0d1728] text-zinc-100 shadow-2xl'}>
        <div className="flex items-center justify-between border-b border-[#24334b] px-3 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">{isSpanish ? 'Catálogo' : 'Catalog'}</h2>
            <p className="mt-1 text-xs text-zinc-400">
              {section === 'storage'
                ? (isSpanish ? 'Muebles, estaciones e iluminación' : 'Furniture, stations and lighting')
                : section === 'nature'
                  ? (isSpanish ? 'Plantas, cultivos y árboles' : 'Plants, crops and trees')
                : section === 'floors'
                  ? (isSpanish ? 'Suelos, alfombras y tiles de terreno en una capa independiente' : 'Floors, rugs and terrain tiles on a separate layer')
                  : (isSpanish ? 'Bloques, paredes, puentes, cercas y rieles como colores' : 'Blocks, walls, bridges, fences and rails as colors')}
              <span className="ml-2 text-zinc-500">{section === 'floors' ? `${ALL_FLOOR_ITEMS.length} ${isSpanish ? 'suelos' : 'floors'}` : section === 'storage'
                ? `${PLACEABLE_ITEMS.length} ${isSpanish ? 'objetos' : 'items'}`
                : section === 'nature' ? `${[...STORAGE_ITEMS, ...FUNCTIONAL_ITEMS, ...STRUCTURE_ITEMS].filter(item => item.category === 'nature').length} ${isSpanish ? 'objetos' : 'items'}`
                : `${BLOCK_CATALOG.length} ${isSpanish ? 'bloques' : 'blocks'}`}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label={isSpanish ? 'Cerrar' : 'Close'} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-[#24334b] px-2 pt-2">
          <button onClick={() => { setSection('blocks'); setCategoryFilter('all'); }} className={`border-b-2 px-1.5 pb-2 text-left text-[10px] font-medium ${section === 'blocks' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Bloques y colores' : 'Blocks and colors'}</button>
          <button onClick={() => { setSection('floors'); setCategoryFilter('all'); }} className={`border-b-2 px-1.5 pb-2 text-left text-[10px] font-medium ${section === 'floors' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Suelos y alfombras' : 'Floors and rugs'}</button>
          <button onClick={() => { setSection('storage'); setCategoryFilter('all'); }} className={`border-b-2 px-1.5 pb-2 text-left text-[10px] font-medium ${section === 'storage' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Muebles y estaciones' : 'Furniture and stations'}</button>
          <button onClick={() => { setSection('nature'); setCategoryFilter('all'); }} className={`border-b-2 px-1.5 pb-2 text-left text-[10px] font-medium ${section === 'nature' ? 'border-amber-400 text-amber-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{isSpanish ? 'Plantas y árboles' : 'Plants and trees'}</button>
        </div>

        <div className="border-b border-[#24334b] p-3">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#0f1014] px-3 py-2.5 focus-within:border-amber-500/70">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={section === 'floors' ? (isSpanish ? 'Buscar suelos, alfombras o terrenos…' : 'Search floors, rugs or ground…') : section === 'storage'
                ? (isSpanish ? 'Buscar muebles, estaciones o luces…' : 'Search furniture, stations or lights…')
                : section === 'nature' ? (isSpanish ? 'Buscar plantas, cultivos o árboles…' : 'Search plants, crops or trees…')
                : (isSpanish ? 'Buscar bloques en español o inglés…' : 'Search blocks in English or Spanish…')}
              className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            {query && <button onClick={() => setQuery('')} className="text-xs text-zinc-400 hover:text-white">{isSpanish ? 'Limpiar' : 'Clear'}</button>}
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFavoritesOnly(value => !value)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] transition ${favoritesOnly ? 'border-amber-500/60 bg-amber-500/15 text-amber-200' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
              <Star className={`h-3 w-3 ${favoritesOnly ? 'fill-amber-300 text-amber-300' : ''}`} />
              {isSpanish ? 'Favoritos' : 'Favorites'} ({favorites.length})
            </button>
            {section === 'floors' ? (
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'base', 'rugs'] as const).map(type => <button key={type} type="button" onClick={() => setFloorTypeFilter(type)}
                  className={`rounded-full border px-2.5 py-1.5 text-[10px] transition ${floorTypeFilter === type ? 'border-amber-500/60 bg-amber-500/15 text-amber-200' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                  {type === 'all' ? (isSpanish ? 'Todos los tipos' : 'All types') : type === 'base' ? (isSpanish ? 'Suelos base' : 'Base floors') : (isSpanish ? 'Alfombras y tapetes' : 'Rugs and mats')}
                </button>)}
              </div>
            ) : null}
            {section === 'nature' ? <div className="flex flex-wrap gap-1.5">
              {(['all', 'crops', 'trees', 'plants'] as const).map(type => <button key={type} type="button" onClick={() => setNatureTypeFilter(type)}
                className={`rounded-full border px-2.5 py-1.5 text-[10px] transition ${natureTypeFilter === type ? 'border-amber-500/60 bg-amber-500/15 text-amber-200' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                {type === 'all' ? (isSpanish ? 'Todos los tipos' : 'All types') : type === 'crops' ? (isSpanish ? 'Cultivos' : 'Crops') : type === 'trees' ? (isSpanish ? 'Árboles' : 'Trees') : (isSpanish ? 'Plantas' : 'Plants')}
              </button>)}
            </div> : null}
            {section === 'storage' || section === 'nature' ? <>
              <label className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <SlidersHorizontal className="h-3 w-3" />{isSpanish ? 'Tamaño' : 'Size'}
                <select value={sizeFilter} onChange={event => setSizeFilter(event.target.value)} className="rounded border border-zinc-700 bg-[#0f1014] px-2 py-1.5 text-zinc-200 outline-none focus:border-amber-500/70">
                  <option value="all">{isSpanish ? 'Todos' : 'Any'}</option>
                  {sizeOptions.map(size => <option key={size} value={size}>{size.replace('x', '×')} {isSpanish ? 'casillas' : 'tiles'}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                {isSpanish ? 'Capa' : 'Layer'}
                <select value={layerFilter} onChange={event => setLayerFilter(event.target.value)} className="rounded border border-zinc-700 bg-[#0f1014] px-2 py-1.5 text-zinc-200 outline-none focus:border-amber-500/70">
                  <option value="all">{isSpanish ? 'Todas' : 'All'}</option>
                  <option value="floors">{isSpanish ? 'Suelos' : 'Floors'}</option>
                  <option value="walls">{isSpanish ? 'Paredes' : 'Walls'}</option>
                  <option value="objects">{isSpanish ? 'Objetos' : 'Objects'}</option>
                  <option value="wallDecorations">{isSpanish ? 'Decoración de pared' : 'Wall decorations'}</option>
                </select>
              </label>
            </> : null}
            {(query || categoryFilter !== 'all' || sizeFilter !== 'all' || layerFilter !== 'all' || floorTypeFilter !== 'all' || natureTypeFilter !== 'all' || favoritesOnly) &&
              <button type="button" onClick={resetFilters} className="text-[10px] text-zinc-500 hover:text-zinc-200">{isSpanish ? 'Restablecer filtros' : 'Reset filters'}</button>}
          </div>
          {section === 'storage' && (() => {
            const availableCategories = new Set(PLACEABLE_ITEMS.map(item => item.category));
            const options = STORAGE_CATEGORY_ORDER.filter(category => availableCategories.has(category as typeof PLACEABLE_ITEMS[number]['category']));
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
              wall_decoration: isSpanish ? 'Decoración de pared' : 'Wall decorations',
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
          {section === 'floors' ? (
            filteredFloors.length ? <div className={`grid grid-cols-2 gap-2 ${docked ? '' : 'sm:grid-cols-4'}`}>
              {filteredFloors.map(item => <div key={item.id} className={`relative rounded-xl border p-3 transition ${selectedFloorItemId === item.id || selectedStorageItemId === item.id ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-800 bg-[#1b1c22] hover:border-zinc-600'}`}>
                <button type="button" onClick={() => toggleFavorite(`item:${item.id}`)} title={hasFavorite(`item:${item.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')} aria-label={`${hasFavorite(`item:${item.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')}: ${isSpanish ? item.nameEs : item.nameEn}`} className="absolute right-2 top-2 z-10 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300">
                  <Star className={`h-4 w-4 ${hasFavorite(`item:${item.id}`) ? 'fill-amber-300 text-amber-300' : ''}`} />
                </button>
                <button type="button" onClick={() => { onSelectFloorItem?.(item); onClose(); }} className="flex min-h-32 w-full flex-col text-left">
                  <span className="mb-2 flex h-16 w-full items-center justify-center rounded border border-zinc-800 bg-[#111216]"><img src={item.imageUrl} alt={isSpanish ? item.nameEs : item.nameEn} className="h-10 w-10 object-contain [image-rendering:pixelated]" /></span>
                  <span className="text-xs font-semibold">{isSpanish ? item.nameEs : item.nameEn}</span><span className="mt-1 text-[10px] text-zinc-500">{isSpanish ? item.nameEn : item.nameEs}</span><span className="mt-auto pt-2 font-mono text-[10px] text-amber-200">1×1 tile</span>
                </button>
              </div>)}
            </div> : <p className="py-10 text-center text-sm text-zinc-500">{isSpanish ? 'No se encontraron suelos.' : 'No floors found.'}</p>
          ) : section === 'storage' || section === 'nature' ? (
            (section === 'nature' ? filteredNatureItems : filteredStorageItems).length ? (
              <div className={`grid grid-cols-2 gap-2 ${docked ? '' : 'sm:grid-cols-3'}`}>
                {(section === 'nature' ? filteredNatureItems : filteredStorageItems).map(item => (
                  <div key={item.id} className={`relative rounded-xl border p-3 transition ${selectedStorageItemId === item.id ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-800 bg-[#1b1c22] hover:border-zinc-600 hover:bg-zinc-800/60'}`}>
                    <button type="button" onClick={() => toggleFavorite(`item:${item.id}`)} title={hasFavorite(`item:${item.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')} aria-label={`${hasFavorite(`item:${item.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')}: ${isSpanish ? item.nameEs : item.nameEn}`} className="absolute right-2 top-2 z-10 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300">
                      <Star className={`h-4 w-4 ${hasFavorite(`item:${item.id}`) ? 'fill-amber-300 text-amber-300' : ''}`} />
                    </button>
                    <button type="button" onClick={() => onSelectStorageItem(item)} className="group flex min-h-40 w-full flex-col text-left" title={`${isSpanish ? item.nameEs : item.nameEn}: ${item.width}×${item.height} tiles`}>
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
                  </div>
                ))}
              </div>
            ) : <p className="py-10 text-center text-sm text-zinc-500">{isSpanish ? 'No se encontraron objetos.' : 'No items found.'}</p>
          ) : <>
          {filteredBlocks.length ? (
            <div className={`grid grid-cols-1 gap-2 ${docked ? '' : 'sm:grid-cols-2'}`}>
              {filteredBlocks.map(block => {
                const wallId = `block-${block.id}-wall`;
                const wall = BLOCK_PALETTE.find(color => color.id === wallId);
                const samples = [
                  ...(block.swatch ? [{
                    color: BLOCK_PALETTE.find(color => color.id === `color-${block.id}`)!,
                    label: block.category === 'wall'
                      ? (isSpanish ? 'Pared' : 'Wall')
                      : block.category === 'bridge'
                          ? (isSpanish ? 'Puente' : 'Bridge')
                          : block.category === 'fence'
                            ? (isSpanish ? 'Cerca' : 'Fence')
                            : (isSpanish ? 'Riel' : 'Rail'),
                  }] : []),
                  ...(wall ? [{ color: wall, label: isSpanish ? 'Pared' : 'Wall' }] : []),
                ];
                return (
                  <section key={block.id} className="rounded-xl border border-zinc-800 bg-[#1b1c22] p-3">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold">{isSpanish ? block.nameEs : block.nameEn}</h3>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{isSpanish ? block.nameEn : block.nameEs}</p>
                      </div>
                      <button type="button" onClick={() => toggleFavorite(`block:${block.id}`)} title={hasFavorite(`block:${block.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')} aria-label={`${hasFavorite(`block:${block.id}`) ? (isSpanish ? 'Quitar de favoritos' : 'Remove from favorites') : (isSpanish ? 'Añadir a favoritos' : 'Add to favorites')}: ${isSpanish ? block.nameEs : block.nameEn}`} className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300">
                        <Star className={`h-4 w-4 ${hasFavorite(`block:${block.id}`) ? 'fill-amber-300 text-amber-300' : ''}`} />
                      </button>
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
        <div className="border-t border-[#24334b] px-3 py-2.5 text-[10px] leading-relaxed text-zinc-500">
          {section === 'storage'
            ? (isSpanish ? 'El tamaño indica las casillas ocupadas; “estimado” marca medidas aún no verificadas pieza por pieza.' : 'Footprints show occupied tiles; “estimated” marks sizes not yet verified item by item.')
            : section === 'floors'
              ? (isSpanish ? 'Los suelos base comparten casilla con colores y objetos. Las alfombras y tapetes se colocan como objetos encima del suelo.' : 'Base floors share tiles with colors and objects. Rugs and mats are placed as objects over the floor.')
              : (isSpanish ? 'Los colores marcados como estimados no aparecen en la tabla de colores de la wiki.' : 'Colors marked estimated are missing from the wiki color table.')}
        </div>
      </div>
    </div>
  );
};
