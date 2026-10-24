import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, AlertTriangle, Bot, User, Loader2, ShieldAlert } from 'lucide-react';
import type { DisasterEvent } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  notice?: string;
  pending?: boolean;
}

const SUGGESTED = [
  'Summarize recent significant earthquakes',
  'What should I do during a tsunami warning?',
  'Explain the difference between a watch and a warning',
  'How do I prepare for wildfire season?',
];

interface AIAnalystProps {
  contextEvents?: DisasterEvent[];
  injectedQuestion?: { text: string; key: number } | null;
}

export default function AIAnalyst({ contextEvents = [], injectedQuestion }: AIAnalystProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (injectedQuestion) {
      setInput(injectedQuestion.text);
      void send(injectedQuestion.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedQuestion?.key]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);

    const pendingId = Date.now();
    setMessages((m) => [...m, { role: 'assistant', content: '', pending: true }]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'AI analyst backend is not configured. The dashboard and live feeds still work — only the AI chat requires a backend connection.'
        );
      }
      const url = `${supabaseUrl}/functions/v1/ai-analyst`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          question: q,
          contextEvents: contextEvents.slice(0, 15),
        }),
      });

      if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody?.error) detail = errBody.error;
        } catch {
          // response wasn't JSON
        }
        throw new Error(detail);
      }
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1
            ? { role: 'assistant', content: data.answer ?? 'No response.', notice: data.notice, pending: false }
            : msg
        )
      );
    } catch (err) {
      setMessages((m) => m.filter((_, i) => i !== m.length - 1));
      const msg = err instanceof Error ? err.message : 'Failed to reach AI analyst';
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Could not reach the AI analyst service. The dashboard and live feeds are still available.'
          : msg
      );
    } finally {
      setLoading(false);
      void pendingId;
    }
  }

  return (
    <section id="ai-analyst" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-8 lg:grid-cols-[1fr_1.4fr]"
        >
          {/* Left: description */}
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-emerald/70">03 · ANALYST</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
              AI Disaster Analyst
            </h2>
            <p className="mt-4 text-mint/60">
              Ask questions about any natural disaster. The analyst grounds every answer in
              verified feed data, cites sources and timestamps, and explains uncertainty —
              never presenting predictions as certainty.
            </p>

            <div className="mt-6 space-y-3">
              <FeatureRow icon={<Sparkles className="h-4 w-4 text-emerald" />} text="Grounded in live USGS & NASA EONET data" />
              <FeatureRow icon={<ShieldAlert className="h-4 w-4 text-ocean-light" />} text="Prioritizes official authorities for emergencies" />
              <FeatureRow icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} text="Labels uncertainty and never claims certainty" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-mint/70 transition-colors hover:border-emerald/30 hover:text-mint disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: chat */}
          <div className="glass-dark flex h-[520px] flex-col rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
              <Bot className="h-4 w-4 text-emerald" />
              <span className="font-mono text-xs tracking-widest text-mint/60">AI ANALYST</span>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-1 font-mono text-[10px] text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-soft" />
                GROUNDED
              </span>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Bot className="mb-3 h-10 w-10 text-emerald/40" />
                  <p className="text-sm text-mint/50">Ask about any disaster or preparedness topic.</p>
                  <p className="mt-1 text-xs text-mint/35">Answers are grounded in verified feed data.</p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        m.role === 'user' ? 'bg-ocean/15' : 'bg-emerald/15'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <User className="h-4 w-4 text-ocean-light" />
                      ) : (
                        <Bot className="h-4 w-4 text-emerald" />
                      )}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-ocean/15 text-mint/90'
                          : 'glass text-mint/85'
                      }`}
                    >
                      {m.pending ? (
                        <span className="flex items-center gap-2 text-mint/50">
                          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing verified data…
                        </span>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                      {m.notice && (
                        <p className="mt-2 border-t border-white/8 pt-2 text-[11px] text-mint/40">
                          {m.notice}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {error && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-200">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-white/5 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI analyst…"
                  className="flex-1 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-mint placeholder:text-mint/35 focus:border-emerald/40 focus:outline-none focus:ring-1 focus:ring-emerald/30"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-ocean text-midnight transition-transform hover:scale-105 disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-mint/70">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg glass">{icon}</span>
      {text}
    </div>
  );
}
