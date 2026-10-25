import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  chosenPreview,
  type OnboardingChoices,
  type OnboardingProposal,
} from '../../src/onboarding-types';
import { showcaseState, type ShowcaseTheme } from '../../src/showcase-protocol';
import { ReferenceShowcase } from './ReferenceShowcase';
import { ProjectShowcase } from './ProjectShowcase';
import { ThemeInspector } from './ThemeInspector';
import { PreviewPresets } from './PreviewPresets';
import { PreviewExport } from './PreviewExport';
import {
  changedPreviewCategories,
  createPreviewHistory,
  effectivePreview,
  exportPreviewCss,
  exportPreviewRequest,
  previewThemeReducer,
} from './preview-theme';
import { Icon } from './Icon';
import type { Category } from '../../src/types';

export function OnboardingPreview({
  proposal,
  choices,
  activeCategory,
  onChoicesChange,
  choicesDisabled = false,
  expanded = false,
  onExpandedChange,
}: {
  proposal: OnboardingProposal;
  choices: OnboardingChoices;
  activeCategory?: Category;
  onChoicesChange?: (choices: OnboardingChoices) => void;
  choicesDisabled?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const projectThemes = proposal.showcase?.themes ?? ['light', 'dark'];
  const [referenceTheme, setReferenceTheme] = useState<ShowcaseTheme>('light');
  const [projectTheme, setProjectTheme] = useState<ShowcaseTheme>(projectThemes[0]);
  const [source, setSource] = useState<'project' | 'examples'>('project');
  const [inspector, setInspector] = useState(false);
  const [viewport, setViewport] = useState<'fit' | 'tablet' | 'phone'>('fit');
  const [original, setOriginal] = useState(false);
  const [history, dispatch] = useReducer(previewThemeReducer, undefined, createPreviewHistory);
  const previousChoices = useRef(choices);
  const expandButton = useRef<HTMLButtonElement>(null);
  const customizeButton = useRef<HTMLButtonElement>(null);
  const project = !!proposal.showcase && source === 'project';
  const actualProjectTheme = projectThemes.includes(projectTheme) ? projectTheme : projectThemes[0];
  const theme = project ? actualProjectTheme : referenceTheme;
  const themes: ShowcaseTheme[] = project ? projectThemes : ['light', 'dark'];
  const bases = useMemo(
    () => ({
      light: chosenPreview(proposal, choices, 'light'),
      dark: chosenPreview(proposal, choices, 'dark'),
    }),
    [proposal, choices],
  );
  const projectState = useMemo(
    () => showcaseState(proposal, choices, actualProjectTheme),
    [proposal, choices, actualProjectTheme],
  );
  const changedCategories = changedPreviewCategories(proposal, previousChoices.current, choices);
  const currentHistory = changedCategories.length
    ? previewThemeReducer(history, { type: 'rebase', categories: changedCategories })
    : history;
  const overrides = currentHistory.present;
  const modified = Object.keys(overrides[referenceTheme]).length > 0;
  const values = original
    ? bases[referenceTheme]
    : {
        ...bases[referenceTheme],
        ...effectivePreview(bases[referenceTheme], overrides[referenceTheme], choices.deferred),
      };

  useEffect(() => {
    const categories = changedPreviewCategories(proposal, previousChoices.current, choices);
    previousChoices.current = choices;
    if (categories.length) {
      dispatch({ type: 'rebase', categories });
      setOriginal(false);
    }
  }, [proposal, choices]);

  useEffect(() => {
    if (!expanded || !onExpandedChange) return;
    function exit(event: KeyboardEvent) {
      if (
        event.key !== 'Escape' ||
        event.defaultPrevented ||
        document.querySelector('dialog[open], [popover]:popover-open')
      )
        return;
      onExpandedChange!(false);
      expandButton.current?.focus();
    }
    window.addEventListener('keydown', exit);
    return () => window.removeEventListener('keydown', exit);
  }, [expanded, onExpandedChange]);

  return (
    <section className="onboarding-preview" aria-label="Design system preview">
      <header className="preview-toolbar">
        <div>
          <h2>{project ? proposal.showcase!.title : 'Design preview'}</h2>
          <span>
            {project ? 'Project components' : 'Explore a style. See it across your product.'}
          </span>
        </div>
        <div className="preview-toolbar-actions">
          <div className="theme-switch" role="group" aria-label="Preview theme">
            {themes.map((t) => (
              <button
                key={t}
                type="button"
                className="secondary"
                aria-pressed={theme === t}
                onClick={() => {
                  if (project) setProjectTheme(t);
                  else setReferenceTheme(t);
                  setOriginal(false);
                }}
              >
                <Icon name={t === 'light' ? 'sun' : 'moon'} /> {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
          {!project && (
            <button
              ref={customizeButton}
              type="button"
              className="secondary preview-customize"
              aria-expanded={inspector}
              aria-controls="theme-inspector-panel"
              onClick={() => setInspector(!inspector)}
            >
              Customize theme
            </button>
          )}
          {onExpandedChange && (
            <button
              ref={expandButton}
              type="button"
              className="secondary"
              aria-pressed={expanded}
              onClick={() => onExpandedChange(!expanded)}
            >
              {expanded ? 'Back to setup' : 'Expand preview'}
            </button>
          )}
        </div>
      </header>
      {proposal.showcase && (
        <div className="preview-source" role="group" aria-label="Preview source">
          <button
            type="button"
            className="secondary"
            aria-pressed={project}
            onClick={() => setSource('project')}
          >
            Your project
          </button>
          <button
            type="button"
            className="secondary"
            aria-pressed={!project}
            onClick={() => setSource('examples')}
          >
            Reference examples
          </button>
        </div>
      )}
      {proposal.showcase && (
        <div className="preview-project-panel" hidden={!project}>
          <ProjectShowcase showcase={proposal.showcase} state={projectState} />
        </div>
      )}
      {!project && (
        <>
          <div className="preview-studio-tools">
            <div className="preview-devices" role="group" aria-label="Preview size">
              {(['fit', 'tablet', 'phone'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className="secondary"
                  aria-pressed={viewport === size}
                  onClick={() => setViewport(size)}
                >
                  {size === 'fit' ? 'Fit' : size === 'tablet' ? 'Tablet · 768' : 'Phone · 390'}
                </button>
              ))}
            </div>
            <div className="preview-history" role="group" aria-label="Theme exploration history">
              <button
                type="button"
                className="secondary"
                disabled={!currentHistory.past.length}
                onClick={() => {
                  dispatch({ type: 'undo' });
                  setOriginal(false);
                }}
              >
                Undo
              </button>
              <button
                type="button"
                className="secondary"
                disabled={!currentHistory.future.length}
                onClick={() => {
                  dispatch({ type: 'redo' });
                  setOriginal(false);
                }}
              >
                Redo
              </button>
              <PreviewExport
                css={exportPreviewCss(bases, overrides, choices.deferred)}
                request={exportPreviewRequest(proposal, choices, overrides)}
              />
            </div>
          </div>
          {modified && (
            <div className="preview-exploration-note">
              <span>
                <strong>{original ? 'Showing setup choices' : 'Exploring a custom theme'}</strong>
                Preview only · export a request to bring these changes into your project.
              </span>
              <button
                type="button"
                className="secondary"
                aria-pressed={original}
                onClick={() => setOriginal(!original)}
              >
                {original ? 'Show custom theme' : 'Compare with setup'}
              </button>
            </div>
          )}
          <div className="preview-studio-body" data-inspector={inspector}>
            <ReferenceShowcase
              values={values}
              theme={referenceTheme}
              activeCategory={activeCategory}
              viewport={viewport}
              exploring={modified && !original}
            />
            {inspector && (
              <aside
                className="preview-inspector-panel"
                id="theme-inspector-panel"
                aria-label="Customize reference theme"
              >
                <div className="preview-inspector-heading">
                  <p className="eyebrow">
                    {referenceTheme === 'light' ? 'Light' : 'Dark'} theme studio
                  </p>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setInspector(false);
                      customizeButton.current?.focus();
                    }}
                    aria-label="Close theme controls"
                  >
                    Close
                  </button>
                </div>
                <PreviewPresets
                  proposal={proposal}
                  choices={choices}
                  onChange={onChoicesChange}
                  disabled={choicesDisabled}
                />
                <ThemeInspector
                  values={bases[referenceTheme]}
                  overrides={overrides[referenceTheme]}
                  deferred={choices.deferred}
                  onChange={(slot, value) => {
                    dispatch({
                      type: 'edit',
                      theme: referenceTheme,
                      slot,
                      value,
                      base: bases[referenceTheme],
                      deferred: choices.deferred,
                    });
                    setOriginal(false);
                  }}
                  onReset={() => {
                    dispatch({ type: 'reset', theme: referenceTheme });
                    setOriginal(false);
                  }}
                />
              </aside>
            )}
          </div>
        </>
      )}
    </section>
  );
}
