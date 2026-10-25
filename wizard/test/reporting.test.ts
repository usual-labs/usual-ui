import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { summarizeFindings } from '../../src/reporting.js';
import { AuditBoard } from '../src/AuditBoard';
import { FindingGroup } from '../src/FindingGroup';
import { RepairHandoff } from '../src/RepairHandoff';
import { toggleGroup } from '../src/model';
import type { Finding, ProjectState } from '../src/types';

const first: Finding = {
  id: 'first',
  ruleId: 'numeric-cell',
  kind: 'violation',
  category: 'typography',
  message: 'Numeric cells require tabular numbers.',
  expected: 'tabular-nums',
  file: 'src/First.tsx',
  line: 1,
  column: 2,
  span: { start: 1, end: 9 },
  context: { start: 0, end: 17, text: '<script></script>', truncated: true },
};
const second: Finding = { ...first, id: 'second', file: 'src/Second.tsx' };
const state: ProjectState = {
  manifest: { version: 1, include: ['src/**/*.tsx'], active: [] },
  manifestHash: 'current',
  audit: {
    version: 1,
    mode: 'audit',
    snapshot: 'snapshot',
    manifestHash: 'current',
    findings: [first, second],
    active: [],
    inactive: ['colors', 'typography', 'spacing', 'shape', 'components'],
    files: [first.file, second.file],
    errors: [],
    inventory: { files: [], tokens: [], components: [], warnings: [] },
  },
};

test('wizard shares the report pattern count and keeps escaped source evidence and per-occurrence selections', () => {
  const markup = renderToStaticMarkup(
    createElement(AuditBoard, {
      state,
      pending: false,
      selected: new Set([second.id]),
      setSelected() {},
      recheck() {},
      review() {},
      activate() {},
    }),
  );
  assert.match(markup, /1 diagnostic pattern/);
  assert.match(markup, /2 findings/);
  assert.equal(markup.split(`<p>${first.message}</p>`).length - 1, 1);
  for (const finding of [first, second]) {
    assert.ok(markup.includes(`Select numeric-cell at ${finding.file}:1:2`));
    assert.ok(markup.includes(`Finding ID: <code>${finding.id}</code>`));
  }
  assert.match(markup, /aria-label="Select numeric-cell at src\/Second.tsx:1:2" checked=""/);
  assert.ok(markup.includes('UTF-16 span: 1–9'));
  assert.ok(markup.includes('&lt;script&gt;'));
  assert.ok(!markup.includes('<script>'));
  assert.ok(markup.includes('Next step:'));
});

test('search hides individual occurrences while group selection retains all IDs and unrelated selection', () => {
  const findings = [first, second];
  const problem = summarizeFindings(findings).problems[0];
  const markup = renderToStaticMarkup(
    createElement(FindingGroup, {
      problem,
      findings,
      query: 'second.tsx',
      selected: new Set<string>(),
      disabled: false,
      setSelected() {},
    }),
  );
  assert.ok(markup.includes('1 of 2 match search'));
  assert.ok(!markup.includes('Select numeric-cell at src/First.tsx'));
  assert.ok(markup.includes('Select numeric-cell at src/Second.tsx'));
  const selected = toggleGroup(new Set(['unrelated']), findings);
  assert.deepEqual([...selected], ['unrelated', 'first', 'second']);
  assert.deepEqual([...toggleGroup(selected, findings)], ['unrelated']);
});

test('repair review separates selected occurrences from patterns and unresolved analysis guidance', () => {
  const unresolved: Finding = {
    ...first,
    id: 'coverage',
    category: 'coverage',
    kind: 'coverage',
    expected: undefined,
    message: 'Cannot resolve dynamic class expression.',
  };
  const markup = renderToStaticMarkup(
    createElement(RepairHandoff, {
      review: true,
      selected: [first, second, unresolved],
      total: 5,
      handoff: null,
      pending: false,
      confirm() {},
      cancel() {},
      recheck() {},
    }),
  );
  assert.ok(markup.includes('2 diagnostic patterns: 2 violations and 1 unresolved coverage'));
  assert.ok(markup.includes('2 findings will remain deferred'));
  assert.ok(markup.includes('no replacement value is established by this finding'));
  assert.ok(markup.includes('Policy changes need your separate approval'));
});
