import test from 'node:test';
import assert from 'node:assert/strict';
import {
  coordKey,
  parseCoordKey,
  getBresenhamLine,
  getRectangleCells,
  floodFill,
  copySelection,
  pasteSelection,
  deleteSelection,
  moveCells,
  resizeGridCells,
  countTrimmedCells,
  countCellsByColor,
  getCircleCells,
  getMirroredCoords,
  duplicateMirrorSelection,
  flipSelectionInPlace,
  getCorePatternCells,
  stampCorePattern,
  getCenterOfGrid,
  CORE_PATTERN_WIDTH,
  CORE_PATTERN_HEIGHT,
} from './gridLogic';

test('coordKey and parseCoordKey roundtrip correctly', () => {
  const key = coordKey(15, 27);
  assert.equal(key, '15,27');
  const parsed = parseCoordKey(key);
  assert.deepEqual(parsed, { x: 15, y: 27 });
});

test('Bresenham line handles horizontal, vertical, and diagonals within bounds', () => {
  // Horizontal line
  const hLine = getBresenhamLine(2, 5, 6, 5, 10, 10);
  assert.equal(hLine.length, 5);
  assert.deepEqual(hLine[0], { x: 2, y: 5 });
  assert.deepEqual(hLine[4], { x: 6, y: 5 });

  // Vertical line
  const vLine = getBresenhamLine(3, 1, 3, 4, 10, 10);
  assert.equal(vLine.length, 4);
  assert.deepEqual(vLine[0], { x: 3, y: 1 });
  assert.deepEqual(vLine[3], { x: 3, y: 4 });

  // Diagonal 45 deg line
  const diagLine = getBresenhamLine(1, 1, 4, 4, 10, 10);
  assert.equal(diagLine.length, 4);
  assert.deepEqual(diagLine, [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
  ]);
});

test('getRectangleCells generates hollow outline or solid fill', () => {
  // Outline of 4x4 room (from (2,2) to (5,5))
  // Perimeter has 4 + 4 + 2 + 2 = 12 cells
  const outline = getRectangleCells(2, 2, 5, 5, 'outline', 10, 10);
  assert.equal(outline.length, 12);
  // Interior cell (3,3) should NOT be in outline
  const hasInterior = outline.some(c => c.x === 3 && c.y === 3);
  assert.equal(hasInterior, false);

  // Filled 4x4 room has 16 cells
  const filled = getRectangleCells(2, 2, 5, 5, 'filled', 10, 10);
  assert.equal(filled.length, 16);
});

test('floodFill fills connected region and stops at boundary walls', () => {
  // Create a 10x10 empty grid with a 4x4 wall enclosing an interior cell
  const cells: Record<string, string> = {};
  const wallCells = getRectangleCells(1, 1, 4, 4, 'outline', 10, 10);
  for (const c of wallCells) {
    cells[coordKey(c.x, c.y)] = 'wall';
  }

  // Flood fill the interior room cell (2,2) with 'floor'
  const filled = floodFill(cells, 2, 2, 'floor', 10, 10);

  // Interior cells (2,2), (2,3), (3,2), (3,3) should be filled with 'floor'
  assert.equal(filled[coordKey(2, 2)], 'floor');
  assert.equal(filled[coordKey(2, 3)], 'floor');
  assert.equal(filled[coordKey(3, 2)], 'floor');
  assert.equal(filled[coordKey(3, 3)], 'floor');

  // Walls should remain intact
  assert.equal(filled[coordKey(1, 1)], 'wall');

  // Outside cells like (0,0) must NOT be filled
  assert.equal(filled[coordKey(0, 0)], undefined);
});

test('copy, paste, delete, and move selections', () => {
  const cells: Record<string, string> = {
    '2,2': 'wall',
    '3,2': 'wall',
    '2,3': 'floor',
  };

  const box = { minX: 2, minY: 2, maxX: 3, maxY: 3 };
  const copied = copySelection(cells, box);
  assert.equal(copied.width, 2);
  assert.equal(copied.height, 2);
  assert.equal(copied.cells.length, 3);

  // Paste at (10, 10)
  const pasted = pasteSelection(cells, copied, 10, 10, 20, 20);
  assert.equal(pasted['10,10'], 'wall');
  assert.equal(pasted['11,10'], 'wall');
  assert.equal(pasted['10,11'], 'floor');
  // Original cells still exist in paste
  assert.equal(pasted['2,2'], 'wall');

  // Move original cells by dx=5, dy=5
  const moved = moveCells(cells, box, 5, 5, 20, 20);
  // Old cells removed
  assert.equal(moved['2,2'], undefined);
  assert.equal(moved['3,2'], undefined);
  assert.equal(moved['2,3'], undefined);
  // New cells placed
  assert.equal(moved['7,7'], 'wall');
  assert.equal(moved['8,7'], 'wall');
  assert.equal(moved['7,8'], 'floor');

  // Delete selection
  const deleted = deleteSelection(cells, box);
  assert.equal(Object.keys(deleted).length, 0);
});

test('resizeGridCells trims cells outside boundaries with accurate warning count', () => {
  const cells: Record<string, string> = {
    '5,5': 'wall',
    '25,10': 'wall',
    '10,25': 'floor',
  };

  const trimCount = countTrimmedCells(cells, 20, 20);
  assert.equal(trimCount, 2); // '25,10' and '10,25' are outside 20x20

  const { updatedCells, prunedCount } = resizeGridCells(cells, 20, 20);
  assert.equal(prunedCount, 2);
  assert.equal(updatedCells['5,5'], 'wall');
  assert.equal(updatedCells['25,10'], undefined);
  assert.equal(updatedCells['10,25'], undefined);
});

test('countCellsByColor tallies frequency of each color', () => {
  const cells: Record<string, string> = {
    '1,1': 'wall',
    '1,2': 'wall',
    '1,3': 'wall',
    '2,2': 'floor',
    '2,3': 'floor',
    '3,3': 'chest',
  };

  const counts = countCellsByColor(cells);
  assert.equal(counts['wall'], 3);
  assert.equal(counts['floor'], 2);
  assert.equal(counts['chest'], 1);
});

test('getCircleCells creates symmetrical odd-diameter circle from center (outline & filled)', () => {
  // Center at (10, 10), radius 2 => diameter 5 (5x5 bounding box: x:[8,12], y:[8,12])
  const filled5 = getCircleCells(10, 10, 12, 10, 'filled', 'center', 30, 30);
  assert.equal(filled5.diameter, 5);
  assert.equal(filled5.radius, 2);
  // Canonical 5x5 discrete circle has 21 blocks (25 minus 4 corners)
  assert.equal(filled5.cells.length, 21);

  // Center (10, 10) is filled
  assert.ok(filled5.cells.some(c => c.x === 10 && c.y === 10));
  // 4 corners are excluded (8,8), (12,8), (8,12), (12,12)
  assert.ok(!filled5.cells.some(c => c.x === 8 && c.y === 8));
  assert.ok(!filled5.cells.some(c => c.x === 12 && c.y === 8));
  assert.ok(!filled5.cells.some(c => c.x === 8 && c.y === 12));
  assert.ok(!filled5.cells.some(c => c.x === 12 && c.y === 12));

  // Outline of same 5x5 circle
  const outline5 = getCircleCells(10, 10, 12, 10, 'outline', 'center', 30, 30);
  assert.equal(outline5.diameter, 5);
  // Interior cross (5 cells: center (10,10) and adjacent (10,9), (10,11), (9,10), (11,10)) must be hollow
  assert.ok(!outline5.cells.some(c => c.x === 10 && c.y === 10), 'Center must be hollow in outline mode');
  // Outline should have 12 perimeter blocks (21 filled minus 9 interior hollow cells)
  assert.equal(outline5.cells.length, 12);
});

test('getCircleCells creates symmetrical even-diameter circle from corner (outline & filled)', () => {
  // Dragging from (2,2) to (5,5) => 4x4 square (span = 3, diameter = 4)
  const filled4 = getCircleCells(2, 2, 5, 5, 'filled', 'corner', 20, 20);
  assert.equal(filled4.diameter, 4);
  assert.equal(filled4.cells.length, 12); // 16 minus 4 corners = 12

  // Outline of 4x4 circle leaves 2x2 hollow center
  const outline4 = getCircleCells(2, 2, 5, 5, 'outline', 'corner', 20, 20);
  assert.equal(outline4.diameter, 4);
  assert.equal(outline4.cells.length, 8); // 12 minus 4 center tiles = 8

  // None of the 4 center tiles (3,3), (4,3), (3,4), (4,4) should be in outline
  assert.ok(!outline4.cells.some(c => c.x === 3 && c.y === 3));
  assert.ok(!outline4.cells.some(c => c.x === 4 && c.y === 3));
  assert.ok(!outline4.cells.some(c => c.x === 3 && c.y === 4));
  assert.ok(!outline4.cells.some(c => c.x === 4 && c.y === 4));
});

test('getCircleCells clamps properly within grid bounds and handles 1x1 circle', () => {
  // 1x1 circle at (4,4)
  const single = getCircleCells(4, 4, 4, 4, 'outline', 'center', 10, 10);
  assert.equal(single.cells.length, 1);
  assert.deepEqual(single.cells[0], { x: 4, y: 4 });

  // Circle partially outside grid (center at (1, 1), radius 3 -> extends to -2, -2)
  const clipped = getCircleCells(1, 1, 4, 1, 'filled', 'center', 10, 10);
  assert.ok(clipped.cells.every(c => c.x >= 0 && c.x < 10 && c.y >= 0 && c.y < 10));
});

test('getMirroredCoords computes horizontal, vertical, and quad mirror coordinates', () => {
  // Grid 60x50: center axis X is at 29.5, Y is at 24.5
  // Point at (10, 5)
  const hCoords = getMirroredCoords(10, 5, 60, 50, 'horizontal');
  assert.equal(hCoords.length, 2);
  assert.deepEqual(hCoords[0], { x: 10, y: 5 });
  assert.deepEqual(hCoords[1], { x: 49, y: 5 }); // 60 - 1 - 10 = 49

  const vCoords = getMirroredCoords(10, 5, 60, 50, 'vertical');
  assert.equal(vCoords.length, 2);
  assert.deepEqual(vCoords[0], { x: 10, y: 5 });
  assert.deepEqual(vCoords[1], { x: 10, y: 44 }); // 50 - 1 - 5 = 44

  const qCoords = getMirroredCoords(10, 5, 60, 50, 'quad');
  assert.equal(qCoords.length, 4);
  assert.deepEqual(qCoords, [
    { x: 10, y: 5 },
    { x: 49, y: 5 },
    { x: 10, y: 44 },
    { x: 49, y: 44 },
  ]);

  // Center coordinate deduplication: point lying directly on axis for odd width (e.g. 11x11, center is 5)
  const centerCoords = getMirroredCoords(5, 5, 11, 11, 'quad');
  assert.equal(centerCoords.length, 1);
  assert.deepEqual(centerCoords[0], { x: 5, y: 5 });
});

test('duplicateMirrorSelection copies region mirrored across canvas center axis', () => {
  const cells: Record<string, string> = {
    '2,10': 'wall',
    '3,10': 'doorway',
    '2,11': 'wall',
  };

  const box = { minX: 2, minY: 10, maxX: 3, maxY: 11 };
  // Duplicate across Horizontal axis in 20x20 grid
  const { updatedCells, mirroredBox } = duplicateMirrorSelection(cells, box, 'horizontal', 20, 20);

  // Original cells still exist
  assert.equal(updatedCells['2,10'], 'wall');
  assert.equal(updatedCells['3,10'], 'doorway');

  // Mirrored box: minX = 20 - 1 - 3 = 16, maxX = 20 - 1 - 2 = 17
  assert.equal(mirroredBox.minX, 16);
  assert.equal(mirroredBox.maxX, 17);
  assert.equal(mirroredBox.minY, 10);
  assert.equal(mirroredBox.maxY, 11);

  // Mirrored cells:
  // x=2 reflects to 17
  assert.equal(updatedCells['17,10'], 'wall');
  assert.equal(updatedCells['17,11'], 'wall');
  // x=3 reflects to 16
  assert.equal(updatedCells['16,10'], 'doorway');
});

test('flipSelectionInPlace flips orientation of cells inside selection boundary', () => {
  const cells: Record<string, string> = {
    '5,5': 'wall',
    '6,5': 'doorway',
    '7,5': 'wall',
  };

  const box = { minX: 5, minY: 5, maxX: 7, maxY: 5 };
  const flippedH = flipSelectionInPlace(cells, box, 'horizontal');

  // Left '5,5' was 'wall', now mapped to right '7,5' ('wall')
  // Center '6,5' remains 'doorway'
  // Right '7,5' mapped to left '5,5' ('wall')
  assert.equal(flippedH['5,5'], 'wall');
  assert.equal(flippedH['6,5'], 'doorway');
  assert.equal(flippedH['7,5'], 'wall');

  // Asymmetric test
  const asymCells: Record<string, string> = {
    '10,10': 'core',
    '11,10': 'statue',
  };
  const asymBox = { minX: 10, minY: 10, maxX: 11, maxY: 10 };
  const flippedAsym = flipSelectionInPlace(asymCells, asymBox, 'horizontal');
  assert.equal(flippedAsym['10,10'], 'statue');
  assert.equal(flippedAsym['11,10'], 'core');
});

test('getCorePatternCells yields 61 cells with waypoint and 52 without waypoint', () => {
  const withWaypoint = getCorePatternCells(true);
  assert.equal(withWaypoint.length, 61); // 25 (core) + 3*9 (statues) + 9 (waypoint) = 61
  const coreCells = withWaypoint.filter(c => c.part === 'core');
  assert.equal(coreCells.length, 25);
  const statueCells = withWaypoint.filter(c => c.part === 'statue');
  assert.equal(statueCells.length, 27);
  const waypointCells = withWaypoint.filter(c => c.part === 'waypoint');
  assert.equal(waypointCells.length, 9);

  const withoutWaypoint = getCorePatternCells(false);
  assert.equal(withoutWaypoint.length, 52);
  assert.equal(withoutWaypoint.filter(c => c.part === 'waypoint').length, 0);

  // Pattern dimensions
  assert.equal(CORE_PATTERN_WIDTH, 19);
  assert.equal(CORE_PATTERN_HEIGHT, 13);
  assert.ok(withWaypoint.every(c => c.relX >= 0 && c.relX < 19 && c.relY >= 0 && c.relY < 13));
});

test('stampCorePattern places pattern anchored at given center and clamps within grid', () => {
  const gridW = 60;
  const gridH = 50;
  const center = getCenterOfGrid(gridW, gridH); // (30, 25)
  assert.deepEqual(center, { x: 30, y: 25 });

  const { updatedCells, placedCount } = stampCorePattern({}, center.x, center.y, gridW, gridH, true);
  assert.equal(placedCount, 61);

  // Origin is (30 - 9, 25 - 7) = (21, 18)
  // Center of 5x5 core is at origin + (9, 7) = (30, 25)
  assert.equal(updatedCells['30,25'], 'statue');
  // Top statue at rel (9, 1) -> (30, 19)
  assert.equal(updatedCells['30,19'], 'statue');
  // Left statue at rel (1, 5) -> (22, 23)
  assert.equal(updatedCells['22,23'], 'statue');
  // Right statue at rel (17, 5) -> (38, 23)
  assert.equal(updatedCells['38,23'], 'statue');
  // Waypoint at rel (9, 11) -> (30, 29)
  assert.equal(updatedCells['30,29'], 'core');

  // Test edge clipping when placing near boundary (0, 0)
  const clipped = stampCorePattern({}, 0, 0, 20, 20, true);
  assert.ok(clipped.placedCount < 61);
  assert.ok(clipped.placedCount > 0);
  assert.ok(Object.keys(clipped.updatedCells).every(k => {
    const [x, y] = k.split(',').map(Number);
    return x >= 0 && x < 20 && y >= 0 && y < 20;
  }));
});


