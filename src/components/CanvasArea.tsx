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
} from '../types/blueprint';
import { Translations } from '../i18n/translations';
import {
  coordKey,
  getBresenhamLine,
  getRectangleCells,
  getCircleCells,
  getMirroredCoords,
  normalizeBox,
  isInBounds,
  floodFill,
  moveCells,
  getCorePatternCells,
  stampCorePattern,
  CORE_PATTERN_WIDTH,
  CORE_PATTERN_HEIGHT,
  CORE_PATTERN_CENTER_OFFSET_X,
  CORE_PATTERN_CENTER_OFFSET_Y,
} from '../utils/gridLogic';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  RotateCcw,
} from 'lucide-react';

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
  activeColor: PaletteColor;
  rectangleMode: RectangleMode;
  circleMode?: ShapeMode;
  circleOrigin?: CircleOrigin;
  includeWaypoint?: boolean;
  mirrorMode?: MirrorMode;
  brushSize: number;
  showGrid: boolean;
  showMajorGrid: boolean;
  showCoordinates: boolean;
  gridLineWidth?: number;
  highContrastGrid?: boolean;
  gridTheme?: 'light' | 'dark';
  selectionBox: SelectionBox | null;
  onSetSelectionBox: (box: SelectionBox | null) => void;
  onUpdateCells: (newCells: Record<string, string>, description: string) => void;
  onZoomChange?: (zoom: number) => void;
  annotations: Annotation[];
  onAddAnnotation: (x: number, y: number) => void;
  onEditAnnotation: (annotationId: string) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onMoveAnnotation: (annotationId: string, x: number, y: number) => void;
  onDoorPlaced?: () => void;
  doorOrientation: DoorOrientation;
  t: Translations;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  project,
  activeTool,
  activeColor,
  rectangleMode,
  circleMode = 'outline',
  circleOrigin = 'center',
  includeWaypoint = true,
  mirrorMode = 'none',
  brushSize,
  showGrid,
  showMajorGrid,
  showCoordinates,
  gridLineWidth = 1.5,
  highContrastGrid = true,
  gridTheme = 'light',
  selectionBox,
  onSetSelectionBox,
  onUpdateCells,
  onZoomChange,
  annotations = [],
  onAddAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
  onMoveAnnotation,
  onDoorPlaced,
  doorOrientation = 'horizontal',
  t,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View transform state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover & interaction states
  const [hoverCell, setHoverCell] = useState<CellCoord | null>(null);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellCoord | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<CellCoord | null>(null);

  // Annotation drag state
  const [draggingAnnotationId, setDraggingAnnotationId] = useState<string | null>(null);
  const [annotationDragStartCell, setAnnotationDragStartCell] = useState<CellCoord | null>(null);

  // Door tooltip tracking (per session)
  const doorTooltipNotifiedRef = useRef<boolean>(false);

  // Space key held for quick panning
  const [isSpaceHeld, setIsSpaceHeld] = useState<boolean>(false);

  // Transient stroke buffer for continuous pencil/eraser drawing
  const strokeBufferRef = useRef<Record<string, string>>({});

  // Recently changed cells for subtle animation (key -> timestamp)
  const recentChangesRef = useRef<Record<string, number>>({});
  const ANIMATION_DURATION_MS = 400;

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
    if (e.button === 1 || isSpaceHeld || (activeTool === 'hand' && e.button === 0)) {
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

    setIsPointerDown(true);

    // Detectar primera puerta colocada (para tooltip de bienvenida)
    if (
      activeColor.id === 'door' &&
      !doorTooltipNotifiedRef.current &&
      onDoorPlaced
    ) {
      doorTooltipNotifiedRef.current = true;
      onDoorPlaced();
    }

    // Click izquierdo: iniciar arrastre de anotación existente
    if (annotations.length > 0 && cell) {
      const ann = annotations.find(a => a.x === cell.x && a.y === cell.y);
      if (ann) {
        setDraggingAnnotationId(ann.id);
        setAnnotationDragStartCell({ x: ann.x, y: ann.y });
        return;
      }
    }

    if (activeTool === 'move') {
      if (selectionBox) {
        setDragStartCell(cell || { x: selectionBox.minX, y: selectionBox.minY });
        setDragCurrentCell(cell || { x: selectionBox.minX, y: selectionBox.minY });
      }
      return;
    }

    if (activeTool === 'fill') {
      if (cell) {
        const updated = floodFill(
          project.cells,
          cell.x,
          cell.y,
          activeColor.id,
          project.width,
          project.height
        );
        onUpdateCells(updated, 'Rellenar área');
      }
      return;
    }

    if (activeTool === 'place_core') {
      if (cell) {
        const { updatedCells } = stampCorePattern(
          project.cells,
          cell.x,
          cell.y,
          project.width,
          project.height,
          includeWaypoint
        );
        onUpdateCells(updatedCells, 'Colocar Core y Estatuas');
      }
      return;
    }

    if (activeTool === 'annotation') {
      if (cell) {
        const existing = annotations.find(a => a.x === cell.x && a.y === cell.y);
        if (existing && onEditAnnotation) {
          onEditAnnotation(existing.id);
        } else if (onAddAnnotation) {
          onAddAnnotation(cell.x, cell.y);
        }
      }
      return;
    }

    if (cell) {
      setDragStartCell(cell);
      setDragCurrentCell(cell);

      if (activeTool === 'pencil' || activeTool === 'eraser') {
        // Apply immediate initial stroke
        const workingCells = { ...project.cells };
        applyBrush(workingCells, cell.x, cell.y, activeTool === 'pencil' ? activeColor.id : null);
        strokeBufferRef.current = workingCells;
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
        const workingCells = { ...strokeBufferRef.current };
        applyBrush(workingCells, cell.x, cell.y, activeTool === 'pencil' ? activeColor.id : null);
        strokeBufferRef.current = workingCells;
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

    if (!isPointerDown) return;
    setIsPointerDown(false);

    // Finalizar arrastre de anotación
    if (draggingAnnotationId) {
      setDraggingAnnotationId(null);
      setAnnotationDragStartCell(null);
    }

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      markRecentChanges(strokeBufferRef.current);
      onUpdateCells(strokeBufferRef.current, activeTool === 'pencil' ? 'Lápiz' : 'Borrador');
      strokeBufferRef.current = {};
    } else if (activeTool === 'line' && dragStartCell && dragCurrentCell) {
      const lineCells = getBresenhamLine(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        project.width,
        project.height
      );
      const updated = { ...project.cells };
      for (const c of lineCells) {
        updated[coordKey(c.x, c.y)] = activeColor.id;
      }
      markRecentChanges(updated);
      onUpdateCells(updated, 'Línea');
    } else if (activeTool === 'rectangle' && dragStartCell && dragCurrentCell) {
      const rectCells = getRectangleCells(
        dragStartCell.x,
        dragStartCell.y,
        dragCurrentCell.x,
        dragCurrentCell.y,
        rectangleMode,
        project.width,
        project.height
      );
      const updated = { ...project.cells };
      for (const c of rectCells) {
        updated[coordKey(c.x, c.y)] = activeColor.id;
      }
      markRecentChanges(updated);
      onUpdateCells(updated, rectangleMode === 'outline' ? 'Muros de habitación' : 'Rectángulo lleno');
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
      const updated = { ...project.cells };
      for (const c of circleRes.cells) {
        updated[coordKey(c.x, c.y)] = activeColor.id;
      }
      markRecentChanges(updated);
      onUpdateCells(
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
      onSetSelectionBox(box);
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
        markRecentChanges(moved);
        onUpdateCells(moved, 'Mover selección');
        onSetSelectionBox({
          minX: Math.max(0, Math.min(project.width - 1, selectionBox.minX + dx)),
          minY: Math.max(0, Math.min(project.height - 1, selectionBox.minY + dy)),
          maxX: Math.max(0, Math.min(project.width - 1, selectionBox.maxX + dx)),
          maxY: Math.max(0, Math.min(project.height - 1, selectionBox.maxY + dy)),
        });
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

    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
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
      ctx.fillStyle = gridTheme === 'light' ? '#ffffff' : '#14151a';
      ctx.fillRect(bpX, bpY, bpW, bpH);

      // Viewport culling boundaries (only iterate over visible cells)
      const minVisibleX = Math.max(0, Math.floor(-bpX / currentCellSize));
      const maxVisibleX = Math.min(project.width - 1, Math.ceil((width - bpX) / currentCellSize));
      const minVisibleY = Math.max(0, Math.floor(-bpY / currentCellSize));
      const maxVisibleY = Math.min(project.height - 1, Math.ceil((height - bpY) / currentCellSize));

      // 3. Render cells (combine project cells + live stroke buffer)
      const activeRenderCells = isPointerDown && (activeTool === 'pencil' || activeTool === 'eraser')
        ? strokeBufferRef.current
        : project.cells;

      for (const [key, colorId] of Object.entries(activeRenderCells)) {
        const [xStr, yStr] = key.split(',');
        const cx = parseInt(xStr, 10);
        const cy = parseInt(yStr, 10);

        if (cx >= minVisibleX && cx <= maxVisibleX && cy >= minVisibleY && cy <= maxVisibleY) {
          const hex = colorMap.get(colorId) || '#64748b';
          const cellScreenX = bpX + cx * currentCellSize;
          const cellScreenY = bpY + cy * currentCellSize;

          // Render door as thin line (25% of cell thickness) with rotation
          if (colorId === 'door') {
            const doorThickness = currentCellSize * 0.25;
            const doorOffset = currentCellSize * 0.375; // (1 - 0.25) / 2 = 0.375

            ctx.save();
            ctx.fillStyle = hex;

            if (doorOrientation === 'horizontal') {
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

      // Blueprint outer frame
      ctx.strokeStyle = gridTheme === 'light' ? '#0f172a' : 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bpX, bpY, bpW, bpH);

      // 4.5 Symmetry Axis Indicators for Real-time Mirror Mode
      if (mirrorMode !== 'none') {
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
        if (activeTool === 'line') {
          const previewLine = getBresenhamLine(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            project.width,
            project.height
          );
          ctx.fillStyle = activeColor.hex;
          for (const c of previewLine) {
            const px = bpX + c.x * currentCellSize;
            const py = bpY + c.y * currentCellSize;
            ctx.fillRect(px, py, currentCellSize, currentCellSize);
            if (showGrid && currentCellSize >= 3) {
              ctx.strokeStyle = gridTheme === 'light' ? 'rgba(0, 0, 0, 0.90)' : 'rgba(0, 0, 0, 0.70)';
              ctx.lineWidth = Math.max(1, gridLineWidth);
              ctx.strokeRect(px, py, currentCellSize, currentCellSize);
            }
          }
        } else if (activeTool === 'rectangle') {
          const previewRect = getRectangleCells(
            dragStartCell.x,
            dragStartCell.y,
            dragCurrentCell.x,
            dragCurrentCell.y,
            rectangleMode,
            project.width,
            project.height
          );
          ctx.fillStyle = activeColor.hex;
          for (const c of previewRect) {
            const px = bpX + c.x * currentCellSize;
            const py = bpY + c.y * currentCellSize;
            ctx.fillRect(px, py, currentCellSize, currentCellSize);
            if (showGrid && currentCellSize >= 3) {
              ctx.strokeStyle = gridTheme === 'light' ? 'rgba(0, 0, 0, 0.90)' : 'rgba(0, 0, 0, 0.70)';
              ctx.lineWidth = Math.max(1, gridLineWidth);
              ctx.strokeRect(px, py, currentCellSize, currentCellSize);
            }
          }

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
          ctx.fillStyle = activeColor.hex;
          for (const c of previewCircle.cells) {
            const px = bpX + c.x * currentCellSize;
            const py = bpY + c.y * currentCellSize;
            ctx.fillRect(px, py, currentCellSize, currentCellSize);
            if (showGrid && currentCellSize >= 3) {
              ctx.strokeStyle = gridTheme === 'light' ? 'rgba(0, 0, 0, 0.90)' : 'rgba(0, 0, 0, 0.70)';
              ctx.lineWidth = Math.max(1, gridLineWidth);
              ctx.strokeRect(px, py, currentCellSize, currentCellSize);
            }
          }

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

        // Mirror Ghost Hover indicators
        if (mirrorMode !== 'none') {
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

        // Place Core Ghost Preview
        if (activeTool === 'place_core') {
          const pattern = getCorePatternCells(includeWaypoint);
          const originX = hoverCell.x - CORE_PATTERN_CENTER_OFFSET_X;
          const originY = hoverCell.y - CORE_PATTERN_CENTER_OFFSET_Y;

          // Outer bounding box
          const boxLeft = bpX + originX * currentCellSize;
          const boxTop = bpY + originY * currentCellSize;
          const boxW = CORE_PATTERN_WIDTH * currentCellSize;
          const boxH = CORE_PATTERN_HEIGHT * currentCellSize;

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(boxLeft, boxTop, boxW, boxH);
          ctx.setLineDash([]);

          for (const item of pattern) {
            const tx = originX + item.relX;
            const ty = originY + item.relY;
            if (isInBounds(tx, ty, project.width, project.height)) {
              const px = bpX + tx * currentCellSize;
              const py = bpY + ty * currentCellSize;

              if (item.part === 'waypoint') {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
              } else {
                ctx.fillStyle = 'rgba(236, 72, 153, 0.75)';
              }
              ctx.fillRect(px, py, currentCellSize, currentCellSize);

              ctx.strokeStyle = gridTheme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
              ctx.lineWidth = 1;
              ctx.strokeRect(px, py, currentCellSize, currentCellSize);
            }
          }

          // Badge pill indicating tool
          const badgeText = `★ ${t.placeCore.badge} (${CORE_PATTERN_WIDTH}×${CORE_PATTERN_HEIGHT})`;
          ctx.font = 'bold 12px monospace';
          const textMetrics = ctx.measureText(badgeText);
          const badgeX = boxLeft + boxW / 2 - textMetrics.width / 2 - 8;
          const badgeY = boxTop - 24;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
          ctx.fillRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(badgeX, badgeY, textMetrics.width + 16, 20);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(badgeText, badgeX + 8, badgeY + 14);
        }
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
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(annX - bubbleW / 2, annY - bubbleH / 2, bubbleW, bubbleH);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.strokeRect(annX - bubbleW / 2, annY - bubbleH / 2, bubbleW, bubbleH);

          // Annotation text
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(ann.text, annX, annY + 2);

          // Small dot at cell center
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(annX, annY - bubbleH / 2 - 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    };

    render();
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    project,
    pan,
    currentCellSize,
    showGrid,
    showMajorGrid,
    showCoordinates,
    gridLineWidth,
    highContrastGrid,
    gridTheme,
    activeTool,
    activeColor,
    rectangleMode,
    circleMode,
    circleOrigin,
    includeWaypoint,
    mirrorMode,
    selectionBox,
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

  return (
    <div
      ref={containerRef}
      style={{ cursor: activeCursor }}
      className="relative flex-1 h-full w-full overflow-hidden bg-[#101115] select-none"
    >
      <canvas
        ref={canvasRef}
        style={{ cursor: activeCursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverCell(null);
          setIsPointerDown(false);
          setIsPanning(false);
          setDraggingAnnotationId(null);
          setAnnotationDragStartCell(null);
        }}
        className="w-full h-full block touch-none"
      />

      {/* Floating Canvas Navigation HUD Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#18191f]/90 backdrop-blur-md border border-zinc-800 p-1 rounded-lg shadow-xl text-zinc-300">
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

      {/* Floating Status & Coordinate Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#18191f]/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono text-zinc-300">
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
    </div>
  );
};
