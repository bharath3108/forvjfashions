import { useEffect, useRef, useState } from 'react';
import { getChatStatus, sendChatMessage } from '../api/index.js';
import { WHATSAPP_NUMBER } from '../config/constants.js';
import { getErrorMessage } from '../utils/errors.js';

const WELCOME =
  'Hi! I\'m the VJ Fashions assistant. Ask about products, sizes, store hours, or how to order on WhatsApp.';

const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    getChatStatus()
      .then((res) => setEnabled(res.data.enabled !== false))
      .catch(() => setEnabled(true));
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const history = nextMessages.slice(0, -1).filter((m) => m.role !== 'system');
      const res = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send message'));
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[min(100vw-2rem,380px)] bg-white rounded-2xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden max-h-[min(70vh,520px)]">
          <div className="bg-brand-500 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold text-sm">VJ Fashions Assistant</p>
              <p className="text-xs text-brand-100">Ask about products &amp; store</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-brand-600 flex items-center justify-center text-lg leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream min-h-[240px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-md'
                      : 'bg-white border border-brand-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-gray-400 animate-pulse">Typing...</p>
            )}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>
            )}
            {!enabled && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Chat is loading…
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-brand-100 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={enabled ? 'Ask about products...' : 'Loading...'}
                maxLength={500}
                disabled={!enabled || loading}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!enabled || loading || !input.trim()}
                className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-brand-600 mt-2 hover:underline"
            >
              Prefer WhatsApp? Tap here →
            </a>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition flex items-center justify-center text-2xl"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? '×' : '💬'}
      </button>
    </>
  );
}
