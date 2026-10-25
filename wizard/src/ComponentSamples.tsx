import { useId, useRef, useState } from 'react';
import { ComponentActions, ComponentConfirmation } from './ComponentOverlays';
import { ComponentInputs } from './ComponentInputs';
import { ComponentInvoices, ComponentProfile } from './ComponentData';

function ComponentFeedback() {
  const id = useId();
  const [checked, setChecked] = useState(false);
  const [notification, setNotification] = useState(false);
  const showNotification = useRef<HTMLButtonElement>(null);
  return (
    <section className="sample-card component-card">
      <div className="component-card-heading">
        <span className="component-eyebrow">04 / Feedback</span>
        <h3>Progress you can follow</h3>
        <p>A little context makes each state clearer.</p>
      </div>
      <div className="component-status-row">
        <span className="component-status">Active</span>
        <span className="component-status component-status-outline">In review</span>
        <span className="component-status component-status-muted">Draft</span>
      </div>
      <div className="component-progress-heading">
        <label htmlFor={`${id}-progress`}>Project setup</label>
        <span>{checked ? 'Complete' : '3 of 4 steps'}</span>
      </div>
      <progress id={`${id}-progress`} max="4" value={checked ? 4 : 3} />
      <div className="component-notice" role="status">
        <span className="component-notice-icon" aria-hidden="true">
          {checked ? '✓' : 'i'}
        </span>
        <div>
          <strong>{checked ? 'You’re all set' : 'Almost ready'}</strong>
          <p>
            {checked
              ? 'The example setup is complete.'
              : 'Review your preferences to finish setting up.'}
          </p>
        </div>
      </div>
      <div className="sample-actions component-button-row">
        <button type="button" className="sample-secondary" onClick={() => setChecked(!checked)}>
          {checked ? 'Reset progress' : 'Complete example'}
        </button>
        <button
          ref={showNotification}
          type="button"
          className="sample-secondary"
          onClick={() => setNotification(true)}
        >
          Show notification
        </button>
      </div>
      {notification && (
        <div className="component-toast" role="status">
          <span>
            <strong>Preferences saved</strong>
            <span>Saved in this preview only.</span>
          </span>
          <button
            type="button"
            className="sample-secondary"
            aria-label="Dismiss example notification"
            onClick={() => {
              setNotification(false);
              showNotification.current?.focus();
            }}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

/** Interactive specimens; every action stays within this reference preview. */
export function ComponentSamples() {
  return (
    <div className="component-samples" data-preview-category="components">
      <ComponentActions />
      <ComponentInputs />
      <ComponentProfile />
      <ComponentFeedback />
      <ComponentInvoices />
      <ComponentConfirmation />
    </div>
  );
}
