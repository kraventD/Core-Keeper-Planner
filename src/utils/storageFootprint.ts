import { StorageItemPlacement } from '../types/blueprint';
import { STORAGE_ITEM_BY_ID, StorageItemOccupiedTile } from './storageCatalog';

/** Return absolute tiles occupied by a placement, including rotation. */
export function getStoragePlacementOccupiedTiles(placement: StorageItemPlacement): StorageItemOccupiedTile[] {
  const item = STORAGE_ITEM_BY_ID.get(placement.itemId);
  const tiles = item?.occupiedTiles;
  if (!item || !tiles?.length) {
    return Array.from({ length: placement.width * placement.height }, (_, index) => ({
      x: placement.x + index % placement.width,
      y: placement.y + Math.floor(index / placement.width),
    }));
  }

  const rotation = placement.rotation ?? 0;
  const width = item.width;
  const height = item.height;
  return tiles.map(tile => {
    if (rotation === 90) return { x: placement.x + height - 1 - tile.y, y: placement.y + tile.x };
    if (rotation === 180) return { x: placement.x + width - 1 - tile.x, y: placement.y + height - 1 - tile.y };
    if (rotation === 270) return { x: placement.x + tile.y, y: placement.y + width - 1 - tile.x };
    return { x: placement.x + tile.x, y: placement.y + tile.y };
  });
}

export function storagePlacementContainsTile(placement: StorageItemPlacement, x: number, y: number): boolean {
  return getStoragePlacementOccupiedTiles(placement).some(tile => tile.x === x && tile.y === y);
}

export function storagePlacementIntersectsBox(
  placement: StorageItemPlacement,
  box: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return getStoragePlacementOccupiedTiles(placement).some(tile =>
    tile.x >= box.minX && tile.x <= box.maxX && tile.y >= box.minY && tile.y <= box.maxY,
  );
}

export function getStoragePlacementOverlapTiles(a: StorageItemPlacement, b: StorageItemPlacement): StorageItemOccupiedTile[] {
  if ((a.layer ?? 'object') !== (b.layer ?? 'object')) return [];
  const bTiles = new Set(getStoragePlacementOccupiedTiles(b).map(tile => `${tile.x},${tile.y}`));
  return getStoragePlacementOccupiedTiles(a).filter(tile => bTiles.has(`${tile.x},${tile.y}`));
}

export function storagePlacementsOverlap(a: StorageItemPlacement, b: StorageItemPlacement): boolean {
  return getStoragePlacementOverlapTiles(a, b).length > 0;
}
