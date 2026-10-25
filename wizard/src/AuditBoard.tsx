import { useState } from 'react';
import { summarizeFindings } from '../../src/reporting.js';
import { canActivate, grouped, labels, toggleGroup } from './model';
import { FindingGroup, GroupCheckbox, matchesFinding } from './FindingGroup';
import { categories, type Category, type ProjectState } from './types';

export function AuditBoard({
  state,
  pending,
  selected,
  setSelected,
  recheck,
  review,
  activate,
}: {
  state: ProjectState;
  pending: boolean;
  selected: Set<string>;
  setSelected: (value: Set<string>) => void;
  recheck: () => void;
  review: () => void;
  activate: (category: Category) => void;
}) {
  const [search, setSearch] = useState('');
  const [limits, setLimits] = useState<Partial<Record<Category, number>>>({});
  const audit = state.audit;
  const groups = grouped(audit?.findings ?? []);
  const categoryOrder = [
    ...categories.filter((category) => groups[category].length > 0),
    ...categories.filter((category) => groups[category].length === 0),
  ];
  const summary = summarizeFindings(audit?.findings ?? []);
  const byId = new Map(audit?.findings.map((finding) => [finding.id, finding]));
  const stale = !!audit && audit.manifestHash !== state.manifestHash;
  const query = search.trim().toLowerCase();
  const active: readonly string[] = state.manifest?.active ?? audit?.active ?? [];
  const inactive = categories.filter(
    (category) => category !== 'coverage' && !active.includes(category),
  );

  return (
    <section className="panel" aria-labelledby="audit-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 · Choose what to resolve</p>
          <h2 id="audit-title">Choose your next repair batch</h2>
        </div>
        <button className="secondary" disabled={pending || !state.manifest} onClick={recheck}>
          {pending ? 'Working…' : audit ? 'Run fresh audit' : 'Run first audit'}
        </button>
      </div>
      <p>
        The audit examines every category. Lint only enforces activated categories. Selecting a
        repair does not activate or weaken a rule.
      </p>
      <div className="coverage-banner">
        <strong>{active.length} of 5 categories active</strong>
        <span>
          {inactive.length
            ? `Not checked by lint: ${inactive.map((category) => labels[category]).join(', ')}.`
            : 'All five policy categories are enforced.'}
        </span>
      </div>
      {!state.manifest && (
        <div className="callout">
          Save an approved manifest above to audit against your design rules.
        </div>
      )}
      {stale && (
        <div className="callout warning" role="status">
          The policy has changed since this audit. Run a fresh audit before selecting repairs or
          activating a category.
        </div>
      )}
      {!!audit?.errors.length && (
        <div className="callout warning">
          <strong>The audit is incomplete.</strong>
          <ul>
            {audit.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <p>Resolve these errors and recheck before activation.</p>
        </div>
      )}
      {audit && (
        <>
          <div className="audit-toolbar">
            <label htmlFor="finding-search">
              Search findings
              <input
                id="finding-search"
                type="search"
                placeholder="File, rule, or message"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <span className="muted">
              {audit.files.length} {audit.files.length === 1 ? 'file' : 'files'} ·{' '}
              {summary.totals.problems} diagnostic{' '}
              {summary.totals.problems === 1 ? 'pattern' : 'patterns'} ·{' '}
              {summary.totals.occurrences}{' '}
              {summary.totals.occurrences === 1 ? 'finding' : 'findings'}
            </span>
          </div>
          <div className="audit-counts" aria-label="Finding types">
            <span>
              <strong>{summary.totals.violations}</strong>{' '}
              {summary.totals.violations === 1 ? 'violation' : 'violations'}
            </span>
            <span>
              <strong>{summary.totals.coverage}</strong> unresolved coverage
            </span>
            <span>
              <strong>{summary.totals.decisions}</strong> policy{' '}
              {summary.totals.decisions === 1 ? 'decision' : 'decisions'}
            </span>
          </div>
          <details className="audit-help">
            <summary>How selection and grouping work</summary>
            <p className="muted">
              Identical diagnostic patterns share guidance; each source occurrence keeps its own
              evidence and selection. Group selection includes all findings in that group, even when
              search hides some.
            </p>
          </details>
          <div className="audit-groups">
            {categoryOrder.map((category) => {
              const findings = groups[category];
              const repairable = findings.filter((item) => item.kind !== 'decision');
              const filtered = summary.problems.filter(
                (problem) =>
                  problem.category === category &&
                  problem.findingIds.some((id) => matchesFinding(byId.get(id)!, query)),
              );
              const limit = limits[category] ?? 40;
              const counts = summary.byCategory[category];
              return (
                <section
                  key={category}
                  className={`audit-group${findings.length ? '' : ' audit-group-empty'}`}
                  aria-labelledby={`group-${category}`}
                >
                  <div className="group-heading">
                    <div>
                      <h3 id={`group-${category}`}>{labels[category]}</h3>
                      <p>
                        {counts.problems} {counts.problems === 1 ? 'pattern' : 'patterns'} ·{' '}
                        {findings.length} {findings.length === 1 ? 'finding' : 'findings'}
                      </p>
                    </div>
                    <span className={`pill ${active.includes(category) ? 'success' : ''}`}>
                      {category === 'coverage'
                        ? 'Analysis evidence'
                        : active.includes(category)
                          ? 'Active in lint'
                          : 'Inactive in lint'}
                    </span>
                  </div>
                  <div className="group-controls">
                    {repairable.length > 0 && (
                      <GroupCheckbox
                        findings={repairable}
                        selected={selected}
                        disabled={pending || stale}
                        label={`Select all ${labels[category]} findings`}
                        toggle={() => setSelected(toggleGroup(selected, repairable))}
                      />
                    )}
                    {category !== 'coverage' && !active.includes(category) && (
                      <button
                        className="secondary small"
                        disabled={pending || !canActivate(category, audit, state.manifestHash)}
                        onClick={() => activate(category)}
                      >
                        Activate {labels[category]}
                      </button>
                    )}
                  </div>
                  {filtered.length > 0 ? (
                    <ul className="finding-list">
                      {filtered.slice(0, limit).map((problem) => (
                        <FindingGroup
                          key={problem.findingIds[0]}
                          problem={problem}
                          findings={problem.findingIds.map((id) => byId.get(id)!)}
                          query={query}
                          selected={selected}
                          disabled={pending || stale}
                          setSelected={setSelected}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="empty compact">
                      {findings.length
                        ? 'No findings match this search.'
                        : category === 'coverage'
                          ? 'No unresolved coverage findings.'
                          : 'No findings under the current configured rules.'}
                    </p>
                  )}
                  {filtered.length > limit && (
                    <button
                      className="secondary small"
                      onClick={() => setLimits({ ...limits, [category]: limit + 100 })}
                    >
                      Show next {Math.min(100, filtered.length - limit)} diagnostic{' '}
                      {filtered.length - limit === 1 ? 'pattern' : 'patterns'}
                    </button>
                  )}
                  {category !== 'coverage' &&
                    !active.includes(category) &&
                    !canActivate(category, audit, state.manifestHash) && (
                      <p className="muted small-text">
                        Resolve this category’s findings and any related coverage errors, then run a
                        fresh audit to activate it.
                      </p>
                    )}
                </section>
              );
            })}
          </div>
          <div id="audit-selection" tabIndex={-1} className="actions repair-actions">
            <span>
              {selected.size} selected · {audit.findings.length - selected.size} deferred
            </span>
            <button
              disabled={pending || stale || !!audit.errors.length || !selected.size}
              onClick={review}
            >
              Review repair batch
            </button>
            {selected.size > 0 && (
              <button
                className="secondary"
                disabled={pending}
                onClick={() => setSelected(new Set())}
              >
                Clear selection
              </button>
            )}
          </div>
          <p className="muted">
            Deferred findings remain in the project audit records. Reopen this wizard and run a
            fresh audit to resume them. Source changes since this scan are checked again by the
            server before a repair plan or activation is saved.
          </p>
        </>
      )}
    </section>
  );
}
