import { PlannerLayerId, PlannerLayerStates, StorageItemPlacement } from '../types/blueprint';
import { StorageItemDefinition } from './storageCatalog';

export const PLANNER_LAYER_IDS: PlannerLayerId[] = ['floors', 'walls', 'objects', 'wallDecorations'];

export const DEFAULT_PLANNER_LAYER_STATES: PlannerLayerStates = {
  floors: { visible: true, locked: false },
  walls: { visible: true, locked: false },
  objects: { visible: true, locked: false },
  wallDecorations: { visible: true, locked: false },
};

export function getStoragePlacementLayerId(
  placement: StorageItemPlacement,
  item?: StorageItemDefinition,
): PlannerLayerId {
  return getStorageItemLayerId(item, placement.layer);
}

export function getStorageItemLayerId(item?: StorageItemDefinition, placementLayer?: StorageItemPlacement['layer']): PlannerLayerId {
  if (item?.category === 'floor' || placementLayer === 'floor') return 'floors';
  if (item?.category === 'wall_decoration' || placementLayer === 'wall_decoration') return 'wallDecorations';
  if (item?.category === 'door' || item?.category === 'wall' || placementLayer === 'wall') return 'walls';
  return 'objects';
}

export function isPlannerLayerEditable(states: PlannerLayerStates, layer: PlannerLayerId): boolean {
  return states[layer].visible && !states[layer].locked;
}
