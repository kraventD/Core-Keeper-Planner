import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProjectJson } from './projectStorage';
import { DEFAULT_PALETTE } from './palette';

test('parseProjectJson parses valid project and normalizes fields', () => {
  const json = JSON.stringify({
    name: 'My Base Plan',
    width: 60,
    height: 40,
    cells: { '0,0': 'wall', '1,1': 'floor' },
    palette: DEFAULT_PALETTE,
  });

  const proj = parseProjectJson(json);
  assert.equal(proj.name, 'My Base Plan');
  assert.equal(proj.width, 60);
  assert.equal(proj.height, 40);
  assert.equal(proj.cells['0,0'], 'wall');
  assert.equal(proj.cells['1,1'], 'floor');
});

test('parseProjectJson throws on invalid structure', () => {
  assert.throws(() => parseProjectJson('not json at all'));
  assert.throws(() => parseProjectJson(JSON.stringify({ name: 'incomplete' })));
});
