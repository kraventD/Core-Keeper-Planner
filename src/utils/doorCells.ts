import { DoorOrientation } from '../types/blueprint';

export function doorCellId(orientation: DoorOrientation): string {
  return `door-${orientation}`;
}

export function getDoorCellOrientation(colorId: string): DoorOrientation | null {
  if (colorId === 'door-vertical') return 'vertical';
  if (colorId === 'door-horizontal' || colorId === 'door' || colorId === 'doorway') return 'horizontal';
  return null;
}

export function getCanonicalCellColorId(colorId: string): string {
  return getDoorCellOrientation(colorId) ? 'door' : colorId;
}

export function getDoorPlacementColorId(colorId: string, orientation: DoorOrientation): string {
  return colorId === 'door' ? doorCellId(orientation) : colorId;
}

export function normalizeDoorCells(cells: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(cells).map(([key, colorId]) => [
      key,
      colorId === 'doorway' || colorId === 'door' ? 'door-horizontal' : colorId,
    ])
  );
}
