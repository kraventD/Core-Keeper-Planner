import {
  CellCoord,
  ClipboardData,
  RectangleMode,
  SelectionBox,
  ShapeMode,
  CircleOrigin,
  MirrorMode,
} from '../types/blueprint';

export function coordKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseCoordKey(key: string): CellCoord {
  const [xStr, yStr] = key.split(',');
  return {
    x: parseInt(xStr, 10),
    y: parseInt(yStr, 10),
  };
}

export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Standard Bresenham's line algorithm for 1:1 grid cells.
 * Supports horizontal, vertical, and all diagonal slopes.
 */
export function getBresenhamLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  gridWidth: number,
  gridHeight: number
): CellCoord[] {
  const cells: CellCoord[] = [];
  let currX = Math.round(x0);
  let currY = Math.round(y0);
  const targetX = Math.round(x1);
  const targetY = Math.round(y1);

  const dx = Math.abs(targetX - currX);
  const dy = Math.abs(targetY - currY);
  const sx = currX < targetX ? 1 : -1;
  const sy = currY < targetY ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (isInBounds(currX, currY, gridWidth, gridHeight)) {
      cells.push({ x: currX, y: currY });
    }

    if (currX === targetX && currY === targetY) {
      break;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }

  return cells;
}

/**
 * Normalizes two corner coordinates into a bounding box, clamped to grid dimensions.
 */
export function normalizeBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  gridWidth: number,
  gridHeight: number
): SelectionBox & { width: number; height: number } {
  const minX = Math.max(0, Math.min(Math.round(x0), Math.round(x1)));
  const maxX = Math.min(gridWidth - 1, Math.max(Math.round(x0), Math.round(x1)));
  const minY = Math.max(0, Math.min(Math.round(y0), Math.round(y1)));
  const maxY = Math.min(gridHeight - 1, Math.max(Math.round(y0), Math.round(y1)));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Computes all cell coordinates for a rectangle (either hollow outline for walls or solid fill).
 */
export function getRectangleCells(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  mode: RectangleMode,
  gridWidth: number,
  gridHeight: number
): CellCoord[] {
  const box = normalizeBox(x0, y0, x1, y1, gridWidth, gridHeight);
  const cells: CellCoord[] = [];

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      if (mode === 'filled') {
        cells.push({ x, y });
      } else {
        // Outline mode: only perimeter edges
        if (x === box.minX || x === box.maxX || y === box.minY || y === box.maxY) {
          cells.push({ x, y });
        }
      }
    }
  }

  return cells;
}

export interface CircleResult {
  cells: CellCoord[];
  diameter: number;
  radius: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Computes all cell coordinates for a geometrically perfect discrete circle formed by square blocks.
 * Supports:
 * - mode: 'outline' (continuous 1-block perimeter wall) or 'filled' (solid circular disc/floor)
 * - origin: 'center' (clicks center tile and expands outward symmetrically) or 'corner' (drags corner-to-corner square bounding box)
 * Ensures 1:1 square aspect ratio so the circle is always symmetrical and never distorted.
 */
export function getCircleCells(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  mode: ShapeMode,
  origin: CircleOrigin,
  gridWidth: number,
  gridHeight: number
): CircleResult {
  let minX: number;
  let maxX: number;
  let minY: number;
  let maxY: number;
  let diameter: number;
  let radius: number;
  let cx: number;
  let cy: number;

  const sX = Math.round(startX);
  const sY = Math.round(startY);
  const eX = Math.round(endX);
  const eY = Math.round(endY);

  if (origin === 'center') {
    const rSpan = Math.max(Math.abs(eX - sX), Math.abs(eY - sY));
    radius = rSpan;
    diameter = 2 * rSpan + 1;
    minX = sX - rSpan;
    maxX = sX + rSpan;
    minY = sY - rSpan;
    maxY = sY + rSpan;
    cx = sX;
    cy = sY;
  } else {
    // Corner-to-corner mode
    const dx = eX - sX;
    const dy = eY - sY;
    const span = Math.max(Math.abs(dx), Math.abs(dy));
    const signX = dx >= 0 ? 1 : -1;
    const signY = dy >= 0 ? 1 : -1;
    const x2 = sX + signX * span;
    const y2 = sY + signY * span;

    minX = Math.min(sX, x2);
    maxX = Math.max(sX, x2);
    minY = Math.min(sY, y2);
    maxY = Math.max(sY, y2);
    diameter = span + 1;
    radius = (diameter - 1) / 2;
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
  }

  // Handle 1-cell circle
  if (diameter <= 1) {
    const cells: CellCoord[] = [];
    if (isInBounds(sX, sY, gridWidth, gridHeight)) {
      cells.push({ x: sX, y: sY });
    }
    return { cells, diameter: 1, radius: 0, minX: sX, minY: sY, maxX: sX, maxY: sY };
  }

  const limitSq = (radius + 0.38) * (radius + 0.38);

  // Helper to determine if a cell is inside the mathematical circle
  const isInside = (x: number, y: number): boolean => {
    if (x < minX || x > maxX || y < minY || y > maxY) return false;
    const distX = x - cx;
    const distY = y - cy;
    return distX * distX + distY * distY <= limitSq;
  };

  const cells: CellCoord[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInside(x, y)) {
        if (mode === 'filled') {
          if (isInBounds(x, y, gridWidth, gridHeight)) {
            cells.push({ x, y });
          }
        } else {
          // Outline: check if any 4-orthogonal neighbor is NOT inside the circle
          const isBorder =
            !isInside(x + 1, y) ||
            !isInside(x - 1, y) ||
            !isInside(x, y + 1) ||
            !isInside(x, y - 1);
          if (isBorder && isInBounds(x, y, gridWidth, gridHeight)) {
            cells.push({ x, y });
          }
        }
      }
    }
  }

  return { cells, diameter, radius, minX, minY, maxX, maxY };
}

/**
 * 4-directional Flood Fill (BFS) to fill a contiguous region of identical color or empty cells.
 */
export function floodFill(
  cells: Record<string, string>,
  startX: number,
  startY: number,
  newColorId: string | null,
  gridWidth: number,
  gridHeight: number
): Record<string, string> {
  if (!isInBounds(startX, startY, gridWidth, gridHeight)) {
    return cells;
  }

  const startKey = coordKey(startX, startY);
  const targetColorId = cells[startKey] ?? null;

  // Nothing to do if clicking cell already has the target color
  if (targetColorId === newColorId) {
    return cells;
  }

  const newCells = { ...cells };
  const visited = new Set<string>();
  const queue: CellCoord[] = [{ x: startX, y: startY }];
  visited.add(startKey);

  const neighbors = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const key = coordKey(curr.x, curr.y);

    if (newColorId === null) {
      delete newCells[key];
    } else {
      newCells[key] = newColorId;
    }

    for (const n of neighbors) {
      const nx = curr.x + n.dx;
      const ny = curr.y + n.dy;

      if (isInBounds(nx, ny, gridWidth, gridHeight)) {
        const nKey = coordKey(nx, ny);
        if (!visited.has(nKey)) {
          visited.add(nKey);
          const currentColor = newCells[nKey] ?? null;
          if (currentColor === targetColorId) {
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  return newCells;
}

/**
 * Copies cell data inside a selection box into a clipboard object.
 */
export function copySelection(
  cells: Record<string, string>,
  box: SelectionBox
): ClipboardData {
  const result: ClipboardData['cells'] = [];

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const key = coordKey(x, y);
      if (cells[key]) {
        result.push({
          relX: x - box.minX,
          relY: y - box.minY,
          colorId: cells[key],
        });
      }
    }
  }

  return {
    width: box.maxX - box.minX + 1,
    height: box.maxY - box.minY + 1,
    cells: result,
  };
}

/**
 * Pastes clipboard data starting at destX, destY into the grid.
 */
export function pasteSelection(
  cells: Record<string, string>,
  clipboard: ClipboardData,
  destX: number,
  destY: number,
  gridWidth: number,
  gridHeight: number
): Record<string, string> {
  const newCells = { ...cells };

  for (const item of clipboard.cells) {
    const targetX = destX + item.relX;
    const targetY = destY + item.relY;

    if (isInBounds(targetX, targetY, gridWidth, gridHeight)) {
      newCells[coordKey(targetX, targetY)] = item.colorId;
    }
  }

  return newCells;
}

/**
 * Deletes all cells within a bounding box.
 */
export function deleteSelection(
  cells: Record<string, string>,
  box: SelectionBox
): Record<string, string> {
  const newCells = { ...cells };

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      delete newCells[coordKey(x, y)];
    }
  }

  return newCells;
}

/**
 * Fills all cells within a bounding box with a given color.
 */
export function fillSelection(
  cells: Record<string, string>,
  box: SelectionBox,
  colorId: string,
  gridWidth: number,
  gridHeight: number
): Record<string, string> {
  const newCells = { ...cells };

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      if (isInBounds(x, y, gridWidth, gridHeight)) {
        newCells[coordKey(x, y)] = colorId;
      }
    }
  }

  return newCells;
}

/**
 * Moves cells within a selection box by deltaX, deltaY.
 * Cells in the original box that are moved are cleared first, then placed in new positions.
 */
export function moveCells(
  cells: Record<string, string>,
  box: SelectionBox,
  deltaX: number,
  deltaY: number,
  gridWidth: number,
  gridHeight: number
): Record<string, string> {
  if (deltaX === 0 && deltaY === 0) return cells;

  // Extract selected cells first
  const extracted: Array<{ newX: number; newY: number; colorId: string }> = [];
  const newCells = { ...cells };

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const key = coordKey(x, y);
      if (cells[key]) {
        extracted.push({
          newX: x + deltaX,
          newY: y + deltaY,
          colorId: cells[key],
        });
        delete newCells[key];
      }
    }
  }

  // Place into new positions within grid bounds
  for (const item of extracted) {
    if (isInBounds(item.newX, item.newY, gridWidth, gridHeight)) {
      newCells[coordKey(item.newX, item.newY)] = item.colorId;
    }
  }

  return newCells;
}

/**
 * Checks how many occupied cells would be lost if resizing to smaller dimensions.
 */
export function countTrimmedCells(
  cells: Record<string, string>,
  newWidth: number,
  newHeight: number
): number {
  let count = 0;
  for (const key of Object.keys(cells)) {
    const { x, y } = parseCoordKey(key);
    if (x >= newWidth || y >= newHeight) {
      count++;
    }
  }
  return count;
}

/**
 * Resizes the grid and prunes cells that fall outside the new boundary.
 */
export function resizeGridCells(
  cells: Record<string, string>,
  newWidth: number,
  newHeight: number
): { updatedCells: Record<string, string>; prunedCount: number } {
  const updatedCells: Record<string, string> = {};
  let prunedCount = 0;

  for (const [key, colorId] of Object.entries(cells)) {
    const { x, y } = parseCoordKey(key);
    if (x < newWidth && y < newHeight) {
      updatedCells[key] = colorId;
    } else {
      prunedCount++;
    }
  }

  return { updatedCells, prunedCount };
}

/**
 * Summarizes the frequency of each color ID currently placed on the blueprint.
 */
export function countCellsByColor(cells: Record<string, string>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const colorId of Object.values(cells)) {
    counts[colorId] = (counts[colorId] ?? 0) + 1;
  }
  return counts;
}

/**
 * Calculates symmetric mirrored cell coordinates according to active mirror mode.
 */
export function getMirroredCoords(
  x: number,
  y: number,
  gridWidth: number,
  gridHeight: number,
  mirrorMode: MirrorMode
): CellCoord[] {
  if (mirrorMode === 'none') {
    return isInBounds(x, y, gridWidth, gridHeight) ? [{ x, y }] : [];
  }

  const mx = gridWidth - 1 - x;
  const my = gridHeight - 1 - y;

  const results: CellCoord[] = [{ x, y }];

  if (mirrorMode === 'horizontal' || mirrorMode === 'quad') {
    if (mx !== x) {
      results.push({ x: mx, y });
    }
  }

  if (mirrorMode === 'vertical' || mirrorMode === 'quad') {
    if (my !== y) {
      results.push({ x, y: my });
    }
  }

  if (mirrorMode === 'quad') {
    if (mx !== x && my !== y) {
      results.push({ x: mx, y: my });
    }
  }

  return results.filter(c => isInBounds(c.x, c.y, gridWidth, gridHeight));
}

/**
 * Duplicates a selected region across the center mirror axis (Horizontal, Vertical, or Both),
 * preserving existing blocks outside and returning both the updated cells and the new mirrored box.
 */
export function duplicateMirrorSelection(
  cells: Record<string, string>,
  box: SelectionBox,
  axis: 'horizontal' | 'vertical' | 'both',
  gridWidth: number,
  gridHeight: number
): { updatedCells: Record<string, string>; mirroredBox: SelectionBox } {
  const newCells = { ...cells };

  // Calculate destination mirrored box
  const mirroredBox: SelectionBox = {
    minX: axis === 'horizontal' || axis === 'both' ? gridWidth - 1 - box.maxX : box.minX,
    maxX: axis === 'horizontal' || axis === 'both' ? gridWidth - 1 - box.minX : box.maxX,
    minY: axis === 'vertical' || axis === 'both' ? gridHeight - 1 - box.maxY : box.minY,
    maxY: axis === 'vertical' || axis === 'both' ? gridHeight - 1 - box.minY : box.maxY,
  };

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const sourceKey = coordKey(x, y);
      const colorId = cells[sourceKey];
      if (colorId) {
        const destX = axis === 'horizontal' || axis === 'both' ? gridWidth - 1 - x : x;
        const destY = axis === 'vertical' || axis === 'both' ? gridHeight - 1 - y : y;

        if (isInBounds(destX, destY, gridWidth, gridHeight)) {
          newCells[coordKey(destX, destY)] = colorId;
        }
      }
    }
  }

  return { updatedCells: newCells, mirroredBox };
}

/**
 * Centers a selection box horizontally within the grid.
 * Returns updated cells (unchanged) and a new centered selection box.
 */
export function centerSelectionHorizontally(
  box: SelectionBox,
  gridWidth: number,
  gridHeight: number
): SelectionBox {
  const boxW = box.maxX - box.minX + 1;
  const startX = Math.floor((gridWidth - boxW) / 2);
  const clampedStartX = Math.max(0, Math.min(startX, gridWidth - boxW));
  return {
    minX: clampedStartX,
    maxX: clampedStartX + boxW - 1,
    minY: box.minY,
    maxY: box.maxY,
  };
}

/**
 * Centers a selection box vertically within the grid.
 * Returns updated cells (unchanged) and a new centered selection box.
 */
export function centerSelectionVertically(
  box: SelectionBox,
  gridWidth: number,
  gridHeight: number
): SelectionBox {
  const boxH = box.maxY - box.minY + 1;
  const startY = Math.floor((gridHeight - boxH) / 2);
  const clampedStartY = Math.max(0, Math.min(startY, gridHeight - boxH));
  return {
    minX: box.minX,
    maxX: box.maxX,
    minY: clampedStartY,
    maxY: clampedStartY + boxH - 1,
  };
}

/**
 * Centers a selection box on both axes within the grid.
 * Returns updated cells (unchanged) and a new centered selection box.
 */
export function centerSelectionBoth(
  box: SelectionBox,
  gridWidth: number,
  gridHeight: number
): SelectionBox {
  const boxW = box.maxX - box.minX + 1;
  const boxH = box.maxY - box.minY + 1;
  const startX = Math.max(0, Math.min(Math.floor((gridWidth - boxW) / 2), gridWidth - boxW));
  const startY = Math.max(0, Math.min(Math.floor((gridHeight - boxH) / 2), gridHeight - boxH));
  return {
    minX: startX,
    maxX: startX + boxW - 1,
    minY: startY,
    maxY: startY + boxH - 1,
  };
}

/**
 * Flips the blocks inside a selection box in-place (Horizontal or Vertical).
 */
export function flipSelectionInPlace(
  cells: Record<string, string>,
  box: SelectionBox,
  direction: 'horizontal' | 'vertical'
): Record<string, string> {
  const newCells = { ...cells };
  const extracted: Array<{ relX: number; relY: number; colorId: string }> = [];

  const boxW = box.maxX - box.minX + 1;
  const boxH = box.maxY - box.minY + 1;

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const key = coordKey(x, y);
      if (cells[key]) {
        extracted.push({
          relX: x - box.minX,
          relY: y - box.minY,
          colorId: cells[key],
        });
        delete newCells[key];
      }
    }
  }

  for (const item of extracted) {
    const newX = direction === 'horizontal' ? box.minX + (boxW - 1 - item.relX) : box.minX + item.relX;
    const newY = direction === 'vertical' ? box.minY + (boxH - 1 - item.relY) : box.minY + item.relY;
    newCells[coordKey(newX, newY)] = item.colorId;
  }

  return newCells;
}

// ==========================================
// CORE KEEPER SPAWN HUB PATTERN (COLOCAR CORE)
// ==========================================

export const CORE_PATTERN_WIDTH = 19;
export const CORE_PATTERN_HEIGHT = 13;
export const CORE_PATTERN_CENTER_OFFSET_X = 9; // Core center relative to pattern (0,0)
export const CORE_PATTERN_CENTER_OFFSET_Y = 7; // Core center relative to pattern (0,0)

export interface CorePatternCell {
  relX: number; // 0 to 18
  relY: number; // 0 to 12
  defaultColorId: string;
  part: 'core' | 'statue' | 'waypoint';
}

/**
 * Returns the exact layout of the unmovable Core spawn area in Core Keeper:
 * - 5x5 Central Core (pink / statue color)
 * - 3x3 Top Boss Statue (2 tiles above Core)
 * - 3x3 Left Boss Statue (4 tiles left of Core, 1 tile higher than Core top)
 * - 3x3 Right Boss Statue (4 tiles right of Core, 1 tile higher than Core top)
 * - 3x3 Waypoint (cyan / core color, directly below Core)
 */
export function getCorePatternCells(includeWaypoint: boolean = true): CorePatternCell[] {
  const cells: CorePatternCell[] = [];

  // 1. Central Core: 5x5 (relX: 7..11, relY: 5..9)
  for (let y = 5; y <= 9; y++) {
    for (let x = 7; x <= 11; x++) {
      cells.push({
        relX: x,
        relY: y,
        defaultColorId: 'statue', // pink in reference
        part: 'core',
      });
    }
  }

  // 2. Top Statue: 3x3 (relX: 8..10, relY: 0..2)
  for (let y = 0; y <= 2; y++) {
    for (let x = 8; x <= 10; x++) {
      cells.push({
        relX: x,
        relY: y,
        defaultColorId: 'statue',
        part: 'statue',
      });
    }
  }

  // 3. Left Statue: 3x3 (relX: 0..2, relY: 4..6)
  for (let y = 4; y <= 6; y++) {
    for (let x = 0; x <= 2; x++) {
      cells.push({
        relX: x,
        relY: y,
        defaultColorId: 'statue',
        part: 'statue',
      });
    }
  }

  // 4. Right Statue: 3x3 (relX: 16..18, relY: 4..6)
  for (let y = 4; y <= 6; y++) {
    for (let x = 16; x <= 18; x++) {
      cells.push({
        relX: x,
        relY: y,
        defaultColorId: 'statue',
        part: 'statue',
      });
    }
  }

  // 5. Waypoint: 3x3 (relX: 8..10, relY: 10..12)
  if (includeWaypoint) {
    for (let y = 10; y <= 12; y++) {
      for (let x = 8; x <= 10; x++) {
        cells.push({
          relX: x,
          relY: y,
          defaultColorId: 'core', // cyan in reference
          part: 'waypoint',
        });
      }
    }
  }

  return cells;
}

/**
 * Calculates the bounding box of the Core pattern anchored at (anchorCenterX, anchorCenterY).
 */
export function getCorePatternBounds(anchorCenterX: number, anchorCenterY: number): SelectionBox {
  const originX = anchorCenterX - CORE_PATTERN_CENTER_OFFSET_X;
  const originY = anchorCenterY - CORE_PATTERN_CENTER_OFFSET_Y;
  return {
    minX: originX,
    minY: originY,
    maxX: originX + CORE_PATTERN_WIDTH - 1,
    maxY: originY + CORE_PATTERN_HEIGHT - 1,
  };
}

/**
 * Calculates the grid center coordinate to place the Core in the exact middle of the blueprint.
 */
export function getCenterOfGrid(gridWidth: number, gridHeight: number): { x: number; y: number } {
  return {
    x: Math.floor(gridWidth / 2),
    y: Math.floor(gridHeight / 2),
  };
}

/**
 * Stamps the Core pattern onto the blueprint at the given center coordinate.
 */
export function stampCorePattern(
  cells: Record<string, string>,
  anchorCenterX: number,
  anchorCenterY: number,
  gridWidth: number,
  gridHeight: number,
  includeWaypoint: boolean = true,
  colorOverrides?: { core?: string; statue?: string; waypoint?: string }
): { updatedCells: Record<string, string>; placedCount: number } {
  const pattern = getCorePatternCells(includeWaypoint);
  const newCells = { ...cells };
  const originX = anchorCenterX - CORE_PATTERN_CENTER_OFFSET_X;
  const originY = anchorCenterY - CORE_PATTERN_CENTER_OFFSET_Y;

  let placedCount = 0;
  for (const item of pattern) {
    const targetX = originX + item.relX;
    const targetY = originY + item.relY;

    if (isInBounds(targetX, targetY, gridWidth, gridHeight)) {
      let finalColor = item.defaultColorId;
      if (colorOverrides) {
        if (item.part === 'core' && colorOverrides.core) finalColor = colorOverrides.core;
        else if (item.part === 'statue' && colorOverrides.statue) finalColor = colorOverrides.statue;
        else if (item.part === 'waypoint' && colorOverrides.waypoint) finalColor = colorOverrides.waypoint;
      }
      newCells[coordKey(targetX, targetY)] = finalColor;
      placedCount++;
    }
  }

  return { updatedCells: newCells, placedCount };
}


