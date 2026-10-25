import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  recommendedChoices,
  type OnboardingProposal,
  type OnboardingState,
} from '../../src/onboarding-types';
import { OnboardingChoice } from '../src/OnboardingChoices';
import { OnboardingProject, OnboardingReview } from '../src/OnboardingSummary';

// The browser API captures its session hash on import; no requests run in these SSR checks.
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { location: { hash: '' } },
});
const { choicesAreSaved, GuidedOnboarding } = await import('../src/GuidedOnboarding');
if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
else Reflect.deleteProperty(globalThis, 'window');

const proposal: OnboardingProposal = {
  version: 1,
  title: 'Example workspace',
  summary: 'A source-backed proposal.',
  scope: { include: ['src/**'], ignore: ['src/generated/**'], tokens: ['src/theme.css'] },
  decisions: [
    {
      id: 'body-type',
      category: 'typography',
      role: 'body',
      title: 'Reading text',
      description: 'Keep content readable.',
      recommended: 'comfortable',
      options: [
        {
          id: 'comfortable',
          label: 'Comfortable',
          explanation: 'Room for long-form reading.',
          evidence: [{ file: 'src/theme.css', line: 4 }],
          rules: { allowed: { typography: { classes: ['text-base'] } } },
          preview: { light: { bodySize: '16px', headingSize: '32px', fontFamily: 'system-ui' } },
        },
        {
          id: 'compact',
          label: 'Compact',
          explanation: 'More content in a smaller space.',
          evidence: [{ file: 'src/theme.css', line: 5 }],
          rules: { allowed: { typography: { classes: ['text-sm'] } } },
        },
      ],
    },
  ],
};

function initial(step: number): OnboardingState {
  return {
    session: {
      version: 1,
      configPath: 'usual.design.json',
      proposal,
      choices: recommendedChoices(proposal),
      step,
      sourceSnapshot: 'source',
      manifestHash: null,
    },
    sessionHash: 'session',
    saved: false,
  };
}

test('saved-progress comparison notices choice and deferral changes without depending on key order', () => {
  const saved = { selections: { a: 'first', b: 'second' }, deferred: ['colors', 'shape'] as const };
  const choices = {
    selections: { b: 'second', a: 'first' },
    deferred: ['shape', 'colors'] as const,
  };
  assert.equal(
    choicesAreSaved(
      { ...choices, deferred: [...choices.deferred] },
      { ...saved, deferred: [...saved.deferred] },
    ),
    true,
  );
  assert.equal(
    choicesAreSaved(
      { selections: { a: 'changed', b: 'second' }, deferred: [...saved.deferred] },
      { ...saved, deferred: [...saved.deferred] },
    ),
    false,
  );
  assert.equal(
    choicesAreSaved(
      { selections: saved.selections, deferred: ['colors'] },
      { ...saved, deferred: [...saved.deferred] },
    ),
    false,
  );
  assert.equal(
    choicesAreSaved(
      { selections: { a: 'first' }, deferred: [...saved.deferred] },
      { ...saved, deferred: [...saved.deferred] },
    ),
    false,
  );
});

test('project overview keeps exact scope and destination available in a closed disclosure', () => {
  const html = renderToStaticMarkup(
    createElement(OnboardingProject, { proposal, manifestPath: '/example/usual.design.json' }),
  );
  assert.match(html, /<details class="onboarding-scope-details">/);
  for (const value of ['src/**', 'src/generated/**', 'src/theme.css', '/example/usual.design.json'])
    assert.ok(html.includes(value));
  assert.match(html, /<strong>1<\/strong> design decisions/);
});

test('review shows the actual selected alternative and deferred groups without inventing approval', () => {
  const choices = recommendedChoices(proposal);
  choices.selections['body-type'] = 'compact';
  const html = renderToStaticMarkup(
    createElement(OnboardingReview, { proposal, choices, disabled: false, edit() {} }),
  );
  assert.match(html, /Reading text/);
  assert.match(html, /<strong>Compact<\/strong>/);
  assert.doesNotMatch(html, /<strong>Comfortable<\/strong>/);
  assert.match(html, /aria-label="Edit Typography choices"/);
  assert.match(html, /All categories start inactive/);
  choices.deferred = ['typography'];
  const deferred = renderToStaticMarkup(
    createElement(OnboardingReview, { proposal, choices, disabled: true, edit() {} }),
  );
  assert.doesNotMatch(deferred, /<strong>Compact<\/strong>/);
  assert.equal((deferred.match(/disabled=""/g) ?? []).length, 5);
});

test('choice label includes the explanation and safe specimen while evidence stays separately interactive', () => {
  const decision = proposal.decisions[0];
  const option = {
    ...decision.options[0],
    preview: { light: { bodySize: '16px', fontFamily: 'url(https://example.invalid/font)' } },
  };
  const html = renderToStaticMarkup(
    createElement(OnboardingChoice, { decision, option, selected: true, choose() {} }),
  );
  const label = html.slice(html.indexOf('<label'), html.indexOf('</label>'));
  assert.match(label, /Room for long-form reading/);
  assert.match(label, /option-specimen--typography/);
  assert.match(html, /--sample-bodySize:16px/);
  assert.doesNotMatch(html, /--sample-fontFamily/);
  assert.ok(html.indexOf('</label>') < html.indexOf('<details>'));
  assert.match(html, /aria-describedby=/);
});

test('review exposes compilation errors before the manifest and keeps explicit approval required', () => {
  const state = initial(6);
  state.session.choices.selections['body-type'] = 'missing';
  const html = renderToStaticMarkup(
    createElement(GuidedOnboarding, {
      initial: state,
      manifestPath: 'usual.design.json',
      async onSaved() {},
      openWorkshop() {},
    }),
  );
  assert.match(html, /role="alert">Choose an option for Reading text/);
  assert.ok(html.indexOf('role="alert"') < html.indexOf('<summary>Manifest to save'));
  assert.match(html, /<button disabled="">Approve &amp; save manifest/);
  assert.match(html, /Progress saved · Contract not yet approved/);
  assert.ok(html.indexOf('</nav>') < html.indexOf('<aside'));
});
