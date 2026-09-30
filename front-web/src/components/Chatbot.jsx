import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageSquare, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from './markdownComponents';
import { BASE_URL } from '../data/constants';

const GREETING = {
  role: 'assistant',
  content:
    "Hi there 👋 I'm Yohanes' assistant. Ask about his background, the projects he has built, his skills, or how to get in touch.",
};

const QUICK_QUESTIONS = [
  'Who is Yohanes Debebe?',
  'What are his core backend skills?',
  'Tell me about the Yope AI project.',
  'How can I contact Yohanes?',
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([GREETING]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    // Move focus into the composer so keyboard users can start typing.
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const node = messagesEndRef.current;
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    // Return focus to the control that opened the panel.
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    if (!textToSend) setInput('');

    const nextMessages = [...messages, { role: 'user', content: query }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I can't reach the assistant service right now. You can still reach Yohanes directly at **yopeman318@gmail.com**.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 sm:p-6">
      {!isOpen && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open the site assistant"
          aria-expanded={false}
          className="btn-primary btn-round pointer-events-auto h-14 w-14 shadow-2xl shadow-indigo-600/30"
        >
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Site assistant"
          className="chat-window-enter pointer-events-auto flex h-[min(34rem,calc(100dvh-7rem))] w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl sm:w-[24rem] dark:border-slate-800 dark:bg-slate-900/90 night:border-purple-900/30 night:bg-black/90"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold">Yope Assistant</h2>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close the assistant"
              className="focus-ring rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex max-w-[88%] gap-2.5 ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                style={{ animation: 'staggerSlideIn 0.3s ease-out forwards' }}
              >
                {message.role !== 'user' && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-violet-500/15 dark:text-violet-300">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                      : 'rounded-tl-sm border border-slate-200/70 bg-white text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-line">{message.content}</p>
                  ) : (
                    <div className="text-sm">
                      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex max-w-[80%] gap-2.5" style={{ animation: 'staggerSlideIn 0.3s ease-out forwards' }}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200/70 bg-white px-3.5 py-3.5 dark:border-slate-700/60 dark:bg-slate-800/80">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="sr-only">The assistant is typing…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="shrink-0 border-t border-slate-200/70 px-4 py-3 dark:border-slate-800/70">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSend(question)}
                    className="chip hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex shrink-0 items-center gap-2 border-t border-slate-200/70 p-3 dark:border-slate-800/70"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message the assistant
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              placeholder="Ask about Yohanes…"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/12 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="btn-primary btn-icon shrink-0 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
