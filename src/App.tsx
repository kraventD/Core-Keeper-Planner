import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Annotation,
  BlueprintProject,
  ClipboardData,
  DoorOrientation,
  HistoryStep,
  Language,
  PaletteColor,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  SelectionBox,
  StorageItemPlacement,
  ToolType,
  MirrorMode,
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
  stampCorePattern,
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
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { BlockPaletteModal } from './components/Modals/BlockPaletteModal';
import { DEFAULT_ACTIVE_COLOR, paletteWithBlockColors } from './utils/blockCatalog';
import { StorageItemDefinition } from './utils/storageCatalog';
import { migrateStructurePlacementsToColors, STORAGE_ITEM_BY_ID } from './utils/storageCatalog';
import { GameSpriteEntry, loadGameSpriteCatalog } from './utils/gameSpriteCatalog';

const INITIAL_PROJECT: BlueprintProject = {
  id: 'proj_default',
  name: 'Plano Base Core Keeper',
  width: 60,
  height: 50,
  cells: {},
  storagePlacements: [],
  palette: DEFAULT_PALETTE,
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

  // 3. Tool & Color state
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [rectangleMode, setRectangleMode] = useState<RectangleMode>('outline');
  const [circleMode, setCircleMode] = useState<ShapeMode>('outline');
  const [circleOrigin, setCircleOrigin] = useState<CircleOrigin>('center');
  const [includeWaypoint, setIncludeWaypoint] = useState<boolean>(true);
  const [mirrorMode, setMirrorMode] = useState<MirrorMode>('none');
  const [brushSize, setBrushSize] = useState<number>(1);
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
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  // 5. View state
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMajorGrid, setShowMajorGrid] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showLightRanges, setShowLightRanges] = useState<boolean>(true);
  const [gridLineWidth, setGridLineWidth] = useState<number>(1.5);
  const [highContrastGrid, setHighContrastGrid] = useState<boolean>(true);
  const [gridTheme, setGridTheme] = useState<'light' | 'dark'>('light');
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);

  // 6. History Undo / Redo
  const [history, setHistory] = useState<HistoryStep[]>(() => [
    {
      description: 'Estado inicial',
      cells: { ...project.cells },
      width: project.width,
      height: project.height,
      storagePlacements: project.storagePlacements ?? [],
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Push new history state
  const pushHistory = useCallback(
    (newCells: Record<string, string>, desc: string, width = project.width, height = project.height, storagePlacements = project.storagePlacements ?? []) => {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newStep: HistoryStep = {
          description: desc,
          cells: newCells,
          width,
          height,
          storagePlacements,
        };
        const maxSteps = 50;
        const updated = [...sliced, newStep];
        return updated.length > maxSteps ? updated.slice(updated.length - maxSteps) : updated;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    },
    [historyIndex, project.width, project.height, project.storagePlacements]
  );

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIndex = historyIndex - 1;
    const step = history[targetIndex];
    if (step) {
      setHistoryIndex(targetIndex);
      setProject(prev => ({
        ...prev,
        cells: { ...step.cells },
        width: step.width,
        height: step.height,
        storagePlacements: step.storagePlacements ?? [],
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIndex = historyIndex + 1;
    const step = history[targetIndex];
    if (step) {
      setHistoryIndex(targetIndex);
      setProject(prev => ({
        ...prev,
        cells: { ...step.cells },
        width: step.width,
        height: step.height,
        storagePlacements: step.storagePlacements ?? [],
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [canRedo, historyIndex, history]);

  // Update Cells with history recording and autosave
  const handleUpdateCells = useCallback(
    (newCells: Record<string, string>, description: string, storagePlacements = project.storagePlacements ?? []) => {
      setProject(prev => {
        const updated = {
          ...prev,
          cells: newCells,
          storagePlacements,
          updatedAt: new Date().toISOString(),
        };
        saveAutosave(updated);
        return updated;
      });
      pushHistory(newCells, description, project.width, project.height, storagePlacements);
    },
    [project.height, project.storagePlacements, project.width, pushHistory]
  );

  // Autosave when project changes
  useEffect(() => {
    saveAutosave(project);
  }, [project]);

  // 7. Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportCodeOpen, setIsExportCodeOpen] = useState(false);
  const [isImportCodeOpen, setIsImportCodeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBlockPaletteOpen, setIsBlockPaletteOpen] = useState(false);
  const [selectedStorageItemId, setSelectedStorageItemId] = useState<string | null>(null);
  const [selectedStoragePlacementId, setSelectedStoragePlacementId] = useState<string | null>(null);
  const [gameSprites, setGameSprites] = useState<Record<string, GameSpriteEntry>>({});

  useEffect(() => {
    loadGameSpriteCatalog().then(setGameSprites).catch(() => setGameSprites({}));
  }, []);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleSetSelectionBox = useCallback((box: SelectionBox | null) => {
    setSelectionBox(box);
    if (box) setSelectedStoragePlacementId(null);
  }, []);

  const handleMoveSelection = useCallback((box: SelectionBox, deltaX: number, deltaY: number): boolean => {
    const placements = project.storagePlacements ?? [];
    const selected = placements.filter(item =>
      item.x >= box.minX && item.y >= box.minY &&
      item.x + item.width - 1 <= box.maxX && item.y + item.height - 1 <= box.maxY,
    );
    const selectedIds = new Set(selected.map(item => item.id));
    const movedPlacements = selected.map(item => ({ ...item, x: item.x + deltaX, y: item.y + deltaY }));
    const outside = movedPlacements.some(item => item.x < 0 || item.y < 0 || item.x + item.width > project.width || item.y + item.height > project.height);
    const overlapsExisting = movedPlacements.some(moving => placements.some(existing =>
      !selectedIds.has(existing.id) && (existing.layer ?? 'object') === (moving.layer ?? 'object') &&
      moving.x < existing.x + existing.width && moving.x + moving.width > existing.x &&
      moving.y < existing.y + existing.height && moving.y + moving.height > existing.y,
    ));
    const overlapsWithinSelection = movedPlacements.some((moving, index) => movedPlacements.slice(index + 1).some(other =>
      (other.layer ?? 'object') === (moving.layer ?? 'object') &&
      moving.x < other.x + other.width && moving.x + moving.width > other.x &&
      moving.y < other.y + other.height && moving.y + moving.height > other.y,
    ));
    if (outside || overlapsExisting || overlapsWithinSelection) {
      showToast(language === 'es'
        ? 'No se puede mover la selección: un objeto quedaría fuera del plano o chocaría con otro.'
        : 'Cannot move the selection: an item would leave the blueprint or overlap another item.');
      return false;
    }

    const movedCells = moveCells(project.cells, box, deltaX, deltaY, project.width, project.height);
    const movedById = new Map(movedPlacements.map(item => [item.id, item]));
    const nextPlacements = placements.map(item => movedById.get(item.id) ?? item);
    setProject(prev => {
      const updated = { ...prev, cells: movedCells, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() };
      saveAutosave(updated);
      return updated;
    });
    pushHistory(movedCells, 'Mover selección', project.width, project.height, nextPlacements);
    return true;
  }, [language, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  // 8. Selection Operations
  const getSelectionClipboard = useCallback((): ClipboardData | null => {
    let box = selectionBox;
    let placementsToCopy: StorageItemPlacement[] = [];
    if (box) {
      placementsToCopy = (project.storagePlacements ?? []).filter(item =>
        item.x >= box!.minX && item.y >= box!.minY &&
        item.x + item.width - 1 <= box!.maxX && item.y + item.height - 1 <= box!.maxY,
      );
    } else if (selectedStoragePlacementId) {
      const selected = (project.storagePlacements ?? []).find(item => item.id === selectedStoragePlacementId);
      if (!selected) return null;
      box = { minX: selected.x, minY: selected.y, maxX: selected.x + selected.width - 1, maxY: selected.y + selected.height - 1 };
      placementsToCopy = [selected];
    } else {
      return null;
    }

    const clipboardData = copySelection(project.cells, box);
    if (!selectionBox) clipboardData.cells = [];
    clipboardData.storagePlacements = placementsToCopy.map(({ id: _id, x, y, ...item }) => ({
      ...item,
      relX: x - box!.minX,
      relY: y - box!.minY,
    }));
    return clipboardData;
  }, [project.cells, project.storagePlacements, selectedStoragePlacementId, selectionBox]);

  const handleCopySelection = useCallback(() => {
    const data = getSelectionClipboard();
    if (!data) return;
    setClipboard(data);
    showToast(t.alerts.copied);
  }, [getSelectionClipboard, showToast, t.alerts.copied]);

  const handleCutSelection = useCallback(() => {
    const data = getSelectionClipboard();
    if (!data) return;
    setClipboard(data);
    const deleted = selectionBox ? deleteSelection(project.cells, selectionBox) : project.cells;
    const selectedIds = new Set(selectionBox
      ? (project.storagePlacements ?? []).filter(placement =>
        placement.x >= selectionBox.minX && placement.y >= selectionBox.minY &&
        placement.x + placement.width - 1 <= selectionBox.maxX && placement.y + placement.height - 1 <= selectionBox.maxY,
      ).map(placement => placement.id)
      : selectedStoragePlacementId ? [selectedStoragePlacementId] : []);
    const remainingPlacements = (project.storagePlacements ?? []).filter(item => !selectedIds.has(item.id));
    handleUpdateCells(deleted, 'Cortar selección', remainingPlacements);
    setSelectedStoragePlacementId(null);
    showToast(t.alerts.cut);
  }, [getSelectionClipboard, selectionBox, project.cells, project.storagePlacements, selectedStoragePlacementId, handleUpdateCells, showToast, t.alerts.cut]);

  const handlePasteSelection = useCallback(() => {
    if (!clipboard) {
      showToast(t.alerts.clipboardEmpty);
      return;
    }
    const destX = selectionBox ? selectionBox.minX : 0;
    const destY = selectionBox ? selectionBox.minY : 0;
    const copiedPlacements = clipboard.storagePlacements ?? [];
    const pastedPlacements = copiedPlacements.map(({ relX, relY, ...item }, index) => ({
      ...item,
      id: `storage_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      x: destX + relX,
      y: destY + relY,
    }));
    const currentPlacements = project.storagePlacements ?? [];
    const placementOverlap = pastedPlacements.some((pasted, index) =>
      pasted.x < 0 || pasted.y < 0 || pasted.x + pasted.width > project.width || pasted.y + pasted.height > project.height ||
      currentPlacements.some(existing => (existing.layer ?? 'object') === (pasted.layer ?? 'object') &&
        pasted.x < existing.x + existing.width && pasted.x + pasted.width > existing.x &&
        pasted.y < existing.y + existing.height && pasted.y + pasted.height > existing.y) ||
      pastedPlacements.slice(index + 1).some(other => (other.layer ?? 'object') === (pasted.layer ?? 'object') &&
        pasted.x < other.x + other.width && pasted.x + pasted.width > other.x &&
        pasted.y < other.y + other.height && pasted.y + pasted.height > other.y),
    );
    if (placementOverlap) {
      showToast(language === 'es'
        ? 'No se puede pegar: un objeto quedaría fuera del plano o chocaría con otro.'
        : 'Cannot paste: an item would leave the blueprint or overlap another item.');
      return;
    }
    const pasted = pasteSelection(project.cells, clipboard, destX, destY, project.width, project.height);
    handleUpdateCells(pasted, 'Pegar portapapeles', [...currentPlacements, ...pastedPlacements]);
    handleSetSelectionBox({
      minX: destX,
      minY: destY,
      maxX: Math.min(project.width - 1, destX + clipboard.width - 1),
      maxY: Math.min(project.height - 1, destY + clipboard.height - 1),
    });
    showToast(t.alerts.pasted);
  }, [clipboard, selectionBox, project.cells, project.storagePlacements, project.width, project.height, handleUpdateCells, handleSetSelectionBox, showToast, t.alerts, language]);

  const handleDeleteSelection = useCallback(() => {
    if (!selectionBox) return;
    const deleted = deleteSelection(project.cells, selectionBox);
    const remainingPlacements = (project.storagePlacements ?? []).filter(item =>
      !(item.x >= selectionBox.minX && item.y >= selectionBox.minY &&
        item.x + item.width - 1 <= selectionBox.maxX && item.y + item.height - 1 <= selectionBox.maxY),
    );
    handleUpdateCells(deleted, 'Eliminar selección', remainingPlacements);
  }, [selectionBox, project.cells, project.storagePlacements, handleUpdateCells]);

  const handleFillSelection = useCallback(() => {
    if (!selectionBox) return;
    const filled = fillSelection(project.cells, selectionBox, getDoorPlacementColorId(activeColor.id, doorOrientation), project.width, project.height);
    handleUpdateCells(filled, 'Rellenar selección');
  }, [selectionBox, project.cells, activeColor.id, doorOrientation, project.width, project.height, handleUpdateCells]);

  const handleClearSelection = useCallback(() => {
    setSelectionBox(null);
  }, []);

  const handleDuplicateMirrorSelection = useCallback(
    (axis: 'horizontal' | 'vertical') => {
      if (!selectionBox) return;
      const { updatedCells, mirroredBox } = duplicateMirrorSelection(
        project.cells,
        selectionBox,
        axis,
        project.width,
        project.height
      );
      handleUpdateCells(
        updatedCells,
        `Duplicar espejo (${axis === 'horizontal' ? 'H' : 'V'})`
      );
      setSelectionBox(mirroredBox);
      showToast(
        axis === 'horizontal'
          ? t.mirror.duplicatedOppositeH
          : t.mirror.duplicatedOppositeV
      );
    },
    [
      selectionBox,
      project.cells,
      project.width,
      project.height,
      handleUpdateCells,
      showToast,
      t.mirror.duplicatedOppositeH,
      t.mirror.duplicatedOppositeV,
    ]
  );

  const handleFlipSelection = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      if (!selectionBox) return;
      const flippedCells = flipSelectionInPlace(
        project.cells,
        selectionBox,
        direction
      );
      handleUpdateCells(
        flippedCells,
        `Voltear selección (${direction === 'horizontal' ? 'H' : 'V'})`
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
      handleUpdateCells,
      showToast,
      t.mirror.flippedH,
      t.mirror.flippedV,
    ]
  );

  const handleCenterSelectionHorizontally = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionHorizontally(selectionBox, project.width, project.height);
    const dx = centered.minX - selectionBox.minX;
    if (dx !== 0 && !handleMoveSelection(selectionBox, dx, 0)) return;
    handleSetSelectionBox(centered);
    showToast(t.mirror.centeredH);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredH]);

  const handleCenterSelectionVertically = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionVertically(selectionBox, project.width, project.height);
    const dy = centered.minY - selectionBox.minY;
    if (dy !== 0 && !handleMoveSelection(selectionBox, 0, dy)) return;
    handleSetSelectionBox(centered);
    showToast(t.mirror.centeredV);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredV]);

  const handleCenterSelectionBoth = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionBoth(selectionBox, project.width, project.height);
    const dx = centered.minX - selectionBox.minX;
    const dy = centered.minY - selectionBox.minY;
    if ((dx !== 0 || dy !== 0) && !handleMoveSelection(selectionBox, dx, dy)) return;
    handleSetSelectionBox(centered);
    showToast(t.mirror.centeredBoth);
  }, [selectionBox, project.width, project.height, handleMoveSelection, handleSetSelectionBox, showToast, t.mirror.centeredBoth]);

  // Annotation handlers
  const handleAddAnnotation = useCallback((x: number, y: number) => {
    const text = window.prompt(t.annotationPrompt);
    if (text !== null && text.trim() !== '') {
      const newAnnotation: Annotation = {
        id: `ann_${Date.now()}`,
        x,
        y,
        text: text.trim(),
      };
      setProject(prev => ({
        ...prev,
        annotations: [...prev.annotations, newAnnotation],
        updatedAt: new Date().toISOString(),
      }));
      showToast(t.annotationAdded);
    }
  }, [showToast, t.annotationPrompt, t.annotationAdded]);

  const handleEditAnnotation = useCallback((annotationId: string) => {
    const ann = project.annotations.find(a => a.id === annotationId);
    if (!ann) return;
    const text = window.prompt(t.annotationEditPrompt, ann.text);
    if (text !== null) {
      setProject(prev => ({
        ...prev,
        annotations: prev.annotations.map(a =>
          a.id === annotationId ? { ...a, text: text.trim() } : a
        ),
        updatedAt: new Date().toISOString(),
      }));
      showToast(t.annotationUpdated);
    }
  }, [project.annotations, showToast, t.annotationEditPrompt, t.annotationUpdated]);

  const handleDeleteAnnotation = useCallback((annotationId: string) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== annotationId),
      updatedAt: new Date().toISOString(),
    }));
    showToast(t.annotationDeleted);
  }, [showToast, t.annotationDeleted]);

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

  const handleCenterCoreOnBlueprint = useCallback(() => {
    const center = getCenterOfGrid(project.width, project.height);
    const { updatedCells } = stampCorePattern(
      project.cells,
      center.x,
      center.y,
      project.width,
      project.height,
      includeWaypoint
    );
    handleUpdateCells(updatedCells, 'Colocar Core en el centro');
    showToast(t.placeCore.placedSuccessToast);
  }, [
    project.width,
    project.height,
    project.cells,
    includeWaypoint,
    handleUpdateCells,
    showToast,
    t.placeCore.placedSuccessToast,
  ]);

  // 9. Resize & Clear Blueprint
  const handleApplyResize = (newWidth: number, newHeight: number) => {
    const { updatedCells } = resizeGridCells(project.cells, newWidth, newHeight);
    const storagePlacements = (project.storagePlacements ?? []).filter(item =>
      item.x + item.width <= newWidth && item.y + item.height <= newHeight,
    );
    setProject(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      cells: updatedCells,
      storagePlacements,
      updatedAt: new Date().toISOString(),
    }));
    pushHistory(updatedCells, `Redimensionar a ${newWidth}×${newHeight}`, newWidth, newHeight, storagePlacements);
    if (selectionBox) {
      if (selectionBox.minX >= newWidth || selectionBox.minY >= newHeight) {
        setSelectionBox(null);
      } else {
        setSelectionBox({
          minX: selectionBox.minX,
          minY: selectionBox.minY,
          maxX: Math.min(newWidth - 1, selectionBox.maxX),
          maxY: Math.min(newHeight - 1, selectionBox.maxY),
        });
      }
    }
  };

  const handleClearBlueprint = () => {
    setProject(prev => ({ ...prev, cells: {}, storagePlacements: [], updatedAt: new Date().toISOString() }));
    pushHistory({}, 'Limpiar plano', project.width, project.height, []);
    setSelectionBox(null);
  };

  // 10. New & Load Project
  const handleConfirmNewProject = (name: string, width: number, height: number) => {
    const fresh: BlueprintProject = {
      id: `proj_${Date.now()}`,
      name,
      width,
      height,
      cells: {},
      storagePlacements: [],
      palette: project.palette,
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProject(fresh);
    setSelectionBox(null);
    setHistory([
      {
        description: 'Nuevo plano',
        cells: {},
        width,
        height,
        storagePlacements: [],
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
    );
    setProject(prev => ({
      ...prev,
      width: projectData.width ?? prev.width,
      height: projectData.height ?? prev.height,
      cells: projectData.cells || projectData.storagePlacements ? migratedStructures.cells : prev.cells,
      storagePlacements: projectData.storagePlacements ? migratedStructures.storagePlacements : prev.storagePlacements ?? [],
      palette: paletteWithBlockColors(projectData.palette ?? prev.palette),
      annotations: projectData.annotations ?? prev.annotations,
      updatedAt: new Date().toISOString(),
    }));
    setSelectionBox(null);
    showToast(t.alerts.projectLoaded);
  };

  const handlePlaceStorageItem = useCallback((x: number, y: number, item: StorageItemDefinition) => {
    const currentPlacements = project.storagePlacements ?? [];
    if (x + item.width > project.width || y + item.height > project.height) {
      showToast(language === 'es' ? 'El objeto queda fuera del plano.' : 'The item would extend beyond the blueprint.');
      return;
    }
    const layer = item.layer ?? 'object';
    const overlaps = currentPlacements.some(existing => (existing.layer ?? 'object') === layer &&
      x < existing.x + existing.width && x + item.width > existing.x &&
      y < existing.y + existing.height && y + item.height > existing.y,
    );
    if (overlaps) {
      showToast(language === 'es' ? 'Ese espacio ya está ocupado por otro objeto.' : 'That space is occupied by another item.');
      return;
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
  }, [language, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleRemoveStorageItem = useCallback((placementId: string) => {
    const nextPlacements = (project.storagePlacements ?? []).filter(item => item.id !== placementId);
    setProject(prev => {
      const updated = { ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() };
      saveAutosave(updated);
      return updated;
    });
    pushHistory(project.cells, 'Eliminar objeto de almacenamiento', project.width, project.height, nextPlacements);
    setSelectedStoragePlacementId(current => current === placementId ? null : current);
  }, [project.cells, project.storagePlacements, project.width, project.height, pushHistory]);

  const handleMoveStorageItem = useCallback((placementId: string, x: number, y: number) => {
    const placements = project.storagePlacements ?? [];
    const moving = placements.find(item => item.id === placementId);
    if (!moving || (moving.x === x && moving.y === y)) return;
    const overlaps = placements.some(item => item.id !== placementId && (item.layer ?? 'object') === (moving.layer ?? 'object') &&
      x < item.x + item.width && x + moving.width > item.x &&
      y < item.y + item.height && y + moving.height > item.y);
    if (x < 0 || y < 0 || x + moving.width > project.width || y + moving.height > project.height || overlaps) {
      showToast(language === 'es' ? 'No se puede mover: el espacio está fuera del plano u ocupado.' : 'Cannot move: the space is outside the blueprint or occupied.');
      return;
    }
    const nextPlacements = placements.map(item => item.id === placementId ? { ...item, x, y } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, 'Mover objeto', project.width, project.height, nextPlacements);
  }, [language, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleRotateStorageItem = useCallback((placementId: string) => {
    const placements = project.storagePlacements ?? [];
    const current = placements.find(item => item.id === placementId);
    if (!current) return;
    const width = current.height;
    const height = current.width;
    const overlaps = placements.some(item => item.id !== placementId && (item.layer ?? 'object') === (current.layer ?? 'object') &&
      current.x < item.x + item.width && current.x + width > item.x &&
      current.y < item.y + item.height && current.y + height > item.y);
    if (current.x + width > project.width || current.y + height > project.height || overlaps) {
      showToast(language === 'es' ? 'No se puede girar: el espacio está fuera del plano u ocupado.' : 'Cannot rotate: the space is outside the blueprint or occupied.');
      return;
    }
    const nextPlacements = placements.map(item => item.id === placementId ? {
      ...item,
      width,
      height,
      rotation: ((item.rotation ?? 0) === 0 ? 90 : 0) as 0 | 90,
    } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, 'Girar objeto', project.width, project.height, nextPlacements);
  }, [language, project.cells, project.height, project.storagePlacements, project.width, pushHistory, showToast]);

  const handleChangeLightRadius = useCallback((placementId: string, lightRadius: number) => {
    const nextPlacements = (project.storagePlacements ?? []).map(item => item.id === placementId ? { ...item, lightRadius } : item);
    setProject(prev => ({ ...prev, storagePlacements: nextPlacements, updatedAt: new Date().toISOString() }));
    pushHistory(project.cells, 'Ajustar alcance de luz', project.width, project.height, nextPlacements);
  }, [project.cells, project.height, project.storagePlacements, project.width, pushHistory]);

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
        handleClearSelection();
        setSelectedStoragePlacementId(null);
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
    handleDeleteSelection,
    handleClearSelection,
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#101115] text-zinc-100 overflow-hidden font-sans">
      {/* Top Bar Header */}
      <Header
        projectName={project.name}
        onProjectNameChange={name => setProject(p => ({ ...p, name }))}
        onNewProject={() => setIsNewProjectOpen(true)}
        onOpenProjectJson={handleOpenProjectJson}
        onSaveProjectJson={handleSaveProjectJson}
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
          onSelectTool={setActiveTool}
          rectangleMode={rectangleMode}
          onChangeRectangleMode={setRectangleMode}
          circleMode={circleMode}
          onChangeCircleMode={setCircleMode}
          circleOrigin={circleOrigin}
          onChangeCircleOrigin={setCircleOrigin}
          includeWaypoint={includeWaypoint}
          onToggleIncludeWaypoint={() => setIncludeWaypoint(v => !v)}
          onCenterCoreOnBlueprint={handleCenterCoreOnBlueprint}
          mirrorMode={mirrorMode}
          onChangeMirrorMode={setMirrorMode}
          brushSize={brushSize}
          onChangeBrushSize={setBrushSize}
          activeColor={activeColor}
          doorOrientation={doorOrientation}
          onChangeDoorOrientation={setDoorOrientation}
          showDoorTooltip={showDoorTooltip}
          onDismissDoorTooltip={handleDismissDoorTooltip}
          language={language}
          t={t}
        />

        <main className="flex-1 flex overflow-hidden relative">
          <CanvasArea
            project={project}
            activeTool={activeTool}
            activeColor={activeColor}
            rectangleMode={rectangleMode}
            circleMode={circleMode}
            circleOrigin={circleOrigin}
            includeWaypoint={includeWaypoint}
            mirrorMode={mirrorMode}
            brushSize={brushSize}
            showGrid={showGrid}
            showMajorGrid={showMajorGrid}
            showCoordinates={showCoordinates}
            showLightRanges={showLightRanges}
            gridLineWidth={gridLineWidth}
            highContrastGrid={highContrastGrid}
            gridTheme={gridTheme}
            selectionBox={selectionBox}
            onSetSelectionBox={handleSetSelectionBox}
            onMoveSelection={handleMoveSelection}
            onUpdateCells={handleUpdateCells}
            selectedStorageItem={selectedStorageItem}
            gameSprites={gameSprites}
            onPlaceStorageItem={handlePlaceStorageItem}
            onRemoveStorageItem={handleRemoveStorageItem}
            selectedStoragePlacementId={selectedStoragePlacementId}
            onSelectStoragePlacement={setSelectedStoragePlacementId}
            onMoveStorageItem={handleMoveStorageItem}
            onZoomChange={setCurrentZoom}
            annotations={project.annotations}
            onAddAnnotation={handleAddAnnotation}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onMoveAnnotation={handleMoveAnnotation}
            onDoorPlaced={handleDoorPlaced}
            doorOrientation={doorOrientation}
            t={t}
          />
        </main>

        <PropertiesPanel
          gridWidth={project.width}
          gridHeight={project.height}
          zoom={currentZoom}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(v => !v)}
          showLightRanges={showLightRanges}
          onToggleLightRanges={() => setShowLightRanges(v => !v)}
          showMajorGrid={showMajorGrid}
          onToggleMajorGrid={() => setShowMajorGrid(v => !v)}
          gridLineWidth={gridLineWidth}
          onChangeGridLineWidth={setGridLineWidth}
          highContrastGrid={highContrastGrid}
          onToggleHighContrastGrid={() => setHighContrastGrid(v => !v)}
          gridTheme={gridTheme}
          onChangeGridTheme={setGridTheme}
          activeColor={activeColor}
          onOpenBlockPalette={() => setIsBlockPaletteOpen(true)}
          selectedStorageItem={selectedStorageItem}
          gameSprites={gameSprites}
          selectedStoragePlacement={selectedStoragePlacement}
          selectedPlacedStorageItem={selectedPlacedStorageItem}
          onDeleteStoragePlacement={() => selectedStoragePlacementId && handleRemoveStorageItem(selectedStoragePlacementId)}
          onRotateStoragePlacement={() => selectedStoragePlacementId && handleRotateStorageItem(selectedStoragePlacementId)}
          onChangeLightRadius={radius => selectedStoragePlacementId && handleChangeLightRadius(selectedStoragePlacementId, radius)}
          selectionBox={selectionBox}
          hasClipboard={clipboard !== null}
          onCopySelection={handleCopySelection}
          onCutSelection={handleCutSelection}
          onPasteSelection={handlePasteSelection}
          onDeleteSelection={handleDeleteSelection}
          onFillSelection={handleFillSelection}
          onClearSelection={handleClearSelection}
          onDuplicateMirrorSelection={handleDuplicateMirrorSelection}
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
        currentHasContent={Object.keys(project.cells).length > 0}
        t={t}
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

      <BlockPaletteModal
        isOpen={isBlockPaletteOpen}
        onClose={() => setIsBlockPaletteOpen(false)}
        onSelectColor={setActiveColor}
        activeColor={activeColor}
        language={language}
        selectedStorageItemId={selectedStorageItemId}
        gameSprites={gameSprites}
        onSelectStorageItem={item => {
          setSelectedStorageItemId(item.id);
          setActiveTool('place_storage');
          setIsBlockPaletteOpen(false);
        }}
      />
    </div>
  );
}
