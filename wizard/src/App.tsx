import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from './api';
import { AuditBoard } from './AuditBoard';
import { Inventory } from './Inventory';
import { addCandidateToDraft, compareAudits } from './model';
import { PolicyReview } from './PolicyReview';
import { RepairHandoff } from './RepairHandoff';
import { GuidedOnboarding } from './GuidedOnboarding';
import type { Audit, Category, Handoff, ObservedValue, ProjectState } from './types';

export function App() {
  const [state, setState] = useState<ProjectState | null>(null);
  const [pending, setPending] = useState('Opening project');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(new Set<string>());
  const [review, setReview] = useState(false);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [policyDraft, setPolicyDraft] = useState('');
  const [workshop, setWorkshop] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const next = await request<ProjectState>('state');
    setState(next);
    if (next.error) setError(next.error);
    setSelected(
      (current) =>
        new Set([...current].filter((id) => next.audit?.findings.some((item) => item.id === id))),
    );
    return next;
  }, []);

  useEffect(() => {
    void refresh()
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'The project could not be opened.'),
      )
      .finally(() => setPending(''));
  }, [refresh]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (!navigationTarget) return;
    const target = document.getElementById(navigationTarget);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setNavigationTarget(null);
  }, [navigationTarget, state, review, handoff]);

  async function run(label: string, action: () => Promise<void>): Promise<boolean> {
    if (pending) return false;
    setPending(label);
    setError('');
    setNotice('');
    try {
      await action();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The operation could not be completed.');
      return false;
    } finally {
      setPending('');
    }
  }

  async function recheck() {
    await run('Auditing the project', async () => {
      const previous = state?.audit ?? null;
      await request('audit', {});
      const next = await refresh();
      setReview(false);
      const comparison = next.audit && compareAudits(previous, next.audit);
      setNotice(
        comparison
          ? `Fresh audit: ${comparison.resolved} resolved, ${comparison.added} new, ${comparison.remaining} remaining ${comparison.remaining === 1 ? 'finding' : 'findings'}.`
          : 'Fresh audit saved. Review the six groups below.',
      );
      setNavigationTarget('audit');
    });
  }

  async function saveManifest(manifest: Record<string, unknown>, rationale: string) {
    return run('Validating and saving policy', async () => {
      await request('manifest', { manifest, expectedHash: state?.manifestHash ?? null, rationale });
      await refresh();
      setReview(false);
      setSelected(new Set());
      setNotice(
        'Policy saved. Run a fresh audit before planning repairs or activating categories.',
      );
    });
  }

  async function previewImpact(manifest: Record<string, unknown>): Promise<Audit | null> {
    let audit: Audit | null = null;
    const completed = await run('Previewing draft impact', async () => {
      audit = await request<Audit>('preview', {
        manifest,
        expectedHash: state?.manifestHash ?? null,
      });
      setNotice('Unsaved draft preview ready. Review its impact before approving policy.');
    });
    return completed ? audit : null;
  }

  function approveCandidate(candidate: ObservedValue) {
    if (pending) return;
    try {
      setPolicyDraft(addCandidateToDraft(policyDraft, candidate));
      setError('');
      setNotice(
        `Added ${candidate.name} to the unsaved policy draft. Review and approve the policy to save it; activation stays unchanged.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'The value could not be added to the policy draft.',
      );
      document.getElementById('policy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function savePlan() {
    if (!state?.audit) return;
    await run('Saving your repair plan', async () => {
      const next = await request<Handoff>('plan', {
        findingIds: [...selected],
        expectedSnapshot: state.audit!.snapshot,
      });
      setHandoff(next);
      setReview(false);
      setNavigationTarget('handoff');
      setNotice('Repair plan saved. Hand it to your agent, then run a fresh audit.');
    });
  }

  async function activate(category: Category) {
    if (!state?.audit) return;
    await run(`Activating ${category}`, async () => {
      await request('activate', {
        categories: [category],
        expectedSnapshot: state.audit!.snapshot,
      });
      await refresh();
      setNotice(
        `${category[0]!.toUpperCase()}${category.slice(1)} is now active in lint. Other inactive categories remain unchecked.`,
      );
    });
  }

  const selectedFindings = state?.audit?.findings.filter((item) => selected.has(item.id)) ?? [];
  const preview =
    state?.existingPreview ??
    (typeof state?.manifest?.preview === 'string' ? state.manifest.preview : undefined);

  const guided = !!state?.onboarding && !state.onboarding.saved && !workshop;

  return (
    <div className={guided ? 'app-shell guided-shell' : 'app-shell'}>
      <a className="skip-link" href="#main">
        Skip to design setup
      </a>
      <header className="site-header">
        <a className="wordmark" href="#main" aria-label="Usual UI workshop">
          <span className="brand-mark" aria-hidden="true">
            u<span>.</span>
          </span>
          usual<span className="wordmark-sub">design</span>
        </a>
        <span className="project-name" title={state?.projectRoot}>
          {state?.projectRoot?.split('/').pop() ?? 'Local project'}
        </span>
      </header>
      <main id="main" tabIndex={-1} className={guided ? 'guided-main' : 'workshop-main'}>
        {(!state?.onboarding || state.onboarding.saved || workshop) && (
          <nav className="step-nav" aria-label="Workshop sections">
            <a href="#discover">01 Discover</a>
            <a href="#policy">02 Policy</a>
            <a href="#audit">03 Audit</a>
            <a href="#handoff">04 Repair</a>
          </nav>
        )}
        {error && (
          <div className="callout error" role="alert" ref={errorRef} tabIndex={-1}>
            <strong>The operation needs attention</strong>
            <p>{error}</p>
            <div className="actions">
              <button
                className="secondary"
                disabled={!!pending}
                onClick={() =>
                  void run('Reconnecting', async () => {
                    await refresh();
                  })
                }
              >
                Reload project state
              </button>
              <button className="secondary" disabled={!!pending} onClick={() => setError('')}>
                Dismiss
              </button>
            </div>
            <p className="small-text">
              If source or policy changed, reload and run a fresh audit. An unsaved policy draft may
              need to be copied before reloading changed policy.
            </p>
          </div>
        )}
        <div className="live-status" role="status" aria-live="polite">
          {pending ? <span className="working">{pending}…</span> : notice}
        </div>
        {state?.onboarding && !state.onboarding.saved && !workshop ? (
          <GuidedOnboarding
            key={state.onboarding.sessionHash}
            initial={state.onboarding}
            manifestPath={state.manifestPath ?? 'usual.design.json'}
            openWorkshop={() => setWorkshop(true)}
            onSaved={async () => {
              try {
                await request('audit', {});
              } catch (cause) {
                setError(
                  `Your contract was saved, but the first audit could not finish. ${cause instanceof Error ? cause.message : 'Run a fresh audit to continue.'}`,
                );
                return;
              } finally {
                await refresh();
              }
              setNavigationTarget('audit');
              setNotice(
                'Manifest saved. Choose a repair batch below, then copy the prompt for your agent.',
              );
            }}
          />
        ) : state ? (
          <div aria-busy={!!pending}>
            {state.manifest && (
              <section className="workshop-status" aria-label="Project status">
                <div>
                  <strong>Your design contract is saved</strong>
                  <p>
                    {state.audit && state.audit.manifestHash === state.manifestHash
                      ? `${state.audit.findings.length} ${state.audit.findings.length === 1 ? 'finding' : 'findings'} to review · ${state.manifest.active?.length ?? 0} of 5 categories active`
                      : 'Run a fresh audit to see what needs attention.'}
                  </p>
                </div>
                <a href="#audit">
                  {state.audit ? 'Review audit' : 'Go to audit'} <span aria-hidden="true">↗</span>
                </a>
              </section>
            )}
            {!state.manifest && !state.onboarding && (
              <div className="callout">
                <strong>Prepare guided onboarding with your agent</strong>
                <p>
                  Install the usual-ui-onboarding skill from usual-labs/usual-ui using the Vercel
                  Skills CLI. Your agent will inspect the project and prepare recommendations for
                  the guided wizard.
                </p>
              </div>
            )}
            <div id="discover">
              <Inventory
                inventory={state.audit?.inventory ?? state.inventory}
                preview={preview}
                disabled={!!pending}
                onApproveCandidate={approveCandidate}
              />
            </div>
            <div id="policy">
              <PolicyReview
                state={state}
                pending={!!pending}
                save={saveManifest}
                draft={policyDraft}
                setDraft={setPolicyDraft}
                previewImpact={previewImpact}
              />
            </div>
            <div id="audit" tabIndex={-1}>
              <AuditBoard
                state={state}
                pending={!!pending}
                selected={selected}
                setSelected={setSelected}
                recheck={() => void recheck()}
                review={() => {
                  setReview(true);
                  setNavigationTarget('handoff');
                }}
                activate={(category) => void activate(category)}
              />
            </div>
            <div id="handoff" tabIndex={-1}>
              <RepairHandoff
                review={review}
                selected={selectedFindings}
                total={state.audit?.findings.length ?? 0}
                handoff={handoff}
                pending={!!pending}
                confirm={() => void savePlan()}
                cancel={() => {
                  setReview(false);
                  setNavigationTarget('audit-selection');
                }}
                recheck={() => void recheck()}
              />
            </div>
          </div>
        ) : (
          !pending && (
            <div className="empty">
              The project has not loaded. Use the session URL printed by the running wizard command
              and reconnect above.
            </div>
          )
        )}
        {!guided && (
          <footer>
            <span>Usual Labs · Intentional software.</span>
            <span>Local workflow · Project showcase runs in a separate development server.</span>
          </footer>
        )}
      </main>
    </div>
  );
}
