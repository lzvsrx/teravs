import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recall } from '../server/recall.mjs';
test('recuperação prioriza memórias relevantes e limita o tamanho do contexto', () => {
  const entries = [{ content: 'Gosto de cozinhar massas' }, { content: 'Trabalho com marcenaria e madeira' }];
  assert.match(recall(entries, 'marcenaria')[0].content, /marcenaria/);
  assert.ok(recall(entries, 'madeira', 20).reduce((n, m) => n + m.content.length, 0) <= 20);
});
