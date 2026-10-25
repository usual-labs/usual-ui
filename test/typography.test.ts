import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { classCategory, utilitiesConflict, utilityFamily } from '../src/classes.js';
import { parseManifest } from '../src/config.js';
import { runProject, resultExit } from '../src/project.js';
import type { Category, Manifest } from '../src/types.js';

const guide = await readFile(new URL('../docs/numeric-rules.md', import.meta.url), 'utf8');
const example = parseManifest(JSON.parse(guide.match(/```json\n([\s\S]*?)\n```/)![1]));

async function check(
  source: string,
  options: { active?: Category[]; extraClasses?: string[]; required?: string[] } = {},
) {
  const root = await mkdtemp(join(tmpdir(), 'usual-numeric-typography-'));
  try {
    const manifest: Manifest = structuredClone(example);
    manifest.active = options.active ?? ['typography'];
    manifest.allowed!.typography!.classes = [
      ...new Set([...manifest.allowed!.typography!.classes!, ...(options.extraClasses ?? [])]),
    ];
    if (options.required) manifest.semantics![0].requireClasses = options.required;
    await mkdir(join(root, 'src'));
    await writeFile(join(root, 'package.json'), '{"devDependencies":{"tailwindcss":"^4.1.0"}}');
    await writeFile(join(root, 'usual.design.json'), JSON.stringify(manifest));
    await writeFile(join(root, 'src/Table.jsx'), source);
    const result = await runProject(root, 'check');
    assert.deepEqual(result.errors, []);
    return result;
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('numeric features belong to typography, including variants and important forms', () => {
  for (const value of [
    'normal-nums',
    'ordinal',
    'slashed-zero',
    'lining-nums',
    'oldstyle-nums',
    'proportional-nums',
    'tabular-nums',
    'diagonal-fractions',
    'stacked-fractions',
  ]) {
    assert.equal(classCategory(value), 'typography');
    assert.equal(classCategory(`md:focus:${value}!`), 'typography');
  }
  assert.equal(classCategory('mystery-nums'), undefined);
});

test('size, alignment and wrapping stay independent, including project text-size tokens', () => {
  const tokens = new Set(['--text-heading']);
  assert.equal(classCategory('text-heading/6', tokens), 'typography');
  for (const size of ['text-sm', 'text-heading', 'text-heading/6', 'text-[length:1rem]']) {
    assert.notEqual(utilityFamily(size, tokens), utilityFamily('text-right', tokens));
    assert.equal(utilitiesConflict(size, 'text-right', tokens), false);
    assert.equal(utilitiesConflict(size, 'text-nowrap', tokens), false);
    assert.equal(utilitiesConflict(size, 'text-lg', tokens), true);
  }
  assert.equal(utilitiesConflict('text-right', 'text-nowrap'), false);
  assert.equal(utilitiesConflict('font-sans', 'font-medium'), false);
  assert.equal(utilitiesConflict('italic', 'font-medium'), false);
  assert.equal(utilitiesConflict('brand-card', 'brand-button'), false);
});

test('real typography conflicts fail in either order while variant scopes stay distinct', () => {
  for (const [a, b] of [
    ['text-left', 'text-right'],
    ['text-wrap', 'text-nowrap'],
    ['text-sm', 'text-lg'],
    ['font-medium', 'font-bold'],
    ['italic', 'not-italic'],
    ['tabular-nums', 'proportional-nums'],
    ['tabular-nums', 'normal-nums'],
    ['lining-nums', 'oldstyle-nums'],
  ]) {
    assert.equal(utilitiesConflict(a, b), true, `${a} / ${b}`);
    assert.equal(utilitiesConflict(b, a), true, `${b} / ${a}`);
    assert.equal(utilitiesConflict(`md:${a}`, `md:${b}!`), true);
    assert.equal(utilitiesConflict(a, `md:${b}`), false);
  }
  for (const independent of ['lining-nums', 'ordinal', 'slashed-zero', 'diagonal-fractions'])
    assert.equal(utilitiesConflict('tabular-nums', independent), false);
});

test('custom font weights cannot pass as families, and unresolved font names stay conservative', () => {
  const tokens = new Set(['--font-brand', '--font-weight-book']);
  assert.equal(utilitiesConflict('font-book', 'font-bold', tokens), true);
  assert.equal(utilitiesConflict('font-bold', 'font-book', tokens), true);
  assert.equal(utilitiesConflict('md:font-book!', 'md:font-bold', tokens), true);
  assert.equal(utilitiesConflict('font-brand', 'font-book', tokens), false);
  assert.equal(utilitiesConflict('font-brand', 'font-bold', tokens), false);
  assert.equal(utilitiesConflict('font-brand', 'font-serif', tokens), true);
  assert.equal(utilitiesConflict('font-book', 'font-[650]', tokens), true);
  assert.equal(utilitiesConflict('font-unknown', 'font-bold', tokens), true);
  assert.equal(utilitiesConflict('font-unknown', 'font-brand', tokens), true);
  assert.equal(utilitiesConflict('font-unknown', 'font-stretch-condensed', tokens), false);
  assert.equal(
    utilitiesConflict('font-book', 'font-bold', new Set(['--font-book', '--font-weight-book'])),
    false,
  );
});

test('the documented numeric policy and fixed specimen pass after typography activation', async () => {
  assert.deepEqual(example.active, []);
  const specimens = [...guide.matchAll(/```jsx\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  const before = await check(`export const Cell = () => (${specimens[0]});`);
  assert.equal(resultExit(before), 1);
  assert.deepEqual(
    before.findings.map((finding) => [finding.ruleId, finding.category, finding.expected]).sort(),
    [
      ['numeric-table-cell', 'typography', 'tabular-nums'],
      ['numeric-table-cell', 'typography', 'text-right'],
    ],
  );
  const after = await check(`export const Cell = () => (${specimens[1]});`);
  assert.equal(resultExit(after), 0);
  assert.deepEqual(after.findings, []);
  const unmarked = await check('export const Cell = () => <td className="text-left">Invoice</td>;');
  assert.deepEqual(unmarked.findings, []);
});

test('tabular requirements cannot be hidden by conflicting approved numeric or alignment classes', async () => {
  for (const conflicting of ['proportional-nums', 'normal-nums', 'text-left']) {
    const result = await check(
      `export const Cell = () => <td data-ui-number="true" className="text-sm text-right tabular-nums ${conflicting}"/>;`,
      { extraClasses: [conflicting] },
    );
    assert.ok(result.findings.some((finding) => finding.ruleId === 'numeric-table-cell'));
    assert.equal(resultExit(result), 1);
  }
  const independent = await check(
    'export const Cell = () => <td data-ui-number="true" className="text-sm text-right text-nowrap tabular-nums lining-nums ordinal"/>;',
    { extraClasses: ['text-nowrap', 'lining-nums', 'ordinal'] },
  );
  assert.deepEqual(independent.findings, []);
});

test('numeric requirements retain finite-branch and exact-variant semantics', async () => {
  const valid = await check(
    'export const Cell = ({small}) => <td data-ui-number="true" className={small ? "text-sm tabular-nums text-right" : "tabular-nums text-right"}/>;',
  );
  assert.deepEqual(valid.findings, []);
  const missing = await check(
    'export const Cell = ({small}) => <td data-ui-number="true" className={small ? "text-sm tabular-nums text-right" : "proportional-nums text-right"}/>;',
  );
  assert.ok(missing.findings.some((finding) => finding.expected === 'tabular-nums'));
  const variantOnly =
    'export const Cell = () => <td data-ui-number="true" className="md:tabular-nums md:text-right"/>;';
  const unqualified = await check(variantOnly);
  assert.equal(
    unqualified.findings.filter((finding) => finding.ruleId === 'numeric-table-cell').length,
    2,
  );
  const qualified = await check(variantOnly, { required: ['md:tabular-nums', 'md:text-right'] });
  assert.deepEqual(qualified.findings, []);
});

test('numeric enforcement follows typography activation and unknown evidence remains blocking', async () => {
  const inactive = await check('export const Cell = () => <td data-ui-number="true"/>;', {
    active: [],
  });
  assert.deepEqual(inactive.findings, []);
  for (const source of [
    'export const Cell = ({classes}) => <td data-ui-number="true" className={classes}/>;',
    'export const Cell = ({numeric}) => <td data-ui-number={numeric} className="text-right tabular-nums"/>;',
    'export const Cell = () => <td data-ui-number="true" className="text-right tabular-nums mystery-nums"/>;',
  ]) {
    const result = await check(source, { extraClasses: ['mystery-nums'] });
    assert.equal(resultExit(result), 1);
    assert.ok(
      result.findings.some(
        (finding) =>
          finding.kind === 'coverage' && finding.affectedCategories?.includes('typography'),
      ),
    );
  }
});
