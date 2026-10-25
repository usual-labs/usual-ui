import { categories, type AuditResult, type Finding } from './types.js';

export interface Remediation {
  action: 'repair-source' | 'resolve-coverage' | 'review-policy';
  instruction: string;
}

export interface FindingCounts {
  problems: number;
  occurrences: number;
  violations: number;
  coverage: number;
  decisions: number;
}

export interface FindingProblem {
  ruleId: string;
  category: Finding['category'];
  kind: Finding['kind'];
  message: string;
  actual?: string;
  expected?: string;
  affectedCategories?: Finding['affectedCategories'];
  findingIds: string[];
  remediation: Remediation;
}

export interface FindingSummary {
  totals: FindingCounts;
  byCategory: Record<Finding['category'], FindingCounts>;
  byRule: ({ ruleId: string } & FindingCounts)[];
  problems: FindingProblem[];
}

/** Guidance explains existing evidence; it neither chooses policy values nor grants edit authority. */
export function remediationFor(finding: Finding): Remediation {
  if (finding.kind === 'decision')
    return {
      action: 'review-policy',
      instruction:
        'Review and explicitly approve this category’s policy before activation. Keep this decision out of ordinary application repair batches.',
    };
  if (finding.kind === 'coverage')
    return {
      action: 'resolve-coverage',
      instruction:
        'Inspect the unresolved source and the reported analysis limit. Use supported, statically verifiable source where possible, then re-audit. If a policy or scope decision is necessary, request separate review; no replacement value is established by this finding.',
    };
  if (finding.ruleId === `allowed.${finding.category}`)
    return {
      action: 'repair-source',
      instruction: `Replace the observed value with a value already approved in allowed.${finding.category}. Check the matching class, variable, or declaration policy; do not add this value to policy as a repair.`,
    };
  return {
    action: 'repair-source',
    instruction: finding.expected
      ? 'Update the application source to meet the reported expectation in the matching rule. Check every applicable branch and preserve the approved policy.'
      : 'Remove or replace the forbidden source usage identified by this rule. Check the approved rule for permitted alternatives; preserve the policy.',
  };
}

function emptyCounts(): FindingCounts {
  return { problems: 0, occurrences: 0, violations: 0, coverage: 0, decisions: 0 };
}

/**
 * Exact diagnostic patterns only: shared wording is not evidence of a shared root cause.
 * IDs reference the original findings, which remain authoritative for source evidence and selection.
 */
export function summarizeFindings(findings: readonly Finding[]): FindingSummary {
  const grouped = new Map<string, FindingProblem>();
  for (const finding of findings) {
    const affectedCategories = finding.affectedCategories
      ? [...finding.affectedCategories].sort()
      : undefined;
    const key = JSON.stringify([
      finding.ruleId,
      finding.category,
      finding.kind,
      finding.message,
      finding.expected ?? null,
      finding.actual ?? null,
      affectedCategories ?? null,
    ]);
    const existing = grouped.get(key);
    if (existing) existing.findingIds.push(finding.id);
    else
      grouped.set(key, {
        ruleId: finding.ruleId,
        category: finding.category,
        kind: finding.kind,
        message: finding.message,
        ...(finding.actual !== undefined ? { actual: finding.actual } : {}),
        ...(finding.expected !== undefined ? { expected: finding.expected } : {}),
        ...(affectedCategories ? { affectedCategories } : {}),
        findingIds: [finding.id],
        remediation: remediationFor(finding),
      });
  }
  const totals = emptyCounts();
  const byCategory = Object.fromEntries(
    [...categories, 'coverage'].map((category) => [category, emptyCounts()]),
  ) as FindingSummary['byCategory'];
  const rules = new Map<string, FindingCounts>();
  const problems = [...grouped.values()];
  for (const problem of problems) {
    const rule = rules.get(problem.ruleId) ?? emptyCounts();
    rules.set(problem.ruleId, rule);
    for (const counts of [totals, byCategory[problem.category], rule]) {
      counts.problems++;
      counts.occurrences += problem.findingIds.length;
      counts[
        problem.kind === 'violation'
          ? 'violations'
          : problem.kind === 'decision'
            ? 'decisions'
            : 'coverage'
      ] += problem.findingIds.length;
    }
  }
  return {
    totals,
    byCategory,
    byRule: [...rules].map(([ruleId, counts]) => ({ ruleId, ...counts })),
    problems,
  };
}

/** Additive presentation metadata. Persisted audit and repair authority stays in the raw result. */
export function reportResult(result: AuditResult): AuditResult & { summary: FindingSummary } {
  return { ...result, summary: summarizeFindings(result.findings) };
}

export function humanResult(result: AuditResult): string {
  const summary = summarizeFindings(result.findings);
  const lines = [
    `Usual UI ${result.mode}: ${result.files.length} files`,
    `Active: ${result.active.join(', ') || 'none — no design enforcement'}`,
    `Inactive: ${result.inactive.join(', ') || 'none'}`,
  ];
  if (result.coverage)
    lines.push(
      `Include: ${result.coverage.include.join(', ')}`,
      `Configured excludes: ${result.coverage.ignore.join(', ') || 'none'}; standard dependency/build exclusions also apply.`,
      `Exceptions used: ${result.coverage.exceptionsUsed.length}`,
    );
  if (result.coverage?.exceptionsUnused !== undefined)
    lines.push(
      `Exceptions unused in this run: ${result.coverage.exceptionsUnused.length}; review them in a full audit before removal.`,
    );
  for (const error of result.errors) lines.push(`ERROR ${error}`);
  const { totals } = summary;
  lines.push(
    `${totals.problems} distinct diagnostic patterns; ${totals.occurrences} occurrences: ${totals.violations} violations, ${totals.coverage} unresolved coverage, ${totals.decisions} policy decisions.`,
  );
  for (const [category, counts] of Object.entries(summary.byCategory))
    if (counts.occurrences)
      lines.push(
        `${category}: ${counts.problems} patterns, ${counts.occurrences} occurrences (${counts.violations} violations, ${counts.coverage} unresolved, ${counts.decisions} decisions).`,
      );
  const findings = new Map(result.findings.map((finding) => [finding.id, finding]));
  for (const problem of summary.problems) {
    lines.push(
      `\n[${problem.ruleId}] ${problem.kind} · ${problem.findingIds.length} occurrence(s): ${problem.message}`,
    );
    if (problem.actual !== undefined) lines.push(`Observed: ${problem.actual}`);
    if (problem.expected !== undefined) lines.push(`Expected: ${problem.expected}`);
    if (problem.affectedCategories?.length)
      lines.push(`Affects: ${problem.affectedCategories.join(', ')}`);
    lines.push(`Next: ${problem.remediation.instruction}`);
    for (const id of problem.findingIds) {
      const finding = findings.get(id)!;
      lines.push(`  ${finding.file}:${finding.line}:${finding.column} [${finding.id}]`);
    }
  }
  lines.push(`\n${result.findings.length} findings; ${result.errors.length} operational errors.`);
  return lines.join('\n');
}
