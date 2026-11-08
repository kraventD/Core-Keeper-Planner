import { BlueprintProject, PaletteColor } from '../types/blueprint';
import { DEFAULT_PALETTE } from './palette';

const AUTOSAVE_KEY = 'corekeeper_blueprint_autosave_v1';

export function saveProjectToJson(project: BlueprintProject): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = (project.name || 'core-keeper-blueprint')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_');
  a.download = `${cleanName}.ckbp.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseProjectJson(jsonStr: string): BlueprintProject {
  const data = JSON.parse(jsonStr);

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid JSON format: not an object');
  }

  if (typeof data.width !== 'number' || typeof data.height !== 'number') {
    throw new Error('Invalid blueprint: missing width/height');
  }

  if (typeof data.cells !== 'object' || data.cells === null) {
    throw new Error('Invalid blueprint: missing cells map');
  }

  // Migración de paleta: eliminar 'doorway' y asegurar 'door' en segunda posición (índice 1)
  let migratedPalette: PaletteColor[] = [];
  if (Array.isArray(data.palette) && data.palette.length > 0) {
    migratedPalette = data.palette.filter((p: PaletteColor) => p.id !== 'doorway');
    const doorColor = { id: 'door', name: 'Door / Puerta', hex: '#000000', isDefault: true };
    const doorIndex = migratedPalette.findIndex((p: PaletteColor) => p.id === 'door');
    if (doorIndex === -1) {
      // Si 'door' no existe, agregarlo en segunda posición (después del primero si hay alguno)
      migratedPalette.length > 0 ? migratedPalette.splice(1, 0, doorColor) : migratedPalette.push(doorColor);
    } else if (doorIndex !== 1) {
      // Mover 'door' a segunda posición si no está ya ahí
      const removed = migratedPalette.splice(doorIndex, 1)[0];
      migratedPalette.splice(1, 0, removed);
    }
  } else {
    migratedPalette = [...DEFAULT_PALETTE];
  }

  // Migración de celdas: reemplazar referencias a 'doorway' con 'door'
  const migratedCells: Record<string, string> = {};
  if (typeof data.cells === 'object' && data.cells !== null) {
    for (const [key, colorId] of Object.entries(data.cells)) {
      migratedCells[key] = (colorId as string) === 'doorway' ? 'door' : (colorId as string);
    }
  }

  return {
    id: typeof data.id === 'string' ? data.id : `proj_${Date.now()}`,
    name: typeof data.name === 'string' ? data.name : 'Core Keeper Blueprint',
    width: Math.max(5, Math.min(500, Math.round(data.width))),
    height: Math.max(5, Math.min(500, Math.round(data.height))),
    cells: migratedCells,
    palette: migratedPalette,
    annotations: Array.isArray(data.annotations) ? data.annotations : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function saveAutosave(project: BlueprintProject): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
  } catch (err) {
    console.warn('Autosave failed (storage full or disabled)', err);
  }
}

export function loadAutosave(): BlueprintProject | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return parseProjectJson(raw);
  } catch (err) {
    console.warn('Failed to load autosave', err);
    return null;
  }
}
