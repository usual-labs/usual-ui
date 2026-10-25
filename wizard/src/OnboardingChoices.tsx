import { useId } from 'react';
import type {
  OnboardingOption,
  OnboardingProposal,
  PreviewValues,
} from '../../src/onboarding-types';
import type { Category } from '../../src/types';
import { safeColor } from './model';
import { previewStyles } from './preview-styles';

const valueLabels: Record<string, string> = {
  bodySize: 'Body',
  headingSize: 'Heading',
  lineHeight: 'Line height',
  fontFamily: 'Font',
  gap: 'Gap',
  padding: 'Padding',
  controlRadius: 'Controls',
  cardRadius: 'Cards',
};

function OptionPreview({ category, values }: { category: Category; values: PreviewValues }) {
  const { style, unavailable } = previewStyles(values);
  if (!Object.keys(values).length) return null;
  return (
    <span className="onboarding-option-preview" style={style}>
      {category === 'colors' ? (
        <span className="onboarding-swatches">
          {Object.entries(values)
            .filter(([key]) => ['primary', 'surface', 'onSurface'].includes(key))
            .map(([key, value]) => (
              <code key={key}>
                {safeColor(value) && (
                  <span
                    className="onboarding-swatch"
                    aria-hidden="true"
                    style={{ backgroundColor: safeColor(value)! }}
                  />
                )}
                {key}: {value}
              </code>
            ))}
        </span>
      ) : (
        <>
          {Object.keys(style).length > 0 && category !== 'components' && (
            <span className={`option-specimen option-specimen--${category}`} aria-hidden="true">
              {category === 'typography' ? (
                <>
                  <strong>Aa</strong>
                  <span>The details matter. 012345</span>
                </>
              ) : category === 'spacing' ? (
                <>
                  <span />
                  <span />
                  <span />
                </>
              ) : (
                <>
                  <span>Button</span>
                  <span>Card</span>
                </>
              )}
            </span>
          )}
          <span className="option-value-list">
            {Object.entries(values).map(([key, value]) => (
              <span key={key}>
                {valueLabels[key] ?? key} <code>{value}</code>
              </span>
            ))}
          </span>
        </>
      )}
      {unavailable.length > 0 && (
        <span className="option-preview-note">
          Some values need project context and are shown as source text.
        </span>
      )}
    </span>
  );
}

export function OnboardingChoice({
  decision,
  option,
  selected,
  choose,
}: {
  decision: OnboardingProposal['decisions'][number];
  option: OnboardingOption;
  selected: boolean;
  choose: () => void;
}) {
  const explanationId = useId();
  return (
    <div className="onboarding-option" data-selected={selected}>
      <label className="onboarding-option-label">
        <input
          type="radio"
          name={decision.id}
          checked={selected}
          onChange={choose}
          aria-label={`${option.label}${decision.recommended === option.id ? ' (recommended)' : ''}`}
          aria-describedby={explanationId}
        />
        <span className="onboarding-option-copy">
          <span className="onboarding-option-title">
            <strong>{option.label}</strong>
            {decision.recommended === option.id && (
              <span className="onboarding-recommended">Recommended</span>
            )}
          </span>
          <span className="onboarding-option-description" id={explanationId}>
            {option.explanation}
          </span>
          <OptionPreview
            category={decision.category}
            values={option.preview?.light ?? option.preview?.dark ?? {}}
          />
        </span>
      </label>
      <details>
        <summary>Source evidence & rules</summary>
        <ul>
          {option.evidence.map((e, i) => (
            <li key={i}>
              <code>
                {e.file}:{e.line}
              </code>
            </li>
          ))}
        </ul>
        <pre className="onboarding-json">{JSON.stringify(option.rules, null, 2)}</pre>
      </details>
    </div>
  );
}
