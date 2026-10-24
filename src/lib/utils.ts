import type { DisasterEvent, HazardCategory, Severity } from '@/types';

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatUTC(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

export function formatLatLon(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`;
}

export function filterEvents(
  events: DisasterEvent[],
  filters: { categories?: HazardCategory[]; severities?: Severity[]; query?: string; hours?: number; countries?: string[]; regions?: string[] }
): DisasterEvent[] {
  return events.filter((e) => {
    if (filters.categories?.length && !filters.categories.includes(e.category)) return false;
    if (filters.severities?.length && !filters.severities.includes(e.severity)) return false;
    if (filters.hours && Date.now() - new Date(e.timestamp).getTime() > filters.hours * 3600_000)
      return false;
    if (filters.countries?.length && !e.country) return false;
    if (filters.countries?.length && e.country && !filters.countries.includes(e.country)) return false;
    if (filters.regions?.length && !e.region) return false;
    if (filters.regions?.length && e.region && !filters.regions.includes(e.region)) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay = `${e.title} ${e.place ?? ''} ${e.source} ${e.category} ${e.country ?? ''} ${e.region ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
