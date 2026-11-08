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
  | 'hand';

export type RectangleMode = 'outline' | 'filled';
export type ShapeMode = 'outline' | 'filled';
export type CircleOrigin = 'center' | 'corner';
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'quad';
export type DoorOrientation = 'horizontal' | 'vertical';

export interface CellCoord {
  x: number;
  y: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  isDefault?: boolean;
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
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface BlueprintProject {
  id: string;
  name: string;
  width: number;
  height: number;
  cells: Record<string, string>; // key: "x,y", value: colorId
  palette: PaletteColor[];
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryStep {
  description: string;
  cells: Record<string, string>;
  width: number;
  height: number;
}

export type Language = 'es' | 'en';
