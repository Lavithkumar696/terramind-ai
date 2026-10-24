import { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Globe2, MapPinned, ChevronDown, Check } from 'lucide-react';
import { HAZARDS, SEVERITY_META } from '@/types';
import type { HazardCategory, Severity } from '@/types';

export interface FilterState {
  query: string;
  categories: HazardCategory[];
  severities: Severity[];
  hours: number;
  countries: string[];
  regions: string[];
}

interface FiltersProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
  totalCount: number;
  availableCountries: string[];
  availableRegions: string[];
}

const TIME_WINDOWS = [
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '7d', hours: 168 },
  { label: 'All', hours: 0 },
];

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  categories: [],
  severities: [],
  hours: 0,
  countries: [],
  regions: [],
};

export default function Filters({ state, onChange, resultCount, totalCount, availableCountries, availableRegions }: FiltersProps) {
  const toggleCategory = (c: HazardCategory) => {
    const has = state.categories.includes(c);
    onChange({
      ...state,
      categories: has ? state.categories.filter((x) => x !== c) : [...state.categories, c],
    });
  };

  const toggleSeverity = (s: Severity) => {
    const has = state.severities.includes(s);
    onChange({
      ...state,
      severities: has ? state.severities.filter((x) => x !== s) : [...state.severities, s],
    });
  };

  const toggleCountry = (c: string) => {
    const has = state.countries.includes(c);
    onChange({
      ...state,
      countries: has ? state.countries.filter((x) => x !== c) : [...state.countries, c],
    });
  };

  const toggleRegion = (r: string) => {
    const has = state.regions.includes(r);
    onChange({
      ...state,
      regions: has ? state.regions.filter((x) => x !== r) : [...state.regions, r],
    });
  };

  const reset = () => onChange({ ...DEFAULT_FILTERS });
  const hasFilters = !!(state.query || state.categories.length || state.severities.length || state.hours || state.countries.length || state.regions.length);

  return (
    <div className="glass-dark rounded-2xl p-4">
      <div className="flex flex-col gap-4">
        {/* Search + time */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mint/40" />
            <input
              value={state.query}
              onChange={(e) => onChange({ ...state, query: e.target.value })}
              placeholder="Search events, places, sources, countries…"
              className="w-full rounded-xl border border-white/8 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-mint placeholder:text-mint/35 focus:border-emerald/40 focus:outline-none focus:ring-1 focus:ring-emerald/30"
            />
          </div>
          <div className="flex items-center gap-1.5 self-start rounded-xl border border-white/8 bg-white/[0.02] p-1 sm:self-auto">
            {TIME_WINDOWS.map((t) => (
              <button
                key={t.label}
                onClick={() => onChange({ ...state, hours: t.hours })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  state.hours === t.hours
                    ? 'bg-emerald/15 text-emerald'
                    : 'text-mint/55 hover:text-mint'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-mint/40" />
          {HAZARDS.filter((h) => h.category !== 'other').map((h) => {
            const active = state.categories.includes(h.category);
            return (
              <button
                key={h.category}
                onClick={() => toggleCategory(h.category)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
                  active
                    ? 'border-transparent text-midnight'
                    : 'border-white/10 text-mint/65 hover:border-white/20'
                }`}
                style={active ? { background: h.color } : {}}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#061A1B' : h.color }} />
                {h.label}
              </button>
            );
          })}
        </div>

        {/* Severity chips + region/country dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-mint/40">SEVERITY</span>
          {(['extreme', 'severe', 'moderate', 'minor', 'advisory'] as Severity[]).map((s) => {
            const meta = SEVERITY_META[s];
            const active = state.severities.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSeverity(s)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-all ${
                  active ? 'border-transparent' : 'border-white/10 hover:border-white/20'
                }`}
                style={
                  active
                    ? { background: `${meta.color}30`, color: meta.color, borderColor: `${meta.color}55` }
                    : { color: 'rgba(184,243,208,0.55)' }
                }
              >
                {meta.label}
              </button>
            );
          })}
          {hasFilters && (
            <button
              onClick={reset}
              className="ml-auto flex items-center gap-1 text-xs text-mint/45 hover:text-mint"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Region + Country filter dropdowns */}
        <div className="flex flex-wrap gap-3">
          {availableRegions.length > 0 && (
            <Dropdown
              icon={<Globe2 className="h-3.5 w-3.5 text-ocean-light" />}
              label="Region"
              options={availableRegions}
              selected={state.regions}
              onToggle={toggleRegion}
            />
          )}
          {availableCountries.length > 0 && (
            <Dropdown
              icon={<MapPinned className="h-3.5 w-3.5 text-emerald" />}
              label="Country"
              options={availableCountries}
              selected={state.countries}
              onToggle={toggleCountry}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-mint/45">
          <span>
            {resultCount} of {totalCount} events
          </span>
          <span className="font-mono">FILTERS</span>
        </div>
      </div>
    </div>
  );
}

function Dropdown({
  icon,
  label,
  options,
  selected,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
          selected.length > 0
            ? 'border-emerald/30 bg-emerald/10 text-emerald'
            : 'border-white/10 text-mint/65 hover:border-white/20'
        }`}
      >
        {icon}
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-emerald/20 px-1.5 text-[10px]">{selected.length}</span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-56 overflow-y-auto rounded-xl border border-white/10 bg-midnight-deep p-1.5 shadow-2xl">
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  active ? 'bg-emerald/10 text-emerald' : 'text-mint/70 hover:bg-white/5'
                }`}
              >
                {opt}
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
