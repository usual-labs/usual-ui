import { useId, useState } from 'react';

function emailError(field: HTMLInputElement): string {
  if (field.validity.valid) return '';
  return field.validity.valueMissing
    ? 'Enter an email address to continue.'
    : 'Enter a valid email address, like alex@example.com.';
}

export function ComponentInputs() {
  const id = useId();
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(72);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <section className="sample-card component-card">
      <div className="component-card-heading">
        <span className="component-eyebrow">02 / Inputs</span>
        <h3>A place for every detail</h3>
        <p>Labels, selection, and helpful feedback.</p>
      </div>
      <label htmlFor={`${id}-name`}>Workspace name</label>
      <input id={`${id}-name`} defaultValue="Studio North" />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          const field = event.currentTarget.elements.namedItem('example-email') as HTMLInputElement;
          const valid = field.validity.valid;
          setError(emailError(field));
          setMessage(valid ? 'Email looks good. Nothing was sent.' : '');
          if (!valid) field.focus();
        }}
      >
        <label htmlFor={`${id}-email`}>Contact email</label>
        <input
          id={`${id}-email`}
          name="example-email"
          type="email"
          required
          autoComplete="off"
          placeholder="alex@example.com"
          value={email}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-email-help${error ? ` ${id}-email-error` : ''}`}
          onChange={(event) => {
            setEmail(event.target.value);
            setMessage('');
            if (submitted) setError(emailError(event.target));
          }}
        />
        <p className="component-field-help" id={`${id}-email-help`}>
          Try an incomplete address to preview validation.
        </p>
        {error && (
          <p className="component-field-error" id={`${id}-email-error`} role="alert">
            <span aria-hidden="true">!</span> {error}
          </p>
        )}
        <button type="submit" className="sample-secondary">
          Check email
        </button>
        <p className="component-footnote" role="status">
          {message}
        </p>
      </form>
      <label htmlFor={`${id}-team`}>Team</label>
      <select id={`${id}-team`} defaultValue="Design">
        <option>Design</option>
        <option>Engineering</option>
        <option>Product</option>
      </select>
      <fieldset className="component-access">
        <legend>Workspace access</legend>
        <label>
          <input type="radio" name={`${id}-access`} defaultChecked /> Private
        </label>
        <label>
          <input type="radio" name={`${id}-access`} /> Team
        </label>
      </fieldset>
      <label className="component-check">
        <input type="checkbox" defaultChecked /> Include starter templates
      </label>
      <label className="component-toggle">
        <span>Email updates</span>
        <input
          type="checkbox"
          role="switch"
          checked={notifications}
          onChange={(event) => setNotifications(event.target.checked)}
        />
      </label>
      <div className="component-range-heading">
        <label htmlFor={`${id}-volume`}>Notification volume</label>
        <output htmlFor={`${id}-volume`}>{volume}%</output>
      </div>
      <input
        id={`${id}-volume`}
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
      />
      <details className="component-control-details">
        <summary>Date &amp; more control states</summary>
        <label htmlFor={`${id}-date`}>Project start</label>
        <input
          id={`${id}-date`}
          type="date"
          defaultValue="2026-10-22"
          aria-describedby={`${id}-date-help`}
        />
        <p id={`${id}-date-help`} className="component-field-help">
          The calendar popup uses your browser’s appearance.
        </p>
        <label htmlFor={`${id}-workspace-id`}>Workspace ID · read-only</label>
        <input id={`${id}-workspace-id`} value="studio-north-01" readOnly />
        <label htmlFor={`${id}-invite`}>Invite link · disabled</label>
        <input id={`${id}-invite`} value="Available on the Pro plan" disabled />
      </details>
    </section>
  );
}
