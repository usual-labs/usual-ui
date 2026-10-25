import { useState } from 'react';
import { Button } from './Button';
import { CodeBlock } from './CodeBlock';
import {
  designExamples,
  specimenDocument,
  type DesignExample,
  type SpecimenTheme,
} from './design-examples';

export function ExampleComparison({
  example,
  theme,
  compact,
}: {
  example: DesignExample;
  theme: SpecimenTheme;
  compact: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {(['before', 'after'] as const).map((side) => (
          <div key={side} className="min-w-0">
            <h3 className="mb-4 text-lg font-medium">
              {side === 'before' ? 'Before' : 'Approved repair'}
            </h3>
            <div className="mb-4 overflow-hidden rounded-panel border border-line bg-paper">
              <iframe
                title={`${example.title}: ${side === 'before' ? 'before' : 'approved repair'}, ${theme} specimen`}
                sandbox=""
                srcDoc={specimenDocument(example, side, theme)}
                width="100%"
                height="260"
                frameBorder="0"
                className={compact ? 'mx-auto block max-w-sm' : 'mx-auto block max-w-2xl'}
              />
            </div>
            <CodeBlock
              label={side === 'before' ? 'Illustrative violation' : 'Approved source repair'}
              code={example[side]}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-panel border border-line bg-soft p-5">
        <h3 className="text-sm font-semibold">Illustrative diagnostic</h3>
        <ul className="mt-3 space-y-3 text-sm">
          {example.diagnostics.map((diagnostic) => (
            <li key={diagnostic.rule}>
              <code className="font-mono text-accent">{diagnostic.rule}</code>
              {' — '}
              {diagnostic.message}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{example.policy}</p>
      </div>
      <p className="mt-5 max-w-3xl leading-relaxed text-muted" aria-live="polite">
        {example.explanation}
      </p>
    </>
  );
}

export function DesignExamples() {
  const [selected, setSelected] = useState(0);
  const [theme, setTheme] = useState<SpecimenTheme>('light');
  const [compact, setCompact] = useState(false);
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Example categories">
        {designExamples.map((example, index) => (
          <Button
            key={example.title}
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
          >
            {example.title}
            {selected === index ? ' ✓' : ''}
          </Button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Specimen theme">
          <span className="text-sm text-muted">Preview theme</span>
          <Button onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
            Light
          </Button>
          <Button onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>
            Dark
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Specimen width">
          <span className="text-sm text-muted">Preview width</span>
          <Button onClick={() => setCompact(true)} aria-pressed={compact}>
            Compact
          </Button>
          <Button onClick={() => setCompact(false)} aria-pressed={!compact}>
            Fluid
          </Button>
        </div>
      </div>
      <ExampleComparison example={designExamples[selected]} theme={theme} compact={compact} />
      <p className="mt-3 text-sm text-muted">
        These static specimens and diagnostics illustrate a sample policy; they are not a live
        audit. Theme and width controls change only the previews. Compact caps the preview at 384px;
        both widths fit the available space. The CLI checks your actual source and manifest.
      </p>
    </>
  );
}
