import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { OnboardingProposal } from '../../src/onboarding-types';
import {
  changedPreviewCategories,
  createPreviewHistory,
  effectivePreview,
  exportPreviewCss,
  exportPreviewRequest,
  previewThemeReducer,
  type PreviewThemes,
} from '../src/preview-theme';
import { ThemeInspector } from '../src/ThemeInspector';

const bases: PreviewThemes = {
  light: { primary: '#123456', bodySize: '14px', gap: '16px', fontFamily: 'system-ui' },
  dark: { primary: '#abcdef', bodySize: '14px', gap: '16px', fontFamily: 'system-ui' },
};
const proposal: OnboardingProposal = {
  version: 1,
  title: 'Example workspace',
  summary: 'A source-backed proposal',
  scope: { include: ['src/**'] },
  decisions: [
    {
      id: 'palette',
      category: 'colors',
      role: 'primary',
      title: 'Palette',
      description: 'Choose a palette',
      recommended: 'blue',
      options: ['blue', 'other'].map((id) => ({
        id,
        label: id,
        explanation: 'Existing choice',
        evidence: [{ file: 'src/theme.css', line: 1 }],
        rules: { allowed: { colors: { values: ['#123456'] } } },
        preview: { light: { primary: '#123456' }, dark: { primary: '#abcdef' } },
      })),
    },
  ],
};

test('effective preview cannot activate absent, unsafe, or deferred slots', () => {
  const overrides = {
    primary: '#654321',
    surface: '#ffffff',
    bodySize: '999px',
    fontFamily: 'Remote font',
    gap: 'url(https://example.invalid)',
  };
  assert.deepEqual(effectivePreview(bases.light, overrides), {
    primary: '#654321',
    bodySize: '14px',
    fontFamily: 'system-ui',
    gap: '16px',
  });
  assert.deepEqual(effectivePreview(bases.light, overrides, ['colors', 'typography']), {
    gap: '16px',
  });
  assert.deepEqual(effectivePreview({ primary: 'var(--unresolved)' }, { primary: '#ffffff' }), {});
});

test('theme exploration supports independent themes, bounded history, undo, redo, and reset', () => {
  let state = createPreviewHistory();
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'light',
    slot: 'primary',
    value: '#654321',
    base: bases.light,
    deferred: [],
  });
  const first = state;
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'dark',
    slot: 'gap',
    value: '24px',
    base: bases.dark,
    deferred: [],
  });
  assert.deepEqual(state.present, { light: { primary: '#654321' }, dark: { gap: '24px' } });
  state = previewThemeReducer(state, { type: 'undo' });
  assert.deepEqual(state.present, first.present);
  state = previewThemeReducer(state, { type: 'redo' });
  assert.equal(state.present.dark.gap, '24px');
  state = previewThemeReducer(state, { type: 'reset', theme: 'dark' });
  assert.deepEqual(state.present, { light: { primary: '#654321' }, dark: {} });
  state = previewThemeReducer(state, { type: 'undo' });
  assert.equal(state.present.dark.gap, '24px');
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'light',
    slot: 'primary',
    value: '#123456',
    base: bases.light,
    deferred: [],
  });
  assert.deepEqual(state.present.light, {});
  assert.deepEqual(state.future, []);
  for (let index = 0; index < 90; index++)
    state = previewThemeReducer(state, {
      type: 'edit',
      theme: 'light',
      slot: 'gap',
      value: `${index % 40}px`,
      base: bases.light,
      deferred: [],
    });
  assert.equal(state.past.length, 40);
});

test('reducer rejects unavailable and invalid changes at the state boundary', () => {
  const state = createPreviewHistory();
  for (const change of [
    { slot: 'surface' as const, value: '#ffffff', deferred: [] },
    { slot: 'primary' as const, value: '#ffffff', deferred: ['colors'] as ['colors'] },
    { slot: 'bodySize' as const, value: '100px', deferred: [] },
    {
      slot: 'primary' as const,
      value: 'red; background:url(https://example.invalid)',
      deferred: [],
    },
  ])
    assert.equal(
      previewThemeReducer(state, { type: 'edit', theme: 'light', base: bases.light, ...change }),
      state,
    );
});

test('actual option changes and deferrals invalidate affected overrides and undo history', () => {
  const before = { selections: { palette: 'blue' }, deferred: [] };
  const after = { selections: { palette: 'other' }, deferred: [] };
  assert.deepEqual(changedPreviewCategories(proposal, before, after), ['colors']);
  assert.deepEqual(
    changedPreviewCategories(proposal, before, { ...before, deferred: ['spacing'] }),
    ['spacing'],
  );
  let state = createPreviewHistory();
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'light',
    slot: 'primary',
    value: '#654321',
    base: bases.light,
    deferred: [],
  });
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'dark',
    slot: 'gap',
    value: '24px',
    base: bases.dark,
    deferred: [],
  });
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'dark',
    slot: 'primary',
    value: '#aabbcc',
    base: bases.dark,
    deferred: [],
  });
  state = previewThemeReducer(state, {
    type: 'edit',
    theme: 'light',
    slot: 'primary',
    value: '#111111',
    base: bases.light,
    deferred: [],
  });
  state = previewThemeReducer(state, { type: 'undo' });
  state = previewThemeReducer(state, { type: 'rebase', categories: ['colors'] });
  assert.deepEqual(state.present, { light: {}, dark: { gap: '24px' } });
  assert.deepEqual(state.past, []);
  assert.deepEqual(state.future, []);
  assert.equal(previewThemeReducer(state, { type: 'undo' }), state);
  assert.equal(previewThemeReducer(state, { type: 'redo' }), state);
});

test('exports include safe separate-theme values and explicit request boundaries', () => {
  const overrides: PreviewThemes = {
    light: { primary: '#654321', padding: '40px' },
    dark: { primary: 'url(https://example.invalid)', gap: '24px' },
  };
  const css = exportPreviewCss(bases, overrides);
  assert.match(css, /\.design-sample\.light/);
  assert.match(css, /--sample-primary: #654321/);
  assert.match(css, /\.design-sample\.dark/);
  assert.match(css, /--sample-primary: #abcdef/);
  assert.match(css, /--sample-gap: 24px/);
  assert.doesNotMatch(css, /url\(|--sample-padding/);
  assert.doesNotMatch(exportPreviewCss(bases, overrides, ['colors']), /--sample-primary/);
  const request = exportPreviewRequest(
    proposal,
    { selections: { palette: 'blue' }, deferred: [] },
    overrides,
  );
  assert.match(request, /not approved policy/);
  assert.match(request, /"option": "blue"/);
  assert.match(request, /"primary": "#654321"/);
  assert.doesNotMatch(request, /url\(|"padding"|"gap"/);
});

test('inspector labels preview-only changes, deferred categories, and missing values', () => {
  const html = renderToStaticMarkup(
    createElement(ThemeInspector, {
      values: bases.light,
      overrides: { gap: '24px' },
      deferred: ['colors'],
      onChange() {},
      onReset() {},
    }),
  );
  assert.match(html, /1 adjustment · Preview only/);
  assert.match(html, /This category is deferred/);
  assert.match(html, /No value proposed for this theme/);
  assert.match(html, /aria-label="Explore colors"/);
  assert.doesNotMatch(html, /<script|<iframe|https?:\/\//);
});

test('numeric inspector preserves relative units without claiming pixel equivalence', () => {
  const html = renderToStaticMarkup(
    createElement(ThemeInspector, {
      values: { bodySize: '1.25rem', gap: '1.5em', lineHeight: '1.6' },
      overrides: {},
      deferred: [],
      onChange() {},
      onReset() {},
    }),
  );
  assert.match(html, /aria-valuetext="1.25rem"/);
  assert.match(html, /aria-valuetext="1.5em"/);
  assert.match(html, /aria-valuetext="1.6"/);
  assert.match(html, />rem<\/span>/);
  assert.match(html, />em<\/span>/);
  assert.doesNotMatch(html, /value="20"|value="24"/);
});
