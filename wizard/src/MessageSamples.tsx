import { useId, useState } from 'react';

const inbox = [
  {
    id: 'launch',
    name: 'Maya Chen',
    initials: 'MC',
    subject: 'A few finishing touches',
    preview: 'The new workspace is looking great. One small idea…',
    time: '10:42',
    unread: true,
    paragraphs: [
      'Hi Alex,',
      'The new workspace is looking great. The quieter colors give the content a little more room, and the new cards feel much easier to scan.',
      'One small idea before we wrap up: could we try the same spacing in the inbox? It would be nice for every part of the product to feel connected.',
      'Thanks for all the thoughtful details!',
    ],
  },
  {
    id: 'notes',
    name: 'Oliver Park',
    initials: 'OP',
    subject: 'Notes from our design review',
    preview: 'A quick recap of the decisions we made together.',
    time: '09:18',
    unread: true,
    paragraphs: [
      'Hey Alex,',
      'A quick recap of our review: keep the navigation simple, give important actions one clear place, and use the same type scale across each screen.',
      'I added a few examples to the shared workspace. Let’s pick up the remaining details in our next session.',
    ],
  },
  {
    id: 'welcome',
    name: 'Sam Rivera',
    initials: 'SR',
    subject: 'Welcome to the team',
    preview: 'Here is everything you need for your first week.',
    time: 'Yesterday',
    unread: false,
    paragraphs: [
      'Welcome, Alex!',
      'We’re happy to have you here. Your first week is about meeting the team, exploring the workspace, and asking as many questions as you like.',
      'There’s a short introduction in the team channel whenever you’re ready. Make yourself at home.',
    ],
  },
  {
    id: 'research',
    name: 'Nora Ellis',
    initials: 'NE',
    subject: 'What we learned this week',
    preview: 'People noticed the small improvements to everyday tasks.',
    time: 'Monday',
    unread: false,
    paragraphs: [
      'Hi team,',
      'People noticed the small improvements to everyday tasks. Clear labels and predictable layouts made a bigger difference than adding more options.',
      'I’ll bring a few examples to our next review. Thanks for helping us make the experience a little better every week.',
    ],
  },
];

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="message-avatar" aria-hidden="true">
      {initials}
    </span>
  );
}

export function MailSample() {
  const id = useId();
  const [selectedId, setSelectedId] = useState(inbox[0].id);
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState('');
  const matches = inbox.filter((message) =>
    `${message.name} ${message.subject} ${message.preview}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  const selected = matches.find((message) => message.id === selectedId) ?? matches[0];
  const draft = selected ? (drafts[selected.id] ?? '') : '';

  return (
    <section className="message-page" aria-label="Mail example">
      <header className="message-page-heading">
        <div>
          <span className="message-eyebrow">Workspace / Mail</span>
          <h2>
            Inbox <span className="message-count">2 new</span>
          </h2>
        </div>
        <span className="message-demo-note">Demo inbox · nothing is sent</span>
      </header>
      <div className="message-mail-layout">
        <aside className="message-inbox" aria-label="Example inbox">
          <div className="message-search">
            <label htmlFor={`${id}-search`}>Search inbox</label>
            <input
              id={`${id}-search`}
              type="search"
              placeholder="Search messages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="message-list">
            {matches.map((message) => (
              <button
                key={message.id}
                type="button"
                className="message-list-item"
                aria-pressed={selected?.id === message.id}
                onClick={() => {
                  setSelectedId(message.id);
                  setStatus('');
                }}
              >
                <span className="message-list-person">
                  <Avatar initials={message.initials} />
                  <strong>{message.name}</strong>
                  <span className="message-time">{message.time}</span>
                </span>
                <span className="message-list-subject">
                  {message.unread && <span className="message-unread" aria-label="Unread" />}
                  {message.subject}
                </span>
                <span className="message-snippet">{message.preview}</span>
              </button>
            ))}
            {matches.length === 0 && (
              <p className="message-empty" role="status">
                No messages match your search.
              </p>
            )}
          </div>
        </aside>
        {selected ? (
          <article className="message-reading" aria-label={`Message from ${selected.name}`}>
            <header className="message-reading-heading">
              <span className="message-eyebrow">Team conversation</span>
              <h3>{selected.subject}</h3>
              <div className="message-sender">
                <Avatar initials={selected.initials} />
                <div>
                  <strong>{selected.name}</strong>
                  <span>To you · {selected.time}</span>
                </div>
              </div>
            </header>
            <div className="message-letter">
              {selected.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="message-signature">{selected.name.split(' ')[0]}</p>
            </div>
            {(replies[selected.id] ?? []).map((reply, index) => (
              <div className="message-saved-reply" key={`${selected.id}-${index}`}>
                <strong>Your demo reply</strong>
                <p>{reply}</p>
              </div>
            ))}
            <form
              className="message-composer"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) return;
                setReplies((current) => ({
                  ...current,
                  [selected.id]: [...(current[selected.id] ?? []), draft.trim()],
                }));
                setDrafts((current) => ({ ...current, [selected.id]: '' }));
                setStatus('Reply added to this example. Nothing was sent.');
              }}
            >
              <label htmlFor={`${id}-reply`}>Reply to {selected.name.split(' ')[0]}</label>
              <textarea
                id={`${id}-reply`}
                rows={3}
                maxLength={1000}
                placeholder="Write a demo reply…"
                value={draft}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [selected.id]: event.target.value }))
                }
              />
              <div className="message-composer-footer">
                <span>Demo only · nothing is sent</span>
                <button type="submit" disabled={!draft.trim()}>
                  Add demo reply
                </button>
              </div>
              <p className="message-feedback" role="status">
                {status}
              </p>
            </form>
          </article>
        ) : (
          <div className="message-reading message-empty">
            Try another name or subject to find a conversation.
          </div>
        )}
      </div>
    </section>
  );
}

interface ChatMessage {
  name: string;
  initials: string;
  text: string;
  time: string;
  own?: boolean;
}

const channels = [
  {
    id: 'design-team',
    label: 'design-team',
    description: 'A space for the details that make a difference.',
    members: '4 members',
    messages: [
      {
        name: 'Maya',
        initials: 'MC',
        text: 'The latest preview is ready. I’m liking how the same colors work across the dashboard and inbox.',
        time: '10:32',
      },
      {
        name: 'Alex',
        initials: 'AL',
        text: 'Agreed. The softer surfaces make the important actions stand out.',
        time: '10:34',
        own: true,
      },
      {
        name: 'Oliver',
        initials: 'OP',
        text: 'Nice! Let’s check the compact layout too. Those small details add up.',
        time: '10:35',
      },
    ],
  },
  {
    id: 'product',
    label: 'product',
    description: 'Ideas, feedback, and the next small improvement.',
    members: '6 members',
    messages: [
      {
        name: 'Nora',
        initials: 'NE',
        text: 'A useful takeaway from this week: people want fewer steps between finding something and getting it done.',
        time: '09:12',
      },
      {
        name: 'Sam',
        initials: 'SR',
        text: 'That fits our next iteration. Clearer labels first, then a quieter navigation.',
        time: '09:15',
      },
    ],
  },
  {
    id: 'engineering',
    label: 'engineering',
    description: 'Building a consistent foundation, together.',
    members: '5 members',
    messages: [
      {
        name: 'Oliver',
        initials: 'OP',
        text: 'The shared tokens are ready for review. Spacing and shape now follow the same choices in every example.',
        time: 'Yesterday',
      },
      {
        name: 'Maya',
        initials: 'MC',
        text: 'Great. I’ll take another look at the light and dark versions this afternoon.',
        time: 'Yesterday',
      },
    ],
  },
] satisfies {
  id: string;
  label: string;
  description: string;
  members: string;
  messages: ChatMessage[];
}[];

export function ChatSample() {
  const id = useId();
  const [channelId, setChannelId] = useState(channels[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [additions, setAdditions] = useState<Record<string, ChatMessage[]>>({});
  const [status, setStatus] = useState('');
  const channel = channels.find((item) => item.id === channelId)!;
  const draft = drafts[channelId] ?? '';
  const messages: ChatMessage[] = [...channel.messages, ...(additions[channelId] ?? [])];

  return (
    <section className="message-page" aria-label="Chat example">
      <header className="message-page-heading">
        <div>
          <span className="message-eyebrow">Workspace / Team</span>
          <h2>Conversations</h2>
        </div>
        <span className="message-demo-note">A little room for teamwork</span>
      </header>
      <div className="message-chat-layout">
        <aside className="message-channels" aria-label="Example channels">
          <div className="message-team-name">
            <span className="message-workspace-mark" aria-hidden="true">
              S
            </span>
            <div>
              <strong>Studio workspace</strong>
              <span>Example team</span>
            </div>
          </div>
          <h3>Channels</h3>
          <div className="message-channel-list">
            {channels.map((item) => (
              <button
                key={item.id}
                type="button"
                className="message-channel"
                aria-pressed={item.id === channelId}
                onClick={() => {
                  setChannelId(item.id);
                  setStatus('');
                }}
              >
                <span aria-hidden="true">#</span> {item.label}
              </button>
            ))}
          </div>
          <div className="message-team-note">
            <span className="message-availability" aria-hidden="true" /> A shared space for good
            work.
          </div>
        </aside>
        <div className="message-thread">
          <header className="message-thread-heading">
            <div>
              <h3>
                <span aria-hidden="true">#</span> {channel.label}
              </h3>
              <p>{channel.description}</p>
            </div>
            <span className="message-member-count">{channel.members}</span>
          </header>
          <div
            className="message-chat-history"
            role="log"
            aria-label={`Example messages in ${channel.label}`}
          >
            <div className="message-day">
              <span>Today in this example</span>
            </div>
            {messages.map((message, index) => (
              <div
                className={`message-chat-row${message.own ? ' message-chat-own' : ''}`}
                key={`${channelId}-${index}`}
              >
                <Avatar initials={message.initials} />
                <div className="message-chat-content">
                  <div className="message-chat-byline">
                    <strong>{message.name}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p className="message-bubble">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            className="message-composer message-chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setAdditions((current) => ({
                ...current,
                [channelId]: [
                  ...(current[channelId] ?? []),
                  { name: 'Alex', initials: 'AL', text: draft.trim(), time: 'Now', own: true },
                ],
              }));
              setDrafts((current) => ({ ...current, [channelId]: '' }));
              setStatus(`Message added to the ${channel.label} example. Nothing was sent.`);
            }}
          >
            <label htmlFor={`${id}-message`}>Message #{channel.label}</label>
            <textarea
              id={`${id}-message`}
              rows={2}
              maxLength={1000}
              placeholder="Add a thought to this example…"
              value={draft}
              onChange={(event) =>
                setDrafts((current) => ({ ...current, [channelId]: event.target.value }))
              }
            />
            <div className="message-composer-footer">
              <span>Demo only · nothing is sent</span>
              <button type="submit" disabled={!draft.trim()}>
                Add demo message
              </button>
            </div>
            <p className="message-feedback" role="status">
              {status}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
