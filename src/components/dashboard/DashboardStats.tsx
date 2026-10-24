import { useMemo } from 'react';
import type { DisasterEvent } from '@/types';
import { HAZARD_MAP, SEVERITY_META } from '@/types';

export function DashboardStats({ events }: { events: DisasterEvent[] }) {
  const stats = useMemo(() => {
    const byCategory = new Map<string, number>();
    const bySeverity = new Map<string, number>();
    let maxMag = 0;
    for (const e of events) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + 1);
      bySeverity.set(e.severity, (bySeverity.get(e.severity) ?? 0) + 1);
      if (e.magnitude && e.magnitude > maxMag) maxMag = e.magnitude;
    }
    const topCat = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
    const extreme = (bySeverity.get('extreme') ?? 0) + (bySeverity.get('severe') ?? 0);
    return { total: events.length, topCat, extreme, maxMag };
  }, [events]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Active Events" value={stats.total.toString()} accent="#39D98A" />
      <StatCard
        label="Top Hazard"
        value={stats.topCat ? HAZARD_MAP[stats.topCat[0] as keyof typeof HAZARD_MAP].short : '—'}
        accent={stats.topCat ? HAZARD_MAP[stats.topCat[0] as keyof typeof HAZARD_MAP].color : '#4FA8D8'}
        sub={stats.topCat ? `${stats.topCat[1]} events` : undefined}
      />
      <StatCard label="Severe / Extreme" value={stats.extreme.toString()} accent="#FFB054" />
      <StatCard label="Max Magnitude" value={stats.maxMag ? stats.maxMag.toFixed(1) : '—'} accent="#6FC4E8" />
    </div>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <div className="glass-dark rounded-xl p-4">
      <p className="font-mono text-[10px] tracking-widest text-mint/40">{label.toUpperCase()}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-mint/45">{sub}</p>}
    </div>
  );
}

export function CategoryBreakdown({ events }: { events: DisasterEvent[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [events]);

  const total = events.length || 1;
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);

  return (
    <div className="glass-dark rounded-2xl p-5">
      <h3 className="mb-4 font-mono text-xs tracking-widest text-mint/50">DISTRIBUTION</h3>
      <div className="space-y-3">
        {entries.map(([cat, n]) => {
          const meta = HAZARD_MAP[cat as keyof typeof HAZARD_MAP];
          const pct = (n / total) * 100;
          return (
            <div key={cat}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-mint/70">{meta.label}</span>
                <span className="font-mono text-mint/45">{n}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: meta.color, boxShadow: `0 0 8px ${meta.color}55` }}
                />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="py-6 text-center text-sm text-mint/40">No events to summarize.</p>
        )}
      </div>
    </div>
  );
}

export function SeverityTimeline({ events }: { events: DisasterEvent[] }) {
  const buckets = useMemo(() => {
    const now = Date.now();
    const spans = [6, 12, 24, 48, 72];
    return spans.map((h) => {
      const cutoff = now - h * 3600_000;
      const inBucket = events.filter((e) => +new Date(e.timestamp) >= cutoff);
      const severe = inBucket.filter(
        (e) => e.severity === 'extreme' || e.severity === 'severe'
      ).length;
      return { label: `${h}h`, count: inBucket.length, severe };
    });
  }, [events]);

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="glass-dark rounded-2xl p-5">
      <h3 className="mb-4 font-mono text-xs tracking-widest text-mint/50">EVENT TIMELINE</h3>
      <div className="flex items-end justify-between gap-3" style={{ height: 120 }}>
        {buckets.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="relative w-full max-w-[48px] rounded-t-lg transition-all duration-700"
                style={{ height: `${(b.count / max) * 100}%`, background: 'linear-gradient(180deg, #39D98A, #2378A5)' }}
                title={`${b.count} events`}
              >
                {b.severe > 0 && (
                  <span
                    className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                    style={{ background: '#FFB054', boxShadow: '0 0 6px #FFB054' }}
                  />
                )}
              </div>
            </div>
            <span className="font-mono text-[10px] text-mint/45">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-mint/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald" /> All events
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: '#FFB054' }} /> Severe+
        </span>
      </div>
    </div>
  );
}
