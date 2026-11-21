import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Annotation,
  BlueprintProject,
  CellCoord,
  PaletteColor,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  MirrorMode,
  SelectionBox,
  ToolType,
  DoorOrientation,
  StorageItemRotation,
  PlannerLayerStates,
  SelectionScope,
  SelectionTransformPreview,
  ClipboardData,
  ClipboardPasteValidation,
  Language,
} from '../types/blueprint';
import { Translations } from '../i18n/translations';
import { CORE_SPRITE_ITEM, STORAGE_ITEM_BY_ID, StorageItemDefinition } from '../utils/storageCatalog';
import { StorageItemPlacement } from '../types/blueprint';
import { GameSpriteEntry } from '../utils/gameSpriteCatalog';
import { getDoorCellOrientation, getDoorPlacementColorId } from '../utils/doorCells';
import { FLOOR_ITEM_BY_ID } from '../utils/floorCatalog';
import { getPaletteColorLabel } from '../utils/palette';
import { DEFAULT_PLANNER_LAYER_STATES, getStorageItemLayerId, getStoragePlacementLayerId, isPlannerLayerEditable } from '../utils/plannerLayers';
import { getStoragePlacementOverlapTiles, storagePlacementsOverlap } from '../utils/storageFootprint';
import {
  coordKey,
  getBresenhamLine,
  getRectangleCells,
  getCircleCells,
  getMirroredCoords,
  normalizeBox,
  isInBounds,
  floodFill,
  getConnectedRegion,
  moveCells,
  CORE_PATTERN_CENTER_OFFSET_X,
  CORE_PATTERN_CENTER_OFFSET_Y,
} from '../utils/gridLogic';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  RotateCcw,
  RotateCw,
  Grid2X2,
  Pencil,
  Slash,
  Square,
  Circle,
  PaintBucket,
  PackageOpen,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';

interface SpriteContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnnotationEditorState {
  mode: 'add' | 'edit';
  x: number;
  y: number;
  annotationId?: string;
  text: string;
}

const CONTEXT_TOOL_ICONS: Array<{ tool: ToolType; icon: React.ComponentType<{ className?: string }> }> = [
  { tool: 'pencil', icon: Pencil },
  { tool: 'line', icon: Slash },
  { tool: 'rectangle', icon: Square },
  { tool: 'circle', icon: Circle },
  { tool: 'fill', icon: PaintBucket },
  { tool: 'place_storage', icon: PackageOpen },
];

const STORAGE_LAYER_ORDER: Record<NonNullable<StorageItemPlacement['layer']>, number> = {
  bridge: 0,
  floor: 1,
  rail: 2,
  fence: 3,
  wall: 4,
  wall_decoration: 5,
  object: 6,
  light: 7,
};

const storageLayerOrder = (placement: StorageItemPlacement) => STORAGE_LAYER_ORDER[placement.layer ?? 'object'];
const placementAtCell = (placements: StorageItemPlacement[], x: number, y: number) =>
  placements
    .filter(item => x >= item.x && x < item.x + item.width && y >= item.y && y < item.y + item.height)
    .sort((a, b) => storageLayerOrder(b) - storageLayerOrder(a))
    .at(0);

const getMirroredShapeCells = (
  cells: CellCoord[],
  width: number,
  height: number,
  mirrorMode: MirrorMode,
): CellCoord[] => {
  const mirroredCells = new Map<string, CellCoord>();
  for (const cell of cells) {
    for (const mirroredCell of getMirroredCoords(cell.x, cell.y, width, height, mirrorMode)) {
      mirroredCells.set(coordKey(mirroredCell.x, mirroredCell.y), mirroredCell);
    }
  }
  return [...mirroredCells.values()];
};

const expandSelectionBoxToIncludePlacements = (box: SelectionBox, placements: StorageItemPlacement[]): SelectionBox => {
  const expanded = { ...box };
  for (const item of placements) {
    const intersects = item.x <= box.maxX && item.x + item.width - 1 >= box.minX &&
      item.y <= box.maxY && item.y + item.height - 1 >= box.minY;
    if (!intersects) continue;
    expanded.minX = Math.min(expanded.minX, item.x);
    expanded.minY = Math.min(expanded.minY, item.y);
    expanded.maxX = Math.max(expanded.maxX, item.x + item.width - 1);
    expanded.maxY = Math.max(expanded.maxY, item.y + item.height - 1);
  }
  return expanded;
};

// Helper to build a themed crosshair cursor SVG
const makeCrosshairCursor = (strokeColor: string, glowColor: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 2v6m0 8v6M2 12h6m8 0h6' stroke='${strokeColor}' stroke-width='3.5' stroke-linecap='round'/%3E%3Cpath d='M12 2v6m0 8v6M2 12h6m8 0h6' stroke='${glowColor}' stroke-width='1.5' stroke-linecap='round'/%3E%3Ccircle cx='12' cy='12' r='2' fill='${strokeColor}'/%3E%3Ccircle cx='12' cy='12' r='1.2' fill='${glowColor}'/%3E%3C/svg%3E") 12 12, crosshair`;

// Helper to build a themed pencil cursor SVG
const makePencilCursor = (strokeColor: string, fillColor: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M16.71 3.17l-2.42 2.42 5.06 5.06 2.42-2.42a1 1 0 0 0 0-1.42l-4.24-4.24a1 1 0 0 0-1.42 0zM3 17.25v2.05h2.05L17.81 3.94l-2.05-2.05L3 17.25z' stroke='${strokeColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M20.71 7.04c1.35-1.35 1.35-3.54 0-4.89l-4.24-4.24c-1.35-1.35-3.54-1.35-4.89 0l-2.42 2.42c-1.35 1.35-1.35 3.54 0 4.89l5.06 5.06c1.35 1.35 3.54 1.35 4.89 0l2.42-2.42c1.34-1.34 1.34-3.53 0-4.88z' fill='${fillColor}'/%3E%3C/svg%3E") 4 20, auto`;

// Helper to build a themed eraser cursor SVG
const makeEraserCursor = (strokeColor: string, fillColor: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M17.66 3.34c-.73-.73-1.71-1.14-2.73-1.14h-6.86c-1.02 0-2 .4-2.73 1.14L3.73 8.61c-.73.73-1.14 1.71-1.14 2.73v6.86c0 1.02.4 2 1.14 2.73l4.39 4.39c.73.73 1.71 1.14 2.73 1.14h6.86c1.02 0 2-.4 2.73-1.14l4.39-4.39c.74-.73 1.14-1.71 1.14-2.73V8.61c0-1.02-.4-2-1.14-2.73zM13.46 12.77c-.26.26-.6.41-.97.41s-.71-.15-.97-.41L5.37 6.2c-.26-.26-.41-.6-.41-.97s.15-.71.41-.97l1.46-1.46c.26-.26.6-.41.97-.41s.71.15.97.41l7.25 7.25c.26.26.41.61.41.97s-.15.71-.41.97z' fill='${fillColor}'/%3E%3Cpath d='M3.73 8.61c-.73.73-1.14 1.71-1.14 2.73v6.86c0 1.02.4 2 1.14 2.73l4.39 4.39c.73.73 1.71 1.14 2.73 1.14h6.86c1.02 0 2-.4 2.73-1.14l4.39-4.39c.74-.73 1.14-1.71 1.14-2.73V8.61c0-1.02-.4-2-1.14-2.73z' stroke='${strokeColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E") 12 12, auto`;

// Helper to build a themed grab cursor (open hand) SVG
const makeGrabCursor = (strokeColor: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M11.39 15.6c-1.16 0-2.29-.32-3.3-.94l-.26-.16c-.64-.42-1.15-1.05-1.4-1.78-.2-.57-.27-1.19-.19-1.8l.07-.54c.08-.57.26-1.12.54-1.62.29-.5.68-.94 1.13-1.3l.58-.47c.26-.2.54-.36.83-.49l.56-.26c.62-.27 1.29-.45 2-.45.33 0 .66.03.98.08l.56.1c.74.13 1.44.37 2.07.7l.31.16c.5.26.97.58 1.38.93l.06.05c.47.4.87.87 1.17 1.37l.09.15c.19.33.31.69.31 1.07v.01c0 .39-.12.75-.32 1.06l-.11.16c-.42.63-.84 1.21-1.26 1.72-.42.5-.83.94-1.23 1.31l-.27.25c-.43.39-.89.7-1.38.93l-.57.26c-.32.15-.65.27-.99.34l-.55.12c-.73.15-1.45.23-2.18.23-1.12 0-2.22-.36-3.21-1.05l-.19-.13c-.4-.28-.75-.65-1.02-1.07-.26-.42-.44-.89-.5-1.39l-.05-.42c-.05-.42-.06-.84-.03-1.26l.02-.32c.02-.34.08-.67.19-.98l.09-.25c.15-.4.36-.77.62-1.1l.27-.34c.38-.46.79-.87 1.24-1.2l.3-.23c.61-.45 1.27-.8 1.96-1.03l.52-.17c.71-.23 1.43-.37 2.16-.37.4 0 .79.04 1.17.1l.56.1c.75.12 1.46.34 2.12.65l.33.16c.52.25 1 .54 1.42.87l.06.05c.47.36.87.79 1.17 1.26l.09.14c.18.31.29.65.29 1.01v.01c0 .37-.11.72-.3 1.02l-.1.15c-.4.6-.8 1.16-1.2 1.65-.39.48-.78.9-1.16 1.26l-.25.23c-.41.36-.84.64-1.31.86l-.53.24c-.29.13-.59.23-.89.31l-.5.11c-.68.14-1.36.21-2.04.21-.88 0-1.75-.22-2.58-.64zM7.53 19.42c-.72 0-1.42-.19-2.06-.56l-.3-.18c-.48-.31-.85-.77-1.04-1.32l-.07-.22c-.07-.48-.06-.97.02-1.45l.04-.21c.06-.34.17-.66.32-.95l.13-.26c.21-.38.46-.72.74-1l.26-.25c.44-.43.93-.78 1.44-1.03l.37-.18c.53-.26 1.07-.44 1.61-.54l.39-.07c.58-.1 1.16-.15 1.75-.15.32 0 .63.02.94.06l.52.07c.7.09 1.37.28 1.99.57l.3.14c.49.23.94.52 1.34.85l.06.05c.45.36.83.77 1.12 1.22l.08.13c.17.28.28.58.28.9v.01c0 .33-.1.63-.28.87l-.1.13c-.37.52-.73.97-1.1 1.37-.37.4-.74.75-1.1 1.03l-.23.18c-.48.36-.98.63-1.51.81l-.51.2c-.3.12-.61.21-.92.28l-.47.11c-.64.13-1.28.19-1.92.19-.81 0-1.62-.2-2.38-.58z' fill='${strokeColor}'/%3E%3C/svg%3E") 12 12, grab`;

// Helper to build a themed grabbing cursor (closed hand) SVG
const makeGrabbingCursor = (strokeColor: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M11.74 17.16c-.32 0-.64-.06-.95-.18l-.36-.14c-.68-.28-1.2-.69-1.55-1.21-.23-.35-.3-.73-.24-1.12l.04-.29c.06-.33.15-.63.3-.88.15-.25.36-.47.6-.66l.32-.25c.14-.1.3-.18.45-.26l.3-.14c.34-.14.7-.24 1.09-.24.18 0 .36.02.53.04l.3.05c.4.07.78.2 1.12.38l.17.09c.27.14.53.31.75.5l.03.03c.25.21.47.46.63.74l.05.08c.1.18.17.37.17.58v.01c0 .21-.07.4-.18.57l-.06.09c-.22.34-.45.65-.68.93-.23.27-.45.51-.67.71l-.15.13c-.24.21-.49.38-.75.5l-.31.14c-.18.08-.36.15-.54.18l-.3.06c-.4.08-.79.12-1.19.12-.61 0-1.21-.2-1.76-.57l-.1-.07c-.22-.15-.41-.35-.56-.58-.14-.23-.24-.48-.27-.75l-.03-.23c-.03-.23.04-.45.1-.53l.05-.14c.08-.22.2-.42.34-.59l.15-.18c.21-.25.43-.47.67-.65l.16-.12c.33-.25.69-.44 1.07-.56l.28-.09c.39-.12.78-.2 1.18-.2.22 0 .43.02.64.05l.3.05c.41.06.8.17 1.16.35l.18.09c.28.14.55.31.78.47l.03.03c.26.19.47.41.64.67l.05.07c.09.16.15.32.15.5v.01c0 .18-.05.34-.15.47l-.05.06c-.2.28-.39.54-.59.75-.21.23-.41.43-.61.61l-.13.11c-.21.19-.43.33-.65.44l-.27.12c-.16.07-.32.13-.48.16l-.26.05c-.35.07-.69.11-1.04.11-.54 0-1.07-.13-1.56-.38zM5.8 14.7c-.57 0-1.12-.15-1.62-.45l-.24-.15c-.38-.25-.68-.61-.83-1.05l-.06-.17c-.05-.38-.05-.77.02-1.15l.03-.17c.05-.27.13-.53.25-.76l.1-.21c.17-.3.37-.57.59-.8l.21-.2c.35-.34.74-.62 1.15-.82l.3-.14c.42-.21.85-.35 1.29-.43l.31-.06c.46-.08.92-.12 1.39-.12.25 0 .5.01.75.05l.41.06c.56.07 1.09.22 1.59.46l.24.11c.39.18.75.42 1.07.68l.05.04c.36.29.66.61.9.97l.06.11c.14.22.22.46.22.72v.01c0 .26-.08.5-.22.7l-.08.1c-.3.42-.58.77-.88 1.09-.3.32-.59.6-.88.82l-.18.15c-.38.29-.78.5-1.21.65l-.41.16c-.24.1-.49.17-.73.22l-.38.09c-.51.11-1.03.16-1.54.16-.65 0-1.29-.16-1.9-.47z' fill='${strokeColor}'/%3E%3C/svg%3E") 12 12, grabbing`;

interface CanvasAreaProps {
  project: BlueprintProject;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  activeColor: PaletteColor;
  rectangleMode: RectangleMode;
  circleMode?: ShapeMode;
  circleOrigin?: CircleOrigin;
  mirrorMode?: MirrorMode;
  selectionTransformPreview?: SelectionTransformPreview | null;
  clipboard?: ClipboardData | null;
  pastePlacementMode?: boolean;
  showClipboardPasteHint?: boolean;
  onDismissClipboardPasteHint?: () => void;
  pastePreviewValidation?: ClipboardPasteValidation | null;
  onPasteAt?: (x: number, y: number) => void;
  onPasteHoverCell?: (cell: CellCoord | null) => void;
  brushSize: number;
  eraseObjectsWithEraser?: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMajorGrid: boolean;
  showCenterGuide: boolean;
  showCoordinates: boolean;
  showLightRanges?: boolean;
  gridLineWidth?: number;
  highContrastGrid?: boolean;
  gridTheme?: 'light' | 'dark';
  onToggleGridTheme: () => void;
  plannerLayerStates: PlannerLayerStates;
  language: Language;
  selectionBox: SelectionBox | null;
  selectionScope: SelectionScope;
  onSetSelectionBox: (box: SelectionBox | null) => void;
  onMoveSelection?: (box: SelectionBox, deltaX: number, deltaY: number) => boolean;
  onUpdateCells: (newCells: Record<string, string>, description: string, storagePlacements?: StorageItemPlacement[], floorTiles?: Record<string, string>) => void;
  selectedFloorItem?: StorageItemDefinition | null;
  selectedStorageItem?: StorageItemDefinition | null;
  gameSprites?: Record<string, GameSpriteEntry>;
  onPlaceStorageItem?: (x: number, y: number, item: StorageItemDefinition) => void;
  selectedStoragePlacementId?: string | null;
  onSelectStoragePlacement?: (id: string | null) => void;
  onRotateStoragePlacement?: (rotation: StorageItemRotation) => void;
  onMoveStorageItem?: (id: string, x: number, y: number) => void;
  onZoomChange?: (zoom: number) => void;
  annotations: Annotation[];
  onAddAnnotation: (x: number, y: number, text: string) => void;
  onEditAnnotation: (annotationId: string, text: string) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onRotateAnnotation: (annotationId: string) => void;
  onMoveAnnotation: (annotationId: string, x: number, y: number) => void;
  onDoorPlaced?: () => void;
  doorOrientation: DoorOrientation;
  t: Translations;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  project,
  activeTool,
  onSelectTool,
  activeColor,
  rectangleMode,
  circleMode = 'outline',
  circleOrigin = 'center',
  mirrorMode = 'none',
  selectionTransformPreview = null,
  clipboard = null,
  pastePlacementMode = false,
  showClipboardPasteHint = false,
  onDismissClipboardPasteHint,
  pastePreviewValidation = null,
  onPasteAt,
  onPasteHoverCell,
  brushSize,
  eraseObjectsWithEraser = false,
  showGrid,
  onToggleGrid,
  showMajorGrid,
  showCenterGuide,
  showCoordinates,
  showLightRanges = false,
  gridLineWidth = 1.5,
  highContrastGrid = true,
  gridTheme = 'light',
  onToggleGridTheme,
  plannerLayerStates = DEFAULT_PLANNER_LAYER_STATES,
  language,
  selectionBox,
  selectionScope,
  onSetSelectionBox,
  onMoveSelection,
  onUpdateCells,
  selectedFloorItem = null,
  selectedStorageItem = null,
  gameSprites = {},
  onPlaceStorageItem,
  selectedStoragePlacementId = null,
  onSelectStoragePlacement,
  onRotateStoragePlacement,
  onMoveStorageItem,
  onZoomChange,
  annotations = [],
  onAddAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
  onRotateAnnotation,
  onMoveAnnotation,
  onDoorPlaced,
  doorOrientation = 'horizontal',
  t,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View transform state
  const [zoom, setZoom] = useState<number>(1.0);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const observedContainerSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover & interaction states
  const [hoverCell, setHoverCell] = useState<CellCoord | null>(null);
  const [hoverPointer, setHoverPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellCoord | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<CellCoord | null>(null);
  const storageDragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [storageDragPreview, setStorageDragPreview] = useState<CellCoord | null>(null);
  const erasedStoragePlacementIdsRef = useRef<Set<string>>(new Set());

  // Annotation drag state
  const [draggingAnnotationId, setDraggingAnnotationId] = useState<string | null>(null);
  const [annotationDragStartCell, setAnnotationDragStartCell] = useState<CellCoord | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [annotationEditor, setAnnotationEditor] = useState<AnnotationEditorState | null>(null);
  const annotationTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Door tooltip tracking (per session)
  const doorTooltipNotifiedRef = useRef<boolean>(false);

  // Space key held for quick panning
  const [isSpaceHeld, setIsSpaceHeld] = useState<boolean>(false);

  // Transient stroke buffer for continuous pencil/eraser drawing
  const strokeBufferRef = useRef<Record<string, string>>({});
  const floorStrokeBufferRef = useRef<Record<string, string>>({});

  // Recently changed cells for subtle animation (key -> timestamp)
  const recentChangesRef = useRef<Record<string, number>>({});
  const ANIMATION_DURATION_MS = 400;

  // Cache for palette sprites (URL -> image)
  const spriteCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const spriteBoundsCacheRef = useRef<WeakMap<HTMLImageElement, SpriteContentBounds>>(new WeakMap());

  const getSpriteImage = (src?: string): HTMLImageElement | null => {
    if (!src) return null;
    let img = spriteCacheRef.current.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      spriteCacheRef.current.set(src, img);
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  };

  const getSpriteContentBounds = (image: HTMLImageElement): SpriteContentBounds => {
    const cached = spriteBoundsCacheRef.current.get(image);
    if (cached) return cached;

    let bounds: SpriteContentBounds = { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
    try {
      const scratch = document.createElement('canvas');
      scratch.width = image.naturalWidth;
      scratch.height = image.naturalHeight;
      const scratchContext = scratch.getContext('2d', { willReadFrequently: true });
      if (!scratchContext) return bounds;
      scratchContext.drawImage(image, 0, 0);
      const { data, width, height } = scratchContext.getImageData(0, 0, scratch.width, scratch.height);
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4 + 3] === 0) continue;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
      if (maxX >= minX && maxY >= minY) {
        bounds = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
      }
    } catch {
      // Keep the full sprite if a browser cannot inspect its alpha channel.
    }
    spriteBoundsCacheRef.current.set(image, bounds);
    return bounds;
  };

  const drawStorageSprite = (context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    const bounds = getSpriteContentBounds(image);
    context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
  };

  const drawNativeStorageSprite = (context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, cellSize: number, rotation = 0) => {
    const bounds = getSpriteContentBounds(image);
    const scale = cellSize / 16;
    const quarterTurn = rotation === 90 || rotation === 270;
    const baseWidth = quarterTurn ? height : width;
    const baseHeight = quarterTurn ? width : height;
    const spriteWidth = Math.max(bounds.width * scale, baseWidth);
    const spriteHeight = Math.max(bounds.height * scale, baseHeight);
    if (rotation !== 0) {
      context.translate(x + width / 2, y + height / 2);
      context.rotate(rotation * Math.PI / 180);
      context.drawImage(
        image,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        -baseWidth / 2 + (baseWidth - spriteWidth) / 2,
        -baseHeight / 2 + baseHeight - spriteHeight,
        spriteWidth,
        spriteHeight,
      );
    } else {
      context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, x + (width - spriteWidth) / 2, y + height - spriteHeight, spriteWidth, spriteHeight);
    }
  };

  // Track cells changed during pointer up for animation
  const markRecentChanges = useCallback((cells: Record<string, string>) => {
    const now = Date.now();
    for (const key of Object.keys(cells)) {
      recentChangesRef.current[key] = now;
    }
    // Clean up old entries
    const cutoff = now - ANIMATION_DURATION_MS;
    for (const key of Object.keys(recentChangesRef.current)) {
      if (recentChangesRef.current[key] < cutoff) {
        delete recentChangesRef.current[key];
      }
    }
  }, []);

  // Base cell size in pixels at zoom = 1.0
  const BASE_CELL_SIZE = 24;
  const currentCellSize = BASE_CELL_SIZE * zoom;

  // Sync zoom change to parent if needed
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  // Zoom in / out controls
  const handleZoom = useCallback(
    (delta: number, anchorX?: number, anchorY?: number) => {
      setZoom(prevZoom => {
        const newZoom = Math.max(0.2, Math.min(prevZoom * delta, 5.0));
        if (newZoom === prevZoom) return prevZoom;

        // If anchor coordinates provided (e.g. mouse pointer), zoom into that point
        if (anchorX !== undefined && anchorY !== undefined) {
          const ratio = newZoom / prevZoom;
          setPan(prevPan => ({
            x: Math.round(anchorX - (anchorX - prevPan.x) * ratio),
            y: Math.round(anchorY - (anchorY - prevPan.y) * ratio),
          }));
        }
        return newZoom;
      });
    },
    []
  );

  // Handle Space key for panning and +/- keys for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpaceHeld(true);
        return;
      }

      // Zoom in / out with + and - keys
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoom(1.15);
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoom(1 / 1.15);
        return;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleZoom]);

  // Screen to Cell coordinate transform
  const screenToCell = useCallback(
    (clientX: number, clientY: number): CellCoord | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      const cellX = Math.floor((canvasX - pan.x) / currentCellSize);
      const cellY = Math.floor((canvasY - pan.y) / currentCellSize);

      if (isInBounds(cellX, cellY, project.width, project.height)) {
        return { x: cellX, y: cellY };
      }
      return null;
    },
    [pan.x, pan.y, currentCellSize, project.width, project.height]
  );

  // Center Blueprint in view
  const handleCenter = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { clientWidth, clientHeight } = container;
    const blueprintPixelWidth = project.width * currentCellSize;
    const blueprintPixelHeight = project.height * currentCellSize;

    setPan({
      x: Math.round((clientWidth - blueprintPixelWidth) / 2),
      y: Math.round((clientHeight - blueprintPixelHeight) / 2),
    });
  }, [project.width, project.height, currentCellSize]);

  // Fit Blueprint to screen
  const handleFitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { clientWidth, clientHeight } = container;
    const padding = 60;
    const availW = Math.max(100, clientWidth - padding * 2);
    const availH = Math.max(100, clientHeight - padding * 2);

    const fitZoomX = availW / (project.width * BASE_CELL_SIZE);
    const fitZoomY = availH / (project.height * BASE_CELL_SIZE);
    const newZoom = Math.min(fitZoomX, fitZoomY, 2.5);
    const clampedZoom = Math.max(0.2, Math.min(newZoom, 4.0));

    setZoom(clampedZoom);

    const newCellSize = BASE_CELL_SIZE * clampedZoom;
    const blueprintPixelWidth = project.width * newCellSize;
    const blueprintPixelHeight = project.height * newCellSize;

    setPan({
      x: Math.round((clientWidth - blueprintPixelWidth) / 2),
      y: Math.round((clientHeight - blueprintPixelHeight) / 2),
    });
  }, [project.width, project.height, BASE_CELL_SIZE]);

  // Center once on initial mount
  useEffect(() => {
    handleFitToScreen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel event with passive: false for seamless zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || !e.shiftKey) {
        // Zoom
        const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        handleZoom(zoomFactor, mouseX, mouseY);
      } else {
        // Horizontal scroll
        setPan(prev => ({ ...prev, x: prev.x - e.deltaY }));
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleZoom]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    // Pan mode with Middle Click (button === 1), Spacebar held, or Hand tool (left click)
    if (e.button === 1 || isSpaceHeld || (!pastePlacementMode && activeTool === 'hand' && e.button === 0)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const cell = screenToCell(e.clientX, e.clientY);

    // Click derecho: eliminar anotación si hay una bajo el cursor
    if (e.button === 2 && annotations.length > 0 && cell) {
      const ann = annotations.find(a => a.x === cell.x && a.y === cell.y);
      if (ann && onDeleteAnnotation) {
        e.preventDefault();
        onDeleteAnnotation(ann.id);
        return;
      }
    }

    // Only process left click for drawing/selection
    if (e.button !== 0) return;

    if (pastePlacementMode) {
      if (cell) onPasteAt?.(cell.x, cell.y);
      return;
    }

    setIsPointerDown(true);

    // Notes sit above the drawing layers. Handle their clicks before starting
    // any tool action so an eraser/pencil click cannot modify the blueprint.
    if (annotations.length > 0 && cell) {
      const ann = annotations.find(a => a.x === cell.x && a.y === cell.y);
      if (ann) {
        setSelectedAnnotationId(ann.id);
        if (e.detail >= 2) {
          setAnnotationEditor({ mode: 'edit', annotationId: ann.id, x: ann.x, y: ann.y, text: ann.text });
          setIsPointerDown(false);
          return;
        }
        setDraggingAnnotationId(ann.id);
        setAnnotationDragStartCell({ x: ann.x, y: ann.y });
        return;
      }
    }

    if (activeTool === 'place_storage') {
      if (cell && selectedStorageItem && onPlaceStorageItem) {
        onPlaceStorageItem(cell.x, cell.y, selectedStorageItem);
      }
      setIsPointerDown(false);
      return;
    }

      if (activeTool === 'eraser') {
      erasedStoragePlacementIdsRef.current.clear();
      if (cell) eraseStorageObjectsAtBrush(cell.x, cell.y);
    }

    if (activeTool === 'select' && cell) {
      const visiblePlacements = (project.storagePlacements ?? []).filter(item => plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible);
      const placement = placementAtCell(visiblePlacements, cell.x, cell.y);
      if (placement) {
        onSelectStoragePlacement?.(placement.id);
        onSetSelectionBox(null);
        if (plannerLayerStates[getStoragePlacementLayerId(placement, STORAGE_ITEM_BY_ID.get(placement.itemId))].locked) {
          setIsPointerDown(false);
          return;
        }
        storageDragRef.current = { id: placement.id, offsetX: cell.x - placement.x, offsetY: cell.y - placement.y };
        setStorageDragPreview({ x: placement.x, y: placement.y });
        setDragStartCell(null);
        setDragCurrentCell(null);
        return;
      }
      onSelectStoragePlacement?.(null);
    }

    // Detectar primera puerta colocada (para tooltip de bienvenida)
    if (
      activeColor.id === 'door' &&
      !doorTooltipNotifiedRef.current &&
      onDoorPlaced
    ) {
      doorTooltipNotifiedRef.current = true;
      onDoorPlaced();
    }

    setSelectedAnnotationId(null);

    if (activeTool === 'move') {
      if (selectionBox) {
        setDragStartCell(cell || { x: selectionBox.minX, y: selectionBox.minY });
        setDragCurrentCell(cell || { x: selectionBox.minX, y: selectionBox.minY });
      }
      return;
    }

    if (activeTool === 'fill') {
      if (cell) {
        const region = getConnectedRegion(project.cells, cell.x, cell.y, project.width, project.height);

        if (selectedFloorItem) {
          if (!isPlannerLayerEditable(plannerLayerStates, getStorageItemLayerId(selectedFloorItem, selectedFloorItem.layer))) return;
          const floorTiles = { ...(project.floorTiles ?? {}) };
          for (const { x, y } of region) floorTiles[coordKey(x, y)] = selectedFloorItem.id;
          onUpdateCells(project.cells, 'Rellenar área con suelo', undefined, floorTiles);
          return;
        }

        if (selectedStorageItem) {
          const layerId = getStorageItemLayerId(selectedStorageItem, selectedStorageItem.layer);
          if (!isPlannerLayerEditable(plannerLayerStates, layerId)) return;

          const regionKeys = new Set(region.map(({ x, y }) => coordKey(x, y)));
          const placements = [...(project.storagePlacements ?? [])];
          const added: StorageItemPlacement[] = [];
          const reserved = new Set<string>();
          const layer = selectedStorageItem.layer ?? 'object';
          const itemWidth = selectedStorageItem.width;
          const itemHeight = selectedStorageItem.height;
          const occupiedByLayer = (x: number, y: number) => placements.some(existing =>
            getStoragePlacementLayerId(existing, STORAGE_ITEM_BY_ID.get(existing.itemId)) === layerId &&
            x < existing.x + existing.width && x + itemWidth > existing.x &&
            y < existing.y + existing.height && y + itemHeight > existing.y,
          );

          for (const { x, y } of region) {
            if (x + itemWidth > project.width || y + itemHeight > project.height) continue;
            const footprint: string[] = [];
            let fullyInside = true;
            for (let dy = 0; dy < itemHeight && fullyInside; dy++) {
              for (let dx = 0; dx < itemWidth; dx++) {
                const key = coordKey(x + dx, y + dy);
                if (!regionKeys.has(key) || reserved.has(key)) {
                  fullyInside = false;
                  break;
                }
                footprint.push(key);
              }
            }
            if (!fullyInside || occupiedByLayer(x, y)) continue;

            const placement: StorageItemPlacement = {
              id: `storage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${added.length}`,
              itemId: selectedStorageItem.id,
              x,
              y,
              width: itemWidth,
              height: itemHeight,
              layer,
              lightRadius: selectedStorageItem.defaultLightRadius,
              rotation: 0,
            };
            added.push(placement);
            placements.push(placement);
            footprint.forEach(key => reserved.add(key));
          }

          if (added.length > 0) {
            const itemName = language === 'es' ? selectedStorageItem.nameEs : selectedStorageItem.nameEn;
            onUpdateCells(project.cells, `Rellenar área con ${itemName}`, placements, project.floorTiles);
          }
          return;
        }

        const updated = floodFill(
          project.cells,
          cell.x,
          cell.y,
          getDoorPlacementColorId(activeColor.id, doorOrientation),
          project.width,
          project.height
        );
        onUpdateCells(updated, 'Rellenar área');
      }
      return;
    }

    if (activeTool === 'place_core') {
      if (cell) {
        onPlaceStorageItem?.(
          cell.x - CORE_PATTERN_CENTER_OFFSET_X,
          cell.y - CORE_PATTERN_CENTER_OFFSET_Y,
          CORE_SPRITE_ITEM,
        );
      }
      return;
    }

    if (activeTool === 'annotation') {
      if (cell) {
        const existing = annotations.find(a => a.x === cell.x && a.y === cell.y);
        if (existing) {
          setSelectedAnnotationId(existing.id);
          setAnnotationEditor({ mode: 'edit', annotationId: existing.id, x: existing.x, y: existing.y, text: existing.text });
        } else {
          setAnnotationEditor({ mode: 'add', x: cell.x, y: cell.y, text: '' });
        }
      }
      return;
    }

    if (cell) {
      setDragStartCell(cell);
      setDragCurrentCell(cell);

      if (activeTool === 'pencil' || activeTool === 'eraser') {
        // Apply immediate initial stroke
        if (activeTool === 'eraser' && eraseObjectsWithEraser) {
          const workingCells = { ...project.cells };
          const workingFloors = { ...(project.floorTiles ?? {}) };
          if (isPlannerLayerEditable(plannerLayerStates, 'walls')) applyBrush(workingCells, cell.x, cell.y, null);
          if (isPlannerLayerEditable(plannerLayerStates, 'floors')) applyBrush(workingFloors, cell.x, cell.y, null);
          strokeBufferRef.current = workingCells;
          floorStrokeBufferRef.current = workingFloors;
        } else {
          const workingCells = selectedFloorItem ? { ...(project.floorTiles ?? {}) } : { ...project.cells };
          applyBrush(workingCells, cell.x, cell.y, activeTool === 'pencil' ? selectedFloorItem?.id ?? getDoorPlacementColorId(activeColor.id, doorOrientation) : null);
          strokeBufferRef.current = workingCells;
          floorStrokeBufferRef.current = {};
        }
      }
    } else {
      if (activeTool === 'rect_select' || activeTool === 'select') {
        onSetSelectionBox(null);
      }
    }
  };

  const applyBrush = (
    targetMap: Record<string, string>,
    cx: number,
    cy: number,
    colorId: string | null
  ) => {
    const offset = Math.floor(brushSize / 2);
    for (let dy = 0; dy < brushSize; dy++) {
      for (let dx = 0; dx < brushSize; dx++) {
        const x = cx + dx - offset;
        const y = cy + dy - offset;
        const mirroredCoords = getMirroredCoords(x, y, project.width, project.height, mirrorMode);
        for (const pt of mirroredCoords) {
          const key = coordKey(pt.x, pt.y);
          if (colorId === null) {
            delete targetMap[key];
          } else {
            targetMap[key] = colorId;
          }
        }
      }
    }
  };

  const eraseStorageObjectsAtBrush = (cx: number, cy: number) => {
    if (!eraseObjectsWithEraser) return;
    const brushCells = new Set<string>();
    const offset = Math.floor(brushSize / 2);
    for (let dy = 0; dy < brushSize; dy++) {
      for (let dx = 0; dx < brushSize; dx++) {
        const x = cx + dx - offset;
        const y = cy + dy - offset;
        for (const pt of getMirroredCoords(x, y, project.width, project.height, mirrorMode)) {
          brushCells.add(coordKey(pt.x, pt.y));
        }
      }
    }

    const placementsToErase = (project.storagePlacements ?? []).filter(placement => {
      if (erasedStoragePlacementIdsRef.current.has(placement.id)) return false;
      const layerId = getStoragePlacementLayerId(placement, STORAGE_ITEM_BY_ID.get(placement.itemId));
      if (!isPlannerLayerEditable(plannerLayerStates, layerId)) return false;
      const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
      let visualLeft = placement.x;
      let visualTop = placement.y;
      let visualWidth = item?.visualWidthTiles ?? placement.width;
      let visualHeight = item?.visualHeightTiles ?? placement.height;
      const gameSprite = item?.spriteId ? gameSprites[item.spriteId] : undefined;
      const image = getSpriteImage(item?.placementImageUrl ?? gameSprite?.atlas ?? item?.imageUrl);
      if (item?.renderAtNativeScale && image && (item.placementImageUrl || !gameSprite)) {
        const bounds = getSpriteContentBounds(image);
        visualWidth = item.visualWidthTiles ?? Math.max(placement.width, bounds.width / 16);
        visualHeight = item.visualHeightTiles ?? Math.max(placement.height, bounds.height / 16);
        if ((placement.rotation ?? 0) === 90 || (placement.rotation ?? 0) === 270) {
          [visualWidth, visualHeight] = [visualHeight, visualWidth];
        }
        visualLeft = placement.x + (placement.width - visualWidth) / 2;
        visualTop = placement.y + placement.height - visualHeight;
      } else if (item && (item.visualWidthTiles || item.visualHeightTiles)) {
        visualLeft = placement.x + (placement.width - visualWidth) / 2;
        visualTop = placement.y + placement.height - visualHeight;
      }
      for (let y = placement.y; y < placement.y + placement.height; y++) {
        for (let x = placement.x; x < placement.x + placement.width; x++) {
          if (brushCells.has(coordKey(x, y))) return true;
        }
      }
      for (const key of brushCells) {
        const [x, y] = key.split(',').map(Number);
        if (x < visualLeft + visualWidth && x + 1 > visualLeft && y < visualTop + visualHeight && y + 1 > visualTop) return true;
      }
      return false;
    });

    if (placementsToErase.length === 0) return;
    placementsToErase.forEach(placement => erasedStoragePlacementIdsRef.current.add(placement.id));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const cell = screenToCell(e.clientX, e.clientY);
    setHoverCell(cell);
    onPasteHoverCell?.(pastePlacementMode ? cell : null);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setHoverPointer({
        x: Math.max(8, Math.min(rect.width - 250, e.clientX - rect.left + 16)),
        y: Math.max(8, Math.min(rect.height - 96, e.clientY - rect.top + 16)),
      });
    }

    if (storageDragRef.current && cell) {
      setStorageDragPreview({ x: cell.x - storageDragRef.current.offsetX, y: cell.y - storageDragRef.current.offsetY });
      return;
    }

    // Arrastrar anotación para moverla
    if (draggingAnnotationId && cell) {
      const ann = annotations.find(a => a.id === draggingAnnotationId);
      if (ann && (ann.x !== cell.x || ann.y !== cell.y)) {
        onMoveAnnotation(draggingAnnotationId, cell.x, cell.y);
        setAnnotationDragStartCell(cell);
      }
      return;
    }

    if (!isPointerDown) return;

    // Detectar puerta colocada durante arrastre continuo
    if (
      activeColor.id === 'door' &&
      !doorTooltipNotifiedRef.current &&
      onDoorPlaced
    ) {
      doorTooltipNotifiedRef.current = true;
      onDoorPlaced();
    }

    if (cell) {
      setDragCurrentCell(cell);

      if (activeTool === 'pencil' || activeTool === 'eraser') {
        if (activeTool === 'eraser' && eraseObjectsWithEraser) {
          const workingCells = { ...strokeBufferRef.current };
          const workingFloors = { ...floorStrokeBufferRef.current };
          if (isPlannerLayerEditable(plannerLayerStates, 'walls')) applyBrush(workingCells, cell.x, cell.y, null);
          if (isPlannerLayerEditable(plannerLayerStates, 'floors')) applyBrush(workingFloors, cell.x, cell.y, null);
          strokeBufferRef.current = workingCells;
          floorStrokeBufferRef.current = workingFloors;
        } else {
          const workingCells = { ...strokeBufferRef.current };
          applyBrush(workingCells, cell.x, cell.y, activeTool === 'pencil' ? selectedFloorItem?.id ?? getDoorPlacementColorId(activeColor.id, doorOrientation) : null);
          strokeBufferRef.current = workingCells;
        }
        if (activeTool === 'eraser') eraseStorageObjectsAtBrush(cell.x, cell.y);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (storageDragRef.current) {
      const cell = screenToCell(e.clientX, e.clientY);
      const drag = storageDragRef.current;
      const placement = (project.storagePlacements ?? []).find(item => item.id === drag.id);
      if (cell && placement) onMoveStorageItem?.(drag.id, cell.x - drag.offsetX, cell.y - drag.offsetY);
      storageDragRef.current = null;
      setStorageDragPreview(null);
      setIsPointerDown(false);
      setDragStartCell(null);
      setDragCurrentCell(null);
      return;
    }

    if (!isPointerDown) return;
    setIsPointerDown(false);

    // Finalizar arrastre de anotación
    if (draggingAnnotationId) {
      setDraggingAnnotationId(null);
      setAnnotationDragStartCell(null);
      setIsPointerDown(false);
      return;
    }

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      markRecentChanges(strokeBufferRef.current);
      if (activeTool === 'eraser' && eraseObjectsWithEraser) {
        const cellsToSave = isPlannerLayerEditable(plannerLayerStates, 'walls') ? strokeBufferRef.current : project.cells;
        const floorsToSave = isPlannerLayerEditable(plannerLayerStates, 'floors') ? floorStrokeBufferRef.current : (project.floorTiles ?? {});
        const erasedIds = erasedStoragePlacementIdsRef.current;
        const placementsToSave = erasedIds.size > 0
          ? (project.storagePlacements ?? []).filter(placement => !erasedIds.has(placement.id))
          : (project.storagePlacements ?? []);
        onUpdateCells(cellsToSave, 'Borrador', placementsToSave, floorsToSave);
      }
      else if (selectedFloorItem) onUpdateCells(project.cells, activeTool === 'pencil' ? 'Pintar suelo' : 'Borrar suelo', undefined, strokeBufferRef.current);
      else onUpdateCells(strokeBufferRef.current, activeTool === 'pencil' ? 'Lápiz' : 'Borrador');
      strokeBufferRef.current = {};
      floorStrokeBufferRef.current = {};
      erasedStoragePlacementIdsRef.current.clear();
    } else if (activeTool === 'line' && dragStartCell && dragCurrentCell) {
      const lineCells = getMirroredShapeCells(getBresenhamLine(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        project.width,
        project.height
      ), project.width, project.height, mirrorMode);
      const updated = selectedFloorItem ? { ...(project.floorTiles ?? {}) } : { ...project.cells };
      for (const c of lineCells) {
        updated[coordKey(c.x, c.y)] = selectedFloorItem ? selectedFloorItem.id : getDoorPlacementColorId(activeColor.id, doorOrientation);
      }
      markRecentChanges(updated);
      if (selectedFloorItem) onUpdateCells(project.cells, 'Línea de suelo', undefined, updated); else onUpdateCells(updated, 'Línea');
    } else if (activeTool === 'rectangle' && dragStartCell && dragCurrentCell) {
      const rectCells = getMirroredShapeCells(getRectangleCells(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        rectangleMode,
        project.width,
        project.height
      ), project.width, project.height, mirrorMode);
      const updated = selectedFloorItem ? { ...(project.floorTiles ?? {}) } : { ...project.cells };
      for (const c of rectCells) {
        updated[coordKey(c.x, c.y)] = selectedFloorItem ? selectedFloorItem.id : getDoorPlacementColorId(activeColor.id, doorOrientation);
      }
      markRecentChanges(updated);
      if (selectedFloorItem) onUpdateCells(project.cells, rectangleMode === 'outline' ? 'Contorno de suelo' : 'Rectángulo de suelo', undefined, updated);
      else onUpdateCells(updated, rectangleMode === 'outline' ? 'Muros de habitación' : 'Rectángulo lleno');
    } else if (activeTool === 'circle' && dragStartCell && dragCurrentCell) {
      const circleRes = getCircleCells(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        circleMode,
        circleOrigin,
        project.width,
        project.height
      );
      const mirroredCircleCells = getMirroredShapeCells(circleRes.cells, project.width, project.height, mirrorMode);
      const updated = selectedFloorItem ? { ...(project.floorTiles ?? {}) } : { ...project.cells };
      for (const c of mirroredCircleCells) {
        updated[coordKey(c.x, c.y)] = selectedFloorItem ? selectedFloorItem.id : getDoorPlacementColorId(activeColor.id, doorOrientation);
      }
      markRecentChanges(updated);
      if (selectedFloorItem) onUpdateCells(project.cells, circleMode === 'outline' ? 'Contorno circular de suelo' : 'Círculo de suelo', undefined, updated);
      else onUpdateCells(
        updated,
        circleMode === 'outline'
          ? `Muros circulares (${circleRes.diameter}×${circleRes.diameter})`
          : `Círculo relleno (${circleRes.diameter}×${circleRes.diameter})`
      );
    } else if (activeTool === 'rect_select' && dragStartCell && dragCurrentCell) {
      const box = normalizeBox(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        project.width,
        project.height
      );
      const visiblePlacements = selectionScope === 'floors' ? [] : (project.storagePlacements ?? []).filter(item => plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible);
      const expandedBox = expandSelectionBoxToIncludePlacements(box, visiblePlacements);
      onSetSelectionBox({ ...expandedBox, scope: selectionScope });
    } else if (activeTool === 'select' && dragStartCell) {
      const box = normalizeBox(
        dragStartCell.x,
        dragStartCell.y,
        dragStartCell.x,
        dragStartCell.y,
        project.width,
        project.height
      );
      onSetSelectionBox(box);
    } else if (activeTool === 'move' && selectionBox && dragStartCell && dragCurrentCell) {
      const dx = dragCurrentCell.x - dragStartCell.x;
      const dy = dragCurrentCell.y - dragStartCell.y;
      if (dx !== 0 || dy !== 0) {
        const moved = moveCells(project.cells, selectionBox, dx, dy, project.width, project.height);
        const moveSucceeded = onMoveSelection
          ? onMoveSelection(selectionBox, dx, dy)
          : (onUpdateCells(moved, 'Mover selección'), true);
        if (moveSucceeded) {
          markRecentChanges(moved);
          onSetSelectionBox({
            minX: Math.max(0, Math.min(project.width - 1, selectionBox.minX + dx)),
            minY: Math.max(0, Math.min(project.height - 1, selectionBox.minY + dy)),
            maxX: Math.max(0, Math.min(project.width - 1, selectionBox.maxX + dx)),
            maxY: Math.max(0, Math.min(project.height - 1, selectionBox.maxY + dy)),
            scope: selectionBox.scope,
          });
        }
      }
    }

    setDragStartCell(null);
    setDragCurrentCell(null);
  };

  // High Performance 2D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number | null = null;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Dark canvas workspace background
      ctx.fillStyle = '#101115';
      ctx.fillRect(0, 0, width, height);

      // Color lookup
      const colorMap = new Map<string, string>();
      for (const p of project.palette) {
        colorMap.set(p.id, p.hex);
      }

      // Blueprint bounding box in screen pixels
      const bpX = pan.x;
      const bpY = pan.y;
      const bpW = project.width * currentCellSize;
      const bpH = project.height * currentCellSize;

      // 2. Blueprint mat background (Pure white or dark charcoal)
      ctx.fillStyle = gridTheme === 'light' ? '#ffffff' : '#111d30';
      ctx.fillRect(bpX, bpY, bpW, bpH);

      // Viewport culling boundaries (only iterate over visible cells)
      const minVisibleX = Math.max(0, Math.floor(-bpX / currentCellSize));
      const maxVisibleX = Math.min(project.width - 1, Math.ceil((width - bpX) / currentCellSize));
      const minVisibleY = Math.max(0, Math.floor(-bpY / currentCellSize));
      const maxVisibleY = Math.min(project.height - 1, Math.ceil((height - bpY) / currentCellSize));

      const activeRenderFloors = !plannerLayerStates.floors.visible ? {} : isPointerDown && (activeTool === 'pencil' || activeTool === 'eraser') && activeTool === 'eraser' && eraseObjectsWithEraser
        ? floorStrokeBufferRef.current
        : isPointerDown && (activeTool === 'pencil' || activeTool === 'eraser') && selectedFloorItem
        ? strokeBufferRef.current
        : (project.floorTiles ?? {});

      // 3. Render cells (combine project cells + live stroke buffer)
      const activeRenderCells = !plannerLayerStates.walls.visible ? {} : isPointerDown && (activeTool === 'pencil' || activeTool === 'eraser') && activeTool === 'eraser' && eraseObjectsWithEraser
        ? strokeBufferRef.current
        : isPointerDown && (activeTool === 'pencil' || activeTool === 'eraser') && !selectedFloorItem
        ? strokeBufferRef.current
        : project.cells;

      for (const [key, colorId] of Object.entries(activeRenderCells)) {
        const [xStr, yStr] = key.split(',');
        const cx = parseInt(xStr, 10);
        const cy = parseInt(yStr, 10);

        if (cx >= minVisibleX && cx <= maxVisibleX && cy >= minVisibleY && cy <= maxVisibleY) {
          const cellDoorOrientation = getDoorCellOrientation(colorId);
          const hex = colorMap.get(cellDoorOrientation ? 'door' : colorId) || '#64748b';
          const cellScreenX = bpX + cx * currentCellSize;
          const cellScreenY = bpY + cy * currentCellSize;
          if (cellDoorOrientation) {
            const doorThickness = currentCellSize * 0.25;
            const doorOffset = currentCellSize * 0.375; // (1 - 0.25) / 2 = 0.375

            ctx.save();
            ctx.fillStyle = hex;

            if (cellDoorOrientation === 'horizontal') {
              // Horizontal door: thin horizontal line across the center of the cell
              ctx.fillRect(
                cellScreenX,
                cellScreenY + doorOffset,
                currentCellSize,
                doorThickness
              );
            } else {
              // Vertical door: thin vertical line across the center of the cell
              ctx.fillRect(
                cellScreenX + doorOffset,
                cellScreenY,
                doorThickness,
                currentCellSize
              );
            }

            ctx.restore();
          } else {
            ctx.fillStyle = hex;
            ctx.fillRect(
              cellScreenX,
              cellScreenY,
              currentCellSize,
              currentCellSize
            );
          }

          // Dark perimeter border around every individual painted cell
          // This ensures that adjacent cells of the same color are 100% distinguishable and easily countable!
          if (showGrid && currentCellSize >= 3) {
            ctx.strokeStyle = gridTheme === 'light'
              ? 'rgba(0, 0, 0, 0.90)'
              : (highContrastGrid ? 'rgba(0, 0, 0, 0.70)' : 'rgba(0, 0, 0, 0.40)');
            ctx.lineWidth = Math.max(1, Math.min(currentCellSize * 0.15, gridLineWidth));
            ctx.strokeRect(
              cellScreenX,
              cellScreenY,
              currentCellSize,
              currentCellSize
            );
          }
        }
      }

      // Floor tiles sit on top of the terrain/block color layer, while later
      // drawing passes keep grid lines and placed objects visible above them.
      for (const [key, itemId] of Object.entries(activeRenderFloors)) {
        const [xStr, yStr] = key.split(',');
        const cx = Number(xStr);
        const cy = Number(yStr);
        if (cx < minVisibleX || cx > maxVisibleX || cy < minVisibleY || cy > maxVisibleY) continue;
        const floor = FLOOR_ITEM_BY_ID.get(itemId);
        if (!floor) continue;
        const image = getSpriteImage(floor.placementImageUrl ?? floor.imageUrl);
        if (image) {
          const floorX = bpX + cx * currentCellSize;
          const floorY = bpY + cy * currentCellSize;
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, floorX, floorY, currentCellSize, currentCellSize);
          if (showGrid && currentCellSize >= 3) {
            ctx.strokeStyle = gridTheme === 'light'
              ? 'rgba(0, 0, 0, 0.90)'
              : (highContrastGrid ? 'rgba(0, 0, 0, 0.70)' : 'rgba(0, 0, 0, 0.40)');
            ctx.lineWidth = Math.max(1, Math.min(currentCellSize * 0.15, gridLineWidth));
            ctx.strokeRect(floorX, floorY, currentCellSize, currentCellSize);
          }
          ctx.restore();
        }
      }

      // 3.5 Subtle animation glow on recently changed cells
      const now = Date.now();
      const glowCells = Object.entries(recentChangesRef.current).filter(
        ([, ts]) => now - ts < ANIMATION_DURATION_MS
      );
      if (glowCells.length > 0 && currentCellSize >= 4) {
        ctx.save();
        for (const [key, ts] of glowCells) {
          const [xStr, yStr] = key.split(',');
          const cx = parseInt(xStr, 10);
          const cy = parseInt(yStr, 10);
          if (cx < minVisibleX || cx > maxVisibleX || cy < minVisibleY || cy > maxVisibleY) continue;
          const age = now - ts;
          const alpha = Math.max(0, 1 - age / ANIMATION_DURATION_MS);
          const pulse = 0.6 + 0.4 * Math.sin((age / 80) * Math.PI);
          const cellScreenX = bpX + cx * currentCellSize;
          const cellScreenY = bpY + cy * currentCellSize;
          ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * pulse * 0.8})`;
          ctx.lineWidth = Math.max(1, Math.min(currentCellSize * 0.1, gridLineWidth + 1));
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(cellScreenX, cellScreenY, currentCellSize, currentCellSize);
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // 4. Grid lines
      if (showGrid && currentCellSize >= 3) {
        const effectiveLineWidth = Math.max(1, Math.min(currentCellSize * 0.15, gridLineWidth));
        ctx.lineWidth = effectiveLineWidth;

        // Minor grid lines (empty background cells)
        if (gridTheme === 'light') {
          ctx.strokeStyle = highContrastGrid
            ? 'rgba(0, 0, 0, 0.30)'
            : 'rgba(0, 0, 0, 0.18)';
        } else {
          ctx.strokeStyle = highContrastGrid
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.08)';
        }

        const CHUNK_SIZE = 16;

        ctx.beginPath();
        for (let x = minVisibleX; x <= maxVisibleX + 1; x++) {
          if (!showMajorGrid || x % CHUNK_SIZE !== 0) {
            const lineX = Math.round(bpX + x * currentCellSize) + 0.5;
            ctx.moveTo(lineX, bpY);
            ctx.lineTo(lineX, bpY + bpH);
          }
        }
        for (let y = minVisibleY; y <= maxVisibleY + 1; y++) {
          if (!showMajorGrid || y % CHUNK_SIZE !== 0) {
            const lineY = Math.round(bpY + y * currentCellSize) + 0.5;
            ctx.moveTo(bpX, lineY);
            ctx.lineTo(bpX + bpW, lineY);
          }
        }
        ctx.stroke();

        // Chunk guide lines (every 16 cells, Core Keeper chunk boundary)
        if (showMajorGrid) {
          ctx.strokeStyle = gridTheme === 'light'
            ? 'rgba(0, 0, 0, 0.95)' // High contrast chunk boundary line in light theme
            : 'rgba(251, 191, 36, 0.85)'; // Distinct amber chunk demarcation line in dark theme
          ctx.lineWidth = Math.max(2, effectiveLineWidth + 1.0);
          ctx.beginPath();
          const startChunkX = Math.floor(minVisibleX / CHUNK_SIZE) * CHUNK_SIZE;
          for (let x = startChunkX; x <= maxVisibleX + 1; x += CHUNK_SIZE) {
            if (x >= 0 && x <= project.width) {
              const lineX = Math.round(bpX + x * currentCellSize) + 0.5;
              ctx.moveTo(lineX, bpY);
              ctx.lineTo(lineX, bpY + bpH);
            }
          }
          const startChunkY = Math.floor(minVisibleY / CHUNK_SIZE) * CHUNK_SIZE;
          for (let y = startChunkY; y <= maxVisibleY + 1; y += CHUNK_SIZE) {
            if (y >= 0 && y <= project.height) {
              const lineY = Math.round(bpY + y * currentCellSize) + 0.5;
              ctx.moveTo(bpX, lineY);
              ctx.lineTo(bpX + bpW, lineY);
            }
          }
          ctx.stroke();
        }
      }

      // The center axes help align symmetric layouts and remain independent of grid visibility.
      if (showCenterGuide) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(bpX, bpY, bpW, bpH);
        ctx.clip();
        ctx.strokeStyle = gridTheme === 'light'
          ? 'rgba(8, 145, 178, 0.82)'
          : 'rgba(34, 211, 238, 0.88)';
        ctx.lineWidth = Math.max(1.5, Math.min(currentCellSize * 0.12, gridLineWidth + 0.5));
        ctx.setLineDash([Math.max(4, currentCellSize * 0.35), Math.max(2, currentCellSize * 0.18)]);
        ctx.beginPath();
        const centerX = bpX + bpW / 2;
        const centerY = bpY + bpH / 2;
        ctx.moveTo(Math.round(centerX) + 0.5, bpY);
        ctx.lineTo(Math.round(centerX) + 0.5, bpY + bpH);
        ctx.moveTo(bpX, Math.round(centerY) + 0.5);
        ctx.lineTo(bpX + bpW, Math.round(centerY) + 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // Blueprint outer frame
      ctx.strokeStyle = gridTheme === 'light' ? '#0f172a' : 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bpX, bpY, bpW, bpH);

      // Approximate light guides are kept separate from the game's lighting simulation.
      if (showLightRanges) {
        const lightPlacements = (project.storagePlacements ?? []).filter(item =>
          item.lightRadius !== undefined || !!STORAGE_ITEM_BY_ID.get(item.itemId)?.defaultLightRadius,
        ).filter(item => plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible);
        if (lightPlacements.length) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(bpX, bpY, bpW, bpH);
          ctx.clip();
          for (const placement of lightPlacements) {
            const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
            const radius = placement.lightRadius ?? item?.defaultLightRadius;
            if (!radius) continue;
            const centerX = bpX + (placement.x + placement.width / 2) * currentCellSize;
            const centerY = bpY + (placement.y + placement.height / 2) * currentCellSize;
            const radiusPx = radius * currentCellSize;
            const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radiusPx);
            glow.addColorStop(0, 'rgba(250, 204, 21, 0.18)');
            glow.addColorStop(0.6, 'rgba(250, 204, 21, 0.07)');
            glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(centerX - radiusPx, centerY - radiusPx, radiusPx * 2, radiusPx * 2);
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
            ctx.lineWidth = 1.25;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            if (currentCellSize >= 12) {
              const label = `≈${radius}`;
              ctx.font = 'bold 10px monospace';
              const labelWidth = ctx.measureText(label).width + 8;
              ctx.fillStyle = 'rgba(24, 24, 27, 0.9)';
              ctx.fillRect(centerX - labelWidth / 2, centerY - radiusPx - 17, labelWidth, 14);
              ctx.fillStyle = '#fde68a';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, centerX, centerY - radiusPx - 10);
              ctx.textAlign = 'start';
              ctx.textBaseline = 'alphabetic';
            }
          }
          ctx.restore();
        }
      }

      // Storage items render across their full footprint, one tile per grid cell.
      const orderedPlacements = [...(project.storagePlacements ?? [])]
        .filter(item => plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible)
        .sort((a, b) => storageLayerOrder(a) - storageLayerOrder(b));
      for (const storedPlacement of orderedPlacements as StorageItemPlacement[]) {
        const preview = storageDragPreview && storageDragRef.current?.id === storedPlacement.id ? storageDragPreview : null;
        const placement = preview ? { ...storedPlacement, x: preview.x, y: preview.y } : storedPlacement;
        const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
        if (!item) continue;
        const movingSelection = activeTool === 'move' && selectionBox && dragStartCell && dragCurrentCell &&
          placement.x >= selectionBox.minX && placement.y >= selectionBox.minY &&
          placement.x + placement.width - 1 <= selectionBox.maxX && placement.y + placement.height - 1 <= selectionBox.maxY;
        const movePreviewDx = movingSelection ? dragCurrentCell.x - dragStartCell.x : 0;
        const movePreviewDy = movingSelection ? dragCurrentCell.y - dragStartCell.y : 0;
        const drawX = placement.x + movePreviewDx;
        const drawY = placement.y + movePreviewDy;
        const gameSprite = item.spriteId ? gameSprites[item.spriteId] : undefined;
        const image = getSpriteImage(item.placementImageUrl ?? gameSprite?.atlas ?? item.imageUrl);
        const itemX = bpX + drawX * currentCellSize;
        const itemY = bpY + drawY * currentCellSize;
        const itemW = placement.width * currentCellSize;
        const itemH = placement.height * currentCellSize;
        const nativeSprite = image && item.renderAtNativeScale && (item.placementImageUrl || !gameSprite);
        const nativeBounds = nativeSprite && image ? getSpriteContentBounds(image) : null;
        let visualWidthTiles = item.visualWidthTiles ?? (nativeBounds ? Math.max(placement.width, nativeBounds.width / 16) : placement.width);
        let visualHeightTiles = item.visualHeightTiles ?? (nativeBounds ? Math.max(placement.height, nativeBounds.height / 16) : placement.height);
        if ((placement.rotation === 90 || placement.rotation === 270) && nativeBounds && !item.visualWidthTiles && !item.visualHeightTiles) {
          [visualWidthTiles, visualHeightTiles] = [visualHeightTiles, visualWidthTiles];
        }
        const visualX = itemX + (itemW - visualWidthTiles * currentCellSize) / 2;
        const visualY = itemY + itemH - visualHeightTiles * currentCellSize;
        const visualLeftTile = drawX + (placement.width - visualWidthTiles) / 2;
        const visualTopTile = drawY + placement.height - visualHeightTiles;
        if (visualLeftTile + visualWidthTiles < minVisibleX || visualLeftTile > maxVisibleX + 1 || visualTopTile + visualHeightTiles < minVisibleY || visualTopTile > maxVisibleY + 1) continue;
        if (image && item.category !== 'bridge' && item.category !== 'fence') {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          if (movePreviewDx !== 0 || movePreviewDy !== 0) ctx.globalAlpha = 0.6;
          if (item.visualWidthTiles || item.visualHeightTiles) {
            const rotation = placement.rotation ?? 0;
            if (rotation !== 0) {
              ctx.translate(itemX + itemW / 2, itemY + itemH / 2);
              ctx.rotate(rotation * Math.PI / 180);
              if (gameSprite) {
                const sourceY = gameSprite.rect.origin === 'bottom-left'
                  ? image.naturalHeight - gameSprite.rect.y - gameSprite.rect.height
                  : gameSprite.rect.y;
                ctx.drawImage(image, gameSprite.rect.x, sourceY, gameSprite.rect.width, gameSprite.rect.height,
                  visualX - (itemX + itemW / 2), visualY - (itemY + itemH / 2), visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
              } else {
                drawStorageSprite(ctx, image, visualX - (itemX + itemW / 2), visualY - (itemY + itemH / 2), visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
              }
            } else if (gameSprite) {
              const sourceY = gameSprite.rect.origin === 'bottom-left'
                ? image.naturalHeight - gameSprite.rect.y - gameSprite.rect.height
                : gameSprite.rect.y;
              ctx.drawImage(image, gameSprite.rect.x, sourceY, gameSprite.rect.width, gameSprite.rect.height,
                visualX, visualY, visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
            } else {
              drawStorageSprite(ctx, image, visualX, visualY, visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
            }
          } else if (item.renderAtNativeScale && (item.placementImageUrl || !gameSprite)) {
            drawNativeStorageSprite(ctx, image, itemX, itemY, itemW, itemH, currentCellSize, placement.rotation ?? 0);
          } else if (gameSprite) {
            const sourceY = gameSprite.rect.origin === 'bottom-left'
              ? image.naturalHeight - gameSprite.rect.y - gameSprite.rect.height
              : gameSprite.rect.y;
            if ((placement.rotation ?? 0) !== 0) {
              const rotation = placement.rotation ?? 0;
              const quarterTurn = rotation === 90 || rotation === 270;
              ctx.translate(itemX + itemW / 2, itemY + itemH / 2);
              ctx.rotate(rotation * Math.PI / 180);
              ctx.drawImage(
                image,
                gameSprite.rect.x,
                sourceY,
                gameSprite.rect.width,
                gameSprite.rect.height,
                quarterTurn ? -itemH / 2 : -itemW / 2,
                quarterTurn ? -itemW / 2 : -itemH / 2,
                quarterTurn ? itemH : itemW,
                quarterTurn ? itemW : itemH,
              );
            } else {
              ctx.drawImage(image, gameSprite.rect.x, sourceY, gameSprite.rect.width, gameSprite.rect.height, itemX, itemY, itemW, itemH);
            }
          } else if ((placement.rotation ?? 0) !== 0) {
            const rotation = placement.rotation ?? 0;
            const quarterTurn = rotation === 90 || rotation === 270;
            ctx.translate(itemX + itemW / 2, itemY + itemH / 2);
            ctx.rotate(rotation * Math.PI / 180);
            drawStorageSprite(ctx, image, quarterTurn ? -itemH / 2 : -itemW / 2, quarterTurn ? -itemW / 2 : -itemH / 2, quarterTurn ? itemH : itemW, quarterTurn ? itemW : itemH);
          } else {
            drawStorageSprite(ctx, image, itemX, itemY, itemW, itemH);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = item.color ?? 'rgba(245, 158, 11, 0.30)';
          ctx.fillRect(itemX, itemY, itemW, itemH);
          if ((placement.width > 1 || placement.height > 1) && itemW >= 24 && itemH >= 18) {
            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.nameEn, itemX + itemW / 2, itemY + itemH / 2, Math.max(8, itemW - 6));
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';
          }
        }
        ctx.strokeStyle = placement.id === selectedStoragePlacementId ? '#22d3ee' : '#f59e0b';
        ctx.lineWidth = placement.id === selectedStoragePlacementId ? Math.max(2, currentCellSize * 0.12) : Math.max(1.5, Math.min(currentCellSize * 0.08, 2.5));
        if (preview) {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
          ctx.fillRect(itemX, itemY, itemW, itemH);
        }
        ctx.strokeRect(itemX, itemY, itemW, itemH);
      }

      // 4.5 Symmetry Axis Indicators for Real-time Mirror Mode
      if (mirrorSupported && mirrorMode !== 'none') {
        ctx.save();
        if (mirrorMode === 'horizontal' || mirrorMode === 'quad') {
          const midX = Math.round(bpX + (project.width / 2) * currentCellSize) + 0.5;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(midX, bpY - 8);
          ctx.lineTo(midX, bpY + bpH + 8);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(t.mirror.axisShortH, midX - 14, Math.max(12, bpY - 4));
        }

        if (mirrorMode === 'vertical' || mirrorMode === 'quad') {
          const midY = Math.round(bpY + (project.height / 2) * currentCellSize) + 0.5;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(bpX - 8, midY);
          ctx.lineTo(bpX + bpW + 8, midY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(t.mirror.axisShortV, Math.max(4, bpX - 30), midY - 4);
        }
        ctx.restore();
      }

      // 5. Tool Interaction Previews
      if (isPointerDown && dragStartCell && dragCurrentCell) {
        const drawShapePreviewCell = (cell: CellCoord) => {
          const px = bpX + cell.x * currentCellSize;
          const py = bpY + cell.y * currentCellSize;
          const floorImage = selectedFloorItem ? getSpriteImage(selectedFloorItem.placementImageUrl ?? selectedFloorItem.imageUrl) : null;
          if (floorImage) {
            ctx.save();
            ctx.globalAlpha = 0.72;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(floorImage, px, py, currentCellSize, currentCellSize);
            ctx.restore();
          } else {
            ctx.fillStyle = activeColor.hex;
            ctx.fillRect(px, py, currentCellSize, currentCellSize);
          }
          if (showGrid && currentCellSize >= 3) {
            ctx.strokeStyle = gridTheme === 'light' ? 'rgba(0, 0, 0, 0.90)' : 'rgba(0, 0, 0, 0.70)';
            ctx.lineWidth = Math.max(1, gridLineWidth);
            ctx.strokeRect(px, py, currentCellSize, currentCellSize);
          }
        };
        if (activeTool === 'line') {
          const previewLine = getMirroredShapeCells(getBresenhamLine(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            project.width,
            project.height
          ), project.width, project.height, mirrorMode);
          for (const c of previewLine) drawShapePreviewCell(c);
        } else if (activeTool === 'rectangle') {
          const previewRect = getMirroredShapeCells(getRectangleCells(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            rectangleMode,
            project.width,
            project.height
          ), project.width, project.height, mirrorMode);
          for (const c of previewRect) drawShapePreviewCell(c);

          // Dimension badge pill
          const box = normalizeBox(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            project.width,
            project.height
          );
          const badgeText = `${box.width} × ${box.height}`;
          ctx.font = 'bold 12px monospace';
          const textMetrics = ctx.measureText(badgeText);
          const badgeX = bpX + (box.minX + box.width / 2) * currentCellSize - textMetrics.width / 2 - 8;
          const badgeY = bpY + box.minY * currentCellSize - 22;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(badgeText, badgeX + 8, badgeY + 14);
        } else if (activeTool === 'circle') {
          const previewCircle = getCircleCells(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            circleMode,
            circleOrigin,
            project.width,
            project.height
          );
          for (const c of getMirroredShapeCells(previewCircle.cells, project.width, project.height, mirrorMode)) drawShapePreviewCell(c);

          // Dimension badge pill for circle (diameter & radius)
          const badgeText = `⊚ ${previewCircle.diameter} × ${previewCircle.diameter} | ${t.toolOptions.radiusLabel}: ${previewCircle.radius}`;
          ctx.font = 'bold 12px monospace';
          const textMetrics = ctx.measureText(badgeText);
          const badgeX = bpX + (previewCircle.minX + previewCircle.diameter / 2) * currentCellSize - textMetrics.width / 2 - 8;
          const badgeY = bpY + previewCircle.minY * currentCellSize - 22;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(badgeText, badgeX + 8, badgeY + 14);
        } else if (activeTool === 'rect_select') {
          const box = normalizeBox(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            project.width,
            project.height
          );
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            bpX + box.minX * currentCellSize,
            bpY + box.minY * currentCellSize,
            box.width * currentCellSize,
            box.height * currentCellSize
          );
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fillRect(
            bpX + box.minX * currentCellSize,
            bpY + box.minY * currentCellSize,
            box.width * currentCellSize,
            box.height * currentCellSize
          );
          ctx.setLineDash([]);
        } else if (activeTool === 'move' && selectionBox) {
          const dx = dragCurrentCell.x - dragStartCell.x;
          const dy = dragCurrentCell.y - dragStartCell.y;
          const movedWidth = selectionBox.maxX - selectionBox.minX + 1;
          const movedHeight = selectionBox.maxY - selectionBox.minY + 1;

          // Ghost outline of moving area
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(
            bpX + (selectionBox.minX + dx) * currentCellSize,
            bpY + (selectionBox.minY + dy) * currentCellSize,
            movedWidth * currentCellSize,
            movedHeight * currentCellSize
          );
          ctx.setLineDash([]);
        }
      }

      // 6. Draw persistent Selection Box if not currently dragging
      if (selectionBox && (!isPointerDown || activeTool !== 'rect_select')) {
        const sW = (selectionBox.maxX - selectionBox.minX + 1) * currentCellSize;
        const sH = (selectionBox.maxY - selectionBox.minY + 1) * currentCellSize;
        const sX = bpX + selectionBox.minX * currentCellSize;
        const sY = bpY + selectionBox.minY * currentCellSize;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(sX, sY, sW, sH);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(sX, sY, sW, sH);
      }

      if (selectionBox && selectionTransformPreview) {
        const scope = selectionBox.scope ?? 'all';
        const horizontal = selectionTransformPreview.axis === 'horizontal';
        const isMirrorCopy = selectionTransformPreview.operation === 'mirror';
        const previewBox = isMirrorCopy ? {
          minX: horizontal ? project.width - 1 - selectionBox.maxX : selectionBox.minX,
          maxX: horizontal ? project.width - 1 - selectionBox.minX : selectionBox.maxX,
          minY: horizontal ? selectionBox.minY : project.height - 1 - selectionBox.maxY,
          maxY: horizontal ? selectionBox.maxY : project.height - 1 - selectionBox.minY,
        } : selectionBox;
        const transformCell = (x: number, y: number) => isMirrorCopy
          ? { x: horizontal ? project.width - 1 - x : x, y: horizontal ? y : project.height - 1 - y }
          : { x: horizontal ? selectionBox.minX + selectionBox.maxX - x : x, y: horizontal ? y : selectionBox.minY + selectionBox.maxY - y };
        const transformPlacement = (placement: StorageItemPlacement) => isMirrorCopy
          ? {
              x: horizontal ? project.width - placement.x - placement.width : placement.x,
              y: horizontal ? placement.y : project.height - placement.y - placement.height,
            }
          : {
              x: horizontal ? selectionBox.minX + selectionBox.maxX + 1 - placement.x - placement.width : placement.x,
              y: horizontal ? placement.y : selectionBox.minY + selectionBox.maxY + 1 - placement.y - placement.height,
            };

        ctx.save();
        ctx.beginPath();
        ctx.rect(bpX, bpY, bpW, bpH);
        ctx.clip();
        ctx.globalAlpha = 0.62;

        if (scope === 'all' && plannerLayerStates.walls.visible && !plannerLayerStates.walls.locked) {
          for (const [key, itemId] of Object.entries(project.cells)) {
            const [x, y] = key.split(',').map(Number);
            if (x < selectionBox.minX || x > selectionBox.maxX || y < selectionBox.minY || y > selectionBox.maxY) continue;
            const { x: destX, y: destY } = transformCell(x, y);
            const color = project.palette.find(candidate => candidate.id === itemId)?.hex ?? '#94a3b8';
            ctx.fillStyle = color;
            ctx.fillRect(bpX + destX * currentCellSize, bpY + destY * currentCellSize, currentCellSize, currentCellSize);
          }

        }

        if (scope !== 'objects' && plannerLayerStates.floors.visible && !plannerLayerStates.floors.locked) {
          for (const [key, itemId] of Object.entries(project.floorTiles ?? {})) {
            const [x, y] = key.split(',').map(Number);
            if (x < selectionBox.minX || x > selectionBox.maxX || y < selectionBox.minY || y > selectionBox.maxY) continue;
            const { x: destX, y: destY } = transformCell(x, y);
            const floor = FLOOR_ITEM_BY_ID.get(itemId);
            const image = getSpriteImage(floor?.placementImageUrl ?? floor?.imageUrl);
            if (image) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(image, bpX + destX * currentCellSize, bpY + destY * currentCellSize, currentCellSize, currentCellSize);
            } else {
              ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
              ctx.fillRect(bpX + destX * currentCellSize, bpY + destY * currentCellSize, currentCellSize, currentCellSize);
            }
          }
        }

        if (scope !== 'floors') {
          for (const placement of project.storagePlacements ?? []) {
            if (placement.x < selectionBox.minX || placement.y < selectionBox.minY ||
              placement.x + placement.width - 1 > selectionBox.maxX || placement.y + placement.height - 1 > selectionBox.maxY) continue;
            const layerId = getStoragePlacementLayerId(placement, STORAGE_ITEM_BY_ID.get(placement.itemId));
            if (!plannerLayerStates[layerId].visible || plannerLayerStates[layerId].locked) continue;
            const { x: destX, y: destY } = transformPlacement(placement);
            ctx.fillStyle = placement.layer === 'light' ? '#fde047' : placement.layer === 'rail' ? '#a78bfa' : '#22d3ee';
            ctx.fillRect(bpX + destX * currentCellSize, bpY + destY * currentCellSize, placement.width * currentCellSize, placement.height * currentCellSize);
          }
        }

        const previewX = bpX + previewBox.minX * currentCellSize;
        const previewY = bpY + previewBox.minY * currentCellSize;
        const previewW = (previewBox.maxX - previewBox.minX + 1) * currentCellSize;
        const previewH = (previewBox.maxY - previewBox.minY + 1) * currentCellSize;
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.10)';
        ctx.fillRect(previewX, previewY, previewW, previewH);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 4]);
        ctx.strokeRect(previewX, previewY, previewW, previewH);
        ctx.setLineDash([]);

        if (currentCellSize >= 10) {
          const label = isMirrorCopy
            ? horizontal
              ? (language === 'es' ? 'COPIA ESPEJO E ↔ O' : 'MIRROR COPY E ↔ W')
              : (language === 'es' ? 'COPIA ESPEJO N ↕ S' : 'MIRROR COPY N ↕ S')
            : horizontal
              ? (language === 'es' ? 'VISTA PREVIA VOLTEO H' : 'FLIP PREVIEW H')
              : (language === 'es' ? 'VISTA PREVIA VOLTEO V' : 'FLIP PREVIEW V');
          ctx.font = 'bold 10px sans-serif';
          const labelWidth = ctx.measureText(label).width + 12;
          const labelX = Math.max(bpX + 2, Math.min(previewX, bpX + bpW - labelWidth - 2));
          const labelY = Math.max(bpY + 2, previewY - 18);
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(labelX, labelY, labelWidth, 15);
          ctx.fillStyle = '#ecfeff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, labelX + labelWidth / 2, labelY + 7.5);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        }
        ctx.restore();
      }

      // 7. Hover Cell cursor indicator (Black in Light Mode, White in Dark Mode)
      if (hoverCell && !isPanning) {
        const hX = bpX + hoverCell.x * currentCellSize;
        const hY = bpY + hoverCell.y * currentCellSize;

        if (gridTheme === 'light') {
          // Light mode: solid black box indicator with inner white contrast line
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(hX, hY, currentCellSize, currentCellSize);

          if (currentCellSize >= 8) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.strokeRect(hX + 1, hY + 1, Math.max(0, currentCellSize - 2), Math.max(0, currentCellSize - 2));
          }
        } else {
          // Dark mode: solid bright white indicator with inner amber accent
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(hX, hY, currentCellSize, currentCellSize);

          if (currentCellSize >= 8) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
            ctx.lineWidth = 1;
            ctx.strokeRect(hX + 1, hY + 1, Math.max(0, currentCellSize - 2), Math.max(0, currentCellSize - 2));
          }
        }

        if ((activeTool === 'pencil' || activeTool === 'eraser') && brushSize > 1) {
          const offset = Math.floor(brushSize / 2);
          const brushCells = new Map<string, CellCoord>();
          for (let dy = 0; dy < brushSize; dy++) {
            for (let dx = 0; dx < brushSize; dx++) {
              const x = hoverCell.x + dx - offset;
              const y = hoverCell.y + dy - offset;
              for (const cell of getMirroredCoords(x, y, project.width, project.height, mirrorMode)) {
                brushCells.set(coordKey(cell.x, cell.y), cell);
              }
            }
          }
          ctx.save();
          ctx.fillStyle = activeTool === 'eraser' ? 'rgba(248, 113, 113, 0.18)' : 'rgba(245, 158, 11, 0.16)';
          ctx.strokeStyle = activeTool === 'eraser' ? '#f87171' : '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          for (const cell of brushCells.values()) {
            const cellX = bpX + cell.x * currentCellSize;
            const cellY = bpY + cell.y * currentCellSize;
            ctx.fillRect(cellX, cellY, currentCellSize, currentCellSize);
            ctx.strokeRect(cellX + 0.75, cellY + 0.75, Math.max(0, currentCellSize - 1.5), Math.max(0, currentCellSize - 1.5));
          }
          ctx.restore();
        }

        // Mirror Ghost Hover indicators
        if (mirrorSupported && mirrorMode !== 'none') {
          const mirroredGhosts = getMirroredCoords(hoverCell.x, hoverCell.y, project.width, project.height, mirrorMode);
          for (const m of mirroredGhosts) {
            if (m.x !== hoverCell.x || m.y !== hoverCell.y) {
              const mX = bpX + m.x * currentCellSize;
              const mY = bpY + m.y * currentCellSize;
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 2;
              ctx.setLineDash([3, 3]);
              ctx.strokeRect(mX, mY, currentCellSize, currentCellSize);
              ctx.setLineDash([]);
              ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
              ctx.fillRect(mX, mY, currentCellSize, currentCellSize);
            }
          }
        }

        // Place Core or selected catalog object with the same footprint and height preview.
        if ((activeTool === 'place_storage' && selectedStorageItem) || activeTool === 'place_core') {
          const previewItem = activeTool === 'place_core' ? CORE_SPRITE_ITEM : selectedStorageItem!;
          const originX = activeTool === 'place_core' ? hoverCell.x - CORE_PATTERN_CENTER_OFFSET_X : hoverCell.x;
          const originY = activeTool === 'place_core' ? hoverCell.y - CORE_PATTERN_CENTER_OFFSET_Y : hoverCell.y;
          const { width: itemWidth, height: itemHeight } = previewItem;
          const x = bpX + originX * currentCellSize;
          const y = bpY + originY * currentCellSize;
          const w = itemWidth * currentCellSize;
          const h = itemHeight * currentCellSize;
          const fits = originX >= 0 && originY >= 0 && originX + itemWidth <= project.width && originY + itemHeight <= project.height;
          const previewSprite = previewItem.spriteId ? gameSprites[previewItem.spriteId] : undefined;
          const image = getSpriteImage(previewItem.placementImageUrl ?? previewSprite?.atlas ?? previewItem.imageUrl);
          const nativeSprite = image && previewItem.renderAtNativeScale && (previewItem.placementImageUrl || !previewSprite);
          const spriteBounds = nativeSprite && image ? getSpriteContentBounds(image) : null;
          const visualHeightTiles = previewItem.visualHeightTiles ?? (spriteBounds ? Math.max(itemHeight, spriteBounds.height / 16) : itemHeight);
          const visualWidthTiles = previewItem.visualWidthTiles ?? (spriteBounds ? Math.max(itemWidth, spriteBounds.width / 16) : itemWidth);
          const visualLeft = originX + (itemWidth - visualWidthTiles) / 2;
          const visualTop = originY + itemHeight - visualHeightTiles;
          const visualFits = visualLeft >= 0 && visualTop >= 0 && visualLeft + visualWidthTiles <= project.width && visualTop + visualHeightTiles <= project.height;
          const candidate: StorageItemPlacement = {
            id: 'placement-preview', itemId: previewItem.id, x: originX, y: originY,
            width: itemWidth, height: itemHeight, layer: previewItem.layer ?? 'object', rotation: 0,
          };
          const collidingPlacements = (project.storagePlacements ?? []).filter(item => storagePlacementsOverlap(candidate, item));
          const blocked = collidingPlacements.length > 0;
          const collidingTiles = collidingPlacements.flatMap(item => getStoragePlacementOverlapTiles(candidate, item));
          const wallBacked = previewItem.category !== 'wall_decoration' || Array.from({ length: itemWidth * itemHeight }, (_, index) => {
            const tileX = originX + (index % itemWidth);
            const tileY = originY + Math.floor(index / itemWidth);
            return Boolean(project.cells[`${tileX},${tileY}`]) || (project.storagePlacements ?? []).some(placement => {
              const wallItem = STORAGE_ITEM_BY_ID.get(placement.itemId);
              return (wallItem?.category === 'wall' || placement.layer === 'wall') &&
                tileX >= placement.x && tileX < placement.x + placement.width && tileY >= placement.y && tileY < placement.y + placement.height;
            });
          }).every(Boolean);
          const warnings: string[] = [];
          if (!fits || !visualFits) warnings.push(language === 'es' ? 'Fuera del plano' : 'Outside blueprint');
          if (blocked) {
            const blocker = collidingPlacements[0];
            const blockerDefinition = STORAGE_ITEM_BY_ID.get(blocker.itemId);
            const blockerName = blockerDefinition
              ? (language === 'es' ? blockerDefinition.nameEs : blockerDefinition.nameEn)
              : (language === 'es' ? 'objeto' : 'object');
            const collisionTile = collidingTiles[0];
            warnings.push(language === 'es'
              ? `Ocupado: ${blockerName} en ${collisionTile.x},${collisionTile.y}`
              : `Occupied: ${blockerName} at ${collisionTile.x},${collisionTile.y}`);
          }
          if (!wallBacked) warnings.push(language === 'es' ? 'Necesita pared detrás' : 'Needs a wall behind');
          const selectedLayerId = getStorageItemLayerId(previewItem, previewItem.layer);
          if (!plannerLayerStates[selectedLayerId].visible) warnings.push(language === 'es' ? 'La capa está oculta' : 'Layer is hidden');
          else if (!isPlannerLayerEditable(plannerLayerStates, selectedLayerId)) warnings.push(language === 'es' ? 'La capa está bloqueada' : 'Layer is locked');
          const valid = warnings.length === 0;
          ctx.fillStyle = valid || (blocked && fits && visualFits && wallBacked)
            ? 'rgba(245, 158, 11, 0.20)'
            : 'rgba(239, 68, 68, 0.24)';
          ctx.fillRect(x, y, w, h);
          // Keep the Core's bounding rectangle as a visual guide, but show red only on the
          // exact tiles that collide. A single occupied tile must not make the whole 19×13
          // sprite look like a solid blocker.
          if (blocked) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.64)';
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = Math.max(1, currentCellSize * 0.07);
            for (const tile of collidingTiles) {
              const tileX = bpX + tile.x * currentCellSize;
              const tileY = bpY + tile.y * currentCellSize;
              ctx.fillRect(tileX, tileY, currentCellSize, currentCellSize);
              ctx.strokeRect(tileX + 0.5, tileY + 0.5, currentCellSize - 1, currentCellSize - 1);
            }
          }
          if (image && fits) {
            ctx.save();
            ctx.globalAlpha = 0.72;
            ctx.imageSmoothingEnabled = false;
            if (previewItem.visualWidthTiles || previewItem.visualHeightTiles) {
              const visualX = bpX + visualLeft * currentCellSize;
              const visualY = bpY + visualTop * currentCellSize;
              if (previewSprite) {
                const sourceY = previewSprite.rect.origin === 'bottom-left'
                  ? image.naturalHeight - previewSprite.rect.y - previewSprite.rect.height
                  : previewSprite.rect.y;
                ctx.drawImage(image, previewSprite.rect.x, sourceY, previewSprite.rect.width, previewSprite.rect.height,
                  visualX, visualY, visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
              } else {
                drawStorageSprite(ctx, image, visualX, visualY, visualWidthTiles * currentCellSize, visualHeightTiles * currentCellSize);
              }
            } else if (previewItem.renderAtNativeScale && (previewItem.placementImageUrl || !previewSprite)) {
              drawNativeStorageSprite(ctx, image, x, y, w, h, currentCellSize);
            } else if (previewSprite) {
              const sourceY = previewSprite.rect.origin === 'bottom-left'
                ? image.naturalHeight - previewSprite.rect.y - previewSprite.rect.height
                : previewSprite.rect.y;
              ctx.drawImage(image, previewSprite.rect.x, sourceY, previewSprite.rect.width, previewSprite.rect.height, x, y, w, h);
            } else {
              drawStorageSprite(ctx, image, x, y, w, h);
            }
            ctx.restore();
          }
          ctx.strokeStyle = valid ? '#f59e0b' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.strokeRect(x, y, w, h);
          ctx.setLineDash([]);
          ctx.font = 'bold 11px monospace';
          const badge = `${language === 'es' ? 'Huella' : 'Footprint'} ${itemWidth}×${itemHeight} · ${language === 'es' ? 'Altura' : 'Height'} ${visualHeightTiles.toFixed(1)} t`;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(x, y - 20, ctx.measureText(badge).width + 12, 18);
          ctx.fillStyle = valid ? '#fbbf24' : '#fca5a5';
          ctx.fillText(badge, x + 6, y - 7);
          if (visualHeightTiles > itemHeight + 0.05 || visualWidthTiles > itemWidth + 0.05) {
            const visualW = visualWidthTiles * currentCellSize;
            const visualH = visualHeightTiles * currentCellSize;
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(x + (w - visualW) / 2, y + h - visualH, visualW, visualH);
            ctx.setLineDash([]);
          }
          warnings.forEach((warning, index) => {
            ctx.font = 'bold 10px sans-serif';
            const label = `⚠ ${warning}`;
            const warningWidth = ctx.measureText(label).width + 12;
            const warningY = y + h + 4 + index * 18;
            ctx.fillStyle = 'rgba(69, 10, 10, 0.94)';
            ctx.fillRect(x, warningY, warningWidth, 16);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, warningY, warningWidth, 16);
            ctx.fillStyle = '#fecaca';
            ctx.fillText(label, x + 6, warningY + 11);
          });
        }
      }

      // Floating clipboard preview follows the pointer until the user commits or cancels.
      if (pastePlacementMode && clipboard && hoverCell) {
        const scope = clipboard.scope ?? 'all';
        const validation = pastePreviewValidation;
        const previewColor = validation?.valid === false ? '#ef4444' :
          validation && (validation.overwrittenBlocks > 0 || validation.replacedFloors > 0) ? '#f59e0b' : '#22d3ee';
        ctx.save();
        ctx.beginPath();
        ctx.rect(bpX, bpY, bpW, bpH);
        ctx.clip();
        ctx.globalAlpha = validation?.valid === false ? 0.38 : 0.58;

        for (const item of clipboard.cells) {
          const x = hoverCell.x + item.relX;
          const y = hoverCell.y + item.relY;
          const color = project.palette.find(candidate => candidate.id === item.colorId)?.hex ?? '#94a3b8';
          ctx.fillStyle = validation?.valid === false ? '#ef4444' : color;
          ctx.fillRect(bpX + x * currentCellSize, bpY + y * currentCellSize, currentCellSize, currentCellSize);
        }

        if (scope !== 'objects') {
          for (const tile of clipboard.floorTiles ?? []) {
            const x = hoverCell.x + tile.relX;
            const y = hoverCell.y + tile.relY;
            const floor = FLOOR_ITEM_BY_ID.get(tile.itemId);
            const image = getSpriteImage(floor?.placementImageUrl ?? floor?.imageUrl);
            if (image) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(image, bpX + x * currentCellSize, bpY + y * currentCellSize, currentCellSize, currentCellSize);
            } else {
              ctx.fillStyle = '#22d3ee';
              ctx.fillRect(bpX + x * currentCellSize, bpY + y * currentCellSize, currentCellSize, currentCellSize);
            }
          }
        }

        for (const { relX, relY, ...placement } of clipboard.storagePlacements ?? []) {
          const x = hoverCell.x + relX;
          const y = hoverCell.y + relY;
          const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
          const gameSprite = item?.spriteId ? gameSprites[item.spriteId] : undefined;
          const image = getSpriteImage(item?.placementImageUrl ?? gameSprite?.atlas ?? item?.imageUrl);
          const drawX = bpX + x * currentCellSize;
          const drawY = bpY + y * currentCellSize;
          const drawWidth = placement.width * currentCellSize;
          const drawHeight = placement.height * currentCellSize;
          if (image) {
            if (item?.renderAtNativeScale && (item.placementImageUrl || !gameSprite)) {
              drawNativeStorageSprite(ctx, image, drawX, drawY, drawWidth, drawHeight, currentCellSize, placement.rotation ?? 0);
            } else {
              drawStorageSprite(ctx, image, drawX, drawY, drawWidth, drawHeight);
            }
          } else {
            ctx.fillStyle = validation?.valid === false ? '#ef4444' : '#22d3ee';
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
          }
          ctx.strokeStyle = previewColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
        }

        ctx.globalAlpha = 1;
        for (const box of validation?.conflictingBoxes ?? []) {
          const x = bpX + box.x * currentCellSize;
          const y = bpY + box.y * currentCellSize;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.fillRect(x, y, box.width * currentCellSize, box.height * currentCellSize);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, box.width * currentCellSize, box.height * currentCellSize);
        }

        const pasteX = bpX + hoverCell.x * currentCellSize;
        const pasteY = bpY + hoverCell.y * currentCellSize;
        ctx.strokeStyle = previewColor;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(pasteX, pasteY, clipboard.width * currentCellSize, clipboard.height * currentCellSize);
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Render annotations
      if (annotations.length > 0 && currentCellSize >= 6) {
        ctx.save();
        ctx.font = `bold ${Math.max(10, Math.min(14, currentCellSize * 0.5))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const ann of annotations) {
          const annX = bpX + ann.x * currentCellSize + currentCellSize / 2;
          const annY = bpY + ann.y * currentCellSize + currentCellSize / 2;

          // Only render if visible in viewport
          if (annX < 0 || annX > width || annY < 0 || annY > height) continue;

          // Text background bubble
          const textMetrics = ctx.measureText(ann.text);
          const bubbleW = textMetrics.width + 12;
          const bubbleH = Math.max(16, currentCellSize * 0.7);
          ctx.save();
          ctx.translate(annX, annY);
          ctx.rotate((ann.rotation ?? 0) * Math.PI / 180);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.strokeRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH);

          // Annotation text
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(ann.text, 0, 2);

          // Small dot at cell center
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, -bubbleH / 2 - 4, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      ctx.restore();
    };

    const scheduleRender = () => {
      if (animId !== null) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        animId = null;
        render();
      });
    };

    observedContainerSizeRef.current = { width: container.clientWidth, height: container.clientHeight };
    const handleContainerResize = () => {
      scheduleRender();
      const width = container.clientWidth;
      const height = container.clientHeight;
      const previousSize = observedContainerSizeRef.current;
      observedContainerSizeRef.current = { width, height };
      if (!previousSize || (previousSize.width === width && previousSize.height === height)) return;

      const cellSize = BASE_CELL_SIZE * zoomRef.current;
      setPan({
        x: Math.round((width - project.width * cellSize) / 2),
        y: Math.round((height - project.height * cellSize) / 2),
      });
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleContainerResize)
      : null;
    resizeObserver?.observe(container);
    window.addEventListener('resize', handleContainerResize);

    render();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleContainerResize);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [
    project,
    selectedStorageItem,
    gameSprites,
    pan,
    currentCellSize,
    showGrid,
    showMajorGrid,
    showCenterGuide,
    showCoordinates,
    showLightRanges,
    gridLineWidth,
    highContrastGrid,
    gridTheme,
    plannerLayerStates,
    activeTool,
    activeColor,
    rectangleMode,
    circleMode,
    circleOrigin,
    mirrorMode,
    selectionTransformPreview,
    clipboard,
    pastePlacementMode,
    pastePreviewValidation,
    selectionBox,
    selectedStoragePlacementId,
    storageDragPreview,
    hoverCell,
    isPanning,
    isPointerDown,
    dragStartCell,
    dragCurrentCell,
    annotations,
    doorOrientation,
    markRecentChanges,
    t,
  ]);

  // Contextual cursor based on active tool and theme
  const isDarkTheme = gridTheme === 'dark';
  const crosshair = isDarkTheme
    ? makeCrosshairCursor('#ffffff', '#000000')
    : makeCrosshairCursor('#000000', '#ffffff');
  const pencilCursor = isDarkTheme
    ? makePencilCursor('#000000', '#ffffff')
    : makePencilCursor('#ffffff', '#000000');
  const eraserCursor = isDarkTheme
    ? makeEraserCursor('#ffffff', '#000000')
    : makeEraserCursor('#000000', '#ffffff');
  const grabCursor = isDarkTheme ? makeGrabCursor('#ffffff') : makeGrabCursor('#000000');
  const grabbingCursor = isDarkTheme ? makeGrabbingCursor('#ffffff') : makeGrabbingCursor('#000000');

  const activeCursor = isSpaceHeld || isPanning || activeTool === 'hand'
    ? (isPointerDown ? grabbingCursor : grabCursor)
    : activeTool === 'pencil'
      ? pencilCursor
      : activeTool === 'eraser'
        ? eraserCursor
        : crosshair;

  const placementForRotationControls = activeTool === 'select' && !storageDragPreview
    ? (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId) ?? null
    : null;
  const mirrorSupported = ['pencil', 'eraser', 'line', 'rectangle', 'circle'].includes(activeTool);
  const materialDrawingTools: ToolType[] = ['pencil', 'line', 'rectangle', 'circle'];
  const activeObjectItem = activeTool === 'place_storage' || activeTool === 'fill' ? selectedStorageItem : null;
  const activeFloorTile = [...materialDrawingTools, 'fill'].includes(activeTool) ? selectedFloorItem : null;
  const usesActiveColor = (materialDrawingTools.includes(activeTool) && !activeFloorTile) || activeTool === 'fill';
  const hasActiveTarget = Boolean(activeObjectItem || activeFloorTile || usesActiveColor);
  const showTargetCard = hasActiveTarget || activeTool === 'place_storage';
  const applicableTools: ToolType[] = activeObjectItem
    ? ['place_storage', 'fill']
    : activeFloorTile
      ? ['pencil', 'line', 'rectangle', 'circle', 'fill']
      : usesActiveColor
        ? ['pencil', 'line', 'rectangle', 'circle', 'fill']
        : [];
  const activeTargetName = activeObjectItem
    ? (language === 'es' ? activeObjectItem.nameEs : activeObjectItem.nameEn)
    : activeFloorTile
      ? (language === 'es' ? activeFloorTile.nameEs : activeFloorTile.nameEn)
      : usesActiveColor
        ? getPaletteColorLabel(activeColor, t, language)
        : (language === 'es' ? 'Selecciona un objeto en el catálogo' : 'Select an object from the catalog');
  const activeTargetKind = activeObjectItem
    ? (language === 'es' ? 'Objeto listo para colocar' : 'Object ready to place')
    : activeFloorTile
      ? (language === 'es' ? 'Suelo activo' : 'Active floor')
      : usesActiveColor
        ? (language === 'es' ? 'Color activo' : 'Active color')
        : (language === 'es' ? 'Colocar objeto' : 'Place object');
  const rotationToolbarWidth = 184;
  const canvasWidth = containerRef.current?.clientWidth ?? 800;
  const rotationToolbarLeft = placementForRotationControls
    ? Math.max(8, Math.min(
      canvasWidth - rotationToolbarWidth - 8,
      pan.x + (placementForRotationControls.x + placementForRotationControls.width / 2) * currentCellSize - rotationToolbarWidth / 2,
    ))
    : 0;
  const rotationToolbarTop = placementForRotationControls
    ? Math.max(8, pan.y + placementForRotationControls.y * currentCellSize - 48)
    : 0;
  const selectedAnnotation = annotations.find(annotation => annotation.id === selectedAnnotationId) ?? null;
  const annotationToolbarWidth = 236;
  const annotationToolbarLeft = selectedAnnotation
    ? Math.max(8, Math.min(
      canvasWidth - annotationToolbarWidth - 8,
      pan.x + (selectedAnnotation.x + 0.5) * currentCellSize - annotationToolbarWidth / 2,
    ))
    : 0;
  const canvasHeight = containerRef.current?.clientHeight ?? 600;
  const annotationToolbarTop = selectedAnnotation
    ? Math.max(8, Math.min(
      canvasHeight - 48,
      pan.y + selectedAnnotation.y * currentCellSize - 52,
    ))
    : 0;
  const saveAnnotationEditor = () => {
    if (!annotationEditor) return;
    const text = annotationEditor.text.trim();
    if (!text) return;
    if (annotationEditor.mode === 'edit' && annotationEditor.annotationId) {
      onEditAnnotation(annotationEditor.annotationId, text);
    } else {
      onAddAnnotation(annotationEditor.x, annotationEditor.y, text);
    }
    setAnnotationEditor(null);
  };

  useEffect(() => {
    if (!annotationEditor) return;
    const focusFrame = requestAnimationFrame(() => {
      const textarea = annotationTextareaRef.current;
      textarea?.focus({ preventScroll: true });
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });
    return () => cancelAnimationFrame(focusFrame);
  }, [annotationEditor?.mode, annotationEditor?.annotationId]);

  return (
    <div
      ref={containerRef}
      style={{ cursor: pastePlacementMode ? (pastePreviewValidation?.valid === false ? 'not-allowed' : 'copy') : activeCursor }}
      className="relative flex-1 h-full w-full overflow-hidden bg-[#080f1c] select-none"
    >
      {placementForRotationControls && (
        <div
          className="absolute z-30 rounded-lg border border-cyan-500/50 bg-[#15171d]/95 px-2 py-1.5 shadow-xl backdrop-blur-sm"
          style={{ left: rotationToolbarLeft, top: rotationToolbarTop, width: rotationToolbarWidth }}
          onPointerDown={event => event.stopPropagation()}
          role="group"
          aria-label={t.objectRotation.title}
        >
          <div className="mb-1 text-center text-[9px] font-semibold uppercase tracking-wide text-cyan-200">
            {t.objectRotation.title}
          </div>
          <div className="grid grid-cols-4 gap-1">
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
                aria-pressed={(placementForRotationControls.rotation ?? 0) === option.rotation}
                title={`${t.objectRotation.direction(option.rotation)} · ${option.rotation}°`}
                className={`rounded py-0.5 text-base font-semibold leading-5 transition ${(placementForRotationControls.rotation ?? 0) === option.rotation ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-200 hover:bg-zinc-700 hover:text-white'}`}
              >
                {option.arrow}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedAnnotation && (
        <div
          className="absolute z-30 flex items-center gap-1 rounded-lg border border-amber-400/50 bg-[#0d1728]/95 p-1.5 shadow-xl backdrop-blur-md"
          style={{ left: annotationToolbarLeft, top: annotationToolbarTop, width: annotationToolbarWidth }}
          onPointerDown={event => event.stopPropagation()}
          role="group"
          aria-label={language === 'es' ? 'Acciones de nota' : 'Note actions'}
        >
          <span className="min-w-0 flex-1 truncate px-1 text-[10px] text-zinc-300" title={selectedAnnotation.text}>
            {selectedAnnotation.text}
          </span>
          <button
            type="button"
            onClick={() => onRotateAnnotation(selectedAnnotation.id)}
            title={`${language === 'es' ? 'Girar nota 90°' : 'Rotate note 90°'} · ${(selectedAnnotation.rotation ?? 0) + 90 > 270 ? 0 : (selectedAnnotation.rotation ?? 0) + 90}°`}
            aria-label={language === 'es' ? 'Girar nota 90 grados' : 'Rotate note 90 degrees'}
            className="flex h-7 shrink-0 items-center justify-center rounded-md border border-amber-500/30 px-2 text-amber-200 transition hover:bg-amber-500/15"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setAnnotationEditor({ mode: 'edit', annotationId: selectedAnnotation.id, x: selectedAnnotation.x, y: selectedAnnotation.y, text: selectedAnnotation.text })}
            title={language === 'es' ? 'Editar nota' : 'Edit note'}
            aria-label={language === 'es' ? 'Editar nota' : 'Edit note'}
            className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-cyan-500/30 px-2 text-[10px] font-medium text-cyan-100 transition hover:bg-cyan-500/15"
          >
            <Pencil className="h-3 w-3" />
            {language === 'es' ? 'Editar' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteAnnotation(selectedAnnotation.id);
              setSelectedAnnotationId(null);
            }}
            title={language === 'es' ? 'Eliminar nota' : 'Delete note'}
            aria-label={language === 'es' ? 'Eliminar nota' : 'Delete note'}
            className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-red-500/30 px-2 text-[10px] font-medium text-red-200 transition hover:bg-red-500/15"
          >
            <Trash2 className="h-3 w-3" />
            {language === 'es' ? 'Borrar' : 'Delete'}
          </button>
        </div>
      )}
      {annotationEditor && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onPointerDown={event => event.stopPropagation()}
        >
          <section
            className="w-full max-w-sm rounded-xl border border-[#2b3d58] bg-[#0d1728] p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="annotation-editor-title"
          >
            <h2 id="annotation-editor-title" className="mb-3 text-sm font-semibold text-cyan-100">
              {annotationEditor.mode === 'add'
                ? (language === 'es' ? 'Nueva nota' : 'New note')
                : (language === 'es' ? 'Editar nota' : 'Edit note')}
            </h2>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="annotation-editor-text">
              {language === 'es' ? 'Texto de la nota' : 'Note text'}
            </label>
            <textarea
              ref={annotationTextareaRef}
              id="annotation-editor-text"
              autoFocus
              rows={4}
              maxLength={500}
              value={annotationEditor.text}
              onChange={event => setAnnotationEditor({ ...annotationEditor, text: event.target.value })}
              onKeyDown={event => {
                if (event.key === 'Escape') setAnnotationEditor(null);
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) saveAnnotationEditor();
              }}
              placeholder={language === 'es' ? 'Escribe una nota para este plano…' : 'Write a note for this blueprint…'}
              className="w-full resize-y rounded-lg border border-[#2b3d58] bg-[#080f1c] px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/70"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAnnotationEditor(null)}
                className="rounded-lg border border-[#2b3d58] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={!annotationEditor.text.trim()}
                onClick={saveAnnotationEditor}
                className="rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {language === 'es' ? 'Guardar nota' : 'Save note'}
              </button>
            </div>
            <p className="mt-2 text-right text-[10px] text-zinc-500">Ctrl+Enter · {language === 'es' ? 'guardar' : 'save'}</p>
          </section>
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ cursor: pastePlacementMode ? (pastePreviewValidation?.valid === false ? 'not-allowed' : 'copy') : activeCursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverCell(null);
          onPasteHoverCell?.(null);
          setIsPointerDown(false);
          setIsPanning(false);
          setDraggingAnnotationId(null);
          setAnnotationDragStartCell(null);
        }}
        onContextMenu={event => event.preventDefault()}
        className="w-full h-full block touch-none"
      />

      {pastePlacementMode && hoverCell && <div
        className={`pointer-events-none absolute z-30 max-w-64 rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed shadow-xl backdrop-blur ${
          pastePreviewValidation?.valid === false
            ? 'border-red-400/60 bg-red-950/95 text-red-100'
            : pastePreviewValidation && (pastePreviewValidation.overwrittenBlocks > 0 || pastePreviewValidation.replacedFloors > 0)
              ? 'border-amber-400/60 bg-amber-950/95 text-amber-100'
              : 'border-cyan-400/60 bg-[#0d1728]/95 text-cyan-100'
        }`}
        style={{ left: hoverPointer.x, top: hoverPointer.y }}
      >
        <div className="font-semibold">
          {pastePreviewValidation?.valid === false
            ? pastePreviewValidation.outsideBlueprint
              ? (language === 'es' ? 'La copia se sale del plano' : 'Copy extends beyond the blueprint')
              : pastePreviewValidation.conflictingBoxes.length > 0
                ? language === 'es'
                  ? `${pastePreviewValidation.conflictingBoxes.length} objeto(s) ocupan este espacio`
                  : `${pastePreviewValidation.conflictingBoxes.length} object(s) occupy this space`
                : (language === 'es' ? 'No se puede pegar con las capas actuales' : 'Cannot paste with the current layers')
            : pastePreviewValidation && (pastePreviewValidation.overwrittenBlocks > 0 || pastePreviewValidation.replacedFloors > 0)
              ? (language === 'es' ? 'El pegado reemplazará contenido' : 'Pasting will replace content')
              : (language === 'es' ? 'Haz clic para pegar aquí' : 'Click to paste here')}
        </div>
        {pastePreviewValidation?.conflicts.length ? <div className="mt-0.5">{pastePreviewValidation.conflicts.slice(0, 2).join(', ')}{pastePreviewValidation.conflicts.length > 2 ? ` +${pastePreviewValidation.conflicts.length - 2}` : ''}</div> : null}
        {pastePreviewValidation && pastePreviewValidation.valid && (pastePreviewValidation.overwrittenBlocks > 0 || pastePreviewValidation.replacedFloors > 0) && <div className="mt-0.5">
          {language === 'es'
            ? `${pastePreviewValidation.overwrittenBlocks} bloques · ${pastePreviewValidation.replacedFloors} suelos`
            : `${pastePreviewValidation.overwrittenBlocks} blocks · ${pastePreviewValidation.replacedFloors} floors`}
        </div>}
        <div className="mt-1 text-[9px] opacity-70">Esc · {language === 'es' ? 'cancelar' : 'cancel'}</div>
      </div>}

      {/* Active material and contextual tools, beside canvas navigation */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-2">
        {showTargetCard && <div className="pointer-events-auto flex min-w-0 max-w-[calc(100%-250px)] flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#2b3d58] bg-[#0d1728]/95 px-3 py-2 shadow-xl backdrop-blur-md text-zinc-300">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 shadow-inner"
              style={{ backgroundColor: activeObjectItem ? '#17243a' : activeFloorTile ? (activeFloorTile.color ?? '#526679') : usesActiveColor ? activeColor.hex : '#17243a' }}
              aria-hidden="true"
            >
              {activeObjectItem || activeTool === 'place_storage' ? <PackageOpen className="h-4 w-4 text-cyan-200" /> : activeFloorTile ? <Grid2X2 className="h-4 w-4 text-white/90" /> : null}
            </span>
            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-cyan-200">{activeTargetKind}</div>
              <div className="max-w-48 truncate text-xs font-medium text-zinc-100" title={activeTargetName}>{activeTargetName}</div>
              <div className="text-[9px] font-mono text-zinc-500">
                {activeObjectItem || activeFloorTile
                  ? `${(activeObjectItem ?? activeFloorTile)!.width}×${(activeObjectItem ?? activeFloorTile)!.height} ${language === 'es' ? 'casillas' : 'tiles'}`
                  : usesActiveColor ? activeColor.hex : ''}
              </div>
            </div>
          </div>
          {applicableTools.length > 0 && <div className="flex items-center gap-2 border-l border-[#2b3d58] pl-3">
            <span className="shrink-0 text-[9px] text-zinc-500">{language === 'es' ? 'Se usa con' : 'Use with'}</span>
            <div className="flex items-center gap-1">
              {CONTEXT_TOOL_ICONS.filter(({ tool }) => applicableTools.includes(tool)).map(({ tool, icon: Icon }) => {
                const toolName = t.tools[tool];
                const isActive = activeTool === tool;
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => onSelectTool(tool)}
                    title={toolName}
                    aria-label={`${language === 'es' ? 'Activar' : 'Activate'} ${toolName}`}
                    aria-pressed={isActive}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition ${isActive ? 'border-amber-400/60 bg-amber-400/15 text-amber-200' : 'border-transparent text-zinc-400 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>}
        </div>}

      {/* Floating Canvas Navigation HUD Controls */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-xl border border-[#2b3d58] bg-[#0d1728]/95 p-1 shadow-xl backdrop-blur-md text-zinc-300">
        <button
          type="button"
          onClick={() => handleZoom(1 / 1.2)}
          title={`${t.zoomOut} (-)`}
          aria-label={t.zoomOut}
          className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-medium px-2 min-w-14 text-center text-zinc-200">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => handleZoom(1.2)}
          title={`${t.zoomIn} (+)`}
          aria-label={t.zoomIn}
          className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={onToggleGridTheme}
          title={`${t.gridBackground}: ${gridTheme === 'dark' ? t.gridBgLight : t.gridBgDark}`}
          aria-label={`${t.gridBackground}: ${gridTheme === 'dark' ? t.gridBgLight : t.gridBgDark}`}
          aria-pressed={gridTheme === 'light'}
          className={`p-1.5 rounded transition ${gridTheme === 'light' ? 'bg-amber-400/15 text-amber-200 hover:bg-amber-400/25' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
        >
          {gridTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => setZoom(1.0)}
          title={t.resetZoom}
          aria-label={t.resetZoom}
          className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition text-[11px] font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleCenter}
          title={t.centerCanvas}
          aria-label={t.centerCanvas}
          className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleFitToScreen}
          title={t.fitToScreen}
          aria-label={t.fitToScreen}
          className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      </div>

      {showClipboardPasteHint && !pastePlacementMode && clipboard && (
        <div className="absolute bottom-[4.5rem] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-cyan-400/40 bg-[#0d1728]/95 px-3 py-2 text-xs font-medium text-cyan-100 shadow-lg backdrop-blur-md">
          <span className="whitespace-nowrap">
            {language === 'es' ? 'Haz clic en Pegar para ver la previsualización' : 'Click Paste to see the preview'}
          </span>
          <button
            type="button"
            onClick={onDismissClipboardPasteHint}
            aria-label={language === 'es' ? 'Cerrar aviso' : 'Dismiss hint'}
            title={language === 'es' ? 'Cerrar' : 'Close'}
            className="rounded px-1 text-cyan-200/70 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Status & Coordinate Badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-xl border border-[#2b3d58] bg-[#0d1728]/95 px-3 py-2 shadow-lg backdrop-blur-md text-xs font-mono text-zinc-300">
        <div className="flex min-w-0 items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-zinc-400 uppercase text-[10px] tracking-wider">
            {t.tools[activeTool]}
          </span>
        </div>

        <div className="w-[1px] h-3 bg-zinc-800 mx-1" />

        {hoverCell ? (
          <span className="text-zinc-200">
            X: <strong className="text-amber-400">{hoverCell.x}</strong>, Y:{' '}
            <strong className="text-amber-400">{hoverCell.y}</strong>
          </span>
        ) : (
          <span className="text-zinc-500 italic">{t.outsideCanvas}</span>
        )}

        <div className="w-[1px] h-3 bg-zinc-800 mx-1 hidden sm:block" />

        <span className="text-zinc-500 text-[11px] hidden sm:inline">
          {project.width} × {project.height}
        </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleGrid}
            aria-pressed={showGrid}
            title={t.showGrid}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] transition ${showGrid ? 'bg-amber-400/10 text-amber-200' : 'text-zinc-400 hover:bg-[#17243a] hover:text-zinc-200'}`}
          >
            <Grid2X2 className="h-3.5 w-3.5" />
            <span>{t.showGrid}</span>
          </button>
          <span className="border-l border-[#2b3d58] pl-2 text-[10px] uppercase tracking-wide text-cyan-200">{language === 'es' ? 'Plano' : 'Blueprint'}</span>
        </div>
      </div>
    </div>
  );
};
