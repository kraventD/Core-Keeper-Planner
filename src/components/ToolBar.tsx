import React from 'react';
import {
  ToolType,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  MirrorMode,
  DoorOrientation,
  PaletteColor,
} from '../types/blueprint';
import { Translations } from '../i18n/translations';
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
  SquareDashed,
  Maximize,
  Maximize2,
  Crosshair,
  FlipHorizontal,
  FlipVertical,
  Grid2X2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ToolBarProps {
  activeTool: ToolType;
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
  activeColor: PaletteColor;
  doorOrientation: DoorOrientation;
  onChangeDoorOrientation: (orientation: DoorOrientation) => void;
  showDoorTooltip: boolean;
  onDismissDoorTooltip: () => void;
  t: Translations;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  activeTool,
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
  activeColor,
  doorOrientation,
  onChangeDoorOrientation,
  showDoorTooltip,
  onDismissDoorTooltip,
  t,
}) => {
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
  ];

  return (
    <aside
      className="w-16 md:w-56 bg-[#14151a] border-r border-zinc-800/90 flex flex-col justify-between p-2 select-none shrink-0 z-20"
      aria-label="Barra de herramientas"
    >
      <div className="space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden md:block">
          Herramientas
        </div>

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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition group relative ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1b22] border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
                }`}
              />
              <span className="hidden md:inline truncate">{tool.name}</span>
              <kbd className="hidden md:block ml-auto text-[10px] font-mono text-zinc-500 font-semibold group-hover:text-zinc-400">
                {tool.shortcut}
              </kbd>
            </button>
          );
        })}

        {/* Dynamic Tool Options: Rectangle */}
        {activeTool === 'rectangle' && (
          <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1">
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
                title="Dibuja muros perimetrales con interior vacío"
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
                title="Dibuja bloque sólido de casillas"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{t.toolOptions.filled}</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tool Options: Circle */}
        {activeTool === 'circle' && (
          <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1 space-y-2.5">
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
                  title="Dibuja anillo de muros perimetrales con interior vacío"
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
                  title="Dibuja disco sólido circular de casillas"
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
                  title="Clic en el bloque central y expandir hacia fuera de forma simétrica"
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
                  title="Arrastrar entre dos esquinas de una caja cuadrada"
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
          <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1 space-y-2.5">
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
          <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
              {t.toolOptions.brushSize}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
              {[1, 2, 3].map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => onChangeBrushSize(size)}
                  className={`py-1 rounded text-xs font-mono font-medium transition ${
                    brushSize === size
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeColor.id === 'door' && (
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
            <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                  {t.doorOrientation.title}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-1 bg-[#121316] p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => onChangeDoorOrientation('horizontal')}
                  title={t.doorOrientation.horizontal}
                  className={`py-1 px-1 rounded text-[10px] font-mono font-medium transition flex items-center justify-center gap-0.5 ${
                    doorOrientation === 'horizontal'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-3 h-3 border-t-4 border-black shrink-0" />
                  <span>{t.doorOrientation.horizontal}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeDoorOrientation('vertical')}
                  title={t.doorOrientation.vertical}
                  className={`py-1 px-1 rounded text-[10px] font-mono font-medium transition flex items-center justify-center gap-0.5 ${
                    doorOrientation === 'vertical'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-3 h-3 border-l-4 border-black shrink-0" />
                  <span>{t.doorOrientation.vertical}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Real-time Mirror Mode Section */}
        <div className="pt-3 mt-3 border-t border-zinc-800/80 hidden md:block px-1">
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
        </div>
      </div>

      {/* Active Color Preview Indicator */}
      <div className="pt-2 border-t border-zinc-800/80">
        <div className="p-2 rounded-lg bg-[#18191f] border border-zinc-800 flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md border border-black/40 shadow-inner shrink-0"
            style={{ backgroundColor: activeColor.hex }}
          />
          <div className="hidden md:block min-w-0">
            <span className="text-[10px] text-zinc-400 block leading-none">Color activo</span>
            <span className="text-xs font-medium text-zinc-200 truncate block mt-0.5">
              {activeColor.name}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
