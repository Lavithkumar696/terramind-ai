import type { DisasterEvent, GeoPoint } from '@/types';

// Bounding-box based country/region detection.
// Not geographically precise — uses rectangular bounding boxes for common
// disaster regions. Returns a best-effort country name or null.
interface BBox {
  name: string;
  region: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

// Ordered roughly by disaster frequency so common regions match first.
const BOXES: BBox[] = [
  { name: 'Indonesia', region: 'Southeast Asia', minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
  { name: 'Japan', region: 'East Asia', minLat: 24, maxLat: 46, minLon: 122, maxLon: 146 },
  { name: 'Philippines', region: 'Southeast Asia', minLat: 4, maxLat: 21, minLon: 116, maxLon: 127 },
  { name: 'Chile', region: 'South America', minLat: -56, maxLat: -17, minLon: -76, maxLon: -66 },
  { name: 'Peru', region: 'South America', minLat: -18, maxLat: 0, minLon: -82, maxLon: -68 },
  { name: 'Ecuador', region: 'South America', minLat: -5, maxLat: 1, minLon: -81, maxLon: -75 },
  { name: 'Colombia', region: 'South America', minLat: -4, maxLat: 13, minLon: -79, maxLon: -66 },
  { name: 'Mexico', region: 'North America', minLat: 14, maxLat: 33, minLon: -118, maxLon: -86 },
  { name: 'United States', region: 'North America', minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
  { name: 'Alaska', region: 'North America', minLat: 51, maxLat: 72, minLon: -180, maxLon: -130 },
  { name: 'Canada', region: 'North America', minLat: 49, maxLat: 72, minLon: -141, maxLon: -52 },
  { name: 'Greece', region: 'Europe', minLat: 34, maxLat: 42, minLon: 19, maxLon: 28 },
  { name: 'Italy', region: 'Europe', minLat: 35, maxLat: 47, minLon: 6, maxLon: 19 },
  { name: 'Spain', region: 'Europe', minLat: 35, maxLat: 44, minLon: -10, maxLon: 4 },
  { name: 'Portugal', region: 'Europe', minLat: 36, maxLat: 42, minLon: -10, maxLon: -6 },
  { name: 'Türkiye', region: 'West Asia', minLat: 35, maxLat: 42, minLon: 25, maxLon: 45 },
  { name: 'Iran', region: 'West Asia', minLat: 25, maxLat: 40, minLon: 44, maxLon: 63 },
  { name: 'Afghanistan', region: 'Central Asia', minLat: 29, maxLat: 39, minLon: 60, maxLon: 75 },
  { name: 'Pakistan', region: 'South Asia', minLat: 23, maxLat: 37, minLon: 60, maxLon: 78 },
  { name: 'India', region: 'South Asia', minLat: 6, maxLat: 36, minLon: 68, maxLon: 98 },
  { name: 'Nepal', region: 'South Asia', minLat: 26, maxLat: 31, minLon: 80, maxLon: 89 },
  { name: 'Bangladesh', region: 'South Asia', minLat: 20, maxLat: 27, minLon: 88, maxLon: 93 },
  { name: 'Myanmar', region: 'Southeast Asia', minLat: 9, maxLat: 28, minLon: 92, maxLon: 102 },
  { name: 'Thailand', region: 'Southeast Asia', minLat: 5, maxLat: 20, minLon: 97, maxLon: 106 },
  { name: 'Vietnam', region: 'Southeast Asia', minLat: 8, maxLat: 24, minLon: 102, maxLon: 110 },
  { name: 'China', region: 'East Asia', minLat: 18, maxLat: 53, minLon: 73, maxLon: 135 },
  { name: 'Taiwan', region: 'East Asia', minLat: 21, maxLat: 26, minLon: 119, maxLon: 122 },
  { name: 'Russia', region: 'Eurasia', minLat: 41, maxLat: 78, minLon: 19, maxLon: 180 },
  { name: 'Kamchatka', region: 'Eurasia', minLat: 51, maxLat: 62, minLon: 155, maxLon: 170 },
  { name: 'Kuril Islands', region: 'Eurasia', minLat: 43, maxLat: 51, minLon: 145, maxLon: 157 },
  { name: 'Alaska Peninsula', region: 'North America', minLat: 54, maxLat: 60, minLon: -170, maxLon: -155 },
  { name: 'Australia', region: 'Oceania', minLat: -44, maxLat: -10, minLon: 113, maxLon: 154 },
  { name: 'New Zealand', region: 'Oceania', minLat: -47, maxLat: -34, minLon: 166, maxLon: 179 },
  { name: 'Papua New Guinea', region: 'Oceania', minLat: -12, maxLat: -1, minLon: 141, maxLon: 157 },
  { name: 'Solomon Islands', region: 'Oceania', minLat: -13, maxLat: -5, minLon: 155, maxLon: 170 },
  { name: 'Vanuatu', region: 'Oceania', minLat: -20, maxLat: -13, minLon: 166, maxLon: 170 },
  { name: 'Tonga', region: 'Oceania', minLat: -24, maxLat: -15, minLon: -179, maxLon: -172 },
  { name: 'Fiji', region: 'Oceania', minLat: -22, maxLat: -12, minLon: 176, maxLon: -178 },
  { name: 'Argentina', region: 'South America', minLat: -56, maxLat: -21, minLon: -74, maxLon: -53 },
  { name: 'Brazil', region: 'South America', minLat: -34, maxLat: 6, minLon: -74, maxLon: -34 },
  { name: 'Venezuela', region: 'South America', minLat: 0, maxLat: 13, minLon: -73, maxLon: -60 },
  { name: 'Caribbean', region: 'Caribbean', minLat: 10, maxLat: 28, minLon: -85, maxLon: -60 },
  { name: 'Iceland', region: 'Europe', minLat: 63, maxLat: 67, minLon: -25, maxLon: -13 },
  { name: 'Greenland', region: 'Arctic', minLat: 59, maxLat: 84, minLon: -74, maxLon: -10 },
  { name: 'Morocco', region: 'North Africa', minLat: 27, maxLat: 36, minLon: -13, maxLon: -1 },
  { name: 'Algeria', region: 'North Africa', minLat: 18, maxLat: 38, minLon: -9, maxLon: 12 },
  { name: 'Ethiopia', region: 'East Africa', minLat: 3, maxLat: 15, minLon: 33, maxLon: 48 },
  { name: 'Kenya', region: 'East Africa', minLat: -5, maxLat: 5, minLon: 34, maxLon: 42 },
  { name: 'South Africa', region: 'Southern Africa', minLat: -35, maxLat: -22, minLon: 16, maxLon: 33 },
  { name: 'Madagascar', region: 'East Africa', minLat: -26, maxLat: -12, minLon: 43, maxLon: 51 },
  { name: 'Kazakhstan', region: 'Central Asia', minLat: 40, maxLat: 55, minLon: 47, maxLon: 87 },
];

export function lookupRegion(point: GeoPoint): { country: string | null; region: string | null } {
  for (const b of BOXES) {
    if (
      point.lat >= b.minLat &&
      point.lat <= b.maxLat &&
      point.lon >= b.minLon &&
      point.lon <= b.maxLon
    ) {
      return { country: b.name, region: b.region };
    }
  }
  // Broad region fallback by longitude
  if (point.lat < -60) return { country: null, region: 'Antarctic' };
  if (point.lon > -30 && point.lon < 60 && point.lat > -35 && point.lat < 37)
    return { country: null, region: 'Africa / Atlantic' };
  if (point.lon >= 60 && point.lon < 150 && point.lat > -10 && point.lat < 55)
    return { country: null, region: 'Asia / Indian Ocean' };
  if (point.lon >= 120 && point.lon < 180 && point.lat < -10)
    return { country: null, region: 'South Pacific' };
  if (point.lon > -180 && point.lon < -100 && point.lat > 20)
    return { country: null, region: 'North Pacific' };
  return { country: null, region: 'Oceanic / Other' };
}

export function annotateEventLocation(e: DisasterEvent): DisasterEvent {
  if (e.country || e.region) return e;
  const { country, region } = lookupRegion(e.location);
  return { ...e, country: country ?? undefined, region: region ?? undefined };
}

export function extractCountries(events: DisasterEvent[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    if (e.country) set.add(e.country);
  }
  return [...set].sort();
}

export function extractRegions(events: DisasterEvent[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    if (e.region) set.add(e.region);
  }
  return [...set].sort();
}
