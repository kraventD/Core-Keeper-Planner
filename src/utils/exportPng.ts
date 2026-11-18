import { BlueprintProject, Language, PaletteColor, StorageItemPlacement, StorageItemRotation } from '../types/blueprint';
import { coordKey } from './gridLogic';
import { getCanonicalCellColorId, getDoorCellOrientation } from './doorCells';
import { STORAGE_ITEM_BY_ID, StorageItemDefinition } from './storageCatalog';
import { GameSpriteEntry, loadGameSpriteCatalog } from './gameSpriteCatalog';
import { FLOOR_ITEM_BY_ID } from './floorCatalog';

export interface ExportOptions {
  cellSize: number; // e.g. 16, 24, 32, 48
  showGrid: boolean;
  background: 'dark' | 'navy' | 'light' | 'transparent';
  includeLegend: boolean;
  fileName: string;
  language: Language;
}

interface ResolvedPlacement {
  placement: StorageItemPlacement;
  item: StorageItemDefinition;
  imageSource: string;
  sprite?: GameSpriteEntry;
  image?: HTMLImageElement | null;
}

interface ImageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TILE_CATEGORIES = new Set(['wall', 'floor', 'bridge', 'fence', 'rail', 'gate']);
const LAYER_ORDER: Record<NonNullable<StorageItemPlacement['layer']>, number> = {
  bridge: 0,
  floor: 1,
  rail: 2,
  fence: 3,
  wall: 4,
  wall_decoration: 5,
  object: 6,
  light: 7,
};

const getLayerOrder = (placement: StorageItemPlacement) => LAYER_ORDER[placement.layer ?? 'object'];

function loadImage(source: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function getImageBounds(image: HTMLImageElement): ImageBounds {
  const fullImage = { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  try {
    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = image.naturalWidth;
    boundsCanvas.height = image.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    if (!boundsContext) return fullImage;
    boundsContext.drawImage(image, 0, 0);
    const pixels = boundsContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
    let minX = image.naturalWidth;
    let minY = image.naturalHeight;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < image.naturalHeight; y++) {
      for (let x = 0; x < image.naturalWidth; x++) {
        if (pixels[(y * image.naturalWidth + x) * 4 + 3] === 0) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    return maxX >= minX && maxY >= minY
      ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
      : fullImage;
  } catch {
    return fullImage;
  }
}

function getSpriteSource(image: HTMLImageElement, sprite?: GameSpriteEntry) {
  if (!sprite) return getImageBounds(image);
  return {
    x: sprite.rect.x,
    y: sprite.rect.origin === 'bottom-left'
      ? image.naturalHeight - sprite.rect.y - sprite.rect.height
      : sprite.rect.y,
    width: sprite.rect.width,
    height: sprite.rect.height,
  };
}

function drawNativeSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  bounds: ImageBounds,
  x: number,
  y: number,
  width: number,
  height: number,
  cellSize: number,
  rotation: StorageItemRotation,
) {
  const scale = cellSize / 16;
  const spriteWidth = bounds.width * scale;
  const spriteHeight = bounds.height * scale;
  if (rotation !== 0) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
  } else {
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x + (width - spriteWidth) / 2,
      y + height - spriteHeight,
      spriteWidth,
      spriteHeight,
    );
  }
}

function drawPlacedItem(ctx: CanvasRenderingContext2D, entry: ResolvedPlacement, x: number, y: number, cellSize: number) {
  const { placement, item, sprite, image } = entry;
  const width = placement.width * cellSize;
  const height = placement.height * cellSize;
  if (!image || item.category === 'bridge' || item.category === 'fence') {
    ctx.fillStyle = item.color ?? 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(x, y, width, height);
    return;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const nativeScale = item.renderAtNativeScale && (item.placementImageUrl || !sprite);
  if (nativeScale) {
    drawNativeSprite(ctx, image, getImageBounds(image), x, y, width, height, cellSize, placement.rotation ?? 0);
  } else {
    const source = getSpriteSource(image, sprite);
    const rotation = placement.rotation ?? 0;
    if (rotation !== 0) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(rotation * Math.PI / 180);
      const quarterTurn = rotation === 90 || rotation === 270;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, quarterTurn ? -height / 2 : -width / 2, quarterTurn ? -width / 2 : -height / 2, quarterTurn ? height : width, quarterTurn ? width : height);
    } else {
      ctx.drawImage(image, source.x, source.y, source.width, source.height, x, y, width, height);
    }
  }
  ctx.restore();
}

function drawLegendThumbnail(ctx: CanvasRenderingContext2D, entry: ResolvedPlacement, x: number, y: number, size: number) {
  const { item, sprite, image } = entry;
  if (!image || item.category === 'bridge' || item.category === 'fence') {
    ctx.fillStyle = item.color ?? '#64748b';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    return;
  }

  const nativeScale = item.renderAtNativeScale && (item.placementImageUrl || !sprite);
  const source = nativeScale ? getImageBounds(image) : getSpriteSource(image, sprite);
  const scale = Math.min((size - 4) / source.width, (size - 4) / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, source.x, source.y, source.width, source.height, x + (size - width) / 2, y + (size - height) / 2, width, height);
}

export async function exportBlueprintToPng(
  project: BlueprintProject,
  options: ExportOptions,
): Promise<string> {
  const { width, height, cells, palette } = project;
  const { cellSize, showGrid, background, includeLegend, fileName, language } = options;
  const placements = (project.storagePlacements ?? [])
    .map(placement => ({ placement, item: STORAGE_ITEM_BY_ID.get(placement.itemId) }))
    .filter((entry): entry is { placement: StorageItemPlacement; item: StorageItemDefinition } => Boolean(entry.item))
    .sort((a, b) => getLayerOrder(a.placement) - getLayerOrder(b.placement));

  const spriteCatalog: Record<string, GameSpriteEntry> = placements.some(({ item }) => item.spriteId)
    ? await loadGameSpriteCatalog().catch((): Record<string, GameSpriteEntry> => ({}))
    : {};
  const resolvedPlacements: ResolvedPlacement[] = placements.map(({ placement, item }) => {
    const sprite = item.spriteId ? spriteCatalog[item.spriteId] : undefined;
    const imageSource = item.placementImageUrl ?? sprite?.atlas ?? item.imageUrl;
    return { placement, item, sprite, imageSource };
  });
  const usedFloorTypes = new Map<string, number>();
  for (const itemId of Object.values(project.floorTiles ?? {})) usedFloorTypes.set(itemId, (usedFloorTypes.get(itemId) ?? 0) + 1);
  const usedFloors = [...usedFloorTypes.entries()].flatMap(([id, count]) => {
    const item = FLOOR_ITEM_BY_ID.get(id);
    return item ? [{ item, count }] : [];
  });
  const imageSources = [...new Set([...resolvedPlacements.map(entry => entry.imageSource), ...usedFloors.map(entry => entry.item.imageUrl)].filter(Boolean))];
  const imageEntries = await Promise.all(imageSources.map(async source => [source, await loadImage(source)] as const));
  const images = new Map<string, HTMLImageElement | null>(imageEntries);
  for (const entry of resolvedPlacements) {
    entry.image = images.get(entry.imageSource) ?? null;
  }
  const floorImages = new Map(usedFloors.map(({ item }) => [item.id, images.get(item.imageUrl) ?? null]));

  const colorMap = new Map<string, string>();
  for (const color of palette) colorMap.set(color.id, color.hex);

  const activeColorsUsed: PaletteColor[] = [];
  const usedObjectTypes = new Map<string, { entry: ResolvedPlacement; count: number }>();
  if (includeLegend) {
    const usedIds = new Set(Object.values(cells).map(getCanonicalCellColorId));
    for (const color of palette) {
      if (usedIds.has(color.id)) activeColorsUsed.push(color);
    }
    for (const entry of resolvedPlacements) {
      if (TILE_CATEGORIES.has(entry.item.category)) continue;
      const current = usedObjectTypes.get(entry.item.id);
      if (current) current.count += 1;
      else usedObjectTypes.set(entry.item.id, { entry, count: 1 });
    }
  }

  const gridPixelWidth = width * cellSize;
  const gridPixelHeight = height * cellSize;
  const padding = 32;
  const titleHeight = 56;
  const colorItemWidth = 190;
  const objectItemWidth = 320;
  const colorRows = activeColorsUsed.length > 0
    ? Math.ceil(activeColorsUsed.length / Math.max(1, Math.floor(Math.max(gridPixelWidth, colorItemWidth) / colorItemWidth)))
    : 0;
  const colorColumns = colorRows > 0 ? Math.max(1, Math.ceil(activeColorsUsed.length / colorRows)) : 0;
  const floorItemCount = includeLegend ? usedFloors.length : 0;
  const objectItemCount = usedObjectTypes.size;
  const objectColumns = objectItemCount + floorItemCount > 0 ? Math.max(1, Math.floor(Math.max(gridPixelWidth, objectItemWidth) / objectItemWidth)) : 0;
  const objectRows = objectColumns > 0 ? Math.ceil(objectItemCount / objectColumns) : 0;
  const floorRows = objectColumns > 0 ? Math.ceil(floorItemCount / objectColumns) : 0;
  const legendContentWidth = Math.max(gridPixelWidth, colorColumns * colorItemWidth, objectColumns * objectItemWidth);
  let legendHeight = 0;
  if (colorRows > 0) legendHeight += 36 + colorRows * 28;
  if (floorRows > 0) legendHeight += (legendHeight > 0 ? 16 : 0) + 36 + floorRows * 38;
  if (objectRows > 0) legendHeight += (legendHeight > 0 ? 16 : 0) + 36 + objectRows * 38;

  // Reserve margins for native-scale sprites that rise above or extend beyond the blueprint grid.
  let overflowLeft = 0;
  let overflowRight = 0;
  let overflowTop = 0;
  let overflowBottom = 0;
  for (const entry of resolvedPlacements) {
    const { placement, item, sprite, image } = entry;
    if (!image || !item.renderAtNativeScale || (sprite && !item.placementImageUrl)) continue;
    const bounds = getImageBounds(image);
    const spriteWidth = bounds.width * cellSize / 16;
    const spriteHeight = bounds.height * cellSize / 16;
    const footprintWidth = placement.width * cellSize;
    const footprintHeight = placement.height * cellSize;
    const rotation = placement.rotation ?? 0;
    const quarterTurn = rotation === 90 || rotation === 270;
    const centerAligned = rotation !== 0;
    const drawWidth = quarterTurn ? spriteHeight : spriteWidth;
    const drawHeight = quarterTurn ? spriteWidth : spriteHeight;
    const extraX = Math.max(0, (drawWidth - footprintWidth) / 2);
    const extraY = centerAligned
      ? Math.max(0, (drawHeight - footprintHeight) / 2)
      : Math.max(0, drawHeight - footprintHeight);
    overflowLeft = Math.max(overflowLeft, placement.x * cellSize < extraX ? extraX - placement.x * cellSize : 0);
    overflowRight = Math.max(overflowRight, (placement.x + placement.width) * cellSize + extraX - gridPixelWidth);
    overflowTop = Math.max(overflowTop, placement.y * cellSize < extraY ? extraY - placement.y * cellSize : 0);
    overflowBottom = Math.max(overflowBottom, (placement.y + placement.height) * cellSize + (centerAligned ? extraY : 0) - gridPixelHeight);
  }

  const startX = padding + overflowLeft;
  const startY = padding + titleHeight + overflowTop;
  const gridEndY = startY + gridPixelHeight + overflowBottom;
  const totalCanvasWidth = startX + legendContentWidth + overflowRight + padding;
  const totalCanvasHeight = gridEndY + (legendHeight > 0 ? 28 + legendHeight + padding : padding);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(totalCanvasWidth);
  canvas.height = Math.ceil(totalCanvasHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  let bgHex = '#14151a';
  let textMain = '#f3f4f6';
  let textSub = '#9ca3af';
  let gridLineColor = 'rgba(255, 255, 255, 0.08)';
  let majorGridLineColor = 'rgba(255, 255, 255, 0.22)';
  let borderBoxColor = 'rgba(255, 255, 255, 0.25)';
  if (background === 'navy') {
    bgHex = '#0c1626';
    gridLineColor = 'rgba(56, 189, 248, 0.12)';
    majorGridLineColor = 'rgba(56, 189, 248, 0.35)';
    borderBoxColor = '#38bdf8';
  } else if (background === 'light') {
    bgHex = '#f8fafc';
    textMain = '#0f172a';
    textSub = '#64748b';
    gridLineColor = 'rgba(0, 0, 0, 0.08)';
    majorGridLineColor = 'rgba(0, 0, 0, 0.25)';
    borderBoxColor = 'rgba(0, 0, 0, 0.4)';
  }

  if (background !== 'transparent') {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = textMain;
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(project.name || 'Core Keeper Blueprint', startX, padding + 24);
  ctx.fillStyle = textSub;
  ctx.font = '13px monospace';
  ctx.fillText(`${width} × ${height} ${width * height} cells • 1:1 Scale`, startX, padding + 44);

  if (background !== 'transparent') {
    ctx.fillStyle = background === 'light' ? '#ffffff' : '#18191f';
    ctx.fillRect(startX, startY, gridPixelWidth, gridPixelHeight);
  }

  for (const [key, itemId] of Object.entries(project.floorTiles ?? {})) {
    const [x, y] = key.split(',').map(Number);
    const image = floorImages.get(itemId);
    if (!image || x < 0 || y < 0 || x >= width || y >= height) continue;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);
    ctx.restore();
  }

  for (const [key, colorId] of Object.entries(cells)) {
    const [xStr, yStr] = key.split(',');
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    const doorOrientation = getDoorCellOrientation(colorId);
    const hex = colorMap.get(doorOrientation ? 'door' : colorId) || '#64748b';
    const cellX = startX + x * cellSize;
    const cellY = startY + y * cellSize;
    ctx.fillStyle = hex;
    if (doorOrientation) {
      const thickness = cellSize * 0.25;
      const offset = cellSize * 0.375;
      if (doorOrientation === 'horizontal') ctx.fillRect(cellX, cellY + offset, cellSize, thickness);
      else ctx.fillRect(cellX + offset, cellY, thickness, cellSize);
    } else {
      ctx.fillRect(cellX, cellY, cellSize, cellSize);
    }
    if (showGrid) {
      ctx.strokeStyle = background === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.70)';
      ctx.lineWidth = Math.max(1, Math.round(cellSize * 0.06));
      ctx.strokeRect(cellX, cellY, cellSize, cellSize);
    }
  }

  if (showGrid) {
    const chunkSize = 16;
    ctx.strokeStyle = gridLineColor;
    ctx.beginPath();
    for (let x = 0; x <= width; x++) {
      if (x % chunkSize !== 0) {
        ctx.moveTo(startX + x * cellSize + 0.5, startY);
        ctx.lineTo(startX + x * cellSize + 0.5, startY + gridPixelHeight);
      }
    }
    for (let y = 0; y <= height; y++) {
      if (y % chunkSize !== 0) {
        ctx.moveTo(startX, startY + y * cellSize + 0.5);
        ctx.lineTo(startX + gridPixelWidth, startY + y * cellSize + 0.5);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = majorGridLineColor;
    ctx.lineWidth = Math.max(2, cellSize >= 24 ? 2.5 : 1.5);
    ctx.beginPath();
    for (let x = 0; x <= width; x += chunkSize) {
      ctx.moveTo(startX + x * cellSize + 0.5, startY);
      ctx.lineTo(startX + x * cellSize + 0.5, startY + gridPixelHeight);
    }
    for (let y = 0; y <= height; y += chunkSize) {
      ctx.moveTo(startX, startY + y * cellSize + 0.5);
      ctx.lineTo(startX + gridPixelWidth, startY + y * cellSize + 0.5);
    }
    ctx.stroke();
  }

  // Draw placed objects over the floor grid using the same native-scale sprite rules as the planner.
  for (const entry of resolvedPlacements) {
    const x = startX + entry.placement.x * cellSize;
    const y = startY + entry.placement.y * cellSize;
    drawPlacedItem(ctx, entry, x, y, cellSize);
  }

  ctx.strokeStyle = borderBoxColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, gridPixelWidth, gridPixelHeight);

  if (includeLegend && legendHeight > 0) {
    let sectionY = gridEndY + 28;
    const drawHeading = (title: string) => {
      ctx.fillStyle = textMain;
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(title, startX, sectionY);
      ctx.strokeStyle = textSub;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, sectionY + 6);
      ctx.lineTo(startX + 70, sectionY + 6);
      ctx.stroke();
    };

    if (colorRows > 0) {
      drawHeading(language === 'es' ? 'LEYENDA DE COLORES' : 'COLOR LEGEND');
      const colorColumnsCount = Math.max(1, Math.floor(Math.max(gridPixelWidth, colorItemWidth) / colorItemWidth));
      activeColorsUsed.forEach((item, index) => {
        const col = index % colorColumnsCount;
        const row = Math.floor(index / colorColumnsCount);
        const itemX = startX + col * colorItemWidth;
        const itemY = sectionY + 24 + row * 28;
        ctx.fillStyle = item.hex;
        ctx.fillRect(itemX, itemY, 18, 18);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(itemX, itemY, 18, 18);
        ctx.fillStyle = textMain;
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const colorName = language === 'en' ? item.nameEn ?? item.name : item.nameEs ?? item.name;
        ctx.fillText(colorName, itemX + 26, itemY + 14, colorItemWidth - 30);
      });
      sectionY += 36 + colorRows * 28;
    }

    if (floorRows > 0) {
      if (sectionY > gridEndY + 28) sectionY += 16;
      drawHeading(language === 'es' ? 'LEYENDA DE SUELOS' : 'FLOOR LEGEND');
      usedFloors.forEach(({ item, count }, index) => {
        const col = index % objectColumns;
        const row = Math.floor(index / objectColumns);
        const itemX = startX + col * objectItemWidth;
        const itemY = sectionY + 24 + row * 38;
        const thumbSize = 28;
        const image = floorImages.get(item.id);
        ctx.fillStyle = background === 'light' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(itemX, itemY, thumbSize, thumbSize);
        ctx.strokeStyle = 'rgba(127, 127, 127, 0.45)';
        ctx.strokeRect(itemX, itemY, thumbSize, thumbSize);
        if (image) { ctx.imageSmoothingEnabled = false; ctx.drawImage(image, itemX, itemY, thumbSize, thumbSize); }
        ctx.fillStyle = textMain;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(language === 'es' ? item.nameEs : item.nameEn, itemX + 36, itemY + 12, objectItemWidth - 44);
        ctx.fillStyle = textSub;
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`1×1 ${language === 'es' ? 'tiles' : 'tiles'} · ${count} ${language === 'es' ? 'colocados' : 'placed'}`, itemX + 36, itemY + 25, objectItemWidth - 44);
      });
      sectionY += 36 + floorRows * 38;
    }

    if (objectRows > 0) {
      if (sectionY > gridEndY + 28) sectionY += 16;
      drawHeading(language === 'es' ? 'LEYENDA DE OBJETOS' : 'OBJECT LEGEND');
      const entries = [...usedObjectTypes.values()];
      entries.forEach(({ entry, count }, index) => {
        const col = index % objectColumns;
        const row = Math.floor(index / objectColumns);
        const itemX = startX + col * objectItemWidth;
        const itemY = sectionY + 24 + row * 38;
        const thumbSize = 28;
        ctx.fillStyle = background === 'light' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(itemX, itemY, thumbSize, thumbSize);
        ctx.strokeStyle = 'rgba(127, 127, 127, 0.45)';
        ctx.strokeRect(itemX, itemY, thumbSize, thumbSize);
        drawLegendThumbnail(ctx, entry, itemX, itemY, thumbSize);
        const name = language === 'es' ? entry.item.nameEs : entry.item.nameEn;
        const footprint = `${entry.item.width}×${entry.item.height} ${language === 'es' ? 'tiles' : 'tiles'} · ×${count}`;
        ctx.fillStyle = textMain;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(name, itemX + 36, itemY + 12, objectItemWidth - 44);
        ctx.fillStyle = textSub;
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(footprint, itemX + 36, itemY + 25, objectItemWidth - 44);
      });
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create PNG blob'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const cleanName = (fileName || project.name || 'core-keeper-blueprint')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, '_');
      anchor.download = `${cleanName}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(url);
    }, 'image/png');
  });
}
