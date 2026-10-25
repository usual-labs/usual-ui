import { useId, useRef, useState } from 'react';

export function ComponentActions() {
  const id = useId();
  const [message, setMessage] = useState('Try an action or open the menu.');
  const [created, setCreated] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);

  return (
    <section className="sample-card component-card">
      <div className="component-card-heading">
        <span className="component-eyebrow">01 / Actions</span>
        <h3>Every state, considered</h3>
        <p>Clear emphasis for the next step.</p>
      </div>
      <div className="sample-actions component-button-row">
        <button
          type="button"
          onClick={() => {
            setCreated(true);
            setMessage('Example project created in this preview.');
          }}
        >
          {created ? 'Created ✓' : 'Create project'}
        </button>
        <button
          ref={more}
          type="button"
          className="sample-secondary component-menu-trigger"
          popoverTarget={`${id}-actions`}
        >
          More actions
        </button>
        <div
          className="component-tooltip-anchor"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) setTooltipOpen(false);
          }}
        >
          <button
            type="button"
            className="sample-secondary component-help"
            aria-label="About preview actions"
            aria-describedby={`${id}-help`}
            onFocus={() => setTooltipOpen(true)}
            onBlur={() => setTooltipOpen(false)}
            onClick={() => setTooltipOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && tooltipOpen) {
                event.preventDefault();
                setTooltipOpen(false);
              }
            }}
          >
            ?
          </button>
          <span id={`${id}-help`} role="tooltip" hidden={!tooltipOpen}>
            These actions change this example only. Your project stays unchanged.
          </span>
        </div>
      </div>
      <div
        ref={popover}
        id={`${id}-actions`}
        popover="auto"
        role="group"
        className="component-popover"
        aria-label="Example project actions"
        onToggle={(event) => {
          if (event.newState === 'open') event.currentTarget.querySelector('button')?.focus();
        }}
      >
        <strong>Project actions</strong>
        <p>Try a local menu action.</p>
        {['Duplicate project', 'Pin to favorites'].map((label) => (
          <button
            type="button"
            className="sample-secondary"
            key={label}
            onClick={() => {
              setMessage(
                label === 'Duplicate project'
                  ? 'A copy was added to this preview.'
                  : 'Project pinned in this preview.',
              );
              popover.current?.hidePopover();
              more.current?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="sample-actions component-button-row">
        <button type="button" disabled>
          Unavailable
        </button>
        <button type="button" className="sample-secondary component-loading" disabled>
          <span className="component-spinner" aria-hidden="true" />
          Loading
        </button>
      </div>
      <p className="component-footnote" role="status">
        {message}
      </p>
    </section>
  );
}

export function ComponentConfirmation() {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [archived, setArchived] = useState(false);
  const [message, setMessage] = useState('Open the dialog to try a confirmation.');

  return (
    <section className="sample-card component-card component-confirmation">
      <span className="component-eyebrow">06 / Confirmation</span>
      <div className="component-confirmation-icon" aria-hidden="true">
        {archived ? '✓' : '↗'}
      </div>
      <h3>{archived ? 'Workspace archived' : 'A moment to be sure'}</h3>
      <p>
        {archived
          ? 'You can bring it back whenever you need it.'
          : 'A focused dialog gives important decisions room to breathe.'}
      </p>
      <div className="sample-actions">
        <button
          ref={trigger}
          type="button"
          onClick={() => {
            if (archived) {
              setArchived(false);
              setMessage('Workspace restored in this preview.');
            } else {
              if (!dialog.current) return;
              dialog.current.returnValue = '';
              dialog.current.showModal();
              cancel.current?.focus();
            }
          }}
        >
          {archived ? 'Restore workspace' : 'Archive workspace'}
        </button>
      </div>
      <p className="component-footnote" role="status">
        {message}
      </p>
      <dialog
        ref={dialog}
        className="component-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onCancel={() => {
          if (dialog.current) dialog.current.returnValue = 'cancel';
        }}
        onClose={() => {
          const confirmed = dialog.current?.returnValue === 'confirmed';
          setArchived(confirmed);
          setMessage(
            confirmed
              ? 'Archived in this preview only.'
              : 'Cancelled. Your example workspace is unchanged.',
          );
          trigger.current?.focus();
        }}
      >
        <span className="component-eyebrow">Example workspace</span>
        <h3 id={`${id}-title`}>Archive this workspace?</h3>
        <p id={`${id}-description`}>
          Your work stays safe. This example changes only the preview, and you can restore it at any
          time.
        </p>
        <div className="sample-actions">
          <button
            ref={cancel}
            type="button"
            className="sample-secondary"
            onClick={() => dialog.current?.close('cancel')}
          >
            Cancel
          </button>
          <button type="button" onClick={() => dialog.current?.close('confirmed')}>
            Confirm archive
          </button>
        </div>
      </dialog>
    </section>
  );
}
