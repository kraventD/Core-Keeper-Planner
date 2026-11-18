export type ToolType =
  | 'select'
  | 'pencil'
  | 'eraser'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'place_core'
  | 'rect_select'
  | 'fill'
  | 'move'
  | 'annotation'
  | 'place_storage'
  | 'hand';

export type RectangleMode = 'outline' | 'filled';
export type ShapeMode = 'outline' | 'filled';
export type CircleOrigin = 'center' | 'corner';
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'quad';
export type DoorOrientation = 'horizontal' | 'vertical';
export type StorageItemRotation = 0 | 90 | 180 | 270;
export type PlannerLayerId = 'floors' | 'walls' | 'objects' | 'wallDecorations';
export type PlannerLayerStates = Record<PlannerLayerId, { visible: boolean; locked: boolean }>;

export interface CellCoord {
  x: number;
  y: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  nameEn?: string;
  nameEs?: string;
  hex: string;
  isDefault?: boolean;
  estimated?: boolean;
}

export interface SelectionBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ClipboardData {
  width: number;
  height: number;
  cells: Array<{
    relX: number;
    relY: number;
    colorId: string;
  }>;
  storagePlacements?: Array<Omit<StorageItemPlacement, 'id' | 'x' | 'y'> & {
    relX: number;
    relY: number;
  }>;
  floorTiles?: Array<{ relX: number; relY: number; itemId: string }>;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface StorageItemPlacement {
  id: string;
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: StorageItemRotation;
  layer?: 'bridge' | 'floor' | 'rail' | 'fence' | 'wall' | 'wall_decoration' | 'object' | 'light';
  lightRadius?: number;
}

export interface BlueprintProject {
  id: string;
  name: string;
  width: number;
  height: number;
  cells: Record<string, string>; // key: "x,y", value: colorId
  floorTiles?: Record<string, string>; // key: "x,y", value: floor item id
  palette: PaletteColor[];
  annotations: Annotation[];
  storagePlacements?: StorageItemPlacement[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryStep {
  description: string;
  cells: Record<string, string>;
  floorTiles?: Record<string, string>;
  width: number;
  height: number;
  storagePlacements?: StorageItemPlacement[];
}

export type Language = 'es' | 'en';
