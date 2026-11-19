import React, { useEffect, useState } from 'react';
import {
  ToolType,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  MirrorMode,
  DoorOrientation,
  PaletteColor,
  Language,
} from '../types/blueprint';
import { Translations } from '../i18n/translations';
import { StorageItemDefinition } from '../utils/storageCatalog';
import {
  MousePointer,
  Pencil,
  Eraser,
  Slash,
  Square,
  Circle,
  CircleDot,
  BoxSelect,
  PaintBucket,
  Move,
  Hand,
  SquareDashed,
  Maximize,
  Maximize2,
  Crosshair,
  FlipHorizontal,
  FlipVertical,
  Grid2X2,
  Sparkles,
  MessageSquare,
  PackageOpen,
  BookOpen,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface ToolBarProps {
  activeTool: ToolType;
  catalogOpen: boolean;
  onToggleCatalog: () => void;
  onSelectTool: (tool: ToolType) => void;
  rectangleMode: RectangleMode;
  onChangeRectangleMode: (mode: RectangleMode) => void;
  circleMode: ShapeMode;
  onChangeCircleMode: (mode: ShapeMode) => void;
  circleOrigin: CircleOrigin;
  onChangeCircleOrigin: (origin: CircleOrigin) => void;
  includeWaypoint?: boolean;
  onToggleIncludeWaypoint?: () => void;
  onCenterCoreOnBlueprint?: () => void;
  mirrorMode: MirrorMode;
  onChangeMirrorMode: (mode: MirrorMode) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  eraseObjectsWithEraser: boolean;
  onChangeEraseObjectsWithEraser: (enabled: boolean) => void;
  activeColor: PaletteColor;
  doorOrientation: DoorOrientation;
  onChangeDoorOrientation: (orientation: DoorOrientation) => void;
  showDoorTooltip: boolean;
  onDismissDoorTooltip: () => void;
  language: Language;
  t: Translations;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  activeTool,
  catalogOpen,
  onToggleCatalog,
  onSelectTool,
  rectangleMode,
  onChangeRectangleMode,
  circleMode,
  onChangeCircleMode,
  circleOrigin,
  onChangeCircleOrigin,
  includeWaypoint = true,
  onToggleIncludeWaypoint,
  onCenterCoreOnBlueprint,
  mirrorMode,
  onChangeMirrorMode,
  brushSize,
  onChangeBrushSize,
  eraseObjectsWithEraser,
  onChangeEraseObjectsWithEraser,
  activeColor,
  doorOrientation,
  onChangeDoorOrientation,
  showDoorTooltip,
  onDismissDoorTooltip,
  language,
  t,
}) => {
  const [toolOptionsOpen, setToolOptionsOpen] = useState(true);
  const supportsMirror = ['pencil', 'eraser', 'line', 'rectangle', 'circle'].includes(activeTool);
  const hasToolOptions = supportsMirror || activeTool === 'place_core';

  useEffect(() => {
    setToolOptionsOpen(hasToolOptions);
  }, [activeTool, hasToolOptions]);
  const tools: Array<{
    id: ToolType;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    shortcut: string;
    tooltip: string;
  }> = [
    {
      id: 'select',
      name: t.tools.select,
      icon: MousePointer,
      shortcut: 'V',
      tooltip: t.tooltips.select,
    },
    {
      id: 'pencil',
      name: t.tools.pencil,
      icon: Pencil,
      shortcut: 'P',
      tooltip: t.tooltips.pencil,
    },
    {
      id: 'eraser',
      name: t.tools.eraser,
      icon: Eraser,
      shortcut: 'E',
      tooltip: t.tooltips.eraser,
    },
    {
      id: 'line',
      name: t.tools.line,
      icon: Slash,
      shortcut: 'L',
      tooltip: t.tooltips.line,
    },
    {
      id: 'rectangle',
      name: t.tools.rectangle,
      icon: Square,
      shortcut: 'R',
      tooltip: t.tooltips.rectangle,
    },
    {
      id: 'circle',
      name: t.tools.circle,
      icon: Circle,
      shortcut: 'C',
      tooltip: t.tooltips.circle,
    },
    {
      id: 'place_core',
      name: t.tools.place_core,
      icon: Sparkles,
      shortcut: 'K',
      tooltip: t.tooltips.place_core,
    },
    {
      id: 'place_storage',
      name: language === 'es' ? 'Colocar objeto' : 'Place object',
      icon: PackageOpen,
      shortcut: '',
      tooltip: language === 'es' ? 'Coloca el objeto de almacenamiento seleccionado en el lienzo' : 'Place the selected storage item on the canvas',
    },
    {
      id: 'annotation',
      name: t.tools.annotation,
      icon: MessageSquare,
      shortcut: 'T',
      tooltip: t.tooltips.annotation,
    },
    {
      id: 'rect_select',
      name: t.tools.rect_select,
      icon: BoxSelect,
      shortcut: 'S',
      tooltip: t.tooltips.rect_select,
    },
    {
      id: 'fill',
      name: t.tools.fill,
      icon: PaintBucket,
      shortcut: 'B',
      tooltip: t.tooltips.fill,
    },
    {
      id: 'move',
      name: t.tools.move,
      icon: Move,
      shortcut: 'M',
      tooltip: t.tooltips.move,
    },
    {
      id: 'hand',
      name: t.tools.hand,
      icon: Hand,
      shortcut: 'H',
      tooltip: t.tooltips.hand,
    },
  ];

  return (
    <aside
      className="relative z-30 flex w-14 shrink-0 flex-col justify-between border-r border-[#24334b] bg-[#0b1423] p-1.5 select-none"
      aria-label={t.toolbarAria}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <button type="button" onClick={onToggleCatalog} title={language === 'es' ? 'Mostrar u ocultar catálogo' : 'Show or hide catalog'} aria-pressed={catalogOpen}
          className={`mb-1 flex h-10 w-full items-center justify-center rounded-lg border transition ${catalogOpen ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200' : 'border-transparent text-zinc-400 hover:bg-[#132039] hover:text-zinc-100'}`}>
          <BookOpen className="h-4 w-4" />
        </button>

        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.tooltip}
              aria-label={tool.tooltip}
              aria-pressed={isActive}
              className={`relative flex w-full items-center justify-center rounded-lg border p-2.5 transition group ${
                isActive
                  ? 'border-amber-400/60 bg-amber-400/15 text-amber-200 shadow-sm'
                  : 'border-transparent text-zinc-400 hover:bg-[#132039] hover:text-zinc-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
                }`}
              />
            </button>
          );
        })}

        </div>

        {!toolOptionsOpen && hasToolOptions && (
          <button
            type="button"
            onClick={() => setToolOptionsOpen(true)}
            title={`${language === 'es' ? 'Mostrar opciones de' : 'Show options for'} ${t.tools[activeTool]}`}
            aria-label={`${language === 'es' ? 'Mostrar opciones de' : 'Show options for'} ${t.tools[activeTool]}`}
            aria-expanded={false}
            aria-controls="tool-options-panel"
            className={`absolute top-24 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b3d58] bg-[#0d1728] text-cyan-200 shadow-xl transition hover:border-cyan-400/50 hover:bg-[#132039] ${catalogOpen ? 'left-[calc(100%+308px)] xl:left-[calc(100%+348px)]' : 'left-[calc(100%+8px)]'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}

        {toolOptionsOpen && hasToolOptions && <div
          id="tool-options-panel"
          className={`absolute top-24 z-50 max-h-[calc(100%-112px)] w-64 overflow-y-auto rounded-xl border border-[#2b3d58] bg-[#0d1728] p-3 shadow-2xl ${catalogOpen ? 'left-[calc(100%+308px)] xl:left-[calc(100%+348px)]' : 'left-[calc(100%+8px)]'}`}
          aria-label={language === 'es' ? 'Opciones de herramienta' : 'Tool options'}
        >
          <div className="mb-2 flex items-start justify-between gap-2 border-b border-[#253751] pb-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-200">{language === 'es' ? 'Opciones de herramienta' : 'Tool options'}</div>
              <div className="mt-1 text-xs text-zinc-400">{t.tools[activeTool]}</div>
            </div>
            <button type="button" onClick={() => setToolOptionsOpen(false)} className="rounded-md p-1 text-zinc-500 hover:bg-[#17243a] hover:text-zinc-100" aria-label={language === 'es' ? 'Ocultar opciones' : 'Hide options'}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        {/* Dynamic Tool Options: Rectangle */}
        {activeTool === 'rectangle' && (
          <div className="pt-3 mt-3 border-t border-[#26354c] block px-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
              {t.toolOptions.rectMode}
            </span>
            <div className="grid grid-cols-2 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => onChangeRectangleMode('outline')}
                className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                  rectangleMode === 'outline'
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={t.rectOutlineTooltip}
              >
                <SquareDashed className="w-3 h-3" />
                <span>{t.toolOptions.outline}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeRectangleMode('filled')}
                className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                  rectangleMode === 'filled'
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={t.rectFilledTooltip}
              >
                <Maximize2 className="w-3 h-3" />
                <span>{t.toolOptions.filled}</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tool Options: Circle */}
        {activeTool === 'circle' && (
          <div className="pt-3 mt-3 border-t border-[#26354c] block px-1 space-y-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
                {t.toolOptions.circleMode}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => onChangeCircleMode('outline')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                    circleMode === 'outline'
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={t.circleOutlineTooltip}
                >
                  <Circle className="w-3 h-3" />
                  <span>{t.toolOptions.outline}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeCircleMode('filled')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                    circleMode === 'filled'
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={t.circleFilledTooltip}
                >
                  <CircleDot className="w-3 h-3" />
                  <span>{t.toolOptions.filled}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
                {t.toolOptions.circleOrigin}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => onChangeCircleOrigin('center')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                    circleOrigin === 'center'
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={t.circleFromCenterTooltip}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>{t.toolOptions.fromCenter}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeCircleOrigin('corner')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
                    circleOrigin === 'corner'
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={t.circleFromCornerTooltip}
                >
                  <Maximize className="w-3 h-3" />
                  <span>{t.toolOptions.fromCorner}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tool Options: Place Core */}
        {activeTool === 'place_core' && (
          <div className="pt-3 mt-3 border-t border-[#26354c] block px-1 space-y-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-amber-400 block mb-1">
                {t.placeCore.title}
              </span>
              <p className="text-[10px] text-zinc-400 leading-tight mb-2">
                {t.placeCore.hint}
              </p>

              {onCenterCoreOnBlueprint && (
                <button
                  type="button"
                  onClick={onCenterCoreOnBlueprint}
                  title={t.placeCore.centerTooltip}
                  className="w-full py-1.5 px-2 mb-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{t.placeCore.centerOnBlueprint}</span>
                </button>
              )}

              {onToggleIncludeWaypoint && (
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[#121316] border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
                  <input
                    type="checkbox"
                    checked={includeWaypoint}
                    onChange={onToggleIncludeWaypoint}
                    className="w-3.5 h-3.5 accent-amber-500 rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-[11px] text-zinc-300 font-medium">
                    {t.placeCore.includeWaypoint}
                  </span>
                </label>
              )}

              <div className="mt-2 p-2 rounded-lg bg-[#101115] border border-zinc-800/80 space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EC4899] shrink-0 border border-black/40" />
                  <span>{t.placeCore.coreComponent}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EC4899] shrink-0 border border-black/40" />
                  <span>{t.placeCore.statuesComponent}</span>
                </div>
                {includeWaypoint && (
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#38BDF8] shrink-0 border border-black/40" />
                    <span>{t.placeCore.waypointComponent}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeTool === 'pencil' || activeTool === 'eraser') && (
          <div className="pt-3 mt-3 border-t border-[#26354c] block px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-zinc-500">
              {t.toolOptions.brushSize}
              </span>
              <output className="text-xs font-mono font-semibold text-amber-300" aria-live="polite">
                {brushSize}×{brushSize}
              </output>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={brushSize}
              onChange={event => onChangeBrushSize(Number(event.target.value))}
              aria-label={t.toolOptions.brushSize}
              aria-valuetext={`${brushSize} × ${brushSize}`}
              className="w-full h-2 accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[9px] font-mono text-zinc-600" aria-hidden="true">
              <span>1×1</span>
              <span>20×20</span>
            </div>
            {activeTool === 'eraser' && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-[#26354c] bg-[#111c2d] px-2.5 py-2 text-xs text-zinc-300 transition hover:border-cyan-500/40 hover:text-zinc-100">
                <input
                  type="checkbox"
                  checked={eraseObjectsWithEraser}
                  onChange={event => onChangeEraseObjectsWithEraser(event.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
                <span>{t.toolOptions.eraseObjects}</span>
              </label>
            )}
          </div>
        )}

        {supportsMirror && activeColor.id === 'door' && (
          <>
            {showDoorTooltip && (
              <div className="pt-1 pb-2 px-1">
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-2 mb-2 text-xs text-amber-100 relative">
                  <span className="flex items-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-medium">{t.doorTooltip.title}</span>
                  </span>
                  <p className="text-amber-200/90 leading-relaxed">{t.doorTooltip.text}</p>
                  <button
                    type="button"
                    onClick={onDismissDoorTooltip}
                    className="absolute top-1 right-1 p-1 text-amber-300 hover:text-white hover:bg-amber-500/30 rounded transition"
                    title={t.doorTooltip.dismiss}
                    aria-label={t.doorTooltip.dismiss}
                  >
                    <span className="text-[10px]">✕</span>
                  </button>
                </div>
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-[#26354c] block px-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">{t.doorOrientation.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
                <button type="button" onClick={() => onChangeDoorOrientation('horizontal')} title={t.doorOrientation.horizontal} className={`py-1 px-1 rounded text-[10px] font-mono font-medium transition flex items-center justify-center gap-0.5 ${doorOrientation === 'horizontal' ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  <span className="w-3 h-3 border-t-4 border-black shrink-0" /><span>{t.doorOrientation.horizontal}</span>
                </button>
                <button type="button" onClick={() => onChangeDoorOrientation('vertical')} title={t.doorOrientation.vertical} className={`py-1 px-1 rounded text-[10px] font-mono font-medium transition flex items-center justify-center gap-0.5 ${doorOrientation === 'vertical' ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  <span className="w-3 h-3 border-l-4 border-black shrink-0" /><span>{t.doorOrientation.vertical}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Real-time Mirror Mode Section */}
        {supportsMirror && <div className="pt-3 mt-3 border-t border-[#26354c] block px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
              {t.mirror.realtime}
            </span>
            {mirrorMode !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </div>
          <div className="grid grid-cols-4 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => onChangeMirrorMode('none')}
              title={t.mirror.none}
              className={`py-1 px-1 rounded text-[10px] font-mono font-medium transition flex items-center justify-center ${
                mirrorMode === 'none'
                  ? 'bg-zinc-700 text-zinc-200 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              OFF
            </button>
            <button
              type="button"
              onClick={() => onChangeMirrorMode('horizontal')}
              title={t.mirror.horizontal}
              className={`py-1 px-1 rounded text-[10px] font-medium transition flex items-center justify-center gap-0.5 ${
                mirrorMode === 'horizontal'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FlipHorizontal className="w-3 h-3" />
              <span>H</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMirrorMode('vertical')}
              title={t.mirror.vertical}
              className={`py-1 px-1 rounded text-[10px] font-medium transition flex items-center justify-center gap-0.5 ${
                mirrorMode === 'vertical'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FlipVertical className="w-3 h-3" />
              <span>V</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMirrorMode('quad')}
              title={t.mirror.quad}
              className={`py-1 px-1 rounded text-[10px] font-medium transition flex items-center justify-center gap-0.5 ${
                mirrorMode === 'quad'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Grid2X2 className="w-3 h-3" />
              <span>4X</span>
            </button>
          </div>
        </div>}
        </div>}

    </aside>
  );
};
