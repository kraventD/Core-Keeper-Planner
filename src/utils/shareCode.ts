import { BlueprintProject } from '../types/blueprint';

export const SHARE_CODE_VERSION = '1.0';
export const SHARE_CODE_PREFIX = 'CKBP_V1:';

export interface ShareCodeData {
  version: string;
  width: number;
  height: number;
  cells: Record<string, string>;
  palette: Array<{
    id: string;
    name: string;
    hex: string;
    isDefault?: boolean;
  }>;
  annotations: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
  }>;
}

/**
 * Serializa un proyecto a un código de texto compartible (Base64 con prefijo).
 * Nunca lanza excepción: devuelve string vacío si hay algún problema.
 */
export function encodeShareCode(project: BlueprintProject): string {
  try {
    const data: ShareCodeData = {
      version: SHARE_CODE_VERSION,
      width: typeof project.width === 'number' ? project.width : 0,
      height: typeof project.height === 'number' ? project.height : 0,
      cells: project.cells && typeof project.cells === 'object' ? project.cells : {},
      palette: Array.isArray(project.palette)
        ? project.palette.map(p => ({
            id: p.id || '',
            name: p.name || '',
            hex: p.hex || '#000000',
            isDefault: !!p.isDefault,
          }))
        : [],
      annotations: Array.isArray(project.annotations)
        ? project.annotations.map(a => ({
            id: a.id || '',
            x: typeof a.x === 'number' ? a.x : 0,
            y: typeof a.y === 'number' ? a.y : 0,
            text: a.text || '',
          }))
        : [],
    };

    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return `${SHARE_CODE_PREFIX}${base64}`;
  } catch {
    return '';
  }
}

/**
 * Decodifica un código de texto compartible de vuelta a un proyecto parcial.
 * Lanza error si el código es inválido.
 */
export function decodeShareCode(code: string): Partial<BlueprintProject> {
  const trimmed = code.trim();

  if (!trimmed.startsWith(SHARE_CODE_PREFIX)) {
    throw new Error('Código inválido: falta el prefijo CKBP_V1:');
  }

  const base64 = trimmed.slice(SHARE_CODE_PREFIX.length);

  let json: string;
  try {
    json = decodeURIComponent(escape(atob(base64)));
  } catch {
    throw new Error('Código inválido: no se pudo decodificar el Base64');
  }

  let data: ShareCodeData;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Código inválido: JSON mal formado');
  }

  if (typeof data.width !== 'number' || typeof data.height !== 'number') {
    throw new Error('Código inválido: faltan dimensiones');
  }
  if (typeof data.cells !== 'object' || data.cells === null) {
    throw new Error('Código inválido: faltan celdas');
  }

  return {
    width: data.width,
    height: data.height,
    cells: data.cells,
    palette: data.palette ?? [],
    annotations: data.annotations ?? [],
  };
}

export function isValidShareCode(code: string): boolean {
  try {
    decodeShareCode(code);
    return true;
  } catch {
    return false;
  }
}
