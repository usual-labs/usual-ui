import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { previewSlots, type PreviewValues } from '../../src/onboarding-types';
import type { Category } from '../../src/types';
import { previewStyles } from './preview-styles';
import { DesignSystemSample } from './DesignSystemSample';
import { ComponentSamples } from './ComponentSamples';
import { DashboardSample, CRMSample, FinanceSample } from './BusinessSamples';
import { MailSample, ChatSample } from './MessageSamples';

const pages = [
  ['system', 'Design system'],
  ['components', 'Components'],
  ['dashboard', 'Dashboard'],
  ['mail', 'Mail'],
  ['chat', 'Chat'],
  ['crm', 'CRM'],
  ['finance', 'Finance'],
] as const;

/** Owned examples only. Exact project components stay in the separate showcase. */
export function ReferenceShowcase({
  values,
  theme,
  activeCategory,
  viewport = 'fit',
  exploring = false,
}: {
  values: PreviewValues;
  theme: 'light' | 'dark';
  activeCategory?: Category;
  viewport?: 'fit' | 'tablet' | 'phone';
  exploring?: boolean;
}) {
  const [page, setPage] = useState<(typeof pages)[number][0]>('system');
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const { style, unavailable } = previewStyles(values);
  const missing = Object.values(previewSlots)
    .flat()
    .filter((slot) => !Object.hasOwn(values, slot));

  useEffect(() => {
    const scroll = container.current;
    if (!scroll) return;
    const section =
      page === 'system' && activeCategory
        ? scroll.querySelector<HTMLElement>(`[data-preview-category~="${activeCategory}"]`)
        : null;
    // Move only the preview canvas; preserve the chosen example across wizard steps.
    scroll.scrollTop =
      section && !window.matchMedia('(max-width: 800px)').matches
        ? section.getBoundingClientRect().top -
          scroll.getBoundingClientRect().top +
          scroll.scrollTop -
          24
        : 0;
  }, [page, activeCategory]);

  useEffect(() => {
    const navigation = tabs.current;
    if (!navigation) return;
    function reveal() {
      const active = navigation!.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!active) return;
      const outer = navigation!.getBoundingClientRect();
      const inner = active.getBoundingClientRect();
      if (inner.left < outer.left) navigation!.scrollLeft += inner.left - outer.left - 8;
      else if (inner.right > outer.right) navigation!.scrollLeft += inner.right - outer.right + 8;
    }
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [page]);

  return (
    <div className="reference-gallery">
      <div className="preview-pages" role="tablist" aria-label="Preview examples" ref={tabs}>
        {pages.map(([key, label], index) => (
          <button
            key={key}
            id={`${id}-${key}`}
            type="button"
            role="tab"
            aria-selected={page === key}
            aria-controls={`${id}-panel`}
            tabIndex={page === key ? 0 : -1}
            onClick={() => setPage(key)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % pages.length
                  : event.key === 'ArrowLeft'
                    ? (index - 1 + pages.length) % pages.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? pages.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              setPage(pages[next][0]);
              document.getElementById(`${id}-${pages[next][0]}`)?.focus({ preventScroll: true });
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="reference-scroll"
        ref={container}
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${page}`}
        tabIndex={0}
      >
        <div
          className="reference-canvas"
          style={
            {
              '--preview-width':
                viewport === 'tablet' ? '768px' : viewport === 'phone' ? '390px' : '100%',
            } as CSSProperties
          }
        >
          <div className="preview-example-note">
            <span>
              {exploring ? 'Custom reference theme' : 'Live reference · your selected style'}
            </span>
            <span>Sample content</span>
          </div>
          <div className={`design-sample app-sample ${theme}`} style={style}>
            {page === 'system' ? (
              <DesignSystemSample values={values} />
            ) : page === 'components' ? (
              <ComponentSamples />
            ) : page === 'dashboard' ? (
              <DashboardSample />
            ) : page === 'mail' ? (
              <MailSample />
            ) : page === 'chat' ? (
              <ChatSample />
            ) : page === 'crm' ? (
              <CRMSample />
            ) : (
              <FinanceSample />
            )}
          </div>
          <details className="reference-limits">
            <summary>About these examples &amp; preview coverage</summary>
            <p>
              These are interactive reference examples, not a render of your application. Sample
              interactions stay in this preview and reset when you switch examples.
            </p>
            {missing.length > 0 && <p>Neutral defaults: {missing.join(', ')}.</p>}
            {unavailable.length > 0 && <p>Unavailable: {unavailable.join('; ')}.</p>}
            <p>
              Connect a project showcase for exact components, fonts, states, and variants.
              References use system fonts; component choices do not replace these built-in
              specimens.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
