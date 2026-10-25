import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { humanResult, resultExit, runProject } from '../src/project.js';
import { remediationFor, reportResult, summarizeFindings } from '../src/reporting.js';
import { parseAuditRecord, parseRepairRecord } from '../src/record-validation.js';
import { createPlan, saveAudit, verifyPlan } from '../src/records.js';
import { categories, type AuditResult, type Finding } from '../src/types.js';

const base: Finding = {
  id: 'first',
  ruleId: 'action-color',
  category: 'colors',
  kind: 'violation',
  message: 'Use the action color.',
  expected: 'bg-action',
  actual: 'bg-other',
  file: 'src/App.tsx',
  line: 2,
  column: 3,
  span: { start: 12, end: 30 },
  context: { start: 0, end: 30, text: 'const x = <div className="x" />;', truncated: false },
};
const audit: AuditResult = {
  version: 1,
  mode: 'audit',
  snapshot: 'a'.repeat(64),
  manifestHash: 'b'.repeat(64),
  findings: [base],
  active: [],
  inactive: [...categories],
  files: ['src/App.tsx'],
  errors: [],
  inventory: { files: ['src/App.tsx'], tokens: [], components: [], warnings: [] },
};

test('large repeated patterns collapse without losing occurrence IDs, locations, or source evidence', () => {
  const findings = Array.from({ length: 4000 }, (_, index) => ({
    ...base,
    id: `finding-${index}`,
    file: `src/Part${index}.tsx`,
    line: index + 1,
  }));
  const original = structuredClone(findings);
  const report = reportResult({ ...audit, findings });
  assert.equal(report.summary.problems.length, 1);
  assert.equal(report.summary.totals.occurrences, 4000);
  assert.deepEqual(
    report.summary.problems[0].findingIds,
    findings.map((finding) => finding.id),
  );
  assert.equal(report.findings, findings);
  assert.deepEqual(report.findings, original);
  const text = humanResult(report);
  assert.equal(text.split(base.message).length - 1, 1);
  assert.match(text, /1 distinct diagnostic patterns; 4000 occurrences/);
  assert.match(text, /src\/Part3999.tsx:4000:3 \[finding-3999\]/);
});

test('different rules, categories, kinds, expectations, observations and coverage scope remain distinct', () => {
  const findings: Finding[] = [
    base,
    { ...base, id: 'same-pattern', file: 'src/Other.tsx' },
    { ...base, id: 'rule', ruleId: 'other-rule' },
    { ...base, id: 'category', category: 'typography' },
    { ...base, id: 'kind', kind: 'decision' },
    { ...base, id: 'expected', expected: 'bg-another' },
    { ...base, id: 'actual', actual: 'bg-unapproved' },
    { ...base, id: 'message', message: 'A separate condition.' },
    { ...base, id: 'coverage', kind: 'coverage', affectedCategories: ['colors'] },
    { ...base, id: 'scope', kind: 'coverage', affectedCategories: ['colors', 'shape'] },
    { ...base, id: 'reordered-scope', kind: 'coverage', affectedCategories: ['shape', 'colors'] },
  ];
  const summary = summarizeFindings(findings);
  assert.deepEqual(summary.totals, {
    problems: 9,
    occurrences: 11,
    violations: 7,
    coverage: 3,
    decisions: 1,
  });
  assert.equal(summary.byCategory.typography.occurrences, 1);
  assert.equal(summary.byCategory.colors.occurrences, 10);
  assert.equal(summary.byRule.find((rule) => rule.ruleId === 'action-color')?.occurrences, 10);
  assert.equal(new Set(summary.problems.flatMap((problem) => problem.findingIds)).size, 11);
  assert.deepEqual(findings.at(-1)?.affectedCategories, ['shape', 'colors']);
});

test('coverage and policy advice never invent a replacement or authorize ordinary policy repairs', () => {
  const coverage = remediationFor({ ...base, kind: 'coverage' });
  assert.equal(coverage.action, 'resolve-coverage');
  assert.match(coverage.instruction, /no replacement value is established/);
  assert.ok(!coverage.instruction.includes(base.expected!));
  const decision = remediationFor({ ...base, kind: 'decision' });
  assert.equal(decision.action, 'review-policy');
  assert.match(decision.instruction, /out of ordinary application repair batches/);
  const allowed = remediationFor({ ...base, ruleId: 'allowed.colors' });
  assert.match(allowed.instruction, /already approved in allowed.colors/);
  assert.match(allowed.instruction, /do not add this value to policy/);
});

test('presentation totals do not alter findings-based exits or operational-error precedence', () => {
  assert.equal(resultExit(reportResult({ ...audit, findings: [] })), 0);
  for (const kind of ['violation', 'coverage', 'decision'] as const)
    assert.equal(resultExit(reportResult({ ...audit, findings: [{ ...base, kind }] })), 1);
  assert.equal(resultExit(reportResult({ ...audit, errors: ['parse failed'] })), 2);
  assert.deepEqual(summarizeFindings([]).totals, {
    problems: 0,
    occurrences: 0,
    violations: 0,
    coverage: 0,
    decisions: 0,
  });
});

test('legacy generated audit Markdown refreshes without a record migration; manual changes remain protected', async () => {
  const root = await mkdtemp(join(tmpdir(), 'usual-report-legacy-'));
  try {
    await saveAudit(root, audit);
    const path = join(root, 'docs/usual-ui/audit.md');
    const legacy = `<!-- Generated by Usual Design. Keep manual notes in a separate file. -->
# Usual Design audit

Snapshot: ${audit.snapshot}

\`\`\`text
Usual Design audit: 1 files
Active: none — no design enforcement
Inactive: colors, typography, spacing, shape, components
src/App.tsx:2:3 [action-color] Use the action color. Expected: bg-action
1 findings; 0 operational errors.
\`\`\`

Inactive categories are unchecked by lint. Re-audit before resuming deferred work.
`;
    await writeFile(path, legacy);
    const updated = { ...audit, findings: [base, { ...base, id: 'second', line: 3 }] };
    await saveAudit(root, updated);
    assert.match(await readFile(path, 'utf8'), /1 distinct diagnostic patterns; 2 occurrences/);
    const raw = await readFile(join(root, 'docs/usual-ui/audit.json'), 'utf8');
    assert.deepEqual(parseAuditRecord(raw, 'docs/usual-ui/audit.json'), updated);
    assert.equal(JSON.parse(raw).summary, undefined);
    const manual = legacy + '\nReviewed manually: keep this note.\n';
    await writeFile(path, manual);
    await assert.rejects(saveAudit(root, audit), /non-generated changes/);
    assert.equal(await readFile(path, 'utf8'), manual);
    assert.equal(await readFile(join(root, 'docs/usual-ui/audit.json'), 'utf8'), raw);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('grouping never expands an approved repair selection and freshness still gates edits', async () => {
  const root = await mkdtemp(join(tmpdir(), 'usual-report-selection-'));
  try {
    await cp(resolve('fixtures/atlas'), root, { recursive: true });
    const path = join(root, 'src/App.tsx');
    await writeFile(path, 'export const App = () => <><button>A</button><button>B</button></>;');
    const result = await runProject(root, 'audit');
    const problem = summarizeFindings(result.findings).problems.find(
      (problem) => problem.ruleId === 'use-button',
    )!;
    assert.equal(problem.findingIds.length, 2);
    const selectedId = problem.findingIds[1];
    const created = await createPlan(root, [selectedId], result.snapshot);
    const raw = await readFile(join(root, created.path), 'utf8');
    const saved = parseRepairRecord(raw, created.path);
    assert.deepEqual(
      saved.selected.map((finding) => finding.id),
      [selectedId],
    );
    assert.ok(saved.deferred.some((finding) => finding.id === problem.findingIds[0]));
    assert.deepEqual(
      saved.selected[0],
      result.findings.find((finding) => finding.id === selectedId),
    );
    assert.equal((await verifyPlan(root, created.path)).valid, true);
    await writeFile(path, 'export const App = () => <button>Changed</button>;');
    await assert.rejects(verifyPlan(root, created.path), /Stale repair plan/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
