import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Annotation,
  BlueprintProject,
  ClipboardData,
  HistoryStep,
  Language,
  PaletteColor,
  RectangleMode,
  ShapeMode,
  CircleOrigin,
  SelectionBox,
  ToolType,
  MirrorMode,
} from './types/blueprint';
import { DEFAULT_PALETTE } from './utils/palette';
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

const INITIAL_PROJECT: BlueprintProject = {
  id: 'proj_default',
  name: 'Plano Base Core Keeper',
  width: 60,
  height: 50,
  cells: {},
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
    return INITIAL_PROJECT;
  });

  // 3. Tool & Color state
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [rectangleMode, setRectangleMode] = useState<RectangleMode>('outline');
  const [circleMode, setCircleMode] = useState<ShapeMode>('outline');
  const [circleOrigin, setCircleOrigin] = useState<CircleOrigin>('center');
  const [includeWaypoint, setIncludeWaypoint] = useState<boolean>(true);
  const [mirrorMode, setMirrorMode] = useState<MirrorMode>('none');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [activeColor, setActiveColor] = useState<PaletteColor>(() => project.palette[0] || DEFAULT_PALETTE[0]);

  // Keep activeColor in sync if palette changes
  useEffect(() => {
    const current = project.palette.find(p => p.id === activeColor.id);
    if (current) {
      setActiveColor(current);
    } else if (project.palette.length > 0) {
      setActiveColor(project.palette[0]);
    }
  }, [project.palette, activeColor.id]);

  // 4. Selection & Clipboard state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  // 5. View state
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMajorGrid, setShowMajorGrid] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
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
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Push new history state
  const pushHistory = useCallback(
    (newCells: Record<string, string>, desc: string, width = project.width, height = project.height) => {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newStep: HistoryStep = {
          description: desc,
          cells: newCells,
          width,
          height,
        };
        const maxSteps = 50;
        const updated = [...sliced, newStep];
        return updated.length > maxSteps ? updated.slice(updated.length - maxSteps) : updated;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    },
    [historyIndex, project.width, project.height]
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
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [canRedo, historyIndex, history]);

  // Update Cells with history recording and autosave
  const handleUpdateCells = useCallback(
    (newCells: Record<string, string>, description: string) => {
      setProject(prev => {
        const updated = {
          ...prev,
          cells: newCells,
          updatedAt: new Date().toISOString(),
        };
        saveAutosave(updated);
        return updated;
      });
      pushHistory(newCells, description);
    },
    [pushHistory]
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

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // 8. Selection Operations
  const handleCopySelection = useCallback(() => {
    if (!selectionBox) return;
    const data = copySelection(project.cells, selectionBox);
    setClipboard(data);
    showToast(t.alerts.copied);
  }, [selectionBox, project.cells, showToast, t.alerts.copied]);

  const handleCutSelection = useCallback(() => {
    if (!selectionBox) return;
    const data = copySelection(project.cells, selectionBox);
    setClipboard(data);
    const deleted = deleteSelection(project.cells, selectionBox);
    handleUpdateCells(deleted, 'Cortar selección');
    showToast(t.alerts.cut);
  }, [selectionBox, project.cells, handleUpdateCells, showToast, t.alerts.cut]);

  const handlePasteSelection = useCallback(() => {
    if (!clipboard) {
      showToast(t.alerts.clipboardEmpty);
      return;
    }
    const destX = selectionBox ? selectionBox.minX : 0;
    const destY = selectionBox ? selectionBox.minY : 0;
    const pasted = pasteSelection(project.cells, clipboard, destX, destY, project.width, project.height);
    handleUpdateCells(pasted, 'Pegar portapapeles');
    setSelectionBox({
      minX: destX,
      minY: destY,
      maxX: Math.min(project.width - 1, destX + clipboard.width - 1),
      maxY: Math.min(project.height - 1, destY + clipboard.height - 1),
    });
    showToast(t.alerts.pasted);
  }, [clipboard, selectionBox, project.cells, project.width, project.height, handleUpdateCells, showToast, t.alerts]);

  const handleDeleteSelection = useCallback(() => {
    if (!selectionBox) return;
    const deleted = deleteSelection(project.cells, selectionBox);
    handleUpdateCells(deleted, 'Eliminar selección');
  }, [selectionBox, project.cells, handleUpdateCells]);

  const handleFillSelection = useCallback(() => {
    if (!selectionBox) return;
    const filled = fillSelection(project.cells, selectionBox, activeColor.id, project.width, project.height);
    handleUpdateCells(filled, 'Rellenar selección');
  }, [selectionBox, project.cells, activeColor.id, project.width, project.height, handleUpdateCells]);

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
    if (dx !== 0) {
      const moved = moveCells(project.cells, selectionBox, dx, 0, project.width, project.height);
      handleUpdateCells(moved, 'Centrar selección horizontalmente');
    }
    setSelectionBox(centered);
    showToast(t.mirror.centeredH);
  }, [selectionBox, project.width, project.height, setSelectionBox, handleUpdateCells, showToast, t.mirror.centeredH]);

  const handleCenterSelectionVertically = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionVertically(selectionBox, project.width, project.height);
    const dy = centered.minY - selectionBox.minY;
    if (dy !== 0) {
      const moved = moveCells(project.cells, selectionBox, 0, dy, project.width, project.height);
      handleUpdateCells(moved, 'Centrar selección verticalmente');
    }
    setSelectionBox(centered);
    showToast(t.mirror.centeredV);
  }, [selectionBox, project.width, project.height, setSelectionBox, handleUpdateCells, showToast, t.mirror.centeredV]);

  const handleCenterSelectionBoth = useCallback(() => {
    if (!selectionBox) return;
    const centered = centerSelectionBoth(selectionBox, project.width, project.height);
    const dx = centered.minX - selectionBox.minX;
    const dy = centered.minY - selectionBox.minY;
    if (dx !== 0 || dy !== 0) {
      const moved = moveCells(project.cells, selectionBox, dx, dy, project.width, project.height);
      handleUpdateCells(moved, 'Centrar selección en ambos ejes');
    }
    setSelectionBox(centered);
    showToast(t.mirror.centeredBoth);
  }, [selectionBox, project.width, project.height, setSelectionBox, handleUpdateCells, showToast, t.mirror.centeredBoth]);

  // Annotation handlers
  const handleAddAnnotation = useCallback((x: number, y: number) => {
    const text = window.prompt('Texto de la anotación:');
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
      showToast('Anotación añadida');
    }
  }, [showToast]);

  const handleEditAnnotation = useCallback((annotationId: string) => {
    const ann = project.annotations.find(a => a.id === annotationId);
    if (!ann) return;
    const text = window.prompt('Editar anotación:', ann.text);
    if (text !== null) {
      setProject(prev => ({
        ...prev,
        annotations: prev.annotations.map(a =>
          a.id === annotationId ? { ...a, text: text.trim() } : a
        ),
        updatedAt: new Date().toISOString(),
      }));
      showToast('Anotación actualizada');
    }
  }, [project.annotations, showToast]);

  const handleDeleteAnnotation = useCallback((annotationId: string) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== annotationId),
      updatedAt: new Date().toISOString(),
    }));
    showToast('Anotación eliminada');
  }, [showToast]);

  const handleMoveAnnotation = useCallback((annotationId: string, x: number, y: number) => {
    setProject(prev => ({
      ...prev,
      annotations: prev.annotations.map(a =>
        a.id === annotationId ? { ...a, x, y } : a
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, [showToast]);

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
    setProject(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      cells: updatedCells,
      updatedAt: new Date().toISOString(),
    }));
    pushHistory(updatedCells, `Redimensionar a ${newWidth}×${newHeight}`, newWidth, newHeight);
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
    handleUpdateCells({}, 'Limpiar plano');
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
    setProject(prev => ({
      ...prev,
      width: projectData.width ?? prev.width,
      height: projectData.height ?? prev.height,
      cells: projectData.cells ?? prev.cells,
      palette: projectData.palette ?? prev.palette,
      annotations: projectData.annotations ?? prev.annotations,
      updatedAt: new Date().toISOString(),
    }));
    setSelectionBox(null);
    showToast(t.alerts.projectLoaded);
  };

  // 11. Palette handlers
  const handleAddColor = (name: string, hex: string) => {
    const id = `col_${Date.now()}`;
    const newColor: PaletteColor = { id, name, hex, isDefault: false };
    setProject(prev => ({
      ...prev,
      palette: [...prev.palette, newColor],
      updatedAt: new Date().toISOString(),
    }));
    setActiveColor(newColor);
  };

  const handleUpdateColor = (id: string, name: string, hex: string) => {
    setProject(prev => ({
      ...prev,
      palette: prev.palette.map(p => (p.id === id ? { ...p, name, hex } : p)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteColor = (id: string) => {
    setProject(prev => ({
      ...prev,
      palette: prev.palette.filter(p => p.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

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
        if (selectionBox) {
          e.preventDefault();
          handleDeleteSelection();
        }
        return;
      }

      // Escape clear selection
      if (e.key === 'Escape') {
        handleClearSelection();
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
    project.palette,
    setActiveColor,
  ]);

  // 13. Cell color frequency counts for legend
  const cellColorCounts = useMemo(() => {
    return countCellsByColor(project.cells);
  }, [project.cells]);

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
            gridLineWidth={gridLineWidth}
            highContrastGrid={highContrastGrid}
            gridTheme={gridTheme}
            selectionBox={selectionBox}
            onSetSelectionBox={setSelectionBox}
            onUpdateCells={handleUpdateCells}
            onZoomChange={setCurrentZoom}
            annotations={project.annotations}
            onAddAnnotation={handleAddAnnotation}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onMoveAnnotation={handleMoveAnnotation}
            t={t}
          />
        </main>

        <PropertiesPanel
          gridWidth={project.width}
          gridHeight={project.height}
          zoom={currentZoom}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(v => !v)}
          showMajorGrid={showMajorGrid}
          onToggleMajorGrid={() => setShowMajorGrid(v => !v)}
          gridLineWidth={gridLineWidth}
          onChangeGridLineWidth={setGridLineWidth}
          highContrastGrid={highContrastGrid}
          onToggleHighContrastGrid={() => setHighContrastGrid(v => !v)}
          gridTheme={gridTheme}
          onChangeGridTheme={setGridTheme}
          palette={project.palette}
          activeColor={activeColor}
          onSelectColor={setActiveColor}
          onAddColor={handleAddColor}
          onUpdateColor={handleUpdateColor}
          onDeleteColor={handleDeleteColor}
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
