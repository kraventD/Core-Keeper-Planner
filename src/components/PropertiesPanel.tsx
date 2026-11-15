import React from 'react';
import { PaletteColor, SelectionBox, Language, StorageItemPlacement } from '../types/blueprint';
import { Translations } from '../i18n/translations';
import { StorageItemDefinition } from '../utils/storageCatalog';
import { GameSpriteEntry } from '../utils/gameSpriteCatalog';
import { GameSpriteThumbnail } from './GameSpriteThumbnail';
import { getPaletteColorLabel } from '../utils/palette';
import {
  Palette,
  Eye,
  Sliders,
  Copy,
  Scissors,
  ClipboardPaste,
  Layers,
  Sparkles,
  FlipHorizontal,
  FlipVertical,
  Split,
  Trash2,
  RotateCw,
} from 'lucide-react';

interface PropertiesPanelProps {
  gridWidth: number;
  gridHeight: number;
  zoom: number;
  showGrid: boolean;
  onToggleGrid: () => void;
  showLightRanges: boolean;
  onToggleLightRanges: () => void;
  showMajorGrid: boolean;
  onToggleMajorGrid: () => void;
  gridLineWidth: number;
  onChangeGridLineWidth: (width: number) => void;
  highContrastGrid: boolean;
  onToggleHighContrastGrid: () => void;
  gridTheme: 'light' | 'dark';
  onChangeGridTheme: (theme: 'light' | 'dark') => void;
  activeColor: PaletteColor;
  selectedStorageItem?: StorageItemDefinition | null;
  gameSprites?: Record<string, GameSpriteEntry>;
  selectedStoragePlacement?: StorageItemPlacement | null;
  selectedPlacedStorageItem?: StorageItemDefinition | null;
  onDeleteStoragePlacement?: () => void;
  onRotateStoragePlacement?: () => void;
  onChangeLightRadius?: (radius: number) => void;
  onOpenBlockPalette: () => void;
  selectionBox: SelectionBox | null;
  hasClipboard: boolean;
  onCopySelection: () => void;
  onCutSelection: () => void;
  onPasteSelection: () => void;
  onDeleteSelection: () => void;
  onFillSelection: () => void;
  onClearSelection: () => void;
  onDuplicateMirrorSelection?: (axis: 'horizontal' | 'vertical') => void;
  onFlipSelection?: (direction: 'horizontal' | 'vertical') => void;
  onCenterSelectionHorizontally?: () => void;
  onCenterSelectionVertically?: () => void;
  onCenterSelectionBoth?: () => void;
  cellColorCounts: Record<string, number>;
  onOpenSettings: () => void;
  language: Language;
  t: Translations;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  gridWidth,
  gridHeight,
  zoom,
  showGrid,
  onToggleGrid,
  showLightRanges,
  onToggleLightRanges,
  showMajorGrid,
  onToggleMajorGrid,
  gridLineWidth,
  onChangeGridLineWidth,
  highContrastGrid,
  onToggleHighContrastGrid,
  gridTheme,
  onChangeGridTheme,
  activeColor,
  selectedStorageItem,
  gameSprites = {},
  selectedStoragePlacement,
  selectedPlacedStorageItem,
  onDeleteStoragePlacement,
  onRotateStoragePlacement,
  onChangeLightRadius,
  onOpenBlockPalette,
  selectionBox,
  hasClipboard,
  onCopySelection,
  onCutSelection,
  onPasteSelection,
  onDeleteSelection,
  onFillSelection,
  onClearSelection,
  onDuplicateMirrorSelection,
  onFlipSelection,
  onCenterSelectionHorizontally,
  onCenterSelectionVertically,
  onCenterSelectionBoth,
  cellColorCounts,
  onOpenSettings,
  language,
  t,
}) => {
  // Selection metrics
  const selWidth = selectionBox ? selectionBox.maxX - selectionBox.minX + 1 : 0;
  const selHeight = selectionBox ? selectionBox.maxY - selectionBox.minY + 1 : 0;
  const selTotalCells = selWidth * selHeight;

  const totalOccupiedCells = Object.values(cellColorCounts).reduce((a, b) => a + b, 0);

  return (
    <aside
      className="w-72 bg-[#14151a] border-l border-zinc-800/90 flex flex-col justify-between overflow-y-auto select-none shrink-0 z-20"
      aria-label={t.propertiesPanelAria}
    >
      <div className="p-3.5 space-y-4 text-zinc-200">
        {/* Section 1: Dimensions & View Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              {t.dimensions}
            </span>
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
            >
              {t.change}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#18191f] p-2.5 rounded-lg border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">{t.width}</span>
              <span className="font-mono font-semibold text-zinc-100">{gridWidth} {t.cells}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">{t.height}</span>
              <span className="font-mono font-semibold text-zinc-100">{gridHeight} {t.cells}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span>{t.zoom}: <span className="font-mono text-zinc-200 font-medium">{Math.round(zoom * 100)}%</span></span>
              <span>Total: <span className="font-mono text-zinc-200 font-medium">{gridWidth * gridHeight}</span></span>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className="space-y-1.5 bg-[#18191f] p-2.5 rounded-lg border border-zinc-800 text-xs">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 mb-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-sky-400" />
            {t.viewOptions}
          </div>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className="text-zinc-300 text-[11px]">{t.showGrid}</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={onToggleGrid}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className="text-zinc-300 text-[11px]">{language === 'es' ? 'Cobertura de luces (aprox.)' : 'Light coverage (approx.)'}</span>
            <input type="checkbox" checked={showLightRanges} onChange={onToggleLightRanges} className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0" />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className="text-zinc-300 text-[11px]">{t.showMajorGrid}</span>
            <input
              type="checkbox"
              checked={showMajorGrid}
              onChange={onToggleMajorGrid}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5 pt-1 border-t border-zinc-800/60">
            <span className="text-zinc-200 text-[11px] font-medium">{t.blockDivisionContrast}</span>
            <input
              type="checkbox"
              checked={highContrastGrid}
              onChange={onToggleHighContrastGrid}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
          </label>

          {/* Line thickness selector */}
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 block mb-1 font-medium">{t.gridThickness}</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: '1px', value: 1.0, title: t.gridThicknessThin },
                { label: '1.5px', value: 1.5, title: t.gridThicknessMedium },
                { label: '2.5px', value: 2.5, title: t.gridThicknessThick },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => onChangeGridLineWidth(opt.value)}
                  title={opt.title}
                  className={`py-1 rounded text-center text-[10px] font-mono font-medium transition ${
                    gridLineWidth === opt.value
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'bg-[#121316] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Background Theme: White vs Dark */}
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 block mb-1 font-medium">{t.gridBackground}</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeGridTheme('light')}
                className={`py-1.5 px-2 rounded text-center text-[11px] font-medium flex items-center justify-center gap-1.5 transition ${
                  gridTheme === 'light'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-[#121316] text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400 shadow-sm inline-block" />
                <span className="truncate">{t.gridBgLight}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeGridTheme('dark')}
                className={`py-1.5 px-2 rounded text-center text-[11px] font-medium flex items-center justify-center gap-1.5 transition ${
                  gridTheme === 'dark'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-[#121316] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 inline-block" />
                <span className="truncate">{t.gridBgDark}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Selection Info & Operations */}
        <div className="bg-[#18191f] p-2.5 rounded-lg border border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {t.selection}
            </span>
            {selectionBox && (
              <button
                onClick={onClearSelection}
                className="text-[10px] text-zinc-400 hover:text-zinc-200"
              >
                {t.clearSelection}
              </button>
            )}
          </div>

          {selectionBox ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#121316] rounded border border-zinc-800/80 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 text-[10px] block">{t.origin}:</span>
                  X:{selectionBox.minX}, Y:{selectionBox.minY}
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">{t.size}:</span>
                  {selWidth} × {selHeight} ({selTotalCells})
                </div>
              </div>

              {/* Selection action buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={onCopySelection}
                  title={t.copyTooltip}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Copy className="w-3 h-3 text-sky-400" />
                  <span>{t.copy}</span>
                </button>
                <button
                  type="button"
                  onClick={onCutSelection}
                  title={t.cutTooltip}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Scissors className="w-3 h-3 text-amber-400" />
                  <span>{t.cut}</span>
                </button>
                <button
                  type="button"
                  onClick={onFillSelection}
                  title={t.fillSelectionTooltip}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{t.fillSelection}</span>
                </button>
                <button
                  type="button"
                  onClick={onDeleteSelection}
                  title={t.deleteTooltip}
                  className="px-2 py-1.5 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 text-red-300 flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t.delete}</span>
                </button>
              </div>

              {/* Selection Mirror & Flip Actions */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 block">
                  {t.mirror.mirrorSelectionTitle}
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDuplicateMirrorSelection?.('horizontal')}
                    title={t.mirror.mirrorSelectionOppositeH}
                    className="px-2 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-200 flex items-center justify-center gap-1 transition text-[10px] font-medium"
                  >
                    <FlipHorizontal className="w-3 h-3 text-cyan-400" />
                    <span>{t.mirror.mirrorH}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateMirrorSelection?.('vertical')}
                    title={t.mirror.mirrorSelectionOppositeV}
                    className="px-2 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-200 flex items-center justify-center gap-1 transition text-[10px] font-medium"
                  >
                    <FlipVertical className="w-3 h-3 text-cyan-400" />
                    <span>{t.mirror.mirrorV}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onFlipSelection?.('horizontal')}
                    title={t.mirror.flipSelectionH}
                    className="px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px]"
                  >
                    <Split className="w-3 h-3 text-amber-400" />
                    <span>{t.mirror.flipH}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFlipSelection?.('vertical')}
                    title={t.mirror.flipSelectionV}
                    className="px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px]"
                  >
                    <Split className="w-3 h-3 rotate-90 text-amber-400" />
                    <span>{t.mirror.flipV}</span>
                  </button>
                </div>

                {/* Centrar selección */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 block">
                    {t.mirror.centerTitle}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={onCenterSelectionHorizontally}
                      title={t.mirror.centeredH}
                      disabled={!onCenterSelectionHorizontally}
                      className={`px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px] font-medium ${!onCenterSelectionHorizontally ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-xs">↔</span>
                      <span>{t.mirror.centerH}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onCenterSelectionVertically}
                      title={t.mirror.centeredV}
                      disabled={!onCenterSelectionVertically}
                      className={`px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px] font-medium ${!onCenterSelectionVertically ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-xs">↕</span>
                      <span>{t.mirror.centerV}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onCenterSelectionBoth}
                      title={t.mirror.centeredBoth}
                      disabled={!onCenterSelectionBoth}
                      className={`px-2 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 flex items-center justify-center gap-1 transition text-[10px] font-medium ${!onCenterSelectionBoth ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-xs">⊕</span>
                      <span>{t.mirror.centerBoth}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500 italic py-1">
              {t.noSelection}
            </div>
          )}

          {hasClipboard && (
            <button
              type="button"
              onClick={onPasteSelection}
              className="w-full mt-1 px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 flex items-center justify-center gap-1.5 transition text-xs font-medium"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{t.paste} portapapeles</span>
            </button>
          )}
        </div>

        {/* Section 3: Color Palette */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              {language === 'es' ? 'Catálogo de construcción' : 'Construction catalog'}
            </span>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#18191f] p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded border border-white/10" style={{ backgroundColor: activeColor.id === 'door' ? 'transparent' : activeColor.hex }}>
                {activeColor.id === 'door' && <span className="mt-2 block h-1 w-full bg-zinc-300" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{getPaletteColorLabel(activeColor, t, language)}</div>
                <div className="font-mono text-[10px] text-zinc-500">{activeColor.id === 'door' ? (language === 'es' ? 'Marcador de puerta' : 'Door marker') : activeColor.hex}</div>
              </div>
            </div>
            {selectedStorageItem && (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-zinc-800 bg-[#111216] p-2">
                {selectedStorageItem.spriteId && gameSprites[selectedStorageItem.spriteId]
                  ? <GameSpriteThumbnail compact sprite={gameSprites[selectedStorageItem.spriteId]} label={language === 'es' ? selectedStorageItem.nameEs : selectedStorageItem.nameEn} fallbackColor={selectedStorageItem.color} />
                  : selectedStorageItem.imageUrl
                    ? <img src={selectedStorageItem.imageUrl} alt={language === 'es' ? selectedStorageItem.nameEs : selectedStorageItem.nameEn} className="h-8 w-8 object-contain [image-rendering:pixelated]" onError={event => {
                        event.currentTarget.style.display = 'none';
                        const fallback = event.currentTarget.parentElement?.querySelector('[data-selected-item-fallback]') as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }} />
                    : <span className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-zinc-800 text-xs font-bold text-amber-300" style={{ backgroundColor: selectedStorageItem.color ?? '#27272a' }}>{selectedStorageItem.nameEn.slice(0, 1)}</span>}
                {selectedStorageItem.imageUrl && <span data-selected-item-fallback className="hidden h-8 w-8 items-center justify-center rounded border border-white/10 text-xs font-bold text-amber-100" style={{ backgroundColor: selectedStorageItem.color ?? '#27272a' }}>{selectedStorageItem.nameEn.slice(0, 1)}</span>}
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium">{language === 'es' ? selectedStorageItem.nameEs : selectedStorageItem.nameEn}</div>
                  <div className="font-mono text-[10px] text-amber-300">{selectedStorageItem.width}×{selectedStorageItem.height} {language === 'es' ? 'casillas' : 'tiles'}</div>
                </div>
              </div>
            )}
            {selectedStoragePlacement && selectedPlacedStorageItem && (
              <div className="mb-2 rounded-md border border-cyan-500/40 bg-cyan-500/5 p-2">
                <div className="mb-2 flex items-center gap-2">
                  {selectedPlacedStorageItem.spriteId && gameSprites[selectedPlacedStorageItem.spriteId]
                    ? <GameSpriteThumbnail compact sprite={gameSprites[selectedPlacedStorageItem.spriteId]} label={language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn} fallbackColor={selectedPlacedStorageItem.color} />
                    : selectedPlacedStorageItem.imageUrl
                      ? <img src={selectedPlacedStorageItem.imageUrl} alt={language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn} className="h-8 w-8 object-contain [image-rendering:pixelated]" onError={event => { event.currentTarget.style.display = 'none'; }} />
                      : <span className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-zinc-800 text-xs font-bold text-cyan-300" style={{ backgroundColor: selectedPlacedStorageItem.color ?? '#27272a' }}>{selectedPlacedStorageItem.nameEn.slice(0, 1)}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">{language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn}</div>
                    <div className="font-mono text-[10px] text-cyan-300">{selectedStoragePlacement.width}×{selectedStoragePlacement.height} {language === 'es' ? 'casillas · arrastrar para mover' : 'tiles · drag to move'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={onRotateStoragePlacement} className="flex items-center justify-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[10px] text-zinc-200 hover:border-cyan-500/50 hover:text-cyan-200">
                    <RotateCw className="h-3 w-3" /> {language === 'es' ? 'Girar 90°' : 'Rotate 90°'}
                  </button>
                  <button onClick={onDeleteStoragePlacement} className="flex items-center justify-center gap-1 rounded border border-red-900/70 bg-red-950/30 px-2 py-1.5 text-[10px] text-red-300 hover:bg-red-900/40">
                    <Trash2 className="h-3 w-3" /> {language === 'es' ? 'Eliminar' : 'Delete'}
                  </button>
                </div>
                {selectedPlacedStorageItem.defaultLightRadius !== undefined && (
                  <div className="mt-2 border-t border-zinc-800 pt-2">
                    <div className="mb-1 text-[10px] text-zinc-400">{language === 'es' ? 'Cobertura orientativa' : 'Reference coverage'}</div>
                    <div className="flex items-center justify-between rounded bg-[#111216] px-2 py-1">
                      <button onClick={() => onChangeLightRadius?.(Math.max(1, (selectedStoragePlacement.lightRadius ?? selectedPlacedStorageItem.defaultLightRadius!) - 1))} className="h-6 w-7 rounded text-sm text-zinc-300 hover:bg-zinc-800" aria-label={language === 'es' ? 'Reducir alcance' : 'Reduce range'}>−</button>
                      <span className="font-mono text-[11px] text-amber-200">≈ {selectedStoragePlacement.lightRadius ?? selectedPlacedStorageItem.defaultLightRadius} {language === 'es' ? 'casillas' : 'tiles'}</span>
                      <button onClick={() => onChangeLightRadius?.(Math.min(12, (selectedStoragePlacement.lightRadius ?? selectedPlacedStorageItem.defaultLightRadius!) + 1))} className="h-6 w-7 rounded text-sm text-zinc-300 hover:bg-zinc-800" aria-label={language === 'es' ? 'Aumentar alcance' : 'Increase range'}>+</button>
                    </div>
                    <p className="mt-1 text-[9px] leading-relaxed text-zinc-500">{language === 'es' ? 'Guía visual: el juego usa iluminación direccional y no tiene un radio exacto fijo.' : 'Visual guide: the game uses directional lighting and has no exact fixed radius.'}</p>
                  </div>
                )}
              </div>
            )}
            <button onClick={onOpenBlockPalette} className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20">
              {language === 'es' ? 'Buscar piezas de construcción' : 'Browse construction pieces'}
            </button>
          </div>
        </div>

        {/* Section 4: Live Blueprint Legend & Statistics */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {t.legend}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {totalOccupiedCells} / {gridWidth * gridHeight}
            </span>
          </div>

          <div className="p-2.5 bg-[#18191f] rounded-lg border border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>{t.totalOccupied}:</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {totalOccupiedCells} {t.cells} ({Math.round((totalOccupiedCells / (gridWidth * gridHeight)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>{t.emptyCells}:</span>
              <span className="font-mono text-zinc-400">
                {gridWidth * gridHeight - totalOccupiedCells} {t.cells}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
