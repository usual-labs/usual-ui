import { useEffect, useRef, useState } from 'react';
import type { FindingProblem } from '../../src/reporting.js';
import { describe, toggleGroup } from './model';
import type { Finding } from './types';

export function GroupCheckbox({
  findings,
  selected,
  disabled,
  toggle,
  label = 'Select group',
}: {
  findings: Finding[];
  selected: Set<string>;
  disabled: boolean;
  toggle: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const count = findings.filter((item) => selected.has(item.id)).length;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = count > 0 && count < findings.length;
  }, [count, findings.length]);
  return (
    <label className="selection-label">
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled || !findings.length}
        checked={findings.length > 0 && count === findings.length}
        onChange={toggle}
        aria-label={label}
      />
      Select group{count > 0 ? ` (${count})` : ''}
    </label>
  );
}

export function FindingGroup({
  problem,
  findings,
  query,
  selected,
  disabled,
  setSelected,
}: {
  problem: FindingProblem;
  findings: Finding[];
  query: string;
  selected: Set<string>;
  disabled: boolean;
  setSelected: (value: Set<string>) => void;
}) {
  const [limit, setLimit] = useState(40);
  const visible = findings.filter((finding) => matchesFinding(finding, query));
  const decision = problem.kind === 'decision';
  return (
    <li className="finding-pattern">
      <div className="finding-heading">
        <span className={`kind kind-${problem.kind}`}>
          {problem.kind === 'coverage'
            ? 'Unresolved coverage'
            : decision
              ? 'Decision needed'
              : 'Violation'}
        </span>
        <code>{problem.ruleId}</code>
        <span className="muted">
          {findings.length} {findings.length === 1 ? 'occurrence' : 'occurrences'}
        </span>
      </div>
      <p>{problem.message}</p>
      <p>
        <strong>Next step:</strong> {problem.remediation.instruction}
      </p>
      {decision ? (
        <p>
          <a href="#policy">Review this policy decision</a>
          <span className="muted"> · Policy changes require separate approval.</span>
        </p>
      ) : (
        <GroupCheckbox
          findings={findings}
          selected={selected}
          disabled={disabled}
          label={`Select all occurrences of ${problem.ruleId}: ${problem.message}`}
          toggle={() => setSelected(toggleGroup(selected, findings))}
        />
      )}
      {(problem.expected !== undefined ||
        problem.actual !== undefined ||
        problem.affectedCategories?.length) && (
        <details>
          <summary>Rule evidence</summary>
          {problem.actual !== undefined && (
            <p>
              <strong>Observed:</strong> <code>{describe(problem.actual)}</code>
            </p>
          )}
          {problem.expected !== undefined && (
            <p>
              <strong>Expected:</strong> <code>{describe(problem.expected)}</code>
            </p>
          )}
          {!!problem.affectedCategories?.length && (
            <p>
              <strong>Affects:</strong> {problem.affectedCategories.join(', ')}
            </p>
          )}
        </details>
      )}
      <details open={findings.length === 1}>
        <summary>
          Source occurrences ({visible.length}
          {visible.length !== findings.length ? ` of ${findings.length} match search` : ''})
        </summary>
        <ul className="finding-list">
          {visible.slice(0, limit).map((finding) => (
            <li key={finding.id} className="finding">
              {!decision && (
                <input
                  type="checkbox"
                  checked={selected.has(finding.id)}
                  disabled={disabled}
                  onChange={() => setSelected(toggleGroup(selected, [finding]))}
                  aria-label={`Select ${finding.ruleId} at ${finding.file}:${finding.line}:${finding.column}`}
                />
              )}
              <div className="finding-body">
                <code className="source">
                  {finding.file}:{finding.line}:{finding.column}
                </code>
                <details>
                  <summary>Source evidence</summary>
                  {finding.context && <pre>{finding.context.text}</pre>}
                  {finding.context?.truncated && <p className="muted">Excerpt is truncated.</p>}
                  {finding.span && (
                    <p className="muted">
                      UTF-16 span: {finding.span.start}–{finding.span.end} (end exclusive)
                    </p>
                  )}
                  <p className="muted">
                    Finding ID: <code>{finding.id}</code>
                  </p>
                </details>
              </div>
            </li>
          ))}
        </ul>
        {visible.length > limit && (
          <button className="secondary small" onClick={() => setLimit(limit + 100)}>
            Show next {Math.min(100, visible.length - limit)}{' '}
            {visible.length - limit === 1 ? 'occurrence' : 'occurrences'}
          </button>
        )}
      </details>
    </li>
  );
}

export function matchesFinding(finding: Finding, query: string): boolean {
  return (
    !query || `${finding.message} ${finding.file} ${finding.ruleId}`.toLowerCase().includes(query)
  );
}
