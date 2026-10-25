import type {
  RuntimeAudit,
  RuntimeFinding,
  RuntimePageReport,
  RuntimeSummary,
} from './runtime-types.js';

/** Fail closed when an incompatible optional engine returns an incomplete report. */
export function validateRuntimeReport(value: RuntimePageReport): void {
  if (!value || !Array.isArray(value.findings) || !Array.isArray(value.suppressed))
    throw new Error('The rendered checker returned an invalid findings report.');
  for (const f of value.findings) {
    if (
      !f ||
      ['rule', 'selector', 'message', 'actual', 'expected', 'fix'].some(
        (key) => typeof f[key] !== 'string',
      ) ||
      (f.status !== undefined && f.status !== 'failed' && f.status !== 'unresolved')
    )
      throw new Error('The rendered checker returned an invalid finding.');
  }
  for (const item of value.suppressed)
    if (!item || [item.rule, item.selector, item.reason].some((v) => typeof v !== 'string'))
      throw new Error('The rendered checker returned an invalid suppression.');
  for (const key of [
    'elements',
    'controls',
    'insetControls',
    'numericElements',
    'alignmentGroups',
    'radiusContracts',
  ] as const)
    if (!Number.isInteger(value[key]) || value[key] < 0)
      throw new Error('The rendered checker returned invalid coverage counts.');
  const coverage = value.accessibilityCoverage;
  if (
    !coverage ||
    !Array.isArray(coverage.pageRules) ||
    coverage.pageRules.some((rule) => typeof rule !== 'string') ||
    typeof coverage.interactionRules !== 'string'
  )
    throw new Error('The rendered checker returned invalid accessibility coverage.');
}

export function summarizeRuntime(findings: readonly RuntimeFinding[]): RuntimeSummary {
  const groups = new Map<string, RuntimeSummary['groups'][number]>();
  let unresolved = 0;
  for (const f of findings) {
    const status = f.status ?? 'failed';
    if (status === 'unresolved') unresolved++;
    // Only actual measurements differ within a group; never lose extra engine evidence.
    const key = JSON.stringify([
      f.rule,
      f.selector,
      f.expected,
      f.fix,
      status,
      f.relatedSelector,
      f.phase,
      f.sourceRule,
      f.category,
      f.focusSelector,
      f.outcomeSelector,
    ]);
    let group = groups.get(key);
    if (!group) {
      group = { finding: f, occurrences: [] };
      groups.set(key, group);
    }
    group.occurrences.push(f);
  }
  return {
    problems: groups.size,
    occurrences: findings.length,
    failed: findings.length - unresolved,
    unresolved,
    groups: [...groups.values()],
  };
}

export function formatRuntimeReport(report: RuntimeAudit): string {
  const { summary: s } = report;
  return [
    `Usual UI rendered check: ${report.state} (${report.theme}, ${report.viewport.width}×${report.viewport.height})`,
    `${s.problems} distinct problems; ${s.failed} failed, ${s.unresolved} unresolved occurrences.`,
    `Checked: ${report.url} (${report.frameCoverage.checked.path}). ${report.frameCoverage.omitted.length} child frames omitted.`,
    `Interactions: ${report.accessibilityCoverage.interactionRules}.`,
    ...s.groups.map(
      ({ finding: f, occurrences }) =>
        `[${f.rule}] ${f.selector} (${f.status ?? 'failed'}, ${occurrences.length} occurrences)\n${f.message}\nFix: ${f.fix}`,
    ),
    'Scope: only this document and entered state were measured; source-policy compliance is checked separately.',
  ].join('\n');
}
