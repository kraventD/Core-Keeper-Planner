#!/usr/bin/env node
/**
 * Index Unity Sprite rectangles and their Texture2D atlases from an AssetRipper
 * export. This uses Node's standard library and never modifies the source data.
 *
 * Example:
 * node scripts/extract-core-keeper-sprites.mjs \
 *   --assets "C:/.../ExportedProject/Assets" \
 *   --query wall floor bridge torch lamp lantern door chest \
 *   --output public/game-assets/construction-sprites.json --copy-atlases
 */

import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const options = { query: [], copyAtlases: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--assets') options.assets = argv[++index];
    else if (arg === '--output') options.output = argv[++index];
    else if (arg === '--copy-atlases') options.copyAtlases = true;
    else if (arg === '--query') {
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) options.query.push(argv[++index]);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.assets || !options.output) throw new Error('Usage requires --assets and --output.');
  return options;
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(entryPath);
    else yield entryPath;
  }
}

async function readGuid(metaPath) {
  const source = await readFile(metaPath, 'utf8').catch(() => '');
  return source.match(/^guid:\s*([a-f\d]+)\s*$/im)?.[1]?.toLowerCase() ?? null;
}

function readSprite(source, textureByGuid) {
  const name = source.match(/^\s*m_Name:\s*(.+?)\s*$/m)?.[1];
  const rect = source.match(/m_Rect:\s*\n\s*serializedVersion:\s*\d+\s*\n\s*x:\s*(-?\d+)\s*\n\s*y:\s*(-?\d+)\s*\n\s*width:\s*(\d+)\s*\n\s*height:\s*(\d+)/);
  const textureGuid = source.match(/texture:\s*\{fileID:\s*\d+,\s*guid:\s*([a-f\d]+)/i)?.[1]?.toLowerCase();
  const atlas = textureGuid ? textureByGuid.get(textureGuid) : null;
  if (!name || !rect || !atlas) return null;
  const [x, y, width, height] = rect.slice(1).map(Number);
  return { name, x, y, width, height, rectOrigin: 'bottom-left', atlasSource: atlas };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const assetsRoot = path.resolve(options.assets);
  const textureRoot = path.join(assetsRoot, 'Texture2D');
  const spriteRoot = path.join(assetsRoot, 'Sprite');
  const textureByGuid = new Map();

  for await (const file of walk(textureRoot)) {
    if (!file.toLowerCase().endsWith('.png.meta')) continue;
    const guid = await readGuid(file);
    const image = file.slice(0, -'.meta'.length);
    if (guid) textureByGuid.set(guid, image);
  }

  const terms = options.query.map(term => term.toLocaleLowerCase()).filter(Boolean);
  const sprites = [];
  for await (const file of walk(spriteRoot)) {
    if (!file.toLowerCase().endsWith('.asset')) continue;
    const source = await readFile(file, 'utf8').catch(() => '');
    const sprite = readSprite(source, textureByGuid);
    if (!sprite) continue;
    const key = `${path.basename(file, '.asset')} ${sprite.name}`.toLocaleLowerCase();
    if (terms.length && !terms.some(term => key.includes(term))) continue;
    sprites.push({ id: path.basename(file, '.asset'), ...sprite });
  }

  sprites.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
  const outputPath = path.resolve(options.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const atlasDirectory = path.join(path.dirname(outputPath), 'atlases');
  const atlasNames = new Set(sprites.map(sprite => path.basename(sprite.atlasSource)));
  const manifest = [];

  for (const sprite of sprites) {
    const atlasName = path.basename(sprite.atlasSource);
    if (options.copyAtlases) {
      await mkdir(atlasDirectory, { recursive: true });
      await copyFile(sprite.atlasSource, path.join(atlasDirectory, atlasName)).catch(error => {
        if (error.code !== 'EEXIST') throw error;
      });
    }
    const { atlasSource, ...record } = sprite;
    record.atlas = options.copyAtlases ? `/game-assets/atlases/${atlasName}` : atlasName;
    manifest.push(record);
  }

  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Indexed ${manifest.length} sprites across ${atlasNames.size} atlases.`);
  console.log(`Manifest: ${outputPath}`);
  if (options.copyAtlases) console.log(`Copied atlases: ${atlasDirectory}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
