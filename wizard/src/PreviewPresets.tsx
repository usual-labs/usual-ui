import { useId } from 'react';
import type { OnboardingChoices, OnboardingProposal } from '../../src/onboarding-types';

export function PreviewPresets({
  proposal,
  choices,
  onChange,
  disabled,
}: {
  proposal: OnboardingProposal;
  choices: OnboardingChoices;
  onChange?: (choices: OnboardingChoices) => void;
  disabled: boolean;
}) {
  const id = useId();
  const decisions = proposal.decisions.filter((decision) =>
    decision.options.some((option) => option.preview),
  );
  if (!onChange || !decisions.length) return null;
  return (
    <details className="preview-presets">
      <summary>Start from proposed styles</summary>
      <p>These options also update your setup choices.</p>
      <fieldset disabled={disabled}>
        {decisions.map((decision) => (
          <label key={decision.id} htmlFor={`${id}-${decision.id}`}>
            {decision.title}
            <select
              id={`${id}-${decision.id}`}
              value={choices.selections[decision.id] ?? ''}
              disabled={choices.deferred.includes(decision.category)}
              onChange={(event) =>
                onChange({
                  ...choices,
                  selections: { ...choices.selections, [decision.id]: event.target.value },
                })
              }
            >
              {!choices.selections[decision.id] && <option value="">Choose a style</option>}
              {decision.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
    </details>
  );
}
