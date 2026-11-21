/** Resolve files in Vite's public directory for both the repo path and standalone builds. */
export function publicAssetUrl(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL;
  if (base.startsWith('/') && path.startsWith(base)) return path;
  return `${base}${path.slice(1)}`;
}
