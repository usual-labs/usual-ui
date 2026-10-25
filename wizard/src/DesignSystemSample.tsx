import type { PreviewValues } from '../../src/onboarding-types';
import { safeColor } from './model';
import { useState } from 'react';

export function DesignSystemSample({ values }: { values: PreviewValues }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="preview-foundations">
      <section
        className="sample-foundations"
        aria-label="Color palette"
        data-preview-category="colors"
      >
        <h3>Color palette</h3>
        <div className="sample-palette">
          {(['primary', 'surface', 'onSurface', 'muted', 'border', 'focus'] as const).map(
            (slot) => (
              <div key={slot}>
                <div className="sample-color" style={{ background: `var(--sample-${slot})` }} />
                <strong>{slot}</strong>
                <code>{safeColor(values[slot] ?? '') ?? 'Default'}</code>
              </div>
            ),
          )}
        </div>
      </section>
      <section
        className="sample-foundations"
        aria-label="Typography specimens"
        data-preview-category="typography"
      >
        <h3>Typography</h3>
        <div className="sample-type-row">
          <span>Heading</span>
          <h2>The details make the system.</h2>
        </div>
        <div className="sample-type-row">
          <span>Subheading</span>
          <h4>Designed to work together</h4>
        </div>
        <div className="sample-type-row">
          <span>Body</span>
          <p>
            Choose a clear, consistent foundation for every screen. The same type, spacing, and
            colors connect each part of your product.
          </p>
        </div>
        <div className="sample-type-row">
          <span>Label / code</span>
          <div>
            <label>Project settings</label>
            <code>const design = 'intentional';</code>
          </div>
        </div>
      </section>
      <section
        className="sample-foundations"
        aria-label="Spacing and shape specimens"
        data-preview-category="spacing shape"
      >
        <h3>Spacing & shape</h3>
        <div className="sample-geometry">
          <div>
            <span>Content padding</span>
            <div className="sample-padding">
              <span>Content</span>
            </div>
          </div>
          <div>
            <span>Component gap</span>
            <div className="sample-gap">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div>
            <span>Card / control radius</span>
            <div className="sample-radius">
              <span />
              <button type="button" aria-pressed={pressed} onClick={() => setPressed(!pressed)}>
                {pressed ? 'Pressed' : 'Try control'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
