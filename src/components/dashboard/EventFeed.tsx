import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { DisasterEvent } from '@/types';
import { HAZARD_MAP, SEVERITY_META } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface EventFeedProps {
  events: DisasterEvent[];
  activeId?: string | null;
  onSelect: (e: DisasterEvent) => void;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
      <div className="skeleton h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/3 rounded" />
      </div>
      <div className="skeleton h-5 w-12 rounded-full" />
    </div>
  );
}

export default function EventFeed({ events, activeId, onSelect }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((e, i) => {
        const meta = HAZARD_MAP[e.category];
        const sev = SEVERITY_META[e.severity];
        const active = e.id === activeId;
        return (
          <motion.button
            key={e.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.4 }}
            onClick={() => onSelect(e)}
            whileHover={{ x: 2 }}
            className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
              active
                ? 'border-emerald/40 bg-emerald/8 shadow-[0_0_12px_rgba(57,217,138,0.12)]'
                : 'border-white/5 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]'
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-mint/90">{e.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mint/45">
                <MapPin className="h-3 w-3" />
                {e.place ?? formatRelativeTime(e.timestamp)}
                <span className="font-mono">{e.source}</span>
              </p>
            </div>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-transform duration-200" style={{ background: `${sev.color}22`, color: sev.color }}>
              {sev.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
