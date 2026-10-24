import type { CacheEntry, DisasterEvent, ProviderResult, Severity, SourceLink } from '@/types';
import { annotateEventLocation } from '@/lib/geo';

const CACHE_PREFIX = 'tm:cache:';

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — non-fatal
  }
}

export async function fetchWithRetry(
  url: string,
  opts: { timeoutMs?: number; retries?: number } = {}
): Promise<Response> {
  const { timeoutMs = 12000, retries = 2 } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}

export function cacheGetOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = readCache<T>(key);
  if (cached) return Promise.resolve(cached);
  return fetcher().then((data) => {
    writeCache(key, data, ttlMs);
    return data;
  });
}

function severityFromMagnitude(mag: number): Severity {
  if (mag >= 7) return 'extreme';
  if (mag >= 6) return 'severe';
  if (mag >= 4.5) return 'moderate';
  if (mag >= 2.5) return 'minor';
  return 'info';
}

async function fetchUSGS(): Promise<ProviderResult> {
  const url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
  try {
    const data = await cacheGetOrFetch('usgs:all_day', 5 * 60 * 1000, async () => {
      const res = await fetchWithRetry(url, { timeoutMs: 15000 });
      return res.json();
    });
    const features: unknown[] = (data as { features?: unknown[] }).features ?? [];
    const events: DisasterEvent[] = features.slice(0, 250).map((f): DisasterEvent => {
      const feat = f as {
        id: string;
        properties: Record<string, unknown>;
        geometry: { coordinates: [number, number, number] };
      };
      const props = feat.properties;
      const coords = feat.geometry.coordinates;
      const mag = typeof props.mag === 'number' ? props.mag : undefined;
      const depth = typeof coords[2] === 'number' ? coords[2] : undefined;
      const felt = typeof props.felt === 'number' ? props.felt : undefined;
      const tsunami = typeof props.tsunami === 'number' ? props.tsunami > 0 : false;
      const alert = typeof props.alert === 'string' ? props.alert : undefined;
      const sig = typeof props.sig === 'number' ? props.sig : undefined;
      const types = typeof props.types === 'string' ? props.types : undefined;
      const sourceLinks: SourceLink[] = [];
      if (typeof props.url === 'string') {
        sourceLinks.push({ label: 'USGS Event Page', url: props.url });
      }
      if (typeof props.detail === 'string') {
        sourceLinks.push({ label: 'USGS Detail JSON', url: props.detail });
      }
      const event: DisasterEvent = {
        id: `usgs-${feat.id}`,
        title: String(props.place ?? props.title ?? 'Earthquake'),
        category: 'earthquake',
        severity: severityFromMagnitude(mag ?? 0),
        source: 'USGS',
        sourceUrl: typeof props.url === 'string' ? props.url : 'https://earthquake.usgs.gov',
        sourceLinks: sourceLinks.length > 0 ? sourceLinks : undefined,
        timestamp: typeof props.time === 'number'
          ? new Date(props.time).toISOString()
          : new Date().toISOString(),
        location: { lon: coords[0], lat: coords[1] },
        place: typeof props.place === 'string' ? props.place : undefined,
        magnitude: mag,
        magnitudeUnit: 'Mw',
        depthKm: depth,
        felt,
        tsunamiAlert: tsunami,
        alertLevel: alert,
        significance: sig,
        description: alert
          ? `USGS alert level: ${alert}. ${felt ? `Felt by ${felt} people. ` : ''}${types ? `Data types: ${types}.` : ''}`
          : felt
            ? `Felt by ${felt} people. ${types ? `Data types: ${types}.` : ''}`
            : undefined,
        verified: true,
        raw: props as Record<string, unknown>,
      };
      return annotateEventLocation(event);
    });
    return { events, ok: true, source: 'USGS', fetchedAt: Date.now() };
  } catch (err) {
    return {
      events: [],
      ok: false,
      source: 'USGS',
      fetchedAt: Date.now(),
      error: err instanceof Error ? err.message : 'USGS fetch failed',
    };
  }
}

const EONET_CATEGORY_MAP: Record<string, DisasterEvent['category']> = {
  earthquakes: 'earthquake',
  floods: 'flood',
  severeStorms: 'severeStorm',
  volcanoes: 'volcano',
  wildfires: 'wildfire',
  seaLakeIce: 'other',
  landslides: 'landslide',
  tempExtremes: 'extremeHeat',
  drought: 'drought',
  manmade: 'other',
  snow: 'severeStorm',
  dustHaze: 'other',
  waterColor: 'other',
};

async function fetchEONET(): Promise<ProviderResult> {
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200';
  try {
    const data = await cacheGetOrFetch('eonet:open', 10 * 60 * 1000, async () => {
      const res = await fetchWithRetry(url, { timeoutMs: 15000 });
      return res.json();
    });
    const rawEvents: unknown[] = (data as { events?: unknown[] }).events ?? [];
    const events: DisasterEvent[] = rawEvents
      .map((e): DisasterEvent | null => {
        const ev = e as {
          id: string;
          title: string;
          categories: { id: string; title: string }[];
          geometry?: { date: string; coordinates: number[] }[];
          sources?: { id: string; url: string }[];
          closed?: string | null;
        };
        const cat = ev.categories?.[0];
        if (!cat) return null;
        const geom = ev.geometry?.[0];
        const coords = geom?.coordinates;
        if (!coords || coords.length < 2) return null;
        const lat = coords[1];
        const lon = coords[0];
        const sourceLinks: SourceLink[] = (ev.sources ?? []).map((s) => ({
          label: s.id || 'Source',
          url: s.url,
        }));
        const event: DisasterEvent = {
          id: `eonet-${ev.id}`,
          title: ev.title,
          category: EONET_CATEGORY_MAP[cat.id] ?? 'other',
          severity: 'moderate',
          source: 'NASA EONET',
          sourceUrl: sourceLinks[0]?.url ?? 'https://eonet.gsfc.nasa.gov',
          sourceLinks: sourceLinks.length > 0 ? sourceLinks : undefined,
          timestamp: geom?.date ?? new Date().toISOString(),
          location: { lat, lon },
          description: `${cat.title} event tracked by NASA Earth Observatory Natural Event Tracker.`,
          verified: true,
          raw: ev as unknown as Record<string, unknown>,
        };
        return annotateEventLocation(event);
      })
      .filter((e): e is DisasterEvent => e !== null);
    return { events, ok: true, source: 'NASA EONET', fetchedAt: Date.now() };
  } catch (err) {
    return {
      events: [],
      ok: false,
      source: 'NASA EONET',
      fetchedAt: Date.now(),
      error: err instanceof Error ? err.message : 'EONET fetch failed',
    };
  }
}

export function demoEvents(): DisasterEvent[] {
  const now = Date.now();
  const base: DisasterEvent[] = [
    {
      id: 'demo-1',
      title: 'Magnitude 6.2 — Aegean Sea',
      category: 'earthquake',
      severity: 'severe',
      source: 'demo',
      timestamp: new Date(now - 3600_000).toISOString(),
      location: { lat: 38.2, lon: 25.5 },
      place: 'Aegean Sea, Greece',
      magnitude: 6.2,
      magnitudeUnit: 'Mw',
      depthKm: 10,
      description: 'Demonstration event. Real USGS and NASA EONET feeds load in production.',
      verified: false,
    },
    {
      id: 'demo-2',
      title: 'Tropical Cyclone — South Pacific',
      category: 'cyclone',
      severity: 'extreme',
      source: 'demo',
      timestamp: new Date(now - 7200_000).toISOString(),
      location: { lat: -16.5, lon: 168.3 },
      place: 'Vanuatu region',
      description: 'Demonstration event representing a tracked tropical system.',
      verified: false,
    },
    {
      id: 'demo-3',
      title: 'Active Wildfire — Northern California',
      category: 'wildfire',
      severity: 'severe',
      source: 'demo',
      timestamp: new Date(now - 10800_000).toISOString(),
      location: { lat: 39.1, lon: -121.4 },
      place: 'Plumas County, California',
      description: 'Demonstration event representing an active fire perimeter.',
      verified: false,
    },
    {
      id: 'demo-4',
      title: 'Flood alert — Brahmaputra basin',
      category: 'flood',
      severity: 'moderate',
      source: 'demo',
      timestamp: new Date(now - 14400_000).toISOString(),
      location: { lat: 26.5, lon: 91.5 },
      place: 'Assam, India',
      description: 'Demonstration event representing riverine flooding.',
      verified: false,
    },
    {
      id: 'demo-5',
      title: 'Volcanic activity — Reykjanes Peninsula',
      category: 'volcano',
      severity: 'moderate',
      source: 'demo',
      timestamp: new Date(now - 18000_000).toISOString(),
      location: { lat: 63.9, lon: -22.4 },
      place: 'Iceland',
      description: 'Demonstration event representing a fissure eruption.',
      verified: false,
    },
  ];
  return base.map(annotateEventLocation);
}

export interface AggregatedResult {
  events: DisasterEvent[];
  sources: ProviderResult[];
  allLive: boolean;
  anyLive: boolean;
  usedDemo: boolean;
  fetchedAt: number;
}

export async function fetchAllEvents(): Promise<AggregatedResult> {
  const results = await Promise.all([fetchUSGS(), fetchEONET()]);
  const liveEvents: DisasterEvent[] = [];
  let anyLive = false;
  for (const r of results) {
    if (r.ok && r.events.length > 0) {
      anyLive = true;
      liveEvents.push(...r.events);
    }
  }
  if (anyLive) {
    liveEvents.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    return {
      events: liveEvents,
      sources: results,
      allLive: results.every((r) => r.ok),
      anyLive,
      usedDemo: false,
      fetchedAt: Date.now(),
    };
  }
  return {
    events: demoEvents(),
    sources: results,
    allLive: false,
    anyLive: false,
    usedDemo: true,
    fetchedAt: Date.now(),
  };
}
