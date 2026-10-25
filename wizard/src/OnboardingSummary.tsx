import { categories } from '../../src/types';
import type { OnboardingChoices, OnboardingProposal } from '../../src/onboarding-types';
import { labels } from './model';

export function OnboardingProject({
  proposal,
  manifestPath,
}: {
  proposal: OnboardingProposal;
  manifestPath: string;
}) {
  const categoryCount = new Set(proposal.decisions.map((decision) => decision.category)).size;
  return (
    <>
      <div className="onboarding-project-summary">
        <h3>{proposal.title}</h3>
        <p>{proposal.summary}</p>
        <div className="onboarding-scope-summary">
          <span>
            <strong>{proposal.decisions.length}</strong> design decisions
          </span>
          <span>
            <strong>{categoryCount}</strong> categories to review
          </span>
        </div>
      </div>
      <details className="onboarding-scope-details">
        <summary>Review project scope & destination</summary>
        <dl className="onboarding-scope">
          <dt>Covered paths</dt>
          <dd>
            {proposal.scope.include.map((path) => (
              <code key={path}>{path}</code>
            ))}
          </dd>
          <dt>Excluded paths</dt>
          <dd>
            {proposal.scope.ignore?.join(', ') ||
              'None configured; standard generated/dependency exclusions apply.'}
          </dd>
          <dt>Token sources</dt>
          <dd>{proposal.scope.tokens?.join(', ') || 'Covered CSS is discovered automatically.'}</dd>
          <dt>Manifest destination</dt>
          <dd>
            <code>{manifestPath}</code>
          </dd>
        </dl>
      </details>
      {proposal.notes?.length ? (
        <div className="callout">
          <strong>Before you choose</strong>
          <ul>
            {proposal.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="small-text">
        Choose your rules, review their impact, then approve your contract. Repairs and lint
        activation follow separately.
      </p>
    </>
  );
}

export function OnboardingReview({
  proposal,
  choices,
  disabled,
  edit,
}: {
  proposal: OnboardingProposal;
  choices: OnboardingChoices;
  disabled: boolean;
  edit: (step: number) => void;
}) {
  return (
    <div className="onboarding-choice-review">
      {categories.map((category, index) => {
        const group = proposal.decisions.filter((decision) => decision.category === category);
        const deferred = choices.deferred.includes(category) || !group.length;
        return (
          <section key={category} aria-labelledby={`review-${category}`}>
            <div className="onboarding-choice-review-heading">
              <h3 id={`review-${category}`}>{labels[category]}</h3>
              <button
                className="secondary small"
                disabled={disabled}
                onClick={() => edit(index + 1)}
                aria-label={`Edit ${labels[category]} choices`}
              >
                Edit
              </button>
            </div>
            {deferred ? (
              <p className="muted">Deferred · no policy added</p>
            ) : (
              <ul className="onboarding-choice-list">
                {group.map((decision) => (
                  <li key={decision.id}>
                    <span>{decision.title}</span>
                    <strong>
                      {decision.options.find(
                        (option) => option.id === choices.selections[decision.id],
                      )?.label ?? 'Choose an option'}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      <p className="small-text">
        All categories start inactive. Activate each one after its full audit is clean.
      </p>
    </div>
  );
}
