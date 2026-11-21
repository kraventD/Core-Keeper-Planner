import React from 'react';
import { SelectionBox, Language, StorageItemPlacement, StorageItemRotation, PlannerLayerId, PlannerLayerStates, SelectionTransformPreview } from '../types/blueprint';
import { Translations } from '../i18n/translations';
import { StorageItemDefinition } from '../utils/storageCatalog';
import { GameSpriteEntry } from '../utils/gameSpriteCatalog';
import { GameSpriteThumbnail } from './GameSpriteThumbnail';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface PropertiesPanelProps {
  gridWidth: number;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  gridHeight: number;
  zoom: number;
  showGrid: boolean;
  onToggleGrid: () => void;
  showLightRanges: boolean;
  onToggleLightRanges: () => void;
  showMajorGrid: boolean;
  onToggleMajorGrid: () => void;
  showCenterGuide: boolean;
  onToggleCenterGuide: () => void;
  gridLineWidth: number;
  onChangeGridLineWidth: (width: number) => void;
  highContrastGrid: boolean;
  onToggleHighContrastGrid: () => void;
  plannerLayerStates: PlannerLayerStates;
  onToggleLayerVisibility: (layer: PlannerLayerId) => void;
  onToggleLayerLock: (layer: PlannerLayerId) => void;
  gameSprites?: Record<string, GameSpriteEntry>;
  selectedStoragePlacement?: StorageItemPlacement | null;
  selectedPlacedStorageItem?: StorageItemDefinition | null;
  onDeleteStoragePlacement?: () => void;
  onRotateStoragePlacement?: (rotation: StorageItemRotation) => void;
  onChangeLightRadius?: (radius: number) => void;
  selectionBox: SelectionBox | null;
  selectionObjectCount: number;
  selectionObjectRotation: StorageItemRotation | null;
  onRotateSelectionObjects: (rotation: StorageItemRotation) => void;
  hasClipboard: boolean;
  isPastePlacementMode: boolean;
  onCopySelection: () => void;
  onCutSelection: () => void;
  onPasteSelection: () => void;
  onDeleteSelection: () => void;
  onFillSelection: () => void;
  onClearSelection: () => void;
  onDuplicateMirrorSelection?: (axis: 'horizontal' | 'vertical') => void;
  onPreviewSelectionTransform?: (preview: SelectionTransformPreview | null) => void;
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
  isInspectorOpen,
  onToggleInspector,
  gridHeight,
  zoom,
  showGrid,
  onToggleGrid,
  showLightRanges,
  onToggleLightRanges,
  showMajorGrid,
  onToggleMajorGrid,
  showCenterGuide,
  onToggleCenterGuide,
  gridLineWidth,
  onChangeGridLineWidth,
  highContrastGrid,
  onToggleHighContrastGrid,
  plannerLayerStates,
  onToggleLayerVisibility,
  onToggleLayerLock,
  gameSprites = {},
  selectedStoragePlacement,
  selectedPlacedStorageItem,
  onDeleteStoragePlacement,
  onRotateStoragePlacement,
  onChangeLightRadius,
  selectionBox,
  selectionObjectCount,
  selectionObjectRotation,
  onRotateSelectionObjects,
  hasClipboard,
  isPastePlacementMode,
  onCopySelection,
  onCutSelection,
  onPasteSelection,
  onDeleteSelection,
  onFillSelection,
  onClearSelection,
  onDuplicateMirrorSelection,
  onPreviewSelectionTransform,
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

  if (!isInspectorOpen) {
    return <aside className="z-20 flex w-10 shrink-0 flex-col items-center border-l border-[#24334b] bg-[#0b1423] py-2">
      <button type="button" onClick={onToggleInspector} title={language === 'es' ? 'Mostrar inspector' : 'Show inspector'} className="rounded-lg p-2 text-zinc-400 hover:bg-[#15233a] hover:text-cyan-200"><ChevronLeft className="h-4 w-4" /></button>
    </aside>;
  }

  return (
    <aside
      className="z-20 flex w-[276px] shrink-0 flex-col border-l border-[#24334b] bg-[#0b1423] select-none xl:w-[304px]"
      aria-label={t.propertiesPanelAria}
    >
      <div className="flex items-center justify-between border-b border-[#24334b] px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-200"><SlidersHorizontal className="h-3.5 w-3.5 text-cyan-300" />{language === 'es' ? 'Inspector' : 'Inspector'}</span>
        <button type="button" onClick={onToggleInspector} title={language === 'es' ? 'Ocultar inspector' : 'Hide inspector'} className="rounded-md p-1.5 text-zinc-400 hover:bg-[#15233a] hover:text-cyan-200"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 text-zinc-200">
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

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#24334b] bg-[#101a2b] p-2.5 text-xs">
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
        <details className="rounded-xl border border-[#24334b] bg-[#0e192a] text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 [&::-webkit-details-marker]:hidden">
            <Eye className="w-3 h-3 text-sky-400" />
            {t.viewOptions}
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500 transition group-open:rotate-90" />
          </summary>
          <div className="space-y-1.5 px-2.5 pb-2.5">

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
            <span className="text-zinc-300 text-[11px]">{t.showCenterGuide}</span>
            <input
              type="checkbox"
              checked={showCenterGuide}
              onChange={onToggleCenterGuide}
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

          </div>
        </details>

        <details open className="group rounded-xl border border-[#24334b] bg-[#0e192a] text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 [&::-webkit-details-marker]:hidden">
            <Layers className="w-3 h-3 text-cyan-400" />
            {language === 'es' ? 'Capas' : 'Layers'}
            <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-500 transition group-open:rotate-90" />
          </summary>
          <div className="space-y-1.5 px-2.5 pb-2.5">
          {([
            ['floors', language === 'es' ? 'Suelos' : 'Floors'],
            ['walls', language === 'es' ? 'Paredes y bloques' : 'Walls & blocks'],
            ['objects', language === 'es' ? 'Objetos' : 'Objects'],
            ['wallDecorations', language === 'es' ? 'Decoraciones de pared' : 'Wall decorations'],
          ] as [PlannerLayerId, string][]).map(([layer, label]) => (
            <div key={layer} className="flex items-center justify-between gap-2 py-0.5">
              <span className={`text-[11px] ${plannerLayerStates[layer].visible ? 'text-zinc-300' : 'text-zinc-500'}`}>{label}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onToggleLayerVisibility(layer)}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100"
                  title={plannerLayerStates[layer].visible ? (language === 'es' ? 'Ocultar capa' : 'Hide layer') : (language === 'es' ? 'Mostrar capa' : 'Show layer')}
                  aria-label={`${plannerLayerStates[layer].visible ? (language === 'es' ? 'Ocultar' : 'Hide') : (language === 'es' ? 'Mostrar' : 'Show')} ${label}`}>
                  {plannerLayerStates[layer].visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button type="button" onClick={() => onToggleLayerLock(layer)}
                  className={`p-1 rounded hover:bg-zinc-700 ${plannerLayerStates[layer].locked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-100'}`}
                  title={plannerLayerStates[layer].locked ? (language === 'es' ? 'Desbloquear capa' : 'Unlock layer') : (language === 'es' ? 'Bloquear capa' : 'Lock layer')}
                  aria-label={`${plannerLayerStates[layer].locked ? (language === 'es' ? 'Desbloquear' : 'Unlock') : (language === 'es' ? 'Bloquear' : 'Lock')} ${label}`}>
                  {plannerLayerStates[layer].locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
          </div>
        </details>

        {/* Section 2: Selection Info & Operations */}
        <details open={Boolean(selectionBox || selectedStoragePlacement)} className="group rounded-xl border border-[#24334b] bg-[#0e192a] text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 [&::-webkit-details-marker]:hidden">
            <Layers className="h-3.5 w-3.5 text-cyan-300" />{t.selection}
            {selectionBox && <button type="button" onClick={event => { event.preventDefault(); event.stopPropagation(); onClearSelection(); }} className="ml-auto text-[10px] font-normal normal-case text-zinc-500 hover:text-zinc-200">{t.clearSelection}</button>}
            <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-500 transition group-open:rotate-90" />
          </summary>

          {selectionBox ? (
            <div className="space-y-2 px-2.5 pb-2.5">
              <div className="rounded-md border border-cyan-900/50 bg-cyan-950/20 px-2 py-1.5 text-[10px] text-cyan-200">
                {selectionBox.scope === 'floors'
                  ? (language === 'es' ? 'Contenido seleccionado: solo suelos' : 'Selected contents: floors only')
                  : selectionBox.scope === 'objects'
                    ? (language === 'es' ? 'Contenido seleccionado: solo objetos' : 'Selected contents: objects only')
                    : (language === 'es' ? 'Contenido seleccionado: todo' : 'Selected contents: all')}
              </div>
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

              {selectionObjectCount > 0 && selectionBox.scope !== 'floors' && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/15 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-cyan-200">
                      {language === 'es' ? 'Orientación de los objetos seleccionados' : 'Selected object orientation'}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-cyan-300/70">{selectionObjectCount}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 rounded border border-zinc-800 bg-[#111216] p-1">
                    {([
                      { rotation: 0, arrow: '↑' },
                      { rotation: 90, arrow: '→' },
                      { rotation: 180, arrow: '↓' },
                      { rotation: 270, arrow: '←' },
                    ] as const).map(option => (
                      <button
                        key={option.rotation}
                        type="button"
                        onClick={() => onRotateSelectionObjects(option.rotation)}
                        aria-label={t.objectRotation.direction(option.rotation)}
                        aria-pressed={selectionObjectRotation === option.rotation}
                        title={`${t.objectRotation.direction(option.rotation)} · ${option.rotation}°`}
                        className={`rounded py-1 text-sm font-semibold transition ${selectionObjectRotation === option.rotation ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
                      >
                        {option.arrow}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[9px] leading-relaxed text-zinc-500">
                    {language === 'es' ? 'Aplica la dirección elegida a todos los objetos dentro de la selección.' : 'Apply the chosen direction to every object inside the selection.'}
                  </p>
                </div>
              )}

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
                {selectionBox.scope !== 'objects' && (
                  <button
                    type="button"
                    onClick={onFillSelection}
                    title={t.fillSelectionTooltip}
                    className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition text-[11px]"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{t.fillSelection}</span>
                  </button>
                )}
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
                    onMouseEnter={() => onPreviewSelectionTransform?.({ operation: 'mirror', axis: 'horizontal' })}
                    onMouseLeave={() => onPreviewSelectionTransform?.(null)}
                    title={t.mirror.mirrorSelectionOppositeH}
                    className="px-2 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-200 flex items-center justify-center gap-1 transition text-[10px] font-medium"
                  >
                    <FlipHorizontal className="w-3 h-3 text-cyan-400" />
                    <span>{t.mirror.mirrorH}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateMirrorSelection?.('vertical')}
                    onMouseEnter={() => onPreviewSelectionTransform?.({ operation: 'mirror', axis: 'vertical' })}
                    onMouseLeave={() => onPreviewSelectionTransform?.(null)}
                    title={t.mirror.mirrorSelectionOppositeV}
                    className="px-2 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-200 flex items-center justify-center gap-1 transition text-[10px] font-medium"
                  >
                    <FlipVertical className="w-3 h-3 text-cyan-400" />
                    <span>{t.mirror.mirrorV}</span>
                  </button>
                </div>
                <p className="px-0.5 text-[9px] leading-relaxed text-zinc-500">
                  {language === 'es'
                    ? 'Pasa el cursor por copiar o voltear para previsualizar; haz clic para aplicar.'
                    : 'Hover over copy or flip to preview; click to apply.'}
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onFlipSelection?.('horizontal')}
                    onMouseEnter={() => onPreviewSelectionTransform?.({ operation: 'flip', axis: 'horizontal' })}
                    onMouseLeave={() => onPreviewSelectionTransform?.(null)}
                    title={t.mirror.flipSelectionH}
                    className="px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px]"
                  >
                    <Split className="w-3 h-3 text-amber-400" />
                    <span>{t.mirror.flipH}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFlipSelection?.('vertical')}
                    onMouseEnter={() => onPreviewSelectionTransform?.({ operation: 'flip', axis: 'vertical' })}
                    onMouseLeave={() => onPreviewSelectionTransform?.(null)}
                    title={t.mirror.flipSelectionV}
                    className="px-2 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition text-[10px]"
                  >
                    <Split className="w-3 h-3 rotate-90 text-amber-400" />
                    <span>{t.mirror.flipV}</span>
                  </button>
                </div>
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
          ) : (
            <div className="px-2.5 pb-2.5 text-[11px] italic text-zinc-500">
              {t.noSelection}
            </div>
          )}

          {hasClipboard && (
            <button
              type="button"
              onClick={onPasteSelection}
              aria-pressed={isPastePlacementMode}
              className={`w-full mt-1 px-2.5 py-1.5 rounded border flex items-center justify-center gap-1.5 transition text-xs font-medium ${isPastePlacementMode ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200' : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'}`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{isPastePlacementMode ? (language === 'es' ? 'Haz clic en el plano para pegar · Esc cancela' : 'Click on the blueprint to paste · Esc cancels') : `${t.paste} portapapeles`}</span>
            </button>
          )}
        </details>

        {/* Details for an object selected on the blueprint */}
        {selectedStoragePlacement && selectedPlacedStorageItem && (
          <div className="rounded-xl border border-[#24334b] bg-[#0e192a] p-2.5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
              <Layers className="h-3.5 w-3.5" />{language === 'es' ? 'Seleccionado en el plano' : 'Selected on blueprint'}
            </div>
            <div className="mb-2 rounded-md border border-cyan-500/40 bg-cyan-500/5 p-2">
                <div className="mb-2 flex items-center gap-2">
                  {selectedPlacedStorageItem.spriteId && gameSprites[selectedPlacedStorageItem.spriteId]
                    ? <GameSpriteThumbnail compact sprite={gameSprites[selectedPlacedStorageItem.spriteId]} label={language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn} fallbackColor={selectedPlacedStorageItem.color} />
                    : selectedPlacedStorageItem.imageUrl
                      ? <img src={selectedPlacedStorageItem.imageUrl} alt={language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn} className="h-8 w-8 object-contain [image-rendering:pixelated]" onError={event => { event.currentTarget.style.display = 'none'; }} />
                      : <span className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-zinc-800 text-xs font-bold text-cyan-300" style={{ backgroundColor: selectedPlacedStorageItem.color ?? '#27272a' }}>{selectedPlacedStorageItem.nameEn.slice(0, 1)}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">{language === 'es' ? selectedPlacedStorageItem.nameEs : selectedPlacedStorageItem.nameEn}</div>
                    <div className="font-mono text-[10px] text-cyan-300">{selectedStoragePlacement.width}×{selectedStoragePlacement.height} {language === 'es' ? 'casillas · clic para mover' : 'tiles · click to move'}</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-zinc-400">{t.objectRotation.title}</div>
                  <div className="grid grid-cols-4 gap-1 rounded border border-zinc-800 bg-[#111216] p-1">
                    {([
                      { rotation: 0, arrow: '↑' },
                      { rotation: 90, arrow: '→' },
                      { rotation: 180, arrow: '↓' },
                      { rotation: 270, arrow: '←' },
                    ] as const).map(option => (
                      <button
                        key={option.rotation}
                        type="button"
                        onClick={() => onRotateStoragePlacement?.(option.rotation)}
                        aria-label={t.objectRotation.direction(option.rotation)}
                        aria-pressed={(selectedStoragePlacement.rotation ?? 0) === option.rotation}
                        title={`${t.objectRotation.direction(option.rotation)} · ${option.rotation}°`}
                        className={`rounded py-1 text-sm font-semibold transition ${(selectedStoragePlacement.rotation ?? 0) === option.rotation ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
                      >
                        {option.arrow}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-[9px] text-zinc-500">{t.objectRotation.shortcutsHint}</div>
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1.5">
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
          </div>
        )}

        {/* Section 4: Live Blueprint Legend & Statistics */}
        <details className="group rounded-xl border border-[#24334b] bg-[#0e192a] text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 [&::-webkit-details-marker]:hidden">
            {t.legend}<span className="ml-auto font-mono text-[10px] font-normal text-zinc-500">{totalOccupiedCells} / {gridWidth * gridHeight}</span><ChevronRight className="h-3.5 w-3.5 text-zinc-500 transition group-open:rotate-90" />
          </summary>
          <div className="space-y-1.5 px-2.5 pb-2.5">
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
        </details>
      </div>
    </aside>
  );
};
