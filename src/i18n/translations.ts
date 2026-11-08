import { Language } from '../types/blueprint';

export interface Translations {
  appName: string;
  appSubtitle: string;
  // Header
  newProject: string;
  openProject: string;
  saveProject: string;
  exportImage: string;
  exportCode: string;
  importCode: string;
  undo: string;
  redo: string;
  settings: string;
  shortcuts: string;
  language: string;
  projectNamePlaceholder: string;
  // Tools
  tools: {
    select: string;
    pencil: string;
    eraser: string;
    line: string;
    rectangle: string;
    circle: string;
    rect_select: string;
    fill: string;
    move: string;
    hand: string;
    place_core: string;
    annotation: string;
  };
  tooltips: {
    select: string;
    pencil: string;
    eraser: string;
    line: string;
    rectangle: string;
    circle: string;
    place_core: string;
    rect_select: string;
    fill: string;
    move: string;
    hand: string;
    annotation: string;
  };
  placeCore: {
    title: string;
    centerOnBlueprint: string;
    centerTooltip: string;
    includeWaypoint: string;
    coreComponent: string;
    statuesComponent: string;
    waypointComponent: string;
    placedSuccessToast: string;
    hint: string;
  };
  toolOptions: {
    brushSize: string;
    rectMode: string;
    circleMode: string;
    circleOrigin: string;
    fromCenter: string;
    fromCorner: string;
    radiusLabel: string;
    diameterLabel: string;
    outline: string;
    filled: string;
    connectedOnly: string;
  };
  doorOrientation: {
    title: string;
    horizontal: string;
    vertical: string;
  };
  doorTooltip: {
    title: string;
    text: string;
    dismiss: string;
  };
  // Properties panel
  properties: string;
  dimensions: string;
  width: string;
  height: string;
  cells: string;
  cellSize: string;
  zoom: string;
  viewOptions: string;
  showGrid: string;
  showMajorGrid: string;
  showCoordinates: string;
  gridBackground: string;
  gridBgLight: string;
  gridBgDark: string;
  gridThickness: string;
  gridThicknessThin: string;
  gridThicknessMedium: string;
  gridThicknessThick: string;
  blockDivisionContrast: string;
  centerCanvas: string;
  fitToScreen: string;
  resetZoom: string;
  // Selection
  selection: string;
  noSelection: string;
  selectionCoords: string;
  selectionDims: string;
  selectionCount: string;
  copy: string;
  cut: string;
  paste: string;
  delete: string;
  duplicate: string;
  fillSelection: string;
  clearSelection: string;
  // Mirror Mode
  mirror: {
    title: string;
    realtime: string;
    none: string;
    horizontal: string;
    vertical: string;
    quad: string;
    axisLabelH: string;
    axisLabelV: string;
    mirrorSelectionTitle: string;
    mirrorSelectionOppositeH: string;
    mirrorSelectionOppositeV: string;
    flipSelectionH: string;
    flipSelectionV: string;
    duplicatedOppositeH: string;
    duplicatedOppositeV: string;
    flippedH: string;
    flippedV: string;
    centeredH: string;
    centeredV: string;
    centeredBoth: string;
    centerTitle: string;
    centerH: string;
    centerV: string;
    centerBoth: string;
    mirrorH: string;
    mirrorV: string;
    flipH: string;
    flipV: string;
  };
  // Palette & Colors
  palette: string;
  addColor: string;
  editColor: string;
  deleteColor: string;
  colorName: string;
  colorHex: string;
  saveColor: string;
  cancel: string;
  defaultColors: {
    wall: string;
    floor: string;
    doorway: string;
    storage: string;
    workshop: string;
    farm: string;
    enclosure: string;
    core: string;
    statue: string;
    lighting: string;
    npc: string;
    other: string;
  };
  legend: string;
  emptyCells: string;
  totalOccupied: string;
  // Modals
  newProjectModal: {
    title: string;
    desc: string;
    width: string;
    height: string;
    presets: string;
    create: string;
    cancel: string;
    confirmWarning: string;
  };
  resizeModal: {
    title: string;
    desc: string;
    currentSize: string;
    newSize: string;
    trimWarning: string;
    apply: string;
    cancel: string;
  };
  exportModal: {
    title: string;
    desc: string;
    format: string;
    scale: string;
    background: string;
    bgDark: string;
    bgNavy: string;
    bgLight: string;
    bgTransparent: string;
    includeGrid: string;
    includeLegend: string;
    export: string;
    cancel: string;
    exporting: string;
  };
  exportCodeModal: {
    title: string;
    description: string;
    copy: string;
    copied: string;
    download: string;
    cancel: string;
  };
  importCodeModal: {
    title: string;
    description: string;
    import: string;
    importing: string;
    cancel: string;
    errorEmpty: string;
    errorInvalid: string;
  };
  shortcutsModal: {
    title: string;
    toolsSection: string;
    canvasSection: string;
    clipboardSection: string;
    panInfo: string;
    panDirect: string;
    zoomInfo: string;
    zoomInOut: string;
    scrollWheel: string;
    spaceDrag: string;
    middleButton: string;
    close: string;
  };
  // Misc UI
  defaultProjectName: string;
  toolsSection: string;
  change: string;
  size: string;
  origin: string;
  activeColor: string;
  outsideCanvas: string;
  newColor: string;
  zoomOut: string;
  zoomIn: string;
  closeModal: string;
  propertiesPanelAria: string;
  toolbarAria: string;
  copyTooltip: string;
  cutTooltip: string;
  fillSelectionTooltip: string;
  deleteTooltip: string;
  editColorTooltip: string;
  deleteColorTooltip: string;
  rectOutlineTooltip: string;
  rectFilledTooltip: string;
  circleOutlineTooltip: string;
  circleFilledTooltip: string;
  circleFromCenterTooltip: string;
  circleFromCornerTooltip: string;
  clearBlueprint: string;
  confirmClearBlueprint: string;
  confirmClearQuestion: string;
  annotationPrompt: string;
  annotationEditPrompt: string;
  annotationAdded: string;
  annotationUpdated: string;
  annotationDeleted: string;
  alerts: {
    invalidJson: string;
    projectLoaded: string;
    projectSaved: string;
    imageExported: string;
    codeCopied: string;
    codeDownloaded: string;
    clipboardEmpty: string;
    copied: string;
    cut: string;
    pasted: string;
  };
  footer: {
    cursorPos: string;
    gridScale: string;
    panHint: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    appName: 'Core Keeper Planner',
    appSubtitle: 'Planificador de construcciÃ³n y habitaciones 1:1',
    newProject: 'Nuevo',
    openProject: 'Abrir',
    saveProject: 'Guardar',
    exportImage: 'Exportar imagen',
    exportCode: 'Exportar cÃ³digo',
    importCode: 'Importar cÃ³digo',
    undo: 'Deshacer',
    redo: 'Rehacer',
    settings: 'Configurar plano',
    shortcuts: 'Atajos de teclado',
    language: 'Idioma',
    projectNamePlaceholder: 'Nombre del plano...',
    tools: {
      select: 'Seleccionar',
      pencil: 'LÃ¡piz',
      eraser: 'Borrador',
      line: 'LÃ­nea',
      rectangle: 'RectÃ¡ngulo',
      circle: 'CÃ­rculo',
      rect_select: 'SelecciÃ³n rectangular',
      fill: 'Rellenar Ã¡rea',
      move: 'Mover selecciÃ³n',
      place_core: 'Colocar Core',
      hand: 'Mano',
      annotation: 'AnotaciÃ³n',
    },
    tooltips: {
      select: 'Seleccionar casilla o inspeccionar (V)',
      pencil: 'Pintar casillas con el color activo (P)',
      eraser: 'Borrar contenido de casillas (E)',
      line: 'Dibujar lÃ­nea recta o diagonal (L)',
      rectangle: 'Dibujar habitaciÃ³n o bloque rectangular (R)',
      circle: 'Dibujar habitaciÃ³n o estructura circular perfecta (C)',
      place_core: 'Colocar Core y estatuas inamovibles de inicio (K)',
      hand: 'Mover el lienzo arrastrando (H)',
      rect_select: 'Seleccionar regiÃ³n para copiar, mover o borrar (S)',
      fill: 'Rellenar Ã¡rea conectada de casillas (B / G)',
      move: 'Mover casillas de la selecciÃ³n (M)',
      annotation: 'Agregar o editar una anotaciÃ³n de texto en una casilla (T)',
    },
    placeCore: {
      title: 'Colocar Core y Estatuas',
      centerOnBlueprint: 'Centrar en el plano',
      centerTooltip: 'Coloca el patrÃ³n del Core automÃ¡ticamente en el centro exacto del plano',
      includeWaypoint: 'Incluir Waypoint',
      coreComponent: 'NÃºcleo Central (5Ã—5)',
      statuesComponent: '3 Estatuas de Jefes (3Ã—3)',
      waypointComponent: 'Punto de apariciÃ³n (3Ã—3)',
      placedSuccessToast: 'PatrÃ³n del Core y estatuas colocado con Ã©xito',
      hint: 'Haz clic en el plano para estampar el Core o usa "Centrar en el plano"',
    },
    toolOptions: {
      brushSize: 'Grosor',
      rectMode: 'Modo rectÃ¡ngulo',
      circleMode: 'Modo cÃ­rculo',
      circleOrigin: 'Trazado',
      fromCenter: 'Desde centro (SimÃ©trico)',
      fromCorner: 'Desde esquina',
      radiusLabel: 'Radio',
      diameterLabel: 'DiÃ¡metro',
      outline: 'Solo muros (hueco)',
      filled: 'Relleno completo',
      connectedOnly: 'Solo celdas conectadas',
    },
    doorOrientation: {
      title: 'OrientaciÃ³n de puerta',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
    doorTooltip: {
      title: 'OrientaciÃ³n de puerta',
      text: 'AquÃ­ puedes cambiar la orientaciÃ³n de la puerta entre horizontal y vertical.',
      dismiss: 'Cerrar',
    },
    properties: 'Propiedades',
    dimensions: 'Dimensiones del plano',
    width: 'Ancho',
    height: 'Alto',
    cells: 'casillas',
    cellSize: 'TamaÃ±o visual',
    zoom: 'Zoom',
    viewOptions: 'Opciones de vista',
    showGrid: 'Mostrar cuadrÃ­cula',
    showMajorGrid: 'GuÃ­a de chunks (16Ã—16)',
    showCoordinates: 'Reglas y coordenadas',
    gridBackground: 'Fondo del plano',
    gridBgLight: 'Blanco (Papel / Plano)',
    gridBgDark: 'Oscuro (CarbÃ³n)',
    gridThickness: 'Grosor de lÃ­neas',
    gridThicknessThin: 'Fina (1px)',
    gridThicknessMedium: 'Media (1.5px)',
    gridThicknessThick: 'Gruesa (2.5px)',
    blockDivisionContrast: 'Separador oscuro entre bloques',
    centerCanvas: 'Centrar plano',
    fitToScreen: 'Ajustar a pantalla',
    resetZoom: 'Reiniciar zoom (100%)',
    selection: 'SelecciÃ³n',
    noSelection: 'Ninguna regiÃ³n seleccionada',
    selectionCoords: 'PosiciÃ³n inicial',
    selectionDims: 'Dimensiones',
    selectionCount: 'Casillas seleccionadas',
    copy: 'Copiar',
    cut: 'Cortar',
    paste: 'Pegar',
    delete: 'Eliminar',
    duplicate: 'Duplicar',
    fillSelection: 'Rellenar con color activo',
    clearSelection: 'Deseleccionar',
    mirror: {
      title: 'Modo espejo',
      realtime: 'Espejo en tiempo real',
      none: 'Desactivado',
      horizontal: 'Horizontal (Izq / Der)',
      vertical: 'Vertical (Arr / Abajo)',
      quad: 'CuÃ¡druple (4 cuadrantes)',
      axisLabelH: 'Eje de simetrÃ­a horizontal',
      axisLabelV: 'Eje de simetrÃ­a vertical',
      mirrorSelectionTitle: 'Espejo en selecciÃ³n',
      mirrorSelectionOppositeH: 'Duplicar espejo (Opuesto Este/Oeste)',
      mirrorSelectionOppositeV: 'Duplicar espejo (Opuesto Norte/Sur)',
      flipSelectionH: 'Voltear selecciÃ³n horizontalmente',
      flipSelectionV: 'Voltear selecciÃ³n verticalmente',
      duplicatedOppositeH: 'RegiÃ³n duplicada en espejo horizontalmente.',
      duplicatedOppositeV: 'RegiÃ³n duplicada en espejo verticalmente.',
      flippedH: 'SelecciÃ³n volteada horizontalmente.',
      flippedV: 'SelecciÃ³n volteada verticalmente.',
      centeredH: 'SelecciÃ³n centrada horizontalmente.',
      centeredV: 'SelecciÃ³n centrada verticalmente.',
      centeredBoth: 'SelecciÃ³n centrada en ambos ejes.',
      centerTitle: 'Centrar selecciÃ³n',
      centerH: 'H',
      centerV: 'V',
      centerBoth: 'Ambos',
      mirrorH: 'Espejo H',
      mirrorV: 'Espejo V',
      flipH: 'Voltear H',
      flipV: 'Voltear V',
    },
    palette: 'Paleta de colores',
    addColor: 'AÃ±adir color',
    editColor: 'Editar color',
    deleteColor: 'Eliminar',
    colorName: 'Nombre del elemento',
    colorHex: 'Color (HEX)',
    saveColor: 'Guardar',
    cancel: 'Cancelar',
    defaultColors: {
      wall: 'Pared / Muro',
      floor: 'Suelo / Camino',
      doorway: 'Entrada / Puerta',
      storage: 'AlmacÃ©n / Cofres',
      workshop: 'Taller / Estaciones',
      farm: 'Zona de cultivo',
      enclosure: 'Corral de animales',
      core: 'NÃºcleo / Portal',
      statue: 'Estatua / Altar',
      lighting: 'IluminaciÃ³n / Antorchas',
      npc: 'HabitaciÃ³n NPC / Muebles',
      other: 'Otro / Libre',
    },
    legend: 'Leyenda y estadÃ­sticas',
    emptyCells: 'VacÃ­as',
    totalOccupied: 'Ocupadas',
    newProjectModal: {
      title: 'Crear nuevo plano',
      desc: 'Define el tamaÃ±o inicial de la cuadrÃ­cula de construcciÃ³n.',
      width: 'Ancho (casillas)',
      height: 'Alto (casillas)',
      presets: 'TamaÃ±os predefinidos',
      create: 'Crear plano',
      cancel: 'Cancelar',
      confirmWarning: 'Se perderÃ¡n las modificaciones no guardadas del plano actual.',
    },
    resizeModal: {
      title: 'Cambiar tamaÃ±o del plano',
      desc: 'Modifica las dimensiones de la cuadrÃ­cula de trabajo.',
      currentSize: 'TamaÃ±o actual',
      newSize: 'Nuevo tamaÃ±o',
      trimWarning: 'Â¡AtenciÃ³n! Reducir el plano dejarÃ¡ {count} casillas fuera de los lÃ­mites y se eliminarÃ¡n.',
      apply: 'Aplicar cambios',
      cancel: 'Cancelar',
    },
    exportModal: {
      title: 'Exportar imagen del plano',
      desc: 'Genera una imagen en formato PNG de alta resoluciÃ³n.',
      format: 'Formato',
      scale: 'ResoluciÃ³n de exportaciÃ³n',
      background: 'Color de fondo',
      bgDark: 'Gris oscuro carbÃ³n',
      bgNavy: 'Azul plano tÃ©cnico',
      bgLight: 'Fondo claro',
      bgTransparent: 'Transparente',
      includeGrid: 'Incluir lÃ­neas de cuadrÃ­cula',
      includeLegend: 'Incluir leyenda de colores',
      export: 'Descargar PNG',
      cancel: 'Cancelar',
      exporting: 'Generando imagen...',
    },
    exportCodeModal: {
      title: 'CÃ³digo compartible',
      description: 'Copia este cÃ³digo y pÃ©galo en cualquier red social o foro. Cualquiera puede importarlo en el editor para cargar tu diseÃ±o exactamente como lo creaste.',
      copy: 'Copiar cÃ³digo',
      copied: 'Â¡CÃ³digo copiado al portapapeles!',
      download: 'Descargar como archivo',
      cancel: 'Cancelar',
    },
    importCodeModal: {
      title: 'Importar desde cÃ³digo',
      description: 'Pega aquÃ­ el cÃ³digo CKBP que te compartieron para cargar ese diseÃ±o en tu editor.',
      import: 'Cargar diseÃ±o',
      importing: 'Cargando...',
      cancel: 'Cancelar',
      errorEmpty: 'Por favor pega un cÃ³digo primero.',
      errorInvalid: 'CÃ³digo invÃ¡lido o corrupto.',
    },
    shortcutsModal: {
      title: 'Atajos de teclado',
      toolsSection: 'Herramientas',
      canvasSection: 'NavegaciÃ³n del lienzo',
      clipboardSection: 'EdiciÃ³n y portapapeles',
      panInfo: 'BotÃ³n central del ratÃ³n, o Espacio + Arrastrar',
      panDirect: 'Desplazamiento directo',
      zoomInfo: 'Rueda del ratÃ³n sobre el cursor o teclas + / -',
      zoomInOut: 'Aumentar / Reducir zoom',
      scrollWheel: 'Rueda del ratÃ³n',
      spaceDrag: 'Espacio + Arrastrar',
      middleButton: 'BotÃ³n Central',
      close: 'Cerrar',
    },
    defaultProjectName: 'Plano Base Core Keeper',
    toolsSection: 'Herramientas',
    change: 'Cambiar',
    size: 'TamaÃ±o',
    origin: 'Origen',
    activeColor: 'Color activo',
    outsideCanvas: 'Fuera del plano',
    newColor: 'Nuevo color',
    zoomOut: 'Reducir zoom',
    zoomIn: 'Aumentar zoom',
    closeModal: 'Cerrar modal',
    propertiesPanelAria: 'Panel de propiedades',
    toolbarAria: 'Barra de herramientas',
    copyTooltip: 'Copiar (Ctrl+C)',
    cutTooltip: 'Cortar (Ctrl+X)',
    fillSelectionTooltip: 'Rellenar selecciÃ³n con color activo',
    deleteTooltip: 'Eliminar (Supr / Backspace)',
    editColorTooltip: 'Editar color',
    deleteColorTooltip: 'Eliminar color',
    rectOutlineTooltip: 'Dibuja muros perimetrales con interior vacÃ­o',
    rectFilledTooltip: 'Dibuja bloque sÃ³lido de casillas',
    circleOutlineTooltip: 'Dibuja anillo de muros perimetrales con interior vacÃ­o',
    circleFilledTooltip: 'Dibuja disco sÃ³lido circular de casillas',
    circleFromCenterTooltip: 'Clic en el bloque central y expandir hacia fuera de forma simÃ©trica',
    circleFromCornerTooltip: 'Arrastrar entre dos esquinas de una caja cuadrada',
    clearBlueprint: 'Limpiar plano',
    confirmClearBlueprint: 'SÃ­, borrar todo',
    confirmClearQuestion: 'Â¿Seguro?',
    annotationPrompt: 'Texto de la anotaciÃ³n:',
    annotationEditPrompt: 'Editar anotaciÃ³n:',
    annotationAdded: 'AnotaciÃ³n aÃ±adida',
    annotationUpdated: 'AnotaciÃ³n actualizada',
    annotationDeleted: 'AnotaciÃ³n eliminada',
    alerts: {
      invalidJson: 'El archivo seleccionado no es un plano JSON vÃ¡lido.',
      projectLoaded: 'Plano cargado correctamente.',
      projectSaved: 'Plano guardado como archivo JSON.',
      imageExported: 'Imagen del plano exportada con Ã©xito.',
      codeCopied: 'CÃ³digo copiado al portapapeles.',
      codeDownloaded: 'CÃ³digo descargado como archivo.',
      clipboardEmpty: 'El portapapeles estÃ¡ vacÃ­o.',
      copied: 'RegiÃ³n copiada al portapapeles.',
      cut: 'RegiÃ³n cortada al portapapeles.',
      pasted: 'RegiÃ³n pegada. Haz clic en el lienzo para colocarla.',
    },
    footer: {
      cursorPos: 'Casilla',
      gridScale: 'Escala 1:1 bloque Core Keeper',
      panHint: 'Espacio + Arrastre o botÃ³n central para mover',
    },
  },
  en: {
    appName: 'Core Keeper Planner',
    appSubtitle: '1:1 Room & Base Construction Planner',
    newProject: 'New',
    openProject: 'Open',
    saveProject: 'Save',
    exportImage: 'Export Image',
    exportCode: 'Export Code',
    importCode: 'Import Code',
    undo: 'Undo',
    redo: 'Redo',
    settings: 'Blueprint Settings',
    shortcuts: 'Keyboard Shortcuts',
    language: 'Language',
    projectNamePlaceholder: 'Blueprint name...',
    tools: {
      select: 'Select',
      pencil: 'Pencil',
      eraser: 'Eraser',
      line: 'Line',
      rectangle: 'Rectangle',
      circle: 'Circle',
      rect_select: 'Rect Select',
      fill: 'Fill Area',
      move: 'Move Selection',
      place_core: 'Place Core',
      hand: 'Hand',
      annotation: 'Annotation',
    },
    tooltips: {
      select: 'Select cell or inspect (V)',
      pencil: 'Paint cells with active color (P)',
      eraser: 'Clear cell contents (E)',
      line: 'Draw straight or diagonal line (L)',
      rectangle: 'Draw room or rectangular block (R)',
      circle: 'Draw perfect circular room or structure (C)',
      place_core: 'Place Core and default immovable boss statues (K)',
      hand: 'Pan canvas by dragging (H)',
      rect_select: 'Select region to copy, move or delete (S)',
      fill: 'Flood fill connected area (B / G)',
      move: 'Move selection cells (M)',
      annotation: 'Add or edit a text annotation on a cell (T)',
    },
    placeCore: {
      title: 'Place Core & Statues',
      centerOnBlueprint: 'Center on blueprint',
      centerTooltip: 'Automatically stamps the Core & Statues at the exact center of the blueprint',
      includeWaypoint: 'Include Waypoint',
      coreComponent: 'Central Core (5Ã—5)',
      statuesComponent: '3 Boss Statues (3Ã—3)',
      waypointComponent: 'Spawn Waypoint (3Ã—3)',
      placedSuccessToast: 'Core & statues pattern placed successfully',
      hint: 'Click on grid to stamp Core or use "Center on blueprint"',
    },
    toolOptions: {
      brushSize: 'Size',
      rectMode: 'Rectangle Mode',
      circleMode: 'Circle Mode',
      circleOrigin: 'Drawing Origin',
      fromCenter: 'From Center (Symmetric)',
      fromCorner: 'From Corner',
      radiusLabel: 'Radius',
      diameterLabel: 'Diameter',
      outline: 'Walls only (Hollow)',
      filled: 'Solid fill',
      connectedOnly: 'Connected cells only',
    },
    doorOrientation: {
      title: 'Door Orientation',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
    doorTooltip: {
      title: 'Door Orientation',
      text: 'Here you can change the door orientation between horizontal and vertical.',
      dismiss: 'Close',
    },
    properties: 'Properties',
    dimensions: 'Blueprint Dimensions',
    width: 'Width',
    height: 'Height',
    cells: 'cells',
    cellSize: 'Visual size',
    zoom: 'Zoom',
    viewOptions: 'View Options',
    showGrid: 'Show grid lines',
    showMajorGrid: 'Chunk guides (16Ã—16)',
    showCoordinates: 'Rulers & coordinates',
    gridBackground: 'Blueprint background',
    gridBgLight: 'White (Paper / Blueprint)',
    gridBgDark: 'Dark (Charcoal)',
    gridThickness: 'Grid line thickness',
    gridThicknessThin: 'Thin (1px)',
    gridThicknessMedium: 'Medium (1.5px)',
    gridThicknessThick: 'Thick (2.5px)',
    blockDivisionContrast: 'Dark block divider lines',
    centerCanvas: 'Center blueprint',
    fitToScreen: 'Fit to screen',
    resetZoom: 'Reset zoom (100%)',
    selection: 'Selection',
    noSelection: 'No active selection',
    selectionCoords: 'Top-left position',
    selectionDims: 'Dimensions',
    selectionCount: 'Selected cells',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    delete: 'Delete',
    duplicate: 'Duplicate',
    fillSelection: 'Fill with active color',
    clearSelection: 'Clear selection',
    mirror: {
      title: 'Mirror Mode',
      realtime: 'Real-time Mirror',
      none: 'Off',
      horizontal: 'Horizontal (Left / Right)',
      vertical: 'Vertical (Top / Bottom)',
      quad: 'Quad (4 Quadrants)',
      axisLabelH: 'Horizontal symmetry axis',
      axisLabelV: 'Vertical symmetry axis',
      mirrorSelectionTitle: 'Selection Mirror',
      mirrorSelectionOppositeH: 'Duplicate mirror (Opposite East/West)',
      mirrorSelectionOppositeV: 'Duplicate mirror (Opposite North/South)',
      flipSelectionH: 'Flip selection horizontally',
      flipSelectionV: 'Flip selection vertically',
      duplicatedOppositeH: 'Region duplicated horizontally in mirror.',
      duplicatedOppositeV: 'Region duplicated vertically in mirror.',
      flippedH: 'Selection flipped horizontally.',
      flippedV: 'Selection flipped vertically.',
      centeredH: 'Selection centered horizontally.',
      centeredV: 'Selection centered vertically.',
      centeredBoth: 'Selection centered on both axes.',
      centerTitle: 'Center selection',
      centerH: 'H',
      centerV: 'V',
      centerBoth: 'Both',
      mirrorH: 'Mirror H',
      mirrorV: 'Mirror V',
      flipH: 'Flip H',
      flipV: 'Flip V',
    },
    palette: 'Color Palette',
    addColor: 'Add Color',
    editColor: 'Edit Color',
    deleteColor: 'Delete',
    colorName: 'Element Name',
    colorHex: 'Color (HEX)',
    saveColor: 'Save',
    cancel: 'Cancel',
    defaultColors: {
      wall: 'Wall / Boundary',
      floor: 'Floor / Path',
      doorway: 'Doorway / Entrance',
      storage: 'Storage / Chests',
      workshop: 'Workshop / Stations',
      farm: 'Farm Plots',
      enclosure: 'Cattle Enclosure',
      core: 'Core / Waypoint',
      statue: 'Statue / Altar',
      lighting: 'Lighting / Torch',
      npc: 'NPC Room / Furniture',
      other: 'Other / Custom',
    },
    legend: 'Legend & Statistics',
    emptyCells: 'Empty',
    totalOccupied: 'Occupied',
    newProjectModal: {
      title: 'Create New Blueprint',
      desc: 'Set the initial dimensions for the construction grid.',
      width: 'Width (cells)',
      height: 'Height (cells)',
      presets: 'Preset sizes',
      create: 'Create Blueprint',
      cancel: 'Cancel',
      confirmWarning: 'Unsaved changes to the current blueprint will be lost.',
    },
    resizeModal: {
      title: 'Change Blueprint Dimensions',
      desc: 'Modify the working grid dimensions.',
      currentSize: 'Current size',
      newSize: 'New size',
      trimWarning: 'Warning! Shrinking the blueprint will leave {count} cells outside the boundary and they will be removed.',
      apply: 'Apply changes',
      cancel: 'Cancel',
    },
    exportModal: {
      title: 'Export Blueprint Image',
      desc: 'Generate a high-resolution PNG image of the blueprint.',
      format: 'Format',
      scale: 'Export resolution',
      background: 'Background color',
      bgDark: 'Dark charcoal',
      bgNavy: 'Blueprint navy',
      bgLight: 'Light background',
      bgTransparent: 'Transparent',
      includeGrid: 'Include grid lines',
      includeLegend: 'Include color legend',
      export: 'Download PNG',
      cancel: 'Cancel',
      exporting: 'Rendering image...',
    },
    exportCodeModal: {
      title: 'Shareable Code',
      description: 'Copy this code and paste it on any social media or forum. Anyone can import it into the editor to load your design exactly as you created it.',
      copy: 'Copy code',
      copied: 'Code copied to clipboard!',
      download: 'Download as file',
      cancel: 'Cancel',
    },
    importCodeModal: {
      title: 'Import from Code',
      description: 'Paste the CKBP code shared with you to load that design into your editor.',
      import: 'Load design',
      importing: 'Loading...',
      cancel: 'Cancel',
      errorEmpty: 'Please paste a code first.',
      errorInvalid: 'Invalid or corrupt code.',
    },
    shortcutsModal: {
      title: 'Keyboard Shortcuts',
      toolsSection: 'Tools',
      canvasSection: 'Canvas Navigation',
      clipboardSection: 'Editing & Clipboard',
      panInfo: 'Middle mouse button, or Space + Drag',
      panDirect: 'Direct pan',
      zoomInfo: 'Mouse wheel over cursor or + / - keys',
      zoomInOut: 'Zoom in / Zoom out',
      scrollWheel: 'Mouse wheel',
      spaceDrag: 'Space + Drag',
      middleButton: 'Middle button',
      close: 'Close',
    },
    defaultProjectName: 'Core Keeper Base Plan',
    toolsSection: 'Tools',
    change: 'Change',
    size: 'Size',
    origin: 'Origin',
    activeColor: 'Active color',
    outsideCanvas: 'Outside the canvas',
    newColor: 'New color',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    closeModal: 'Close modal',
    propertiesPanelAria: 'Properties panel',
    toolbarAria: 'Tool bar',
    copyTooltip: 'Copy (Ctrl+C)',
    cutTooltip: 'Cut (Ctrl+X)',
    fillSelectionTooltip: 'Fill selection with active color',
    deleteTooltip: 'Delete (Del / Backspace)',
    editColorTooltip: 'Edit color',
    deleteColorTooltip: 'Delete color',
    rectOutlineTooltip: 'Draws perimeter walls with an empty interior',
    rectFilledTooltip: 'Draws a solid block of cells',
    circleOutlineTooltip: 'Draws a ring of perimeter walls with an empty interior',
    circleFilledTooltip: 'Draws a solid circular disk of cells',
    circleFromCenterTooltip: 'Click the center cell and expand outward symmetrically',
    circleFromCornerTooltip: 'Drag between two corners of a square box',
    clearBlueprint: 'Clear blueprint',
    confirmClearBlueprint: 'Yes, delete all',
    confirmClearQuestion: 'Are you sure?',
    annotationPrompt: 'Annotation text:',
    annotationEditPrompt: 'Edit annotation:',
    annotationAdded: 'Annotation added',
    annotationUpdated: 'Annotation updated',
    annotationDeleted: 'Annotation deleted',
    alerts: {
      invalidJson: 'The selected file is not a valid JSON blueprint.',
      projectLoaded: 'Blueprint loaded successfully.',
      projectSaved: 'Blueprint saved as JSON file.',
      imageExported: 'Blueprint image exported successfully.',
      codeCopied: 'Code copied to clipboard.',
      codeDownloaded: 'Code downloaded as file.',
      clipboardEmpty: 'Clipboard is empty.',
      copied: 'Region copied to clipboard.',
      cut: 'Region cut to clipboard.',
      pasted: 'Region pasted. Click on canvas to place it.',
    },
    footer: {
      cursorPos: 'Cell',
      gridScale: '1:1 Core Keeper block scale',
      panHint: 'Space + Drag or Middle Click to pan',
    },
  },
};


