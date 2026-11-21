import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Annotation,
  BlueprintProject,
  CellCoord,
  ClipboardData,
  ClipboardPasteValidation,
  DoorOrientation,
  HistoryStep,
  Language,
  PaletteColor,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  SelectionBox,
  SelectionScope,
  SelectionTransformPreview,
  StorageItemPlacement,
  StorageItemRotation,
  ToolType,
  MirrorMode,
  PlannerLayerId,
  PlannerLayerStates,
} from './types/blueprint';
import { DEFAULT_PALETTE } from './utils/palette';
import { getDoorPlacementColorId, normalizeDoorCells } from './utils/doorCells';
import {
  copySelection,
  deleteSelection,
  fillSelection,
  pasteSelection,
  resizeGridCells,
  countCellsByColor,
  duplicateMirrorSelection,
  flipSelectionInPlace,
  getCenterOfGrid,
  centerSelectionHorizontally,
  centerSelectionVertically,
  centerSelectionBoth,
  moveCells,
} from './utils/gridLogic';
import {
  loadAutosave,
  parseProjectJson,
  saveAutosave,
  saveProjectToJson,
} from './utils/projectStorage';
import { loadRecoveryAutosave } from './utils/projectStorage';
import {
  createRecoverySnapshot,
  listRecoverySnapshots,
  RECOVERY_INTERVAL_MS,
  RecoverySnapshot,
  saveRecoverySnapshot,
} from './utils/recoveryHistory';
import { translations } from './i18n/translations';
import { Header } from './components/Header';
import { ToolBar } from './components/ToolBar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasArea } from './components/CanvasArea';
import { NewProjectModal } from './components/Modals/NewProjectModal';
import { ResizeModal } from './components/Modals/ResizeModal';
import { ExportModal } from './components/Modals/ExportModal';
import { ExportCodeModal } from './components/Modals/ExportCodeModal';
import { ImportCodeModal } from './components/Modals/ImportCodeModal';
import { RecoveryModal } from './components/Modals/RecoveryModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { BlockPaletteModal } from './components/Modals/BlockPaletteModal';
import { DEFAULT_ACTIVE_COLOR, paletteWithBlockColors } from './utils/blockCatalog';
import { CORE_SPRITE_ITEM, StorageItemDefinition } from './utils/storageCatalog';
import { migrateStructurePlacementsToColors, STORAGE_ITEM_BY_ID } from './utils/storageCatalog';
import { getStoragePlacementOverlapTiles, storagePlacementsOverlap } from './utils/storageFootprint';
import { GameSpriteEntry, loadGameSpriteCatalog } from './utils/gameSpriteCatalog';
import { FLOOR_ITEM_BY_ID } from './utils/floorCatalog';
import { DEFAULT_PLANNER_LAYER_STATES, getStorageItemLayerId, getStoragePlacementLayerId, isPlannerLayerEditable } from './utils/plannerLayers';

const INITIAL_PROJECT: BlueprintProject = {
  id: 'proj_default',
  name: 'Plano Base Core Keeper',
  width: 60,
  height: 50,
  cells: {},
  floorTiles: {},
  storagePlacements: [],
  palette: DEFAULT_PALETTE,
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function transformFloorSelection(
  floors: Record<string, string>,
  box: SelectionBox,
  axis: 'horizontal' | 'vertical',
  gridWidth: number,
  gridHeight: number,
  duplicate: boolean,
): Record<string, string> {
  const updated = { ...floors };
  const picked = Object.entries(floors).flatMap(([key, itemId]) => {
    const [x, y] = key.split(',').map(Number);
    return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY ? [{ x, y, itemId }] : [];
  });
  if (!duplicate) for (const tile of picked) delete updated[`${tile.x},${tile.y}`];
  for (const tile of picked) {
    const x = axis === 'horizontal' ? gridWidth - 1 - tile.x : tile.x;
    const y = axis === 'vertical' ? gridHeight - 1 - tile.y : tile.y;
    if (x >= 0 && y >= 0 && x < gridWidth && y < gridHeight) updated[`${x},${y}`] = tile.itemId;
  }
  return updated;
}

function validateClipboardPlacement(
  project: BlueprintProject,
  clipboard: ClipboardData,
  destX: number,
  destY: number,
  layerStates: PlannerLayerStates,
  language: Language,
): ClipboardPasteValidation {
  const outsideBlueprint = destX < 0 || destY < 0 ||
    destX + clipboard.width > project.width || destY + clipboard.height > project.height;
  const conflicts = new Set<string>();
  const conflictingBoxes = new Map<string, { x: number; y: number; width: number; height: number }>();
  const incoming: StorageItemPlacement[] = (clipboard.storagePlacements ?? []).map(({ relX, relY, ...item }, index) => ({
    ...item,
    id: `clipboard-preview-${index}`,
    x: destX + relX,
    y: destY + relY,
  }));
  const addConflict = (item: typeof incoming[number], reason?: string, occupiedOverlap?: Array<{ x: number; y: number }>) => {
    const definition = STORAGE_ITEM_BY_ID.get(item.itemId);
    const name = language === 'es' ? definition?.nameEs : definition?.nameEn;
    conflicts.add(`${name ?? item.itemId}${reason ? ` (${reason})` : ''}`);
    if (occupiedOverlap?.length) {
      for (const tile of occupiedOverlap) conflictingBoxes.set(`${tile.x},${tile.y},1,1`, { x: tile.x, y: tile.y, width: 1, height: 1 });
    } else {
      conflictingBoxes.set(`${item.x},${item.y},${item.width},${item.height}`, { x: item.x, y: item.y, width: item.width, height: item.height });
    }
  };
  const overlaps = (a: StorageItemPlacement, b: StorageItemPlacement) =>
    storagePlacementsOverlap(a, b);

  for (const item of incoming) {
    if (item.x < 0 || item.y < 0 || item.x + item.width > project.width || item.y + item.height > project.height) {
      addConflict(item, language === 'es' ? 'fuera del plano' : 'outside blueprint');
    }
    const layerId = getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId));
    if (!layerStates[layerId].visible || !isPlannerLayerEditable(layerStates, layerId)) {
      addConflict(item, language === 'es' ? 'capa oculta o bloqueada' : 'layer hidden or locked');
    }
    for (const existing of project.storagePlacements ?? []) {
      if (overlaps(item, existing)) {
        const itemHasSparseFootprint = Boolean(STORAGE_ITEM_BY_ID.get(item.itemId)?.occupiedTiles);
        const existingHasSparseFootprint = Boolean(STORAGE_ITEM_BY_ID.get(existing.itemId)?.occupiedTiles);
        addConflict(item, undefined, itemHasSparseFootprint || existingHasSparseFootprint ? getStoragePlacementOverlapTiles(item, existing) : undefined);
      }
    }
  }
  for (let index = 0; index < incoming.length; index++) {
    for (const other of incoming.slice(index + 1)) {
      if (overlaps(incoming[index], other)) {
        const eitherHasSparseFootprint = Boolean(STORAGE_ITEM_BY_ID.get(incoming[index].itemId)?.occupiedTiles || STORAGE_ITEM_BY_ID.get(other.itemId)?.occupiedTiles);
        const commonTiles = eitherHasSparseFootprint ? getStoragePlacementOverlapTiles(incoming[index], other) : undefined;
        addConflict(incoming[index], undefined, commonTiles);
        addConflict(other, undefined, commonTiles);
      }
    }
  }

  let overwrittenBlocks = 0;
  for (const item of clipboard.cells) {
    const x = destX + item.relX;
    const y = destY + item.relY;
    const existing = project.cells[`${x},${y}`];
    if (existing && existing !== item.colorId) overwrittenBlocks++;
  }

  let replacedFloors = 0;
  if ((clipboard.scope ?? 'all') !== 'objects') {
    const incomingFloors = new Map((clipboard.floorTiles ?? []).map(tile => [`${destX + tile.relX},${destY + tile.relY}`, tile.itemId]));
    for (const [key, itemId] of Object.entries(project.floorTiles ?? {})) {
      const [x, y] = key.split(',').map(Number);
      if (x < destX || x >= destX + clipboard.width || y < destY || y >= destY + clipboard.height) continue;
      if (incomingFloors.get(key) !== itemId) replacedFloors++;
    }
  }

  const changesBlocks = clipboard.cells.some(item => project.cells[`${destX + item.relX},${destY + item.relY}`] !== item.colorId);
  const changesFloors = replacedFloors > 0 || (clipboard.floorTiles ?? []).some(tile =>
    project.floorTiles?.[`${destX + tile.relX},${destY + tile.relY}`] !== tile.itemId,
  );
  if (changesBlocks && (!layerStates.walls.visible || !isPlannerLayerEditable(layerStates, 'walls'))) {
    conflicts.add(language === 'es' ? 'capa de bloques oculta o bloqueada' : 'block layer hidden or locked');
  }
  if (changesFloors && (!layerStates.floors.visible || !isPlannerLayerEditable(layerStates, 'floors'))) {
    conflicts.add(language === 'es' ? 'capa de suelos oculta o bloqueada' : 'floor layer hidden or locked');
  }

  return {
    valid: !outsideBlueprint && conflicts.size === 0,
    outsideBlueprint,
    conflicts: [...conflicts],
    conflictingBoxes: [...conflictingBoxes.values()],
    overwrittenBlocks,
    replacedFloors,
  };
}

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ck_language');
    if (saved === 'es' || saved === 'en') return saved;
    return 'es'; // default Spanish as requested
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ck_language', lang);
  };

  const t = translations[language];

  // 2. Blueprint project state
  const [project, setProject] = useState<BlueprintProject>(() => {
    const saved = loadAutosave();
    if (saved) return saved;
    return { ...INITIAL_PROJECT, name: translations[language].defaultProjectName };
  });
  const projectRef = useRef(project);
  const lastRecoverySignatureRef = useRef(JSON.stringify(project));
  const recoverySaveInProgressRef = useRef(false);

  // 3. Tool & Color state
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [rectangleMode, setRectangleMode] = useState<RectangleMode>('outline');
  const [circleMode, setCircleMode] = useState<ShapeMode>('outline');
  const [circleOrigin, setCircleOrigin] = useState<CircleOrigin>('center');
  const [mirrorMode, setMirrorMode] = useState<MirrorMode>('none');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [eraseObjectsWithEraser, setEraseObjectsWithEraser] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<PaletteColor>(() =>
    project.palette.find(color => color.id === DEFAULT_ACTIVE_COLOR.id) ?? DEFAULT_ACTIVE_COLOR,
  );
  const [doorOrientation, setDoorOrientation] = useState<DoorOrientation>('horizontal');

  // Door tooltip: shown once, persisted in localStorage
  const [showDoorTooltip, setShowDoorTooltip] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem('ck_door_tooltip_seen');
      return seen === null; // true if never seen
    } catch {
      return true;
    }
  });

  // Keep activeColor in sync if palette changes
  useEffect(() => {
    const current = project.palette.find(p => p.id === activeColor.id);
    if (current) {
      setActiveColor(current);
    } else if (project.palette.length > 0) {
      setActiveColor(project.palette.find(color => color.id === DEFAULT_ACTIVE_COLOR.id) ?? project.palette[0]);
    }
  }, [project.palette, activeColor.id]);

  // 4. Selection & Clipboard state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectionScope, setSelectionScope] = useState<SelectionScope>('all');
  const [selectionTransformPreview, setSelectionTransformPreview] = useState<SelectionTransformPreview | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [isPastePlacementMode, setIsPastePlacementMode] = useState(false);
  const [pasteTargetCell, setPasteTargetCell] = useState<CellCoord | null>(null);
  const [showClipboardPasteHint, setShowClipboardPasteHint] = useState(false);

  // 5. View state
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMajorGrid, setShowMajorGrid] = useState<boolean>(false);
  const [showCenterGuide, setShowCenterGuide] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showLightRanges, setShowLightRanges] = useState<boolean>(false);
  const [gridLineWidth, setGridLineWidth] = useState<number>(1.5);
  const [highContrastGrid, setHighContrastGrid] = useState<boolean>(true);
  const [gridTheme, setGridTheme] = useState<'light' | 'dark'>('dark');
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [plannerLayerStates, setPlannerLayerStates] = useState(DEFAULT_PLANNER_LAYER_STATES);
  const pastePreviewValidation = useMemo(() => (
    isPastePlacementMode && clipboard && pasteTargetCell
      ? validateClipboardPlacement(project, clipboard, pasteTargetCell.x, pasteTargetCell.y, plannerLayerStates, language)
      : null
  ), [isPastePlacementMode, clipboard, pasteTargetCell, project, plannerLayerStates, language]);


  // 6. History Undo / Redo
  const [history, setHistory] = useState<HistoryStep[]>(() => [
    {
      description: 'Estado inicial',
      cells: { ...project.cells },
      width: project.width,
      height: project.height,
      storagePlacements: project.storagePlacements ?? [],
      floorTiles: project.floorTiles ?? {},
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Push new history state
  const pushHistory = useCallback(
    (newCells: Record<string, string>, desc: string, width = project.width, height = project.height, storagePlacements = project.storagePlacements ?? [], floorTiles = project.floorTiles ?? {}) => {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newStep: HistoryStep = {
          description: desc,
          cells: newCells,
          width,
          height,
          storagePlacements,
          floorTiles,
        };
        const maxSteps = 50;
        const updated = [...sliced, newStep];
        return updated.length > maxSteps ? updated.slice(updated.length - maxSteps) : updated;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    },
    [historyIndex, project.width, project.height, project.storagePlacements, project.floorTiles]
  );

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIndex = historyIndex - 1;
    const step = history[targetIndex];
    if (step) {
      setHistoryIndex(targetIndex);
      setProject(prev => {
        const isEditable = (placement: StorageItemPlacement) => isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(placement, STORAGE_ITEM_BY_ID.get(placement.itemId)));
        const historyPlacements = step.storagePlacements ?? [];
        const updated = {
          ...prev,
          cells: isPlannerLayerEditable(plannerLayerStates, 'walls') ? { ...step.cells } : prev.cells,
          width: step.width,
          height: step.height,
          storagePlacements: [...historyPlacements.filter(isEditable), ...(prev.storagePlacements ?? []).filter(item => !isEditable(item))],
          floorTiles: isPlannerLayerEditable(plannerLayerStates, 'floors') ? (step.floorTiles ?? {}) : (prev.floorTiles ?? {}),
          updatedAt: new Date().toISOString(),
        };
        saveAutosave(updated);
        return updated;
      });
    }
  }, [canUndo, historyIndex, history, plannerLayerStates]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIndex = historyIndex + 1;
    const step = history[targetIndex];
    if (step) {
      setHistoryIndex(targetIndex);
      setProject(prev => {
        const isEditable = (placement: StorageItemPlacement) => isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(placement, STORAGE_ITEM_BY_ID.get(placement.itemId)));
        const historyPlacements = step.storagePlacements ?? [];
        const updated = {
          ...prev,
          cells: isPlannerLayerEditable(plannerLayerStates, 'walls') ? { ...step.cells } : prev.cells,
          width: step.width,
          height: step.height,
          storagePlacements: [...historyPlacements.filter(isEditable), ...(prev.storagePlacements ?? []).filter(item => !isEditable(item))],
          floorTiles: isPlannerLayerEditable(plannerLayerStates, 'floors') ? (step.floorTiles ?? {}) : (prev.floorTiles ?? {}),
          updatedAt: new Date().toISOString(),
        };
        saveAutosave(updated);
        return updated;
      });
    }
  }, [canRedo, historyIndex, history, plannerLayerStates]);

  // Update Cells with history recording and autosave
  const handleUpdateCells = useCallback(
    (newCells: Record<string, string>, description: string, storagePlacements = project.storagePlacements ?? [], floorTiles = project.floorTiles ?? {}) => {
      const safeCells = isPlannerLayerEditable(plannerLayerStates, 'walls') ? newCells : project.cells;
      const safeFloorTiles = isPlannerLayerEditable(plannerLayerStates, 'floors') ? floorTiles : (project.floorTiles ?? {});
      const existingPlacements = project.storagePlacements ?? [];
      const editableLayers = new Set<PlannerLayerId>(['floors', 'walls', 'objects', 'wallDecorations'].filter(layer =>
        isPlannerLayerEditable(plannerLayerStates, layer as PlannerLayerId)) as PlannerLayerId[]);
      const editableIncoming = storagePlacements.filter(item => editableLayers.has(getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))));
      const preservedLocked = existingPlacements.filter(item => !editableLayers.has(getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))));
      const safePlacements = [...editableIncoming, ...preservedLocked];
      setProject(prev => {
        const updated = {
          ...prev,
          cells: safeCells,
          storagePlacements: safePlacements,
          floorTiles: safeFloorTiles,
          updatedAt: new Date().toISOString(),
        };
        saveAutosave(updated);
        return updated;
      });
      setSelectedStoragePlacementId(current => current && !safePlacements.some(item => item.id === current) ? null : current);
      pushHistory(safeCells, description, project.width, project.height, safePlacements, safeFloorTiles);
    },
    [plannerLayerStates, project.cells, project.height, project.storagePlacements, project.width, project.floorTiles, pushHistory]
  );

  // Autosave when project changes
  useEffect(() => {
    setAutosaveAvailable(saveAutosave(project));
    setRecoveryProject(loadRecoveryAutosave());
  }, [project]);

  // 7. Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportCodeOpen, setIsExportCodeOpen] = useState(false);
  const [isImportCodeOpen, setIsImportCodeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBlockPaletteOpen, setIsBlockPaletteOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [selectedStorageItemId, setSelectedStorageItemId] = useState<string | null>(null);
  const [selectedFloorItemId, setSelectedFloorItemId] = useState<string | null>(null);
  const [selectedStoragePlacementId, setSelectedStoragePlacementId] = useState<string | null>(null);
  const [gameSprites, setGameSprites] = useState<Record<string, GameSpriteEntry>>({});
  const [recoveryProject, setRecoveryProject] = useState<BlueprintProject | null>(() => loadRecoveryAutosave());
  const [recoverySnapshots, setRecoverySnapshots] = useState<RecoverySnapshot[]>([]);
  const [recoveryHistoryAvailable, setRecoveryHistoryAvailable] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [autosaveAvailable, setAutosaveAvailable] = useState(true);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    let mounted = true;
    void listRecoverySnapshots()
      .then(snapshots => { if (mounted) setRecoverySnapshots(snapshots); })
      .catch(error => {
        console.warn('Could not load recovery history', error);
        if (mounted) setRecoveryHistoryAvailable(false);
      });

    const intervalId = window.setInterval(async () => {
      if (recoverySaveInProgressRef.current) return;
      const currentProject = projectRef.current;
      const signature = JSON.stringify(currentProject);
      if (signature === lastRecoverySignatureRef.current) return;

      recoverySaveInProgressRef.current = true;
      try {
        await saveRecoverySnapshot(createRecoverySnapshot(currentProject));
        lastRecoverySignatureRef.current = signature;
        const snapshots = await listRecoverySnapshots();
        if (mounted) {
          setRecoverySnapshots(snapshots);
          setRecoveryHistoryAvailable(true);
        }
      } catch (error) {
        console.warn('Could not create recovery point', error);
        if (mounted) setRecoveryHistoryAvailable(false);
      } finally {
        recoverySaveInProgressRef.current = false;
      }
    }, RECOVERY_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const togglePlannerLayerVisibility = useCallback((layer: PlannerLayerId) => {
    setPlannerLayerStates(prev => ({ ...prev, [layer]: { ...prev[layer], visible: !prev[layer].visible } }));
    if (selectedStoragePlacementId) {
      const selected = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId);
      if (selected && getStoragePlacementLayerId(selected, STORAGE_ITEM_BY_ID.get(selected.itemId)) === layer) setSelectedStoragePlacementId(null);
    }
  }, [project.storagePlacements, selectedStoragePlacementId]);

  const togglePlannerLayerLock = useCallback((layer: PlannerLayerId) => {
    setPlannerLayerStates(prev => ({ ...prev, [layer]: { ...prev[layer], locked: !prev[layer].locked } }));
    if (selectedStoragePlacementId) {
      const selected = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId);
      if (selected && getStoragePlacementLayerId(selected, STORAGE_ITEM_BY_ID.get(selected.itemId)) === layer) setSelectedStoragePlacementId(null);
    }
  }, [project.storagePlacements, selectedStoragePlacementId]);

  useEffect(() => {
    loadGameSpriteCatalog().then(setGameSprites).catch(() => setGameSprites({}));
  }, []);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleRecoverAutosave = useCallback(async () => {
    if (!recoveryProject) return;
    if (recoverySaveInProgressRef.current) return;
    recoverySaveInProgressRef.current = true;
    let recovered: BlueprintProject;
    try {
      await saveRecoverySnapshot(createRecoverySnapshot(projectRef.current));
      const snapshots = await listRecoverySnapshots();
      setRecoverySnapshots(snapshots);
      recovered = { ...recoveryProject, updatedAt: new Date().toISOString() };
      setAutosaveAvailable(saveAutosave(recovered));
    } catch (error) {
      console.warn('Could not protect the current plan before recovery', error);
      showToast(language === 'es'
        ? 'No se pudo proteger el plano actual. No se restauró el respaldo.'
        : 'The current blueprint could not be protected. The backup was not restored.');
      recoverySaveInProgressRef.current = false;
      return;
    }
    recoverySaveInProgressRef.current = false;
    projectRef.current = recovered;
    lastRecoverySignatureRef.current = JSON.stringify(recovered);
    setProject(recovered);
    setHistory([{
      description: language === 'es' ? 'Respaldo recuperado' : 'Recovered backup',
      cells: { ...recovered.cells },
      width: recovered.width,
      height: recovered.height,
      storagePlacements: recovered.storagePlacements ?? [],
      floorTiles: recovered.floorTiles ?? {},
    }]);
    setHistoryIndex(0);
    setSelectionBox(null);
    setSelectedStoragePlacementId(null);
    setSelectedStorageItemId(null);
    setSelectedFloorItemId(null);
    setIsRecoveryOpen(false);
    showToast(language === 'es' ? 'Se recuperó el respaldo automático.' : 'The autosave backup was recovered.');
  }, [language, recoveryProject, showToast]);

  const handleRecoverSnapshot = useCallback(async (snapshot: RecoverySnapshot) => {
    if (recoverySaveInProgressRef.current) return;
    recoverySaveInProgressRef.current = true;
    try {
      const currentProject = projectRef.current;
      if (JSON.stringify(currentProject) !== JSON.stringify(snapshot.project)) {
        await saveRecoverySnapshot(createRecoverySnapshot(currentProject));
        setRecoverySnapshots(await listRecoverySnapshots());
      }

      const recovered: BlueprintProject = { ...snapshot.project, updatedAt: new Date().toISOString() };
      setAutosaveAvailable(saveAutosave(recovered));
      projectRef.current = recovered;
      lastRecoverySignatureRef.current = JSON.stringify(recovered);
      setProject(recovered);
      setHistory([{
        description: language === 'es' ? 'Punto de recuperación restaurado' : 'Recovery point restored',
        cells: { ...recovered.cells },
        width: recovered.width,
        height: recovered.height,
        storagePlacements: recovered.storagePlacements ?? [],
        floorTiles: recovered.floorTiles ?? {},
      }]);
      setHistoryIndex(0);
      setSelectionBox(null);
      setSelectedStoragePlacementId(null);
      setSelectedStorageItemId(null);
      setSelectedFloorItemId(null);
      setIsRecoveryOpen(false);
      showToast(language === 'es'
        ? 'Se restauró el punto. El estado anterior quedó guardado en el historial.'
        : 'Recovery point restored. The previous state was kept in the history.');
    } catch (error) {
      console.warn('Could not protect the current plan before restoring a recovery point', error);
      showToast(language === 'es'
        ? 'No se pudo proteger el plano actual. No se restauró el punto.'
        : 'The current blueprint could not be protected. The recovery point was not restored.');
    } finally {
      recoverySaveInProgressRef.current = false;
    }
  }, [language, showToast]);

  const handleSetSelectionBox = useCallback((box: SelectionBox | null) => {
    setSelectionBox(box);
    if (box) setSelectedStoragePlacementId(null);
  }, []);

  const handleMoveSelection = useCallback((box: SelectionBox, deltaX: number, deltaY: number): boolean => {
    const scope = box.scope ?? 'all';
    const placements = project.storagePlacements ?? [];
    const selected = scope === 'floors' ? [] : placements.filter(item =>
      item.x >= box.minX && item.y >= box.minY &&
      item.x + item.width - 1 <= box.maxX && item.y + item.height - 1 <= box.maxY,
    ).filter(item => isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))));
    const selectedIds = new Set(selected.map(item => item.id));
    const movedPlacements = selected.map(item => ({ ...item, x: item.x + deltaX, y: item.y + deltaY }));
    const outside = movedPlacements.some(item => item.x < 0 || item.y < 0 || item.x + item.width > project.width || item.y + item.height > project.height);
    const overlapsExisting = movedPlacements.some(moving => placements.some(existing =>
      !selectedIds.has(existing.id) && storagePlacementsOverlap(moving, existing),
    ));
    const overlapsWithinSelection = movedPlacements.some((moving, index) => movedPlacements.slice(index + 1).some(other =>
      storagePlacementsOverlap(moving, other),
    ));
    if (outside || overlapsExisting || overlapsWithinSelection) {
      showToast(language === 'es'
        ? 'No se puede mover la selección: un objeto quedaría fuera del plano o chocaría con otro.'
        : 'Cannot move the selection: an item would leave the blueprint or overlap another item.');
      return false;
    }

    const movedCells = scope === 'all' && isPlannerLayerEditable(plannerLayerStates, 'walls')
      ? moveCells(project.cells, box, deltaX, deltaY, project.width, project.height) : project.cells;
    const movedFloorTiles = scope !== 'objects' && isPlannerLayerEditable(plannerLayerStates, 'floors')
      ? moveCells(project.floorTiles ?? {}, box, deltaX, deltaY, project.width, project.height) : (project.floorTiles ?? {});
    const movedById = new Map(movedPlacements.map(item => [item.id, item]));
    const nextPlacements = placements.map(item => movedById.get(item.id) ?? item);
    setProject(prev => {
      const updated = { ...prev, cells: movedCells, floorTiles: movedFloorTiles, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() };
      saveAutosave(updated);
      return updated;
    });
    pushHistory(movedCells, 'Mover selección', project.width, project.height, nextPlacements, movedFloorTiles);
    return true;
  }, [language, plannerLayerStates, project.cells, project.floorTiles, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  // 8. Selection Operations
  const getSelectionClipboard = useCallback((): ClipboardData | null => {
    let box = selectionBox;
    let placementsToCopy: StorageItemPlacement[] = [];
    let scope: SelectionScope = selectionBox?.scope ?? 'all';
    if (box) {
      placementsToCopy = scope === 'floors' ? [] : (project.storagePlacements ?? []).filter(item =>
        item.x >= box!.minX && item.y >= box!.minY &&
        item.x + item.width - 1 <= box!.maxX && item.y + item.height - 1 <= box!.maxY,
      );
    } else if (selectedStoragePlacementId) {
      const selected = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId);
      if (!selected) return null;
      box = { minX: selected.x, minY: selected.y, maxX: selected.x + selected.width - 1, maxY: selected.y + selected.height - 1 };
      placementsToCopy = [selected];
      scope = 'objects';
    } else {
      return null;
    }

    const clipboardData = copySelection(scope === 'all' && isPlannerLayerEditable(plannerLayerStates, 'walls') ? project.cells : {}, box);
    clipboardData.scope = scope;
    clipboardData.floorTiles = scope !== 'objects' && isPlannerLayerEditable(plannerLayerStates, 'floors') ? Object.entries(project.floorTiles ?? {}).flatMap(([key, itemId]) => {
      const [x, y] = key.split(',').map(Number);
      return x >= box!.minX && x <= box!.maxX && y >= box!.minY && y <= box!.maxY
        ? [{ relX: x - box!.minX, relY: y - box!.minY, itemId }]
        : [];
    }) : [];
    placementsToCopy = placementsToCopy.filter(item => isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))));
    if (!selectionBox) clipboardData.cells = [];
    clipboardData.storagePlacements = placementsToCopy.map(({ id: _id, x, y, ...item }) => ({
      ...item,
      relX: x - box!.minX,
      relY: y - box!.minY,
    }));
    return clipboardData;
  }, [plannerLayerStates, project.cells, project.floorTiles, project.storagePlacements, selectedStoragePlacementId, selectionBox]);

  const handleCopySelection = useCallback(() => {
    const data = getSelectionClipboard();
    if (!data) return;
    setIsPastePlacementMode(false);
    setPasteTargetCell(null);
    setClipboard(data);
    setShowClipboardPasteHint(true);
    showToast(t.alerts.copied);
  }, [getSelectionClipboard, showToast, t.alerts.copied]);

  const handleCutSelection = useCallback(() => {
    const data = getSelectionClipboard();
    if (!data) return;
    setIsPastePlacementMode(false);
    setPasteTargetCell(null);
    setClipboard(data);
    setShowClipboardPasteHint(true);
    const scope = selectionBox?.scope ?? 'all';
    const deleted = selectionBox && scope === 'all' ? deleteSelection(project.cells, selectionBox) : project.cells;
    const selectedIds = new Set(selectionBox && scope !== 'floors'
      ? (project.storagePlacements ?? []).filter(placement =>
        placement.x >= selectionBox.minX && placement.y >= selectionBox.minY &&
        placement.x + placement.width - 1 <= selectionBox.maxX && placement.y + placement.height - 1 <= selectionBox.maxY,
      ).map(placement => placement.id)
      : selectedStoragePlacementId ? [selectedStoragePlacementId] : []);
    const remainingPlacements = (project.storagePlacements ?? []).filter(item => !selectedIds.has(item.id));
    const deletedFloors = { ...(project.floorTiles ?? {}) };
    if (selectionBox && scope !== 'objects') for (const key of Object.keys(deletedFloors)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= selectionBox.minX && x <= selectionBox.maxX && y >= selectionBox.minY && y <= selectionBox.maxY) delete deletedFloors[key];
    }
    handleUpdateCells(deleted, 'Cortar selección', remainingPlacements, deletedFloors);
    setSelectedStoragePlacementId(null);
    showToast(t.alerts.cut);
  }, [getSelectionClipboard, selectionBox, project.cells, project.floorTiles, project.storagePlacements, selectedStoragePlacementId, handleUpdateCells, showToast, t.alerts.cut]);

  const handlePasteSelection = useCallback(() => {
    if (!clipboard) {
      showToast(t.alerts.clipboardEmpty);
      return;
    }
    setSelectionTransformPreview(null);
    setPasteTargetCell(null);
    setShowClipboardPasteHint(false);
    setIsPastePlacementMode(true);
    showToast(language === 'es'
      ? 'Mueve el cursor al plano y haz clic para pegar. Esc cancela.'
      : 'Move the cursor over the blueprint and click to paste. Esc cancels.');
  }, [clipboard, showToast, t.alerts.clipboardEmpty, language]);

  const handlePasteHoverCell = useCallback((cell: CellCoord | null) => {
    setPasteTargetCell(current => current?.x === cell?.x && current?.y === cell?.y ? current : cell);
  }, []);

  const handlePlaceClipboardAt = useCallback((destX: number, destY: number) => {
    if (!clipboard) return;
    const validation = validateClipboardPlacement(project, clipboard, destX, destY, plannerLayerStates, language);
    if (!validation.valid) {
      const parts: string[] = [];
      if (validation.outsideBlueprint) parts.push(language === 'es' ? 'La copia se sale del plano.' : 'The copy extends beyond the blueprint.');
      if (validation.conflicts.length > 0) {
        const names = validation.conflicts.slice(0, 2).join(', ');
        const more = validation.conflicts.length > 2 ? (language === 'es' ? ` y ${validation.conflicts.length - 2} más` : ` and ${validation.conflicts.length - 2} more`) : '';
        parts.push(language === 'es' ? `Espacio ocupado: ${names}${more}.` : `Occupied space: ${names}${more}.`);
      }
      showToast(parts.join(' '));
      return;
    }

    const copiedPlacements = clipboard.storagePlacements ?? [];
    const pastedPlacements = copiedPlacements.map(({ relX, relY, ...item }, index) => ({
      ...item,
      id: `storage_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      x: destX + relX,
      y: destY + relY,
    }));
    const currentPlacements = project.storagePlacements ?? [];
    const pasted = pasteSelection(project.cells, clipboard, destX, destY, project.width, project.height);
    const pastedFloors = { ...(project.floorTiles ?? {}) };
    if ((clipboard.scope ?? 'all') !== 'objects') {
      for (const [key] of Object.entries(pastedFloors)) {
        const [x, y] = key.split(',').map(Number);
        if (x >= destX && x < destX + clipboard.width && y >= destY && y < destY + clipboard.height) delete pastedFloors[key];
      }
    }
    for (const tile of (clipboard.scope ?? 'all') === 'objects' ? [] : clipboard.floorTiles ?? []) {
      const x = destX + tile.relX;
      const y = destY + tile.relY;
      if (x >= 0 && y >= 0 && x < project.width && y < project.height) pastedFloors[`${x},${y}`] = tile.itemId;
    }
    handleUpdateCells(pasted, 'Pegar portapapeles', [...currentPlacements, ...pastedPlacements], pastedFloors);
    handleSetSelectionBox({
      minX: destX,
      minY: destY,
      maxX: Math.min(project.width - 1, destX + clipboard.width - 1),
      maxY: Math.min(project.height - 1, destY + clipboard.height - 1),
      scope: clipboard.scope ?? 'all',
    });
    setIsPastePlacementMode(false);
    setPasteTargetCell(null);
    setShowClipboardPasteHint(false);
    const replacementNote = validation.overwrittenBlocks || validation.replacedFloors
      ? language === 'es'
        ? ` Se sustituyeron ${validation.overwrittenBlocks} bloques y ${validation.replacedFloors} suelos.`
        : ` Replaced ${validation.overwrittenBlocks} blocks and ${validation.replacedFloors} floors.`
      : '';
    showToast(`${t.alerts.pasted}${replacementNote}`);
  }, [clipboard, project, plannerLayerStates, language, handleUpdateCells, handleSetSelectionBox, showToast, t.alerts.pasted]);

  const handleDeleteSelection = useCallback(() => {
    if (!selectionBox) return;
    const scope = selectionBox.scope ?? 'all';
    const deleted = scope === 'all' ? deleteSelection(project.cells, selectionBox) : project.cells;
    const remainingPlacements = (project.storagePlacements ?? []).filter(item =>
      scope === 'floors' || !(item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
        item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY),
    );
    const remainingFloors = { ...(project.floorTiles ?? {}) };
    if (scope !== 'objects') {
      for (const key of Object.keys(remainingFloors)) {
        const [x, y] = key.split(',').map(Number);
        if (x >= selectionBox.minX && x <= selectionBox.maxX && y >= selectionBox.minY && y <= selectionBox.maxY) delete remainingFloors[key];
      }
    }
    handleUpdateCells(deleted, 'Eliminar selección', remainingPlacements, remainingFloors);
  }, [selectionBox, project.cells, project.floorTiles, project.storagePlacements, handleUpdateCells]);

  const handleFillSelection = useCallback(() => {
    if (!selectionBox) return;
    const scope = selectionBox.scope ?? 'all';
    if ((scope === 'floors' || (scope === 'all' && selectedFloorItemId)) && selectedFloorItemId) {
      const filledFloors = { ...(project.floorTiles ?? {}) };
      for (let y = selectionBox.minY; y <= selectionBox.maxY; y++) for (let x = selectionBox.minX; x <= selectionBox.maxX; x++) filledFloors[`${x},${y}`] = selectedFloorItemId;
      handleUpdateCells(project.cells, 'Rellenar suelo', undefined, filledFloors);
    } else if (scope === 'all') {
      const filled = fillSelection(project.cells, selectionBox, getDoorPlacementColorId(activeColor.id, doorOrientation), project.width, project.height);
      handleUpdateCells(filled, 'Rellenar selección');
    }
  }, [selectionBox, project.cells, project.floorTiles, selectedFloorItemId, activeColor.id, doorOrientation, project.width, project.height, handleUpdateCells]);

  const handleClearSelection = useCallback(() => {
    setSelectionBox(null);
  }, []);

  const handleDuplicateMirrorSelection = useCallback(
    (axis: 'horizontal' | 'vertical') => {
      if (!selectionBox) return;
      const scope = selectionBox.scope ?? 'all';
      const { updatedCells: mirroredCells, mirroredBox } = duplicateMirrorSelection(
        scope === 'all' ? project.cells : {}, selectionBox, axis, project.width, project.height,
      );
      const updatedCells = scope === 'all' ? mirroredCells : project.cells;
      const updatedFloorTiles = scope === 'objects'
        ? (project.floorTiles ?? {})
        : transformFloorSelection(project.floorTiles ?? {}, selectionBox, axis, project.width, project.height, true);

      const existingPlacements = project.storagePlacements ?? [];
      const mirroredPlacements: StorageItemPlacement[] = [];
      let skippedPlacements = 0;
      if (scope !== 'floors') {
        const sourcePlacements = existingPlacements.filter(item =>
          item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
          item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY &&
          plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible &&
          isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))),
        );

        for (const item of sourcePlacements) {
          const x = axis === 'horizontal' ? project.width - item.x - item.width : item.x;
          const y = axis === 'vertical' ? project.height - item.y - item.height : item.y;
          if (x === item.x && y === item.y) continue;

          const rotation = item.rotation ?? 0;
          const mirroredRotation = axis === 'horizontal'
            ? rotation === 90 ? 270 : rotation === 270 ? 90 : rotation
            : rotation === 0 ? 180 : rotation === 180 ? 0 : rotation;
          const mirroredItem: StorageItemPlacement = {
            ...item,
            id: `storage_${Date.now()}_mirror_${Math.random().toString(36).slice(2, 8)}`,
            x,
            y,
            rotation: mirroredRotation,
          };
          const collides = [...existingPlacements, ...mirroredPlacements].some(existing => storagePlacementsOverlap(mirroredItem, existing));
          if (collides) {
            skippedPlacements++;
            continue;
          }
          mirroredPlacements.push(mirroredItem);
        }
      }

      handleUpdateCells(
        updatedCells,
        `Duplicar espejo (${axis === 'horizontal' ? 'H' : 'V'})`,
        [...existingPlacements, ...mirroredPlacements],
        updatedFloorTiles,
      );
      setSelectionBox({ ...mirroredBox, scope });
      setSelectionTransformPreview(null);
      const message = axis === 'horizontal' ? t.mirror.duplicatedOppositeH : t.mirror.duplicatedOppositeV;
      showToast(skippedPlacements > 0
        ? `${message} ${language === 'es' ? `Objetos añadidos: ${mirroredPlacements.length}; omitidos por espacio ocupado: ${skippedPlacements}.` : `Objects added: ${mirroredPlacements.length}; skipped because space is occupied: ${skippedPlacements}.`}`
        : message);
    },
    [
      selectionBox,
      project.cells,
      project.floorTiles,
      project.storagePlacements,
      project.width,
      project.height,
      plannerLayerStates,
      handleUpdateCells,
      showToast,
      language,
      t.mirror.duplicatedOppositeH,
      t.mirror.duplicatedOppositeV,
    ]
  );

  const handleFlipSelection = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      if (!selectionBox) return;
      const scope = selectionBox.scope ?? 'all';
      const flippedCells = scope === 'all' ? flipSelectionInPlace(project.cells, selectionBox, direction) : project.cells;
      const flippedFloorTiles = scope === 'objects'
        ? (project.floorTiles ?? {})
        : transformFloorSelection(project.floorTiles ?? {}, selectionBox, direction, project.width, project.height, false);

      const existingPlacements = project.storagePlacements ?? [];
      const selectedPlacements = scope === 'floors' ? [] : existingPlacements.filter(item =>
        item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
        item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY &&
        plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible &&
        isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))),
      );
      const selectedPlacementIds = new Set(selectedPlacements.map(item => item.id));
      const flippedPlacements = selectedPlacements.map(item => {
        const rotation = item.rotation ?? 0;
        return {
          ...item,
          x: direction === 'horizontal' ? selectionBox.minX + selectionBox.maxX + 1 - item.x - item.width : item.x,
          y: direction === 'vertical' ? selectionBox.minY + selectionBox.maxY + 1 - item.y - item.height : item.y,
          rotation: direction === 'horizontal'
            ? rotation === 90 ? 270 : rotation === 270 ? 90 : rotation
            : rotation === 0 ? 180 : rotation === 180 ? 0 : rotation,
        };
      });
      const externalPlacements = existingPlacements.filter(item => !selectedPlacementIds.has(item.id));
      const hasOverlap = flippedPlacements.some((item, index) =>
        [...externalPlacements, ...flippedPlacements.slice(index + 1)].some(other =>
          (item.layer ?? 'object') === (other.layer ?? 'object') &&
      storagePlacementsOverlap(item, other),
        ),
      );
      if (hasOverlap) {
        showToast(language === 'es'
          ? 'No se volteó la selección: los objetos chocarían con otros elementos.'
          : 'The selection was not flipped because objects would overlap other items.');
        return;
      }
      setSelectionTransformPreview(null);
      const updatedPlacements = existingPlacements.map(item =>
        flippedPlacements.find(flipped => flipped.id === item.id) ?? item,
      );

      handleUpdateCells(
        flippedCells,
        `Voltear selección (${direction === 'horizontal' ? 'H' : 'V'})`,
        updatedPlacements,
        flippedFloorTiles,
      );
      showToast(
        direction === 'horizontal'
          ? t.mirror.flippedH
          : t.mirror.flippedV
      );
    },
    [
      selectionBox,
      project.cells,
      project.floorTiles,
      project.storagePlacements,
      plannerLayerStates,
      handleUpdateCells,
      showToast,
      language,
      t.mirror.flippedH,
      t.mirror.flippedV,
    ]
  );

  const handleCenterSelectionHorizontally = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionHorizontally(selectionBox, project.width, project.height);
    const dx = centered.minX - selectionBox.minX;
    if (dx !== 0 && !handleMoveSelection(selectionBox, dx, 0)) return;
    handleSetSelectionBox({ ...centered, scope: selectionBox.scope });
    showToast(t.mirror.centeredH);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredH]);

  const handleCenterSelectionVertically = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionVertically(selectionBox, project.width, project.height);
    const dy = centered.minY - selectionBox.minY;
    if (dy !== 0 && !handleMoveSelection(selectionBox, 0, dy)) return;
    handleSetSelectionBox({ ...centered, scope: selectionBox.scope });
    showToast(t.mirror.centeredV);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredV]);

  const handleCenterSelectionBoth = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionBoth(selectionBox, project.width, project.height);
    const dx = centered.minX - selectionBox.minX;
    const dy = centered.minY - selectionBox.minY;
    if ((dx !== 0 || dy !== 0) && !handleMoveSelection(selectionBox, dx, dy)) return;
    handleSetSelectionBox({ ...centered, scope: selectionBox.scope });
    showToast(t.mirror.centeredBoth);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredBoth]);

  // Annotation handlers
  const handleAddAnnotation = useCallback((x: number, y: number, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const newAnnotation: Annotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x,
      y,
      text: trimmedText,
    };
    setProject(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation],
      updatedAt: new Date().toISOString(),
    }));
    showToast(t.annotationAdded);
  }, [showToast, t.annotationAdded]);

  const handleEditAnnotation = useCallback((annotationId: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.map(a =>
        a.id === annotationId ? { ...a, text: trimmedText } : a
      ),
      updatedAt: new Date().toISOString(),
    }));
    showToast(t.annotationUpdated);
  }, [showToast, t.annotationUpdated]);

  const handleDeleteAnnotation = useCallback((annotationId: string) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== annotationId),
      updatedAt: new Date().toISOString(),
    }));
    showToast(t.annotationDeleted);
  }, [showToast, t.annotationDeleted]);

  const handleRotateAnnotation = useCallback((annotationId: string) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.map(annotation => annotation.id === annotationId
        ? { ...annotation, rotation: (((annotation.rotation ?? 0) + 90) % 360) as StorageItemRotation }
        : annotation),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleMoveAnnotation = useCallback((annotationId: string, x: number, y: number) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.map(a =>
        a.id === annotationId ? { ...a, x, y } : a
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, [showToast]);

  // Door tooltip handlers
  const handleDoorPlaced = useCallback(() => {
    if (!showDoorTooltip) return;
    // El tooltip se muestra cuando se coloca la primera puerta
  }, [showDoorTooltip]);

  const handleDismissDoorTooltip = useCallback(() => {
    setShowDoorTooltip(false);
    try {
      localStorage.setItem('ck_door_tooltip_seen', 'true');
    } catch {
      // ignore storage errors
    }
  }, []);

  // 9. Resize & Clear Blueprint
  const handleApplyResize = (newWidth: number, newHeight: number) => {
    const { updatedCells } = resizeGridCells(project.cells, newWidth, newHeight);
    const { updatedCells: resizedFloorTiles } = resizeGridCells(project.floorTiles ?? {}, newWidth, newHeight);
    const storagePlacements = (project.storagePlacements ?? []).filter(item =>
      item.x + item.width <= newWidth && item.y + item.height <= newHeight,
    );
    setProject(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      cells: updatedCells,
      floorTiles: resizedFloorTiles,
      storagePlacements,
      updatedAt: new Date().toISOString(),
    }));
    pushHistory(updatedCells, `Redimensionar a ${newWidth}×${newHeight}`, newWidth, newHeight, storagePlacements, resizedFloorTiles);
    if (selectionBox) {
      if (selectionBox.minX >= newWidth || selectionBox.minY >= newHeight) {
        setSelectionBox(null);
      } else {
        setSelectionBox({
          minX: selectionBox.minX,
          minY: selectionBox.minY,
          maxX: Math.min(newWidth - 1, selectionBox.maxX),
          maxY: Math.min(newHeight - 1, selectionBox.maxY),
          scope: selectionBox.scope,
        });
      }
    }
  };

  const handleClearBlueprint = () => {
    setProject(prev => ({ ...prev, cells: {}, floorTiles: {}, storagePlacements: [], updatedAt: new Date().toISOString() }));
    pushHistory({}, 'Limpiar plano', project.width, project.height, [], {});
    setSelectionBox(null);
  };

  // 10. New & Load Project
  const handleConfirmNewProject = (name: string, width: number, height: number, theme: 'light' | 'dark') => {
    const fresh: BlueprintProject = {
      id: `proj_${Date.now()}`,
      name,
      width,
      height,
      cells: {},
      floorTiles: {},
      storagePlacements: [],
      palette: project.palette,
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProject(fresh);
    setGridTheme(theme);
    setSelectionBox(null);
    setHistory([
      {
        description: 'Nuevo plano',
        cells: {},
        width,
        height,
        storagePlacements: [],
        floorTiles: {},
      },
    ]);
    setHistoryIndex(0);
  };

  const handleOpenProjectJson = async (file: File) => {
    try {
      const text = await file.text();
      const loaded = parseProjectJson(text);
      setProject(loaded);
      setSelectionBox(null);
      setHistory([
        {
          description: 'Plano importado',
          cells: { ...loaded.cells },
          width: loaded.width,
          height: loaded.height,
          storagePlacements: loaded.storagePlacements ?? [],
          floorTiles: loaded.floorTiles ?? {},
        },
      ]);
      setHistoryIndex(0);
      showToast(t.alerts.projectLoaded);
    } catch (err) {
      console.error(err);
      showToast(t.alerts.invalidJson);
    }
  };

  const handleSaveProjectJson = () => {
    saveProjectToJson(project);
    showToast(t.alerts.projectSaved);
  };

  // Share code handlers
  const handleExportCode = () => {
    setIsExportCodeOpen(true);
  };

  const handleImportCode = () => {
    setIsImportCodeOpen(true);
  };

  const handleImportCodeFromData = (projectData: Partial<BlueprintProject>) => {
    const migratedStructures = migrateStructurePlacementsToColors(
      normalizeDoorCells(projectData.cells ?? {}),
      projectData.storagePlacements ?? [],
      projectData.floorTiles ?? {},
    );
    setProject(prev => ({
      ...prev,
      width: projectData.width ?? prev.width,
      height: projectData.height ?? prev.height,
      cells: projectData.cells || projectData.storagePlacements ? migratedStructures.cells : prev.cells,
      floorTiles: projectData.cells || projectData.storagePlacements || projectData.floorTiles ? migratedStructures.floorTiles : prev.floorTiles ?? {},
      storagePlacements: projectData.storagePlacements ? migratedStructures.storagePlacements : prev.storagePlacements ?? [],
      palette: paletteWithBlockColors(projectData.palette ?? prev.palette),
      annotations: projectData.annotations ?? prev.annotations,
      updatedAt: new Date().toISOString(),
    }));
    setSelectionBox(null);
    showToast(t.alerts.projectLoaded);
  };

  const handlePlaceStorageItem = useCallback((x: number, y: number, item: StorageItemDefinition): boolean => {
    const itemLayer = getStorageItemLayerId(item, item.layer);
    if (!isPlannerLayerEditable(plannerLayerStates, itemLayer)) return false;
    const currentPlacements = project.storagePlacements ?? [];
    if (x + item.width > project.width || y + item.height > project.height) {
      showToast(language === 'es' ? 'El objeto queda fuera del plano.' : 'The item would extend beyond the blueprint.');
      return false;
    }
    const layer = item.layer ?? 'object';
    const candidate: StorageItemPlacement = { id: 'placement-candidate', itemId: item.id, x, y, width: item.width, height: item.height, layer };
    const overlaps = currentPlacements.some(existing => storagePlacementsOverlap(candidate, existing));
    if (overlaps) {
      showToast(language === 'es' ? 'Ese espacio ya está ocupado por otro objeto.' : 'That space is occupied by another item.');
      return false;
    }
    const nextPlacements = [...currentPlacements, {
      id: `storage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      itemId: item.id,
      x,
      y,
      width: item.width,
      height: item.height,
      layer,
      lightRadius: item.defaultLightRadius,
      rotation: 0 as const,
    }];
    const placedId = nextPlacements[nextPlacements.length - 1].id;
    setSelectedStoragePlacementId(placedId);
    setProject(prev => {
      const updated = { ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() };
      saveAutosave(updated);
      return updated;
    });
    pushHistory(project.cells, `Colocar ${language === 'es' ? item.nameEs : item.nameEn} (${item.width}×${item.height})`, project.width, project.height, nextPlacements);
    return true;
  }, [language, plannerLayerStates, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleCenterCoreOnBlueprint = useCallback(() => {
    const center = getCenterOfGrid(project.width, project.height);
    if (handlePlaceStorageItem(center.x - 9, center.y - 7, CORE_SPRITE_ITEM)) {
      showToast(t.placeCore.placedSuccessToast);
    }
  }, [handlePlaceStorageItem, project.height, project.width, showToast, t.placeCore.placedSuccessToast]);

  const handleRemoveStorageItems = useCallback((placementIds: string[]) => {
    const requestedIds = new Set(placementIds);
    const placements = project.storagePlacements ?? [];
    const removableIds = new Set(placements
      .filter(item => requestedIds.has(item.id) && isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))))
      .map(item => item.id));
    if (removableIds.size === 0) return;
    const nextPlacements = placements.filter(item => !removableIds.has(item.id));
    setProject(prev => {
      const updated = { ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() };
      saveAutosave(updated);
      return updated;
    });
    pushHistory(project.cells, removableIds.size === 1 ? 'Eliminar objeto de almacenamiento' : `Eliminar ${removableIds.size} objetos`, project.width, project.height, nextPlacements);
    setSelectedStoragePlacementId(current => current && removableIds.has(current) ? null : current);
  }, [plannerLayerStates, project.cells, project.storagePlacements, project.width, project.height, pushHistory]);

  const handleRemoveStorageItem = useCallback((placementId: string) => {
    handleRemoveStorageItems([placementId]);
  }, [handleRemoveStorageItems]);

  const handleMoveStorageItem = useCallback((placementId: string, x: number, y: number) => {
    const placements = project.storagePlacements ?? [];
    const moving = placements.find(item => item.id === placementId);
    if (!moving || (moving.x === x && moving.y === y)) return;
    if (!isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(moving, STORAGE_ITEM_BY_ID.get(moving.itemId)))) return;
    const candidate = { ...moving, x, y };
    const overlaps = placements.some(item => item.id !== placementId && storagePlacementsOverlap(candidate, item));
    if (x < 0 || y < 0 || x + moving.width > project.width || y + moving.height > project.height || overlaps) {
      showToast(language === 'es' ? 'No se puede mover: el espacio está fuera del plano u ocupado.' : 'Cannot move: the space is outside the blueprint or occupied.');
      return;
    }
    const nextPlacements = placements.map(item => item.id === placementId ? { ...item, x, y } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, 'Mover objeto', project.width, project.height, nextPlacements);
  }, [language, plannerLayerStates, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleRotateStorageItem = useCallback((placementId: string, rotation: StorageItemRotation) => {
    const placements = project.storagePlacements ?? [];
    const current = placements.find(item => item.id === placementId);
    if (!current) return;
    if (!isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(current, STORAGE_ITEM_BY_ID.get(current.itemId)))) return;
    if ((current.rotation ?? 0) === rotation) return;
    const definition = STORAGE_ITEM_BY_ID.get(current.itemId);
    const wasQuarterTurn = current.rotation === 90 || current.rotation === 270;
    const baseWidth = definition?.width ?? (wasQuarterTurn ? current.height : current.width);
    const baseHeight = definition?.height ?? (wasQuarterTurn ? current.width : current.height);
    const needsSwap = rotation === 90 || rotation === 270;
    const width = needsSwap ? baseHeight : baseWidth;
    const height = needsSwap ? baseWidth : baseHeight;
    const candidate = { ...current, width, height, rotation };
    const overlaps = placements.some(item => item.id !== placementId && storagePlacementsOverlap(candidate, item));
    if (current.x + width > project.width || current.y + height > project.height || overlaps) {
      showToast(language === 'es' ? 'No se puede girar: el espacio está fuera del plano u ocupado.' : 'Cannot rotate: the space is outside the blueprint or occupied.');
      return;
    }
    const nextPlacements = placements.map(item => item.id === placementId ? {
      ...item,
      width,
      height,
      rotation,
    } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, language === 'es' ? `Girar objeto a ${rotation}°` : `Rotate item to ${rotation}°`, project.width, project.height, nextPlacements);
  }, [language, plannerLayerStates, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleRotateSelectedStorageItem = useCallback((direction: -1 | 1) => {
    if (!selectedStoragePlacementId) return;
    const selected = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId);
    if (!selected) return;
    const rotation = (((selected.rotation ?? 0) + direction * 90 + 360) % 360) as StorageItemRotation;
    handleRotateStorageItem(selected.id, rotation);
  }, [handleRotateStorageItem, project.storagePlacements, selectedStoragePlacementId]);

  const handleRotateSelectionObjects = useCallback((rotation: StorageItemRotation) => {
    if (!selectionBox || selectionBox.scope === 'floors') return;
    const placements = project.storagePlacements ?? [];
    const selected = placements.filter(item =>
      item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
      item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY &&
      plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible &&
      isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))),
    );
    if (selected.length === 0) return;

    const selectedIds = new Set(selected.map(item => item.id));
    const rotated = selected.map(item => {
      const definition = STORAGE_ITEM_BY_ID.get(item.itemId);
      const wasQuarterTurn = item.rotation === 90 || item.rotation === 270;
      const baseWidth = definition?.width ?? (wasQuarterTurn ? item.height : item.width);
      const baseHeight = definition?.height ?? (wasQuarterTurn ? item.width : item.height);
      const needsSwap = rotation === 90 || rotation === 270;
      return {
        ...item,
        width: needsSwap ? baseHeight : baseWidth,
        height: needsSwap ? baseWidth : baseHeight,
        rotation,
      };
    });
    const outside = rotated.some(item =>
      item.x < 0 || item.y < 0 || item.x + item.width > project.width || item.y + item.height > project.height,
    );
    const outsidePlacements = placements.filter(item => !selectedIds.has(item.id));
    const overlaps = rotated.some((item, index) =>
      [...outsidePlacements, ...rotated.slice(index + 1)].some(other => storagePlacementsOverlap(item, other)),
    );
    if (outside || overlaps) {
      showToast(language === 'es'
        ? 'No se cambió la orientación: un objeto quedaría fuera del plano o chocaría con otro.'
        : 'Orientation was not changed because an object would leave the blueprint or overlap another item.');
      return;
    }

    const rotatedById = new Map(rotated.map(item => [item.id, item]));
    const changedCount = rotated.filter(item => {
      const current = selected.find(candidate => candidate.id === item.id)!;
      return current.rotation !== item.rotation || current.width !== item.width || current.height !== item.height;
    }).length;
    if (changedCount === 0) return;
    const nextPlacements = placements.map(item => rotatedById.get(item.id) ?? item);
    handleUpdateCells(
      project.cells,
      language === 'es' ? `Cambiar orientación de ${changedCount} objetos` : `Change orientation of ${changedCount} objects`,
      nextPlacements,
      project.floorTiles,
    );
    showToast(language === 'es'
      ? `Orientación actualizada para ${changedCount} ${changedCount === 1 ? 'objeto' : 'objetos'}.`
      : `Updated orientation for ${changedCount} ${changedCount === 1 ? 'object' : 'objects'}.`);
  }, [selectionBox, project.storagePlacements, project.width, project.cells, project.floorTiles, plannerLayerStates, handleUpdateCells, language, showToast]);

  const handleChangeLightRadius = useCallback((placementId: string, lightRadius: number) => {
    const current = (project.storagePlacements ?? []).find(item => item.id === placementId);
    if (!current || !isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(current, STORAGE_ITEM_BY_ID.get(current.itemId)))) return;
    const nextPlacements = (project.storagePlacements ?? []).map(item => item.id === placementId ? { ...item, lightRadius } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, 'Ajustar alcance de luz', project.width, project.height, nextPlacements);
  }, [plannerLayerStates, project.cells, project.height, project.storagePlacements, project.width, pushHistory]);

  // 12. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Copy / Cut / Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopySelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCutSelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteSelection();
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStoragePlacementId) {
          e.preventDefault();
          handleRemoveStorageItem(selectedStoragePlacementId);
        } else if (selectionBox) {
          e.preventDefault();
          handleDeleteSelection();
        }
        return;
      }

      // Escape clear selection
      if (e.key === 'Escape') {
        if (isPastePlacementMode) {
          e.preventDefault();
          setIsPastePlacementMode(false);
          setPasteTargetCell(null);
          showToast(language === 'es' ? 'Pegado cancelado.' : 'Paste cancelled.');
          return;
        }
        handleClearSelection();
        setSelectedStoragePlacementId(null);
        return;
      }

      if (selectedStoragePlacementId && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        handleRotateSelectedStorageItem(e.key === ']' ? 1 : -1);
        return;
      }

      // Tool hotkeys
      const k = e.key.toLowerCase();
      if (k === 'v') setActiveTool('select');
      else if (k === 'p') setActiveTool('pencil');
      else if (k === 'e') setActiveTool('eraser');
      else if (k === 'l') setActiveTool('line');
      else if (k === 'r') setActiveTool('rectangle');
      else if (k === 'c') setActiveTool('circle');
      else if (k === 'k') setActiveTool('place_core');
      else if (k === 's') setActiveTool('rect_select');
      else if (k === 'b' || k === 'g') setActiveTool('fill');
      else if (k === 'm') setActiveTool('move');
      else if (k === 'h') setActiveTool('hand');
      else if (k === 't') setActiveTool('annotation');

      // Number keys 1-9: select palette color by index
      const digit = parseInt(k, 10);
      if (!isNaN(digit) && digit >= 1 && digit <= 9) {
        const color = project.palette[digit - 1];
        if (color) setActiveColor(color);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleCopySelection,
    handleCutSelection,
    handlePasteSelection,
    isPastePlacementMode,
    language,
    showToast,
    handleDeleteSelection,
    handleClearSelection,
    handleRotateSelectedStorageItem,
    selectionBox,
    selectedStoragePlacementId,
    handleRemoveStorageItem,
    project.palette,
    setActiveColor,
  ]);

  // 13. Cell color frequency counts for legend
  const cellColorCounts = useMemo(() => {
    return countCellsByColor(project.cells);
  }, [project.cells]);
  const selectedStorageItem = selectedStorageItemId ? STORAGE_ITEM_BY_ID.get(selectedStorageItemId) ?? null : null;
  const selectedStoragePlacement = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId) ?? null;
  const selectedPlacedStorageItem = selectedStoragePlacement ? STORAGE_ITEM_BY_ID.get(selectedStoragePlacement.itemId) ?? null : null;
  const selectedObjectsInBox = useMemo(() => {
    if (!selectionBox || selectionBox.scope === 'floors') return [];
    return (project.storagePlacements ?? []).filter(item =>
      item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
      item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY &&
      plannerLayerStates[getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))].visible &&
      isPlannerLayerEditable(plannerLayerStates, getStoragePlacementLayerId(item, STORAGE_ITEM_BY_ID.get(item.itemId))),
    );
  }, [selectionBox, project.storagePlacements, plannerLayerStates]);
  const selectionObjectRotation: StorageItemRotation | null = selectedObjectsInBox.length > 0 &&
    selectedObjectsInBox.every(item => (item.rotation ?? 0) === (selectedObjectsInBox[0].rotation ?? 0))
    ? (selectedObjectsInBox[0].rotation ?? 0)
    : null;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#080f1c] font-sans text-zinc-100">
      {/* Top Bar Header */}
      <Header
        projectName={project.name}
        onProjectNameChange={name => setProject(p => ({ ...p, name }))}
        onNewProject={() => setIsNewProjectOpen(true)}
        onOpenProjectJson={handleOpenProjectJson}
        onSaveProjectJson={handleSaveProjectJson}
        onRecoverAutosave={() => setIsRecoveryOpen(true)}
        recoveryPointCount={recoverySnapshots.length + (recoveryProject !== null ? 1 : 0)}
        autosaveAvailable={autosaveAvailable}
        onExportImage={() => setIsExportOpen(true)}
        onExportCode={handleExportCode}
        onImportCode={handleImportCode}
        onOpenSettings={() => setIsResizeOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        t={t}
      />

      {/* Main Workspace Area (Left Toolbar + Center Canvas + Right Properties) */}
      <div className="flex-1 flex overflow-hidden relative">
        <ToolBar
          activeTool={activeTool}
          catalogOpen={isBlockPaletteOpen}
          onToggleCatalog={() => setIsBlockPaletteOpen(value => !value)}
          onSelectTool={setActiveTool}
          rectangleMode={rectangleMode}
          onChangeRectangleMode={setRectangleMode}
          circleMode={circleMode}
          onChangeCircleMode={setCircleMode}
          circleOrigin={circleOrigin}
          onChangeCircleOrigin={setCircleOrigin}
          onCenterCoreOnBlueprint={handleCenterCoreOnBlueprint}
          mirrorMode={mirrorMode}
          onChangeMirrorMode={setMirrorMode}
          brushSize={brushSize}
          onChangeBrushSize={setBrushSize}
          eraseObjectsWithEraser={eraseObjectsWithEraser}
          onChangeEraseObjectsWithEraser={setEraseObjectsWithEraser}
          activeColor={activeColor}
          doorOrientation={doorOrientation}
          onChangeDoorOrientation={setDoorOrientation}
          showDoorTooltip={showDoorTooltip}
          onDismissDoorTooltip={handleDismissDoorTooltip}
          selectionScope={selectionScope}
          onChangeSelectionScope={setSelectionScope}
          language={language}
          t={t}
        />

        <BlockPaletteModal
          isOpen={isBlockPaletteOpen}
          docked
          onClose={() => setIsBlockPaletteOpen(false)}
          onSelectColor={color => {
            setSelectedFloorItemId(null);
            setSelectedStorageItemId(null);
            setActiveColor(color);
          }}
          activeColor={activeColor}
          language={language}
          selectedStorageItemId={selectedStorageItemId}
          selectedFloorItemId={selectedFloorItemId}
          onSelectFloorItem={item => {
            if (item.layer === 'object') {
              setSelectedFloorItemId(null);
              setSelectedStorageItemId(item.id);
              setActiveTool('place_storage');
            } else {
              setSelectedFloorItemId(item.id);
              setSelectedStorageItemId(null);
              setActiveTool('pencil');
            }
          }}
          gameSprites={gameSprites}
          onSelectStorageItem={item => {
            setSelectedFloorItemId(null);
            setSelectedStorageItemId(item.id);
            setActiveTool('place_storage');
          }}
        />

        <main className="flex-1 flex overflow-hidden relative">
          <CanvasArea
            project={project}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            activeColor={activeColor}
            rectangleMode={rectangleMode}
            circleMode={circleMode}
            circleOrigin={circleOrigin}
            mirrorMode={mirrorMode}
            selectionTransformPreview={selectionTransformPreview}
            clipboard={clipboard}
            pastePlacementMode={isPastePlacementMode}
            showClipboardPasteHint={showClipboardPasteHint}
            onDismissClipboardPasteHint={() => setShowClipboardPasteHint(false)}
            pastePreviewValidation={pastePreviewValidation}
            onPasteAt={handlePlaceClipboardAt}
            onPasteHoverCell={handlePasteHoverCell}
            brushSize={brushSize}
            eraseObjectsWithEraser={eraseObjectsWithEraser}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(v => !v)}
            showMajorGrid={showMajorGrid}
            showCenterGuide={showCenterGuide}
            showCoordinates={showCoordinates}
            showLightRanges={showLightRanges}
            gridLineWidth={gridLineWidth}
            highContrastGrid={highContrastGrid}
            gridTheme={gridTheme}
            onToggleGridTheme={() => setGridTheme(theme => theme === 'dark' ? 'light' : 'dark')}
            plannerLayerStates={plannerLayerStates}
            language={language}
            selectionBox={selectionBox}
            selectionScope={selectionScope}
            onSetSelectionBox={handleSetSelectionBox}
            onMoveSelection={handleMoveSelection}
            onUpdateCells={handleUpdateCells}
            selectedFloorItem={selectedFloorItemId ? FLOOR_ITEM_BY_ID.get(selectedFloorItemId) ?? null : null}
            selectedStorageItem={selectedStorageItem}
            gameSprites={gameSprites}
            onPlaceStorageItem={handlePlaceStorageItem}
            selectedStoragePlacementId={selectedStoragePlacementId}
            onSelectStoragePlacement={setSelectedStoragePlacementId}
            onRotateStoragePlacement={rotation => selectedStoragePlacementId && handleRotateStorageItem(selectedStoragePlacementId, rotation)}
            onMoveStorageItem={handleMoveStorageItem}
            onZoomChange={setCurrentZoom}
            annotations={project.annotations}
            onAddAnnotation={handleAddAnnotation}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onRotateAnnotation={handleRotateAnnotation}
            onMoveAnnotation={handleMoveAnnotation}
            onDoorPlaced={handleDoorPlaced}
            doorOrientation={doorOrientation}
            t={t}
          />
        </main>

        <PropertiesPanel
          gridWidth={project.width}
          isInspectorOpen={isInspectorOpen}
          onToggleInspector={() => setIsInspectorOpen(value => !value)}
          gridHeight={project.height}
          zoom={currentZoom}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(v => !v)}
          showLightRanges={showLightRanges}
          onToggleLightRanges={() => setShowLightRanges(v => !v)}
          showMajorGrid={showMajorGrid}
          onToggleMajorGrid={() => setShowMajorGrid(v => !v)}
          showCenterGuide={showCenterGuide}
          onToggleCenterGuide={() => setShowCenterGuide(v => !v)}
          gridLineWidth={gridLineWidth}
          onChangeGridLineWidth={setGridLineWidth}
          highContrastGrid={highContrastGrid}
          onToggleHighContrastGrid={() => setHighContrastGrid(v => !v)}
          plannerLayerStates={plannerLayerStates}
          onToggleLayerVisibility={togglePlannerLayerVisibility}
          onToggleLayerLock={togglePlannerLayerLock}
          gameSprites={gameSprites}
          selectedStoragePlacement={selectedStoragePlacement}
          selectedPlacedStorageItem={selectedPlacedStorageItem}
          onDeleteStoragePlacement={() => selectedStoragePlacementId && handleRemoveStorageItem(selectedStoragePlacementId)}
          onRotateStoragePlacement={rotation => selectedStoragePlacementId && handleRotateStorageItem(selectedStoragePlacementId, rotation)}
          selectionObjectCount={selectedObjectsInBox.length}
          selectionObjectRotation={selectionObjectRotation}
          onRotateSelectionObjects={handleRotateSelectionObjects}
          onChangeLightRadius={radius => selectedStoragePlacementId && handleChangeLightRadius(selectedStoragePlacementId, radius)}
          selectionBox={selectionBox}
          hasClipboard={clipboard !== null}
          isPastePlacementMode={isPastePlacementMode}
          onCopySelection={handleCopySelection}
          onCutSelection={handleCutSelection}
          onPasteSelection={handlePasteSelection}
          onDeleteSelection={handleDeleteSelection}
          onFillSelection={handleFillSelection}
          onClearSelection={handleClearSelection}
          onDuplicateMirrorSelection={handleDuplicateMirrorSelection}
          onPreviewSelectionTransform={setSelectionTransformPreview}
          onFlipSelection={handleFlipSelection}
          onCenterSelectionHorizontally={handleCenterSelectionHorizontally}
          onCenterSelectionVertically={handleCenterSelectionVertically}
          onCenterSelectionBoth={handleCenterSelectionBoth}
          cellColorCounts={cellColorCounts}
          onOpenSettings={() => setIsResizeOpen(true)}
          language={language}
          t={t}
        />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18191f] border border-amber-500/50 text-zinc-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onConfirm={handleConfirmNewProject}
        currentGridTheme={gridTheme}
        currentHasContent={Object.keys(project.cells).length > 0}
        t={t}
      />

      <RecoveryModal
        isOpen={isRecoveryOpen}
        project={recoveryProject}
        snapshots={recoverySnapshots}
        historyAvailable={recoveryHistoryAvailable}
        language={language}
        onClose={() => setIsRecoveryOpen(false)}
        onRecover={handleRecoverAutosave}
        onRecoverSnapshot={handleRecoverSnapshot}
      />

      <ResizeModal
        isOpen={isResizeOpen}
        onClose={() => setIsResizeOpen(false)}
        currentWidth={project.width}
        currentHeight={project.height}
        cells={project.cells}
        onApplyResize={handleApplyResize}
        onClearBlueprint={handleClearBlueprint}
        t={t}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        language={language}
        t={t}
        onSuccess={showToast}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        t={t}
      />

      <ExportCodeModal
        isOpen={isExportCodeOpen}
        onClose={() => setIsExportCodeOpen(false)}
        project={project}
        t={t}
        onSuccess={showToast}
      />

      <ImportCodeModal
        isOpen={isImportCodeOpen}
        onClose={() => setIsImportCodeOpen(false)}
        onImport={handleImportCodeFromData}
        t={t}
      />

    </div>
  );
}
