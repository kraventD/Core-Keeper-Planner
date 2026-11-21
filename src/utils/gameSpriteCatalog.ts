export interface GameSpriteEntry {
  id: string;
  name: string;
  width: number;
  height: number;
  rect: { x: number; y: number; width: number; height: number; origin: 'bottom-left' | 'top-left' };
  atlas: string;
}

interface GameSpriteManifestEntry {
  id?: unknown;
  name?: unknown;
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
  rectOrigin?: unknown;
  atlas?: unknown;
}

let spriteCatalogRequest: Promise<Record<string, GameSpriteEntry>> | null = null;

export function loadGameSpriteCatalog(): Promise<Record<string, GameSpriteEntry>> {
  if (!spriteCatalogRequest) {
    spriteCatalogRequest = fetch(`${import.meta.env.BASE_URL}game-assets/construction-sprites.json`)
      .then(response => {
        if (!response.ok) throw new Error('Could not load the local game sprite catalog.');
        return response.json() as Promise<GameSpriteManifestEntry[]>;
      })
      .then(entries => {
        const normalized = entries.flatMap(entry => {
          const { id, name, x, y, width, height, atlas } = entry;
          if (
            typeof id !== 'string' ||
            typeof name !== 'string' ||
            typeof x !== 'number' ||
            typeof y !== 'number' ||
            typeof width !== 'number' ||
            typeof height !== 'number' ||
            typeof atlas !== 'string' ||
            !atlas
          ) return [];

          const origin = entry.rectOrigin === 'top-left' ? 'top-left' : 'bottom-left';
          const sprite: GameSpriteEntry = {
            id,
            name,
            width,
            height,
            atlas,
            rect: { x, y, width, height, origin },
          };
          return [[id, sprite] as const];
        });
        return Object.fromEntries(normalized);
      })
      .catch(error => {
        spriteCatalogRequest = null;
        throw error;
      });
  }
  return spriteCatalogRequest;
}
