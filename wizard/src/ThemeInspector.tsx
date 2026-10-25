import { useEffect, useId, useState } from 'react';
import { previewSlots, type PreviewSlot, type PreviewValues } from '../../src/onboarding-types';
import type { Category } from '../../src/types';
import {
  effectivePreview,
  previewFontFamilies,
  previewSlotLabels,
  validPreviewValue,
} from './preview-theme';

interface FieldProps {
  slot: PreviewSlot;
  value?: string;
  changed: boolean;
  disabled: boolean;
  onChange: (slot: PreviewSlot, value: string) => void;
}

function ColorField({ slot, value, changed, disabled, onChange }: FieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value ?? '');
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    setDraft(value ?? '');
    setTouched(false);
  }, [value]);
  const valid = validPreviewValue(slot, draft);
  const hex = /^#[\da-f]{6}$/i.test(value ?? '')
    ? value
    : /^#[\da-f]{3}$/i.test(value ?? '')
      ? `#${value!
          .slice(1)
          .split('')
          .map((part) => part + part)
          .join('')}`
      : null;
  return (
    <div className="theme-token-field" data-changed={changed}>
      <label htmlFor={id}>
        {previewSlotLabels[slot]}
        {changed && <span className="theme-adjusted-dot" aria-label="Adjusted" />}
      </label>
      <div className="theme-color-control">
        <span className="theme-color-swatch" style={value ? { background: value } : undefined}>
          {hex && (
            <input
              type="color"
              value={hex}
              disabled={disabled}
              aria-label={`Choose ${previewSlotLabels[slot].toLowerCase()} color`}
              onChange={(event) => onChange(slot, event.target.value)}
            />
          )}
        </span>
        <input
          id={id}
          type="text"
          value={draft}
          placeholder="Not proposed"
          disabled={disabled}
          spellCheck={false}
          aria-invalid={(touched && !valid) || undefined}
          aria-describedby={touched && !valid ? `${id}-error` : undefined}
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (validPreviewValue(slot, next)) onChange(slot, next);
          }}
        />
      </div>
      {touched && !valid && !disabled && (
        <span className="theme-field-error" id={`${id}-error`}>
          Use a color such as #2563eb or rgb(37 99 235).
        </span>
      )}
    </div>
  );
}

function lengthNumber(value: string | undefined): string {
  if (!value) return '';
  const match = /^(\d+(?:\.\d+)?)(px|rem|em)?$/.exec(value);
  if (!match) return '';
  return String(Number(match[1]));
}

function NumberField({ slot, value, changed, disabled, onChange }: FieldProps) {
  const id = useId();
  const unitless = slot === 'lineHeight';
  const unit = unitless ? '' : (/(px|rem|em)$/.exec(value ?? '')?.[1] ?? 'px');
  const relative = unit === 'rem' || unit === 'em';
  const min = unitless ? 1 : 0;
  const max = unitless ? 2 : (slot === 'headingSize' ? 64 : 48) / (relative ? 16 : 1);
  const step = unitless ? 0.05 : relative ? 0.05 : 1;
  const display = lengthNumber(value);
  const [draft, setDraft] = useState(display);
  useEffect(() => setDraft(display), [display, unit]);
  function change(next: string) {
    setDraft(next);
    if (!next || !Number.isFinite(Number(next))) return;
    const formatted = `${Number(next)}${unit}`;
    if (validPreviewValue(slot, formatted)) onChange(slot, formatted);
  }
  return (
    <div className="theme-token-field" data-changed={changed}>
      <div className="theme-number-heading">
        <label htmlFor={id}>
          {previewSlotLabels[slot]}
          {changed && <span className="theme-adjusted-dot" aria-label="Adjusted" />}
        </label>
        <div className="theme-number-value">
          <input
            id={id}
            type="number"
            value={draft}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            placeholder="—"
            aria-describedby={!unitless ? `${id}-unit` : undefined}
            onChange={(event) => change(event.target.value)}
            onBlur={() => setDraft(display)}
          />
          {!unitless && <span id={`${id}-unit`}>{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={display || min}
        disabled={disabled}
        aria-label={`${previewSlotLabels[slot]} slider`}
        aria-valuetext={display ? `${display}${unit}` : undefined}
        onChange={(event) => change(event.target.value)}
      />
    </div>
  );
}

const sections = [
  ['colors', 'Colors', 'A clear role for each color.'],
  ['typography', 'Typography', 'Find the right scale and rhythm.'],
  ['spacing', 'Spacing', 'Give your content room to breathe.'],
  ['shape', 'Corners', 'Fine-tune cards and controls.'],
] as const;

export function ThemeInspector({
  values,
  overrides,
  deferred,
  onChange,
  onReset,
}: {
  values: PreviewValues;
  overrides: PreviewValues;
  deferred: readonly Category[];
  onChange: (slot: PreviewSlot, value: string) => void;
  onReset: () => void;
}) {
  const id = useId();
  const effective = effectivePreview(values, overrides, deferred);
  const count = Object.keys(effective).filter(
    (slot) => effective[slot as PreviewSlot] !== values[slot as PreviewSlot],
  ).length;
  return (
    <aside className="theme-inspector" aria-label="Explore theme">
      <header className="theme-inspector-header">
        <div>
          <span className="theme-inspector-eyebrow">Live exploration</span>
          <h3>Make it feel like you</h3>
        </div>
        <button className="secondary small" type="button" disabled={!count} onClick={onReset}>
          Reset
        </button>
      </header>
      <p className="theme-inspector-intro">
        Try the details across every example. Your proposed choices stay intact.
      </p>
      <div className="theme-inspector-status" role="status">
        {count
          ? `${count} ${count === 1 ? 'adjustment' : 'adjustments'} · Preview only`
          : 'Starting from your selected choices'}
      </div>
      <div className="theme-inspector-fields">
        {sections.map(([category, title, description]) => {
          const inactive = deferred.includes(category);
          const slots = previewSlots[category];
          const unavailable = slots.filter(
            (slot) => !values[slot] || !validPreviewValue(slot, values[slot]),
          );
          return (
            <details
              key={category}
              className="theme-inspector-section"
              open={category === 'colors'}
            >
              <summary>
                <span>{title}</span>
                <span>
                  {inactive ? 'Deferred' : `${slots.length - unavailable.length} values`}
                  <span className="theme-section-chevron" aria-hidden="true">
                    ⌄
                  </span>
                </span>
              </summary>
              <p>
                {inactive
                  ? 'This category is deferred. Include it in your proposal choices to explore it.'
                  : description}
              </p>
              <fieldset disabled={inactive} aria-label={`Explore ${title.toLowerCase()}`}>
                {slots.map((slot) => {
                  const supported = !!values[slot] && validPreviewValue(slot, values[slot]);
                  const field = {
                    slot,
                    value: effective[slot],
                    changed: !inactive && supported && effective[slot] !== values[slot],
                    disabled: inactive || !supported,
                    onChange,
                  };
                  return (
                    <div key={slot}>
                      {category === 'colors' ? (
                        <ColorField {...field} />
                      ) : slot === 'fontFamily' ? (
                        <div className="theme-token-field" data-changed={field.changed}>
                          <label htmlFor={`${id}-font`}>
                            Font family
                            {field.changed && (
                              <span className="theme-adjusted-dot" aria-label="Adjusted" />
                            )}
                          </label>
                          <select
                            id={`${id}-font`}
                            value={effective.fontFamily ?? ''}
                            disabled={field.disabled}
                            onChange={(event) => onChange('fontFamily', event.target.value)}
                          >
                            <option value="" disabled>
                              Not available in this preview
                            </option>
                            {previewFontFamilies.map((font) => (
                              <option key={font} value={font}>
                                {font === 'system-ui'
                                  ? 'System'
                                  : font === 'sans-serif'
                                    ? 'Sans serif'
                                    : font === 'serif'
                                      ? 'Serif'
                                      : 'Monospace'}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <NumberField {...field} />
                      )}
                      {!inactive && !supported && (
                        <p className="theme-value-unavailable">
                          {values[slot]
                            ? 'This value needs the project showcase.'
                            : 'No value proposed for this theme.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </fieldset>
            </details>
          );
        })}
      </div>
      <p className="theme-inspector-footnote">
        Explorations stay in this preview. Copy a change request when you find a direction you like.
      </p>
    </aside>
  );
}
