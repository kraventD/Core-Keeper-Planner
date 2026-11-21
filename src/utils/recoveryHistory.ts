import { BlueprintProject } from '../types/blueprint';

const DATABASE_NAME = 'corekeeper_blueprint_recovery_history';
const DATABASE_VERSION = 1;
const STORE_NAME = 'snapshots';
export const RECOVERY_INTERVAL_MS = 5 * 60 * 1000;
export const MAX_RECOVERY_SNAPSHOTS = 48;

export interface RecoverySnapshot {
  id: string;
  createdAt: string;
  project: BlueprintProject;
  thumbnail: string;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  const promise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open recovery history.'));
    request.onblocked = () => reject(new Error('Recovery history is blocked by another tab.'));
  }).catch(error => {
    databasePromise = null;
    throw error;
  });
  databasePromise = promise;
  return promise;
}

function safeHex(color?: string): string {
  return color && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color) ? color : '#64748b';
}

function hashColor(value: string, palette: string[]): string {
  let hash = 0;
  for (let index = 0; index < value.length; index++) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function createProjectThumbnail(project: BlueprintProject): string {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 190;
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.fillStyle = '#0b1220';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const inset = 14;
  const scale = Math.min((canvas.width - inset * 2) / project.width, (canvas.height - inset * 2) / project.height);
  const gridWidth = scale * project.width;
  const gridHeight = scale * project.height;
  const left = (canvas.width - gridWidth) / 2;
  const top = (canvas.height - gridHeight) / 2;

  context.fillStyle = '#111d30';
  context.fillRect(left, top, gridWidth, gridHeight);

  const floorColors = ['#6b7280', '#a16207', '#0e7490', '#4d7c0f', '#9333ea', '#b45309'];
  for (const [key, floorId] of Object.entries(project.floorTiles ?? {})) {
    const [x, y] = key.split(',').map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= project.width || y >= project.height) continue;
    context.fillStyle = hashColor(floorId, floorColors);
    context.fillRect(left + x * scale, top + y * scale, Math.max(scale, 1), Math.max(scale, 1));
  }

  const colorById = new Map(project.palette.map(color => [color.id, safeHex(color.hex)]));
  for (const [key, colorId] of Object.entries(project.cells)) {
    const [x, y] = key.split(',').map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= project.width || y >= project.height) continue;
    context.fillStyle = colorById.get(colorId) ?? '#94a3b8';
    context.fillRect(left + x * scale, top + y * scale, Math.max(scale, 1), Math.max(scale, 1));
  }

  for (const item of project.storagePlacements ?? []) {
    const layerColor = item.layer === 'light' ? '#fde047' : item.layer === 'rail' ? '#a78bfa' : '#22d3ee';
    context.fillStyle = layerColor;
    context.fillRect(left + item.x * scale, top + item.y * scale, Math.max(scale * item.width, 1), Math.max(scale * item.height, 1));
  }

  for (const annotation of project.annotations ?? []) {
    context.fillStyle = '#facc15';
    context.beginPath();
    context.arc(left + (annotation.x + 0.5) * scale, top + (annotation.y + 0.5) * scale, Math.max(2, Math.min(4, scale / 2)), 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  context.lineWidth = 1;
  context.strokeRect(left + 0.5, top + 0.5, Math.max(0, gridWidth - 1), Math.max(0, gridHeight - 1));
  return canvas.toDataURL('image/jpeg', 0.78);
}

export function createRecoverySnapshot(project: BlueprintProject): RecoverySnapshot {
  const now = new Date();
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return {
    id: `recovery_${now.getTime()}_${randomId}`,
    createdAt: now.toISOString(),
    project: JSON.parse(JSON.stringify(project)) as BlueprintProject,
    thumbnail: createProjectThumbnail(project),
  };
}

export async function listRecoverySnapshots(): Promise<RecoverySnapshot[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll() as IDBRequest<RecoverySnapshot[]>;
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error ?? new Error('Could not read recovery history.'));
  });
}

export async function saveRecoverySnapshot(snapshot: RecoverySnapshot): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(snapshot);
    const request = store.getAll() as IDBRequest<RecoverySnapshot[]>;
    request.onsuccess = () => {
      const snapshots = request.result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const excess = snapshots.length - MAX_RECOVERY_SNAPSHOTS;
      for (const oldSnapshot of snapshots.slice(0, Math.max(0, excess))) store.delete(oldSnapshot.id);
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save recovery snapshot.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Recovery snapshot was not saved.'));
  });
}
