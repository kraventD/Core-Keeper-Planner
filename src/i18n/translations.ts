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
    close: string;
  };
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
    appSubtitle: 'Planificador de construcción y habitaciones 1:1',
    newProject: 'Nuevo',
    openProject: 'Abrir',
    saveProject: 'Guardar',
    exportImage: 'Exportar imagen',
    exportCode: 'Exportar código',
    importCode: 'Importar código',
    undo: 'Deshacer',
    redo: 'Rehacer',
    settings: 'Configurar plano',
    shortcuts: 'Atajos de teclado',
    language: 'Idioma',
    projectNamePlaceholder: 'Nombre del plano...',
    tools: {
      select: 'Seleccionar',
      pencil: 'Lápiz',
      eraser: 'Borrador',
      line: 'Línea',
      rectangle: 'Rectángulo',
      circle: 'Círculo',
      rect_select: 'Selección rectangular',
      fill: 'Rellenar área',
      move: 'Mover selección',
      place_core: 'Colocar Core',
      annotation: 'Anotación',
    },
    tooltips: {
      select: 'Seleccionar casilla o inspeccionar (V)',
      pencil: 'Pintar casillas con el color activo (P)',
      eraser: 'Borrar contenido de casillas (E)',
      line: 'Dibujar línea recta o diagonal (L)',
      rectangle: 'Dibujar habitación o bloque rectangular (R)',
      circle: 'Dibujar habitación o estructura circular perfecta (C)',
      place_core: 'Colocar Core y estatuas inamovibles de inicio (K)',
      rect_select: 'Seleccionar región para copiar, mover o borrar (S)',
      fill: 'Rellenar área conectada de casillas (B / G)',
      move: 'Mover casillas de la selección (M)',
      annotation: 'Agregar o editar una anotación de texto en una casilla (T)',
    },
    placeCore: {
      title: 'Colocar Core y Estatuas',
      centerOnBlueprint: 'Centrar en el plano',
      centerTooltip: 'Coloca el patrón del Core automáticamente en el centro exacto del plano',
      includeWaypoint: 'Incluir Waypoint',
      coreComponent: 'Núcleo Central (5×5)',
      statuesComponent: '3 Estatuas de Jefes (3×3)',
      waypointComponent: 'Punto de aparición (3×3)',
      placedSuccessToast: 'Patrón del Core y estatuas colocado con éxito',
      hint: 'Haz clic en el plano para estampar el Core o usa "Centrar en el plano"',
    },
    toolOptions: {
      brushSize: 'Grosor',
      rectMode: 'Modo rectángulo',
      circleMode: 'Modo círculo',
      circleOrigin: 'Trazado',
      fromCenter: 'Desde centro (Simétrico)',
      fromCorner: 'Desde esquina',
      radiusLabel: 'Radio',
      diameterLabel: 'Diámetro',
      outline: 'Solo muros (hueco)',
      filled: 'Relleno completo',
      connectedOnly: 'Solo celdas conectadas',
    },
    doorOrientation: {
      title: 'Orientación de puerta',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
    doorTooltip: {
      title: 'Orientación de puerta',
      text: 'Aquí puedes cambiar la orientación de la puerta entre horizontal y vertical.',
      dismiss: 'Cerrar',
    },
    properties: 'Propiedades',
    dimensions: 'Dimensiones del plano',
    width: 'Ancho',
    height: 'Alto',
    cells: 'casillas',
    cellSize: 'Tamaño visual',
    zoom: 'Zoom',
    viewOptions: 'Opciones de vista',
    showGrid: 'Mostrar cuadrícula',
    showMajorGrid: 'Guía de chunks (16×16)',
    showCoordinates: 'Reglas y coordenadas',
    gridBackground: 'Fondo del plano',
    gridBgLight: 'Blanco (Papel / Plano)',
    gridBgDark: 'Oscuro (Carbón)',
    gridThickness: 'Grosor de líneas',
    gridThicknessThin: 'Fina (1px)',
    gridThicknessMedium: 'Media (1.5px)',
    gridThicknessThick: 'Gruesa (2.5px)',
    blockDivisionContrast: 'Separador oscuro entre bloques',
    centerCanvas: 'Centrar plano',
    fitToScreen: 'Ajustar a pantalla',
    resetZoom: 'Reiniciar zoom (100%)',
    selection: 'Selección',
    noSelection: 'Ninguna región seleccionada',
    selectionCoords: 'Posición inicial',
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
      quad: 'Cuádruple (4 cuadrantes)',
      axisLabelH: 'Eje de simetría horizontal',
      axisLabelV: 'Eje de simetría vertical',
      mirrorSelectionTitle: 'Espejo en selección',
      mirrorSelectionOppositeH: 'Duplicar espejo (Opuesto Este/Oeste)',
      mirrorSelectionOppositeV: 'Duplicar espejo (Opuesto Norte/Sur)',
      flipSelectionH: 'Voltear selección horizontalmente',
      flipSelectionV: 'Voltear selección verticalmente',
      duplicatedOppositeH: 'Región duplicada en espejo horizontalmente.',
      duplicatedOppositeV: 'Región duplicada en espejo verticalmente.',
      flippedH: 'Selección volteada horizontalmente.',
      flippedV: 'Selección volteada verticalmente.',
      centeredH: 'Selección centrada horizontalmente.',
      centeredV: 'Selección centrada verticalmente.',
      centeredBoth: 'Selección centrada en ambos ejes.',
      centerTitle: 'Centrar selección',
      centerH: 'H',
      centerV: 'V',
      centerBoth: 'Ambos',
      mirrorH: 'Espejo H',
      mirrorV: 'Espejo V',
      flipH: 'Voltear H',
      flipV: 'Voltear V',
    },
    palette: 'Paleta de colores',
    addColor: 'Añadir color',
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
      storage: 'Almacén / Cofres',
      workshop: 'Taller / Estaciones',
      farm: 'Zona de cultivo',
      enclosure: 'Corral de animales',
      core: 'Núcleo / Portal',
      statue: 'Estatua / Altar',
      lighting: 'Iluminación / Antorchas',
      other: 'Otro / Libre',
    },
    legend: 'Leyenda y estadísticas',
    emptyCells: 'Vacías',
    totalOccupied: 'Ocupadas',
    newProjectModal: {
      title: 'Crear nuevo plano',
      desc: 'Define el tamaño inicial de la cuadrícula de construcción.',
      width: 'Ancho (casillas)',
      height: 'Alto (casillas)',
      presets: 'Tamaños predefinidos',
      create: 'Crear plano',
      cancel: 'Cancelar',
      confirmWarning: 'Se perderán las modificaciones no guardadas del plano actual.',
    },
    resizeModal: {
      title: 'Cambiar tamaño del plano',
      desc: 'Modifica las dimensiones de la cuadrícula de trabajo.',
      currentSize: 'Tamaño actual',
      newSize: 'Nuevo tamaño',
      trimWarning: '¡Atención! Reducir el plano dejará {count} casillas fuera de los límites y se eliminarán.',
      apply: 'Aplicar cambios',
      cancel: 'Cancelar',
    },
    exportModal: {
      title: 'Exportar imagen del plano',
      desc: 'Genera una imagen en formato PNG de alta resolución.',
      format: 'Formato',
      scale: 'Resolución de exportación',
      background: 'Color de fondo',
      bgDark: 'Gris oscuro carbón',
      bgNavy: 'Azul plano técnico',
      bgLight: 'Fondo claro',
      bgTransparent: 'Transparente',
      includeGrid: 'Incluir líneas de cuadrícula',
      includeLegend: 'Incluir leyenda de colores',
      export: 'Descargar PNG',
      cancel: 'Cancelar',
      exporting: 'Generando imagen...',
    },
    exportCodeModal: {
      title: 'Código compartible',
      description: 'Copia este código y pégalo en cualquier red social o foro. Cualquiera puede importarlo en el editor para cargar tu diseño exactamente como lo creaste.',
      copy: 'Copiar código',
      copied: '¡Código copiado al portapapeles!',
      download: 'Descargar como archivo',
      cancel: 'Cancelar',
    },
    importCodeModal: {
      title: 'Importar desde código',
      description: 'Pega aquí el código CKBP que te compartieron para cargar ese diseño en tu editor.',
      import: 'Cargar diseño',
      importing: 'Cargando...',
      cancel: 'Cancelar',
      errorEmpty: 'Por favor pega un código primero.',
      errorInvalid: 'Código inválido o corrupto.',
    },
    shortcutsModal: {
      title: 'Atajos de teclado',
      toolsSection: 'Herramientas',
      canvasSection: 'Navegación del lienzo',
      clipboardSection: 'Edición y portapapeles',
      panInfo: 'Botón central del ratón, o Espacio + Arrastrar',
      panDirect: 'Desplazamiento directo',
      zoomInfo: 'Rueda del ratón sobre el cursor o teclas + / -',
      zoomInOut: 'Aumentar / Reducir zoom',
      close: 'Cerrar',
    },
    alerts: {
      invalidJson: 'El archivo seleccionado no es un plano JSON válido.',
      projectLoaded: 'Plano cargado correctamente.',
      projectSaved: 'Plano guardado como archivo JSON.',
      imageExported: 'Imagen del plano exportada con éxito.',
      codeCopied: 'Código copiado al portapapeles.',
      codeDownloaded: 'Código descargado como archivo.',
      clipboardEmpty: 'El portapapeles está vacío.',
      copied: 'Región copiada al portapapeles.',
      cut: 'Región cortada al portapapeles.',
      pasted: 'Región pegada. Haz clic en el lienzo para colocarla.',
    },
    footer: {
      cursorPos: 'Casilla',
      gridScale: 'Escala 1:1 bloque Core Keeper',
      panHint: 'Espacio + Arrastre o botón central para mover',
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
      coreComponent: 'Central Core (5×5)',
      statuesComponent: '3 Boss Statues (3×3)',
      waypointComponent: 'Spawn Waypoint (3×3)',
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
    showMajorGrid: 'Chunk guides (16×16)',
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
      close: 'Close',
    },
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
