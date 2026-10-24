import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radio, CircleAlert } from 'lucide-react';
import type { AggregatedResult } from '@/data/providers';
import { formatRelativeTime } from '@/lib/utils';
import { HAZARD_MAP } from '@/types';

export default function EventTicker({ data }: { data: AggregatedResult | null }) {
  const items = useMemo(() => {
    if (!data) return [];
    return data.events.slice(0, 12);
  }, [data]);

  const status = data
    ? data.usedDemo
      ? { label: 'DEMO DATA', live: false }
      : data.allLive
        ? { label: 'LIVE', live: true }
        : data.anyLive
          ? { label: 'PARTIAL FEED', live: true }
          : { label: 'OFFLINE', live: false }
    : { label: 'CONNECTING', live: false };

  return (
    <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-dark overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
          <span className="flex items-center gap-2">
            {status.live ? (
              <Radio className="h-4 w-4 animate-pulse-soft text-emerald" />
            ) : (
              <CircleAlert className="h-4 w-4 text-amber-400" />
            )}
            <span className="font-mono text-xs tracking-widest text-mint/70">
              GLOBAL EVENT FEED
            </span>
          </span>
          <span
            className={`ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider ${
              status.live
                ? 'bg-emerald/10 text-emerald'
                : 'bg-amber-400/10 text-amber-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status.live ? 'bg-emerald animate-pulse-soft' : 'bg-amber-400'
              }`}
            />
            {status.label}
          </span>
        </div>

        <div className="relative flex overflow-hidden">
          <div className="flex shrink-0 animate-[scroll_45s_linear_infinite] gap-3 px-5 py-4">
            {[...items, ...items].map((e, i) => {
              const meta = HAZARD_MAP[e.category];
              return (
                <div
                  key={`${e.id}-${i}`}
                  className="flex shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                  />
                  <span className="text-sm text-mint/90">{e.title}</span>
                  <span className="font-mono text-[11px] text-mint/40">
                    {formatRelativeTime(e.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
