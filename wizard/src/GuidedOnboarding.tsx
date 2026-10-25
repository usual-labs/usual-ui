import { useEffect, useRef, useState } from 'react';
import { categories } from '../../src/types';
import {
  compileChoices,
  type OnboardingChoices,
  type OnboardingState,
} from '../../src/onboarding-types';
import { request } from './api';
import { OnboardingPreview } from './OnboardingPreview';
import { OnboardingChoice } from './OnboardingChoices';
import { OnboardingProject, OnboardingReview } from './OnboardingSummary';
import type { Audit } from './types';

const steps = ['Your project', 'Colors', 'Typography', 'Spacing', 'Shape', 'Components', 'Review'];
const intros = [
  'A few thoughtful choices. One consistent design system.',
  'Choose a palette with a clear role for every color.',
  'Set a type system that makes your content easy to read.',
  'Give your layouts a consistent rhythm and room to breathe.',
  'Choose the corners and surfaces that feel like your product.',
  'Choose the shared components your team can build on.',
  'Your choices, together. Review them before saving your contract.',
];

export function choicesAreSaved(choices: OnboardingChoices, saved: OnboardingChoices): boolean {
  const keys = new Set([...Object.keys(choices.selections), ...Object.keys(saved.selections)]);
  return (
    [...keys].every((key) => choices.selections[key] === saved.selections[key]) &&
    choices.deferred.length === saved.deferred.length &&
    choices.deferred.every((category) => saved.deferred.includes(category))
  );
}

export function GuidedOnboarding({
  initial,
  manifestPath,
  onSaved,
  openWorkshop,
}: {
  initial: OnboardingState;
  manifestPath: string;
  onSaved: () => Promise<unknown>;
  openWorkshop: () => void;
}) {
  const [record, setRecord] = useState(initial);
  const [choices, setChoices] = useState<OnboardingChoices>(initial.session.choices);
  const [step, setStep] = useState(initial.session.step);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [impact, setImpact] = useState<Audit | null>(null);
  const [approved, setApproved] = useState(false);
  const [contractSaved, setContractSaved] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const stepNavigation = useRef<HTMLElement>(null);
  const proposal = record.session.proposal;
  const category = categories[step - 1];
  const decisions = proposal.decisions.filter((d) => d.category === category);
  const deferred = choices.deferred.includes(category);
  const unsaved = !choicesAreSaved(choices, record.session.choices);
  const disabled = !!pending || !!record.stale || contractSaved;
  let manifest;
  let compilationError = '';
  try {
    manifest = compileChoices(proposal, choices);
  } catch (cause) {
    compilationError = (cause as Error).message;
  }

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  useEffect(() => {
    const navigation = stepNavigation.current;
    if (!navigation) return;
    const revealCurrentStep = () => {
      const active = navigation.querySelector<HTMLButtonElement>('[aria-current="step"]');
      if (!active || navigation.scrollWidth <= navigation.clientWidth) return;
      const container = navigation.getBoundingClientRect();
      const button = active.getBoundingClientRect();
      if (button.left < container.left + 8)
        navigation.scrollLeft += button.left - container.left - 8;
      else if (button.right > container.right - 8)
        navigation.scrollLeft += button.right - container.right + 8;
    };
    revealCurrentStep();
    const observer = new ResizeObserver(revealCurrentStep);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [step]);

  useEffect(() => {
    if (!unsaved) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);

  async function operation(label: string, action: () => Promise<void>) {
    if (pending) return;
    setPending(label);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setPending('');
    }
  }
  async function persist(next: number) {
    const updated = await request<OnboardingState>('onboarding/choices', {
      choices,
      step: next,
      expectedHash: record.sessionHash,
    });
    setRecord(updated);
    setStep(next);
    setApproved(false);
    setImpact(null);
    return updated;
  }
  function choose(next: OnboardingChoices) {
    setChoices(next);
    setApproved(false);
    setImpact(null);
  }
  async function finish() {
    await operation('Saving your design contract', async () => {
      const updated = await persist(6);
      await request('onboarding/finish', { expectedHash: updated.sessionHash, approved: true });
      setContractSaved(true);
      await onSaved();
    });
  }
  return (
    <section className="onboarding" aria-labelledby="onboarding-title" aria-busy={!!pending}>
      <div className={`onboarding-layout${previewExpanded ? ' preview-expanded' : ''}`}>
        <nav ref={stepNavigation} className="onboarding-steps" aria-label="Onboarding progress">
          {steps.map((label, i) => (
            <button
              key={label}
              className="secondary"
              aria-current={step === i ? 'step' : undefined}
              disabled={disabled}
              onClick={() =>
                void operation('Saving progress', async () => {
                  await persist(i);
                })
              }
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {label}
            </button>
          ))}
        </nav>
        <aside className="onboarding-decisions">
          {record.stale && (
            <div className="callout error" role="alert">
              <p>{record.stale}</p>
              <button className="secondary" onClick={openWorkshop}>
                Open policy workshop
              </button>
            </div>
          )}
          {error && (
            <div className="callout error" role="alert">
              {error}
            </div>
          )}
          <div className="onboarding-fields">
            <p className="eyebrow">
              Step {step + 1} of {steps.length}
            </p>
            <h1 id="onboarding-title" ref={heading} tabIndex={-1}>
              {steps[step]}
            </h1>
            <p className="onboarding-intro">{intros[step]}</p>
            {compilationError && (
              <div className="callout error" role="alert">
                {compilationError}
              </div>
            )}
            {step === 0 ? (
              <OnboardingProject proposal={proposal} manifestPath={manifestPath} />
            ) : step === 6 ? (
              <>
                <OnboardingReview
                  proposal={proposal}
                  choices={choices}
                  disabled={disabled}
                  edit={(next) =>
                    void operation('Saving progress', async () => {
                      await persist(next);
                    })
                  }
                />
                <details>
                  <summary>Manifest to save</summary>
                  <pre className="onboarding-json">
                    {JSON.stringify(manifest, null, 2) || compilationError}
                  </pre>
                </details>
                <button
                  className="secondary"
                  disabled={disabled || !!compilationError}
                  onClick={() =>
                    void operation('Checking the proposed policy', async () => {
                      const result = await request<{ audit: Audit }>('onboarding/preview', {
                        choices,
                        expectedHash: record.sessionHash,
                      });
                      setImpact(result.audit);
                    })
                  }
                >
                  Preview lint impact
                </button>
                {impact && (
                  <div className="callout" role="status">
                    {impact.findings.length} findings across {impact.files.length} files.
                    {impact.errors.length > 0 && <p>{impact.errors.join('\n')}</p>}
                    <p>This is an unsaved audit. You choose repairs after saving.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <label className="onboarding-defer">
                  <input
                    type="checkbox"
                    checked={deferred || !decisions.length}
                    disabled={disabled || !decisions.length}
                    onChange={(e) =>
                      choose({
                        ...choices,
                        deferred: e.target.checked
                          ? [...choices.deferred, category]
                          : choices.deferred.filter((c) => c !== category),
                      })
                    }
                  />
                  Defer all {category} decisions
                </label>
                {!decisions.length && (
                  <p className="callout">
                    Your agent has not proposed this category yet. It will remain unchecked. Ask for
                    a proposal when you are ready.
                  </p>
                )}
                {decisions.map((decision) => (
                  <fieldset
                    className="onboarding-question"
                    key={decision.id}
                    disabled={disabled || deferred}
                  >
                    <legend>{decision.title}</legend>
                    <p>{decision.description}</p>
                    {decision.options.map((option) => (
                      <OnboardingChoice
                        key={option.id}
                        decision={decision}
                        option={option}
                        selected={choices.selections[decision.id] === option.id}
                        choose={() =>
                          choose({
                            ...choices,
                            selections: { ...choices.selections, [decision.id]: option.id },
                          })
                        }
                      />
                    ))}
                  </fieldset>
                ))}
              </>
            )}
          </div>
          <div className="onboarding-navigation">
            {step === 6 && !contractSaved && (
              <label className="onboarding-approval">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  disabled={disabled}
                />
                I approve these rules and coverage. Save the manifest with all categories inactive.
              </label>
            )}
            <p
              className="onboarding-progress-status"
              data-unsaved={unsaved}
              role="status"
              aria-live="polite"
            >
              {pending
                ? `${pending}…`
                : contractSaved
                  ? 'Contract saved · All categories inactive'
                  : unsaved
                    ? 'Unsaved choices · Continue saves your progress'
                    : 'Progress saved · Contract not yet approved'}
            </p>
            <div className="onboarding-navigation-actions">
              {contractSaved ? (
                <button
                  disabled={!!pending}
                  onClick={() =>
                    void operation('Opening repair workspace', async () => {
                      await onSaved();
                    })
                  }
                >
                  Open repair workspace
                </button>
              ) : (
                <>
                  {step > 0 && (
                    <button
                      className="secondary"
                      disabled={disabled}
                      onClick={() =>
                        void operation('Saving progress', async () => {
                          await persist(step - 1);
                        })
                      }
                    >
                      Back
                    </button>
                  )}
                  <button
                    className="secondary"
                    disabled={disabled}
                    onClick={() =>
                      void operation('Saving progress', async () => {
                        await persist(step);
                      })
                    }
                  >
                    Save progress
                  </button>
                  {step < 6 && (
                    <button
                      disabled={disabled}
                      onClick={() =>
                        void operation('Saving progress', async () => {
                          await persist(step + 1);
                        })
                      }
                    >
                      {step === 5 ? 'Review contract' : `Continue to ${steps[step + 1]}`}
                    </button>
                  )}
                  {step === 6 && (
                    <button
                      disabled={!approved || disabled || !!compilationError}
                      onClick={() => void finish()}
                    >
                      Approve & save manifest
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
        <OnboardingPreview
          proposal={proposal}
          choices={choices}
          activeCategory={category}
          onChoicesChange={choose}
          choicesDisabled={disabled}
          expanded={previewExpanded}
          onExpandedChange={setPreviewExpanded}
        />
      </div>
    </section>
  );
}
