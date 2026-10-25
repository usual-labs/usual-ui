import { useRef, useState } from 'react';

export function PreviewExport({ css, request }: { css: string; request: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  const [format, setFormat] = useState<'request' | 'css'>('request');
  const [feedback, setFeedback] = useState('');
  const content = format === 'request' ? request : css;
  return (
    <>
      <button
        className="secondary"
        type="button"
        onClick={() => {
          setFeedback('');
          dialog.current?.showModal();
        }}
      >
        Export theme
      </button>
      <dialog className="preview-export" ref={dialog} aria-labelledby="preview-export-title">
        <header>
          <div>
            <p className="eyebrow">Take the next step</p>
            <h2 id="preview-export-title">Your theme, ready to share</h2>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => dialog.current?.close()}
            aria-label="Close theme export"
          >
            Close
          </button>
        </header>
        <p>
          Give the change request to your agent to turn these ideas into source-backed options. Your
          contract still goes through the normal review.
        </p>
        <div className="preview-export-formats" role="group" aria-label="Theme export format">
          {(['request', 'css'] as const).map((value) => (
            <button
              key={value}
              className="secondary"
              type="button"
              aria-pressed={format === value}
              onClick={() => {
                setFormat(value);
                setFeedback('');
              }}
            >
              {value === 'request' ? 'Agent change request' : 'Reference CSS'}
            </button>
          ))}
        </div>
        <label htmlFor="preview-export-text">
          {format === 'request' ? 'Change request' : 'Reference CSS variables'}
        </label>
        <textarea id="preview-export-text" ref={text} readOnly value={content} spellCheck={false} />
        {format === 'css' && (
          <p className="preview-export-note">
            These variables style the reference examples. Map them to your project’s tokens before
            use.
          </p>
        )}
        <footer>
          <span role="status">{feedback}</span>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  await navigator.clipboard.writeText(content);
                  setFeedback('Copied to clipboard.');
                } catch {
                  text.current?.focus();
                  text.current?.select();
                  setFeedback('Copy is unavailable here. The text is selected for manual copying.');
                }
              })();
            }}
          >
            Copy {format === 'request' ? 'request' : 'CSS'}
          </button>
        </footer>
      </dialog>
    </>
  );
}
