import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, CircleAlert, Info } from 'lucide-react';
import { useDisasterEvents } from '@/hooks/useDisasterEvents';
import { HAZARD_MAP } from '@/types';
import type { DisasterEvent } from '@/types';
import { filterEvents } from '@/lib/utils';
import { extractCountries, extractRegions } from '@/lib/geo';
import WorldMap from '@/components/map/WorldMap';
import Filters, { type FilterState } from '@/components/dashboard/Filters';
import EventFeed from '@/components/dashboard/EventFeed';
import EventDrawer from '@/components/dashboard/EventDrawer';
import { DashboardStats, CategoryBreakdown, SeverityTimeline } from '@/components/dashboard/DashboardStats';
import { Reveal } from '@/components/ui/Reveal';

interface DashboardProps {
  onAskAI?: (event: DisasterEvent) => void;
  preselectCategory?: string | null;
}

export default function Dashboard({ onAskAI, preselectCategory }: DashboardProps) {
  const { data, loading } = useDisasterEvents();
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    categories: preselectCategory ? [preselectCategory as never] : [],
    severities: [],
    hours: 0,
    countries: [],
    regions: [],
  });
  const [active, setActive] = useState<DisasterEvent | null>(null);

  const filtered = useMemo(
    () => filterEvents(data?.events ?? [], filters),
    [data, filters]
  );

  const availableCountries = useMemo(
    () => extractCountries(data?.events ?? []),
    [data]
  );
  const availableRegions = useMemo(
    () => extractRegions(data?.events ?? []),
    [data]
  );

  const mapMarkers = useMemo(
    () =>
      filtered.slice(0, 200).map((e) => ({
        id: e.id,
        lat: e.location.lat,
        lon: e.location.lon,
        color: HAZARD_MAP[e.category].color,
        title: e.title,
        magnitude: e.magnitude,
        severity: e.severity,
        source: e.source,
        place: e.place,
        country: e.country,
      })),
    [filtered]
  );

  const status = data
    ? data.usedDemo
      ? { label: 'DEMO DATA — live feeds unavailable', live: false }
      : data.allLive
        ? { label: 'LIVE — USGS + NASA EONET', live: true }
        : data.anyLive
          ? { label: 'PARTIAL — some feeds live', live: true }
          : { label: 'OFFLINE — showing demo data', live: false }
    : { label: 'Connecting to feeds…', live: false };

  return (
    <section id="dashboard" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-emerald/70">02 · INTELLIGENCE</p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
                Global Disaster Dashboard
              </h2>
              <p className="mt-3 max-w-xl text-mint/55">
                Real-time aggregation of seismic and environmental events from public
                government and scientific feeds.
              </p>
            </div>
            <span
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs ${
                status.live ? 'bg-emerald/10 text-emerald' : 'bg-amber-400/10 text-amber-300'
              }`}
            >
              {status.live ? <Radio className="h-3.5 w-3.5 animate-pulse-soft" /> : <CircleAlert className="h-3.5 w-3.5" />}
              {status.label}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <DashboardStats events={data?.events ?? []} />
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <Filters
            state={filters}
            onChange={setFilters}
            resultCount={filtered.length}
            totalCount={data?.events.length ?? 0}
            availableCountries={availableCountries}
            availableRegions={availableRegions}
          />
        </Reveal>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Map */}
          <Reveal delay={0.2}>
            <div className="glass-dark relative h-[420px] overflow-hidden rounded-2xl sm:h-[520px]">
              <WorldMap
                events={mapMarkers}
                activeId={active?.id ?? null}
                onMarkerClick={(id) => {
                  const e = data?.events.find((x) => x.id === id);
                  if (e) setActive(e);
                }}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--overlay-bg)' }}>
                  <div className="skeleton h-32 w-32 rounded-full" />
                </div>
              )}
              {data?.usedDemo && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs text-amber-500 backdrop-blur-md">
                  <Info className="h-3.5 w-3.5" />
                  Showing demo data — live feeds unreachable
                </div>
              )}
            </div>
          </Reveal>

          {/* Feed */}
          <Reveal delay={0.25}>
            <div className="glass-dark flex h-[420px] flex-col rounded-2xl sm:h-[520px]">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <span className="font-mono text-xs tracking-widest text-mint/60">EVENT FEED</span>
                <span className="text-xs text-mint/40">{filtered.length} shown</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <EventFeed events={filtered.slice(0, 80)} activeId={active?.id ?? null} onSelect={setActive} />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Reveal delay={0.1}>
            <CategoryBreakdown events={data?.events ?? []} />
          </Reveal>
          <Reveal delay={0.15}>
            <SeverityTimeline events={data?.events ?? []} />
          </Reveal>
        </div>
      </div>

      <EventDrawer event={active} onClose={() => setActive(null)} onAskAI={onAskAI} />
    </section>
  );
}
