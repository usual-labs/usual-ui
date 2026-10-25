import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { analyzeSource } from '../../src/analysis';
import { evaluate } from '../../src/rules';
import type { Manifest } from '../../src/types';
import { DesignExamples, ExampleComparison } from '../src/components/DesignExamples';
import { designExamples, specimenDocument } from '../src/components/design-examples';

test('examples have real source violations and repairs under the described sample policy', () => {
  const policy: Manifest = {
    version: 1,
    include: ['src/**'],
    active: ['colors', 'spacing', 'typography', 'components'],
    allowed: {
      colors: { classes: ['bg-surface', 'bg-accent', 'bg-muted', 'text-surface'] },
      spacing: { classes: ['p-6'] },
      typography: { classes: ['text-left', 'text-right', 'text-sm', 'tabular-nums'] },
    },
    semantics: [
      {
        id: 'primary-action',
        target: { element: 'a', props: { 'data-intent': 'primary' } },
        requireClasses: ['bg-accent', 'text-surface'],
      },
      {
        id: 'numeric-cell',
        target: { element: 'td', props: { 'data-ui-number': 'true' } },
        requireClasses: ['text-right', 'tabular-nums'],
      },
    ],
    components: [
      {
        id: 'shared-button',
        element: 'button',
        replacement: { name: 'Button', from: './components/Button' },
      },
    ],
  };
  for (const example of designExamples) {
    const check = (source: string) => {
      const analysis = analyzeSource('src/Example.tsx', source);
      return evaluate(
        policy,
        analysis.elements,
        analysis.declarations,
        { files: [], tokens: [], components: [], warnings: [] },
        new Set(),
      );
    };
    const before = check(example.before);
    assert.deepEqual(
      [...new Set(before.map((finding) => finding.ruleId))].sort(),
      example.diagnostics.map((diagnostic) => diagnostic.rule).sort(),
      example.title,
    );
    assert.ok(
      before.every((finding) => finding.kind === 'violation'),
      example.title,
    );
    assert.deepEqual(check(example.after), [], example.title);
  }
});

test('every specimen renders both sides in isolated, resource-free light and dark documents', () => {
  for (const example of designExamples) {
    for (const theme of ['light', 'dark'] as const) {
      for (const compact of [false, true]) {
        const html = renderToStaticMarkup(
          createElement(ExampleComparison, { example, theme, compact }),
        );
        const frames = html.match(/<iframe\b[^>]*>/g) ?? [];
        assert.equal(frames.length, 2);
        for (const frame of frames) {
          assert.match(frame, /sandbox=""/);
          assert.match(frame, /srcDoc="/);
          assert.match(frame, /title="[^"]+specimen"/);
          assert.match(frame, compact ? /max-w-sm/ : /max-w-2xl/);
          assert.doesNotMatch(frame, /allow-scripts|allow-same-origin|allow-forms/);
        }
        assert.match(html, /Illustrative diagnostic/);
        assert.match(html, /Approved source repair/);
      }
      for (const side of ['before', 'after'] as const) {
        const document = specimenDocument(example, side, theme);
        assert.match(document, new RegExp(`data-theme="${theme}"`));
        assert.match(document, /default-src 'none'; style-src 'unsafe-inline'/);
        assert.ok(document.includes(example.specimen[side]));
        assert.doesNotMatch(document, /<script|<iframe|<form|\b(?:src|href|on\w+)\s*=|url\(/i);
      }
    }
  }
});

test('example controls expose their selected states and explain the demonstration limits', () => {
  const html = renderToStaticMarkup(createElement(DesignExamples));
  for (const label of ['Example categories', 'Specimen theme', 'Specimen width'])
    assert.ok(html.includes(`role="group" aria-label="${label}"`));
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 3);
  for (const example of designExamples) assert.ok(html.includes(example.title));
  assert.match(html, /not a live audit/);
  assert.match(html, /change only the previews/);
  assert.match(html, /CLI checks your actual source and manifest/);
});
